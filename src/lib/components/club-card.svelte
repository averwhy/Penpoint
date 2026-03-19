<script lang="ts">
    import * as HoverCard from "$lib/components/ui/hover-card/index";
    import { Club } from "$lib/models";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { getClub } from "$lib/functions/club.remote";
    import { error } from "@sveltejs/kit";

    interface Props {
        title: string;
        club: Club | string;
        from?: string | undefined;
    }

    let { title, club, from = undefined }: Props = $props();

    let clubData: Club | undefined = $state<Club | undefined>();

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
        const clubId = typeof club === "string" ? club : club.id;
        getClub(clubId).then(data => {
            clubData = data;
        });
    });
</script>

<div>
    {#if clubData}
        <HoverCard.Root>
            <HoverCard.Trigger
                class="hover:underline"
                href={`/clubs/${getClubSlug(clubData.name, clubData.acronym)}${from ? `?from=${from}` : ""}`}
            >
                {title}
            </HoverCard.Trigger>
            <HoverCard.Content class="w-80">
                <div class="flex justify-between space-x-4">
                    <div class="space-y-1">
                        <h4 class="text-sm font-semibold">
                            {clubData.name}
                            {#if clubData.acronym}<span class="text-sm text-muted-foreground">({clubData.acronym})</span
                                >{/if}
                        </h4>

                        {#if clubData.bio}<p class="text-sm">{clubData.bio}</p>{:else}<p class="text-sm italic">
                                No bio available
                            </p>{/if}
                        <div class="flex items-center pt-2">
                            {#if clubData.governing_board}
                                <Badge variant="default" class="text-xs">Governing Board</Badge>
                            {/if}
                        </div>
                    </div>
                </div>
            </HoverCard.Content>
        </HoverCard.Root>
    {:else}
        <span class="text-muted-foreground">{title}</span>
    {/if}
</div>
