<script lang="ts">
    import type { PageProps } from "./$types";
    import * as Card from "$lib/components/ui/card/index";
    import { Badge } from "$lib/components/ui/badge/index";
    import Button from "$lib/components/ui/button/button.svelte";
    import DateWithRelativeTooltip from "$lib/components/date-with-relative-tooltip.svelte";
    import humanizeDuration from "humanize-duration";
    import { fallOrSpring } from "$lib/utils";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import ClockIcon from "@lucide/svelte/icons/clock";
    import UsersIcon from "@lucide/svelte/icons/users";
    import TicketIcon from "@lucide/svelte/icons/ticket";
    import StarIcon from "@lucide/svelte/icons/star";
    import BuildingIcon from "@lucide/svelte/icons/building";
    import ZapIcon from "@lucide/svelte/icons/zap";

    let { data }: PageProps = $props();
    let semester = $derived(data.semester);
    let stats = $derived(data.stats);
    let isActive = $derived(data.isActive);
    let hasEnded = $derived(data.hasEnded);

    let season = $derived(fallOrSpring(semester.starts));
    let year = $derived(semester.starts.getFullYear());
    let semesterTitle = $derived(`${season} ${year}`);
    let duration = $derived(
        humanizeDuration(semester.ends.getTime() - semester.starts.getTime(), { largest: 2, round: true }),
    );

    function formatDate(date: Date): string {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }

    let daysRemaining = $derived(() => {
        const now = Date.now();
        const diff = semester.ends.getTime() - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    });
</script>

<div class="flex flex-col items-center w-full px-4 py-8">
    <div class="w-full max-w-4xl">
        <div class="flex items-center gap-4 mb-6">
            <Button href="/app/manage/semesters" variant="ghost">← Back</Button>
        </div>

        <div class="flex items-center gap-3 flex-wrap mb-6">
            <h1 class="text-3xl font-bold">{semesterTitle}</h1>
            <Badge variant="outline" class="text-sm">Code: {semester.code}</Badge>
            {#if isActive}
                <Badge variant="default" class="bg-green-800 text-white">Active</Badge>
            {:else if hasEnded}
                <Badge variant="default">Ended</Badge>
            {:else}
                <Badge variant="secondary">Upcoming</Badge>
            {/if}
        </div>

        <Card.Root class="mb-6">
            <Card.Header>
                <Card.Title>Semester Details</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-4">
                <div class="flex items-center gap-3">
                    <CalendarIcon class="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p class="font-medium">{formatDate(semester.starts)} — {formatDate(semester.ends)}</p>
                        <p class="text-sm text-muted-foreground">
                            {#if isActive}
                                {daysRemaining()} day{daysRemaining() !== 1 ? "s" : ""} remaining
                            {:else if hasEnded}
                                Ended <DateWithRelativeTooltip date={semester.ends} />
                            {:else}
                                Starts <DateWithRelativeTooltip date={semester.starts} />
                            {/if}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <ClockIcon class="h-5 w-5 text-muted-foreground" />
                    <p class="font-medium">Duration: {duration}</p>
                </div>

                <div class="text-sm text-muted-foreground">
                    Created <DateWithRelativeTooltip date={semester.created_at} />
                </div>
            </Card.Content>
        </Card.Root>

        <h2 class="text-xl font-semibold mb-4">Statistics</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card.Root>
                <Card.Content class="text-5xl">
                    {stats.totalEvents}
                </Card.Content>
                <Card.Footer class="text-xl">Total Events</Card.Footer>
            </Card.Root>

            <Card.Root>
                <Card.Content class="text-5xl">
                    {stats.acceptedEvents}
                </Card.Content>
                <Card.Footer class="text-xl">Accepted Events</Card.Footer>
            </Card.Root>

            <Card.Root>
                <Card.Content class="text-5xl">
                    {stats.uniqueStudents}
                </Card.Content>
                <Card.Footer class="text-xl">Unique Students</Card.Footer>
            </Card.Root>

            <Card.Root>
                <Card.Content class="text-5xl">
                    {stats.totalPointsEarned}
                </Card.Content>
                <Card.Footer class="text-xl">Total Points Earned</Card.Footer>
            </Card.Root>

            <Card.Root>
                <Card.Content class="text-5xl">
                    {stats.totalTaps}
                </Card.Content>
                <Card.Footer class="text-xl">Total Taps</Card.Footer>
            </Card.Root>

            <Card.Root class="">
                <Card.Content class="text-5xl">
                    {stats.clubsParticipating}
                </Card.Content>
                <Card.Footer class="text-xl">Clubs Participating</Card.Footer>
            </Card.Root>
        </div>
        <h2 class="text-xl font-semibold my-4">Export <br/> <a class="text-link-primary hover:underline hover:text-link-hover text-sm" href={""} target="_blank">Learn more</a></h2>
        <Card.Root>
            <Card.Content>
                <flex class="flex flex-col gap-4 max-w-3/4 mx-auto">
                    <Button variant="outline" href={""}>Export top point earners (CSV)</Button>
                </flex>
            </Card.Content>
        </Card.Root>
    </div>
</div>
