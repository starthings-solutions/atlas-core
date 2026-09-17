# QA visual — Lavish OLED Chrome Fork

**Data:** 2026-09-17

**Commit auditado:** `025f890` (mais as correções de QA registradas nesta worktree antes do commit final)
**Escopo:** chrome OLED; o pacote e a CLI permanecem `lavish-axi`.

## Gate automatizado

| Verificação                 | Evidência                                                                                                                                                                                                                                                                                                                     | Resultado                                                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Unit/focused                | `node --test test/chrome-client-queue.test.js test/server.test.js test/package-json.test.js`                                                                                                                                                                                                                                  | PASS (501 testes)                                                                                                                        |
| Chrome focado               | `LAVISH_AXI_BROWSER_E2E=1 node --test test/chrome-theme.browser.test.js test/mobile-conversation-sheet.browser.test.js`                                                                                                                                                                                                       | PASS (2/2, sem skips); pós-correção: `/tmp/lavish-task8-focused-post-p1.log`                                                             |
| Browser do motor preservado | `PATH="$PWD/.superpowers/sdd/2026-09-17-lavish-oled-chrome-fork:$PATH" CHROME_DEVTOOLS_AXI_PORT=10226 LAVISH_AXI_BROWSER_E2E=1 node --test --test-concurrency=1 test/whiteboard-render.browser.test.js test/event-transport.browser.test.js test/layout-warning-inbox.browser.test.js test/attachment-upload.browser.test.js` | PASS (6/6, sem skips): `/tmp/lavish-task8-preserved-browser-precommit.log`                                                               |
| Gate completo               | `pnpm run check`                                                                                                                                                                                                                                                                                                              | PASS; 1.286 testes, 1.278 pass, 0 fail, 8 skips opt-in de browser no `npm test` padrão: `/tmp/lavish-task8-check-precommit.log`          |
| Empacotamento               | `npm pack --dry-run --json`                                                                                                                                                                                                                                                                                                   | PASS; 48 entradas; `LICENSE`, `README.md`, `THIRD-PARTY-NOTICES.md` e as quatro fontes `.woff2` presentes: `/tmp/lavish-task8-pack.json` |

Adaptações de ambiente, usadas somente nas suítes browser antigas: o wrapper de compatibilidade `chrome-devtools-axi` foi posto primeiro no `PATH`, e uma porta livre exclusiva (`10226`) foi configurada. Nenhuma bridge de terceiros foi encerrada. A versão 0.1.34 também não encerra `--dump-dom` para o fixture Excalidraw porque há trabalho de animação contínuo; o teste de whiteboard passou a obter exclusivamente a URL `/result` pelo CDP efêmero (`--remote-debugging-port=0`), mantendo as mesmas asserções de resultado e limpeza do grupo de processo.

## Exercício manual e capturas

O fixture temporário fora do repositório foi `/tmp/lavish-task8-mermaid-fixture.html`, servido pela CLI desta worktree. Ele contém texto anotável, tabela e Mermaid. Foram confirmados o diagrama renderizado, o desbloqueio do whiteboard, fullscreen abrir/fechar, queue, envio e agent reply; as mensagens e a fila permaneceram no transcript ao fechar o drawer. Evidência: `/tmp/lavish-task8-manual-{snapshot,whiteboard-snapshot,unlocked-snapshot,queued-snapshot,fullscreen-snapshot,after-close-snapshot,after-send-snapshot,agent-snapshot}.txt` e capturas `/tmp/lavish-task8-{desktop-1440-closed,desktop-1440-open,whiteboard-unlocked,whiteboard-fullscreen}.png`.

| Viewport/estado                          | Resultado                                                                                     | Captura/evidência                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Desktop 1440×1000, drawer fechado/aberto | rail 48px, drawer 360px; iframe permaneceu 1392×944 nos dois estados; sem overflow horizontal | `/tmp/lavish-oled-visual-audit-Nunv6T/01-desktop-closed-1440x1000.png`, `02-desktop-open-1440x1000.png` |
| Mobile 390×844, docked/aberto            | sem clipping ou overflow; alvos coarse >=44px                                                 | `/tmp/lavish-oled-touch-reaudit-NWbuJm`                                                                 |
| Mobile curto 375×548, attachments        | composer y=272..548, controles e anexos visíveis, sem interseção/overflow                     | `/tmp/lavish-task8-mobile-375x548-postfix-open.png`, `/tmp/lavish-oled-touch-reaudit-NWbuJm`            |
| Referência externa                       | 390, 768 e 1200px inspecionados; sem clipping perceptível                                     | `/tmp/oled-reference-390.png`, `/tmp/oled-reference-768.png`, `/tmp/oled-reference-1200.png`            |

No teste manual de geometria, o bounding box do iframe antes/depois de abrir o drawer foi exatamente `{ left: 0, right: 1857, width: 1857 }`. A auditoria em 1440px confirma a mesma propriedade em coordenadas de viewport normais (1392×944). O iframe segue branco externamente; sua aparência interna continua de propriedade do conteúdo.

## Acessibilidade e linguagem visual

- Contraste medido: texto primário 18,25:1; activity 10,13:1; danger 7,24:1; cinza pequeno 4,54:1.
- A auditoria visual não encontrou P0. O P1 de alvos móveis foi corrigido com um teste RED/GREEN: `/tmp/lavish-task8-mobile-target-red.log`, `/tmp/lavish-task8-mobile-target-green.log`. Em 390 e 375px, annotation=95×44, more/toggle=44×44, attach=109×44, send/end=123×44 e send=115×44.
- Sem gradiente, glow ou sombra de elevação observados. Foco e hierarquia permaneceram legíveis.
- A paleta categórica `--c1..--c5` permaneceu byte-equivalente; nenhuma regra de chrome atravessa o iframe.
- As fontes são distribuídas offline no pacote e atribuídas em `THIRD-PARTY-NOTICES.md`.

## Contratos protegidos e respostas da revisão

Hashes verificados:

```
967386cf500a47b1c4c646f2f21da369a2a4fff95e29e0b85e421872dc0697e5  src/artifact-sdk.js
305976bdbcd858374092597f8365fd703ad6ca2dd6a725e46dbf8bf97698c8b4  src/whiteboard-frame.js
3d97d6d978bb90843a438ed41d975a7655133029c0a84d120f915efbbaa150ab  src/design-reference.js
```

| Pergunta do passo 8                                 | Resposta                                     |
| --------------------------------------------------- | -------------------------------------------- |
| Algum CSS atravessa o iframe?                       | Não.                                         |
| Algum protocolo, nome ou storage foi renomeado?     | Não.                                         |
| Desktop sempre inicia fechado?                      | Sim.                                         |
| Abrir preserva `frame.left/right/width`?            | Sim, medido.                                 |
| Mobile continua persistindo e respondendo a gestos? | Sim, nos testes browser e na inspeção touch. |
| `--c1..--c5` continua byte-equivalente?             | Sim.                                         |
| Fontes funcionam sem rede e têm atribuição?         | Sim.                                         |

`git diff --check` não reportou whitespace; a allowlist inversa contra `4413dcc8eff35cdc659e2035b94194d3c9be55fa` aceitou somente `src/chrome.css`, `src/chrome-client.js` e `src/server.js`.

## Known limitations

- O chevron vertical do drawer desktop pode ser lido de forma ambígua para uma abertura horizontal (P2, não bloqueante).
- O estado compacto `○` de agent-not-listening tem nome acessível, mas poderia ganhar tooltip/explicação visual (P2, não bloqueante).
- O relay usado pelo teste de live-reload é exclusivamente do fixture para contornar a limitação de input cross-origin/shadow do AXI 0.1.34; não muda o protocolo nem o produto.
