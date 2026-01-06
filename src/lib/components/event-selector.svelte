<script lang="ts">
    import { tick } from "svelte";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { Button } from "$lib/components/ui/button/index";
    import CheckIcon from "@lucide/svelte/icons/check";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import { cn, fallOrSpring } from "$lib/utils";
    import type { Event } from "$lib/models";
    import type { ButtonVariant } from "$lib/components/ui/button/index";

    interface Props {
        events?: Event[];
        value?: string;
        selected?: Event | undefined;
        placeholder?: string;
        disabled?: boolean;
        widthClass?: string;
        variant?: ButtonVariant;
        class?: string;
        selectActive?: boolean;
    }

    let {
        events = $bindable<Event[]>([]),
        value = $bindable(""),
        selected = $bindable<Event | undefined>(undefined),
        placeholder = $bindable("Select an event..."),
        disabled = $bindable<boolean>(false),
        widthClass = $bindable("w-[200px]"),
        variant = $bindable<ButtonVariant>("outline"),
        class: className = "",
        selectActive = false,
    }: Props = $props();

    // Internal state
    let open = $state(false);
    let triggerRef = $state<HTMLButtonElement>(null!);

    const eventData = $derived(
        events.map(event => ({
            label: event.name,
            value: event.id,
            data: event,
        })),
    );

    const selectedValue = $derived(eventData.find(f => f.value === value));

    // Auto-select active semester if selectActive is true
    $effect(() => {
        if (selectActive && events.length > 0 && !value) {
            const now = new Date();
            const activeEvent = events.find(ev => {
                const starts = new Date(ev.starts_at);
                const ends = new Date(ev.ends_at);
                return now >= starts && now <= ends;
            });

            if (activeEvent) {
                const activeData = eventData.find(s => s.data.id === activeEvent.id);
                if (activeData) {
                    value = activeData.value;
                    selected = activeData.data;
                }
            }
        }
    });

    function closeAndFocusTrigger() {
        open = false;
        tick().then(() => {
            triggerRef?.focus();
        });
    }

    function handleSelect(val: string) {
        value = val;
        selected = eventData.find(e => e.value === val)?.data;
        closeAndFocusTrigger();
    }
</script>

<div class={className}>
    <Popover.Root bind:open>
        <Popover.Trigger bind:ref={triggerRef}>
            {#snippet child({ props })}
                <Button
                    {...props}
                    {variant}
                    class={cn(widthClass, "justify-between")}
                    role="combobox"
                    aria-expanded={open}
                    {disabled}
                >
                    {selectedValue?.label || placeholder}
                    <ChevronsUpDownIcon class="opacity-50" />
                </Button>
            {/snippet}
        </Popover.Trigger>
        <Popover.Content class={cn(widthClass, "p-0")}>
            <Command.Root>
                <Command.Input placeholder="Search events..." />
                <Command.List>
                    <Command.Empty>No event found.</Command.Empty>
                    <Command.Group value="events">
                        {#each eventData as event (event.value)}
                            <Command.Item value={event.value} onSelect={() => handleSelect(event.value)}>
                                <CheckIcon class={cn(value !== event.value && "text-transparent")} />
                                {event.label}
                            </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.List>
            </Command.Root>
        </Popover.Content>
    </Popover.Root>
</div>
