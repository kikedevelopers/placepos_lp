<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from '$lib/components/Icon.svelte';
	import FormAlert from '$lib/components/auth/FormAlert.svelte';
	import { ApiError } from '$lib/api/client';
	import {
		changePlan,
		createCheckout,
		getAccount,
		getBranches,
		listPayments,
		type Branch,
		type Payment,
		type PortalAccount,
		type Subscription,
		type SubscriptionPlan
	} from '$lib/api/portal';
	import type { PlanId } from '$lib/data/pricing';
	import { session } from '$lib/stores/session.svelte';
	import { PRICING } from '$lib/data/pricing';
	import { SITE } from '$lib/data/site';
	import { formatCop } from '$lib/utils/pricing';
	import {
		describeSubscription,
		formatDate,
		periodSummary,
		planLabel
	} from '$lib/utils/subscription';
	import {
		browserStorage,
		describePayment,
		forgetIntendedPlan,
		formatAmount,
		isPayablePlan,
		isTrustedCheckoutUrl,
		paymentMethodLabel,
		readIntendedPlan
	} from '$lib/utils/payment';
	import {
		describePlanChange,
		hasRunningPaidPeriod,
		nextPeriodNote,
		planCardAction,
		RENEWAL_WINDOW_DAYS,
		type PlanCardAction
	} from '$lib/utils/plan-control';
	import { reveal } from '$lib/actions/reveal';
	import { tilt } from '$lib/actions/tilt';
	import { magnetic } from '$lib/actions/magnetic';
	import { pointerGlow } from '$lib/actions/pointerGlow';

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
	/** Plan cuyo pago se está abriendo (redirección a Wompi en curso). */
	let checkingOut = $state<SubscriptionPlan | null>(null);
	let checkoutError = $state('');
	/** Historial de pagos. `null` = todavía no se ha cargado. */
	let payments = $state<Payment[] | null>(null);
	/** Cambio con plan vigente esperando confirmación (se explica antes de hacerlo). */
	let confirming = $state<{
		action: Extract<PlanCardAction, { kind: 'schedule' | 'renew' }>;
		price: string;
	} | null>(null);

	// Sucursales: se piden solo al abrir el detalle, no en cada carga.
	let branchesOpen = $state(false);
	let branches = $state<Branch[] | null>(null);
	let branchesLoading = $state(false);
	let branchesError = $state('');

	const subscription = $derived(account?.subscription ?? null);
	const view = $derived(describeSubscription(subscription));
	const period = $derived(subscription ? periodSummary(subscription) : null);
	const currentPlan = $derived(subscription?.plan ?? 'free');
	const requestedPlan = $derived(subscription?.requested_plan ?? null);
	/** Hay una solicitud de plan pago esperando pago: se puede completar o retirar. */
	const hasPendingRequest = $derived(!!requestedPlan && requestedPlan !== 'free');
	const upcoming = $derived(account?.upcoming_period ?? null);
	/** Qué se puede hacer HOY con el plan que trajo desde precios. */
	const intentAction = $derived(
		isPayablePlan(intendedPlan) ? planCardAction(subscription, upcoming, intendedPlan) : null
	);
	/** Plan que llegó desde precios y que todavía se puede pagar o programar. */
	const pendingIntent = $derived(
		isPayablePlan(intendedPlan) &&
			(intentAction?.kind === 'pay' ||
				intentAction?.kind === 'renew' ||
				intentAction?.kind === 'schedule')
			? intendedPlan
			: null
	);
	const periodNote = $derived(nextPeriodNote(subscription, upcoming));
	/** Lo que se muestra del historial aquí; el resto vive en /panel/pagos. */
	const recentPayments = $derived(payments?.slice(0, 3) ?? []);
	/** Un pago aprobado esperando revisión manual: no se ofrece pagar otra vez. */
	const paymentUnderReview = $derived(payments?.some((p) => p.status === 'needs_review') ?? false);
	const busy = $derived(changing !== null || checkingOut !== null);

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
			note: `${PRICING.trial_days} días al registrarte`
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

	// El plan llega por la URL (desde precios) o, si dio el rodeo registro →
	// correo → login, desde lo que se recordó en el navegador.
	$effect(() => {
		intendedPlan =
			new URLSearchParams(window.location.search).get('plan') ??
			readIntendedPlan(browserStorage()) ??
			'';
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

	// Cierra el modal de sucursales con Escape: un diálogo del que solo se sale
	// con el ratón se siente a medio hacer.
	$effect(() => {
		if (!branchesOpen && !confirming) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			branchesOpen = false;
			confirming = null;
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
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
			void loadPayments(token);
			void scrollToRequestedSection();
		} catch (error) {
			// 401 = el token venció (dura 12 horas). No es un error que el usuario
			// pueda resolver leyendo: se le devuelve al login sin dramatismo.
			if (error instanceof ApiError && error.status === 401) {
				signOut();
				return;
			}
			loadError = error instanceof ApiError ? error.message : 'No pudimos cargar tu cuenta.';
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
			const previous = subscription;
			const updated = await changePlan(token, plan);
			if (account) {
				account = { ...account, subscription: updated };
			}
			// El texto dice exactamente lo que pasó: nadie debe salir de aquí
			// creyendo que ya cambió de plan cuando falta pagarlo o empieza después.
			changeNotice = planChangeNotice(previous, updated, plan);
			intendedPlan = '';
			forgetIntendedPlan(browserStorage());
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

	/** `?seccion=planes` (desde /panel/pagos) lleva directo a los planes una vez pintados. */
	async function scrollToRequestedSection(): Promise<void> {
		if (new URLSearchParams(window.location.search).get('seccion') !== 'planes') return;
		loading = false;
		await tick();
		document.getElementById('planes')?.scrollIntoView({ block: 'start' });
	}

	function planChangeNotice(
		previous: Subscription | null,
		updated: Subscription,
		plan: SubscriptionPlan
	): string {
		const until = formatDate(updated.expires_at);
		if (plan === 'free') {
			return hasRunningPaidPeriod(previous)
				? `Cancelaste la renovación. Sigues con tu plan ${planLabel(updated.plan)} hasta el ${until}.`
				: 'Listo. Retiramos la solicitud de plan pago; no se te cobrará nada.';
		}
		if (updated.scheduled_plan) {
			return `Listo. Tu plan ${planLabel(updated.plan)} sigue activo hasta el ${until} y el plan ${planLabel(
				updated.scheduled_plan
			)} empieza ese día. Hoy no se cobró nada.`;
		}
		if (hasRunningPaidPeriod(updated)) {
			return `Listo. Te quedas en el plan ${planLabel(updated.plan)}.`;
		}
		return `Anotamos tu plan ${planLabel(plan)}. Completa el pago para activarlo.`;
	}

	/** Botón de una tarjeta de plan: unas acciones van directo, otras se explican antes. */
	function onPlanAction(plan: SubscriptionPlan, action: PlanCardAction, price: string): void {
		switch (action.kind) {
			case 'cancel':
				void choosePlan('free');
				return;
			case 'pay':
				void startCheckout(plan);
				return;
			case 'keep':
				void choosePlan(currentPlan);
				return;
			case 'schedule':
			case 'renew':
				changeError = '';
				checkoutError = '';
				confirming = { action, price };
				return;
			default:
				return;
		}
	}

	function confirmPlanChange(): void {
		const pending = confirming;
		if (!pending) return;
		confirming = null;
		if (pending.action.kind === 'schedule') {
			void choosePlan(pending.action.plan);
		} else {
			void startCheckout(pending.action.plan);
		}
	}

	/** El historial no bloquea el panel: si falla, simplemente no se pinta. */
	async function loadPayments(token: string): Promise<void> {
		try {
			payments = await listPayments(token);
		} catch {
			payments = [];
		}
	}

	/**
	 * Abre el pago en Wompi. El monto lo fija pos_api; aquí solo se elige el plan.
	 * Solo se redirige al checkout oficial de Wompi.
	 */
	async function startCheckout(plan: SubscriptionPlan): Promise<void> {
		const token = session.token;
		if (!token || busy || !isPayablePlan(plan)) return;

		checkingOut = plan;
		checkoutError = '';
		changeNotice = '';
		changeError = '';

		try {
			const payment = await createCheckout(token, plan);
			if (!isTrustedCheckoutUrl(payment.checkout_url)) {
				checkoutError = 'No pudimos abrir la pasarela de pago. Intenta de nuevo.';
				checkingOut = null;
				return;
			}
			forgetIntendedPlan(browserStorage());
			// `checkingOut` se queda puesto: la página se va a Wompi.
			window.location.assign(payment.checkout_url);
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				signOut();
				return;
			}
			checkoutError =
				error instanceof ApiError ? error.message : 'No pudimos abrir la pasarela de pago.';
			checkingOut = null;
			// 409: el plan cambió (p. ej. un pago se aplicó en otra pestaña). Se
			// relee la cuenta para que los botones digan la verdad.
			if (error instanceof ApiError && error.status === 409) void load();
		}
	}

	/** Retira la solicitud de plan pago pendiente (vuelve a `free`). */
	const cancelPending = () => choosePlan('free');

	async function openBranches(): Promise<void> {
		branchesOpen = true;
		// Si ya se cargaron una vez, no se vuelve a pedir: el modal se reabre al
		// instante en lugar de parpadear un spinner cada vez.
		if (branches !== null || branchesLoading) return;

		const token = session.token;
		if (!token) return;

		branchesLoading = true;
		branchesError = '';
		try {
			branches = await getBranches(token);
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				branchesOpen = false;
				signOut();
				return;
			}
			branchesError =
				error instanceof ApiError ? error.message : 'No pudimos cargar tus sucursales.';
		} finally {
			branchesLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="relative">
	{#if loading}
		<div class="flex items-center justify-center py-32" aria-live="polite">
			<span
				class="border-brand/30 border-t-brand h-8 w-8 animate-spin rounded-full border-2"
				aria-label="Cargando tu cuenta"
			></span>
		</div>
	{:else if loadError}
		<main class="mx-auto max-w-md px-4 py-20 sm:px-6">
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
		</main>
	{:else if account}
		<!-- ============================ HERO ============================ -->
		<section class="pointer-glow grain relative overflow-hidden" use:pointerGlow>
			<div class="bg-grid pointer-events-none absolute inset-0 -z-10"></div>
			<div class="pointer-events-none absolute inset-0 -z-10">
				<div class="absolute -top-24 left-1/2 -ml-[18rem]">
					<div
						class="orb animate-drift h-[32rem] w-[36rem]"
						style="background:radial-gradient(circle,#7c5cff,transparent 65%);opacity:0.4;transform:translate3d(calc(var(--px,0)*24px),calc(var(--py,0)*18px),0)"
					></div>
				</div>
			</div>

			<div class="relative mx-auto max-w-5xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-14">
				<p class="reveal text-fg-faint text-sm" use:reveal>Hola, {account.user.name}</p>
				<h1
					class="reveal display-xl mt-2 text-4xl font-extrabold tracking-tight sm:text-6xl"
					use:reveal={{ delay: 70 }}
				>
					<span class="text-gradient-soft">{account.company.name}</span>
				</h1>

				<!-- Chips de resumen: el estado de la cuenta de un vistazo. -->
				<div class="reveal mt-6 flex flex-wrap items-center gap-2.5" use:reveal={{ delay: 140 }}>
					<span
						class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold {toneClasses[
							view.tone
						]}"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-current"></span>
						{view.label}
					</span>
					{#if period}
						<span
							class="glass text-fg-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
						>
							<Icon name="clock" size={13} class="text-fg-faint" />
							{period.remainingLabel}
						</span>
					{/if}
					{#if hasPendingRequest}
						<span
							class="border-brand/30 bg-brand/10 text-fg-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
						>
							<Icon name="tag" size={12} class="text-brand" />
							Plan {planLabel(requestedPlan ?? undefined)} pendiente
						</span>
					{/if}
				</div>
			</div>
		</section>

		<main class="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
			<!-- Plan elegido en la sección de precios: el siguiente paso, a la vista. -->
			{#if pendingIntent && !paymentUnderReview}
				{@const intent = PLANS.find((p) => p.id === pendingIntent)}
				{@const intentExplain =
					intentAction?.kind === 'schedule'
						? `Ya tienes el plan ${planLabel(currentPlan)} activo hasta el ${formatDate(
								intentAction.effective_at
							)}. Puedes programar el cambio: empieza ese día y hoy no se cobra nada.`
						: intentAction?.kind === 'renew'
							? `Pagas ahora y los días se suman al terminar tu período actual, el ${formatDate(
									intentAction.starts_at
								)}.`
							: 'Pago seguro con Wompi: tarjeta, PSE, Nequi o Bancolombia. Los días se suman apenas se confirme.'}
				<section
					class="reveal border-brand/35 bg-brand/[0.07] mb-5 flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
					use:reveal
				>
					<div>
						<p class="text-brand text-xs font-semibold">Elegiste un plan</p>
						<p class="text-fg mt-1 text-base font-semibold">
							Plan {intent?.name} · {intent?.price}
						</p>
						<p class="text-fg-muted mt-1 max-w-xl text-sm">{intentExplain}</p>
					</div>
					<button
						type="button"
						onclick={() =>
							intentAction
								? onPlanAction(pendingIntent, intentAction, intent?.price ?? '')
								: undefined}
						disabled={busy}
						use:magnetic={{ strength: 0.25 }}
						class="hover:shadow-glow sheen relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3 text-sm font-semibold text-white transition-[box-shadow] duration-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
						style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
					>
						{#if checkingOut === pendingIntent}
							<span
								class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
							></span>
							Abriendo pago seguro…
						{:else}
							<Icon name={intentAction?.kind === 'schedule' ? 'clock' : 'lock'} size={15} />
							{intentAction?.kind === 'schedule'
								? `Programar cambio a ${intent?.name}`
								: `Pagar ${intent?.price}`}
						{/if}
					</button>
				</section>
				{#if checkoutError}
					<div class="-mt-2 mb-5">
						<FormAlert message={checkoutError} />
					</div>
				{/if}
			{/if}

			<div class="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
				<!-- Estado de la suscripción: lo primero, porque es lo que casi
				     siempre vino a mirar. -->
				<section
					class="reveal tilt-spot card-hairline bg-surface/50 rounded-3xl p-6 sm:p-7"
					use:reveal={{ delay: 60 }}
					use:tilt={{ max: 2.5, scale: 1.004 }}
				>
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

					{#if subscription && period}
						<!-- Medidor del período vigente. Un número solo se entiende
						     comparado: la barra dice cuánto queda de un vistazo. -->
						<div class="mt-6">
							<div class="bg-ink-soft h-2.5 w-full overflow-hidden rounded-full">
								<div
									class="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out)]"
									style="width:{period.percent}%;background:linear-gradient(90deg,#8b5cf6,#6366f1 55%,#22d3ee)"
								></div>
							</div>
							<div class="text-fg-faint mt-2 flex justify-between text-xs">
								<span>{formatDate(subscription.started_at)}</span>
								<span>{formatDate(subscription.expires_at)}</span>
							</div>
						</div>

						<!-- Días del período, en lenguaje neutro: cuánto lleva y cuánto
						     le queda. A propósito NO se llama "prueba". -->
						<dl class="border-line/60 mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
							<div>
								<dt class="text-fg-faint text-xs">Días transcurridos</dt>
								<dd class="text-fg mt-1 text-sm font-semibold">{period.elapsedLabel}</dd>
							</div>
							<div>
								<dt class="text-fg-faint text-xs">Días restantes</dt>
								<dd class="text-fg mt-1 text-sm font-semibold">{period.remainingLabel}</dd>
							</div>
						</dl>

						{#if periodNote}
							<p
								class="border-brand/25 bg-brand/[0.08] text-fg-muted mt-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed"
							>
								<Icon name="clock" size={14} class="text-brand mt-px shrink-0" />
								<span>{periodNote}</span>
							</p>
						{/if}

						<!-- Acciones según el estado. Un panel que solo informa deja al
						     dueño buscando el botón; este lo pone donde acaba de leer. -->
						<div class="mt-6 flex flex-wrap gap-2.5">
							{#if view.action === 'retry_payment' && !paymentUnderReview}
								{@const payPlan = isPayablePlan(requestedPlan) ? requestedPlan : 'monthly'}
								<button
									type="button"
									onclick={() => startCheckout(payPlan)}
									disabled={busy}
									use:magnetic={{ strength: 0.25 }}
									class="hover:shadow-glow sheen relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-[box-shadow] duration-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
									style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
								>
									{#if checkingOut === payPlan}
										<span
											class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
										></span>
										Abriendo pago seguro…
									{:else}
										{subscription?.status === 'payment_failed'
											? 'Reintentar el pago'
											: 'Completar el pago'}
										<Icon name="arrow" size={15} />
									{/if}
								</button>
							{:else if view.action}
								<a
									href="#planes"
									class="text-fg inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-white/[0.1]"
								>
									{view.action === 'reactivate' ? 'Reactivar mi plan' : 'Elegir un plan'}
									<Icon name="arrow" size={15} />
								</a>
							{/if}

							<!-- #1: retirar una solicitud pendiente. Antes no había forma de
							     deshacerla sin pagar; ahora es un botón explícito. -->
							{#if hasPendingRequest}
								<button
									type="button"
									onclick={cancelPending}
									disabled={busy}
									class="text-fg-muted hover:text-fg inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
								>
									{#if changing === 'free'}
										<span
											class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
										></span>
										Cancelando…
									{:else}
										<Icon name="x" size={14} />
										Cancelar solicitud
									{/if}
								</button>
							{/if}
						</div>

						{#if changeNotice}
							<div class="mt-5">
								<FormAlert tone="info" message={changeNotice} />
							</div>
						{/if}
						{#if changeError}
							<div class="mt-5">
								<FormAlert message={changeError} />
							</div>
						{/if}
						{#if checkoutError}
							<div class="mt-5">
								<FormAlert message={checkoutError} />
							</div>
						{/if}
						{#if paymentUnderReview}
							<div class="mt-5">
								<FormAlert
									tone="info"
									message="Recibimos un pago que estamos verificando a mano. No tienes que volver a pagar: te escribimos hoy mismo."
								/>
							</div>
						{/if}

						{#if hasPendingRequest && !changeNotice}
							<p
								class="border-brand/25 bg-brand/10 text-fg-muted mt-5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed"
							>
								Tienes pedido el plan <span class="text-fg font-semibold"
									>{planLabel(requestedPlan ?? undefined)}</span
								>. Se activa apenas Wompi confirme el pago — o puedes cancelar la solicitud arriba.
							</p>
						{/if}
					{/if}
				</section>

				<!-- Datos de la cuenta. -->
				<section
					class="reveal tilt-spot card-hairline bg-surface/50 rounded-3xl p-6 sm:p-7"
					use:reveal={{ delay: 120 }}
					use:tilt={{ max: 2.5, scale: 1.004 }}
				>
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
							<dd class="text-fg mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
								<span>{account.company.name}</span>
								{#if account.company.branches_count > 0}
									<!-- #2: ver CUÁLES son las sucursales y desde cuándo existen. -->
									<button
										type="button"
										onclick={openBranches}
										class="border-brand/25 bg-brand/10 text-brand hover:bg-brand/15 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors duration-200"
									>
										<Icon name="building" size={12} />
										{account.company.branches_count}
										{account.company.branches_count === 1 ? 'sucursal' : 'sucursales'}
										<Icon name="arrow" size={11} />
									</button>
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
						use:magnetic={{ strength: 0.2 }}
						class="text-brand mt-7 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
					>
						<Icon name="download" size={15} />
						Descargar PlacePos
					</a>
				</section>
			</div>

			<!-- Planes. -->
			<section id="planes" class="mt-10 scroll-mt-20">
				<div class="flex flex-wrap items-end justify-between gap-2">
					<h2 class="reveal font-display text-lg font-bold" use:reveal>Cambiar de plan</h2>
					<a
						href="{base}/#precios"
						class="text-fg-faint hover:text-fg-muted text-xs transition-colors duration-200"
					>
						Ver el detalle de cada plan
					</a>
				</div>

				<div class="mt-5 grid gap-4 sm:grid-cols-3">
					{#each PLANS as plan, i (plan.id)}
						{@const isCurrent = plan.id === currentPlan}
						{@const isRequested = plan.id === requestedPlan}
						{@const action = planCardAction(subscription, upcoming, plan.id)}
						{@const isScheduled = action.kind === 'scheduled'}
						{@const isPaidAhead = action.kind === 'paid_upcoming'}
						{@const isIntended =
							plan.id === intendedPlan && !isCurrent && !isRequested && !isScheduled}
						{@const enabled =
							(action.kind === 'cancel' ||
								action.kind === 'pay' ||
								action.kind === 'renew' ||
								action.kind === 'keep' ||
								action.kind === 'schedule') &&
							!busy &&
							!(plan.id !== 'free' && paymentUnderReview)}
						{@const primary = action.kind === 'pay' || action.kind === 'renew'}
						<article
							class="reveal tilt-spot flex flex-col rounded-2xl p-5 transition-[background-color,border-color] duration-300 {isCurrent ||
							isRequested
								? 'border-brand/40 bg-surface border'
								: isScheduled || isPaidAhead || isIntended
									? 'border-brand/25 bg-surface/60 border'
									: 'card-hairline bg-surface/30'}"
							use:reveal={{ delay: i * 90 }}
							use:tilt={{ max: 5, scale: 1.015 }}
						>
							<div class="flex items-center justify-between gap-2">
								<h3 class="font-display text-base font-bold">{plan.name}</h3>
								{#if isCurrent}
									<span
										class="border-mint/30 bg-mint/10 text-mint rounded-full border px-2 py-0.5 text-[10px] font-bold"
									>
										Actual
									</span>
								{:else if isPaidAhead}
									<span
										class="border-mint/30 bg-mint/10 text-mint rounded-full border px-2 py-0.5 text-[10px] font-bold"
									>
										Pagado
									</span>
								{:else if isScheduled}
									<span
										class="border-brand/30 bg-brand/10 text-brand rounded-full border px-2 py-0.5 text-[10px] font-bold"
									>
										Programado
									</span>
								{:else if isRequested}
									<span
										class="border-amber/30 bg-amber/10 text-amber rounded-full border px-2 py-0.5 text-[10px] font-bold"
									>
										Pendiente
									</span>
								{/if}
							</div>

							<p class="text-fg mt-3 text-2xl font-extrabold tracking-tight tabular-nums">
								{plan.price}
							</p>
							<p class="text-fg-faint mt-1 text-xs leading-relaxed">{plan.note}</p>

							<button
								type="button"
								disabled={!enabled}
								onclick={() => onPlanAction(plan.id, action, plan.price)}
								use:magnetic={{ strength: 0.2 }}
								class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed {enabled
									? primary
										? 'text-fg border-brand/40 bg-brand/15 hover:bg-brand/25 border'
										: 'text-fg border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.1]'
									: 'text-fg-faint border border-white/[0.07] bg-white/[0.02]'}"
							>
								{#if changing === plan.id || checkingOut === plan.id}
									<span
										class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
									></span>
									{checkingOut === plan.id ? 'Abriendo pago…' : 'Guardando…'}
								{:else if action.kind === 'current_free'}
									Tu plan
								{:else if action.kind === 'cancel'}
									{action.label}
								{:else if action.kind === 'canceled'}
									Renovación cancelada
								{:else if action.kind === 'pay'}
									{isRequested ? 'Completar pago' : `Pagar ${plan.price}`}
								{:else if action.kind === 'renew'}
									{action.same_plan ? `Renovar · ${plan.price}` : `Cambiar y pagar ${plan.price}`}
								{:else if action.kind === 'current'}
									<Icon name="check" size={14} />
									Plan actual
								{:else if action.kind === 'keep'}
									Quedarme en {plan.name}
								{:else if action.kind === 'schedule'}
									Cambiar a {plan.name}
								{:else if action.kind === 'scheduled'}
									<Icon name="clock" size={14} />
									Programado
								{:else if action.kind === 'paid_upcoming'}
									<Icon name="check" size={14} />
									Ya pagado
								{/if}
							</button>

							{#if action.kind === 'current' && action.renewal_opens_at}
								<p class="text-fg-faint mt-2.5 text-center text-[11px] leading-relaxed">
									Podrás renovarlo desde el {formatDate(action.renewal_opens_at)}
								</p>
							{:else if action.kind === 'scheduled'}
								<p class="text-fg-faint mt-2.5 text-center text-[11px] leading-relaxed">
									Empieza el {formatDate(action.effective_at)}
								</p>
							{:else if action.kind === 'paid_upcoming'}
								<p class="text-fg-faint mt-2.5 text-center text-[11px] leading-relaxed">
									Empieza el {formatDate(action.starts_at)}
								</p>
							{:else if action.kind === 'schedule'}
								<p class="text-fg-faint mt-2.5 text-center text-[11px] leading-relaxed">
									Empezaría el {formatDate(action.effective_at)}
								</p>
							{:else if action.kind === 'renew'}
								<p class="text-fg-faint mt-2.5 text-center text-[11px] leading-relaxed">
									Los días empiezan el {formatDate(action.starts_at)}
								</p>
							{/if}
						</article>
					{/each}
				</div>

				<p class="text-fg-faint mt-5 text-xs leading-relaxed">
					El pago se hace en el checkout seguro de Wompi (tarjeta, PSE, Nequi o Bancolombia). Con un
					plan activo no se compra otro encima: el cambio de plan se programa y empieza al terminar
					tu plan actual. Desde {RENEWAL_WINDOW_DAYS} días antes del corte puedes pagar el siguiente período,
					y sus días se suman después del corte — no pierdes ninguno. ¿Dudas? Escríbenos al
					<a href="https://wa.me/573117323107" class="text-brand hover:underline">
						+57 311 732 3107
					</a>.
				</p>
			</section>

			<!-- Últimos pagos: el historial completo vive en /panel/pagos. -->
			{#if recentPayments.length > 0}
				<section class="mt-10">
					<div class="flex flex-wrap items-end justify-between gap-2">
						<h2 class="reveal font-display text-lg font-bold" use:reveal>Últimos pagos</h2>
						<a
							href="{base}/panel/pagos"
							class="text-fg-muted hover:text-fg group inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200"
						>
							Ver todos los pagos
							<Icon
								name="arrow"
								size={13}
								class="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5"
							/>
						</a>
					</div>
					<ul class="card-hairline bg-surface/40 mt-4 divide-y divide-white/[0.06] rounded-2xl">
						{#each recentPayments as payment (payment.reference)}
							{@const pv = describePayment(payment)}
							<li>
								<a
									href="{base}/panel/pagos#pago-{payment.reference}"
									class="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl hover:bg-white/[0.025]"
								>
									<div class="min-w-0">
										<p class="text-fg text-sm font-semibold">
											Plan {planLabel(payment.plan)} ·
											<span class="tabular-nums">{formatAmount(payment.amount_in_cents)}</span>
										</p>
										<p class="text-fg-faint mt-0.5 text-xs">
											{formatDate(payment.created_at)}{payment.payment_method_type
												? ` · ${paymentMethodLabel(payment.payment_method_type)}`
												: ''}
										</p>
									</div>
									<span
										class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold {toneClasses[
											pv.tone
										]}"
									>
										<span class="h-1.5 w-1.5 rounded-full bg-current"></span>
										{pv.label}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</main>
	{/if}

	<!-- ============ Confirmación de cambio con plan vigente ============ -->
	<!-- Se explica ANTES de cobrar o programar: cuándo empieza, que no pierde días. -->
	{#if confirming && subscription}
		{@const copy = describePlanChange(subscription, confirming.action, confirming.price)}
		<div
			class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
			role="dialog"
			aria-modal="true"
			aria-labelledby="plan-change-title"
		>
			<button
				type="button"
				class="absolute inset-0 bg-black/60 backdrop-blur-sm"
				aria-label="Cerrar"
				onclick={() => (confirming = null)}
				transition:fade={{ duration: 180 }}
			></button>

			<div
				class="glass relative w-full max-w-md rounded-t-3xl p-6 sm:rounded-3xl sm:p-7"
				style="box-shadow:var(--shadow-float)"
				transition:scale={{ duration: 220, start: 0.96, opacity: 0, easing: cubicOut }}
			>
				<div class="flex items-start justify-between gap-4">
					<h2 id="plan-change-title" class="font-display text-lg font-bold">{copy.title}</h2>
					<button
						type="button"
						onclick={() => (confirming = null)}
						class="text-fg-muted hover:text-fg -mt-1 -mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white/5"
						aria-label="Cerrar"
					>
						<Icon name="x" size={18} />
					</button>
				</div>

				<!-- Línea de tiempo: hoy → corte → nuevo plan. Dice CUÁNDO pasa cada cosa. -->
				<ol class="border-line/70 mt-5 space-y-4 border-l pl-5">
					<li class="relative">
						<span class="bg-mint absolute top-1.5 -left-[24.5px] h-2 w-2 rounded-full"></span>
						<p class="text-fg text-sm font-semibold">Plan {planLabel(subscription.plan)}</p>
						<p class="text-fg-faint mt-0.5 text-xs">
							Sigue activo hasta el {formatDate(
								confirming.action.kind === 'schedule'
									? confirming.action.effective_at
									: confirming.action.starts_at
							)}
						</p>
					</li>
					<li class="relative">
						<span
							class="border-brand bg-ink absolute top-1.5 -left-[25.5px] h-2.5 w-2.5 rounded-full border-2"
						></span>
						<p class="text-fg text-sm font-semibold">
							Plan {planLabel(confirming.action.plan)}
						</p>
						<p class="text-fg-faint mt-0.5 text-xs">
							Empieza el {formatDate(
								confirming.action.kind === 'schedule'
									? confirming.action.effective_at
									: confirming.action.starts_at
							)}
						</p>
					</li>
				</ol>

				<p class="text-fg-muted mt-5 text-sm leading-relaxed">{copy.body}</p>

				<div class="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
					<button
						type="button"
						onclick={() => (confirming = null)}
						class="text-fg-muted hover:text-fg inline-flex items-center justify-center rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-white/[0.04]"
					>
						Ahora no
					</button>
					<button
						type="button"
						onclick={confirmPlanChange}
						class="text-fg border-brand/40 bg-brand/20 hover:bg-brand/30 inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-[background-color,transform] duration-200 active:scale-[0.98]"
					>
						<Icon name={confirming.action.kind === 'schedule' ? 'clock' : 'lock'} size={15} />
						{copy.confirm}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ===================== Modal de sucursales (#2) ===================== -->
	{#if branchesOpen}
		<div
			class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
			role="dialog"
			aria-modal="true"
			aria-label="Sucursales del negocio"
		>
			<!-- Scrim: oscurece el fondo y cierra al pulsar fuera. -->
			<button
				type="button"
				class="absolute inset-0 bg-black/60 backdrop-blur-sm"
				aria-label="Cerrar"
				onclick={() => (branchesOpen = false)}
				transition:fade={{ duration: 200 }}
			></button>

			<div
				class="glass relative w-full max-w-md rounded-t-3xl p-6 sm:rounded-3xl sm:p-7"
				style="box-shadow:var(--shadow-float)"
				transition:scale={{ duration: 240, start: 0.96, opacity: 0, easing: cubicOut }}
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<h2 class="font-display text-lg font-bold">Sucursales</h2>
						<p class="text-fg-muted mt-1 text-sm">{account?.company.name}</p>
					</div>
					<button
						type="button"
						onclick={() => (branchesOpen = false)}
						class="text-fg-muted hover:text-fg inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white/5"
						aria-label="Cerrar"
					>
						<Icon name="x" size={18} />
					</button>
				</div>

				<div class="mt-5">
					{#if branchesLoading}
						<div class="flex items-center justify-center py-10">
							<span
								class="border-brand/30 border-t-brand h-7 w-7 animate-spin rounded-full border-2"
								aria-label="Cargando sucursales"
							></span>
						</div>
					{:else if branchesError}
						<FormAlert message={branchesError} />
					{:else if branches && branches.length > 0}
						<ul class="space-y-2.5">
							{#each branches as branch (branch.id)}
								<li
									class="border-line/60 flex items-center gap-3 rounded-xl border bg-white/[0.02] px-4 py-3"
								>
									<span
										class="text-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"
									>
										<Icon name="building" size={16} />
									</span>
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-2">
											<span class="text-fg truncate text-sm font-semibold">{branch.name}</span>
											{#if branch.is_main}
												<span
													class="border-mint/30 bg-mint/10 text-mint rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase"
												>
													Principal
												</span>
											{/if}
										</div>
										<p class="text-fg-faint mt-0.5 text-xs">
											Desde el {formatDate(branch.created_at)}
										</p>
									</div>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-fg-muted py-6 text-center text-sm">
							Aún no hay sucursales registradas en este negocio.
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
