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

const consolePlugin = () => {
    return {
        name: "configure-server",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === "/console" || req.url?.startsWith("/console/")) {
                    const consoleHtml = fs.readFileSync(
                        resolve(cwd, "console.html"),
                        "utf-8"
                    );
                    res.setHeader("Content-Type", "text/html");
                    res.end(consoleHtml);
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
    plugins: [vue(), tailwindcss(), swPlugin(), consolePlugin()],
    build: {
        outDir: "dist",
        manifest: true,
        chunkSizeWarningLimit: 1024,
        maxParallelFileOps: 2,
        minify: "esbuild",
        rollupOptions: {
            input: {
                main: resolve(cwd, "index.html"),
                console: resolve(cwd, "console.html"),
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
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.js"],
        server: {
            // vue-fastedgy reads `import.meta.env` at module scope. Vitest
            // externalizes node_modules by default, so Node loads it raw and
            // `import.meta.env` is undefined. Inlining puts it back through
            // vite, where the `define` above applies.
            deps: {
                inline: ["vue-fastedgy"],
            },
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
