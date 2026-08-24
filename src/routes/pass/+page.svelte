<script lang="ts">
    import appleWallet from "$lib/assets/AppleWallet-US.svg";
    import googleWallet from "$lib/assets/GoogleWallet-US.svg";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Label } from "$lib/components/ui/label/index";
    import { Input } from "$lib/components/ui/input/index";
    import { Button } from "$lib/components/ui/button/index";
    import { browser } from "$app/environment";
    import { sleep } from "$lib/utils";
    import { Turnstile } from "svelte-turnstile";
    import { publicEnv } from "$lib/env/public";
    import HelpFooter from "$lib/components/help-footer.svelte";

    let accountDialogOpen = $state(false);
    let noWalletFyiDialogOpen = $state(false);
    let passDownloadDialogOpen = $state(false);
    let passType: "Apple" | "Google" | undefined = $state(undefined);
    let validPassword = $state(false);

    let email = $state("");
    let _password = $state("");
    let _confirmPassword = $state("");
    let accountFormValid = $state(false);

    let turnstileToken = $state("");
    let turnstileTokenValid = $state(false);
    let turnstileComponent: any = $state();

    const fromPage = browser ? new URLSearchParams(window.location.search).get("type") : undefined;

    $effect(() => {
        if (_password.length > 0 && _confirmPassword.length > 0) {
            validPassword = _password === _confirmPassword;
        } else {
            validPassword = false;
        }

        if (fromPage === "apple") {
            passType = "Apple";
            sleep(100).then(() => {
                accountDialogOpen = true;
            });
        } else if (fromPage === "google") {
            passType = "Google";
            sleep(100).then(() => {
                accountDialogOpen = true;
            });
        }

        if (turnstileToken.length > 0) {
            turnstileTokenValid = true;
        } else {
            turnstileTokenValid = false;
        }

        if (email.length > 0 && validPassword && turnstileTokenValid) {
            accountFormValid = true;
        } else {
            accountFormValid = false;
        }
    });

    function handlePassSubmit() {
        new URLSearchParams(window.location.search).delete("type");
        accountDialogOpen = false;
        noWalletFyiDialogOpen = false;

        // TODO: actually call remote function

        passDownloadDialogOpen = true;
    }
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
            onclick={() => ((accountDialogOpen = true), (passType = "Apple"))}
            class="inline-flex w-full cursor-pointer items-center justify-center rounded-[0.8rem] p-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={accountDialogOpen}
        >
            <img src={appleWallet} alt="Add to Apple Wallet" class="h-auto w-full select-none align-middle" />
        </button>

        <button
            type="button"
            aria-label="Add to Google Wallet"
            title="Add to Google Wallet"
            class="inline-flex w-full cursor-pointer items-center justify-center rounded-[0.8rem] p-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onclick={() => ((accountDialogOpen = true), (passType = "Google"))}
            disabled={accountDialogOpen}
        >
            <img src={googleWallet} alt="Add to Google Wallet" class="h-auto w-full select-none align-middle" />
        </button>
    </div>
    <div>
        <Button variant="ghost" class="text-xs" onclick={() => (noWalletFyiDialogOpen = true)}
            >I don't have either of these</Button
        >
    </div>
    <HelpFooter />
</div>

<Dialog.Root bind:open={accountDialogOpen}>
    <form>
        <Dialog.Content class="sm:max-w-106.25">
            <Dialog.Header>
                <Dialog.Title>Create Account</Dialog.Title>
                <Dialog.Description class="text-foreground">
                    Link your pass to an account to keep your points safe in case you lose your pass from your {passType ??
                        ""} wallet! You can also do this later if you want.
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
                <div class="grid gap-3">
                    <Label for="email-1">Email</Label>
                    <Input id="email-1" name="email" placeholder="dom.donati@snhu.edu" bind:value={email} />
                </div>
                <div class="grid gap-3">
                    <Label for="password-1">Password</Label>
                    <Input id="password-1" name="password" type="password" bind:value={_password} />
                </div>
                <div class="grid gap-3">
                    <Label for="confirm-password-1">Confirm Password</Label>
                    <Input
                        id="confirm-password-1"
                        name="confirmPassword"
                        type="password"
                        bind:value={_confirmPassword}
                    />
                </div>
                <div>
                    <Turnstile
                        responseFieldName="cfTurnstileResponse"
                        siteKey={publicEnv.CF_TURNSTILE_KEY ?? ""}
                        theme="auto"
                        bind:this={turnstileComponent}
                        on:callback={e => (turnstileToken = e.detail.token)}
                    />
                </div>
            </div>
            <Dialog.Footer class="justify-start">
                <Button type="submit" disabled={!accountFormValid} onclick={handlePassSubmit}>Create Account</Button>
                <Button variant="ghost" disabled={!turnstileTokenValid} class="text-xs" onclick={handlePassSubmit}
                    >No thanks, proceed without an account</Button
                >
            </Dialog.Footer>
        </Dialog.Content>
    </form>
</Dialog.Root>

<Dialog.Root bind:open={noWalletFyiDialogOpen}>
    <form>
        <Dialog.Content class="sm:max-w-106.25">
            <Dialog.Header>
                <Dialog.Title>No wallet?</Dialog.Title>
                <Dialog.Description class="text-foreground">
                    You can still earn points without a wallet- you'll save a image of the QR code to your phone and
                    scan it at events just like normal.<br />You can also see your QR code
                    <a href="/account" class="text-link-primary hover:text-link-hover">on your account page</a>.
                </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer class="justify-start">
                <Button
                    type="submit"
                    onclick={() => {
                        noWalletFyiDialogOpen = false;
                        accountDialogOpen = true;
                    }}>Sounds good</Button
                >
                <Button variant="ghost" class="text-xs" onclick={() => (noWalletFyiDialogOpen = false)}>Go back</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </form>
</Dialog.Root>

<Dialog.Root bind:open={passDownloadDialogOpen}>
    <form>
        <Dialog.Content class="sm:max-w-106.25">
            <Dialog.Header>
                <Dialog.Title>Your Penmen Pride Pass is ready</Dialog.Title>
                <Dialog.Description class="text-foreground">
                    You should see a prompt to add the pass to your {passType ?? ""} wallet shortly.
                </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer class="justify-start">
                <Button
                    type="submit"
                    disabled={!turnstileTokenValid}
                    onclick={() => {
                        passDownloadDialogOpen = false;
                    }}>Done</Button
                >
            </Dialog.Footer>
        </Dialog.Content>
    </form>
</Dialog.Root>
