<script lang="ts">
    import CheckIcon from "@lucide/svelte/icons/check";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import { tick } from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { cn } from "$lib/utils.js";

    import { getSemesters } from "$lib/functions/semester.remote";
    import { fallOrSpring } from "$lib/utils";

    const semesters = (await getSemesters()).map(semester => ({
        label: `${fallOrSpring(semester.starts)} ${semester.starts.getFullYear()} (${semester.code})`,
        value: semester.id,
    }));

    let open = $state(false);
    let value = $state("");
    let triggerRef = $state<HTMLButtonElement>(null!);

    const selectedValue = $derived(semesters.find(f => f.value === value)?.label);

    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger() {
        open = false;
        tick().then(() => {
            triggerRef.focus();
        });
    }
</script>

<div class="flex justify-center pt-10">
    <Popover.Root bind:open>
        <Popover.Trigger bind:ref={triggerRef}>
            {#snippet child({ props })}
                <Button
                    {...props}
                    variant="outline"
                    class="w-[200px] justify-between"
                    role="combobox"
                    aria-expanded={open}
                >
                    {selectedValue || "Select a semester..."}
                    <ChevronsUpDownIcon class="opacity-50" />
                </Button>
            {/snippet}
        </Popover.Trigger>
        <Popover.Content class="w-[200px] p-0">
            <Command.Root>
                <Command.Input placeholder="Search semesters..." />
                <Command.List>
                    <Command.Empty>No framework found.</Command.Empty>
                    <Command.Group value="semesters">
                        {#each semesters as sem (sem.value)}
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
</div>
