# Contra Operator Design

## Purpose

Build a reusable Contra integration layer that lets future agent runtimes operate the full Contra surface through Contra's official MCP server while preserving platform confirmations, account security, evidence integrity, and a user-controlled autonomy policy.

The implementation is intentionally a **thin control plane**, not a replacement Contra client. Contra remains the authentication and action authority. The control plane discovers tools dynamically, classifies actions before execution, applies local evidence/policy checks, and exposes a reusable agent skill for consistent operation across projects.

## Scope

The integration supports both sides of Contra:

- Independent/freelancer workflows: profile/work/portfolio, services, digital products, client onboarding, proposals, messages, projects, invoices, payment links, portfolio imports, and related history.
- Client/hiring workflows: talent search, jobs/briefs, candidate review, inquiries, proposals, projects, invoices, payments, and related history.
- Shared workflows: conversations, account identity, capability discovery, transaction/project history, and confirmation handling.

The integration MUST NOT bypass Contra-native confirmation, authentication, 2FA, identity, payment, review, or moderation gates.

## External authority and transport

Contra's official MCP is the sole Contra write authority. The control plane connects as an MCP client using a configurable remote MCP URL and OAuth-compatible authentication supplied by the host runtime or MCP SDK.

Transport requirements:

- Prefer Streamable HTTP for hosted Contra MCP connections.
- Discover tools at runtime; never hardcode a permanent 60+ tool list.
- Honor server-provided instructions and tool schemas.
- Treat authorization failure, re-authentication, 2FA, and prepare/confirm responses as normal control-flow states, not errors to bypass.
- Never scrape private Contra pages, copy browser cookies, or automate around platform controls when the official MCP can perform the requested operation.

## Authentication protocol

### AUTH-0: No-secret bootstrap

The repository contains only configuration names and documentation. It never stores Contra passwords, OAuth bearer tokens, refresh tokens, session cookies, 2FA seeds, backup codes, payment credentials, or identity documents.

Configuration keys:

- `CONTRA_MCP_URL` — official Contra MCP endpoint configured by the host/client.
- `CONTRA_AUTONOMY_MODE` — `tiered` by default; optional `maximum`.
- `CONTRA_EXPECTED_ACCOUNT_ID` — optional expected stable account identifier, when Contra exposes one.
- `CONTRA_EXPECTED_PROFILE_HANDLE` — optional expected public profile handle, when available.

### AUTH-1: OAuth/native host authorization

The user authorizes Contra through the official MCP OAuth/authentication flow supported by the host or MCP SDK. The control plane never asks the user to paste a raw password, cookie, OAuth token, 2FA secret, or backup code into chat or source files.

### AUTH-2: Identity binding

Immediately after connecting, the operator performs a read-only identity/profile query if the discovered toolset exposes one. If an expected account ID or handle is configured and does not match, all writes are blocked with `ACCOUNT_IDENTITY_MISMATCH`.

If the server does not expose a stable identity tool, the operator records `identityStatus: unverified` and allows only read operations until the host/user resolves the account identity.

### AUTH-3: Capability discovery

The operator fetches the current tool list and server instructions. Capabilities are categorized dynamically into read, draft/prepare, publish/send, hiring, financial, and destructive classes based on tool annotations, name, description, and explicit local overrides.

Unknown write-capable tools default to the highest safe authority class and require explicit confirmation.

### AUTH-4: Read-only smoke test

The operator executes one harmless read such as profile, portfolio, project-history, or talent search. Successful completion proves connectivity only; it does not prove write authority.

### AUTH-5: Write-preparation smoke test

When the user's first real write request arrives, the operator calls Contra's prepare/draft step and returns the resulting preview. It does not self-confirm.

### AUTH-6: Native confirmation

Contra's explicit confirm step remains authoritative. Draft expiry, 2FA, payment verification, identity checks, moderation, or other Contra requirements are surfaced to the user/host exactly as required by Contra.

## Autonomy policy

Two modes exist.

### `tiered` — default

Automatic without an additional operator-level confirmation:

- searches and reads;
- capability discovery;
- evidence collection;
- creating local drafts;
- assembling portfolio copy and assets;
- preparing Contra writes when Contra itself has not yet executed anything;
- reversible local transformations.

Operator-level confirmation required before initiating the Contra confirmation step for:

- publishing or materially editing public profile/work/product/service content;
- sending messages, inquiries, proposals, project briefs, review requests, or client invitations;
- posting jobs;
- hiring, accepting proposals, committing project terms, or changing contractual scope;
- invoices, payment links, purchases, payments, refunds, payouts, or other financial actions;
- cancellation, deletion, archival, or destructive account/project changes;
- sensitive account/security changes.

Contra's native confirmation remains required wherever the platform requires it.

### `maximum` — opt-in future mode

`maximum` lets the operator automatically research, assemble, prepare, and sequence all available operations without repeatedly asking routine questions. It MAY automatically proceed to Contra's prepare stage for consequential actions. It MUST NOT bypass or impersonate the user's explicit Contra confirmation, 2FA, identity verification, payment verification, or any server-enforced confirmation requirement.

Changing from `tiered` to `maximum` is itself a consequential local policy change and requires an explicit user instruction in the current session. A stored config may preserve that preference for future runtimes, but never silently escalates authority if the configured value is invalid or missing.

## Authority classes

Every discovered tool maps to one of these classes:

1. `READ` — retrieval/search/listing/status.
2. `DRAFT` — local composition or Contra prepare-only operations that execute no external side effect.
3. `PUBLISH` — public profile/work/service/product changes.
4. `COMMUNICATION` — messages, inquiries, proposals, invitations, briefs, review requests.
5. `HIRING` — jobs, hiring decisions, project acceptance, contractual commitments.
6. `FINANCIAL` — invoices, payment links, purchases, payments, refunds, payouts, financial terms.
7. `DESTRUCTIVE` — delete/cancel/remove/close/revoke/security-sensitive changes.

Precedence: `DESTRUCTIVE > FINANCIAL > HIRING > COMMUNICATION > PUBLISH > DRAFT > READ`.

An unrecognized tool that appears capable of mutation maps to `DESTRUCTIVE` until explicitly classified.

## Evidence integrity policy

The operator must not fabricate or infer portfolio facts merely to make a Work post look stronger.

Every substantive claim is classified as one of:

- `VERIFIED_RUNTIME` — observed from an accessible live runtime or authenticated API/MCP result.
- `VERIFIED_REPOSITORY` — supported by repository source/tests/release evidence.
- `VERIFIED_DOCUMENT` — supported by a user-owned source document/artifact.
- `SYNTHETIC_DEMO` — intentionally illustrative/demo data and explicitly labeled.
- `UNVERIFIED` — not allowed in a public factual claim until verified.

Rules:

- Revenue, users, customers, conversion, savings, subscriber counts, deal counts, closed work, integrations, deployments, ratings, and public URLs require direct evidence.
- Generated promotional images must not be described as live screenshots.
- Demo values must be labeled synthetic/illustrative.
- URLs are published only after direct verification or an authoritative repository/config source plus a successful reachability check.
- Contra URLs are read back from Contra after publication; slugs are never guessed.

## Portfolio publishing workflow

For a Work/case-study request:

1. Identify the project and gather repository, runtime, document, and existing-public-site evidence.
2. Build an evidence manifest with each proposed factual claim and its source class.
3. Reject or rewrite unsupported claims.
4. Prefer a real product screenshot. If unavailable, use a branded reconstruction or concept visual explicitly labeled as such.
5. Remove invented URLs or KPI telemetry from promotional imagery.
6. If a public case-study/project URL exists, evaluate Contra's import-existing-work path; otherwise assemble a native Work draft.
7. Discover the current Contra Work/portfolio tools and prepare the draft through official MCP.
8. In `tiered` mode, show the prepared preview before native confirmation.
9. Confirm through Contra's required flow only after the user's approval.
10. Read the published Work item back from Contra and record the canonical Contra URL/ID.

## Hiring and client workflow

For hiring/search requests:

1. Search through Contra's official tools using the user's stated role, skills, location, budget, availability, and other constraints.
2. Reads/searches are automatic.
3. Draft outreach, job posts, inquiries, briefs, and proposals may be prepared automatically.
4. Sending, hiring, accepting contractual terms, paying, cancelling, or otherwise committing the user follows the authority policy and Contra's native confirmation.
5. Never send generic bulk outreach that violates Contra's quality or anti-spam controls.

## Plugin architecture

The bootstrap package will live under `packages/contra-operator/` until it can be moved unchanged into `Full-Stack-Assets/contra-operator`.

Components:

- `src/policy.ts` — authority classes, autonomy modes, deterministic tool classification, and confirmation decision logic.
- `src/evidence.ts` — evidence types and claim admissibility rules.
- `src/session.ts` — connection/session state model: disconnected, authenticated, identity-bound/unverified, capabilities-discovered.
- `src/contra-client.ts` — thin interface around an injected MCP client; no secrets or browser automation.
- `src/server.ts` — local stdio MCP sidecar exposing safe meta-tools such as status, classify, evidence-check, and prepared-operation policy decisions. It does not reimplement Contra business tools.
- `src/index.ts` — exports.
- `tests/*.test.ts` — TDD coverage for authority classification, escalation blocking, identity mismatch, evidence rejection, and autonomy modes.
- `.agents/skills/contra-operator/SKILL.md` — cross-runtime reusable agent operating skill.
- `.env.example` — non-secret configuration names only.
- `README.md` — setup, security model, host configuration, and migration instructions.

## Sidecar tool surface

The sidecar exposes local policy tools only:

- `contra_operator_status` — returns configured mode and session/policy status without credentials.
- `contra_classify_tool` — classifies a discovered Contra tool and explains the authority class.
- `contra_check_claims` — validates a set of portfolio claims against supplied evidence classifications.
- `contra_can_proceed` — returns whether a proposed operation can proceed automatically, can prepare only, or requires user/native confirmation.

The sidecar does not expose raw tokens and does not proxy payments or confirmations itself.

## Error handling

- `AUTH_REQUIRED` — host must complete official Contra OAuth/authentication.
- `ACCOUNT_IDENTITY_MISMATCH` — block all writes.
- `IDENTITY_UNVERIFIED` — read-only until resolved.
- `CAPABILITY_UNAVAILABLE` — current Contra MCP lacks the requested capability; do not simulate success.
- `PREPARE_EXPIRED` — prepare again; never reuse stale confirmation material.
- `NATIVE_CONFIRMATION_REQUIRED` — surface Contra confirmation request.
- `TWO_FACTOR_REQUIRED` — user completes Contra's 2FA checkpoint outside the skill/plugin's secret storage.
- `UNVERIFIED_PUBLIC_CLAIM` — remove/rewrite claim or supply evidence.
- `URL_UNVERIFIED` — omit URL until verified.

## Testing and acceptance

The implementation is accepted only when automated tests prove:

1. Reads are allowed automatically in `tiered` mode.
2. Draft/prepare operations can proceed to prepare without implying execution.
3. Publish/communication/hiring/financial/destructive actions require the correct confirmation behavior.
4. `maximum` increases preparation autonomy but never marks native confirmation as bypassable.
5. Unknown mutation-capable tools fail closed.
6. Account identity mismatch blocks writes.
7. Unsupported revenue/customer/metric/URL claims fail evidence checks.
8. `SYNTHETIC_DEMO` claims are allowed only when the output carries a demo label.
9. No secret values are present in committed examples or fixtures.
10. The skill directs future agents to official MCP/OAuth and prohibits cookies/password/token copying.

## Migration target

When GitHub repository creation is available, move `packages/contra-operator/` and `.agents/skills/contra-operator/` into the root of a new `Full-Stack-Assets/contra-operator` repository, preserving history where practical. The package must not depend on paths outside its directory so this move is mechanical.
