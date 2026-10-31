<script lang="ts">
	import { base } from '$app/paths';
	import Logo from '$lib/components/Logo.svelte';
	import { SITE } from '$lib/data/site';
	import {
		LEGAL_DOCS,
		LEGAL_ENTITY,
		LEGAL_UPDATED_AT,
		formatLegalDate,
		type LegalDoc
	} from '$lib/data/legal';

	interface Props {
		doc: LegalDoc;
	}
	let { doc }: Props = $props();

	const pageTitle = $derived(`${doc.title} — ${SITE.name}`);
	const pageUrl = $derived(`${SITE.domain}/${doc.slug}`);
	const others = $derived(LEGAL_DOCS.filter((other) => other.slug !== doc.slug));
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={doc.summary} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={pageUrl} />
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={doc.summary} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:locale" content="es_CO" />
</svelte:head>

<header class="glass fixed inset-x-0 top-0 z-50 border-b border-white/[0.06]">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
		<div class="flex items-center gap-3">
			<Logo />
			<span class="text-fg-faint hidden sm:block">/</span>
			<span class="text-fg-muted hidden text-sm font-medium sm:block">Legal</span>
		</div>
		<a
			href="{base}/"
			class="text-fg-muted hover:text-fg rounded-lg px-3 py-2 text-sm transition-colors duration-200"
		>
			Inicio
		</a>
	</div>
</header>

<main class="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6">
	<p class="text-fg-faint text-xs font-medium tracking-wide uppercase">
		Actualizado el {formatLegalDate(LEGAL_UPDATED_AT)}
	</p>
	<h1 class="font-display text-fg mt-3 text-3xl font-semibold text-balance sm:text-4xl">
		{doc.title}
	</h1>
	<p class="text-fg-muted mt-4 text-base text-pretty">{doc.summary}</p>

	<nav
		aria-label="Contenido"
		class="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
	>
		<p class="text-fg text-sm font-semibold">Contenido</p>
		<ol class="mt-3 grid gap-1.5 sm:grid-cols-2">
			{#each doc.sections as section (section.id)}
				<li>
					<a
						href="#{section.id}"
						class="text-fg-muted hover:text-fg text-sm transition-colors duration-200"
					>
						{section.title}
					</a>
				</li>
			{/each}
		</ol>
	</nav>

	<div class="mt-10 flex flex-col gap-10">
		{#each doc.sections as section (section.id)}
			<section id={section.id} class="scroll-mt-24">
				<h2 class="font-display text-fg text-xl font-semibold">{section.title}</h2>
				{#each section.paragraphs as paragraph, index (index)}
					<p class="text-fg-muted mt-3 text-[15px] leading-relaxed text-pretty">{paragraph}</p>
				{/each}
				{#if section.items?.length}
					<ul
						class="text-fg-muted mt-3 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed"
					>
						{#each section.items as item, index (index)}
							<li class="text-pretty">{item}</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/each}
	</div>

	<aside class="mt-14 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
		<p class="text-fg text-sm font-semibold">Contacto</p>
		<p class="text-fg-muted mt-2 text-sm">
			{LEGAL_ENTITY.name} · NIT {LEGAL_ENTITY.nit} · {LEGAL_ENTITY.city}
		</p>
		<a
			href="mailto:{LEGAL_ENTITY.email}"
			class="mt-1 inline-block text-sm text-violet-300 transition-colors duration-200 hover:text-violet-200"
		>
			{LEGAL_ENTITY.email}
		</a>
		<div class="mt-4 flex flex-wrap gap-4 border-t border-white/[0.06] pt-4">
			{#each others as other (other.slug)}
				<a
					href="{base}/{other.slug}"
					class="text-fg-muted hover:text-fg text-sm transition-colors duration-200"
				>
					{other.title} →
				</a>
			{/each}
		</div>
	</aside>
</main>
