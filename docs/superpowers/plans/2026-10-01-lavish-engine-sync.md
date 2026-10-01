# Lavish Engine Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all five engine gaps identified by the 2026-10-01 audit against Lavish `a2a199c`.

**Architecture:** Port the behavior of upstream `2430a3f` and `edc0607` into the existing CLI/server boundaries. Preserve Atlas naming, port 4397, OLED surfaces, local source installation, exclusive poll ownership and rejection of replies to ended sessions.

**Tech Stack:** Node 22+ ESM, Express, ws, node:test, pnpm.

**Spec:** `docs/lavish-engine-audit-2026-10-01.md` and upstream commits `2430a3f`, `edc0607`.

## Global Constraints

- Changes target only Atlas Core; upstream Lavish is read-only.
- Preserve host/origin guards; never expose wildcard listeners.
- A daemon owned by another state directory must never be stopped or adopted.
- Runtime tests use unique state directories and ephemeral ports; no active user server is stopped.
- Keep native loopback recognition when interface enumeration is unavailable.
- Keep `poll --agent-reply` atomic and refuse transcript mutation after session end.
- Run `pnpm run check` before merging/pushing to main; existing main-push authorization persists.

## Review Focus

- Missing or occupied tailnet address: keep loopback and recover without disconnecting review.
- Foreign daemon: refuse control and keep its sessions and process intact.
- Unresolved explicit hostname: retain it as a requested host and report retry status.
- Bind error after listen and uncaught exception: log with timestamp; HTTP daemon stays controllable and fatal exceptions terminate.
- Hanging primary health probe: CLI finishes within bounds and discovers loopback presence.

### Task 1: Detached-server durability

**Files:** `bin/atlas-core-server.js`, `src/server.js`, `test/server-bind-durability.test.js`.
**Interfaces:** `listenHttp(app, port, host, onRuntimeError)` records runtime errors; bootstrap emits `[atlas]` fatal error lines and exits 1 after flushing.

- [ ] Add the two upstream runtime-failure regressions and run them against the current Atlas engine; expect both to fail.
- [ ] Port fatal bootstrap handling and persistent HTTP error callback from `2430a3f`.
- [ ] Run the durability suite; commit once the new tests and existing cases pass.

### Task 2: One recoverable daemon per installation/port

**Files:** `src/paths.js`, `src/local-address.js`, `src/server.js`, `src/cli.js`, `test/paths.test.js`, `test/local-address.test.js`, `test/server-discovery.test.js`, existing CLI/server tests.
**Interfaces:** `stateId(file)`, `localInterfaceAddresses(interfaces)`, `resolveListenHosts({extraHosts})`, `resolveConcreteListenHosts(hosts,{keepUnresolved})`, `serve({extraListenHosts,bindRecoveryDelaysMs})`, `/health` fields `state_id`, `state_dir`, `hosts`, `requested_hosts`; CLI `missingServerHosts`, `inheritedListenHosts`, `--also-listen`.

- [ ] Add a failing behavioral regression for mandatory loopback with a pinned host, then port upstream discovery tests.
- [ ] Port network/identity helpers and the CLI discovery/start/control path from `edc0607`.
- [ ] Port server `pendingBinds`, bounded recovery, dynamic warnings/allowlist and mandatory loopback ownership.
- [ ] Align prior tests with recovery in place; retain independent coverage for foreign installations, occupied binds, host allowlist and ended replies.
- [ ] Run discovery, paths, local-address, durability, CLI reply/output and server suites; commit once green.

### Task 3: Presence, documentation and integration

**Files:** `src/cli.js`, `test/server-discovery.test.js`, `README.md`, `AGENTS.md`, `docs/lavish-sync.md`, `docs/lavish-engine-audit-2026-10-01.md`.
**Interfaces:** `visibleSessions()` consumes bounded discovery rather than a primary-only health request; command names and state-directory env vars remain Atlas-specific.

- [ ] Add a behavioral home/ambient regression for listener presence after loopback fallback and a bounded hanging probe.
- [ ] Route visible-session health through discovery; remove stale adaptation commentary.
- [ ] Update owned contracts and sync log, preserving historical audit evidence and recording resolution.
- [ ] Run the complete check pipeline and request fresh code review before merging/pushing to authorized main.

## Progress and rulings

- Scope: runtime ports only; revision legend and answer-copy playbook are recorded product differences.
- Baseline is `99bf71b` (prior verified engine plus local-worktree ignore); no other tracked changes existed.
