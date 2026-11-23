import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // Proxied requests are same-origin for the browser. Dropping Origin stops Spring from running a
        // CORS check against the dev server's port (e.g. 5174 or 127.0.0.1 → 403 "Invalid CORS request").
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"))
        },
      },
    },
  },
})
