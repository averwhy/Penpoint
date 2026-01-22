<script lang="ts">
    import type { PageProps } from "./$types";
    import * as Tabs from "$lib/components/ui/tabs/index";
    import * as Card from "$lib/components/ui/card/index";
    import { Badge } from "$lib/components/ui/badge/index";
    import FlyerViewer from "$lib/components/flyer-viewer.svelte";
    import ClubCard from "$lib/components/club-card.svelte";
    import humanizeDuration from "humanize-duration";
    import DateWithRelativeTooltip from "$lib/components/date-with-relative-tooltip.svelte";
    import MapPinIcon from "@lucide/svelte/icons/map-pin";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import StarIcon from "@lucide/svelte/icons/star";
    import Button from "$lib/components/ui/button/button.svelte";

    let { data }: PageProps = $props();
    let { event, club, hasFlyer } = data;

    let activeTab = $state("info");

    function formatDate(date: Date): string {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }

    function formatTime(date: Date): string {
        if (date.getMinutes() === 0) return date.toLocaleTimeString("en-US", { hour: "numeric" });
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }

    const isHappeningNow = $derived(Date.now() >= event.starts_at.getTime() && Date.now() <= event.ends_at.getTime());

    const hasEnded = $derived(Date.now() > event.ends_at.getTime());

    const duration = $derived(humanizeDuration(event.ends_at.getTime() - event.starts_at.getTime(), { largest: 2 }));
</script>

<div class="flex flex-col items-center w-full px-4 py-8">
    <div class="w-full max-w-4xl">
        <Tabs.Root bind:value={activeTab} class="w-full">
            <div class="flex items-center gap-4 mb-6">
                <Button href="/app/club" variant="ghost">← Back</Button>
                <div class="flex flex-1 justify-center">
                    <Tabs.List>
                        <Tabs.Trigger value="info">Info</Tabs.Trigger>
                        <Tabs.Trigger value="stats">Statistics</Tabs.Trigger>
                    </Tabs.List>
                </div>
            </div>

            <Tabs.Content value="info">
                <div class="flex flex-col lg:flex-row gap-6">
                    {#if hasFlyer && event.image_filename}
                        <div class="lg:w-1/3">
                            <FlyerViewer
                                src="/uploads/events/{event.image_filename}"
                                alt="Flyer for {event.name}"
                                class="w-full rounded-lg"
                            />
                        </div>
                    {/if}

                    <div class="flex-1 space-y-6">
                        <div>
                            <div class="flex items-center gap-3 flex-wrap mb-2">
                                <h1 class="text-3xl font-bold">{event.name}</h1>
                                {#if isHappeningNow}
                                    <Badge variant="default" class="bg-green-800 text-white">Happening Now</Badge>
                                {:else if hasEnded}
                                    <Badge variant="default">Ended</Badge>
                                {/if}
                            </div>
                            <div class="text-foreground">
                                <ClubCard title={club.acronym ?? club.name} clubId={club} />
                            </div>
                        </div>

                        <Card.Root>
                            <Card.Content class="pt-6 space-y-4">
                                <div class="flex items-center gap-3">
                                    <CalendarIcon class="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p class="font-medium">{formatDate(event.starts_at)}</p>
                                        <p class="text-sm text-muted-foreground">
                                            <DateWithRelativeTooltip date={event.starts_at} reverse />
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <ClockIcon class="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p class="font-medium">
                                            {formatTime(event.starts_at)} to {formatTime(event.ends_at)}
                                        </p>
                                        <p class="text-sm text-muted-foreground">{duration}</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <MapPinIcon class="h-5 w-5 text-muted-foreground" />
                                    <p class="font-medium">{event.location}</p>
                                </div>

                                <div class="flex items-center gap-3">
                                    <StarIcon class="h-5 w-5 text-muted-foreground" />
                                    <p class="font-medium">
                                        {event.point_value} point{event.point_value !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </Card.Content>
                        </Card.Root>
                        <div class="text-sm text-muted-foreground">
                            Created <DateWithRelativeTooltip date={event.created_at} />
                        </div>
                        <div class="flex justify-end gap-4">
                            <Button variant="secondary">Change Date</Button>
                            <Button variant="secondary">Change Times</Button>
                            <Button variant="secondary">Change Points</Button>
                            <Button variant="secondary">Change Location</Button>
                            {#if hasFlyer && event.image_filename}
                                <Button variant="secondary">Change Flyer</Button>
                            {:else}
                                <Button variant="secondary">Add Flyer</Button>
                            {/if}
                            <Button variant="destructive">Delete Event</Button>
                        </div>
                    </div>
                </div>
            </Tabs.Content>

            <Tabs.Content value="stats">
                <div class="flex items-center justify-center h-64 text-muted-foreground">
                    <p>Statistics coming soon...</p>
                </div>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</div>
