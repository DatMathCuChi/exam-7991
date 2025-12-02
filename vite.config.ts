import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Bạn đang dùng GEMINI_API_KEY -> Vercel chỉ cần set đúng tên biến này
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      // 1) Tăng giới hạn để không bị warning nữa (vd 1 MB)
      chunkSizeWarningLimit: 1024,

      // 2) Chia nhỏ các thư viện nặng thành nhiều chunk
      rollupOptions: {
        output: {
          manualChunks: {
            // React core tách riêng
            react: ['react', 'react-dom'],
            // Chart tách riêng
            charts: ['recharts'],
            // Thư viện GenAI tách riêng
            genai: ['@google/genai'],
          },
        },
      },
    },
  };
});
