<script lang="ts">
    import DocsSidebar from "$lib/components/docs-sidebar.svelte";
    import DocsSearch from "$lib/components/docs-search.svelte";

    const { data, children } = $props();

    let docsOpen = $state(false);

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            docsOpen = !docsOpen;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="flex h-full">
    <aside class="w-64 border-r shrink-0">
        <DocsSidebar docEntries={data.docEntries} />
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4"></header>
        <DocsSearch bind:open={docsOpen} bind:docItems={data.docItems} />
        <main class="flex-1 overflow-y-auto p-6 prose dark:prose-invert max-w-none">
            {@render children?.()}
        </main>
    </div>
</div>
