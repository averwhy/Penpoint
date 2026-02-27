<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import { fallOrSpring } from "$lib/utils";
    import type { PageProps } from "./$types";
    import EventsTable from "$lib/components/events-table/events-table.svelte";
    import { getEvents } from "$lib/functions/events.remote";
    import { Event } from "$lib/models";
    import SemesterSelector from "$lib/components/semester-selector.svelte";
    import HelpFooter from "$lib/components/help-footer.svelte";

    const { data }: PageProps = $props();
    const semesters = $derived(data.semesters);

    let semesterValue = $state("");
    let selectedSemester = $state<(typeof semesters)[number] | undefined>(undefined);

    let events = $state<Event[]>([]);

    $effect(() => {
        if (selectedSemester) {
            getEvents({ semesterId: selectedSemester.id }).then(result => {
                events = result;
            });
        } else {
            events = [];
        }
    });
</script>

<div class="flex pt-10 mx-10">
    <SemesterSelector
        bind:value={semesterValue}
        bind:selected={selectedSemester}
        {semesters}
        selectActive={true}
        variant="secondary"
    />

    <Button variant="success" class="ml-auto" href="/app/events/new">Create New Event</Button>
</div>

<div class="justify-center mx-10">
    <EventsTable data={events} toggleAdmin={true} />
    <HelpFooter class="mb-6" />
</div>
