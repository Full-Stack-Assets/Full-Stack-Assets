---
name: contra-operator
description: Use when authenticating to Contra, publishing or editing portfolio work, managing services or products, sending proposals or messages, handling invoices or payments, searching talent, hiring, or performing other Contra account actions.
---

# Contra Operator

Use Contra's **official MCP/OAuth integration as the sole Contra authority**. This skill is a policy layer, not a login bypass.

## Core rules

- Default autonomy is `tiered`; `maximum` is opt-in only.
- Never request, store, reuse, or commit Contra passwords, cookies, raw OAuth bearer/refresh tokens, 2FA seeds, backup codes, payment credentials, or identity documents.
- Never bypass Contra-native prepare/confirm, OAuth, 2FA, identity, moderation, payment, or expiry gates. Maximum mode still preserves them.
- Verify the active Contra account before any write. Identity mismatch or unavailable stable identity fails closed for writes.
- Discover current Contra MCP tools at runtime. Unknown mutation-capable tools are `DESTRUCTIVE` and require explicit approval.
- Do not guess Contra profile/project slugs or URLs. Read the created resource back and use the returned canonical URL.
- Public portfolio claims must be evidence-classified. No fake KPIs, revenue, customers, integrations, deployments, or URLs.
- Generated promotional visuals must be labeled as concept/demo visuals and never presented as live screenshots.

## Authority classes

`READ`, `DRAFT`, `PUBLISH`, `COMMUNICATION`, `HIRING`, `FINANCIAL`, `DESTRUCTIVE`.

In `tiered`, reads and reversible preparation may proceed; publishing, communication, hiring, money, and destructive actions require approval. In `maximum`, preparation and non-destructive execution may proceed when permitted, but Contra-native confirmation and destructive-action approval remain binding.

Read the relevant reference before acting:
- Authentication/session: `references/authentication.md`
- Portfolio/services/products: `references/portfolio-publishing.md`
- Messaging/proposals/hiring/money: `references/hiring-and-money.md`
