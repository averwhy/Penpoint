<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import type { PageProps } from "./$types";

    const { data }: PageProps = $props();
    const { user, userClub } = data;
    let open = $state(false);

    if (userClub === undefined) {
        open = true;
    }
</script>

<div class="">
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
