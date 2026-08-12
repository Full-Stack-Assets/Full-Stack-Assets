# Authentication and Session Protocol

1. Connect using Contra's official hosted MCP/OAuth flow exposed by the current host or Contra setup instructions.
2. Never ask the user to paste a Contra password, session cookie, OAuth token, 2FA seed, backup code, card/bank credential, or identity document into chat or source files.
3. After OAuth, discover account/profile identity through the official Contra MCP read tools.
4. Bind the observed stable account ID (preferred) or handle to the expected user identity. If the expected identity is unavailable, treat writes as blocked until the user establishes it through a trusted read or the host connection UI.
5. Run a read-only smoke check before the first mutation: list profile/work or equivalent current capability.
6. Discover tool metadata/capabilities at runtime; do not assume historical tool names still exist.
7. For a write, use Contra's native preparation/confirmation flow whenever exposed. Never self-confirm or replay expired confirmation artifacts.
8. If OAuth expires or identity changes, stop writes and re-authenticate through the official flow.

The policy sidecar stores only non-secret mode/identity expectations. Token refresh and credential custody belong to Contra/the MCP host.
