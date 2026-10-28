<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import FormAlert from '$lib/components/auth/FormAlert.svelte';
	import { ApiError } from '$lib/api/client';
	import { getAccount, listPayments, type Payment, type PortalAccount } from '$lib/api/portal';
	import { session } from '$lib/stores/session.svelte';
	import { SITE } from '$lib/data/site';
	import { formatDate, planLabel } from '$lib/utils/subscription';
	import {
		canResumePayment,
		describePayment,
		filterPayments,
		formatAmount,
		formatDateTime,
		groupPaymentsByMonth,
		paymentMethodLabel,
		summarizePayments,
		type PaymentFilter
	} from '$lib/utils/payment';
	import { nextPeriodNote } from '$lib/utils/plan-control';

	// ---------------------------------------------------------------------------
	// Historial de pagos del dueño. Todo intento aparece —también los rechazados
	// y los que quedaron a medias—: esconder un pago fallido es la forma más
	// rápida de que alguien crea que le cobraron dos veces.
	// ---------------------------------------------------------------------------

	const pageTitle = `Pagos — ${SITE.name}`;

	let payments = $state<Payment[] | null>(null);
	let account = $state<PortalAccount | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	let filter = $state<PaymentFilter>('all');
	/** Pago desplegado (uno a la vez: el detalle se lee, no se compara). */
	let openRef = $state<string | null>(null);
	/** Qué valor se acaba de copiar, para confirmar con un check. */
	let copied = $state<string | null>(null);
	let copiedTimer: ReturnType<typeof setTimeout> | null = null;

	const FILTERS: { id: PaymentFilter; label: string }[] = [
		{ id: 'all', label: 'Todos' },
		{ id: 'approved', label: 'Aprobados' },
		{ id: 'unfinished', label: 'Sin completar' }
	];

	const toneDot: Record<string, string> = {
		good: 'border-mint/30 bg-mint/10 text-mint',
		warn: 'border-amber/30 bg-amber/10 text-amber',
		bad: 'border-amber/40 bg-amber/15 text-amber',
		neutral: 'border-line bg-white/[0.04] text-fg-faint'
	};

	const summary = $derived(payments ? summarizePayments(payments) : null);
	const counts = $derived({
		all: payments?.length ?? 0,
		approved: payments ? filterPayments(payments, 'approved').length : 0,
		unfinished: payments ? filterPayments(payments, 'unfinished').length : 0
	});
	const groups = $derived(payments ? groupPaymentsByMonth(filterPayments(payments, filter)) : []);
	const activeFilter = $derived(FILTERS.findIndex((f) => f.id === filter));
	const periodNote = $derived(
		account ? nextPeriodNote(account.subscription, account.upcoming_period ?? null) : null
	);

	$effect(() => {
		if (!session.ready) return;
		if (!session.isAuthenticated) {
			void goto(`${base}/ingresar`, { replaceState: true });
			return;
		}
		void load();
	});

	async function load(): Promise<void> {
		const token = session.token;
		if (!token) {
			loading = false;
			return;
		}
		loading = true;
		try {
			const [list, acc] = await Promise.all([listPayments(token), getAccount(token)]);
			payments = list;
			account = acc;
			loadError = '';
			await openFromHash();
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				session.clear();
				void goto(`${base}/ingresar`, { replaceState: true });
				return;
			}
			loadError = error instanceof ApiError ? error.message : 'No pudimos cargar tus pagos.';
		} finally {
			loading = false;
		}
	}

	/** `#pago-<ref>` (desde "Últimos pagos" del panel) abre ese pago y lo trae a la vista. */
	async function openFromHash(): Promise<void> {
		const ref = window.location.hash.replace(/^#pago-/, '');
		if (!ref || !payments?.some((p) => p.reference === ref)) return;
		openRef = ref;
		loading = false;
		await tick();
		document.getElementById(`pago-${ref}`)?.scrollIntoView({ block: 'center' });
	}

	function toggle(reference: string): void {
		openRef = openRef === reference ? null : reference;
	}

	async function copy(value: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(value);
			copied = value;
			if (copiedTimer) clearTimeout(copiedTimer);
			copiedTimer = setTimeout(() => (copied = null), 1600);
		} catch {
			/* sin permiso de portapapeles: el valor sigue visible para copiarlo a mano */
		}
	}

	const statusIcon = (tone: string): string =>
		tone === 'good' ? 'check' : tone === 'warn' ? 'clock' : tone === 'bad' ? 'x' : 'clock';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-3xl font-bold tracking-tight sm:text-4xl">Pagos</h1>
			<p class="text-fg-muted mt-2 text-sm">
				{account
					? `Cobros de la suscripción de ${account.company.name}`
					: 'Cobros de tu suscripción'}
			</p>
		</div>
		<a
			href="{base}/panel?seccion=planes"
			class="text-fg-muted hover:text-fg group inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
		>
			Gestionar plan
			<Icon
				name="arrow"
				size={14}
				class="transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5"
			/>
		</a>
	</div>

	{#if loading && !payments}
		<!-- Esqueleto con la forma real de la lista: nada salta al llegar los datos. -->
		<div class="mt-10 space-y-3" aria-live="polite" aria-label="Cargando tus pagos">
			<div class="bg-surface/40 h-[76px] animate-pulse rounded-2xl"></div>
			<div class="card-hairline bg-surface/30 divide-y divide-white/[0.05] rounded-2xl">
				{#each [0, 1, 2] as row (row)}
					<div class="flex items-center gap-4 px-5 py-4">
						<span class="h-9 w-9 animate-pulse rounded-full bg-white/[0.05]"></span>
						<span class="h-3 flex-1 animate-pulse rounded bg-white/[0.05]"></span>
						<span class="h-3 w-20 animate-pulse rounded bg-white/[0.05]"></span>
					</div>
				{/each}
			</div>
		</div>
	{:else if loadError}
		<div class="mt-10 max-w-md">
			<FormAlert message={loadError} />
			<button
				type="button"
				onclick={load}
				class="text-brand mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
			>
				<Icon name="refresh" size={15} />
				Reintentar
			</button>
		</div>
	{:else if payments && payments.length === 0}
		<div class="card-hairline bg-surface/30 mt-10 rounded-3xl px-6 py-14 text-center">
			<span
				class="text-fg-faint mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]"
			>
				<Icon name="receipt" size={22} />
			</span>
			<h2 class="font-display mt-5 text-lg font-bold">Aún no tienes pagos</h2>
			<p class="text-fg-muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">
				Cuando pagues tu plan con Wompi, cada cobro aparece aquí con su comprobante y los días que
				sumó.
			</p>
			<a
				href="{base}/panel?seccion=planes"
				class="text-fg border-brand/40 bg-brand/15 hover:bg-brand/25 mt-6 inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-[background-color,transform] duration-200 active:scale-[0.98]"
			>
				Elegir un plan
				<Icon name="arrow" size={15} />
			</a>
		</div>
	{:else if payments && summary}
		<!-- Resumen: un renglón de libro contable, no un tablero. -->
		<dl
			class="card-hairline bg-surface/40 mt-10 grid grid-cols-1 divide-y divide-white/[0.06] rounded-2xl sm:grid-cols-3 sm:divide-x sm:divide-y-0"
		>
			<div class="px-5 py-4">
				<dt class="text-fg-faint text-xs">Total pagado</dt>
				<dd class="text-fg mt-1 text-lg font-semibold tabular-nums">
					{formatAmount(summary.total_paid_in_cents)}
				</dd>
			</div>
			<div class="px-5 py-4">
				<dt class="text-fg-faint text-xs">Pagos aprobados</dt>
				<dd class="text-fg mt-1 text-lg font-semibold tabular-nums">{summary.approved_count}</dd>
			</div>
			<div class="px-5 py-4">
				<dt class="text-fg-faint text-xs">Último pago</dt>
				<dd class="text-fg mt-1 text-lg font-semibold">
					{summary.last_paid_at ? formatDate(summary.last_paid_at) : '—'}
				</dd>
			</div>
		</dl>

		{#if periodNote}
			<p
				class="border-brand/25 bg-brand/[0.08] text-fg-muted mt-4 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed"
			>
				<Icon name="clock" size={14} class="text-brand mt-px shrink-0" />
				<span>{periodNote}</span>
			</p>
		{/if}

		<!-- Filtro segmentado: el indicador se desliza entre opciones. -->
		<div
			role="tablist"
			aria-label="Filtrar pagos"
			class="relative mt-8 inline-grid grid-cols-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1"
		>
			<span
				aria-hidden="true"
				class="segment-indicator pointer-events-none absolute top-1 bottom-1 left-1 rounded-lg border border-white/[0.09] bg-white/[0.08]"
				style="width:calc((100% - 8px) / 3);transform:translateX({activeFilter * 100}%)"
			></span>
			{#each FILTERS as option (option.id)}
				<button
					type="button"
					role="tab"
					aria-selected={filter === option.id}
					onclick={() => (filter = option.id)}
					class="relative inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 sm:px-4 {filter ===
					option.id
						? 'text-fg'
						: 'text-fg-faint hover:text-fg-muted'}"
				>
					{option.label}
					<span class="text-fg-faint text-[11px] tabular-nums">{counts[option.id]}</span>
				</button>
			{/each}
		</div>

		{#if groups.length === 0}
			<p class="text-fg-muted mt-8 text-sm">No hay pagos en este filtro.</p>
		{:else}
			<div class="mt-6 space-y-8">
				{#each groups as group (group.key)}
					<section aria-labelledby="mes-{group.key}">
						<h2 id="mes-{group.key}" class="text-fg-faint px-1 text-xs font-medium">
							{group.label}
						</h2>
						<ul
							class="card-hairline bg-surface/40 mt-2.5 divide-y divide-white/[0.06] overflow-hidden rounded-2xl"
						>
							{#each group.payments as payment (payment.reference)}
								{@const pv = describePayment(payment)}
								{@const open = openRef === payment.reference}
								<li id="pago-{payment.reference}" class="scroll-mt-24">
									<button
										type="button"
										onclick={() => toggle(payment.reference)}
										aria-expanded={open}
										aria-controls="detalle-{payment.reference}"
										class="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-white/[0.025] sm:px-5"
									>
										<span
											class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border {toneDot[
												pv.tone
											]}"
										>
											<Icon name={statusIcon(pv.tone)} size={15} stroke={2} />
										</span>
										<span class="min-w-0 flex-1">
											<span class="text-fg block truncate text-sm font-semibold">
												Plan {planLabel(payment.plan)}
											</span>
											<span class="text-fg-faint mt-0.5 block truncate text-xs">
												{formatDateTime(payment.created_at)}{payment.payment_method_type
													? ` · ${paymentMethodLabel(payment.payment_method_type)}`
													: ''}
											</span>
										</span>
										<span class="shrink-0 text-right">
											<span
												class="block text-sm font-semibold tabular-nums {payment.status ===
												'approved'
													? 'text-fg'
													: 'text-fg-faint'}"
											>
												{formatAmount(payment.amount_in_cents)}
											</span>
											<span class="text-fg-faint mt-0.5 block text-[11px]">{pv.label}</span>
										</span>
										<Icon
											name="chevron"
											size={16}
											class="chevron text-fg-faint shrink-0 {open ? 'is-open' : ''}"
										/>
									</button>

									<!-- Detalle: alto animado con grid 0fr→1fr (sin medir con JS). -->
									<div
										id="detalle-{payment.reference}"
										class="disclosure {open ? 'is-open' : ''}"
										inert={!open}
									>
										<div class="overflow-hidden">
											<div
												class="border-t border-white/[0.05] px-4 pt-4 pb-5 sm:px-5 sm:pl-[4.25rem]"
											>
												<p class="text-fg-muted text-sm leading-relaxed">{pv.detail}</p>

												<dl class="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
													<div>
														<dt class="text-fg-faint text-xs">Días comprados</dt>
														<dd class="text-fg mt-0.5 tabular-nums">{payment.days_granted}</dd>
													</div>
													{#if payment.period_starts_at && payment.period_ends_at}
														<div>
															<dt class="text-fg-faint text-xs">Período cubierto</dt>
															<dd class="text-fg mt-0.5">
																{formatDate(payment.period_starts_at)} – {formatDate(
																	payment.period_ends_at
																)}
															</dd>
														</div>
													{/if}
													{#if payment.applied_at}
														<div>
															<dt class="text-fg-faint text-xs">Aplicado</dt>
															<dd class="text-fg mt-0.5">{formatDateTime(payment.applied_at)}</dd>
														</div>
													{/if}
													<div>
														<dt class="text-fg-faint text-xs">Medio de pago</dt>
														<dd class="text-fg mt-0.5">
															{paymentMethodLabel(payment.payment_method_type)}
														</dd>
													</div>
													{#each [{ label: 'Transacción Wompi', value: payment.transaction_id }, { label: 'Referencia', value: payment.reference }] as id (id.label)}
														{#if id.value}
															<div class="sm:col-span-2">
																<dt class="text-fg-faint text-xs">{id.label}</dt>
																<dd class="mt-0.5 flex items-center gap-2">
																	<code class="text-fg-muted font-mono text-xs break-all"
																		>{id.value}</code
																	>
																	<button
																		type="button"
																		onclick={() => copy(id.value as string)}
																		aria-label="Copiar {id.label.toLowerCase()}"
																		class="text-fg-faint hover:text-fg inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-[color,background-color,transform] duration-150 hover:bg-white/[0.06] active:scale-[0.94]"
																	>
																		<Icon
																			name={copied === id.value ? 'check' : 'copy'}
																			size={13}
																			class={copied === id.value ? 'text-mint' : ''}
																		/>
																	</button>
																</dd>
															</div>
														{/if}
													{/each}
												</dl>

												{#if canResumePayment(payment) || pv.can_retry || payment.status === 'pending'}
													<div class="mt-5 flex flex-wrap gap-2.5">
														{#if canResumePayment(payment)}
															<a
																href={payment.checkout_url}
																class="text-fg border-brand/40 bg-brand/15 hover:bg-brand/25 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-[background-color,transform] duration-200 active:scale-[0.98]"
															>
																<Icon name="lock" size={14} />
																Continuar el pago
															</a>
														{/if}
														<a
															href="{base}/panel/pago?ref={payment.reference}"
															class="text-fg-muted hover:text-fg inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-white/[0.04]"
														>
															{pv.can_retry ? 'Ver y reintentar' : 'Consultar estado'}
															<Icon name="arrow" size={13} />
														</a>
													</div>
												{/if}
											</div>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>
		{/if}

		<p class="text-fg-faint mt-10 text-xs leading-relaxed">
			Pagos procesados por Wompi (Bancolombia). Si un cobro no cuadra, escríbenos al
			<a href="https://wa.me/573117323107" class="text-brand hover:underline">+57 311 732 3107</a>
			con el número de transacción.
		</p>
	{/if}
</main>

<style>
	.segment-indicator {
		transition: transform 240ms var(--ease-out);
	}

	.disclosure {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows 260ms var(--ease-out),
			opacity 200ms var(--ease-out);
	}
	.disclosure.is-open {
		grid-template-rows: 1fr;
		opacity: 1;
	}

	:global(.chevron) {
		transition: transform 220ms var(--ease-out);
	}
	:global(.chevron.is-open) {
		transform: rotate(180deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.segment-indicator,
		.disclosure,
		:global(.chevron) {
			transition: none;
		}
	}
</style>
