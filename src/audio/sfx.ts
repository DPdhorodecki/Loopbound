type Cue =
  | 'step'
  | 'push'
  | 'blocked'
  | 'plate'
  | 'gate'
  | 'gem'
  | 'key'
  | 'door'
  | 'echo'
  | 'cycle'
  | 'death'
  | 'win'
  | 'ui';

export class Sfx {
  private ctx: AudioContext | null = null;
  muted = false;

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
  }

  private blip(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain = 0.05,
    slideTo?: number,
  ): void {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), ctx.currentTime + dur);
    }
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  private noise(dur: number, gain = 0.04, freq = 900): void {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start();
  }

  play(cue: Cue): void {
    if (!this.ctx || this.muted) return;
    switch (cue) {
      case 'step':
        this.blip(220, 0.04, 'square', 0.025);
        break;
      case 'push':
        this.noise(0.07, 0.05, 700);
        this.blip(140, 0.06, 'triangle', 0.03);
        break;
      case 'blocked':
        this.blip(90, 0.05, 'square', 0.02);
        break;
      case 'plate':
        this.blip(440, 0.08, 'triangle', 0.04, 330);
        break;
      case 'gate':
        this.blip(160, 0.18, 'sawtooth', 0.035, 320);
        break;
      case 'gem':
        this.blip(660, 0.05, 'square', 0.03);
        setTimeout(() => this.blip(880, 0.06, 'square', 0.03), 45);
        setTimeout(() => this.blip(1320, 0.08, 'square', 0.025), 90);
        break;
      case 'key':
        this.blip(990, 0.12, 'sine', 0.045);
        break;
      case 'door':
        this.blip(110, 0.2, 'sawtooth', 0.035, 220);
        break;
      case 'echo':
        this.blip(220, 0.3, 'sine', 0.05, 440);
        break;
      case 'cycle':
        this.blip(440, 0.25, 'sine', 0.04, 110);
        break;
      case 'death':
        this.blip(180, 0.4, 'square', 0.05, 60);
        this.noise(0.3, 0.04, 400);
        break;
      case 'win':
        [523, 659, 784, 1046].forEach((f, i) =>
          setTimeout(() => this.blip(f, 0.12, 'triangle', 0.05), i * 90),
        );
        break;
      case 'ui':
        this.blip(520, 0.05, 'square', 0.025);
        break;
    }
  }
}
