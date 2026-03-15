<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { getPointsInActiveSemester } from "$lib/functions/user/points.remote";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { toast } from "svelte-sonner";
    import Countup from "$lib/components/countup.svelte";
    import type { PageProps } from "./$types";
    import { fallOrSpring } from "$lib/utils";

    let pending = $state(false);
    let open = $state(false);
    let points = $state(0);
    let allTimePoints = $state(0);
    let currentSemester = $state("Loading...");

    let { data }: PageProps = $props();
    let semester = $derived(data.currentSemester);
    let semState = $derived(data.semesterState);
    let canCheckPoints = $state(false);
    currentSemester = "";
    $effect(() => {
        if (!semester) {
            currentSemester = "No active semester";
            canCheckPoints = false;
        } else {
            switch (semState) {
                case "active":
                    currentSemester = `For the current semester (${fallOrSpring(semester?.starts)} ${semester?.starts.getFullYear()} - ${semester?.code})`;
                    canCheckPoints = true;
                    break;
                case "awaiting":
                // In case of awaiting we'll just let them check for last semester
                case "past":
                    currentSemester = `Last semester: ${fallOrSpring(semester?.starts)} ${semester?.starts.getFullYear()} (${semester?.code})`;
                    canCheckPoints = true;
                    break;
            }
        }
    });
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
    <div class="w-full max-w-180">
        <div class="flex items-center gap-6">
            <h1 class="w-90 text-right text-4xl">
                Check Your Points<br />
                <p class="text-right text-sm">{currentSemester}</p>
            </h1>

            <div class="items-center gap-2 flex-1 px-4">
                <form
                    {...getPointsInActiveSemester.enhance(async ({ form, data, submit }) => {
                        pending = true;
                        try {
                            console.log("Submitting points check form");
                            await submit();
                            console.log("result: ", getPointsInActiveSemester.result);
                            points = getPointsInActiveSemester.result?.points ?? 0;
                            allTimePoints = getPointsInActiveSemester.result?.allTimePoints ?? 0;
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
                                    {...getPointsInActiveSemester.fields.student_id.as("text")}
                                    required
                                    id="student_id"
                                    class="bg-primary"
                                    placeholder="Enter student ID"
                                    disabled={!canCheckPoints}
                                />
                            </Field.Field>
                        </Field.Group>
                    </Field.Set>

                    <Button type="submit" disabled={pending || !canCheckPoints} class="mt-3"
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
<Dialog.Root bind:open>
    <Dialog.Content class="w-[90vw] max-w-xs sm:max-w-xs">
        <Dialog.Header class="text-center sm:text-center!">
            <Dialog.Title class="text-center sm:text-center!">You have...</Dialog.Title>
            <Dialog.Description class="text-7xl font-bold text-foreground text-center sm:text-center!">
                <Countup target={points} duration={1} />
            </Dialog.Description>
            <p class="text-2xl text-muted-foreground text-center">points this semester</p>
            <p class="text-sm text-muted-foreground text-center">
                <Countup target={allTimePoints} duration={1} /> all time
            </p>
        </Dialog.Header>
        <Dialog.Footer class="sm:justify-center">
            <Button type="button" variant="secondary" onclick={() => (open = false)}>Done</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
