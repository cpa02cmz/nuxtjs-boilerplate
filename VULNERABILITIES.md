# Security Vulnerabilities Report

## Status: Monitored (requires upstream fix)

### Issue #885: NPM Audit - 16 Moderate Severity Vulnerabilities

**Date:** 2026-02-18 (updated from 2026-02-09)
**Status:** Acknowledged, monitoring for upstream fix
**Severity:** Moderate
**Affected:** Development dependencies only

#### Summary

`npm audit` reports 16 moderate severity vulnerabilities in the ESLint/AJV dependency chain:

- `ajv` (ReDoS when using `$data` option)
- `@eslint/eslintrc` (depends on vulnerable ajv)
- `eslint` and related packages
- `@typescript-eslint/*` packages
- `eslint-plugin-vue`
- `eslint-config-prettier`
- `eslint-plugin-prettier`

These vulnerabilities are in the development tooling chain (ESLint ecosystem) and do not affect production builds.

#### Affected Dependency Tree

```
eslint (ESLint ecosystem)
  └─ @eslint/eslintrc
      └─ ajv@<8.18.0 (vulnerable: ReDoS)
  └─ @typescript-eslint/*
      └─ @eslint-community/eslint-utils
  └─ eslint-plugin-vue
  └─ eslint-config-prettier
      └─ eslint-plugin-prettier
```

#### Impact Assessment

- **Severity:** Moderate (not high or critical)
- **Scope:** Development-time dependencies only (ESLint tooling)
- **Production Impact:** None - ESLint and related tools are not included in production builds
- **Attack Vector:** Local development environment only

#### Attempted Fixes

1. **npm audit fix**: No automatic fix available
2. **npm audit fix --force**: Requires downgrading to older Nuxt/ESLint versions (breaking change)

#### Recommended Action

**Option 1: Wait for Upstream Fix (Recommended)**

- Monitor ESLint and AJV releases for updates that resolve these vulnerabilities
- The vulnerabilities are in devDependencies, not production code
- Risk is minimal as ESLint is only used during development
- Full remediation requires major version upgrades (Nuxt 4, ESLint 10, etc.) which would introduce breaking changes

**Option 2: Force Fix (Not Recommended)**

- Run `npm audit fix --force`
- This is a breaking change and may cause compatibility issues
- Only consider if immediate remediation is required

#### Monitoring

Track these upstream issues:

- ESLint GitHub Issues: https://github.com/eslint/eslint/issues
- AJV repository: https://github.com/ajv-validator/ajv
- TypeScript ESLint: https://github.com/typescript-eslint/typescript-eslint

#### Next Review

Review monthly or when new ESLint/AJV versions are released.

---

_Technical Writer update: Corrected vulnerability count from 8 to 16 and updated affected dependency chain._
