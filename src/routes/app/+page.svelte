<script lang="ts">
    import * as Card from "$lib/components/ui/card/index";
    import { getClubFromUser } from "$lib/functions/user/club.remote";
    import Countup from "$lib/components/countup.svelte";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
    const {
        user,
        upcomingEvents,
        uniqueClubsHostingEvents,
        eventsHostedSemester,
        pointsEarnedSemester,
        attendanceCountSem,
        allEventsHosted,
        allPointsEarned,
        allAttendanceCount,
    } = data;

    const theDay: string = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const nameGreetings = [
        "Hey there, ",
        "Welcome back, ",
        "Good to see you, ",
        "Hello, ",
        "Hi there, ",
        "Howdy, ",
        "What's up, ",
        "Ahoy, ",
        "Today's a good day, ",
    ];
    const randomNum = Math.floor(Math.random() * nameGreetings.length);

    const userClub = await getClubFromUser(user.id);
    if (userClub !== undefined) {
        // other remote functions will go here to get club stats
    }
</script>

<div>
    <div class="flex items-center justify-center pt-20">
        <div class="text-center">
            <h1 class="text-4xl font-bold">{nameGreetings[randomNum]}{user.name}.</h1>
            <h2 class="text-xl">Today is {theDay}. What's next?</h2>
        </div>
    </div>
    <div class="flex items-center justify-center gap-4 pt-20">
        <h1 class="text-3xl font-semibold pr-15">Club</h1>
        <div class="flex gap-4">
            <Card.Root class="flex-1">
                <Card.Header>
                    <Card.Title>Club Info</Card.Title>
                </Card.Header>
                {#if userClub === undefined}
                    <Card.Content>You're not part of a club...</Card.Content>
                {:else}
                    <Card.Content>
                        {userClub.name} ({userClub.acronym}) <br />
                        0 E-Board members (on Penmen Pride) Created at {userClub.created_at}
                    </Card.Content>
                {/if}
            </Card.Root>
            {#if userClub !== undefined}
                <Card.Root class="flex-1">
                    <Card.Header>
                        <Card.Title>Semester Stats</Card.Title>
                    </Card.Header>
                    <Card.Content class="space-y-2">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">0</span>
                            <span class="text-xl">events hosted</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">0</span>
                            <span class="text-xl">points earned by students</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">0</span>
                            <span class="text-xl">students attended your events</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">0</span>
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
                            <span class="text-3xl">0</span>
                            <span class="text-xl">events hosted</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">0</span>
                            <span class="text-xl">points earned by students</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">0</span>
                            <span class="text-xl">students attended your events</span>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/if}
        </div>
    </div>
    <div class="flex items-center justify-center gap-4 pt-10">
        <h1 class="text-3xl font-semibold pr-15">Events</h1>
        <div class="flex gap-4">
            <Card.Root class="flex-1">
                <Card.Header>
                    <Card.Title>Upcoming <span class="text-xs">(semester)</span></Card.Title>
                </Card.Header>
                <Card.Content class="space-y-2">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">{upcomingEvents}</span>
                        <span class="text-xl">events upcoming</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">{uniqueClubsHostingEvents}</span>
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
                        <span class="text-3xl">{eventsHostedSemester}</span>
                        <span class="text-xl">events hosted</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">{pointsEarnedSemester}</span>
                        <span class="text-xl">points earned by students</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">{attendanceCountSem}</span>
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
                        <span class="text-3xl">{allEventsHosted}</span>
                        <span class="text-xl">events hosted</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">{allPointsEarned}</span>
                        <span class="text-xl">points earned by students</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">{allAttendanceCount}</span>
                        <span class="text-xl">students attended events</span>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
    </div>
</div>
