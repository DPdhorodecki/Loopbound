import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Em produção o jogo é servido pelo Static Site do Render na raiz (`/`).
 * `VITE_BASE` permite publicar em um subdiretório (ex.: GitHub Pages) sem
 * mexer no código.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const BASE = env.VITE_BASE || '/';

  return {
    base: BASE,
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2020',
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 1200,
    },
    plugins: [
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: [
          'icons/icon-32.png',
          'icons/apple-touch-icon.png',
          'icons/icon-192.png',
          'icons/icon-512.png',
          'icons/maskable-512.png',
        ],
        manifest: {
          id: BASE,
          name: 'Loopbound',
          short_name: 'Loopbound',
          description:
            'Puzzle em grade onde cada tentativa sua deixa um eco que repete o seu caminho.',
          start_url: BASE,
          scope: BASE,
          display: 'standalone',
          orientation: 'landscape',
          background_color: '#0B1220',
          theme_color: '#0B1220',
          lang: 'pt-BR',
          categories: ['games', 'puzzle'],
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,woff2}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
        },
        devOptions: { enabled: false },
      }),
    ],
  };
});
