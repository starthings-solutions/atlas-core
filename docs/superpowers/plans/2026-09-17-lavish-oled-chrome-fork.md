# Lavish OLED Chrome Fork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um fork compatível do Lavish no qual o motor original de artefatos, Mermaid e Excalidraw permanece intacto, enquanto o chrome adota OLED Sunset Calm e a conversa desktop passa a abrir fechada em um drawer sobreposto que nunca redimensiona o iframe.

**Architecture:** Manter o protocolo, o SDK e o renderer como zona protegida. Acrescentar um controlador de divulgação desktop ao controlador mobile já existente, fazendo ambos derivarem `aria-expanded`, `inert`, foco e resumo de uma única função de estado. Reservar um trilho desktop de `48px` na grade e posicionar o painel de `360px` de forma absoluta sobre essa grade, para que a abertura cresça para a esquerda sem alterar a geometria do iframe. Separar os tokens semânticos `--app-*` da paleta categórica `--c1..--c5`, inclusive na referência viva em `@design-concept`.

**Tech Stack:** Node.js 22, JavaScript ESM, Express 5, CSS puro, `node:test`, `pnpm`, `chrome-devtools-axi`, Archivo Variable, IBM Plex Mono.

**Spec:** `docs/superpowers/specs/2026-09-17-lavish-oled-chrome-fork-design.md`

## Global Constraints

- Não editar `src/artifact-sdk.js`, a conversão Mermaid/Excalidraw, o frame do whiteboard ou os contratos `lavish:*`.
- Não alterar nomes públicos, `LAVISH_AXI_*`, portas, storage da fila, storage mobile existente, pacote ou comando nesta fase.
- Não aplicar tema, filtro, `color-scheme` ou CSS dentro do iframe. Manter `.frame { background: #fff; }` para artefatos transparentes.
- No desktop, o drawer começa fechado em cada carregamento e não grava estado em `sessionStorage`.
- No mobile, preservar o bottom sheet, gestos, viewport visual, safe areas e persistência atuais abaixo de `860px`.
- Sunset Calm pertence ao chrome da aplicação. Diagramas e dados mantêm `#ffffff`, `#f5451b`, `#0091c8`, `#00a06b`, `#9463ff`.
- Fazer cada mudança comportamental em ciclo RED → GREEN → REFACTOR; nunca alterar um teste apenas para refletir a implementação.
- Executar comandos e commits a partir da worktree isolada aprovada para a implementação. Preservar a spec já existente caso ela ainda esteja staged no checkout principal.
- Não publicar remoto, pacote npm ou release.

---

## Task 1: Preparar a worktree e fixar a linha de base

**Files:**

- Inspect: `package.json`
- Inspect: `pnpm-lock.yaml`
- Inspect: `src/artifact-sdk.js`
- Inspect: `src/whiteboard-frame.js`
- Inspect: `src/design-reference.js`
- Preserve: `docs/superpowers/specs/2026-09-17-lavish-oled-chrome-fork-design.md`
- Preserve: `docs/superpowers/plans/2026-09-17-lavish-oled-chrome-fork.md`

- [ ] **Step 1: Configurar a identidade Git fornecida pelo usuário**

  Verificar sem alterar configuração:

  ```bash
  cd /home/dev/@development/lavish-axi
  git config --get user.name
  git config --get user.email
  ```

  Se um valor faltar, parar até o usuário fornecer nome e e-mail. Configurar somente neste repositório, com os valores literais fornecidos por ele:

  ```bash
  git config --local user.name "<NOME FORNECIDO>"
  git config --local user.email "<EMAIL FORNECIDO>"
  ```

  Não inventar identidade e não modificar configuração global.

- [ ] **Step 2: Versionar a decisão aprovada antes de criar a worktree**

  Depois do consentimento explícito para a worktree, verificar primeiro se `.worktrees/` já é ignorado:

  ```bash
  cd /home/dev/@development/lavish-axi
  git check-ignore -q .worktrees
  ```

  Se o comando retornar status `1`, acrescentar `.worktrees/` a `.gitignore` com um patch real e confirmar novamente. Então versionar juntos `.gitignore` (se alterado), spec e plano:

  ```bash
  git add .gitignore docs/superpowers/specs/2026-09-17-lavish-oled-chrome-fork-design.md docs/superpowers/plans/2026-09-17-lavish-oled-chrome-fork.md
  git commit -m "docs: approve oled chrome fork plan"
  ```

  Confirmar `git status --short` vazio. Assim a worktree nasce contendo a spec e o plano aprovados.

- [ ] **Step 3: Criar a worktree isolada**

  ```bash
  git worktree add .worktrees/lavish-oled-chrome -b feat/lavish-oled-chrome
  ```

- [ ] **Step 4: Instalar exatamente o lockfile e registrar o baseline**

  ```bash
  cd /home/dev/@development/lavish-axi/.worktrees/lavish-oled-chrome
  pnpm install --frozen-lockfile
  pnpm exec prettier --write \
    docs/superpowers/specs/2026-09-17-lavish-oled-chrome-fork-design.md \
    docs/superpowers/plans/2026-09-17-lavish-oled-chrome-fork.md
  if ! git diff --quiet -- docs/superpowers; then
    git add docs/superpowers
    git commit -m "style: format oled fork planning docs"
  fi
  pnpm run check
  ```

  Resultado esperado: a suíte upstream passa antes da mudança. Se não passar, registrar a falha preexistente e corrigi-la ou isolá-la antes de continuar; não misturar uma falha de baseline ao redesign.

- [ ] **Step 5: Rodar a caracterização browser existente**

  ```bash
  LAVISH_AXI_BROWSER_E2E=1 node --test test/mobile-conversation-sheet.browser.test.js
  ```

  Resultado esperado: o teste upstream passa com o painel desktop lado a lado e o bottom sheet mobile atual. Esta execução prova o ponto de partida que o novo teste desktop substituirá.

- [ ] **Step 6: Registrar hashes da zona protegida**

  ```bash
  sha256sum src/artifact-sdk.js src/whiteboard-frame.js src/design-reference.js
  git diff --stat
  ```

  Guardar a saída no log da tarefa. Não criar arquivos de hash no repositório.

---

## Task 2: Vendorizar as fontes do chrome e servi-las offline

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `scripts/build.js`
- Modify: `src/server.js:83-101`
- Modify: `src/server.js:1294-1323`
- Modify: `src/chrome.css:1-107`
- Modify: `test/server.test.js`
- Modify: `test/package-json.test.js`
- Modify: `THIRD-PARTY-NOTICES.md`

- [ ] **Step 1: Escrever o teste RED da rota de fontes**

  Adicionar a `test/server.test.js` um teste de comportamento real do servidor:

  ```js
  test("/chrome-fonts serves vendored application fonts and rejects unknown assets", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "lavish-fonts-"));
    const server = await serve({ port: 0, stateFile: path.join(dir, "state.json"), version: "9.9.9-test" });
    try {
      const base = `http://127.0.0.1:${server.port}`;
      for (const asset of [
        "archivo-latin-wdth-normal.woff2",
        "ibm-plex-mono-latin-400-normal.woff2",
        "ibm-plex-mono-latin-500-normal.woff2",
        "ibm-plex-mono-latin-600-normal.woff2",
      ]) {
        const response = await fetch(`${base}/chrome-fonts/${asset}`);
        assert.equal(response.status, 200, asset);
        assert.match(response.headers.get("content-type") || "", /font\/woff2|application\/font-woff/);
        assert.ok((await response.arrayBuffer()).byteLength > 1_000, asset);
      }
      assert.equal((await fetch(`${base}/chrome-fonts/not-a-font.woff2`)).status, 404);
    } finally {
      await server.close();
      await rm(dir, { recursive: true, force: true });
    }
  });
  ```

- [ ] **Step 2: Escrever o teste RED do artefato de build**

  Substituir o teste de inspeção textual de `scripts/build.js` por um contrato sobre o resultado real em `test/package-json.test.js`:

  ```js
  test("build vendors the chrome font files shipped in dist", async () => {
    for (const asset of CHROME_FONT_ASSETS) {
      const data = await readFile(new URL(`../dist/chrome-fonts/${asset}`, import.meta.url));
      assert.ok(data.byteLength > 1_000, asset);
    }
  });
  ```

  Definir `CHROME_FONT_ASSETS` no teste com os quatro nomes acima. Rodar:

  ```bash
  node --test test/server.test.js test/package-json.test.js
  ```

  Resultado esperado: FAIL porque a rota e os arquivos `dist/chrome-fonts` ainda não existem.

- [ ] **Step 3: Adicionar dependências exatas e cópia de build**

  ```bash
  pnpm add --save-dev --save-exact @fontsource-variable/archivo@5.3.0 @fontsource/ibm-plex-mono@5.3.0
  ```

  Em `scripts/build.js`, criar `dist/chrome-fonts/` e copiar:

  ```js
  const chromeFonts = [
    ["node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2", "archivo-latin-wdth-normal.woff2"],
    ["node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", "ibm-plex-mono-latin-400-normal.woff2"],
    ["node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", "ibm-plex-mono-latin-500-normal.woff2"],
    ["node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2", "ibm-plex-mono-latin-600-normal.woff2"],
  ];
  await mkdir("dist/chrome-fonts", { recursive: true });
  for (const [source, name] of chromeFonts) await copyFile(source, `dist/chrome-fonts/${name}`);
  ```

- [ ] **Step 4: Implementar o mapa allowlist da rota**

  Em `src/server.js`, espelhar a estratégia `packaged`/`source` de `designAssetUrls`, mas ler `Buffer`, não UTF-8:

  ```js
  const chromeFontAssetUrls = {
    "archivo-latin-wdth-normal.woff2": {
      packaged: new URL("./chrome-fonts/archivo-latin-wdth-normal.woff2", import.meta.url),
      source: new URL("../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2", import.meta.url),
    },
    "ibm-plex-mono-latin-400-normal.woff2": {
      packaged: new URL("./chrome-fonts/ibm-plex-mono-latin-400-normal.woff2", import.meta.url),
      source: new URL("../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", import.meta.url),
    },
    "ibm-plex-mono-latin-500-normal.woff2": {
      packaged: new URL("./chrome-fonts/ibm-plex-mono-latin-500-normal.woff2", import.meta.url),
      source: new URL("../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", import.meta.url),
    },
    "ibm-plex-mono-latin-600-normal.woff2": {
      packaged: new URL("./chrome-fonts/ibm-plex-mono-latin-600-normal.woff2", import.meta.url),
      source: new URL("../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2", import.meta.url),
    },
  };

  async function readAssetWithFallback(asset, encoding) {
    try {
      return await readFile(asset.packaged, encoding);
    } catch (error) {
      if (error && error.code !== "ENOENT") throw error;
      return readFile(asset.source, encoding);
    }
  }

  function readDesignAsset(asset) {
    return readAssetWithFallback(asset, "utf8");
  }

  function readChromeFontAsset(asset) {
    return readAssetWithFallback(asset);
  }

  app.get("/chrome-fonts/:asset", async (req, res, next) => {
    try {
      const asset = chromeFontAssetUrls[req.params.asset];
      if (!asset) return res.status(404).send("Not found");
      res.type("font/woff2").send(await readChromeFontAsset(asset));
    } catch (error) {
      next(error);
    }
  });
  ```

  Substituir o helper `readDesignAsset` atual pelas duas funções acima. `/design` continua lendo UTF-8; fontes retornam `Buffer`.

- [ ] **Step 5: Declarar as famílias sem depender da rede**

  No início de `src/chrome.css`:

  ```css
  @font-face {
    font-family: "Archivo";
    src: url("/chrome-fonts/archivo-latin-wdth-normal.woff2") format("woff2");
    font-style: normal;
    font-weight: 100 900;
    font-stretch: 62% 125%;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Mono";
    src: url("/chrome-fonts/ibm-plex-mono-latin-400-normal.woff2") format("woff2");
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Mono";
    src: url("/chrome-fonts/ibm-plex-mono-latin-500-normal.woff2") format("woff2");
    font-style: normal;
    font-weight: 500;
    font-display: swap;
  }
  @font-face {
    font-family: "IBM Plex Mono";
    src: url("/chrome-fonts/ibm-plex-mono-latin-600-normal.woff2") format("woff2");
    font-style: normal;
    font-weight: 600;
    font-display: swap;
  }
  ```

  Somente alterar os aliases de família neste passo; o tema completo entra na Task 5.

- [ ] **Step 6: Atualizar atribuição e fazer GREEN**

  Adicionar Archivo e IBM Plex Mono, ambos SIL OFL 1.1, a `THIRD-PARTY-NOTICES.md`.

  ```bash
  pnpm run build
  node --test test/server.test.js test/package-json.test.js
  pnpm exec eslint src/server.js scripts/build.js test/server.test.js test/package-json.test.js
  ```

  Resultado esperado: PASS; fontes são servidas em execução source e existem no `dist/` publicado.

- [ ] **Step 7: Commit**

  ```bash
  git add package.json pnpm-lock.yaml scripts/build.js src/server.js src/chrome.css test/server.test.js test/package-json.test.js THIRD-PARTY-NOTICES.md
  git commit -m "feat: vendor oled chrome fonts"
  ```

---

## Task 3: Unificar o estado da conversa desktop e mobile

**Files:**

- Modify: `test/chrome-client-queue.test.js:67-618`
- Modify: `test/chrome-client-queue.test.js:6875-7088`
- Modify: `test/server.test.js:828-846`
- Modify: `src/server.js:2267-2312`
- Modify: `src/server.js:2520`
- Modify: `src/chrome-client.js:1126-1316`
- Modify: `src/chrome-client.js:2508-2525`
- Modify: `src/chrome-client.js:3951-3966`
- Modify: `src/chrome-client.js:4045`

- [ ] **Step 1: Estender o harness e escrever os testes RED do desktop**

  Renomear `sheetState()` para `conversationState()` e expor os estados de divulgação separadamente:

  ```js
  function conversationState(chrome) {
    const toggle = chrome.element("panelToggle");
    return {
      drawerOpen: chrome.element("body").classList.contains("drawer-open"),
      sheetOpen: chrome.element("body").classList.contains("sheet-open"),
      scrollInert: Boolean(chrome.element("panelScroll").inert),
      composerInert: Boolean(chrome.element("chatComposer").inert),
      expanded: toggle["aria-expanded"],
      label: toggle["aria-label"],
      summary: chrome.element("panelSummary").textContent,
      summaryClass: String(chrome.element("panelSummary").classList),
      summaryShort: chrome.element("panelSummary").dataset.short || "",
      summaryTone: chrome.element("panelSummary").dataset.tone || "neutral",
      stored: chrome.storage.get("lavish-axi:sheet-open:abc") || null,
    };
  }
  ```

  Adicionar testes separados para:

  ```js
  test("desktop conversation boots collapsed and inert", async () => {
    const chrome = await createChromeHarness();
    assert.deepEqual(conversationState(chrome), {
      drawerOpen: false,
      sheetOpen: false,
      scrollInert: true,
      composerInert: true,
      expanded: "false",
      label: "Show conversation",
      summary: "Agent not listening",
      summaryClass: "",
      summaryShort: "○",
      summaryTone: "neutral",
      stored: null,
    });
  });

  test("desktop toggle opens, focuses the composer, closes, and restores focus", async () => {
    const chrome = await createChromeHarness();
    chrome.element("panelToggle").click({ stopPropagation() {} });
    assert.equal(conversationState(chrome).drawerOpen, true);
    assert.equal(conversationState(chrome).scrollInert, false);
    assert.equal(chrome.focusLog.at(-1), "chatInput");
    chrome.element("panelToggle").click({ stopPropagation() {} });
    assert.equal(conversationState(chrome).drawerOpen, false);
    assert.equal(chrome.focusLog.at(-1), "panelToggle");
  });
  ```

  Acrescentar ainda estes casos, cada um independente, com estas asserções centrais:

  ```js
  test("Escape closes an open desktop conversation and restores its trigger", async () => {
    const chrome = await createChromeHarness();
    chrome.element("panelToggle").click();
    const event = chrome.dispatchDocumentKeydown({ key: "Escape" });
    assert.equal(event.defaultPrevented, true);
    assert.equal(conversationState(chrome).drawerOpen, false);
    assert.equal(chrome.focusLog.at(-1), "panelToggle");
  });

  test("desktop disclosure is never persisted across chrome loads", async () => {
    const storage = new Map();
    const first = await createChromeHarness({ storage });
    first.element("panelToggle").click();
    assert.equal(storage.has("lavish-axi:sheet-open:abc"), false);
    const second = await createChromeHarness({ storage });
    assert.equal(conversationState(second).drawerOpen, false);
    assert.equal(conversationState(second).composerInert, true);
  });

  test("a closed desktop rail prioritizes queue, unread reply, then presence", async () => {
    const chrome = await createChromeHarness();
    chrome.eventSource().listeners.get("agent-presence")({ data: JSON.stringify({ state: "listening" }) });
    assert.equal(conversationState(chrome).summaryTone, "activity");
    chrome.eventSource().listeners.get("agent-reply")({ data: JSON.stringify({ text: "Done." }) });
    assert.equal(conversationState(chrome).summaryTone, "feedback");
    assert.match(chrome.element("chatLog").lastAppendedChild.innerHTML, /Done\./);
    chrome.sendFrameMessage({
      type: "lavish:queuePrompt",
      prompt: { prompt: "Rename this", selector: "h2", tag: "element", text: "Payment" },
    });
    assert.equal(conversationState(chrome).summaryTone, "pending");
    assert.equal(conversationState(chrome).summaryShort, "1");
    assert.equal(conversationState(chrome).drawerOpen, false);
  });
  ```

  Adicionar os contratos mobile/breakpoint explicitamente:

  ```js
  test("the mobile toggle stops the following head click from toggling twice", async () => {
    const chrome = await createChromeHarness({ mobile: true });
    let stopped = false;
    chrome.element("panelToggle").click({ stopPropagation() { stopped = true; } });
    if (!stopped) chrome.element("panelHead").dispatch("click", {});
    assert.equal(stopped, true);
    assert.equal(conversationState(chrome).sheetOpen, true);
    chrome.element("panelHead").dispatch("click", {});
    assert.equal(conversationState(chrome).sheetOpen, false);
  });

  test("crossing either breakpoint clears the disclosure mode being left", async () => {
    const chrome = await createChromeHarness({ mobile: true });
    chrome.element("panelHead").dispatch("click", {});
    assert.equal(conversationState(chrome).sheetOpen, true);
    chrome.setMobile(false);
    assert.equal(conversationState(chrome).drawerOpen, false);
    assert.equal(conversationState(chrome).composerInert, true);
    assert.equal(chrome.storage.has("lavish-axi:sheet-open:abc"), false);
    chrome.element("panelToggle").click();
    assert.equal(conversationState(chrome).drawerOpen, true);
    chrome.setMobile(true);
    const narrowed = conversationState(chrome);
    assert.equal(narrowed.drawerOpen, false);
    assert.equal(narrowed.sheetOpen, false);
    assert.equal(narrowed.scrollInert, true);
    assert.equal(narrowed.composerInert, true);
    assert.equal(chrome.focusLog.at(-1), "panelToggle");
  });
  ```

- [ ] **Step 2: Escrever o teste RED do HTML acessível**

  Atualizar o contrato de `createChromeHtml` em `test/server.test.js`:

  ```js
  assert.match(html, /<aside class="panel" id="panel" aria-labelledby="conversationTitle">/);
  assert.match(html, /<h2 id="conversationTitle">Conversation<\/h2>/);
  assert.match(html, /<div class="panel-scroll" id="panelScroll" inert>/);
  assert.match(html, /<div class="composer" id="chatComposer" inert>/);
  ```

  Rodar:

  ```bash
  node --test test/chrome-client-queue.test.js test/server.test.js
  ```

  Resultado esperado: FAIL nos novos contratos; o desktop atual inicia interativo e não possui disclosure próprio.

- [ ] **Step 3: Adicionar o estado inicial seguro no HTML**

  Em `createChromeHtml`, manter a mesma árvore e IDs e fazer exatamente estas substituições de tags de abertura:

  ```text
  <aside class="panel" id="panel">
  → <aside class="panel" id="panel" aria-labelledby="conversationTitle">

  <h2>Conversation</h2>
  → <h2 id="conversationTitle">Conversation</h2>

  <div class="panel-scroll" id="panelScroll">
  → <div class="panel-scroll" id="panelScroll" inert>

  <div class="composer" id="chatComposer">
  → <div class="composer" id="chatComposer" inert>
  ```

  Atualizar o comentário do ícone: o controle atende drawer desktop e bottom sheet mobile.

- [ ] **Step 4: Implementar o controlador unificado mínimo**

  Preservar `sheetOpen` e sua chave existente; adicionar somente estado volátil desktop:

  ```js
  let desktopDrawerOpen = false;

  function isConversationOpen() {
    return isMobileSheet() ? sheetOpen : desktopDrawerOpen;
  }

  function conversationContainsFocus() {
    const activeElement = document.activeElement;
    return Boolean(
      activeElement && (panelScroll.contains(activeElement) || chatComposer.contains(activeElement)),
    );
  }

  function setSheetOpen(open, { restoreFocus = false } = {}) {
    const changed = Boolean(open) !== sheetOpen;
    sheetOpen = Boolean(open);
    try {
      if (sheetOpen) sessionStorage.setItem(sheetStorageKey, "1");
      else sessionStorage.removeItem(sheetStorageKey);
    } catch {
      // Storage refusal preserves only the in-memory mobile intent.
    }
    if (sheetOpen) unreadAgentReply = "";
    applyConversationState();
    if (changed && sheetOpen) scrollPanelToBottom();
    if (changed && !sheetOpen && restoreFocus) panelToggle.focus();
  }

  function setDesktopDrawerOpen(open, { restoreFocus = false } = {}) {
    desktopDrawerOpen = Boolean(open);
    if (desktopDrawerOpen) unreadAgentReply = "";
    applyConversationState();
    if (desktopDrawerOpen) {
      scrollPanelToBottom();
      chatInput.focus();
    } else if (restoreFocus) {
      panelToggle.focus();
    }
  }

  function applyConversationState() {
    const mobile = isMobileSheet();
    const open = mobile ? sheetOpen : desktopDrawerOpen;
    document.body.classList.toggle("sheet-open", mobile && open);
    document.body.classList.toggle("drawer-open", !mobile && open);
    panelScroll.inert = ended || !open;
    chatComposer.inert = ended || !open;
    if (!open && conversationContainsFocus()) panelToggle.focus();
    panelToggle.setAttribute("aria-expanded", open ? "true" : "false");
    panelToggle.setAttribute("aria-label", open ? "Hide conversation" : "Show conversation");
    renderConversationSummary();
  }
  ```

  Fazer breakpoint, `markSessionEnded` e boot chamarem `applyConversationState`. Ao entrar no mobile, zerar `desktopDrawerOpen`; ao sair, zerar `sheetOpen` e remover somente `lavish-axi:sheet-open:${key}`. Só a abertura mobile escreve storage.

  Fazer `conversationSummary()` retornar também `short` e `tone`:

  ```js
  function conversationSummary() {
    if (ended) return { text: "Session ended", short: "×", tone: "risk" };
    if (queued.length) return { text: queued.length === 1 ? "1 queued" : `${queued.length} queued`, short: String(queued.length), tone: "pending" };
    if (unreadAgentReply) return { text: unreadAgentReply, short: "!", tone: "feedback" };
    if (agentPresence === "working") return { text: "Agent is working…", short: "●", tone: "activity" };
    if (agentPresence === "listening") return { text: "Agent listening", short: "●", tone: "activity" };
    return { text: "Agent not listening", short: "○", tone: "neutral" };
  }

  function renderConversationSummary() {
    const summary = conversationSummary();
    panelSummary.textContent = summary.text;
    panelSummary.dataset.short = summary.short;
    panelSummary.dataset.tone = summary.tone;
    for (const tone of ["pending", "feedback", "risk", "activity"])
      panelSummary.classList.toggle(`is-${tone}`, summary.tone === tone);
  }
  ```

- [ ] **Step 5: Ligar controle, unread e Escape sem double-toggle**

  ```js
  panelToggle.addEventListener("click", (event) => {
    event.stopPropagation?.();
    if (isMobileSheet()) setSheetOpen(!sheetOpen);
    else setDesktopDrawerOpen(!desktopDrawerOpen, { restoreFocus: desktopDrawerOpen });
  });

  function noteAgentReply(text) {
    if (isConversationOpen()) return;
    unreadAgentReply = String(text || "");
    renderConversationSummary();
    pulseConversationDock();
  }
  ```

  O handler de `panelHead` continua exclusivo do mobile. No handler de Escape, depois dos overlays de maior prioridade:

  ```js
  } else if (isMobileSheet() && sheetOpen) {
    event.preventDefault();
    setSheetOpen(false, { restoreFocus: true });
  } else if (!isMobileSheet() && desktopDrawerOpen) {
    event.preventDefault();
    setDesktopDrawerOpen(false, { restoreFocus: true });
  }
  ```

- [ ] **Step 6: Fazer GREEN e refatorar nomes**

  Renomear `sheetSummary`, `renderSheetSummary` e `pulseSheetDock` para `conversationSummary`, `renderConversationSummary` e `pulseConversationDock`. Não renomear a chave mobile.

  ```bash
  node --test test/chrome-client-queue.test.js test/server.test.js
  pnpm exec eslint src/chrome-client.js src/server.js test/chrome-client-queue.test.js test/server.test.js
  ```

  Resultado esperado: todos os casos desktop e todos os casos mobile passam.

- [ ] **Step 7: Commit**

  ```bash
  git add src/server.js src/chrome-client.js test/server.test.js test/chrome-client-queue.test.js
  git commit -m "feat: add collapsed desktop conversation drawer"
  ```

---

## Task 4: Garantir a geometria de overlay sem reflow do artefato

**Files:**

- Create: `test/browser-e2e.js`
- Modify: `test/mobile-conversation-sheet.browser.test.js`
- Modify: `test/server.test.js:3329-3342`
- Modify: `src/chrome.css:894-963`
- Modify: `src/chrome.css:1456-1684`

- [ ] **Step 1: Extrair o driver browser compartilhado sem mudar comportamento**

  Criar `test/browser-e2e.js` com o código abaixo e trocar as definições duplicadas no teste mobile por imports:

  ```js
  import assert from "node:assert/strict";
  import { spawnSync } from "node:child_process";
  import net from "node:net";
  import path from "node:path";
  import { fileURLToPath } from "node:url";

  export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

  export function run(command, args, env = {}, timeout = 45_000) {
    const result = spawnSync(command, args, {
      cwd: repoRoot,
      env: { ...process.env, ...env },
      encoding: "utf8",
      timeout,
    });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
    return `${result.stdout || ""}${result.stderr || ""}`;
  }

  export async function freePort() {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen({ port: 0, host: "127.0.0.1" }, () => resolve(undefined));
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("failed to allocate a TCP port");
    await new Promise((resolve) => server.close(() => resolve(undefined)));
    return address.port;
  }

  export function createChromeDriver({ temp, session }) {
    const env = {
      CHROME_DEVTOOLS_AXI_SESSION: session,
      CHROME_DEVTOOLS_AXI_USER_DATA_DIR: path.join(temp, "chrome"),
    };
    const command = (args, timeout) => run("chrome-devtools-axi", args, env, timeout);
    return {
      env,
      evaluate(expression) {
        const output = command(["eval", expression]);
        const raw = output.match(/result:\s*("(?:[^"\\]|\\.)*")/s)?.[1];
        assert.ok(raw, output);
        let value = JSON.parse(raw);
        while (typeof value === "string") {
          try { value = JSON.parse(value); } catch { break; }
        }
        return value;
      },
      wait(ms) { command(["wait", String(ms)], ms + 45_000); },
      emulate(viewport) { command(["emulate", "--viewport", viewport]); },
      open(url, settleMs = 4_000) {
        command(["open", url]);
        command(["wait", String(settleMs)], settleMs + 45_000);
      },
      stop() { command(["stop"]); },
    };
  }
  ```

  ```bash
  LAVISH_AXI_BROWSER_E2E=1 node --test test/mobile-conversation-sheet.browser.test.js
  ```

  Resultado esperado: PASS idêntico ao baseline; esta é uma refatoração verde.

- [ ] **Step 2: Transformar o browser test em contrato desktop + mobile**

  Expandir o helper `rect()` com `width: Math.round(r.width)` e `GEOMETRY` para retornar `drawerOpen`, retângulos do toggle e do resumo compacto, largura do painel, `overflowX` e ambos os estados `inert`. Trocar somente o primeiro argumento da declaração existente para `"conversation overlays the artifact on desktop and remains a bottom sheet on mobile"`; manter suas opções `skip`, timeout e callback atuais.

  Substituir o bloco desktop por medições antes/depois:

  ```js
  const closed = geometry();
  assert.equal(closed.drawerOpen, false);
  assert.equal(closed.panel.right - closed.panel.left, 48);
  assert.equal(closed.frame.right, closed.viewport.width - 48);
  assert.equal(closed.chat.inert, true);
  assert.equal(closed.documentScrollable, false);
  for (const control of [closed.toggle, closed.summaryRect]) {
    assert.ok(control.left >= closed.panel.left && control.right <= closed.panel.right);
  }

  evaluate('() => { document.getElementById("panelToggle").click(); return "ok"; }');
  wait(300);
  const openDrawer = geometry();
  assert.equal(openDrawer.drawerOpen, true);
  assert.equal(openDrawer.frame.left, closed.frame.left);
  assert.equal(openDrawer.frame.right, closed.frame.right);
  assert.equal(openDrawer.frame.width, closed.frame.width);
  assert.equal(openDrawer.panel.left, openDrawer.viewport.width - 360);
  assert.equal(openDrawer.panel.right, openDrawer.viewport.width);
  assert.equal(openDrawer.chat.inert, false);
  assert.ok(openDrawer.panel.left < openDrawer.frame.right, "drawer overlaps the artifact area");

  open(url, 3000);
  assert.equal(geometry().drawerOpen, false, "desktop disclosure state is not persisted");
  ```

  Comparar explicitamente `frame.left`, `frame.right` e `frame.width`; não depender apenas de um objeto que também contenha alturas sujeitas à fonte.

- [ ] **Step 3: Rodar o teste RED no navegador real**

  ```bash
  LAVISH_AXI_BROWSER_E2E=1 node --test test/mobile-conversation-sheet.browser.test.js
  ```

  Resultado esperado: FAIL porque o painel desktop ainda mede `360px` lado a lado.

- [ ] **Step 4: Implementar o trilho estável e o drawer absoluto**

  Introduzir `--rail-w: 48px` e manter `--panel-w: 360px`. Fora do breakpoint mobile:

  ```css
  .layout {
    position: relative;
    height: calc(100vh - var(--bar-h));
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--rail-w);
  }

  @media (min-width: 861px) {
    .panel {
      position: absolute;
      z-index: 30;
      inset: 0 0 0 auto;
      width: var(--rail-w);
      overflow: hidden;
      transition: width var(--dur) var(--ease);
    }
    body.drawer-open .panel {
      width: min(var(--panel-w), calc(100vw - var(--rail-w)));
    }
    .panel-head,
    .panel-head-row {
      display: flex;
    }
    .panel-head {
      position: relative;
      align-self: flex-end;
      width: var(--panel-w);
      min-width: var(--panel-w);
    }
    .panel-head-row {
      position: relative;
      align-items: center;
      width: 100%;
      min-height: var(--rail-w);
      padding-right: var(--rail-w);
    }
    .panel-toggle {
      position: absolute;
      top: 0;
      right: 0;
      display: grid;
      width: var(--rail-w);
      height: var(--rail-w);
      place-items: center;
    }
    body:not(.drawer-open) .panel h2 {
      visibility: hidden;
    }
    body:not(.drawer-open) .panel-summary {
      position: absolute;
      top: var(--rail-w);
      right: 0;
      display: grid;
      width: var(--rail-w);
      height: var(--rail-w);
      place-items: center;
      overflow: hidden;
      font-size: 0;
    }
    body:not(.drawer-open) .panel-summary::before {
      content: attr(data-short);
      font: 600 var(--text-sm) / 1 var(--font-mono);
    }
    body.drawer-open .panel-summary {
      display: block;
    }
    .panel-scroll,
    .composer {
      width: var(--panel-w);
      min-width: var(--panel-w);
      align-self: flex-end;
      visibility: hidden;
    }
    body.drawer-open .panel-scroll,
    body.drawer-open .composer {
      visibility: visible;
    }
    .panel-scrim {
      display: none;
    }
  }
  ```

  O toggle e o resumo compacto ficam presos à borda direita; o conteúdo de `360px` usa `align-self: flex-end`. Ao fechar, conteúdo interativo fica `inert` e visualmente oculto, mas toggle/resumo continuam dentro dos `48px`. Não usar `transform` no iframe e não criar scrim desktop.

- [ ] **Step 5: Atualizar o smoke test do CSS servido**

  Em `test/server.test.js`, remover a regex da grade side-by-side. Manter somente status `200`, `content-type: text/css` e corpo não vazio nesse teste de rota; a prova de geometria e estilo pertence aos browser tests.

- [ ] **Step 6: Fazer GREEN em desktop e mobile**

  ```bash
  node --test test/server.test.js test/chrome-client-queue.test.js
  LAVISH_AXI_BROWSER_E2E=1 node --test test/mobile-conversation-sheet.browser.test.js
  ```

  Resultado esperado: desktop conserva o iframe pixel a pixel ao abrir; portrait, short phone e landscape continuam passando.

- [ ] **Step 7: Commit**

  ```bash
  git add src/chrome.css test/browser-e2e.js test/server.test.js test/mobile-conversation-sheet.browser.test.js
  git commit -m "feat: overlay conversation without artifact reflow"
  ```

---

## Task 5: Aplicar o tema OLED Sunset Calm somente ao chrome

**Files:**

- Create: `test/chrome-theme.browser.test.js`
- Modify: `src/chrome.css`
- Modify: `test/server.test.js`

- [ ] **Step 1: Escrever um teste browser RED dos estilos computados**

  Usar `test/browser-e2e.js` e começar o arquivo com este esqueleto executável:

  ```js
  import assert from "node:assert/strict";
  import { mkdtemp, rm, writeFile } from "node:fs/promises";
  import { tmpdir } from "node:os";
  import path from "node:path";
  import test from "node:test";

  import { createChromeDriver, freePort, run } from "./browser-e2e.js";

  const runBrowserE2e = process.env.LAVISH_AXI_BROWSER_E2E === "1";

  test("the chrome uses OLED Sunset Calm without styling the artifact", { skip: !runBrowserE2e, timeout: 300_000 }, async () => {
    const temp = await mkdtemp(path.join(tmpdir(), "lavish-chrome-theme-"));
    const port = await freePort();
    const lavishEnv = {
      LAVISH_AXI_PORT: String(port),
      LAVISH_AXI_STATE_DIR: path.join(temp, "state"),
      LAVISH_AXI_NO_OPEN: "1",
      LAVISH_AXI_TELEMETRY: "0",
      LAVISH_AXI_HOST: "127.0.0.1",
      LAVISH_AXI_LINK_HOST: "127.0.0.1",
    };
    const browser = createChromeDriver({ temp, session: `lavish-chrome-theme-${process.pid}` });
    try {
      const artifact = path.join(temp, "theme.html");
      await writeFile(artifact, THEME_ARTIFACT);
      const output = run(process.execPath, ["bin/lavish-axi.js", artifact, "--no-open"], lavishEnv);
      const url = output.match(/url:\s*"([^"]+)"/)?.[1];
      assert.ok(url, output);
      browser.emulate("1440x1000x1");
      browser.open(url);
      const { evaluate, wait, emulate } = browser;
    } finally {
      run(process.execPath, ["bin/lavish-axi.js", "stop", "--port", String(port)], lavishEnv, 15_000);
      browser.stop();
      await rm(temp, { recursive: true, force: true });
    }
  });
  ```

  Dentro do `try`, imediatamente após `browser.open(url)`, acrescentar em ordem os blocos de listener, medição e tons especificados abaixo.

  Definir `THEME_ARTIFACT` imediatamente antes do teste. O fixture declara cores próprias e publica seu estilo por `postMessage`, pois o iframe sandboxed não permite leitura direta:

  ```js
  const THEME_ARTIFACT = `<!doctype html>
  <html><head><meta charset="utf-8">
  <style>html,body{background:rgb(37,51,68);color:rgb(237,226,201)}</style></head>
  <body><main><h1>Artifact-owned theme</h1><p>The chrome must not restyle this content.</p></main>
  <script>
    setInterval(() => parent.postMessage({
      type: "lavish-test:theme-probe",
      background: getComputedStyle(document.body).backgroundColor,
      color: getComputedStyle(document.body).color,
    }, "*"), 100);
  </script></body></html>`;
  ```

  Depois de abrir a sessão, instalar no chrome uma escuta limitada ao `contentWindow` do iframe e aguardar a próxima amostra:

  ```js
  evaluate(`() => {
    const frame = document.getElementById("artifact");
    window.__artifactThemeProbe = null;
    window.addEventListener("message", (event) => {
      if (event.source === frame.contentWindow && event.data?.type === "lavish-test:theme-probe")
        window.__artifactThemeProbe = event.data;
    });
    return "ready";
  }`);
  wait(300);
  ```

  O teste deve medir estilos computados reais, não apenas procurar strings:

  ```js
  const theme = evaluate(`() => {
    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const frame = document.getElementById("artifact");
    return JSON.stringify({
      bodyBg: style("body").backgroundColor,
      bodyFg: style("body").color,
      bodyFont: style("body").fontFamily,
      panelBg: style("#panel").backgroundColor,
      toggleColor: style("#panelToggle").color,
      toggleBorder: style("#panelToggle").borderColor,
      sendBg: style("#send").backgroundColor,
      danger: style("#sendAndEnd").color,
      frameBg: style(".frame").backgroundColor,
      monoFont: style("#panelSummary").fontFamily,
      artifactProbe: window.__artifactThemeProbe,
      frameRightClosed: Math.round(frame.getBoundingClientRect().right),
      radii: ["#panel", "#send", "#chatInput"].map((selector) => style(selector).borderRadius),
      shadows: ["#panel", "#send", "#chatInput"].map((selector) => style(selector).boxShadow),
    });
  }`);
  assert.equal(theme.bodyBg, "rgb(0, 0, 0)");
  assert.equal(theme.bodyFg, "rgb(248, 244, 235)");
  assert.match(theme.bodyFont, /^Archivo/);
  assert.equal(theme.panelBg, "rgb(8, 8, 8)");
  assert.equal(theme.toggleColor, "rgb(111, 199, 194)");
  assert.equal(theme.toggleBorder, "rgb(120, 120, 120)");
  assert.equal(theme.sendBg, "rgb(111, 199, 194)");
  assert.equal(theme.danger, "rgb(248, 113, 113)");
  assert.equal(theme.frameBg, "rgb(255, 255, 255)");
  assert.match(theme.monoFont, /^"?IBM Plex Mono/);
  assert.deepEqual(theme.artifactProbe, {
    type: "lavish-test:theme-probe",
    background: "rgb(37, 51, 68)",
    color: "rgb(237, 226, 201)",
  });
  assert.ok(theme.radii.every((value) => parseFloat(value) <= 3));
  assert.ok(theme.shadows.every((value) => value === "none"));
  ```

  Abrir o drawer e repetir a amostra do fixture para provar que sua cor não mudou:

  ```js
  evaluate('() => { document.getElementById("panelToggle").click(); return "opened"; }');
  wait(300);
  const probeAfterOpen = evaluate("() => JSON.stringify(window.__artifactThemeProbe)");
  assert.deepEqual(probeAfterOpen, theme.artifactProbe);
  const focus = evaluate(`() => {
    const toggle = document.getElementById("panelToggle");
    toggle.focus();
    const style = getComputedStyle(toggle);
    return JSON.stringify({ color: style.outlineColor, width: style.outlineWidth });
  }`);
  assert.deepEqual(focus, { color: "rgb(111, 199, 194)", width: "2px" });
  ```

  Validar cada tom com asserts reais:

  ```js
  for (const [tone, expected, short, label] of [
    ["pending", "rgb(242, 193, 78)", "2", "2 queued"],
    ["feedback", "rgb(255, 179, 134)", "!", "Reply waiting"],
    ["risk", "rgb(248, 113, 113)", "×", "Session ended"],
    ["activity", "rgb(111, 199, 194)", "●", "Agent listening"],
  ]) {
    const state = evaluate(`() => {
      const el = document.getElementById("panelSummary");
      el.className = "panel-summary is-${tone}";
      el.dataset.short = ${JSON.stringify(short)};
      el.textContent = ${JSON.stringify(label)};
      return JSON.stringify({ color: getComputedStyle(el).color, short: el.dataset.short, label: el.textContent });
    }`);
    assert.deepEqual(state, { color: expected, short, label });
  }
  ```

  Por fim, verificar o fundo externo do iframe no mobile:

  ```js
  emulate("390x844x3,mobile,touch");
  wait(300);
  const mobileFrameBg = evaluate('() => getComputedStyle(document.querySelector(".frame")).backgroundColor');
  assert.equal(mobileFrameBg, "rgb(255, 255, 255)");
  ```

- [ ] **Step 2: Rodar RED**

  ```bash
  LAVISH_AXI_BROWSER_E2E=1 node --test test/chrome-theme.browser.test.js
  ```

  Resultado esperado: FAIL com o tema steel/brass atual, raios de `8–14px` e sombras.

- [ ] **Step 3: Substituir os tokens do chrome**

  Definir no `:root`:

  ```css
  :root {
    --void: #000000;
    --surface: #080808;
    --surface-2: #101010;
    --rule: #1b1b1b;
    --dim: #2a2a2a;
    --rule-2: #2e2e2e;
    --ink-3: #787878;
    --ink-2: #a3a3a3;
    --app-ink: #f8f4eb;
    --app-feedback: #ffb386;
    --app-risk: #f87171;
    --app-pending: #f2c14e;
    --app-activity: #6fc7c2;
    --ink-900: var(--void);
    --ink-800: var(--surface);
    --ink-700: var(--surface-2);
    --ink-600: var(--surface-2);
    --steel-700: var(--rule);
    --steel-600: var(--rule-2);
    --steel-500: var(--ink-3);
    --steel-400: var(--ink-3);
    --steel-300: var(--ink-2);
    --steel-200: var(--ink-2);
    --steel-100: var(--app-ink);
    --cream-50: var(--app-ink);
    --cream-100: var(--app-ink);
    --cream-200: var(--ink-2);
    --brass-500: var(--app-activity);
    --brass-400: var(--app-activity);
    --brass-ink: #000000;
    --sage-900: var(--surface-2);
    --sage-700: var(--app-activity);
    --sage-300: var(--app-activity);
    --amber-900: var(--surface-2);
    --amber-700: var(--app-pending);
    --rust-500: var(--app-risk);
    --bg: var(--void);
    --bg-panel: var(--surface);
    --bg-bar: var(--surface-2);
    --bg-elevated: var(--surface-2);
    --fg: var(--app-ink);
    --fg-muted: var(--ink-2);
    --fg-dim: var(--ink-2);
    --fg-faint: var(--ink-3);
    --fg-label: var(--ink-3);
    --border: var(--rule-2);
    --border-subtle: var(--rule);
    --border-strong: var(--dim);
    --border-interactive: var(--ink-3);
    --accent: var(--app-activity);
    --accent-hover: var(--app-ink);
    --accent-ink: #000000;
    --danger: var(--app-risk);
    --pending: var(--app-pending);
    --feedback: var(--app-feedback);
    --font-sans: "Archivo", ui-sans-serif, system-ui, sans-serif;
    --font-serif: var(--font-sans);
    --font-display: var(--font-sans);
    --font-mono: "IBM Plex Mono", ui-monospace, monospace;
    --radius-sm: 1px;
    --radius-md: 2px;
    --radius-lg: 3px;
    --radius-xl: 3px;
    --radius-pill: 3px;
    --w-semibold: 600;
    --hairline: 1px solid var(--border);
    --hairline-subtle: 1px solid var(--border-subtle);
    --shadow-tooltip: none;
    --shadow-floating: none;
  }
  ```

  Os aliases legacy acima impedem variáveis indefinidas durante a migração, mas nenhum mantém os valores steel/brass antigos. Depois de mapear seletores por semântica, remover aliases que deixarem de ter consumidores. Não declarar nem importar `--c1..--c5` no chrome; eles pertencem ao design-concept e aos artefatos.

- [ ] **Step 4: Mapear estados por semântica, não por substituição global**

  Aplicar:

  - `--app-activity`: foco, ação primária, modo de anotação, seleção, presença, sucesso operacional, anexar/copiar concluído;
  - `--app-pending`: fila, envio/processamento, aviso não destrutivo, hint persistente;
  - `--app-feedback`: bolha humana, comentário, autoria e indicador unread;
  - `--app-risk`: falha, inválido, ação destrutiva e sessão terminada;
  - `--app-ink`: texto principal e ícones neutros.

  Componentes com preenchimento pastel usam `color: #000`; não usar `--app-ink` sobre os preenchimentos. Inputs, botões, toggle e outros limites interativos usam `--border-interactive` (`#787878`, acima de `3:1` sobre `#080808`); fios decorativos continuam discretos. Manter `border-radius: 50%` somente em círculos intrínsecos de estado/ícone e reduzir todos os demais contêineres a no máximo `3px`.

- [ ] **Step 5: Remover efeitos proibidos e preservar movimento acessível**

  Remover gradientes, glow e sombras de elevação. Substituir o pulse do dock por mudança de fio/marcador sem blur. Preservar `prefers-reduced-motion`; a transição do drawer deve ser desabilitada nesse modo. No bottom sheet, manter a separação sem alterar sua geometria: usar pseudo-elemento/outline de zero blur em vez de border que acrescente altura. Remover o override mobile que troca o fundo de `.frame`: ele deve continuar `#fff` em todos os breakpoints.

- [ ] **Step 6: Fazer GREEN e verificar ausência de vazamento para o iframe**

  ```bash
  node --test test/server.test.js test/chrome-client-queue.test.js
  LAVISH_AXI_BROWSER_E2E=1 node --test test/chrome-theme.browser.test.js test/mobile-conversation-sheet.browser.test.js
  pnpm exec prettier --check src/chrome.css test/chrome-theme.browser.test.js
  ```

  Resultado esperado: tokens e estilos computados corretos; o fixture do iframe mantém suas cores, fontes e largura.

- [ ] **Step 7: Commit**

  ```bash
  git add src/chrome.css test/chrome-theme.browser.test.js test/server.test.js
  git commit -m "feat: apply sunset calm oled chrome"
  ```

---

## Task 6: Atualizar a base viva em `@design-concept`

**Files:**

- Modify: `/home/dev/@development/@design-concept/ESTILO-OLED-DARK.md`
- Modify: `/home/dev/@development/@design-concept/OLED-BASE-CONCEITO.md`
- Modify: `/home/dev/@development/@design-concept/oled-base.css`
- Modify: `/home/dev/@development/@design-concept/oled-base-referencia.html`

- [ ] **Step 1: Resolver a permissão de forma mínima e auditável**

  O diretório está `root:root` e `750`. Manter o proprietário, alterar somente o grupo do diretório e dos quatro arquivos em escopo, e conceder a permissão mínima necessária:

  ```bash
  sudo chgrp dev /home/dev/@development/@design-concept
  sudo chmod g+rwx /home/dev/@development/@design-concept
  sudo chgrp dev \
    /home/dev/@development/@design-concept/ESTILO-OLED-DARK.md \
    /home/dev/@development/@design-concept/OLED-BASE-CONCEITO.md \
    /home/dev/@development/@design-concept/oled-base.css \
    /home/dev/@development/@design-concept/oled-base-referencia.html
  sudo chmod g+rw \
    /home/dev/@development/@design-concept/ESTILO-OLED-DARK.md \
    /home/dev/@development/@design-concept/OLED-BASE-CONCEITO.md \
    /home/dev/@development/@design-concept/oled-base.css \
    /home/dev/@development/@design-concept/oled-base-referencia.html
  stat -c '%U:%G %A %n' /home/dev/@development/@design-concept{,/ESTILO-OLED-DARK.md,/OLED-BASE-CONCEITO.md,/oled-base.css,/oled-base-referencia.html}
  ```

  Se `sudo` não estiver disponível, parar esta task e relatar o bloqueio; não copiar os arquivos para outro lugar nem substituir o diretório.

- [ ] **Step 2: Adicionar a camada semântica sem tocar na paleta categórica**

  Nos quatro arquivos, declarar:

  ```css
  --app-ink: #f8f4eb;
  --app-ink-rgb: 248 244 235;
  --app-feedback: #ffb386;
  --app-feedback-rgb: 255 179 134;
  --app-risk: #f87171;
  --app-risk-rgb: 248 113 113;
  --app-pending: #f2c14e;
  --app-pending-rgb: 242 193 78;
  --app-activity: #6fc7c2;
  --app-activity-rgb: 111 199 194;
  ```

  Preservar literalmente:

  ```css
  --c1: #ffffff;
  --c2: #f5451b;
  --c3: #0091c8;
  --c4: #00a06b;
  --c5: #9463ff;
  ```

  Manter também o `--ink` estrutural da base em `#fff`; `--app-ink` é a tinta quente exclusiva das superfícies de aplicação. Corrigir `--ink-3` para `#787878` onde a documentação ainda divergir.

- [ ] **Step 3: Atualizar a teoria e os gates nos dois Markdown**

  Em `ESTILO-OLED-DARK.md` e `OLED-BASE-CONCEITO.md`, registrar:

  - dois namespaces e dois propósitos: semântico de aplicação versus categórico de dados;
  - contrastes sobre `#000` e `#080808`;
  - OKLCH: `0.968 0.013 86.8`, `0.829 0.107 51.4`, `0.711 0.166 22.2`, `0.834 0.141 85.4`, `0.773 0.086 190.8`;
  - reprovação categórica: peach↔yellow `7.97`, peach↔coral `14.83`, luminosidade acima do gate e turquesa com croma `0.086`;
  - uso obrigatório de texto/forma/contagem junto da cor;
  - print, forced colors e reduced motion para os novos estados.

  Atualizar os axiomas/invariantes E2, E3, E4, E6 e E8 sem enfraquecer a regra OLED nem transformar os pastéis em slots de gráfico.

- [ ] **Step 4: Migrar somente o `@layer app` da base CSS**

  Em `oled-base.css`, manter primitivos, gráficos e diagramas em `--ink`/`--c*`. Dentro de `@layer app`:

  - foco, nav current, seleção, presença e done → `--app-activity`;
  - fila, pending, running e atenção → `--app-pending`;
  - comentários, review e autoria → `--app-feedback`;
  - invalid, fail e destructive → `--app-risk`;
  - texto primário da aplicação → `--app-ink`.

  Depois da migração, `@layer app` não deve conter `var(--c1)` … `var(--c5)`.

- [ ] **Step 5: Atualizar a referência HTML como prova das duas camadas**

  Em `oled-base-referencia.html`:

  - mostrar uma seção “Paleta semântica da aplicação” e outra “Paleta categórica de dados”;
  - aplicar Sunset Calm aos controles e estados de aplicação;
  - manter os exemplos de gráficos com `--c1..--c5`;
  - adicionar rótulos/ícones/contagens redundantes aos estados;
  - incluir `APP_PALETTE` no JavaScript separada da paleta categórica;
  - substituir o rótulo fixo “704 lines” por um elemento `#css-line-count` preenchido com `` `${document.getElementById("css-src").textContent.split("\n").length} linhas` ``;
  - manter a página sem gradiente, glow, sombra e raio superior a `3px`.

- [ ] **Step 6: Sincronizar as cópias integrais e a folha viva**

  A fonte da verdade é `oled-base.css`. Sincronizar mecanicamente, preservando escaping HTML:

  1. apêndice CSS de `OLED-BASE-CONCEITO.md`;
  2. `<pre id="css-src">` de `oled-base-referencia.html`;
  3. folha curta no `<style>` da própria referência, somente nos tokens/seletores que a página realmente usa.

  Usar `apply_patch` para as mudanças semânticas no CSS canônico, nos textos e na folha curta. Depois executar esta transformação mecânica apenas para as duas cópias integrais:

  ```bash
  node --input-type=module <<'NODE'
  import assert from "node:assert/strict";
  import { readFile, writeFile } from "node:fs/promises";

  const root = "/home/dev/@development/@design-concept";
  const css = (await readFile(`${root}/oled-base.css`, "utf8")).replace(/\r\n/g, "\n").trimEnd();
  const withEol = (text, eol) => text.replace(/\n/g, eol);

  const conceptPath = `${root}/OLED-BASE-CONCEITO.md`;
  const concept = await readFile(conceptPath, "utf8");
  const conceptEol = concept.includes("\r\n") ? "\r\n" : "\n";
  const marker = concept.indexOf("## 10. ANEXO");
  assert.ok(marker >= 0, "appendix marker exists");
  const head = concept.slice(0, marker);
  const appendix = concept.slice(marker);
  const appendixPattern = /```css\r?\n[\s\S]*?\r?\n```/;
  assert.match(appendix, appendixPattern, "Markdown appendix exists");
  const nextAppendix = appendix.replace(appendixPattern, `\`\`\`css${conceptEol}${withEol(css, conceptEol)}${conceptEol}\`\`\``);
  await writeFile(conceptPath, head + nextAppendix);

  const htmlPath = `${root}/oled-base-referencia.html`;
  const html = await readFile(htmlPath, "utf8");
  const htmlEol = html.includes("\r\n") ? "\r\n" : "\n";
  const escaped = withEol(css, htmlEol)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const htmlPattern = /(<pre id="css-src"[^>]*>)[\s\S]*?(<\/pre>)/;
  assert.match(html, htmlPattern, "HTML source panel exists");
  const nextHtml = html.replace(htmlPattern, (_match, openTag, closeTag) => `${openTag}${escaped}${closeTag}`);
  await writeFile(htmlPath, nextHtml);
  NODE
  ```

  Esta escrita é exclusivamente uma sincronização mecânica de blocos duplicados; revisar o diff imediatamente depois.

- [ ] **Step 7: Executar validação estrutural de conteúdo**

  Rodar este script Node somente-leitura a partir de `/home/dev/@development/lavish-axi`; ele compara as duas cópias integrais com `oled-base.css` e valida a folha viva:

  ```bash
  node --input-type=module <<'NODE'
  import assert from "node:assert/strict";
  import { readFile } from "node:fs/promises";

  const root = "/home/dev/@development/@design-concept";
  const read = async (name) => (await readFile(`${root}/${name}`, "utf8")).replace(/\r\n/g, "\n");
  const normalize = (text) => text.replace(/\r\n/g, "\n").trimEnd();
  const decode = (text) => text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
  const css = normalize(await read("oled-base.css"));
  const concept = await read("OLED-BASE-CONCEITO.md");
  const styleGuide = await read("ESTILO-OLED-DARK.md");
  const html = await read("oled-base-referencia.html");
  const appendix = concept.slice(concept.indexOf("## 10. ANEXO")).match(/```css\n([\s\S]*?)\n```/);
  const embedded = html.match(/<pre id="css-src"[^>]*>([\s\S]*?)<\/pre>/);
  assert.ok(appendix && embedded, "embedded CSS blocks exist");
  assert.equal(normalize(appendix[1]), css, "Markdown appendix matches oled-base.css");
  assert.equal(normalize(decode(embedded[1])), css, "HTML source panel matches oled-base.css");

  const appTokens = {
    "--app-ink": "#f8f4eb",
    "--app-feedback": "#ffb386",
    "--app-risk": "#f87171",
    "--app-pending": "#f2c14e",
    "--app-activity": "#6fc7c2",
  };
  for (const [token, value] of Object.entries(appTokens)) {
    for (const [name, source] of [["CSS", css], ["concept", concept], ["style", styleGuide], ["HTML", html]])
      assert.match(source.toLowerCase(), new RegExp(`${token}:?\\s+${value}`), `${name} contains ${token}`);
  }
  const categories = ["#ffffff", "#f5451b", "#0091c8", "#00a06b", "#9463ff"];
  categories.forEach((value, index) => assert.match(css, new RegExp(`--c${index + 1}:\\s*${value}`)));

  const start = css.indexOf("@layer app");
  assert.ok(start >= 0, "@layer app exists");
  const open = css.indexOf("{", start);
  let depth = 0;
  let end = -1;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}" && --depth === 0) { end = index + 1; break; }
  }
  const appLayer = css.slice(start, end);
  assert.doesNotMatch(appLayer, /var\(--c[1-5]\)/, "application layer never consumes data slots");
  assert.match(css, /@media print/);
  assert.match(css, /forced-colors:\s*active/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(html, /APP_PALETTE/);
  console.log("OLED design-concept sync: PASS");
  NODE
  ```

  A validação deve falhar se:

  - algum dos cinco `--app-*` faltar;
  - algum valor `--c1..--c5` mudar;
  - `@layer app` usar `var(--c[1-5])`;
  - os dois blocos integrais divergirem do CSS canônico.

  Registrar a saída no log; não gravar arquivos temporários no diretório.

- [ ] **Step 8: Verificar a referência em navegador real**

  Abrir o arquivo diretamente e inspecionar os três viewports suportados pela ferramenta:

  ```bash
  export CHROME_DEVTOOLS_AXI_SESSION=oled-reference-qa
  chrome-devtools-axi open file:///home/dev/@development/@design-concept/oled-base-referencia.html
  chrome-devtools-axi emulate --viewport '390x844x3,mobile,touch' --color-scheme dark
  chrome-devtools-axi screenshot /tmp/oled-reference-390.png
  chrome-devtools-axi emulate --viewport '768x1024x2,touch' --color-scheme dark
  chrome-devtools-axi screenshot /tmp/oled-reference-768.png
  chrome-devtools-axi emulate --viewport '1200x900x1' --color-scheme dark
  chrome-devtools-axi screenshot /tmp/oled-reference-1200.png
  chrome-devtools-axi press Tab
  chrome-devtools-axi snapshot
  chrome-devtools-axi eval '() => JSON.stringify({x:document.documentElement.scrollWidth,y:document.documentElement.clientWidth})'
  chrome-devtools-axi stop
  ```

  Para `forced-colors` e reduced motion, abrir uma sessão separada com flags do Chrome, confirmar os media queries e capturar a página:

  ```bash
  CHROME_DEVTOOLS_AXI_SESSION=oled-reference-a11y \
  CHROME_DEVTOOLS_AXI_CHROME_ARGS='--force-high-contrast --force-prefers-reduced-motion' \
    chrome-devtools-axi open file:///home/dev/@development/@design-concept/oled-base-referencia.html
  CHROME_DEVTOOLS_AXI_SESSION=oled-reference-a11y chrome-devtools-axi eval \
    '() => JSON.stringify({forced:matchMedia("(forced-colors: active)").matches,reduced:matchMedia("(prefers-reduced-motion: reduce)").matches})'
  CHROME_DEVTOOLS_AXI_SESSION=oled-reference-a11y chrome-devtools-axi screenshot /tmp/oled-reference-a11y.png
  CHROME_DEVTOOLS_AXI_SESSION=oled-reference-a11y chrome-devtools-axi stop
  ```

  O bloco print é validado estruturalmente pelo script anterior; a ferramenta de browser não expõe emulação `print`. Conferir nas capturas e snapshot:

  - zero overflow horizontal;
  - foco visível por teclado;
  - controles usando Sunset Calm;
  - gráficos mantendo a paleta categórica;
  - todos os estados compreensíveis sem cor.

- [ ] **Step 9: Commit no repositório proprietário de `@design-concept`, se existir**

  Se o diretório estiver dentro de um repositório Git, commit:

  ```bash
  git add ESTILO-OLED-DARK.md OLED-BASE-CONCEITO.md oled-base.css oled-base-referencia.html
  git commit -m "docs: separate app and data oled palettes"
  ```

  Se não houver repositório Git, deixar o diff local validado e registrar os quatro caminhos no handoff.

---

## Task 7: Atualizar contratos públicos e atribuição do fork

**Files:**

- Modify: `README.md:197-205`
- Modify: `AGENTS.md:237`

- [ ] **Step 1: Atualizar README com comportamento observável**

  Documentar que:

  - esta árvore deriva de `kunchenguid/lavish-axi` e mantém licença MIT/atribuições;
  - desktop reserva um trilho de `48px`, inicia fechado e abre conversa sobre o artefato;
  - abrir/fechar não redimensiona o artefato;
  - estado do desktop não persiste, enquanto a persistência mobile existente permanece;
  - Mermaid/Excalidraw, anotação, export, share, fila e agent reply são preservados.

  Remover a frase obsoleta “Wider screens keep the side-by-side layout.”

- [ ] **Step 2: Atualizar o invariante de manutenção em AGENTS.md**

  Substituir o invariante “desktop pixel-identical side-by-side” por dois contratos verificáveis:

  1. desktop grid reserva `48px`, drawer de `360px` cresce para a esquerda e iframe não muda;
  2. abaixo de `860px`, o bottom sheet e todas as suas invariantes atuais continuam intactos.

  Registrar que `MOBILE_SHEET_MEDIA` deve continuar idêntico ao breakpoint CSS e que estado desktop nunca usa storage.

- [ ] **Step 3: Verificar o texto e commit**

  ```bash
  pnpm exec prettier --check README.md AGENTS.md
  if rg -n "side-by-side|desktop stays pixel-identical|Wider screens keep" README.md AGENTS.md; then
    echo "obsolete desktop contract remains" >&2
    exit 1
  fi
  ```

  Resultado esperado: nenhuma descrição antiga do painel desktop permanece.

  ```bash
  git add README.md AGENTS.md
  git commit -m "docs: describe the compatible oled fork"
  ```

---

## Task 8: Fazer QA visual e regressão completa

**Files:**

- Create: `design-qa.md`
- Verify: `src/artifact-sdk.js`
- Verify: `src/whiteboard-frame.js`
- Verify: `src/design-reference.js`
- Verify: all modified files

- [ ] **Step 1: Executar as suítes focadas**

  ```bash
  node --test test/chrome-client-queue.test.js test/server.test.js test/package-json.test.js
  LAVISH_AXI_BROWSER_E2E=1 node --test test/chrome-theme.browser.test.js test/mobile-conversation-sheet.browser.test.js
  ```

  Resultado esperado: PASS sem skips nos dois testes browser opt-in.

- [ ] **Step 2: Rodar as regressões browser do motor preservado**

  ```bash
  LAVISH_AXI_BROWSER_E2E=1 node --test --test-concurrency=1 \
    test/whiteboard-render.browser.test.js \
    test/event-transport.browser.test.js \
    test/layout-warning-inbox.browser.test.js \
    test/attachment-upload.browser.test.js
  ```

  Resultado esperado: Mermaid/Excalidraw, transporte de eventos, inbox de layout e anexos continuam PASS sem skips.

- [ ] **Step 3: Exercitar um artefato Mermaid/whiteboard real**

  Criar fixture temporário fora do repositório com HTML, uma `.mermaid`, texto anotável e tabela. Abrir com o CLI desta worktree e comprovar no navegador:

  - diagrama renderiza com a mesma qualidade;
  - clique desbloqueia o whiteboard;
  - fullscreen abre/fecha;
  - anotação, queue, send e agent reply continuam funcionando;
  - drawer aberto não muda bounding box do iframe;
  - fechar o drawer não remove transcript nem fila.

  Não editar ou snapshotar `src/artifact-sdk.js` para obter esse resultado.

- [ ] **Step 4: Capturar os estados de QA visual**

  Com `chrome-devtools-axi`, capturar e inspecionar:

  - desktop `1440x1000` fechado;
  - desktop `1440x1000` aberto;
  - mobile `390x844` docked e aberto;
  - short mobile `375x548` com attachments;
  - referência design-concept em `390`, `768` e `1200px`.

  Verificar hierarquia, clipping, overlap intencional, foco, contraste, ausência de glow/sombra e legibilidade. Corrigir qualquer finding antes de seguir.

- [ ] **Step 5: Registrar QA em `design-qa.md`**

  O documento deve conter data, commit, viewports, fluxos exercitados, resultado de contraste, confirmação de não-reflow, confirmação da paleta categórica intacta e uma seção “Known limitations”. Não marcar como aprovado se houver finding P0/P1 pendente.

- [ ] **Step 6: Rodar o gate completo**

  ```bash
  pnpm run check
  npm pack --dry-run --json
  ```

  Confirmar no JSON do pack que `dist/chrome-fonts/*.woff2`, `LICENSE`, `THIRD-PARTY-NOTICES.md` e `README.md` entram no pacote.

- [ ] **Step 7: Provar que o motor protegido não mudou**

  ```bash
  unexpected="$(git diff --name-only 4413dcc8eff35cdc659e2035b94194d3c9be55fa -- src \
    | rg -v '^(src/chrome\.css|src/chrome-client\.js|src/server\.js)$' || true)"
  if [ -n "$unexpected" ]; then
    echo "protected src files changed:" >&2
    echo "$unexpected" >&2
    exit 1
  fi
  git diff 4413dcc8eff35cdc659e2035b94194d3c9be55fa -- src/server.js
  git diff --check
  git status --short
  ```

  Resultado esperado: a allowlist inversa aceita somente `chrome.css`, `chrome-client.js` e `server.js`; a inspeção de `server.js` contém apenas markup/atributos do chrome e a allowlist de fontes; não há whitespace errors.

- [ ] **Step 8: Revisar o diff contra a spec**

  Ler todo o diff e responder explicitamente:

  - Algum CSS atravessa o iframe? Deve ser não.
  - Algum protocolo/nome/storage foi renomeado? Deve ser não.
  - Desktop sempre inicia fechado? Deve ser sim.
  - Abrir mantém `frame.left/right/width`? Deve ser sim, medido.
  - Mobile ainda persiste e responde a gestos? Deve ser sim.
  - `--c1..--c5` permanece byte-equivalente? Deve ser sim.
  - Fontes funcionam sem rede e têm atribuição? Deve ser sim.

- [ ] **Step 9: Commit final de QA e status**

  Após todos os gates verdes, atualizar a spec para “implementada e verificada” e commit:

  ```bash
  git add design-qa.md docs/superpowers/specs/2026-09-17-lavish-oled-chrome-fork-design.md
  git commit -m "test: verify oled fork visual contracts"
  ```

- [ ] **Step 10: Preparar handoff sem publicar**

  Entregar ao usuário:

  - caminho da worktree e branch;
  - resumo de arquivos alterados;
  - comandos e resultados dos gates;
  - links locais para `design-qa.md`, spec, plano e quatro arquivos `@design-concept`;
  - observação de que package/CLI continuam `lavish-axi` e nenhum remoto/release foi criado.
