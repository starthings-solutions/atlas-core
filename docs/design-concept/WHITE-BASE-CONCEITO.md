# Base conceito — White Mode

Versão clara do instrumento OLED Dark. O branco é o campo; o dado é a tinta.
Mantém o chassi de consulta: Archivo variável, IBM Plex Mono, números tabulares,
selos de evidência, separação por fio, raios até 3px e cor com papel declarado.

Referência visual: [white-base-referencia.html](white-base-referencia.html).
Folha portátil: [white-base.css](white-base.css), que importa [oled-base.css](oled-base.css).

## Uso

Distribua as duas folhas no mesmo diretório. Importe apenas a entrada clara:

```html
<meta name="color-scheme" content="light" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
/>
<link rel="stylesheet" href="./white-base.css" />
```

O tema é claro deliberadamente. Não usa filtro de inversão nem depende da
preferência de cor do sistema. As regras de componentes continuam na base comum;
as alterações de material e tinta ficam na camada de tema.

## Material

| Token         | Valor     | Papel                                    |
| ------------- | --------- | ---------------------------------------- |
| `--void`      | `#ffffff` | fundo branco                             |
| `--surface`   | `#f8f8f8` | painel e hover                           |
| `--surface-2` | `#f0f0f0` | calha, trilho e campo                    |
| `--rule`      | `#e4e4e4` | divisória interna                        |
| `--dim`       | `#c8c8c8` | massa neutra de fundo                    |
| `--rule-2`    | `#b8b8b8` | abertura estrutural                      |
| `--ink-3`     | `#626262` | rótulo e nota                            |
| `--ink-2`     | `#454545` | corpo e célula                           |
| `--ink`       | `#111111` | título, dado e marcador                  |
| `--hollow`    | `#767676` | contorno de evidência e marca secundária |

Superfícies escurecem a partir do branco. Fios estruturais organizam o conteúdo;
borda de controle usa tinta terciária. Nenhuma sombra, glow ou gradiente de decoração.

`--veil` é branco com alfa .88 para o cromo fixo. `--backdrop` é tinta quase preta
com alfa .32 para o véu de diálogo. São papéis diferentes: a barra preserva a luz,
o diálogo reduz a ênfase no contexto.

## Dados e estados

| Token            | Valor     | Contraste sobre branco | Papel                        |
| ---------------- | --------- | ---------------------- | ---------------------------- |
| `--c1`           | `#111111` | 18,88:1                | série dominante              |
| `--c2`           | `#b82d12` | 6,14:1                 | risco reservado              |
| `--c3`           | `#006f98` | 5,63:1                 | identidade categórica        |
| `--c4`           | `#00754f` | 5,74:1                 | identidade categórica        |
| `--c5`           | `#7040c8` | 6,45:1                 | identidade categórica        |
| `--app-ink`      | `#26221d` | 15,80:1                | texto primário e ação        |
| `--app-feedback` | `#9a4b16` | 6,19:1                 | revisão e autoria            |
| `--app-risk`     | `#b42318` | 6,57:1                 | falha, inválido e destrutivo |
| `--app-pending`  | `#7b5d08` | 6,16:1                 | pendente e atenção           |
| `--app-activity` | `#146e69` | 6,06:1                 | foco, seleção e concluído    |

Série única usa tinta quase preta. Ordem neutra: c1 → c3 → c4 → c5; c2 fica
reservado ao risco. Identidade segue a entidade ao reordenar dados.

Selos sólido, hachurado e vazado continuam comunicando fato, proxy e modelo.
Estados têm rótulo e forma além de cor. Os acentos foram recalibrados para branco;
os resultados de ΔE da paleta OLED não são evidência para esta nova paleta.

## Contraste e comportamento

Tintas de texto e acentos têm pelo menos 4,5:1 sobre página, painel e calha.
A tinta terciária tem 6,10:1 sobre branco e 5,35:1 sobre a calha. Marcas de dados
secundárias usam `--hollow` para manter 3:1, em vez do cinza de massa de fundo.

A referência calcula suas rampas e contrastes a partir dos tokens em uso. O
controle de tinta terciária permite comparar o valor aprovado com `#929292`,
que reprova: essa mudança é uma simulação local, não modifica a folha portátil.

Mantêm-se foco visível, alvo de toque, movimento reduzido, alto contraste e
impressão. Tabelas têm rolagem local em telas estreitas; títulos e painéis
reorganizam-se no fluxo. A barra mede sua altura para não cobrir âncoras ao quebrar linha.
