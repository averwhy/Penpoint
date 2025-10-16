<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
</script>

<div
    class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#1e1e22] px-4"
>
    <h1 class="mb-8 text-center text-4xl font-semibold text-white">
        Penmen Pride
    </h1>
    <Card.Root>
        <Card.Header>
            <Card.Title>Card Title</Card.Title>
            <Card.Description>Card Description</Card.Description>
        </Card.Header>
        <Card.Content>
            <p>Card Content</p>
        </Card.Content>
        <Card.Footer>
            <p>Card Footer</p>
        </Card.Footer>
    </Card.Root>
</div>
