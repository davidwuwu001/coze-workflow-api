import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 优化构建输出
    outDir: 'dist',
    assetsDir: 'assets',
    // 启用资源内联阈值
    assetsInlineLimit: 4096,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 source map 用于调试
    sourcemap: false,
    // 压缩选项
    minify: 'terser',
    // 移除 console 和 debugger
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 分包策略
    rollupOptions: {
      output: {
        // 分离第三方库
        manualChunks: {
          vendor: ['react', 'react-dom'],
          coze: ['@coze/api']
        },
        // 文件命名策略
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  // 基础路径配置，适用于 CDN 部署
  base: './',
  // 服务器配置
  server: {
    port: 5173,
    host: true
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  }
})