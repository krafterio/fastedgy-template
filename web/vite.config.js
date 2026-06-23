import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

const cwd = dirname(fileURLToPath(import.meta.url));

const swPlugin = () => {
    function generateSW(cacheName) {
        cacheName = cacheName ? cacheName : `v${Date.now()}`;
        const swSource = fs.readFileSync("./src/common/sw.js", "utf8");

        return swSource.replace("__CACHE_NAME__", `app-${cacheName}`);
    }

    return {
        name: "sw-plugin",
        configureServer(server) {
            server.middlewares.use("/sw.js", (req, res) => {
                res.setHeader("Content-Type", "application/javascript");
                res.end(generateSW("dev"));
            });
        },
        generateBundle() {
            this.emitFile({
                type: "asset",
                fileName: "sw.js",
                source: generateSW(),
            });
        },
    };
};

const adminPlugin = () => {
    return {
        name: "configure-server",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === "/admin" || req.url?.startsWith("/admin/")) {
                    const adminHtml = fs.readFileSync(
                        resolve(cwd, "admin.html"),
                        "utf-8"
                    );
                    res.setHeader("Content-Type", "text/html");
                    res.end(adminHtml);
                    return;
                }
                next();
            });
        },
    };
};

// https://vite.dev/config/
const config = {
    envDir: "../",
    plugins: [vue(), tailwindcss(), swPlugin(), adminPlugin()],
    build: {
        outDir: "dist",
        manifest: true,
        chunkSizeWarningLimit: 1024,
        maxParallelFileOps: 2,
        minify: "esbuild",
        rollupOptions: {
            input: {
                main: resolve(cwd, "index.html"),
                admin: resolve(cwd, "admin.html"),
            },
            output: {
                manualChunks: {
                    core: ["vue", "vue-router", "pinia"],
                    ui: ["reka-ui", "@headlessui/vue"],
                    icons: ["lucide-vue-next"],
                    utils: ["clsx", "tailwind-merge"],
                },
            },
        },
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    optimizeDeps: {
        exclude: ["vue"],
    },
    define: {},
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
};

export default defineConfig((mode) => {
    const envDir = resolve(cwd, config.envDir);
    const env = loadEnv(mode, envDir, "");
    const viteApiUrl = env.VITE_API_URL || env.BASE_URL || "";

    config.define["import.meta.env.VITE_API_URL"] = JSON.stringify(viteApiUrl);

    return config;
});
