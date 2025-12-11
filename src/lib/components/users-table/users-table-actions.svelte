<script lang="ts">
    import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { toast } from "svelte-sonner";

    let { id, email }: { id: string; email : string } = $props();
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
            <DropdownMenu.Item onclick={() => {
                navigator.clipboard.writeText(id);
                toast.success("User ID copied to clipboard");
            }}>Copy user ID</DropdownMenu.Item>
            <DropdownMenu.Item onclick={() => {
                navigator.clipboard.writeText(email);
                toast.success("User email copied to clipboard");
            }}>Copy email</DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>View user</DropdownMenu.Item>
    </DropdownMenu.Content>
</DropdownMenu.Root>