<script lang="ts">
    import { Collapsible as CollapsiblePrimitive } from "bits-ui";

    let {
        ref = $bindable(null),
        open = $bindable(false),
        children,
        ...restProps
    }: CollapsiblePrimitive.RootProps = $props();
</script>

<CollapsiblePrimitive.Root bind:ref bind:open data-slot="collapsible" {...restProps}>
    {@render children?.()}
</CollapsiblePrimitive.Root>
