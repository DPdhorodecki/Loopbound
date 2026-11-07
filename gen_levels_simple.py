import random
random.seed(42)

def room(w,h):
    return [['#' if (x==0 or x==w-1 or y==0 or y==h-1) else '.' for x in range(w)] for y in range(h)]

def decors(g,n):
    import random as r
    h=len(g); w=len(g[0])
    cells=[(x,y) for y in range(1,h-1) for x in range(1,w-1) if g[y][x]=='.']
    r.shuffle(cells)
    for x,y in cells[:n]:
        g[y][x]=random.choice(['!','%',';','='])

def to_lines(g):
    return [''.join(row) for row in g]

# Build all level data as tuples: (id, name, subtitle, cl, me, pc, ps, grid, solution, code_or_none)
levels = []

def add_level(lid, name, sub, cl, me, pc, ps, g, sol, code=None):
    levels.append((lid, name, sub, cl, me, pc, ps, g, sol, code))

# 1
g=room(21,9); g[1][1]='P'; g[1][17]='E'; decors(g,8)
add_level('primeiros-passos','O Despertar','Acorde e encontre a escotilha da cela.',14,0,1,13,g,['R','R','D','D','L','D','D','D','D','R','R','R','R'],None)

# 2
g=room(19,7); g[1][1]='P'; g[1][16]='E'; g[3][5]='C'; g[3][13]='R'; g[5][5]='r'; decors(g,6)
add_level('peso-morto','Peso Morto','O contêiner segura a placa. Você, não.',22,0,1,21,g,['D','R','R','D','D','L','D','R','U','U','R','R','R','R','R','R','R','U','U','R'],None)

# 3
g=room(21,7); g[1][1]='P'; g[1][18]='E'; g[3][5]='R'; g[3][17]='L'; decors(g,6)
add_level('primeiro-eco','Primeiro Eco','O campo de loop se lembra de você.',18,1,2,19,g,['D','D','D','R','D','D','R','R','R','R','R','R','R','U','U'],None)

# 4
g=room(23,7); g[1][1]='P'; g[1][20]='E'
for x in range(8,14): g[3][x]='~'
g[5][3]='r'; g[5][18]='L'; g[5][1]='C'; decors(g,6)
add_level('o-vao','O Vão','Duas placas, dois ecos e o abismo.',18,2,3,25,g,['D','D','R','R','D','D','D','D','R','R','R','R','R','R','R','R','R','R','R','R'],None)

# 5
g=room(21,7); g[1][1]='P'; g[1][18]='E'; g[3][5]='K'; g[3][16]='D'; decors(g,6)
add_level('a-estrela-do-batedor','Cartão de Acesso','O cartão abre a porta. O eco, o resto.',16,2,2,19,g,['D','D','D','D','R','R','D','D','L','D','D','R','R','R','R','R','R','R'],None)

# 6
g=room(21,7); g[1][1]='P'; g[1][18]='E'; g[3][4]='R'; g[3][14]='r'; g[3][8]='L'; g[5][4]='C'; decors(g,6)
add_level('peso-extra','Peso Extra','O contêiner segura uma placa; o eco, a outra.',22,1,2,26,g,['D','D','D','D','R','R','R','R','D','D','D','L','D','R','U','U','R','R','R','R','R','R','R','R','R','R'],None)

# 7
g=room(23,7); g[1][1]='P'; g[1][20]='E'; g[3][3]='r'; g[3][10]='R'; g[3][13]='b'; g[3][16]='L'; g[3][8]='y'; g[3][17]='Y'; decors(g,8)
add_level('tres-portoes','Três Barreiras','Um eco para cada cor. Você só passa.',22,3,4,34,g,['D','R','R','D','D','D','D','R','R','D','D','D','D','D','R','R','R','R','R','R','R','R','R','R'],None)

# 8
g=room(15,5); g[1][1]='P'; g[1][13]='E'; g[3][5]='R'; g[3][12]='r'; g[3][8]='L'; decors(g,4)
add_level('pavio-curto','Pavio Curto','Ciclo curto, eco certeiro.',8,1,2,11,g,['R','D','D','D','R','R','R','R','R','R','R','R','R'],None)

# 9
g=room(23,9); g[1][1]='P'; g[1][19]='E'; g[5][3]='C'; g[5][17]='b'; g[3][9]='L'; g[5][5]='r'; g[5][13]='y'; decors(g,8)
add_level('caminhos-cruzados','Caminhos Cruzados','O contêiner e o eco abrem lados opostos.',24,1,2,36,g,['D','R','R','R','R','R','R','R','R','R','R','R','R','R','U','R','R','R','R','R','R','R','R','D','R','R','R','R','R','R','U','U','U','U','U','U'],None)

# 10
g=room(21,9); g[1][1]='P'; g[1][17]='E'
g[3][3]='r'; g[3][5]='R'; g[3][9]='b'; g[3][11]='L'; g[3][13]='y'; g[3][15]='Y'; g[5][5]='C'; decors(g,8)
add_level('ultima-luz','Última Luz','Três portões, dois ecos e um contêiner.',26,2,3,38,g,['R','R','R','R','R','R','R','R','R','U','R','R','D','R','R','R','R','R','R','R','R','R','U','R','R','D','L','R','R','R','R','R','R','U','U','U','U','U','U','U','U'],None)

# 11
g=room(17,5); g[1][1]='P'; g[1][15]='E'; g[3][5]='V'; g[3][13]='R'; decors(g,4)
add_level('a-alavanca','A Válvula','Aperte E para ligar a corrente.',14,0,1,13,g,['R','R','R','E','R','R','R','R','R','R','R','R','R'],None))

# 12
g=room(23,5); g[1][1]='P'; g[1][21]='E'; g[3][3]='V'; g[3][5]='R'; g[3][13]='W'; g[3][15]='L'; decors(g,4)
add_level('dois-interruptores','Dois Circuitos','Duas alavancas, dois portões.',16,0,1,15,g,['R','R','E','R','R','R','R','R','E','R','R','R','R','R','R','R','R'],None))

# 13
g=room(23,7); g[1][1]='P'; g[1][19]='E'; g[3][3]='V'; g[3][5]='R'; g[5][3]='C'; g[5][5]='r'; g[3][15]='W'; g[3][17]='L'; g[5][13]='b'; decors(g,6)
add_level('circuito-duplo','Circuito Duplo','A alavanca abre um portão; o contêiner, o outro.',31,0,1,30,g,['D','D','R','R','E','D','D','R','R','R','R','R','R','R','U','U','U','R','D','D','R','D','R','R','R','U','U','R','R','R','R'],None))

# 14
g=room(23,7); g[1][1]='P'; g[1][21]='E'; g[3][3]='H'; g[3][5]='R'; g[5][3]='C'; g[5][5]='r'; decors(g,6)
add_level('prelo','Prelo','A prensa só cede com peso em cima.',24,0,1,23,g,['D','R','R','D','D','R','D','R','R','R','R','R','R','U','U','R','R','R','R','R','R','R','R'],None))

# 15
g=room(27,7); g[1][1]='P'; g[1][23]='E'; g[3][3]='H'; g[3][5]='R'; g[5][3]='C'; g[5][5]='r'; g[3][15]='I'; g[3][17]='L'; g[5][15]='C'; g[5][17]='b'; decors(g,8)
add_level('dois-botoes','Dois Botões','Um contêiner para cada circuito.',40,0,1,39,g,['D','R','R','R','U','R','D','R','D','D','D','R','R','R','R','U','U','U','U','R','R','D','L','D','R','R','D','D','R','R','R','U','U','U','R','R','R','R','R','R','R','R','R'],None))

# 16
g=room(23,7); g[1][1]='P'; g[1][19]='E'; g[3][3]='V'; g[3][5]='R'; g[5][3]='H'; g[5][5]='r'; g[5][15]='C'; g[5][17]='b'; g[3][17]='L'; decors(g,6)
add_level('alavanca-e-botao','Válvula e Prensa','Ligue a alavanca e pressione o botão.',31,0,1,30,g,['D','D','R','R','E','D','D','R','R','R','R','R','R','R','U','R','R','R','U','L','D','D','R','R','R','U','U','R','R','R','R'],None))

# 17
g=room(27,7); g[1][1]='P'; g[1][23]='E'; g[3][3]='O'; g[3][15]='o'; g[3][5]='R'; g[5][3]='C'; g[5][5]='r'; decors(g,6)
add_level('conduto','Conduto','O duto atravessa a parede da fábrica.',20,0,1,19,g,['D','R','R','D','E','D','R','R','R','R','U','U','U','R','R','R','R','R','R'],None))

# 18
g=room(23,7); g[1][1]='P'; g[1][19]='E'; g[3][3]='O'; g[3][15]='o'; g[3][5]='R'; g[5][3]='V'; g[5][5]='r'; decors(g,6)
add_level('duto-coberto','Duto Coberto','A rota até a válvula é o desafio.',24,0,1,23,g,['D','D','D','D','R','R','E','R','R','R','U','U','R','R','R','R','R','R','R','R','R'],None))

# 19
g=room(27,7); g[1][1]='P'; g[1][23]='E'; g[3][3]='O'; g[3][7]='o'; g[3][9]='O'; g[3][15]='o'; g[3][5]='R'; g[5][3]='V'; g[5][5]='r'; decors(g,6)
add_level('dutos-em-serie','Dutos em Série','Um duto leva ao outro até a válvula.',20,0,1,19,g,['D','R','D','E','D','D','R','R','R','R','U','U','U','R','R','R','R','R','R'],None))

# 20
g=room(25,7); g[1][1]='P'; g[1][21]='E'; g[3][3]='X'; g[3][5]='@'; g[3][7]='1'; g[3][9]='2'; g[3][11]='3'; decors(g,6)
add_level('codigo-romano','Arquivo Romano','Leia as pistas da instalação e digite a senha.',24,0,1,23,g,['D','R','D','R','E','?','?','?','C','R','E','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U'],{'type':'roman'}))

# 21
g=room(25,7); g[1][1]='P'; g[1][21]='E'; g[3][3]='X'; g[3][5]='@'; g[3][7]='c'; g[3][9]='d'; g[3][11]='e'; decors(g,6)
add_level('codigo-de-cor','Arquivo de Cor','As cores no chão, na ordem certa.',24,0,1,23,g,['D','R','D','R','E','?','?','?','C','R','E','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U'],{'type':'color'}))

# 22
g=room(25,7); g[1][1]='P'; g[1][21]='E'; g[3][3]='X'; g[3][5]='@'; g[3][7]='c'; g[3][9]='d'; g[3][11]='e'; g[5][3]='C'; g[5][5]='r'; decors(g,6)
add_level('codigo-e-peso','Arquivo e Peso','A senha abre o caminho; o peso, a porta.',24,0,1,23,g,['D','R','D','R','E','?','?','?','C','R','E','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U'],{'type':'color'}))

# 23
g=room(25,7); g[1][1]='P'; g[1][21]='E'; g[3][3]='X'; g[3][5]='@'; g[3][7]='c'; g[3][9]='d'; g[3][11]='e'; g[5][3]='V'; g[5][5]='r'; decors(g,6)
add_level('codigo-e-alavanca','Arquivo e Válvula','Resolva a tela e ligue a alavanca para abrir o portão.',24,0,1,23,g,['D','R','D','R','E','?','?','?','C','D','E','R','R','R','R','R','R','R','R','R','R','R','U','U','R','R','R'],{'type':'color'}))

# 24
g=room(25,7); g[1][1]='P'; g[1][21]='E'; g[3][3]='X'; grid[3][5]='@'; g[3][7]='1'; g[3][9]='2'; grid[3][11]='3'; grid[5][3]='O'; grid[5][15]='o'; g[5][5]='V'; g[5][7]='r'; decors(g,6)
add_level('codigo-e-duto','Arquivo e Duto','Senha, duto e alavanca até a saída.',24,0,1,23,g,['D','D','R','E','?','?','?','C','D','U','R','R','E','U','R','R','R','R','R','R','R','U','U','R','R','R'],{'type':'roman'}))

# 25
g=room(25,7); g[1][1]='P'; g[1][21]='E'; g[3][3]='X'; grid[3][5]='@'; g[3][7]='c'; g[3][9]='d'; grid[3][11]='e'; grid[5][3]='H'; g[5][5]='r'; grid[5][15]='I'; g[5][17]='b'; decors(g,6)
add_level('cores-e-botoes','Consoles de Cor','A senha de cor e a prensa do hangar.',24,0,1,23,g,['D','R','D','R','E','?','?','?','C','R','E','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U'],{'type':'color'}))

# 26
g=room(25,7); g[1][1]='P'; g[1][21]='E'; g[3][3]='X'; grid[3][5]='@'; g[3][7]='1'; g[3][9]='2'; grid[3][11]='3'; grid[3][13]='~'; grid[3][15]='~'; grid[5][3]='V'; g[5][7]='r'; decors(g,6)
add_level('senha-e-vao','Senha e Vácuo','Cuidado com o vazio; a alavanca abre a saída.',26,0,1,25,g,['D','D','D','R','R','E','R','R','E','?','?','?','C','R','R','R','R','R','R','R','R','R','R','R','U','U','R','R','R'],{'type':'roman'}))

# 27
g=room(25,7); g[1][1]='P'; g[1][23]='E'; grid[3][3]='V'; grid[3][5]='R'; grid[5][3]='C'; grid[5][5]='r'; grid[5][15]='X'; grid[5][17]='@'; decors(g,6)
add_level('tres-mecanismos','Protocolo de Lançamento','Alavanca, contêiner e dois portões. Nessa ordem.',38,0,1,37,g,['D','D','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U','U','U','R','R','D','D','D','R','D','R','R','R','U','U','U','R','R','R','R','R'],None))

# 28
g=room(25,7); g[1][1]='P'; g[1][23]='E'; grid[3][3]='O'; grid[3][7]='o'; g[3][5]='R'; grid[5][3]='V'; grid[5][5]='r'; grid[5][15]='H'; grid[5][17]='b'; grid[5][21]='X'; grid[5][23]='@'; decors(g,6)
add_level('quatro-mecanismos','Quatro Sistemas','Duto, alavanca, botão e senha numa travessia.',40,0,1,31,g,['D','R','E','?','?','?','C','D','R','R','R','U','L','U','R','R','R','R','U','R','D','R','D','D','D','R','R','R','U','U','U','R','R','R','R','R'],{'type':'color'}))

# 29
g=room(25,7); g[1][1]='P'; g[1][23]='E'; grid[3][3]='V'; grid[3][5]='R'; grid[5][3]='C'; grid[5][5]='r'; grid[3][15]='W'; grid[3][17]='L'; grid[5][13]='O'; grid[5][19]='o'; decors(g,6)
add_level('labirinto-final','Labirinto de Lançamento','Duas alavancas, um contêiner e um duto.',34,0,1,33,g,['D','R','R','E','D','D','R','R','R','R','U','U','U','U','R','R','D','D','R','D','D','R','R','R','U','U','U','R','R','R','R','R'],None))

# 30
g=room(25,7); g[1][1]='P'; g[1][23]='E'; grid[3][3]='X'; grid[3][5]='@'; grid[3][7]='1'; grid[3][9]='2'; grid[3][11]='3'; grid[5][3]='O'; grid[5][15]='o'; g[5][5]='V'; g[5][7]='r'; grid[5][19]='H'; grid[5][21]='b'; grid[5][23]='C'; decors(g,6)
add_level('ultima-prova','A Grande Fuga','Senha, duto, alavanca e peso. Tudo junto.',32,0,1,31,g,['D','R','E','?','?','?','C','D','D','U','U','R','R','R','U','R','R','D','D','D','R','D','R','R','R','U','U','U','R','R','R','R','R'],{'type':'color'}))

# Write output
out=[]
out.append("import { LevelDef } from './level';")
out.append("")
out.append("""export const LEVELS: LevelDef[] = [""")

for lid,name,sub,cl,me,pc,ps,g,sol,code in levels:
    out.append("  {")
    out.append(f"    id: '{lid}',")
    out.append(f"    name: '{name}',")
    out.append(f"    subtitle: '{sub}',")
    out.append(f"    cycleLength: {cl},")
    out.append(f"    maxEchoes: {me},")
    out.append(f"    par: {{ cycles: {pc}, steps: {ps} }},")
    out.append("    map: [")
    for row in g:
        out.append(f"      '{''.join(row)}',")
    out.append("    ],")
    out.append("    solution: [")
    for s in sol:
        out.append(f"      ['{s}'],")
    out.append("    ],")
    if code:
        out.append(f"    code: {{ type: '{code}' }},")
    out.append("  },")

out.append("];")
out.append("")
out.append("export const levelById = (id: string): LevelDef | undefined => LEVELS.find((l) => l.id === id);")

with open('src/game/levels.ts','w') as f:
    f.write('\n'.join(out))

print("Done! Generated", len(levels), "levels")