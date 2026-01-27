import type { LayoutServerLoad } from './$types';
import { readdir } from 'fs/promises';
import { resolve, join } from 'path';

interface DocEntry {
    slug: string;
    title: string;
    url: string;
    children?: DocEntry[];
}

function slugToTitle(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function getDocEntries(dirPath: string, urlPrefix: string): Promise<DocEntry[]> {
    const entries = await readdir(dirPath, { withFileTypes: true });

    const docEntries: DocEntry[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) {
            continue;
        }

        const fullPath = join(dirPath, entry.name);
        const url = `${urlPrefix}/${entry.name}`;

        // Check for nested directories (children)
        const children = await getDocEntries(fullPath, url);

        docEntries.push({
            slug: entry.name,
            title: slugToTitle(entry.name),
            url,
            ...(children.length > 0 ? { children } : {})
        });
    }

    return docEntries.sort((a, b) => a.title.localeCompare(b.title));
}

export const load: LayoutServerLoad = async () => {
    const docsPath = resolve('src/routes/app/docs');
    const docEntries = await getDocEntries(docsPath, '/app/docs');

    return {
        docEntries
    };
};
