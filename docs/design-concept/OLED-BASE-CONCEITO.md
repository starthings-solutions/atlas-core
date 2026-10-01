# Base conceito — OLED Dark

**O que é.** A essência destilada do sistema visual usado nos relatórios HTML do
`@console`: o conjunto mínimo de decisões-raiz das quais todo o resto é
consequência dedutível, mais a camada de tradução para **aplicação interativa**.

**O que não é.** Não é `ESTILO-OLED-DARK.md`. Aquele arquivo é a _spec de
replicação_ — como reproduzir aquele relatório. Este é a _base conceito_ — o que
levar junto quando o produto não é um relatório.

|              | `ESTILO-OLED-DARK.md`         | `OLED-BASE-CONCEITO.md` (este)                          | `oled-base.css`       |
| ------------ | ----------------------------- | ------------------------------------------------------- | --------------------- |
| Pergunta     | como refaço aquele relatório? | por que o sistema é assim, e o que sobrevive fora dele? | onde começo a codar?  |
| Escopo       | um gênero (relatório denso)   | qualquer meio (web app, TUI, papel, slide, nativo)      | web app               |
| Estabilidade | por peça                      | por versão do sistema                                   | por versão do sistema |

Este documento é **autossuficiente**: a folha inteira está no anexo da §10, e `oled-base.css` é a mesma coisa em arquivo separado, para quem prefere importar em vez de colar.

**Corpus.** `relatorio_mercado_plataforma_medica_2026.html`,
`relatorio_starthings_health_mvp_2026.html`, `ESTILO-OLED-DARK.md` e —
como **grupo de controle** — `transcript/transcricao/transcricao.html`, onde o
mesmo autor portou o sistema para outro gênero. O que sobreviveu àquela troca é o
núcleo; o que caiu era vestimenta. Fora do corpus: `Torre de Controle.html`
(app light-theme empacotado, outro sistema).

**Emendas.** Onde o corpus é incoerente, este documento diverge e justifica —
marcado `[EMENDA]`. As três emendas de peso foram conferidas contra os arquivos:

| Emenda                                                  | Conferido                                                                                                                                                                                           |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ink-3: #6a6a6a` → `#787878`                          | `#6a6a6a` dá **3,88:1** sobre `#000` — reprova AA, e o token é usado a 10–12px. `#787878` dá **4,76:1**. No `@media print`, `#666` sobre `#fff` dá **5,74:1**: o papel é mais acessível que a tela. |
| Cor de risco duplicada em decimal → `--c2-rgb`          | `#d8a800` existe hardcoded em `style="color:#d8a800"` — sexta cor, sem token, não validada, não inverte no print, e num semáforo verde/âmbar/vermelho. É o mecanismo da fuga, documentado.          |
| Âncora sob barra fixa → `--stick` + `scroll-margin-top` | **zero** ocorrências de `scroll-margin` nos dois relatórios, com barra fixa de 58px e navegação por âncora.                                                                                         |

Confirmado também, e usado como lei: zero `@keyframes`; único `transition` é
`opacity .1s linear`; único `box-shadow` não-`inset` é `box-shadow: none`; zero emoji.

> **Implementação:** `oled-base.css` — tokens, primitivas e camada de aplicação,
> prontos para importar. O contrato de token vive lá, em arquivo único.
> Copiar em vez de importar é como o corpus acumulou ~40 divergências a mão.

---

## 1. O AXIOMA

Não há um axioma. Há **quatro**, e são irredutíveis entre si — nenhum deriva de outro, e remover qualquer um deixa um bloco de leis órfão. O teste de independência está ao fim da seção.

### A1 — MATERIAL: o fundo é o pixel apagado

> O plano de fundo é `#000000` literal. Não é "escuro", não é "quase preto": é ausência de emissão.

Tudo abaixo é dedução, não preferência:

| Consequência                                                                                       | Porque (ligação com A1)                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zero sombra.** Nenhum `box-shadow` de elevação existe.                                           | Sombra é escurecimento. Sobre luminância zero não há o que escurecer — o resultado é uma mancha cinza aditiva, que lê como sujeira, não como profundidade. |
| **Separação de planos é fio de 1px.**                                                              | É o único separador que sobra depois que a elevação é impossível.                                                                                          |
| **Recesso é clarear, não escurecer.** A calha (`#101010`) é _mais clara_ que o painel (`#080808`). | Inverte a convenção skeumórfica por necessidade física: para implicar "espaço a preencher" sobre zero, o único movimento disponível é para cima.           |
| **Apagar usa token dedicado, nunca alfa.**                                                         | Alfa sobre `#000` dilui _para o nada_. Em papel claro `opacity:.4` recua e permanece legível; aqui, some. Logo `--dim` existe.                             |
| **Não existe fundo tingido.**                                                                      | Cor com alfa sobre preto mistura com preto, não com branco: gera marrom/roxo sujo, e cria um plano de superfície fora da rampa.                            |
| **O branco é o slot de maior contraste possível (21:1).**                                          | Consequência aritmética: o piso do gamut maximiza o alcance do topo.                                                                                       |
| **A inversão total é o realce máximo disponível.**                                                 | Não sobra nada acima do branco sólido. Selecionar, tooltip, ação primária: todos são o mesmo gesto.                                                        |
| **Blur não gera mancha.**                                                                          | Ele borra as marcas brancas; o fundo já é o mínimo. Por isso o véu funciona por subtração de tinta, não por adição de escuridão.                           |

### A2 — ECONÔMICO: o branco é a tinta de dado; a cor é orçamento

> Cor não é decoração nem estado: é o único portador de **identidade simultânea**. Quem não tem identidade a separar não recebe cor.

| Consequência                                                                                                                                        | Porque (ligação com A2)                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Regra de admissão de cor:** cor entra se e somente se (a) há ≥2 identidades competindo na mesma marca, ou (b) o item carrega polaridade negativa. | Fora desses dois casos, cor é gasto sem retorno informacional. É a regra que o corpus opera mas nunca escreveu (`--c3`, `--c4`, `--c5` aparecem _apenas_ em barra dividida e empilhada). |
| **Teto de 5 slots, ordem fixa, nunca ciclar.**                                                                                                      | Cinco é o que a validação numérica sustenta contra `#000` (ver A2 → portão). Ciclar quebra a validação.                                                                                  |
| **A ordem segue a entidade, não o ranking.**                                                                                                        | Se a cor migra ao filtrar, ela deixou de identificar e passou a ranquear.                                                                                                                |
| **Grau de metadado é textura, não cor.**                                                                                                            | "Cor gasta em metadado é cor que falta no gráfico." O sistema de evidência inteiro existe para _devolver_ os cinco slots aos dados.                                                      |
| **Estado sobe na rampa de tinta, nunca acende cor.**                                                                                                | Estado é hierarquia de atenção, não identidade. `--ink-3 → --ink-2 → --ink`.                                                                                                             |
| **Cinza é proibido como categoria.**                                                                                                                | Falha o piso de ΔE (13,2 contra o azul, piso 15) e já tem função ocupada (massa não destacada).                                                                                          |
| **Não existe acento único.**                                                                                                                        | Um acento neon sobre quase-preto é a assinatura mais reconhecível de peça gerada — e seria redundante, porque o branco já ocupa o topo.                                                  |
| **Não existe token de sucesso.**                                                                                                                    | Sucesso não é identidade nem polaridade negativa. Ver §5.6 para a resolução.                                                                                                             |
| **Portão numérico obrigatório antes de qualquer slot existir.**                                                                                     | Olho não detecta colisão sob daltonismo.                                                                                                                                                 |

### A3 — EPISTÊMICO: todo número carrega o grau da prova que o sustenta

> Fato / proxy / modelo. Três graus, declarados uma vez no topo, repetidos em cada bloco.

Isto **não deriva de A1 nem de A2**. É uma decisão sobre honestidade do conteúdo. O que deriva de A2 é apenas a _codificação_ (textura em vez de cor). Sem A3, o sistema de evidência inteiro fica sem razão de existir, e o selo vira ornamento.

| Consequência                                                                             | Porque (ligação com A3)                                                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Todo painel de dado tem um selo no canto direito do título.**                          | Posição fixa converte a checagem em hábito.                                                                   |
| **O estado de falha e o estado vazio são desenhados.**                                   | "Um gráfico que só sabe desenhar sucesso mente por omissão." Ausência é uma afirmação e precisa ser afirmada. |
| **Toda grade contável carrega legenda de três partes:** unidade · universo · leitura.    | Um campo de mil células só é honesto se a unidade e o universo estiverem escritos.                            |
| **Numeração 01/02/03 só quando o conteúdo é sequência de argumento.**                    | Numerar o que não é sequência é afirmar uma ordem que não existe.                                             |
| **`role="img"` + `aria-label` narrando a distribuição em marcas puramente geométricas.** | A afirmação tem de existir também para quem não vê a marca.                                                   |
| **O vocabulário do selo é reescrito por documento; a textura não.**                      | O dispositivo é a distinção; as palavras são do domínio (Fato/Proxy → Auditado/Estimado).                     |

### A4 — INSTRUMENTAL: isto é um instrumento de medição, não uma peça de leitura contínua

> A tarefa é **consultar** — comparar, medir, decidir. Não é ler por vinte minutos seguidos.

| Consequência                                                                                                                                                                                         | Porque (ligação com A4)                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Todo número é mono e tabular, sem exceção.**                                                                                                                                                       | Comparação dígito a dígito exige coluna estável. É a única lei que sobreviveu à troca completa de gênero, família, unidade e paleta. |
| **Todo rótulo é mono, caixa alta, com tracking positivo.**                                                                                                                                           | Caixa alta em sans com tracking largo lê como marketing; em mono lê como etiqueta de painel.                                         |
| **Instrumento não tem inércia:** hover, foco e troca de estado são instantâneos.                                                                                                                     | Defasagem entre o que a marca mostra e o estado real é erro de leitura.                                                              |
| **Medida de texto em `ch`, nunca em px.**                                                                                                                                                            | O limite é caracteres por linha; travar em ch faz o limite acompanhar a fonte real e o clamp responsivo.                             |
| **Densidade alta, ritmo declarado.**                                                                                                                                                                 | Margem de UA colapsa e é imprevisível; todo respiro é explícito.                                                                     |
| **A forma é escolhida pelo trabalho do dado**, não pela estética: 0–10 → medidor segmentado; duas partes → barra dividida com total; 3–5 partes → empilhada com legenda; ordem → barras horizontais. | Elimina a discussão "qual gráfico fica bonito".                                                                                      |
| **O dado entra no CSS como canal declarado** (`--w`, `--c`, `--mark`), nunca como estilo calculado.                                                                                                  | O gráfico existe sem JavaScript e cada valor é auditável na fonte.                                                                   |
| **Cor por magnitude é proibida.** Magnitude é comprimento, contagem ou posição.                                                                                                                      | Heatmap é leitura aproximada; instrumento entrega leitura exata.                                                                     |

### Prova de não-redundância

| Remova | Fica órfão                                                                                                                                                                                                                                    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1     | Fio-em-vez-de-sombra, recesso-clareando, `--dim`-em-vez-de-alfa, inversão-como-realce, proibição de tint. (A2 não os prevê: um sistema claro pode ser econômico em cor e ainda usar sombra.)                                                  |
| A2     | Teto de 5 slots, portão numérico, textura-em-vez-de-cor, estado-por-rampa, ausência de acento. (A1 não os prevê: preto absoluto não impede um acento neon — pelo contrário, convida.)                                                         |
| A3     | O selo inteiro, a legenda de três partes, o estado vazio desenhado, a numeração condicional. (Nenhum outro axioma produz "grau de prova".)                                                                                                    |
| A4     | Mono tabular universal, medida em ch, zero inércia, escolha de forma por trabalho do dado. (Um documento preto, econômico em cor e epistemicamente honesto pode perfeitamente ser prosa em serifa — é exatamente o que as variantes VAR são.) |

**Corolário operacional (ordem de execução):** monte tudo em branco sobre preto, sem uma gota de cor. Só então introduza cor, e só onde houver identidade a separar. Depois valide numericamente. Renderize e olhe em 390 / 768 / 1200. Por último, **remova um acessório — sempre sobra um.**

---

## 2. AS LEIS INVARIANTES

Cada lei é testável: um humano ou um lint responde sim/não. **E** = essência (transfere para qualquer meio: papel, TUI, slide, nativo). **I** = implementação (específica de web/CSS).

### Essência

| #       | Lei                                                                                                                                                                              | Teste                                                                                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E1**  | A rampa neutra é estritamente acromática (R=G=B em todo degrau) e monotônica em luminância. Nenhum token neutro carrega matiz.                                                   | Para cada token neutro, os três pares hex são idênticos; a sequência de luminância é crescente sem empate.                                                                   |
| **E2**  | A base estrutural tem exatamente três tintas de texto (`--ink`, `--ink-2`, `--ink-3`); a aplicação tem um namespace semântico separado `--app-*`, nunca um quarto degrau neutro. | Texto estrutural usa a rampa; texto de estado usa só o token semântico cujo papel declara. Fio nunca vira tinta por acidente.                                                |
| **E3**  | A gramática de ênfase conserva forma e fio (1px = divisória, 2px = marcador), e a aplicação acrescenta semântica por namespace, não por slots categóricos.                       | Marcador de estado usa o token `--app-*` correto e mantém rótulo, forma/ícone e contagem; `--c1..--c5` não aparecem em `@layer app`.                                         |
| **E4**  | Estado de aplicação muda por token semântico Sunset Calm, nunca por cor categórica nem geometria: atividade, pendência, feedback e risco têm papéis fixos.                       | Foco/corrente/seleção/presença/concluído → activity; fila/pendente/atenção → pending; review/autoria → feedback; inválido/falha/destrutivo → risk. Nenhuma move `transform`. |
| **E5**  | Apagamento usa token dedicado da rampa, nunca alfa.                                                                                                                              | Zero ocorrências de `opacity` como estado desabilitado, filtrado ou não-selecionado.                                                                                         |
| **E6**  | **Admissão de cor tem dois namespaces:** `--c*` só para identidades simultâneas de dados; `--app-*` só para semântica de aplicação declarada.                                    | Gráfico/diagrama consome `--c*`; controle e estado consomem `--app-*`; os pastéis nunca preenchem uma série.                                                                 |
| **E7**  | A cor segue a entidade, nunca o índice nem o ranking. Filtrar ou reordenar não repinta quem sobrou.                                                                              | Remova o item de maior valor: nenhuma outra marca muda de cor.                                                                                                               |
| **E8**  | Grau de prova é textura acromática em três degraus (sólido / hachurado / vazado); estado de aplicação é semântico e sempre redundante.                                           | A legenda existe antes do primeiro selo. Nenhum grau usa cor; cada estado traz texto, forma/ícone e contagem, inclusive em print, forced colors e reduced motion.            |
| **E9**  | Todo número é tabular. Todo metadado e rótulo é monoespaçado. Número grande (display) pode migrar para a sans, mas continua tabular.                                             | Todo elemento que exibe número declara tabular. Todo rótulo caixa alta é mono.                                                                                               |
| **E10** | Medida de texto é travada em `ch`, escalonada por papel (título curto → corpo longo).                                                                                            | Nenhum `max-width` de texto em px ou %.                                                                                                                                      |
| **E11** | O dado entra como canal declarado no markup, não como estilo calculado. A folha continua dona de como o valor vira pixel.                                                        | Zero `style="width:…"` ou `style="background:…"` derivados de dado. Só custom properties.                                                                                    |
| **E12** | Estado de falha e estado vazio são desenhados: o instrumento em zero mais legenda de três partes — **o que aconteceu · qual o recorte exato · o que fazer agora**.               | Toda região que pode ficar vazia tem o estado desenhado. Nenhuma ilustração, nenhum ícone, nenhuma frase genérica.                                                           |
| **E13** | Toda paleta categórica passa por portão numérico antes de existir. Nenhuma paleta entra "no olho".                                                                               | Os limites de §3 são calculados e o resultado fica registrado no próprio arquivo, junto dos tokens.                                                                          |
| **E14** | Magnitude é comprimento, contagem ou posição — nunca cor.                                                                                                                        | Zero escala sequencial ou divergente. Zero heatmap. Zero semáforo.                                                                                                           |
| **E15** | **`[EMENDA]`** Movimento é permitido se e somente se informa (a) que algo apareceu, ou (b) que um valor mudou. Uma única duração, sem easing, desligável.                        | Cada declaração de movimento aponta para um dos dois casos. Nenhuma anima progresso desconhecido.                                                                            |
| **E16** | **`[EMENDA]`** Toda marca cujo contraste fica abaixo de 3:1 contra o fundo adjacente precisa ter seu valor escrito em texto adjacente, no mesmo bloco.                           | Para cada marca de baixo contraste, existe o número em texto na mesma linha.                                                                                                 |
| **E17** | **`[EMENDA]`** O marcador de contraste máximo (2px na tinta primária) é racionado: **no máximo um por região visível**.                                                          | Conte os marcadores por viewport. Mais de um por região = o recurso perdeu função.                                                                                           |

> **Sobre E15.** O corpus declara "zero animação" e opera com exatamente uma transição (opacidade do tooltip, `.1s linear`). Em relatório isso é correto: nada acontece de forma assíncrona. Em aplicação, tudo acontece — e uma célula que atualiza sozinha, sem nenhum sinal, é indistinguível de uma célula que sempre foi aquilo. A proibição precisa virar **orçamento** com critério, ou vira ou dogma inviável ou porta escancarada. As duas propostas de domínio que revisei erraram nas duas direções opostas: uma inventou `@keyframes` de varredura, outra baniu até o fade de saída, deixando transições mortas no arquivo.

> **Sobre E16.** É a resolução honesta do defeito de contraste não-textual. Medido: `--dim` contra a calha dá **1,33:1** — a barra não destacada reprova o piso de 3:1 do WCAG 1.4.11 como objeto gráfico. Mas o corpus já resolveu isso sem perceber: cada linha de barra carrega o valor em mono tabular à direita, e é exatamente por isso que os blocos `.bars` não recebem `role="img"` (o texto já está no DOM). A marca é redundante com o texto, logo não é objeto gráfico essencial. Isso transforma um defeito em lei auditável — e a lei tem dente: **se o valor não está escrito, o contraste da marca passa a ser obrigatório.**

> **Sobre E17.** A escassez é declarada no corpus ("se estiver em toda parte, deixa de sinalizar") e nunca é operacionalizada. Num relatório há um marcador por seção. Numa tela de aplicação coexistem aba ativa, item de navegação corrente, linha selecionada, painel-chave, página atual, camada-chave e aresta de entrada de modal — sete marcadores brancos simultâneos. Sem racionamento explícito, o recurso mais caro vira ruído no primeiro sprint.

### Implementação (web)

| #       | Lei                                                                                                                                                                                                                                                                                     | Teste                                                                                                                        |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **I1**  | Fundo `#000000` literal. Sem `prefers-color-scheme`: o escuro é fato, não preferência. `<meta name="color-scheme" content="dark">` impede o UA de pintar cromo claro.                                                                                                                   | Grep: zero `prefers-color-scheme` no CSS de tela; o meta existe.                                                             |
| **I2**  | Zero `box-shadow` de elevação. Permitido apenas `inset` **com raio de desfoque 0** — isso é fio, não sombra: contorno (`inset 0 0 0 1px`), marcador lateral (`inset 2px 0 0`), fio inferior em elemento `sticky` onde `border-collapse` descarta borda (`inset 0 -1px 0`).              | Regex: todo `box-shadow` começa por `inset` e tem terceiro comprimento igual a `0`. Qualquer desfoque > 0 reprova.           |
| **I3**  | Raio escalonado pelo tamanho do objeto: 3px em painel/tooltip/campo, 2px em barra/segmento/chip/foco, 1px em célula de medidor e quadradinho de legenda. Teto absoluto: 3px. Círculo (`50%`) só onde a semântica é literalmente "estado ligado".                                        | Nenhum `border-radius` > 3px exceto os círculos declarados.                                                                  |
| **I4**  | Todo grid usa `minmax(0, 1fr)`, jamais `1fr`, com `min-width: 0` explícito nos filhos. Duas travas, não uma.                                                                                                                                                                            | Grep: zero `grid-template-columns` contendo ` 1fr` sem minmax.                                                               |
| **I5**  | `overflow` existe em um lugar: o wrapper de tabela (`overflow-x: auto` + `min-width` rígido na table), mais contêineres de camada com `overscroll-behavior: contain`. A página nunca rola na horizontal.                                                                                | Cada `overflow` declarado tem justificativa nomeada. Teste em 390px: `document.documentElement.scrollWidth === clientWidth`. |
| **I6**  | `@media print` inverte **os tokens neutros e apenas eles**. Os slots categóricos não são redefinidos (foram validados contra fundo escuro e carregam identidade). Componentes cuja marca é `box-shadow: inset` recebem hex literal, porque muitos motores de impressão descartam inset. | O bloco print redefine só neutros. Toda primitiva com inset tem override literal.                                            |
| **I7**  | Foco é uma única regra global `:focus-visible` com contorno de 2px na tinta primária e offset. Zero `:focus`, `:active`, `:visited`. Em contêiner rolável o offset é negativo (offset positivo é recortado).                                                                            | Grep: zero `:active`/`:visited`; um único `:focus-visible` global mais os overrides de offset justificados.                  |
| **I8**  | `@media (prefers-reduced-motion: reduce)` com seletor universal e `!important`. É defesa contra o autor futuro, não contra o atual.                                                                                                                                                     | O bloco existe literal.                                                                                                      |
| **I9**  | Existe **um** plano translúcido por natureza: barra fixa e véu compartilham o mesmo token, derivado do fundo com alfa. Nunca dois véus empilhados.                                                                                                                                      | Todo `backdrop-filter` aponta para o mesmo token de fundo.                                                                   |
| **I10** | Marcadores de UI são caracteres tipográficos em mono com `font-style: normal`. Vocabulário fechado. Zero emoji. Ícone, quando inevitável, é SVG geométrico com `stroke: currentColor`.                                                                                                  | Regex de codepoints emoji e `U+FE0F` = zero. Todo `<svg>` de UI usa currentColor.                                            |
| **I11** | O peso vem do eixo variável, nunca do `font-weight` nativo. `h1,h2,h3 { font-weight: 400 }` e todo `<b>`/`<strong>` é reatribuído explicitamente.                                                                                                                                       | Zero `font-weight: 700` ou `bold`. Em contexto mono, o peso declarado existe no `@font-face` carregado.                      |
| **I12** | Toda cor sai de token. Hex literal só em exceção **declarada em comentário**, com o motivo.                                                                                                                                                                                             | Grep de `#[0-9a-f]{3,6}` fora do `:root` retorna só a allowlist comentada.                                                   |
| **I13** | Escala de z-index fechada e declarada uma vez, por ordem de urgência. Nada acima do topo. Nenhum componente escreve o número cru.                                                                                                                                                       | Zero `z-index` literal fora do `:root`.                                                                                      |
| **I14** | **`[EMENDA]`** O offset de âncora é derivado da altura da barra fixa, não fixado a mão, e todo alvo de âncora tem `scroll-margin-top`.                                                                                                                                                  | `scroll-margin-top` existe em `[id]`; o valor é `calc()` sobre o token de altura da barra.                                   |
| **I15** | **`[EMENDA]`** Piso de alvo de toque em `pointer: coarse`, aplicado sem inflar a caixa desenhada (área invisível via pseudo-elemento quando a densidade não permite crescer).                                                                                                           | Em emulação de toque, todo alvo interativo tem área ≥ 44px em ambos os eixos.                                                |
| **I16** | **`[EMENDA]`** Toda primitiva nova é inscrita em **duas** listas: a lista utilitária de mono (se numérica ou de rótulo) e o bloco `@media print`. Componente não inscrito desaparece no papel ou cai na sans.                                                                           | Diff de classes novas contra as duas listas.                                                                                 |

> **Sobre I14.** É a lacuna mais concreta do corpus: **zero `scroll-margin-top` nos quatro arquivos**, com barra fixa de 58px e navegação por âncora. Cada clique na nav deposita o título embaixo da barra. As variantes de transcrição corrigiram (74px/80px); os relatórios não. O offset sticky de 86px é derivado a mão de 58+28 e a relação nunca é declarada — numa aplicação com barra + filtro + cabeçalho de tabela fixo, quebra em silêncio.

---

## 3. O NÚCLEO DE TOKENS

### Rampa neutra — nove degraus, acromáticos, monotônicos

| Token         | Valor                    | Papel semântico                                                               | vs `#000000` | vs `#080808` |
| ------------- | ------------------------ | ----------------------------------------------------------------------------- | ------------ | ------------ |
| `--void`      | `#000000`                | Fundo da página. Tinta sobre superfície invertida.                            | 1,00         | —            |
| `--surface`   | `#080808`                | Plano de painel. Hover de linha de tabela.                                    | 1,05         | 1,00         |
| `--surface-2` | `#101010`                | **Calha**: trilho de barra, fundo de campo. Recesso é mais claro.             | 1,10         | 1,05         |
| `--rule`      | `#1b1b1b`                | Fio interno: divisória de lista/tabela, borda de painel.                      | 1,22         | 1,16         |
| `--dim`       | `#2a2a2a`                | Massa não destacada, grade de fundo, degrau intermediário de estado.          | 1,46         | 1,40         |
| `--rule-2`    | `#2e2e2e`                | Fio estrutural: abertura de bloco, topo de faixa, divisor de camada.          | 1,55         | 1,47         |
| `--ink-3`     | **`#787878`** `[EMENDA]` | Terciária: eyebrow, rótulo, nota, metadado. **E fio de elemento interativo.** | **4,76**     | **4,54**     |
| `--ink-2`     | `#a3a3a3`                | Secundária: corpo, rótulo de série, célula de tabela.                         | 8,33         | 7,94         |
| `--ink`       | `#ffffff`                | Primária: dado, título, marcador de 2px, foco, fundo de inversão.             | 21,00        | 20,03        |

> **`[EMENDA]` `--ink-3`: `#6a6a6a` → `#787878`.** Este é o defeito mais sério do corpus e ninguém calculou. `#6a6a6a` dá **3,88:1** sobre `#000` e **3,70:1** sobre `--surface`. Reprova WCAG AA para texto normal (4,5:1) e **não qualifica como texto grande** — o corpus usa esse token a 10px, 10,5px, 11px, 11,5px e 12px. A SPEC declara piso de "≥ 3:1", mas 3:1 é o piso de texto _grande_ e de objeto gráfico, aplicado aqui a texto minúsculo. Ironia medida: no `@media print` o `#666` sobre `#fff` dá 5,74:1 — **a versão em papel é mais acessível que a versão em tela.**
>
> `--ink-3` não é um detalhe: é literalmente **toda a camada de nomeação da interface** — cabeçalho de tabela, selo, eyebrow, rótulo, nota, navegação, numeração de trilho, rodapé, lista de fontes. Em relatório consultado por 20 minutos, passa. Em aplicação lida oito horas por dia, é falha estrutural.
>
> `#787878` dá **4,76:1** sobre `#000` e **4,54:1** sobre `--surface`. Preserva E1 (acromático, monotônico) e E2 (continuam três tintas). E não é uma cor inventada: **já existe no corpus**, como stroke do favicon — onde a auditoria registra "não é nenhum token". A emenda promove um valor órfão a token e conserta o piso no mesmo movimento.
>
> Limite conhecido: contra a calha `--surface-2` dá 4,31:1. Logo, **texto dentro de calha (placeholder, valor de campo) tem piso `--ink-2`**, não `--ink-3`.
>
> `#6a6a6a` não desaparece — desce para papel não-textual, onde o piso é 3:1: contorno de selo vazado, glifo desabilitado, marca de escala. Não é um quarto cinza de texto porque **não é usado como texto**.

> **`[EMENDA]` `--ink-3` como fio de elemento interativo.** Medido, `--rule-2` dá **1,55:1** — a borda de todo campo, chip e botão reprova o piso de 3:1 do WCAG 1.4.11, e essa borda é frequentemente o _único_ indicador de onde clicar. Não invento um décimo degrau: uso `--ink-3` (4,76:1 contra o void, 4,31 contra a calha), e o precedente é do próprio corpus, que já usa `--ink-3` como contorno em `.tag--model i { box-shadow: inset 0 0 0 1px var(--ink-3) }`. A gramática de fio passa a ter três tintas e dois pesos: `--rule` (interno), `--rule-2` (estrutural), `--ink-3` (fronteira de elemento interativo). Interatividade tem piso legal que estrutura não tem.

### Paleta categórica — cinco slots, ordem fixa, validada

| Token  | Valor     | Papel                                                                            | vs `#000000` |
| ------ | --------- | -------------------------------------------------------------------------------- | ------------ |
| `--c1` | `#ffffff` | Série 1, sempre dominante. Mesmo literal de `--ink`, nome separado de propósito. | 21,00        |
| `--c2` | `#f5451b` | Série 2; categoria de dados, nunca estado de aplicação.                          | 5,75         |
| `--c3` | `#0091c8` | Série 3.                                                                         | 5,88         |
| `--c4` | `#00a06b` | Série 4.                                                                         | 6,24         |
| `--c5` | `#9463ff` | Série 5.                                                                         | 5,49         |

**A ordem escrita não é a ordem operante.** A SPEC promete `c1 → c2 → c3 → c4 → c5`; a aplicação não interpreta esses slots como estado. Dados seguem a entidade, nunca ranking; risco de interface vive exclusivamente em `--app-risk`.

**Portão de validação (obrigatório antes de qualquer slot novo existir):**

| Critério                                | Limite                 | Paleta em uso |
| --------------------------------------- | ---------------------- | ------------- |
| Luminosidade OKLCH (fundo escuro)       | 0,48 – 0,67            | passa         |
| Croma OKLCH                             | ≥ 0,10                 | passa         |
| Separação protan/deutan (ΔE OKLab ×100) | ≥ 8                    | 9,5           |
| Piso de visão normal, pior par          | ≥ 15 (reprovação dura) | 16,1          |
| Contraste WCAG vs superfície            | ≥ 3:1                  | ≥ 5,49        |

O branco é **exceção declarada**: `L=1,0` e `C=0` estouram a faixa e o piso de croma por definição. É aceitável porque é o slot de maior contraste possível e é o princípio do sistema. **Todos os outros slots têm de passar.** Nomear a exceção é o que impede que ela vire licença.

> **Lacuna fechada.** Os valores OKLCH de `c1..c5` nunca tinham sido registrados — só os ΔE resultantes. Sem L/C/H ninguém **re-deriva** um slot novo, apenas testa um candidato às cegas. Re-derivados e gravados junto do hex em `oled-base.css`:
>
> | slot   | hex       | L     | C     | H     | L em 0,48–0,67    | C ≥ 0,10          |
> | ------ | --------- | ----- | ----- | ----- | ----------------- | ----------------- |
> | `--c1` | `#ffffff` | 1,000 | 0,000 | 89,9  | exceção declarada | exceção declarada |
> | `--c2` | `#f5451b` | 0,644 | 0,218 | 33,9  | passa             | passa             |
> | `--c3` | `#0091c8` | 0,619 | 0,130 | 234,4 | passa             | passa             |
> | `--c4` | `#00a06b` | 0,623 | 0,139 | 161,0 | passa             | passa             |
> | `--c5` | `#9463ff` | 0,631 | 0,221 | 293,5 | passa             | passa             |
>
> **Achado não declarado no corpus: `c2..c5` são isoluminantes** — ΔL de 0,025 entre o mais claro e o mais escuro. Os quatro slots cromáticos se distinguem **por matiz e croma, não por claridade**. É exatamente por isso que o portão de ΔE é obrigatório e "olhar" não substitui o cálculo: numa conversão para escala de cinza os quatro colapsam em praticamente o mesmo tom. Confirma, por outro caminho, por que grau de prova precisa ser textura — a paleta não tem eixo de luminosidade sobrando para carregar hierarquia.

### Paleta semântica de aplicação — Sunset Calm

Há dois namespaces com dois propósitos: `--c1..--c5` preserva identidades de
dados em gráficos e diagramas; `--app-*` comunica funções de controles e
estados. A separação é mecânica: `@layer app` nunca consome `var(--c1)` até
`var(--c5)`, e os pastéis nunca viram slots de gráfico.

| Token            | Valor / RGB               |               OKLCH | vs `#000` | vs `#080808` | Papel                                        |
| ---------------- | ------------------------- | ------------------: | --------: | -----------: | -------------------------------------------- |
| `--app-ink`      | `#f8f4eb` / `248 244 235` |  `0.968 0.013 86.8` |   19,13:1 |      18,25:1 | texto primário da aplicação                  |
| `--app-feedback` | `#ffb386` / `255 179 134` |  `0.829 0.107 51.4` |   12,04:1 |      11,49:1 | comentários, review, autoria                 |
| `--app-risk`     | `#f87171` / `248 113 113` |  `0.711 0.166 22.2` |    7,59:1 |       7,24:1 | inválido, falha, destrutivo                  |
| `--app-pending`  | `#f2c14e` / `242 193 78`  |  `0.834 0.141 85.4` |   12,51:1 |      11,93:1 | fila, pendente, rodando, atenção             |
| `--app-activity` | `#6fc7c2` / `111 199 194` | `0.773 0.086 190.8` |   10,62:1 |      10,13:1 | foco, corrente, seleção, presença, concluído |

O portão categórico os reprova de propósito: peach↔yellow `7,97` e
peach↔coral `14,83` ficam abaixo do gate normal `15`; há luminosidade acima do
intervalo categórico e a turquesa tem croma `0,086`, abaixo de `0,10`.
Aplicação não é gráfico: cada estado deve trazer rótulo legível, forma/ícone e
contagem além de cor. Print preserva texto/forma/contagem, forced colors troca
cor por Canvas/CanvasText e borda, e reduced motion remove transição/animação
sem apagar o estado.

### Tokens estruturais e novos para aplicação

| Token         | Valor                              | Estado                     | Papel / justificativa                                                                                                                                                                                                                                                                                                                      |
| ------------- | ---------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--max`       | `1180px`                           | existente                  | Largura do container único.                                                                                                                                                                                                                                                                                                                |
| `--rail`      | `92px` / `108px`                   | existente, **paramétrico** | Trilho de marcação. Varia com o que carrega — não é constante.                                                                                                                                                                                                                                                                             |
| `--gut`       | `30px`                             | existente                  | Gutter horizontal do grid de seção.                                                                                                                                                                                                                                                                                                        |
| `--mono`      | `"IBM Plex Mono", ui-monospace, …` | existente                  | Camada de instrumento.                                                                                                                                                                                                                                                                                                                     |
| `--sans`      | `"Archivo", ui-sans-serif, …`      | existente                  | Prosa e display, com eixo `wdth` variável.                                                                                                                                                                                                                                                                                                 |
| `--c2-rgb`    | `245 69 27`                        | **novo, obrigatório**      | Corrige dívida já registrada no corpus: a tinta de risco está duplicada em decimal em três lugares e não acompanharia uma mudança de `--c2`. Aplicação triplica os consumidores (fio de botão destrutivo, campo inválido, painel de falha, borda de diálogo, riscadura). **Não é cor nova** — é `--c2` decomposto. Não redefinir no print. |
| `--app-*-rgb` | valores da tabela acima            | **novo, obrigatório**      | Companheiros RGB dos cinco tokens semânticos; só consumidores de aplicação os usam.                                                                                                                                                                                                                                                        |
| `--veil`      | `rgba(0 0 0 / .72)`                | **novo**                   | O plano translúcido, hoje hardcoded na barra fixa. Sob `.72`, a tinta primária cai para `#474747` — exatamente entre `--dim` e `--ink-3`, ou seja, a página inteira desce para a faixa de "contexto silencioso". Não é escurecimento: é **subtração de tinta**, o único mecanismo disponível sobre zero.                                   |
| `--bar-h`     | `58px`                             | **novo**                   | Altura da barra fixa. Hoje é literal e o offset do trilho é derivado a mão.                                                                                                                                                                                                                                                                |
| `--stick`     | `calc(var(--bar-h) + 28px)`        | **novo**                   | Offset de âncora e de sticky. Torna declarada a relação que hoje é inferida (86 = 58 + 28). Consumido também por `scroll-margin-top`.                                                                                                                                                                                                      |
| `--ctl-h`     | `40px`                             | **novo**                   | Altura canônica de controle. O relatório tinha um controle isolado; aplicação põe campo, botão, select e chip na mesma linha e eles têm de casar na base. Derivado: `11px + 11px` de padding + line-box + 2px de fio.                                                                                                                      |
| `--tap`       | `44px`                             | **novo**                   | Piso de alvo em `pointer: coarse`. Piso entregue sem anunciar, na mesma categoria de `:focus-visible` e reduced-motion.                                                                                                                                                                                                                    |
| `--rail-nav`  | `236px`                            | **novo, paramétrico**      | Trilho de navegação (rótulo + numeral + contador). Distinto de `--rail` para os dois coexistirem. O corpus já trata largura de trilho como função da carga: 92 (numeral) → 108 (numeral + rubrica) → 282 (filtros + índice).                                                                                                               |
| `--z-*`       | escala fechada                     | **novo**                   | Continua a escala existente (barra 50 / progresso 60 / tooltip 90) preenchendo o vão: menu/popover 70, camada 80, aviso 88, véu 95. Nada acima de 95.                                                                                                                                                                                      |

**Tokens explicitamente recusados:**

- `--ok` / `--success` (verde). Viola E6: confirmação não é identidade simultânea nem polaridade negativa. Institucionalizar um verde de UI é exatamente o mecanismo que produziu o `#d8a800` fora da paleta no corpus real — sexta cor, sem token, não validada, e que **não inverte no print**. Ver §5.6 para a resolução sem verde.
- `--warn` (âmbar). Idem. "Atenção" é subida na rampa; "parcial" é hachura.
- `--shadow`. As variantes o declaram três vezes e nunca o usam — token morto e violação de A1.
- Token de duração de movimento. Cobre uma única ocorrência; um token que governa um call site não governa nada. Escreva o literal e deixe o kill-switch de reduced-motion fazer o trabalho.

---

## 4. AS PRIMITIVAS

O vocabulário de forma, descrito como conceito. Um porte para outro meio (TUI, slide, nativo, papel) reimplementa estas onze coisas e nada mais.

**1. PLANO.** Três níveis e um sub-nível, distinguidos por fio, nunca por elevação nem por fundo colorido.

- _Nu_ — conteúdo direto sobre o fundo, aberto por fio estrutural. É o nível que quebra a monotonia de grade-de-cartões: oito seções seguidas de cartão idêntico é o que dá cara de gerado.
- _Painel_ — retângulo de padding uniforme sobre a superfície de painel, com fio interno em volta. É a única estrutura do sistema com padding simétrico, porque é a única caixa fechada de propósito.
- _Painel marcado_ — painel cuja aresta de entrada recebe o marcador.
- _Calha_ — recesso, mais claro que o painel. Trilho de barra e campo de entrada são a mesma coisa: espaço declarado, ainda não preenchido.

**2. FIO.** O separador universal e o único portador de estrutura. Dois pesos: 1px (divisória) e 2px (marcador). Três tintas: interno, estrutural, e — `[EMENDA]` — fronteira de elemento interativo. O fio migra de eixo ao colapsar: nunca desaparece junto com a coluna, porque o fio _é_ a estrutura.

**3. MARCADOR.** 2px na tinta primária numa borda. O recurso de ênfase mais forte que existe sobre preto, e não gasta nenhum slot de cor. Migra do topo para a esquerda quando a pilha é lida verticalmente. Tem gêmeo simétrico: 2px na tinta de risco para polaridade negativa — mesma gramática, sinal invertido, legível sem legenda. **Racionado a um por região visível.**

**4. TINTA.** Três degraus de leitura, papéis fixos. Estado é movimento _dentro_ desta escada, nunca salto para fora dela. Ausência é um quarto degrau próprio (massa não destacada), não um alfa.

**5. RÓTULO.** Mono, caixa alta, tracking positivo escalonado inversamente ao tamanho e ao grau de solenidade: abertura (maior tracking) > etiqueta > cabeçalho de coluna > navegação > selo. É a camada que nomeia sem competir.

**6. DADO.** Mono tabular, alinhado à direita, em coluna de largura fixa dimensionada pela string mais longa. Número grande migra para a sans com largura expandida e tracking negativo, mas continua tabular. Quando o slot de número recebe uma frase, ele **troca de família** — a mono é reservada ao que é medida. A recíproca vale.

**7. MARCA.** A geometria que carrega magnitude. Trilho quase invisível implicando a extensão total, preenchimento ancorado no zero (base reta, ponta arredondada), altura fixa e pequena. Destaque se justifica por **entidade**, jamais por posição no ranking: se a cor seguisse o ranking, reordenar repintaria o gráfico e a cor deixaria de significar. O separador entre marcas contíguas é o próprio fundo — 2px de preto entre segmentos resolve daltonismo sem gastar cor.

**8. CÉLULA CONTÁVEL.** Vazio é contorno sem preenchimento (custo zero de luz); aceso é preenchimento. Três degraus quando o eixo é intensidade: vazado → intermediário → cheio. Transforma leitura em contagem de pixels acesos: a metáfora de painel de instrumento. Serve para nota discreta, régua de tempo, etapas, seleção, paginação.

**9. CAMPO UNITÁRIO.** A razão central do documento virada campo de células contáveis, com a unidade explícita. Células acesas são **espalhadas por passo constante**, nunca agrupadas — uma fatia contígua sugere um bloco homogêneo que não existe na realidade. O substrato é livre (mil clínicas, vinte e quatro meses); o idioma é fixo.

**10. LEGENDA.** Gramática de três partes, invariável: **afirmação · definição do universo · afirmação**. Um dispositivo novo herda esta legenda em vez de inventar outra — é o que faz dois documentos diferentes parecerem o mesmo instrumento. É também a forma canônica do estado vazio.

**11. SELO DE EVIDÊNCIA.** Quadrado pequeno cuja **textura** codifica o grau da prova. Sólido = fato observado; hachurado = derivado/autorreportado; vazado = premissa. Sobrevive a preto-e-branco e a qualquer visão de cor, e — decisivo — devolve os cinco slots de cor aos dados. A única variante colorida é a de polaridade. Declarado uma vez, repetido em cada bloco: declarar-e-repetir é o que converte o selo de ornamento em convenção lida.

**12. INVERSÃO.** Tinta e fundo trocam de lugar. É o realce máximo do sistema, disponível porque o fundo é o piso do gamut. Usado por seleção de texto, tooltip, ação primária e a superfície de aviso. **Não é um estilo — é o teto da escada**, e por isso é escasso como o marcador.

---

## 5. TRADUÇÃO PARA APLICAÇÃO

Regras resolvidas por domínio, já com as correções dos revisores incorporadas. Código só onde a forma exata é load-bearing.

### 5.1 Ação e comando

**Hierarquia sem preenchimento colorido.** O sistema não tem botão; o parente mais próximo é o chip (fio, sem fundo, raio 2px, rótulo mono caixa alta). Daí sai tudo.

| Tier       | Forma                                        | Repouso   | Hover                                     | Desabilitado                                    |
| ---------- | -------------------------------------------- | --------- | ----------------------------------------- | ----------------------------------------------- |
| Primária   | **Inversão** (fundo `--ink`, tinta `--void`) | —         | fio interno `inset 0 0 0 1px var(--void)` | perde a inversão: fio `--rule`, tinta `--ink-3` |
| Secundária | Caixa de fio `--ink-3`                       | `--ink-2` | tinta `--ink`, fio `--ink`                | tinta `--ink-3`, fio `--rule`                   |
| Terciária  | Sem caixa                                    | `--ink-2` | `--ink`                                   | `--ink-3`                                       |
| Destrutiva | Fio `rgb(var(--c2-rgb)/.34)`, tinta `--c2`   | —         | fio `--c2` cheio                          | perde a cor inteira                             |

**Uma primária por faixa de ação.** É a mesma economia do marcador: a inversão é o teto da escada.

Correções que os revisores acertaram e que ficam como regra:

- **Nunca `filter: brightness()` em tinta ou em fio.** O multiplicador é lei _sobre preenchimento existente de marca de dado_ (`brightness(1.12)`), justamente para preservar a identidade da série. Aplicado a `#f5451b` como texto, ele clipa o canal vermelho e desloca o matiz para fora do valor validado. E aplicado a branco puro é inerte. Hover de primária resolve por anel interno; hover de destrutiva já está no máximo.
- **Nunca `pointer-events: none` em `<button>`** — mata o cursor e o título. Bloqueio de ativação é do handler.
- **Nunca token de fio como tinta de texto.** `--rule-2` sobre `#000` dá 1,55:1: o contador desaparece, não recua.
- **Sem estado de pressão.** O corpus não declara `:active` de propósito. O retorno é a própria consequência da ação.

**Ocupado, sem spinner.** Fio de 1px na base da caixa, largura vinda do canal `--p` quando há progresso real. Indeterminado **não varre** — fio estático em `--ink-3` mais o **tempo decorrido em mono tabular** no rótulo. O que se move é o número, não a forma; reescrever `textContent` não é transição nem animação, então sobrevive intacto a reduced-motion.

**Concluído.** Glifo `✓` em `--ink` (não verde — ver §5.6), fio promovido, rótulo em tinta primária. Espaço reservado com `visibility` para alternar sem reflow.

### 5.2 Entrada e formulário

**O campo é uma calha**, não um cartão: fundo `--surface-2` (o mesmo token do trilho de barra), fio de 1px `--ink-3` `[EMENDA — piso de 3:1 em fronteira interativa]`, raio 3px. Preencher o campo é escrever tinta dentro do trilho — a mesma metáfora do preenchimento acender sobre a massa não destacada.

**Nenhum controle usa a fonte do sistema operacional.** `button, input, select, textarea { font: inherit; color: inherit }` é obrigatório, não higiene.

**Validação não é semáforo.** O eixo de _confirmação_ é acromático e codificado por textura, reusando o selo de evidência; o eixo de _polaridade_ tem um único valor visível:

| Estado                         | Marca          | Tinta     | Porquê                   |
| ------------------------------ | -------------- | --------- | ------------------------ |
| Dica / requisito não avaliado  | vazado         | `--ink-3` | ainda é premissa         |
| Aceito com ressalva / derivado | hachurado      | `--ink-2` | já há valor, não é final |
| Verificado                     | sólido `--ink` | `--ink-2` | é fato observado         |
| Erro                           | sólido `--c2`  | `--c2`    | polaridade               |

- **Cor só no fio de 1px, na tinta da mensagem e no selo de 8px.** Nunca fundo tingido: tint sobre `#000` gera marrom/roxo sujo e cria um quarto plano.
- **Dispare em `:user-invalid` ou `[aria-invalid]`, nunca `:invalid`.** `:invalid` casa com todo campo obrigatório vazio na carga: o formulário nasce vermelho, que é o semáforo na forma mais agressiva, e contraria "o limiar é uma regra, não um alarme".
- **Uma polaridade por bloco.** Um textarea estourado que dispara simultaneamente contador vermelho + fio vermelho + mensagem vermelha é um semáforo por acumulação. O corpus resolve isso em `.score-row.is-weak`: acende o medidor e **rebaixa** o rótulo, em vez de repetir o vermelho.
- **Rótulo sempre visível acima do campo**, mono caixa alta. Zero floating label: exigiria transição, e a transição não existe. O placeholder é exemplo de formato, nunca o nome do campo.
- **Obrigatório é marca tipográfica em tinta primária**, declarada uma vez na legenda do formulário e repetida em cada campo. Nunca vermelho: um campo obrigatório ainda vazio não é um erro.
- **Toggle é comutador segmentado**, não pílula deslizante: pílula exige raio > 3px e transição de `transform`, ambos proibidos. Dois segmentos de raio 2px, lado ativo em inversão — legível em preto-e-branco, sem um pixel de movimento.
- **Texto dentro de calha tem piso `--ink-2`**, não `--ink-3` (4,31:1 é abaixo do piso).

**Medidor de força/completude:** reusa a célula contável, sem barra em degradê. Comprimento é magnitude; tinta é julgamento binário (abaixo do limiar ou não). Não existe estado "médio amarelo".

### 5.3 Navegação e cromo

**Item ativo não ganha fundo, pílula, nem acento.** Promove o fio de 1px para 2px na tinta primária e sobe a tinta de terciária para primária. É `.panel--mark` girado para o eixo da lista.

```
horizontal:  o marcador de 2px assenta SOBRE o fio de 1px da barra (margin-bottom:-1px)
vertical:    o marcador migra para a borda esquerda (a pilha é lida verticalmente)
repouso:     borda de 2px na tinta estrutural — reserva o espaço, zero reflow ao ativar
```

- **`aria-current` / `aria-selected` são a fonte de verdade**, consumidos direto pelo CSS. Nunca uma classe `.active` paralela: o estado tem de sobreviver à impressão e ao leitor de tela.
- **Hover não pinta fio de 2px em tinta estrutural.** Não existe esse peso híbrido na gramática. Hover resolve só na rampa de tinta; o fio de 2px acende apenas no item corrente.
- **Sem "elevate on scroll"** na barra fixa. É a assinatura do AppBar do Material com o fio no lugar da sombra. A barra tem um fio permanente; o blur já diz que há conteúdo por baixo.
- **Breadcrumb usa `/`**, não chevron — o corpus já escreve hierarquia com barra na própria marca. O ponto médio fica reservado a metadado paralelo. O nível corrente nunca trunca; os ancestrais truncam.
- **Mobile:** a navegação horizontal desaparece abaixo do breakpoint de arquitetura e é substituída por `<details>/<summary>` nativo com marcador tipográfico. Sem hambúrguer, sem drawer com backdrop — sobre `#000` não há backdrop a escurecer, e o único plano translúcido já está gasto.
- **Skip-link obrigatório** como primeiro nó focável, em inversão, fora da tela por `transform` (nunca `display:none`, que o tiraria da ordem de foco). O corpus tem **zero** skip-links com 8–9 links de navegação antes do conteúdo.
- **Paginação:** régua de células contáveis com três estados (futura vazada / percorrida intermediária / corrente cheia) e a contagem `07/24` sempre visível em mono tabular. Acima de ~40 páginas, numerais tabulares com o fio de topo promovido no atual. Nunca caixas numeradas com fundo no ativo — é `.pagination` de framework.

### 5.4 Estrutura de dado denso

**A tabela é o estado natural do sistema, não um componente.**

| Elemento        | Regra                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chassi          | `border-collapse: collapse`, `min-width` rígido rebaixado por tabela via inline, `overflow-x: auto` isolado no wrapper, `border-top` estrutural.                                                                                                 |
| Zebra           | **Proibida.** Cria um quarto plano fora da rampa e compete com o hover, que já ocupa o degrau `--surface`. Separação é o fio de 1px interno em `border-bottom` — e apenas ele: sem `border-left/right`, que nivelaria tudo em grade de planilha. |
| Cabeçalho       | Mono no menor corpo do sistema, caixa alta, terciária, `white-space: nowrap` (rótulo em duas linhas desalinha as colunas).                                                                                                                       |
| Cabeçalho fixo  | Fundo é o próprio `--void` (não é superfície nova), fio vira `inset` porque `border-collapse` descarta borda em elemento sticky. **Sem sombra.**                                                                                                 |
| Ordenação       | Glifo tipográfico mono no `::after` do botão (inativo na tinta terciária, jamais em token de fio) + fio inferior promovido a 2px na coluna ativa.                                                                                                |
| Coluna numérica | Mono tabular, à direita, largura fixa pela string mais longa. Ausência é travessão, nunca célula em branco.                                                                                                                                      |
| Célula truncada | Largura em `ch` via canal inline; texto completo no tooltip único, com o span **focável** (ver abaixo).                                                                                                                                          |
| Estado de linha | Vocabulário fechado e partilhado entre componentes: promoção para tinta primária / rebaixamento ou marcação em risco / fechamento com fio estrutural.                                                                                            |
| Total           | Fio estrutural em cima e tinta cheia. Nunca fundo, nunca negrito global.                                                                                                                                                                         |
| Densidade       | Dois tokens de padding trocados na região; três degraus, todos valores reais da escala de listas do corpus.                                                                                                                                      |

**Colisões de estado que precisam ser desfeitas.** Hover de linha, linha selecionada e linha de detalhe não podem todos pintar `--surface` — ficam indistinguíveis. Resolução: hover fica com o degrau de superfície; seleção usa marcador lateral de 2px (é `.read` em escala de linha); detalhe usa fio estrutural em cima e embaixo mais marcador lateral.

**Ações de linha sempre visíveis** em tinta terciária, subindo com o hover da linha e do item. Nunca `opacity: 0` até o hover: teclado não tem hover, e sobre `#000` opacidade não é um estado, é desaparecimento.

**`[EMENDA]` O tooltip precisa de teclado.** O corpus tem 42 marcas com `data-tip` em um documento e **nenhuma focável** — o valor absoluto de cada marca é inalcançável por teclado e inexistente em toque. Em relatório era conveniência (o número também estava na linha); em grade densa com célula truncada, **o tooltip é o dado**. A delegação passa a ouvir `focusin`/`focusout` além de `pointerover`/`pointermove`, e o alvo recebe `tabindex="0"`.

**Barra de ação em lote.** Se existe seleção, existe consequência. Controle sem consequência é o "controle que não informa nada" do checklist. Faixa nua aberta por fio estrutural, contagem em mono tabular, ações como links por fio, destrutiva em tinta de risco.

### 5.5 Sobreposição e camada

**O véu não escurece — apaga.** Sobre preto não há o que escurecer; o que a página tem a perder é a tinta branca. Sob `rgba(0 0 0 / .72)`, a tinta primária cai para `#474747`: exatamente a faixa entre massa não destacada e tinta terciária, isto é, a página inteira desce para "contexto silencioso, presente mas não competitivo". Separação por **subtração**, não por adição de altura.

- **Zero sombra em modal, gaveta, menu e popover.** A folha **não clareia** para parecer elevada: fica na mesma superfície de painel do corpo do documento. Quem separa é o véu por baixo e o fio no perímetro.
- **Aresta de entrada** carrega o marcador de 2px, no lado por onde a camada entra. A gaveta é o bloco marcado em escala de tela: marcação lateral, não caixa flutuante. Perímetro completo só onde há plano vizinho a separar — nas bordas coladas à viewport, fio de 1px não separa nada.
- **Entrada e saída só por opacidade.** Slide e scale são a assinatura da biblioteca; o sentido de origem já está codificado geometricamente pela aresta.
- **Sem bico e sem seta** no popover. O único flutuante ancorado do corpus não tem seta, e o que conecta dois blocos neste sistema é o alinhamento de borda, não um conector desenhado.
- **Um véu por vez.** Dois véus somam alfa e a página vai a preto absoluto, apagando o contexto que o véu existe para preservar. Modal sobre modal é proibido: a segunda pergunta substitui a primeira ou vira etapa. Menu e popover sobre modal são permitidos, sem véu.
- **O véu fica acima do tooltip.** O tooltip é `position: fixed` com `pointer-events: none` e não é bloqueado pelo véu — qualquer marca com `data-tip` no fundo pinta por cima do diálogo. Ou o véu vence, ou o tooltip é suprimido enquanto ele existe. Preferencialmente ambos.
- **Não centralize com `transform`.** `transform` cria bloco de contenção para descendentes `position: fixed`; qualquer menu ou popover dentro do modal, posicionado por coordenadas de viewport, sai errado. Use `inset: 0` + `margin: auto`.
- **`inert` no conteúdo por baixo.** Travar o foco por JS e apagar visualmente não basta: sem `inert`, o rotor do leitor de tela atravessa o documento inteiro por trás do véu — a camada é modal no pixel e não na árvore.
- **Toda camada desaparece na impressão.** Papel não tem ponteiro nem rolagem; um modal impresso mostra uma pergunta congelada fingindo ser conteúdo.

### 5.6 Retorno, status e vazio

**A resolução do "sucesso sem token".** O corpus não tem verde e não deve ter. Mas aplicação precisa confirmar. A resposta está dentro do próprio sistema: **concluído é o selo sólido na tinta primária — o grau "fato observado".** Isso não é uma colisão semântica, é uma coincidência correta: "esta operação aconteceu e está verificada" e "este número é fato observado" são a mesma afirmação epistêmica, mudando apenas o sujeito, que o rótulo já declara. O corpus já exercita essa reutilização: as mesmas três texturas servem "grau de prova" e "qualidade da evidência" (Excelente / Boa / Baixa) na mesma tabela. Verde seria um sexto matiz não validado — e é exatamente assim que o `#d8a800` entrou.

| Primitiva                  | Forma                                                                                                                                                                                                | Não é                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Badge de status**        | Quadrado de textura + rótulo mono. Quatro estados: feito (sólido) / em curso (hachurado) / previsto-ocioso (vazado) / falha (sólido em risco).                                                       | Pílula colorida, `border-radius: 999px`, ícone circular.       |
| **LED de sessão**          | O único círculo do sistema, **uma instância por tela**. Ligado / caído (mesma forma, tinta invertida) / reconectando (vazado).                                                                       | Um ponto colorido por linha de lista.                          |
| **Alerta inline**          | Marcação lateral com rótulo. Três níveis: fio 1px estrutural (informativo) / 2px primário (exige leitura) / 2px risco. Prosa permanece na tinta de leitura.                                          | Caixa com fundo tingido e ícone de severidade.                 |
| **Aviso persistente**      | Inversão (o tooltip que persiste), com fio de 2px à esquerda carregando a polaridade. Fundo nunca colore.                                                                                            | Faixa verde/âmbar/vermelha com ícone e barra de tempo animada. |
| **Progresso determinado**  | A linha de barra reaproveitada: nome / trilho / valor. Preenchimento nasce na massa não destacada e sobe para primária ao concluir. Guardrail tracejado branco marca prazo ou meta.                  | Barra listrada, degradê, cor por faixa.                        |
| **Progresso por etapas**   | Células contáveis com três degraus, contador `3/7` em mono tabular ao lado e legenda de três partes.                                                                                                 | Stepper com bolinhas e conectores.                             |
| **Indeterminado**          | **Trilho cheio, preenchimento ausente** (a extensão existe, nada foi capturado) + tempo decorrido em mono tabular.                                                                                   | Spinner, barra varrendo, `@keyframes`.                         |
| **Esqueleto**              | O instrumento em estado zero: trilho vazio, células só com contorno, valor como travessão tabular. **O rótulo nunca é esqueleto** — já é conhecido antes da requisição.                              | Retângulos cinza com shimmer.                                  |
| **Vazio**                  | Superfície nua + instrumento em zero + legenda de três partes + ação.                                                                                                                                | Ilustração, mascote, "Nada por aqui ainda!".                   |
| **Erro em bloco**          | Painel com fio de risco a 34% e título na tinta de risco; **fundo permanece o de painel**. Mensagem humana em tinta de leitura; código técnico em nota mono tabular.                                 | Painel com fundo vermelho, mensagem em vermelho.               |
| **Confirmação destrutiva** | Painel com marcador de polaridade negativa no topo + lista do que será destruído com os valores riscados em risco + trava por digitação. O botão destrutivo é fio, nunca inversão nem preenchimento. | Modal com faixa vermelha e botão vermelho sólido.              |

**O aviso nunca é o único canal.** Ele anuncia; o erro passa a existir permanentemente no bloco afetado, com código e horário em mono tabular. Regiões vivas são **irmãs e planas** (uma polite, uma assertive), nunca aninhadas — `role="alert"` dentro de `role="status"` produz anúncio duplicado ou engolido.

---

## 6. O CHECKLIST NEGATIVO

| Proibido                                                       | Porque                                                                                    | No lugar                                                                                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Gradiente radial colorido no fundo                             | Assinatura imediata de peça gerada; sobre `#000`, banding visível                         | Fundo chapado. O único gradiente permitido é **gradiente-textura**: hachura de selo, tracejado de guardrail, seta de select |
| Cartão arredondado (8px+) flutuando com sombra                 | Elevação não existe sobre zero (A1); raio gordo é o tique visual de template              | Painel com fio de 1px, raio 3px                                                                                             |
| Azul-marinho "quase preto" fingindo escuro                     | Viola A1: o pixel não apaga                                                               | `#000000` literal                                                                                                           |
| Acento neon único sobre quase-preto                            | Segundo visual de IA mais comum; redundante com o branco (A2)                             | Inversão para o topo da escada; rampa de tinta para tudo abaixo                                                             |
| Zebra striping                                                 | Cria um quarto plano fora da rampa e compete com o hover                                  | Fio de 1px interno em cada linha; hover sobe um degrau de superfície                                                        |
| Sombra sob cabeçalho fixo ao rolar                             | Sombra sobre preto é mancha; "elevate on scroll" é assinatura de framework                | Fundo opaco no próprio `--void` + fio `inset`                                                                               |
| Spinner, shimmer, barra indeterminada animada                  | "Animação que não informa nada"; zero `@keyframes` no corpus                              | Trilho cheio com preenchimento ausente + contador de tempo em mono tabular                                                  |
| `opacity: .4` como desabilitado/filtrado                       | Sobre `#000` dilui para o nada (A1); é o padrão do sistema de papel, não deste            | Descer a rampa: tinta terciária, fio interno, massa não destacada no preenchimento                                          |
| Badge circular colorido de notificação                         | Fundo tingido proibido; círculo reservado à semântica "ligado"                            | Quadrado de 8px com textura + contador em mono tabular na rampa neutra                                                      |
| Semáforo verde/âmbar/vermelho                                  | Não existe token de sucesso nem de alerta (A2); o amarelo já vazou uma vez fora da paleta | Textura para o eixo de confirmação; risco é a única cor                                                                     |
| Botão destrutivo com fundo vermelho                            | Preenchimento colorido grande; risco usa a cor só na borda e no rótulo                    | Fio a 34% no primeiro passo, fio cheio de 2px na confirmação                                                                |
| Botão primário colorido                                        | Gastaria um slot categórico numa função de UI (A2)                                        | Inversão total                                                                                                              |
| Pílula/pastilha no item de navegação ativo                     | Fundo tingido + raio > 3px                                                                | Fio de 2px na tinta primária + subida na rampa                                                                              |
| Ícone de biblioteca, emoji, chevron, lupa                      | Injeta cor e estilo de terceiros; quebra impressão P&B                                    | Vocabulário tipográfico fechado (`+ – ✓ ✕ →`) ou SVG geométrico com `currentColor`                                          |
| `text-decoration: underline` e link azul                       | Azul seria um sexto acento e colidiria com a série 3                                      | Sublinhado por `border-bottom` de 1px que acende para a tinta primária                                                      |
| Anel de foco azul do UA; `outline: none` compensado por sombra | O azul não pertence à paleta                                                              | Contorno de 2px na tinta primária com offset (negativo em contêiner rolável)                                                |
| Cor por magnitude (heatmap, célula colorida por faixa)         | Cor gasta em magnitude é cor que falta na identidade (A2/E14)                             | Comprimento, contagem de células, ou posição                                                                                |
| Cinza como categoria ("outros", "desconhecido")                | ΔE 13,2 contra o azul, abaixo do piso; e o cinza já tem função                            | Textura: slot "outros" é hachurado ou vazado                                                                                |
| Número colorido com a cor da própria série                     | Duplica a codificação e derruba o contraste do elemento que precisa de leitura exata      | Quadradinho colorido carrega a identidade; o número fica na tinta de texto                                                  |
| Tabela que vira cartões no mobile                              | Destrói a comparação coluna a coluna, único motivo de existir uma tabela                  | `min-width` rígido + rolagem local no wrapper                                                                               |
| `grid-template-columns: 1fr`                                   | `1fr` = `minmax(auto,1fr)`; o min-content da tabela estica a coluna e estoura a página    | `minmax(0,1fr)` + `min-width: 0` nos filhos                                                                                 |
| Rótulo de comando em sans capitalizado                         | Comando pertence à camada de instrumento (A4)                                             | Mono, caixa alta, tracking positivo                                                                                         |
| Classe `.active` paralela ao ARIA                              | O estado tem de sobreviver à impressão e ao leitor de tela                                | O atributo ARIA é a fonte de verdade, consumido pelo CSS                                                                    |
| Numeração 01/02/03 em conteúdo que não é sequência             | Numeração decorativa é o tique mais fácil de detectar (A3)                                | Numere só sequências de argumento, e espelhe no menu com o nome do passo                                                    |
| Segunda pessoa em documento executivo ("seu sócio", "você")    | Transforma análise em pitch                                                               | Nomeie a tese, não quem a defende                                                                                           |
| Estado vazio genérico                                          | "Um gráfico que só sabe desenhar sucesso mente por omissão" (A3)                          | Instrumento em zero + as três partes                                                                                        |
| Camada sobrevivendo à impressão                                | Papel não tem ponteiro nem rolagem                                                        | Toda camada interativa com `display: none` no bloco print                                                                   |
| Dois véus empilhados                                           | Somam alfa e apagam o contexto que o véu preserva                                         | Um véu; a segunda pergunta substitui ou vira etapa                                                                          |
| `pointer-events: none` em `<button>`                           | Mata cursor e título                                                                      | Bloqueio no handler                                                                                                         |
| `filter: brightness()` em tinta ou fio                         | Clipa canal e desloca matiz para fora do valor validado                                   | Multiplicador só sobre preenchimento de marca de dado                                                                       |
| Token de fio usado como tinta de texto                         | 1,55:1 — o texto some, não recua                                                          | A rampa de texto tem três degraus e só três                                                                                 |
| Ações de linha escondidas com `opacity: 0` até o hover         | Teclado não tem hover                                                                     | Sempre visíveis em tinta terciária, subindo com o hover                                                                     |

---

## 7. LIMITES

### Quando NÃO usar este sistema

| Situação                                                         | Porquê                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A tarefa é **ler continuamente** por minutos, não consultar      | Viola A4 na raiz. Preto absoluto com branco puro maximiza contraste para leitura de dígito; para prosa longa, cansa. O próprio autor construiu um **segundo sistema, oposto**, para transcrição — papel quente, serifa com eixo óptico, acento, sombra, raio 10px — e a SPEC nunca reconhece sua existência. Essa é a evidência mais forte do limite. |
| **Conformidade WCAG AA é contratual**                            | Sem a emenda de `--ink-3`, toda a camada de rótulo reprova (3,88:1 a 10px). Mesmo com a emenda, `--rule` (1,22:1) e `--dim` (1,46:1) só passam sob E16 — que exige o valor escrito em texto adjacente. Auditoria formal vai apontar.                                                                                                                  |
| **Luz ambiente forte, e-ink, ou impressão-primeiro**             | O sistema é calibrado para OLED em ambiente controlado. O `@media print` funciona, mas é um _documento diferente_, não o mesmo em papel.                                                                                                                                                                                                              |
| **A cor da marca precisa dominar**                               | Não há regra para isso e as duas únicas âncoras de identidade do corpus (stroke da marca, stroke do favicon) estão **fora do sistema de tokens** — nem invertem no print. A camada de identidade nunca foi projetada.                                                                                                                                 |
| **Mais de 5 identidades simultâneas são estruturais**            | O teto é validado, não arbitrário. A sexta série exige facetas ou pequenos múltiplos — que são prescritos e nunca especificados.                                                                                                                                                                                                                      |
| **O conteúdo não tem magnitude a comparar**                      | Metade do sistema (marca, campo contável, medidor, guardrail, selo) fica ociosa. Um formulário puro ou um CRUD sem números usa 30% do vocabulário e paga 100% da disciplina.                                                                                                                                                                          |
| **A peça é marketing**                                           | O sistema lê como instrumento — o que é exatamente o registro errado numa landing page.                                                                                                                                                                                                                                                               |
| **É preciso arrastar, reordenar, editar inline, ou virtualizar** | Conflito de premissa, não lacuna de spec: todos dependem de movimento, de `:active`, ou de estado de hover persistente. As três coisas que A4 proíbe.                                                                                                                                                                                                 |

**Caminho de saída.** Se um time já começou aqui e bateu numa dessas paredes: a fronteira negociável é a **superfície** (fundo, sombra, raio, família expressiva). A fronteira inegociável é o **chassi** (E1–E17). Trocar `#000` por papel claro é trocar de sistema, e nesse caso quatro leis caem juntas (sem sombra, recesso clareando, `--dim`-em-vez-de-alfa, inversão-como-realce) — todas são consequência de A1.

### O que NÃO transfere

O corpus contém a prova experimental: um mesmo autor portou o sistema de relatório analítico para transcrição de reunião. O que sobreviveu à troca de gênero, família, unidade, paleta e modo de cor é o núcleo; o que caiu era vestimenta.

| Sobreviveu (núcleo)                                         | Caiu (camada do gênero relatório) |
| ----------------------------------------------------------- | --------------------------------- |
| Mono para todo metadado                                     | Preto absoluto                    |
| `tabular-nums` em todo número                               | A sans variável com eixo `wdth`   |
| Caixa alta + tracking largo como único tratamento de rótulo | Todo o sistema de evidência       |
| Medida em `ch`                                              | Todo gráfico e `role="img"`       |
| Rampa de três tintas / dois fios                            | O bloco `@media print`            |
| Grid trilho + `minmax(0,1fr)`                               | Favicon e `<head>` completo       |
| Trilho sticky                                               | O simulador                       |
| Barra de fio de progresso derivada de valor real            | O campo unitário                  |
| Marcador lateral de 2px                                     | A proibição de acento             |
| Foco de 2px + `prefers-reduced-motion`                      | O raio de 3px                     |
| Ausência de emoji                                           | A ausência de sombra              |

**Meios não cobertos, com o custo de cada porte:**

- **PDF/papel** — o `@media print` existe e é real, mas falta tamanho de página, margens, cabeçalho corrente, numeração (o sistema tem contadores CSS e nunca os usa para paginar), `orphans`/`widows`, e repetição de cabeçalho de tabela.
- **Slides** — todo display usa `clamp()` com coeficiente `vw`. Numa tela fixa de 1920 o clamp entrega sempre o teto; um deck precisa de escala fixa, que não existe.
- **TUI/CLI** — é o porte **mais barato disponível e ninguém escreveu**. Mono já é nativo, tabular já é nativo. Mapeamento direto: três tintas → três intensidades ANSI; fio → box-drawing; textura → padrão ASCII; célula contável → caractere literal; marcador de 2px → borda dupla.
- **Nativo (iOS/Android)** — px em tudo com medidas em `ch` quebra Dynamic Type. Falta o mapeamento do fio para separador de plataforma.
- **E-mail** — o sistema inteiro depende de custom properties, sem fallback. Inviável sem reescrita.
- **`forced-colors` (Alto Contraste do Windows)** — **apaga `box-shadow` e `background-image`, ou seja, apaga o sistema de evidência inteiro**: hachura, selo vazado, célula de medidor, seta de select. Não há plano. É a lacuna de acessibilidade mais grave depois do contraste, e a única que não tem contorno barato.

---

## 8. VERIFICAÇÃO

O corpus prova que verificação manual falha: ~40 valores divergentes a mão entre dois documentos irmãos, seis regras mortas, dois hex fora da paleta, um snippet quebrado na própria SPEC (guardrail com `position: absolute` sobre um trilho sem `position: relative`), e o comentário com os números de validação da paleta **perdido entre uma cópia e outra**. Tudo isso é detectável por máquina.

### 8.1 Lint estático — regras executáveis

```
# CROMA
R01  hex fora do :root                    → falha, salvo allowlist comentada com motivo
R02  token cromático em `background` de superfície de UI (não-marca)  → falha
R03  rgba()/color-mix() com componente cromático em `background`      → falha
R04  `opacity` em regra de estado (:disabled, [aria-*], .is-*)        → falha
R05  token de fio (--rule, --rule-2, --dim) em `color` de texto       → falha
R06  contraste de texto < 4,5:1 contra o fundo computado              → falha
R07  contraste de fronteira de elemento interativo < 3:1              → falha
R08  marca de dado com contraste < 3:1 sem valor em texto adjacente   → falha  (E16)

# FORMA
R09  box-shadow não-inset, ou inset com raio de desfoque > 0        → falha
     (inset com desfoque 0 é FIO: contorno, marcador lateral, fio de sticky)
R10  border-radius > 3px (exceto 50% em allowlist nomeada)            → falha
R11  grid-template-columns contendo " 1fr" sem minmax(0,…)            → falha
R12  filho direto de grid sem min-width: 0                            → falha
R13  overflow declarado fora da allowlist justificada                 → falha

# MOVIMENTO
R14  @keyframes                                                       → falha
R15  transition cuja propriedade não seja `opacity`                   → falha
R16  transition sem o bloco prefers-reduced-motion presente           → falha

# TIPOGRAFIA
R17  font-weight numérico em elemento de família variável             → falha (use font-variation-settings)
R18  elemento que exibe número sem tabular-nums                       → falha
R19  max-width de texto em px ou %                                    → falha
R20  text-transform: uppercase em família sans                        → falha
R21  codepoint de emoji ou U+FE0F em qualquer lugar                   → falha

# ESTADO E ESTRUTURA
R22  seletor :active ou :visited                                      → falha
R23  z-index literal fora do :root                                    → falha
R24  classe .active/.selected sem atributo ARIA correspondente        → aviso
R25  [id] sem scroll-margin-top quando há barra sticky                → falha
R26  classe nova ausente da lista utilitária de mono                  → aviso
R27  classe nova ausente do bloco @media print                        → falha
R28  seletor declarado com zero ocorrências no markup                 → aviso (CSS morto)

# ESCASSEZ  (E17)
R29  > 1 marcador de 2px na tinta primária por região visível          → falha
R30  > 1 ação em inversão por faixa de ação                            → falha
R31  > 1 círculo de estado por tela                                    → falha
```

### 8.2 Portão de paleta — re-executável, resultado gravado no arquivo

Nenhum slot cromático entra sem passar. O script roda no CI, recalcula, e **reescreve o comentário de validação junto do `:root`** — foi exatamente esse comentário que se perdeu entre os dois relatórios do corpus.

```js
// contraste WCAG — usado no lint (R06/R07/R08) e no portão
const lum = (h) => {
  const v = [0, 2, 4]
    .map((i) => parseInt(h.slice(1).substr(i, 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// portão: além do contraste, exige OKLCH (L, C) e ΔE OKLab sob protan/deutan.
// Registre L, C e H de cada slot ao lado do hex — sem isso ninguém re-deriva
// um slot novo, apenas testa um candidato às cegas.
```

**Linha de base medida (fixe como snapshot e falhe em qualquer regressão):**

```
--ink      21,00   --ink-2   8,33   --ink-3  4,76 [emendado; era 3,88 e reprovava]
--rule-2    1,55   --dim     1,46   --rule   1,22   --surface-2  1,10
c1 21,00 · c2 5,75 · c3 5,88 · c4 6,24 · c5 5,49        (todos vs #000000)
ΔE daltonismo 9,5 · ΔE visão normal 16,1
```

### 8.3 Matriz de renderização — o passo que o cálculo não substitui

A própria SPEC manda "renderizar e olhar" e não entrega artefato para isso. Regressão visual obrigatória em **seis** condições, não uma:

| Condição                 | O que quebra especificamente                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| 390 px                   | Estouro horizontal (R11/R12); alvo de toque; tabela; densidade                                     |
| 768 px                   | Faixa mais frágil: trilho já empilhado, colunas em transição, tabela ainda no `min-width`          |
| 1200 px                  | Composição alvo                                                                                    |
| `@media print`           | Componente não inscrito **some**; `box-shadow: inset` é descartado; camada interativa sobrevivendo |
| `forced-colors: active`  | O sistema de evidência inteiro desaparece (hachura, vazado, medidor, seta)                         |
| `prefers-reduced-motion` | Transições mortas; movimento sobrevivendo                                                          |

### 8.4 Provas de comportamento

| Prova                | Método                                   | Critério                                                                                                                                                                  |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Teclado completo** | Tab do primeiro ao último nó             | Skip-link é o primeiro focável; toda informação disponível por ponteiro é alcançável por foco; nenhum `tabindex` positivo; contorno nunca recortado por contêiner rolável |
| **Sem hover**        | Emulação de toque                        | Nenhuma informação exclusiva do hover; alvos ≥ 44px; ações de linha visíveis                                                                                              |
| **Monocromático**    | Filtro de saturação zero                 | Todo estado permanece distinguível (é a prova de que grau é textura e polaridade é fio)                                                                                   |
| **Daltonismo**       | Simulação protan/deutan                  | Nenhum par de séries colapsa; ΔE ≥ 8 confirmado                                                                                                                           |
| **Sem JS**           | `javascript: disabled`                   | Todo gráfico e todo valor continuam existindo (é o que E11 compra)                                                                                                        |
| **Sem rede**         | Bloqueio de fontes externas              | O documento continua legível; sem reflow que quebre as medidas em `ch` (exige `size-adjust`/`ascent-override` na fallback)                                                |
| **Anúncio**          | Leitor de tela sobre uma tabela filtrada | Contagem viva anunciada uma vez; nenhuma região viva aninhada; nenhum anúncio por segundo                                                                                 |

### 8.5 Governança — o que impede a divergência de voltar

O corpus é distribuído por **cópia**: ~500 linhas duplicadas com ~40 divergências a mão (título 76 vs 72px, medida de lede 62 vs 64ch, trilho 92 vs 108px, coluna de valor 78 vs 92px). Em 50 telas isso deixa de ser afinação e vira caos. As variantes mostram o estágio seguinte — template congelado byte a byte — e o custo dele: nenhum dispositivo-assinatura por peça.

**Declare os três tiers de estabilidade** (o corpus os descobriu empiricamente e nunca os formalizou; foi a ausência dessa declaração que produziu as divergências):

| Tier           | Política                                                  | Exemplos                                                |
| -------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| **Display**    | Reafinado por documento, dentro de um intervalo declarado | Título, KPI, número-tese, medidas em `ch`               |
| **Estrutura**  | Congelado. Muda por versão do sistema, nunca por peça     | Corpo, título de seção e de bloco, ritmo vertical, grid |
| **Componente** | Congelado                                                 | Valor de barra, par chave-valor, célula, selo, medidor  |

**Separe PARÂMETRO de CONSTANTE.** Parâmetro: largura de trilho, medidas em `ch`, tier display, `min-width` de tabela. Constante: rampa de nove degraus, gramática de fio, escala de raio, três tintas, teto de cinco slots, portão de validação.

**Contrato de token em arquivo único, importado — nunca copiado.** É a condição para que R01–R08 sejam verdade em vez de intenção.

---

**Arquivos-fonte:**
`C:\__dev_ops__\@console\ESTILO-OLED-DARK.md`
`C:\__dev_ops__\@console\consultorio\relatorio_mercado_plataforma_medica_2026.html`
`C:\__dev_ops__\@console\consultorio\relatorio_starthings_health_mvp_2026.html`
`C:\__dev_ops__\@console\transcript\transcricao\transcricao.html` (sistema rival, usado como controle experimental)
`C:\__dev_ops__\@console\transcript\alteracoes\alteracoes.html` (idem)

---

## 9. PONTO DE PARTIDA

Ordem de execução para um produto novo. **Cor por último** — quase toda tela ruim escolhe cor primeiro.

1. **Declare a tarefa.** Uma frase: quem consulta isto, e para decidir o quê. Se a resposta é "ler por vinte minutos", pare: veja §7, o sistema é o errado.
2. **Ache a distinção intelectual real do produto.** No relatório era grau de prova (fato/proxy/modelo). No seu, pode ser origem do dado, frescor, confiança do modelo, ambiente. **Vira o selo.** Não invente um enfeite — encontre o que já é verdade no conteúdo. Sem esse passo você tem um tema escuro, não este sistema.
3. **Importe `oled-base.css`.** Não copie. Renomeie o vocabulário do selo para o do seu domínio; a textura não muda.
4. **Monte tudo em branco sobre preto**, sem uma cor. Se a tela já funciona assim, ela está certa.
5. **Só então admita cor**, e só onde a regra E6 permitir: ≥2 identidades simultâneas, ou polaridade negativa. Um CRUD inteiro costuma terminar sem nenhuma cor além do risco — isso é o sistema funcionando, não faltando.
6. **Rode o portão** (§8.2) em qualquer slot novo, e grave L/C/H junto do hex.
7. **Rode a matriz** (§8.3): 390 / 768 / 1200 / print / `forced-colors` / `reduced-motion`. Seis condições, não uma.
8. **Tire um acessório.** Sempre sobra um.

### Se você só levar cinco coisas

Um porte mínimo — TUI, slide, nativo, papel — que preserve estas cinco continua sendo este sistema. Um que preserve as outras doze e perca estas cinco não é.

|     | Levar                                                | Porque                                                                                                         |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | **Todo número mono e tabular**                       | A única lei que sobreviveu à troca de gênero, família, unidade, paleta e modo de cor no grupo de controle.     |
| 2   | **Rótulo mono, caixa alta, tracking largo**          | É o que faz o conjunto ler como instrumento em vez de post de blog.                                            |
| 3   | **Estrutura por fio, ênfase por marcador racionado** | Substitui elevação inteira sem gastar um slot de cor.                                                          |
| 4   | **Regra de admissão de cor**                         | Sem ela, a paleta vira decoração em duas semanas — e foi assim que um `#d8a800` sem token entrou num semáforo. |
| 5   | **Grau de prova como textura recorrente**            | O elemento-assinatura. É o que separa um instrumento honesto de um deck que finge precisão.                    |

### Onde este documento pode estar errado

- A rampa neutra e a paleta foram **medidas** (contraste WCAG e OKLCH recalculados sobre os arquivos-fonte). Os ΔE de daltonismo `9,5` e de visão normal `16,1` são **herdados da SPEC, não recalculados aqui** — reproduza-os antes de tratá-los como linha de base.
- Toda a §5 (tradução para aplicação) é **derivada, não observada**: nenhuma aplicação interativa foi construída neste sistema ainda. As leis de onde ela deriva são observadas; as primitivas são a melhor dedução delas. A primeira tela real vai corrigir alguma coisa aqui — quando corrigir, edite esta base, não a tela.
- O lint da §8.1 está **especificado, não implementado**.

---

## 10. ANEXO — a folha completa

A implementação das §3 a §6, em CSS copiável. É idêntica a `oled-base.css` e à folha
que governa `oled-base-referencia.html` — não é uma versão reduzida.

Cole **uma vez**, num arquivo só, e importe daí em diante. O corpus original é
distribuído por cópia, e foi assim que cerca de 40 valores divergiram a mão entre dois
documentos irmãos. Importar em vez de copiar é a condição para que as regras de lint da
§8.1 sejam verdade em vez de intenção.

```css
/* ============================================================================
   oled-base.css — camada portátil do sistema OLED Dark
   Regra escrita: OLED-BASE-CONCEITO.md   ·   Gênero relatório: ESTILO-OLED-DARK.md

   Importe. Nunca copie. O corpus original é distribuído por cópia e acumulou
   ~40 divergências a mão entre dois documentos irmãos — foi assim que um
   #d8a800 sem token entrou num semáforo verde/âmbar/vermelho.

   Fontes (no <head>, antes desta folha):
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
   <meta name="color-scheme" content="dark">
   ========================================================================== */

@layer tokens, base, type, primitives, app, floor;

/* ==========================================================================
   1. TOKENS — o contrato. Nada de cor fora daqui.
   ========================================================================== */
@layer tokens {
  :root {
    color-scheme: dark;

    /* --- rampa neutra: nove degraus, acromáticos (C=0), monotônicos em L -----
     token         hex       L(oklch)  vs #000   papel
     ---------------------------------------------------------------------- */
    --void: #000000; /*  0.000    1.00   fundo da página. Nunca "quase preto". */
    --surface: #080808; /*  0.134    1.05   plano de painel; hover de linha.      */
    --surface-2: #101010; /*  0.173    1.10   CALHA: trilho de barra, campo.        */
    --rule: #1b1b1b; /*  0.222    1.22   fio interno: divisória, borda.        */
    --dim: #2a2a2a; /*  0.285    1.46   massa não destacada, grade de fundo.  */
    --rule-2: #2e2e2e; /*  0.301    1.55   fio estrutural: abertura de bloco.    */
    --ink-3: #787878; /*  0.573    4.76   terciária: rótulo, nota, metadado.    */
    --ink-2: #a3a3a3; /*  0.716    8.33   secundária: corpo, célula.            */
    --ink: #ffffff; /*  1.000   21.00   primária: dado, título, marcador.     */

    /* [EMENDA] --ink-3 era #6a6a6a = 3,88:1 sobre #000 e 3,70:1 sobre --surface.
     Reprova WCAG AA (4,5:1) e não qualifica como texto grande — o corpus usa
     esse token a 10 / 10,5 / 11 / 11,5 / 12px. É toda a camada de NOMEAÇÃO da
     interface: cabeçalho de tabela, selo, eyebrow, rótulo, nota, navegação,
     rodapé. #787878 dá 4,76:1 e já existia no corpus (stroke do favicon).
     Limite: contra --surface-2 dá 4,31:1 — logo texto dentro de calha
     (placeholder, valor de campo) tem piso --ink-2, nunca --ink-3.          */
    --hollow: #6a6a6a; /*  3,88:1 — SÓ papel não-textual: contorno de selo
                            vazado, glifo desabilitado, marca de escala.
                            Piso aplicável aqui é 3:1, e ele passa.          */

    /* --- paleta categórica: cinco slots, ordem fixa, nunca ciclar ------------
     Portão re-derivado: L em 0,48–0,67 · C >= 0,10 · dE protan/deutan >= 8
     (9,5) · dE visão normal >= 15 (16,1) · WCAG >= 3:1.
     Registre L/C/H junto do hex: sem isso ninguém RE-DERIVA um slot novo,
     apenas testa um candidato às cegas.
     slot  hex       L       C       H      vs #000
     ---------------------------------------------------------------------- */
    --c1: #ffffff; /* 1.000  0.000    89.9   21.00  série 1, sempre dominante   */
    --c2: #f5451b; /* 0.644  0.218    33.9    5.75  série 2 E tinta de risco    */
    --c3: #0091c8; /* 0.619  0.130   234.4    5.88                              */
    --c4: #00a06b; /* 0.623  0.139   161.0    6.24                              */
    --c5: #9463ff; /* 0.631  0.221   293.5    5.49                              */

    /* c2..c5 são ISOLUMINANTES (dL 0,025). Distinguem-se por matiz e croma, não
     por claridade — é exatamente por isso que o portão de dE é obrigatório e
     "olhar" não substitui o cálculo.
     --c1 é EXCEÇÃO DECLARADA: L=1,0 e C=0 estouram a faixa e o piso de croma
     por definição. Aceita porque é o slot de maior contraste possível e é o
     princípio do sistema. Todos os outros slots têm de passar.
     A ordem ESCRITA é c1→c5. A ordem OPERANTE é c1→c3→c4→c5: --c2 fica sacado
     da fila porque é a tinta de risco, e pintá-lo numa categoria neutra emite
     alarme falso. A paleta efetivamente neutra tem QUATRO slots, não cinco.  */

    --c2-rgb: 245 69 27; /* --c2 decomposto. Não é cor nova: é o que impede a
                            tinta de risco de ser reescrita em decimal em cada
                            call site (fio de botão destrutivo, campo inválido,
                            painel de falha, borda de diálogo, riscadura).    */

    /* --- aplicação semântica: Sunset Calm, nunca slots de série -------------
     Tokens de aplicação carregam papel; --c1..--c5 permanecem dados.        */
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

    /* --- planos e camada ---------------------------------------------------- */
    --veil: rgb(0 0 0 / 0.72); /* Sob .72 a tinta primária cai para #474747 —
                                entre --dim e --ink-3. O véu não escurece:
                                SUBTRAI TINTA. É o único mecanismo disponível
                                sobre luminância zero. Um por vez, jamais dois. */

    /* --- métrica ------------------------------------------------------------ */
    --max: 1180px; /* container único                          */
    --rail: 92px; /* PARÂMETRO: trilho de marcação            */
    --rail-nav: 236px; /* PARÂMETRO: trilho de navegação           */
    --gut: 30px; /* gutter do grid de seção                  */
    --bar-h: 58px; /* altura da barra fixa                     */
    --stick: calc(var(--bar-h) + 28px); /* âncora e sticky. Declara a relação
                                          que no corpus era 86 fixado a mão.   */
    --ctl-h: 40px; /* altura canônica de controle: 11+11 de
                                      padding + line-box + 2px de fio          */
    --tap: 44px; /* piso de alvo em pointer: coarse          */

    /* --- z: escala fechada, por urgência. Nada acima de 95. ------------------ */
    --z-bar: 50;
    --z-progress: 60;
    --z-menu: 70;
    --z-layer: 80;
    --z-toast: 88;
    --z-tip: 90;
    --z-veil: 94;
    --z-dialog: 95;
    /* O véu fica ACIMA do tooltip (94 > 90): o tooltip é fixed com
     pointer-events:none e, mais baixo, pintaria por cima do diálogo. */

    /* --- famílias ----------------------------------------------------------- */
    --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --sans: "Archivo", ui-sans-serif, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;

    /* Movimento: um literal, um call site, um kill-switch. Um token que governa
     uma ocorrência não governa nada — por isso não há --dur. Permitido só se
     informa (a) que algo apareceu ou (b) que um valor mudou.                  */
  }

  /* Tokens explicitamente RECUSADOS — se algum aparecer, alguém saiu do sistema:
   --ok / --success (verde) .... confirmação não é identidade nem polaridade.
                                 Concluído = selo SÓLIDO na tinta primária.
   --warn (âmbar) .............. "atenção" é subida na rampa; "parcial" é hachura.
   --shadow .................... elevação não existe sobre zero.
   --radius-lg ................. o teto é 3px.                                */
}

/* ==========================================================================
   2. BASE
   ========================================================================== */
@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  * {
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  body {
    background: var(--void);
    color: var(--ink-2);
    font: 400 15.5px/1.62 var(--sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* O dado entra como CANAL DECLARADO no markup (--w, --p, --mark), nunca como
   estilo calculado. A folha continua dona de como o valor vira pixel, e cada
   valor fica auditável na fonte, sem JavaScript. */
  @property --w {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 0%;
  }
  @property --p {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 0%;
  }

  /* Âncora sob barra fixa. O corpus tem ZERO scroll-margin com barra de 58px e
   navegação por âncora: cada clique deposita o título embaixo da barra. */
  [id] {
    scroll-margin-top: var(--stick);
  }

  ::selection {
    background: var(--app-activity);
    color: var(--void);
  }

  /* Nenhum controle usa a fonte do sistema operacional. Obrigatório, não higiene. */
  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }
  button {
    background: none;
    border: 0;
    cursor: pointer;
  }

  img,
  svg,
  video {
    max-width: 100%;
    height: auto;
    display: block;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }
}

/* ==========================================================================
   3. TIPOGRAFIA — duas famílias, três papéis.
      O peso vem do EIXO VARIÁVEL, nunca de font-weight nativo.
   ========================================================================== */
@layer type {
  h1,
  h2,
  h3,
  h4 {
    font-weight: 400;
    font-family: var(--sans);
    color: var(--ink);
  }

  h1 {
    font-variation-settings:
      "wdth" 112,
      "wght" 680;
    font-size: clamp(38px, 6.1vw, 76px);
    line-height: 0.97;
    letter-spacing: -0.035em;
    max-width: 18ch;
  }
  h2 {
    font-variation-settings:
      "wdth" 106,
      "wght" 620;
    font-size: clamp(25px, 3.3vw, 39px);
    line-height: 1.07;
    letter-spacing: -0.028em;
    max-width: 26ch;
  }
  h3 {
    font-variation-settings:
      "wdth" 100,
      "wght" 620;
    font-size: 16px;
  }

  b,
  strong {
    font-variation-settings:
      "wdth" 100,
      "wght" 620;
    font-weight: 400;
    color: var(--ink);
  }

  p {
    max-width: 62ch;
  } /* medida em ch, jamais em px: o limite é caractere */

  /* --- RÓTULO: mono, caixa alta, tracking escalonado inversamente ao tamanho
       e ao grau de solenidade: abertura > etiqueta > coluna > nav > selo ---- */
  .kicker {
    font: 500 10.5px var(--mono);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .label {
    font: 500 10.5px var(--mono);
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .note {
    font: 400 11.5px/1.6 var(--mono);
    color: var(--ink-3);
    max-width: 68ch;
  }
  .lede {
    font-size: 17px;
    line-height: 1.55;
    color: var(--ink-2);
    max-width: 58ch;
  }

  /* --- DADO: todo número é mono e tabular. Sem exceção. ------------------- */
  .num,
  td.num,
  .u-num {
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
  }

  /* Número grande migra para a sans expandida — mas continua tabular. */
  .num--display {
    font-family: var(--sans);
    font-variation-settings:
      "wdth" 108,
      "wght" 640;
    font-variant-numeric: tabular-nums;
    font-size: clamp(30px, 4vw, 46px);
    line-height: 1;
    letter-spacing: -0.03em;
    color: var(--ink);
  }

  /* Quando o slot de número recebe uma FRASE, ele troca de família: a mono é
   reservada ao que é medida. A recíproca vale. */
  .num--prose {
    font-family: var(--sans);
    font-variant-numeric: normal;
  }

  /* Link: sublinhado por fio, nunca text-decoration nem azul — azul seria um
   sexto acento e colidiria com --c3. */
  a {
    color: inherit;
    text-decoration: none;
  }
  a.link {
    border-bottom: 1px solid var(--rule-2);
    color: var(--ink-2);
  }
  a.link:hover {
    border-bottom-color: var(--ink);
    color: var(--ink);
  }
}

/* ==========================================================================
   4. PRIMITIVAS — o vocabulário de forma. Um porte para outro meio (TUI,
      slide, papel, nativo) reimplementa estas doze coisas e nada mais.
   ========================================================================== */
@layer primitives {
  /* --- 1. PLANO: três níveis + um sub-nível. Fio, nunca elevação. ---------- */
  .shell {
    width: min(var(--max), 100% - 40px);
    margin-inline: auto;
  }

  .sec {
    padding-top: 96px;
  }
  .block {
    margin-top: 36px;
  }

  .bare {
    border-top: 1px solid var(--rule-2);
    padding-top: 18px;
  } /* NU     */
  .panel {
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 3px;
    padding: 24px;
  } /* PAINEL */
  .panel--mark {
    border-top: 2px solid var(--ink);
  } /* MARCADO */
  .panel--risk {
    border-top: 2px solid rgb(var(--c2-rgb) / 0.34);
  }
  .panel--risk > .panel-title {
    color: var(--c2);
  }
  .trough {
    background: var(--surface-2);
    border-radius: 2px;
  } /* CALHA  */

  /* Grid de seção com trilho. minmax(0,1fr) + min-width:0 — DUAS travas, não uma:
   `1fr` é `minmax(auto,1fr)` e o min-content de uma tabela estica a coluna. */
  .sec-grid {
    display: grid;
    grid-template-columns: var(--rail) minmax(0, 1fr);
    gap: 0 var(--gut);
  }
  .sec-grid > *,
  .cols > * {
    min-width: 0;
  }
  .cols {
    display: grid;
    gap: var(--gut);
    align-items: start;
  } /* start: sem
              isso o painel curto estica e sobra preto morto no fim */
  .cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  /* --- 2/3. FIO e MARCADOR ------------------------------------------------
   Dois pesos: 1px = divisória, 2px = marcador.
   Três tintas: --rule (interno) · --rule-2 (estrutural) ·
                --ink-3 (FRONTEIRA DE ELEMENTO INTERATIVO) [EMENDA].
   --rule-2 dá 1,55:1 e reprova o piso de 3:1 do WCAG 1.4.11 — e essa borda é
   com frequência o ÚNICO indicador de onde clicar. Interatividade tem piso
   legal que estrutura não tem.
   O marcador é RACIONADO: no máximo UM por região visível. */
  .rail {
    border-top: 2px solid var(--ink);
    padding-top: 4px;
    width: 34px;
    position: sticky;
    top: var(--stick);
    font: 500 12px var(--mono);
    letter-spacing: 0.1em;
    color: var(--ink-3);
  }

  /* --- 5/6. RÓTULO e DADO em par ------------------------------------------ */
  .kv-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 9px 0;
    border-bottom: 1px solid var(--rule);
  }
  .kv-row:last-child {
    border-bottom: 0;
  }
  .kv-row > :last-child {
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    color: var(--ink);
    text-align: right;
  }

  .panel-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  /* --- 7. MARCA: trilho quase invisível, preenchimento ancorado no zero ----
   Base reta e ancorada, ponta arredondada em 3px. O destaque se justifica por
   ENTIDADE, jamais por posição no ranking: se a cor seguisse o ranking,
   reordenar repintaria o gráfico e a cor deixaria de significar. */
  .bar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 92px;
    gap: 4px 12px;
    align-items: center;
    padding: 7px 0;
  }
  .bar-name {
    font-size: 13.5px;
    color: var(--ink-2);
  }
  .bar-val {
    font: 500 13px var(--mono);
    font-variant-numeric: tabular-nums;
    color: var(--ink);
    text-align: right;
  }
  .bar-track {
    grid-column: 1 / -1;
    position: relative;
    height: 10px;
    background: var(--surface-2);
    border-radius: 2px;
  }
  .bar-fill {
    height: 100%;
    width: var(--w);
    background: var(--ink);
    border-radius: 0 3px 3px 0;
  }
  .bar-fill--dim {
    background: var(--dim);
  }
  .bar-fill--risk {
    background: var(--c2);
  }

  /* Guardrail: prazo, meta, limiar. Tracejado branco vertical sobre o trilho.
   position:relative no trilho é obrigatório — sem ele o snippet não ancora. */
  .bar-track[data-mark]::after {
    content: "";
    position: absolute;
    top: -4px;
    bottom: -4px;
    left: var(--mark);
    width: 1px;
    background: repeating-linear-gradient(180deg, var(--ink) 0 3px, transparent 3px 6px);
  }

  /* Empilhada: o gap de 2px é o PRÓPRIO FUNDO fazendo de separador — resolve
   sozinho boa parte dos casos de daltonismo, sem gastar cor. */
  .stack {
    display: flex;
    gap: 2px;
    height: 50px;
  }
  .seg {
    border-radius: 2px;
  }

  /* --- 8. CÉLULA CONTÁVEL: vazio é contorno (custo zero de luz), aceso é
       preenchimento. Serve para nota discreta, régua de tempo, etapas,
       seleção, paginação. */
  .meter {
    display: flex;
    gap: 3px;
  }
  .meter i {
    flex: 1;
    height: 12px;
    border-radius: 1px;
    box-shadow: inset 0 0 0 1px var(--rule-2);
  }
  .meter i.on {
    background: var(--ink);
    box-shadow: none;
  }
  .meter i.mid {
    background: var(--dim);
    box-shadow: none;
  }
  .meter i.weak {
    background: var(--c2);
    box-shadow: none;
  }

  /* --- 10. LEGENDA: gramática de três partes, invariável.
       afirmação · definição do universo · afirmação.
       É também a forma canônica do ESTADO VAZIO. */
  .legend {
    display: grid;
    gap: 4px;
    margin-top: 12px;
    font: 400 11.5px/1.6 var(--mono);
    color: var(--ink-3);
  }
  .legend > b {
    color: var(--ink-2);
    font-variation-settings: normal;
  }

  /* --- 11. SELO DE EVIDÊNCIA — o elemento-assinatura.
       Grau de prova é TEXTURA ACROMÁTICA, não cor: sobrevive a preto-e-branco
       e a qualquer visão de cor, e devolve os cinco slots de cor aos dados.
       Declare a legenda UMA vez; repita o selo em cada bloco.
       A única variante colorida é polaridade — risco não é grau de prova. */
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
    flex: none;
  }

  .tag--fact i {
    background: var(--ink);
  } /* SÓLIDO   */
  .tag--proxy i {
    background: repeating-linear-gradient(45deg, var(--ink) 0 1.5px, transparent 1.5px 3px);
    box-shadow: inset 0 0 0 1px var(--rule-2);
  } /* HACHURA  */
  .tag--model i {
    box-shadow: inset 0 0 0 1px var(--hollow);
  } /* VAZADO   */
  .tag--risk {
    color: var(--c2);
  }
  .tag--risk i {
    background: var(--c2);
  } /* POLARIDADE */

  /* --- 12. INVERSÃO: tinta e fundo trocam de lugar. O realce MÁXIMO do sistema,
       disponível porque o fundo é o piso do gamut. Não é um estilo — é o teto
       da escada. Por isso é escasso como o marcador. */
  .invert {
    background: var(--ink);
    color: var(--void);
  }
}

/* ==========================================================================
   5. APLICAÇÃO — o que o relatório não tinha.
   ========================================================================== */
@layer app {
  /* --- 5.1 AÇÃO: hierarquia sem preenchimento colorido ---------------------
   O parente mais próximo no corpus é o chip. Uma primária por faixa de ação. */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--ctl-h);
    padding: 0 16px;
    border-radius: 2px;
    font: 500 11px var(--mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-2);
    background: none;
    border: 1px solid transparent;
  }
  .btn--primary {
    background: var(--app-ink);
    color: var(--void);
    border-color: var(--app-ink);
  }
  .btn--primary:hover {
    box-shadow: inset 0 0 0 1px var(--void);
  } /* anel interno:
    brightness() em branco puro é INERTE, e em tinta clipa canal e desloca matiz
    para fora do valor validado. O multiplicador é lei só sobre preenchimento de
    marca de dado, onde existe para preservar a identidade da série. */
  .btn--secondary {
    border-color: var(--ink-3);
  }
  .btn--secondary:hover {
    border-color: var(--app-activity);
    color: var(--app-activity);
  }
  .btn--tertiary:hover {
    color: var(--app-feedback);
  }
  .btn--danger {
    border-color: rgb(var(--app-risk-rgb) / 0.34);
    color: var(--app-risk);
  }
  .btn--danger:hover {
    border-color: var(--app-risk);
  }

  .btn:disabled,
  .btn[aria-disabled="true"] {
    cursor: not-allowed;
    background: none;
    color: var(--ink-3);
    border-color: var(--rule);
    /* Descer a RAMPA. Nunca opacity: sobre #000 alfa dilui para o nada — some,
     não recua. Nunca pointer-events:none em <button>: mata cursor e title. */
  }

  /* Ocupado sem spinner: o que se move é o NÚMERO, não a forma. Reescrever
   textContent não é transição, então sobrevive intacto a reduced-motion. */
  .btn[aria-busy="true"] {
    position: relative;
  }
  .btn[aria-busy="true"]::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    height: 1px;
    width: var(--p, 100%);
    background: var(--app-pending);
  }

  /* --- 5.2 ENTRADA: o campo é uma CALHA, não um cartão --------------------- */
  .field {
    display: grid;
    gap: 6px;
  }
  .field > label {
    font: 500 10.5px var(--mono);
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  /* Rótulo sempre visível ACIMA do campo. Zero floating label: exigiria
   transição, e a transição não existe. O placeholder é exemplo de FORMATO,
   nunca o nome do campo. */

  .input,
  input[type="text"],
  input[type="email"],
  input[type="number"],
  input[type="search"],
  input[type="password"],
  textarea,
  select {
    width: 100%;
    min-height: var(--ctl-h);
    padding: 11px 12px;
    background: var(--surface-2);
    color: var(--app-ink);
    border: 1px solid var(--ink-3);
    border-radius: 3px;
    font-variant-numeric: tabular-nums;
  }
  textarea {
    min-height: 96px;
    resize: vertical;
  }
  select {
    appearance: none;
    padding-right: 34px;
    /* seta: gradiente-TEXTURA, não decoração. É o gradiente permitido. */
    background-image:
      linear-gradient(45deg, transparent 50%, var(--ink-3) 50%),
      linear-gradient(135deg, var(--ink-3) 50%, transparent 50%);
    background-size:
      5px 5px,
      5px 5px;
    background-position:
      calc(100% - 18px) 52%,
      calc(100% - 13px) 52%;
    background-repeat: no-repeat;
  }
  select option {
    background: var(--surface-2);
    color: var(--ink);
  }

  ::placeholder {
    color: var(--ink-2);
    opacity: 1;
  }
  /* Piso --ink-2 dentro de calha: --ink-3 sobre --surface-2 dá 4,31:1. */

  /* Validação não é semáforo. Dispare em :user-invalid, NUNCA em :invalid —
   :invalid casa com todo campo obrigatório vazio na carga e o formulário
   nasce vermelho, que é o semáforo na forma mais agressiva.
   Cor só no fio de 1px, na tinta da mensagem e no selo de 8px. Nunca fundo
   tingido: tint sobre #000 gera marrom/roxo sujo e cria um quarto plano.
   UMA polaridade por bloco. */
  .input:user-invalid,
  [aria-invalid="true"] {
    border-color: var(--app-risk);
  }
  .field-msg {
    font: 400 11.5px var(--mono);
    color: var(--ink-3);
  }
  .field-msg--error {
    color: var(--app-risk);
  }

  /* Obrigatório é marca TIPOGRÁFICA em tinta primária, declarada uma vez na
   legenda do formulário. Nunca vermelho: campo obrigatório vazio não é erro. */
  .req::after {
    content: " *";
    color: var(--ink);
  }

  /* Toggle: comutador SEGMENTADO. Pílula deslizante exigiria raio > 3px e
   transição de transform — ambos proibidos. Legível em preto-e-branco. */
  .switch {
    display: inline-flex;
    border: 1px solid var(--ink-3);
    border-radius: 2px;
    overflow: hidden;
  }
  .switch > button {
    padding: 0 12px;
    min-height: var(--ctl-h);
    font: 500 10.5px var(--mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .switch > button[aria-pressed="true"] {
    background: var(--app-activity);
    color: var(--void);
  }

  /* --- 5.3 NAVEGAÇÃO: o item ativo não ganha fundo, pílula, nem acento.
       Promove o fio de 1px para 2px na tinta primária e sobe a tinta.
       É .panel--mark girado para o eixo da lista.
       aria-current é a FONTE DE VERDADE, consumida direto pelo CSS: o estado
       tem de sobreviver à impressão e ao leitor de tela. Nunca uma classe
       .active paralela. */
  .bar-top {
    position: sticky;
    top: 0;
    z-index: var(--z-bar);
    min-height: var(--bar-h);
    display: flex;
    align-items: center;
    background: var(--veil);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--rule);
  }
  /* Sem "elevate on scroll" — é a assinatura do AppBar do Material com o fio no
   lugar da sombra. O fio é permanente; o blur já diz que há conteúdo abaixo. */

  .nav {
    display: flex;
    gap: 22px;
  }
  .nav a {
    padding: 6px 0;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font: 500 10.5px var(--mono);
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .nav a:hover {
    color: var(--ink-2);
  } /* hover resolve SÓ na rampa de tinta */
  .nav a[aria-current] {
    color: var(--app-activity);
    border-bottom-color: var(--app-activity);
  }

  .nav--vert a {
    border-bottom: 0;
    border-left: 2px solid var(--rule-2);
    padding: 6px 0 6px 12px;
  }
  .nav--vert a[aria-current] {
    border-left-color: var(--app-activity);
  }
  /* Repouso com 2px na tinta ESTRUTURAL reserva o espaço: zero reflow ao ativar. */

  .crumbs {
    font: 400 11.5px var(--mono);
    color: var(--ink-3);
  }
  .crumbs > * + *::before {
    content: " / ";
  }
  .crumbs [aria-current] {
    color: var(--ink);
  }
  /* Barra, não chevron: o corpus já escreve hierarquia com barra. O ponto médio
   fica reservado a metadado paralelo. O nível corrente nunca trunca.
   O separador HERDA --ink-3: token de fio como tinta de texto dá 1,55:1 e o
   glifo sumiria em vez de recuar (R05). A hierarquia sai da promoção do nível
   corrente para a tinta primária, não do rebaixamento do separador. */

  /* Skip-link obrigatório, primeiro nó focável. transform, nunca display:none —
   display:none o tiraria da ordem de foco. */
  .skip {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: var(--z-veil);
    padding: 10px 14px;
    border-radius: 2px;
    background: var(--ink);
    color: var(--void);
    font: 500 11px var(--mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    transform: translateY(-200%);
  }
  .skip:focus {
    transform: none;
  }

  /* --- 5.4 DADO DENSO: a tabela é o ESTADO NATURAL do sistema ------------- */
  .table-wrap {
    overflow-x: auto;
    border-top: 1px solid var(--rule-2);
  }
  .table-wrap table {
    min-width: 560px;
  } /* rebaixe por tabela, inline */

  th {
    font: 500 10px var(--mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
    text-align: left;
    white-space: nowrap;
    padding: 10px 12px;
    border-bottom: 1px solid var(--rule);
  }
  td {
    padding: 10px 12px;
    font-size: 13.5px;
    color: var(--ink-2);
    border-bottom: 1px solid var(--rule);
  }
  /* Zebra é PROIBIDA: cria um quarto plano fora da rampa e compete com o hover,
   que já ocupa o degrau --surface. Separação é o fio de 1px em border-bottom,
   e apenas ele — sem border-left/right, que nivelaria tudo em grade de planilha. */
  td.num,
  th.num {
    text-align: right;
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
    color: var(--ink);
  }
  td:empty::after {
    content: "—";
    color: var(--ink-3);
    font-family: var(--mono);
  } /* ausência é travessão, nunca
                    célula em branco — e mono, para não quebrar a coluna */

  tbody tr:hover td {
    background: var(--surface);
  }
  tr[aria-selected="true"] td:first-child {
    box-shadow: inset 2px 0 0 var(--app-activity);
  }
  /* Colisão desfeita: hover fica com o degrau de superfície; seleção usa o
   marcador lateral de 2px. Se ambos pintassem --surface, seriam indistinguíveis. */
  tr.is-total td {
    border-top: 1px solid var(--rule-2);
    color: var(--ink);
    border-bottom: 0;
  }

  thead.is-stuck th {
    position: sticky;
    top: var(--bar-h);
    background: var(--void);
    box-shadow: inset 0 -1px 0 var(--rule);
  }
  /* Fundo é o próprio --void, não uma superfície nova. O fio vira inset porque
   border-collapse descarta borda em elemento sticky. Sem sombra. */

  th[aria-sort] button::after {
    content: " ↑";
    color: var(--ink-3);
    font-family: var(--mono);
  }
  th[aria-sort="descending"] button::after {
    content: " ↓";
  }
  th[aria-sort]:not([aria-sort="none"]) {
    color: var(--ink);
    box-shadow: inset 0 -2px 0 var(--ink);
  }

  /* Ações de linha SEMPRE visíveis em tinta terciária. Nunca opacity:0 até o
   hover: teclado não tem hover, e sobre #000 opacidade não é estado, é
   desaparecimento. */
  .row-act {
    color: var(--ink-3);
  }
  tr:hover .row-act,
  .row-act:hover {
    color: var(--ink);
  }

  /* --- 5.5 SOBREPOSIÇÃO: o véu não escurece, APAGA --------------------------
   Sobre preto não há o que escurecer; o que a página tem a perder é tinta.
   Zero sombra. A folha NÃO clareia para parecer elevada: fica na mesma
   superfície de painel do corpo. Quem separa é o véu por baixo e o fio.  */
  .veil {
    position: fixed;
    inset: 0;
    z-index: var(--z-veil);
    background: var(--veil);
  }
  /* Um véu por vez. Dois somam alfa e a página vai a preto absoluto, apagando
   o contexto que o véu existe para preservar. Modal sobre modal é proibido:
   a segunda pergunta substitui a primeira ou vira etapa. */

  .dialog {
    position: fixed;
    inset: 0;
    margin: auto; /* NUNCA transform para centralizar:
     transform cria bloco de contenção e todo position:fixed descendente —
     menu, popover — sai errado. */
    z-index: var(--z-dialog);
    width: min(560px, 100% - 40px);
    height: max-content;
    max-height: 84vh;
    overflow: auto;
    overscroll-behavior: contain;
    background: var(--surface);
    border: 1px solid var(--rule);
    border-top: 2px solid var(--ink); /* aresta de ENTRADA carrega o marcador */
    border-radius: 3px;
    padding: 24px;
  }
  .drawer {
    position: fixed;
    inset: 0 0 0 auto;
    margin: 0;
    height: 100%;
    width: min(420px, 100%);
    border-radius: 0;
    border: 0;
    border-left: 2px solid var(--ink);
  }
  /* Perímetro completo só onde há plano vizinho a separar: nas bordas coladas à
   viewport um fio de 1px não separa nada. A gaveta é o bloco marcado em escala
   de tela — marcação lateral, não caixa flutuante.
   Use <dialog> e o atributo inert no conteúdo por baixo: travar o foco por JS e
   apagar visualmente não basta — sem inert, o rotor do leitor de tela atravessa
   o documento inteiro por trás do véu. */

  .menu {
    position: absolute;
    z-index: var(--z-menu);
    min-width: 180px;
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 3px;
    padding: 4px;
  }
  .menu button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 9px 12px;
    border-radius: 2px;
    font-size: 13.5px;
    color: var(--ink-2);
  }
  .menu button:hover {
    color: var(--ink);
    background: var(--surface-2);
  }
  /* Sem bico e sem seta no popover: o que conecta dois blocos neste sistema é o
   alinhamento de borda, não um conector desenhado. */

  .tip {
    position: fixed;
    z-index: var(--z-tip);
    pointer-events: none;
    padding: 6px 9px;
    border-radius: 3px;
    background: var(--ink);
    color: var(--void); /* inversão */
    font: 500 11px var(--mono);
    font-variant-numeric: tabular-nums;
    opacity: 0;
    transition: opacity 0.1s linear;
  }
  .tip.on {
    opacity: 1;
  }
  /* O tooltip precisa de TECLADO. Em grade densa com célula truncada, o tooltip
   É o dado: delegue focusin/focusout além de pointerover/pointermove, e dê
   tabindex="0" ao alvo. E suprima o tooltip enquanto houver véu — ele é fixed
   e pintaria por cima do diálogo. */

  /* --- 5.6 RETORNO, STATUS E VAZIO ---------------------------------------
   Aplicação usa tokens semânticos, mas nunca depende só de cor: o rótulo,
   ícone/forma e contagem permanecem obrigatórios em cada estado. */
  .status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font: 500 10px var(--mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .status::before {
    content: "";
    width: 8px;
    height: 8px;
    flex: none;
  }
  .status--done {
    color: var(--app-activity);
  }
  .status--done::before {
    background: var(--app-activity);
  }
  .status--pending,
  .status--running {
    color: var(--app-pending);
  }
  .status--pending::before,
  .status--running::before {
    border: 1px dashed var(--app-pending);
  }
  .status--idle::before {
    box-shadow: inset 0 0 0 1px var(--hollow);
  }
  .status--fail {
    color: var(--app-risk);
  }
  .status--fail::before {
    background: var(--app-risk);
  }

  /* O ÚNICO círculo do sistema, UMA instância por tela: a semântica é
   literalmente "ligado". */
  .led {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--app-activity);
  }
  .led--down {
    background: var(--app-risk);
  }
  .led--wait {
    background: none;
    box-shadow: inset 0 0 0 1px var(--hollow);
  }

  /* Alerta inline: marcação lateral. Três níveis. Prosa permanece na tinta de
   leitura — o fundo NUNCA colore. */
  .alert {
    border-left: 1px solid var(--rule-2);
    padding-left: 14px;
  }
  .alert--read {
    border-left-width: 2px;
    border-left-color: var(--app-feedback);
  }
  .alert--risk {
    border-left-width: 2px;
    border-left-color: var(--app-risk);
  }

  .toast {
    position: fixed;
    z-index: var(--z-toast);
    right: 20px;
    bottom: 20px;
    max-width: 380px;
    padding: 12px 16px;
    border-radius: 3px;
    background: var(--ink);
    color: var(--void);
    border-left: 2px solid var(--void);
  }
  .toast--risk {
    border-left-color: var(--app-risk);
  }
  .comment,
  .review,
  .author {
    color: var(--app-feedback);
  }
  .queue,
  .pending,
  .attention {
    color: var(--app-pending);
  }
  /* O aviso NUNCA é o único canal: o erro passa a existir permanentemente no
   bloco afetado, com código e horário em mono tabular.
   Regiões vivas são IRMÃS e planas (uma polite, uma assertive), nunca
   aninhadas — role="alert" dentro de role="status" anuncia duas vezes ou
   engole o anúncio. */

  /* Indeterminado: trilho CHEIO, preenchimento AUSENTE — a extensão existe,
   nada foi capturado. Mais o tempo decorrido em mono tabular. Sem spinner,
   sem shimmer, sem barra varrendo: "animação que não informa nada". */
  .busy {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .busy .bar-track {
    flex: 1;
  }
  .busy time {
    font: 500 12px var(--mono);
    font-variant-numeric: tabular-nums;
    color: var(--ink-3);
  }

  /* Esqueleto: o instrumento em estado ZERO. O rótulo NUNCA é esqueleto — já é
   conhecido antes da requisição. Sem retângulo cinza com shimmer. */
  .skeleton .num::after {
    content: "—";
    color: var(--ink-3);
  }

  /* Vazio: superfície nua + instrumento em zero + legenda de três partes + ação.
   Sem ilustração, sem mascote, sem "Nada por aqui ainda!".
   Um gráfico que só sabe desenhar sucesso mente por omissão. */
  .empty {
    border-top: 1px solid var(--rule-2);
    padding: 28px 0;
    display: grid;
    gap: 12px;
  }
}

/* ==========================================================================
   6. PISO DE QUALIDADE — não anuncie, só entregue.
   ========================================================================== */
@layer floor {
  /* Foco: uma única regra global. Zero :focus, :active, :visited. */
  :focus-visible {
    outline: 2px solid var(--app-activity);
    outline-offset: 3px;
    border-radius: 2px;
  }
  .table-wrap :focus-visible,
  .dialog :focus-visible {
    outline-offset: -2px;
  }
  /* Offset positivo é recortado por contêiner rolável. */

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *,
    *::before,
    *::after {
      transition: none !important;
      animation: none !important;
    }
  }
  /* É defesa contra o autor futuro, não contra o atual. */

  /* Piso de alvo de toque, sem inflar a caixa desenhada. */
  @media (pointer: coarse) {
    .btn,
    .nav a,
    .menu button,
    .row-act {
      position: relative;
    }
    .btn::before,
    .nav a::before,
    .menu button::before,
    .row-act::before {
      content: "";
      position: absolute;
      inset: 50% auto auto 50%;
      width: max(100%, var(--tap));
      height: max(100%, var(--tap));
      transform: translate(-50%, -50%);
    }
  }

  /* forced-colors (Alto Contraste do Windows) apaga box-shadow E
   background-image — ou seja, apagaria o sistema de evidência INTEIRO:
   hachura, vazado, célula de medidor, seta de select. É a lacuna de
   acessibilidade mais grave depois do contraste. Aqui ela é fechada
   transportando a textura para border-style, que sobrevive. */
  @media (forced-colors: active) {
    .tag i,
    .status::before,
    .meter i {
      forced-color-adjust: none;
      border: 1px solid CanvasText;
      background: Canvas;
      box-shadow: none;
    }
    .tag--fact i,
    .status--done::before,
    .meter i.on {
      background: CanvasText;
    }
    .tag--proxy i,
    .status--running::before,
    .meter i.mid {
      border-style: dashed;
    }
    .tag--model i,
    .status--idle::before {
      border-style: dotted;
    }
    .panel,
    .dialog,
    .menu {
      border: 1px solid CanvasText;
    }
    .nav a[aria-current] {
      border-bottom: 2px solid Highlight;
    }
    select {
      background-image: none;
    }
  }

  /* @media print inverte OS TOKENS NEUTROS E APENAS ELES. Os slots categóricos
   não são redefinidos: foram validados contra fundo escuro e carregam
   identidade. Componente cuja marca é box-shadow:inset recebe hex literal —
   muitos motores de impressão descartam inset. */
  @media print {
    :root {
      --void: #fff;
      --surface: #fff;
      --surface-2: #fff;
      --rule: #ddd;
      --rule-2: #999;
      --dim: #bbb;
      --ink: #000;
      --ink-2: #333;
      --ink-3: #666;
      --hollow: #666;
      /* Estados continuam compreensíveis por rótulo, forma e contagem; estas
       substituições impedem que os pastéis de tela virem tinta fraca no papel. */
      --app-ink: #000;
      --app-feedback: #333;
      --app-risk: #000;
      --app-pending: #333;
      --app-activity: #000;
      --veil: transparent;
    }
    body {
      background: #fff;
      color: #000;
      font-size: 11pt;
    }

    /* Toda camada interativa desaparece: papel não tem ponteiro nem rolagem, e
     um modal impresso mostra uma pergunta congelada fingindo ser conteúdo. */
    .bar-top,
    .tip,
    .veil,
    .dialog,
    .drawer,
    .menu,
    .toast,
    .skip {
      display: none !important;
    }

    .tag--model i,
    .status--idle::before,
    .meter i {
      box-shadow: none;
      border: 1px solid #666;
    }
    .bar-fill,
    .seg,
    .meter i.on,
    .tag--fact i {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .table-wrap {
      overflow: visible;
    }
    thead {
      display: table-header-group;
    }
    tr,
    .panel {
      break-inside: avoid;
    }
    p,
    li {
      orphans: 3;
      widows: 3;
    }
    a.link::after {
      content: " (" attr(href) ")";
      font: 400 9pt var(--mono);
      color: #666;
    }
  }

  /* Toda primitiva NOVA é inscrita em duas listas: a utilitária de mono (se
   numérica ou de rótulo) e o bloco @media print. Componente não inscrito
   desaparece no papel ou cai na sans. */
}

/* ==========================================================================
   7. RESPONSIVO
   ========================================================================== */
@media (max-width: 900px) {
  .sec-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .rail {
    position: static;
    width: auto;
    margin-bottom: 12px;
  }
  .cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .shell {
    width: min(var(--max), 100% - 28px);
  }
  .sec {
    padding-top: 68px;
  }
  .cols-2,
  .cols-3 {
    grid-template-columns: minmax(0, 1fr);
  }
  .panel {
    padding: 18px;
  }
  .stack {
    height: 38px;
  }
}
```
