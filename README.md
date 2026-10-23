# Loopbound

> *A sala se lembra de você. É o único jeito de sair.*

**Loopbound** é um jogo de puzzle em grade para navegador, em pixel art. Cada tentativa dura poucos passos. Quando o ciclo acaba, a sala se reorganiza — mas o seu trajeto fica para trás como um **eco**: um fantasma que repete exatamente o que você fez.

Ecos não empurram caixotes nem pegam gemas. Mas eles **têm peso**: seguram placas de pressão e mantêm portas abertas. Quase toda fase só é resolvida quando você deixa de tentar ser rápido e começa a montar uma equipe de você mesmo.

## Status

| Etapa | Estado |
|---|---|
| Design (GDD) | ✅ concluído |
| Protótipo jogável | ⏳ próximo |
| Conteúdo (10 fases) | ⏳ |
| Deploy no GitHub Pages | ⏳ |


## Como vai funcionar

- **Gênero:** puzzle em grade, visão top-down 3/4, câmera fixa.
- **Ciclo:** orçamento de 8–24 passos. Termina com `TAB`, morte ou esgotamento — e vira um eco.
- **Ecos:** até 3 por fase, reproduzindo a trilha gravada do ciclo anterior.
- **Elementos:** caixotes, blocos pesados, placas e portas coloridas, âncoras persistentes, chaves, gemas e vazio.
- **Plataforma:** navegador, teclado ou toque, 60 fps, sem downloads.

## Stack prevista

Vite + TypeScript + Canvas2D, sem engine e sem assets binários (sprites em mapas de caracteres e áudio sintetizado em WebAudio). Deploy automático no GitHub Pages.

## Estrutura do repositório

```
docs/GAME_DESIGN.md   plano completo: regras, arte, fases, arquitetura e roadmap
```

---

# Loopbound — Game Design Document

> *A sala se lembra de você. É o único jeito de sair.*

| Campo | Valor |
|---|---|
| Título | **Loopbound** |
| Gênero | Puzzle em grade / quebra-cabeça de lógica com mecânica de eco |
| Perspectiva | Top-down 3/4, câmera fixa por sala |
| Plataforma | Navegador (desktop e mobile) |
| Engine | Canvas2D + TypeScript, sem engine de terceiros |
| Arte | Pixel art 16×16, paleta restrita, sem assets binários |
| Idioma | PT-BR (com opção EN) |
| Classificação | Livre |
| Duração | 30–60 min (10 fases + clear perfeito) |

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

- Um ciclo tem `cycleLength` **passos** (movimentos válidos). O padrão é 16; fases avançadas usam 8.
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
| Porta vermelha | `R` | Bloqueia até placa vermelha | Não | — |
| Porta azul | `L` | Bloqueia até placa azul | Não | — |
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

## 6. Curva de aprendizado — 10 fases

Cada fase ensina **um** conceito e o recombina. Nenhuma delas exige mais ciclos do que `maxEchoes + 1`.

| # | Nome | Ensina | Ciclo | Ecos | Par (ciclos/passos) |
|---|---|---|---|---|---|
| 1 | Step In | Andar, ler a sala, sair | 24 | 0 | 1 / 8 |
| 2 | Weight | Empurrar caixote em placa | 24 | 0 | 1 / 12 |
| 3 | First Echo | Terminar ciclo de propósito; eco segura placa | 16 | 1 | 2 / 17 |
| 4 | Two Hands | Dois ecos, duas placas, uma porta | 16 | 2 | 3 / 30 |
| 5 | Gem Trail | Persistência de coletáveis entre ciclos | 14 | 1 | 3 / 26 |
| 6 | Key & Door | Chave persistente + eco como peso | 16 | 2 | 3 / 32 |
| 7 | The Gap | Vazio; morrer em local útil | 16 | 2 | 3 / 34 |
| 8 | Short Fuse | Ciclo de 8 passos, rota cirúrgica | 8 | 2 | 4 / 30 |
| 9 | Crossed Paths | Ecos ocupam o tile que você precisa | 16 | 3 | 4 / 40 |
| 10 | Last Light | Tudo junto | 12 | 3 | 5 / 46 |

### Exemplo de layout — fase 3 (First Echo)

```
#####################
#..P....#.....E.....#
#....r..#...........#
#.......R...........#
#.......#...........#
#.......#...........#
#####################
```

Leitura: a placa vermelha (`r`) fica no mesmo lado do spawn, mas a porta vermelha (`R`) está na parede do meio. Pisar na placa abre a porta — só que, ao sair da placa para atravessar, ela fecha de novo. A solução é de dois ciclos: no primeiro, ande 3 passos até a placa e encerre o ciclo com `TAB`; o eco fica estacionado ali. No segundo ciclo, a porta vermelha permanece aberta e você contorna até o núcleo em 14 passos. A fase tem exatamente uma solução, e a parede do meio garante que não há atalho.

### Estrutura de dados da fase

```ts
export interface Level {
  id: string;
  name: string;
  cycleLength: number;
  maxEchoes: number;
  requiresGems: number;        // 0 = saída livre
  map: string[];               // char-grid, linhas iguais
  par: { cycles: number; steps: number };
  solution: CycleSolution[];   // replay validado no CI
}

export interface CycleSolution {
  moves: Dir[];                // U D L R
  endsWith: "tab" | "death" | "win";
}
```

Validação automática: dimensões retangulares, exatamente 1 `P` e 1 `E`, elementos obrigatórios presentes, `requiresGems <= gemas no mapa`, e a solução termina em `win`.

---

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
- **Canvas2D** puro, loop fixo a 60 Hz com acumulador.
- **Vitest** para regras e validação de fases.
- **GitHub Pages** via GitHub Actions.
- Sem dependências de runtime.

### Estrutura de arquivos

```
loopbound/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ docs/GAME_DESIGN.md
├─ src/
│  ├─ main.ts                 # bootstrap, canvas, resize, loop
│  ├─ core/
│  │  ├─ loop.ts              # timestep fixo, scenes
│  │  ├─ input.ts             # buffer de 1 passo, remap
│  │  └─ storage.ts           # progresso e settings
│  ├─ game/
│  │  ├─ grid.ts              # coords, vizinhança, tiles
│  │  ├─ rules.ts             # passo canônico (seção 5)
│  │  ├─ cycle.ts             # orçamento, transições
│  │  ├─ echo.ts              # gravação e replay
│  │  ├─ snapshot.ts          # undo por passo
│  │  ├─ level.ts             # parse + validação
│  │  └─ levels/01..10.ts
│  ├─ render/
│  │  ├─ palette.ts
│  │  ├─ sprites.ts           # mapas de caracteres
│  │  ├─ atlas.ts             # bake offscreen + tints
│  │  ├─ font.ts              # bitmap 5×7
│  │  ├─ renderer.ts          # tiles, entidades, ordem de desenho
│  │  └─ effects.ts           # partículas, glow, shake
│  ├─ ui/
│  │  ├─ hud.ts
│  │  └─ screens.ts           # título, seleção, pausa, vitória
│  └─ audio/sfx.ts
└─ tests/
   ├─ rules.test.ts
   ├─ echo.test.ts
   └─ levels.test.ts          # replay das soluções
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
| Bundle JS | < 150 KB gzip |
| Requisições externas | 0 |
| Tempo de carga | < 1,5 s em 3G |

---

## 11. Testes e critérios de aceite

### Automatizados

- **Regras**: empurrar em cadeia, bloqueio por parede/vazio/porta, peso de eco em placa, coleta persistente, morte, vitória.
- **Ecos**: replay com trilha mais curta que o ciclo (estaciona na última posição até o fim do ciclo e recomeça no ciclo seguinte), sobreposição, dissolução do mais antigo.
- **Fases**: formato válido, exatamente 1 spawn e 1 saída, solução gravada vence, nenhuma fase exige mais que `maxEchoes + 1` ciclos.

### Critérios de aceite por fase

- [ ] Intenção legível sem texto.
- [ ] Solução do CI chega ao núcleo.
- [ ] Existe uma segunda solução não trivial **ou** a fase é explicitamente linear (fases 1–2).
- [ ] Par de passos documentado.
- [ ] Nenhum tile inalcançável sem mecânica ainda não ensinada.

### Critérios de aceite do produto

- [ ] 10 fases completas e vencíveis.
- [ ] 60 fps em notebook modesto e em celular médio.
- [ ] Progresso salvo em `localStorage`.
- [ ] Deploy automático no Pages a cada push em `main`.
- [ ] Nenhum recurso externo carregado.
- [ ] Navegação 100% por teclado e 100% por toque.

---

## 12. Roadmap

| Marco | Entrega | Pronto quando |
|---|---|---|
| **M0 — Design** | Este documento + README | Publicado no repositório |
| **M1 — Fundação** | Vite, loop fixo, input, paleta, tilemap | Sala estática renderizada a 60 fps |
| **M2 — Corpo** | Movimento, empurrar, placas, portas, gemas, chave | Fases 1–2 jogáveis |
| **M3 — Alma** | Ciclos, gravação e replay de ecos, undo | Fase 3 jogável |
| **M4 — Conteúdo** | Fases 4–10, HUD, menus, áudio, save | Jogo completo |
| **M5 — Polimento** | FX, acessibilidade, mobile, Pages | Link público, 60 fps, sem bugs |

Estimativa: M1 em 1 dia, M2 em 2, M3 em 2, M4 em 3, M5 em 1 — cerca de 9 dias de trabalho focado.

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
| Escopo de conteúdo crescer | Médio | 10 fases fixas; ideias novas vão para `docs/IDEAS.md` |

---

## 14. Deploy

- Branch `main` → GitHub Actions roda `npm ci && npm run build && npm test`.
- Publicação em GitHub Pages com `base: '/Loopbound/'` no `vite.config.ts`.
- URL final: `https://dpdhorodecki.github.io/Loopbound/`.
- Versão de desenvolvimento: `npm run dev` em `localhost:5173`.

---

## 15. Fora de escopo (por enquanto)

- Editor de fases in-game (fica para depois do M5).
- Ecos que empurram caixotes (variante "Ressonância", se o jogo pedir).
- Modo speedrun com leaderboard online.
- Tradução automática, narração, conquistas.

---

*Documento vivo. Toda mudança de regra deve atualizar a seção 3 e a tabela de invariantes antes de virar código.*

---

## Licença

A definir.
