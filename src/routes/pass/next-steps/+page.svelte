<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
</script>

<div
    class="relative isolate flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-12 text-center"
>
    <div class="max-w-3xl space-y-4">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-6xl">What's next?</h1>
        <p class="mx-auto max-w-2xl text-lg text-foreground">
            Now that you have your Penmen Pride Pass in your phone's wallet, <a
                class="text-link-primary hover:text-link-hover"
                href="/events">check the Events page</a
            > to see what events are happening on campus and start earning points!
        </p>
        <br />
        <h1 class="text-3xl font-semibold tracking-tight sm:text-5xl">At an event now?</h1>
        <p class="mx-auto max-w-2xl text-lg text-foreground">
            Look for a Student Government member at the event and they will scan the pass in your wallet!<br />On
            iPhone, just double click the power button to open your wallet and show your pass. On Android, open your
            wallet app and show your pass.
        </p>
        <p class="mx-auto max-w-2xl text-sm text-muted-foreground">
            Note: If the event you're at isn't listed on the Events page, it's unfortunately not a Penmen Pride event and you won't be able to earn points for attending it.
        </p>
    </div>
    <Button variant="outline" href="/">Home</Button>
</div>
