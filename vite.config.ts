import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import vitePluginImp from "vite-plugin-imp";

// 修复类型提示，封装路径解析函数
const resolve = (url: string) => path.resolve(__dirname, url);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量（新增：支持不同环境的.env文件）
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
          // 取消注释并配置semi-ui按需引入（示例修改）
          {
            libName: '@douyinfe/semi-ui',
            libDirectory: 'es',
            style: (name) => `@douyinfe/semi-ui/es/${name}/style/index.js`,
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
          // 新增：全局注入less变量/混合（示例）
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
          // 新增：拆分公共依赖包（优化打包体积）
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['lodash'],
          },
        },
        input: {
          main: resolve("index.html"),
        },
      },
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production", // 仅生产环境移除console（优化：开发环境保留）
          drop_debugger: mode === "production",
        },
      },
      // 新增：指定输出目录（默认dist，可自定义）
      outDir: "dist",
      // 新增：生产环境生成sourcemap（可选）
      sourcemap: mode === "production",
    },
    // 新增：根据环境变量配置基础路径
    base: env.VITE_BASE_URL || "/",
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_PORT) || 3004, // 从环境变量读取端口（新增）
      open: true, // 启动后自动打开浏览器（新增）
      cors: true, // 允许跨域（新增）
      proxy: {
        '/cgi-bin': {
          target: env.VITE_API_BASE_URL || 'https://image.h5ds.com', // 从环境变量读取代理目标（新增）
          changeOrigin: true,
          // 新增：路径重写（如果需要）
          // rewrite: (path) => path.replace(/^\/cgi-bin/, ''),
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
    // 新增：优化依赖预构建
    optimizeDeps: {
      include: ['react', 'react-dom', 'lodash', '@icon-park/react'],
    },
  };
});
