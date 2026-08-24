<script lang="ts">
    import CircleHelp from "@lucide/svelte/icons/circle-help";
    import Mail from "@lucide/svelte/icons/mail";
    import ShieldCheck from "@lucide/svelte/icons/shield-check";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
    import { Button } from "$lib/components/ui/button/index.js";
</script>

<svelte:head>
    <title>Help | Penmen Pride</title>
</svelte:head>

<main class="flex min-h-screen w-full items-center justify-center px-4 py-28">
    <div class="w-full max-w-4xl">
        <section class="mb-10 text-center">
            <h1 class="text-4xl font-semibold tracking-tight sm:text-6xl">How can we help?</h1>
            <p class="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                For help with Penmen Pride, email Student Government Association and we'll point you in the right
                direction.
            </p>
            <Button href="mailto:StudentGovernmentAssociation@snhu.edu" variant="success" class="mt-6 mb-6">
                <Mail />
                Email SGA
            </Button>
        </section>

        <section class="grid gap-4 sm:grid-cols-3" aria-label="Ways SGA can help">
            <article class="rounded-lg border bg-card p-6 shadow-sm">
                <TriangleAlert class="mb-4 size-7 text-destructive" />
                <h2 class="text-lg font-semibold">Report a site issue</h2>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">
                    Let us know if a page, pass, points total, login, or event listing is not working as expected.
                </p>
            </article>

            <article class="rounded-lg border bg-card p-6 shadow-sm">
                <CircleHelp class="mb-4 size-7 text-link-primary" />
                <h2 class="text-lg font-semibold">Ask for help</h2>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">
                    Send questions about earning points, checking your balance, passes, prizes, or anything else Penmen
                    Pride related.
                </p>
            </article>

            <article class="rounded-lg border bg-card p-6 shadow-sm">
                <ShieldCheck class="mb-4 size-7 text-success" />
                <h2 class="text-lg font-semibold">Request permissions</h2>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">
                    Club E-Board members and university office staff can contact SGA to request access to event tools
                    and related features.
                </p>
            </article>
        </section>

        <section class="mt-8 rounded-lg border border-dashed p-6 text-center">
            <h2 class="font-semibold">What should I include?</h2>
            <p class="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Include your name, SNHU email, a short description of the issue or request, and the page or event
                involved. Screenshots and error messages are super helpful for technical issues.
            </p>
            <a
                href="mailto:StudentGovernmentAssociation@snhu.edu"
                class="mt-3 inline-block text-sm font-medium text-link-primary underline-offset-4 hover:text-link-hover hover:underline"
            >
                StudentGovernmentAssociation@snhu.edu
            </a>
        </section>
    </div>
</main>
