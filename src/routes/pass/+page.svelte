<script lang="ts">
    import appleWallet from "$lib/assets/AppleWallet-US.svg";
    import googleWallet from "$lib/assets/GoogleWallet-US.svg";
</script>

<div
    class="relative isolate flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-12 text-center"
>
    <div class="max-w-3xl space-y-4">
        <h1 class="text-5xl font-semibold tracking-tight sm:text-7xl">Start earning points today</h1>
        <p class="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            A Penmen Pride Pass allows you to earn points for attending events on campus!
            <br />The highest point earners will be rewarded with prizes at the end of the semester!
        </p>
    </div>

    <div class="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <button
            type="button"
            aria-label="Add to Apple Wallet"
            title="Add to Apple Wallet"
            class="inline-flex w-full items-center justify-center rounded-[0.8rem] p-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <img src={appleWallet} alt="Add to Apple Wallet" class="h-auto w-full select-none align-middle" />
        </button>

        <button
            type="button"
            aria-label="Add to Google Wallet"
            title="Add to Google Wallet"
            class="inline-flex w-full items-center justify-center rounded-[0.8rem] p-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <img src={googleWallet} alt="Add to Google Wallet" class="h-auto w-full select-none align-middle" />
        </button>
    </div>
</div>
