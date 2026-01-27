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
    
    $effect(() => {
        const clubId = typeof club === 'string' ? club : club.id;
        getClub(clubId).then(data => {
            clubData = data;
        });
        if (!clubData){
            error(404, "Club not found");
        }
    });
</script>

<div>
    <HoverCard.Root>
        <HoverCard.Trigger class="hover:underline" href={`/clubs/${clubData?.acronym}${from ? `?from=${from}` : ""}`}>
            {title}
        </HoverCard.Trigger>
        <HoverCard.Content class="w-80">
            <div class="flex justify-between space-x-4">
                <div class="space-y-1">
                    <h4 class="text-sm font-semibold">{clubData?.name}</h4>
                    <p class="text-sm">{clubData?.acronym}</p>
                    <div class="flex items-center pt-2">
                        {#if clubData?.governing_board}
                            <Badge variant="default" class="text-xs">Governing Board</Badge>
                        {/if}
                    </div>
                </div>
            </div>
        </HoverCard.Content>
    </HoverCard.Root>
</div>
