# Organization-wide deployment-platform removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every current default-branch repository mention and integration of the requested deployment platform from all accessible `Full-Stack-Assets` repositories and prove the organization is clean before Worldline v2.0 starts.

**Architecture:** Treat each repository as an isolated migration unit. Discover exact current-state hits through GitHub code search and tree inspection, classify each hit as delete/replace/edit, apply the smallest provider-neutral change on `codex/remove-vercel`, verify available CI/build gates, merge, then re-scan the default branch. The organization-wide gate is a final zero-result scan across multiple platform-specific search variants plus explicit inspection of unindexed repositories.

**Tech Stack:** GitHub Contents API, GitHub Code Search, GitHub Actions, repository-native Node/Python/build tools where present.

## Global Constraints

- Scope includes every repository accessible under `Full-Stack-Assets`, including archived repositories when GitHub accepts writes.
- Historical Git commits, closed PRs, releases, and issue discussions are not rewritten.
- Do not invent replacement endpoints, credentials, DNS state, deployment state, or production-success claims.
- Do not force a single hosting vendor.
- Do not change secrets, DNS, billing, or external provider accounts.
- Every affected repository uses `codex/remove-vercel` unless that branch already exists, in which case reuse its current safe head after inspection.
- A cleanup-caused typecheck/test/build failure blocks merge for that repository.
- Worldline v2.0 work begins only after the organization-wide current-state scan is clean.

---

### Task 1: Establish authoritative repository inventory

**Files:**
- Create/update: `docs/platform-removal-audit.json` in `Full-Stack-Assets/Full-Stack-Assets`

**Interfaces:**
- Consumes: GitHub `list_repositories(owner="Full-Stack-Assets", page_size=100, include_search_index_status=true)`.
- Produces: audit JSON with `repository`, `defaultBranch`, `archived`, `indexed`, `hits`, `status`.

- [ ] **Step 1: List every accessible repository**

Capture all repositories returned for owner `Full-Stack-Assets`, including archived and unindexed repositories.

- [ ] **Step 2: Run broad organization searches**

Run current-state code searches for all of:

```text
vercel
vercel.app
vercel.com
@vercel
VERCEL_
vercel.json
.vercelignore
```

- [ ] **Step 3: Partition search work by repository**

For each indexed repository, run `query="vercel"` against that repository directly so the global 100-result ceiling cannot hide lower-ranked repositories.

- [ ] **Step 4: Inspect unindexed repository trees**

For every `is_code_search_indexed=false` repository, fetch `git/trees/<default-branch>?recursive=1`, search paths for platform names/config files, and fetch likely text/config files that can contain deployment instructions.

- [ ] **Step 5: Write the audit file**

Use this exact record shape:

```json
{
  "schema": "full-stack-assets-platform-removal-v1",
  "generatedAt": "2026-08-12",
  "repositories": [
    {
      "repository": "Full-Stack-Assets/example",
      "defaultBranch": "main",
      "archived": false,
      "indexed": true,
      "hits": ["README.md"],
      "status": "PENDING"
    }
  ]
}
```

- [ ] **Step 6: Commit**

Commit message:

```text
chore: inventory organization-wide platform references
```

---

### Task 2: Remove platform-only configuration and deployment files

**Files:**
Known current examples include:
- Delete: `BeyondMythos.com/vercel.json`
- Delete or replace then delete: `BeyondMythos.com/lib/vercel-deployer.js`
- Delete: `VibeCoderz/vercel.json`
- Delete: `VibeCoderz/conductor/apps/web/vercel.json`
- Delete: `VibeCoderz/.github/workflows/deploy-conductor-vercel.yml`
- Delete: `TheTunerDepot.com/vercel.json`
- Delete: `mickey-procurement-platform/vercel.json`
- Delete: `cosmo/vercel.json`
- Delete: `evolution-engine/vercel.json`
- Delete or replace then delete: `evolution-engine/src/integrations/vercelDeploy.ts`
- Delete: `Veritas/vercel.json`
- Delete: `Veritas/.vercelignore`
- Delete: `The-Narrows/QUAHOG_Web/vercel.json`
- Delete: `The-Narrows/QUAHOG_GODOT1/vercel.json`
- Delete: `The-Narrows/quahog-project-files/vercel.json`
- Delete: `Photobeam/backend/vercel.json`
- Delete: `slack-agent-template/.agents/skills/slack-agent/reference/vercel-setup.md`

**Interfaces:**
- Consumes: Task 1 audit.
- Produces: provider-neutral repository structure with no platform-named deployment files.

For each repository with one or more platform-only files:

- [ ] **Step 1: Inspect references before deletion**

Search the repository for the exact filename/module symbol. If a platform-only adapter is imported by mixed-purpose code, remove the import/call path before deleting the adapter.

- [ ] **Step 2: Create repository cleanup branch**

Create `codex/remove-vercel` from the current default branch head.

- [ ] **Step 3: Delete pure configuration files**

Delete platform-only configs/ignore files/workflows that have no provider-neutral behavior.

- [ ] **Step 4: Replace mixed adapters only when necessary**

When a platform-named adapter encapsulates general deployment behavior, create a provider-neutral module such as `deployment.ts`/`deployer.js` preserving only repository-supported generic behavior, update callers, then delete the platform-named file.

- [ ] **Step 5: Search branch for filename references**

Search `vercel`, the deleted filenames, and removed environment-variable names before opening the PR.

- [ ] **Step 6: Commit repository changes**

Commit message:

```text
chore: remove retired deployment platform integration
```

---

### Task 3: Remove runtime SDKs, environment assumptions, and platform-specific code paths

**Files:**
Known current examples requiring inspection include:
- `LLM-MODEL/api/chat.ts`
- `Veritas/api/index.py`
- `slack-agent-template/server/app.ts`
- `slack-agent-template/server/api/slack/events.post.ts`
- `hostgraph-website-mvp/lib/auth.ts`
- `hostgraph-website-mvp/app/layout.tsx`
- `mickey-procurement-platform/api/index.ts`
- `mickey-procurement-platform/server/_core/app.ts`
- `mickey-procurement-platform/server/_core/index.ts`
- `evolution-engine/src/config.ts`
- `evolution-engine/src/db/index.ts`
- `BeyondMythos.com/lib/config.js`
- `BeyondMythos.com/scripts/add-posts.js`
- `BeyondMythos.com/scripts/generate-blog-site.js`
- `VibeCoderz/lib/stripe.ts`
- `VibeCoderz/lib/ratelimit.ts`
- `VibeCoderz/app/api/health/route.ts`
- `VibeCoderz/app/api/sandbox/file/route.ts`
- `VibeCoderz/app/api/sandboxes/[sandboxId]/route.tsx`
- `VibeCoderz/ai/tools/get-rich-error.ts`
- `VibeCoderz/ai/tools/get-sandbox-url.ts`
- `VibeCoderz/conductor/apps/ios/src/config.ts`
- `VibeCoderz/scripts/verify-gateway.mjs`
- `VibeCoderz/scripts/test_sandbox.py`
- `The-Narrows/QUAHOG_Web/api/music.ts`
- `The-Narrows/QUAHOG_Web/api/_http.ts`
- `The-Narrows/QUAHOG_Web/api/_guard.ts`
- `The-Narrows/QUAHOG_Web/vite.config.ts`
- `Autonomous-Browser/api/generate.ts`
- `Autonomous-Browser/vite.config.ts`
- `cosmo/src/analytics.ts`
- `cosmo/index.html`
- `WireandLogic/src/lib/affiliates.ts`

**Interfaces:**
- Consumes: repository-native runtime behavior.
- Produces: same non-platform-specific functionality without SDK/env/header/URL assumptions tied to the removed platform.

For each hit:

- [ ] **Step 1: Fetch complete file and nearby configuration**

Classify the occurrence as runtime-required, dead compatibility code, generated metadata, analytics/URL text, or comment/documentation.

- [ ] **Step 2: Remove provider-only environment variables and headers**

Delete branches that depend exclusively on platform environment variables such as the `VERCEL_*` namespace. Prefer already-supported generic environment inputs such as `BASE_URL`, `APP_URL`, forwarded host/proto, or relative URLs only when the repository already defines them.

- [ ] **Step 3: Remove provider SDK imports/packages**

If an `@vercel/*` dependency is used only by the platform integration, remove its imports and package entry/lockfile resolution using the repository's package manager. If the package provides business logic unrelated to hosting, replace it with the existing provider-neutral abstraction or native platform APIs supported by the project.

- [ ] **Step 4: Preserve security behavior**

Do not weaken auth, rate limiting, request validation, or trusted-origin checks merely to remove a provider-specific signal. Replace the signal only with a repository-supported generic equivalent; otherwise fail closed.

- [ ] **Step 5: Run repository-native typecheck/tests/build**

Use scripts from that repository's `package.json`, Python config, Makefile, or workflow. Do not invent a command that is not present.

- [ ] **Step 6: Commit**

Commit message:

```text
refactor: remove deployment-platform runtime assumptions
```

---

### Task 4: Remove documentation, generated templates, marketing copy, URLs, and icons

**Files:**
Known current examples include README/CLAUDE/AGENTS/CREATE-A-SITE/DEPLOY/ENV/MUSIC/plan files across `cosmo`, `BeyondMythos.com`, `The-Narrows`, `Autonomous-Store`, `Autonomous-Browser`, `WireandLogic`, `TheTunerDepot.com`, `-Astrokobi.com`, `astrokobi.online`, `astrokobi.site`, `astrokobi.space`, `VibeCoderz`, `slack-agent-template`, `ANCESTOR-SIMULATOR-`, `FullStackAssets`, `Po`, and `LLM-MODEL`, plus `VibeCoderz/components/icons/vercel-dashed.tsx`.

**Interfaces:**
- Consumes: verified current deployment information in each repository.
- Produces: provider-neutral documentation and UI/content.

For each hit:

- [ ] **Step 1: Remove provider badges, URLs, and setup sections**

Delete unsupported provider links and platform-specific instructions. When a repository already documents a verified replacement deployment path, make that path the canonical instruction. Otherwise state only local/build instructions and omit production hosting claims.

- [ ] **Step 2: Remove platform branding from UI/content**

Delete platform logo/icon components and calls to them. Replace sponsor/affiliate mentions only when the repository already has a provider-neutral concept; otherwise remove the item.

- [ ] **Step 3: Clean generated/template guidance**

Remove instructions that cause future generated projects to reintroduce the platform, including agent skill/reference files, template docs, AI tool instructions, and environment examples.

- [ ] **Step 4: Re-run repository search**

Search all seven verification variants on the cleanup branch.

- [ ] **Step 5: Commit**

Commit message:

```text
docs: remove retired deployment-platform references
```

---

### Task 5: Open, verify, and merge each repository cleanup PR

**Files:**
- No new cross-repo source files.

**Interfaces:**
- Consumes: cleanup branches from Tasks 2-4.
- Produces: merged default branches and per-repository audit status.

For every affected repository:

- [ ] **Step 1: Open PR**

Title:

```text
Remove retired deployment platform
```

Body must name deleted/modified files, replacement behavior if any, tests/checks run, and state that no endpoint/DNS/deployment claim was invented.

- [ ] **Step 2: Observe CI**

If the repository has Actions for the PR head, wait for relevant checks to finish.

- [ ] **Step 3: Repair only cleanup-caused failures**

Inspect logs, fix the smallest regression, rerun, and preserve unrelated pre-existing failures as explicit blockers rather than silently changing scope.

- [ ] **Step 4: Merge exact verified head**

Use expected head SHA when the connector supports it.

- [ ] **Step 5: Re-scan merged default branch**

Require zero hits for the seven verification variants in that repository.

- [ ] **Step 6: Update audit record**

Set `status` to `CLEAN` and record merged commit/check status.

---

### Task 6: Resolve archived and unindexed repository edge cases

**Files:**
- Update: `docs/platform-removal-audit.json`

**Interfaces:**
- Consumes: archived/unindexed entries from Task 1.
- Produces: explicit clean or blocked status for every repository.

- [ ] **Step 1: Attempt normal cleanup for archived repositories with hits**

If GitHub rejects writes because the repository is archived, record `BLOCKED_ARCHIVED` with exact affected paths. Do not unarchive repositories without explicit user instruction.

- [ ] **Step 2: Inspect unindexed trees recursively**

Current unindexed examples include `Slingo-Retro`, `concord`, `ForgeCleanAI`, `explorer`, `4dworldbench_code`, `VisualScore`, and `Q-Adapt`. Fetch recursive trees and inspect platform-named paths plus likely text/config files.

- [ ] **Step 3: Clean any found occurrences using Contents API**

When writable, apply the same branch/PR/verification rules.

- [ ] **Step 4: Record connector limitations**

If repository metadata contains the platform but no metadata-update tool is available, record `METADATA_TOOL_BLOCKER`; do not pretend it was changed.

---

### Task 7: Organization-wide zero-hit gate

**Files:**
- Update: `docs/platform-removal-audit.json`
- Create: `docs/PLATFORM_REMOVAL_COMPLETE.md`

**Interfaces:**
- Consumes: all merged repository cleanup results.
- Produces: organization-wide verification receipt.

- [ ] **Step 1: Re-run all organization-wide searches**

Require zero current default-branch results for:

```text
vercel
vercel.app
vercel.com
@vercel
VERCEL_
vercel.json
.vercelignore
```

- [ ] **Step 2: Reconcile repository count**

Every repository from Task 1 must be `CLEAN`, `NO_HITS`, or an explicitly documented immutable/external blocker. No repository can be omitted.

- [ ] **Step 3: Write completion receipt**

`docs/PLATFORM_REMOVAL_COMPLETE.md` records date, repository count, affected repository count, merged PR/commit list, search variants, unindexed-tree checks, and any immutable metadata/archive blockers.

- [ ] **Step 4: Merge the central audit branch**

Open/verify/merge `codex/remove-vercel-orgwide` into `Full-Stack-Assets/Full-Stack-Assets` after the organization scan is clean.

- [ ] **Step 5: Unlock Worldline v2.0**

Only after this gate passes, begin the separate v2.0 spec/plan/release train in `Full-Stack-Assets/WorldGen`.
