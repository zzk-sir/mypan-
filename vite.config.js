import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
    port:1024,
    hmr:true,
    proxy:{
      "/api":{
        target:"http://106.54.15.252:7090",
        // target:"http://localhost:7090",
        changeOrigin:true,
        pathRewrite:{
          "^api":"/api"
        }
      }
    }
  }
})