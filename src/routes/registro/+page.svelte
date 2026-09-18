<script lang="ts">
	import { base } from '$app/paths';
	import AuthShell from '$lib/components/auth/AuthShell.svelte';
	import Field from '$lib/components/auth/Field.svelte';
	import FormAlert from '$lib/components/auth/FormAlert.svelte';
	import SubmitButton from '$lib/components/auth/SubmitButton.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { ApiError } from '$lib/api/client';
	import { register } from '$lib/api/portal';
	import { PRICING } from '$lib/data/pricing';
	import { SITE } from '$lib/data/site';
	import {
		PASSWORD_RULES,
		isValid,
		validateRegister,
		type FormErrors,
		type RegisterFormValues
	} from '$lib/utils/auth-validation';

	const pageTitle = `Crear cuenta — ${SITE.name}`;

	let values = $state<RegisterFormValues>({
		company_name: '',
		name: '',
		lastname: '',
		email: '',
		password: '',
		confirmPassword: ''
	});

	let errors = $state<FormErrors<RegisterFormValues>>({});
	let submitError = $state('');
	let submitting = $state(false);
	/** Con valor = la cuenta ya existe y falta activarla. */
	let registeredEmail = $state<string | null>(null);

	/**
	 * El plan que traía quien llegó desde la sección de precios. Se arrastra
	 * hasta el panel para que después de entrar caiga donde iba, y no tenga que
	 * volver a buscar el plan que ya había elegido.
	 */
	let plan = $state('');
	const loginHref = $derived(`${base}/ingresar${plan ? `?plan=${plan}` : ''}`);

	$effect(() => {
		plan = new URLSearchParams(window.location.search).get('plan') ?? '';
	});

	// La lista de requisitos se pinta en vivo: el usuario ve cuál le falta
	// mientras escribe, en vez de descubrirlo al enviar.
	const passwordState = $derived(
		PASSWORD_RULES.map((rule) => ({ ...rule, ok: rule.test(values.password) }))
	);

	function clearFieldError(field: keyof RegisterFormValues): void {
		if (errors[field]) {
			errors = { ...errors, [field]: undefined };
		}
		submitError = '';
	}

	async function onSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		submitError = '';

		errors = validateRegister(values);
		if (!isValid(errors)) return;

		submitting = true;
		try {
			const result = await register({
				name: values.name.trim(),
				lastname: values.lastname.trim(),
				email: values.email.trim(),
				password: values.password,
				company_name: values.company_name.trim()
			});
			registeredEmail = result.email || values.email.trim();
		} catch (error) {
			// El 409 del API significa que el correo ya tiene cuenta. Decirlo con
			// su nombre —y ofrecer el login— evita que alguien se quede probando
			// contraseñas creyendo que el registro falló.
			if (error instanceof ApiError && (error.status === 409 || error.code === 'EMAIL_TAKEN')) {
				submitError = 'Este correo ya tiene una cuenta. Inicia sesión o usa otro.';
			} else if (error instanceof ApiError) {
				submitError = error.message;
			} else {
				submitError = 'Ocurrió un error inesperado al crear la cuenta.';
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta
		name="description"
		content="Crea tu cuenta de PlacePos y empieza tu prueba gratis de {PRICING.trial_days} días."
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<AuthShell width="lg">
	{#if registeredEmail}
		<!-- Registro hecho: la cuenta existe pero NO puede entrar hasta activarse.
		     Mandarlo al login de una vez sería mandarlo a fracasar. -->
		<div class="text-center">
			<div
				class="border-mint/30 bg-mint/10 text-mint mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border"
			>
				<Icon name="mail" size={26} />
			</div>
			<h1 class="mt-6 text-2xl font-extrabold tracking-tight">
				<span class="text-gradient">Cuenta creada. Falta un paso</span>
			</h1>
			<p class="text-fg-muted mt-3 text-sm leading-relaxed">
				Te enviamos un correo a <span class="text-fg font-semibold">{registeredEmail}</span>. Ábrelo
				y pulsa <span class="text-fg font-semibold">Activar mi cuenta</span> para poder iniciar sesión.
			</p>
			<p class="text-fg-faint mt-4 text-xs leading-relaxed">
				¿No lo ves? Revisa la carpeta de spam o correo no deseado. El enlace vence en 7 días.
			</p>

			<div class="mt-8 flex flex-col gap-3">
				<a
					href={loginHref}
					class="hover:shadow-glow inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]"
					style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
				>
					Ir a iniciar sesión
					<Icon name="arrow" size={16} />
				</a>
				<a
					href="{base}/#cta"
					class="text-fg-muted hover:text-fg text-sm transition-colors duration-200"
				>
					Descargar PlacePos
				</a>
			</div>
		</div>
	{:else}
		<header class="text-center">
			<h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl">
				<span class="text-gradient-soft">Crea tu cuenta</span>
			</h1>
			<p class="text-fg-muted mt-2 text-sm">
				{PRICING.trial_days} días gratis, sin tarjeta. Registra tu negocio y empieza.
			</p>
		</header>

		<form class="mt-8 space-y-6" onsubmit={onSubmit} novalidate>
			<section class="space-y-4">
				<div class="flex items-center gap-2">
					<span
						class="bg-brand/10 text-brand inline-flex h-7 w-7 items-center justify-center rounded-lg"
					>
						<Icon name="building" size={14} />
					</span>
					<h2 class="text-fg text-sm font-semibold tracking-tight">Tu negocio</h2>
				</div>

				<Field
					id="company_name"
					label="Nombre del negocio"
					placeholder="Mi Negocio"
					autocomplete="organization"
					bind:value={values.company_name}
					error={errors.company_name}
					disabled={submitting}
					oninput={() => clearFieldError('company_name')}
				/>
			</section>

			<section class="space-y-4">
				<div class="flex items-center gap-2">
					<span
						class="bg-brand/10 text-brand inline-flex h-7 w-7 items-center justify-center rounded-lg"
					>
						<Icon name="user" size={14} />
					</span>
					<h2 class="text-fg text-sm font-semibold tracking-tight">Tus datos</h2>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<Field
						id="name"
						label="Nombre"
						placeholder="Juan"
						autocomplete="given-name"
						bind:value={values.name}
						error={errors.name}
						disabled={submitting}
						oninput={() => clearFieldError('name')}
					/>
					<Field
						id="lastname"
						label="Apellido"
						placeholder="Pérez"
						autocomplete="family-name"
						bind:value={values.lastname}
						error={errors.lastname}
						disabled={submitting}
						oninput={() => clearFieldError('lastname')}
					/>
				</div>

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

				<Field
					id="password"
					label="Contraseña"
					type="password"
					placeholder="••••••••"
					autocomplete="new-password"
					reveal
					bind:value={values.password}
					error={errors.password}
					disabled={submitting}
					oninput={() => clearFieldError('password')}
				/>

				<!-- Requisitos en vivo. Se marcan solos mientras escribe. -->
				<ul class="grid gap-1.5 sm:grid-cols-2">
					{#each passwordState as rule (rule.key)}
						<li
							class="flex items-center gap-2 text-xs transition-colors duration-200 {rule.ok
								? 'text-mint'
								: 'text-fg-faint'}"
						>
							<span
								class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-200 {rule.ok
									? 'bg-mint/15'
									: 'bg-white/[0.06]'}"
							>
								<Icon name="check" size={10} />
							</span>
							{rule.label}
						</li>
					{/each}
				</ul>

				<Field
					id="confirmPassword"
					label="Confirmar contraseña"
					type="password"
					placeholder="••••••••"
					autocomplete="new-password"
					reveal
					bind:value={values.confirmPassword}
					error={errors.confirmPassword}
					disabled={submitting}
					oninput={() => clearFieldError('confirmPassword')}
				/>
			</section>

			{#if submitError}
				<FormAlert message={submitError} />
			{/if}

			<SubmitButton label="Crear cuenta" loadingLabel="Creando cuenta…" loading={submitting} />

			<p class="text-fg-faint text-center text-xs leading-relaxed">
				Al crear la cuenta empiezas una prueba de {PRICING.trial_days} días. No pedimos tarjeta ni datos
				de pago.
			</p>
		</form>
	{/if}

	{#snippet footer()}
		{#if !registeredEmail}
			<span class="text-fg-muted">¿Ya tienes cuenta?</span>
			<a href={loginHref} class="text-brand ml-1 font-semibold hover:underline">Inicia sesión</a>
		{/if}
	{/snippet}
</AuthShell>
