<script lang="ts">
    import * as Card from "$lib/components/ui/card/index";
    import { Button } from "$lib/components/ui/button/index";
    import { Separator } from "$lib/components/ui/separator/index";
    import { Badge } from "$lib/components/ui/badge/index";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index";
    const { data } = $props();
    const { matchedUser, userClubs } = data;

    const initial = matchedUser.name?.[0]?.toUpperCase() ?? matchedUser.email?.[0]?.toUpperCase() ?? "?";
    let deleteDialogOpen = $state(false);
    let deleteConfirmationInput = $state("");
</script>

<Dialog.Root bind:open={deleteDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Really delete this account?</Dialog.Title>
            <Dialog.Description class="text-foreground">
                {matchedUser.email} <br />
                This action cannot be undone. This will permanently delete this account and remove the data forever (a long
                time)!
                <!-- W Minecraft easter egg? ^^^^^ -->
            </Dialog.Description>
        </Dialog.Header>
        <Input type="text" bind:value={deleteConfirmationInput} placeholder="Enter email to confirm" />
        <Dialog.Footer>
            <Button variant="secondary" onclick={() => (deleteDialogOpen = false)}>Cancel</Button>
            <Button
                variant="destructive"
                onclick={() => {
                    /* delete user */
                    deleteDialogOpen = false;
                }}
                disabled={deleteConfirmationInput !== matchedUser.email}
            >
                Delete
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<div class="mx-auto w-full max-w-3xl px-6 py-10">
    <Button href="/app/manage/users" variant="ghost" class="mb-6">← Back to Users</Button>
    <Card.Root>
        <Card.Header class="flex flex-col gap-2">
            <div class="flex items-center gap-4">
                <div
                    class="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-semibold text-accent-foreground shadow-sm"
                >
                    {initial}
                </div>
                <div class="flex flex-col">
                    <Card.Title class="text-2xl">{matchedUser.name}</Card.Title>
                </div>
            </div>
        </Card.Header>
        <Card.Content class="space-y-6">
            <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-1">
                    <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <p class="text-lg font-medium break-all">
                        {matchedUser.email}
                        <span class="text-xs text-muted-foreground pl-3"
                            >Joined {new Date(matchedUser.created_at).toLocaleDateString()}</span
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
                <Badge variant="outline">{matchedUser.role ?? "club"}</Badge>
            </div>
            <div class="flex items-center gap-2 sm:ml-auto justify-end">
                <Button type="button" variant="outline" disabled>Send password reset</Button>
                <Button type="button" variant="destructive" onclick={() => {
                    deleteDialogOpen = true;
                    deleteConfirmationInput = "";
                }}>Delete</Button>
            </div>
        </Card.Footer>
    </Card.Root>
</div>
