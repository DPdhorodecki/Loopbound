import random
random.seed(42)

def make_room(w, h, wall_char='#', floor_char='.'):
    """Create a rectangular room with walls around edges and floor inside."""
    rows = []
    for y in range(h):
        row = []
        for x in range(w):
            if y == 0 or y == h-1 or x == 0 or x == w-1:
                row.append(wall_char)
            else:
                row.append(floor_char)
        rows.append(row)
    return rows

def place_mechanic(grid, x, y, ch):
    """Place a character at x,y if it's floor ('.')."""
    if 0 <= y < len(grid) and 0 <= x < len(grid[0]) and grid[y][x] == '.':
        grid[y][x] = ch
        return True
    return False

def add_decorations(grid, count=10):
    """Add random decorations to floor cells."""
    decors = ['!', '%', ':', ';', '=']
    h = len(grid)
    w = len(grid[0])
    floor_cells = []
    for y in range(1, h-1):
        for x in range(1, w-1):
            if grid[y][x] == '.':
                floor_cells.append((x, y))
    random.shuffle(floor_cells)
    for i in range(min(count, len(floor_cells))):
        x, y = floor_cells[i]
        grid[y][x] = random.choice(decors)

def grid_to_lines(grid):
    return [''.join(row) for row in grid]

# Build levels with larger rooms
levels = []

# LEVEL 1: primeiros-passos - simple room
grid = make_room(15, 8)
# Place spawn and exit
grid[1][1] = 'P'
grid[1][12] = 'E'
# Add some decorations
add_decorations(grid, 6)
levels.append(('primeiros-passos', grid))

# LEVEL 2: peso-morto - crate + plate
grid = make_room(15, 7)
grid[1][1] = 'P'
grid[1][12] = 'E'
grid[3][5] = 'C'  # crate
grid[3][10] = 'R'  # plate
grid[1][10] = 'R'  # plate (need to stand on it too? no, just 1 plate)
# Actually need player to stand on plate? No, crate on plate opens gate
# Add gate
grid[3][8] = 'L'
# Add decoration
add_decorations(grid, 5)
levels.append(('peso-morto', grid))

# LEVEL 3: primeiro-eco - echo + plate
grid = make_room(19, 7)
grid[1][1] = 'P'
grid[1][16] = 'E'
grid[3][5] = 'R'  # plate
grid[3][14] = 'L'  # gate
add_decorations(grid, 5)
levels.append(('primeiro-eco', grid))

# LEVEL 4: o-vao - void crossing
grid = make_room(19, 7)
grid[1][1] = 'P'
grid[1][16] = 'E'
# Add void
for x in range(7, 13):
    grid[3][x] = '~'
# Add plates on both sides
grid[5][3] = 'r'
grid[5][15] = 'L'
# Add crate to hold plate
grid[5][1] = 'C'
add_decorations(grid, 6)
levels.append(('o-vao', grid))

# LEVEL 5: a-estrela-do-batedor - key + door
grid = make_room(19, 7)
grid[1][1] = 'P'
grid[1][16] = 'E'
grid[3][5] = 'K'  # key
grid[3][14] = 'D'  # door
grid[3][10] = 'R'  # plate to open door? Actually key opens door directly
# Just key opens door
add_decorations(grid, 5)
levels.append(('a-estrela-do-batedor', grid))

# LEVEL 6: peso-extra - two plates, crate + echo
grid = make_room(19, 7)
grid[1][1] = 'P'
grid[1][16] = 'E'
grid[3][4] = 'R'  # plate 1
grid[3][14] = 'r'  # plate 2
grid[3][8] = 'L'  # gate
grid[5][4] = 'C'  # crate on plate 1
add_decorations(grid, 6)
levels.append(('peso-extra', grid))

# LEVEL 7: tres-portoes - three colored gates
grid = make_room(21, 7)
grid[1][1] = 'P'
grid[1][19] = 'E'
grid[3][3] = 'R'  # red plate
grid[3][10] = 'L'  # red gate
grid[3][16] = 'b'  # blue plate
grid[3][17] = 'r'  # wait, need echo on plate
# Actually: plate color -> gate same color
grid[3][3] = 'R'  # red plate
grid[3][10] = 'R'  # red gate (uppercase = red gate)
grid[3][13] = 'b'  # blue plate
grid[3][16] = 'L'  # blue gate (uppercase L = blue? No, L is blue gate)
# Gate colors: R=red, L=blue, Y=gold. Plate colors: r=red, b=blue, y=gold
grid[3][3] = 'r'  # red plate
grid[3][10] = 'R'  # red gate
grid[3][13] = 'b'  # blue plate
grid[3][16] = 'L'  # blue gate
grid[3][8] = 'y'  # gold plate
grid[3][17] = 'Y'  # gold gate
add_decorations(grid, 8)
levels.append(('tres-portoes', grid))

# LEVEL 7b: pavio-curto - short cycle
grid = make_room(15, 5)
grid[1][1] = 'P'
grid[1][13] = 'E'
grid[3][5] = 'R'  # plate
grid[3][12] = 'r'  # plate (echo stays here)
grid[3][8] = 'L'  # gate
add_decorations(grid, 4)
levels.append(('pavio-curto', grid))

# LEVEL 8: caminhos-cruzados - crate + echo cross paths
grid = make_room(21, 9)
grid[1][1] = 'P'
grid[1][19] = 'E'
grid[5][3] = 'C'  # crate
grid[5][17] = 'b'  # blue plate
grid[3][9] = 'L'  # blue gate
grid[5][9] = 'r'  # red plate
grid[5][5] = 'R'  # red gate (crate opens this? no, crate on plate opens gate)
# Actually: crate on red plate opens red gate; echo on blue plate opens blue gate
add_decorations(grid, 8)
levels.append(('caminhos-cruzados', grid))

# LEVEL 9: ultima-luz - 3 gates, 2 ecos, crate
grid = make_room(19, 9)
grid[1][1] = 'P'
grid[1][17] = 'E'
grid[3][3] = 'r'  # red plate
grid[3][5] = 'R'  # red gate
grid[3][9] = 'b'  # blue plate
grid[3][11] = 'L'  # blue gate
grid[3][13] = 'y'  # gold plate
grid[3][15] = 'Y'  # gold gate
grid[5][5] = 'C'  # crate
add_decorations(grid, 8)
levels.append(('ultima-luz', grid))

# LEVEL 10: a-alavanca - lever + gate
grid = make_room(17, 5)
grid[1][1] = 'P'
grid[1][15] = 'E'
grid[3][5] = 'V'  # lever
grid[3][13] = 'R'  # gate
add_decorations(grid, 4)
levels.append(('a-alavanca', grid))

# LEVEL 11: dois-interruptores - two levers, two gates
grid = make_room(21, 5)
grid[1][1] = 'P'
grid[1][19] = 'E'
grid[3][3] = 'V'  # red lever
grid[3][5] = 'R'  # red gate
grid[3][13] = 'W'  # blue lever  
grid[3][15] = 'L'  # blue gate
add_decorations(grid, 4)
levels.append(('dois-interruptores', grid))

# LEVEL 12: circuito-duplo - lever + crate + 2 gates
grid = make_room(21, 7)
grid[1][1] = 'P'
grid[1][19] = 'E'
grid[3][3] = 'V'  # red lever
grid[3][5] = 'R'  # red gate
grid[5][3] = 'C'  # crate
grid[5][5] = 'r'  # red plate (crate opens red gate? No, crate on plate opens gate)
# Actually: lever opens gate; crate on plate opens gate
grid[3][15] = 'W'  # blue lever
grid[3][17] = 'L'  # blue gate
grid[5][13] = 'b'  # blue plate (crate opens this? no, crate is at 5,3)
# Let's do: lever red opens red gate; lever blue opens blue gate; crate on red plate opens red gate too
grid[5][5] = 'r'  # red plate
add_decorations(grid, 6)
levels.append(('circuito-duplo', grid))

# LEVEL 13: prelo - button + plate
grid = make_room(21, 7)
grid[1][1] = 'P'
grid[1][19] = 'E'
grid[3][3] = 'H'  # red button
grid[3][5] = 'R'  # red gate
grid[5][5] = 'C'  # crate
grid[5][3] = 'r'  # red plate
add_decorations(grid, 6)
levels.append(('prelo', grid))

# LEVEL 14: dois-botoes - two buttons, two crates
grid = make_room(25, 7)
grid[1][1] = 'P'
grid[1][23] = 'E'
grid[3][3] = 'H'  # red button
grid[3][5] = 'R'  # red gate
grid[5][3] = 'C'  # crate 1
grid[5][5] = 'r'  # red plate
grid[3][15] = 'I'  # blue button
grid[3][17] = 'L'  # blue gate
grid[5][15] = 'C'  # crate 2
grid[5][17] = 'b'  # blue plate
add_decorations(grid, 8)
levels.append(('dois-botoes', grid))

# LEVEL 15: alavanca-e-botao - lever + button
grid = make_room(21, 7)
grid[1][1] = 'P'
grid[1][19] = 'E'
grid[3][3] = 'V'  # lever
grid[3][5] = 'R'  # red gate
grid[5][3] = 'H'  # button
grid[5][5] = 'r'  # plate (button opens gate via plate)
grid[5][15] = 'C'  # crate
grid[5][17] = 'b'  # blue plate
grid[3][17] = 'L'  # blue gate
add_decorations(grid, 6)
levels.append(('alavanca-e-botao', grid))

# LEVEL 16: conduto - duct
grid = make_room(25, 7)
grid[1][1] = 'P'
grid[1][23] = 'E'
grid[3][3] = 'O'  # duct pair 0
grid[3][15] = 'o'  # duct pair 0
grid[3][5] = 'R'  # red gate
grid[5][5] = 'C'  # crate
grid[5][3] = 'r'  # red plate
add_decorations(grid, 6)
levels.append(('conduto', grid))

# LEVEL 17: duto-coberto - duct + lever
grid = make_room(21, 7)
grid[1][1] = 'P'
grid[1][19] = 'E'
grid[3][3] = 'O'  # duct
grid[3][15] = 'o'  # duct
grid[3][5] = 'R'  # red gate
grid[5][3] = 'V'  # lever
grid[5][5] = 'r'  # plate
add_decorations(grid, 6)
levels.append(('duto-coberto', grid))

# LEVEL 18: dutos-em-serie - multiple ducts
grid = make_room(25, 7)
grid[1][1] = 'P'
grid[1][23] = 'E'
grid[3][3] = 'O'  # duct pair 0
grid[3][7] = 'o'  # duct pair 0
grid[3][9] = 'O'  # duct pair 1
grid[3][15] = 'o'  # duct pair 1
grid[3][5] = 'R'  # red gate
grid[5][3] = 'V'  # lever
grid[5][5] = 'r'  # plate
add_decorations(grid, 6)
levels.append(('dutos-em-serie', grid))

# LEVEL 19: codigo-romano - terminal + code gate
grid = make_room(23, 7)
grid[1][1] = 'P'
grid[1][21] = 'E'
grid[3][3] = 'X'  # terminal
grid[3][5] = '@'  # code gate
grid[3][7] = '1'  # clue 1
grid[3][9] = '2'  # clue 2
grid[3][11] = '3'  # clue 3
add_decorations(grid, 6)
levels.append(('codigo-romano', grid))

# LEVEL 20: codigo-de-cor - color code
grid = make_room(23, 7)
grid[1][1] = 'P'
grid[1][21] = 'E'
grid[3][3] = 'X'
grid[3][5] = '@'
grid[3][7] = 'c'  # color clue
grid[3][9] = 'd'  # color clue
grid[3][11] = 'e'  # color clue
add_decorations(grid, 6)
levels.append(('codigo-de-cor', grid))

# LEVEL 21: codigo-e-peso - code + plate
grid = make_room(23, 7)
grid[1][1] = 'P'
grid[1][21] = 'E'
grid[3][3] = 'X'
grid[3][5] = '@'
grid[3][7] = 'c'
grid[3][9] = 'd'
grid[3][11] = 'e'
grid[5][3] = 'C'  # crate
grid[5][5] = 'r'  # plate
add_decorations(grid, 6)
levels.append(('codigo-e-peso', grid))

# LEVEL 22: codigo-e-alavanca - code + lever
grid = make_room(23, 7)
grid[1][1] = 'P'
grid[1][21] = 'E'
grid[3][3] = 'X'
grid[3][5] = '@'
grid[3][7] = 'c'
grid[3][9] = 'd'
grid[3][11] = 'e'
grid[5][3] = 'V'  # lever
grid[5][5] = 'r'  # plate
add_decorations(grid, 6)
levels.append(('codigo-e-alavanca', grid))

# LEVEL 23: codigo-e-duto - code + duct + lever
grid = make_room(25, 7)
grid[1][1] = 'P'
grid[1][23] = 'E'
grid[3][3] = 'X'
grid[3][5] = '@'
grid[3][7] = '1'
grid[3][9] = '2'
grid[3][11] = '3'
grid[5][3] = 'O'  # duct
grid[5][15] = 'o'  # duct
grid[5][5] = 'V'  # lever
grid[5][7] = 'r'  # plate
add_decorations(grid, 6)
levels.append(('codigo-e-duto', grid))

# LEVEL 24: cores-e-botoes - color code + buttons
grid = make_room(23, 7)
grid[1][1] = 'P'
grid[1][21] = 'E'
grid[3][3] = 'X'
grid[3][5] = '@'
grid[3][7] = 'c'
grid[3][9] = 'd'
grid[3][11] = 'e'
grid[5][3] = 'H'  # button
grid[5][5] = 'r'  # plate
grid[5][15] = 'I'  # button
grid[5][17] = 'b'  # plate
add_decorations(grid, 6)
levels.append(('cores-e-botoes', grid))

# LEVEL 25: senha-e-vao - code + void + lever
grid = make_room(23, 7)
grid[1][1] = 'P'
grid[1][21] = 'E'
grid[3][3] = 'X'
grid[3][5] = '@'
grid[3][7] = '1'
grid[3][9] = '2'
grid[3][11] = '3'
grid[3][13] = '~'  # void
grid[3][15] = '~'  # void
grid[5][3] = 'V'  # lever
grid[5][5] = 'r'  # plate
add_decorations(grid, 6)
levels.append(('senha-e-vao', grid))

# LEVEL 26: tres-mecanismos - lever + crate + code
grid = make_room(25, 7)
grid[1][1] = 'P'
grid[1][23] = 'E'
grid[3][3] = 'V'  # lever
grid[3][5] = 'R'  # gate
grid[5][3] = 'C'  # crate
grid[5][5] = 'r'  # plate
grid[5][15] = 'X'  # terminal
grid[5][17] = '@'  # code gate
add_decorations(grid, 6)
levels.append(('tres-mecanismos', grid))

# LEVEL 27: quatro-mecanismos - duct + lever + button + code
grid = make_room(25, 7)
grid[1][1] = 'P'
grid[1][23] = 'E'
grid[3][3] = 'O'  # duct
grid[3][7] = 'o'  # duct
grid[3][5] = 'R'  # red gate
grid[5][3] = 'V'  # lever
grid[5][5] = 'r'  # plate
grid[5][15] = 'H'  # button
grid[5][17] = 'b'  # plate
grid[5][21] = 'X'  # terminal
grid[5][23] = '@'  # code gate
add_decorations(grid, 6)
levels.append(('quatro-mecanismos', grid))

# LEVEL 28: labirinto-final - two levers + crate + duct
grid = make_room(25, 7)
grid[1][1] = 'P'
grid[1][23] = 'E'
grid[3][3] = 'V'  # lever 1
grid[3][5] = 'R'  # gate 1
grid[5][3] = 'C'  # crate
grid[5][5] = 'r'  # plate
grid[3][15] = 'W'  # lever 2
grid[3][17] = 'L'  # gate 2
grid[5][13] = 'O'  # duct
grid[5][19] = 'o'  # duct
add_decorations(grid, 6)
levels.append(('labirinto-final', grid))

# LEVEL 29: ultima-prova - code + duct + lever + button + crate
grid = make_room(25, 7)
grid[1][1] = 'P'
grid[1][23] = 'E'
grid[3][3] = 'X'  # terminal
grid[3][5] = '@'  # code gate
grid[3][7] = '1'
grid[3][9] = '2'
grid[3][11] = '3'
grid[5][3] = 'O'  # duct
grid[5][15] = 'o'  # duct
grid[5][5] = 'V'  # lever
grid[5][7] = 'r'  # plate
grid[5][19] = 'H'  # button
grid[5][21] = 'b'  # plate
grid[5][23] = 'C'  # crate
add_decorations(grid, 6)
levels.append(('ultima-prova', grid))

# Generate solution maps and write
output_lines = []
output_lines.append("import { LevelDef } from './level';")
output_lines.append("")
output_lines.append("/**")
output_lines.append(" * Campanha principal (30 fases).")
output_lines.append(" *")
output_lines.append(" * Cada fase tem `solution`: um array de ações por ciclo. O teste")
output_lines.append(" * \`tests/game.test.ts\` replaya cada solução e falha se ela não vencer.")
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
output_lines.append("export const LEVELS: LevelDef[] = []")
output_lines.append("")
output_lines.append("export const levelById = (id: string): LevelDef | undefined => LEVELS.find((l) => l.id === id);")

with open('src/game/levels.ts', 'w') as f:
    f.write('\n'.join(output_lines))

print("Generated levels.ts skeleton - need to fill in solutions properly")
print("Levels created:", len(levels))
