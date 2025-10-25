<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    import * as Card from "$lib/components/ui/card/index.js";

    import { getHomepageData } from "./data.remote";

    let [pointEarners, pointsEarned, upcomingEvents, daysLeft] = await getHomepageData();
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
    <h1 class="mb-8 text-center text-7xl font-semibold text-foreground tracking-wide">Penmen Pride</h1>
    <div class="grid grid-cols-2 gap-x-3 gap-y-3">
        <Card.Root class="">
            <Card.Content class="text-5xl">
                <p>{pointEarners}</p>
            </Card.Content>
            <Card.Footer class="text-xl">Students earning points</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                <p>{pointsEarned}</p>
            </Card.Content>
            <Card.Footer class="text-xl">Points earned</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                <p>{upcomingEvents}</p>
            </Card.Content>
            <Card.Footer class="text-xl">Upcoming events</Card.Footer>
        </Card.Root>
        <Card.Root>
            <Card.Content class="text-5xl">
                <p>{daysLeft}</p>
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
