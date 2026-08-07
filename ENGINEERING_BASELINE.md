# Full-Stack-Assets Engineering Baseline

## Repository maturity tiers

| Tier | Meaning | Minimum controls |
|---|---|---|
| 0 — Experiment | Disposable exploration | README, no production secrets, clearly non-production |
| 1 — Prototype | Working demonstration | Reproducible setup, `.env.example`, basic tests, dependency lockfile |
| 2 — Release candidate | Intended to ship | Protected production branch, required CI, security scan, preview deploy, release checklist |
| 3 — Production | Public or customer-facing | Tier 2 plus monitoring, health check, rollback, backup plan, owner, incident runbook |
| 4 — Revenue-critical | Material revenue or contractual use | Tier 3 plus SLOs, recovery testing, access review, cost monitoring, release approval |
| Archived | No active development | Archived repository, final README notice, secrets revoked, deployment removed or redirected |

## Required repository files for Tier 2+

- `README.md`
- `SECURITY.md`
- `CODEOWNERS`
- `.env.example`
- dependency lockfile
- CI workflow
- release gates or checklist
- deployment and rollback documentation
- health-check procedure
- ownership and maturity metadata

## Production branch policy

- Use `main` as the stable production branch unless the repository documents another convention.
- Require pull requests and relevant status checks.
- Disallow force pushes and branch deletion.
- Bots must not push generated content directly to production.
- Security-sensitive workflow and runtime files require owner review.

## Automated content policy

- Treat generated content as untrusted input.
- Generate without production deployment credentials.
- Validate schema and syntax with deterministic tooling.
- Compile or build the complete affected product.
- Push successful candidates to an isolated branch.
- Promote only through a pull request.
- Failed generation or validation must leave production unchanged.

## AI-provider migration policy

Before production promotion:

1. Test the exact provider, model, account, and production runtime.
2. Validate successful structured output for each affected route.
3. Exercise 401, 429, timeout, 5xx, invalid-output, and truncated-output paths.
4. Record request, token, cost, and latency telemetry.
5. Retain a rollback path until post-deployment smoke tests pass.
6. Revoke the old credential only after the new path is verified.

## Safe remote-fetch policy

Any feature that fetches user-controlled or externally sourced URLs must:

- allow only intended protocols;
- reject credentials and unsafe ports;
- parse and canonicalize the hostname;
- block private, loopback, link-local, unspecified, multicast, reserved, and CGNAT addresses;
- resolve DNS and reject the request if any returned address is unsafe;
- connect only to a validated address;
- revalidate every redirect;
- cap redirects, response bytes, connection time, and total time;
- avoid inheriting untrusted proxy settings;
- maintain regression tests for encoded and mapped address forms.

## Dependency policy

- Group patch and minor updates separately from major toolchain migrations.
- Upgrade one compiler, bundler, linter, parser, or API-client major version at a time.
- Require tests, build, preview, and migration notes for major upgrades.
- Never auto-merge major updates to security-sensitive parsers or infrastructure clients.
