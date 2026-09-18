<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import AuthShell from '$lib/components/auth/AuthShell.svelte';
	import Field from '$lib/components/auth/Field.svelte';
	import FormAlert from '$lib/components/auth/FormAlert.svelte';
	import SubmitButton from '$lib/components/auth/SubmitButton.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { ApiError } from '$lib/api/client';
	import { portalLogin, requestPasswordReset } from '$lib/api/portal';
	import { session } from '$lib/stores/session.svelte';
	import { SITE } from '$lib/data/site';
	import {
		isValid,
		isValidEmail,
		validateLogin,
		type FormErrors,
		type LoginFormValues
	} from '$lib/utils/auth-validation';

	const pageTitle = `Iniciar sesión — ${SITE.name}`;

	let values = $state<LoginFormValues>({ email: '', password: '' });
	let errors = $state<FormErrors<LoginFormValues>>({});
	let submitError = $state('');
	let submitting = $state(false);

	/** Plan que traía desde la sección de precios; se lo lleva al panel. */
	let plan = $state('');

	// Modo "olvidé mi contraseña": el mismo formulario cambia de cara en vez de
	// mandar al usuario a otra página y perder lo que ya escribió.
	let recovering = $state(false);
	let recoverySent = $state('');
	let recoveryError = $state('');
	let recoverySubmitting = $state(false);

	const panelHref = $derived(`${base}/panel${plan ? `?plan=${plan}` : ''}`);
	const registerHref = $derived(`${base}/registro${plan ? `?plan=${plan}` : ''}`);

	// Dos efectos y no uno: leer la URL y decidir la redirección son cosas
	// distintas, y mezclarlas haría que el efecto que navega dependa del plan
	// que él mismo acaba de escribir.
	$effect(() => {
		plan = new URLSearchParams(window.location.search).get('plan') ?? '';
	});

	$effect(() => {
		// Con sesión abierta esta página no tiene nada que ofrecer.
		if (session.ready && session.isAuthenticated) {
			void goto(panelHref, { replaceState: true });
		}
	});

	function clearFieldError(field: keyof LoginFormValues): void {
		if (errors[field]) {
			errors = { ...errors, [field]: undefined };
		}
		submitError = '';
	}

	async function onSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		submitError = '';

		errors = validateLogin(values);
		if (!isValid(errors)) return;

		submitting = true;
		try {
			const result = await portalLogin(values.email.trim(), values.password);
			session.set({ access_token: result.access_token, user: result.user });
			await goto(panelHref);
		} catch (error) {
			// Los mensajes del backend ya están escritos para el usuario final
			// (cuenta sin activar, no eres el dueño): se muestran tal cual en vez
			// de traducirlos aquí y arriesgar dos textos distintos para lo mismo.
			submitError =
				error instanceof ApiError
					? error.message
					: 'No pudimos iniciar sesión. Intenta de nuevo.';
		} finally {
			submitting = false;
		}
	}

	async function onRecover(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		recoveryError = '';
		recoverySent = '';

		const email = values.email.trim();
		if (!email || !isValidEmail(email)) {
			recoveryError = 'Escribe el correo de tu cuenta para enviarte el enlace.';
			return;
		}

		recoverySubmitting = true;
		try {
			const result = await requestPasswordReset(email);
			recoverySent = result.email || email;
		} catch (error) {
			recoveryError =
				error instanceof ApiError ? error.message : 'No pudimos enviar el correo. Intenta de nuevo.';
		} finally {
			recoverySubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<AuthShell>
	{#if recovering}
		<header class="text-center">
			<div
				class="border-brand/30 bg-brand/10 text-brand mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border"
			>
				<Icon name="lock" size={22} />
			</div>
			<h1 class="mt-5 text-2xl font-extrabold tracking-tight">
				<span class="text-gradient-soft">Recupera tu contraseña</span>
			</h1>
			<p class="text-fg-muted mt-2 text-sm">
				Te enviamos un enlace para crear una nueva. Vence en 2 horas.
			</p>
		</header>

		{#if recoverySent}
			<div class="mt-7 text-center">
				<p class="text-fg-muted text-sm leading-relaxed">
					Listo. Si esa cuenta existe, el enlace va camino a
					<span class="text-fg font-semibold">{recoverySent}</span>.
				</p>
				<button
					type="button"
					class="text-brand mt-6 text-sm font-semibold hover:underline"
					onclick={() => {
						recovering = false;
						recoverySent = '';
					}}
				>
					Volver a iniciar sesión
				</button>
			</div>
		{:else}
			<form class="mt-7 space-y-5" onsubmit={onRecover} novalidate>
				<Field
					id="recovery-email"
					label="Correo de tu cuenta"
					type="email"
					placeholder="admin@negocio.com"
					autocomplete="email"
					bind:value={values.email}
					disabled={recoverySubmitting}
					oninput={() => (recoveryError = '')}
				/>

				{#if recoveryError}
					<FormAlert message={recoveryError} />
				{/if}

				<SubmitButton
					label="Enviarme el enlace"
					loadingLabel="Enviando…"
					loading={recoverySubmitting}
				/>

				<button
					type="button"
					class="text-fg-muted hover:text-fg w-full text-center text-sm transition-colors duration-200"
					onclick={() => {
						recovering = false;
						recoveryError = '';
					}}
				>
					Volver
				</button>
			</form>
		{/if}
	{:else}
		<header class="text-center">
			<h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl">
				<span class="text-gradient-soft">Entra a tu cuenta</span>
			</h1>
			<p class="text-fg-muted mt-2 text-sm">
				Gestiona tu plan y los datos de tu negocio.
			</p>
		</header>

		<form class="mt-8 space-y-5" onsubmit={onSubmit} novalidate>
			<Field
				id="email"
				label="Correo electrónico"
				type="email"
				placeholder="admin@negocio.com"
				autocomplete="email"
				bind:value={values.email}
				error={errors.email}
				disabled={submitting}
				oninput={() => clearFieldError('email')}
			/>

			<div class="space-y-1.5">
				<Field
					id="password"
					label="Contraseña"
					type="password"
					placeholder="••••••••"
					autocomplete="current-password"
					reveal
					bind:value={values.password}
					error={errors.password}
					disabled={submitting}
					oninput={() => clearFieldError('password')}
				/>
				<div class="text-right">
					<button
						type="button"
						class="text-fg-faint hover:text-brand text-xs transition-colors duration-200"
						onclick={() => {
							recovering = true;
							submitError = '';
						}}
					>
						¿Olvidaste tu contraseña?
					</button>
				</div>
			</div>

			{#if submitError}
				<FormAlert message={submitError} />
			{/if}

			<SubmitButton label="Iniciar sesión" loadingLabel="Entrando…" loading={submitting} />
		</form>

		<p class="text-fg-faint mt-6 text-center text-xs leading-relaxed">
			Esta sesión es para la gestión de tu cuenta. Para vender, abre PlacePos en tu computador.
		</p>
	{/if}

	{#snippet footer()}
		{#if !recovering}
			<span class="text-fg-muted">¿Todavía no tienes cuenta?</span>
			<a href={registerHref} class="text-brand ml-1 font-semibold hover:underline">Créala gratis</a>
		{/if}
	{/snippet}
</AuthShell>
