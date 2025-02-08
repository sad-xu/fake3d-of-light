import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
// import { visualizer } from 'rollup-plugin-visualizer';

const isDev = process.env.NODE_ENV == 'development';

export default defineConfig({
  base: '/fake3d',
  server: {
    port: 8777,
    host: true,
    open: true,
    proxy: {
      // '/api': {
      //   target: 'http://localhost:9000',
      //   changeOrigin: true,
      // },
    },
  },
  plugins: [
    vue(),
    // visualizer({
    //   open: true,
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  assetsInclude: ['**/*.onnx'],
  css: {
    // 全局导入scss方法
    // preprocessorOptions: {
    //   scss: {
    //     additionalData: '@import "@/styles/mixin.scss";',
    //   },
    // },
    postcss: {
      plugins: [
        // css 前缀补全
        autoprefixer(),
      ],
    },
  },
  build: {
    // css 不拆分文件
    cssCodeSplit: false,
    minify: 'esbuild',
  },
  esbuild: {
    // 去除console
    drop: isDev ? [] : ['console', 'debugger'],
  },
});
