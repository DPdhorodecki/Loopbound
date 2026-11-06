import p5 from 'p5';
import { Level, tileAt } from '../game/level';
import { TILE_VOID, TILE_WALL } from '../game/types';
import { PALETTE } from './palette';
import { SectorTheme, themeFor } from './themes';

export const TILE = 16;

function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

/** Detalhes decorativos por setor. Nunca ocupam o lugar de uma mecânica. */
function decorateFloor(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  if (theme.decor === 'factory') {
    // esteira e parafusos
    if (r % 5 === 0) {
      g.fill(theme.floorLo);
      for (let i = 0; i < 4; i++) g.rect(px + 2 + i * 4, py + 3, 2, 1);
      g.rect(px + 2, py + 11, 12, 1);
    }
    if (r % 11 === 0) {
      g.fill(theme.accentDim);
      g.rect(px + 4, py + 7, 1, 1);
      g.rect(px + 11, py + 4, 1, 1);
    }
  } else if (theme.decor === 'lab') {
    // ladrilho de laboratório
    if (r % 4 === 0) {
      g.fill(theme.floorHi);
      g.rect(px + 4, py + 7, 8, 1);
      g.rect(px + 7, py + 4, 1, 7);
    }
    if (r % 19 === 0) {
      g.fill(theme.accentDim);
      g.rect(px + 6, py + 6, 4, 4);
      g.fill(theme.accent);
      g.rect(px + 7, py + 7, 2, 2);
    }
  } else if (theme.decor === 'command') {
    // cabos e circuitos
    if (r % 6 === 0) {
      g.fill(theme.floorLo);
      g.rect(px + 2, py + 5, 6, 1);
      g.rect(px + 7, py + 5, 1, 6);
      g.rect(px + 7, py + 10, 5, 1);
    }
  } else if (theme.decor === 'hangar') {
    // trilhos de lançamento
    if (r % 3 === 0) {
      g.fill(theme.floorLo);
      g.rect(px, py + 4, 16, 1);
      g.rect(px, py + 11, 16, 1);
    }
    if (r % 14 === 0) {
      g.fill(theme.accentDim);
      g.rect(px + 3, py + 7, 10, 1);
    }
  } else {
    // cela: grades discretas e manchas
    if (r % 9 === 0) {
      g.fill(theme.floorLo);
      g.rect(px + 2, py + 2, 12, 1);
    }
  }
}

function decorateWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number, openBelow: boolean): void {
  const px = x * TILE;
  const py = y * TILE;

  // Painéis iluminados em paredes que dão para o corredor.
  if (openBelow && x % 4 === 0) {
    g.fill(theme.panel);
    g.rect(px + 3, py + 4, 10, 6);
    g.fill(theme.accentDim);
    g.rect(px + 4, py + 5, 8, 4);
    g.fill(theme.accent);
    if (theme.decor === 'lab') {
      g.rect(px + 5, py + 6, 2, 2);
      g.rect(px + 9, py + 6, 2, 2);
    } else if (theme.decor === 'command') {
      g.rect(px + 5, py + 6, 6, 1);
      g.rect(px + 5, py + 8, 4, 1);
    } else {
      g.rect(px + 5, py + 7, 1, 1);
      g.rect(px + 7, py + 7, 1, 1);
      g.rect(px + 9, py + 7, 1, 1);
    }
  }

  // Tubulações verticais.
  if (openBelow && x % 7 === 2) {
    g.fill(theme.pipe);
    g.rect(px + 6, py + 2, 2, 14);
    g.fill(theme.accentDim);
    g.rect(px + 6, py + 6, 2, 1);
    g.rect(px + 6, py + 11, 2, 1);
  }

  if (r % 13 === 0) {
    g.fill(theme.accentDim);
    g.rect(px + 3, py + 9, 2, 1);
  }
  if (theme.decor === 'cells' && r % 5 === 0) {
    // grades de cela
    g.fill(theme.wallShadow);
    g.rect(px + 5, py + 2, 1, 12);
    g.rect(px + 10, py + 2, 1, 12);
  }
}

/** Faixas de perigo em volta do vazio. */
function decorateVoidEdge(g: p5.Graphics, theme: SectorTheme, level: Level, x: number, y: number): void {
  const px = x * TILE;
  const py = y * TILE;
  if (tileAt(level, x, y - 1) !== TILE_VOID) {
    for (let i = 0; i < 4; i++) {
      g.fill(i % 2 === 0 ? theme.accent : theme.wallShadow);
      g.rect(px + i * 4, py, 4, 3);
    }
  }
  if (tileAt(level, x, y + 1) !== TILE_VOID) {
    for (let i = 0; i < 4; i++) {
      g.fill(i % 2 === 0 ? theme.wallShadow : theme.accent);
      g.rect(px + i * 4, py + 13, 4, 3);
    }
  }
}

export function bakeRoom(p: p5, level: Level, sector = 1): p5.Graphics {
  const theme = themeFor(sector);
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
        g.fill(theme.wallBase);
        g.rect(px, py, TILE, TILE);
        g.fill(theme.wallBody);
        g.rect(px + 1, py + 1, TILE - 1, TILE - 1);
        const above = tileAt(level, x, y - 1);
        if (above !== TILE_WALL) {
          g.fill(theme.wallCap);
          g.rect(px + 1, py + 1, TILE - 1, 4);
          g.fill(theme.wallCapHi);
          g.rect(px + 1, py + 1, TILE - 1, 1);
          g.fill(theme.wallShadow);
          g.rect(px + 1, py + 5, TILE - 1, 1);
        }
        g.fill(theme.wallShadow);
        g.rect(px + 1, py + TILE - 3, TILE - 1, 3);
        g.rect(px, py + 1, 1, TILE - 2);
        if (r % 6 === 0) {
          g.fill(theme.wallCap);
          g.rect(px + 3 + (r % 8), py + 8, 2, 1);
        }
        decorateWall(g, theme, x, y, r, tileAt(level, x, y + 1) !== TILE_WALL);
      } else if (tile === TILE_VOID) {
        g.fill(PALETTE.void);
        g.rect(px, py, TILE, TILE);
        g.fill('#060B10');
        g.rect(px, py, TILE, 3);
        g.fill('#0C141B');
        g.rect(px, py, TILE, 1);
        decorateVoidEdge(g, theme, level, x, y);
      } else {
        g.fill(theme.floor);
        g.rect(px, py, TILE, TILE);
        g.fill(theme.floorLo);
        g.rect(px, py + TILE - 1, TILE, 1);
        g.rect(px + TILE - 1, py, 1, TILE);
        if (r % 7 === 0) {
          g.fill(theme.floorLo);
          g.rect(px + 3 + (r % 8), py + 5 + (r % 6), 2, 1);
        }
        if (r % 13 === 0) {
          g.fill(theme.floorHi);
          g.rect(px + 5 + (r % 5), py + 9 + (r % 3), 1, 1);
        }
        decorateFloor(g, theme, x, y, r);
      }
    }
  }

  // Borda clara da sala
  const w = level.w * TILE;
  const h = level.h * TILE;
  g.fill(theme.wallCapHi);
  g.rect(0, 0, w, 1);
  g.rect(0, h - 1, w, 1);
  g.rect(0, 0, 1, h);
  g.rect(w - 1, 0, 1, h);
  g.fill(theme.wallCap);
  g.rect(1, 1, w - 2, 1);
  g.rect(1, h - 2, w - 2, 1);
  g.rect(1, 1, 1, h - 2);
  g.rect(w - 2, 1, 1, h - 2);

  return g;
}
