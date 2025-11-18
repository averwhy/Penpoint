<script lang="ts">
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldSeparator,
	} from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLFormAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		pending = $bindable(false),
		class: className,
		...restProps
	}: WithElementRef<HTMLFormAttributes> & { pending?: boolean } = $props();

	const id = $props.id();
</script>

<form class={cn("flex flex-col gap-6", className)} bind:this={ref} {...restProps}>
	<FieldGroup>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Login to your account</h1>
			<p class="text-muted-foreground text-balance text-sm">
				Enter your email below to login to your account
				<br />
				Access is granted only to SGA, OSI, and Club E-Board members.
			</p>
		</div>
		<Field>
			<FieldLabel>Email</FieldLabel>
			<Input name="email" type="email" class="bg-primary" placeholder="example@snhu.edu" required/>
		</Field>
		<Field>
			<div class="flex items-center">
				<FieldLabel>Password</FieldLabel>
				<a href="##" class="ml-auto text-xs underline-offset-4 hover:underline">
					Forgot your password?
				</a>
			</div>
			<Input name="_password" type="password" class="bg-primary" placeholder="Your password" required/>
		</Field>
		<Field>
			<Button type="submit" disabled={pending}>{pending ? "Logging in..." : "Login"}</Button>
		</Field>
		<FieldSeparator class="[&>div]:bg-primary h-2" />
		<Field>
			<FieldDescription class="text-center">
				Don't have an account?
				<a href="/register" class="underline underline-offset-4">Sign up</a>
			</FieldDescription>
		</Field>
	</FieldGroup>
</form>
