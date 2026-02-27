<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import { fallOrSpring } from "$lib/utils";
    import type { PageProps } from "./$types";
    import SemestersTable from "$lib/components/semesters-table/semesters-table.svelte";
    import { getEvents } from "$lib/functions/events.remote";
    import { Event } from "$lib/models";
    import HelpFooter from "$lib/components/help-footer.svelte";

    const { data }: PageProps = $props();
    let semesters = $derived(data.semesters);

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
    <Button variant="success" class="ml-auto" href="/app/manage/semesters/new">Create New Semester</Button>
</div>

<div class="justify-center mx-10">
    <SemestersTable data={semesters} />
    <HelpFooter class="mb-6" />
</div>
