import type { WebhookPayload } from '~/types/webhook'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { patternsConfig } from '~/configs/patterns.config'

export class WebhookSigner {
  generateSignature(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload)
    const signature = createHmac(
      patternsConfig.webhook.signatureAlgorithm,
      secret
    )
      .update(payloadString)
      .digest('hex')

    return `${patternsConfig.webhook.signaturePrefix}${signature}`
  }

  /**
   * Verify webhook signature using timing-safe comparison
   * SECURITY FIX: Use timingSafeEqual to prevent timing attacks (CWE-208)
   * Direct string comparison is vulnerable to character-by-character brute-forcing
   * by measuring response times. Timing-safe comparison ensures constant-time
   * evaluation regardless of input.
   */
  verifySignature(
    payload: WebhookPayload,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret)

    // SECURITY: Early length check before timing-safe comparison
    // Different lengths indicate invalid signature anyway
    if (signature.length !== expectedSignature.length) {
      return false
    }

    // SECURITY: Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    )
  }

  generatePayloadWithSignature(
    payload: WebhookPayload,
    secret: string
  ): WebhookPayload {
    const signature = this.generateSignature(payload, secret)

    return { ...payload, signature }
  }
}

export const webhookSigner = new WebhookSigner()
