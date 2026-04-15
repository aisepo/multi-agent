#!/usr/bin/env node
import { resolve } from "node:path";
import { defaultDbPath, openStoreWithOptions } from "../internal/core/sonol-store.mjs";

let workspaceRoot = process.env.SONOL_WORKSPACE_ROOT ? resolve(process.env.SONOL_WORKSPACE_ROOT) : process.cwd();
let dbPath = null;
const usageText = "Usage: node show-snapshot.mjs [--workspace-root <workspace_root>] [--db path]";
for (let index = 2; index < process.argv.length; index += 1) {
  if (process.argv[index] === "--help") {
    console.error(usageText);
    process.exit(0);
  }
  if (process.argv[index] === "--db") {
    dbPath = resolve(process.argv[index + 1]);
    index += 1;
  } else if (process.argv[index] === "--workspace-root") {
    workspaceRoot = resolve(process.argv[index + 1]);
    index += 1;
  } else {
    console.error(usageText);
    process.exit(1);
  }
}

dbPath ??= defaultDbPath({ workspaceRoot, startDir: workspaceRoot });
const store = openStoreWithOptions(dbPath, { readOnly: true, workspaceRoot, startDir: workspaceRoot });
try {
  process.stdout.write(`${JSON.stringify(store.getSnapshot(), null, 2)}\n`);
} finally {
  store.close();
}
