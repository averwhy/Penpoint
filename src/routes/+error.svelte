<script lang="ts">
    import { page } from "$app/state";
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#1e1e22] px-4">
    <div class="text-9xl text-left">
        {page.status}
    </div>
    <div class="text-4xl text-center">
        <h1>
            Something went wrong.<br />
            {page.error} <br />
            Try going <a href="/" class="text-blue-400 hover:text-blue-600">home</a>.
        </h1>
    </div>
</div>
