<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import { page } from "$app/state";
    import { Toaster } from "$lib/components/ui/sonner/index";
    import { writable } from "svelte/store";
    import { fade } from "svelte/transition";
    import { ModeWatcher, toggleMode, mode } from "mode-watcher";

    import pp from "$lib/assets/penmenpride.png";
    import favicon from "$lib/assets/sga.svg";
    import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
    import SunMoon from "@lucide/svelte/icons/sun-moon";
    import "../app.css";

    let { children } = $props();

    const pathname = writable(page.url.pathname);
    afterNavigate(() => pathname.set(page.url.pathname));

    function handleToggleMode(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        toggleMode();
        console.log("changed mode");
    }

    // Sync mode changes to HTML class
    $effect(() => {
        const htmlEl = document.documentElement;
        if (mode.current === "light") {
            htmlEl.className = "light";
        } else if (mode.current === "dark") {
            htmlEl.className = "dark";
        }
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher track={true} defaultMode="system" />

<header>
    <Toaster richColors />
    <div class="p-2.5 bg-card fixed w-full top-0 left-0 z-[1000]">
        <div class="max-w-[1200px] m-auto p-1 flex justify-between items-center">
            <a data-sveltekit-preload-data="hover" href="/">
                <img src={pp} alt="Penmen Pride Logo" class="h-10 w-auto" />
            </a>
            <div class="flex gap-5">
                <NavigationMenu.Root
                    class="select-none leading-none no-underline outline-none transition-colors"
                    viewport={false}
                >
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/events">Events</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/clubs">Clubs</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Trigger class="bg-primary">Students</NavigationMenu.Trigger>
                            <NavigationMenu.Content>
                                <ul class="grid w-[200px] gap-4 p-2">
                                    <li>
                                        <NavigationMenu.Link href="/points">Points Checker</NavigationMenu.Link>
                                        <NavigationMenu.Link href="/login">Club Login</NavigationMenu.Link>
                                        <NavigationMenu.Link href="/register">Club Registration</NavigationMenu.Link>
                                    </li>
                                </ul>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Trigger class="bg-primary">Faculty</NavigationMenu.Trigger>
                            <NavigationMenu.Content>
                                <ul class="grid w-[200px] gap-4 p-2">
                                    <li>
                                        <NavigationMenu.Link href="/login">OSI Login</NavigationMenu.Link>
                                        <NavigationMenu.Link href="/register">OSI Registration</NavigationMenu.Link>
                                    </li>
                                </ul>
                            </NavigationMenu.Content>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link
                                href="https://www.snhusga.org/penmen-pride"
                                target="_blank"
                                rel="noopener noreferrer">About</NavigationMenu.Link
                            >
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
                <button
                    class="p-2 rounded-md hover:bg-accent"
                    aria-label="Toggle Light/Dark Mode"
                    onclick={handleToggleMode}
                >
                    <SunMoon class="h-6 w-6" />
                </button>
            </div>
        </div>
    </div>
</header>

{#key $pathname}
    <div in:fade={{ duration: 400 }}>
        {@render children?.()}
    </div>
{/key}
