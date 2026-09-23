import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
//
// The config is a function so that `.env` / `.env.local` values can be read.
// Vite does not copy loaded env files into `process.env` for the config file
// itself, so a plain `process.env.VITE_EXPLORER_API_TARGET` only ever sees
// variables exported by the shell; `loadEnv()` is the supported way to also
// pick up the local files (see the "Env Variables and Modes" guide).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')

  const apiTarget =
    env.VITE_EXPLORER_API_TARGET ??
    process.env.VITE_EXPLORER_API_TARGET ??
    'http://127.0.0.1:8010'
  const wsTarget =
    env.VITE_EXPLORER_WS_TARGET ??
    process.env.VITE_EXPLORER_WS_TARGET ??
    apiTarget.replace(/^http/, 'ws')

  return {
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
    ],

    base: '/',
    build: {
      outDir: path.resolve(__dirname, '../semantica/static'),
      emptyOutDir: true,
      chunkSizeWarningLimit: 650,
      // Explicit target avoids esbuild attempting to lower syntax that all
      // modern browsers already support natively, which breaks with the
      // esbuild >=0.28 override when running under Vite 6 on Linux CI.
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replaceAll('\\', '/')

            if (!normalizedId.includes('node_modules')) {
              return undefined
            }

            if (
              normalizedId.includes('/node_modules/sigma/') ||
              normalizedId.includes('/node_modules/graphology/') ||
              normalizedId.includes('/node_modules/graphology-layout-forceatlas2/')
            ) {
              return 'graph-vendor'
            }

            if (
              normalizedId.includes('/node_modules/vis-data/') ||
              normalizedId.includes('/node_modules/vis-timeline/')
            ) {
              return 'timeline-vendor'
            }

            if (normalizedId.includes('/node_modules/@tanstack/react-query/')) {
              return 'query-vendor'
            }

            return undefined
          },
        },
      },
    },
    optimizeDeps: {
      // Keep dependency pre-bundling aligned with the production build target.
      // esbuild >=0.28 no longer lowers destructuring for Vite's default target.
      esbuildOptions: {
        target: 'esnext',
      },
    },
    server: {
      port: 2000,
      // Fail loudly instead of silently falling back to the next port,
      // so local dev always runs on 2000.
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/ws': {
          target: wsTarget,
          ws: true,
        },
      },
    },
  }
})
