# Workflow Documentation

This document explains the current GitHub Actions workflow structure after optimization to eliminate overlaps and ensure one workflow per function.

## Overview

After optimization, the repository now has a streamlined workflow system with clearly defined responsibilities for each workflow:

1. **PR Automation & CI** → `PR Guard.yml` (event-driven)
2. **Issue Solving** → `oc-issue-solver.yml` (scheduled)
3. **AI Agent Workflows** → Various agent-specific workflows (CEO, CTO, CFO, etc.)

## Workflow Details

### 1. PR Guard (PR Automation + CI)

**File**: `.github/workflows/PR Guard.yml`

**Purpose**: Comprehensive PR handling and CI validation

**Triggers**:
- `pull_request`: When PRs are opened, updated, or reopened
- `push` to main branch: To trigger CI validation
- `pull_request_target`: For handling PR events with write permissions
- `schedule`: Periodic checks every 4 hours
- `issue_comment`: For `/update` command handling

**Functions**:
- CI validation (lint/build/test)
- Auto-update PR branches with main branch
- Handle `/update` comment commands
- Process review comments and implement changes
- Validate and finalize PRs

**Concurrency**: Uses PR-specific concurrency groups to prevent conflicts

### 2. Issue Solver

**File**: `.github/workflows/oc-issue-solver.yml`

**Purpose**: End-to-end issue resolution with PR creation

**Triggers**:
- `schedule`: Every 30 minutes to check for new issues
- `workflow_dispatch`: Manual trigger option

**Functions**:
- Select and prioritize open issues
- Analyze issues and create implementation plan
- Implement solution and create PR
- Link PR to original issue

**Concurrency**: Uses issue-solver specific concurrency to avoid conflicts with other workflows

### 3. AI Agent Workflows

**Files**: `.github/workflows/ai-*.yml`

**Purpose**: Various business function automation using AI agents

**Functions**:
- CEO Agent: Strategic oversight and coordination
- CTO Agent: Technical leadership and architecture decisions
- CFO Agent: Financial planning and analysis
- CMO Agent: Marketing strategy and campaigns
- COO Agent: Operations optimization
- HR Agent: Human resources management
- R&D Agent: Research and development
- Data Analyst Agent: Data analysis and insights
- Security Officer Agent: Security monitoring and compliance
- Customer Success Agent: Customer relationship management
- Legal & Compliance Agent: Legal review and compliance
- Product Manager Agent: Product development and management
- Integration Agent: Cross-agent coordination and integration

## Benefits of Current Structure

1. **No Overlaps**: Each workflow has a specific, non-overlapping responsibility
2. **Efficient Resource Usage**: Eliminates redundant workflow executions
3. **Clear Ownership**: Each function has a designated workflow
4. **Scalability**: Structure allows for easy addition of new specialized workflows
5. **Maintainability**: Easier to debug and modify individual workflows

## Migration Notes

The following workflows were removed as part of optimization:
- `oc-pr-handler.yml` - Functionality merged into `PR Guard.yml`
- `iflow-pr.yml` - Functionality merged into `PR Guard.yml`
- `scripts/pr-automation.js` - Duplicate of `scripts/pr-automation-handler.js`

The `PR Guard.yml` workflow was enhanced with PR automation features previously found in the removed workflows.