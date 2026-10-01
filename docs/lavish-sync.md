# Lavish sync log

last-verified: a2a199cd2275ab4d5cea1b94d42e2479bda36321

## 2026-10-01 — ae66e1a..a2a199c (2 commits)

- `ae66e1a` feat(cli): add a reply command with server acceptance receipt (#392) — portado em `d7aea2e`: new `atlas-core reply` command (receipt via `postAgentReply`, 10s `AGENT_REPLY_RECEIPT_TIMEOUT_MS`, `SESSION_ENDED` on 409), `POST /api/:key/agent-reply` 409s ended sessions (`addAgentReply` `requireOpen`), reply/poll help + home/open/feedback guidance, skill pointer, README rows, `test/cli-reply.test.js`. ADAPTAÇÕES: (1) `poll --agent-reply` keeps working on ended sessions via new `postPollAgentReply`, which tolerates the 409-ended outcome and keeps polling — Atlas posts poll replies through the same endpoint and has no upstream atomic claim path yet (unmerged PR #2), so unlike upstream the refused text stays undelivered and the ported test asserts `status: ended` + unchanged transcript instead of "Poll still posts"; (2) `board` → `review page` in CLI strings; (3) dropped the `mode: agent-busy` presence assertion (Atlas presence has no mode yet); (4) the `docs/invariants.md` hunk was folded into the matching `AGENTS.md` line (that file does not exist here); the README skill-stub sentence hunk had no Atlas counterpart and was skipped.
- `a2a199c` chore(main): release lavish-axi 0.1.80 (#393) — pulado: release-please (`CHANGELOG.md`, version bump), never portable

## d628531..40cafa2 — avaliado nos open PRs #1, #2, #3, #4 (branches `chore/lavish-sync-*`)

- Range coberto por: PR #1 (c5bdea4 + 20159e0), PR #2 (d5ac546), PR #3 (87d6ae9), PR #4 (edc0607 parcial + log até 40cafa2); skips registrados nos logs daqueles branches. Este arquivo ainda não existe na `main`; ele será combinado no merge.
