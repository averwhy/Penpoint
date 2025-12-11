<script lang="ts">
    import type { PageProps } from "./$types";
    import UsersTable from "$lib/components/users-table/users-table.svelte";
    import HelpFooter from "$lib/components/help-footer.svelte";

    const { data }: PageProps = $props();
    const { users } = data;
</script>

<div class="justify-center mx-10">
    <UsersTable data={users} />
    <HelpFooter class="mb-6" />
</div>
