# Auditoria do motor Atlas Core × Lavish — 01/10/2026

Resultado: o núcleo de revisão está preservado, mas o motor não tem paridade
integral com o Lavish atual. O marcador `last-verified` registra a revisão do
upstream; não significa que todas as mudanças foram incorporadas.

Referências consultadas por `git fetch`:

- Lavish `main`: `a2a199cd2275ab4d5cea1b94d42e2479bda36321`, release 0.1.80.
- Atlas Core `origin/main` antes desta alteração: `480ff94c07ef6b2c168996347072aa7a10b59f56`.
- Base comum: `d62853166c21dde6f9e8a0ba19c8fe7f0d499545`.

## O que está preservado

Comparação textual após normalizar nomes de produto, prefixos de ambiente e
protocolo: 15 módulos JavaScript de `src/` são idênticos. Entre eles estão
`session-store`, `chat-messages`, `async-mutex`, `layout-warnings`, `html-app`,
`share-password`, `self-paint`, `table-cell`, `mermaid-node`, `mermaid-source`,
`tailscale`, `server-log`, `whiteboard-core`, `whiteboard-frame` e `whiteboard-store`.

Exportação e anexos têm ajustes de prefixo/distribuição. SDK e chrome também têm
mudanças de identidade visual. Os portes de ownership exclusivo de poll, recuperação
de carga do artefato após reinício e recibo do comando `reply` estão presentes.

## Lacunas confirmadas

| Área                                      | Lavish atual                                                                      | Atlas Core                                                                             | Evidência                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Erro HTTP após começar a escutar          | mantém handler de `error`, registra falha e continua acessível                    | remove o handler após `listening`; erro não tratado derruba o processo                 | teste upstream de erro pós-escuta passa no Lavish e falha no Atlas                         |
| Exceção não tratada no processo destacado | registra tipo/stack com timestamp e encerra deterministicamente                   | bootstrap só captura falha do import inicial                                           | teste upstream de exceção não tratada passa no Lavish e falha no Atlas                     |
| Recuperação de bind/rede                  | `pendingBinds`, retries no processo e avisos atualizados                          | reconciliador sinaliza `network_stale`; recuperação depende de nova CLI/reinício       | comparação de `src/server.js` e porte parcial `edc0607`                                    |
| Descoberta e instalação                   | varre interfaces, identifica `state_id`, preserva endereços e controla duplicados | consulta host configurado e loopback, sem identidade da instalação nem `--also-listen` | comparação de `src/cli.js`, `src/paths.js` e `src/local-address.js`                        |
| Presença no comando inicial               | `visibleSessions()` consulta o servidor descoberto                                | consulta só o host primário por `fetchHealth`, sem o limite de tempo da descoberta     | `src/cli.js`, função `visibleSessions`; em fallback, o listener pode aparecer como ausente |

As primeiras quatro diferenças correspondem a portes adiados ou parciais de
`2430a3f` e `edc0607`, já registrados em [lavish-sync.md](lavish-sync.md).
A consulta de presença ainda contém um comentário anterior à integração do novo
control channel; o comentário não representa o estado atual de `findRunningServer`.

## Diferenças de produto declaradas

A legenda de revisões do artefato (`b4e82c6`) não foi portada: faltam
`src/artifact-revisions.js` e sua integração com SDK/chrome. O playbook de cópia
independente de respostas (`f4ed5ff`) também foi pulado. Essas são diferenças de
interface/guidance registradas no log, além das lacunas de infraestrutura acima.
Release, CI e branding upstream têm distribuição própria e não exigem igualdade.

## Bloqueios corrigidos durante esta validação

O merge `e64b75f` já estava na `main`, mas a CLI não carregava: o texto de ajuda
do poll incluía crases sem escape dentro de um template literal. A correção
mantém a mensagem exibida e restaura a sintaxe.

O mesmo porte manteve `postPollAgentReply` sem uso após migrar para o poll
atômico, provocando erro de lint. O helper e seu comentário obsoleto foram removidos.

O teste existente de sessões encerradas falhou: `poll --agent-reply` ainda
gravava texto após o encerramento. A publicação atômica agora usa `requireOpen`
e não emite eventos para uma sessão encerrada. O poll continua retornando seu
estado terminal. Essa proteção é uma diferença deliberada em relação ao poll
upstream, que ainda permite a gravação; o endpoint `reply` upstream já recusa.

## Método e limites

Os dois testes de durabilidade vieram do arquivo upstream
`test/server-bind-durability.test.js`. Uma cópia temporária foi adaptada apenas
para importar o motor Atlas e usar os nomes/prefixos Atlas. Cada processo usou
diretório de estado e porta de teste próprios. Resultado: Lavish 2/2, Atlas 0/2.
As cópias diagnósticas não fazem parte da suíte do projeto.

A suíte existente `test/cli-reply.test.js` passou 7/7 após as correções. O pipeline
`pnpm run check` é a verificação antes do push. Passar a suíte do fork não prova
paridade com testes upstream ausentes. As lacunas de rede desta auditoria
continuam abertas; a validação não as declara resolvidas.

A primeira execução completa teve uma falha no teste
`malformed links and images stay literal without stalling`: 1.409ms diante de
um limite de 1.000ms. A suíte de chat passou isoladamente 30/30. A reexecução
completa limita a afinidade do processo a três CPUs, reduzindo a concorrência
automática do runner; nenhum limiar nem implementação de Markdown foi alterado.
A reexecução de `pnpm run check` terminou com sucesso: build, lint, formatação,
tipos, 1.340 testes aprovados, zero falhas, nove testes opcionais não executados
e confirmação de que skill/plugin gerados estão atualizados.

Os arquivos White Mode em [design-concept/](design-concept/) são uma referência
portátil de design; não alteram o tema do chrome nem o motor.
