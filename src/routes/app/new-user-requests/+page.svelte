<script lang="ts">
    import NewUsersTable from "$lib/components/new-users-table/new-users-table.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
    const { newUserRequests, user } = data;
</script>

<div class="flex justify-center pt-10 mx-10">
    <NewUsersTable data={newUserRequests} {user} />
</div>
