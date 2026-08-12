#!/usr/bin/env node
import { canProceedHandler, checkClaimsHandler, classifyToolHandler, operatorStatus, TOOL_DEFINITIONS } from "./server.js";

declare const process: any;

type JsonRpcRequest = { jsonrpc?: string; id?: unknown; method?: string; params?: any };

function result(id: unknown, value: unknown) {
  return JSON.stringify({ jsonrpc: "2.0", id, result: value });
}
function error(id: unknown, code: number, message: string) {
  return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}
function toolResponse(value: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

export function handleJsonRpc(req: JsonRpcRequest): string | undefined {
  if (req.method === "initialize") {
    return result(req.id, {
      protocolVersion: req.params?.protocolVersion ?? "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "contra-operator", version: "0.1.0" },
      instructions: "Policy sidecar only. Contra official MCP remains the sole Contra write authority.",
    });
  }
  if (req.method === "notifications/initialized") return undefined;
  if (req.method === "tools/list") {
    return result(req.id, {
      tools: TOOL_DEFINITIONS.map((tool) => ({ ...tool, inputSchema: { type: "object", additionalProperties: true } })),
    });
  }
  if (req.method === "tools/call") {
    const name = req.params?.name;
    const args = req.params?.arguments ?? {};
    try {
      if (name === "contra_operator_status") return result(req.id, toolResponse(operatorStatus(args)));
      if (name === "contra_classify_tool") return result(req.id, toolResponse(classifyToolHandler(args)));
      if (name === "contra_check_claims") return result(req.id, toolResponse(checkClaimsHandler(args.claims ?? [])));
      if (name === "contra_can_proceed") return result(req.id, toolResponse(canProceedHandler(args)));
      return error(req.id, -32601, `Unknown tool: ${String(name)}`);
    } catch (cause) {
      return error(req.id, -32602, cause instanceof Error ? cause.message : "Invalid tool arguments");
    }
  }
  if (req.id !== undefined) return error(req.id, -32601, `Unsupported method: ${String(req.method)}`);
  return undefined;
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk: string) => {
  buffer += chunk;
  let newline = buffer.indexOf("\n");
  while (newline >= 0) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (line) {
      try {
        const response = handleJsonRpc(JSON.parse(line));
        if (response) process.stdout.write(`${response}\n`);
      } catch {
        process.stdout.write(`${error(null, -32700, "Parse error")}\n`);
      }
    }
    newline = buffer.indexOf("\n");
  }
});
