<script lang="ts">
	import pp from "$lib/assets/penmenpride.png";
	import favicon from "$lib/assets/sga.svg";
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<div class="p-2.5 bg-[#141417] fixed w-full top-0 left-0 z-[1000]">
		<div
			class="max-w-[1200px] m-auto p-1 flex justify-between items-center"
		>
			<a data-sveltekit-preload-data="hover" href="/">
				<img src={pp} alt="Penmen Pride Logo" class="h-10 w-auto" />
			</a>
			<div class="flex gap-5 text-white">
				<a data-sveltekit-preload-data="hover" href="/">Home</a>
			</div>
		</div>
	</div>
</header>

{@render children?.()}
