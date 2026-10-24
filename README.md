# Loopbound

> *A sala se lembra de você. É o único jeito de sair.*

**Loopbound** é um jogo de puzzle em grade para navegador, em pixel art. Cada tentativa dura poucos passos. Quando o ciclo acaba, a sala se reorganiza — mas o seu trajeto fica para trás como um **eco**: um fantasma que repete exatamente o que você fez.

Ecos não empurram caixotes nem pegam gemas. Mas eles **têm peso**: seguram placas de pressão e mantêm portas abertas. Quase toda fase só é resolvida quando você deixa de tentar ser rápido e começa a montar uma equipe de você mesmo.

**Jogue:** https://loopbound-web.onrender.com

## Status

| Etapa | Estado |
|---|---|
| Design (GDD) | ✅ concluído |
| Tutorial jogável (8 salas) | ✅ |
| Campanha de 30 fases | ✅ jogável no navegador |
| Mecânicas: alavanca, botão, duto e porta de código | ✅ |
| Labirintos e puzzles elaborados | ✅ |
| Login + banco PostgreSQL + histórico | ✅ |
| Menu em abas (estilo CEPK Rush) | ✅ |
| PWA instalável + offline | ✅ |
| Deploy no Render + Neon | ✅ (Blueprint em `render.yaml`) |

## O que tem no jogo

- **Tutorial de 8 salas** ensinando andar, empurrar, eco, chave, alavanca, botão, duto e código — aparece no primeiro acesso e pode ser revisto pelo menu.
- **30 fases** com dificuldade crescente, **100% fechadas** por corredores e paredes: não existe atalho — resolver o puzzle (portão/senha) é sempre obrigatório. Cada ciclo tem orçamento mínimo (folga zero), com uma folga extra na fase 28.
- **Fases 13–30 redesenhadas:** mapas maiores (até três salas ligadas por portões), **pelo menos 3 mecânicas por fase** e seis fases com senha (quatro delas de cor), recombinando caixote, placa, alavanca, botão, duto, vazio e código.
- **Puzzles elaborados:** caixotes em cadeia, placas e portões coloridos, chave e porta, vazio, gema e o uso combinado de vários ecos.
- **Alavanca (`E`):** liga e fica ligada (persiste entre ciclos); aperte `E` de novo para desligar.
- **Botão (`E`):** só fica pressionado com peso — um caixote em cima o mantém ligado.
- **Duto:** pisar teleporta para o par; fica inativo se um caixote cobrir o par.
- **Porta de código:** a senha é **sorteada no início da fase** (nunca é sempre a mesma) e escrita como **pistas no chão** — números romanos (`1`–`9`) ou cores (`c`/`d`/`e`) —, com um índice de ordem sobre cada pista. Leia o chão, abra a tela (`E`) e digite a senha no painel (`1`–`9`, `C` confirma, `X` limpa).
- **Ciclo** curto (orçamento mínimo para a solução: 8–39 passos), encerrado com `TAB`, morte ou esgotamento do orçamento — e transformado em eco.
- **Ecos** (até 3 por fase) que repetem a trilha gravada e seguram placas.
- **Contas:** login/cadastro, progresso, recordes e histórico de partidas no **PostgreSQL**.
- **Menu em abas:** JOGAR, FASES, HISTÓRICO e PERFIL, com avatar, recordes e estatísticas.
- **Mobile:** toque para mover (swipe) e botões de ciclo/pausa na tela.
- **Áudio** 100% sintetizado em WebAudio (tecla `M` para mudo).
- **PWA:** instalável pelo navegador, funciona offline, ícones e service worker gerados no build (sem botão de instalação dentro do jogo).

## Kennedito

O protagonista é o **Kennedito**, um cachorro batedor de boné verde, capa e estrela dourada — sprite 16×24 desenhado em código, sem assets binários. O emblema **CEPK** aparece no boné, na tela-título, no ícone do app e no cartão de vitória.

## Controles

| Ação | Teclado | Toque |
|---|---|---|
| Mover | WASD / setas | swipe |
| Interagir (alavanca, botão, tela) | `E` | botão `E` |
| Painel de código | `1`–`9`, `C` confirma, `X`/`Backspace` limpa | toque nos botões |
| Encerrar ciclo | `TAB` | botão do ciclo |
| Desfazer | `Z` | — |
| Reiniciar fase | `R` | — |
| Pausa / menu | `ESC` | botão ESC |
| Som | `M` | item do menu |

## Stack

- **p5.js** para render e loop (canvas virtual 640×360, zoom 2× com escala inteira).
- **TypeScript puro** para as regras: sem canvas, testável no Node.
- **Vite** + **vite-plugin-pwa** (Workbox) para build e offline.
- **UI em HTML/CSS** (login e menu em abas) por cima do canvas.
- **Node + Express + `pg` + Zod** no backend, com **PostgreSQL** (login, progresso e histórico).
- **Vitest**: 202 testes — regras, invariantes de design (nenhuma fase tem caminho livre; nenhuma solução estoura o ciclo), senha sorteada por fase, diversidade das fases, layout das salas e replays.
- Sprites em mapas de caracteres, fonte bitmap 3×5 própria, áudio sintetizado — **zero assets binários** (só os PNGs de ícone gerados no build).

## Contas, banco e API

O login é obrigatório. O progresso fica no PostgreSQL; o navegador mantém uma
cópia em `localStorage` para jogar offline depois do primeiro acesso.

| Rota | Método | O que faz |
|---|---|---|
| `/api/auth/register` | POST | cria a conta e devolve o token de sessão |
| `/api/auth/login` | POST | entra na conta |
| `/api/auth/logout` | POST | encerra a sessão |
| `/api/me` | GET | usuário + progresso + recordes + histórico |
| `/api/progress` | PUT | fase liberada, tutorial concluído, som e avatar |
| `/api/runs` | POST | registra a partida e atualiza o recorde |
| `/api/history` | GET | últimas partidas |
| `/api/leaderboard` | GET | melhores passos por fase |
| `/api/health` | GET | health check do Render: `{"ok":true,"db":true}` (consulta o banco) |
| `/api/ping` | GET | `{"ok":true}` sem tocar no banco (para o monitor externo) |

Tabelas: `users`, `sessions`, `progress`, `level_bests` e `runs`
(veja `server/migrations/001_init.sql`). Senhas com **bcrypt**; sessões com token
aleatório hasheado (SHA-256) enviado no header `Authorization: Bearer`.

## Desenvolvimento

```bash
npm install
npm run db:up        # sobe o PostgreSQL local (docker compose)
cp .env.example .env # ajuste DATABASE_URL se precisar
npm run server       # API em http://localhost:3001
npm run dev          # jogo em http://localhost:5173/ (com proxy /api)
npm test             # regras + invariantes + replay do tutorial e das 30 fases
npm run build        # tsc + vite build (gera dist/ e o service worker)
npm run preview      # serve o build em http://localhost:4173/
npm run tighten      # regenera os mapas fechados das fases (halo 0)
npx vite-node scripts/rebuild-levels.ts  # resolve e regrava as fases 13–30 (solver BFS)
npm run audit        # audita as fases: caminho livre, fim de ciclo prematuro, folga
npm run icons        # regenera os ícones do PWA
npm run sprite       # gera um PNG de preview do Kennedito
```

Em produção o deploy é feito no Render a partir do `render.yaml`: o frontend é
um **Static Site**, a API é um **Web Service** e o banco é um **PostgreSQL no
Neon**. Veja a seção 14.

Hooks de debug: `?level=3&moves=DDDR|DDRRRR` (o `|` encerra o ciclo) e `&pause=1`.

## Estrutura

```
README.md                apresentação + GDD completo (regras, arte, fases, arquitetura)
render.yaml              Blueprint do Render (Static Site + Web Service)
server/                  API Express + PostgreSQL (auth, progresso, histórico)
docker-compose.yml       PostgreSQL de desenvolvimento
src/game/                regras canônicas, fases, tutorial, save (TypeScript puro)
src/net/api.ts           cliente da API e sessão
src/render/              paleta, Kennedito, atlas, sala, entidades, fonte
src/ui/                  HUD (640×360) e casca DOM (login + menu em abas)
src/app.ts               máquina de estados, input, tutorial, telas
src/sketch.ts            instância p5 e escala inteira do canvas
src/main.ts              bootstrap, listeners, PWA
tests/                   202 testes (regras, invariantes e soluções das fases)
scripts/                 gerador de ícones, preview do sprite e fechamento dos mapas
```

---

# Loopbound — Game Design Document

> *A sala se lembra de você. É o único jeito de sair.*

| Campo | Valor |
|---|---|
| Título | **Loopbound** |
| Gênero | Puzzle em grade / quebra-cabeça de lógica com mecânica de eco |
| Perspectiva | Top-down 3/4, câmera fixa por sala |
| Plataforma | Navegador (desktop e mobile) — PWA instalável e offline |
| Engine | p5.js (render e loop) + TypeScript puro (regras) |
| Arte | Pixel art 16×16, Kennedito 16×24, paleta restrita, sem assets binários |
| Idioma | PT-BR |
| Classificação | Livre |
| Duração | 60–120 min para zerar as 30 fases + clear perfeito |

---

## 0. Estado do jogo

O jogo cobre o fluxo completo com **tutorial + 30 fases**:

| Fase | Nome | Ensina |
|---|---|---|
| TUT | Tutorial (8 salas) | andar, empurrar, eco, chave, alavanca, botão, duto, código |
| 1 | Primeiros Passos | andar e chegar ao núcleo |
| 2 | Peso Morto | caixote em placa segura o portão |
| 3 | Primeiro Eco | o eco segura a placa por você |
| 4 | O Vão | dois ecos, dois portões, vazio |
| 5 | A Estrela do Batedor | chave, porta e eco sincronizado |
| 6 | Peso Extra | caixote e eco segurando placas ao mesmo tempo |
| 7 | Três Portões | três ecos, três cores, quatro ciclos |
| 8 | Pavio Curto | ciclo de 8 passos e rota cirúrgica |
| 9 | Caminhos Cruzados | caixote e eco em rotas diferentes |
| 10 | Última Luz | três portões, dois ecos e um caixote |
| 11 | A Alavanca | alavanca ligada com `E` abre o portão |
| 12 | Dois Interruptores | uma alavanca por cor |
| 13 | Circuito Duplo | alavanca abre o portão; caixote na placa |
| 14 | Prelo | botão só cede com peso em cima |
| 15 | Dois Botões | um caixote para cada botão |
| 16 | Alavanca e Botão | alavanca e caixote em rotas separadas |
| 17 | Conduto | o duto cruza a sala; caixote abre a passagem |
| 18 | Duto Coberto | caixote no par desliga o duto |
| 19 | Dutos em Série | um duto leva ao outro |
| 20 | Código Romano | leia as pistas no chão e digite a senha |
| 21 | Código de Cor | a ordem das cores é a senha |
| 22 | Código e Peso | caixote na placa e senha na tela |
| 23 | Código e Alavanca | a senha abre o portão; a alavanca, o da saída |
| 24 | Código e Duto | senha, duto e alavanca até a saída |
| 25 | Cores e Botões | senha de cor e botão que precisa de peso |
| 26 | Senha e Vão | senha, vazio e alavanca |
| 27 | Três Mecanismos | caixote, alavanca e senha |
| 28 | Quatro Mecanismos | duto, botão, senha e alavanca numa travessia |
| 29 | Labirinto Final | duas alavancas, um caixote e um duto |
| 30 | Última Prova | senha, duto, alavanca, botão e peso — tudo junto |

Implementado: tutorial em 8 salas, ciclo com orçamento e encerramento por `TAB`/morte, gravação e replay de ecos, caixotes, placas e portões coloridos, chave/porta, gemas, vazio, **alavanca, botão, duto e porta de código com senha sorteada por fase (pistas no chão)**, undo por passo, reinício, pausa, tela de vitória com recorde, **login e progresso no PostgreSQL**, menu em abas com histórico, áudio sintetizado, toque/swipe, PWA offline e canvas virtual 640×360 com zoom 2×.

Os mapas das fases 1–12 passam por `scripts/tighten.ts`, que reaproveita a solução gravada para tapar com parede todo piso que nenhum ciclo pisa. As fases 13–30 foram geradas por `scripts/rebuild-levels.ts`, que resolve cada mapa com um **solver BFS** (`scripts/solver.ts`) antes de gravar o bloco em `src/game/levels.ts` — assim cada solução entregue já nasce verificada. Em ambos os casos nenhuma fase é um campo aberto e todas continuam com solução replayada no CI.

---

## 1. Pitch

**Loopbound** é um puzzle em grade onde o tempo não volta — você é que fica preso nele.

Cada ciclo dura poucos passos. Quando ele termina, a sala se reorganiza, mas **você deixa um eco**: um fantasma translúcido que repete, para sempre, o caminho que você fez naquele ciclo. Ecos não empurram caixotes nem coletam nada — mas **têm peso**. Eles seguram placas de pressão, mantêm portas abertas e ocupam o tile exato onde você precisa passar.

Sair de cada sala quase nunca exige ser mais rápido. Exige ser **várias pessoas ao mesmo tempo**, e a única forma de contrata-las é falhar de propósito, do jeito certo, no momento certo.

### Gancho em uma frase

> Você não resolve o puzzle. Você constrói a equipe que resolve.

### Referências

- *Braid* — rewind com peso narrativo.
- *The Misadventures of P.B. Winterbottom* — ecos que repetem gravações.
- *Sokoban* / *A Monster's Expedition* — empurrar como linguagem.
- *Patrick's Parabox* — puzzles sobre ocupar espaço.
- *Baba Is You* — uma regra por fase, ensinada sem texto.

---

## 2. Pilares de design

1. **Falhar é jogar.** Terminar um ciclo nunca é derrota; é a jogada central. O jogador deve sair de uma fase com 3 ecos e sentir que *montou* a solução.
2. **Uma ideia por sala.** Cada fase introduz exatamente um conceito e o testa de três formas antes de somar ao vocabulário.
3. **Silêncio ensina.** Sem tutoriais em caixa de texto. A sala e o HUD bastam. Texto só em menus e nos cartões de conclusão.
4. **Leitura instantânea.** Todo elemento tem silhueta e cor distintas, legíveis em 16×16 px, sem depender só de cor.
5. **Sessões curtas.** Nenhuma fase passa de ~90 segundos de execução. Reiniciar é instantâneo.

---

## 3. Loop central

```
        ┌──────────── ciclo começa ────────────┐
        │                                       │
        ▼                                       │
  você age (passos) ── morre / TAB / esgota ──► grava eco
        │                                       │
        ▼                                       ▼
   resolve a sala?                       sala reinicia
        │                                (ecos continuam)
        ▼
     próxima fase
```

### Anatomia de um ciclo

- Um ciclo tem `cycleLength` **passos** (movimentos válidos), fixado no **mínimo que a solução de referência exige** (folga zero): cada ciclo é uma corrida contra o tempo. A fase 28 tem folga extra (orçamento de 40 para uma solução de 31 passos).
- O ciclo termina por: `TAB` (manual), orçamento esgotado, morte, ou vitória.
- Ao terminar, o trajeto inteiro é congelado como **eco** e o ciclo seguinte começa do zero.
- O eco reproduz a trilha do passo 0 ao N e **estaciona na última posição** até o fim do ciclo; no ciclo seguinte, recomeça do início.
- Se o jogador vencer, a fase acaba na hora — o eco do ciclo vencedor não chega a nascer.

### Regras de ouro (invariantes testáveis)

| # | Invariante |
|---|---|
| R1 | O jogador se move 1 tile por passo, em 4 direções, com tween de 90 ms. |
| R2 | Caixotes só são empurrados, nunca puxados. Empurrar em cadeia é permitido. |
| R3 | Ecos não alteram o estado dos caixotes, portas ou coletáveis. Nunca. |
| R4 | Ecos contam como peso em placas. Essa é a única interação física deles. |
| R5 | O replay do eco usa **coordenadas gravadas**, não o log de input. Logo, é determinístico por construção. |
| R6 | Estado persistente entre ciclos: gemas, chaves, portas abertas por chave, âncoras. |
| R7 | Estado resetado por ciclo: jogador, caixotes, placas momentâneas, portas coloridas. |
| R8 | Existe no máximo `maxEchoes` ecos ativos; o mais antigo se dissolve ao exceder. |
| R9 | Nenhuma fase exige mais ciclos do que `maxEchoes + 1`. |
| R10 | Toda fase entregue inclui uma solução gravada que o CI reexecuta. |

### Por que gravar posições e não input

Se o eco reexecutasse o input, ele colidiria com caixotes em posições diferentes das do ciclo original, divergindo da gravação. Gravar a trilha de tiles resolve isso, permite scrub preciso e custa ~16 bytes por eco (16 passos × 1 byte). É também o que torna o comportamento do eco **compreensível para o jogador**: ele faz exatamente o que você fez, não uma reinterpretação.

---

## 4. Léxico

| Termo | Significado |
|---|---|
| **Ciclo** | Uma tentativa, com orçamento de passos. |
| **Eco** | A gravação de um ciclo, reproduzida como fantasma com peso. |
| **Âncora** | Interruptor que permanece ativo entre ciclos. |
| **Núcleo** | A saída da sala (o pad metálico com a estrela). |
| **Ressonância** | Medidor da fase: quantos ecos você já criou / pode criar. |
| **Clear perfeito** | Terminar com todas as gemas e sem ecos desperdiçados. |

---

## 5. Elementos e interações

| Elemento | Símbolo no mapa | Comportamento | Empurrável | Peso |
|---|---|---|---|---|
| Piso de pedra | `.` | Caminhável | — | — |
| Parede | `#` | Bloqueia tudo | — | — |
| Vazio | ` ` (espaço) | Mata quem entra | — | — |
| Jogador (spawn) | `P` | Você | — | 1 |
| Núcleo / saída | `E` | Vence se requisitos cumpridos | — | — |
| Caixote | `C` | Empurrável em cadeia | Sim | 1 |
| Bloco azul pesado | `B` | Só desliza com placa azul ativa | Sim* | 1 |
| Bloco dourado pesado | `G` | Só desliza com placa dourada ativa | Sim* | 1 |
| Placa vermelha | `r` | Porta vermelha abre enquanto pressionada | Não | 0 |
| Placa azul | `b` | Porta azul abre enquanto pressionada | Não | 0 |
| Placa dourada | `y` | Porta dourada abre enquanto pressionada | Não | 0 |
| Porta vermelha | `R` | Bloqueia até a cor vermelha ser energizada | Não | — |
| Porta azul | `L` | Bloqueia até a cor azul ser energizada | Não | — |
| Porta dourada | `Y` | Bloqueia até a cor dourada ser energizada | Não | — |
| Alavanca | `V`/`W`/`Z` | `E` alterna; ligada **persiste entre ciclos** | Não | 0 |
| Botão | `H`/`I`/`J` | `E` pressiona; só fica ligado com caixote em cima | Não | 0 |
| Duto | `O`/`o`, `Q`/`q` | Pisar teleporta para o par; inativo se o par estiver coberto | Não | 0 |
| Tela de código | `X` | `E` abre o painel da senha | Não | 0 |
| Porta de código | `@` | Abre quando a senha da tela é confirmada | Não | — |
| Pista romana | `1`–`9` | Marca no chão a ordem da senha (números romanos) | Não | 0 |
| Pista de cor | `c`/`d`/`e` | Marca no chão a ordem da senha (cores) | Não | 0 |
| Âncora | `*` | Alterna uma vez e **persiste entre ciclos** | Não | 0 |
| Gema | `g` | Coletável persistente (3 por fase) | Não | 0 |
| Chave | `K` | Consumível, persistente | Não | 0 |
| Porta trancada | `D` | Abre com chave, permanece aberta | Não | — |
| Espinho | `x` | Mata, mas não bloqueia | — | — |

\* Blocos pesados só se movem enquanto a placa da cor correspondente estiver ativa.

### Matriz de interação

| Origem → Alvo | Piso | Parede | Vazio | Caixote | Bloco pesado | Porta fechada | Placa | Eco |
|---|---|---|---|---|---|---|---|---|
| **Jogador** | anda | bloqueia | morre | empurra | empurra* | bloqueia | ativa | atravessa |
| **Eco** | anda (replay) | — | atravessa | atravessa | atravessa | atravessa | ativa | atravessa |
| **Caixote empurrado** | desliza | bloqueia | cai/perde | bloqueia | bloqueia | bloqueia | pressiona | atravessa |

### Resolução de um passo (ordem canônica)

1. Lê o input bufferizado (1 movimento por passo; inputs extras são descartados).
2. Calcula o tile alvo e monta a cadeia de empurráveis na direção.
3. Valida a cadeia do mais distante ao mais próximo (parede, vazio, porta, borda).
4. Move a cadeia de trás para frente (evita sobrescrita).
5. Move o jogador e atualiza o facing.
6. Recalcula pressão de todas as placas → abre/fecha portas momentâneas.
7. Coleta gemas e chaves (persistente), aplica âncoras.
8. Checa morte (vazio/espinho) e condição de vitória.
9. Incrementa o contador de passos; se `passos == cycleLength`, encerra o ciclo.
10. Anexa a coordenada ao registro do ciclo.

---

## 6. Curva de aprendizado — 30 fases

Cada fase ensina **um** conceito e o recombina. Nenhuma delas exige mais ciclos do que `maxEchoes + 1`. A tabela completa está na seção 0; abaixo, a curva núcleo:

| # | Nome | Ensina | Ciclo | Ecos | Par (ciclos/passos) |
|---|---|---|---|---|---|
| 1 | Primeiros Passos | Andar, ler a sala, sair | 13 | 0 | 1 / 12 |
| 2 | Peso Morto | Empurrar caixote em placa | 21 | 0 | 1 / 20 |
| 3 | Primeiro Eco | Terminar ciclo de propósito; eco segura placa | 16 | 1 | 2 / 19 |
| 4 | O Vão | Dois ecos, duas portas, vazio | 16 | 2 | 3 / 25 |
| 5 | A Estrela do Batedor | Chave, porta e eco sincronizado | 14 | 2 | 2 / 19 |
| 6 | Peso Extra | Caixote e eco segurando placas ao mesmo tempo | 21 | 1 | 2 / 26 |
| 7 | Três Portões | Três ecos, três cores, quatro ciclos | 20 | 3 | 4 / 34 |

As fases 11–30 introduzem, em grupos, **alavanca**, **botão**, **duto** e **porta de código**. A partir da 13, cada fase combina **pelo menos três mecânicas** em mapas de duas ou três salas ligadas por portões — sem eco (`maxEchoes: 0`): o desafio passa a ser ler a sala inteira e encadear as ações dentro do orçamento de um único ciclo.

### Exemplo de layout — fase 3 (Primeiro Eco)

```
#################
#P...#......E...#
#....#..........#
#....R..........#
#.r..#..........#
#....#..........#
#################
```

Leitura: a placa vermelha (`r`) fica no mesmo lado do spawn, mas o portão vermelho (`R`) está na parede do meio. Pisar na placa abre o portão — só que, ao sair da placa para atravessar, ele fecha de novo. A solução é de dois ciclos: no primeiro, desça e ande até a placa (4 passos) e encerre o ciclo com `TAB`; o eco fica estacionado ali. No segundo ciclo, o portão permanece aberto e você contorna até o núcleo em 15 passos. A parede do meio garante que não há atalho.

## 7. Direção de arte

### 7.1 Análise da referência

A imagem de referência define o vocabulário visual inteiro:

- **Fundo chapado azul-marinho quase preto**, com a sala flutuando sobre ele e uma borda de pedra clara com cantos arredondados.
- **Tiles 3/4**: cada tile de pedra tem bevel claro em cima/esquerda e sombra embaixo/direita; paredes altas são blocos empilhados; o vazio é preto absoluto.
- **Madeira quente** (caixotes com tábua diagonal e quatro pregos) contrasta com a pedra verde-acinzentada fria.
- **Acentos saturados** em blocos maciços: azul, dourado, vermelho — sempre com contorno interno escuro e um brilho discreto no topo.
- **Personagem roxo** (cogumelo/capuz) com olhos brancos grandes e sombra elíptica.
- **UI neon ciano**: molduras quadradas com colchetes nos cantos, vidro escuro dentro, glifo + rótulo em fonte pixel ("TAB", "ESC").
- **Gem as esmeralda** com facetas e brilho; **chave dourada** de perfil; **núcleo** metálico com estrela/compasso e aura ciano.

O jogo adota isso sem desvios. Nada de gradientes suaves, nada de antialiasing, nada de rotação.

### 7.2 Paleta

| Token | Hex | Uso |
|---|---|---|
| `bg/deep` | `#0B1220` | Fundo, letterbox |
| `bg/panel` | `#111C2E` | Painéis de menu |
| `stone/edge` | `#9BC0B2` | Contorno claro dos tiles de borda |
| `stone/hi` | `#5C7369` | Bevel superior |
| `stone/mid` | `#3C4E48` | Corpo do tile |
| `stone/lo` | `#26332F` | Face interna / rejunte |
| `stone/shadow` | `#16201D` | Sombra entre tiles |
| `void` | `#04070B` | Vazio |
| `wood/hi` | `#C48D57` | Tábua iluminada |
| `wood/mid` | `#8B5B35` | Corpo do caixote |
| `wood/lo` | `#5A3A21` | Lateral e contorno |
| `wood/nail` | `#2B1C11` | Pregos |
| `cyan/bright` | `#35E6F2` | UI, aura, eco |
| `cyan/dim` | `#127F8E` | Bordas secundárias |
| `blue/bright` | `#2E86D8` | Bloco e placa azul |
| `blue/dark` | `#1B4E86` | Sombra azul |
| `gold/bright` | `#D9A63C` | Bloco dourado, chave, porta |
| `gold/dark` | `#8F6A1F` | Sombra dourada |
| `red/bright` | `#C43B31` | Placa vermelha |
| `red/dark` | `#7C2620` | Sombra vermelha |
| `emerald/bright` | `#45E08C` | Gema |
| `emerald/dark` | `#1C8A54` | Faceta da gema |
| `player/cloak` | `#6B3FB8` | Personagem |
| `player/dark` | `#412670` | Contorno do personagem |
| `player/eye` | `#F4F6F5` | Olhos |
| `echo/tint` | `#57D8E6` @ 35% | Eco |

### 7.3 Regras de pixel art

- Tile lógico: **16×16 px**. Nenhum sprite usa meio pixel.
- Silhueta sempre com contorno escuro de 1 px (`stone/shadow` ou `player/dark`).
- Rampa de 2–3 valores por material, do claro (cima/esquerda) ao escuro (baixo/direita).
- Dithering 50% (xadrez) apenas em áreas > 32 px².
- Sombra projetada: elipse preta a 30%, deslocada 2 px para baixo.
- Brilho é o único efeito suave permitido (blur em offscreen, ainda alinhado à grade).
- Nenhum asset binário: sprites são mapas de caracteres em código.

### 7.4 Resolução e escala

- Canvas virtual: **480×270** (30×16,875 tiles).
- Salas ocupam até **28×15 tiles** (448×240), centralizadas com 16 px de margem.
- Escala = `floor(min(vw/480, vh/270))`, mínimo 2; letterbox preenchido com `bg/deep`.
- `imageSmoothingEnabled = false` em todos os contextos.
- Zoom de UI: HUD desenhado em escala 2 sobre o canvas virtual.

### 7.5 Personagem e ecos

| Estado | Descrição |
|---|---|
| Idle | Bob de 1 px em seno 1,2 s; pisca a cada 4 s. |
| Passo | Squash 1,1×0,9 por 90 ms, retorna com ease-out. |
| Empurrar | Desloca 1 px na direção por 80 ms e volta; nunca rotaciona. |
| Morte | Dissolve em 8 blocos de 2 px, 400 ms. |
| Eco | Silhueta ciano 35%, sem olhos, rim de 1 px aditivo, scanline a cada 3 px, bob de 1 px defasado. |

Ecos que se sobrepõem ao jogador são desenhados atrás e com 20% de opacidade; ecos entre si recebem deslocamento de ±1 px para não virarem borrão.

### 7.6 Animações e FX

| Evento | Efeito | Duração |
|---|---|---|
| Passo | Tween linear + poeira de 2 px | 90 ms |
| Empurrar | Tremor de 1 px no caixote + clique | 100 ms |
| Placa pressionada | Desce 2 px, rim acende | 120 ms |
| Porta abre | Desliza para o lado | 180 ms |
| Gema | Arpejo + 4 partículas | 200 ms |
| Eco nasce | Varredura vertical ciano + anel | 300 ms |
| Fim de ciclo | Dessaturação radial + streaks horizontais | 250 ms |
| Âncora liga | Flash de tela 6% + pulso | 150 ms |
| Vitória | Íris + cartão de resultado | 600 ms |

Screen shake: máximo 2 px, 120 ms, desligável.

### 7.7 HUD

Fiel à referência:

- **TAB** (canto superior esquerdo): moldura 64×64, borda ciano de 2 px, colchetes de 6 px nos cantos, glifo circular de loop, rótulo `TAB` em fonte 5×7.
- **ESC** (canto inferior esquerdo): mesma moldura, glifo de lista/menu.
- **Contador de gemas** (superior direito): gema + `1/3`, mesma moldura reduzida.
- **Pips de ressonância** (inferior direito): um losango por eco disponível, preenchido = ativo.
- **Medidor de ciclo**: 16 traços finos abaixo do centro, apagando um a um.

O HUD pulsa quando a ação correspondente fica disponível (ex.: `TAB` brilha quando há passos gravados).

---

## 8. Áudio

100% sintetizado em WebAudio — nenhum arquivo de áudio no repositório.

| Evento | Síntese |
|---|---|
| Passo | Square 220 Hz, 40 ms, decay rápido |
| Empurrar | Noise burst filtrado, 60 ms |
| Placa | Triangle 440 → 330 Hz, 80 ms |
| Porta | Saw 110 Hz com lowpass subindo, 180 ms |
| Gema | Arpejo 660/880/1320 Hz, 30 ms cada |
| Chave | Sine 990 Hz + harmônico, 120 ms |
| Eco nasce | Sine 220 → 440 Hz com reverb curto, 300 ms |
| Fim de ciclo | Sweep descendente 440 → 110 Hz, 250 ms |
| Morte | Square 110 Hz com pitch drop, 400 ms |
| Vitória | Arpejo maior de 5 notas |

Música: pad ambiente de 2 compassos em Lá menor, filtrado, volume 25% por padrão, mute com `M`. Áudio só inicia após o primeiro input (política dos navegadores).

---

## 9. Controles e acessibilidade

| Ação | Desktop | Mobile |
|---|---|---|
| Mover | WASD / setas | Swipe ou D-pad virtual |
| Encerrar ciclo | `TAB` | Botão de loop |
| Desfazer passo | `Z` | Botão de desfazer |
| Reiniciar fase | `R` | Menu |
| Pausa | `ESC` | Botão de menu |
| Mute | `M` | Menu |
| Tela cheia | `F` | Menu |

Acessibilidade:

- Placas e portas nunca dependem só de cor: vermelho = anel, azul = quadrado, dourado = triângulo.
- Opções: reduzir flashes, desligar shake, remapear teclas, tamanho de fonte, alto contraste.
- 100% jogável só com teclado; pausa sempre disponível; sem timers em tempo real.
- `Z` como rede de segurança para erros triviais.

---

## 10. Arquitetura técnica

### Stack

- **Vite + TypeScript** (strict), build estático.
- **p5.js** para render e loop; canvas virtual **640×360** com `translate` + `scale(2)` na sala, exibido em escala inteira (1280×720 = 2×).
- **TypeScript puro** para as regras (`src/game`), sem canvas — testável no Node.
- **Vitest** para regras e replay das soluções das fases.
- **vite-plugin-pwa** (Workbox) para manifest, service worker e offline.
- **Render** (Static Site) + **Neon** (PostgreSQL) para publicação e banco.
- Dependência de runtime do frontend: `p5`; no backend, Express + `pg`.

### Estrutura de arquivos

```
loopbound/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ README.md                 # apresentação + este GDD
├─ src/
│  ├─ main.ts                 # bootstrap, listeners, hook de debug, PWA
│  ├─ sketch.ts               # instância p5 e fitCanvas (escala inteira)
│  ├─ app.ts                  # máquina de estados, input, telas, HUD
│  ├─ pwa.ts                  # registro do service worker e prompt de instalação
│  ├─ game/
│  │  ├─ types.ts             # tiles, direções, cores
│  │  ├─ level.ts             # parse + validação do mapa
│  │  ├─ rules.ts             # passo canônico, ecos, pressão, undo
│  │  ├─ levels.ts            # 30 fases + soluções gravadas
│  │  └─ save.ts              # progresso em localStorage
│  ├─ render/
│  │  ├─ palette.ts
│  │  ├─ kennedito.ts         # sprite 16×24 em mapas de caracteres
│  │  ├─ atlas.ts             # bake offscreen + tints
│  │  ├─ room.ts              # bake do piso/parede/vazio
│  │  ├─ renderer.ts          # caixote, placa, portão, gema, chave, porta, saída
│  │  └─ font.ts              # bitmap 3×5 com acentos
│  ├─ ui/hud.ts               # HUD 640×360, botões TAB/ESC, medidor de ciclo
│  └─ audio/sfx.ts            # sons sintetizados em WebAudio
├─ scripts/                   # gerador de ícones e preview do sprite
└─ tests/game.test.ts         # 202 testes: regras + invariantes + replay das 30 soluções + tutorial
```

### Ordem de desenho

1. `bg/deep`
2. Sombra da sala
3. Tiles de piso
4. Vazio
5. Placas, âncoras, espinhos
6. Portas
7. Colecionáveis
8. Ecos
9. Caixotes e blocos
10. Jogador
11. FX
12. HUD

### Orçamentos

| Métrica | Alvo |
|---|---|
| Frame | 16,6 ms (60 fps estável) |
| Lógica | < 2 ms |
| Render | < 4 ms |
| Bundle JS | ~284 KB gzip (p5.js incluso) |
| Requisições externas | 0 |
| Tempo de carga | < 1,5 s em 3G |

---

## 11. Testes e critérios de aceite

### Automatizados

- **Regras**: empurrar em cadeia, bloqueio por parede/vazio/porta, peso de eco em placa, coleta persistente, morte, vitória.
- **Ecos**: replay com trilha mais curta que o ciclo (estaciona na última posição até o fim do ciclo e recomeça no ciclo seguinte), sobreposição, dissolução do mais antigo.
- **Fases**: formato válido, exatamente 1 spawn e 1 saída, solução gravada vence, nenhuma fase exige mais que `maxEchoes + 1` ciclos, **nenhuma fase tem caminho livre** (a mecânica é obrigatória) e nenhuma solução estoura o ciclo antes da hora.
- **Senha por fase**: a sequência é sorteada no load, não é trivial (nunca um símbolo só nem 1-2-3/3-2-1), duas cargas sorteiam senhas diferentes e as pistas do chão coincidem com a senha exigida. Nas soluções gravadas o token `?` pressiona **o próximo símbolo correto**, então o replay vence qualquer senha sorteada.
- **Diversidade**: as fases 13–30 têm pelo menos 3 mecânicas distintas, altura de mapa ≥ 5 linhas e a 15 e a 16 são diferentes entre si.

### Critérios de aceite por fase

- [ ] Intenção legível sem texto.
- [ ] Solução do CI chega ao núcleo.
- [ ] Nenhum caminho livre: sem acionar a mecânica, a saída é inalcançável (fase 1 é a única exceção, pois ensina a andar).
- [ ] Par de passos documentado.
- [ ] Nenhum tile inalcançável sem mecânica ainda não ensinada e nenhum atalho que fure o puzzle.

### Critérios de aceite do produto

- [x] 30 fases completas e vencíveis (conteúdo final).
- [x] 60 fps em notebook modesto e em celular médio.
- [x] Progresso salvo no PostgreSQL (com cache em `localStorage`).
- [x] Deploy no Render (Static Site + Web Service) com banco no Neon.
- [x] Nenhum recurso externo carregado.
- [x] Navegação 100% por teclado e por toque.

---

## 12. Roadmap

| Marco | Entrega | Pronto quando |
|---|---|---|
| **M0 — Design** | Este documento + README | Publicado no repositório |
| **M1 — Fundação** | Vite, loop fixo, input, paleta, tilemap | Sala estática renderizada a 60 fps |
| **M2 — Corpo** | Movimento, empurrar, placas, portas, gemas, chave | Fases 1–2 jogáveis |
| **M3 — Alma** | Ciclos, gravação e replay de ecos, undo | Fase 3 jogável |
| **M4 — Conteúdo** | Fases 3–7, HUD, menus, áudio, save, PWA | Protótipo completo (7 fases) |
| **M5 — Polimento** | Fases 6–10, FX, acessibilidade, mobile, deploy | Link público, 60 fps, sem bugs |
| **M6 — Expansão** | 30 fases, tutorial de 8 salas, alavanca/botão/duto/código | Campanha completa e publicada |

Protótipo (M1–M4) concluído: 7 fases, fluxo completo, PWA offline. M5 concluído: 10 fases, tutorial, login com PostgreSQL e publicação no Render. M6 concluído: 30 fases, tutorial de 8 salas e as mecânicas de alavanca, botão, duto e porta de código.

---

## 13. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Ecos tornam a solução ambígua (jogador não entende o fantasma) | Alto | Ecos sempre visíveis, HUD mostra quantos e onde; tutorial implícito na fase 3 |
| Fases ficam insolúveis ao iterar | Alto | Solução gravada replayada no CI a cada commit |
| Replay divergir por tempo variável | Médio | Trilha de coordenadas, passo discreto, sem física contínua |
| Pixel art gerada em código ficar fraca | Médio | Atlas com mapas de caracteres revisáveis + preview de sprites em página de debug |
| Escala fracionária borrar a arte | Médio | Escala inteira obrigatória + letterbox |
| Áudio irritar em sessões longas | Baixo | Mute com `M`, volume 25%, lembrado entre sessões |
| Escopo de conteúdo crescer | Médio | 30 fases fixas; ideias novas vão para `IDEAS.md` |

---

## 14. Deploy

O deploy usa três peças, todas gratuitas:

| Peça | Onde | Endereço |
|---|---|---|
| Frontend (build do Vite) | Render **Static Site** | `https://loopbound-web.onrender.com` |
| API (Express) | Render **Web Service** | `https://loopbound-api.onrender.com` |
| PostgreSQL | **Neon** | connection string privada |

O `render.yaml` na raiz descreve o Static Site e o Web Service, então o Render
cria os dois de uma vez:

1. No painel do Render: **New → Blueprint** e conecte o repositório.
2. O Render pede o valor de `DATABASE_URL` (marcado com `sync: false`). Cole o
   connection string **direto** do Neon (o host sem `-pooler`), no formato
   `postgresql://usuario:senha@ep-xxx.neon.tech/loopbound?sslmode=require`.
3. A API roda as migrações sozinha no primeiro boot e responde em `/api/health`.
4. Confira as URLs geradas. Se `loopbound-web` ou `loopbound-api` já existirem,
   o Render adiciona um sufixo: atualize `VITE_API_URL` e `APP_ORIGIN` no
   `render.yaml` e faça novo deploy.

Variáveis relevantes:

| Variável | Onde | Valor |
|---|---|---|
| `VITE_BASE` | Static Site (build) | `/` |
| `VITE_API_URL` | Static Site (build) | URL pública da API |
| `DATABASE_URL` | Web Service | connection string do Neon |
| `DATABASE_SSL` | Web Service | `1` |
| `APP_ORIGIN` | Web Service | URL pública do Static Site (CORS) |

Observações do plano gratuito:

- O Web Service do Render hiberna após **15 minutos sem tráfego**; o primeiro
  acesso depois disso leva cerca de um minuto. Veja a subseção *Manter a API
  acordada* para eliminar essa espera.
- O Render dá **750 h de instância grátis por mês** (por workspace). Um serviço
  ligado 24/7 usa ~730 h, então cabe — mas não sobra muito. Só há um Web Service
  neste projeto.
- O Neon **não expira**, mas o plano grátis tem **1 GB de Postgres por projeto**
  (até 20 GB somando todos), **100 CU-hours/projeto/mês** e **5 GB de tráfego
  por projeto/mês**. O compute **escala para zero após 5 min** ocioso e acorda
  na primeira consulta em menos de 1 s.
- O service worker do Workbox faz precache de HTML/JS/CSS/ícones (16 entradas);
  o `sw.js` é servido com `Cache-Control: no-cache` para as atualizações
  chegarem.

### Manter a API acordada (opcional)

O `loopbound-api` hiberna após 15 min sem tráfego. Um monitor externo batendo
na API a cada 5 min evita o cold start de ~1 min. O **UptimeRobot** faz isso de
graça:

1. Crie a conta em [uptimerobot.com](https://uptimerobot.com) e confirme o
   e-mail (sem confirmar, não chegam alertas).
2. **+ Add New Monitor** → **Monitor Type: HTTP(s)**.
3. Preencha:
   - **Friendly Name:** `Loopbound API`
   - **URL:** `https://loopbound-api.onrender.com/api/ping`
   - **Monitoring Interval:** `5 minutes` (mínimo do plano grátis)
   - **Alert Contacts:** deixe seu e-mail marcado
4. **Create Monitor**. Em poucos minutos o status fica **Up** (verde).
5. Opcional: **My Settings → Alert Contacts → Test Notification** para conferir
   que o e-mail chega.

> O campo **HTTP Method** só existe no plano pago (Pro) — **não é preciso**. O
> monitor usa o método padrão e o `/api/ping` responde `200` de qualquer forma.

#### Por que apontar para `/api/ping`, e não para `/api/health`

O `/api/health` roda um `select 1` no banco. Se o monitor de 5 em 5 minutos
batesse nele, o compute do Neon **nunca** escalaria a zero — e a conta não
fecha:

```
0,25 CU (mínimo do Neon) × ~720 h/mês ≈ 180 CU-hours/mês
```

Isso estoura a cota grátis de **100 CU-hours/projeto/mês** e o Neon **suspende o
compute até o próximo mês**. Por isso o monitor bate no `/api/ping` (sem banco):
o Render fica quente, o Neon dorme à vontade e acorda em menos de 1 s quando
alguém realmente joga. O `/api/health` continua existindo para o Render e para
checagens manuais (ele consulta o banco e devolve `503` se o banco cair).

#### Alternativas

- **cron-job.org** (grátis) permite escolher as horas do dia (ex.: 8h–22h), o que
  economiza horas do Render. Mesma configuração, URL `/api/ping`.
- **Sem monitor:** o custo é só esperar ~1 min no primeiro acesso após 15 min de
  inatividade — aceitável para um projeto de aula.
- **Pausar o monitor** (botão ⏸ no UptimeRobot) quando não estiver usando: o
  comportamento volta ao normal e a espera reaparece.

> Não use `/robots.txt` para o ping: quando o serviço está dormindo, o Render
> responde esse caminho sozinho, sem acordar a aplicação. O endpoint certo é o
> `/api/ping`.

---

## 15. Fora de escopo (por enquanto)

- Editor de fases in-game (fica para depois do M5).
- Ecos que empurram caixotes (variante "Ressonância", se o jogo pedir).
- Modo speedrun com leaderboard online.
- Tradução automática, narração, conquistas.

---

*Documento vivo. Toda mudança de regra deve atualizar a seção 3 e a tabela de invariantes antes de virar código.*
