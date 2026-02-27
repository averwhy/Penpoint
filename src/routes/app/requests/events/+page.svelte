<script lang="ts">
    import EventRequestsTable from "$lib/components/event-requests-table/event-requests-table.svelte";
    import HelpFooter from "$lib/components/help-footer.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
    let eventRequests = $derived(data.eventRequests);
</script>

<div class="justify-center pt-10 mx-10">
    <EventRequestsTable data={eventRequests} />
    <HelpFooter />
</div>