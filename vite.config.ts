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
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      },
      // BẮT ĐẦU CẤU HÌNH CODE SPLITTING ĐỂ GIẢM KÍCH THƯỚC FILE
      build: {
        // Tăng giới hạn cảnh báo lên 1000kB (mặc định 500kB)
        chunkSizeWarningLimit: 1000, 
        
        rollupOptions: {
          output: {
            manualChunks(id) {
              // Tách các thư viện bên ngoài (node_modules) thành các chunks riêng biệt
              if (id.includes('node_modules')) {
                // 1. Tách React và React-DOM
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                // 2. Tách thư viện biểu đồ Recharts
                if (id.includes('recharts')) {
                  return 'recharts-vendor';
                }
                // 3. Tách thư viện Google GenAI
                if (id.includes('@google/genai')) {
                    return 'google-genai-vendor';
                }
                // 4. Gộp các thư viện còn lại vào một chunk chung
                return 'vendor';
              }
            },
          },
        },
      },
    };
});
