<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#1e1e22] px-4">
    <div class="w-full max-w-[720px]">
        <div class="flex items-center gap-6">
            <h1 class="w-90 text-right text-4xl">Check Your Points</h1>

            <div class="items-center gap-2 flex-1">
                <Field.Set class="w-full">
                    <Field.Group>
                        <Field.Field>
                            <Input id="studentid" class="w-full" placeholder="Enter student ID" />
                        </Field.Field>
                    </Field.Group>
                </Field.Set>

                <Button class="mt-3">Check</Button>
            </div>
        </div>
    </div>
</div>
