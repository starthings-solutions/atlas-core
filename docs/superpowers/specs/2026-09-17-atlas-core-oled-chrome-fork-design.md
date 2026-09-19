# Atlas Core OLED Chrome Fork — Design Specification

**Data:** 2026-09-17

**Status:** implementada e verificada

**Upstream de referência:** `kunchenguid/lavish-axi` @ `4413dcc8eff35cdc659e2035b94194d3c9be55fa` (`0.1.71`)

**Nome de trabalho:** Atlas Core OLED; o nome do pacote e o comando continuam `atlas-core` nesta fase.

## 1. Resultado esperado

Criar um fork compatível do Atlas Core que preserve integralmente o motor original de geração, renderização e revisão de artefatos, mas substitua o chrome visual por uma interface OLED própria e menos intrusiva.

O fork deve:

- manter a qualidade atual de HTML, Mermaid, SVG e Excalidraw;
- manter o protocolo entre artefato, SDK, chrome, servidor e CLI;
- iniciar com o chat fechado no desktop;
- abrir o chat como drawer sobreposto, sem redimensionar o artefato;
- aplicar a linguagem OLED Sunset Calm somente às superfícies da aplicação;
- atualizar a referência viva e os documentos de `/home/dev/@development/@design-concept` para registrar a nova camada semântica de aplicação;
- preservar a paleta categórica validada para dados e diagramas.

## 2. Decisões confirmadas

1. A base é um fork compatível, não uma reimplementação.
2. O renderer e o motor de componentes do Atlas Core são uma zona protegida.
3. O redesign alcança o chrome da aplicação, não o conteúdo do iframe.
4. O chat desktop usa a opção A: drawer sobreposto.
5. O drawer começa fechado em todo novo carregamento desktop.
6. A direção visual é OLED puro com a versão suave Sunset Calm.
7. O sistema não usa gradiente, glow, sombra de elevação ou raio maior que `3px`, exceto `50%` em círculos intrínsecos de estado/ícone.

## 3. Limites arquiteturais

### 3.1 Zona protegida

Os seguintes contratos continuam exatamente compatíveis com o upstream:

- `src/artifact-sdk.js` e a injeção de um único script no artefato;
- sandbox, CSP e isolamento do iframe;
- mensagens `atlas:*`, `data-atlas-*` e `source: "atlas-core"`;
- Mermaid, Excalidraw, whiteboards, sidecars e conversão de diagramas;
- anotações por elemento, intervalo de texto, nó Mermaid e célula de tabela;
- live reload, scroll restore e draft restore;
- sessões, fila, transcript, presença, poll e agent reply;
- exportação local, compartilhamento e anexos;
- `ATLAS_CORE_*`, porta, diretório de estado, health handshake e chaves de `sessionStorage`;
- comando e pacote `atlas-core` durante a primeira fase.

Não haverá substituição global de nomes, protocolos ou namespaces. A criação de uma marca/package pública independente fica fora desta fase.

### 3.2 Zona de mudança

As alterações do fork ficam concentradas em:

- `src/chrome.css`: tokens, layout, componentes e estados visuais do chrome;
- `src/chrome-client.js`: controlador desktop do drawer, foco, `inert`, Escape e resumo do trilho;
- `src/server.js`: atributos/estrutura do chrome e uma rota allowlist de fontes necessárias ao tema;
- `package.json`, `pnpm-lock.yaml` e `scripts/build.js`: dependências e cópia offline das fontes do chrome;
- `THIRD-PARTY-NOTICES.md`: atribuição das fontes distribuídas;
- testes do chrome e testes de geometria no navegador;
- README, somente para o comportamento público do chat;
- os quatro artefatos de referência em `@design-concept`.

Qualquer necessidade de editar o SDK, o renderer de Mermaid ou o whiteboard deve interromper a implementação e voltar à revisão de escopo.

## 4. Interação do chat

### 4.1 Estado fechado

No desktop, o layout reserva apenas um trilho direito de `48px`. O artefato ocupa todo o espaço restante.

O trilho mostra um resumo compacto e redundante, por prioridade:

- contagem de itens na fila;
- indicação de resposta não lida;
- presença do agente;
- controle para abrir a conversa.

Somente o estado de maior prioridade fica visível de cada vez. Cor nunca é a única portadora do estado: o resumo possui forma ou número compacto e um rótulo acessível completo.

O estado fechado é o estado inicial de todo carregamento desktop e não é persistido. Atualizar a página volta a fechar o chat.

### 4.2 Estado aberto

O chat abre por cima da borda direita do artefato:

- largura-alvo de `360px`, limitada para não ultrapassar o viewport útil;
- ancorado entre a barra superior e a borda inferior;
- o iframe mantém exatamente a mesma largura e não sofre reflow;
- nenhum conteúdo do artefato recebe CSS, filtro ou transformação;
- o drawer pode cobrir temporariamente a faixa direita do documento.

O drawer fecha por:

- botão geométrico de fechar;
- novo acionamento do controle do trilho;
- tecla `Escape`, quando o foco pertence ao chrome.

Ao abrir, o conteúdo interativo deixa de estar `inert` e o foco vai para o primeiro destino útil da conversa. Ao fechar, o drawer volta a `inert` e o foco retorna ao controle que o abriu.

### 4.3 Estado e dados

Fechar o drawer não pausa nem descarta:

- fila local;
- uploads;
- transcript;
- sincronização WebSocket;
- presença;
- avisos de layout;
- respostas do agente.

O drawer controla somente visibilidade e interação. Estado de domínio continua pertencendo às estruturas atuais do Atlas Core.

### 4.4 Mobile

A experiência móvel existente continua como bottom sheet abaixo de `860px`. O controlador desktop não substitui gestos, visual viewport, safe area ou comportamento de teclado do mobile.

## 5. Sistema visual

### 5.1 Neutros OLED

Os neutros estruturais permanecem:

```css
--void: #000000;
--surface: #080808;
--surface-2: #101010;
--rule: #1b1b1b;
--dim: #2a2a2a;
--rule-2: #2e2e2e;
--ink-3: #787878;
--ink-2: #a3a3a3;
```

A tinta primária da aplicação passa a `#F8F4EB`, com contraste de `19.13:1` sobre o preto e `18.25:1` sobre `#080808`.

### 5.2 Paleta semântica Sunset Calm

Esta paleta pertence ao chrome e a controles de aplicação:

| Papel           |     Valor | Uso                                           |
| --------------- | --------: | --------------------------------------------- |
| tinta quente    | `#F8F4EB` | texto principal, inversão, foco neutro        |
| feedback humano | `#FFB386` | comentários, autoria humana, revisão          |
| risco           | `#F87171` | erro, destrutivo, falha                       |
| pendência       | `#F2C14E` | fila, processamento pendente, atenção         |
| atividade       | `#6FC7C2` | foco, seleção, presença e sucesso operacional |

Sobre preto, os contrastes são respectivamente `19.13`, `12.04`, `7.59`, `12.51` e `10.62`. Texto claro não deve ser colocado em preenchimentos dessas cores; componentes preenchidos usam texto `#000000`.

### 5.3 Paleta categórica de dados

Sunset Calm não substitui a paleta categórica de gráficos e diagramas. Ela falha deliberadamente no portão categórico existente:

- peach ↔ yellow: ΔE OKLab ×100 de `7.97`, abaixo do piso `15`;
- peach ↔ coral: `14.83`, também abaixo do piso;
- os cromáticos excedem a faixa de luminosidade categórica `0.48–0.67`;
- turquesa tem croma `0.086`, abaixo do piso `0.10`.

Portanto, a base passa a declarar duas camadas independentes:

1. **paleta semântica de aplicação**, Sunset Calm;
2. **paleta categórica de dados**, os slots validados atuais.

Essa separação preserva a qualidade e a distinção dos diagramas enquanto renova a interface externa.

### 5.4 Forma e tipografia

- fundo OLED puro;
- superfícies separadas por fios de `1px`;
- marcadores de `2px` para ênfase;
- raio máximo de `3px`, exceto círculos intrínsecos de estado/ícone, que podem usar `50%`;
- zero gradiente, glow ou sombra de elevação;
- Archivo para prosa/display e IBM Plex Mono para rótulos, estado e números;
- ícones geométricos SVG com `currentColor`; zero emoji;
- foco global visível de `2px`;
- alvos de toque com área mínima de `44px` em `pointer: coarse`;
- `prefers-reduced-motion` respeitado.

## 6. Atualização do `@design-concept`

Os arquivos abaixo devem permanecer coerentes entre si:

- `ESTILO-OLED-DARK.md`;
- `OLED-BASE-CONCEITO.md`;
- `oled-base.css`;
- `oled-base-referencia.html`.

As mudanças são:

1. registrar a separação entre paleta semântica da aplicação e paleta categórica de dados;
2. atualizar a tinta primária da aplicação para `#F8F4EB`;
3. adicionar tokens Sunset Calm com valores hex e RGB derivados;
4. documentar contrastes, OKLCH e a reprovação categórica dos pastéis;
5. aplicar Sunset Calm aos controles e estados da página de referência;
6. manter gráficos/diagramas demonstrativos na paleta categórica validada;
7. remover ou corrigir qualquer exemplo que use cor como único indicador de estado;
8. preservar todos os invariantes OLED existentes.

## 7. Acessibilidade

- `aria-expanded` do controle deve refletir o drawer real.
- O drawer fechado deve estar `inert` e fora da sequência de tabulação.
- O botão deve nomear a ação atual: abrir ou fechar conversa.
- Escape fecha sem consumir teclas digitadas dentro do artefato sandboxed.
- Foco retorna ao acionador após fechar.
- Contagens usam texto/número, não apenas cor.
- Texto normal mantém contraste mínimo `4.5:1`.
- Fronteiras interativas mantêm `3:1` contra a superfície adjacente.
- O chrome não altera o tema, o contraste ou a semântica do artefato.
- A base externa do iframe permanece branca também no breakpoint mobile, preservando artefatos transparentes.

## 8. Estratégia de testes

### 8.1 Caracterização protegida

Antes da mudança visual, a suíte atual deve passar. Os testes existentes de Mermaid, Excalidraw, SDK, export e servidor funcionam como guarda do motor.

Nenhum teste comportamental deve aprovar a mudança apenas por procurar texto-fonte ou tokens; deve exercitar comportamento real. Comparações textuais continuam permitidas como gates suplementares de sincronização documental e empacotamento.

### 8.2 Testes do drawer

Adicionar testes que falhem antes da implementação e provem:

- boot desktop fechado;
- `aria-expanded="false"` e drawer `inert` no boot;
- abertura por controle, com foco útil e `aria-expanded="true"`;
- fechamento por botão e Escape, com retorno de foco;
- novo carregamento desktop volta ao estado fechado;
- nenhuma chave desktop de persistência é criada;
- fila, presença, transcript e resposta continuam atualizando enquanto fechado;
- o fluxo mobile existente continua funcionando.

### 8.3 Geometria real

Em navegador real, a `1440px`:

- medir a largura do iframe fechado;
- abrir o drawer;
- comprovar que a largura do iframe não mudou;
- comprovar sobreposição do drawer na faixa direita;
- comprovar ausência de overflow horizontal;
- comprovar largura e limites do trilho/drawer.

Também executar a suíte móvel existente a `390px`.

### 8.4 Regressão visual e funcional

- capturas do chrome fechado e aberto;
- captura da referência `@design-concept` desktop e mobile;
- teste de um artefato contendo Mermaid editável;
- teste de anotação, fila, envio e agent reply;
- `pnpm run check` completo;
- suítes browser relevantes com `ATLAS_CORE_BROWSER_E2E=1`.

## 9. Documentação e atribuição

- manter `LICENSE` MIT original;
- manter `THIRD-PARTY-NOTICES.md`;
- registrar no README que esta árvore deriva de `kunchenguid/lavish-axi`;
- documentar o drawer fechado por padrão na seção proprietária do comportamento de feedback;
- não criar ou publicar repositório remoto, pacote npm ou release nesta fase.

## 10. Fora de escopo

- reescrever o renderer;
- trocar Mermaid, Excalidraw ou suas versões;
- alterar o HTML produzido pelos agentes;
- recolorir artefatos existentes;
- renomear protocolo, estado, variáveis ou CLI;
- criar side-by-side runtime com outra porta;
- adicionar novo framework de UI;
- alterar semântica de export/share;
- publicar o fork.

## 11. Critério de aceite

O trabalho é aceito quando uma sessão abre com o artefato intacto e o chat fechado; o drawer abre sobre o artefato sem alterar sua geometria; todos os fluxos de revisão continuam operantes; um diagrama Mermaid mantém renderização, edição e feedback; a nova camada Sunset Calm é consistente no chrome e na referência; e todas as verificações automatizadas e visuais passam.
