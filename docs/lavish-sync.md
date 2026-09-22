# Lavish sync log

last-verified: 87d6ae9bf975cf4531c64926cbb58993f5327328

## 2026-09-22 — d628531..bdf5c78 (10 commits)

- `c5bdea4` fix(server): make live-review failures recoverable (#353) — covered by open PR #1 (`chore/lavish-sync-2026-09-19`); not re-ported here
- `c69a512` chore(main): release lavish-axi 0.1.73 (#354) — pulado: release-please (`CHANGELOG.md`, version bump), never portable
- `20159e0` feat(poll): add opt-in Herdr readiness chime (#355) — covered by open PR #1 (`chore/lavish-sync-2026-09-19`); not re-ported here
- `2430a3f` fix(server): record startup and runtime failures (#357) — pulado (temporário): needs `bin/atlas-core-server.js` + `test/server-bind-durability.test.js` from unmerged PR #1; re-evaluate after it merges
- `37f1983` chore(main): release lavish-axi 0.1.74 (#356) — pulado: release-please, never portable
- `d5ac546` feat: add exclusive visible poll listeners (#358) — portado em `7722d80` on `chore/lavish-sync-2026-09-22` (open PR #2; exclusive per-session poll ownership with `LISTENER_ACTIVE`/`LISTENER_REPLACED`, `--owner`/`--takeover`, atomic `--agent-reply` via `POST /api/poll`, presence modes, `/health` listeners; adapted: Atlas Core naming, `visibleSessions` probes the single local base URL via `fetchHealth` until PR #1's `findRunningServer` lands, Herdr `onResponse` hook omitted — re-add on rebase after PR #1)
- `90b7ff9` chore(main): release lavish-axi 0.1.75 (#359) — pulado: release-please, never portable
- `b4e82c6` feat(chrome): add revision legend for agent-declared artifact edits (#361) — pulado: new chrome UI surface (legend drawer + chrome CSS + design-guidance text), not runtime motor
- `47e690b` chore(main): release lavish-axi 0.1.76 (#364) — pulado: release-please, never portable
- `bdf5c78` Pin no-mistakes required-check caller to v1.80.1 (T2) (#365) — pulado: CI workflow pin, not motor (pin bumps ship in deliberate separate PRs)

## 2026-09-22 — bdf5c78..87d6ae9 (4 commits)

- `a3b3987` fix: clarify HTML file output in the Lavish skill (#344) — pulado: skill description/marketing text only (`lavish` branding), not motor
- `2da85ba` ci: exempt kunchenguid from no-mistakes required gate (#367) — pulado: upstream-author-specific CI gate change, not runtime motor
- `b7e59cb` chore(main): release lavish-axi 0.1.77 (#366) — pulado: release-please (`CHANGELOG.md`, version bump), never portable
- `87d6ae9` fix(server): keep the reviewer's artifact load across a server restart (#371) — portado em `4324ea1` (durable `session.artifact_load` epoch + restore-on-first-access with handoff rebind, all-or-nothing record validation, restart/fence/corruption tests; adapted: test tmpdir prefixes `atlas-serve-`/`atlas-store-`, server-test comment cites upstream lavish-axi#369/#371 instead of `npx lavish-axi`, dummy `localhost:4387` URLs kept per this file's existing never-dialed convention)
