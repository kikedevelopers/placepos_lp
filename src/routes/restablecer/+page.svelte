<script lang="ts">
	import { onMount } from 'svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { SITE } from '$lib/data/site';

	/** Deep link que abre PlacePos en la pantalla de contraseña nueva. */
	let deepLink = $state('');
	let hasToken = $state(true);
	/** El navegador ya intentó abrir la app: se muestra la ayuda del "no pasó nada". */
	let launched = $state(false);

	const pageTitle = `Cambiar contraseña — ${SITE.name}`;

	function openApp() {
		if (!deepLink) return;
		launched = true;
		// `location.href` y no `window.open`: los bloqueadores de popups matan
		// la segunda, y un esquema propio no abre pestaña de todos modos.
		window.location.href = deepLink;
	}

	onMount(() => {
		const token = new URLSearchParams(window.location.search).get('token')?.trim() ?? '';
		if (!token) {
			hasToken = false;
			return;
		}

		deepLink = `placepos://reset-password?token=${encodeURIComponent(token)}`;

		// Se limpia el token de la barra de direcciones en cuanto se lee: es una
		// credencial, y no tiene que quedar en el historial ni viajar en el
		// `Referer` de nada que la página cargue después.
		window.history.replaceState({}, '', window.location.pathname);

		// Intento automático. Si el navegador lo bloquea (algunos exigen un
		// gesto del usuario), el botón de abajo queda para hacerlo a mano.
		openApp();
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
	<!-- Resplandor de marca, el mismo del hero. -->
	<div
		class="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-[420px] w-[620px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
		style="background:radial-gradient(circle,rgba(124,92,255,0.45),transparent 70%)"
	></div>

	<div class="mb-10">
		<Logo size={40} />
	</div>

	<div class="card-hairline bg-surface/60 w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
		{#if !hasToken}
			<div
				class="border-amber/30 bg-amber/10 text-amber mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border"
			>
				<Icon name="alert" size={26} />
			</div>
			<h1 class="mt-6 text-2xl font-extrabold tracking-tight">Enlace incompleto</h1>
			<p class="text-fg-muted mt-3 text-sm leading-relaxed">
				Este enlace no trae el código de recuperación. Ábrelo directamente desde el correo que te
				enviamos, sin copiarlo a mano.
			</p>
		{:else}
			<div
				class="border-brand/30 bg-brand/10 text-brand mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border"
			>
				<Icon name="lock" size={26} />
			</div>

			<h1 class="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
				<span class="text-gradient">Abriendo PlacePos…</span>
			</h1>
			<p class="text-fg-muted mt-3 text-sm leading-relaxed">
				Tu computador te va a preguntar si quieres abrir PlacePos. Acepta y sigue ahí para escribir
				tu contraseña nueva.
			</p>

			<button
				type="button"
				onclick={openApp}
				class="from-brand to-brand-2 hover:shadow-glow mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]"
			>
				Abrir PlacePos
				<Icon name="arrow" size={16} />
			</button>

			{#if launched}
				<div class="border-line mt-8 border-t pt-6 text-left">
					<p class="text-fg-muted text-sm font-medium">¿No pasó nada?</p>
					<ul class="text-fg-faint mt-3 space-y-2 text-xs leading-relaxed">
						<li>· Asegúrate de tener PlacePos instalado en este computador.</li>
						<li>· Si tu navegador mostró un aviso, acéptalo para permitir la apertura.</li>
						<li>· Vuelve a pulsar el botón de arriba.</li>
					</ul>
					<a
						href="{SITE.domain}/#descargas"
						class="text-brand mt-4 inline-block text-xs hover:underline"
					>
						Descargar PlacePos
					</a>
				</div>
			{/if}
		{/if}
	</div>

	<a
		href={SITE.domain}
		class="text-fg-faint hover:text-fg-muted mt-8 text-xs transition-colors duration-200"
	>
		Volver a {SITE.name}
	</a>
</main>
