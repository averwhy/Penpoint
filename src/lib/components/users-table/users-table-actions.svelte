<script lang="ts">
    import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
    import { Button } from "$lib/components/ui/button/index";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { toast } from "svelte-sonner";
    import { de } from "zod/v4/locales";

    let { id, email }: { id: string; email: string } = $props();
    let deleteDialogOpen = $state(false);
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
            <DropdownMenu.Item
                onclick={() => {
                    navigator.clipboard.writeText(id);
                    toast.success("User ID copied to clipboard");
                }}>Copy user ID</DropdownMenu.Item
            >
            <DropdownMenu.Item
                onclick={() => {
                    navigator.clipboard.writeText(email);
                    toast.success("User email copied to clipboard");
                }}>Copy email</DropdownMenu.Item
            >
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
            onclick={() => {
                window.location.href = `/app/manage/users/${id}`;
            }}>View user</DropdownMenu.Item
        >
        <DropdownMenu.Item class="text-destructive" onclick={() => (window.location.href = `/app/manage/users/${id}`)}
            >Delete user</DropdownMenu.Item
        >
    </DropdownMenu.Content>
</DropdownMenu.Root>
