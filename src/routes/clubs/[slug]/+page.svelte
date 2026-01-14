<script lang="ts">
    import { Badge } from "$lib/components/ui/badge/index";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index";
    import HelpFooter from "$lib/components/help-footer.svelte";
    import type { PageData } from "./$types";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import { browser } from "$app/environment";

    const { data }: { data: PageData } = $props();
    const { club, members, events, semesters, attendance } = data;

    const formatDate = (value: Date | string) =>
        new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));

    const logoSrc = club?.image_filename ? `/uploads/clubs/${club.image_filename}` : undefined;

    const fromPage = browser ? new URLSearchParams(window.location.search).get("from") : undefined;
</script>

<section class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 mt-10">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {#if fromPage === "events" || fromPage === "clubs"}
            <Button href="/{fromPage}" variant="ghost">← Back to {fromPage.charAt(0).toUpperCase() + fromPage.slice(1)}</Button>
        {/if}
    </div>
    <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-4">
            {#if logoSrc}
                <img src={logoSrc} alt={`${club.name} logo`} class="h-20 w-20 rounded-lg object-cover border" />
            {:else}
                <div class="flex h-20 w-20 items-center justify-center rounded-lg border bg-card text-lg font-semibold">
                    {club.acronym.slice(0, 3).toUpperCase()}
                </div>
            {/if}
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-semibold leading-tight">{club.name}</h1>
                    {#if club.governing_board}
                        <Badge variant="default">Governing Board</Badge>
                    {/if}
                </div>
                {#if logoSrc}
                    <p class="text-sm">{club.acronym}</p>
                {/if}
                <p class="text-sm text-muted-foreground">Created {formatDate(club.created_at)}</p>
            </div>
        </div>
    </div>

    <Card>
        <CardHeader>
            <CardTitle class="text-xl">Statistics</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col sm:flex-row xs:flex-col gap-9 sm:items-center xs:items-center sm:justify-start">
            <Tooltip.Provider>
                {#if members === 0}
                    <Tooltip.Root>
                        <Tooltip.Trigger>
                            <h2 class="text-lg">No E-Board members yet.</h2>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            No E-Board members are apart of this club on the Penmen Pride site.
                        </Tooltip.Content>
                    </Tooltip.Root>
                {:else}
                    <Tooltip.Root>
                        <Tooltip.Trigger>
                            <h2 class="text-lg"><span class="text-xl">{members}</span> members</h2>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            Number of E-Board members in this club on the Penmen Pride site.
                        </Tooltip.Content>
                    </Tooltip.Root>
                {/if}
                <h2 class="text-lg"><span class="text-xl">{events}</span> events hosted all-time</h2>
                <h2 class="text-lg"><span class="text-xl">{semesters}</span> semesters active</h2>
                <h2 class="text-lg"><span class="text-xl">{(events/semesters).toFixed(1)}</span> average events per semester</h2>
                <h2 class="text-lg"><span class="text-xl">{attendance}</span> total attendance</h2>
            </Tooltip.Provider>
        </CardContent>
    </Card>
</section>

<HelpFooter />