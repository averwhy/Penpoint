import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
    plugins: [sveltekit(), tailwindcss()],
    server: {
        fs: {
            allow: ["uploads"],
        },
    },
    ssr: {
        noExternal: ["layerchart", "layercake", "svelte-ux"]
    },
    optimizeDeps: {
        exclude: ["@lucide/svelte", "svelte-sonner", "vaul-svelte", "bits-ui", "mode-watcher", "layerchart", "layercake", "svelte-ux"],
    }
});
