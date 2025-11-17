<script lang="ts">
    import { tick } from "svelte";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { Button } from "$lib/components/ui/button/index";
    import CheckIcon from "@lucide/svelte/icons/check";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import { cn, fallOrSpring } from "$lib/utils";
    import type { Semester } from "$lib/models";
    import type { ButtonVariant } from "$lib/components/ui/button/index";

    interface Props {
        semesters?: Semester[];
        value?: string;
        selected?: Semester | undefined;
        placeholder?: string;
        disabled?: boolean;
        widthClass?: string;
        variant?: ButtonVariant;
        class?: string;
        selectActive?: boolean;
    }

    let {
        semesters = $bindable<Semester[]>([]),
        value = $bindable(""),
        selected = $bindable<Semester | undefined>(undefined),
        placeholder = $bindable("Select a semester..."),
        disabled = $bindable<boolean>(false),
        widthClass = $bindable("w-[200px]"),
        variant = $bindable<ButtonVariant>("ghost"),
        class: className = "",
        selectActive = false,
    }: Props = $props();

    // Internal state
    let open = $state(false);
    let triggerRef = $state<HTMLButtonElement>(null!);

    const semesterData = $derived(
        semesters.map(semester => ({
            label: `${fallOrSpring(semester.starts)} ${new Date(semester.starts).getFullYear()} (${semester.code})`,
            value: `${fallOrSpring(semester.starts)} ${new Date(semester.starts).getFullYear()} (${semester.code})`,
            data: semester,
        })),
    );

    const selectedValue = $derived(semesterData.find(f => f.value === value));

    // Auto-select active semester if selectActive is true
    $effect(() => {
        if (selectActive && semesters.length > 0 && !value) {
            const now = new Date();
            const activeSemester = semesters.find(sem => {
                const starts = new Date(sem.starts);
                const ends = new Date(sem.ends);
                return now >= starts && now <= ends;
            });

            if (activeSemester) {
                const activeData = semesterData.find(s => s.data.id === activeSemester.id);
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
        selected = semesterData.find(s => s.value === val)?.data;
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
                <Command.Input placeholder="Search semesters..." />
                <Command.List>
                    <Command.Empty>No semester found.</Command.Empty>
                    <Command.Group value="semesters">
                        {#each semesterData as sem (sem.value)}
                            <Command.Item value={sem.value} onSelect={() => handleSelect(sem.value)}>
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
