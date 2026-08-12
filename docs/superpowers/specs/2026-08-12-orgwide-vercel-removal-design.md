# Organization-wide deployment-platform removal design

Date: 2026-08-12
Owner scope: all repositories accessible under `Full-Stack-Assets`

## Goal

Remove every current repository-level mention, configuration, code path, workflow, URL, badge, environment assumption, dependency, and deployment instruction tied to the deployment platform requested for removal, while preserving each project's working provider-neutral or currently-supported deployment path wherever that can be derived from the repository.

The cleanup is repository-wide, not README-only. Archived repositories are included. Repositories whose GitHub code-search index is unavailable are inspected through their trees/content endpoints instead of being silently skipped.

## Non-goals

- Rewrite Git history. Historical commits, closed PRs, release notes, and issue discussions remain immutable historical records.
- Remove unrelated hosting providers or functional infrastructure.
- Invent replacement endpoints, credentials, DNS state, or deployment-success claims.
- Force a single hosting vendor across all projects.
- Change secrets, DNS, billing, or external provider accounts.

## Scope model

For every accessible repository, scan current default-branch state for these classes:

1. **Platform-specific files**: deployment config files, ignore files, adapters, helper scripts, icons, docs, and workflows whose filenames or contents name the removed platform.
2. **Runtime dependencies**: SDK imports/packages, platform-only request helpers, environment variables, headers, platform metadata, platform URL construction, and serverless assumptions.
3. **CI/CD**: Actions workflows, scripts, badges, deployment commands, preview references, environment names, status text, and release instructions.
4. **Documentation/content**: README, CLAUDE/AGENTS guidance, setup guides, case studies, marketing copy, generated templates, examples, and comments.
5. **URLs and metadata**: `*.vercel.app`-style URLs, provider dashboards/docs, repository homepage/description fields where accessible through the connector, and generated links embedded in source.
6. **Dead integration surfaces**: deployment adapters or fallback branches that are no longer supported by the repository and become unused after the cleanup.

Search is case-insensitive in intent. Specific variants such as `vercel`, `@vercel`, platform environment prefixes, platform domains, and platform config filenames are used to reduce false negatives from global search-result limits.

## Cleanup strategy

### Repository isolation

Each affected repository gets a dedicated branch named `codex/remove-vercel`. Changes stay local to that repository until reviewed by available CI/build checks. No cross-repository branch depends on another repository's state.

### File handling

- Delete a platform-only file when it has no provider-neutral purpose.
- Rename by replacement rather than preserving the platform name in a new filename. Because the GitHub contents API has no rename primitive, create the provider-neutral replacement first when needed, update references, then delete the old path.
- For mixed-purpose files, remove only the platform-specific branch/config and preserve unrelated behavior.
- Replace platform URLs with verified canonical/custom-domain/GitHub Pages/other currently-supported URLs only when the repository itself supplies that replacement. Otherwise remove the unsupported URL and state that deployment is not configured rather than inventing one.
- Remove platform-specific environment variables and packages only after checking references in the repository.

### CI and merge behavior

For each affected repository:

1. inspect existing package/build/test configuration and recent workflow patterns;
2. create cleanup branch;
3. make the smallest coherent cleanup;
4. open PR with a file-level summary and evidence boundary;
5. run/observe available GitHub Actions checks where present;
6. repair cleanup-caused failures without unrelated refactors;
7. merge only a verified/mergeable head, or record an external blocker when no safe repository-side resolution exists;
8. re-scan the merged default branch for the removed term and variants.

Repositories with no CI still require a post-change code search and structural inspection. Archived repositories are changed only when writes are accepted by GitHub; an archive-state write blocker is reported explicitly rather than bypassed.

## Verification gate

The organization-wide cleanup is complete only when:

- a fresh org-level search for `vercel` returns zero current default-branch code results across searchable repositories;
- specific follow-up searches for `vercel.app`, `vercel.com`, `@vercel`, `VERCEL_`, `vercel.json`, and `.vercelignore` return zero current default-branch results;
- every repository with `is_code_search_indexed=false` has its tree inspected for platform-named paths and relevant text/config locations;
- affected repositories' available CI/build checks pass, or any repository with an unavoidable external blocker is explicitly listed and still contains no platform mention;
- repository metadata returned by the GitHub connector contains no platform URL/name where repository metadata mutation is supported; unsupported metadata mutations are reported separately;
- no replacement endpoint, deployment, credential, or DNS claim is invented.

## Failure handling

A cleanup-caused typecheck/test/build failure blocks merge for that repository. Diagnose from logs, fix the minimum regression, and rerun. If a platform integration was the only deployment path, remove it and leave the project deployment-neutral unless another verified path exists in repository evidence.

## Audit output

Maintain a final reconciliation table with:

- repository;
- pre-cleanup hit count / hit classes;
- files deleted;
- files modified/replaced;
- CI/build status;
- merged commit;
- post-cleanup search status;
- any connector limitation or external deployment follow-up.

## Sequencing with Worldline v2.0

This cleanup is a hard prerequisite for the Worldline v2.0 release train. Worldline development begins only after the organization-wide current-state search gate is clean, ensuring v2.0 does not inherit or reintroduce the removed platform.
