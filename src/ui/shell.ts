import type { App, WinResult } from '../app';
import { LEVELS } from '../game/levels';
import { TUTORIAL_ROOMS } from '../game/tutorial';
import { persistSave } from '../game/save';
import * as api from '../net/api';

type Tab = 'jogar' | 'fases' | 'historico' | 'perfil';

const AVATARS = [
  { id: 'kennedito', label: 'KENNEDITO', glyph: '🐕' },
  { id: 'batedor', label: 'BATEDOR', glyph: '🧭' },
  { id: 'eco', label: 'ECO', glyph: '👻' },
  { id: 'estrela', label: 'ESTRELA', glyph: '⭐' },
];

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, unknown>> = {},
  ...children: (Node | string | null | undefined)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (key === 'class') node.className = String(value);
    else if (key === 'text') node.textContent = String(value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else node.setAttribute(key, String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

/**
 * Casca DOM: login, menu em abas (no estilo do CEPK Rush) e ponte com o jogo.
 */
export class Shell {
  private root: HTMLDivElement;
  private authEl: HTMLDivElement;
  private menuEl: HTMLDivElement;
  private winEl: HTMLDivElement;
  private me: api.Me | null = null;
  private offline = false;
  private tab: Tab = 'jogar';
  private busy = false;

  constructor(
    private readonly app: App,
    private readonly gameEl: HTMLElement,
  ) {
    this.root = h('div', { class: 'lb-root' });
    this.authEl = h('div', { class: 'lb-screen lb-auth' });
    this.menuEl = h('div', { class: 'lb-screen lb-menu hidden' });
    this.winEl = h('div', { class: 'lb-screen lb-win hidden' });
    this.root.append(this.authEl, this.menuEl, this.winEl);
    document.body.append(this.root);

    app.onWin = (result) => this.handleWin(result);
    app.onRequestMenu = () => this.openMenu();
    app.onTutorialDone = () => this.markTutorialDone();

    void this.boot();
  }

  // ---------------------------------------------------------------- fluxo

  private async boot(): Promise<void> {
    if (api.getToken()) {
      try {
        this.me = await api.me();
        this.applyServerProgress();
        this.afterAuth();
        return;
      } catch {
        const cached = api.cachedMe();
        if (cached) {
          this.me = cached;
          this.offline = true;
          this.afterAuth();
          return;
        }
        api.setToken(null);
      }
    }
    this.showAuth();
  }

  private afterAuth(): void {
    if (!this.app.save.tutorialDone) this.startTutorial();
    else this.openMenu();
  }

  private applyServerProgress(): void {
    if (!this.me) return;
    const saved = this.app.save;
    saved.unlocked = Math.max(saved.unlocked, this.me.progress.unlocked);
    saved.tutorialDone = saved.tutorialDone || this.me.progress.tutorial_done;
    if (typeof this.me.progress.muted === 'boolean') this.app.setMuted(this.me.progress.muted);
    persistSave(saved);
  }

  private showAuth(): void {
    this.app.menuOpen = true;
    this.menuEl.classList.add('hidden');
    this.authEl.classList.remove('hidden');
    this.authEl.replaceChildren(this.authCard());
  }

  private openMenu(): void {
    this.app.menuOpen = true;
    this.authEl.classList.add('hidden');
    this.menuEl.classList.remove('hidden');
    this.renderMenu();
  }

  private startLevel(index: number): void {
    this.enterPlay();
    this.app.startLevel(index);
  }

  private startTutorial(): void {
    this.enterPlay();
    this.app.startTutorial();
  }

  private enterPlay(): void {
    this.app.menuOpen = false;
    this.authEl.classList.add('hidden');
    this.menuEl.classList.add('hidden');
    this.winEl.classList.add('hidden');
    this.gameEl.classList.add('playing');
  }

  private handleWin(result: WinResult): void {
    void this.syncWin(result);
    // No modo debug (?level=) o `.lb-root` é removido: aí o cartão do canvas
    // assume a tela de vitória.
    if (this.root.isConnected) this.openWin(result);
  }

  private openWin(result: WinResult): void {
    this.app.menuOpen = true;
    this.authEl.classList.add('hidden');
    this.menuEl.classList.add('hidden');
    this.winEl.classList.remove('hidden');
    const card = this.winCard(result);
    this.winEl.replaceChildren(card);
    (card.querySelector('.lb-btn-big') as HTMLButtonElement | null)?.focus();
  }

  private winCard(result: WinResult): HTMLElement {
    const last = this.app.levelIndex >= LEVELS.length - 1;
    const best = this.app.save.best[result.levelId];

    const stats = h(
      'dl',
      { class: 'lb-win-stats' },
      h('dt', { text: 'PASSOS' }),
      h('dd', { text: `${result.steps}` }),
      h('dt', { text: 'CICLOS' }),
      h('dd', { text: `${result.cycles}` }),
      h('dt', { text: 'GEMAS' }),
      h('dd', { text: `${result.gems}/${result.totalGems}` }),
      h('dt', { text: 'RECORDE' }),
      h('dd', { text: `${best ? best.steps : result.steps}` }),
    );

    return h(
      'div',
      { class: 'lb-card lb-win-card' },
      h('p', { class: 'lb-kicker', text: last ? 'FIM DE JOGO' : 'FASE CONCLUÍDA' }),
      h('h1', { class: 'lb-level-name', text: `${this.app.levelIndex + 1}. ${result.levelName.toUpperCase()}` }),
      stats,
      h(
        'div',
        { class: 'lb-actions' },
        h('button', {
          class: 'lb-btn lb-btn-big',
          text: last ? 'VOLTAR AO MENU' : 'PRÓXIMA FASE',
          onclick: () => {
            this.winEl.classList.add('hidden');
            this.enterPlay();
            this.app.nextLevel();
          },
        }),
        h('button', {
          class: 'lb-btn lb-btn-ghost',
          text: 'MENU',
          onclick: () => {
            this.winEl.classList.add('hidden');
            this.app.backToTitle();
          },
        }),
      ),
    );
  }

  private async syncWin(result: WinResult): Promise<void> {
    try {
      await api.sendRun({
        levelId: result.levelId,
        levelName: result.levelName,
        steps: result.steps,
        cycles: result.cycles,
        gems: result.gems,
        totalGems: result.totalGems,
        won: result.won,
      });
      await api.saveProgress({ unlocked: this.app.save.unlocked });
      this.offline = false;
    } catch {
      this.offline = true;
    }
  }

  private markTutorialDone(): void {
    void api.saveProgress({ tutorialDone: true }).catch(() => {
      this.offline = true;
    });
  }

  // ---------------------------------------------------------------- login

  private authCard(): HTMLElement {
    const username = h('input', { name: 'username', autocomplete: 'username', maxlength: '20' });
    const password = h('input', {
      name: 'password',
      type: 'password',
      autocomplete: 'current-password',
      maxlength: '100',
    });
    const error = h('p', { class: 'lb-error' });
    const form = h('form', { class: 'lb-form' });

    const submit = async (mode: 'login' | 'register') => {
      if (this.busy) return;
      const user = username.value.trim();
      const pass = password.value;
      if (user.length < 3 || pass.length < 6) {
        error.textContent = 'Nome (3+) e senha (6+) são obrigatórios.';
        return;
      }
      this.busy = true;
      error.textContent = mode === 'login' ? 'Entrando...' : 'Criando conta...';
      try {
        this.me = mode === 'login' ? await api.login(user, pass) : await api.register(user, pass);
        this.offline = false;
        this.applyServerProgress();
        this.afterAuth();
      } catch (e) {
        error.textContent = e instanceof Error ? e.message : 'Falha na conexão.';
      } finally {
        this.busy = false;
      }
    };

    form.append(
      h('label', { class: 'lb-field' }, h('span', { text: 'NOME' }), username),
      h('label', { class: 'lb-field' }, h('span', { text: 'SENHA' }), password),
      h(
        'div',
        { class: 'lb-actions' },
        h('button', { type: 'submit', class: 'lb-btn', text: 'ENTRAR' }),
        h('button', {
          type: 'button',
          class: 'lb-btn lb-btn-ghost',
          text: 'CRIAR CONTA',
          onclick: () => void submit('register'),
        }),
      ),
    );
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void submit('login');
    });

    return h(
      'div',
      { class: 'lb-card' },
      h('h1', { class: 'lb-logo', text: 'LOOPBOUND' }),
      h('p', { class: 'lb-tag', text: 'CADA TENTATIVA DEIXA UM ECO' }),
      h('p', {
        class: 'lb-intro',
        text: 'Entre para salvar o seu progresso no banco. O Kennedito guarda os seus recordes.',
      }),
      form,
      error,
    );
  }

  // ---------------------------------------------------------------- menu

  private unlocked(): number {
    return Math.min(
      Math.max(this.app.save.unlocked, this.me?.progress.unlocked ?? 1),
      LEVELS.length,
    );
  }

  private renderMenu(): void {
    const username = this.me?.user?.username ?? this.me?.username ?? 'BATEDOR';
    const avatarId = this.me?.user?.avatar ?? 'kennedito';
    const avatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];

    const tabs: { id: Tab; label: string }[] = [
      { id: 'jogar', label: 'JOGAR' },
      { id: 'fases', label: 'FASES' },
      { id: 'historico', label: 'HISTÓRICO' },
      { id: 'perfil', label: 'PERFIL' },
    ];

    const header = h(
      'header',
      { class: 'lb-header' },
      h('div', { class: 'lb-avatar', text: avatar.glyph }),
      h(
        'div',
        { class: 'lb-who' },
        h('strong', { text: username.toUpperCase() }),
        h('span', {
          text: `${this.bestCount()} RECORDES · FASE ${this.unlocked()}/${LEVELS.length}${
            this.offline ? ' · OFFLINE' : ''
          }`,
        }),
      ),
      h('div', { class: 'lb-badge', text: 'CEPK' }),
    );

    const tabRow = h(
      'nav',
      { class: 'lb-tabs' },
      ...tabs.map((t) =>
        h('button', {
          class: `lb-tab${t.id === this.tab ? ' active' : ''}`,
          text: t.label,
          onclick: () => {
            this.tab = t.id;
            this.renderMenu();
          },
        }),
      ),
    );

    const panel = h('section', { class: 'lb-panel' });
    if (this.tab === 'jogar') panel.append(this.panelPlay());
    else if (this.tab === 'fases') panel.append(this.panelLevels());
    else if (this.tab === 'historico') panel.append(this.panelHistory());
    else panel.append(this.panelProfile());

    this.menuEl.replaceChildren(h('div', { class: 'lb-card lb-card-wide' }, header, tabRow, panel));
  }

  private bestCount(): number {
    return Object.keys(this.app.save.best).length;
  }

  private panelPlay(): HTMLElement {
    const next = Math.min(this.unlocked() - 1, LEVELS.length - 1);
    const def = LEVELS[next];
    const best = this.app.save.best[def.id];
    const box = h('div', { class: 'lb-play' });

    box.append(
      h('p', { class: 'lb-kicker', text: 'PRÓXIMA FASE' }),
      h('h2', { class: 'lb-level-name', text: `${next + 1}. ${def.name.toUpperCase()}` }),
      h('p', { class: 'lb-desc', text: def.subtitle }),
      h('p', {
        class: 'lb-best',
        text: best
          ? `RECORDE: ${best.steps} PASSOS · ${best.cycles} CICLOS · ${best.gems} GEMAS`
          : 'AINDA SEM RECORDE NESSA FASE',
      }),
      h(
        'div',
        { class: 'lb-actions' },
        h('button', {
          class: 'lb-btn lb-btn-big',
          text: 'JOGAR',
          onclick: () => this.startLevel(next),
        }),
        h('button', {
          class: 'lb-btn lb-btn-ghost',
          text: this.app.save.tutorialDone ? 'REVER TUTORIAL' : 'TUTORIAL',
          onclick: () => this.startTutorial(),
        }),
      ),
      h('p', {
        class: 'lb-note',
        text: `${TUTORIAL_ROOMS.length} salas de tutorial ensinam andar, empurrar, eco, chave, alavanca, botão, duto e código.`,
      }),
    );
    return box;
  }

  private panelLevels(): HTMLElement {
    const grid = h('div', { class: 'lb-grid' });
    const unlocked = this.unlocked();
    LEVELS.forEach((def, index) => {
      const locked = index >= unlocked;
      const best = this.app.save.best[def.id];
      grid.append(
        h(
          'button',
          {
            class: `lb-level${locked ? ' locked' : ''}`,
            disabled: locked ? 'true' : undefined,
            onclick: () => !locked && this.startLevel(index),
          },
          h('span', { class: 'lb-level-num', text: `${index + 1}` }),
          h('span', { class: 'lb-level-title', text: def.name.toUpperCase() }),
          h('span', {
            class: 'lb-level-meta',
            text: locked ? '🔒' : best ? `${best.steps} PASSOS` : 'JOGAR',
          }),
        ),
      );
    });
    return grid;
  }

  private panelHistory(): HTMLElement {
    const runs = this.me?.history ?? [];
    if (runs.length === 0) {
      return h('p', { class: 'lb-empty', text: 'Nenhuma partida registrada ainda. Jogue uma fase!' });
    }
    const rows = runs.map((run) =>
      h(
        'tr',
        {},
        h('td', { text: run.level_name ?? run.level_id }),
        h('td', { text: `${run.steps}` }),
        h('td', { text: `${run.cycles}` }),
        h('td', { text: `${run.gems}` }),
        h('td', { text: new Date(run.created_at).toLocaleString('pt-BR') }),
      ),
    );
    return h(
      'div',
      { class: 'lb-table-wrap' },
      h(
        'table',
        { class: 'lb-table' },
        h(
          'thead',
          {},
          h(
            'tr',
            {},
            h('th', { text: 'FASE' }),
            h('th', { text: 'PASSOS' }),
            h('th', { text: 'CICLOS' }),
            h('th', { text: 'GEMAS' }),
            h('th', { text: 'QUANDO' }),
          ),
        ),
        h('tbody', {}, ...rows),
      ),
    );
  }

  private panelProfile(): HTMLElement {
    const current = this.me?.user?.avatar ?? 'kennedito';
    const grid = h(
      'div',
      { class: 'lb-avatars' },
      ...AVATARS.map((avatar) =>
        h('button', {
          class: `lb-avatar-btn${avatar.id === current ? ' active' : ''}`,
          text: `${avatar.glyph}\n${avatar.label}`,
          onclick: () => this.pickAvatar(avatar.id),
        }),
      ),
    );

    return h(
      'div',
      { class: 'lb-profile' },
      h('p', { class: 'lb-kicker', text: 'AVATAR' }),
      grid,
      h('p', { class: 'lb-kicker', text: 'SOM' }),
      h('button', {
        class: 'lb-btn lb-btn-ghost',
        text: this.app.save.muted ? 'SOM: MUDO' : 'SOM: LIGADO',
        onclick: () => {
          this.app.setMuted(!this.app.save.muted);
          void api.saveProgress({ muted: this.app.save.muted }).catch(() => {
            this.offline = true;
          });
          this.renderMenu();
        },
      }),
      h('p', { class: 'lb-kicker', text: 'CONTA' }),
      h('button', {
        class: 'lb-btn lb-btn-danger',
        text: 'SAIR DA CONTA',
        onclick: () => void this.logout(),
      }),
    );
  }

  private pickAvatar(id: string): void {
    if (this.me) {
      this.me.user = {
        id: this.me.user?.id ?? '',
        username: this.me.user?.username ?? this.me.username ?? '',
        avatar: id,
      };
    }
    void api.saveProgress({ avatar: id }).catch(() => {
      this.offline = true;
    });
    this.renderMenu();
  }

  private async logout(): Promise<void> {
    await api.logout();
    this.me = null;
    this.app.backToTitle();
    this.showAuth();
  }
}
