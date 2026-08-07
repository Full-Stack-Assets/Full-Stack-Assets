# Portfolio Engineering Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish one reusable security, CI, release, ownership, and maturity baseline across the Full-Stack-Assets portfolio.

**Architecture:** The portfolio repository is the source of truth for reusable policies and templates. Product repositories adopt the baseline according to maturity tier, while production-specific checks remain inside each product repository.

**Tech Stack:** GitHub Actions, CODEOWNERS, Dependabot, Markdown policy documents, YAML service catalog.

## Global Constraints

- No direct automation pushes to production branches.
- No production deployment credentials in generation-only jobs.
- Tier 2 and higher repositories require tests, build checks, security scanning, release documentation, and an owner.
- Provider migrations require live smoke testing before production promotion.
- Security-sensitive URL fetching requires DNS validation, address pinning, redirect revalidation, timeouts, and response limits.

---

### Task 1: Publish the repository maturity model

- [x] Define experiment, prototype, release-candidate, production, revenue-critical, and archived tiers.
- [x] Define required controls for each tier.

### Task 2: Publish the service catalog schema

- [x] Define product ownership, runtime, deployment, data, health, secret, and verification fields.
- [ ] Add one catalog entry for every active repository.

### Task 3: Publish reusable release and security policies

- [x] Define minimum CI and release gates.
- [x] Define automated-content promotion rules.
- [x] Define AI-provider migration gates.
- [x] Define SSRF-safe fetch requirements.

### Task 4: Adopt the baseline across active repositories

- [x] Harden Nextgengear generated-content promotion on an isolated branch.
- [x] Harden BeyondMythos generated-content promotion on an isolated branch.
- [x] Expand WireandLogic SSRF range-boundary tests on its draft PR branch.
- [ ] Run live provider validation for billion-dollar-brief with production credentials.
- [ ] Run The Narrows browser and gameplay release matrix with exported artifacts.
- [ ] Verify Veritas Render persistence, JWT configuration, CORS, and cross-tenant isolation.
- [ ] Group and test dependency upgrades in vibecoderz-app and raiseflow.
- [ ] Restore a stable protected default branch for tradewind-dealflow.
- [ ] Select canonical repositories and archive duplicate product families.
