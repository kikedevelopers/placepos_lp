<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { formatCop } from '$lib/utils/pricing';
	import { catalogImageSrc, type CatalogProduct } from '$lib/api/catalog';

	// Detalle del producto. Espejo de la ventana del POS, pero con datos PÚBLICOS:
	// imagen, nombre, precio(s) y descripción. Jamás stock/costo/margen.
	let { product, onclose }: { product: CatalogProduct; onclose: () => void } = $props();

	const imageUrl = $derived(catalogImageSrc(product.image_url));
	const sorted = $derived([...product.prices].sort((a, b) => a.price - b.price));
	const lead = $derived(sorted[0] ?? null);
	const extraPrices = $derived(sorted.slice(1));

	let imgLoaded = $state(false);
	let imgFailed = $state(false);

	function onKey(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}

	// Bloquea el scroll del fondo mientras el modal está abierto.
	$effect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});
</script>

<svelte:window onkeydown={onKey} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
	<!-- Telón: cerrar al hacer clic fuera -->
	<button
		type="button"
		aria-label="Cerrar"
		onclick={onclose}
		transition:fade={{ duration: 180 }}
		class="absolute inset-0 cursor-default bg-zinc-900/40 backdrop-blur-sm"
	></button>

	<div
		role="dialog"
		aria-modal="true"
		aria-label={product.name}
		transition:scale={{ start: 0.96, opacity: 0, duration: 220 }}
		class="relative z-10 flex max-h-[90vh] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_40px_120px_-30px_rgba(24,24,40,0.5)]"
	>
		<!-- Cerrar -->
		<button
			type="button"
			onclick={onclose}
			aria-label="Cerrar"
			class="absolute right-4 top-4 z-20 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-zinc-200 bg-white/90 text-zinc-500 backdrop-blur transition-colors hover:bg-zinc-100 hover:text-zinc-700"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
		</button>

		<!-- Imagen / placeholder (mismo tratamiento del POS) -->
		<div class="media relative h-56 shrink-0 overflow-hidden" class:is-out={product.out_of_stock}>
			{#if imageUrl && !imgFailed}
				{#if !imgLoaded}
					<div class="absolute inset-0 grid place-items-center bg-zinc-100">
						<span class="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-brand"></span>
					</div>
				{/if}
				<img
					src={imageUrl}
					alt={product.name}
					decoding="async"
					onload={() => (imgLoaded = true)}
					onerror={() => (imgFailed = true)}
					class="h-full w-full object-cover transition-opacity duration-500"
					class:opacity-0={!imgLoaded}
					class:opacity-100={imgLoaded}
				/>
			{:else}
				<div class="absolute inset-0 grid place-items-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-300">
					<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/>
					</svg>
				</div>
			{/if}

			{#if product.category}
				<span class="absolute left-4 top-4 rounded-full border border-zinc-200/70 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 backdrop-blur">
					{product.category}
				</span>
			{/if}
		</div>

		<!-- Cuerpo -->
		<div class="flex min-h-0 flex-col gap-5 overflow-y-auto p-6">
			<div class="flex flex-col gap-2">
				{#if product.out_of_stock}
					<span class="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600">
						<span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
						No disponible · Fuera de stock
					</span>
				{/if}
				<h2 class="font-display text-2xl font-extrabold leading-tight tracking-tight text-zinc-900">
					{product.name}
				</h2>
			</div>

			<!-- Precio -->
			<div>
				<p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Precio</p>
				{#if lead}
					<p class="mt-1 flex items-center gap-2">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
						<span class="text-3xl font-extrabold leading-none tracking-tight text-emerald-600">
							{formatCop(lead.price)}
						</span>
						{#if lead.name && lead.name !== 'Precio'}
							<span class="text-sm font-medium text-zinc-400">/ {lead.name}</span>
						{/if}
					</p>
				{:else}
					<p class="mt-1 text-sm font-medium text-zinc-400">Precio no disponible</p>
				{/if}
			</div>

			<!-- Otros niveles de precio (si hay) -->
			{#if extraPrices.length > 0}
				<div>
					<p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
						Otros precios
					</p>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each extraPrices as price (price.name + price.price)}
							<span class="inline-flex items-baseline gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5">
								<span class="text-sm font-bold text-zinc-800">{formatCop(price.price)}</span>
								{#if price.name && price.name !== 'Precio'}
									<span class="text-[11px] font-medium text-zinc-400">{price.name}</span>
								{/if}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Descripción -->
			<div class="border-t border-zinc-100 pt-4">
				<p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
					Descripción
				</p>
				{#if product.description && product.description.trim()}
					<p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
						{product.description}
					</p>
				{:else}
					<p class="mt-2 text-sm italic leading-relaxed text-zinc-400">
						Este producto no tiene descripción.
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* Fuera de stock: imagen del detalle en gris para reforzar "no disponible". */
	.media.is-out {
		filter: grayscale(1);
		opacity: 0.65;
	}
</style>
