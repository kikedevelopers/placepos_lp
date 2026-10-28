import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Payment } from '$lib/api/portal';
import { PRICING } from '$lib/data/pricing';
import {
	MAX_POLL_ATTEMPTS,
	canResumePayment,
	describePayment,
	filterPayments,
	formatDateTime,
	groupPaymentsByMonth,
	paymentMethodLabel,
	summarizePayments,
	forgetIntendedPlan,
	formatAmount,
	isFinalPayment,
	isPayablePlan,
	isTrustedCheckoutUrl,
	pollDelayMs,
	readIntendedPlan,
	readReturnParams,
	rememberIntendedPlan
} from '$lib/utils/payment';

// ---------------------------------------------------------------------------
// El pago en línea, visto desde la landing. Lo que se vigila: que nunca diga
// "pagaste" sin que pos_api lo haya confirmado, que no mande al cliente a pagar
// fuera de Wompi y que el plan elegido sobreviva al rodeo del registro.
// ---------------------------------------------------------------------------

const REF = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';

const build = (overrides: Partial<Payment> = {}): Payment => ({
	reference: REF,
	plan: 'annual',
	amount_in_cents: 40_000_000,
	currency: 'COP',
	days_granted: 365,
	status: 'pending',
	checkout_url: 'https://checkout.wompi.co/l/abc',
	link_expires_at: '2026-10-29T15:00:00.000Z',
	transaction_id: null,
	payment_method_type: null,
	failure_reason: null,
	applied_at: null,
	period_ends_at: null,
	created_at: '2026-10-28T15:00:00.000Z',
	...overrides
});

function memoryStorage() {
	const data = new Map<string, string>();
	return {
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		removeItem: (k: string) => void data.delete(k),
		data
	};
}

describe('readReturnParams', () => {
	it('lee la referencia y el id de la transacción que añade Wompi', () => {
		expect(readReturnParams(`?ref=${REF}&id=1132-903100443-27458`)).toEqual({
			reference: REF,
			transaction_id: '1132-903100443-27458'
		});
	});

	it('sin id (volvió sin pagar o Wompi no lo añadió): solo la referencia', () => {
		expect(readReturnParams(`?ref=${REF}`)).toEqual({ reference: REF, transaction_id: null });
	});

	it('descarta valores con forma inválida (no se mandan al API)', () => {
		expect(readReturnParams('?ref=../../admin&id=<script>')).toEqual({
			reference: null,
			transaction_id: null
		});
		expect(readReturnParams('')).toEqual({ reference: null, transaction_id: null });
	});
});

describe('isTrustedCheckoutUrl', () => {
	it('solo acepta el checkout oficial de Wompi por https', () => {
		expect(isTrustedCheckoutUrl('https://checkout.wompi.co/l/abc')).toBe(true);
		expect(isTrustedCheckoutUrl('http://checkout.wompi.co/l/abc')).toBe(false);
		expect(isTrustedCheckoutUrl('https://checkout.wompi.co.evil.com/l/abc')).toBe(false);
		expect(isTrustedCheckoutUrl('https://evil.com/?https://checkout.wompi.co')).toBe(false);
		expect(isTrustedCheckoutUrl('javascript:alert(1)')).toBe(false);
		expect(isTrustedCheckoutUrl('no es url')).toBe(false);
	});
});

describe('describePayment', () => {
	it('aprobado: dice cuánto se recibió, cuántos días y hasta cuándo', () => {
		const view = describePayment(
			build({ status: 'approved', period_ends_at: '2027-10-28T15:00:00.000Z' })
		);
		expect(view.tone).toBe('good');
		expect(view.headline).toMatch(/Anual está activo/);
		expect(view.detail).toMatch(/365 días/);
		expect(view.detail).toMatch(/400\.000/);
		expect(view.can_retry).toBe(false);
	});

	it('pendiente: NUNCA dice que ya pagó, y explica que puede cerrar', () => {
		const view = describePayment(build({ status: 'pending' }));
		expect(view.headline).not.toMatch(/Listo|activo/);
		expect(view.detail).toMatch(/cerrar/);
		expect(view.can_retry).toBe(false);
	});

	it('rechazado: muestra el motivo del banco, aclara que no se cobró y ofrece reintentar', () => {
		const view = describePayment(
			build({ status: 'declined', failure_reason: 'Tu banco rechazó la transacción.' })
		);
		expect(view.tone).toBe('bad');
		expect(view.detail).toMatch(/Tu banco rechazó/);
		expect(view.detail).toMatch(/No se te cobró/);
		expect(view.can_retry).toBe(true);
	});

	it.each(['voided', 'error'] as const)('%s: no procesado y reintentable', (status) => {
		const view = describePayment(build({ status }));
		expect(view.label).toBe('Pago no procesado');
		expect(view.can_retry).toBe(true);
	});

	it('vencido: ofrece generar otro link', () => {
		expect(describePayment(build({ status: 'expired' })).can_retry).toBe(true);
	});

	it('en revisión: le dice que NO pague de nuevo (evita doble cobro)', () => {
		const view = describePayment(build({ status: 'needs_review' }));
		expect(view.detail).toMatch(/no tienes que volver a pagar/);
		expect(view.can_retry).toBe(false);
	});
});

describe('consultas mientras está pendiente', () => {
	it('solo "pending" sigue cambiando solo', () => {
		expect(isFinalPayment('pending')).toBe(false);
		for (const s of [
			'approved',
			'declined',
			'voided',
			'error',
			'expired',
			'needs_review'
		] as const) {
			expect(isFinalPayment(s)).toBe(true);
		}
	});

	it('la pausa crece y el tope existe (no martilla el API para siempre)', () => {
		expect(pollDelayMs(0)).toBe(3_000);
		expect(pollDelayMs(12)).toBe(6_000);
		expect(pollDelayMs(40)).toBe(15_000);
		expect(MAX_POLL_ATTEMPTS).toBeGreaterThan(10);
	});
});

describe('plan elegido en precios', () => {
	it('se recuerda y se recupera', () => {
		const storage = memoryStorage();
		rememberIntendedPlan(storage, 'annual', 1_000);
		expect(readIntendedPlan(storage, 2_000)).toBe('annual');
		forgetIntendedPlan(storage);
		expect(readIntendedPlan(storage)).toBeNull();
	});

	it('no guarda planes que no se pagan ni basura', () => {
		const storage = memoryStorage();
		rememberIntendedPlan(storage, 'free');
		rememberIntendedPlan(storage, '<script>');
		rememberIntendedPlan(storage, null);
		expect(storage.data.size).toBe(0);
	});

	it('caduca a los 3 días', () => {
		const storage = memoryStorage();
		rememberIntendedPlan(storage, 'monthly', 0);
		expect(readIntendedPlan(storage, 3 * 24 * 60 * 60 * 1000 + 1)).toBeNull();
	});

	it('un valor corrupto o sin almacenamiento no revienta', () => {
		const storage = memoryStorage();
		storage.setItem('placepos.intended_plan', '{no json');
		expect(readIntendedPlan(storage)).toBeNull();
		storage.setItem('placepos.intended_plan', JSON.stringify({ plan: 'gold', at: 1 }));
		expect(readIntendedPlan(storage, 2)).toBeNull();
		expect(readIntendedPlan(null)).toBeNull();
		expect(() => rememberIntendedPlan(null, 'annual')).not.toThrow();
	});

	it('isPayablePlan', () => {
		expect(isPayablePlan('monthly')).toBe(true);
		expect(isPayablePlan('annual')).toBe(true);
		expect(isPayablePlan('free')).toBe(false);
		expect(isPayablePlan(undefined)).toBe(false);
	});
});

describe('formatAmount', () => {
	it('convierte centavos a pesos', () => {
		expect(formatAmount(40_000_000)).toMatch(/400\.000/);
		expect(formatAmount(5_000_000)).toMatch(/50\.000/);
	});
});

describe('precios publicados = precios cobrados', () => {
	// La landing MUESTRA el precio; pos_api lo COBRA. Si alguien cambia uno y no
	// el otro, el cliente vería un precio y Wompi le cobraría otro.
	const backend = resolve(
		__dirname,
		'../../../../pos_api/src/modules/billing/billing.constants.ts'
	);

	it.skipIf(!existsSync(backend))('coinciden con PAID_PLAN_TERMS de pos_api', () => {
		const source = readFileSync(backend, 'utf8');
		const prices = [...source.matchAll(/price_cop:\s*([\d_]+)/g)].map((m) =>
			Number(m[1].replace(/_/g, ''))
		);
		expect(prices).toEqual([PRICING.monthly_price, PRICING.annual_price]);
	});
});

describe('describePayment · renovación anticipada', () => {
	it('si lo pagado empieza después, NO dice "está activo": dice cuándo empieza', () => {
		const view = describePayment(
			build({
				status: 'approved',
				applied_at: '2026-10-28T12:00:00.000Z',
				period_starts_at: '2027-12-31T05:00:00.000Z',
				period_ends_at: '2028-01-30T05:00:00.000Z'
			}),
			new Date('2026-10-28T12:00:00.000Z').getTime()
		);
		expect(view.headline).toBe('¡Listo! Pagaste tu plan Anual');
		expect(view.detail).toContain('empiezan el');
		expect(view.detail).toContain('al terminar tu período actual');
	});
});

describe('vista de pagos', () => {
	const list: Payment[] = [
		build({
			reference: 'a',
			status: 'approved',
			amount_in_cents: 40_000_000,
			created_at: '2026-10-28T15:00:00.000Z',
			applied_at: '2026-10-28T15:01:00.000Z'
		}),
		build({
			reference: 'b',
			status: 'declined',
			amount_in_cents: 5_000_000,
			created_at: '2026-10-20T15:00:00.000Z'
		}),
		build({
			reference: 'c',
			status: 'approved',
			amount_in_cents: 5_000_000,
			created_at: '2026-09-02T15:00:00.000Z',
			applied_at: '2026-09-02T15:01:00.000Z'
		}),
		build({ reference: 'd', status: 'pending', created_at: '2026-10-01T03:00:00.000Z' })
	];

	it('filtra aprobados y sin completar (todo lo que no es aprobado)', () => {
		expect(filterPayments(list, 'all')).toHaveLength(4);
		expect(filterPayments(list, 'approved').map((p) => p.reference)).toEqual(['a', 'c']);
		expect(filterPayments(list, 'unfinished').map((p) => p.reference)).toEqual(['b', 'd']);
	});

	it('el total suma SOLO lo aprobado y el último pago es el aprobado más reciente', () => {
		expect(summarizePayments(list)).toEqual({
			total_paid_in_cents: 45_000_000,
			approved_count: 2,
			last_paid_at: '2026-10-28T15:01:00.000Z'
		});
		expect(summarizePayments([])).toEqual({
			total_paid_in_cents: 0,
			approved_count: 0,
			last_paid_at: null
		});
	});

	it('agrupa por mes en hora de Colombia, del más reciente al más antiguo', () => {
		const groups = groupPaymentsByMonth(list);
		expect(groups.map((g) => g.key)).toEqual(['2026-10', '2026-09']);
		expect(groups[0].label).toBe('Octubre de 2026');
		expect(groups[0].payments.map((p) => p.reference)).toEqual(['a', 'b']);
		// 1-oct 03:00 UTC es 30-sep 22:00 en Bogotá: va en septiembre.
		expect(groups[1].payments.map((p) => p.reference)).toEqual(['d', 'c']);
		expect(groupPaymentsByMonth([build({ created_at: 'no-es-fecha' })])).toEqual([]);
	});

	it('solo se retoma un pendiente sin transacción, con link vivo y de Wompi', () => {
		const now = new Date('2026-10-28T12:00:00.000Z').getTime();
		const alive = '2026-10-29T12:00:00.000Z';
		expect(canResumePayment(build({ link_expires_at: alive }), now)).toBe(true);
		expect(canResumePayment(build({ link_expires_at: '2026-10-27T12:00:00.000Z' }), now)).toBe(
			false
		);
		expect(canResumePayment(build({ link_expires_at: alive, transaction_id: 'TX' }), now)).toBe(
			false
		);
		expect(canResumePayment(build({ link_expires_at: alive, status: 'approved' }), now)).toBe(
			false
		);
		expect(
			canResumePayment(build({ link_expires_at: alive, checkout_url: 'https://evil.co/l/x' }), now)
		).toBe(false);
	});

	it('nombra los medios de pago de Wompi', () => {
		expect(paymentMethodLabel('NEQUI')).toBe('Nequi');
		expect(paymentMethodLabel('CARD')).toBe('Tarjeta');
		expect(paymentMethodLabel(null)).toBe('—');
		expect(paymentMethodLabel('DAVIPLATA')).toBe('DAVIPLATA');
	});

	it('formatDateTime devuelve vacío ante una fecha inválida', () => {
		expect(formatDateTime('x')).toBe('');
		expect(formatDateTime('2026-10-28T15:00:00.000Z')).toContain('2026');
	});
});
