<script lang="ts">
    import * as Card from "$lib/components/ui/card/index";
    import * as Popover from "$lib/components/ui/popover/index";
    import * as Command from "$lib/components/ui/command/index";
    import { Button } from "$lib/components/ui/button/index";
    import { Input } from "$lib/components/ui/input/index";
    import { Label } from "$lib/components/ui/label/index";
    import { Textarea } from "$lib/components/ui/textarea/index";
    import { Calendar } from "$lib/components/ui/calendar/index";
    import { cn } from "$lib/utils";
    import { tick } from "svelte";
    import { DateFormatter, type DateValue, getLocalTimeZone } from "@internationalized/date";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import CheckIcon from "@lucide/svelte/icons/check";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import { createEvent } from "$lib/functions/events.remote";
    import { toast } from "svelte-sonner";
    import type { PageProps } from "./$types";
    import SemesterSelector from "$lib/components/semester-selector.svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index";
    import BulbIcon from "@lucide/svelte/icons/lightbulb";

    const { data }: PageProps = $props();
    const { user, userClub, semesters } = data;

    // generate a fresh UUID on refresh to prevent duplicate event submissions
    const newEventId = crypto.randomUUID();

    let pending = $state(false);

    const df = new DateFormatter("en-US", {
        dateStyle: "long",
    });

    // Building data
    const buildings = [
        { label: "Student Center", value: "Student Center" },
        { label: "Green Center", value: "Green Center" },
        { label: "Paul Hall", value: "Paul Hall" },
        { label: "ACC", value: "ACC" },
    ];

    // Form state
    let eventTitle = $state("");
    let selectedBuilding = $state("");
    let roomNumber = $state("");
    let eventDate = $state<DateValue | undefined>(undefined);
    let startsAt = $state("12:00");
    let endsAt = $state("13:00");
    let eventFlyer = $state<File | null>(null);
    let specialRequests = $state("");
    let selectedSemester = $state<(typeof data.semesters)[number] | undefined>(undefined);

    // Popover states
    let buildingOpen = $state(false);
    let dateOpen = $state(false);

    // Refs for focus management
    let buildingTriggerRef = $state<HTMLButtonElement>(null!);
    let dateTriggerRef = $state<HTMLButtonElement>(null!);

    // Derived values
    const selectedBuildingLabel = $derived(buildings.find(b => b.value === selectedBuilding)?.label);

    function closeAndFocusBuilding() {
        buildingOpen = false;
        tick().then(() => buildingTriggerRef?.focus());
    }

    function closeAndFocusDate() {
        dateOpen = false;
        tick().then(() => dateTriggerRef?.focus());
    }

    // combine our specified time (from the inputs below) and the specified date
    function convertToDate(
        time: string,
        date: DateValue | undefined,
    ): Date | undefined {
        if (date === undefined) return undefined;

        const [hourStr, minuteStr] = time.split(":");
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (isNaN(hour) || isNaN(minute)) return undefined;

        if (time.includes("PM") && hour < 12) {
            hour += 12;
        } else if (time.includes("AM") && hour === 12) {
            hour = 0;
        }

        const dateObj = new Date(date.year, date.month - 1, date.day, hour, minute);
        return dateObj;
    }

    async function handleSubmit() {
        const startDate = convertToDate(startsAt, eventDate);
        const endDate = convertToDate(endsAt, eventDate);

        if (!startDate || !endDate) {
            // In the case of either date being invalid, it would mean that no date was selected (since the times have default values)
            toast.error("Please select a valid date for the event");
            return;
        }

        if (userClub === undefined) {
            toast.error("You must be part of a club to create an event! Contact SGA for help");
            return;
        }

        if (selectedSemester === undefined) {
            toast.error("Please select a semester for the event");
            return;
        }

        // Check flyer file type and size (will be checked on the server too, duh)
        if (eventFlyer === null) {
            toast.error("Please upload a flyer for the event");
            return;
        }

        if (eventFlyer.size > 5 * 1024 * 1024) {
            toast.error("Flyer file size exceeds the maximum limit of 5MB");
            return;
        }

        if (!["image/png", "image/jpg", "image/jpeg"].includes(eventFlyer.type)) {
            toast.error("Invalid flyer file type. Please upload a PNG, JPG, or JPEG image");
            return;
        }

        pending = true;

        const newEvent = await createEvent({
            id: newEventId,
            clubId: userClub?.id,
            semesterId: selectedSemester?.id,
            eventTitle,
            building: selectedBuilding,
            roomNumber,
            flyerFile: eventFlyer!,
            startDateTime: startDate,
            endDateTime: endDate,
            specialRequests,
        });

        toast.success("Event created successfully!", {
            action: {
                label: "View new event",
                onClick: () => {
                    window.location.href = `/app/events/${newEvent.id}`;
                },
            },
        });

        pending = false;
    }
</script>

<div class="flex justify-center pt-10 px-4">
    <Card.Root class="w-full max-w-2xl">
        <Card.Header>
            <Card.Title class="text-2xl flex justify-between items-center">
                Create a New Event
                <SemesterSelector {semesters} bind:selected={selectedSemester} selectActive={true} />
            </Card.Title>
        </Card.Header>
        <Card.Content class="space-y-6">
            <!-- Event Title -->
            <div class="space-y-2">
                <Label>Event Title</Label>
                <Input bind:value={eventTitle} required placeholder="Enter event title" class="" />
            </div>

            <!-- Event Location -->
            <div class="space-y-2">
                <Label>Event Location</Label>
                <div class="flex gap-2">
                    <!-- Building Selector -->
                    <div class="flex-1">
                        <Popover.Root bind:open={buildingOpen}>
                            <Popover.Trigger bind:ref={buildingTriggerRef}>
                                {#snippet child({ props })}
                                    <Button
                                        {...props}
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={buildingOpen}
                                        class="w-full justify-between"
                                    >
                                        {selectedBuildingLabel ?? "Select building"}
                                        <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                {/snippet}
                            </Popover.Trigger>
                            <Popover.Content class="w-[200px] p-0">
                                <Command.Root>
                                    <Command.Input placeholder="Search building..." />
                                    <Command.Empty>No building found.</Command.Empty>
                                    <Command.Group>
                                        {#each buildings as building}
                                            <Command.Item
                                                value={building.value}
                                                onSelect={() => {
                                                    selectedBuilding = building.value;
                                                    closeAndFocusBuilding();
                                                }}
                                            >
                                                <CheckIcon
                                                    class={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedBuilding !== building.value && "text-transparent",
                                                    )}
                                                />
                                                {building.label}
                                            </Command.Item>
                                        {/each}
                                    </Command.Group>
                                </Command.Root>
                            </Popover.Content>
                        </Popover.Root>
                    </div>

                    <!-- Room Number -->
                    <div class="flex-1">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger>
                                    <Input id="room-number" bind:value={roomNumber} placeholder="Room" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    Unless you select a location like "Robert Frost Green Space", you should specify a
                                    room number.
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>
                </div>
            </div>

            <!-- Event Date -->
            <div class="space-y-2 my-0">
                <Label>Event Date</Label>
                <Popover.Root bind:open={dateOpen}>
                    <Popover.Trigger bind:ref={dateTriggerRef}>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="outline"
                                class={cn(
                                    "w-full justify-start text-left font-normal",
                                    !eventDate && "text-muted-foreground",
                                )}
                            >
                                <CalendarIcon class="mr-2 h-4 w-4" />
                                {eventDate ? df.format(eventDate.toDate(getLocalTimeZone())) : "Pick a date"}
                            </Button>
                        {/snippet}
                    </Popover.Trigger>
                    <Popover.Content class="w-auto p-0">
                        <Calendar
                            bind:value={eventDate}
                            type="single"
                            initialFocus
                            onValueChange={v => {
                                eventDate = v;
                                closeAndFocusDate();
                            }}
                        />
                    </Popover.Content>
                </Popover.Root>
            </div>

            <p class="text-sm text-muted-foreground my-2">
                <span><BulbIcon class="inline h-4 w-4 mr-[1px] mb-1" /></span> Multi-day event? Create separate events for
                each day to ensure clarity for students.
            </p>
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label>Starts at</Label>
                    <Input
                        type="time"
                        bind:value={startsAt}
                        step={60}
                        class="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                </div>
                <div class="space-y-2">
                    <Label>Ends at</Label>
                    <Input
                        type="time"
                        bind:value={endsAt}
                        step={60}
                        class="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                </div>
            </div>
            <div class="space-y-2">
                <Label>Flyer Upload <span class="text-xs text-muted-foreground">png, jpg, jpeg only. max size of 5MB</span></Label>
                <Input type="file" name="flyer" bind:value={eventFlyer} required accept="image/*"/>
            </div>
            <!-- Special Requests -->
            <div class="space-y-2">
                <Label for="special-requests">Special Requests</Label>
                <Textarea
                    id="special-requests"
                    bind:value={specialRequests}
                    placeholder="Different point value request? Specific location for senators scanning?"
                    rows={4}
                />
            </div>
        </Card.Content>
        <Card.Footer class="flex justify-end gap-2">
            <Button variant="default" href="/app/events">Cancel</Button>
            <Button variant="outline" onclick={handleSubmit} disabled={pending}>Create Event</Button>
        </Card.Footer>
    </Card.Root>
</div>
