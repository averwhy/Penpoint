<script lang="ts">
    import CheckIcon from "@lucide/svelte/icons/check";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import { tick } from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index";
    import { cn } from "$lib/utils";
    import { fallOrSpring } from "$lib/utils";
    import type { PageProps } from "./$types";
    import EventsTable from "$lib/components/events-table/events-table.svelte";
    import { getEvents } from "$lib/functions/events.remote";

    const { data }: PageProps = $props();
    const { user, semesters } = data;

    const semesterData = semesters.map(semester => ({
        label: `${fallOrSpring(semester.starts)} ${new Date(semester.starts).getFullYear()} (${semester.code})`,
        value: `${fallOrSpring(semester.starts)} ${new Date(semester.starts).getFullYear()} (${semester.code})`,
        data: semester,
        // the value has to be the same because the default search algorithm searches by value for some reason
    }));

    let open = $state(false);
    let value = $state("");
    let triggerRef = $state<HTMLButtonElement>(null!);

    const selectedValue = $derived(semesterData.find(f => f.value === value));

    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger() {
        open = false;
        tick().then(() => {
            triggerRef.focus();
        });
    }

    // TODO use selectedValue?.data to fetch events for the selected semester (and based on users club)
    let events = [];

</script>

<div class="flex justify-center pt-10">
    <Popover.Root bind:open>
        <Popover.Trigger bind:ref={triggerRef}>
            {#snippet child({ props })}
                <Button
                    {...props}
                    variant="ghost"
                    class="w-[200px] justify-between"
                    role="combobox"
                    aria-expanded={open}
                >
                    {selectedValue?.label || "Select a semester..."}
                    <ChevronsUpDownIcon class="opacity-50" />
                </Button>
            {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-[200px] p-0">
            <Command.Root>
                <Command.Input placeholder="Search semesters..." />
                <Command.List>
                    <Command.Empty>No semester found.</Command.Empty>
                    <Command.Group value="semesters">
                        {#each semesterData as sem (sem.value)}
                            <Command.Item
                                value={sem.value}
                                onSelect={() => {
                                    value = sem.value;
                                    closeAndFocusTrigger();
                                }}
                            >
                                <CheckIcon class={cn(value !== sem.value && "text-transparent")} />
                                {sem.label}
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.List>
            </Command.Root>
        </Popover.Content>
    </Popover.Root>

    <!-- <EventsTable /> -->
</div>
