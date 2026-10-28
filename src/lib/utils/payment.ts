import type { Payment, PaymentStatus } from '$lib/api/portal';
import type { PlanId } from '$lib/data/pricing';
import { formatCop } from '$lib/utils/pricing';
import { formatDate, planLabel } from '$lib/utils/subscription';

// ---------------------------------------------------------------------------
// Lo que la landing le dice al dueño sobre un pago, y las reglas del regreso
// desde el checkout de Wompi. Todo puro y testeado: aquí hay dinero real, y un
// "listo, pagaste" mal puesto es peor que cualquier error visible.
// ---------------------------------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRANSACTION_ID = /^[A-Za-z0-9-]{1,64}$/;

/** `true` si el plan se paga en línea. */
export const isPayablePlan = (plan: unknown): plan is PlanId =>
	plan === 'monthly' || plan === 'annual';

/**
 * Lee la URL de regreso: `?ref=<nuestra referencia>&id=<transacción de Wompi>`.
 * Lo que no tenga la forma esperada se descarta (no se manda basura al API).
 */
export function readReturnParams(search: string): {
	reference: string | null;
	transaction_id: string | null;
} {
	const params = new URLSearchParams(search);
	const reference = params.get('ref');
	const transaction_id = params.get('id');
	return {
		reference: reference && UUID.test(reference) ? reference : null,
		transaction_id: transaction_id && TRANSACTION_ID.test(transaction_id) ? transaction_id : null
	};
}

/**
 * Solo se redirige al checkout oficial de Wompi. Si el API devolviera otra cosa
 * (o alguien la alterara en el camino), no se manda al cliente a pagar en un
 * sitio que no conocemos.
 */
export function isTrustedCheckoutUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'https:' && parsed.hostname === 'checkout.wompi.co';
	} catch {
		return false;
	}
}

/** Pesos desde centavos. */
export const formatAmount = (amount_in_cents: number): string =>
	formatCop(Math.round(amount_in_cents / 100));

/** Estados en los que el pago ya no va a cambiar solo. */
export const isFinalPayment = (status: PaymentStatus): boolean =>
	status === 'approved' ||
	status === 'declined' ||
	status === 'voided' ||
	status === 'error' ||
	status === 'expired' ||
	status === 'needs_review';

/** Pausa entre consultas mientras el pago está pendiente (crece para no martillar). */
export function pollDelayMs(attempt: number): number {
	if (attempt < 10) return 3_000;
	if (attempt < 25) return 6_000;
	return 15_000;
}

/** Tope de consultas automáticas (≈ 8 min). Después se ofrece "Volver a consultar". */
export const MAX_POLL_ATTEMPTS = 50;

export interface PaymentView {
	tone: 'good' | 'warn' | 'bad' | 'neutral';
	label: string;
	headline: string;
	detail: string;
	/** Ofrecer pagar de nuevo. */
	can_retry: boolean;
}

export function describePayment(payment: Payment, now = Date.now()): PaymentView {
	const plan = planLabel(payment.plan);
	const amount = formatAmount(payment.amount_in_cents);
	const startsLater =
		!!payment.period_starts_at && new Date(payment.period_starts_at).getTime() > now;

	switch (payment.status) {
		case 'approved':
			// Renovación anticipada: lo pagado empieza al terminar el período actual.
			if (startsLater && payment.period_starts_at && payment.period_ends_at) {
				return {
					tone: 'good',
					label: 'Pago aprobado',
					headline: `¡Listo! Pagaste tu plan ${plan}`,
					detail: `Recibimos ${amount}. Tus ${payment.days_granted} días empiezan el ${formatDate(payment.period_starts_at)}, al terminar tu período actual, y van hasta el ${formatDate(payment.period_ends_at)}.`,
					can_retry: false
				};
			}
			return {
				tone: 'good',
				label: 'Pago aprobado',
				headline: `¡Listo! Tu plan ${plan} está activo`,
				detail: payment.period_ends_at
					? `Recibimos ${amount} y sumamos ${payment.days_granted} días. Tu suscripción va hasta el ${formatDate(payment.period_ends_at)}.`
					: `Recibimos ${amount} y sumamos ${payment.days_granted} días a tu suscripción.`,
				can_retry: false
			};
		case 'pending':
			return {
				tone: 'warn',
				label: 'Verificando',
				headline: 'Estamos confirmando tu pago',
				detail:
					'Algunos medios (PSE, Nequi, transferencias) tardan unos minutos. Puedes cerrar esta página: apenas se confirme, los días se cargan solos.',
				can_retry: false
			};
		case 'declined':
		case 'voided':
		case 'error':
			return {
				tone: 'bad',
				label: payment.status === 'declined' ? 'Pago rechazado' : 'Pago no procesado',
				headline: 'Tu pago no se completó',
				detail: `${payment.failure_reason ?? 'La transacción no fue aprobada.'} No se te cobró nada; puedes intentarlo de nuevo con otro medio de pago.`,
				can_retry: true
			};
		case 'expired':
			return {
				tone: 'neutral',
				label: 'Link vencido',
				headline: 'Este link de pago venció',
				detail: 'No se registró ningún pago con él. Genera uno nuevo para continuar.',
				can_retry: true
			};
		case 'needs_review':
		default:
			return {
				tone: 'warn',
				label: 'En revisión',
				headline: 'Recibimos tu pago y lo estamos revisando',
				detail:
					'El pago llegó pero necesita una verificación manual. Ya nos avisaron y te escribimos hoy mismo; no tienes que volver a pagar.',
				can_retry: false
			};
	}
}

// --- Plan elegido en la sección de precios -----------------------------------
// Se recuerda en el navegador para no perderlo en el rodeo registro → correo de
// activación → login. Solo guarda el id del plan (nada sensible) y caduca.

const INTENDED_PLAN_KEY = 'placepos.intended_plan';
const INTENDED_PLAN_TTL_MS = 3 * 24 * 60 * 60 * 1000;

interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export function rememberIntendedPlan(
	storage: StorageLike | null,
	plan: string | null,
	now = Date.now()
): void {
	if (!storage || !isPayablePlan(plan)) return;
	try {
		storage.setItem(INTENDED_PLAN_KEY, JSON.stringify({ plan, at: now }));
	} catch {
		/* almacenamiento lleno o bloqueado: no es crítico */
	}
}

export function readIntendedPlan(storage: StorageLike | null, now = Date.now()): PlanId | null {
	if (!storage) return null;
	try {
		const raw = storage.getItem(INTENDED_PLAN_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { plan?: unknown; at?: unknown };
		if (!isPayablePlan(parsed.plan) || typeof parsed.at !== 'number') return null;
		if (now - parsed.at > INTENDED_PLAN_TTL_MS) return null;
		return parsed.plan;
	} catch {
		return null;
	}
}

export function forgetIntendedPlan(storage: StorageLike | null): void {
	try {
		storage?.removeItem(INTENDED_PLAN_KEY);
	} catch {
		/* noop */
	}
}

/** Almacenamiento del navegador, o `null` si no hay (SSR, modo privado estricto). */
export function browserStorage(): StorageLike | null {
	try {
		return typeof window === 'undefined' ? null : window.localStorage;
	} catch {
		return null;
	}
}

// --- Vista de pagos ------------------------------------------------------------

export type PaymentFilter = 'all' | 'approved' | 'unfinished';

/** Pagos que no terminaron en cobro (rechazados, vencidos, pendientes, en revisión). */
const isUnfinished = (status: PaymentStatus): boolean => status !== 'approved';

export function filterPayments(payments: Payment[], filter: PaymentFilter): Payment[] {
	if (filter === 'approved') return payments.filter((p) => p.status === 'approved');
	if (filter === 'unfinished') return payments.filter((p) => isUnfinished(p.status));
	return payments;
}

export interface PaymentsSummary {
	/** Suma de lo aprobado, en centavos. */
	total_paid_in_cents: number;
	approved_count: number;
	/** Fecha del último pago aprobado (ISO) o `null`. */
	last_paid_at: string | null;
}

export function summarizePayments(payments: Payment[]): PaymentsSummary {
	const approved = payments.filter((p) => p.status === 'approved');
	const last = approved
		.map((p) => p.applied_at ?? p.created_at)
		.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
	return {
		total_paid_in_cents: approved.reduce((sum, p) => sum + p.amount_in_cents, 0),
		approved_count: approved.length,
		last_paid_at: last ?? null
	};
}

export interface PaymentGroup {
	/** `2026-10`: clave estable para el `each`. */
	key: string;
	/** "Octubre de 2026". */
	label: string;
	payments: Payment[];
}

/** Agrupa por mes (hora de Colombia), del más reciente al más antiguo. */
export function groupPaymentsByMonth(payments: Payment[]): PaymentGroup[] {
	const keyFormat = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'America/Bogota',
		year: 'numeric',
		month: '2-digit'
	});
	const labelFormat = new Intl.DateTimeFormat('es-CO', {
		timeZone: 'America/Bogota',
		month: 'long',
		year: 'numeric'
	});
	const sorted = [...payments].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);
	const groups: PaymentGroup[] = [];
	for (const payment of sorted) {
		const date = new Date(payment.created_at);
		if (Number.isNaN(date.getTime())) continue;
		const key = keyFormat.format(date).slice(0, 7);
		let group = groups.find((g) => g.key === key);
		if (!group) {
			const label = labelFormat.format(date);
			group = { key, label: label.charAt(0).toUpperCase() + label.slice(1), payments: [] };
			groups.push(group);
		}
		group.payments.push(payment);
	}
	return groups;
}

/** Un pago pendiente cuyo link sigue vivo se puede retomar en Wompi. */
export function canResumePayment(payment: Payment, now = Date.now()): boolean {
	return (
		payment.status === 'pending' &&
		!payment.transaction_id &&
		new Date(payment.link_expires_at).getTime() > now &&
		isTrustedCheckoutUrl(payment.checkout_url)
	);
}

/** Medio de pago legible: `NEQUI` → "Nequi", `CARD` → "Tarjeta". */
export function paymentMethodLabel(method: string | null): string {
	switch ((method ?? '').toUpperCase()) {
		case 'CARD':
			return 'Tarjeta';
		case 'NEQUI':
			return 'Nequi';
		case 'PSE':
			return 'PSE';
		case 'BANCOLOMBIA_TRANSFER':
			return 'Transferencia Bancolombia';
		case 'BANCOLOMBIA_QR':
			return 'QR Bancolombia';
		case 'BANCOLOMBIA_COLLECT':
			return 'Corresponsal Bancolombia';
		case '':
			return '—';
		default:
			return method as string;
	}
}

/** Fecha y hora corta en Colombia: "28 oct 2026, 11:42 a. m.". */
export function formatDateTime(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat('es-CO', {
		timeZone: 'America/Bogota',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(date);
}
