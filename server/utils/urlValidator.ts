import { logError } from '~/utils/errorLogger'

export interface HealthStatus {
  status: 'healthy' | 'broken' | 'redirected' | 'slow' | 'unknown'
  lastChecked: string
  statusCode?: number
  responseTime?: number
  redirectUrl?: string
}

export interface ValidationResult {
  url: string
  health: HealthStatus
}

// Default timeout for requests (in milliseconds)
const DEFAULT_TIMEOUT = 10000 // 10 seconds

// Maximum response time considered "slow" (in milliseconds)
const SLOW_RESPONSE_THRESHOLD = 5000 // 5 seconds

/**
 * Validates a single URL by performing an HTTP HEAD or GET request
 * @param url The URL to validate
 * @param timeout Optional timeout in milliseconds (defaults to 10000ms)
 * @returns ValidationResult with health status information
 */
export async function validateUrl(
  url: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<ValidationResult> {
  const startTime = Date.now()

  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // First try HEAD request (more efficient for just checking if URL exists)
    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual', // Handle redirects manually to detect them
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ResourceValidator/1.0)',
      },
    })

    // If HEAD request returns 405 Method Not Allowed, try GET request
    if (response.status === 405) {
      clearTimeout(timeoutId)
      controller.abort() // Abort previous request

      const getController = new AbortController()
      const getTimeoutId = setTimeout(() => getController.abort(), timeout)

      response = await fetch(url, {
        method: 'GET',
        signal: getController.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ResourceValidator/1.0)',
        },
      })

      clearTimeout(getTimeoutId)
    } else {
      clearTimeout(timeoutId)
    }

    const responseTime = Date.now() - startTime
    const statusCode = response.status
    let status: HealthStatus['status'] = 'unknown'

    // Determine health status based on status code and response time
    if (statusCode >= 200 && statusCode < 300) {
      status = responseTime > SLOW_RESPONSE_THRESHOLD ? 'slow' : 'healthy'
    } else if (statusCode >= 300 && statusCode < 400) {
      // Redirect - check if it's a valid redirect
      const locationHeader = response.headers.get('Location')
      if (locationHeader) {
        status = 'redirected'
      } else {
        status = 'broken'
      }
    } else if (statusCode >= 400 && statusCode < 600) {
      status = 'broken'
    }

    return {
      url,
      health: {
        status,
        lastChecked: new Date().toISOString(),
        statusCode,
        responseTime,
        redirectUrl: response.headers.get('Location') || undefined,
      },
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime

    // Determine error status based on error type
    let status: HealthStatus['status'] = 'broken'
    if (error.name === 'AbortError') {
      status = 'slow' // Timeout
    } else if (
      error.message.includes('ENOTFOUND') ||
      error.message.includes('EAI_AGAIN')
    ) {
      status = 'broken' // DNS resolution error
    } else if (error.message.includes('ECONNREFUSED')) {
      status = 'broken' // Connection refused
    } else if (
      error.message.includes('CERT_') ||
      error.message.includes('DEPTH_ZERO_SELF_SIGNED_CERT')
    ) {
      status = 'broken' // SSL certificate error
    }

    // Log the error
    logError(
      `URL validation failed for ${url}`,
      error as Error,
      'url-validator',
      {
        url,
        responseTime,
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
      }
    )

    return {
      url,
      health: {
        status,
        lastChecked: new Date().toISOString(),
        responseTime,
      },
    }
  }
}

/**
 * Validates multiple URLs concurrently with a limit on concurrent requests
 * @param urls Array of URLs to validate
 * @param concurrencyLimit Maximum number of concurrent requests (defaults to 5)
 * @returns Array of validation results
 */
export async function validateUrlsConcurrently(
  urls: string[],
  concurrencyLimit: number = 5
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // Process URLs in batches to avoid overwhelming the server
  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit)
    const batchPromises = batch.map(url => validateUrl(url))

    try {
      const batchResults = await Promise.allSettled(batchPromises)

      for (let j = 0; j < batchResults.length; j++) {
        if (batchResults[j].status === 'fulfilled') {
          results.push(batchResults[j].value)
        } else {
          // Handle rejected promises
          const url = batch[j]
          logError(
            `Batch validation failed for ${url}`,
            batchResults[j].reason as Error,
            'url-validator',
            {
              url,
              error: batchResults[j].reason,
            }
          )

          // Add a failed result
          results.push({
            url,
            health: {
              status: 'unknown',
              lastChecked: new Date().toISOString(),
            },
          })
        }
      }
    } catch (error: any) {
      logError('Batch validation failed', error as Error, 'url-validator', {
        batchStartIndex: i,
        batchEndIndex: i + concurrencyLimit - 1,
        error: error.message,
      })
    }
  }

  return results
}
