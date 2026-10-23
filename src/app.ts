import p5 from 'p5';
import { LEVELS } from './game/levels';
import { TUTORIAL_ROOMS } from './game/tutorial';
import { Level, LevelDef, parseLevel } from './game/level';
import { Runtime, createRuntime, endCycle, echoPoses, pressure, tryMove, undo } from './game/rules';
import { LevelBest, persistSave, loadSave } from './game/save';
import { Dir, Pose, Vec, cellKey } from './game/types';
import { Sfx } from './audio/sfx';
import { Atlas, buildAtlas } from './render/atlas';
import { drawText, textWidth } from './render/font';
import { CHAR_COLORS, PALETTE } from './render/palette';
import { bakeRoom } from './render/room';
import {
  COLOR_RAMP,
  drawCrate,
  drawDoor,
  drawExit,
  drawGate,
  drawGem,
  drawKey,
  drawPlate,
  drawPlayer,
  drawShadow,
} from './render/renderer';
import { HUD_ESC, HUD_TAB, HUD_UNDO, VIEW_H, VIEW_W, drawFrame, drawHud } from './ui/hud';

export type Screen = 'title' | 'play' | 'win';

export interface WinResult {
  levelId: string;
  levelName: string;
  steps: number;
  cycles: number;
  gems: number;
  totalGems: number;
  won: boolean;
}

const STEP_DUR = 90;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class App {
  readonly p: p5;
  readonly atlas: Atlas;
  readonly sfx = new Sfx();
  save = loadSave();

  /** Callbacks ligados pela casca DOM (login/menu). */
  onWin: ((result: WinResult) => void) | null = null;
  onRequestMenu: (() => void) | null = null;
  onTutorialDone: (() => void) | null = null;

  screen: Screen = 'title';
  /** Quando o menu DOM está aberto, o jogo ignora o teclado e o ponteiro. */
  menuOpen = true;
  paused = false;
  pauseIndex = 0;

  levelIndex = 0;
  titleIndex = 0;
  tutorialIndex = 0;
  inTutorial = false;
  level: Level | null = null;
  rt: Runtime | null = null;
  room: p5.Graphics | null = null;
  ox = 0;
  oy = 0;
  zoom = 2;

  time = 0;
  queue: Dir[] = [];
  stepTimer = 0;
  prevPlayer: Pose | null = null;
  prevCrates: Vec[] = [];
  pushTimer = 0;
  flash = 0;
  flashColor: string = PALETTE.cyan;
  showWinAt = 0;
  toast = '';
  hintTimer = 0;

  constructor(p: p5) {
    this.p = p;
    this.atlas = buildAtlas(p, CHAR_COLORS);
    this.sfx.muted = this.save.muted;
    this.titleIndex = Math.min(this.save.unlocked - 1, LEVELS.length - 1);
  }

  // ---------------------------------------------------------------- fluxo

  startLevel(index: number): void {
    const def = LEVELS[index];
    if (!def) return;
    this.levelIndex = index;
    this.inTutorial = false;
    this.load(def);
  }

  startTutorial(): void {
    this.inTutorial = true;
    this.tutorialIndex = 0;
    this.load(TUTORIAL_ROOMS[0].def);
  }

  private load(def: LevelDef): void {
    this.level = parseLevel(def);
    this.rt = createRuntime(this.level);
    this.room = bakeRoom(this.p, this.level);
    this.zoom = 2;
    this.ox = Math.max(64, Math.round((VIEW_W - this.level.w * 16 * this.zoom) / 2));
    this.oy = Math.round((VIEW_H - this.level.h * 16 * this.zoom) / 2);
    this.screen = 'play';
    this.menuOpen = false;
    this.paused = false;
    this.queue = [];
    this.stepTimer = 0;
    this.prevPlayer = null;
    this.prevCrates = this.rt.crates.map((c) => ({ ...c }));
    this.flash = 0;
    this.hintTimer = this.inTutorial ? 0 : 5;
    this.sfx.unlock();
    this.sfx.play('ui');
  }

  setMuted(muted: boolean): void {
    this.save.muted = muted;
    this.sfx.muted = muted;
    persistSave(this.save);
  }

  backToTitle(): void {
    this.screen = 'title';
    this.menuOpen = true;
    this.paused = false;
    this.inTutorial = false;
    this.titleIndex = Math.min(this.levelIndex, this.save.unlocked - 1);
    this.rt = null;
    this.level = null;
    this.room = null;
    this.onRequestMenu?.();
  }

  private finishLevel(): void {
    const rt = this.rt!;
    const def = rt.level.def;

    if (this.inTutorial) {
      if (this.tutorialIndex + 1 < TUTORIAL_ROOMS.length) {
        this.tutorialIndex++;
        this.load(TUTORIAL_ROOMS[this.tutorialIndex].def);
        return;
      }
      this.save.tutorialDone = true;
      persistSave(this.save);
      this.sfx.play('win');
      this.onTutorialDone?.();
      this.backToTitle();
      return;
    }

    const best: LevelBest = {
      steps: rt.stepsTotal,
      cycles: rt.cyclesUsed + 1,
      gems: rt.gems.size,
    };
    const prev = this.save.best[def.id];
    if (!prev || best.steps < prev.steps) this.save.best[def.id] = best;
    this.save.unlocked = clamp(Math.max(this.save.unlocked, this.levelIndex + 2), 1, LEVELS.length);
    persistSave(this.save);
    this.onWin?.({
      levelId: def.id,
      levelName: def.name,
      steps: rt.stepsTotal,
      cycles: rt.cyclesUsed + 1,
      gems: rt.gems.size,
      totalGems: rt.level.gems.length,
      won: true,
    });
    this.screen = 'win';
    this.sfx.play('win');
  }

  nextLevel(): void {
    if (this.levelIndex + 1 < LEVELS.length) this.startLevel(this.levelIndex + 1);
    else this.backToTitle();
  }

  // ---------------------------------------------------------------- update

  update(dt: number): void {
    const seconds = Math.min(dt, 100) / 1000;
    this.time += seconds;
    this.flash = Math.max(0, this.flash - seconds * 2.5);
    this.pushTimer = Math.max(0, this.pushTimer - seconds);
    this.stepTimer = Math.max(0, this.stepTimer - dt);
    this.hintTimer = Math.max(0, this.hintTimer - seconds);

    if (this.screen !== 'play' || this.paused || !this.rt) return;

    if (this.stepTimer <= 0 && this.queue.length > 0) {
      const dir = this.queue.shift()!;
      this.step(dir);
    }
  }

  private step(dir: Dir): void {
    const rt = this.rt!;
    this.prevPlayer = { ...rt.player };
    this.prevCrates = rt.crates.map((c) => ({ ...c }));
    const res = tryMove(rt, dir);
    this.stepTimer = STEP_DUR;

    if (!res.moved) {
      this.sfx.play('blocked');
      this.stepTimer = 40;
      return;
    }

    if (res.pushed) {
      this.sfx.play('push');
      this.pushTimer = 0.18;
    } else if (res.died) {
      this.sfx.play('death');
      this.flash = 0.5;
      this.flashColor = '#C43B31';
    } else {
      this.sfx.play('step');
    }

    if (res.gem) this.sfx.play('gem');
    if (res.key) this.sfx.play('key');
    if (res.door) this.sfx.play('door');
    if (pressure(rt).red || pressure(rt).blue || pressure(rt).gold) this.sfx.play('plate');

    if (res.cycleEnded) {
      this.sfx.play('cycle');
      this.sfx.play('echo');
      this.flash = 0.45;
      this.flashColor = PALETTE.cyan;
      this.prevPlayer = null;
      this.prevCrates = rt.crates.map((c) => ({ ...c }));
    }

    if (res.won) {
      this.finishLevel();
    }
  }

  endCycle(): void {
    const rt = this.rt;
    if (!rt || rt.status !== 'playing' || rt.beat === 0) return;
    endCycle(rt, 'tab');
    this.prevPlayer = null;
    this.prevCrates = rt.crates.map((c) => ({ ...c }));
    this.queue = [];
    this.flash = 0.45;
    this.flashColor = PALETTE.cyan;
    this.sfx.play('cycle');
    this.sfx.play('echo');
  }

  doUndo(): void {
    if (!this.rt) return;
    if (undo(this.rt)) {
      this.prevPlayer = null;
      this.prevCrates = this.rt.crates.map((c) => ({ ...c }));
      this.sfx.play('ui');
    }
  }

  restart(): void {
    if (!this.level) return;
    if (this.inTutorial) this.load(TUTORIAL_ROOMS[this.tutorialIndex].def);
    else this.startLevel(this.levelIndex);
  }

  /** Hooks de desenvolvimento: ?level=3&moves=RRD|DD */
  debugRun(levelNumber: number, script: string): void {
    this.startLevel(clamp(levelNumber - 1, 0, LEVELS.length - 1));
    const map: Record<string, Dir> = { U: 'U', D: 'D', L: 'L', R: 'R' };
    for (const token of script) {
      if (token === '|') this.endCycle();
      else if (map[token]) this.step(map[token]);
    }
    this.stepTimer = 0;
  }

  debugPause(): void {
    if (this.screen === 'play') this.paused = true;
  }

  // ---------------------------------------------------------------- input

  onKey(key: string): void {
    this.sfx.unlock();
    if (this.menuOpen) return;
    const k = key.length === 1 ? key.toLowerCase() : key;

    if (k === 'm') {
      this.save.muted = !this.save.muted;
      this.sfx.muted = this.save.muted;
      persistSave(this.save);
      this.sfx.play('ui');
      return;
    }

    if (this.screen === 'title') {
      if (k === 'ArrowLeft' || k === 'a') {
        this.titleIndex = clamp(this.titleIndex - 1, 0, this.save.unlocked - 1);
        this.sfx.play('ui');
      } else if (k === 'ArrowRight' || k === 'd') {
        this.titleIndex = clamp(this.titleIndex + 1, 0, this.save.unlocked - 1);
        this.sfx.play('ui');
      } else if (k === 'Enter' || k === ' ') {
        this.startLevel(this.titleIndex);
      }
      return;
    }

    if (this.screen === 'win') {
      if (k === 'Enter' || k === ' ' || k === 'r') this.nextLevel();
      else if (k === 'Escape') this.backToTitle();
      return;
    }

    if (this.paused) {
      const items = 4;
      if (k === 'ArrowUp' || k === 'w') {
        this.pauseIndex = (this.pauseIndex + items - 1) % items;
        this.sfx.play('ui');
      } else if (k === 'ArrowDown' || k === 's') {
        this.pauseIndex = (this.pauseIndex + 1) % items;
        this.sfx.play('ui');
      } else if (k === 'Enter' || k === ' ') {
        this.activatePause();
      } else if (k === 'Escape') {
        this.paused = false;
        this.sfx.play('ui');
      }
      return;
    }

    if (k === 'Tab') {
      this.endCycle();
      return;
    }
    if (k === 'z') {
      this.doUndo();
      return;
    }
    if (k === 'r') {
      this.restart();
      return;
    }
    if (k === 'Escape') {
      this.paused = true;
      this.pauseIndex = 0;
      this.sfx.play('ui');
      return;
    }

    const dir = this.dirFromKey(k);
    if (dir) this.enqueue(dir);
  }

  private dirFromKey(k: string): Dir | null {
    if (k === 'ArrowUp' || k === 'w') return 'U';
    if (k === 'ArrowDown' || k === 's') return 'D';
    if (k === 'ArrowLeft' || k === 'a') return 'L';
    if (k === 'ArrowRight' || k === 'd') return 'R';
    return null;
  }

  private enqueue(dir: Dir): void {
    if (this.queue.length < 3) this.queue.push(dir);
  }

  activatePause(): void {
    if (this.pauseIndex === 0) {
      this.paused = false;
    } else if (this.pauseIndex === 1) {
      this.restart();
    } else if (this.pauseIndex === 2) {
      this.save.muted = !this.save.muted;
      this.sfx.muted = this.save.muted;
      persistSave(this.save);
    } else {
      this.backToTitle();
    }
    this.sfx.play('ui');
  }

  onPointer(x: number, y: number): void {
    this.sfx.unlock();
    if (this.menuOpen) return;
    if (this.screen === 'title') {
      if (y > 228 && y < 284) {
        this.startLevel(this.titleIndex);
      } else if (y > 138 && y < 176) {
        for (let i = 0; i < LEVELS.length; i++) {
          const dx = 430 + (i - (LEVELS.length - 1) / 2) * 26;
          if (x > dx - 9 && x < dx + 9 && i < this.save.unlocked) this.titleIndex = i;
        }
      }
      return;
    }

    if (this.screen === 'win') {
      this.nextLevel();
      return;
    }

    if (this.paused) {
      const baseY = 140;
      const idx = Math.floor((y - baseY) / 26);
      if (idx >= 0 && idx < 4) {
        this.pauseIndex = idx;
        this.activatePause();
      }
      return;
    }

    if (this.inside(x, y, HUD_TAB)) {
      this.endCycle();
    } else if (this.inside(x, y, HUD_UNDO)) {
      this.doUndo();
    } else if (this.inside(x, y, HUD_ESC)) {
      this.paused = true;
      this.pauseIndex = 0;
    }
  }

  onSwipe(dir: Dir): void {
    if (this.menuOpen) return;
    if (this.screen === 'play' && !this.paused) this.enqueue(dir);
  }

  private inside(x: number, y: number, r: { x: number; y: number; w: number; h: number }): boolean {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  // ---------------------------------------------------------------- render

  draw(): void {
    const p = this.p;
    p.background(PALETTE.bgDeep);
    if (this.screen === 'title' || !this.rt) {
      this.drawTitle();
    } else {
      this.drawPlay();
      if (this.screen === 'win') this.drawWin();
      if (this.paused) this.drawPause();
    }
    if (this.toast) {
      drawText(p, this.toast, VIEW_W / 2, VIEW_H - 24, 1, PALETTE.cyan, 'center');
    }
  }

  private vignette(): void {
    const p = this.p;
    p.noStroke();
    p.fill(0, 0, 0, 90);
    p.rect(0, 0, VIEW_W, 10);
    p.rect(0, VIEW_H - 10, VIEW_W, 10);
    p.rect(0, 0, 8, VIEW_H);
    p.rect(VIEW_W - 8, 0, 8, VIEW_H);
  }

  private drawTitle(): void {
    const p = this.p;
    this.vignette();

    const cx = 128;
    p.noStroke();
    p.fill(53, 230, 242, 22);
    p.ellipse(cx, 300, 200, 54);
    p.fill(53, 230, 242, 12);
    p.ellipse(cx, 300, 280, 78);

    const bob = Math.sin(this.time * 1.6) * 2;
    p.image(this.atlas.ken.idle0, cx - 80, 64 + bob, 160, 240);

    // placa CEPK
    p.fill(8, 15, 24, 230);
    p.rect(cx - 26, 320, 52, 18);
    p.fill(PALETTE.gold);
    p.rect(cx - 26, 320, 52, 1);
    p.rect(cx - 26, 337, 52, 1);
    p.rect(cx - 26, 320, 1, 18);
    p.rect(cx + 25, 320, 1, 18);
    drawText(p, 'CEPK', cx, 325, 2, PALETTE.gold, 'center');

    drawText(p, 'LOOPBOUND', 430, 66, 6, PALETTE.cyan, 'center', '#0A3B44');
    drawText(p, 'CADA TENTATIVA DEIXA UM ECO', 430, 120, 2, '#8FB3A6', 'center');

    const def = LEVELS[this.titleIndex];
    const unlocked = this.save.unlocked;
    for (let i = 0; i < LEVELS.length; i++) {
      const dx = 430 + (i - (LEVELS.length - 1) / 2) * 26;
      const on = i === this.titleIndex;
      const locked = i >= unlocked;
      p.noStroke();
      if (on) {
        p.fill(PALETTE.cyan);
        p.rect(dx - 7, 150, 15, 15);
        p.fill(PALETTE.bgDeep);
        p.rect(dx - 3, 154, 7, 7);
      } else {
        p.fill(locked ? '#243244' : PALETTE.cyanDim);
        p.rect(dx - 4, 154, 8, 8);
      }
    }

    drawText(p, def.name.toUpperCase(), 430, 176, 2, PALETTE.white, 'center');
    drawText(p, `FASE ${this.titleIndex + 1} DE ${LEVELS.length}`, 430, 198, 1, '#5C7369', 'center');

    const blink = Math.sin(this.time * 4) > -0.4;
    if (blink) drawFrame(p, 330, 230, 200, 50, true);
    drawText(p, 'JOGAR', 430, 245, 3, blink ? PALETTE.cyan : PALETTE.cyanDim, 'center');

    drawText(p, 'WASD / SETAS  MOVER', 430, 300, 1, '#5C7369', 'center');
    drawText(p, 'TAB  ENCERRAR CICLO    Z  DESFAZER', 430, 314, 1, '#5C7369', 'center');
    drawText(p, 'R  REINICIAR    ESC  MENU    M  SOM', 430, 328, 1, '#5C7369', 'center');

    drawText(p, 'V0.1 - PROTÓTIPO', 14, VIEW_H - 16, 1, '#2F4640', 'left');
  }

  private drawPlay(): void {
    const p = this.p;
    const rt = this.rt!;
    const level = rt.level;
    const ox = this.ox;
    const oy = this.oy;
    const z = this.zoom;
    const k = this.stepTimer > 0 ? 1 - this.stepTimer / STEP_DUR : 1;

    p.noStroke();
    p.fill(0, 0, 0, 120);
    p.rect(ox + 5 * z, oy + 6 * z, level.w * 16 * z, level.h * 16 * z);

    p.push();
    p.translate(ox, oy);
    p.scale(z);
    p.image(this.room!, 0, 0);

    const press = pressure(rt);
    for (const plate of level.plates) {
      drawPlate(p, plate.x * 16, plate.y * 16, plate.color, press[plate.color], this.time);
    }
    drawExit(p, level.exit.x * 16, level.exit.y * 16, this.time, true);

    for (const door of level.doors) {
      drawDoor(p, door.x * 16, door.y * 16, rt.doorsOpen.has(cellKey(door.x, door.y)));
    }
    for (const gate of level.gates) {
      drawGate(p, gate.x * 16, gate.y * 16, gate.color, press[gate.color], this.time);
    }

    for (const gem of level.gems) {
      if (!rt.gems.has(cellKey(gem.x, gem.y))) drawGem(p, gem.x * 16, gem.y * 16, this.time);
    }
    if (level.key && !rt.keyTaken) drawKey(p, level.key.x * 16, level.key.y * 16, this.time);

    // ecos
    const poses = echoPoses(rt);
    poses.forEach((pose, i) => {
      const echo = rt.echoes[i];
      const idx = Math.min(Math.max(rt.beat - 1, 0), echo.track.length - 1);
      const next = echo.track[Math.min(idx + 1, echo.track.length - 1)];
      const ex = lerp(pose.x, next.x, rt.beat > 0 ? k : 0);
      const ey = lerp(pose.y, next.y, rt.beat > 0 ? k : 0);
      const px = Math.round(ex * 16);
      const py = Math.round(ey * 16);
      drawShadow(p, px + 8, py + 15, 5, 40);
      drawPlayer(p, this.atlas.ken.idle0, px + (i % 2 === 0 ? 0 : 1), py, pose.facing, 120, [
        130, 235, 250,
      ]);
    });

    // caixotes
    rt.crates.forEach((crate, i) => {
      const prev = this.prevCrates[i] ?? crate;
      const adjacent = Math.abs(prev.x - crate.x) + Math.abs(prev.y - crate.y) <= 1;
      const cx = adjacent ? lerp(prev.x, crate.x, k) : crate.x;
      const cy = adjacent ? lerp(prev.y, crate.y, k) : crate.y;
      drawCrate(p, Math.round(cx * 16), Math.round(cy * 16));
    });

    // jogador
    const target = rt.player;
    const prev = this.prevPlayer;
    const adjacent = prev ? Math.abs(prev.x - target.x) + Math.abs(prev.y - target.y) <= 1 : false;
    const px = prev && adjacent ? lerp(prev.x, target.x, k) : target.x;
    const py = prev && adjacent ? lerp(prev.y, target.y, k) : target.y;
    const sx = Math.round(px * 16);
    const sy = Math.round(py * 16);
    drawShadow(p, sx + 8, sy + 15, 5, 80);

    const moving = this.stepTimer > 0;
    const frame = moving ? (rt.beat % 2 === 0 ? 'walk0' : 'walk1') : this.time % 1.4 < 0.7 ? 'idle0' : 'idle1';
    const img = this.pushTimer > 0 ? this.atlas.ken.push : this.atlas.ken[frame];
    drawPlayer(p, img, sx, sy, target.facing);

    p.pop();

    if (this.flash > 0) {
      p.noStroke();
      p.fill(this.flashColor);
      p.drawingContext.globalAlpha = Math.min(0.5, this.flash * 0.7);
      p.rect(0, 0, VIEW_W, VIEW_H);
      p.drawingContext.globalAlpha = 1;
    }

    if (this.screen === 'play') {
      if (this.inTutorial) this.drawTutorialHint();
      else this.drawHint(rt);
      drawHud(p, rt, this.time, this.save.muted);
    }
  }

  private drawTutorialHint(): void {
    const p = this.p;
    const room = TUTORIAL_ROOMS[this.tutorialIndex];
    if (!room) return;
    const step = `SALA ${this.tutorialIndex + 1} DE ${TUTORIAL_ROOMS.length}`;
    const widths = [textWidth(room.title, 1), textWidth(step, 1), ...room.lines.map((l) => textWidth(l, 1))];
    const w = Math.max(...widths) + 34;
    const h = 22 + room.lines.length * 12 + 8;
    const x = Math.round(VIEW_W / 2 - w / 2);
    const y = 10;
    drawFrame(p, x, y, w, h, true);
    drawText(p, room.title, VIEW_W / 2, y + 9, 1, PALETTE.cyan, 'center');
    room.lines.forEach((line, i) => {
      drawText(p, line, VIEW_W / 2, y + 26 + i * 12, 1, '#CFE3DA', 'center');
    });
    drawText(p, step, VIEW_W / 2, y + h - 9, 1, PALETTE.cyanDim, 'center');
  }

  private drawHint(rt: Runtime): void {
    if (this.hintTimer <= 0 || rt.beat > 0) return;
    const p = this.p;
    const def = rt.level.def;
    const title = `FASE ${this.levelIndex + 1} - ${def.name.toUpperCase()}`;
    const sub = def.subtitle.toUpperCase();
    const w = Math.max(textWidth(title, 1), textWidth(sub, 1)) + 44;
    const h = 40;
    const x = Math.round(VIEW_W / 2 - w / 2);
    const y = 12;
    const alpha = Math.min(1, this.hintTimer / 0.7);
    p.drawingContext.globalAlpha = alpha;
    drawFrame(p, x, y, w, h, true);
    drawText(p, title, VIEW_W / 2, y + 9, 1, PALETTE.cyan, 'center');
    drawText(p, sub, VIEW_W / 2, y + 24, 1, '#CFE3DA', 'center');
    p.drawingContext.globalAlpha = 1;
  }

  private drawWin(): void {
    const p = this.p;
    const rt = this.rt!;
    const def = rt.level.def;
    p.noStroke();
    p.fill(6, 10, 18, 190);
    p.rect(0, 0, VIEW_W, VIEW_H);

    const w = 460;
    const h = 240;
    const x = VIEW_W / 2 - w / 2;
    const y = VIEW_H / 2 - h / 2;
    drawFrame(p, x, y, w, h, true);

    drawText(p, 'FASE CONCLUÍDA', x + w / 2 - 40, y + 22, 3, PALETTE.cyan, 'center');

    const best = this.save.best[def.id];
    const steps = rt.stepsTotal;
    const cycles = rt.cyclesUsed + 1;
    const gems = rt.gems.size;
    drawText(p, 'PASSOS', x + 44, y + 76, 2, PALETTE.white, 'left');
    drawText(p, 'CICLOS', x + 44, y + 100, 2, PALETTE.white, 'left');
    drawText(p, 'GEMAS', x + 44, y + 124, 2, PALETTE.emerald, 'left');
    drawText(p, 'RECORDE', x + 44, y + 148, 2, PALETTE.cyanDim, 'left');
    drawText(p, `${steps}`, x + 232, y + 76, 2, PALETTE.white, 'right');
    drawText(p, `${cycles}`, x + 232, y + 100, 2, PALETTE.white, 'right');
    drawText(p, `${gems}/${rt.level.gems.length}`, x + 232, y + 124, 2, PALETTE.emerald, 'right');
    drawText(p, `${best ? best.steps : steps}`, x + 232, y + 148, 2, PALETTE.cyanDim, 'right');

    const perfect = gems === rt.level.gems.length && cycles <= def.par.cycles;
    const last = this.levelIndex === LEVELS.length - 1;
    drawText(
      p,
      perfect ? 'PERFEITO!' : last ? 'FIM DO PROTÓTIPO' : 'CICLO FECHADO',
      x + w / 2 - 40,
      y + 180,
      2,
      perfect ? PALETTE.gold : PALETTE.cyanDim,
      'center',
    );

    p.image(this.atlas.ken.cheer, x + w - 100, y + 40, 72, 108);
    drawText(p, 'CEPK', x + w - 64, y + 156, 1, PALETTE.gold, 'center');

    drawText(
      p,
      last ? 'ENTER - TÍTULO' : 'ENTER - PRÓXIMA      ESC - TÍTULO',
      x + w / 2,
      y + h - 20,
      1,
      PALETTE.cyanDim,
      'center',
    );
  }

  private drawPause(): void {
    const p = this.p;
    p.noStroke();
    p.fill(6, 10, 18, 180);
    p.rect(0, 0, VIEW_W, VIEW_H);
    const w = 320;
    const h = 220;
    const x = VIEW_W / 2 - w / 2;
    const y = VIEW_H / 2 - h / 2;
    drawFrame(p, x, y, w, h, true);
    drawText(p, 'PAUSA', VIEW_W / 2, y + 22, 3, PALETTE.cyan, 'center');
    const items = ['CONTINUAR', 'REINICIAR', `SOM: ${this.save.muted ? 'MUDO' : 'LIGADO'}`, 'TÍTULO'];
    items.forEach((label, i) => {
      const iy = y + 78 + i * 26;
      const on = i === this.pauseIndex;
      drawText(p, (on ? '> ' : '  ') + label, x + 62, iy, 2, on ? PALETTE.cyan : '#8FB3A6', 'left');
    });
    drawText(p, 'ENTER  CONFIRMAR', VIEW_W / 2, y + h - 18, 1, PALETTE.cyanDim, 'center');
  }

  private levelTitle(): string {
    return this.rt ? this.rt.level.def.name.toUpperCase() : '';
  }

  get hudTitleWidth(): number {
    return textWidth(this.levelTitle(), 1);
  }

  colorOf(color: 'red' | 'blue' | 'gold'): string {
    return COLOR_RAMP[color].bright;
  }
}
