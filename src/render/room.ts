import p5 from 'p5';
import { Level, tileAt } from '../game/level';
import { TILE_VOID, TILE_WALL } from '../game/types';
import { PALETTE } from './palette';

export const TILE = 16;

function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

const FLOOR_BASE = '#33453F';
const FLOOR_HI = '#3B4F47';
const FLOOR_LO = '#273630';
const WALL_BASE = '#141C19';
const WALL_BODY = '#1B2723';
const WALL_CAP = '#4E675C';
const WALL_CAP_HI = '#86A597';
const WALL_SHADOW = '#0B1210';

export function bakeRoom(p: p5, level: Level): p5.Graphics {
  const g = p.createGraphics(level.w * TILE, level.h * TILE);
  g.pixelDensity(1);
  g.noSmooth();
  g.noStroke();

  for (let y = 0; y < level.h; y++) {
    for (let x = 0; x < level.w; x++) {
      const tile = tileAt(level, x, y);
      const px = x * TILE;
      const py = y * TILE;
      const r = hash(x, y);

      if (tile === TILE_WALL) {
        g.fill(WALL_BASE);
        g.rect(px, py, TILE, TILE);
        g.fill(WALL_BODY);
        g.rect(px + 1, py + 1, TILE - 1, TILE - 1);
        // topo iluminado apenas quando não há parede acima
        const above = tileAt(level, x, y - 1);
        if (above !== TILE_WALL) {
          g.fill(WALL_CAP);
          g.rect(px + 1, py + 1, TILE - 1, 4);
          g.fill(WALL_CAP_HI);
          g.rect(px + 1, py + 1, TILE - 1, 1);
          g.fill('#2C3B35');
          g.rect(px + 1, py + 5, TILE - 1, 1);
        }
        // base sombreada
        g.fill(WALL_SHADOW);
        g.rect(px + 1, py + TILE - 3, TILE - 1, 3);
        // emenda vertical
        g.fill(WALL_SHADOW);
        g.rect(px, py + 1, 1, TILE - 2);
        if (r % 6 === 0) {
          g.fill('#33443D');
          g.rect(px + 3 + (r % 8), py + 8, 2, 1);
        }
      } else if (tile === TILE_VOID) {
        g.fill(PALETTE.void);
        g.rect(px, py, TILE, TILE);
        g.fill('#060B10');
        g.rect(px, py, TILE, 3);
        g.fill('#0C141B');
        g.rect(px, py, TILE, 1);
      } else {
        g.fill(FLOOR_BASE);
        g.rect(px, py, TILE, TILE);
        // junta discreta
        g.fill(FLOOR_LO);
        g.rect(px, py + TILE - 1, TILE, 1);
        g.rect(px + TILE - 1, py, 1, TILE);
        if (r % 7 === 0) {
          g.fill(FLOOR_LO);
          g.rect(px + 3 + (r % 8), py + 5 + (r % 6), 2, 1);
        }
        if (r % 13 === 0) {
          g.fill(FLOOR_HI);
          g.rect(px + 5 + (r % 5), py + 9 + (r % 3), 1, 1);
        }
      }
    }
  }

  // Borda clara da sala
  const w = level.w * TILE;
  const h = level.h * TILE;
  g.fill(PALETTE.stoneEdge);
  g.rect(0, 0, w, 1);
  g.rect(0, h - 1, w, 1);
  g.rect(0, 0, 1, h);
  g.rect(w - 1, 0, 1, h);
  g.fill('#5E7F74');
  g.rect(1, 1, w - 2, 1);
  g.rect(1, h - 2, w - 2, 1);
  g.rect(1, 1, 1, h - 2);
  g.rect(w - 2, 1, 1, h - 2);

  return g;
}
