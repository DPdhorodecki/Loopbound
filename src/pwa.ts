import { registerSW } from 'virtual:pwa-register';

/**
 * Service worker (offline + atualização). O app continua instalável pelo
 * próprio navegador — não há botão de instalação dentro do jogo.
 */
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
}
