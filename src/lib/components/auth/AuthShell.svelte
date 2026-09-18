<script lang="ts">
	import type { Snippet } from 'svelte';
	import { base } from '$app/paths';
	import Logo from '$lib/components/Logo.svelte';
	import { SITE } from '$lib/data/site';

	interface Props {
		/** Ancho de la tarjeta. El registro pide más aire que el login. */
		width?: 'md' | 'lg';
		children: Snippet;
		/** Pie opcional bajo la tarjeta (enlaces de cambio de pantalla). */
		footer?: Snippet;
	}

	let { width = 'md', children, footer }: Props = $props();
</script>

<!--
  El marco de las pantallas de cuenta.

  Es el mismo lienzo de /activar —resplandor de marca, logo arriba, tarjeta con
  hairline— para que quien llega desde la landing no sienta que salió del sitio
  justo en el momento de dar sus datos.
-->
<main class="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
	<div
		class="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-[420px] w-[620px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
		style="background:radial-gradient(circle,rgba(124,92,255,0.45),transparent 70%)"
	></div>

	<a href="{base}/" class="mb-8 transition-opacity duration-200 hover:opacity-80">
		<Logo size={36} />
	</a>

	<div
		class="card-hairline bg-surface/60 w-full rounded-3xl p-7 sm:p-9 {width === 'lg'
			? 'max-w-lg'
			: 'max-w-md'}"
	>
		{@render children()}
	</div>

	{#if footer}
		<div class="mt-6 text-center text-sm">
			{@render footer()}
		</div>
	{/if}

	<a
		href="{base}/"
		class="text-fg-faint hover:text-fg-muted mt-8 text-xs transition-colors duration-200"
	>
		Volver a {SITE.name}
	</a>
</main>
