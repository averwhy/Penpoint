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
    const { user, semesters } = data;

    let semesterValue = $state("");
    let selectedSemester = $state<(typeof semesters)[number] | undefined>(undefined);
    const semesterData = semesters.map(semester => ({
        label: `${fallOrSpring(semester.starts)} ${new Date(semester.starts).getFullYear()} (${semester.code})`,
        value: `${fallOrSpring(semester.starts)} ${new Date(semester.starts).getFullYear()} (${semester.code})`,
        data: semester,
    }));
    const selectedValue = $derived(semesterData.find(f => f.value === semesterValue));

    let events = $state<Event[]>([]);

    $effect(() => {
        const sem = selectedSemester ?? selectedValue?.data;
        if (sem) {
            console.log(
                "Fetching events for semester:",
                `${fallOrSpring(sem.starts)} ${new Date(sem.starts).getFullYear()} (${sem.code})`,
            );
            getEvents({ semesterId: sem.id }).then(result => {
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
