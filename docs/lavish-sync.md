# Lavish sync log

last-verified: 40cafa206916cf21e4996158c347e58364d01559

## 2026-09-28 — 87d6ae9..40cafa2 (5 commits)

- `edc0607` fix: keep one review server reachable across network changes (#374) — PARCIAL, portado em `eb43c8b`: hoisted `idleTimer` + `attachmentSweepTimer` above the bind loop (upstream's TDZ fix; `bindRecoveryTimer` does not exist here) with a regression test that attaches a live-event client during Tailscale bind retries; no other behavior change. RESTO DIFERIDO (temporário): CLI discovery sweep, `pendingBinds` background recovery, `--also-listen`, installation identity (`stateId`), `killServerProcess` rename — all stack on unmerged PR #1 (c5bdea4: `findRunningServer`, `src/local-address.js`, bind-path rework) and the deferred 2430a3f (bind-durability tests); re-evaluate after PR #1 merges. MERGE HAZARD: PR #1 rewrites this bind region from pre-edc0607 lavish, so merging it will silently move the declarations back below the loop — keep the hoist when resolving.
- `69574a8` chore(main): release lavish-axi 0.1.78 (#372) — pulado: release-please (`CHANGELOG.md`, version bump), never portable
- `f4ed5ff` feat: add standalone answer copying to input playbook (#377) — pulado: playbook guidance-text feature (opt-in artifact-author snippet + README bullet), no Atlas runtime behavior change; could be added natively later with `data-atlas-*` names
- `3d26e6b` docs: trim agent guidance and relocate implementation invariants (#380) — pulado: docs-only (AGENTS.md restructure, which Atlas owns itself) plus a one-line comment pointer to `docs/invariants.md`, a file that does not exist here
- `40cafa2` chore(main): release lavish-axi 0.1.79 (#378) — pulado: release-please (`CHANGELOG.md`, version bump), never portable

## d628531..87d6ae9 — avaliado nos open PRs #1, #2, #3 (branches `chore/lavish-sync-*`)

- Range coberto por: PR #1 (c5bdea4 + 20159e0), PR #2 (d5ac546), PR #3 (87d6ae9); skips (releases, b4e82c6 chrome UI, bdf5c78/a3b3987/2da85ba CI/skill, 2430a3f temporário) registrados nos logs daqueles branches. Este arquivo ainda não existe na `main`; ele será combinado no merge.
