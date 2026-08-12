export type EvidenceClass =
  | "VERIFIED_RUNTIME"
  | "VERIFIED_REPOSITORY"
  | "VERIFIED_DOCUMENT"
  | "SYNTHETIC_DEMO"
  | "UNVERIFIED";

export type ClaimKind = "metric" | "url" | "integration" | "customer" | "result" | "screenshot" | "text";

export interface Claim {
  text: string;
  kind: ClaimKind;
  evidence: EvidenceClass;
  sourceRef?: string;
  demoLabel?: boolean;
}

export interface EvidenceViolation {
  claim: Claim;
  reason: string;
}

export interface EvidenceCheckResult {
  allowed: boolean;
  violations: EvidenceViolation[];
}

export function checkPublicClaims(claims: Claim[]): EvidenceCheckResult {
  const violations: EvidenceViolation[] = [];
  for (const claim of claims) {
    if (claim.evidence === "UNVERIFIED") {
      violations.push({ claim, reason: "Public claims require evidence; unverified claims are not admissible." });
      continue;
    }
    if (claim.evidence === "SYNTHETIC_DEMO" && claim.demoLabel !== true) {
      violations.push({ claim, reason: "Synthetic demo content must be visibly labeled as demo/synthetic." });
      continue;
    }
  }
  return { allowed: violations.length === 0, violations };
}
