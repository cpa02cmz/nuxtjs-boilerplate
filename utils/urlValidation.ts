import { retryWithResult, retryPresets } from '~/server/utils/retry'
import { getCircuitBreaker } from '~/server/utils/circuit-breaker'
import { TIMING } from '~/server/utils/constants'
import {
  httpConfig,
  isSuccessStatus,
  isRedirectStatus,
} from '~/configs/http.config'
import { networkConfig } from '~/configs/network.config'

/**
 * SSRF Protection: Validates URL before making requests
 * Issue #2214: Prevents access to internal networks and cloud metadata
 */
function isValidValidationUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    // Block non-HTTP protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }

    const hostname = parsed.hostname.toLowerCase()

    // Block internal addresses
    const blockedPatterns = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254', // AWS metadata
      'metadata.google.internal',
      'metadata',
    ]

    if (
      blockedPatterns.some(p => hostname === p || hostname.startsWith(p + '.'))
    ) {
      return false
    }

    // Block private IP ranges
    const privateIpRegex =
      /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.)/
    if (privateIpRegex.test(hostname)) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export interface UrlValidationResult {
  url: string
  status: number | null
  statusText: string | null
  isAccessible: boolean
  responseTime: number | null
  error?: string
  timestamp: string
  attempts?: number
}

interface ValidationOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
  useCircuitBreaker?: boolean
}

/**
 * Validates a single URL by making an HTTP request with improved retry logic
 */
export async function validateUrl(
  url: string,
  options: ValidationOptions = {}
): Promise<UrlValidationResult> {
  const {
    timeout = TIMING.WEBHOOK_REQUEST_TIMEOUT,
    retries = TIMING.RETRY_MAX_ATTEMPTS,
    retryDelay = TIMING.RETRY_BASE_DELAY_MS,
    useCircuitBreaker = true,
  } = options

  // Basic URL format validation
  try {
    new URL(url)
  } catch {
    return {
      url,
      status: null,
      statusText: null,
      isAccessible: false,
      responseTime: null,
      error: 'Invalid URL format',
      timestamp: new Date().toISOString(),
    }
  }

  // SSRF Protection: Validate URL before making requests (Issue #2214)
  if (!isValidValidationUrl(url)) {
    return {
      url,
      status: null,
      statusText: null,
      isAccessible: false,
      responseTime: null,
      error: 'URL validation blocked for security reasons (SSRF protection)',
      timestamp: new Date().toISOString(),
    }
  }

  if (useCircuitBreaker) {
    const circuitBreakerKey = `url-validation:${new URL(url).hostname}`
    const circuitBreaker = getCircuitBreaker(circuitBreakerKey, {
      failureThreshold: TIMING.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      successThreshold: TIMING.CIRCUIT_BREAKER_SUCCESS_THRESHOLD,
      timeoutMs: TIMING.CIRCUIT_BREAKER_TIMEOUT_MS,
    })

    const result = await retryWithResult(
      async () => {
        return circuitBreaker.execute(
          async () => {
            return fetchUrlWithTimeout(url, timeout)
          },
          () => {
            throw new Error(
              `Circuit breaker is OPEN for host: ${new URL(url).hostname}`
            )
          }
        )
      },
      {
        ...retryPresets.standard,
        maxRetries: retries,
        baseDelayMs: retryDelay,
        retryableErrors: networkConfig.retryableErrors,
      }
    )

    if (result.success && result.data) {
      return {
        ...result.data,
        attempts: result.attempts,
      }
    }

    return {
      url,
      status: null,
      statusText: null,
      isAccessible: false,
      responseTime: null,
      error: result.error?.message || 'Validation failed',
      timestamp: new Date().toISOString(),
      attempts: result.attempts,
    }
  } else {
    const result = await retryWithResult(
      async () => fetchUrlWithTimeout(url, timeout),
      {
        ...retryPresets.standard,
        maxRetries: retries,
        baseDelayMs: retryDelay,
        retryableErrors: networkConfig.retryableErrors,
      }
    )

    if (result.success && result.data) {
      return {
        ...result.data,
        attempts: result.attempts,
      }
    }

    return {
      url,
      status: null,
      statusText: null,
      isAccessible: false,
      responseTime: null,
      error: result.error?.message || 'Validation failed',
      timestamp: new Date().toISOString(),
      attempts: result.attempts,
    }
  }
}

/**
 * Internal function to fetch URL with timeout
 */
async function fetchUrlWithTimeout(
  url: string,
  timeout: number
): Promise<UrlValidationResult> {
  const startTime = Date.now()

  // FIX #3085: Store timeout ID to clear it later and prevent memory leak
  let timeoutId: NodeJS.Timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`))
    }, timeout)
  })

  // Make a HEAD request first (more efficient), fallback to GET if HEAD is not allowed
  try {
    const response = await Promise.race([
      fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': httpConfig.userAgent.full,
        },
      }),
      timeoutPromise,
    ])

    // FIX #3085: Clear timeout when request succeeds to prevent memory leak
    clearTimeout(timeoutId!)

    const responseTime = Date.now() - startTime

    // If HEAD method is not allowed, try GET request
    if (response.status === 405) {
      // FIX #3085: Create new timeout for the GET request
      let getTimeoutId: NodeJS.Timeout
      const getTimeoutPromise = new Promise<never>((_, reject) => {
        getTimeoutId = setTimeout(() => {
          reject(new Error(`Request timeout after ${timeout}ms`))
        }, timeout)
      })

      const getResponse = await Promise.race([
        fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': httpConfig.userAgent.full,
          },
        }),
        getTimeoutPromise,
      ])

      // FIX #3085: Clear timeout when GET request succeeds
      clearTimeout(getTimeoutId!)

      const getResponseTime = Date.now() - startTime

      return {
        url,
        status: getResponse.status,
        statusText: getResponse.statusText,
        isAccessible:
          isSuccessStatus(getResponse.status) ||
          isRedirectStatus(getResponse.status),
        responseTime: getResponseTime,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      url,
      status: response.status,
      statusText: response.statusText,
      isAccessible:
        isSuccessStatus(response.status) || isRedirectStatus(response.status),
      responseTime,
      timestamp: new Date().toISOString(),
    }
  } catch {
    // FIX #3085: Clear original timeout before trying GET request
    clearTimeout(timeoutId!)

    try {
      // FIX #3085: Create new timeout for the fallback GET request
      let fallbackTimeoutId: NodeJS.Timeout
      const fallbackTimeoutPromise = new Promise<never>((_, reject) => {
        fallbackTimeoutId = setTimeout(() => {
          reject(new Error(`Request timeout after ${timeout}ms`))
        }, timeout)
      })

      const getResponse = await Promise.race([
        fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': httpConfig.userAgent.full,
          },
        }),
        fallbackTimeoutPromise,
      ])

      // FIX #3085: Clear timeout when fallback request succeeds
      clearTimeout(fallbackTimeoutId!)

      const responseTime = Date.now() - startTime

      return {
        url,
        status: getResponse.status,
        statusText: getResponse.statusText,
        isAccessible:
          isSuccessStatus(getResponse.status) ||
          isRedirectStatus(getResponse.status),
        responseTime,
        timestamp: new Date().toISOString(),
      }
    } catch (getError) {
      return {
        url,
        status: null,
        statusText: null,
        isAccessible: false,
        responseTime: null,
        error: getError instanceof Error ? getError.message : String(getError),
        timestamp: new Date().toISOString(),
      }
    }
  }
}

import { limitsConfig } from '~/configs/limits.config'

/**
 * Validates multiple URLs concurrently with a limit on concurrent requests
 */
export async function validateUrls(
  urls: string[],
  options: ValidationOptions = {},
  concurrencyLimit: number = limitsConfig.search.maxConcurrentValidations || 5
): Promise<UrlValidationResult[]> {
  const results: UrlValidationResult[] = []

  // Process URLs in batches to avoid overwhelming the system
  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit)

    const batchPromises = batch.map(url => validateUrl(url, options))
    const batchResults = await Promise.all(batchPromises)

    results.push(...batchResults)
  }

  return results
}

/**
 * Determines if a URL status indicates that the resource is valid/live
 */
export function isUrlHealthy(status: number | null): boolean {
  if (status === null) return false
  // Consider 2xx and 3xx status codes as healthy (accessible)
  return isSuccessStatus(status) || isRedirectStatus(status)
}
