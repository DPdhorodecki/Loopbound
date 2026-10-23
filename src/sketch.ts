import p5 from 'p5';
import { App } from './app';
import { VIEW_H, VIEW_W } from './ui/hud';

export function fitCanvas(canvas: HTMLCanvasElement): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const raw = Math.min(vw / VIEW_W, vh / VIEW_H);
  const scale = raw >= 1 ? Math.floor(raw) : raw;
  canvas.style.width = `${Math.round(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.round(VIEW_H * scale)}px`;
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
      window.addEventListener('resize', () => fitCanvas(el));
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
