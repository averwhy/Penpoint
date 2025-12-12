<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import HelpFooter from "$lib/components/help-footer.svelte";
    import { logout } from "$lib/functions/logout.remote.js";
    const { data } = $props();
    const { user, userClubs } = data;

    const initial = user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?";
</script>

<div class="mx-auto w-full max-w-3xl px-6 py-10">
    <Card.Root>
        <Card.Header class="flex flex-col gap-2">
            <div class="flex items-center gap-4">
                <div
                    class="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-semibold text-accent-foreground shadow-sm"
                >
                    {initial}
                </div>
                <div class="flex flex-col">
                    <Card.Title class="text-2xl">{user.name}</Card.Title>
                </div>
            </div>
        </Card.Header>
        <Card.Content class="space-y-6">
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-1">
                    <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <p class="text-lg font-medium break-all">
                        {user.email}
                        <span class="text-xs text-muted-foreground pl-3"
                            >Joined {new Date(user.created_at).toLocaleDateString()}</span
                        >
                    </p>
                </div>
            </div>
            <Separator />
            <div class="space-y-2">
                <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Club(s)</p>
                {#if userClubs.length > 0}
                    {#each userClubs as club}
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-lg font-semibold">{club.name}</span>
                        <Badge variant="outline">{club.acronym}</Badge>
                        {#if club.created_at}
                            <span class="text-xs text-muted-foreground"
                                >Created {new Date(userClubs[0].created_at).toLocaleDateString()}</span
                            >
                        {/if}
                    </div>
                    {/each}
                {:else}
                    <p class="italic text-muted-foreground">Not currently part of a club.</p>
                {/if}
            </div>
        </Card.Content>
        <Card.Footer class="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Account Role:</span>
                <Badge variant="outline">{user.role ?? "club"}</Badge>
            </div>
            <div class="flex items-center gap-2 sm:ml-auto justify-end">
                <form {...logout.for("account")}>
                    <Button type="submit" variant="ghost">Logout</Button>
                </form>
                <Button type="button" variant="outline" disabled>Change Password</Button>
            </div>
        </Card.Footer>
    </Card.Root>
    <HelpFooter class="mt-6" />
</div>
