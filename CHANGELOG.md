# Changelog

All notable changes to the workflow system will be documented in this file.

## [Optimized Workflow Structure] - 2025-11-24

### Added
- Enhanced `PR Guard.yml` with PR automation features
- Added documentation for new workflow structure in `docs/workflows/README.md`

### Changed
- Updated `oc-issue-solver.yml` to use specific concurrency group instead of global lock
- Renamed workflow in `PR Guard.yml` from "PR Guard (CI + Auto-Update All PRs)" to "PR Guard (PR Automation + CI)"
- Modified schedule in `PR Guard.yml` from hourly to every 4 hours
- Added issue_comment trigger to `PR Guard.yml` for better responsiveness

### Removed
- Removed `oc-pr-handler.yml` workflow (functionality merged to `PR Guard.yml`)
- Removed `iflow-pr.yml` workflow (functionality merged to `PR Guard.yml`)
- Removed duplicate `scripts/pr-automation.js` (kept `scripts/pr-automation-handler.js`)

### Fixed
- Eliminated workflow overlaps in PR handling
- Resolved concurrency conflicts between workflows
- Improved resource utilization by reducing redundant workflow executions