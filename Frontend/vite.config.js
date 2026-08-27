// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        postcss: './postcss.config.js',
    },
    preview: {
        host: true, // Expone a 0.0.0.0
        port: parseInt(process.env.PORT) || 4173,
        allowedHosts: true // Permite que acepte peticiones desde el dominio .up.railway.app
  }
});
