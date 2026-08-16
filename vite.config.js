import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssMinify: true,
    modulePreload: { polyfill: false },
    target: 'es2022',
  },
})
