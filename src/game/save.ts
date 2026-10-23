export interface LevelBest {
  steps: number;
  cycles: number;
  gems: number;
}

export interface SaveData {
  v: number;
  unlocked: number;
  best: Record<string, LevelBest>;
  muted: boolean;
}

const KEY = 'loopbound.save.v1';

const DEFAULT: SaveData = { v: 1, unlocked: 1, best: {}, muted: false };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT, best: {} };
    const parsed = JSON.parse(raw) as SaveData;
    if (!parsed || parsed.v !== 1) return { ...DEFAULT, best: {} };
    return {
      v: 1,
      unlocked: Math.max(1, Math.min(parsed.unlocked ?? 1, 5)),
      best: parsed.best ?? {},
      muted: Boolean(parsed.muted),
    };
  } catch {
    return { ...DEFAULT, best: {} };
  }
}

export function persistSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* modo privado: segue sem salvar */
  }
}
