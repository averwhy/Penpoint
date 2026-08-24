<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Skeleton } from "$lib/components/ui/skeleton/index";
    import * as Tooltip from "$lib/components/ui/tooltip/index";
    import Countup from "$lib/components/countup.svelte";
    import type { PageProps } from "./$types";
    import { toast } from "svelte-sonner";
    import CampSNHU from "$lib/assets/CampSNHU.jpg";
    import { goto } from "$app/navigation";
    import appleWallet from "$lib/assets/AppleWallet-US.svg";
    import googleWallet from "$lib/assets/GoogleWallet-US.svg";

    const { data }: PageProps = $props();
    const stats = $derived(data.stats);

    $effect(() => {
        if (data.unavailable && data.stats === null) {
            toast.warning("Failed to load Penmen Pride stats. There may be no semesters to load data from.", {
                duration: 10000,
            });
        } else if (data.unavailable) {
            toast.error("Failed to load Penmen Pride stats. Please try again later.", { duration: 10000 });
        }
    });

    // dynamic labels based on semester status
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

<div
    class="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 isolate"
>
    <img
        src={CampSNHU}
        alt="Camp SNHU event space background"
        class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover brightness-[0.4]"
        loading="lazy"
    />
    <div class="absolute inset-0 z-0 bg-background/60 backdrop-blur-sm"></div>
    <h1
        class="relative z-10 mb-3 text-center text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground tracking-wide pt-23"
    >
        Penmen Pride
    </h1>
    <div class="z-10 mb-3 flex w-full max-w-md flex-row gap-3">
        <button
            type="button"
            aria-label="Add to Apple Wallet"
            title="Add to Apple Wallet"
            onclick={() => {goto(`/pass?type=apple`)}}
            class="inline-flex w-full cursor-pointer items-center justify-center rounded-[0.8rem] p-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <img src={appleWallet} alt="Add to Apple Wallet" class="h-auto w-full select-none align-middle" />
        </button>

        <button
            type="button"
            aria-label="Add to Google Wallet"
            title="Add to Google Wallet"
            class="inline-flex w-full cursor-pointer items-center justify-center rounded-[0.8rem] p-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onclick={() => {goto(`/pass?type=google`)}}
        >
            <img src={googleWallet} alt="Add to Google Wallet" class="h-auto w-full select-none align-middle" />
        </button>
    </div>
    <div class="relative z-10 grid grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-4">
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
    <Accordion.Root type="multiple" class="relative z-10 w-full max-w-2xl mt-8">
        <Accordion.Item value="item-1">
            <Accordion.Trigger>What's Penmen Pride?</Accordion.Trigger>
            <Accordion.Content>
                Penmen Pride is a program created by the Student Government Association<br /> to drive engagement and
                reward students for attending events on campus at SNHU.<br /> Learn more
                <a href="https://snhusga.org/penmen-pride" class="text-blue-400 hover:text-blue-600">here.</a>
            </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-3">
            <Accordion.Trigger>How does it work?</Accordion.Trigger>
            <Accordion.Content>
                First, get a Penmen Pride Pass by visiting <a href="/pass" class="text-blue-400 hover:text-blue-600"
                    >this page</a
                >. You'll add it to your mobile phones wallet (either Apple Wallet or Google Wallet). Then, attend
                events that have Penmen Pride!<br /> When you attend an event, an SGA senator will scan your Penmen
                Pride Pass at the event and you'll earn points!
                <span class="font-bold">Important:</span> You should make an account here on Penmen Pride so you don't
                lose your points, and so you can check your points at any time! You'll be prompted to create an account
                when you get your Penmen Pride Pass, or you can create one
                <a href="/register" class="text-blue-400 hover:text-blue-600">here</a>.
            </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-4">
            <Accordion.Trigger>Where can I earn points?</Accordion.Trigger>
            <Accordion.Content>
                Events that have Penmen Pride are listed
                <a href="/events" class="text-blue-400 hover:text-blue-600">here</a>. By attending them, you'll earn
                <br />
                a certain amount of points (usually 3). Just look for the Penmen Pride table or<br />SGA Senator with an
                iPad to claim your points!
            </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-5">
            <Accordion.Trigger>What can I do with my points?</Accordion.Trigger>
            <Accordion.Content>
                When the semester ends, the students with the most points will win prizes!<br />
                Learn more about the point tiers and their prizes
                <a href="https://snhusga.org/penmen-pride" class="text-blue-400 hover:text-blue-600">here.</a>
            </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-6">
            <Accordion.Trigger>How can I check my points?</Accordion.Trigger>
            <Accordion.Content>
                A few different ways! You can enter your 10 digit pass ID <a
                    href="/points"
                    class="text-blue-400 hover:text-blue-600">on the point checking page here</a
                >, or follow your phone's specific instructions below:
                <br />
                Apple: Double click your power button to open your wallet, tap/click your pass, tap the 3 dots in the top
                right, then tap 'Pass details'. You'll see a URL that will show your points!<br />
                Google: WIP (sorry)
            </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-7">
            <Accordion.Trigger>I have an event I want Penmen Pride to be at! How do I request it?</Accordion.Trigger>
            <Accordion.Content>
                As a club E-Board member of a club, or a staff member/student worker of an office on campus, please
                <a href="mailto:StudentGovernmentAssociation@snhu.edu" class="text-blue-400 hover:text-blue-600"
                    >email SGA</a
                > to obtain permissions for your account to be able to request events, see scan statistics, and more!
            </Accordion.Content>
        </Accordion.Item>
    </Accordion.Root>
</div>
