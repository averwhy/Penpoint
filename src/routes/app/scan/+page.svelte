<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Card from "$lib/components/ui/card";
    import * as Select from "$lib/components/ui/select";
    import { scan, manualScan } from "$lib/functions/scan.remote";
    import { Scan } from "$lib/models";
    import { toast } from "svelte-sonner";
    import type { PageProps } from "./$types";
    import EventSelector from "$lib/components/event-selector.svelte";

    interface SwipeRecord {
        wallet_pass_id: string;
        eventName: string;
        timestamp: Date;
    }

    const { data }: PageProps = $props();

    let selectedEvent = $state("");
    let scanHistory = $state<SwipeRecord[]>([]);
    let isCapturing = $state(false);
    let showPastEvents = $state(false);

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

    async function handleKeydown(event: KeyboardEvent) {
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
                    scan.fields.wallet_pass_id.set("");
                }, 10);

                if (selectedEvent === "") {
                    flash("error");
                    toast.error("Select an event before scanning a card.");
                    return;
                }
                await parseCardData(cardData);
                return;
            }

            // Timeout to clear buffer if input stops (card readers are fast, humans are slow)
            cardTimeout = setTimeout(() => {
                cardBuffer = "";
                isCapturing = false;
            }, 100);
        }
    }

    async function parseCardData(raw: string) {
        try {
            const walletPassId = raw; // The scanners will pickup the entire QR code which we can just use it directly
            if (
                scanHistory.find(r => {
                    return r.wallet_pass_id === walletPassId;
                })
            ) {
                flash("error");
                toast.error("Duplicate scan", { description: "That student has already scanned for this event!" });
                return;
            }

            try {
                await manualScan({ wallet_pass_id: walletPassId, event_id: selectedEvent });
            } catch (error: any) {
                flash("error");
                toast.error("Failed to scan student", { description: error?.body.message });
                return;
            }

            flash("success");
            toast.success("Pass scanned", { description: `Scanned wallet pass ID: ${walletPassId}` });

            // Add to scan history
            scanHistory = [
                {
                    wallet_pass_id: walletPassId,
                    eventName: eventName,
                    timestamp: new Date(),
                },
                ...scanHistory,
            ];
        } catch (error) {
            flash("error");
            toast.error(`Failed to parse card data: ${error}`);
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
        <form
            {...scan.preflight(Scan.omit({ id: true })).enhance(async (form) => {
                try {
                    await form.submit();
                    toast.success("Pass scanned successfully", {
                        description: `${scan.result?.scan.wallet_pass_id ?? form.fields.wallet_pass_id.value()} scanned into ${eventName} successfully.`, // TODO account for if it finds an user
                    });
                    scan.fields.wallet_pass_id.set("");
                } catch (error: any) {
                    console.error("scan failed", error);
                    toast.error("Failed to scan pass", { description: error?.body.message });
                }
            })}
        >
            <div class="flex flex-col gap-4">
                <div>
                    <EventSelector
                        bind:value={selectedEvent}
                        events={data.events}
                        bind:showPastEvents
                        placeholder="Select an event…"
                        widthClass="w-full bg-secondary text-muted-foreground"
                        selectActive={true}
                    />
                    <input {...scan.fields.event_id.as("text")} value={selectedEvent} hidden />
                </div>
                <div class="flex items-center gap-1.5">
                    <Checkbox id="pastEvents" bind:checked={showPastEvents} />
                    <Label for="pastEvents">Show past events</Label>
                </div>
                <Input class="w-full bg-primary" placeholder="Pass ID" {...scan.fields.wallet_pass_id.as("text")} />
                <Button variant="success" type="submit">Scan In</Button>
            </div>
        </form>

        <Card.Root class="h-fit max-h-[calc(100vh-300px)] overflow-hidden flex flex-col">
            <Card.Header>
                <Card.Title>Scan History</Card.Title>
                <Card.Description>
                    {scanHistory.length} scan{scanHistory.length !== 1 ? "s" : ""} this session
                </Card.Description>
            </Card.Header>
            <Card.Content class="overflow-y-auto flex-1">
                {#if scanHistory.length === 0}
                    <p class="text-muted-foreground text-sm text-center py-8">No scans yet</p>
                {:else}
                    <div class="space-y-3">
                        {#each scanHistory as record (record.timestamp.getTime())}
                            <div class="flex items-center justify-between border-b pb-2 last:border-b-0">
                                <div>
                                    <p class="font-mono font-medium">{record.wallet_pass_id}</p>
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
