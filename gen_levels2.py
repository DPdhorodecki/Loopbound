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

LEVELS=[]

def add_level(idx, name, sub, cl, me, pc, ps, w, h, cells, sol, code=None):
    g=room(w,h)
    for cx,cy,ch in cells:
        grid[cy][cx]=ch
    decors(grid,n)
    ...

# Simpler approach: define each level inline with full map
LEVELS=[
    # id, name, subtitle, cl, me, pc, ps, map_lines, solution, code_or_None
]

L=[
 # id, name, subtitle, cl, me, pc, ps, map (list of strings), sol (list of list), code or None
 ('primeiros-passos','O Despertar','Acorde e encontre a escotilha da cela.',14,0,1,13,
  ['#P...............E#',
   '#!#################',
   '#.................#',
      '#.................#',
      '#.................#',
      '#.................#',
      '#.................#',
      '###################'],
   ['R','R','D','D','L','D','D','D','D','R','R','R','R'],None),
]

# Too complex to write all 30 this way. Let me use a simpler approach:
# Just generate the levels.ts file directly with the data I already have.
print("Script ready")