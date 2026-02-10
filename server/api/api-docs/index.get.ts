import { defineEventHandler } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { cdnConfig } from '~/configs/cdn.config'

export default defineEventHandler(async event => {
  await rateLimit(event)
  // Flexy hates hardcoded values! Using CDN config
  const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Free Stuff on the Internet API Documentation" />
  <title>Free Stuff on the Internet - API Documentation</title>
  <link rel="stylesheet" type="text/css" href="${cdnConfig.swagger.cssUrl}" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .swagger-ui .topbar {
      background-color: #4f46e5;
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
    .swagger-ui .info .title {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .swagger-ui .info {
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${cdnConfig.swagger.jsUrl}" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api-docs/spec.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.presets.standalone,
        ],
        layout: "StandaloneLayout",
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
      });
    };
  </script>
</body>
</html>
`

  return swaggerHtml
})
