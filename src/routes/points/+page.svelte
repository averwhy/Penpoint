<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { getPoints } from "$lib/functions/user/points.remote";
    import * as Drawer from "$lib/components/ui/drawer/index";
    import { toast } from "svelte-sonner";
    import Countup from "$lib/components/countup.svelte";

    let pending = $state(false);
    let open = $state(false);
    let points = $state(0);
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
    <div class="w-full max-w-[720px]">
        <div class="flex items-center gap-6">
            <h1 class="w-90 text-right text-4xl">Check Your Points</h1>

            <div class="items-center gap-2 flex-1">
                <form
                    {...getPoints.enhance(async ({ form, data, submit }) => {
                        pending = true;
                        try {
                            console.log("Submitting points check form");
                            await submit();
                            console.log("result: ", getPoints.result);
                            points = getPoints.result?.points ?? 0;
                            open = true;
                        } catch (error: any) {
                            console.log("point check failed", error);
                            toast.error("Point check failed", { description: error?.body.message });
                        } finally {
                            pending = false;
                        }
                    })}
                >
                    <Field.Set class="w-full">
                        <Field.Group>
                            <Field.Field>
                                <Input
                                    {...getPoints.fields.student_id.as("text")}
                                    required
                                    id="student_id"
                                    class="w-full"
                                    placeholder="Enter student ID"
                                />
                            </Field.Field>
                        </Field.Group>
                    </Field.Set>

                    <Button type="submit" disabled={pending} class="mt-3"
                        >{#if pending}
                            Counting...
                        {:else}
                            Check
                        {/if}</Button
                    >
                </form>
            </div>
        </div>
    </div>
</div>
<Drawer.Root bind:open>
    <Drawer.Content>
        <Drawer.Header>
            <Drawer.Title class="text-center mb-[-20px]">You have...</Drawer.Title>
        </Drawer.Header>
        <Drawer.Header class="text-center">
            <Drawer.Title class="text-7xl font-bold"><Countup target={points} duration={1} /></Drawer.Title>
            <Drawer.Description class="text-2xl">points</Drawer.Description>
        </Drawer.Header>
        <Drawer.Footer>
            <Drawer.Close>Done</Drawer.Close>
        </Drawer.Footer>
    </Drawer.Content>
</Drawer.Root>
