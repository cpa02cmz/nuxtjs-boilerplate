import type { DeadLetterWebhook } from '~/types/webhook'
import { webhookStorage } from './webhookStorage'
import logger from '~/utils/logger'
import { webhooksConfig } from '~/configs/webhooks.config'

export interface DeadLetterAlertConfig {
  enabled: boolean
  thresholds: {
    totalCount: number
    webhookSpecificCount: number
    timeWindowMinutes: number
  }
  githubIssue: {
    enabled: boolean
    repository: string
    labels: string[]
    assignees: string[]
  }
  notifications: {
    logLevel: 'info' | 'warn' | 'error'
    includePayload: boolean
  }
}

const defaultConfig: DeadLetterAlertConfig = {
  enabled: process.env.DEAD_LETTER_ALERTS_ENABLED === 'true',
  thresholds: {
    // Flexy hates hardcoded values! Using webhooksConfig
    totalCount: webhooksConfig.deadLetter.alerts.totalCountThreshold,
    webhookSpecificCount:
      webhooksConfig.deadLetter.alerts.webhookSpecificThreshold,
    timeWindowMinutes: webhooksConfig.deadLetter.alerts.timeWindowMinutes,
  },
  githubIssue: {
    enabled: process.env.DEAD_LETTER_GITHUB_ISSUES_ENABLED === 'true',
    repository: process.env.DEAD_LETTER_GITHUB_REPO || '',
    labels: (
      process.env.DEAD_LETTER_GITHUB_LABELS || 'bug,webhook,dead-letter'
    ).split(','),
    assignees: (process.env.DEAD_LETTER_GITHUB_ASSIGNEES || '')
      .split(',')
      .filter(Boolean),
  },
  notifications: {
    logLevel:
      (process.env.DEAD_LETTER_LOG_LEVEL as 'info' | 'warn' | 'error') ||
      'warn',
    includePayload: process.env.DEAD_LETTER_INCLUDE_PAYLOAD === 'true',
  },
}

export interface DeadLetterEvent {
  type: 'item_added' | 'threshold_exceeded' | 'webhook_repeated_failures'
  item: DeadLetterWebhook
  timestamp: string
  metadata: {
    totalDeadLetterCount: number
    webhookSpecificCount: number
    timeWindowMinutes: number
  }
}

type DeadLetterEventListener = (event: DeadLetterEvent) => void | Promise<void>

class DeadLetterEventEmitter {
  private listeners: Map<string, DeadLetterEventListener[]> = new Map()
  private recentEvents: DeadLetterEvent[] = []
  private config: DeadLetterAlertConfig
  // Flexy hates hardcoded 1000! Using webhooksConfig.deadLetter.maxEventsBufferSize
  private readonly maxEventsSize: number

  constructor(config: DeadLetterAlertConfig = defaultConfig) {
    this.config = config
    this.maxEventsSize = webhooksConfig.deadLetter.maxEventsBufferSize
    this.setupDefaultListeners()
  }

  on(event: string, listener: DeadLetterEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: string, listener: DeadLetterEventListener): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  async emit(event: string, data: DeadLetterEvent): Promise<void> {
    this.recentEvents.push(data)

    // Prevent unbounded memory growth
    if (this.recentEvents.length > this.maxEventsSize) {
      this.recentEvents = this.recentEvents.slice(-this.maxEventsSize)
    }

    this.cleanupOldEvents()

    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      await Promise.all(eventListeners.map(listener => listener(data)))
    }
  }

  private cleanupOldEvents(): void {
    const cutoff = new Date()
    cutoff.setMinutes(
      cutoff.getMinutes() - this.config.thresholds.timeWindowMinutes
    )

    this.recentEvents = this.recentEvents.filter(
      event => new Date(event.timestamp) > cutoff
    )
  }

  getRecentEvents(timeWindowMinutes?: number): DeadLetterEvent[] {
    if (!timeWindowMinutes) {
      return [...this.recentEvents]
    }

    const cutoff = new Date()
    cutoff.setMinutes(cutoff.getMinutes() - timeWindowMinutes)

    return this.recentEvents.filter(event => new Date(event.timestamp) > cutoff)
  }

  private setupDefaultListeners(): void {
    if (!this.config.enabled) {
      return
    }

    // Log alerts
    this.on('item_added', async event => {
      this.logAlert('Dead letter item added', event)
    })

    // Threshold alerts
    this.on('threshold_exceeded', async event => {
      this.logAlert('Dead letter threshold exceeded', event, 'error')

      if (this.config.githubIssue.enabled) {
        await this.createGitHubIssue(event)
      }
    })

    // Webhook-specific repeated failures
    this.on('webhook_repeated_failures', async event => {
      this.logAlert('Webhook repeated failures detected', event, 'error')

      if (this.config.githubIssue.enabled) {
        await this.createGitHubIssue(event, true)
      }
    })
  }

  private logAlert(
    message: string,
    event: DeadLetterEvent,
    level: 'info' | 'warn' | 'error' = 'warn'
  ): void {
    const logData = {
      deadLetterId: event.item.id,
      webhookId: event.item.webhookId,
      event: event.item.event,
      failureReason: event.item.failureReason,
      totalCount: event.metadata.totalDeadLetterCount,
      webhookSpecificCount: event.metadata.webhookSpecificCount,
      timestamp: event.timestamp,
      ...(this.config.notifications.includePayload && {
        payload: event.item.payload,
      }),
    }

    logger[level](`[DeadLetterAlert] ${message}`, logData)
  }

  private async createGitHubIssue(
    event: DeadLetterEvent,
    isWebhookSpecific = false
  ): Promise<void> {
    if (!this.config.githubIssue.repository) {
      logger.warn(
        '[DeadLetterAlert] GitHub issue creation enabled but no repository configured'
      )
      return
    }

    try {
      // Import dynamically to avoid issues if Octokit is not installed
      let Octokit: typeof import('@octokit/rest').Octokit | undefined
      try {
        const octokitModule = await import('@octokit/rest')
        Octokit = octokitModule.Octokit
      } catch {
        logger.warn(
          '[DeadLetterAlert] @octokit/rest not installed. Run: npm install @octokit/rest'
        )
        return
      }

      if (!Octokit) {
        logger.warn('[DeadLetterAlert] Octokit not available')
        return
      }

      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      })

      const [owner, repo] = this.config.githubIssue.repository.split('/')

      if (!owner || !repo) {
        logger.error(
          `[DeadLetterAlert] Invalid repository format: ${this.config.githubIssue.repository}`
        )
        return
      }

      const title = isWebhookSpecific
        ? `🚨 Webhook ${event.item.webhookId} has ${event.metadata.webhookSpecificCount} dead letter items`
        : `🚨 Dead letter queue threshold exceeded: ${event.metadata.totalDeadLetterCount} items`

      const body = `## Dead Letter Queue Alert

**Alert Type:** ${isWebhookSpecific ? 'Webhook Repeated Failures' : 'Threshold Exceeded'}
**Triggered At:** ${event.timestamp}

### Details

- **Dead Letter ID:** ${event.item.id}
- **Webhook ID:** ${event.item.webhookId}
- **Event Type:** ${event.item.event}
- **Failure Reason:** ${event.item.failureReason}

### Statistics

- **Total Dead Letter Count:** ${event.metadata.totalDeadLetterCount}
- **Webhook-Specific Count:** ${event.metadata.webhookSpecificCount}
- **Time Window:** ${event.metadata.timeWindowMinutes} minutes

### Last Attempt

- **Attempted At:** ${event.item.lastAttemptAt}
- **Delivery Attempts:** ${event.item.deliveryAttempts.length}

${this.config.notifications.includePayload ? `### Payload\n\n\`\`\`json\n${JSON.stringify(event.item.payload, null, 2)}\n\`\`\`` : ''}

---
*This issue was automatically created by the dead letter queue alerting system.*
`

      // ULW Loop Fix #3860: Add timeout protection to prevent indefinite blocking
      // Flexy hates hardcoded 30000! Using webhooksConfig.deadLetter.github.apiTimeoutMs
      const GITHUB_API_TIMEOUT_MS =
        webhooksConfig.deadLetter.github.apiTimeoutMs
      const response = await Promise.race([
        octokit.issues.create({
          owner,
          repo,
          title,
          body,
          labels: this.config.githubIssue.labels,
          assignees: this.config.githubIssue.assignees,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `GitHub API timeout after ${GITHUB_API_TIMEOUT_MS / 1000}s`
                )
              ),
            GITHUB_API_TIMEOUT_MS
          )
        ),
      ])

      logger.info(
        `[DeadLetterAlert] Created GitHub issue: ${response.data.html_url}`
      )
    } catch (error) {
      logger.error('[DeadLetterAlert] Failed to create GitHub issue', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  updateConfig(newConfig: Partial<DeadLetterAlertConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): DeadLetterAlertConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const deadLetterEventEmitter = new DeadLetterEventEmitter()

// Helper function to check thresholds and emit appropriate events
export async function checkDeadLetterThresholds(
  item: DeadLetterWebhook,
  emitter: DeadLetterEventEmitter = deadLetterEventEmitter
): Promise<void> {
  const config = emitter.getConfig()

  if (!config.enabled) {
    return
  }

  const totalCount = await webhookStorage
    .getDeadLetterQueue()
    .then(q => q.length)
  const webhookItems = await webhookStorage
    .getDeadLetterQueue()
    .then(q => q.filter(dl => dl.webhookId === item.webhookId))
  const webhookSpecificCount = webhookItems.length

  const baseEvent: DeadLetterEvent = {
    type: 'item_added',
    item,
    timestamp: new Date().toISOString(),
    metadata: {
      totalDeadLetterCount: totalCount,
      webhookSpecificCount,
      timeWindowMinutes: config.thresholds.timeWindowMinutes,
    },
  }

  // Always emit item_added event
  await emitter.emit('item_added', baseEvent)

  // Check total threshold
  if (totalCount >= config.thresholds.totalCount) {
    await emitter.emit('threshold_exceeded', {
      ...baseEvent,
      type: 'threshold_exceeded',
    })
  }

  // Check webhook-specific threshold
  if (webhookSpecificCount >= config.thresholds.webhookSpecificCount) {
    await emitter.emit('webhook_repeated_failures', {
      ...baseEvent,
      type: 'webhook_repeated_failures',
    })
  }
}
