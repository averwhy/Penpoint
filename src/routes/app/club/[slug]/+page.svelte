<script lang="ts">
    import { Badge } from "$lib/components/ui/badge/index";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index";
    import type { PageData } from "./$types";

    const { data }: { data: PageData } = $props();
    const { club, members } = data;

    const formatDate = (value: Date | string) =>
        new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));

    const logoSrc = club?.image_filename ? `/uploads/clubs/${club.image_filename}` : undefined;
</script>

<section class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button href="/app/club" variant="ghost">← Back</Button>
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
            <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent class="divide-y">
            {#if members.length === 0}
                <p class="text-sm text-muted-foreground">No members yet.</p>
            {:else}
                {#each members as member}
                    <div class="flex items-center gap-4 py-3">
                        <div
                            class="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
                        >
                            {(member.name ?? "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div class="flex flex-col">
                            <span class="font-medium">{member.name}</span>
                            <span class="text-sm text-muted-foreground">{member.position}</span>
                        </div>
                    </div>
                {/each}
            {/if}
        </CardContent>
    </Card>
</section>
