import p5 from 'p5';
import { App } from './app';
import { VIEW_H, VIEW_W } from './ui/hud';

/**
 * Ajusta o canvas virtual (640×360) para caber na área disponível.
 * Usa o tamanho do container (não da janela) para reservar o espaço da
 * barra de toque no modo mobile.
 */
export function fitCanvas(canvas: HTMLCanvasElement): void {
  const host = canvas.parentElement;
  const vw = host?.clientWidth || window.innerWidth;
  const vh = host?.clientHeight || window.innerHeight;
  const raw = Math.min(vw / VIEW_W, vh / VIEW_H);
  // Em telas grandes mantém escala inteira (pixel art nítida); no celular
  // aceita fração para ocupar a largura toda.
  const scale = raw >= 1 ? Math.floor(raw) : Math.max(raw, 0.1);
  canvas.style.width = `${Math.round(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.round(VIEW_H * scale)}px`;
  canvas.style.maxWidth = '100%';
  canvas.style.maxHeight = '100%';
  canvas.style.imageRendering = 'pixelated';
  canvas.style.display = 'block';
}

export function createSketch(onReady: (app: App, canvas: HTMLCanvasElement) => void) {
  return (p: p5) => {
    let app: App | null = null;
    p.setup = () => {
      const canvas = p.createCanvas(VIEW_W, VIEW_H);
      p.pixelDensity(1);
      p.noSmooth();
      p.frameRate(60);
      p.textFont('monospace');
      const el = canvas.elt as HTMLCanvasElement;
      fitCanvas(el);

      const refit = () => fitCanvas(el);
      window.addEventListener('resize', refit);
      window.addEventListener('orientationchange', () => window.setTimeout(refit, 150));
      window.visualViewport?.addEventListener('resize', refit);
      // A barra de toque altera a altura disponível: observa o container.
      if (el.parentElement && typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(refit).observe(el.parentElement);
      }

      app = new App(p);
      onReady(app, el);
    };

    p.draw = () => {
      if (!app) return;
      app.update(p.deltaTime);
      app.draw();
    };
  };
}
