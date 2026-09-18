<script lang="ts">
	import '$lib/styles/app.css';
	import { session } from '$lib/stores/session.svelte';

	let { children } = $props();

	// La sesión se lee una sola vez, aquí: si cada página leyera `localStorage`
	// por su cuenta, la navegación entre ellas volvería a leerlo y el panel
	// parpadearía en cada salto.
	$effect(() => {
		session.load();
	});
</script>

{@render children()}
