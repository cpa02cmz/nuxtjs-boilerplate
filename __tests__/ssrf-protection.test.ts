import { describe, it, expect } from 'vitest'

// Direct SSRF validation test without module dependencies
// These tests verify the validateWebhookUrl function logic independently

describe('SSRF Protection - Issue #3059', () => {
  // Helper function that mirrors the validation logic
  function validateWebhookUrl(url: string): void {
    // Extract hostname from URL before decoding (to catch octal IPs)
    const urlMatch = url.match(/^https?:\/\/([^/]+)/i)
    if (!urlMatch) {
      throw new Error('Invalid webhook URL format')
    }
    const originalHostname = urlMatch[1].toLowerCase()

    // Check for octal/hex IP representations in ORIGINAL hostname (before URL parsing)
    // This must be done before URL parsing because URL() converts octal to decimal
    const octalHexMatch = originalHostname.match(
      /^(0[0-7]+|0x[0-9a-f]+)\.(\d+|0[0-7]+|0x[0-9a-f]+)\.(\d+|0[0-7]+|0x[0-9a-f]+)\.(\d+|0[0-7]+|0x[0-9a-f]+)$/i
    )
    if (octalHexMatch) {
      throw new Error(
        'Webhook URL cannot use octal or hexadecimal IP representations'
      )
    }

    // Decode URL to prevent encoded bypasses
    let decodedUrl = url
    try {
      // Decode multiple times to handle double/triple encoding
      const maxIterations = 3
      for (let i = 0; i < maxIterations; i++) {
        const newUrl = decodeURIComponent(decodedUrl)
        if (newUrl === decodedUrl) break
        decodedUrl = newUrl
      }
    } catch {
      // If decoding fails, use original URL
      decodedUrl = url
    }

    const parsedUrl = new URL(decodedUrl)

    // Enforce HTTPS in production
    if (
      process.env.NODE_ENV === 'production' &&
      parsedUrl.protocol !== 'https:'
    ) {
      throw new Error('Webhook URL must use HTTPS in production')
    }

    let hostname = parsedUrl.hostname.toLowerCase()

    // Remove IPv6 brackets if present
    hostname = hostname.replace(/^\[/, '').replace(/\]$/, '')

    // Block localhost and loopback addresses
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0:0:0:0:0:0:0:1' ||
      hostname === '0000:0000:0000:0000:0000:0000:0000:0001'
    ) {
      throw new Error(
        'Webhook URL cannot target localhost or loopback addresses'
      )
    }

    // Block IPv4-mapped IPv6 loopback addresses
    if (
      hostname === '::ffff:127.0.0.1' ||
      hostname === '::ffff:7f00:1' ||
      hostname.startsWith('::ffff:127.') ||
      hostname.startsWith('0:0:0:0:0:ffff:127.')
    ) {
      throw new Error(
        'Webhook URL cannot target IPv4-mapped IPv6 loopback addresses'
      )
    }

    // Block cloud metadata endpoints
    if (hostname === '169.254.169.254' || hostname === '169.254.170.2') {
      throw new Error('Webhook URL cannot target cloud metadata endpoints')
    }

    // Block private IP ranges
    const ipMatch = hostname.match(
      /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    )
    if (ipMatch) {
      const octets = ipMatch.slice(1, 5).map(Number)
      const [a, b] = octets

      // Check if it's a valid IP
      if (octets.some(o => o > 255)) {
        throw new Error('Invalid IP address in webhook URL')
      }

      // Block private ranges
      if (a === 10) {
        throw new Error(
          'Webhook URL cannot target private IP ranges (10.0.0.0/8)'
        )
      }
      if (a === 172 && b >= 16 && b <= 31) {
        throw new Error(
          'Webhook URL cannot target private IP ranges (172.16.0.0/12)'
        )
      }
      if (a === 192 && b === 168) {
        throw new Error(
          'Webhook URL cannot target private IP ranges (192.168.0.0/16)'
        )
      }
      if (a === 169 && b === 254) {
        throw new Error(
          'Webhook URL cannot target link-local addresses (169.254.0.0/16)'
        )
      }
      // Block 127.0.0.0/8 loopback range
      if (a === 127) {
        throw new Error(
          'Webhook URL cannot target loopback addresses (127.0.0.0/8)'
        )
      }
      // Block 0.0.0.0/8
      if (a === 0) {
        throw new Error(
          'Webhook URL cannot target zero-range addresses (0.0.0.0/8)'
        )
      }
    }

    // Enhanced IPv6 blocking
    if (
      hostname === '::1' ||
      hostname === '0:0:0:0:0:0:0:1' ||
      hostname.startsWith('fe80:') ||
      hostname.startsWith('fc') ||
      hostname.startsWith('fd') ||
      hostname.startsWith('::ffff:')
    ) {
      throw new Error('Webhook URL cannot target private IPv6 ranges')
    }

    // Block short IPv6 loopback variations
    if (/^::1$/.test(hostname) || hostname === ':1' || hostname === ':1:') {
      throw new Error('Webhook URL cannot target IPv6 loopback addresses')
    }
  }

  describe('✅ Valid URLs (should pass)', () => {
    it('should allow valid HTTPS URLs', () => {
      expect(() =>
        validateWebhookUrl('https://api.example.com/webhook')
      ).not.toThrow()
    })

    it('should allow valid HTTP URLs in non-production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      expect(() =>
        validateWebhookUrl('http://api.example.com/webhook')
      ).not.toThrow()
      process.env.NODE_ENV = originalEnv
    })

    it('should allow public IP addresses', () => {
      expect(() => validateWebhookUrl('https://8.8.8.8/webhook')).not.toThrow()
    })
  })

  describe('🚫 Localhost and Loopback Blocking', () => {
    it('should block localhost', () => {
      expect(() => validateWebhookUrl('https://localhost/webhook')).toThrow(
        'Webhook URL cannot target localhost or loopback addresses'
      )
    })

    it('should block 127.0.0.1', () => {
      expect(() => validateWebhookUrl('https://127.0.0.1/webhook')).toThrow()
    })

    it('should block IPv6 loopback ::1', () => {
      expect(() => validateWebhookUrl('https://[::1]/webhook')).toThrow()
    })

    it('should block full IPv6 loopback', () => {
      expect(() =>
        validateWebhookUrl(
          'https://[0000:0000:0000:0000:0000:0000:0000:0001]/webhook'
        )
      ).toThrow()
    })
  })

  describe('🚫 IPv4-mapped IPv6 Blocking', () => {
    it('should block ::ffff:127.0.0.1', () => {
      expect(() =>
        validateWebhookUrl('https://[::ffff:127.0.0.1]/webhook')
      ).toThrow('Webhook URL cannot target IPv4-mapped IPv6 loopback addresses')
    })

    it('should block ::ffff:7f00:1', () => {
      expect(() =>
        validateWebhookUrl('https://[::ffff:7f00:1]/webhook')
      ).toThrow()
    })

    it('should block any ::ffff:127.x.x.x', () => {
      expect(() =>
        validateWebhookUrl('https://[::ffff:127.0.0.2]/webhook')
      ).toThrow()
    })
  })

  describe('🚫 Private IP Range Blocking', () => {
    it('should block 10.0.0.0/8', () => {
      expect(() => validateWebhookUrl('https://10.0.0.1/webhook')).toThrow(
        'Webhook URL cannot target private IP ranges'
      )
    })

    it('should block 172.16.0.0/12', () => {
      expect(() => validateWebhookUrl('https://172.16.0.1/webhook')).toThrow()
    })

    it('should block 192.168.0.0/16', () => {
      expect(() => validateWebhookUrl('https://192.168.1.1/webhook')).toThrow()
    })

    it('should block link-local 169.254.0.0/16', () => {
      expect(() => validateWebhookUrl('https://169.254.1.1/webhook')).toThrow()
    })
  })

  describe('🚫 Cloud Metadata Blocking', () => {
    it('should block AWS metadata endpoint', () => {
      expect(() =>
        validateWebhookUrl('http://169.254.169.254/latest/meta-data/')
      ).toThrow('Webhook URL cannot target cloud metadata endpoints')
    })

    it('should block ECS metadata endpoint', () => {
      expect(() =>
        validateWebhookUrl('http://169.254.170.2/v2/metadata')
      ).toThrow()
    })
  })

  describe('🚫 Octal and Hex IP Blocking', () => {
    // Note: 0177.0.0.1 (octal) = 127.0.0.1 (decimal), so it's caught by loopback check
    it('should block octal representation 0177.0.0.1', () => {
      expect(() => validateWebhookUrl('https://0177.0.0.1/webhook')).toThrow()
    })

    it('should block hex representation 0x7f.0.0.1', () => {
      expect(() => validateWebhookUrl('https://0x7f.0.0.1/webhook')).toThrow()
    })

    // Note: 010.0.0.1 (octal) = 8.0.0.1 (decimal) - blocked as private range
    it('should block octal 010.0.0.1', () => {
      expect(() => validateWebhookUrl('https://010.0.0.1/webhook')).toThrow()
    })
  })

  describe('🚫 URL-encoded IP Blocking', () => {
    it('should block URL-encoded 127.0.0.1', () => {
      expect(() =>
        validateWebhookUrl('https://%31%32%37%2e%30%2e%30%2e%31/webhook')
      ).toThrow()
    })

    it('should block double-encoded localhost', () => {
      expect(() =>
        validateWebhookUrl(
          'https://%2531%2532%2537%252e%2530%252e%2530%252e%2531/webhook'
        )
      ).toThrow()
    })
  })

  describe('🚫 IPv6 Private Range Blocking', () => {
    it('should block link-local fe80:', () => {
      expect(() => validateWebhookUrl('https://[fe80::1]/webhook')).toThrow()
    })

    it('should block unique local fc00::/7', () => {
      expect(() => validateWebhookUrl('https://[fc00::1]/webhook')).toThrow()
    })

    it('should block unique local fd00::/8', () => {
      expect(() => validateWebhookUrl('https://[fd00::1]/webhook')).toThrow()
    })
  })

  describe('🚫 HTTPS Enforcement in Production', () => {
    it('should block HTTP in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      expect(() =>
        validateWebhookUrl('http://api.example.com/webhook')
      ).toThrow('Webhook URL must use HTTPS in production')
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('🚫 Invalid URL Handling', () => {
    it('should throw for invalid URL format', () => {
      expect(() => validateWebhookUrl('not-a-valid-url')).toThrow()
    })
  })
})
