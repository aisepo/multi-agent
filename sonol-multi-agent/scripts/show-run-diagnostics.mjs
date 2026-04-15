#!/usr/bin/env node
import { resolve } from "node:path";
import { collectRunDiagnostics } from "../internal/core/sonol-diagnostics.mjs";
import { defaultDbPath, openStoreWithOptions } from "../internal/core/sonol-store.mjs";

const args = {
  dbPath: defaultDbPath(),
  logLimit: 60
};

for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  if (token === "--run-id") {
    args.runId = process.argv[index + 1];
    index += 1;
  } else if (token === "--db") {
    args.dbPath = resolve(process.argv[index + 1]);
    index += 1;
  } else if (token === "--log-limit") {
    args.logLimit = Number(process.argv[index + 1]);
    index += 1;
  }
}

const store = openStoreWithOptions(args.dbPath, { readOnly: true });
try {
  const runId = args.runId ?? store.listRuns().find((run) =>
    ["queued", "running", "blocked"].includes(run.status)
  )?.run_id;
  if (!runId) {
    throw new Error("No target run found. Use --run-id or create/launch a run first.");
  }

  const diagnostics = collectRunDiagnostics(store, runId, { logLimit: args.logLimit });
  process.stdout.write(`${JSON.stringify(diagnostics, null, 2)}\n`);
} finally {
  store.close();
}
