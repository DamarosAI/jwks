import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssMinify: true,
    modulePreload: { polyfill: false },
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor'
          if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap')) return 'gsap'
        },
      },
    },
  },
})
