export default defineNuxtRouteMiddleware((to, from) => {
	// Only run on client side
	if (process.server) return;

	// Only protect dashboard route
	if (to.path !== "/dashboard") return;

	const token = useCookie("access-token");

	if (!token.value) {
		return navigateTo("/login");
	}
});
