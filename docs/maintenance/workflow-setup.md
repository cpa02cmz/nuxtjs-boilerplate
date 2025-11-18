# GitHub Actions Workflow Setup

This document explains the required changes to properly set up GitHub Actions workflows for this repository.

## Problem

The repository uses pnpm as the package manager (evident from `pnpm-lock.yaml` and the README recommendation), but the GitHub Actions workflows are not configured to use pnpm. This causes:

1. ESLint configuration errors (dependencies not installed)
2. Dependency installation timeouts
3. Build process failures (nuxt command not found)
4. Inconsistent package management between local and CI environments

## Solution

All workflow files in `.github/workflows/` need to be updated to include proper pnpm setup:

- `.github/workflows/oc- researcher.yml`
- `.github/workflows/oc-issue-solver.yml`
- `.github/workflows/oc-maintainer.yml`
- `.github/workflows/oc-pr-handler.yml`
- `.github/workflows/oc-problem-finder.yml`
- `.github/workflows/template.yml`

### Required Changes

Replace the current checkout and setup section:

```yaml
- name: Checkout
  uses: actions/checkout@v5
  with:
    fetch-depth: 1
```

With this updated version:

```yaml
- name: Checkout
  uses: actions/checkout@v5
  with:
    fetch-depth: 1

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'

- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9
    run_install: false

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

## Verification

After implementing these changes, the following commands should work in the CI environment:

- `pnpm run lint` - Should run ESLint without configuration errors
- `pnpm run build` - Should build the Nuxt application successfully
- `pnpm run dev` - Should start the development server
