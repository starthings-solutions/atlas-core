# Lavish sync log

last-verified: bdf5c7848149a4d81ab0025f328b174947d63cee

## 2026-09-22 — d628531..bdf5c78 (10 commits)

- `c5bdea4` fix(server): make live-review failures recoverable (#353) — covered by open PR #1 (`chore/lavish-sync-2026-09-19`); not re-ported here
- `c69a512` chore(main): release lavish-axi 0.1.73 (#354) — pulado: release-please (`CHANGELOG.md`, version bump), never portable
- `20159e0` feat(poll): add opt-in Herdr readiness chime (#355) — covered by open PR #1 (`chore/lavish-sync-2026-09-19`); not re-ported here
- `2430a3f` fix(server): record startup and runtime failures (#357) — pulado (temporário): needs `bin/atlas-core-server.js` + `test/server-bind-durability.test.js` from unmerged PR #1; re-evaluate after it merges
- `37f1983` chore(main): release lavish-axi 0.1.74 (#356) — pulado: release-please, never portable
- `d5ac546` feat: add exclusive visible poll listeners (#358) — portado em `7722d80` (exclusive per-session poll ownership with `LISTENER_ACTIVE`/`LISTENER_REPLACED`, `--owner`/`--takeover`, atomic `--agent-reply` via `POST /api/poll`, presence modes, `/health` listeners; adapted: Atlas Core naming, `visibleSessions` probes the single local base URL via `fetchHealth` until PR #1's `findRunningServer` lands, Herdr `onResponse` hook omitted — re-add on rebase after PR #1)
- `90b7ff9` chore(main): release lavish-axi 0.1.75 (#359) — pulado: release-please, never portable
- `b4e82c6` feat(chrome): add revision legend for agent-declared artifact edits (#361) — pulado: new chrome UI surface (legend drawer + chrome CSS + design-guidance text), not runtime motor
- `47e690b` chore(main): release lavish-axi 0.1.76 (#364) — pulado: release-please, never portable
- `bdf5c78` Pin no-mistakes required-check caller to v1.80.1 (T2) (#365) — pulado: CI workflow pin, not motor (pin bumps ship in deliberate separate PRs)
