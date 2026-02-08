# Security Vulnerabilities Report

## Status: Monitored (requires upstream fix)

### Issue #885: NPM Audit - 7 Moderate Severity Vulnerabilities

**Date:** 2026-02-08
**Status:** Acknowledged, monitoring for upstream fix
**Severity:** Moderate
**Affected:** Development dependencies only

#### Summary
`npm audit` reports 7 moderate severity vulnerabilities in the dependency chain:
- `lodash` (Prototype Pollution)
- `chevrotain` and related packages

#### Affected Dependency Tree
```
prisma@7.3.0
  └─ @prisma/dev
      └─ @mrleebo/prisma-ast
          └─ chevrotain@10.x
              └─ lodash@4.17.21 (vulnerable)
```

#### Impact Assessment
- **Severity:** Moderate (not high or critical)
- **Scope:** Development-time dependencies only (Prisma CLI)
- **Production Impact:** None - Prisma CLI is not included in production builds
- **Attack Vector:** Local development environment only

#### Attempted Fixes

1. **npm audit fix**: No automatic fix available
2. **npm audit fix --force**: Requires downgrading Prisma from 7.3.0 to 6.19.2 (breaking change)

#### Recommended Action

**Option 1: Wait for Upstream Fix (Recommended)**
- Monitor Prisma releases for updates that resolve these dependencies
- The vulnerabilities are in devDependencies, not production code
- Risk is minimal as Prisma CLI is only used during development/build

**Option 2: Force Fix (Not Recommended)**
- Run `npm audit fix --force` to downgrade Prisma to 6.19.2
- This is a breaking change and may cause compatibility issues
- Only consider if immediate remediation is required

#### Monitoring

Track these upstream issues:
- Prisma GitHub Issues: https://github.com/prisma/prisma/issues
- chevrotain repository: https://github.com/Chevrotain/chevrotain
- lodash security advisories: https://github.com/lodash/lodash/security

#### Next Review
Review monthly or when new Prisma versions are released.

