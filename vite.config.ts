import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY),
    },
    optimizeDeps: {
      exclude: ['pyodide'],
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      fs: {
        strict: false,
        allow: ['..'],
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
        },
      },
      assetsInlineLimit: 0, // Disable asset inlining for Pyodide files
    },
  }
})
