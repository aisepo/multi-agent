import { listStructuredLogs } from "./sonol-log.mjs";
import { collectAdapterStatusForRun } from "./sonol-adapters.mjs";

function toMillis(value) {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : null;
}

function collectForeignRunReports(run, agentId) {
  const startedAtMs = toMillis(run.started_at ?? run.created_at ?? run.updated_at) ?? 0;
  const runtimeLogs = listStructuredLogs("sonol-runtime", { limit: 400 });
  const foreignEntries = runtimeLogs.filter((entry) => {
    if (entry.agent_id !== agentId) {
      return false;
    }

    if (!entry.run_id || entry.run_id === run.run_id) {
      return false;
    }

    const entryMs = toMillis(entry.timestamp) ?? 0;
    if (entryMs < startedAtMs) {
      return false;
    }

    if (entry.action === "event_saved") {
      return true;
    }

    return entry.action === "report_script" && entry.stage === "success";
  });

  const latest = foreignEntries[0] ?? null;
  return {
    count: foreignEntries.length,
    latest_run_id: latest?.run_id ?? null,
    latest_timestamp: latest?.timestamp ?? null
  };
}

function summarizeAgentDiagnostics(agent, monitorState, events) {
  const agentEvents = events.filter((event) => event.payload?.agent_id === agent.agent_id);
  const lastEvent = agentEvents.at(-1) ?? null;
  const eventCount = agentEvents.length;
  const issues = [];

  if (eventCount === 0) {
    issues.push("no_runtime_reports_recorded");
  }

  if (monitorState?.last_event_type === "auto_missing_report") {
    issues.push("auto_blocked_missing_runtime_report");
  }

  return {
    agent_id: agent.agent_id,
    role: agent.role,
    state: monitorState?.state ?? "unknown",
    message: monitorState?.message ?? "",
    event_count: eventCount,
    last_event_type: lastEvent?.event_type ?? null,
    last_event_id: lastEvent?.payload?.event_id ?? null,
    last_updated_at: monitorState?.updated_at ?? lastEvent?.payload?.timestamp ?? null,
    issues
  };
}

export function collectRunDiagnostics(store, runId, { logLimit = 60 } = {}) {
  const run = store.getRun(runId);
  if (!run) {
    return {
      run_id: runId,
      found: false,
      issues: ["run_not_found"],
      recent_logs: listStructuredLogs("sonol-runtime", { runId, limit: logLimit })
    };
  }

  const plan = store.getPlanForRun(run);
  const events = store.listEvents(runId);
  const snapshot = store.getSnapshot();
  const monitor = snapshot.run_monitors.find((item) => item.run_id === runId) ?? null;
  const adapterStatus = collectAdapterStatusForRun(store, run, { log: false });
  const agents = (plan?.agents ?? []).map((agent) => {
    const summary = summarizeAgentDiagnostics(
      agent,
      monitor?.agent_states.find((state) => state.agent_id === agent.agent_id) ?? null,
      events
    );
    const foreignRunReports = collectForeignRunReports(run, agent.agent_id);
    if (summary.event_count === 0 && foreignRunReports.count > 0) {
      summary.issues.push(`reports_written_to_other_run:${foreignRunReports.latest_run_id}`);
    }
    return {
      ...summary,
      foreign_run_reports: foreignRunReports.count > 0 ? foreignRunReports : null
    };
  });

  const issues = [];
  if (["queued", "running", "blocked"].includes(run.status) && events.length === 0) {
    issues.push("run_has_no_events");
  }

  const agentsMissingReports = agents.filter((agent) => agent.event_count === 0).map((agent) => agent.agent_id);
  if (agentsMissingReports.length > 0) {
    issues.push(`agents_without_reports:${agentsMissingReports.join(",")}`);
  }

  const foreignRunIssues = agents
    .filter((agent) => agent.foreign_run_reports?.latest_run_id)
    .map((agent) => `${agent.agent_id}->${agent.foreign_run_reports.latest_run_id}`);
  if (foreignRunIssues.length > 0) {
    issues.push(`foreign_run_reports:${foreignRunIssues.join(",")}`);
  }

  return {
    found: true,
    run_id: run.run_id,
    plan_id: run.plan_id,
    plan_title: plan?.plan_title ?? null,
    run_status: run.status,
    event_count: events.length,
    latest_event_id: events.at(-1)?.payload?.event_id ?? null,
    latest_event_type: events.at(-1)?.event_type ?? null,
    adapter_status: adapterStatus,
    monitor,
    agents,
    issues,
    recent_logs: listStructuredLogs("sonol-runtime", { runId, limit: logLimit })
  };
}
