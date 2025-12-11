<script lang="ts">
    import * as Tooltip from "$lib/components/ui/tooltip/index";

    let {
        date,
        reverse = false,
        time = true,
        underline = true,
    }: {
        date: Date;
        reverse?: boolean;
        time?: boolean;
        underline?: boolean;
    } = $props();

    const formatDate = (d: Date) =>
        new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: time ? "numeric" : undefined,
            minute: time ? "2-digit" : undefined,
        }).format(d);

    const formatRelative = (d: Date) => {
        const now = Date.now();
        const diff = d.getTime() - now;
        const absDiff = Math.abs(diff);

        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

        if (years > 0) return rtf.format(diff > 0 ? years : -years, "year");
        if (months > 0) return rtf.format(diff > 0 ? months : -months, "month");
        if (weeks > 0) return rtf.format(diff > 0 ? weeks : -weeks, "week");
        if (days > 0) return rtf.format(diff > 0 ? days : -days, "day");
        if (hours > 0) return rtf.format(diff > 0 ? hours : -hours, "hour");
        if (minutes > 0) return rtf.format(diff > 0 ? minutes : -minutes, "minute");
        return rtf.format(diff > 0 ? seconds : -seconds, "second");
    };

    const displayText = $derived(reverse ? formatRelative(date) : formatDate(date));
    const tooltipText = $derived(reverse ? formatDate(date) : formatRelative(date));
</script>

<Tooltip.Provider>
    <Tooltip.Root>
        <Tooltip.Trigger class="cursor-default {underline ? 'underline decoration-dotted underline-offset-2' : ''}">
            {displayText}
        </Tooltip.Trigger>
        <Tooltip.Content>
            {tooltipText}
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>
