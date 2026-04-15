#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildAgentPacketForRun, prepareRunContextForRun } from "../internal/core/sonol-adapters.mjs";
import { defaultDbPath, openStore } from "../internal/core/sonol-store.mjs";

const args = {
  dbPath: null,
  workspaceRoot: process.env.SONOL_WORKSPACE_ROOT ? resolve(process.env.SONOL_WORKSPACE_ROOT) : process.cwd()
};

for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  if (token === "--run-id") {
    args.runId = process.argv[index + 1];
    index += 1;
  } else if (token === "--agent-id") {
    args.agentId = process.argv[index + 1];
    index += 1;
  } else if (token === "--db") {
    args.dbPath = resolve(process.argv[index + 1]);
    index += 1;
  } else if (token === "--workspace-root") {
    args.workspaceRoot = resolve(process.argv[index + 1]);
    index += 1;
  } else if (token === "--format") {
    args.format = process.argv[index + 1];
    index += 1;
  }
}

if (!args.runId || !args.agentId) {
  console.error("Usage: node build-subagent-prompt.mjs --run-id <run_id> --agent-id <agent_id> [--workspace-root <workspace_root>] [--db path]");
  process.exit(1);
}

args.dbPath ??= defaultDbPath({ workspaceRoot: args.workspaceRoot, startDir: args.workspaceRoot });
const store = openStore(args.dbPath, { workspaceRoot: args.workspaceRoot, startDir: args.workspaceRoot });
const run = store.getRun(args.runId);
if (!run) {
  console.error(`Run not found: ${args.runId}`);
  process.exit(1);
}

const plan = store.getPlanForRun(run);
if (!plan) {
  console.error(`Plan not found: ${run.plan_id}`);
  process.exit(1);
}

const agent = plan.agents.find((candidate) => candidate.agent_id === args.agentId);
if (!agent) {
  console.error(`Agent not found in plan: ${args.agentId}`);
  process.exit(1);
}

const runtimeFiles = prepareRunContextForRun(store, run);
const packet = buildAgentPacketForRun(run, plan, agent, { runtimeFiles });
if ((args.format ?? "json") === "text") {
  const promptFile = packet.runtime_prompt_file;
  if (promptFile) {
    process.stdout.write(readFileSync(promptFile, "utf8"));
  } else {
    process.stdout.write(`${packet.delegation_prompt}\n`);
  }
} else {
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
}
