# Sonol Multi-Agent Public Release

This repository contains the public release of two Sonol skills:

- `sonol-multi-agent`
- `sonol-agent-runtime`

Both skills must be installed together. Installing only one of them can break the orchestration flow, runtime reporting, or dashboard/runtime integration.

## Repository Layout

```text
sonol-multi-agent/
sonol-agent-runtime/
README.md
README.ko.md
LICENSE.txt
LICENSE.ko.txt
```

## Supported and Tested Environments

This public release has only been tested in the following environments:

- Codex CLI: WSL (Windows Subsystem for Linux)
- Claude Code: Windows

Other environments have not been validated.

## Installation

### Codex CLI on WSL

Only WSL environments are currently supported and tested for Codex CLI.

1. Locate your Codex skills directory:

   ```bash
   mkdir -p ~/.codex/skills
   ```

2. Copy both skill folders into that directory so the final layout becomes:

   ```text
   ~/.codex/skills/sonol-multi-agent
   ~/.codex/skills/sonol-agent-runtime
   ```

3. Restart Codex CLI or start a new Codex session after copying the folders.

### Claude Code on Windows

Only Windows environments are currently supported and tested for Claude Code.

1. Locate your Claude Code skills directory:

   ```powershell
   New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills" | Out-Null
   ```

2. Copy both skill folders into that directory so the final layout becomes:

   ```text
   %USERPROFILE%\.claude\skills\sonol-multi-agent
   %USERPROFILE%\.claude\skills\sonol-agent-runtime
   ```

3. Restart Claude Code or open a new Claude Code session after copying the folders.

## Notes

- This repository publishes the external public-release payload for the local Sonol client/runtime surface.
- Local SQLite state remains authoritative for orchestration state.
- The local bridge remains authoritative for dashboard and runtime access.
- Browser storage is not authoritative for orchestration state.

## License

The Sonol-authored material in this repository is provided under the terms in [LICENSE.txt](LICENSE.txt).

Bundled third-party dependencies and their embedded notices remain under their own upstream licenses.
