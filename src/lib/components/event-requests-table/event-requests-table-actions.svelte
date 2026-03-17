<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Dialog from "../ui/dialog/index.js";
    import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
    import { toast } from "svelte-sonner";
    import Separator from "../ui/separator/separator.svelte";
    import { editPoints } from "$lib/functions/events/edit.remote.js";
    import { getEventConflicts } from "$lib/functions/events.remote.js";
    import { updateEvent } from "$lib/functions/events/status.remote.js";
    import { invalidateAll } from "$app/navigation";
    import { Event } from "$lib/models";
    import { Slider } from "$lib/components/ui/slider/index.js";

    let {
        requestId,
        eventId,
        eventName,
        specialRequests,
    }: { requestId: string; eventId: string; eventName: string; specialRequests: string | null } = $props();
    let dialogOpen = $state(false);
    let pointValue = $state(3);
    type EventConflicts = Awaited<ReturnType<typeof getEventConflicts>>;
    let eventConflicts = $state<EventConflicts>([]);
    $effect(() => {
        if (!dialogOpen) return;

        let cancelled = false;

        void getEventConflicts({ eventId }).then(conflicts => {
            if (!cancelled) {
                eventConflicts = conflicts;
            }
        });

        return () => {
            cancelled = true;
        };
    });
    let eventUpdatePending = $state(false);
    async function processEventReview(eventId: string, pointValue: number, approvalStatus: "accepted" | "denied") {
        if (eventUpdatePending) return;
        eventUpdatePending = true;

        try {
            await updateEvent({ event_id: eventId, approval_status: approvalStatus });

            if (approvalStatus === "accepted") {
                await editPoints({ event_id: eventId, points: pointValue });
            }

            toast.success(
                `'${eventName}' marked as ${approvalStatus} successfully with a point value of ${pointValue} points`,
                { duration: 20000 },
            );
            await invalidateAll();
            dialogOpen = false;
        } catch {
            toast.error(`Failed to update '${eventName}'. Please try again.`);
        } finally {
            eventUpdatePending = false;
        }
    }
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="max-w-2xl">
        <Dialog.Header>
            <Dialog.Title>Review Event</Dialog.Title>
        </Dialog.Header>
        <div class="space-y-4">
            <h2>Special Requests</h2>
            {#if specialRequests}
                <div class="rounded-lg border p-4 bg-muted/50">
                    <p class="text-sm whitespace-pre-wrap">{specialRequests}</p>
                </div>
            {:else}
                <p class="text-muted-foreground text-sm">No special requests for this event.</p>
            {/if}
            <h2>Event Conflicts</h2>
            {#if eventConflicts.length > 0}
                <div class="rounded-lg border p-4 bg-muted/50">
                    <p class="text-sm">The following events conflict with this one:</p>
                    <ul class="list-disc list-inside mt-2">
                        {#each eventConflicts as conflict}
                            <li><a href="/app/events/{conflict.id}" class="hover:underline">{conflict.name}</a></li>
                        {/each}
                    </ul>
                </div>
            {:else}
                <p class="text-muted-foreground text-sm">No conflicts found for this event.</p>
            {/if}
            <h2>Point value: {pointValue} {pointValue == 3 ? "(default)" : ""}</h2>
            <Slider type="single" bind:value={pointValue} max={10} min={1} step={1} class="max-w-[70%]" />
        </div>
        <Dialog.Footer>
            <Button variant="success" onclick={() => processEventReview(eventId, pointValue, "accepted")}>Accept</Button
            >
            <Button variant="destructive" onclick={() => processEventReview(eventId, pointValue, "denied")}>Deny</Button
            >
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
            <DropdownMenu.Item variant="success" onclick={() => processEventReview(eventId, pointValue, "accepted")}
                >Quick accept</DropdownMenu.Item
            >
            <DropdownMenu.Item variant="destructive" onclick={() => processEventReview(eventId, pointValue, "denied")}
                >Quick deny</DropdownMenu.Item
            >
            <DropdownMenu.Separator/>
            <DropdownMenu.Item
                onclick={() => {
                    navigator.clipboard.writeText(eventId);
                    toast.success("Event ID copied to clipboard");
                }}>Copy event ID</DropdownMenu.Item
            >
        </DropdownMenu.Group>
    </DropdownMenu.Content>
</DropdownMenu.Root>
