import './style.css';
import p5 from 'p5';
import { App } from './app';
import { createSketch } from './sketch';
import { Shell } from './ui/shell';
import { initPWA } from './pwa';
import { VIEW_H, VIEW_W } from './ui/hud';
import { Dir } from './game/types';

const container = document.getElementById('game') as HTMLElement;

let app: App | null = null;

function toVirtual(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW_W,
    y: ((clientY - rect.top) / rect.height) * VIEW_H,
  };
}

new p5(
  createSketch((instance, canvas) => {
    app = instance;

    const shell = new Shell(instance, container);

    window.addEventListener('keydown', (event) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (!typing && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'].includes(event.key)) {
        event.preventDefault();
      }
      if (typing) return;
      app?.onKey(event.key);
    });

    let down: { x: number; y: number; t: number } | null = null;

    canvas.addEventListener('pointerdown', (event) => {
      canvas.setPointerCapture(event.pointerId);
      const v = toVirtual(canvas, event.clientX, event.clientY);
      down = { x: v.x, y: v.y, t: performance.now() };
    });

    canvas.addEventListener('pointerup', (event) => {
      if (!down) return;
      const v = toVirtual(canvas, event.clientX, event.clientY);
      const dx = v.x - down.x;
      const dy = v.y - down.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 16) {
        const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : dy > 0 ? 'D' : 'U';
        app?.onSwipe(dir);
      } else {
        app?.onPointer(v.x, v.y);
      }
      down = null;
    });

    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    initPWA((message) => {
      if (app) {
        app.toast = message;
        window.setTimeout(() => {
          if (app) app.toast = '';
        }, 2600);
      }
    });

    // Hooks de desenvolvimento: ?level=3&moves=RRD|DD&pause=1
    const params = new URLSearchParams(window.location.search);
    const levelParam = params.get('level');
    if (levelParam) {
      document.querySelector('.lb-root')?.remove();
      container.classList.add('playing');
      instance.menuOpen = false;
      const moves = params.get('moves') ?? '';
      instance.debugRun(Number.parseInt(levelParam, 10), moves);
      if (params.get('pause')) instance.debugPause();
    }

    void shell;
  }),
  container,
);
