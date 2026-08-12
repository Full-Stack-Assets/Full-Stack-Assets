# Contra Operator

`contra-operator` is a small policy/evidence MCP sidecar plus reusable agent skill for operating Contra through **Contra's official MCP/OAuth authority**.

It is **not** an authentication bypass, credential vault, unofficial Contra API client, or payment automation workaround. It stores no Contra password, OAuth token, cookie, 2FA secret, payment credential, or identity document.

## What it does

- Classifies discovered Contra tools into authority classes.
- Applies `tiered` (default) or future opt-in `maximum` autonomy policy.
- Preserves Contra-native confirmation in every mode.
- Fails writes closed when the active Contra identity cannot be verified.
- Rejects unverified public portfolio claims and unlabeled synthetic/demo metrics.
- Exposes local MCP meta-tools over stdio: `contra_operator_status`, `contra_classify_tool`, `contra_check_claims`, and `contra_can_proceed`.

The sidecar never proxies or executes Contra writes. The host connects separately to Contra's official MCP and injects/uses that authority.

## Authentication protocol

1. Configure Contra's official MCP connection in the host using the OAuth flow and MCP URL provided by Contra/current host UI.
2. Discover the authenticated profile/account through official read tools.
3. Bind it to `CONTRA_EXPECTED_ACCOUNT_ID` or `CONTRA_EXPECTED_HANDLE` before writes.
4. Run a read-only smoke check.
5. Discover current tools dynamically.
6. Prepare actions through Contra's own workflow and preserve any confirmation prompt/expiry.

Do not put OAuth tokens or passwords in `.env`. `.env.example` intentionally contains only non-secret configuration names.

## Build and test

Requires Node.js 20+ and TypeScript available to the build environment.

```bash
npm run typecheck
npm test
npm run build
```

Run the policy sidecar:

```bash
node dist/index.js
```

It speaks MCP-style JSON-RPC over newline-delimited stdio and exposes policy/meta-tools only.

## Autonomy

- `tiered`: automatic reads and reversible draft/preparation work; approval before public communication, publishing, hiring, financial, or destructive actions.
- `maximum`: may execute non-destructive operations automatically when the host and Contra permit them, but **never** bypasses Contra confirmation, OAuth/2FA/identity/payment/moderation gates. Destructive operations retain an explicit approval gate.

Host/system safety rules override either mode.

## Evidence policy

Supported evidence classes are `VERIFIED_RUNTIME`, `VERIFIED_REPOSITORY`, `VERIFIED_DOCUMENT`, `SYNTHETIC_DEMO`, and `UNVERIFIED`. Unverified public claims are rejected. Synthetic/demo content is allowed only when visibly labeled. Generated visuals must not be described as live screenshots.

## Migration

This package is staged in `Full-Stack-Assets/Full-Stack-Assets` only because the current GitHub connector cannot create a new repository. `packages/contra-operator/` and `.agents/skills/contra-operator/` are self-contained and can be moved mechanically to the approved future repository `Full-Stack-Assets/contra-operator` without changing their internal imports.
