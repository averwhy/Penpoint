<script lang="ts">
    import { page } from "$app/state";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { cn } from "$lib/utils";
    let { class: className = "" } = $props<{ class?: string }>();
</script>

<footer class={cn("mt-8", className)}>
    <Separator class="my-4"/>
    <p class="text-muted-foreground mt-4 text-sm text-center">
        Need help? <a href={page.url.pathname.startsWith('/app') ? '/app/help' : '/help'} class="underline underline-offset-4 hover:text-foreground">Get support here.</a>
    </p>
</footer>
