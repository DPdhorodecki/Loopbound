import random
random.seed(42)

with open('src/game/levels.ts','r') as f:
    lines = f.readlines()

result = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.strip() == 'map: [':
        # Collect map rows
        j = i + 1
        map_lines = []
        while j < len(lines):
            sl = lines[j].strip()
            if sl.startswith("'") and sl.endswith("'"):
                map_lines.append(sl[1:-1])  # strip quotes
                j += 1
            elif sl == '],':
                j += 1
                break
            else:
                j += 1
        
        if map_lines:
            h = len(map_lines); w = len(map_lines[0])
            g = [list(r) for r in map_lines]
            cells = [(x,y) for y in range(1,h-1) for x in range(1,w-1) if g[y][x]=='.']
            random.shuffle(cells)
            for x,y in cells[:8]:
                g[y][x] = random.choice(['!','%',';','='])
            new_map = [f"      '{''.join(r)}'," for r in g]
            result.extend(lines[:i+1])
            result.extend([l + '\n' for l in new_map])
            i = j
        else:
            result.append(line)
            i += 1
    else:
        result.append(line)
        i += 1

with open('src/game/levels.ts','w') as f:
    f.writelines(result)
print('Done!')