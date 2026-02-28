import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    server: {
        fs: {
            allow: ["uploads"],
        },
    },
    ssr: {
        noExternal: ["layerchart", "svelte-ux"]
    },
    optimizeDeps: {
        exclude: ["@lucide/svelte", "svelte-sonner", "vaul-svelte", "bits-ui", "mode-watcher", "layerchart", "svelte-ux"],
    }
});
