import { prerender } from "$app/server";

export interface DocsSearchItem {
    title: string;
    url: string;
    section?: string;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export const getSearchableDocs = prerender(async () => {
    const modules = import.meta.glob<string>('/src/routes/app/docs/**/*.md', { query: '?raw', import: 'default', eager: true });

    const items: DocsSearchItem[] = [];

    for (const [path, content] of Object.entries(modules)) {
        const url = path
            .replace('/src/routes', '')
            .replace('/+page.md', '')
            .replace('.md', '');

        // Extract the page title (first h1)
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const pageTitle = titleMatch?.[1];
        if (!pageTitle) continue;

        // Add the page itself as a searchable item
        items.push({
            title: pageTitle,
            url
        });

        // Extract all headers (h2, h3, etc.) with their content
        const headerMatches = content.matchAll(/^(#{2,})\s+(.+)$/gm);
        for (const match of headerMatches) {
            const headerText = match[2];
            const anchorId = slugify(headerText);
            items.push({
                title: headerText,
                url: `${url}#${anchorId}`,
                section: pageTitle
            });
        }
    }

    return items;
});