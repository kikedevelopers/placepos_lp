<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from '$lib/components/Icon.svelte';
	import FormAlert from '$lib/components/auth/FormAlert.svelte';
	import { ApiError } from '$lib/api/client';
	import { confirmPayment, createCheckout, type Payment } from '$lib/api/portal';
	import { session } from '$lib/stores/session.svelte';
	import { SITE } from '$lib/data/site';
	import { planLabel } from '$lib/utils/subscription';
	import {
		MAX_POLL_ATTEMPTS,
		describePayment,
		formatAmount,
		isFinalPayment,
		isTrustedCheckoutUrl,
		pollDelayMs,
		readReturnParams
	} from '$lib/utils/payment';

	// ---------------------------------------------------------------------------
	// Regreso desde el checkout de Wompi: `/panel/pago?ref=<pago>&id=<transacción>`.
	//
	// Esta página NO decide nada. Le pregunta a pos_api cómo quedó el pago (y
	// pos_api lo verifica contra Wompi). Mientras esté pendiente, vuelve a
	// preguntar con pausas crecientes; nunca muestra "listo" sin confirmación.
	// ---------------------------------------------------------------------------

	const pageTitle = `Tu pago — ${SITE.name}`;

	let reference = $state<string | null>(null);
	let transactionId = $state<string | null>(null);
	let payment = $state<Payment | null>(null);
	let invalidLink = $state(false);
	let requestError = $state('');
	let attempts = $state(0);
	/** Se dejó de consultar solo (tope alcanzado); el usuario puede pedir otra vuelta. */
	let pollingStopped = $state(false);
	let retrying = $state(false);
	let retryError = $state('');

	let timer: ReturnType<typeof setTimeout> | null = null;
	let started = false;

	const view = $derived(payment ? describePayment(payment) : null);
	const isPending = $derived(!payment || payment.status === 'pending');

	const toneRing: Record<string, string> = {
		good: 'border-mint/40 bg-mint/10 text-mint',
		warn: 'border-amber/40 bg-amber/10 text-amber',
		bad: 'border-amber/50 bg-amber/15 text-amber',
		neutral: 'border-line bg-white/[0.04] text-fg-muted'
	};

	$effect(() => {
		if (!session.ready || started) return;
		if (!session.isAuthenticated) {
			void goto(`${base}/ingresar`, { replaceState: true });
			return;
		}
		started = true;
		const params = readReturnParams(window.location.search);
		reference = params.reference;
		transactionId = params.transaction_id;
		if (!reference) {
			invalidLink = true;
			return;
		}
		void check();
	});

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});

	async function check(): Promise<void> {
		const token = session.token;
		if (!token || !reference) return;

		try {
			payment = await confirmPayment(token, reference, transactionId);
			requestError = '';
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				session.clear();
				void goto(`${base}/ingresar`, { replaceState: true });
				return;
			}
			if (error instanceof ApiError && error.status === 404) {
				invalidLink = true;
				return;
			}
			// Un fallo de red no cambia el pago: se informa y se sigue consultando.
			requestError =
				error instanceof ApiError
					? error.message
					: 'No pudimos consultar tu pago. Seguimos intentando.';
		}

		attempts += 1;
		if (payment && isFinalPayment(payment.status)) return;
		if (attempts >= MAX_POLL_ATTEMPTS) {
			pollingStopped = true;
			return;
		}
		timer = setTimeout(() => void check(), pollDelayMs(attempts));
	}

	function checkAgain(): void {
		pollingStopped = false;
		attempts = 0;
		void check();
	}

	/** Paga de nuevo el mismo plan (link nuevo). */
	async function retry(): Promise<void> {
		const token = session.token;
		if (!token || !payment || retrying) return;
		retrying = true;
		retryError = '';
		try {
			const next = await createCheckout(token, payment.plan);
			if (!isTrustedCheckoutUrl(next.checkout_url)) {
				throw new Error('untrusted');
			}
			window.location.assign(next.checkout_url);
		} catch (error) {
			retryError =
				error instanceof ApiError ? error.message : 'No pudimos abrir la pasarela de pago.';
			retrying = false;
		}
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="relative">
	<main class="mx-auto flex max-w-lg flex-col px-4 py-16 sm:px-6 sm:py-24">
		{#if invalidLink}
			<div class="card-hairline bg-surface/50 rounded-3xl p-7 text-center" in:fade>
				<h1 class="font-display text-xl font-bold">No encontramos este pago</h1>
				<p class="text-fg-muted mt-2 text-sm leading-relaxed">
					El enlace de regreso está incompleto o el pago no es de tu cuenta. Revisa el estado en tu
					panel.
				</p>
				<a
					href="{base}/panel"
					class="text-fg mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-white/[0.1]"
				>
					Ir a mi cuenta
					<Icon name="arrow" size={15} />
				</a>
			</div>
		{:else}
			<section
				class="card-hairline bg-surface/50 relative overflow-hidden rounded-3xl p-7 text-center sm:p-9"
				aria-live="polite"
			>
				<!-- Indicador de estado: anillo que gira mientras se verifica. -->
				<div class="flex justify-center">
					{#if isPending}
						<span
							class="border-brand/25 border-t-brand h-14 w-14 animate-spin rounded-full border-[3px]"
							aria-hidden="true"
						></span>
					{:else if view}
						{#key payment?.status}
							<span
								class="flex h-14 w-14 items-center justify-center rounded-full border {toneRing[
									view.tone
								]}"
								in:scale={{ duration: 320, start: 0.7, easing: cubicOut }}
							>
								<Icon
									name={view.tone === 'good' ? 'check' : view.tone === 'warn' ? 'clock' : 'x'}
									size={26}
								/>
							</span>
						{/key}
					{/if}
				</div>

				<h1 class="font-display mt-6 text-2xl font-bold tracking-tight">
					{view?.headline ?? 'Estamos confirmando tu pago'}
				</h1>
				<p class="text-fg-muted mx-auto mt-3 max-w-sm text-sm leading-relaxed">
					{view?.detail ?? 'Consultando con Wompi…'}
				</p>

				{#if payment}
					<dl
						class="border-line/60 mt-7 grid grid-cols-2 gap-4 border-t pt-6 text-left text-sm"
						in:fade={{ duration: 200 }}
					>
						<div>
							<dt class="text-fg-faint text-xs">Plan</dt>
							<dd class="text-fg mt-1 font-semibold">{planLabel(payment.plan)}</dd>
						</div>
						<div>
							<dt class="text-fg-faint text-xs">Monto</dt>
							<dd class="text-fg mt-1 font-semibold tabular-nums">
								{formatAmount(payment.amount_in_cents)}
							</dd>
						</div>
						<div>
							<dt class="text-fg-faint text-xs">Días</dt>
							<dd class="text-fg mt-1 font-semibold">{payment.days_granted}</dd>
						</div>
						<div>
							<dt class="text-fg-faint text-xs">Medio</dt>
							<dd class="text-fg mt-1 font-semibold">{payment.payment_method_type ?? '—'}</dd>
						</div>
						{#if payment.transaction_id}
							<div class="col-span-2">
								<dt class="text-fg-faint text-xs">Transacción Wompi</dt>
								<dd class="text-fg-muted mt-1 font-mono text-xs break-all">
									{payment.transaction_id}
								</dd>
							</div>
						{/if}
					</dl>
				{/if}

				{#if requestError}
					<div class="mt-6 text-left">
						<FormAlert message={requestError} />
					</div>
				{/if}
				{#if retryError}
					<div class="mt-6 text-left">
						<FormAlert message={retryError} />
					</div>
				{/if}

				<div class="mt-8 flex flex-wrap justify-center gap-2.5">
					{#if view?.can_retry}
						<button
							type="button"
							onclick={retry}
							disabled={retrying}
							class="hover:shadow-glow sheen relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-[box-shadow] duration-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
							style="background:linear-gradient(135deg,#8b5cf6,#6366f1 55%,#22d3ee)"
						>
							{#if retrying}
								<span
									class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
								></span>
								Abriendo pago seguro…
							{:else}
								Intentar de nuevo
								<Icon name="arrow" size={15} />
							{/if}
						</button>
					{/if}
					{#if pollingStopped && isPending}
						<button
							type="button"
							onclick={checkAgain}
							class="text-fg inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-white/[0.1]"
						>
							<Icon name="refresh" size={15} />
							Volver a consultar
						</button>
					{/if}
					<a
						href="{base}/panel"
						class="text-fg inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-white/[0.1]"
					>
						Ir a mi cuenta
					</a>
				</div>
			</section>

			<p class="text-fg-faint mt-6 text-center text-xs leading-relaxed">
				Pagos procesados por Wompi (Bancolombia). ¿Algo no cuadra? Escríbenos al
				<a href="https://wa.me/573117323107" class="text-brand hover:underline">+57 311 732 3107</a>
				con el número de transacción.
			</p>
		{/if}
	</main>
</div>
