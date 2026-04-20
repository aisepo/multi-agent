# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repo is the **public release payload** of two co-dependent Sonol skills:

- `sonol-multi-agent/` — top-level orchestrator skill (planning, approval, run lifecycle, dashboard)
- `sonol-agent-runtime/` — sub-agent reporting helper (progress/artifact/completion/session events into shared SQLite)

Both skills must be installed **together** at `~/.codex/skills/` (Codex CLI on WSL) or `%USERPROFILE%\.claude\skills\` (Claude Code on Windows). Installing only one breaks orchestration or reporting. The repo is not meant to be "run" from its checkout location — scripts are invoked after copying the skill folders to the skills directory.

**License note:** Material here is under the Sonol Restricted License (`LICENSE.txt`). Modification, redistribution, and derivative works require prior written permission. Avoid refactors, "cleanups", or structural rewrites unless the user explicitly requests them — this is a release payload, not a development tree.

## Tech Stack

- **Runtime:** Node.js (ESM, all modules are `.mjs`). No transpiler, no bundler for the backend.
- **State:** Node built-in `node:sqlite` (`DatabaseSync`) — local SQLite is the authoritative store for plans, runs, events, and workspace bindings.
- **Validation:** JSON Schema Draft 2020 + `ajv` against contracts in `sonol-multi-agent/internal/schemas/`.
- **Dashboard:** `node:http` + `ws` (WebSocket) bridge serving a pre-built React bundle from `sonol-multi-agent/internal/dashboard/dist/`. The frontend source is not in this repo — only the compiled bundle ships here.
- **Planner:** Defaults to the hosted normalizer at `https://agent.zooo.kr/v1/planner/draft`; self-host overrides are env-driven via `start-remote-control-plane.mjs` (stub / documentation).

## Common Commands

All scripts are `node <path>/scripts/<name>.mjs [flags]`. In installed form the path prefix is `$SONOL_INSTALL_ROOT/skills/sonol-multi-agent` or `.../sonol-agent-runtime`. Common flags: `--db <db_path>`, `--plan-id`, `--run-id`, `--agent-id`, `--task-id`, `--request-summary "..."`.

**Orchestrator (`sonol-multi-agent/scripts/`)**
- `present-proposal.mjs` — submit locally authored creative draft → hosted planner → dashboard approval. Entry point for a new orchestration cycle.
- `confirm-plan.mjs` / `approve-plan.mjs` — terminal-side confirmation after dashboard approval.
- `create-run.mjs` — materialize an immutable run snapshot from an approved plan.
- `prepare-run-context.mjs` / `build-subagent-prompt.mjs` — generate per-agent runtime context and delegation packets under `<runtime_root>/<run_id>/`.
- `show-run-launch-manifest.mjs` / `show-run-diagnostics.mjs` / `show-snapshot.mjs` / `show-authority.mjs` — inspection.
- `start-dashboard.mjs` — launches local HTTP/WS bridge on a workspace-derived stable port.
- `watch-main-workspace.mjs` / `report-main.mjs` — Main-agent progress reporting.
- `retry-run.mjs`, `set-run-status.mjs`, `run-planner-job.mjs` — lifecycle utilities.
- `export-public-release.mjs` / `export-portable-bundle.mjs` / `check-public-release.mjs` / `portable-smoke-test.mjs` — packaging and smoke validation.

**Sub-agent runtime (`sonol-agent-runtime/scripts/`)**
- `report-progress.mjs` — step N of M + state (required at task start and milestones).
- `report-artifact.mjs` — record file/output produced.
- `report-completion.mjs` — terminal success/failure (preferred over `session_updated completed`).
- `report-session.mjs` — status change to `blocked` or `idle`.
- `ingest-json-report.mjs` — adapter-neutral stdin JSON fallback.

There is no conventional test suite. `portable-smoke-test.mjs` is the closest thing to a health check; validation is per-script via AJV against `internal/schemas/*.schema.json`.

## Architecture

### Run lifecycle

1. **Creative draft** — the *current* session (Claude/Codex) authors a draft JSON using `subagents`, `slot_id`, `role_label` (see `sonol-multi-agent/references/creative-draft-contract.md`). The Main agent is **implicit** and must not appear in the `subagents` array.
2. **Proposal** — `present-proposal.mjs --request-summary "..."` submits the draft to the hosted planner, which normalizes/binds it into a plan (`agent_id`, `role`, `workstream_id`, `reporting_contract`, `execution_target`). Plan + proposal land in SQLite; dashboard opens.
3. **Dashboard approval** — operator reviews/edits/approves in the React UI. Dashboard mutations go through the HTTP/WS bridge back into SQLite.
4. **Terminal confirmation** — user types `승인` (approve) in the terminal; `confirm-plan.mjs` reads the latest approved state, then `create-run.mjs` writes an immutable run snapshot.
5. **Delegation & execution** — adapter (Codex or Claude Code) produces a launch manifest and per-agent prompt packets under `<runtime_root>/<run_id>/prompts/<agent_id>.txt`. Sub-agents execute and report via `sonol-agent-runtime` scripts.
6. **Integration** — Main agent synthesizes sub-agent outputs and reports via `report-main.mjs`.

### Authority split (important)

- **Local creativity**: the active Claude/Codex session drafts the initial structure — the hosted planner must not author it.
- **Hosted normalization**: planner only normalizes/validates/binds.
- **Local authority**: SQLite is the source of truth for plan/run/event state. Even with a hosted planner, runtime reporting always goes local — never substitute ad-hoc remote HTTP logging for `report-*` calls.
- **Dashboard**: reads local SQLite through the local bridge; browser storage is not authoritative.

### Key core modules (`sonol-multi-agent/internal/core/`)

- `sonol-store.mjs` — SQLite access + schema migrations + event persistence.
- `sonol-adapters.mjs` + `sonol-codex-adapter.mjs` + `sonol-claude-code-adapter.mjs` — adapter registry; each adapter translates the normalized plan into a provider-specific launch packet.
- `sonol-planner-driver.mjs` + `sonol-remote-planner.mjs` + `sonol-public-remote-config.mjs` — hosted-planner client + config resolution.
- `sonol-binding-resolver.mjs` + `sonol-runtime-paths.mjs` — resolve `workspace_root → db_path → runtime_root`; handle WSL `/mnt/c/...` ↔ Windows `C:\...` normalization; derive stable per-workspace dashboard port.
- `sonol-dashboard-bridge.mjs` + `internal/dashboard/server.mjs` — HTTP/WS bridge; issues/reads dashboard bridge tokens.
- `sonol-validation.mjs` + `sonol-creative-draft.mjs` — structural validation of drafts, plans, request summaries.
- `sonol-planner-lock.mjs` — prevents concurrent planner normalization (stale-timeout recoverable).
- `sonol-run-snapshot.mjs` — immutable run materialization.

### Schemas (`sonol-multi-agent/internal/schemas/`)

Cross-adapter event/plan contracts, all at `schema_version` "1.0.0":
`plan`, `plan-updated`, `planner-draft`, `creative-draft`, `agent-definition`, `run`, `progress-event`, `artifact-event`, `completion-event`, `session-updated`. Any new event writer must validate against these.

## Non-Obvious Rules and Gotchas

- **Main agent is implicit.** Never include it in the `subagents` array of a creative draft. It is the current session and owns final integration.
- **Creative-draft vocabulary is different from plan vocabulary.** Drafts use `subagents` / `slot_id` / `role_label`. Plans use `agent_id` / `role` / `workstream_id` / `reporting_contract`. Do not mix them.
- **Pass request via `--request-summary "..."`**, never positional text.
- **Stop and propose before substantive work.** Before any significant research, coding, testing, or delegation, present the orchestration proposal first — only minimal sizing context is allowed beforehand.
- **Workspace binding must be consistent.** All scripts in a single flow must resolve the same `workspace_root → db_path`. `present-proposal.mjs` writes alignment tokens; later scripts passing a different `--db` risk operating against stale approvals. Prefer letting the binding resolver auto-detect.
- **Runtime-generated prompts, not plan prompts, are authoritative for in-flight delegation.** After `create-run.mjs`, read `<runtime_root>/<run_id>/prompts/<agent_id>.txt`; the plan's mutable prompt field becomes stale.
- **Manifest-only dispatch.** Some adapters (notably `sonol-codex-adapter`) return a launch manifest but do not spawn sub-agents — orchestration must delegate manually using the generated packets. Check adapter capabilities via `show-run-launch-manifest.mjs`.
- **Public-release filtering.** `export-public-release.mjs` drops private artifacts (planner server, auth configs). Don't paste those back in when editing.
- **Do not replace `report-*` calls with hooks or final-answer JSON scraping.** Direct script calls are the default; `ingest-json-report.mjs` is the neutral fallback for providers where scripts can't be invoked directly.
- **WSL path handling.** `sonol-runtime-paths.mjs` normalizes `/mnt/...` paths; preserving the original casing/form matters for cross-session identity — don't naively lowercase or resolve symlinks when passing paths between scripts.

## Supported Environments

Only two environments are tested: **Codex CLI on WSL** and **Claude Code on Windows**. Other combinations are not validated — when changes could be environment-sensitive (paths, child processes, sqlite binaries), call that out explicitly rather than assuming parity.
