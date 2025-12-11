<script lang="ts">
    import * as HoverCard from "$lib/components/ui/hover-card/index";
    import { Club } from "$lib/models";
    import { getClub } from "$lib/functions/club.remote";
    import { Badge } from "$lib/components/ui/badge/index.js";

    interface Props {
        title: string;
        id: string;
    }

    let { title, id }: Props = $props();

    let clubData = $state<Club | null>(null);
    let isLoading = $state(false);

    async function loadClubData() {
        if (clubData || isLoading) return;

        isLoading = true;

        clubData = await getClub(id);
    }
</script>

<div>
    <HoverCard.Root>
        <HoverCard.Trigger onmouseenter={loadClubData} class="hover:underline">
            {title}
        </HoverCard.Trigger>
        <HoverCard.Content class="w-80">
            <div class="flex justify-between space-x-4">
                <div class="space-y-1">
                    <h4 class="text-sm font-semibold">{clubData?.name}</h4>
                    <p class="text-sm">{clubData?.acronym}</p>
                    <div class="flex items-center pt-2">
                        {#if clubData?.governing_board}
                        <Badge variant="default" class="text-xs"> Governing Board </Badge>
                        {/if}
                    </div>
                </div>
            </div>
        </HoverCard.Content>
    </HoverCard.Root>
</div>
