import { defineConfig } from 'vite'
import { resolve } from "path";

export default defineConfig({
    worker: {
        format: 'iife'
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                arena: resolve(__dirname, "arena.html"),
            },
        },
        target: "esnext"
    }
})
