<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import TrustBar from '$lib/components/TrustBar.svelte';
	import Features from '$lib/components/Features.svelte';
	import Story from '$lib/components/Story.svelte';
	import Stats from '$lib/components/Stats.svelte';
	import Testimonials from '$lib/components/Testimonials.svelte';
	import Pricing from '$lib/components/Pricing.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Downloads from '$lib/components/Downloads.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { SITE, FAQ } from '$lib/data/site';
	import { PRICING } from '$lib/data/pricing';
	import { monthlyEquivalent } from '$lib/utils/pricing';

	const title = `${SITE.name} — ${SITE.tagline}`;
	const url = SITE.domain;
	const ogImage = `${SITE.domain}/logo.png`;
	// Fecha de la última revisión de contenido. Señal de frescura para buscadores
	// y motores de IA; se actualiza a mano al tocar el copy o los precios.
	const dateModified = '2026-10-02';

	// ---------------------------------------------------------------------------
	// Datos estructurados (JSON-LD) en un solo `@graph` con entidades enlazadas
	// por `@id`. Un grafo conectado —no cuatro bloques sueltos— es lo que mejor
	// entienden tanto Google como los motores generativos (ChatGPT, Perplexity,
	// AI Overviews): deja claro que la Organización PUBLICA el SoftwareApplication
	// que esta WebPage DESCRIBE, con sus precios REALES y su FAQ citable.
	//
	// Regla: cada dato aquí existe también, visible, en la página. Nada inventado
	// (sin ratings falsos, sin reseñas con estrellas que la página no muestra).
	// ---------------------------------------------------------------------------
	const orgId = `${url}/#organization`;
	const siteId = `${url}/#website`;
	const pageId = `${url}/#webpage`;
	const softwareId = `${url}/#software`;
	const faqId = `${url}/#faq`;

	const ldGraph = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': orgId,
				name: SITE.name,
				url,
				email: SITE.email,
				description: SITE.description,
				logo: {
					'@type': 'ImageObject',
					url: `${SITE.domain}/logo.png`,
					width: 1024,
					height: 1024
				},
				areaServed: { '@type': 'Country', name: 'Colombia' },
				contactPoint: {
					'@type': 'ContactPoint',
					contactType: 'customer support',
					email: SITE.email,
					areaServed: 'CO',
					availableLanguage: ['Spanish']
				}
			},
			{
				// Refuerza la asociación marca ↔ dominio: al buscar "PlacePos", Google
				// sabe que este sitio ES PlacePos (incluye la variante sin mayúscula).
				'@type': 'WebSite',
				'@id': siteId,
				name: SITE.name,
				alternateName: ['Placepos', 'Place Pos', 'Place POS'],
				url,
				inLanguage: 'es-CO',
				publisher: { '@id': orgId }
			},
			{
				'@type': 'WebPage',
				'@id': pageId,
				url,
				name: title,
				description: SITE.description,
				inLanguage: 'es-CO',
				isPartOf: { '@id': siteId },
				about: { '@id': softwareId },
				primaryImageOfPage: ogImage,
				dateModified
			},
			{
				'@type': 'SoftwareApplication',
				'@id': softwareId,
				name: SITE.name,
				applicationCategory: 'BusinessApplication',
				applicationSubCategory: 'ERP',
				operatingSystem: 'Windows, Web',
				description: SITE.description,
				url,
				softwareVersion: SITE.version,
				inLanguage: 'es-CO',
				countriesSupported: 'CO',
				publisher: { '@id': orgId },
				// Precios REALES. Publicar `price: 0` con "Empieza gratis" cuando lo
				// que hay es una prueba de días es una señal falsa para Google y una
				// promesa que la app no cumple; el plan gratuito no existe.
				offers: {
					'@type': 'AggregateOffer',
					priceCurrency: PRICING.currency,
					lowPrice: String(PRICING.monthly_price),
					highPrice: String(PRICING.annual_price),
					offerCount: 2,
					offers: [
						{
							'@type': 'Offer',
							name: 'Plan anual',
							price: String(PRICING.annual_price),
							priceCurrency: PRICING.currency,
							description: `Plan anual de ${SITE.name} (equivale a ${monthlyEquivalent().toLocaleString('es-CO')} ${PRICING.currency} al mes), con ${PRICING.trial_days} días de prueba`
						},
						{
							'@type': 'Offer',
							name: 'Plan mensual',
							price: String(PRICING.monthly_price),
							priceCurrency: PRICING.currency,
							description: `Plan mensual de ${SITE.name}, con ${PRICING.trial_days} días de prueba`
						}
					]
				},
				featureList: [
					'Punto de venta',
					'Inventario en tiempo real',
					'Compras y proveedores',
					'Gastos y tesorería',
					'Finanzas y reportes',
					'Clientes y créditos',
					'Multi-sucursal',
					'Notificaciones en tiempo real',
					'Tickets por WhatsApp'
				]
			},
			{
				'@type': 'FAQPage',
				'@id': faqId,
				inLanguage: 'es-CO',
				isPartOf: { '@id': pageId },
				mainEntity: FAQ.map((f) => ({
					'@type': 'Question',
					name: f.q,
					acceptedAnswer: { '@type': 'Answer', text: f.a }
				}))
			}
		]
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
	<!-- `max-image-preview:large` habilita miniaturas grandes en Google y mejora
	     cómo se representa el sitio en AI Overviews / Discover; `max-snippet:-1`
	     deja usar el texto completo como respuesta citable. -->
	<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
	<link rel="canonical" href={url} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={SITE.description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:secure_url" content={ogImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1024" />
	<meta property="og:image:height" content="1024" />
	<meta property="og:image:alt" content="Logo de PlacePos, el ERP todo-en-uno" />
	<meta property="og:locale" content="es_CO" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={SITE.description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content="Logo de PlacePos, el ERP todo-en-uno" />

	{@html `<script type="application/ld+json">${JSON.stringify(ldGraph)}</` + `script>`}
</svelte:head>

<Nav />

<main>
	<Hero />
	<TrustBar />
	<Features />
	<Story />
	<Stats />
	<Testimonials />
	<!-- Precios antes del FAQ: la objeción que sigue al precio se responde
	     inmediatamente abajo, sin que el cliente tenga que ir a buscarla. -->
	<Pricing />
	<Faq />
	<Downloads />
</main>

<Footer />
