<script lang="ts">
	import { base } from '$app/paths';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import DocsSidebar from '$lib/components/docs/DocsSidebar.svelte';
	import DocsSection from '$lib/components/docs/DocsSection.svelte';
	import DocsMap from '$lib/components/docs/DocsMap.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { DOC_MODULES, DOC_GROUPS } from '$lib/data/docs';
	import { SITE } from '$lib/data/site';

	const pageTitle = `Documentación — ${SITE.name}`;
	const pageUrl = `${SITE.domain}/docs`;
	const pageDesc = `Cómo funciona ${SITE.name} por dentro: qué hace cada módulo, los conceptos que conviene entender y cómo se conectan entre sí.`;

	let activeId = $state(DOC_MODULES[0].id);
	let menuOpen = $state(false);

	// Scrollspy: marca activa la sección más arriba dentro de la banda de lectura.
	// rootMargin recorta el viewport a una franja bajo el header para que la
	// sección activa sea la que el ojo está leyendo, no la que apenas asoma.
	$effect(() => {
		const ids = ['mapa', ...DOC_MODULES.map((m) => m.id)];
		const sections = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);
		if (!sections.length) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) activeId = visible[0].target.id;
			},
			{ rootMargin: '-88px 0px -70% 0px', threshold: 0 }
		);

		for (const section of sections) observer.observe(section);
		return () => observer.disconnect();
	});

	// El panel móvil bloquea el scroll de fondo mientras está abierto.
	$effect(() => {
		if (!menuOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDesc} />
	<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
	<link rel="canonical" href={pageUrl} />

	<meta property="og:type" content="article" />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDesc} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:image" content="{SITE.domain}/logo.png" />
	<meta property="og:locale" content="es_CO" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDesc} />
	<meta name="twitter:image" content="{SITE.domain}/logo.png" />
</svelte:head>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') menuOpen = false;
	}}
/>

<!-- ═══ Header ═══ -->
<header class="glass fixed inset-x-0 top-0 z-50 border-b border-white/[0.06]">
	<div class="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
		<div class="flex items-center gap-3">
			<Logo />
			<span class="text-fg-faint hidden sm:block">/</span>
			<span class="text-fg-muted hidden text-sm font-medium sm:block">Documentación</span>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="{base}/"
				class="text-fg-muted hover:text-fg hidden rounded-lg px-3 py-2 text-sm transition-colors duration-200 sm:block"
			>
				Inicio
			</a>
			<a
				href={SITE.downloads.windows}
				class="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97] sm:inline-flex"
				style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
			>
				<Icon name="download" size={15} />
				Descargar
			</a>

			<!-- Índice en móvil -->
			<button
				type="button"
				onclick={() => (menuOpen = !menuOpen)}
				class="text-fg-muted flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition-transform duration-150 ease-out active:scale-[0.97] lg:hidden"
				aria-label={menuOpen ? 'Cerrar índice' : 'Abrir índice'}
				aria-expanded={menuOpen}
			>
				<Icon name={menuOpen ? 'x' : 'menu'} size={18} />
			</button>
		</div>
	</div>
</header>

<!-- ═══ Panel de índice (móvil) ═══ -->
{#if menuOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="bg-ink/80 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
		style="animation:docs-fade 160ms var(--ease-out-quint)"
		onclick={() => (menuOpen = false)}
	></div>
	<div
		class="border-line bg-ink-soft fixed inset-x-0 top-[57px] z-40 max-h-[70vh] overflow-y-auto border-b px-5 py-6 lg:hidden"
		style="animation:docs-panel 200ms var(--ease-out-quint)"
	>
		<DocsSidebar
			groups={DOC_GROUPS}
			modules={DOC_MODULES}
			{activeId}
			onNavigate={() => (menuOpen = false)}
		/>
	</div>
{/if}

<div class="mx-auto max-w-[1400px] px-4 pt-24 sm:px-6">
	<div class="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
		<!-- ═══ Índice lateral (desktop) ═══ -->
		<aside class="hidden lg:block">
			<div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-10">
				<DocsSidebar groups={DOC_GROUPS} modules={DOC_MODULES} {activeId} />
			</div>
		</aside>

		<!-- ═══ Contenido ═══ -->
		<main class="min-w-0 pb-24">
			<!-- Portada -->
			<div class="relative overflow-hidden pt-6 pb-6 sm:pt-10">
				<div
					class="orb top-0 -left-20 h-64 w-64"
					style="background:radial-gradient(circle,#7c5cff,transparent 65%);opacity:0.3"
				></div>
				<div class="relative">
					<p
						class="reveal text-brand text-[11px] font-semibold tracking-widest uppercase"
						use:reveal
					>
						Documentación
					</p>
					<h1 class="reveal font-display mt-3 text-4xl font-extrabold sm:text-5xl" use:reveal>
						<span class="text-gradient-soft">Cómo funciona</span>
						<span class="text-gradient">{SITE.name}</span>
					</h1>
					<p class="reveal text-fg-muted mt-5 max-w-2xl text-base leading-relaxed" use:reveal>
						{SITE.name} no es un programa de caja: es un sistema donde cada módulo alimenta al siguiente.
						Aquí está qué hace cada uno, los conceptos que conviene entender y — sobre todo — cómo se
						conectan entre sí. Si nunca lo has usado, empieza por el mapa.
					</p>
				</div>
			</div>

			<!-- Mapa de relaciones -->
			<DocsMap />

			<!-- Módulos -->
			{#each DOC_MODULES as mod (mod.id)}
				<DocsSection {mod} modules={DOC_MODULES} />
			{/each}

			<!-- Cierre -->
			<div class="reveal card-hairline mt-16 rounded-2xl p-8 text-center" use:reveal>
				<h2 class="font-display text-fg text-xl font-bold">¿Listo para probarlo?</h2>
				<p class="text-fg-muted mx-auto mt-2 max-w-md text-sm leading-relaxed">
					Descarga {SITE.name} e instálalo en el computador de tu negocio. Si tienes dudas, escríbenos
					y te acompañamos en la puesta en marcha.
				</p>
				<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
					<a
						href={SITE.downloads.windows}
						class="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97]"
						style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
					>
						<Icon name="download" size={16} />
						Descargar para Windows
					</a>
					<a
						href="{base}/#cta"
						class="text-fg inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-white/[0.06]"
					>
						Hablar con nosotros
					</a>
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	/* Entradas del panel móvil. Enter suave (ease-out fuerte), sin scale(0):
	   el panel nace desde su propio borde superior. */
	@keyframes docs-fade {
		from {
			opacity: 0;
		}
	}

	@keyframes docs-panel {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global([style*='docs-panel']),
		:global([style*='docs-fade']) {
			animation: none !important;
		}
	}
</style>
