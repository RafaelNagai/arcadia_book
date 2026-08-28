import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@chapters': resolve(__dirname, '../chapters'),
      '@oneshots': resolve(__dirname, '../one-shots'),
      '@creatures': resolve(__dirname, '../creatures.json'),
      '@ships': resolve(__dirname, '../ships.json'),
      '@characters': resolve(__dirname, '../characters.json'),
      '@equipment': resolve(__dirname, '../equipment.json'),
      '@timeline': resolve(__dirname, '../timeline.json'),
      '@version': resolve(__dirname, '../version.json'),
      '@': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.md'],
  server: {
    // Node 22 resolve 'localhost' só para ::1 nesta config de rede, deixando
    // o Vite acessível apenas via IPv6. host:true escuta em '::' (dual-stack),
    // aceitando tanto 127.0.0.1 quanto ::1/localhost.
    host: true,
    fs: {
      // Permite que o dev server sirva arquivos de fora do root (web/)
      // necessário porque chapters/ está em ../chapters (dentro de book/)
      allow: ['..'],
    },
  },
})
