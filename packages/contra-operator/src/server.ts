import { checkPublicClaims, type Claim } from "./evidence.js";
import { classifyContraTool, decideOperation, type AuthorityClass, type AutonomyMode, type ToolDescriptor } from "./policy.js";
import { bindIdentity, type ContraIdentity } from "./session.js";

export interface OperatorConfig {
  mode: AutonomyMode;
  expectedIdentity?: ContraIdentity;
  observedIdentity?: ContraIdentity;
}

export function operatorStatus(config: OperatorConfig) {
  const identity = bindIdentity(config.observedIdentity ?? {}, config.expectedIdentity ?? {});
  return {
    name: "contra-operator",
    version: "0.1.0",
    mode: config.mode,
    identityStatus: identity.identityStatus,
    writeBlocked: identity.writeBlocked,
    writeAuthority: "Contra official MCP",
    credentialsStored: false,
  } as const;
}

export function classifyToolHandler(tool: ToolDescriptor) {
  return { authorityClass: classifyContraTool(tool) };
}

export function checkClaimsHandler(claims: Claim[]) {
  return checkPublicClaims(claims);
}

export function canProceedHandler(input: {
  mode: AutonomyMode;
  authorityClass: AuthorityClass;
  nativeConfirmationRequired: boolean;
  expectedIdentity?: ContraIdentity;
  observedIdentity?: ContraIdentity;
}) {
  const identity = bindIdentity(input.observedIdentity ?? {}, input.expectedIdentity ?? {});
  if (input.authorityClass !== "READ" && identity.writeBlocked) {
    return { decision: "BLOCK" as const, reason: identity.reason, identityStatus: identity.identityStatus };
  }
  return { ...decideOperation(input.mode, input.authorityClass, input.nativeConfirmationRequired), identityStatus: identity.identityStatus };
}

export const TOOL_DEFINITIONS = [
  { name: "contra_operator_status", description: "Returns Contra operator policy state without exposing credentials." },
  { name: "contra_classify_tool", description: "Classifies a Contra tool into an authority class." },
  { name: "contra_check_claims", description: "Checks public portfolio claims for evidence integrity." },
  { name: "contra_can_proceed", description: "Evaluates autonomy mode, identity binding, and native confirmation requirements." },
] as const;
