<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex justify-center">
	<div>
		<h1 class="text-2xl font-bold mt-4">this is a event: {data.slug}</h1>
	</div>
</div>