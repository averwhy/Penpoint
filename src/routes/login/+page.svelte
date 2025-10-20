<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#1e1e22]">
    <div class="grid grid-cols-2 gap-x-5">
        <div class="">
            <h1 class="text-4xl">Login</h1>
            <h3>
                SGA, OSI and Club<br />E-Board member login only.
            </h3>
        </div>
        <div class="items-center gap-2 flex-1">
            <Field.Set class="w-full">
                <Field.Group>
                    <Field.Field>
                        <Input id="email" class="w-full" placeholder="Email" />
                    </Field.Field>
                    <Field.Field>
                        <Input id="pw" class="w-full" placeholder="Password" />
                    </Field.Field>
                </Field.Group>
            </Field.Set>

            <Button class="mt-3">Login</Button>
        </div>
    </div>
</div>
