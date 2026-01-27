<script lang="ts">
    import ClockAlert from "@lucide/svelte/icons/clock-alert";

    interface Props {
        name: string;
        id: string;
        approval_status: string;
        showAdminActions: boolean;
    }

    const { name, id, approval_status, showAdminActions }: Props = $props();
</script>

<div class="capitalize hover:underline flex items-center gap-2">
    <a href="/app/{showAdminActions ? 'manage/' : ''}events/{id}">
        {name}
    </a>
    {#if approval_status === "pending"}
        <ClockAlert size={16} />
    {/if}
</div>