import { registerSW } from 'virtual:pwa-register';

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const IOS_HINT_KEY = 'loopbound.ios-install-dismissed';

let deferred: InstallPrompt | null = null;

function isIOS(): boolean {
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
  // iPadOS 13+ se apresenta como MacIntel com touch.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function isStandalone(): boolean {
  const legacy = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.matchMedia('(display-mode: standalone)').matches || legacy;
}

/**
 * Service worker (offline/atualização), botão de instalação do PWA e dica de
 * instalação no iOS (que não dispara `beforeinstallprompt`).
 */
export function initPWA(notify: (msg: string) => void): void {
  const updateBtn = document.getElementById('update');
  const installBtn = document.getElementById('install');

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        updateBtn?.classList.add('visible');
        notify('Nova versão pronta');
      },
      onOfflineReady() {
        notify('Pronto para jogar offline');
      },
    });
    updateBtn?.addEventListener('click', () => {
      updateBtn.classList.remove('visible');
      notify('Atualizando…');
      void updateSW(true);
    });
  } catch {
    /* dev sem service worker */
  }

  const showInstall = () => installBtn?.classList.add('visible');
  const hideInstall = () => installBtn?.classList.remove('visible');

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as InstallPrompt;
    showInstall();
  });

  installBtn?.addEventListener('click', () => {
    void (async () => {
      if (!deferred) {
        notify('Use o menu do navegador para instalar');
        return;
      }
      const prompt = deferred;
      deferred = null;
      hideInstall();
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') notify('Instalando o LoopBound…');
    })();
  });

  window.addEventListener('appinstalled', () => {
    deferred = null;
    hideInstall();
    notify('LoopBound instalado!');
  });

  if (isIOS() && !isStandalone()) showIosHint();
}

function showIosHint(): void {
  const banner = document.getElementById('ios-install');
  const close = document.getElementById('ios-install-close');
  if (!banner) return;
  try {
    if (localStorage.getItem(IOS_HINT_KEY) === '1') return;
  } catch {
    /* storage bloqueado */
  }
  banner.classList.add('visible');
  close?.addEventListener('click', () => {
    banner.classList.remove('visible');
    try {
      localStorage.setItem(IOS_HINT_KEY, '1');
    } catch {
      /* ignora */
    }
  });
}
