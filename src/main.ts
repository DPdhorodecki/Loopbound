import './style.css';
import p5 from 'p5';
import { App, TouchAction } from './app';
import { createSketch } from './sketch';
import { Shell } from './ui/shell';
import { initPWA } from './pwa';
import { preloadPortraits } from './render/portraits';
import { VIEW_H, VIEW_W } from './ui/hud';
import { Dir } from './game/types';

// Só os retratos (pequenos) são pré-carregados. As artes de HQ são baixadas
// sob demanda para não gastar ~8 MB de dados na primeira abertura mobile.
void preloadPortraits();

const container = document.getElementById('game') as HTMLElement;
const fullscreenBtn = document.getElementById('fullscreen') as HTMLButtonElement | null;
const touchEl = document.getElementById('touch') as HTMLElement | null;
const hatchBtn = document.getElementById('act-hatch') as HTMLButtonElement | null;

let app: App | null = null;

// ---------------------------------------------------------------- mobile

/** Liga a barra de toque em aparelhos com toque (celular/tablet). */
const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
if (isTouch) document.body.classList.add('touch');

/** Mantém `--touch-h` igual à altura real da barra (posiciona botões fixos). */
function syncTouchHeight(): void {
  const visible = touchEl && getComputedStyle(touchEl).display !== 'none';
  document.documentElement.style.setProperty(
    '--touch-h',
    `${visible ? touchEl.offsetHeight : 0}px`,
  );
}
if (touchEl && typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(syncTouchHeight).observe(touchEl);
}
syncTouchHeight();

touchEl?.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((btn) => {
  btn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const action = btn.dataset.act as TouchAction | undefined;
    if (!action) return;
    navigator.vibrate?.(8);
    app?.touchAction(action);
  });
});

// Sem Fullscreen API (iPhone) ou já instalado, o botão não tem função.
const standalone = window.matchMedia('(display-mode: standalone)').matches;
if (fullscreenBtn) {
  const supported = typeof document.documentElement.requestFullscreen === 'function';
  if (!supported || standalone) fullscreenBtn.hidden = true;
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', (event) => {
    event.preventDefault();
    app?.toggleFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    fullscreenBtn.setAttribute('aria-pressed', String(active));
  });
}

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

    instance.onTouchState = (state) => {
      if (!hatchBtn) return;
      hatchBtn.hidden = !state.hatch;
      hatchBtn.classList.toggle('ready', state.hatchReady);
    };

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

    // Mouse: acende o botão do HUD que está sob o cursor.
    canvas.addEventListener('pointermove', (event) => {
      const v = toVirtual(canvas, event.clientX, event.clientY);
      app?.onPointerMove(v.x, v.y);
    });
    canvas.addEventListener('pointerleave', () => {
      app?.onPointerMove(-100, -100);
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
      if (params.get('shot')) {
        instance.shotMode = true;
        instance.hintTimer = 0;
        instance.radioTimer = 0;
        if (fullscreenBtn) fullscreenBtn.hidden = true;
        document.body.classList.remove('touch');
      }
      if (params.get('pause')) instance.debugPause();
    }

    void shell;
  }),
  container,
);
