import type { ToolDescriptor } from "./policy.js";

export interface ContraTool extends ToolDescriptor {
  inputSchema?: unknown;
}

export interface ContraToolResult {
  content?: unknown;
  isError?: boolean;
  [key: string]: unknown;
}

export interface ContraMcpPort {
  listTools(): Promise<ContraTool[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<ContraToolResult>;
  getInstructions?(): Promise<string | undefined>;
}
