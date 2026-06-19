import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        find: '@trame-besace/shared-types/use-effects-hook',
        replacement: path.resolve(__dirname, '../packages/shared-types/use-effects-hook.ts'),
      },
      {
        find: '@trame-besace/shared-types/use-effects',
        replacement: path.resolve(__dirname, '../packages/shared-types/use-effects.ts'),
      },
      {
        find: '@trame-besace/shared-types/combat-sync',
        replacement: path.resolve(__dirname, '../packages/shared-types/combat-sync.ts'),
      },
      {
        find: '@trame-besace/shared-types',
        replacement: path.resolve(__dirname, '../packages/shared-types/index.ts'),
      },
    ],
  },
})
