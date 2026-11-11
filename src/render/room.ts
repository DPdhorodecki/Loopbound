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

/** Cela embutida na parede: nicho escuro com grades. A colisão segue parede. */
function decorateCellWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Nicho rebaixado.
  g.fill(theme.wallShadow);
  g.rect(px + 2, py + 2, 12, 12);
  g.fill('#050A0E');
  g.rect(px + 3, py + 3, 10, 10);

  // Moldura de pedra.
  g.fill(theme.wallCap);
  g.rect(px + 2, py + 2, 12, 1);
  g.rect(px + 2, py + 13, 12, 1);
  g.rect(px + 2, py + 2, 1, 12);
  g.rect(px + 13, py + 2, 1, 12);

  // Grades verticais.
  g.fill(theme.accentDim);
  for (let i = 0; i < 4; i++) g.rect(px + 4 + i * 3, py + 3, 1, 10);

  // Trava de energia no topo e brilho ocasional.
  g.fill(theme.accent);
  g.rect(px + 3, py + 3, 10, 1);
  if (r % 4 === 0) {
    g.rect(px + 4 + (r % 6), py + 11, 1, 1);
  }
}

/** Cabine de guarda alienígena: janela 2×2 embutida no paredão. */
function decorateGuardCabin(g: p5.Graphics, theme: SectorTheme, x: number, y: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Moldura externa.
  g.fill(theme.wallShadow);
  g.rect(px, py, 32, 32);
  g.fill(theme.wallCap);
  g.rect(px + 1, py + 1, 30, 30);
  g.fill('#0B1218');
  g.rect(px + 2, py + 2, 28, 28);

  // Visor de vidro.
  g.fill('#10242C');
  g.rect(px + 4, py + 5, 24, 16);
  g.fill(theme.accentDim);
  g.rect(px + 4, py + 5, 24, 1);
  g.rect(px + 4, py + 20, 24, 1);

  // Silhueta alienígena atrás do vidro.
  g.fill('#24544A');
  g.rect(px + 9, py + 16, 14, 7);
  g.fill('#3A8C72');
  g.rect(px + 12, py + 8, 8, 10);
  g.rect(px + 11, py + 10, 10, 7);
  g.rect(px + 11, py + 6, 1, 2);
  g.rect(px + 20, py + 6, 1, 2);
  g.fill('#050A0E');
  g.rect(px + 13, py + 11, 2, 2);
  g.rect(px + 17, py + 11, 2, 2);
  g.fill('#8CFFE0');
  g.rect(px + 13, py + 11, 1, 1);
  g.rect(px + 17, py + 11, 1, 1);

  // Luz de alerta.
  g.fill('#3A1518');
  g.rect(px + 13, py + 1, 6, 2);
  g.fill('#E4675C');
  g.rect(px + 15, py + 1, 2, 2);
  g.fill(255, 140, 140, 90);
  g.rect(px + 12, py, 8, 1);

  // Console de guarda.
  g.fill(theme.wallCap);
  g.rect(px + 3, py + 23, 26, 6);
  g.fill('#0A0F16');
  g.rect(px + 4, py + 24, 24, 4);
  g.fill(theme.accent);
  g.rect(px + 6, py + 25, 4, 2);
  g.fill('#4FE0B0');
  g.rect(px + 12, py + 25, 2, 2);
  g.fill('#E4675C');
  g.rect(px + 16, py + 25, 2, 2);
  g.fill(theme.wallCapHi);
  g.rect(px + 22, py + 25, 4, 1);
}

/** Bancada de laboratório: frascos, pipetas e bancada sobre um nicho escuro. */
function decorateLabWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Nicho rebaixado.
  g.fill(theme.wallShadow);
  g.rect(px + 2, py + 2, 12, 12);
  g.fill('#06120F');
  g.rect(px + 3, py + 3, 10, 10);

  // Tampo da bancada.
  g.fill(theme.wallCap);
  g.rect(px + 3, py + 9, 10, 2);
  g.fill(theme.wallCapHi);
  g.rect(px + 3, py + 9, 10, 1);

  // Frascos com líquido alienígena.
  g.fill('#10332B');
  g.rect(px + 4, py + 4, 2, 5);
  g.rect(px + 7, py + 5, 2, 4);
  g.rect(px + 10, py + 3, 2, 6);
  g.fill(theme.accentDim);
  g.rect(px + 4, py + 7, 2, 2);
  g.rect(px + 7, py + 7, 2, 2);
  g.rect(px + 10, py + 7, 2, 2);
  g.fill(theme.accent);
  g.rect(px + 4, py + 8, 2, 1);
  if (r % 2 === 0) g.rect(px + 7, py + 8, 2, 1);
  g.rect(px + 10, py + 8, 2, 1);

  // Rack de pipetas no alto do nicho.
  g.fill(theme.wallCapHi);
  g.rect(px + 3, py + 3, 10, 1);

  // LED de status.
  if (r % 3 === 0) {
    g.fill(theme.accent);
    g.rect(px + 12, py + 10, 1, 1);
  }
}

/** Tanque de espécime: cilindro de vidro com criatura flutuando. */
function decorateTankWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Nicho rebaixado.
  g.fill(theme.wallShadow);
  g.rect(px + 2, py + 2, 12, 12);
  g.fill('#06120F');
  g.rect(px + 3, py + 3, 10, 10);

  // Cilindro de vidro.
  g.fill('#0A2A23');
  g.rect(px + 4, py + 4, 8, 9);
  g.fill(theme.accentDim);
  g.rect(px + 4, py + 8, 8, 5);
  g.fill(theme.accent);
  g.rect(px + 4, py + 12, 8, 1);

  // Criatura dentro do tanque.
  g.fill('#0B241E');
  g.rect(px + 6, py + 8, 3, 3);
  g.fill(theme.accent);
  g.rect(px + 6, py + 8, 2, 2);
  g.fill('#06120F');
  g.rect(px + 6, py + 8, 1, 1);
  g.fill('#06120F');
  g.rect(px + 9, py + 10, 1, 1);

  // Bolhas subindo.
  const bubble = r % 2 === 0 ? 5 : 6;
  g.fill(theme.accent);
  g.rect(px + bubble, py + 6, 1, 1);
  g.rect(px + 9, py + 5, 1, 1);

  // Aro do vidro e luz de status.
  g.fill(theme.wallCapHi);
  g.rect(px + 3, py + 3, 10, 1);
  g.rect(px + 3, py + 13, 10, 1);
  if (r % 3 !== 0) {
    g.fill('#E4675C');
    g.rect(px + 12, py + 2, 2, 2);
  } else {
    g.fill(theme.accent);
    g.rect(px + 12, py + 2, 2, 2);
  }
}

/** Esteira de fábrica: lona com travessas e roletes nas pontas da corrida. */
function decorateBeltWall(
  g: p5.Graphics,
  theme: SectorTheme,
  x: number,
  y: number,
  r: number,
  openLeft: boolean,
  openRight: boolean,
): void {
  const px = x * TILE;
  const py = y * TILE;

  // Lona atravessando a parede inteira.
  g.fill(theme.wallShadow);
  g.rect(px, py + 4, TILE, 8);
  g.fill(theme.pipe);
  g.rect(px, py + 5, TILE, 6);

  // Travessas da esteira.
  g.fill(theme.accentDim);
  for (let i = 0; i < 5; i++) g.rect(px + 1 + i * 3, py + 5, 1, 6);

  // Bordas.
  g.fill(theme.wallCapHi);
  g.rect(px, py + 4, TILE, 1);
  g.rect(px, py + 11, TILE, 1);

  // Roletes nas pontas da corrida.
  if (openLeft) {
    g.fill(theme.accent);
    g.rect(px, py + 6, 2, 4);
  }
  if (openRight) {
    g.fill(theme.accent);
    g.rect(px + 14, py + 6, 2, 4);
  }

  // Peça correndo na esteira.
  if (r % 3 === 0) {
    g.fill(theme.accent);
    g.rect(px + 6, py + 6, 3, 3);
    g.fill(theme.wallCapHi);
    g.rect(px + 6, py + 6, 3, 1);
  }
}

/** Prensa: moldura pesada, pistão descendo e bigorna com faíscas. */
function decoratePressWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Nicho rebaixado.
  g.fill(theme.wallShadow);
  g.rect(px + 2, py + 2, 12, 12);
  g.fill('#120C07');
  g.rect(px + 3, py + 3, 10, 10);

  // Moldura da prensa.
  g.fill(theme.wallCap);
  g.rect(px + 3, py + 3, 10, 2);
  g.rect(px + 3, py + 11, 10, 2);
  g.rect(px + 3, py + 3, 2, 10);
  g.rect(px + 11, py + 3, 2, 10);

  // Pistão e bigorna.
  g.fill(theme.wallCapHi);
  g.rect(px + 7, py + 5, 2, 4);
  g.fill(theme.accent);
  g.rect(px + 6, py + 9, 4, 2);
  g.fill(theme.accentDim);
  g.rect(px + 5, py + 12, 6, 1);

  // Faíscas.
  if (r % 2 === 0) {
    g.fill(theme.accent);
    g.rect(px + 4, py + 10, 1, 1);
    g.rect(px + 11, py + 11, 1, 1);
  }
}

/** Tubulação: cano vertical com flanges e válvula. */
function decoratePipeWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Sombra do cano.
  g.fill(theme.wallShadow);
  g.rect(px + 4, py, 8, TILE);

  // Cano e brilho.
  g.fill(theme.pipe);
  g.rect(px + 6, py, 4, TILE);
  g.fill(theme.wallCapHi);
  g.rect(px + 6, py, 1, TILE);

  // Flanges.
  g.fill(theme.accentDim);
  g.rect(px + 5, py + 4, 6, 1);
  g.rect(px + 5, py + 11, 6, 1);

  // Válvula.
  if (r % 3 === 0) {
    g.fill(theme.accent);
    g.rect(px + 9, py + 7, 2, 2);
  }
}

/** Escritório: mesa com monitor, cadeira e papelada. */
function decorateDeskWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Nicho rebaixado.
  g.fill(theme.wallShadow);
  g.rect(px + 2, py + 2, 12, 12);
  g.fill('#0C0A18');
  g.rect(px + 3, py + 3, 10, 10);

  // Tampo da mesa.
  g.fill(theme.wallCap);
  g.rect(px + 2, py + 7, 12, 3);
  g.fill(theme.wallCapHi);
  g.rect(px + 2, py + 7, 12, 1);

  // Monitor.
  g.fill(theme.accentDim);
  g.rect(px + 6, py + 3, 4, 3);
  g.fill(theme.accent);
  g.rect(px + 7, py + 4, 2, 1);

  // Cadeira e papelada.
  g.fill(theme.floorLo);
  g.rect(px + 6, py + 11, 4, 1);
  if (r % 2 === 0) {
    g.fill(theme.wallCapHi);
    g.rect(px + 3, py + 8, 2, 1);
  }
}

/** Rack de servidores: colunas de arquivos com prateleiras e LEDs acesos. */
function decorateServerWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Nicho rebaixado.
  g.fill(theme.wallShadow);
  g.rect(px + 3, py + 1, 10, 14);
  g.fill('#0C0A18');
  g.rect(px + 4, py + 2, 8, 12);

  // Rack.
  g.fill(theme.wallCap);
  g.rect(px + 4, py + 2, 8, 12);
  g.fill(theme.accentDim);
  g.rect(px + 4, py + 2, 1, 12);

  // Prateleiras.
  g.fill(theme.wallShadow);
  g.rect(px + 5, py + 5, 6, 1);
  g.rect(px + 5, py + 9, 6, 1);

  // LEDs piscando.
  g.fill(theme.accent);
  g.rect(px + 5, py + 3, 1, 1);
  if (r % 2 === 0) g.rect(px + 10, py + 7, 1, 1);
  if (r % 3 === 0) g.rect(px + 10, py + 12, 1, 1);
}

/** Mesa: mesa redonda com cadeira e luz de status. */
function decorateTableWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Nicho rebaixado.
  g.fill(theme.wallShadow);
  g.rect(px + 3, py + 3, 10, 10);
  g.fill('#0C0A18');
  g.rect(px + 4, py + 4, 8, 8);

  // Mesa.
  g.fill(theme.wallCap);
  g.ellipse(px + 8, py + 8, 8, 6);
  g.fill(theme.wallCapHi);
  g.ellipse(px + 8, py + 7, 5, 3);

  // Cadeiras e luz de status.
  g.fill(theme.floorLo);
  g.rect(px + 7, py + 12, 3, 1);
  if (r % 2 === 0) {
    g.fill(theme.accent);
    g.rect(px + 8, py + 6, 1, 1);
  }
}

/** Alienígena: cabeça verde do Chuchuty espiando por trás da parede. */
function decorateAlienWall(g: p5.Graphics, theme: SectorTheme, x: number, y: number, r: number): void {
  const px = x * TILE;
  const py = y * TILE;

  // Nicho rebaixado.
  g.fill(theme.wallShadow);
  g.rect(px + 2, py + 3, 12, 11);
  g.fill('#0C0A18');
  g.rect(px + 3, py + 4, 10, 9);

  const variant = r % 3;
  if (variant === 0) {
    // Cabeca com dois olhos.
    g.fill('#2E7A5E');
    g.rect(px + 4, py + 3, 1, 3);
    g.rect(px + 11, py + 3, 1, 3);
    g.fill('#1E5C46');
    g.ellipse(px + 8, py + 10, 10, 8);
    g.fill('#2E7A5E');
    g.ellipse(px + 8, py + 9, 8, 6);
    g.fill('#06120F');
    g.rect(px + 5, py + 8, 3, 3);
    g.rect(px + 9, py + 8, 3, 3);
    g.fill('#7CFFC4');
    g.rect(px + 5, py + 8, 1, 1);
    g.rect(px + 9, py + 8, 1, 1);
  } else if (variant === 1) {
    // Um olho grande espiando a sala.
    g.fill('#1E5C46');
    g.ellipse(px + 8, py + 10, 9, 7);
    g.fill('#2E7A5E');
    g.ellipse(px + 8, py + 9, 6, 5);
    g.fill('#06120F');
    g.ellipse(px + 8, py + 9, 4, 3);
    g.fill('#7CFFC4');
    g.rect(px + 7, py + 8, 2, 2);
  } else {
    // Duas antenas e olhos flutuando no escuro.
    g.fill('#2E7A5E');
    g.rect(px + 5, py + 5, 1, 5);
    g.rect(px + 10, py + 5, 1, 5);
    g.fill('#06120F');
    g.rect(px + 4, py + 9, 3, 2);
    g.rect(px + 9, py + 9, 3, 2);
    g.fill('#7CFFC4');
    g.rect(px + 4, py + 9, 1, 1);
    g.rect(px + 9, py + 9, 1, 1);
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

/** Desenha enfeites temáticos no piso livre da sala. Never overlaps mechanics. */
function decorateRoom(
  g: p5.Graphics,
  theme: SectorTheme,
  level: Level,
  x: number,
  y: number,
  r: number,
): void {
  const px = x * TILE;
  const py = y * TILE;
  const decors = level.decor.filter((d) => d.x === x && d.y === y);
  if (decors.length === 0) return;

  for (const decor of decors) {
    if (decor.kind === 'cell') {
      // grades de cela alienígena
      g.fill(theme.wallShadow);
      g.rect(px + 4, py + 3, 2, 10);
      g.rect(px + 10, py + 3, 2, 10);
      g.fill(theme.accent);
      g.rect(px + 5, py + 4, 6, 1);
      g.rect(px + 5, py + 11, 6, 1);
    } else if (decor.kind === 'pod') {
      // cápsula/ninho alienígena
      g.fill('#141C19');
      g.ellipse(px + 8, py + 8, 8, 6);
      g.fill(theme.accentDim);
      g.rect(px + 6, py + 6, 4, 1);
    } else if (decor.kind === 'console') {
      // painel/monitor na parede do chão
      g.fill(theme.floorLo);
      g.rect(px + 2, py + 5, 12, 6);
      g.fill(theme.accent);
      g.rect(px + 3, py + 6, 2, 2);
      g.rect(px + 11, py + 6, 2, 2);
      g.fill('#141C19');
      g.rect(px + 5, py + 5, 6, 6);
    } else if (decor.kind === 'vine') {
      // raízes/vines crescendo no piso
      g.fill(theme.floorLo);
      g.rect(px + 3 + (r % 6), py + 2 + (r % 8), 2, 1);
      g.rect(px + 7 + (r % 6), py + 10 + (r % 3), 1, 3);
    } else if (decor.kind === 'capsule') {
      // cápsula de pouso/estase
      g.fill(theme.accentDim);
      g.rect(px + 5, py + 4, 6, 8);
      g.fill(theme.accent);
      g.rect(px + 6, py + 5, 4, 1);
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
        decorateRoom(g, theme, level, x, y, r);
      }
    }
  }

  // Enfeites de parede (celas/cabine/laboratório/fábrica): desenhados depois da
  // base para não serem cobertos pelos tiles vizinhos. A colisão continua
  // sendo parede.
  const belts = new Set<string>();
  for (const decor of level.wallDecor) {
    if (decor.kind === 'belt') belts.add(`${decor.x},${decor.y}`);
  }
  for (const decor of level.wallDecor) {
    if (decor.kind === 'cell') {
      decorateCellWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else if (decor.kind === 'lab') {
      decorateLabWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else if (decor.kind === 'tank') {
      decorateTankWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else if (decor.kind === 'belt') {
      decorateBeltWall(
        g,
        theme,
        decor.x,
        decor.y,
        hash(decor.x, decor.y),
        belts.has(`${decor.x - 1},${decor.y}`),
        belts.has(`${decor.x + 1},${decor.y}`),
      );
    } else if (decor.kind === 'press') {
      decoratePressWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else if (decor.kind === 'pipe') {
      decoratePipeWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else if (decor.kind === 'desk') {
      decorateDeskWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else if (decor.kind === 'server') {
      decorateServerWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else if (decor.kind === 'table') {
      decorateTableWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else if (decor.kind === 'alien') {
      decorateAlienWall(g, theme, decor.x, decor.y, hash(decor.x, decor.y));
    } else {
      decorateGuardCabin(g, theme, decor.x, decor.y);
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
