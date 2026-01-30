<script lang="ts">
    import { type DocsSearchItem } from "$lib/functions/docs/search.remote";

    interface Props {
        docItems: DocsSearchItem[];
        open: boolean;
    }

    let { open = $bindable(false), docItems = $bindable([]) }: Props = $props();

    let history: DocsSearchItem[] = $state([]);
    let highlightedValue = $state("");

    import * as Command from "$lib/components/ui/command/index.js";

    function handleSelection(item: DocsSearchItem) {
        history = [item, ...history.filter(h => h.title !== item.title)].slice(0, 10);
        open = false;
        window.location.href = item.url;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && highlightedValue) {
            const allItems = [...history, ...docItems];
            const item = allItems.find(i => i.url === highlightedValue);
            if (item) {
                handleSelection(item);
            }
        }
    }
</script>

<Command.Dialog bind:open bind:value={highlightedValue}>
    <Command.Input placeholder="Search for something..." onkeydown={handleKeydown} />
    <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {#if history.length > 0}
            <Command.Group heading="Recent">
                {#each history as item}
                    <Command.Item
                        value={item.url}
                        onclick={() => {
                            handleSelection(item);
                        }}
                    >
                        {item.title}
                        <h6 class="text-xs text-muted-foreground">{item.section ?? ""}</h6>
                    </Command.Item>
                {/each}
            </Command.Group>
            <Command.Separator />
        {/if}
        <Command.Group>
            {#each docItems as item}
                <Command.Item
                    value={item.url}
                    onclick={() => {
                        handleSelection(item);
                    }}
                >
                    {item.title}
                    <h6 class="text-xs text-muted-foreground">{item.section ?? ""}</h6>
                </Command.Item>
            {/each}
        </Command.Group>
    </Command.List>
</Command.Dialog>
