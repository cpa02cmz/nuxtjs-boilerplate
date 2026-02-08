import { defineNuxtModule, addServerHandler } from '@nuxt/kit'
import { resolve } from 'path'

export default defineNuxtModule({
  meta: {
    name: 'openapi',
    configKey: 'openapi',
  },
  setup() {
    // Add the OpenAPI spec route
    addServerHandler({
      route: '/api-docs/spec.json',
      handler: resolve('./server/api/api-docs/spec.get.ts'),
    })

    // Add the Swagger UI route
    addServerHandler({
      route: '/api-docs',
      handler: resolve('./server/api/api-docs/index.get.ts'),
    })

    // Note: Server middleware (api-auth.ts) is auto-scanned from server/middleware/
    // by Nitro and does not need to be manually registered here
  },
})
