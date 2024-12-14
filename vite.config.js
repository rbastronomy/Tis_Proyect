export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // o la URL de tu backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
  // ... resto de la configuración
}) 