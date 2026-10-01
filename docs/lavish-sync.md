# Lavish sync log

last-verified: bdf5c7848149a4d81ab0025f328b174947d63cee

## 2026-09-19 — c5bdea4, c69a512, 20159e0

- c5bdea4 fix(server): make live-review failures recoverable (#353) — portado em f81d3ee (loopback fallback + bounded bind retry, control-channel discovery primary→loopback, live-event ping/pong, unreachable banner após 5 falhas, server.log com UTC timestamps + shutdown cause, detached spawn via bin/atlas-core-server.js; adaptado: `lavish-axi`→`atlas-core`, `LAVISH_AXI_*`→`ATLAS_CORE_*`, `[lavish]`→`[atlas]`)
- c69a512 chore(main): release lavish-axi 0.1.73 (#354) — pulado: release-please (CHANGELOG.md, .release-please-manifest.json, version bump), nunca portável
- 20159e0 feat(poll): add opt-in Herdr readiness chime (#355) — portado em f81d3ee (header Atlas-Poll-State: listening, fetchJson onResponse hook, opt-in HERDR_ENV=1 + ATLAS_CORE_HERDR_CHIME=1, notificação "Atlas review ready"; nonblocking por construção)

## 2026-09-22 — d628531..bdf5c78 (10 commits)

- `c5bdea4` fix(server): make live-review failures recoverable (#353) — already on main via merged PR #1 (`chore/lavish-sync-2026-09-19`); not re-ported here
- `c69a512` chore(main): release lavish-axi 0.1.73 (#354) — pulado: release-please (`CHANGELOG.md`, version bump), never portable
- `20159e0` feat(poll): add opt-in Herdr readiness chime (#355) — already on main via merged PR #1 (`chore/lavish-sync-2026-09-19`); not re-ported here
- `2430a3f` fix(server): record startup and runtime failures (#357) — pulado (temporário): PR #1 now merged (bind durability scaffolding present on main); re-evaluate port in a follow-up sync
- `37f1983` chore(main): release lavish-axi 0.1.74 (#356) — pulado: release-please, never portable
- `d5ac546` feat: add exclusive visible poll listeners (#358) — portado em `7722d80` (exclusive per-session poll ownership with `LISTENER_ACTIVE`/`LISTENER_REPLACED`, `--owner`/`--takeover`, atomic `--agent-reply` via `POST /api/poll`, presence modes, `/health` listeners; adapted: Atlas Core naming; after rebase onto merged PR #1, restored Herdr `onResponse` hook and rely on PR #1 discovery/`findRunningServer` where available)
- `90b7ff9` chore(main): release lavish-axi 0.1.75 (#359) — pulado: release-please, never portable
- `b4e82c6` feat(chrome): add revision legend for agent-declared artifact edits (#361) — pulado: new chrome UI surface (legend drawer + chrome CSS + design-guidance text), not runtime motor
- `47e690b` chore(main): release lavish-axi 0.1.76 (#364) — pulado: release-please, never portable
- `bdf5c78` Pin no-mistakes required-check caller to v1.80.1 (T2) (#365) — pulado: CI workflow pin, not motor (pin bumps ship in deliberate separate PRs)
