import { registerSW } from 'virtual:pwa-register';

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

/** Como o jogador pode instalar o app neste navegador. */
export type InstallState = 'none' | 'prompt' | 'ios' | 'manual';

let deferred: InstallPrompt | null = null;
let notify: ((msg: string) => void) | null = null;

function isIOS(): boolean {
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
  // iPadOS 13+ se apresenta como MacIntel com touch.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function isStandalone(): boolean {
  const legacy = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.matchMedia('(display-mode: standalone)').matches || legacy;
}

function isTouchDevice(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

/**
 * O evento `beforeinstallprompt` pode chegar antes de o jogo inicializar, por
 * isso o listener é registrado já na importação do módulo.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as InstallPrompt;
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify?.('LoopBound instalado!');
  });
}

/**
 * `prompt` = o navegador oferece o diálogo nativo; `ios`/`manual` = é preciso
 * seguir as instruções do sistema; `none` = já instalado ou sem suporte.
 */
export function installState(): InstallState {
  if (isStandalone()) return 'none';
  if (deferred) return 'prompt';
  if (isIOS()) return 'ios';
  return isTouchDevice() ? 'manual' : 'none';
}

/** Texto de ajuda quando não há diálogo nativo de instalação. */
export function installHint(): string {
  return isIOS()
    ? 'NO IPHONE: COMPARTILHAR → ADICIONAR À TELA DE INÍCIO'
    : 'ABRA O MENU DO NAVEGADOR → INSTALAR APP';
}

export async function promptInstall(): Promise<void> {
  if (!deferred) {
    notify?.(installHint());
    return;
  }
  const prompt = deferred;
  deferred = null;
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') notify?.('Instalando o LoopBound…');
  } catch {
    notify?.(installHint());
  }
}

/**
 * Service worker (offline/atualização). A instalação é oferecida pela casca
 * DOM (`ui/shell.ts`), que consulta `installState()`.
 */
export function initPWA(n: (msg: string) => void): void {
  notify = n;
  const updateBtn = document.getElementById('update');

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        updateBtn?.classList.add('visible');
        n('Nova versão pronta');
      },
      onOfflineReady() {
        n('Pronto para jogar offline');
      },
    });
    updateBtn?.addEventListener('click', () => {
      updateBtn.classList.remove('visible');
      n('Atualizando…');
      void updateSW(true);
    });
  } catch {
    /* dev sem service worker */
  }
}
