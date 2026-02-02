# Slow Tests Report

**Date**: January 31, 2026
**Agent**: Jules (TestGuard)

The following test suites exceeded the 1.5s execution threshold during a full test run.

| Test Suite | Duration | Note |
|------------|----------|------|
| `components/__tests__/SearchBar.test.ts` | ~1.5s | Likely due to component mounting and multiple sub-component failures during resolution. |
| `__tests__/server/utils/webhookStorage.test.ts` | ~1.6s | Extensive database operations (50 tests). |

## Recommendations

1. **SearchBar.test.ts**: Optimize by stubbing out non-essential child components (already partially done but can be improved).
2. **webhookStorage.test.ts**: Consider grouping tests or reducing database resets if possible, although resets are needed for isolation.

## Flaky Tests Detected

- `__tests__/server/utils/webhookQueue.test.ts`: Fails occasionally in parallel runs due to shared database file (`data/dev.db`).

### Recommendation

Configure Vitest to run these tests in sequence or use a dedicated memory database for each worker.
