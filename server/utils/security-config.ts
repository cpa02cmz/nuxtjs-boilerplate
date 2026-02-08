// Centralized security configuration
// This file re-exports from the modular config system
// Flexy says: No more hardcoded values!

export {
  securityConfig,
  generateCsp,
  getSecurityHeaders,
  type SecurityConfig,
} from '~/configs/security.config'
