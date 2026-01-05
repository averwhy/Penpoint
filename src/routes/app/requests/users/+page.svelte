<script lang="ts">
    import NewUsersTable from "$lib/components/new-users-table/new-users-table.svelte";
    import HelpFooter from "$lib/components/help-footer.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
</script>

<div class="flex justify-center pt-10 mx-10">
    <NewUsersTable data={data.newUserRequests} user={data.user} />
    <HelpFooter />
</div>
