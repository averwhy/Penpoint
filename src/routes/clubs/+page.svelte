<script lang="ts">
    import { Card, CardContent, CardTitle } from "$lib/components/ui/card/index";
    import { toast } from "svelte-sonner";
    import type { PageData } from "./$types";

    const { data }: { data: PageData } = $props();
    let clubs = $derived(data.clubs);

    function getClubSlug(name: string, acronym: string | null): string {
        const normalizedAcronym = acronym?.trim();
        const slugSource = normalizedAcronym && normalizedAcronym.length > 0 ? normalizedAcronym : name;
        return slugSource
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-+|-+$)/g, "");
    }

    $effect(() => {
        if (data.unavailable) {
            toast.error("Clubs data is currently unavailable. Please try again later.", {
                duration: 10000,
            });
        }
    });
</script>

<section class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 mt-20">
    <header class="space-y-1">
        <h1 class="text-2xl font-semibold">Clubs on Penmen Pride</h1>
    </header>

    <div class="grid gap-4">
        {#if clubs === null}
            <Card>
                <CardContent class="py-3 text-xl text-muted-foreground"
                    >There are no clubs yet... something's probably wrong.</CardContent
                >
            </Card>
        {:else}
            {#each clubs as club}
                {#if club}
                    <Card class="flex items-start gap-4 px-4 py-3">
                        <div class="flex items-center gap-3">
                            {#if club.image_filename}
                                <img
                                    src={`/uploads/clubs/${club.image_filename}`}
                                    alt={`${club.name} logo`}
                                    class="h-10 w-10 rounded-md object-cover border"
                                />
                            {:else}
                                <div
                                    class="flex h-10 w-10 items-center justify-center rounded-md border bg-card text-xs font-semibold uppercase"
                                >
                                    {club.acronym ? club.acronym.slice(0, 4) : club.name?.slice(0, 1)}
                                </div>
                            {/if}
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <CardTitle class="text-base font-semibold leading-tight">
                                        <a
                                            href="/clubs/{getClubSlug(club.name, club.acronym)}?from=clubs"
                                            class="hover:underline"
                                        >
                                            {club.name}
                                            {club.acronym ? `(${club.acronym})` : ""}
                                        </a>
                                    </CardTitle>
                                </div>
                                <p class="text-xs text-muted-foreground">
                                    Created {new Date(club.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Card>
                {/if}
            {/each}
        {/if}
    </div>
</section>
