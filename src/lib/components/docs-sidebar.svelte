<script lang="ts">
    import { page } from "$app/state";
    import * as ScrollArea from "$lib/components/ui/scroll-area/index";
    import * as Accordion from "$lib/components/ui/accordion/index";
    import FileText from "@lucide/svelte/icons/file-text";
    import FolderOpen from "@lucide/svelte/icons/folder-open";

    interface DocEntry {
        slug: string;
        title: string;
        url: string;
        children?: DocEntry[];
    }

    interface Props {
        docEntries: DocEntry[];
    }

    const { docEntries }: Props = $props();

    function isActive(url: string): boolean {
        return page.url.pathname === url;
    }
</script>

<ScrollArea.Root class="h-full">
    <div class="p-4">
        <nav>
            <ul class="space-y-1">
                {#each docEntries as entry (entry.slug)}
                    {#if entry.children && entry.children.length > 0}
                        <li>
                            <Accordion.Root type="multiple">
                                <Accordion.Item value={entry.slug} class="border-none">
                                    <Accordion.Trigger
                                        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full hover:bg-muted text-muted-foreground hover:text-foreground [&[data-state=open]>svg]:rotate-0"
                                    >
                                        <FolderOpen class="size-4 shrink-0" />
                                        <span class="truncate flex-1 text-left">{entry.title}</span>
                                    </Accordion.Trigger>
                                    <Accordion.Content>
                                        <ul class="ml-4 pl-2 border-l space-y-1 mt-1">
                                            {#each entry.children as child (child.slug)}
                                                <li>
                                                    <a
                                                        href={child.url}
                                                        class="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                                            {isActive(child.url)
                                                            ? 'bg-primary text-primary-foreground font-medium'
                                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'}"
                                                    >
                                                        <span class="truncate">{child.title}</span>
                                                    </a>
                                                </li>
                                            {/each}
                                        </ul>
                                    </Accordion.Content>
                                </Accordion.Item>
                            </Accordion.Root>
                        </li>
                    {:else}
                        <li>
                            <a
                                href={entry.url}
                                class="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                    {isActive(entry.url)
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'}"
                            >
                                <FileText class="size-4 shrink-0" />
                                <span class="truncate">{entry.title}</span>
                            </a>
                        </li>
                    {/if}
                {/each}
            </ul>
        </nav>
    </div>
</ScrollArea.Root>
