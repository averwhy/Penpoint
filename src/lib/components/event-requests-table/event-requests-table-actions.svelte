<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Dialog from "../ui/dialog/index.js";
    import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
    import { toast } from "svelte-sonner";
    import Separator from "../ui/separator/separator.svelte";
    import { edit, editPoints } from "$lib/functions/events/edit.remote.js";
    import { update } from "$lib/functions/events/status.remote.js";

    let {
        requestId,
        eventId,
        specialRequests,
    }: { requestId: string; eventId: string; specialRequests: string | null } = $props();
    let dialogOpen = $state(false);
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="max-w-2xl">
        <Dialog.Header>
            <Dialog.Title>Accept/Deny Event</Dialog.Title>
        </Dialog.Header>
        <div class="space-y-4">
            {#if specialRequests}
                <div class="rounded-lg border p-4 bg-muted/50">
                    <p class="text-sm whitespace-pre-wrap">{specialRequests}</p>
                </div>
            {:else}
                <p class="text-muted-foreground text-sm">No special requests for this event.</p>
            {/if}
        </div>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => (dialogOpen = false)}>Close</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

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
                variant="default"
                onclick={() => {
                    dialogOpen = true;
                }}>Review event</DropdownMenu.Item
            >
            <Separator />
            <DropdownMenu.Item
                variant="success"
                onclick={async () => {
                    await update({ event_id: eventId, approval_status: "accepted" });
                    toast.success("Event marked as accepted successfully");
                }}>Quick accept</DropdownMenu.Item
            >
            <DropdownMenu.Item
                variant="destructive"
                onclick={async () => {
                    await update({ event_id: eventId, approval_status: "denied" });
                    toast.success("Event marked as denied successfully");
                }}>Quick deny</DropdownMenu.Item
            >
            <DropdownMenu.Item
                onclick={() => {
                    navigator.clipboard.writeText(eventId);
                    toast.success("Event ID copied to clipboard");
                }}>Copy event ID</DropdownMenu.Item
            >
        </DropdownMenu.Group>
        {#if specialRequests}
            <DropdownMenu.Separator />
            <DropdownMenu.Item onclick={() => (dialogOpen = true)}>View special requests</DropdownMenu.Item>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>
