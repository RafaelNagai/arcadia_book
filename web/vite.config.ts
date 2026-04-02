import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@chapters': resolve(__dirname, '../chapters'),
      '@oneshots': resolve(__dirname, '../one-shots'),
      '@': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.md'],
  server: {
    fs: {
      // Permite que o dev server sirva arquivos de fora do root (web/)
      // necessário porque chapters/ está em ../chapters (dentro de book/)
      allow: ['..'],
    },
  },
})
