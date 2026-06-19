import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: true,
    port: 8080,
    proxy: {
      // Configuration du proxy pour AideDD
      '/api/proxy': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, '/api/proxy'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Erreur de proxy:', err);
          });
        },
      },
      // Proxy pour D&D Beyond
      '/api/dndbeyond': {
        target: 'https://character-service.dndbeyond.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dndbeyond/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Erreur de proxy D&D Beyond:', err);
          });
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: '@trame-besace/shared-types/use-effects-hook', replacement: path.resolve(__dirname, '../packages/shared-types/use-effects-hook.ts') },
      { find: '@trame-besace/shared-types/use-effects', replacement: path.resolve(__dirname, '../packages/shared-types/use-effects.ts') },
      { find: '@trame-besace/shared-types/combat-sync', replacement: path.resolve(__dirname, '../packages/shared-types/combat-sync.ts') },
      { find: '@trame-besace/shared-types', replacement: path.resolve(__dirname, '../packages/shared-types/index.ts') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
}));
