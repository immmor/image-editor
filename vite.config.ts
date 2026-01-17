import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import vitePluginImp from "vite-plugin-imp";

// 修复类型提示，封装路径解析函数
const resolve = (url: string) => path.resolve(__dirname, url);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
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
          // 修复：调整 Semi UI 按需引入配置（仅处理实际组件，排除 toast 等全局方法）
          {
            libName: '@douyinfe/semi-ui',
            libDirectory: 'es',
            // 仅对真实组件做样式引入，跳过 toast/modal/notification 等全局方法
            style: (name) => {
              // 排除非组件类模块
              const excludeList = ['toast', 'modal', 'notification', 'message'];
              if (excludeList.includes(name)) return false;
              return `@douyinfe/semi-ui/es/${name}/style`;
            },
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
            // 新增：单独拆分 Semi UI 依赖（避免样式路径问题）
            semi: ['@douyinfe/semi-ui'],
          },
        },
        input: {
          main: resolve("index.html"),
        },
        // 可选：若仍有个别路径解析失败，可临时排除（不推荐长期使用）
        // external: ['@douyinfe/semi-ui/es/toast/style/index.js'],
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
    },
  };
});
