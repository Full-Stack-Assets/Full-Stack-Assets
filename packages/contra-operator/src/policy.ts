export type AuthorityClass =
  | "READ"
  | "DRAFT"
  | "PUBLISH"
  | "COMMUNICATION"
  | "HIRING"
  | "FINANCIAL"
  | "DESTRUCTIVE";

export type AutonomyMode = "tiered" | "maximum";
export type OperationDecision = "PROCEED" | "PREPARE_ONLY" | "CONFIRM" | "BLOCK";

export interface ToolDescriptor {
  name: string;
  description?: string;
  readOnlyHint?: boolean;
  mutationHint?: boolean;
}

export interface OperationDecisionResult {
  decision: OperationDecision;
  reason: string;
}

const READ_RE = /\b(get|list|search|find|fetch|read|view|inspect|lookup|status|preview)\b/i;
const DRAFT_RE = /\b(draft|prepare|upload|attach|stage|import)\b/i;
const FINANCIAL_RE = /\b(pay|payment|payout|invoice|billing|refund|charge|withdraw|bank|financial)\b/i;
const HIRING_RE = /\b(hire|hiring|candidate|talent|contractor|engagement|offer)\b/i;
const COMM_RE = /\b(send|message|reply|proposal|invite|outreach|communicat)\b/i;
const PUBLISH_RE = /\b(publish|post|launch|submit|make public|update profile|edit profile)\b/i;
const DESTRUCTIVE_RE = /\b(delete|remove|destroy|terminate|revoke|close account|cancel contract|archive permanently)\b/i;

export function classifyContraTool(tool: ToolDescriptor): AuthorityClass {
  const haystack = `${tool.name} ${tool.description ?? ""}`;
  if (tool.readOnlyHint === true) return "READ";
  if (DESTRUCTIVE_RE.test(haystack)) return "DESTRUCTIVE";
  if (FINANCIAL_RE.test(haystack)) return "FINANCIAL";
  if (HIRING_RE.test(haystack)) return "HIRING";
  if (COMM_RE.test(haystack)) return "COMMUNICATION";
  if (PUBLISH_RE.test(haystack)) return "PUBLISH";
  if (DRAFT_RE.test(haystack)) return "DRAFT";
  if (READ_RE.test(haystack) && tool.mutationHint !== true && tool.readOnlyHint !== false) return "READ";
  return "DESTRUCTIVE";
}

export function decideOperation(
  mode: AutonomyMode,
  authorityClass: AuthorityClass,
  nativeConfirmationRequired: boolean,
): OperationDecisionResult {
  if (nativeConfirmationRequired) {
    return { decision: "CONFIRM", reason: "Contra-native confirmation is mandatory and cannot be bypassed." };
  }
  if (authorityClass === "READ") {
    return { decision: "PROCEED", reason: "Read-only operation." };
  }
  if (authorityClass === "DRAFT") {
    return { decision: "PROCEED", reason: "Reversible preparation is allowed automatically." };
  }
  if (mode === "tiered") {
    return { decision: "CONFIRM", reason: `${authorityClass} actions require explicit approval in tiered mode.` };
  }
  if (authorityClass === "DESTRUCTIVE") {
    return { decision: "CONFIRM", reason: "Destructive operations retain an explicit approval gate in maximum mode." };
  }
  return { decision: "PROCEED", reason: `Maximum mode permits ${authorityClass} execution when Contra itself requires no confirmation.` };
}
