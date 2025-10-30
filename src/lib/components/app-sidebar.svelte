<script lang="ts">
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import HouseIcon from "@lucide/svelte/icons/house";
    import InboxIcon from "@lucide/svelte/icons/inbox";
    import SearchIcon from "@lucide/svelte/icons/search";
    import SettingsIcon from "@lucide/svelte/icons/settings";
    import ChevronUp from "@lucide/svelte/icons/chevron-up";
    import * as Sidebar from "$lib/components/ui/sidebar/index";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
    import { User } from "$lib/models";
    import { error, redirect } from "@sveltejs/kit";

    const { user }: { user: User } = $props();

    import { logout } from "$lib/functions/logout.remote";

    // Menu items.
    const items = [
        {
            title: "Home",
            url: "#",
            icon: HouseIcon,
        },
        {
            title: "Dashboard",
            url: "#",
            icon: InboxIcon,
        },
        {
            title: "Events",
            url: "#",
            icon: CalendarIcon,
        },
        {
            title: "Your Club",
            url: "#",
            icon: SearchIcon,
        },
    ];
</script>

<Sidebar.Root variant="floating" collapsible="icon" class="pt-19">
    <Sidebar.Content>
        <Sidebar.Group>
            <Sidebar.GroupLabel>Penmen Pride App</Sidebar.GroupLabel>
            <Sidebar.GroupContent>
                <Sidebar.Menu>
                    {#each items as item (item.title)}
                        <Sidebar.MenuItem>
                            <Sidebar.MenuButton>
                                {#snippet child({ props })}
                                    <a href={item.url} {...props}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                {/snippet}
                            </Sidebar.MenuButton>
                        </Sidebar.MenuItem>
                    {/each}
                </Sidebar.Menu>
            </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        {#snippet child({ props })}
                            <Sidebar.MenuButton
                                {...props}
                                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                {user?.name}
                                <ChevronUp class="ml-auto" />
                            </Sidebar.MenuButton>
                        {/snippet}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content side="top" class="w-(--bits-dropdown-menu-anchor-width)">
                        <DropdownMenu.Item>
                            <span>Account</span>
                        </DropdownMenu.Item>

                        <form {...logout}>
                            <DropdownMenu.Item>
                                <button class="w-full h-full text-left" type="submit">Sign out</button>
                            </DropdownMenu.Item>
                        </form>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Footer>
</Sidebar.Root>
