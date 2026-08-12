export interface ContraIdentity {
  accountId?: string;
  handle?: string;
}

export interface SessionState {
  identityStatus: "verified" | "mismatch" | "unverified";
  writeBlocked: boolean;
  observed: ContraIdentity;
  expected: ContraIdentity;
  reason: string;
}

export function bindIdentity(observed: ContraIdentity, expected: ContraIdentity): SessionState {
  const hasExpected = Boolean(expected.accountId || expected.handle);
  const hasObserved = Boolean(observed.accountId || observed.handle);
  if (!hasExpected || !hasObserved) {
    return {
      identityStatus: "unverified",
      writeBlocked: true,
      observed,
      expected,
      reason: "A stable expected and observed Contra identity are both required before writes.",
    };
  }

  if (expected.accountId && observed.accountId) {
    const match = expected.accountId === observed.accountId;
    return {
      identityStatus: match ? "verified" : "mismatch",
      writeBlocked: !match,
      observed,
      expected,
      reason: match ? "Contra account ID matches expected identity." : "Contra account ID does not match expected identity.",
    };
  }

  if (expected.handle && observed.handle) {
    const match = expected.handle.toLowerCase() === observed.handle.toLowerCase();
    return {
      identityStatus: match ? "verified" : "mismatch",
      writeBlocked: !match,
      observed,
      expected,
      reason: match ? "Contra handle matches expected identity." : "Contra handle does not match expected identity.",
    };
  }

  return {
    identityStatus: "unverified",
    writeBlocked: true,
    observed,
    expected,
    reason: "The expected and observed identities do not share a stable comparable identifier.",
  };
}
