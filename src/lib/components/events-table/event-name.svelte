<script lang="ts">
    import ClockAlert from "@lucide/svelte/icons/clock-alert";
    import Denied from "@lucide/svelte/icons/ban";
    import Clock from "@lucide/svelte/icons/clock";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

    interface Props {
        name: string;
        id: string;
        approval_status: string;
        ends_at: Date;
        showAdminActions: boolean;
    }

    const { name, id, approval_status, ends_at, showAdminActions }: Props = $props();
</script>

<div class="capitalize hover:underline flex items-center gap-2">
    <a href="/app/{showAdminActions ? 'manage/' : ''}events/{id}">
        {name}
    </a>
    {#if approval_status === "unapproved"}
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <ClockAlert class="w-4 h-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>This event is unapproved and won't show up on the public calendar</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    {/if}
    {#if approval_status === "denied"}
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Denied class="w-4 h-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>This event was denied and won't show up on the public calendar</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    {/if}
    {#if ends_at < new Date()}
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Clock class="w-4 h-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>This event has passed</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>
    {/if}
</div>