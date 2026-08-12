# Contra Operator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portable Contra policy sidecar plus reusable agent skill that uses Contra's official MCP/OAuth authority, defaults to tiered autonomy, supports future maximum mode, and prevents fabricated portfolio claims or confirmation bypass.

**Architecture:** A small TypeScript package provides deterministic policy, evidence, identity/session, and injected-MCP-client boundaries. A local stdio MCP server exposes only policy/meta-tools; it never stores credentials or reimplements Contra writes. A cross-runtime `.agents` skill teaches future agents how to discover and use Contra's official MCP safely.

**Tech Stack:** Node.js >=20, TypeScript, Vitest, Zod v4, official `@modelcontextprotocol/server` and `@modelcontextprotocol/client` packages.

## Global Constraints

- Contra's official MCP remains the sole Contra write authority.
- Never store passwords, OAuth bearer/refresh tokens, cookies, 2FA seeds, backup codes, payment credentials, or identity documents.
- `tiered` is the default autonomy mode; `maximum` is opt-in only.
- Maximum mode may automate preparation but may never bypass Contra-native confirmation, OAuth, 2FA, identity, payment, moderation, or expiry gates.
- Unknown mutation-capable tools fail closed as `DESTRUCTIVE`.
- Public portfolio claims must be evidence-classified; unsupported metrics/URLs are rejected.
- Generated promotional visuals must not be represented as live screenshots.
- Package paths must remain self-contained so migration to `Full-Stack-Assets/contra-operator` is mechanical.

---

### Task 1: Package foundation and policy engine

**Files:**
- Create: `packages/contra-operator/package.json`
- Create: `packages/contra-operator/tsconfig.json`
- Create: `packages/contra-operator/src/policy.ts`
- Create: `packages/contra-operator/tests/policy.test.ts`

**Interfaces:**
- Produces: `AuthorityClass`, `AutonomyMode`, `ToolDescriptor`, `classifyContraTool(tool)`, `decideOperation(mode, authorityClass, nativeConfirmationRequired)`.

- [ ] **Step 1: Write failing policy tests**

```ts
import { describe, expect, it } from "vitest";
import { classifyContraTool, decideOperation } from "../src/policy.js";

describe("Contra policy", () => {
  it("allows reads automatically in tiered mode", () => {
    expect(decideOperation("tiered", "READ", false).decision).toBe("PROCEED");
  });

  it("requires confirmation for financial actions", () => {
    expect(decideOperation("tiered", "FINANCIAL", true).decision).toBe("CONFIRM");
  });

  it("never bypasses native confirmation in maximum mode", () => {
    expect(decideOperation("maximum", "FINANCIAL", true).decision).toBe("CONFIRM");
  });

  it("fails closed for unknown mutation tools", () => {
    expect(classifyContraTool({ name: "mystery", description: "changes an account", readOnlyHint: false })).toBe("DESTRUCTIVE");
  });
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- tests/policy.test.ts`
Expected: FAIL because `src/policy.ts` does not exist.

- [ ] **Step 3: Implement minimal deterministic policy**

Implement the precedence table and return decisions `PROCEED | PREPARE_ONLY | CONFIRM | BLOCK` with a human-readable reason.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/policy.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/contra-operator/package.json packages/contra-operator/tsconfig.json packages/contra-operator/src/policy.ts packages/contra-operator/tests/policy.test.ts
git commit -m "feat: add Contra autonomy policy engine"
```

### Task 2: Evidence integrity engine

**Files:**
- Create: `packages/contra-operator/src/evidence.ts`
- Create: `packages/contra-operator/tests/evidence.test.ts`

**Interfaces:**
- Produces: `EvidenceClass`, `Claim`, `EvidenceCheckResult`, `checkPublicClaims(claims)`.

- [ ] **Step 1: Write failing evidence tests**

```ts
import { describe, expect, it } from "vitest";
import { checkPublicClaims } from "../src/evidence.js";

describe("public claim evidence", () => {
  it("rejects unverified revenue and URLs", () => {
    const result = checkPublicClaims([
      { text: "$48,293 revenue", kind: "metric", evidence: "UNVERIFIED" },
      { text: "https://example.invalid", kind: "url", evidence: "UNVERIFIED" }
    ]);
    expect(result.allowed).toBe(false);
    expect(result.violations).toHaveLength(2);
  });

  it("permits synthetic demo values only with a demo label", () => {
    expect(checkPublicClaims([{ text: "$10k", kind: "metric", evidence: "SYNTHETIC_DEMO", demoLabel: false }]).allowed).toBe(false);
    expect(checkPublicClaims([{ text: "$10k", kind: "metric", evidence: "SYNTHETIC_DEMO", demoLabel: true }]).allowed).toBe(true);
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- tests/evidence.test.ts`
Expected: FAIL because `src/evidence.ts` does not exist.

- [ ] **Step 3: Implement claim admissibility**

Implement evidence classes `VERIFIED_RUNTIME`, `VERIFIED_REPOSITORY`, `VERIFIED_DOCUMENT`, `SYNTHETIC_DEMO`, `UNVERIFIED`; reject unverified public facts and unlabeled synthetic demo claims.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/evidence.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/contra-operator/src/evidence.ts packages/contra-operator/tests/evidence.test.ts
git commit -m "feat: enforce Contra portfolio evidence integrity"
```

### Task 3: Session identity and injected Contra client boundary

**Files:**
- Create: `packages/contra-operator/src/session.ts`
- Create: `packages/contra-operator/src/contra-client.ts`
- Create: `packages/contra-operator/tests/session.test.ts`

**Interfaces:**
- Produces: `SessionState`, `bindIdentity(observed, expected)`, `ContraMcpPort` with `listTools`, `callTool`, and optional `getInstructions`.

- [ ] **Step 1: Write failing session tests**

```ts
import { describe, expect, it } from "vitest";
import { bindIdentity } from "../src/session.js";

it("blocks writes on identity mismatch", () => {
  const state = bindIdentity({ accountId: "actual", handle: "nic" }, { accountId: "expected" });
  expect(state.identityStatus).toBe("mismatch");
  expect(state.writeBlocked).toBe(true);
});

it("keeps identity unverified when no stable identity is observable", () => {
  const state = bindIdentity({}, {});
  expect(state.identityStatus).toBe("unverified");
  expect(state.writeBlocked).toBe(true);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- tests/session.test.ts`
Expected: FAIL because `src/session.ts` does not exist.

- [ ] **Step 3: Implement identity/session model and client interface**

Do not create token storage. `ContraMcpPort` is injected by the host adapter and contains no credential fields.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/session.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/contra-operator/src/session.ts packages/contra-operator/src/contra-client.ts packages/contra-operator/tests/session.test.ts
git commit -m "feat: add Contra identity binding boundary"
```

### Task 4: Local MCP policy sidecar

**Files:**
- Create: `packages/contra-operator/src/server.ts`
- Create: `packages/contra-operator/src/index.ts`
- Create: `packages/contra-operator/tests/server.test.ts`

**Interfaces:**
- Exposes stdio MCP tools: `contra_operator_status`, `contra_classify_tool`, `contra_check_claims`, `contra_can_proceed`.

- [ ] **Step 1: Write failing sidecar tests**

Test the pure handler functions behind each MCP tool rather than the transport itself. Assert that status never returns configured secret values and that `contra_can_proceed` preserves native confirmation.

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- tests/server.test.ts`
Expected: FAIL because `src/server.ts` does not exist.

- [ ] **Step 3: Implement handlers and stdio server**

Use `McpServer` from `@modelcontextprotocol/server` and `StdioServerTransport` from `@modelcontextprotocol/server/stdio`. Register the four local policy tools with Zod v4 schemas.

- [ ] **Step 4: Verify GREEN and build**

Run: `npm test && npm run typecheck && npm run build`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/contra-operator/src/server.ts packages/contra-operator/src/index.ts packages/contra-operator/tests/server.test.ts
git commit -m "feat: expose Contra policy MCP sidecar"
```

### Task 5: Reusable Contra operator skill

**Files:**
- Create: `.agents/skills/contra-operator/SKILL.md`
- Create: `.agents/skills/contra-operator/references/authentication.md`
- Create: `.agents/skills/contra-operator/references/portfolio-publishing.md`
- Create: `.agents/skills/contra-operator/references/hiring-and-money.md`
- Create: `packages/contra-operator/tests/skill-static.test.ts`

**Interfaces:**
- Produces a cross-runtime skill triggered by Contra authentication, portfolio publishing, services/products, proposals, invoices, messaging, talent search, hiring, and payments.

- [ ] **Step 1: Write static pressure tests**

Assert skill text contains: official MCP/OAuth authority; no passwords/cookies/raw tokens; prepare/confirm preservation; tiered default; maximum opt-in; identity mismatch fail-closed; evidence classifications; no guessed Contra slugs; no fake KPI data.

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- tests/skill-static.test.ts`
Expected: FAIL because the skill files do not exist.

- [ ] **Step 3: Write minimal skill and references**

Keep `SKILL.md` concise and discovery-optimized; move detailed auth, publishing, and money/hiring procedures into references.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- tests/skill-static.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/contra-operator packages/contra-operator/tests/skill-static.test.ts
git commit -m "feat: add reusable Contra operator skill"
```

### Task 6: Configuration, documentation, and migration readiness

**Files:**
- Create: `packages/contra-operator/.env.example`
- Create: `packages/contra-operator/README.md`
- Create: `packages/contra-operator/tests/security-static.test.ts`

**Interfaces:**
- Documents host-provided `CONTRA_MCP_URL`, autonomy configuration, OAuth expectations, official confirmation flow, and migration into the future standalone repository.

- [ ] **Step 1: Write security static test**

Scan committed package and skill fixtures for patterns representing passwords, bearer tokens, cookies, 2FA seeds, backup codes, or populated secret values. Assert `.env.example` contains names only.

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- tests/security-static.test.ts`
Expected: FAIL until docs/config exist.

- [ ] **Step 3: Add docs and redacted config template**

README must explicitly state the sidecar is not an authentication bypass, Contra remains the write authority, and repository creation/migration is a mechanical follow-up.

- [ ] **Step 4: Verify complete package**

Run: `npm test && npm run typecheck && npm run build`
Expected: all PASS with no secrets in source.

- [ ] **Step 5: Commit**

```bash
git add packages/contra-operator/.env.example packages/contra-operator/README.md packages/contra-operator/tests/security-static.test.ts
git commit -m "docs: complete Contra operator security and setup"
```

### Task 7: Final verification and draft PR

**Files:**
- Verify all files created above.

**Interfaces:**
- Produces a reviewable bootstrap branch that can later be moved unchanged into `Full-Stack-Assets/contra-operator`.

- [ ] **Step 1: Run full verification**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 2: Verify no unsupported authority claim**

Inspect README and skill for any language implying self-confirmation, cookie reuse, password storage, or direct payment bypass. Expected: none.

- [ ] **Step 3: Verify migration isolation**

Search `packages/contra-operator` for imports reaching outside the package. Expected: none.

- [ ] **Step 4: Open a draft PR**

Create a draft PR from `codex/contra-operator-bootstrap` to `main` titled `Bootstrap Contra operator skill and policy sidecar`, explicitly noting that this is the staging location pending creation of the standalone repository.
