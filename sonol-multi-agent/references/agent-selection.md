# Agent Selection

Use these rules when deciding the agent set.

## Fixed rules

- Total agents: `1..6`
- Main agent: always `1`
- Sub-agents: `0..5`
- Effective concurrency must stay within the lower of Sonol policy, Codex
  `agents.max_threads`, and any operator override.
- Effective depth stays at `1` in v1.
- Sub-agents must not spawn child sub-agents in v1.

## Core policy

- Agent selection is `workstream-first`, not `fixed-role-bundle-first`.
- `Main` is the only mandatory role.
- Every other agent is optional and should be created from the request itself.
- Role names are free-form strings.
- Duplicate roles are allowed.
- `execution_class` is the stable internal routing field.
- `role_label` is the user-facing display name.

## Workstream flow

1. Split the request into meaningful clauses or responsibility clusters.
2. Classify each cluster into one execution class.
3. Create one sub-agent per workstream.
4. Add planner / verifier / reviewer tracks only when the request signals that
   they are needed.
5. If the resulting set exceeds the provider limit, merge similar workstreams
   instead of falling back to a fixed bundle.

## Execution classes

- `lead`
- `planner`
- `research`
- `implementer`
- `verifier`
- `reviewer`
- `docs`
- `refactor`
- `ops`
- `general`

Legacy role names such as `Planner`, `Research`, or `Code` remain readable for
compatibility, but new recommendations should be driven by `execution_class`.

## Default provider base type mapping

- `lead` -> `default`
- `planner` -> `default`
- `research` -> `explorer`
- `implementer` -> `worker`
- `verifier` -> `worker`
- `reviewer` -> `explorer`
- `docs` -> `default`
- `refactor` -> `worker`
- `ops` -> `worker`
- `general` -> `default`

These are policy defaults, not hard requirements.

## Default control profile

- `lead`
  - model: `gpt-5.4`
  - reasoning: `high`
  - sandbox: `workspace-write`
- `planner`
  - model: `gpt-5.4`
  - reasoning: `high`
  - sandbox: `read-only`
- `research`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `read-only`
- `implementer`
  - model: `gpt-5.4`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `verifier`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `reviewer`
  - model: `gpt-5.4`
  - reasoning: `high`
  - sandbox: `read-only`
- `docs`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `refactor`
  - model: `gpt-5.4`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `ops`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `general`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `read-only`

For all sub-agents by default:

- `approval_mode`: `inherit-session`
- `communication_mode`: `delegated-thread-and-runtime-events`
- `skills_config`: include `sonol-agent-runtime`
- `nickname_candidates`: derive from role label or execution class
- `mcp_servers`: keep minimal; add only when task scope truly needs them

## Per-agent required fields

When multi-agent is chosen, define each agent with:

- `agent_id`
- `role`
- `role_label`
- `execution_class`
- `workstream_id`
- `selection_rationale`
- `purpose`
- `provider_agent_type`
- adapter-specific alias fields only when the active adapter still needs them
- `developer_instructions`
- `model`
- `model_reasoning_effort`
- `sandbox_mode`
- `mcp_servers`
- `skills_config`
- `nickname_candidates`
- `read_paths`
- `write_paths`
- `deny_paths`
- `depends_on`
- `assigned_task_ids`
- `reporting_contract`

## Decision hints

- Prefer `single-agent` only when the work is narrow enough that `Main` plus at
  most one additional track is sufficient.
- Add `planner` when sequencing, dependency order, or checkpoint definition
  matters.
- Add multiple `research` tracks when the request contains independent research
  areas.
- Add `verifier` when direct edits or behavior changes need confirmation.
- Add `reviewer` when correctness, compatibility, or regression risk is high.
- Add `docs` when output quality depends on structured explanation or handoff
  materials.
- Prefer merging similar read-only workstreams before merging distinct writer
  tracks.

## Hard no-go assumptions

- Do not assume a public CLI exists for `spawn`, `wait`, `terminate`, or
  `send_input` on individual sub-agents.
- Do not assume dashboard approval can inject text into a live Codex session.
- Do not describe `read_paths` or `deny_paths` as native Codex ACLs unless they
  are backed by sandboxing or custom agent config.
- Lower concurrency when edits may collide.
- Keep effective sub-agent depth at `1`.
