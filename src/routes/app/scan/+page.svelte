<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Select from "$lib/components/ui/select";
    import { tap } from "$lib/functions/tap.remote";
    import { Tap } from "$lib/models";
    import { toast } from "svelte-sonner";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();

    let selectedEvent = $state("");

    const eventName = $derived(data.events.find(event => event.id === selectedEvent)?.name ?? "Select an event…");
</script>

<form
    {...tap.preflight(Tap.omit({ id: true })).enhance(async ({ form, data, submit }) => {
        try {
            await submit();
            tap.fields.student_id.set("");
            toast.success("Student tapped successfully", {
                description: `${tap.result?.student.name ?? tap.result?.student.student_id ?? data.student_id} tapped into ${eventName} successfully.`,
            });
        } catch (error: any) {
            // ignore redirects
            console.error("tap failed", error);
            toast.error("Failed to tap student", { description: error?.body.message });
        } finally {
        }
    })}
>
    <div class="flex items-center justify-center min-h-[calc(100vh-68px)] mx-10">
        <div class="flex flex-col gap-4 w-full max-w-[420px] mx-auto">
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
    </div>
</form>
