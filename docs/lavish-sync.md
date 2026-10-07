# Lavish sync log

last-verified: 95cf540166d3d8a00e65ea9cd8bbd455016b028b

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
- `d5ac546` feat: add exclusive visible poll listeners (#358) — portado em `7722d80` (on main via merged PR #2; exclusive per-session poll ownership with `LISTENER_ACTIVE`/`LISTENER_REPLACED`, `--owner`/`--takeover`, atomic `--agent-reply` via `POST /api/poll`, presence modes, `/health` listeners; adapted: Atlas Core naming; Herdr `onResponse` hook restored after rebase onto PR #1)
- `90b7ff9` chore(main): release lavish-axi 0.1.75 (#359) — pulado: release-please, never portable
- `b4e82c6` feat(chrome): add revision legend for agent-declared artifact edits (#361) — pulado: new chrome UI surface (legend drawer + chrome CSS + design-guidance text), not runtime motor
- `47e690b` chore(main): release lavish-axi 0.1.76 (#364) — pulado: release-please, never portable
- `bdf5c78` Pin no-mistakes required-check caller to v1.80.1 (T2) (#365) — pulado: CI workflow pin, not motor (pin bumps ship in deliberate separate PRs)

## 2026-09-22 — bdf5c78..87d6ae9 (4 commits)

- `a3b3987` fix: clarify HTML file output in the Lavish skill (#344) — pulado: skill description/marketing text only (`lavish` branding), not motor
- `2da85ba` ci: exempt kunchenguid from no-mistakes required gate (#367) — pulado: upstream-author-specific CI gate change, not runtime motor
- `b7e59cb` chore(main): release lavish-axi 0.1.77 (#366) — pulado: release-please (`CHANGELOG.md`, version bump), never portable
- `87d6ae9` fix(server): keep the reviewer's artifact load across a server restart (#371) — portado em `4324ea1` (durable `session.artifact_load` epoch + restore-on-first-access with handoff rebind, all-or-nothing record validation, restart/fence/corruption tests; adapted: test tmpdir prefixes `atlas-serve-`/`atlas-store-`, server-test comment cites upstream lavish-axi#369/#371 instead of `npx lavish-axi`, dummy `localhost:4387` URLs kept per this file's existing never-dialed convention)

## 2026-09-28 — 87d6ae9..40cafa2 (5 commits)

- `edc0607` fix: keep one review server reachable across network changes (#374) — PARCIAL, portado em `eb43c8b`: hoisted `idleTimer` + `attachmentSweepTimer` above the bind loop (upstream's TDZ fix; `bindRecoveryTimer` does not exist here) with a regression test that attaches a live-event client during Tailscale bind retries; no other behavior change. RESTO DIFERIDO (temporário): CLI discovery sweep, `pendingBinds` background recovery, `--also-listen`, installation identity (`stateId`), `killServerProcess` rename — stack on deferred 2430a3f / follow-up bind-path work even though PR #1 durability scaffolding is now on main; re-evaluate in a later sync. Note: hoist kept when resolving merge of PR #1 bind-region rewrite.
- `69574a8` chore(main): release lavish-axi 0.1.78 (#372) — pulado: release-please (`CHANGELOG.md`, version bump), never portable
- `f4ed5ff` feat: add standalone answer copying to input playbook (#377) — pulado: playbook guidance-text feature (opt-in artifact-author snippet + README bullet), no Atlas runtime behavior change; could be added natively later with `data-atlas-*` names
- `3d26e6b` docs: trim agent guidance and relocate implementation invariants (#380) — pulado: docs-only (AGENTS.md restructure, which Atlas owns itself) plus a one-line comment pointer to `docs/invariants.md`, a file that does not exist here
- `40cafa2` chore(main): release lavish-axi 0.1.79 (#378) — pulado: release-please (`CHANGELOG.md`, version bump), never portable

## 2026-10-01 — ae66e1a..a2a199c (2 commits)

- `ae66e1a` feat(cli): add a reply command with server acceptance receipt (#392) — portado em `d7aea2e`: new `atlas-core reply` command (receipt via `postAgentReply`, 10s `AGENT_REPLY_RECEIPT_TIMEOUT_MS`, `SESSION_ENDED` on 409), `POST /api/:key/agent-reply` 409s ended sessions (`addAgentReply` `requireOpen`), reply/poll help + home/open/feedback guidance, skill pointer, README rows, `test/cli-reply.test.js`. ADAPTAÇÕES after rebase onto merged PRs #1–#4: (1) `poll --agent-reply` uses the atomic `POST /api/poll` claim from PR #2 (`publishAgentReply`) rather than a pre-poll `postPollAgentReply` to the receipt endpoint; (2) `board` → `review page` in CLI strings; (3) presence modes from PR #2 are present; (4) the `docs/invariants.md` hunk was folded into the matching `AGENTS.md` line (that file does not exist here); the README skill-stub sentence hunk had no Atlas counterpart and was skipped.
- `a2a199c` chore(main): release lavish-axi 0.1.80 (#393) — pulado: release-please (`CHANGELOG.md`, version bump), never portable

## 2026-10-01 — fechamento das lacunas do motor

- Referência permanece `a2a199cd2275ab4d5cea1b94d42e2479bda36321` (Lavish 0.1.80).
- `2430a3f` — porte concluído: handler HTTP mantido após listen, registro fatal no bootstrap e regressões de log/saída.
- `edc0607` — porte concluído: loopback obrigatório e primeiro, recuperação `pendingBinds` no processo, avisos/URLs/allowlist dinâmicos, descoberta paralela em interfaces locais, identidade `state_id`/`state_dir`, controle de duplicados e PID por endereço, preservação via `--also-listen`, nomes DNS pendentes e presença de home/hooks pela descoberta limitada.
- Endurecimento após revisão: revalidação da instalação em leituras novas e antes de SIGTERM, header `Atlas-State-Id` conferido no shutdown, e prazo absoluto na sondagem de ownership de loopback; as respectivas regressões falharam antes das correções.
- Adaptações mantidas: nomes e variáveis Atlas, porta 4397, distribuição por clone local, fontes/visual OLED e recusa de `poll --agent-reply` após encerramento.
- Legenda de revisões (`b4e82c6`) e cópia de resposta no playbook (`f4ed5ff`) permanecem diferenças de produto fora deste porte de runtime.
- A auditoria original continua preservada em `docs/lavish-engine-audit-2026-10-01.md`; a resolução e a validação deste porte estão registradas ao final dela.

- Validação final: check completo aprovado (1.375 testes, zero falhas, nove opcionais não executados; skill/plugin atualizados) e revisão independente aprovada.

## 2026-10-05 — a2a199c..95cf540 (4 commits)

- `5f0be78` feat(chrome): edit queued annotations in place (#394) — pulado: nova superfície de UI no chrome (editor de notas enfileiradas, controles/CSS e protocolo SDK de abertura do editor), seguindo o precedente de `b4e82c6`; as correções de seleção e preservação de rascunho deste commit pertencem ao editor novo, ausente no Atlas.
- `7369205` chore(main): release lavish-axi 0.1.81 (#395) — pulado: release-please (`CHANGELOG.md`, `.release-please-manifest.json`, versões de `package.json` e `plugin.json`), nunca portável.
- `2ca57dd` fix(sdk): let interactive ARIA widgets pass through annotation (#397) — portado: widgets com roles ARIA interativos e seus descendentes deixam passar cliques em modo de anotação, enquanto links `<a href>` com esses roles ou dentro dos widgets continuam anotáveis; cursor correspondente, README, playbook input e invariante em `AGENTS.md` atualizados. Adaptado: nomes `atlas`/`data-atlas-*`, cor OLED `#6fc7c2` e offset de 3px preservados; `docs/invariants.md` upstream mapeado ao proprietário local `AGENTS.md`. Regressões unitárias e do bundle servido cobrem os roles, links e propagação de cliques. Endurecimento local após revisão: links dentro de um widget externo continuam anotáveis mesmo quando contêm um widget interno (lacuna herdada do upstream); widget isolado dentro de link mantém o comportamento upstream.
- `95cf540` chore(main): release lavish-axi 0.1.82 (#398) — pulado: release-please (`CHANGELOG.md`, `.release-please-manifest.json`, versões de `package.json` e `plugin.json`), nunca portável.

- Validação: `npm run check` completo aprovado (1.385 testes aprovados, zero falhas, nove opcionais pulados; skill/plugin atualizados), com afinidade de uma CPU para serializar `node:test`. A execução paralela excedeu o limite de 1s no teste preexistente `malformed links and images stay literal without stalling`; execução isolada e check serializado aprovados sem alterar esse teste ou o renderer. Revisão independente aprovada após o endurecimento de links aninhados.

## 2026-10-09 — sync seletivo de ca8ca78 (#406)

- `ca8ca78` fix(server): constrain sessions and assets to HTML artifact trees (#406) — portado via `cherry-pick -x`: `POST /api/sessions` recusa caminhos que não sejam arquivo `.html`/`.htm` regular após `realpath` (novo `src/artifact-path.js`, `isHtmlPath` compartilhado com a CLI); `/artifact/:key/<path>` serve só a árvore do diretório do HTML; sessões antigas não-HTML em `state.json` são recusadas em `/artifact`, `/session/:key`, export, share e mermaid-sources. Adaptado: hunk de `docs/invariants.md` mapeado ao proprietário local `AGENTS.md` (`.lavish/` → `.atlas/`); prefixos de temp dir `lavish-*` → `atlas-*` nos testes.
- Seletivo: `8c12ff2` (#399), `cd202ac` (#400) e releases `6474c6a`/`8039751` não avaliados neste sync; `last-verified` permanece `95cf540`.
- Versão: `package.json`/`plugin.json` 0.1.72 → 0.1.82, alinhada à última base Lavish integralmente verificada (0.1.82) mais este porte; 0.1.84 não foi usado porque implicaria #399/#400, ausentes.
