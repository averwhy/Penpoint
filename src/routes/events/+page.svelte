<script lang="ts">
    import * as Card from "$lib/components/ui/card/index";
    import type { PageProps } from "./$types";
    import ClubCard from "$lib/components/club-card.svelte";

    const { data }: PageProps = $props();
    const events = data.data;
</script>

<div class="flex justify-center w-full px-4 py-8">
    <div class="w-full max-w-7xl mt-20">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each events as entry}
                <Card.Root>
                    <Card.Header>
                        <Card.Title>{entry.event.name}</Card.Title>
                        <Card.Description>
                            <ClubCard title={entry.club_name} id={entry.event.club_id} />
                        </Card.Description>
                    </Card.Header>
                    <Card.Content>
                        {entry.event.starts_at.toTimeString()} to {entry.event.ends_at.toTimeString()}
                    </Card.Content>
                    <Card.Footer>
                        <Card.Description>
                            {entry.event.point_value} points
                        </Card.Description>
                    </Card.Footer>
                </Card.Root>
            {/each}
        </div>
    </div>
</div>
