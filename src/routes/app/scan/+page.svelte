<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Card from "$lib/components/ui/card";
    import * as Select from "$lib/components/ui/select";
    import { tap } from "$lib/functions/tap.remote";
    import { Tap } from "$lib/models";
    import { toast } from "svelte-sonner";
    import type { PageProps } from "./$types";

    interface SwipeRecord {
        studentId: string;
        eventName: string;
        timestamp: Date;
    }

    const { data }: PageProps = $props();

    let selectedEvent = $state("");
    let swipeHistory = $state<SwipeRecord[]>([]);
    let isCapturing = $state(false);

    const eventName = $derived(data.events.find(event => event.id === selectedEvent)?.name ?? "Select an event…");

    // card reader capture
    let cardBuffer = $state("");
    let cardTimeout: ReturnType<typeof setTimeout> | null = null;

    // flash animation state
    let showFlash = $state(false);
    let flashColor = $state<"success" | "error">("success");

    function flash(color: "success" | "error") {
        flashColor = color;
        showFlash = true;
        setTimeout(() => {
            showFlash = false;
        }, 300);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (cardTimeout) clearTimeout(cardTimeout);

        if (event.key.length === 1) {
            if (event.key === ";") {
                cardBuffer = ";";
                isCapturing = true;
            } else if (isCapturing) {
                cardBuffer += event.key;
            }

            // Prevent card data from appearing in inputs while capturing
            if (isCapturing) {
                event.preventDefault();
            }

            // Check if we have a complete card swipe (starts with ; and ends with ?)
            if (cardBuffer.startsWith(";") && cardBuffer.endsWith("?")) {
                const cardData = cardBuffer;
                cardBuffer = "";
                isCapturing = false;

                // Clear any text that might have gotten into the input
                setTimeout(() => {
                    tap.fields.student_id.set("");
                }, 10);

                if (selectedEvent === "") {
                    flash("error");
                    toast.error("Select an event before scanning a card.");
                    return;
                }
                parseCardData(cardData);
                return;
            }

            // Timeout to clear buffer if input stops (card readers are fast, humans are slow)
            cardTimeout = setTimeout(() => {
                cardBuffer = "";
                isCapturing = false;
            }, 100);
        }
    }

    function parseCardData(raw: string) {
        const match = raw.match(/^;77(\d+)=/);
        if (match) {
            const studentId = match[1];
            flash("success");
            toast.success("Card scanned", { description: `Scanned student ID: ${studentId}` });

            // Add to swipe history
            swipeHistory = [
                {
                    studentId,
                    eventName: eventName,
                    timestamp: new Date(),
                },
                ...swipeHistory,
            ];
        } else {
            flash("error");
            toast.error("Failed to parse card data");
        }
    }

    function formatTime(date: Date): string {
        return date
            .toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            })
            .toLowerCase();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Flash overlay -->
{#if showFlash}
    <div
        class="fixed inset-0 pointer-events-none z-50 animate-flash {flashColor === 'success'
            ? 'bg-green-500/40'
            : 'bg-red-500/40'}"
    ></div>
{/if}

<div class="flex items-center justify-center min-h-[calc(100vh-68px)] mx-10 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-3xl">
        <!-- Left column: Scan form -->
        <form
            {...tap.preflight(Tap.omit({ id: true })).enhance(async ({ form, data, submit }) => {
                try {
                    await submit();
                    tap.fields.student_id.set("");
                    toast.success("Student tapped successfully", {
                        description: `${tap.result?.student.name ?? tap.result?.student.student_id ?? data.student_id} tapped into ${eventName} successfully.`,
                    });
                } catch (error: any) {
                    console.error("tap failed", error);
                    toast.error("Failed to tap student", { description: error?.body.message });
                }
            })}
        >
            <div class="flex flex-col gap-4">
                <div>
                    <Select.Root type="single" bind:value={selectedEvent}>
                        <Select.Trigger class="w-full bg-primary">
                            {eventName}
                        </Select.Trigger>
                        <Select.Content>
                            {#each data.events as event (event.id)}
                                <Select.Item value={event.id} label={event.name}>
                                    {event.name}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                    <input {...tap.fields.event_id.as("text")} value={selectedEvent} hidden />
                </div>
                <Input class="w-full bg-primary" placeholder="Student ID" {...tap.fields.student_id.as("text")} />
                <Button variant="success" type="submit">Scan In</Button>
            </div>
        </form>

        <!-- Right column: Swipe history -->
        <Card.Root class="h-fit max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
            <Card.Header>
                <Card.Title>Swipe History</Card.Title>
                <Card.Description>
                    {swipeHistory.length} scan{swipeHistory.length !== 1 ? "s" : ""} this session
                </Card.Description>
            </Card.Header>
            <Card.Content class="overflow-y-auto flex-1">
                {#if swipeHistory.length === 0}
                    <p class="text-muted-foreground text-sm text-center py-8">No swipes yet</p>
                {:else}
                    <div class="space-y-3">
                        {#each swipeHistory as record (record.timestamp.getTime())}
                            <div class="flex items-center justify-between border-b pb-2 last:border-b-0">
                                <div>
                                    <p class="font-mono font-medium">{record.studentId}</p>
                                    <p class="text-sm text-muted-foreground">{record.eventName}</p>
                                </div>
                                <span class="text-sm text-muted-foreground">{formatTime(record.timestamp)}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>
    </div>
</div>

<style>
    @keyframes flash {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }

    .animate-flash {
        animation: flash 600ms ease-in-out forwards;
    }
</style>
