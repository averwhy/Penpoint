<script lang="ts">
    import * as Card from "$lib/components/ui/card/index";
    import * as Collapsible from "$lib/components/ui/collapsible/index";
    import type { PageProps } from "./$types";
    import ClubCard from "$lib/components/club-card.svelte";
    import { Separator } from "$lib/components/ui/separator/index";
    import humanizeDuration from "humanize-duration";
    import { Badge } from "$lib/components/ui/badge/index";
    import FlyerViewer from "$lib/components/flyer-viewer.svelte";
    import ChevronsRight from "@lucide/svelte/icons/chevrons-right";
    import ChevronsDown from "@lucide/svelte/icons/chevrons-down";
    import { toast } from "svelte-sonner";

    const { data }: PageProps = $props();
    let events = $derived(data.data);
    let upcomingEvents = $derived((events ?? []).filter(entry => entry.event.ends_at.getTime() >= Date.now()));
    let pastEvents = $derived((events ?? []).filter(entry => entry.event.ends_at.getTime() < Date.now()));
    let pastEventsOpen = $state(false);

    function isSameDay(date1: Date, date2: Date): boolean {
        return date1.toDateString() === date2.toDateString();
    }

    function formatDate(date: Date): string {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    }

    function formatTime(date: Date): string {
        if (date.getMinutes() == 0) return date.toLocaleTimeString("en-US", { hour: "numeric" });
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }

    $effect(() => {
        if (data.unavailable) {
            toast.error("Events data is currently unavailable. Please try again later.", {
                duration: 10000,
            });
        }
    });
</script>

<div class="flex justify-center w-full px-4 py-8">
    <div class="w-full max-w-7xl mt-20">
        <h1 class="text-7xl mb-5">
            Events
            <span class="text-lg"> with Penmen Pride</span>
        </h1>
        {#if events && events.length > 0}
            {#if upcomingEvents.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {#each upcomingEvents as entry, index}
                        {#if index === 0 || !isSameDay(upcomingEvents[index - 1].event.starts_at, entry.event.starts_at)}
                            <div class="col-span-full">
                                <div class="flex items-center gap-4 my-1">
                                    <h2 class="text-lg font-semibold whitespace-nowrap">
                                        {formatDate(entry.event.starts_at)}
                                        {#if isSameDay(entry.event.starts_at, new Date())}
                                            <Badge variant="outline" class="border-green-800 text-white">Today</Badge>
                                        {/if}
                                    </h2>
                                    <Separator class="bg-foreground max-w-dvh" />
                                </div>
                            </div>
                        {/if}
                        <Card.Root class="flex flex-row overflow-hidden">
                            <div class="flex-1">
                                <Card.Header>
                                    <Card.Title class="text-lg">
                                        {entry.event.name}
                                    </Card.Title>
                                    <span class="text-md">
                                        <ClubCard
                                            title={entry.club_acronym && entry.club_acronym.length > 0
                                                ? entry.club_acronym
                                                : entry.club_name}
                                            club={entry.event.club_id}
                                            from="events"
                                        />
                                    </span>
                                </Card.Header>
                                <Card.Content class="text-sm pt-1">
                                    {formatTime(entry.event.starts_at)} to {formatTime(entry.event.ends_at)} ({humanizeDuration(
                                        entry.event.ends_at.getTime() - entry.event.starts_at.getTime(),
                                    )})
                                    {#if Date.now() >= entry.event.starts_at.getTime() && Date.now() <= entry.event.ends_at.getTime()}
                                        <Badge variant="secondary" class="bg-green-800 text-white">Happening Now</Badge>
                                    {/if}
                                </Card.Content>
                                <Card.Footer>
                                    <Card.Description>
                                        {entry.event.point_value} points
                                    </Card.Description>
                                </Card.Footer>
                            </div>
                            {#if entry.hasFlyer && entry.event.image_filename}
                                <div class="w-24 h-full shrink-0 pr-5">
                                    <FlyerViewer
                                        src="/uploads/events/{entry.event.image_filename}"
                                        alt="Flyer for {entry.event.name}"
                                        class="w-full h-full object-cover"
                                    />
                                </div>
                            {/if}
                        </Card.Root>
                    {/each}
                </div>
            {:else}
                <div class="text-3xl mt-20">No upcoming events right now.</div>
            {/if}

            {#if pastEvents.length > 0}
                <Collapsible.Root class="mt-8" bind:open={pastEventsOpen}>
                    <Collapsible.Trigger
                        class="w-full text-left text-lg font-semibold border border-border rounded-md px-4 py-3 hover:bg-muted/40 transition"
                    >
                        <span class="inline-flex items-center gap-2">
                            Past Events ({pastEvents.length})
                            {#if pastEventsOpen}
                                <ChevronsDown class="inline" />
                            {:else}
                                <ChevronsRight class="inline" />
                            {/if}
                        </span>
                    </Collapsible.Trigger>
                    <Collapsible.Content class="mt-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {#each pastEvents as entry, index}
                                {#if index === 0 || !isSameDay(pastEvents[index - 1].event.starts_at, entry.event.starts_at)}
                                    <div class="col-span-full">
                                        <div class="flex items-center gap-4 my-1">
                                            <h2 class="text-lg font-semibold whitespace-nowrap">
                                                {formatDate(entry.event.starts_at)}
                                            </h2>
                                            <Separator class="bg-foreground max-w-dvh" />
                                        </div>
                                    </div>
                                {/if}
                                <Card.Root class="flex flex-row overflow-hidden opacity-85">
                                    <div class="flex-1">
                                        <Card.Header>
                                            <Card.Title class="text-lg">
                                                {entry.event.name}
                                            </Card.Title>
                                            <span class="text-md">
                                                <ClubCard
                                                    title={entry.club_acronym && entry.club_acronym.length > 0
                                                        ? entry.club_acronym
                                                        : entry.club_name}
                                                    club={entry.event.club_id}
                                                    from="events"
                                                />
                                            </span>
                                        </Card.Header>
                                        <Card.Content class="text-sm pt-1">
                                            {formatTime(entry.event.starts_at)} to {formatTime(entry.event.ends_at)} ({humanizeDuration(
                                                entry.event.ends_at.getTime() - entry.event.starts_at.getTime(),
                                            )})
                                        </Card.Content>
                                        <Card.Footer>
                                            <Card.Description>
                                                {entry.event.point_value} points
                                            </Card.Description>
                                        </Card.Footer>
                                    </div>
                                    {#if entry.hasFlyer && entry.event.image_filename}
                                        <div class="w-24 h-full shrink-0 pr-5">
                                            <FlyerViewer
                                                src="/uploads/events/{entry.event.image_filename}"
                                                alt="Flyer for {entry.event.name}"
                                                class="w-full h-full object-cover"
                                            />
                                        </div>
                                    {/if}
                                </Card.Root>
                            {/each}
                        </div>
                    </Collapsible.Content>
                </Collapsible.Root>
            {/if}
        {:else if (data.data === undefined)}
            <div class="text-3xl mt-20">There's no semester that's currently active or upcoming. Check back later!</div>
        {:else}
            <div class="text-3xl mt-20">Something went wrong when retrieving event data. Check back later!</div>
        {/if}
    </div>
</div>
