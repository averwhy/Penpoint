<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";

    const { data, children } = $props();
    const { user } = data;
</script>

<Sidebar.Provider>
    <AppSidebar {user} />
    <Sidebar.Inset>
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <Sidebar.Trigger />
        </header>
        <main class="flex-1">
            {@render children?.()}
        </main>
    </Sidebar.Inset>
</Sidebar.Provider>
