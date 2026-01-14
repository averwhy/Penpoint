<script lang="ts">
    import EventRequestsTable from "$lib/components/event-requests-table/event-requests-table.svelte";
    import HelpFooter from "$lib/components/help-footer.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
    const { eventRequests } = data;
</script>

<div class="justify-center mx-10">
    <EventRequestsTable data={eventRequests} />
    <HelpFooter />
</div>