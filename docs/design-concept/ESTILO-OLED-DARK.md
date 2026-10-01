# Estilo OLED Dark — especificação para replicação

Sistema visual usado em `consultorio/relatorio_mercado_plataforma_medica_2026.html`.
Serve para relatórios densos, dashboards e documentos analíticos que precisam
parecer instrumento de medição, não peça de marketing.

Referência viva: abra o relatório acima e inspecione. Este arquivo é a regra.

---

## 1. Princípio central

**O branco é a tinta de dado. A cor é exceção, não decoração.**

Tudo decorre disso:

- Preto absoluto `#000000` — pixel apagado de verdade no OLED, não "quase preto".
- Gráfico de série única é **todo branco**. Cor só entra quando há mais de uma
  identidade para separar.
- Zero gradiente, zero glow, zero sombra. Em preto puro, sombra vira mancha suja
  e gradiente denuncia template.
- Superfícies se distinguem por **fio de 1px**, não por elevação.
- Densidade de instrumento: número tabular em monoespaçada, rótulo em caixa alta
  com tracking largo, fio hairline separando tudo.

Se uma decisão não cabe nessa lógica, ela está errada — mesmo que fique bonita.

---

## 2. Tokens

Bloco pronto para copiar:

```css
:root {
  /* superfícies */
  --void: #000000; /* fundo da página — sempre preto puro */
  --surface: #080808; /* painel */
  --surface-2: #101010; /* trilho de barra, campo de formulário */

  /* fios */
  --rule: #1b1b1b; /* divisória interna, borda de painel */
  --rule-2: #2e2e2e; /* divisória estrutural, topo de bloco */

  /* tinta */
  --ink: #ffffff; /* dado primário, título */
  --ink-2: #a3a3a3; /* corpo de texto, rótulo de série */
  --ink-3: #787878; /* eyebrow, nota de rodapé, metadado */

  /* paleta categórica — ordem fixa, nunca ciclar */
  --c1: #ffffff; /* série 1 — sempre dominante */
  --c2: #f5451b; /* série 2 — também a tinta de risco */
  --c3: #0091c8;
  --c4: #00a06b;
  --c5: #9463ff;

  /* aplicação semântica — Sunset Calm; não usar em gráficos */
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

  --dim: #2a2a2a; /* massa não destacada, grade de fundo */

  /* layout */
  --max: 1180px;
  --rail: 92px;
  --gut: 30px;

  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --sans: "Archivo", ui-sans-serif, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
}
```

Cinza neutro **não** entra na paleta categórica — testei e falha contra o azul
(ΔE 13,2 em visão normal, abaixo do piso de 15). Se precisar de um slot "outros",
use textura, não cinza.

### Dois namespaces, dois propósitos

`--c1..--c5` é a paleta **categórica de dados**: permanece literalmente
`#ffffff`, `#f5451b`, `#0091c8`, `#00a06b`, `#9463ff`, ligada à entidade em
gráficos e diagramas. `--app-*` é a paleta **semântica de aplicação**: controles
e estados usam `--app-ink`, feedback/review/autoria usam `--app-feedback`,
risco/destrutivo/falha usam `--app-risk`, fila/pendente/atenção usam
`--app-pending`, e foco/corrente/seleção/presença/concluído usam
`--app-activity`. Não troque um namespace pelo outro.

| token semântico  |               OKLCH | vs `#000` | vs `#080808` |
| ---------------- | ------------------: | --------: | -----------: |
| `--app-ink`      |  `0.968 0.013 86.8` |   19,13:1 |      18,25:1 |
| `--app-feedback` |  `0.829 0.107 51.4` |   12,04:1 |      11,49:1 |
| `--app-risk`     |  `0.711 0.166 22.2` |    7,59:1 |       7,24:1 |
| `--app-pending`  |  `0.834 0.141 85.4` |   12,51:1 |      11,93:1 |
| `--app-activity` | `0.773 0.086 190.8` |   10,62:1 |      10,13:1 |

Os pastéis são deliberadamente **reprovados como paleta categórica**: peach↔yellow
tem 7,97, peach↔coral 14,83 (ambos abaixo do gate normal 15); há luminosidade
fora do intervalo categórico e a turquesa tem croma 0,086, abaixo de 0,10.
Eles não são slots de gráfico. Todo estado semântico exige **texto, forma/ícone e
contagem** junto da cor; a mesma redundância é preservada em impressão,
`forced-colors` e `prefers-reduced-motion`.

---

## 3. Tipografia

Duas famílias, três papéis. Nada de Inter em tudo.

```html
<link
  href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

O movimento que dá identidade: **Archivo é variável no eixo de largura (`wdth`)**.
Título expandido, corpo normal. Isso se controla por `font-variation-settings`,
não por `font-weight`:

| Papel            | Família       | Ajuste                                                                                               |
| ---------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| Display (h1)     | Archivo       | `'wdth' 112, 'wght' 680` · `clamp(38px, 6.1vw, 76px)` · lh `.97` · ls `-.035em` · `max-width: 18ch`  |
| Seção (h2)       | Archivo       | `'wdth' 106, 'wght' 620` · `clamp(25px, 3.3vw, 39px)` · lh `1.07` · ls `-.028em` · `max-width: 26ch` |
| Bloco (h3)       | Archivo       | `'wdth' 100, 'wght' 620` · `16px`                                                                    |
| Corpo            | Archivo       | `400` · `15.5px` / `1.62` · cor `--ink-2` · `max-width: 62ch`                                        |
| Eyebrow / rótulo | IBM Plex Mono | `500` · `10.5px` · `letter-spacing: .13em` · `uppercase` · cor `--ink-3`                             |
| Dado / número    | IBM Plex Mono | `500` · `font-variant-numeric: tabular-nums`                                                         |
| Nota             | IBM Plex Mono | `400` · `11.5px` / `1.6` · cor `--ink-3`                                                             |

**Todo número do documento é monoespaçado e tabular.** É o que faz o conjunto ler
como leitura de instrumento em vez de post de blog. Vale para tabela, KPI, valor
de barra, saída de simulador — sem exceção.

Os `max-width` em `ch` importam: título que ocupa 6 linhas estraga o ritmo.
18ch no h1 e 26ch no h2 dão 3–4 e 2 linhas na largura de trabalho.

---

## 4. Espaçamento e estrutura

```
shell           width: min(1180px, 100% - 40px)   /* 100% - 28px no mobile */
section         padding-top: 96px                 /* 68px no mobile */
.block          margin-top: 36px                  /* respiro entre blocos da seção */
painel          padding: 24px · border-radius: 3px
header          padding-top: 92px                 /* 56px no mobile */
```

**Raio de canto: 3px em painel, 2px em barra, 1px em célula de medidor.**
Nunca 16px+ — cartão gordo arredondado é a assinatura visual de template.

### Grid de seção com rail de numeração

```css
.sec-grid {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 0 30px;
}
.rail-num {
  position: sticky;
  top: 86px;
  border-top: 2px solid var(--ink); /* o fio branco é o marcador, não o número */
  padding-top: 4px;
  width: 34px;
  font: 500 12px var(--mono);
  letter-spacing: 0.1em;
  color: var(--ink-3);
}
```

Só numere seções quando o conteúdo **for** uma sequência de argumento. Numeração
decorativa 01/02/03 sobre conteúdo não-sequencial é o tique mais fácil de detectar.

### Hierarquia de superfície

Três níveis, do mais leve ao mais pesado:

1. **Nu** — conteúdo direto no preto, separado por `border-top: 1px solid var(--rule-2)`.
   Use para faixas de KPI. Elimina a monotonia de grade-de-cartões.
2. **Painel** — `background: var(--surface)` + `border: 1px solid var(--rule)`.
3. **Painel marcado** — `border-top: 2px solid var(--ink)` sinaliza o bloco-chave.
   Variante de risco: `border-color: rgba(245,69,27,.34)` e título em `--c2`.

Alterne os três. Oito seções seguidas de cartão idêntico é o que dá cara de gerado.

---

## 5. Regras de gráfico

### Cor

- **Série única → tudo branco.** Um destaque só se justifica por _entidade_
  (a região-alvo, o cenário recomendado), nunca por posição no ranking. Barras
  não-destacadas usam `--dim`.
- **Multi-série → branco primeiro**, depois a ordem fixa `--c2 … --c5`. A ordem
  segue a entidade, não o tamanho: filtrar o gráfico não pode repintar quem sobrou.
- **Nunca mais de 5 séries.** A sexta vira "Outros", facetas ou pequenos múltiplos.
- **Texto usa tinta de texto**, jamais a cor da série. O quadradinho colorido ao
  lado carrega a identidade; o número fica branco.

### Marcas

```css
.bar-track {
  height: 10px;
  background: var(--surface-2);
  border-radius: 2px;
}
.bar-fill {
  height: 100%;
  background: var(--ink);
  border-radius: 0 3px 3px 0;
}
.stack {
  display: flex;
  gap: 2px;
  height: 50px;
} /* o gap de 2px é preto = separador */
.seg {
  border-radius: 2px;
}
.meter i {
  height: 12px;
  border-radius: 1px;
  box-shadow: inset 0 0 0 1px var(--rule-2);
}
.meter i.on {
  background: var(--ink);
  box-shadow: none;
}
```

- Marca fina. Extremidade do dado arredondada em 3px, base quadrada e ancorada.
- **2px de preto entre segmentos** — funciona como separador em qualquer visão
  de cor e resolve sozinho boa parte dos casos de daltonismo.
- Trilho quase invisível (`--surface-2`): implica a extensão total sem competir.
- Linha de referência / guardrail: tracejado branco vertical sobre o trilho.
  ```css
  .bar-track[data-mark]::after {
    content: "";
    position: absolute;
    top: -4px;
    bottom: -4px;
    left: var(--mark);
    width: 1px;
    background: repeating-linear-gradient(180deg, var(--ink) 0 3px, transparent 3px 6px);
  }
  ```

### Escolha de forma

- Nota discreta 0–10 → **medidor segmentado** de 10 células, não barra contínua.
  Células abaixo do limiar em `--c2`, acima em branco. Lê como painel de instrumento
  e o valor numérico fica sempre visível ao lado.
- Divisão em duas partes → **barra dividida horizontal com o total grande ao lado**.
  Não use donut: rosquinha de 2 fatias é enfeite, e é um dos clichês mais
  reconhecíveis de relatório gerado.
- Composição de 3–5 partes → barra empilhada única com rótulo direto nos segmentos
  largos e legenda embaixo cobrindo todos.
- Ranking → lista de barras horizontais com nome à esquerda e valor à direita.

### Legenda e acessibilidade

- Duas ou mais séries: legenda **sempre** presente, e até 4 também rotuladas
  diretamente. Uma série só: o título nomeia, dispensa legenda.
- Todo gráfico ganha `role="img"` + `aria-label` descrevendo a distribuição.
- Camada de hover por padrão: um único tooltip compartilhado, alimentado por
  `data-tip` em cada marca, posicionado por `pointerover`/`pointermove`.

### Validação da paleta — calcule, não olhe

Antes de fechar qualquer paleta categórica nova, rode os números contra a
superfície `#000000`:

| Teste                                                   | Limite                                      |
| ------------------------------------------------------- | ------------------------------------------- |
| Faixa de luminosidade (OKLCH L)                         | 0,48 – 0,67 no modo escuro                  |
| Piso de croma (OKLCH C)                                 | ≥ 0,10 (abaixo disso o matiz lê como cinza) |
| Separação por daltonismo (OKLab ΔE ×100, protan/deutan) | ≥ 8                                         |
| Piso de visão normal (pior par)                         | ≥ 15 — reprovação dura                      |
| Contraste WCAG vs. superfície                           | ≥ 3:1                                       |

A paleta da seção 2 passa em todos: ΔE 9,5 (daltonismo), ΔE 16,1 (visão normal),
contraste ≥ 3:1.

**O branco é exceção deliberada** — L=1,0 e C=0 estouram a faixa e o piso de croma
por definição. É aceitável porque é o slot de maior contraste possível e o
princípio do sistema. Todos os _outros_ slots têm de passar.

---

## 6. Sistema de evidência (o elemento-assinatura)

Cada número carrega o grau da prova que o sustenta. Codificado por **textura**,
não por cor — assim sobrevive a impressão em preto e branco e a qualquer visão
de cor, e libera a paleta para os dados.

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font: 500 10px var(--mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.tag i {
  width: 8px;
  height: 8px;
  display: block;
}

.tag--fact i {
  background: var(--ink);
} /* sólido  */
.tag--proxy i {
  background: repeating-linear-gradient(45deg, var(--ink) 0 1.5px, transparent 1.5px 3px);
  box-shadow: inset 0 0 0 1px var(--rule-2);
} /* hachura */
.tag--model i {
  box-shadow: inset 0 0 0 1px var(--ink-3);
} /* vazado  */
```

- **Sólido = fato** — fonte oficial, documento regulatório.
- **Hachurado = proxy** — número autorreportado, amostra setorial.
- **Vazado = modelo** — premissa de planejamento.

Declare a legenda uma vez, no topo, e repita o selo em cada bloco. É o que separa
um relatório honesto de um deck que finge precisão.

**Generalize assim:** ache a distinção intelectual real do documento e transforme
em dispositivo visual recorrente. Não invente um enfeite — encontre o que já é
verdade no conteúdo.

---

## 7. Grade unitária: transformar razão em campo contável

O recurso que ancora o relatório. Um campo de 1.000 células onde cada uma vale
0,1% da base; as acesas são a fatia capturada. Torna "0,32%" tangível em vez de
abstrato.

```js
const COLS = 100,
  ROWS = 10,
  PITCH = 10,
  SIZE = 6;
const NS = "http://www.w3.org/2000/svg";

function buildField(svg) {
  // <svg viewBox="0 0 1000 106" preserveAspectRatio="none">
  const frag = document.createDocumentFragment(),
    cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", c * PITCH);
      rect.setAttribute("y", r * PITCH);
      rect.setAttribute("width", SIZE);
      rect.setAttribute("height", SIZE);
      rect.setAttribute("fill", "var(--dim)");
      frag.appendChild(rect);
      cells.push(rect);
    }
  svg.appendChild(frag);
  return cells;
}

function lightField(cells, n) {
  // espalha: o real não é contíguo
  const total = cells.length,
    lit = Math.min(total, Math.max(0, Math.round(n)));
  const on = new Set();
  if (lit > 0) {
    const stride = total / lit;
    for (let i = 0; i < lit; i++) on.add(Math.min(total - 1, Math.floor(i * stride + stride * 0.37)));
  }
  cells.forEach((cell, i) => cell.setAttribute("fill", on.has(i) ? "var(--ink)" : "var(--dim)"));
}
```

Espalhar as células acesas em vez de agrupá-las importa: uma fatia contígua sugere
um bloco homogêneo que não existe na realidade.

Use estático no topo e ligado a um controle mais abaixo — o mesmo dispositivo
aparecendo duas vezes amarra a peça.

---

## 8. O que evitar (checklist anti-template)

Cada item abaixo estava na versão antiga do relatório ou é clichê reconhecível:

- Gradientes radiais coloridos no fundo do `body`.
- Cartão arredondado (16px+) flutuando com `box-shadow` e borda em gradiente.
- Fundo azul-marinho `#07111f` fingindo ser escuro. Se é dark, é `#000`.
- Um acento neon único (verde-limão, vermelhão) sobre quase-preto — é o segundo
  visual de IA mais comum que existe.
- Inter em tudo.
- Emoji como ícone.
- Donut de duas fatias.
- Numeração 01/02/03 sobre conteúdo que não é sequência.
- Barra de progresso ou animação que não informa nada.
- Número colorido com a cor da própria série.
- Texto em segunda pessoa ("seu sócio", "você", "vocês") em documento executivo.
  Nomeie a tese, não quem a defende: `TESE A · COMODITIZAÇÃO`, não "seu sócio
  está certo".
- Símbolo de marca vazio (`<span>` com gradiente e nada dentro) e página sem
  favicon — aba em branco denuncia rascunho.

---

## 9. Piso de qualidade

Não anuncie, só entregue:

```css
:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
  border-radius: 2px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  * {
    transition: none !important;
    animation: none !important;
  }
}

@media print {
  /* inverte os tokens — o documento existe em papel também */
  :root {
    --void: #fff;
    --surface: #fff;
    --rule: #ddd;
    --rule-2: #999;
    --ink: #000;
    --ink-2: #333;
    --ink-3: #666;
    --dim: #bbb;
  }
  body {
    background: #fff;
    color: #000;
    font-size: 11pt;
  }
  .topbar,
  .progress,
  #tip,
  .sim {
    display: none !important;
  }
  .bar-fill,
  .seg {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

Marca e favicon: um SVG geométrico, sem emoji. O do relatório é um quadrado
vazado com uma célula sólida no canto — o universo e a fatia capturável, a mesma
ideia da grade unitária.

```html
<link
  rel="icon"
  href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23000'/%3E%3Crect x='5.5' y='5.5' width='21' height='21' fill='none' stroke='%23787878' stroke-width='3'/%3E%3Crect x='17' y='17' width='9.5' height='9.5' fill='%23fff'/%3E%3C/svg%3E"
/>
```

---

## 10. Armadilhas técnicas (encontradas na prática)

**Estouro horizontal no mobile.** `grid-template-columns: 1fr` equivale a
`minmax(auto, 1fr)`, e o `min-content` de uma tabela com `min-width: 720px`
estica a coluna — o `overflow-x: auto` do wrapper não segura. Use sempre
`minmax(0, 1fr)` e adicione `min-width: 0` nos filhos do grid:

```css
.cols > *,
.sec-grid > * {
  min-width: 0;
}
@media (max-width: 700px) {
  .cols-2,
  .cols-3 {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

**`var()` funciona em atributo de apresentação SVG.** `fill="var(--dim)"` é válido
e reage a mudança de token — inclusive na inversão do `@media print`.

**`align-items: start` no grid de colunas.** Sem isso, o painel curto estica até
a altura do vizinho e sobra um bloco de preto morto no fim.

**Eixo `wdth` do Archivo.** Só responde via `font-variation-settings`, não via
`font-stretch` em todos os navegadores. Declare os dois eixos juntos:
`font-variation-settings: 'wdth' 112, 'wght' 680`.

**Título de painel em duas linhas** desalinha os gráficos de painéis vizinhos.
Encurte o texto do título ou do selo até caber em uma linha.

---

## 11. Ordem de execução

Cor por último. Quase todo gráfico ruim escolhe cor primeiro.

1. Definir o assunto, o público e a única tarefa da página.
2. Escrever a estrutura de argumento — as seções são a espinha, não a decoração.
3. Achar a distinção intelectual real do conteúdo → vira o sistema-assinatura.
4. Escolher a forma de cada gráfico pelo trabalho do dado (magnitude, identidade,
   polaridade, manchete). Às vezes a resposta não é gráfico.
5. Montar em branco sobre preto, sem cor nenhuma.
6. Só então introduzir cor, e só onde houver identidade a separar.
7. Validar a paleta com os limites da seção 5.
8. Renderizar e **olhar**: colisão de rótulo, geometria, estouro. O cálculo de cor
   não vê layout.
9. Testar em 390 / 768 / 1200px e conferir o console.
10. Tirar um acessório. Sempre sobra um.
