<script lang="ts">
    import * as Card from "$lib/components/ui/card/index";
    import type { PageProps } from "./$types";
    import ClubCard from "$lib/components/club-card.svelte";
    import { Separator } from "$lib/components/ui/separator/index";
    import humanizeDuration from "humanize-duration";
    import { Badge } from "$lib/components/ui/badge/index";
    import { date } from "zod";

    const { data }: PageProps = $props();
    const events = data.data;

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
</script>

<div class="flex justify-center w-full px-4 py-8">
    <div class="w-full max-w-7xl mt-20">
        <h1 class="text-7xl mb-5">
            Events
            <span class="text-lg"> with Penmen Pride</span>
        </h1>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each events as entry, index}
                {#if index === 0 || !isSameDay(events[index - 1].event.starts_at, entry.event.starts_at)}
                    <div class="col-span-full">
                        <div class="flex items-center gap-4 my-1">
                            <h2 class="text-lg font-semibold whitespace-nowrap pb-1">
                                {formatDate(entry.event.starts_at)}
                                {#if isSameDay(entry.event.starts_at, new Date())}
                                <Badge variant="outline" class="border-green-800 text-white">Today</Badge>
                                {/if}
                            </h2>
                            <Separator class="bg-foreground max-w-dvh" />
                        </div>
                    </div>
                {/if}
                <Card.Root>
                    <Card.Header>
                        <Card.Title class="text-lg">
                            {entry.event.name}
                        </Card.Title>
                        <Card.Description>
                            <ClubCard title={entry.club_name} id={entry.event.club_id} />
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="text-sm">
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
                </Card.Root>
            {/each}
        </div>
    </div>
</div>
