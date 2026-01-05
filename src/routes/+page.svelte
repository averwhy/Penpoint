<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Skeleton } from "$lib/components/ui/skeleton/index";
    import * as Tooltip from "$lib/components/ui/tooltip/index";
    import Countup from "$lib/components/countup.svelte";
    import type { PageProps } from "./$types";
    import { toast } from "svelte-sonner";
    import CampSNHU from "$lib/assets/CampSNHU.jpg";

    const { data }: PageProps = $props();
    const { stats } = data;

    if (!stats) {
        toast.error("Failed to load Penmen Pride stats. Please try again later.");
    }

    // Dynamic labels based on semester type
    const isActive = $derived(stats?.type === "active");
    const studentsLabel = $derived(isActive ? "Students earning points" : "Students who earned points last semester");
    const eventsLabel = $derived(isActive ? "Upcoming events" : "Events last semester");
    const eventsValue = $derived(isActive ? stats?.upcomingEvents : stats?.totalEvents);
    const pointsLabel = $derived(isActive ? "Points earned" : "Points earned last semester");
    const daysLabel = $derived(
        stats?.type === "active"
            ? "Days left to earn points"
            : stats?.type === "awaiting"
              ? "Days until next semester"
              : "Semester has ended",
    );
</script>

<div class="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
    <img
        src={CampSNHU}
        alt="Camp SNHU event space background"
        class="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover brightness-[0.55]"
        loading="lazy"
    />
    <div class="absolute inset-0 -z-10 bg-background/70 backdrop-blur-[2px]"></div>
    <h1 class="mb-8 text-center text-7xl font-semibold text-foreground tracking-wide">Penmen Pride</h1>
    <div class="grid grid-cols-2 gap-x-3 gap-y-3">
        <Card.Root>
            <Card.Content class="text-5xl">
                {#if stats}
                    <Countup target={stats.pointEarners} duration={2} />
                {:else}
                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Skeleton class="h-14 w-20" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>This is taking a while to load.. try again?</Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                {/if}
            </Card.Content>
            <Card.Footer class="text-xl">{studentsLabel}</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                {#if stats}
                    <Countup target={stats.pointsEarned} duration={3} />
                {:else}
                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Skeleton class="h-14 w-20" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>This is taking a while to load.. try again?</Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                {/if}
            </Card.Content>
            <Card.Footer class="text-xl">{pointsLabel}</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                {#if stats}
                    <Countup target={eventsValue ?? 0} duration={3} />
                {:else}
                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Skeleton class="h-14 w-20" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>This is taking a while to load.. try again?</Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                {/if}
            </Card.Content>
            <Card.Footer class="text-xl">{eventsLabel}</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                {#if stats}
                    <Countup target={stats.daysLeft} duration={3} />
                {:else}
                    <Tooltip.Provider>
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <Skeleton class="h-14 w-20" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>This is taking a while to load.. try again?</Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                {/if}
            </Card.Content>
            <Card.Footer class="text-xl">{daysLabel}</Card.Footer>
        </Card.Root>
    </div>
    <Accordion.Root type="multiple">
        <Accordion.Item value="item-1">
            <Accordion.Trigger>What's Penmen Pride?</Accordion.Trigger>
            <Accordion.Content>
                Penmen Pride is a program created by the Student Government Association<br /> to drive engagement and
                reward students for attending events on campus at SNHU.<br /> Learn more
                <a href="https://snhusga.org/penmen-pride" class="text-blue-400 hover:text-blue-600">here.</a>
            </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
            <Accordion.Trigger>How do i earn points?</Accordion.Trigger>
            <Accordion.Content>
                Events that have Penmen Pride are listed
                <a href="/events" class="text-blue-400 hover:text-blue-600">here</a>. By attending them, you'll earn
                <br />
                a certain amount of points (usually 3). Just look for the Penmen Pride table or<br />SGA Senator with an
                iPad to claim your points!
            </Accordion.Content>
        </Accordion.Item>
    </Accordion.Root>
</div>
