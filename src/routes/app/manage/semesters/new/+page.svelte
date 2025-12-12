<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import { fallOrSpring } from "$lib/utils";
    import type { PageProps } from "./$types";
    import DateWithRelativeTooltip from "$lib/components/date-with-relative-tooltip.svelte";
    import * as Card from "$lib/components/ui/card/index";
    import * as Select from "$lib/components/ui/select/index";
    import * as Popover from "$lib/components/ui/popover/index";
    import { Label } from "$lib/components/ui/label/index";
    import { Calendar } from "$lib/components/ui/calendar/index";
    import { cn } from "$lib/utils";
    import { tick } from "svelte";
    import { DateFormatter, type DateValue, getLocalTimeZone } from "@internationalized/date";
    import CalendarIcon from "@lucide/svelte/icons/calendar";

    const { data }: PageProps = $props();
    const { user, semesters } = data;

    const df = new DateFormatter("en-US", {
        dateStyle: "long",
    });

    let semesterCode = $state("A3");
    let startDate = $state<DateValue | undefined>(undefined);
    let endDate = $state<DateValue | undefined>(undefined);
    let startDateOpen = $state(false);
    let endDateOpen = $state(false);
    let startDateTriggerRef = $state<HTMLButtonElement>(null!);
    let endDateTriggerRef = $state<HTMLButtonElement>(null!);

    function closeAndFocusStartDate() {
        startDateOpen = false;
        tick().then(() => startDateTriggerRef?.focus());
    }

    function closeAndFocusEndDate() {
        endDateOpen = false;
        tick().then(() => endDateTriggerRef?.focus());
    }

    // Validation
    let errorText = $derived.by(() => {
        if (!startDate || !endDate) return "";

        const start = new Date(startDate.year, startDate.month - 1, startDate.day);
        const end = new Date(endDate.year, endDate.month - 1, endDate.day);

        // Start date should never be after end date
        if (start > end) {
            return "Start date cannot be after end date";
        }

        // Duration should never be negative
        if (end.getTime() - start.getTime() < 0) {
            return "Duration cannot be negative";
        }

        // duration shouldnt exceed 4 months
        if (end.getTime() - start.getTime() > 1000 * 60 * 60 * 24 * 31 * 4) {
            return "Semester duration cannot exceed 4 months";
        }

        // Fall semester (A3) validation
        if (semesterCode === "A3") {
            // Start date should be in August (8) or September (9)
            if (startDate.month !== 8 && startDate.month !== 9) {
                return "Fall semester start date should be in August or September";
            }
            // End date should be in December (12)
            if (endDate.month !== 12) {
                return "Fall semester end date should be in December";
            }
        }

        // Spring semester (A1) validation
        if (semesterCode === "A1") {
            // Start date should be in January (1)
            if (startDate.month !== 1) {
                return "Spring semester start date should be in January";
            }
            // End date should be in April (4) or May (5)
            if (endDate.month !== 4 && endDate.month !== 5) {
                return "Spring semester end date should be in April or May";
            }
        }

        return "";
    });

    // Calculate duration
    let durationText = $derived.by(() => {
        if (!startDate || !endDate) return "";
        const start = new Date(startDate.year, startDate.month - 1, startDate.day);
        const end = new Date(endDate.year, endDate.month - 1, endDate.day);

        let months = 0;
        let days = 0;

        let current = new Date(start);
        while (current < end) {
            const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
            if (nextMonth > end) break;
            months++;
            current = nextMonth;
        }

        days = Math.floor((end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

        return `${months} months and ${days} days`;
    });

    // Calculate preview
    let previewText = $derived.by(() => {
        if (!startDate) return "";
        const year = startDate.year;
        const season = semesterCode === "A3" ? "Fall" : "Spring";
        return `${year} ${season} Semester (${semesterCode})`;
    });

    const semCodes = [
        { label: "A3 (Fall)", value: "A3" },
        { label: "A1 (Spring)", value: "A1" },
    ];

    const triggerContent = $derived(semCodes.find(f => f.value === semesterCode)?.label ?? "Select a term code");
</script>

<div class="flex justify-center py-10 px-4">
    <Card.Root class="w-full max-w-sm">
        <Card.Header>
            <Card.Title>Create New Semester</Card.Title>
            <Card.Description>Add a new semester to your calendar</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-6">
            <!-- Semester Code Dropdown -->
            <div class="space-y-2">
                <Label for="semester-code">Semester Code</Label>
                <Select.Root type="single" bind:value={semesterCode}>
                    <Select.Trigger class="w-full">
                        {triggerContent}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            <Select.Label>Term Codes</Select.Label>
                            {#each semCodes as semCode (semCode.value)}
                                <Select.Item
                                    value={semCode.value}
                                    label={semCode.label}
                                    disabled={semCode.value === "Select a term code"}
                                >
                                    {semCode.label}
                                </Select.Item>
                            {/each}
                        </Select.Group>
                    </Select.Content>
                </Select.Root>
            </div>

            <!-- Semester Start Date -->
            <div class="space-y-2">
                <Label class="text-base font-semibold">Semester Start Date</Label>
                <Popover.Root bind:open={startDateOpen}>
                    <Popover.Trigger bind:ref={startDateTriggerRef}>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="outline"
                                class={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground",
                                )}
                            >
                                <CalendarIcon class="mr-2 h-4 w-4" />
                                {startDate ? df.format(startDate.toDate(getLocalTimeZone())) : "Pick a date"}
                            </Button>
                        {/snippet}
                    </Popover.Trigger>
                    <Popover.Content class="w-auto p-0">
                        <Calendar
                            bind:value={startDate}
                            type="single"
                            initialFocus
                            onValueChange={v => {
                                startDate = v;
                                closeAndFocusStartDate();
                            }}
                        />
                    </Popover.Content>
                </Popover.Root>
            </div>

            <!-- Semester End Date -->
            <div class="space-y-2">
                <Label class="text-base font-semibold">Semester End Date</Label>
                <Popover.Root bind:open={endDateOpen}>
                    <Popover.Trigger bind:ref={endDateTriggerRef}>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="outline"
                                class={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground",
                                )}
                            >
                                <CalendarIcon class="mr-2 h-4 w-4" />
                                {endDate ? df.format(endDate.toDate(getLocalTimeZone())) : "Pick a date"}
                            </Button>
                        {/snippet}
                    </Popover.Trigger>
                    <Popover.Content class="w-auto p-0">
                        <Calendar
                            bind:value={endDate}
                            type="single"
                            initialFocus
                            onValueChange={v => {
                                endDate = v;
                                closeAndFocusEndDate();
                            }}
                        />
                    </Popover.Content>
                </Popover.Root>
            </div>

            <!-- Duration Text -->
            {#if durationText}
                <div class="p-3 bg-muted rounded-md">
                    <p class="text-sm text-muted-foreground">Duration</p>
                    <p class="text-lg font-medium">{durationText}</p>
                </div>
            {/if}

            <!-- Preview Text -->
            {#if previewText}
                <div class="p-3 bg-muted rounded-md">
                    <p class="text-sm text-muted-foreground">Preview</p>
                    <p class="text-lg font-medium">{previewText}</p>
                </div>
            {/if}
        </Card.Content>
        {#if errorText}
            <div class="font-bold justify-center flex">
                <Label class="text-destructive">{errorText}</Label>
            </div>
        {/if}
        <Card.Footer>
            <Button class="w-full" type="submit" variant="success" disabled={!(startDate && endDate && !errorText)}
                >Create Semester</Button
            >
        </Card.Footer>
    </Card.Root>
</div>
