#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const allowedFlags = new Set(["--release-root"]);

function fail(message, extra = {}) {
  const payload = {
    ok: false,
    message,
    expected_usage: [
      "node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/check-public-release.mjs --release-root /abs/release-root"
    ],
    ...extra
  };
  console.error(message);
  console.error("");
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const args = {
  releaseRoot: process.cwd()
};

for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  if (token === "--help") {
    console.log("node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/check-public-release.mjs --release-root /abs/release-root");
    process.exit(0);
  }
  if (token.startsWith("--") && !allowedFlags.has(token)) {
    fail(`Unsupported flag: ${token}`, { unsupported_flag: token });
  }
  if (token === "--release-root") {
    const value = process.argv[index + 1];
    if (!value) {
      fail("Missing value for --release-root", { flag: "--release-root" });
    }
    args.releaseRoot = resolve(value);
    index += 1;
  }
}

if (!existsSync(args.releaseRoot)) {
  fail(`Release root does not exist: ${args.releaseRoot}`, {
    missing_path: args.releaseRoot
  });
}

const result = {
  ok: true,
  release_root: args.releaseRoot,
  checks: []
};

function pushCheck(name, ok, detail) {
  result.checks.push({ name, ok, detail });
  if (!ok) {
    result.ok = false;
  }
}

function hasPath(relativePath) {
  return existsSync(resolve(args.releaseRoot, relativePath));
}

function walkFiles(rootDir, relativeDir = "") {
  const absoluteDir = resolve(rootDir, relativeDir);
  const entries = readdirSync(absoluteDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryRelativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...walkFiles(rootDir, entryRelativePath));
    } else if (entry.isFile()) {
      files.push(entryRelativePath);
    }
  }
  return files;
}

const visibleTopLevelEntries = readdirSync(args.releaseRoot, { withFileTypes: true })
  .filter((entry) => !entry.name.startsWith("."))
  .map((entry) => ({ name: entry.name, isDirectory: entry.isDirectory() }));
const visibleTopLevelNames = visibleTopLevelEntries.map((entry) => entry.name).sort();
const expectedTopLevelNames = ["sonol-agent-runtime", "sonol-multi-agent"];

pushCheck(
  "top_level_entries",
  JSON.stringify(visibleTopLevelNames) === JSON.stringify(expectedTopLevelNames)
    && visibleTopLevelEntries.every((entry) => entry.isDirectory),
  `Visible top-level entries must be exactly ${expectedTopLevelNames.join(", ")}. Found: ${visibleTopLevelNames.join(", ") || "(none)"}`
);

const requiredPaths = [
  "sonol-multi-agent/SKILL.md",
  "sonol-multi-agent/references/agent-selection.md",
  "sonol-multi-agent/references/agent-shaping.md",
  "sonol-multi-agent/references/public-release.md",
  "sonol-multi-agent/scripts/export-public-release.mjs",
  "sonol-multi-agent/scripts/check-public-release.mjs",
  "sonol-multi-agent/scripts/start-dashboard.mjs",
  "sonol-multi-agent/internal/dashboard/dist/index.html",
  "sonol-multi-agent/node_modules/ajv/package.json",
  "sonol-multi-agent/node_modules/ws/package.json",
  "sonol-agent-runtime/SKILL.md",
  "sonol-agent-runtime/scripts/report-progress.mjs",
  "sonol-agent-runtime/scripts/report-completion.mjs"
];

for (const relativePath of requiredPaths) {
  pushCheck(
    `required:${relativePath}`,
    hasPath(relativePath),
    `Expected required public-release path: ${relativePath}`
  );
}

const forbiddenPaths = [
  "sonol-multi-agent/sonol-agent-runtime",
  "sonol-multi-agent/references/remote-control-plane.env.example",
  "sonol-multi-agent/references/sonol-remote-control-plane.service",
  "sonol-multi-agent/references/remote-thin-dashboard.html"
];

for (const relativePath of forbiddenPaths) {
  pushCheck(
    `forbidden:${relativePath}`,
    !hasPath(relativePath),
    `Forbidden private or duplicate path must be absent: ${relativePath}`
  );
}

const allFiles = walkFiles(args.releaseRoot);
const forbiddenSuffixes = [".map", ".pem", ".ppk", ".key", ".crt"];
for (const suffix of forbiddenSuffixes) {
  const matches = allFiles.filter((relativePath) => relativePath.endsWith(suffix));
  pushCheck(
    `forbidden_suffix:${suffix}`,
    matches.length === 0,
    matches.length === 0
      ? `No forbidden "${suffix}" files detected in the public release.`
      : `Forbidden "${suffix}" files detected: ${matches.join(", ")}`
  );
}

const textFilesToScan = [
  "sonol-multi-agent/SKILL.md",
  "sonol-multi-agent/references/agent-shaping.md",
  "sonol-multi-agent/references/public-release.md",
  "sonol-multi-agent/references/portable-setup.md",
  "sonol-agent-runtime/SKILL.md"
];
const forbiddenTextMarkers = [
  "references/remote-control-plane.env.example",
  "references/sonol-remote-control-plane.service",
  "references/remote-thin-dashboard.html",
  "hosted private planner"
];

for (const relativePath of textFilesToScan) {
  const absolutePath = resolve(args.releaseRoot, relativePath);
  if (!existsSync(absolutePath)) {
    continue;
  }
  const text = readFileSync(absolutePath, "utf8");
  for (const marker of forbiddenTextMarkers) {
    pushCheck(
      `text:${relativePath}:${marker}`,
      !text.includes(marker),
      `Text marker "${marker}" must not appear in ${relativePath}`
    );
  }
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(result.ok ? 0 : 1);
