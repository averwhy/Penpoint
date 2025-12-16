<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index";
    import Button from "../ui/button/button.svelte";
    import { Event } from "$lib/models";

    interface Props {
        event: Event;
        open: boolean;
    }

    let { event, open = $bindable(false) }: Props = $props();
</script>

<Dialog.Root bind:open>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
            <Dialog.Description>
                This action cannot be undone. This will permanently delete your account and remove your data from our
                servers.
            </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
            <Button>Cancel</Button>
            <Button variant="destructive">Delete event</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
