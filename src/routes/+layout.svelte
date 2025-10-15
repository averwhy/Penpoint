<script lang="ts">
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
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
			<div class="flex gap-5">
				<NavigationMenu.Root class="bg-transparent text-[#141417]">
					<NavigationMenu.List>
						<NavigationMenu.Item>
							<NavigationMenu.Trigger class="bg-transparent text-white hover:bg-[#1e1e22]">
								Home
							</NavigationMenu.Trigger>
							<NavigationMenu.Content>
								<NavigationMenu.Link>
									Link
								</NavigationMenu.Link>
							</NavigationMenu.Content>
						</NavigationMenu.Item>
						<NavigationMenu.Item>
							<NavigationMenu.Trigger class="bg-transparent text-white hover:bg-[#1e1e22]">
								Students
							</NavigationMenu.Trigger>
							<NavigationMenu.Content>
								<NavigationMenu.Link>
									Check Points
								</NavigationMenu.Link>
								<NavigationMenu.Link>
									Club Login
								</NavigationMenu.Link>
							</NavigationMenu.Content>
						</NavigationMenu.Item>
					</NavigationMenu.List>
				</NavigationMenu.Root>
			</div>
		</div>
	</div>
</header>

{@render children?.()}
