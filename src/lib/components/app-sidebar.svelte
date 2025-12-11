<script lang="ts">
    import { page } from "$app/state";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index";
    import * as Sidebar from "$lib/components/ui/sidebar/index";
    import { User } from "$lib/models";
    import CalendarIcon from "@lucide/svelte/icons/calendar";
    import CalendarCheck from "@lucide/svelte/icons/calendar-check-2";
    import CalendarCog from "@lucide/svelte/icons/calendar-cog";
    import ChevronUp from "@lucide/svelte/icons/chevron-up";
    import IdCard from "@lucide/svelte/icons/id-card";
    import LeftPanel from "@lucide/svelte/icons/layout-panel-left";
    import SearchIcon from "@lucide/svelte/icons/search";
    import AddUser from "@lucide/svelte/icons/user-plus";
    import UserCog from "@lucide/svelte/icons/user-round-cog";
    import UsersIcon from "@lucide/svelte/icons/users";

    const { user }: { user: User } = $props();

    import { logout } from "$lib/functions/logout.remote";

    // Menu items.
    let items = [
        {
            title: "Dashboard",
            url: "/app",
            icon: LeftPanel,
        },
        {
            title: "Events",
            url: "/app/events",
            icon: CalendarIcon,
        },
        {
            title: "Your Clubs",
            url: "/app/club",
            icon: SearchIcon,
        },
    ];

    let sgaItems = [
        {
            title: "Event Scanning",
            url: "/app/scan",
            icon: IdCard,
        },
        {
            title: "New User Requests",
            url: "/app/new-user-requests",
            icon: AddUser,
        },
        {
            title: "Event Requests",
            url: "",
            icon: CalendarCheck,
        },
    ];

    let adminItems = [
        {
            title: "Semesters",
            url: "/app/manage/semesters",
            icon: CalendarCog,
        },
        {
            title: "User Management",
            url: "/app/manage/users",
            icon: UserCog,
        },
        {
            title: "Club Management",
            url: "",
            icon: UsersIcon,
        },
        {
            title: "Event Management",
            url: "",
            icon: CalendarCog,
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
                            <Sidebar.MenuButton
                                class={item.url === "/app"
                                    ? page.url.pathname === "/app"
                                        ? "bg-background"
                                        : ""
                                    : page.url.pathname.startsWith(item.url)
                                      ? "bg-background"
                                      : ""}
                            >
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
            {#if user.role === "sga" || user.role === "admin"}
                <Sidebar.GroupLabel>SGA</Sidebar.GroupLabel>
                <Sidebar.GroupContent>
                    <Sidebar.Menu>
                        {#each sgaItems as item (item.title)}
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
            {/if}
            {#if user.role === "admin"}
                <Sidebar.GroupLabel>Admins</Sidebar.GroupLabel>
                <Sidebar.GroupContent>
                    <Sidebar.Menu>
                        {#each adminItems as item (item.title)}
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
            {/if}
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
                            <a href="/app/account" class="w-full h-full text-left">Account</a>
                        </DropdownMenu.Item>

                        <form {...logout.for("sidebar")}>
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
