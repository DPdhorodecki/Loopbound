import { registerSW } from 'virtual:pwa-register';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: InstallPromptEvent | null = null;
let installed = false;
let revealInstall: (() => void) | null = null;

const isStandalone = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

const isMobile = (): boolean => /Android|iPad|iPhone|iPod/i.test(navigator.userAgent);

/**
 * O evento `beforeinstallprompt` pode disparar antes do p5 inicializar, então
 * ele é capturado já no topo do módulo — nunca dentro de um callback tardio.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    revealInstall?.();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    document.getElementById('install')?.classList.remove('visible');
    document.body.classList.add('installed');
  });
}

function manualInstructions(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'Para instalar: menu ⋮ do navegador → "Instalar app"';
  if (/iPad|iPhone|iPod/i.test(ua)) return 'Para instalar: Compartilhar → Adicionar à Tela de Início';
  return 'Para instalar: use o ícone de instalação na barra de endereços do navegador.';
}

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
  const hint = document.getElementById('ios-hint');

  const reveal = (): void => {
    if (!installed) installBtn?.classList.add('visible');
  };

  // Já instalado: esconde tudo.
  if (isStandalone()) {
    installed = true;
    document.body.classList.add('installed');
    installBtn?.classList.remove('visible');
  } else {
    // Evento capturado antes de chegarmos aqui, ou navegador móvel que não
    // dispara o evento (mostramos o botão para exibir as instruções).
    if (deferredPrompt || isMobile()) reveal();
  }
  revealInstall = reveal;

  installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (choice.outcome === 'accepted') {
        installBtn.classList.remove('visible');
        notify('App instalado');
      } else {
        notify('Instalação cancelada');
      }
      return;
    }
    // Plano B: o navegador não ofereceu o prompt — ensina o caminho manual.
    if (hint) {
      hint.textContent = manualInstructions();
      hint.classList.add('visible');
      window.setTimeout(() => hint.classList.remove('visible'), 8000);
    }
  });
}
