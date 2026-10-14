<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	import {
		catalogImageSrc,
		getCatalog,
		groupProductsByCategory,
		type Catalog
	} from '$lib/api/catalog';
	import { ApiError } from '$lib/api/client';
	import { reveal } from '$lib/actions/reveal';
	import Icon from '$lib/components/Icon.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ProductGrid from '$lib/components/catalog/ProductGrid.svelte';
	import CategoryNav from '$lib/components/catalog/CategoryNav.svelte';
	import ProductModal from '$lib/components/catalog/ProductModal.svelte';
	import type { CatalogProduct } from '$lib/api/catalog';

	let catalog = $state<Catalog | null>(null);
	let loading = $state(true);
	let notFound = $state(false);
	let loadError = $state('');
	let search = $state('');
	let activeAnchor = $state('');
	let selected = $state<CatalogProduct | null>(null);

	// Filtro en cliente por nombre o categoría.
	const filtered = $derived.by(() => {
		if (!catalog) return [];
		const q = search.trim().toLowerCase();
		if (!q) return catalog.products;
		return catalog.products.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				(p.category ? p.category.toLowerCase().includes(q) : false)
		);
	});

	const coverSrc = $derived(catalog ? catalogImageSrc(catalog.business.cover_image_url) : null);
	const grouped = $derived(catalog?.business.group_by_category ?? false);
	const groups = $derived(grouped ? groupProductsByCategory(filtered) : []);
	// El sidebar solo aporta cuando hay varias categorías que navegar.
	const showSidebar = $derived(grouped && groups.length > 1);

	async function load() {
		loading = true;
		notFound = false;
		loadError = '';
		try {
			catalog = await getCatalog($page.params.slug ?? '');
		} catch (err) {
			if (err instanceof ApiError && err.status === 404) {
				notFound = true;
			} else {
				loadError =
					err instanceof ApiError ? err.message : 'No pudimos cargar el catálogo.';
			}
		} finally {
			loading = false;
		}
	}

	/** Salta a una categoría (o al inicio con ''). La sticky bar obliga el offset. */
	function goTo(anchor: string) {
		activeAnchor = anchor;
		if (anchor === '') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	// Scrollspy: marca activa la categoría cuyo encabezado domina el viewport.
	// Se rehace cuando cambian los grupos (p. ej. al buscar).
	$effect(() => {
		if (!showSidebar) {
			activeAnchor = '';
			return;
		}
		const anchors = groups.map((g) => g.anchor);
		const els = anchors
			.map((a) => document.getElementById(a))
			.filter((el): el is HTMLElement => el !== null);
		if (els.length === 0) return;

		const io = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) activeAnchor = visible[0].target.id;
			},
			{ rootMargin: '-120px 0px -70% 0px', threshold: 0 }
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	});

	onMount(load);
</script>

<svelte:head>
	<title>{catalog ? `${catalog.business.name} · Catálogo` : 'Catálogo'} — PlacePos</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="catalog min-h-screen bg-zinc-50 text-zinc-900">
	{#if loading}
		<!-- CARGA: hero tenue + grid de esqueletos -->
		<div class="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8">
			<div class="mb-10 space-y-3">
				<div class="h-3 w-24 animate-pulse rounded-full bg-zinc-200"></div>
				<div class="h-10 w-72 animate-pulse rounded-xl bg-zinc-200"></div>
				<div class="h-4 w-44 animate-pulse rounded-full bg-zinc-100"></div>
			</div>
			<div class="grid gap-5" style="grid-template-columns: repeat(auto-fill, minmax(190px, 1fr))">
				{#each Array(10) as _, i (i)}
					<div class="h-[330px] overflow-hidden rounded-2xl border border-zinc-200 bg-white">
						<div class="skeleton h-[184px] w-full"></div>
						<div class="space-y-3 p-4">
							<div class="skeleton h-3.5 w-5/6 rounded"></div>
							<div class="skeleton h-3.5 w-2/3 rounded"></div>
							<div class="skeleton mt-10 h-7 w-28 rounded"></div>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-12 flex items-center justify-center gap-2 text-sm text-zinc-500">
				<span class="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-brand"
				></span>
				Cargando catálogo…
			</div>
		</div>
	{:else if notFound}
		<!-- NO ENCONTRADO / NO PUBLICADO -->
		<div class="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
			<div class="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-400">
				<Icon name="boxes" size={30} />
			</div>
			<h1 class="font-display text-2xl font-bold text-zinc-900">Catálogo no disponible</h1>
			<p class="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
				Este catálogo no existe o su negocio aún no lo ha publicado. Verifica el enlace con
				quien te lo compartió.
			</p>
			<a
				href="{base}/"
				class="mt-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
			>
				<Icon name="home" size={16} /> Ir a PlacePos
			</a>
		</div>
	{:else if loadError}
		<!-- ERROR con reintento -->
		<div class="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
			<div class="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-amber/40 bg-amber/5 text-amber">
				<Icon name="alert" size={30} />
			</div>
			<h1 class="font-display text-2xl font-bold text-zinc-900">No pudimos cargar el catálogo</h1>
			<p class="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">{loadError}</p>
			<button
				onclick={load}
				class="sheen mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.97]"
			>
				<Icon name="refresh" size={16} /> Reintentar
			</button>
		</div>
	{:else if catalog}
		<!-- HERO -->
		{#if coverSrc}
			<!-- Con portada: imagen a sangre + degradado para que el texto sea legible. -->
			<header class="relative isolate overflow-hidden">
				<img
					src={coverSrc}
					alt=""
					class="absolute inset-0 h-full w-full object-cover"
					fetchpriority="high"
				/>
				<!-- Oscurecido inferior (texto) + sutil tinte de marca arriba. -->
				<div
					aria-hidden="true"
					class="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/35 to-zinc-950/10"
				></div>
				<div
					aria-hidden="true"
					class="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent mix-blend-overlay"
				></div>
				<div
					class="relative mx-auto flex min-h-[300px] max-w-7xl flex-col justify-end px-5 pb-10 pt-28 sm:min-h-[420px] sm:px-8"
				>
					<div class="reveal" use:reveal>
						<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
							Catálogo
						</p>
						<h1 class="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl">
							{catalog.business.name}
						</h1>
						<p class="mt-3 text-sm text-white/75">
							{catalog.count}
							{catalog.count === 1 ? 'producto disponible' : 'productos disponibles'}
						</p>
					</div>
				</div>
			</header>
		{:else}
			<!-- Sin portada: hero claro por defecto. -->
			<header class="relative overflow-hidden">
				<div
					aria-hidden="true"
					class="pointer-events-none absolute inset-x-0 -top-40 h-80"
					style="background: radial-gradient(60% 100% at 50% 100%, rgba(124,92,255,0.14), transparent 70%)"
				></div>
				<div class="relative mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8">
					<div class="reveal" use:reveal>
						<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
							Catálogo
						</p>
						<h1 class="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
							{catalog.business.name}
						</h1>
						<p class="mt-3 text-sm text-zinc-500">
							{catalog.count}
							{catalog.count === 1 ? 'producto disponible' : 'productos disponibles'}
						</p>
					</div>
				</div>
			</header>
		{/if}

		<!-- Barra de búsqueda sticky (+ chips de categoría en móvil) -->
		<div class="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-50/85 backdrop-blur">
			<div class="mx-auto max-w-7xl px-5 py-3 sm:px-8">
				<div class="relative">
					<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
					</span>
					<input
						type="search"
						bind:value={search}
						placeholder="Buscar producto o categoría…"
						class="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
					/>
				</div>
			</div>
			{#if showSidebar}
				<div class="mx-auto max-w-7xl pb-2.5 lg:hidden">
					<CategoryNav {groups} total={filtered.length} active={activeAnchor} variant="chips" onselect={goTo} />
				</div>
			{/if}
		</div>

		<!-- CONTENIDO -->
		<main class="mx-auto max-w-7xl px-5 pb-24 pt-8 sm:px-8">
			{#if filtered.length === 0}
				<div class="flex flex-col items-center justify-center py-28 text-center">
					<Icon name="boxes" size={34} class="text-zinc-300" />
					<p class="mt-4 text-sm text-zinc-500">
						{search.trim()
							? `No encontramos productos para "${search.trim()}".`
							: 'Este negocio aún no tiene productos publicados.'}
					</p>
				</div>
			{:else if showSidebar}
				<div class="lg:grid lg:grid-cols-[210px_1fr] lg:gap-10">
					<!-- Sidebar de categorías (desktop) -->
					<aside class="hidden lg:block">
						<div class="sticky top-[92px]">
							<CategoryNav {groups} total={filtered.length} active={activeAnchor} onselect={goTo} />
						</div>
					</aside>

					<!-- Secciones agrupadas por categoría -->
					<div class="space-y-12">
						{#each groups as group (group.anchor)}
							<section id={group.anchor} class="scroll-mt-28">
								<div class="mb-4 flex items-baseline gap-3">
									<h2 class="font-display text-xl font-bold tracking-tight text-zinc-900">
										{group.category}
									</h2>
									<span class="text-xs font-medium text-zinc-400">
										{group.products.length}
										{group.products.length === 1 ? 'producto' : 'productos'}
									</span>
								</div>
								<ProductGrid
									products={group.products}
									showCategory={false}
									onselect={(p) => (selected = p)}
								/>
							</section>
						{/each}
					</div>
				</div>
			{:else}
				<ProductGrid products={filtered} onselect={(p) => (selected = p)} />
			{/if}
		</main>

		<Footer />
	{/if}

	{#if selected}
		<ProductModal product={selected} onclose={() => (selected = null)} />
	{/if}
</div>

<style>
	/* Esqueleto con barrido en tonos claros (reusa el keyframe `shimmer` global). */
	.skeleton {
		background: linear-gradient(
			100deg,
			rgba(0, 0, 0, 0.04) 20%,
			rgba(0, 0, 0, 0.07) 40%,
			rgba(0, 0, 0, 0.04) 60%
		);
		background-size: 200% 100%;
		animation: shimmer 1.4s linear infinite;
	}
</style>
