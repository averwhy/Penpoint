<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		target: number;
		duration?: number;
	}

	let { target, duration = 2 }: Props = $props();

	let currentValue = $state(0);
	let animationFrameId: number;

	onMount(() => {
		const startTime = performance.now();
		const startValue = 0;
		const durationMs = duration * 1000;

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / durationMs, 1);

			const easeOutQuad = (t: number) => t * (2 - t);
			const easedProgress = easeOutQuad(progress);

			currentValue = Math.round(startValue + (target - startValue) * easedProgress);

			if (progress < 1) {
				animationFrameId = requestAnimationFrame(animate);
			} else {
				currentValue = target;
			}
		};

		animationFrameId = requestAnimationFrame(animate);

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	});
</script>

<span>{currentValue.toLocaleString()}</span>