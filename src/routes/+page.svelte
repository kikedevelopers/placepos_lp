<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import TrustBar from '$lib/components/TrustBar.svelte';
	import Features from '$lib/components/Features.svelte';
	import Story from '$lib/components/Story.svelte';
	import Stats from '$lib/components/Stats.svelte';
	import Testimonials from '$lib/components/Testimonials.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Downloads from '$lib/components/Downloads.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { SITE, FAQ } from '$lib/data/site';

	const title = `${SITE.name} — ${SITE.tagline}`;
	const url = SITE.domain;
	const ogImage = `${SITE.domain}/logo.png`;

	const ldSoftware = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: SITE.name,
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		description: SITE.description,
		url,
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'COP',
			description: 'Empieza gratis'
		},
		featureList: [
			'Punto de venta',
			'Inventario en tiempo real',
			'Compras y proveedores',
			'Gastos y tesorería',
			'Finanzas y reportes',
			'Clientes y créditos',
			'Multi-sucursal',
			'Notificaciones en tiempo real'
		]
	};

	const ldOrg = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE.name,
		url,
		logo: `${SITE.domain}/logo.png`,
		email: SITE.email
	};

	// Refuerza la asociación marca ↔ dominio: al buscar "PlacePos", Google sabe
	// que este sitio ES PlacePos (incluye la variante sin mayúscula intercalada).
	const ldWebsite = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE.name,
		alternateName: ['Placepos', 'Place Pos', 'Place POS'],
		url,
		inLanguage: 'es-CO'
	};

	const ldFaq = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: FAQ.map((f) => ({
			'@type': 'Question',
			name: f.q,
			acceptedAnswer: { '@type': 'Answer', text: f.a }
		}))
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={SITE.description} />
	<meta
		name="keywords"
		content="ERP, punto de venta, POS, software para negocios, inventario, control de gastos, tesorería, software contable, sistema de ventas, multi-sucursal, software de inventario, PlacePos"
	/>
	<meta name="author" content={SITE.name} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={url} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={SITE.description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:locale" content="es_CO" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={SITE.description} />
	<meta name="twitter:image" content={ogImage} />

	{@html `<script type="application/ld+json">${JSON.stringify(ldWebsite)}</` + `script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(ldSoftware)}</` + `script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(ldOrg)}</` + `script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(ldFaq)}</` + `script>`}
</svelte:head>

<Nav />

<main>
	<Hero />
	<TrustBar />
	<Features />
	<Story />
	<Stats />
	<Testimonials />
	<Faq />
	<Downloads />
</main>

<Footer />
