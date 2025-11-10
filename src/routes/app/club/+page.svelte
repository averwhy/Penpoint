<script lang="ts">
    import * as Card from "$lib/components/ui/card/index";
    import { getClubFromUser } from "$lib/functions/user/club.remote";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Button } from "$lib/components/ui/button/index";
    import type { PageProps } from "./$types";
    import { redirect } from "@sveltejs/kit";

    const { data }: PageProps = $props();
    let open = $state(false);
    const { user } = data;

    const userClub = await getClubFromUser(user.id);
    if (userClub === undefined) {
        open = true;
    }
</script>

<div class=""> 
    <!-- TODO figure out why dialog doesn't show up on page -->
     <!-- The background goes dark but the actual dialog isn't visible -->
    <Dialog.Root bind:open>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>One small problem...</Dialog.Title>
                <Dialog.Description>
                    You're not part of a club. Chances are, you should not be here. Contact SGA to get this fixed.
                </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
                <Button href="/app">Go back</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>
</div>

<div class="flex items-center justify-center min-h-screen">
    {#if userClub !== undefined}
        <!-- Your club content will go here -->
        <p>Club content</p>
    {/if}
</div>
