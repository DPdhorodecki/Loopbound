import random
random.seed(42)

with open('src/game/levels.ts','r') as f:
    lines = f.readlines()

result = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.strip() == 'map: [':
        map_lines = []
        j = i + 1
        while j < len(lines) and not lines[j].strip().startswith(']'):
            sl = lines[j].strip()
            if sl.startswith("'") and sl.endswith("',"):
                map_lines.append(sl[:-1])
            elif sl.startswith("'") and sl.endswith("'"):
                map_lines.append(sl)
            j += 1
        
        rows = [l[1:-1] for l in map_lines]
        h = len(rows); w = len(rows[0])
        g = [list(r) for r in rows]
        cells = [(x,y) for y in range(1,h-1) for x in range(1,w-1) if g[y][x]=='.']
        random.shuffle(cells)
        for x,y in cells[:6]:
            g[y][x] = random.choice(['!','%',';','='])
        
        new_lines = ['      '+"'"+''.join(r)+"'," for r in g]
        result.extend(lines[:i+1])
        result.extend([l + '\n' for l in new_lines])
        result.append(lines[j])  # Add the closing ], line
        i = j + 1
    else:
        result.append(line)
        i += 1

with open('src/game/levels.ts','w') as f:
    f.writelines(result)
print('Done')