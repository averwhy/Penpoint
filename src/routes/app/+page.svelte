<script lang="ts">
    import DateWithRelativeTooltip from "$lib/components/date-with-relative-tooltip.svelte";
    import * as Card from "$lib/components/ui/card/index";
    import { hydratable } from "svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
    const { club, platform, user, userClubs } = data;

    const nameGreetings = [
        "Hey there, ",
        "Welcome back, ",
        "Good to see you, ",
        "Sup, ",
        "Hi there, ",
        "Howdy, ",
        "What's up, ",
        "Ahoy, ",
        "Today's a good day, ",
    ];

    const greeting = hydratable("greeting", () => nameGreetings[Math.floor(Math.random() * nameGreetings.length)]);

    const theDay: string = new Date().toLocaleDateString("en-US", { weekday: "long" });
</script>

<div>
    <div class="flex items-center justify-center pt-20">
        <div class="text-center">
            <h1 class="text-4xl font-bold">{greeting}{user.name}.</h1>
            <h2 class="text-xl">Today is {theDay}. What's next?</h2>
        </div>
    </div>
    <div class="flex items-center justify-start gap-4 pt-20 mx-[10%]">
        <div class="flex justify-between">
            <div class="self-center w-40">
                <h1 class="text-3xl font-semibold pr-15 self-center"><a href="/app/club">Club</a></h1>
            </div>
            <div class="flex gap-4 flex-1">
                <Card.Root class="flex-1">
                    <Card.Header>
                        <Card.Title>Club Info</Card.Title>
                    </Card.Header>
                    {#if userClubs.length === 0}
                        <Card.Content>You're not part of a club...</Card.Content>
                    {:else if userClubs.length === 1}
                        <Card.Content>
                            <span class="text-xl">{userClubs[0].name} ({userClubs[0].acronym})</span>
                            <br /> <br />
                            {club?.members} E-Board members (on Penmen Pride)
                            <br /> <br />
                            Created <DateWithRelativeTooltip
                                date={userClubs[0].created_at}
                                reverse={true}
                                underline={false}
                            />
                        </Card.Content>
                    {:else if userClubs.length > 1}
                        <Card.Content>
                            You are in {userClubs.length} clubs. <br />
                            Statistics on the left are all your clubs combined.
                        </Card.Content>
                    {/if}
                </Card.Root>
                {#if userClubs.length !== 0}
                    <Card.Root class="flex-1">
                        <Card.Header>
                            <Card.Title>Semester Stats</Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-2">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">{club?.semester.eventsHosted}</span>
                                <span class="text-xl">events hosted</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">{club?.semester.pointsEarned}</span>
                                <span class="text-xl">points earned by students</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">{club?.semester.attendanceCount}</span>
                                <span class="text-xl">students attended your events</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">{club?.semester.upcomingEvents}</span>
                                <span class="text-xl">events upcoming</span>
                            </div>
                        </Card.Content>
                    </Card.Root>
                    <Card.Root class="flex-1">
                        <Card.Header>
                            <Card.Title>All Time Stats</Card.Title>
                        </Card.Header>
                        <Card.Content class="space-y-2">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">{club?.allTime.eventsHosted}</span>
                                <span class="text-xl">events hosted</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">{club?.allTime.pointsEarned}</span>
                                <span class="text-xl">points earned by students</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">{club?.allTime.attendanceCount}</span>
                                <span class="text-xl">students attended your events</span>
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/if}
            </div>
        </div>
    </div>
    <div class="flex items-center justify-start gap-4 pt-10 mx-[10%]">
        <div class="flex justify-between">
            <div class="self-center w-40">
                <h1 class="text-3xl font-semibold pr-15 self-center"><a href="/app/events">Events</a></h1>
            </div>
            <div class="flex gap-4 flex-1">
                <Card.Root class="flex-1">
                    <Card.Header>
                        <Card.Title>Upcoming <span class="text-xs">(semester)</span></Card.Title>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{platform.semester.upcomingEvents}</span>
                            <span class="text-xl">events upcoming, from</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{platform.semester.uniqueClubsHostingEvents}</span>
                            <span class="text-xl">different clubs</span>
                        </div>
                    </Card.Content>
                </Card.Root>
                <Card.Root class="flex-1">
                    <Card.Header>
                        <Card.Title>Semester</Card.Title>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{platform.semester.eventsHosted}</span>
                            <span class="text-xl">events hosted</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{platform.semester.pointsEarned}</span>
                            <span class="text-xl">points earned by students</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{platform.semester.attendanceCount}</span>
                            <span class="text-xl">students attended events</span>
                        </div>
                    </Card.Content>
                </Card.Root>
                <Card.Root class="flex-1">
                    <Card.Header>
                        <Card.Title>All Time</Card.Title>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{platform.allTime.eventsHosted}</span>
                            <span class="text-xl">events hosted</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{platform.allTime.pointsEarned}</span>
                            <span class="text-xl">points earned by students</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{platform.allTime.attendanceCount}</span>
                            <span class="text-xl">students attended events</span>
                        </div>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>
    </div>
    <div class="h-5"></div>
</div>
