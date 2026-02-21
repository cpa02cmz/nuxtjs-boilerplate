# Security Vulnerabilities Report

## Status: Monitored (requires upstream fix)

### Issue #885: NPM Audit - 40 Vulnerabilities

**Date:** 2026-02-21 (updated from 2026-02-18)
**Status:** Acknowledged, monitoring for upstream fix
**Severity:** Mixed (1 low, 1 moderate, 38 high)
**Affected:** Development dependencies only

#### Summary

`npm audit` reports 40 vulnerabilities in the development dependency chain:

| Severity | Count | Primary Packages              |
| -------- | ----- | ----------------------------- |
| High     | 38    | minimatch, @eslint/_, @nuxt/_ |
| Moderate | 1     | ajv                           |
| Low      | 1     | devalue                       |

These vulnerabilities are in the development tooling chain and do not affect production builds.

#### Affected Dependency Tree

```
minimatch (HIGH - ReDoS via repeated wildcards)
  ├─ eslint (depends on @eslint/config-array)
  │   └─ @eslint/config-array
  │   └─ @eslint/eslintrc
  ├─ @typescript-eslint/typescript-estree
  │   └─ @typescript-eslint/parser
  ├─ lighthouse (via @sentry/node)
  ├─ @vitest/coverage-v8 (via test-exclude)
  ├─ glob (via multiple packages)
  │   └─ replace-in-file
  │       └─ tailwind-config-viewer
  │           └─ @nuxtjs/tailwindcss
  ├─ workbox-build
  └─ filelist

ajv (MODERATE - ReDoS when using $data option)
  └─ @eslint/eslintrc
  └─ eslint

devalue (LOW - CPU/memory amplification, prototype pollution)
  └─ nuxt (direct dependency)
```

#### Impact Assessment

- **Severity Distribution:** 1 low, 1 moderate, 38 high
- **Scope:** Development-time dependencies only
- **Production Impact:** None - affected packages are not included in production builds
- **Attack Vector:** Local development environment only

#### Attempted Fixes

1. **npm audit fix**: Limited fixes available (1 low, 1 moderate)
2. **npm audit fix --force**: Requires major version upgrades (breaking changes)
   - Nuxt 3.x → Nuxt 4.x
   - ESLint 9.x → ESLint 10.x
   - Vitest 3.x → Vitest 4.x

#### Recommended Action

**Option 1: Wait for Upstream Fix (Recommended)**

- Monitor minimatch, ESLint, and AJV releases for updates
- The vulnerabilities are in devDependencies, not production code
- Risk is minimal as affected packages are only used during development
- Full remediation requires major version upgrades which would introduce breaking changes

**Option 2: Force Fix (Not Recommended)**

- Run `npm audit fix --force`
- This is a breaking change and may cause compatibility issues
- Only consider if immediate remediation is required

#### Packages Without Available Fixes (8)

The following packages have no fix available:

| Package                              | Severity | Notes                   |
| ------------------------------------ | -------- | ----------------------- |
| @surma/rollup-plugin-off-main-thread | High     | No update available     |
| @vite-pwa/nuxt                       | High     | Requires Nuxt 4 upgrade |
| ejs                                  | High     | Dependency chain issue  |
| filelist                             | High     | No update available     |
| jake                                 | High     | Dependency of ejs       |
| minimatch (in some chains)           | High     | Requires major upgrades |
| vite-plugin-pwa                      | High     | Requires Nuxt 4 upgrade |
| workbox-build                        | High     | Requires major upgrade  |

#### Monitoring

Track these upstream issues:

- ESLint GitHub Issues: https://github.com/eslint/eslint/issues
- AJV repository: https://github.com/ajv-validator/ajv
- TypeScript ESLint: https://github.com/typescript-eslint/typescript-eslint
- minimatch repository: https://github.com/isaacs/minimatch

#### Next Review

Review monthly or when new versions of affected packages are released.

---

_Technical Writer update: Updated vulnerability count from 16 to 40, corrected severity distribution (1 low, 1 moderate, 38 high), and updated affected dependency chain to reflect current npm audit state._
