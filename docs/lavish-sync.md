# Lavish sync log

last-verified: 20159e0726ba73c9e19db08a388dd1aa5673028c

## 2026-09-19 — c5bdea4, c69a512, 20159e0

- c5bdea4 fix(server): make live-review failures recoverable (#353) — portado em f81d3ee (loopback fallback + bounded bind retry, control-channel discovery primary→loopback, live-event ping/pong, unreachable banner após 5 falhas, server.log com UTC timestamps + shutdown cause, detached spawn via bin/atlas-core-server.js; adaptado: `lavish-axi`→`atlas-core`, `LAVISH_AXI_*`→`ATLAS_CORE_*`, `[lavish]`→`[atlas]`)
- c69a512 chore(main): release lavish-axi 0.1.73 (#354) — pulado: release-please (CHANGELOG.md, .release-please-manifest.json, version bump), nunca portável
- 20159e0 feat(poll): add opt-in Herdr readiness chime (#355) — portado em f81d3ee (header Atlas-Poll-State: listening, fetchJson onResponse hook, opt-in HERDR_ENV=1 + ATLAS_CORE_HERDR_CHIME=1, notificação "Atlas review ready"; nonblocking por construção)
