<script lang="ts">
	import { tilt } from '$lib/actions/tilt';
	import { formatCop } from '$lib/utils/pricing';
	import { catalogImageSrc, type CatalogProduct } from '$lib/api/catalog';

	// `showCategory`: en modo agrupado la categoría ya encabeza la sección, así
	// que el chip sobre la tarjeta es redundante y se oculta.
	// `onselect`: abre el detalle del producto (modal).
	let {
		product,
		showCategory = true,
		onselect
	}: {
		product: CatalogProduct;
		showCategory?: boolean;
		onselect?: (product: CatalogProduct) => void;
	} = $props();

	const imageUrl = $derived(catalogImageSrc(product.image_url));

	// Precio a destacar: el más bajo. Si hay varios niveles, se marca "desde".
	const sorted = $derived([...product.prices].sort((a, b) => a.price - b.price));
	const lead = $derived(sorted[0] ?? null);
	const hasRange = $derived(product.prices.length > 1);

	// Carga de imagen: spinner hasta que resuelve; si falla, placeholder.
	let imgLoaded = $state(false);
	let imgFailed = $state(false);
</script>

<button
	type="button"
	use:tilt
	onclick={() => onselect?.(product)}
	aria-label="Ver detalle de {product.name}"
	class="tilt-spot group flex h-[330px] w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white text-left transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_18px_50px_-24px_rgba(24,24,40,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
	class:is-out={product.out_of_stock}
>
	<!-- Imagen (altura fija → la tarjeta mide siempre lo mismo) -->
	<div class="media relative h-[184px] shrink-0 overflow-hidden bg-zinc-100">
		{#if imageUrl && !imgFailed}
			{#if !imgLoaded}
				<div class="absolute inset-0 grid place-items-center">
					<span
						class="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-brand"
					></span>
				</div>
			{/if}
			<img
				src={imageUrl}
				alt={product.name}
				loading="lazy"
				decoding="async"
				onload={() => (imgLoaded = true)}
				onerror={() => (imgFailed = true)}
				class="h-full w-full object-cover transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover:scale-[1.04]"
				class:opacity-0={!imgLoaded}
				class:opacity-100={imgLoaded}
			/>
		{:else}
			<!-- Placeholder cuando no hay imagen -->
			<div
				class="absolute inset-0 grid place-items-center bg-gradient-to-br from-zinc-100 to-zinc-200/60 text-zinc-300"
			>
				<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>
				</svg>
			</div>
		{/if}

		{#if showCategory && product.category}
			<span
				class="absolute left-2.5 top-2.5 rounded-full border border-zinc-200/70 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 backdrop-blur"
			>
				{product.category}
			</span>
		{/if}

	</div>

	{#if product.out_of_stock}
		<span
			class="pointer-events-none absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-zinc-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur"
		>
			<span class="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
			Fuera de stock
		</span>
	{/if}

	<!-- Cuerpo: nombre secundario arriba, PRECIO protagonista abajo -->
	<div class="flex min-h-0 flex-1 flex-col justify-between p-4">
		<h3 class="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-600">
			{product.name}
		</h3>

		<div class="mt-auto">
			{#if lead}
				{#if hasRange}
					<p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
						Desde
					</p>
				{/if}
				<p class="flex items-baseline gap-1.5">
					<span class="price-lead text-[26px] font-extrabold leading-none tracking-tight text-zinc-900">
						{formatCop(lead.price)}
					</span>
					{#if lead.name && lead.name !== 'Precio'}
						<span class="text-[11px] font-medium text-zinc-400">/ {lead.name}</span>
					{/if}
				</p>
			{:else}
				<p class="text-xs font-medium text-zinc-400">Precio no disponible</p>
			{/if}
		</div>
	</div>
</button>

<style>
	/* Fuera de stock: la tarjeta sigue visible y clicable, pero se apaga —
	   imagen en gris y precio/nombre atenuados — para leerse como "no disponible". */
	.is-out .media {
		filter: grayscale(1);
		opacity: 0.55;
	}
	.is-out h3 {
		color: #a1a1aa; /* zinc-400 */
	}
	.is-out .price-lead {
		color: #a1a1aa; /* zinc-400 */
	}
</style>
