# GitHub Actions Workflow Setup

This document explains the required changes to properly set up GitHub Actions workflows for this repository.

## Problem

The repository uses npm as the package manager (evident from `packageManager: npm` in package.json), but the GitHub Actions workflows need to be configured properly for npm. This causes:

1. ESLint configuration errors (dependencies not installed)
2. Dependency installation timeouts
3. Build process failures (nuxt command not found)
4. Inconsistent package management between local and CI environments

## Solution

All workflow files in `.github/workflows/` need to be updated to include proper npm setup:

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
    cache: 'npm'

- name: Install dependencies
  run: npm ci
```

## Verification

After implementing these changes, the following commands should work in the CI environment:

- `npm run lint` - Should run ESLint without configuration errors
- `npm run build` - Should build the Nuxt application successfully
- `npm run dev` - Should start the development server
