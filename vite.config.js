import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/* STEALTH. `VITE_STEALTH=1` swaps the built index.html for `stealth/index.html`
   and overwrites the crawler files with the copies beside it. It also writes the page as about.html,
   404.html so deep links and unknown paths show it without the SPA rewrite, and serves the policy
   from stealth/privacy.html at /privacy. The site's own
   sources are untouched; the flag is the only thing that changes. See
   stealth/README.md. */
const STEALTH_DIR = fileURLToPath(new URL('./stealth/', import.meta.url))
const STEALTH_FILES = ['llms.txt', 'sitemap.xml', 'site.webmanifest']

function stealth() {
  let outDir = 'dist'
  return {
    name: 'damaros-stealth',
    enforce: 'pre',
    configResolved(config) {
      outDir = config.build.outDir
    },
    transformIndexHtml: {
      order: 'pre',
      handler: () => readFileSync(`${STEALTH_DIR}index.html`, 'utf8'),
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/privacy' || req.url === '/privacy.html') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(readFileSync(`${STEALTH_DIR}privacy.html`))
          return
        }
        const name = STEALTH_FILES.find((file) => req.url === `/${file}`)
        if (!name) return next()
        res.setHeader('Content-Type', name.endsWith('.xml') ? 'application/xml; charset=utf-8' : name.endsWith('.webmanifest') ? 'application/manifest+json' : 'text/plain; charset=utf-8')
        res.end(readFileSync(`${STEALTH_DIR}${name}`))
      })
    },
    closeBundle() {
      for (const name of STEALTH_FILES) {
        writeFileSync(`${outDir}/${name}`, readFileSync(`${STEALTH_DIR}${name}`))
      }
      // Deep links must not depend on the SPA rewrite: the old routes and any unknown path show the same page.
      const page = readFileSync(`${outDir}/index.html`)
      for (const name of ['about.html', '404.html']) writeFileSync(`${outDir}/${name}`, page)
      // Nothing from the full site that names its world: the integration logos are not shipped.
      rmSync(`${outDir}/assets/vendor`, { recursive: true, force: true })
      // The privacy policy stays a real page: the policy itself, verbatim, on the stealth ground.
      writeFileSync(`${outDir}/privacy.html`, readFileSync(`${STEALTH_DIR}privacy.html`))
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isStealth = env.VITE_STEALTH === '1'
  return {
    plugins: [...(isStealth ? [stealth()] : []), tailwindcss(), react()],
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
            if (id.includes('/src/diagrams/')) return 'figures'
          },
        },
      },
    },
  }
})
