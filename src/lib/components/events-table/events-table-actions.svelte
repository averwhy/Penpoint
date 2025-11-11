<script lang="ts">
    import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

    let { id }: { id: string } = $props();
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
                <span class="sr-only">Open menu</span>
                <EllipsisIcon />
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label>Actions</DropdownMenu.Label>
            <DropdownMenu.Item onclick={() => navigator.clipboard.writeText(id)}>Copy payment ID</DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>View event</DropdownMenu.Item>
        <DropdownMenu.Item class="text-destructive">Delete event</DropdownMenu.Item>
    </DropdownMenu.Content>
</DropdownMenu.Root>