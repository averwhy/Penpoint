<script lang="ts">
    import DocsSidebar from "$lib/components/docs-sidebar.svelte";

    const { data, children } = $props();
</script>

<div class="flex h-full">
    <aside class="w-64 border-r shrink-0">
        <DocsSidebar docEntries={data.docEntries} />
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4"></header>
        <main class="flex-1 overflow-y-auto p-6 prose dark:prose-invert max-w-none">
            {@render children?.()}
        </main>
    </div>
</div>
