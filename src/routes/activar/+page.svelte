<script lang="ts">
	import { onMount } from 'svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { SITE } from '$lib/data/site';

	type Status = 'checking' | 'success' | 'already' | 'error';

	let status = $state<Status>('checking');
	let name = $state('');
	let message = $state('');

	const pageTitle = `Activar cuenta — ${SITE.name}`;

	/**
	 * Canjea el token contra el API.
	 *
	 * El token se lee de la URL en el NAVEGADOR y se manda por POST: si fuera
	 * por query al API, quedaría en sus logs de acceso, y es una credencial de
	 * un solo uso.
	 */
	async function activate(token: string) {
		try {
			const res = await fetch(`${SITE.apiUrl}/auth/activate`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ token })
			});
			const body = (await res.json().catch(() => null)) as {
				success?: boolean;
				error?: string;
				payload?: { already_activated?: boolean; name?: string };
			} | null;

			if (!res.ok || !body?.success) {
				status = 'error';
				message = body?.error ?? 'No pudimos activar la cuenta. Intenta de nuevo en unos minutos.';
				return;
			}

			name = body.payload?.name ?? '';
			status = body.payload?.already_activated ? 'already' : 'success';
		} catch {
			status = 'error';
			message = 'No pudimos contactar al servidor. Revisa tu conexión e intenta de nuevo.';
		}
	}

	onMount(() => {
		const token = new URLSearchParams(window.location.search).get('token')?.trim() ?? '';
		if (!token) {
			status = 'error';
			message = 'El enlace no trae el código de activación. Ábrelo directamente desde el correo.';
			return;
		}
		// Limpia el token de la barra de direcciones en cuanto se lee: no tiene
		// que quedar en el historial ni viajar en el `Referer` de nada que la
		// página cargue después.
		window.history.replaceState({}, '', window.location.pathname);
		void activate(token);
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

	<div
		class="card-hairline bg-surface/60 w-full max-w-md rounded-3xl p-8 text-center sm:p-10"
		aria-live="polite"
	>
		{#if status === 'checking'}
			<div
				class="border-brand/30 bg-brand/10 text-brand mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border"
			>
				<!-- Spinner rápido: la espera se percibe más corta. -->
				<span class="border-brand/30 border-t-brand h-6 w-6 animate-spin rounded-full border-2"
				></span>
			</div>
			<h1 class="mt-6 text-2xl font-extrabold tracking-tight">Activando tu cuenta…</h1>
			<p class="text-fg-muted mt-3 text-sm">Esto toma un segundo.</p>
		{:else if status === 'success' || status === 'already'}
			<div
				class="border-mint/30 bg-mint/10 text-mint mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border"
			>
				<Icon name="check" size={26} />
			</div>
			<h1 class="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
				{#if status === 'already'}
					<span class="text-gradient">Tu cuenta ya estaba activa</span>
				{:else}
					<span class="text-gradient">¡Listo{name ? `, ${name}` : ''}!</span>
				{/if}
			</h1>
			<p class="text-fg-muted mt-3 text-sm leading-relaxed">
				{#if status === 'already'}
					No hace falta hacer nada más. Abre PlacePos e inicia sesión con tu correo y contraseña.
				{:else}
					Tu cuenta quedó activada. Ya puedes abrir PlacePos e iniciar sesión con tu correo y la
					contraseña que elegiste.
				{/if}
			</p>

			<div class="mt-8 flex flex-col gap-3">
				<a
					href="{SITE.domain}/docs"
					class="from-brand to-brand-2 hover:shadow-glow inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]"
				>
					Cómo dar los primeros pasos
					<Icon name="arrow" size={16} />
				</a>
				<a
					href="{SITE.domain}/#descargas"
					class="text-fg-muted hover:text-fg text-sm transition-colors duration-200"
				>
					Descargar PlacePos
				</a>
			</div>
		{:else}
			<div
				class="border-amber/30 bg-amber/10 text-amber mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border"
			>
				<Icon name="alert" size={26} />
			</div>
			<h1 class="mt-6 text-2xl font-extrabold tracking-tight">No pudimos activar la cuenta</h1>
			<p class="text-fg-muted mt-3 text-sm leading-relaxed">{message}</p>
			<p class="text-fg-faint mt-6 text-xs leading-relaxed">
				Si el enlace venció o ya lo usaste, escríbenos por WhatsApp al
				<a href="https://wa.me/573117323107" class="text-brand hover:underline">
					+57 311 732 3107
				</a>
				y te enviamos uno nuevo.
			</p>
		{/if}
	</div>

	<a
		href={SITE.domain}
		class="text-fg-faint hover:text-fg-muted mt-8 text-xs transition-colors duration-200"
	>
		Volver a {SITE.name}
	</a>
</main>
