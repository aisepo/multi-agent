import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

const DEFAULT_LOCK_STALE_MS = 10 * 60_000;

function stableKey(workspaceRoot, requestSummary) {
  const hash = createHash("sha1");
  hash.update(String(workspaceRoot ?? ""));
  hash.update("\n");
  hash.update(String(requestSummary ?? ""));
  return hash.digest("hex").slice(0, 20);
}

export function acquirePlannerLock({ workspaceRoot, requestSummary }) {
  const lockKey = stableKey(workspaceRoot, requestSummary);
  const lockRoot = resolve(tmpdir(), "sonol-runtime", "planner-locks");
  const lockPath = resolve(lockRoot, lockKey);
  const metadataPath = resolve(lockPath, "lock.json");
  const acquiredAt = new Date().toISOString();
  const lockMetadata = {
    lock_key: lockKey,
    workspace_root: workspaceRoot ?? null,
    request_summary: requestSummary ?? "",
    pid: process.pid,
    acquired_at: acquiredAt
  };
  const staleMs = DEFAULT_LOCK_STALE_MS;
  mkdirSync(lockRoot, { recursive: true });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      mkdirSync(lockPath);
      writeFileSync(metadataPath, JSON.stringify(lockMetadata, null, 2), "utf8");
      return {
        ok: true,
        lockKey,
        lockPath,
        metadata: lockMetadata,
        release() {
          rmSync(lockPath, { recursive: true, force: true });
        }
      };
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === "EEXIST")) {
        throw error;
      }

      let existingMetadata = null;
      let acquiredAtMs = null;
      try {
        existingMetadata = JSON.parse(readFileSync(metadataPath, "utf8"));
        acquiredAtMs = Date.parse(existingMetadata?.acquired_at ?? "");
      } catch {
        existingMetadata = null;
      }

      if (!Number.isFinite(acquiredAtMs)) {
        try {
          acquiredAtMs = statSync(lockPath).mtimeMs;
        } catch {
          acquiredAtMs = null;
        }
      }

      const isStale = Number.isFinite(acquiredAtMs) ? (Date.now() - acquiredAtMs >= staleMs) : false;
      if (isStale) {
        rmSync(lockPath, { recursive: true, force: true });
        continue;
      }

      return {
        ok: false,
        lockKey,
        lockPath,
        metadata: existingMetadata
      };
    }
  }

  return {
    ok: false,
    lockKey,
    lockPath,
    metadata: null
  };
}
