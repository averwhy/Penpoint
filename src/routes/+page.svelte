<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Skeleton } from "$lib/components/ui/skeleton/index";
    import * as Tooltip from "$lib/components/ui/tooltip/index";
    import Countup from "$lib/components/countup.svelte";
    import type { PageProps } from "./$types";
    import { toast } from "svelte-sonner";

    const { data }: PageProps = $props();
    const { pointEarners, pointsEarned, upcomingEvents, daysLeft } = data;

    if (!pointEarners && !pointsEarned && !upcomingEvents && !daysLeft) {
        toast.error("Failed to load Penmen Pride stats. Please try again later.");
    }
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
    <h1 class="mb-8 text-center text-7xl font-semibold text-foreground tracking-wide">Penmen Pride</h1>
    <div class="grid grid-cols-2 gap-x-3 gap-y-3">
        <Card.Root>
            <Card.Content class="text-5xl">
                {#if pointEarners !== undefined}
                    <Countup target={pointEarners} duration={2} />
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
            <Card.Footer class="text-xl">Students earning points</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                {#if pointsEarned !== undefined}
                    <Countup target={pointsEarned} duration={3}/>
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
            <Card.Footer class="text-xl">Points earned</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                {#if upcomingEvents !== undefined}
                    <Countup target={upcomingEvents} duration={3}/>
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
            <Card.Footer class="text-xl">Upcoming events</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                {#if daysLeft !== undefined}
                    <Countup target={daysLeft} duration={3}/>
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
            <Card.Footer class="text-xl">Days left to earn points</Card.Footer>
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
