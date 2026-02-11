/**
 * Analytics Demo Data Configuration
 * Flexy hates hardcoded values! All demo/mock data centralized here.
 */

export interface MetricCard {
  title: string
  value: string
  subtext: string
  color: 'blue' | 'green' | 'purple' | 'red' | 'gray'
}

export interface EndpointUsage {
  name: string
  requests: string
  percentage: number
  color: string
}

export interface ApiActivity {
  endpoint: string
  method: string
  status: number
  statusColor: 'green' | 'red'
  time: string
  apiKey: string
}

export interface RateLimitStat {
  title: string
  value: string
  subtext: string
}

export interface AnalyticsDemoData {
  metrics: {
    totalRequests: MetricCard
    successRate: MetricCard
    activeKeys: MetricCard
  }
  endpointUsage: EndpointUsage[]
  recentActivity: ApiActivity[]
  rateLimiting: {
    exceeded: RateLimitStat
    avgResponseTime: RateLimitStat
  }
}

/**
 * Demo data for API Analytics page
 * All values are configurable via environment variables or can be overridden
 */
export const analyticsDemoData: AnalyticsDemoData = {
  metrics: {
    totalRequests: {
      title: 'Total Requests',
      value: process.env.ANALYTICS_DEMO_TOTAL_REQUESTS || '12,342',
      subtext: '+12% from last week',
      color: 'blue',
    },
    successRate: {
      title: 'Success Rate',
      value: process.env.ANALYTICS_DEMO_SUCCESS_RATE || '98.7%',
      subtext: '2.3% errors',
      color: 'green',
    },
    activeKeys: {
      title: 'Active Keys',
      value: process.env.ANALYTICS_DEMO_ACTIVE_KEYS || '42',
      subtext: '12 new this week',
      color: 'purple',
    },
  },
  endpointUsage: [
    {
      name: 'GET /api/v1/resources',
      requests: '4,231 requests',
      percentage: parseInt(process.env.ANALYTICS_DEMO_USAGE_RESOURCES || '75'),
      color: 'bg-blue-600',
    },
    {
      name: 'GET /api/v1/search',
      requests: '3,892 requests',
      percentage: parseInt(process.env.ANALYTICS_DEMO_USAGE_SEARCH || '65'),
      color: 'bg-green-600',
    },
    {
      name: 'POST /api/submissions',
      requests: '1,245 requests',
      percentage: parseInt(
        process.env.ANALYTICS_DEMO_USAGE_SUBMISSIONS || '35'
      ),
      color: 'bg-yellow-600',
    },
    {
      name: 'GET /api/v1/auth/api-keys',
      requests: '892 requests',
      percentage: parseInt(process.env.ANALYTICS_DEMO_USAGE_API_KEYS || '15'),
      color: 'bg-purple-600',
    },
  ],
  recentActivity: [
    {
      endpoint: '/api/v1/resources',
      method: 'GET',
      status: 200,
      statusColor: 'green',
      time: '2 min ago',
      apiKey: 'key_abc123',
    },
    {
      endpoint: '/api/v1/search',
      method: 'GET',
      status: 200,
      statusColor: 'green',
      time: '5 min ago',
      apiKey: 'key_def456',
    },
    {
      endpoint: '/api/submissions',
      method: 'POST',
      status: 200,
      statusColor: 'green',
      time: '8 min ago',
      apiKey: 'key_ghi789',
    },
    {
      endpoint: '/api/v1/resources',
      method: 'GET',
      status: 429,
      statusColor: 'red',
      time: '12 min ago',
      apiKey: 'key_jkl012',
    },
  ],
  rateLimiting: {
    exceeded: {
      title: 'Rate Limit Exceeded',
      value: process.env.ANALYTICS_DEMO_RATE_LIMIT_EXCEEDED || '124',
      subtext: 'requests blocked this week',
    },
    avgResponseTime: {
      title: 'Average Response Time',
      value: process.env.ANALYTICS_DEMO_AVG_RESPONSE_TIME || '142ms',
      subtext: 'across all endpoints',
    },
  },
}

/**
 * Get analytics demo data
 * Can be overridden for testing or different environments
 */
export function getAnalyticsDemoData(
  overrides?: Partial<AnalyticsDemoData>
): AnalyticsDemoData {
  return {
    ...analyticsDemoData,
    ...overrides,
  }
}

export type { AnalyticsDemoData as default }
