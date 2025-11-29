<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
    import { approveUserRequest } from "$lib/functions/new-users/approve.remote";
    import { blockUser } from "$lib/functions/new-users/block.remote";
    import { denyUserRequest } from "$lib/functions/new-users/deny.remote";
    import { User } from "$lib/models";
    import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
    import { toast } from "svelte-sonner";
    import * as Dialog from "../ui/dialog";

    let { id, user }: { id: string; user: User } = $props();
    let role: "admin" | "sga" | "club" = $state("club");
    let approveDialogOpen = $state(false);
    let approveSuccessDialogOpen = $state(false);
</script>

<Dialog.Root bind:open={approveSuccessDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>User approved successfully</Dialog.Title>
            <Dialog.Description>
                <span class="mb-2 block">Send them this link to set their password and get started:</span>
                <Button
                    onclick={() => {
                        if (approveUserRequest.result?.onboardingToken) {
                            navigator.clipboard
                                .writeText(`${location.origin}/onboarding/${approveUserRequest.result.onboardingToken}`)
                                .catch(() => {});
                            toast.success("Onboarding link copied to clipboard");
                        } else {
                            toast.error("No onboarding link available to copy");
                        }
                    }}
                >
                    Copy Onboarding Link
                </Button>
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={approveDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Approve User</Dialog.Title>
            <Dialog.Description>Select a role to approve the user with.</Dialog.Description>
        </Dialog.Header>
        <RadioGroup.Root bind:value={role}>
            <div class="flex items-center space-x-2">
                <Label>
                    <RadioGroup.Item value="club" />
                    Club
                </Label>
            </div>
            <div class="flex items-center space-x-2">
                <Label>
                    <RadioGroup.Item value="sga" />
                    SGA
                </Label>
            </div>
            {#if user.role === "admin"}
                <div class="flex items-center space-x-2">
                    <Label>
                        <RadioGroup.Item value="admin" />
                        Admin
                    </Label>
                </div>
            {/if}
        </RadioGroup.Root>
        <Dialog.Footer>
            <form
                {...approveUserRequest.enhance(async ({ form, data, submit }) => {
                    try {
                        await submit();
                        form.reset();
                        approveDialogOpen = false;
                        approveSuccessDialogOpen = true;
                    } catch (error: any) {
                        // ignore redirects
                        console.error("approve failed", error);
                        toast.error("Failed to approve user", { description: error?.body.message });
                    } finally {
                    }
                })}
            >
                <input {...approveUserRequest.fields.userId.as("text")} value={id} hidden />
                <input {...approveUserRequest.fields.role.as("text")} value={role} hidden />
                <Button type="submit">Approve</Button>
            </form>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
                <span class="sr-only">Open menu</span>
                <EllipsisIcon />
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label>Approve</DropdownMenu.Label>
            <DropdownMenu.Item onclick={() => (approveDialogOpen = true)}>Approve User</DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />

        <form {...denyUserRequest}>
            <DropdownMenu.Item>
                <input {...denyUserRequest.fields.userId.as("text")} value={id} hidden />
                <button class="w-full h-full text-left" type="submit">Deny</button>
            </DropdownMenu.Item>
        </form>

        <form {...blockUser}>
            <DropdownMenu.Item class="text-destructive">
                <input {...blockUser.fields.userId.as("text")} value={id} hidden />
                <button class="w-full h-full text-left" type="submit">Deny & Block</button>
            </DropdownMenu.Item>
        </form>
    </DropdownMenu.Content>
</DropdownMenu.Root>
