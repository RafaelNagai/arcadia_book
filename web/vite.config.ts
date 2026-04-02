import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@chapters': resolve(__dirname, '../chapters'),
      '@': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.md'],
})
