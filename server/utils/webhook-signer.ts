import type { WebhookPayload } from '~/types/webhook'
import { createHmac } from 'node:crypto'
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

  verifySignature(
    payload: WebhookPayload,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret)

    return signature === expectedSignature
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
