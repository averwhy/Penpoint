<script lang="ts">
    import * as HoverCard from "$lib/components/ui/hover-card/index";
    import { Club } from "$lib/models";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { getClub } from "$lib/functions/club.remote";

    interface Props {
        title: string;
        clubId: string;
        from?: string | undefined;
    }

    let { title, clubId, from = undefined }: Props = $props();

    const club = await getClub(clubId);
</script>

<div>
    <HoverCard.Root>
        <HoverCard.Trigger class="hover:underline" href={`/clubs/${club.acronym}${from ? `?from=${from}` : ""}`}>
            {title}
        </HoverCard.Trigger>
        <HoverCard.Content class="w-80">
            <div class="flex justify-between space-x-4">
                <div class="space-y-1">
                    <h4 class="text-sm font-semibold">{club.name}</h4>
                    <p class="text-sm">{club.acronym}</p>
                    <div class="flex items-center pt-2">
                        {#if club.governing_board}
                            <Badge variant="default" class="text-xs">Governing Board</Badge>
                        {/if}
                    </div>
                </div>
            </div>
        </HoverCard.Content>
    </HoverCard.Root>
</div>
