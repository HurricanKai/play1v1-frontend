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
                "game-end": resolve(__dirname, "game-end.html"),
            },
        },
        target: "esnext"
    }
})
