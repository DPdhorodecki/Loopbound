import { registerSW } from 'virtual:pwa-register';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: InstallPromptEvent | null = null;

export function initPWA(notify: (msg: string) => void): void {
  const updateBtn = document.getElementById('update');

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

  const installBtn = document.getElementById('install');
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    installBtn?.classList.add('visible');
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.remove('visible');
  });
  window.addEventListener('appinstalled', () => {
    installBtn?.classList.remove('visible');
    notify('App instalado');
  });

  if (window.matchMedia('(display-mode: standalone)').matches) {
    document.body.classList.add('installed');
  }
}
