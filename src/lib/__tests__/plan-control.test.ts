import { describe, it, expect } from 'vitest';
import type { Subscription, UpcomingPeriod } from '$lib/api/portal';
import {
	RENEWAL_WINDOW_DAYS,
	canPayNow,
	describePlanChange,
	hasRunningPaidPeriod,
	nextPeriodNote,
	planCardAction,
	renewalOpensAt
} from '$lib/utils/plan-control';

// ---------------------------------------------------------------------------
// Control de plan en el panel. Lo que se vigila: con un plan de pago vigente
// nunca se ofrece "Pagar" otro plan encima (el caso del anual que sumó otros
// 365 días), el cambio se PROGRAMA para el corte, y en el último mes se puede
// pagar la renovación.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-10-28T12:00:00.000Z').getTime();
const DAY = 24 * 60 * 60 * 1000;
const iso = (days: number): string => new Date(NOW + days * DAY).toISOString();

const sub = (overrides: Partial<Subscription> = {}): Subscription => ({
	started_at: iso(-300),
	expires_at: iso(400),
	days_total: 700,
	days_used: 300,
	days_remaining: 400,
	progress: 0.43,
	is_expired: false,
	plan: 'annual',
	status: 'active',
	requested_plan: null,
	plan_requested_at: null,
	scheduled_plan: null,
	plan_scheduled_at: null,
	renewal_opens_at: iso(370),
	can_pay_now: false,
	...overrides
});

describe('hasRunningPaidPeriod / canPayNow', () => {
	it('un plan de pago con días por delante está vigente; la prueba y el vencido no', () => {
		expect(hasRunningPaidPeriod(sub(), NOW)).toBe(true);
		expect(hasRunningPaidPeriod(sub({ plan: 'free' }), NOW)).toBe(false);
		expect(hasRunningPaidPeriod(sub({ expires_at: iso(-1) }), NOW)).toBe(false);
		expect(hasRunningPaidPeriod(null, NOW)).toBe(false);
	});

	it('manda lo que dice el API (can_pay_now)', () => {
		expect(canPayNow(sub({ can_pay_now: false }), NOW)).toBe(false);
		expect(canPayNow(sub({ can_pay_now: true }), NOW)).toBe(true);
	});

	it('con un API anterior (sin can_pay_now) lo deduce con la misma regla', () => {
		const legacy = (days: number, plan: Subscription['plan'] = 'annual') =>
			sub({ expires_at: iso(days), plan, can_pay_now: undefined, renewal_opens_at: undefined });
		expect(canPayNow(legacy(400), NOW)).toBe(false);
		expect(canPayNow(legacy(RENEWAL_WINDOW_DAYS), NOW)).toBe(false);
		expect(canPayNow(legacy(10), NOW)).toBe(true);
		expect(canPayNow(legacy(5, 'free'), NOW)).toBe(true);
		expect(canPayNow(null, NOW)).toBe(false);
	});

	it('renewalOpensAt: un mes antes del corte, o null si no hay plan pagado vigente', () => {
		expect(renewalOpensAt(sub({ renewal_opens_at: undefined }), NOW)).toBe(iso(370));
		expect(renewalOpensAt(sub({ plan: 'free' }), NOW)).toBeNull();
	});
});

describe('planCardAction · anual vigente con más de un mes (el caso reportado)', () => {
	it('la tarjeta Anual dice "plan actual", NO "Renovar"', () => {
		expect(planCardAction(sub(), null, 'annual', NOW)).toEqual({
			kind: 'current',
			renewal_opens_at: iso(370)
		});
	});

	it('la tarjeta Mensual PROGRAMA el cambio para el corte, no cobra', () => {
		expect(planCardAction(sub(), null, 'monthly', NOW)).toEqual({
			kind: 'schedule',
			plan: 'monthly',
			effective_at: iso(400)
		});
	});

	it('con el mensual programado: la Mensual dice "programado" y la Anual ofrece quedarse', () => {
		const s = sub({ scheduled_plan: 'monthly' });
		expect(planCardAction(s, null, 'monthly', NOW)).toEqual({
			kind: 'scheduled',
			effective_at: iso(400)
		});
		expect(planCardAction(s, null, 'annual', NOW)).toEqual({
			kind: 'keep',
			scheduled_plan: 'monthly',
			effective_at: iso(400)
		});
	});

	it('la tarjeta Gratis cancela la renovación (y si ya canceló, lo dice)', () => {
		expect(planCardAction(sub(), null, 'free', NOW)).toEqual({
			kind: 'cancel',
			label: 'Cancelar renovación'
		});
		expect(planCardAction(sub({ status: 'canceled' }), null, 'free', NOW)).toEqual({
			kind: 'canceled'
		});
	});
});

describe('planCardAction · último mes (renovación)', () => {
	const inWindow = sub({ expires_at: iso(10), can_pay_now: true, renewal_opens_at: iso(-20) });

	it('el mismo plan se renueva y sus días empiezan en el corte', () => {
		expect(planCardAction(inWindow, null, 'annual', NOW)).toEqual({
			kind: 'renew',
			plan: 'annual',
			starts_at: iso(10),
			same_plan: true
		});
	});

	it('otro plan se paga ya pero empieza en el corte', () => {
		expect(planCardAction(inWindow, null, 'monthly', NOW)).toMatchObject({
			kind: 'renew',
			plan: 'monthly',
			same_plan: false
		});
	});

	it('un período ya pagado del MISMO plan es continuación: la tarjeta sigue siendo "plan actual"', () => {
		const upcoming: UpcomingPeriod = { plan: 'annual', starts_at: iso(30), ends_at: iso(400) };
		expect(planCardAction(sub(), upcoming, 'annual', NOW)).toEqual({
			kind: 'current',
			renewal_opens_at: iso(370)
		});
	});

	it('un período ya pagado de ese plan se marca "ya pagado"', () => {
		const upcoming: UpcomingPeriod = { plan: 'monthly', starts_at: iso(10), ends_at: iso(40) };
		expect(planCardAction(inWindow, upcoming, 'monthly', NOW)).toEqual({
			kind: 'paid_upcoming',
			starts_at: iso(10)
		});
	});
});

describe('planCardAction · sin plan de pago vigente', () => {
	it('en la prueba se paga ya; la Gratis es "tu plan"', () => {
		const trial = sub({ plan: 'free', status: 'trialing', expires_at: iso(5), can_pay_now: true });
		expect(planCardAction(trial, null, 'annual', NOW)).toEqual({ kind: 'pay', plan: 'annual' });
		expect(planCardAction(trial, null, 'free', NOW)).toEqual({ kind: 'current_free' });
	});

	it('vencido se paga ya, incluso el mismo plan', () => {
		const expired = sub({ expires_at: iso(-3), is_expired: true, can_pay_now: true });
		expect(planCardAction(expired, null, 'annual', NOW)).toEqual({ kind: 'pay', plan: 'annual' });
		expect(planCardAction(expired, null, 'free', NOW)).toEqual({
			kind: 'cancel',
			label: 'Volver a gratis'
		});
	});

	it('sin suscripción leída, ofrece pagar (el API decide)', () => {
		expect(planCardAction(null, null, 'monthly', NOW)).toEqual({ kind: 'pay', plan: 'monthly' });
	});
});

describe('describePlanChange', () => {
	it('programar: dice hasta cuándo sigue el actual, cuándo empieza el nuevo y que hoy no se cobra', () => {
		const copy = describePlanChange(
			sub(),
			{ kind: 'schedule', plan: 'monthly', effective_at: iso(400) },
			'$50.000'
		);
		expect(copy.title).toBe('Cambiar a Mensual');
		expect(copy.body).toContain('Tu plan Anual sigue activo hasta el');
		expect(copy.body).toContain('no pierdes ningún día');
		expect(copy.body).toContain('Hoy no se cobra nada');
		expect(copy.body).toContain('$50.000');
		expect(copy.confirm).toBe('Programar cambio a Mensual');
	});

	it('renovar el mismo plan: paga ahora, los días al corte', () => {
		const copy = describePlanChange(
			sub({ expires_at: iso(10) }),
			{ kind: 'renew', plan: 'annual', starts_at: iso(10), same_plan: true },
			'$400.000'
		);
		expect(copy.title).toBe('Renovar plan Anual');
		expect(copy.body).toContain('al terminar tu período actual');
		expect(copy.confirm).toBe('Pagar $400.000');
	});

	it('renovar con otro plan: sigue con el actual hasta el corte', () => {
		const copy = describePlanChange(
			sub({ expires_at: iso(10) }),
			{ kind: 'renew', plan: 'monthly', starts_at: iso(10), same_plan: false },
			'$50.000'
		);
		expect(copy.body).toContain('Sigues con el plan Anual hasta el');
		expect(copy.body).toContain('el plan Mensual empieza ese día');
	});
});

describe('nextPeriodNote', () => {
	it('prioriza el período ya pagado', () => {
		const note = nextPeriodNote(
			sub({ scheduled_plan: 'monthly' }),
			{ plan: 'monthly', starts_at: iso(10), ends_at: iso(40) },
			NOW
		);
		expect(note).toMatch(/^Siguiente período pagado: plan Mensual del /);
	});

	it('si solo hay un cambio programado, dice cuándo y desde cuándo se paga', () => {
		const note = nextPeriodNote(sub({ scheduled_plan: 'monthly' }), null, NOW);
		expect(note).toMatch(/^Cambio programado: pasas al plan Mensual el /);
		expect(note).toContain('Podrás pagarlo desde el');
	});

	it('sin nada por delante no dice nada', () => {
		expect(nextPeriodNote(sub(), null, NOW)).toBeNull();
		expect(nextPeriodNote(null, null, NOW)).toBeNull();
		// Un período "por empezar" que ya empezó no se anuncia.
		expect(
			nextPeriodNote(sub(), { plan: 'monthly', starts_at: iso(-1), ends_at: iso(29) }, NOW)
		).toBeNull();
	});
});
