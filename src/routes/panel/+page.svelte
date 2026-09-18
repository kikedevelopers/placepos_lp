<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import FormAlert from '$lib/components/auth/FormAlert.svelte';
	import { ApiError } from '$lib/api/client';
	import { changePlan, getAccount, type PortalAccount, type SubscriptionPlan } from '$lib/api/portal';
	import { session } from '$lib/stores/session.svelte';
	import { PRICING } from '$lib/data/pricing';
	import { SITE } from '$lib/data/site';
	import { formatCop } from '$lib/utils/pricing';
	import { describeSubscription, formatDate, planLabel } from '$lib/utils/subscription';

	const pageTitle = `Mi cuenta — ${SITE.name}`;

	let account = $state<PortalAccount | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	/** Plan cuyo botón está en curso. Bloquea solo esa tarjeta, no todas. */
	let changing = $state<SubscriptionPlan | null>(null);
	let changeError = $state('');
	let changeNotice = $state('');
	/** Plan que traía desde la sección de precios: se resalta, no se aplica. */
	let intendedPlan = $state('');

	const subscription = $derived(account?.subscription ?? null);
	const view = $derived(describeSubscription(subscription));
	const currentPlan = $derived(subscription?.plan ?? 'free');
	const requestedPlan = $derived(subscription?.requested_plan ?? null);

	/**
	 * Las tres opciones. Los precios salen de `$lib/data/pricing`, la misma
	 * fuente que la sección de precios de la landing: dos sitios con el mismo
	 * número escrito a mano terminan contradiciéndose, y aquí el cliente está
	 * decidiendo pagar.
	 */
	const PLANS: { id: SubscriptionPlan; name: string; price: string; note: string }[] = [
		{
			id: 'free',
			name: 'Gratis',
			price: '$0',
			note: `Prueba de ${PRICING.trial_days} días`
		},
		{
			id: 'monthly',
			name: 'Mensual',
			price: formatCop(PRICING.monthly_price),
			note: 'Al mes, cancelas cuando quieras'
		},
		{
			id: 'annual',
			name: 'Anual',
			price: formatCop(PRICING.annual_price),
			note: 'Un pago al año, el precio congelado'
		}
	];

	const toneClasses: Record<string, string> = {
		good: 'border-mint/30 bg-mint/10 text-mint',
		warn: 'border-amber/30 bg-amber/10 text-amber',
		bad: 'border-amber/40 bg-amber/15 text-amber',
		neutral: 'border-line bg-white/[0.04] text-fg-muted'
	};

	$effect(() => {
		intendedPlan = new URLSearchParams(window.location.search).get('plan') ?? '';
	});

	$effect(() => {
		// Sin sesión, al login. Se espera a `ready` para no expulsar a alguien
		// que sí la tiene solo porque todavía no se leyó el almacenamiento.
		if (!session.ready) return;
		if (!session.isAuthenticated) {
			void goto(`${base}/ingresar`, { replaceState: true });
			return;
		}
		void load();
	});

	/** Cierra la sesión y manda al login. Se usa también cuando el token vence. */
	function signOut(): void {
		session.clear();
		void goto(`${base}/ingresar`, { replaceState: true });
	}

	async function load(): Promise<void> {
		const token = session.token;
		if (!token) {
			// No debería ocurrir (el efecto ya exigió sesión), pero si ocurre hay
			// que apagar el spinner: dejarlo girando para siempre es peor que
			// cualquier mensaje.
			loading = false;
			return;
		}

		try {
			account = await getAccount(token);
			loadError = '';
		} catch (error) {
			// 401 = el token venció (dura 12 horas). No es un error que el usuario
			// pueda resolver leyendo: se le devuelve al login sin dramatismo.
			if (error instanceof ApiError && error.status === 401) {
				signOut();
				return;
			}
			loadError =
				error instanceof ApiError ? error.message : 'No pudimos cargar tu cuenta.';
		} finally {
			loading = false;
		}
	}

	async function choosePlan(plan: SubscriptionPlan): Promise<void> {
		const token = session.token;
		if (!token || changing) return;

		changing = plan;
		changeError = '';
		changeNotice = '';

		try {
			const updated = await changePlan(token, plan);
			if (account) {
				account = { ...account, subscription: updated };
			}
			// El texto dice exactamente lo que pasó: nadie debe salir de aquí
			// creyendo que ya cambió de plan cuando falta pagarlo.
			changeNotice =
				plan === 'free'
					? 'Listo. Retiramos la solicitud de plan pago; no se te cobrará nada.'
					: `Anotamos tu plan ${planLabel(plan)}. Te escribimos para completar el pago y activarlo.`;
			intendedPlan = '';
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				signOut();
				return;
			}
			changeError =
				error instanceof ApiError ? error.message : 'No pudimos registrar el cambio de plan.';
		} finally {
			changing = null;
		}
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="relative min-h-screen">
	<div
		class="pointer-events-none absolute top-0 left-1/2 -z-10 h-[380px] w-[720px] -translate-x-1/2 rounded-full opacity-30 blur-[130px]"
		style="background:radial-gradient(circle,rgba(124,92,255,0.45),transparent 70%)"
	></div>

	<header class="border-line/60 border-b">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
			<a href="{base}/" class="transition-opacity duration-200 hover:opacity-80">
				<Logo size={30} />
			</a>

			{#if session.isAuthenticated}
				<button
					type="button"
					onclick={() => signOut()}
					class="text-fg-muted hover:text-fg inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors duration-200 hover:bg-white/5"
				>
					<Icon name="logout" size={15} />
					Cerrar sesión
				</button>
			{/if}
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
		{#if loading}
			<div class="flex items-center justify-center py-24" aria-live="polite">
				<span
					class="border-brand/30 border-t-brand h-8 w-8 animate-spin rounded-full border-2"
					aria-label="Cargando tu cuenta"
				></span>
			</div>
		{:else if loadError}
			<div class="mx-auto max-w-md">
				<FormAlert message={loadError} />
				<button
					type="button"
					onclick={() => {
						loading = true;
						void load();
					}}
					class="text-brand mt-5 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
				>
					<Icon name="refresh" size={15} />
					Reintentar
				</button>
			</div>
		{:else if account}
			<div class="mb-8">
				<p class="text-fg-faint text-sm">Hola, {account.user.name}</p>
				<h1 class="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
					<span class="text-gradient-soft">{account.company.name}</span>
				</h1>
			</div>

			<div class="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
				<!-- Estado de la suscripción: lo primero, porque es lo que casi
				     siempre vino a mirar. -->
				<section class="card-hairline bg-surface/50 rounded-3xl p-6 sm:p-7">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<h2 class="font-display text-lg font-bold">Tu suscripción</h2>
						<span
							class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold {toneClasses[
								view.tone
							]}"
						>
							{view.label}
						</span>
					</div>

					<p class="text-fg mt-5 text-base font-semibold">{view.headline}</p>
					<p class="text-fg-muted mt-1.5 text-sm leading-relaxed">{view.detail}</p>

					{#if subscription}
						<!-- Medidor de la ventana vigente. Un número solo se entiende
						     comparado: la barra dice cuánto queda de un vistazo. -->
						<div class="mt-6">
							<div class="bg-ink-soft h-2 w-full overflow-hidden rounded-full">
								<div
									class="h-full rounded-full transition-all duration-500"
									style="width:{Math.round(
										Math.min(1, Math.max(0, subscription.progress)) * 100
									)}%;background:linear-gradient(90deg,#8b5cf6,#6366f1 55%,#22d3ee)"
								></div>
							</div>
							<div class="text-fg-faint mt-2 flex justify-between text-xs">
								<span>{formatDate(subscription.started_at)}</span>
								<span>{formatDate(subscription.expires_at)}</span>
							</div>
						</div>

						<dl class="border-line/60 mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
							<div>
								<dt class="text-fg-faint text-xs">Plan actual</dt>
								<dd class="text-fg mt-1 text-sm font-semibold">{planLabel(currentPlan)}</dd>
							</div>
							<div>
								<dt class="text-fg-faint text-xs">Días restantes</dt>
								<dd class="text-fg mt-1 text-sm font-semibold">{subscription.days_remaining}</dd>
							</div>
						</dl>

						<!-- Lo que se espera que haga, según su estado. Un panel que
						     solo informa deja al dueño buscando el botón; este lo pone
						     donde acaba de leer el problema. -->
						{#if view.action === 'retry_payment'}
							<a
								href="https://wa.me/573117323107"
								class="hover:shadow-glow mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]"
								style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
							>
								Completar el pago
								<Icon name="arrow" size={15} />
							</a>
						{:else if view.action}
							<a
								href="#planes"
								class="text-fg mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-white/[0.1]"
							>
								{view.action === 'reactivate' ? 'Reactivar mi plan' : 'Elegir un plan'}
								<Icon name="arrow" size={15} />
							</a>
						{/if}

						{#if requestedPlan && requestedPlan !== 'free'}
							<p class="border-brand/25 bg-brand/10 text-fg-muted mt-5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed">
								Tienes pedido el plan <span class="text-fg font-semibold"
									>{planLabel(requestedPlan)}</span
								>. Queda activo apenas confirmemos el pago.
							</p>
						{/if}
					{/if}
				</section>

				<!-- Datos de la cuenta. -->
				<section class="card-hairline bg-surface/50 rounded-3xl p-6 sm:p-7">
					<h2 class="font-display text-lg font-bold">Tu cuenta</h2>

					<dl class="mt-5 space-y-4">
						<div>
							<dt class="text-fg-faint text-xs">Titular</dt>
							<dd class="text-fg mt-1 text-sm">
								{account.user.name}
								{account.user.lastname}
							</dd>
						</div>
						<div>
							<dt class="text-fg-faint text-xs">Correo</dt>
							<dd class="text-fg mt-1 text-sm break-all">{account.user.email}</dd>
						</div>
						<div>
							<dt class="text-fg-faint text-xs">Negocio</dt>
							<dd class="text-fg mt-1 text-sm">
								{account.company.name}
								{#if account.company.branches_count > 0}
									<span class="text-fg-faint">
										· {account.company.branches_count}
										{account.company.branches_count === 1 ? 'sucursal' : 'sucursales'}
									</span>
								{/if}
							</dd>
						</div>
						<div>
							<dt class="text-fg-faint text-xs">Cliente desde</dt>
							<dd class="text-fg mt-1 text-sm">{formatDate(account.company.created_at)}</dd>
						</div>
					</dl>

					<a
						href="{base}/#cta"
						class="text-brand mt-6 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
					>
						<Icon name="download" size={15} />
						Descargar PlacePos
					</a>
				</section>
			</div>

			<!-- Planes. -->
			<section id="planes" class="mt-10 scroll-mt-8">
				<div class="flex flex-wrap items-end justify-between gap-2">
					<h2 class="font-display text-lg font-bold">Cambiar de plan</h2>
					<a
						href="{base}/#precios"
						class="text-fg-faint hover:text-fg-muted text-xs transition-colors duration-200"
					>
						Ver el detalle de cada plan
					</a>
				</div>

				{#if changeNotice}
					<div class="mt-4">
						<FormAlert tone="info" message={changeNotice} />
					</div>
				{/if}
				{#if changeError}
					<div class="mt-4">
						<FormAlert message={changeError} />
					</div>
				{/if}

				<div class="mt-5 grid gap-4 sm:grid-cols-3">
					{#each PLANS as plan (plan.id)}
						{@const isCurrent = plan.id === currentPlan}
						{@const isRequested = plan.id === requestedPlan}
						{@const isIntended = plan.id === intendedPlan && !isCurrent && !isRequested}
						<article
							class="flex flex-col rounded-2xl p-5 transition-all duration-300 {isCurrent ||
							isRequested
								? 'border-brand/40 bg-surface border'
								: isIntended
									? 'border-brand/30 bg-surface/60 border'
									: 'card-hairline bg-surface/30'}"
						>
							<div class="flex items-center justify-between gap-2">
								<h3 class="font-display text-base font-bold">{plan.name}</h3>
								{#if isCurrent}
									<span
										class="border-mint/30 bg-mint/10 text-mint rounded-full border px-2 py-0.5 text-[10px] font-bold"
									>
										Actual
									</span>
								{:else if isRequested}
									<span
										class="border-amber/30 bg-amber/10 text-amber rounded-full border px-2 py-0.5 text-[10px] font-bold"
									>
										Pendiente
									</span>
								{/if}
							</div>

							<p class="text-fg mt-3 text-2xl font-extrabold tracking-tight">{plan.price}</p>
							<p class="text-fg-faint mt-1 text-xs leading-relaxed">{plan.note}</p>

							<button
								type="button"
								disabled={isCurrent || changing !== null}
								onclick={() => choosePlan(plan.id)}
								class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 {isCurrent
									? 'text-fg-faint border border-white/[0.08] bg-white/[0.03]'
									: 'text-fg border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.1]'}"
							>
								{#if changing === plan.id}
									<span
										class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
									></span>
									Guardando…
								{:else if isCurrent}
									Tu plan
								{:else if plan.id === 'free'}
									Volver a gratis
								{:else}
									Quiero este plan
								{/if}
							</button>
						</article>
					{/each}
				</div>

				<p class="text-fg-faint mt-5 text-xs leading-relaxed">
					Elegir un plan de pago deja tu solicitud registrada; te contactamos para completar el
					cobro y ahí queda activo. Volver a <span class="text-fg-muted">Gratis</span> retira la
					solicitud y no cobra nada. ¿Dudas? Escríbenos al
					<a href="https://wa.me/573117323107" class="text-brand hover:underline">
						+57 311 732 3107
					</a>.
				</p>
			</section>
		{/if}
	</main>
</div>
