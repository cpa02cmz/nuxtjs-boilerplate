# Security Vulnerabilities Report

## Status: Monitored (requires upstream fix)

### Issue #885: NPM Audit - 40 Vulnerabilities (Dev Dependencies Only)

**Date:** 2026-02-21 (updated from 2026-02-18)
**Status:** Acknowledged, monitoring for upstream fix
**Severity:** Mixed (38 High, 1 Moderate, 1 Low)
**Affected:** Development dependencies only

#### Summary

`npm audit` reports 40 vulnerabilities in development dependencies:

| Severity | Count | Affected Packages                           |
| -------- | ----- | ------------------------------------------- |
| High     | 38    | ESLint ecosystem, Nuxt tooling, PWA plugins |
| Moderate | 1     | AJV                                         |
| Low      | 1     | Devalue                                     |

**Key affected packages:**

- `@eslint/config-array` (via minimatch)
- `@eslint/eslintrc` (via minimatch)
- `@nuxt/nitro-server`, `@nuxt/vite-builder` (via nitropack)
- `@nuxt/test-utils` (via vitest-environment-nuxt)
- `@vite-pwa/nuxt`, `vite-plugin-pwa` (PWA tooling)
- `ejs`, `jake`, `filelist` (build tooling)
- `workbox-build` (PWA service worker)

These vulnerabilities are in the development tooling chain and do not affect production builds.

#### Affected Dependency Categories

**ESLint Ecosystem (via minimatch):**

- `@eslint/config-array`, `@eslint/eslintrc`, `eslint`
- `@typescript-eslint/*` packages

**Nuxt/Vite Tooling:**

- `@nuxt/nitro-server`, `@nuxt/vite-builder`, `nitropack`
- `@nuxt/test-utils`, `vitest-environment-nuxt`

**PWA Plugins:**

- `@vite-pwa/nuxt`, `vite-plugin-pwa`
- `workbox-build`, `@surma/rollup-plugin-off-main-thread`

**Build Tooling:**

- `ejs`, `jake`, `filelist`

**Other:**

- `devalue` (low severity)
- `ajv` (moderate severity - ReDoS)

#### Impact Assessment

- **Severity:** Mixed (38 High, 1 Moderate, 1 Low) - all in development dependencies
- **Scope:** Development-time dependencies only (ESLint, Nuxt tooling, PWA plugins)
- **Production Impact:** None - these tools are not included in production builds
- **Attack Vector:** Local development environment only

#### Fix Availability

| Status           | Count | Notes                           |
| ---------------- | ----- | ------------------------------- |
| Fix Available    | 32    | Requires major version upgrades |
| No Fix Available | 8     | Awaiting upstream patches       |

**Fixes Available (Breaking Changes Required):**

- Nuxt 3.x → Nuxt 4.x
- ESLint 9.x → ESLint 10.x
- Vitest 3.x → Vitest 4.x
- Prisma 6.x → Prisma 7.x

**Vulnerabilities Without Fixes:**

- `@surma/rollup-plugin-off-main-thread`
- `@vite-pwa/nuxt`, `vite-plugin-pwa`
- `ejs`, `filelist`, `jake`
- `minimatch` (in some contexts)
- `workbox-build`

#### Recommended Action

**Option 1: Wait for Upstream Fix / Planned Major Upgrade (Recommended)**

- Schedule a dedicated breaking-change PR for Nuxt 4, ESLint 10, Vitest 4, Prisma 7 upgrades
- The vulnerabilities are in devDependencies, not production code
- Risk is minimal as these tools are only used during development
- Major version upgrades will resolve most vulnerabilities

**Option 2: Partial Upgrade (Not Recommended)**

- Run `npm audit fix --force` for packages with fixes available
- This may introduce breaking changes and compatibility issues
- Some vulnerabilities have no fixes available anyway

#### Monitoring

Track these upstream issues:

- ESLint GitHub Issues: https://github.com/eslint/eslint/issues
- AJV repository: https://github.com/ajv-validator/ajv
- TypeScript ESLint: https://github.com/typescript-eslint/typescript-eslint

#### Next Review

Review monthly or when new ESLint/AJV versions are released.

---

_Repository Manager update: Updated vulnerability count from 16 to 40, added severity breakdown, and updated affected packages list. [-manager]_
