<script lang="ts">
    import type { Event, Tap } from "$lib/models";
    import { AreaChart } from "layerchart";
    import { curveNatural } from "d3-shape";
    import { scaleUtc } from "d3-scale";
    import * as Chart from "$lib/components/ui/chart/index.js";
    import * as Card from "$lib/components/ui/card/index.js";

    interface Props {
        event: Event;
        event_taps: Tap[];
    }

    let { event, event_taps }: Props = $props();

    const BUCKET_MINUTES = 5;

    const chartConfig = {
        scans: { label: "Scan-ins", color: "var(--chart-1)" },
    } satisfies Chart.ChartConfig;

    const chartData = $derived.by(() => {
        const start = event.starts_at.getTime();
        const end = event.ends_at.getTime();
        const bucketMs = BUCKET_MINUTES * 60 * 1000;
        const bucketCount = Math.ceil((end - start) / bucketMs);

        const buckets: { date: Date; scans: number }[] = [];
        for (let i = 0; i <= bucketCount; i++) {
            buckets.push({
                date: new Date(start + i * bucketMs),
                scans: 0,
            });
        }

        for (const tap of event_taps) {
            const tapTime = new Date(tap.created_at).getTime();
            const idx = Math.floor((tapTime - start) / bucketMs);
            if (idx >= 0 && idx < buckets.length) {
                buckets[idx].scans++;
            }
        }

        return buckets;
    });

    function formatTime(date: Date): string {
        if (date.getMinutes() === 0) return date.toLocaleTimeString("en-US", { hour: "numeric" });
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Scan-ins Over Time</Card.Title>
        <Card.Description>
            Taps during {event.name} in {BUCKET_MINUTES}-minute intervals
        </Card.Description>
    </Card.Header>
    <Card.Content>
        <Chart.Container config={chartConfig}>
            <AreaChart
                data={chartData}
                x="date"
                xScale={scaleUtc()}
                series={[
                    {
                        key: "scans",
                        label: chartConfig.scans.label,
                        color: chartConfig.scans.color,
                    },
                ]}
                axis="x"
                props={{
                    area: {
                        curve: curveNatural,
                        "fill-opacity": 0.4,
                        line: { class: "stroke-1" },
                        motion: "tween",
                    },
                    xAxis: {
                        format: (v: Date) => formatTime(v),
                    },
                }}
            >
                {#snippet tooltip()}
                    <Chart.Tooltip labelFormatter={(v: Date) => formatTime(v)} indicator="line" />
                {/snippet}
            </AreaChart>
        </Chart.Container>
    </Card.Content>
    <Card.Footer>
        <div class="flex w-full items-start gap-2 text-sm">
            <div class="grid gap-2">
                <div class="flex items-center gap-2 leading-none font-medium">
                    {event_taps.length} total scan-in{event_taps.length !== 1 ? "s" : ""}
                </div>
                <div class="text-muted-foreground flex items-center gap-2 leading-none">
                    {formatTime(event.starts_at)} — {formatTime(event.ends_at)}
                </div>
            </div>
        </div>
    </Card.Footer>
</Card.Root>
