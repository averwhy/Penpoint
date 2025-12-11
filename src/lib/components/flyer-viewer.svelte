<script lang="ts">
    import EyeIcon from "@lucide/svelte/icons/eye";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { cn } from "$lib/utils";

    let {
        src,
        alt = "Image preview",
        class: className = "",
        imgClass = "",
    }: {
        src: string;
        alt?: string;
        class?: string;
        imgClass?: string;
    } = $props();

    let open = $state(false);

    // Preload image
    $effect(() => {
        const img = new Image();
        img.src = src;
    });
</script>

<Dialog.Root bind:open>
    <button
        type="button"
        class={cn(
            "group relative block w-full overflow-hidden rounded-lg border bg-card shadow-sm transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ring",
            "cursor-zoom-in aspect-video",
            className,
        )}
        onclick={() => (open = true)}
    >
        <img
            {src}
            {alt}
            loading="lazy"
            class={cn("h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.02]", imgClass)}
        />
        <div
            class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition duration-200 group-hover:bg-black/50"
        >
            <EyeIcon class="h-6 w-6 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
    </button>

    <Dialog.Content class="p-0 bg-transparent border-none shadow-none w-auto max-w-[calc(100%-2rem)] sm:max-w-5xl mt-5">
        <Dialog.Header class="sr-only">
            <Dialog.Title>{alt}</Dialog.Title>
        </Dialog.Header>
        <img {src} {alt} class="max-h-[85vh] max-w-[85vw] h-auto w-auto object-contain bg-transparent" />
    </Dialog.Content>
</Dialog.Root>
