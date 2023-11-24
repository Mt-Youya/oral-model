import { defineConfig } from "vite"
import { extname, resolve } from "path"
import { Plugin as PluginImportToCDN } from "vite-plugin-cdn-import"
import react from "@vitejs/plugin-react-swc"
import Inspect from "vite-plugin-inspect"
// import Compression from "vite-plugin-compression"

const modelExts = [".gltf", ".glb", ".obj", "mtl", ".fbx", ".stl", ".vtp", ".vtk", ".ply", ".xyz"]
const cssExts = [".css", ".less", ".scss", "sass", ".stylus"]

const cdnModules = [
    // {
    //     name: "react",
    //     var: "react",
    //     path: "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
    // },
    {
        name: "axios",
        var: "axios",
        path: "https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.1/axios.min.js",
    },
]
export default defineConfig({
    plugins: [
        react(),
        Inspect({ build: true, outputDir: ".vite-inspect" }),
        // Compression({ threshold: 1024 * 1024 * 2 }),
        PluginImportToCDN({ modules: cdnModules }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    server: {
        open: true,
        port: 8080,
    },
    build: {
        outDir: "dist",
        assetsDir: "assets",
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                chunkFileNames: "assets/js/[name]-[hash].js",
                entryFileNames: "assets/js/[name].[hash].js",
                compact: true,
                manualChunks: {
                    react: ["react", "react-dom", "react-router-dom"],
                },
                assetFileNames: chunkInfo => {
                    const ext = extname(chunkInfo.name)

                    if (cssExts.includes(ext)) {
                        return `assets/css/[name].[hash].[ext]`
                    }

                    if (modelExts.includes(ext)) {
                        return `assets/model/[name].[hash].[ext]`
                    }

                    return `assets/images/[name].[hash].[ext]`
                },
            },
        },
        minify: true,
        cssCodeSplit: true,
        assetsInlineLimit: 1024 * 5,
        emptyOutDir: true,
    },
})
