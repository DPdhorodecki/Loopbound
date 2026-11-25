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
          name: 'LoopBound — Kennedyto: A Fuga da Instalação Alienígena',
          short_name: 'LoopBound',
          description:
            'Kennedyto foi sequestrado pelo Alien Chuchuty. Em cada fase, o campo de loop transforma sua tentativa em um eco.',
          start_url: BASE,
          scope: BASE,
          display: 'standalone',
          display_override: ['standalone', 'minimal-ui'],
          // Mobile-first: retrato e paisagem são suportados (a barra de toque
          // aparece em telas sensíveis ao toque).
          orientation: 'any',
          background_color: '#0B1220',
          theme_color: '#0B1220',
          lang: 'pt-BR',
          dir: 'ltr',
          categories: ['games', 'puzzle'],
          prefer_related_applications: false,
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            {
              src: 'icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Só a casca do app entra no precache (instalação rápida no celular).
          // As artes grandes (HQ/personagens) são cacheadas sob demanda.
          globPatterns: ['**/*.{js,css,html,svg,webmanifest,woff2}', 'icons/*.png'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /\/assets\/.*\.(?:png|jpe?g|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'loopbound-art',
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 90 },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
  };
});
