<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { Label } from "$lib/components/ui/label/index";
    import { Input } from "$lib/components/ui/input/index";
    import { Button } from "$lib/components/ui/button/index";
    import { toast } from "svelte-sonner";
    import { buttonVariants } from "$lib/components/ui/button";
    import { enhance } from "$app/forms";

    interface Props {
        open: boolean;
    }

    let { open = $bindable(false) }: Props = $props();

    let pending = $state(false);
    let clubLogo = $state<File | null>(null);

    function validateForm(): boolean {
        if (clubLogo === null) {
            toast.error("Please upload a logo for the club");
            return false;
        } else {
            if (clubLogo.size > 5 * 1024 * 1024) {
                toast.error("Logo file size exceeds the maximum limit of 5MB");
                return false;
            }

            if (!["image/png", "image/jpg", "image/jpeg"].includes(clubLogo.type)) {
                toast.error("Invalid logo file type. Please upload a PNG, JPG, or JPEG image");
                return false;
            }
        }
        return true;
    }
</script>

<Dialog.Root bind:open>
    <form
        method="POST"
        enctype="multipart/form-data"
        use:enhance={() => {
            if (!validateForm()) {
                return () => {}; // Cancel submission
            }
            pending = true;
            return async ({ result, update }) => {
                pending = false;
                if (result.type === "failure") {
                    toast.error((result.data?.message as string) ?? "Failed to upload logo");
                } else if (result.type === "redirect") {
                    toast.success("Logo updated successfully!");
                    await update();
                } else {
                    await update();
                }
            };
        }}
    >
        <Dialog.Content class="sm:max-w-106.25">
            <Dialog.Header>
                <Dialog.Title>Upload new logo</Dialog.Title>
                <Dialog.Description>Upload a new logo for your club here.</Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
                <Input
                        type="file"
                        name="logo"
                        accept="image/png,image/jpg,image/jpeg"
                        onchange={e => {
                            const input = e.currentTarget as HTMLInputElement;
                            clubLogo = input.files?.[0] ?? null;
                        }}
                    />
            </div>
            <Dialog.Footer>
                <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
                <Button type="submit">Upload</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </form>
</Dialog.Root>