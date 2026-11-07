import random
random.seed(42)

def room(w,h):
    return [['#' if x==0 or x==w-1 or y==0 or y==h-1 else '.' for x in range(w)] for y in range(h)]

def decors(grid,n):
    import random as r
    h=len(grid); w=len(grid[0])
    cells=[(x,y) for y in range(1,h-1) for x in range(1,w-1) if grid[y][x]=='.']
    r.shuffle(cells)
    for x,y in cells[:n]:
        grid[y][x]=random.choice(['!','%',';','='])

# LEVELS: (id, name, subtitle, cycleLength, maxEchoes, par_cycles, par_steps, map_lines, solution_list, code_or_none)
LEVELS_DATA = [
    ('primeiros-passos','O Despertar','Acorde e encontre a escotilha da cela.',14,0,1,13,
     ['#P...............E#',
      '#!#################',
      '#.................#',
      '###################'],['R','R','D','D','L','D','D','D','D','R','R','R','R']),
    ('peso-morto','Peso Morto','O contêiner segura a placa. Você, não.',22,0,1,21,
     ['#P...............E#',
      '#!#################',
      '#..C..r..r........#',
      '###################'],['D','R','R','D','D','L','D','R','U','U','R','R','R','R','R','R','R','U','U','R']),
    ('primeiro-eco','Primeiro Eco','O campo de loop se lembra de você.',18,1,2,19,
     ['#P##########...E####',
      '#..............#....',
      '#..........r.....#..',
      '####################'],['D','D','D','R','D','D','R','R','R','R','R','R','R','U','U']),
    ('o-vao','O Vão','Duas placas, dois ecos e o abismo.',18,2,3,25,
     ['#P..............E#',
      '#~.~~~.........~.~~~#',
      '#..r...........L....',
      '####################'],['D','D','R','R','D','D','D','D','R','R','R','R','R','R','R','R','R','R','R','R']),
    ('a-estrela-do-batedor','Cartão de Acesso','O cartão abre a porta. O eco, o resto.',16,2,2,19,
     ['#P.....K.......D....#',
      '#..............#.....',
      '#...................#',
      '#####################'],['D','D','D','D','R','R','D','D','L','D','D','R','R','R','R','R','R','R']),
    ('peso-extra','Peso Extra','O contêiner segura uma placa; o eco, a outra.',22,1,2,26,
     ['#P.......C.......E#',
      '#.......#.......#...',
      '#....r.....r.....#..',
      '#.......#.......#...',
      '#.................#..',
      '####################'],['D','D','D','D','R','R','R','R','D','D','D','L','D','R','U','U','R','R','R','R','R','R','R','R','R','R']),
    ('tres-portoes','Três Barreiras','Um eco para cada cor. Você só passa.',22,3,4,34,
     ['#P.................E#',
      '#..r.........b.......',
      '#..........y.........',
      '#........R........L..',
      '#...........Y........',
      '#####################'],['D','R','R','D','D','D','D','R','R','D','D','D','D','D','R','R','R','R','R','R','R','R','R','R']),
    ('pavio-curto','Pavio Curto','Ciclo curto, eco certeiro.',8,1,2,11,
     ['#P............E#',
      '#.............#',
      '#....r.........#',
      '###############'],['R','D','D','D','R','R','R','R','R','R','R','R','R']),
    ('caminhos-cruzados','Caminhos Cruzados','O contêiner e o eco abrem lados opostos.',24,1,2,36,
     ['#P........................E#',
      '#..........................#',
      '#..C.............b..........',
      '#....r............L........',
      '#.......#.......#..........',
      '#.......#.......#..........',
      '#.................#........',
      '###########################'],['D','R','R','R','R','R','R','R','R','R','R','R','R','R','U','R','R','R','R','R','R','R','R','D','R','R','R','R','R','R','U','U','U','U','U','U']),
    ('ultima-luz','Última Luz','Três portões, dois ecos e um contêiner.',26,2,3,38,
     ['#P.............E........#',
      '#.........................#',
      '#....r.........b..........',
      '#.........................#',
      '#........y.........Y......',
      '#.........................#',
      '#.......C..................',
      '###########################'],['R','R','R','R','R','R','R','R','R','U','R','R','D','R','R','R','R','R','R','R','R','R','U','R','R','D','L','R','R','R','R','R','R','U','U','U','U','U','U','U','U']),
    ('a-alavanca','A Válvula','Aperte E para ligar a corrente.',14,0,1,13,
     ['#P...........E........#',
      '#......................#',
      '#............V..........',
      '########################'],['R','R','R','E','R','R','R','R','R','R','R','R','R']),
    ('dois-interruptores','Dois Circuitos','Duas alavancas, dois portões.',16,0,1,15,
     ['#P.....V........W.......E#',
      '#.........................#',
      '#..........R....L..........',
      '###########################'],['R','R','E','R','R','R','R','R','E','R','R','R','R','R','R','R','R']),
    ('circuito-duplo','Circuito Duplo','A alavanca abre um portão; o contêiner, o outro.',31,0,1,30,
     ['#P.........................E#',
      '#...........................#',
      '#........C.....r............#',
      '#............#.......#.......',
      '#............#.......#.......',
      '#........V...........W......#',
      '#...........................#',
      '#############################'],['D','D','R','R','E','D','D','R','R','R','R','R','R','R','U','U','U','R','D','D','R','D','R','R','R','U','U','R','R','R','R']),
    ('prelo','Prelo','A prensa só cede com peso em cima.',24,0,1,23,
     ['#P........................E#',
      '#..........................#',
      '#....C.............r.......#',
      '#.........................#',
      '#....H....................#',
      '###########################'],['D','R','R','D','D','R','D','R','R','R','R','R','R','U','U','R','R','R','R','R','R','R','R']),
    ('dois-botoes','Dois Botões','Um contêiner para cada circuito.',40,0,1,39,
     ['#P.......................E#',
      '#...........................#',
      '#..C.......r...............#',
      '#.......H.........I........#',
      '#..............C..........#',
      '#.............r.............',
      '#.........................#',
      '###########################'],['D','R','R','R','U','R','D','R','D','D','D','R','R','R','R','U','U','U','U','R','R','D','L','D','R','R','D','D','R','R','R','U','U','U','R','R','R','R','R','R','R','R','R']),
    ('alavanca-e-botao','Válvula e Prensa','Ligue a alavanca e pressione o botão.',31,0,1,30,
     ['#P.....V.............E#',
      '#.........................#',
      '#....H.............r......#',
      '#..........................#',
      '#..........C..............#',
      '#.........................#',
      '#...............b.........#',
      '###########################'],['D','D','R','R','E','D','D','R','R','R','R','R','R','R','U','R','R','R','U','L','D','D','R','R','R','U','U','R','R','R','R']),
    ('conduto','Conduto','O duto atravessa a parede da fábrica.',20,0,1,19,
     ['#P.......#.....#...........#',
      '#...........................#',
      '#........O........o........#',
      '#...........................#',
      '#........V...........R.....#',
      '#.......C.......r..........#',
      '#...........................#',
      '#############################'],['D','R','R','D','E','D','R','R','R','R','U','U','U','R','R','R','R','R','R']),
    ('duto-coberto','Duto Coberto','A rota até a válvula é o desafio.',24,0,1,23,
     ['#P........................E#',
      '#...........................#',
      '#........O.................#',
      '#...........................#',
      '#...............o...........#',
      '#....V...........r..........#',
      '#...........................#',
      '#############################'],['D','D','D','D','R','R','E','R','R','R','U','U','R','R','R','R','R','R','R','R','R']),
    ('dutos-em-serie','Dutos em Série','Um duto leva ao outro até a válvula.',20,0,1,19,
     ['#P........................E#',
      '#...........................#',
      '#........O........o........#',
      '#...........................#',
      '#...............o...........#',
      '#....V...........r..........#',
      '#...........................#',
      '#############################'],['D','R','D','E','D','D','R','R','R','R','U','U','U','R','R','R','R','R','R']),
    ('codigo-romano','Arquivo Romano','Leia as pistas da instalação e digite a senha.',24,0,1,23,
     ['#P.1.2.3.............E#',
      '#........................#',
      '#..X...............@.....#',
      '#.........................#',
      '#.........................#',
      '###########################'],['D','R','D','R','E','?','?','?','C','R','E','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U'],{'type':'roman'}),
    ('codigo-de-cor','Arquivo de Cor','As cores no chão, na ordem certa.',24,0,1,23,
     ['#P.c.d.e.............E#',
      '#........................#',
      '#..X...................@.#',
      '#.........................#',
      '#.........................#',
      '###########################'],['D','R','D','R','E','?','?','?','C','R','E','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U'],{'type':'color'}),
    ('codigo-e-peso','Arquivo e Peso','A senha abre o caminho; o peso, a porta.',24,0,1,23,
     ['#P.c.c.c.............E#',
      '#........................#',
      '#..X...............@.....#',
      '#..C..r...................#',
      '#.........................#',
      '###########################'],['D','R','D','R','E','?','?','?','C','R','E','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U'],{'type':'color'}),
    ('codigo-e-alavanca','Arquivo e Válvula','Resolva a tela e ligue a alavanca para abrir o portão.',24,0,1,23,
     ['#P.c.c.c.............E#',
      '#........................#',
      '#..X...............@.....#',
      '#..V...............r.....#',
      '#.........................#',
      '###########################'],['D','R','D','R','E','?','?','?','C','D','E','R','R','R','R','R','R','R','R','R','R','R','U','U','R','R','R'],{'type':'color'}),
    ('codigo-e-duto','Arquivo e Duto','Senha, duto e alavanca até a saída.',24,0,1,23,
     ['#P.1.2.3.............E#',
      '#........................#',
      '#..X...............@.....#',
      '#..O...............o......#',
      '#....V.............r.....#',
      '#.........................#',
      '###########################'],['D','D','R','E','?','?','?','C','D','U','R','R','E','U','R','R','R','R','R','R','R','U','U','R','R','R'],{'type':'roman'}),
    ('cores-e-botoes','Consoles de Cor','A senha de cor e a prensa do hangar.',24,0,1,23,
     ['#P.c.c.c.............E#',
      '#........................#',
      '#..X...................@.#',
      '#..H..................r...#',
      '#....I...............b....#',
      '#.........................#',
      '###########################'],['D','R','D','R','E','?','?','?','C','R','E','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U'],{'type':'color'}),
    ('senha-e-vao','Senha e Vácuo','Cuidado com o vazio; a alavanca abre a saída.',24,0,1,23,
     ['#P.1.2.3................E#',
      '#.........................#',
      '#..X...............@......#',
      '#..~~~~~..................#',
      '#....V....................#',
      '###########################'],['D','D','D','R','R','E','R','R','E','?','?','?','C','R','R','R','R','R','R','R','R','R','R','R','U','U','R','R','R'],{'type':'roman'}),
    ('tres-mecanismos','Protocolo de Lançamento','Alavanca, contêiner e dois portões. Nessa ordem.',36,0,1,35,
     ['#P........................E#',
      '#...........................#',
      '#........C...............#',
      '#....V....................#',
      '#...........................#',
      '#............R....L........#',
      '#...........................#',
      '###########################'],['D','D','R','R','R','R','R','R','E','D','D','R','R','R','R','U','U','U','U','R','R','D','D','D','R','D','R','R','R','U','U','U','R','R','R','R','R']),
    ('quatro-mecanismos','Quatro Sistemas','Duto, alavanca, botão e senha numa travessia.',40,0,1,31,
     ['#P.......................E#',
      '#...........................#',
      '#...........................#',
      '#........O........o........#',
      '#....V.............r.......#',
      '#....H.............b.......#',
      '#...........................#',
      '#............X.......@.....#',
      '#...........................#',
      '#...........................#',
      '#...........................#',
      '###########################'],['D','R','E','?','?','?','C','D','R','R','R','U','L','U','R','R','R','R','U','R','D','R','D','D','D','R','R','R','U','U','U','R','R','R','R','R','R']),
    ('labirinto-final','Labirinto de Lançamento','Duas alavancas, um contêiner e um duto.',32,0,1,31,
     ['#P........................E#',
      '#...........................#',
      '#........C...............#',
      '#....V....................#',
      '#...........................#',
      '#............R....L........#',
      '#...........................#',
      '#...............O....o......#',
      '#...........................#',
      '###########################'],['D','R','R','E','D','D','R','R','R','R','U','U','U','U','R','R','D','D','R','D','D','R','R','R','U','U','U','R','R','R','R','R','R']),
    ('ultima-prova','A Grande Fuga','Senha, duto, alavanca e peso. Tudo junto.',29,0,1,28,
     ['#P.1.2.3.............E#',
      '#........................#',
      '#..X...............@.....#',
      '#........O........o......#',
      '#....V.............r.....#',
      '#....H.............b.....#',
      '#...........................#',
      '#...........................#',
      '#...........................#',
      '#...........................#',
      '#...........................#',
      '#...........................#',
      '#...........................#',
      '#...........................#',
      '#...........................#',
      '###########################'],['D','R','E','?','?','?','C','D','D','U','U','R','R','R','U','R','R','D','D','D','R','D','R','R','R','U','U','U','R','R','R','R','R'],{'type':'color'})
]

out=[]
out.append("import { LevelDef } from './level';")
out.append("")
out.append("/**")
out.append(" * Campanha principal (30 fases).")
out.append(" *")
out.append(" * Cada fase tem `solution`: um array de ações por ciclo. O teste")
output_lines=[]
output_lines.append(" * `tests/game.test.ts` replaya cada solução e falha se ela não vencer.")
output_lines.append(" *")
output_lines.append(" * Nas fases com senha (tela `X` + portão de código `@`) o chão guarda as")
output_lines.append(" * pistas na ordem de leitura (um índice 1, 2, 3… aparece sobre cada pista). A")
output_lines.append(" * senha é **sorteada no início da fase** por `parseLevel` e escrita nessas")
output_lines.append(" * pistas; por isso a solução usa `?`, que pressiona sempre o próximo símbolo")
output_lines.append(" * correto — o replay funciona qualquer que seja a senha gerada.")
output_lines.append(" *")
output_lines.append(" * Decorações temáticas (piso livre, sem colisão e sem circuito):")
output_lines.append(" *  \`!\` = cela/grade alienígena")
output_lines.append(" *  \`%\` = cápsula/ninho alienígena")
output_lines.append(" *  \`:\` = console/monitor")
output_lines.append(" *  \`;\` = raiz/vine")
output_lines.append(" *  \`=\` = cápsula de estase")
output_lines.append(" */")
output_lines.append("export const LEVELS: LevelDef[] = [")

for i,(lid,name,sub,cl,me,pc,ps,map_lines,sol,code) in enumerate(LEVELS):
    code_part=f",\n    code: {{ type: '{code}' }}," if code else ","
    out.append("  {")
    out.append(f"    id: '{lid}',")
    out.append(f"    name: '{name}',")
    out.append(f"    subtitle: '{sub}',")
    out.append(f"    cycleLength: {cl},")
    out.append(f"    maxEchoes: {me},")
    out.append(f"    par: {{ cycles: {pc}, steps: {ps} }},")
    out.append("    map: [")
    for row in grid_lines:
        pass

# Generate map lines properly
for i,(lid,name,sub,cl,me,pc,ps,map_def,sol,code) in enumerate(LEVELS):
    pass

# Rebuild properly
out=[]
out.append("import { LevelDef } from './level';")
out.append("")
out.append("/**")
out.append(" * Campanha principal (30 fases).")
output_lines=[]
output_lines.append(" * Cada fase tem `solution`: um array de ações por ciclo. O teste")
output_lines.append(" * `tests/game.test.ts` replaya cada solução e falha se ela não vencer.")
output_lines.append(" *")
output_lines.append(" * Nas fases com senha (tela `X` + portão de código `@`) o chão guarda as")
output_lines.append(" * pistas na ordem de leitura (um índice 1, 2, 3… aparece sobre cada pista). A")
output_lines.append(" * senha é **sorteada no início da fase** por `parseLevel` e escrita nessas")
output_lines.append(" * pistas; por isso a solução usa `?`, que pressiona sempre o próximo símbolo")
output_lines.append(" * correto — o replay funciona qualquer que seja a senha gerada.")
output_lines.append(" *")
output_lines.append(" * Decorações temáticas (piso livre, sem colisão e sem circuito):")
output_lines.append(" *  \`!\` = cela/grade alienígena")
output_lines.append(" *  \`%\` = cápsula/ninho alienígena")
output_lines.append(" *  \`:\` = console/monitor")
output_lines.append(" *  \`;\` = raiz/vine")
output_lines.append(" *  \`=\` = cápsula de estase")
output_lines.append(" */")
output_lines.append("export const LEVELS: LevelDef[] = [")

for i,(lid,name,sub,cl,me,pc,ps,map_def,sol,code) in enumerate(LEVELS):
    code_part=f",\n    code: {{ type: '{code}' }}," if code else ","
    out.append("  {")
    out.append(f"    id: '{lid}',")
    out.append(f"    name: '{name}',")
    out.append(f"    subtitle: '{sub}',")
    out.append(f"    cycleLength: {cl},")
    out.append(f"    maxEchoes: {me},")
    out.append(f"    par: {{ cycles: {pc}, steps: {ps} }},")
    out.append("    map: [")
    for row in map_def:
        out.append(f"      '{row}',")
    out.append("    ],")
    out.append("    solution: [")
    for cyc in sol:
        out.append(f"      ['{cyc}'],")
    out.append("    ],")
    out.append(code_part)
    out.append("  },")

out.append("];")
output_lines.append("")
output_lines.append("export const levelById = (id: string): LevelDef | undefined => LEVELS.find((l) => l.id === id);")

with open('src/game/levels.ts','w') as f:
    f.write('\n'.join(out))

print("Generated levels.ts with", len(LEVELS), "levels")