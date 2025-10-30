<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";

    const { data, children } = $props();
    const { user } = data;
</script>

<Sidebar.Provider>
    <AppSidebar {user} />
    <main>
        <Sidebar.Trigger />
        {@render children?.()}
    </main>
</Sidebar.Provider>
