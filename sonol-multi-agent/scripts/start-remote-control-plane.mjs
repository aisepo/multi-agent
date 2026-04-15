#!/usr/bin/env node

const payload = {
  ok: false,
  error_code: "PRIVATE_CONTROL_PLANE_NOT_SHIPPED",
  message: "The hosted Sonol plan normalizer/control-plane implementation is private and is not shipped in the public/community edition.",
  public_surface: {
    supported_client_env: [
      "SONOL_PLANNER_DRIVER=remote_http",
      "SONOL_REMOTE_PLAN_NORMALIZER_URL=https://your-planner.example/v1/planner/draft",
      "SONOL_REMOTE_PLAN_NORMALIZER_TICKET_URL=https://your-planner.example/v1/planner/ticket",
      "SONOL_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN=<token>",
      "SONOL_REMOTE_DASHBOARD_BASE_URL=https://agent.example/sonol-dashboard/"
    ],
    note: "Use your own compatible hosted plan normalizer service. This repository ships only the public local client, local loopback bridge, and runtime/dashboard components."
  }
};

console.error(payload.message);
console.error("");
console.error(JSON.stringify(payload, null, 2));
process.exit(1);
