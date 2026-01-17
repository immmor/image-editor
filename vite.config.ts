import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import vitePluginImp from "vite-plugin-imp";

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: {
      alias: {
        '@components': resolve('./src/components'),
        '@server': resolve('./src/server'),
        '@core': resolve('./src/pages/editor/core'),
        '@options': resolve('./src/pages/editor/components/options/components'),
        '@plugins': resolve('./src/pages/editor/plugins'),
        '@pages': resolve('./src/pages'),
        '@language': resolve('./src/language'),
        '@hooks': resolve('./src/hooks'),
        '@theme': resolve('./src/theme'),
        '@layout': resolve('./src/layout'),
        '@stores': resolve('./src/stores'),
        '@utils': resolve('./src/utils'),
        '@config': resolve('./src/config'),
        '@less': resolve('./src/less'),
        '@images': resolve('./src/assets/images'),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
        },
      }),
      vitePluginImp({
        libList: [
          {
            libName: "@icon-park/react",
            libDirectory: "es/icons",
            camel2DashComponentName: false,
          },
          {
            libName: "lodash",
            libDirectory: "",
            camel2DashComponentName: false,
          },
          {
            libName: '@douyinfe/semi-ui',
            libDirectory: 'es',
            style: (name) => {
              // 彻底排除 toast 及其他全局方法
              const excludeList = ['toast', 'modal', 'notification', 'message', 'confirm'];
              if (excludeList.includes(name)) return false;
              return `@douyinfe/semi-ui/es/${name}/style`;
            },
            // 关键：跳过 toast 等非组件模块的按需引入解析
            ignore: ['toast', 'modal', 'notification', 'message'],
          },
        ],
      }),
    ],
    css: {
      modules: {
        generateScopedName: "[name]__[local]__[hash:5]",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "${resolve('./src/less/variables.less')}";`,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "editorAssets/js/[name]-[hash].js",
          entryFileNames: "editorAssets/js/[name]-[hash].js",
          assetFileNames: "editorAssets/[ext]/[name]-[hash].[ext]",
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['lodash'],
            semi: ['@douyinfe/semi-ui'],
          },
        },
        input: {
          main: resolve("index.html"),
        },
        // 兜底：显式排除错误的 toast 路径（临时应急）
        external: [
          '@douyinfe/semi-ui/es/toast',
          '@douyinfe/semi-ui/es/toast/style/index.js'
        ],
      },
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
        },
      },
      outDir: "dist",
      sourcemap: mode === "production",
    },
    base: env.VITE_BASE_URL || "/",
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_PORT) || 3004,
      open: true,
      cors: true,
      proxy: {
        '/cgi-bin': {
          target: env.VITE_API_BASE_URL || 'https://image.h5ds.com',
          changeOrigin: true,
        },
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://image.h5ds.com',
          changeOrigin: true,
        },
        '/fonts': {
          target: 'https://cdn.h5ds.com/assets',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lodash', '@icon-park/react', '@douyinfe/semi-ui'],
      // 预构建 Semi UI，避免路径解析问题
      exclude: ['@douyinfe/semi-ui/es/toast'],
    },
  };
});
