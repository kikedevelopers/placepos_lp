<script lang="ts">
	import { base } from '$app/paths';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Logo from './Logo.svelte';
	import Icon from './Icon.svelte';
	import { magnetic } from '$lib/actions/magnetic';
	import { session } from '$lib/stores/session.svelte';

	let scrolled = $state(false);
	let open = $state(false);

	// Quien ya entró no necesita que le ofrezcan iniciar sesión: el mismo botón
	// lo lleva a su cuenta. Hasta que la sesión se lee (`ready`) se muestra la
	// versión de invitado, que es la correcta para la inmensa mayoría de visitas
	// y evita el parpadeo de un "Mi cuenta" que desaparece.
	const accountLink = $derived(
		session.ready && session.isAuthenticated
			? { href: `${base}/panel`, label: 'Mi cuenta' }
			: { href: `${base}/ingresar`, label: 'Iniciar sesión' }
	);

	// `/docs` es una página aparte y va con `base` para no romperse cuando el
	// sitio se sirve bajo un subdirectorio. El resto son anclas de esta página.
	const links = [
		{ href: '#features', label: 'Funciones' },
		{ href: '#how', label: 'Cómo funciona' },
		{ href: '#testimonios', label: 'Clientes' },
		{ href: '#precios', label: 'Precios' },
		{ href: `${base}/docs`, label: 'Documentación' },
		{ href: '#faq', label: 'Preguntas' }
	];

	function onScroll() {
		scrolled = window.scrollY > 16;
	}

	$effect(() => {
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<header
	class="fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-out)]"
	class:py-3={!scrolled}
	class:py-2={scrolled}
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6">
		<nav
			class="flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 ease-[var(--ease-out)] sm:px-5"
			class:glass={scrolled}
			style={scrolled ? 'box-shadow:var(--shadow-float)' : ''}
		>
			<Logo />

			<ul class="hidden items-center gap-0.5 md:flex">
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							class="text-fg-muted hover:text-fg group relative rounded-lg px-2.5 py-2 text-sm whitespace-nowrap transition-colors duration-200 lg:px-3"
						>
							{link.label}
							<!-- Subrayado que crece desde el centro: un detalle que se nota en
							     el agregado, no de uno en uno. -->
							<span
								class="absolute inset-x-2.5 bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-[var(--color-brand)] to-transparent transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-x-100 lg:inset-x-3"
							></span>
						</a>
					</li>
				{/each}
			</ul>

			<div class="hidden items-center gap-2 md:flex">
				<a
					href={accountLink.href}
					class="text-fg-muted hover:text-fg rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors duration-200"
				>
					{accountLink.label}
				</a>
				<a
					href="#cta"
					use:magnetic={{ strength: 0.3 }}
					class="group bg-fg text-ink sheen relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold active:scale-[0.97]"
				>
					Comienza YA!
					<Icon
						name="arrow"
						size={15}
						class="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5"
					/>
				</a>
			</div>

			<!-- Mobile toggle -->
			<button
				class="text-fg inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-150 active:scale-90 md:hidden"
				onclick={() => (open = !open)}
				aria-label="Menú"
				aria-expanded={open}
			>
				<Icon name={open ? 'x' : 'menu'} size={22} />
			</button>
		</nav>

		<!-- Mobile menu -->
		{#if open}
			<div
				class="glass mt-2 overflow-hidden rounded-2xl p-3 md:hidden"
				style="box-shadow:var(--shadow-float)"
				transition:slide={{ duration: 260, easing: cubicOut }}
			>
				<ul class="flex flex-col">
					{#each links as link (link.href)}
						<li>
							<a
								href={link.href}
								onclick={() => (open = false)}
								class="text-fg-muted hover:text-fg block rounded-lg px-3 py-3 text-sm transition-colors hover:bg-white/5"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
				<a
					href={accountLink.href}
					onclick={() => (open = false)}
					class="text-fg-muted hover:text-fg mt-1 block rounded-lg px-3 py-3 text-sm transition-colors hover:bg-white/5"
				>
					{accountLink.label}
				</a>
				<a
					href="#cta"
					onclick={() => (open = false)}
					class="bg-fg text-ink mt-2 flex items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-sm font-semibold transition-transform duration-150 active:scale-[0.97]"
				>
					Comienza YA!
					<Icon name="arrow" size={15} />
				</a>
			</div>
		{/if}
	</div>
</header>
