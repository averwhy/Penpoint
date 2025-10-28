<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";
    import { getUser } from "$lib/functions/user/get.remote";
    import { redirect } from "@sveltejs/kit";

    const user = await getUser();
    let { children } = $props();
</script>

{#if user}
    <Sidebar.Provider>
        <AppSidebar />
        <main>
            <Sidebar.Trigger />
            {@render children?.()}
        </main>
    </Sidebar.Provider>
{:else}
    {redirect(303, "Login is required to access this page")}
{/if}
