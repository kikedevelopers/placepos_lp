import { describe, it, expect } from 'vitest';
import type { Subscription } from '$lib/api/portal';
import {
	dayCount,
	describeSubscription,
	effectiveStatus,
	formatDate,
	periodSummary,
	planLabel
} from '$lib/utils/subscription';

// ---------------------------------------------------------------------------
// Lo que el panel le dice al dueño sobre su suscripción.
//
// Esta pantalla la abre, muchas veces, alguien a quien la app dejó de
// funcionarle. Decirle "vencida" cuando lo que pasó es que su pago rebotó lo
// manda a llamar a soporte en vez de a reintentar el cobro; y decirle "pago
// pendiente" cuando solo se le acabó la prueba lo deja esperando un cobro que
// nadie va a hacer. Cada estado tiene que contar su propia historia.
// ---------------------------------------------------------------------------

const build = (overrides: Partial<Subscription> = {}): Subscription => ({
	started_at: '2026-08-05T12:00:00.000Z',
	expires_at: '2026-08-25T12:00:00.000Z',
	days_total: 20,
	days_used: 10,
	days_remaining: 10,
	progress: 0.5,
	is_expired: false,
	plan: 'free',
	status: 'trialing',
	requested_plan: null,
	plan_requested_at: null,
	...overrides
});

describe('nombres de plan', () => {
	it('traduce los tres planes', () => {
		expect(planLabel('free')).toBe('Gratis');
		expect(planLabel('monthly')).toBe('Mensual');
		expect(planLabel('annual')).toBe('Anual');
	});

	it('un plan ausente se lee como Gratis, no como vacío', () => {
		// pos_api de la versión anterior no manda el campo. "Gratis" es lo que
		// esa cuenta realmente tiene; un hueco en la pantalla no dice nada.
		expect(planLabel(undefined)).toBe('Gratis');
	});
});

describe('formato', () => {
	it('escribe la fecha en español', () => {
		expect(formatDate('2026-08-25T12:00:00.000Z')).toContain('agosto');
		expect(formatDate('2026-08-25T12:00:00.000Z')).toContain('2026');
	});

	it('una fecha inválida no rompe la página', () => {
		expect(formatDate('no-es-fecha')).toBe('');
	});

	it('nunca escribe "1 días"', () => {
		expect(dayCount(1)).toBe('1 día');
		expect(dayCount(0)).toBe('0 días');
		expect(dayCount(7)).toBe('7 días');
	});
});

describe('estado efectivo con un API de la versión anterior', () => {
	it('sin `status`, una suscripción vigente se lee como prueba', () => {
		const sub = build({ status: undefined, is_expired: false });
		expect(effectiveStatus(sub)).toBe('trialing');
	});

	it('sin `status`, una vencida se lee como vencida', () => {
		const sub = build({ status: undefined, is_expired: true });
		expect(effectiveStatus(sub)).toBe('expired');
	});

	it('la pantalla se pinta igual sin los campos nuevos', () => {
		const view = describeSubscription(
			build({ status: undefined, plan: undefined, requested_plan: undefined })
		);
		expect(view.label).toBe('Prueba gratis');
		expect(view.detail).not.toContain('undefined');
	});
});

describe('prueba gratuita', () => {
	it('con días de sobra se ve tranquila', () => {
		const view = describeSubscription(build({ days_remaining: 10 }));
		expect(view.tone).toBe('good');
		expect(view.label).toBe('Prueba gratis');
		expect(view.detail).toContain('10 días');
		expect(view.action).toBe('choose_plan');
	});

	it('en los últimos días avisa', () => {
		const view = describeSubscription(build({ days_remaining: 2 }));
		expect(view.tone).toBe('warn');
		expect(view.headline).toMatch(/por terminar/i);
	});

	it('con un solo día lo dice en singular', () => {
		const view = describeSubscription(build({ days_remaining: 1 }));
		expect(view.detail).toContain('Te queda 1 día');
	});

	it('el último día no dice "te quedan 0 días"', () => {
		const view = describeSubscription(build({ days_remaining: 0 }));
		expect(view.detail).toMatch(/^Termina hoy/);
	});
});

describe('plan activo', () => {
	it('no pide nada al que está al día', () => {
		const view = describeSubscription(
			build({ plan: 'annual', status: 'active', days_remaining: 300 })
		);
		expect(view.tone).toBe('good');
		expect(view.label).toBe('Activa');
		expect(view.action).toBeNull();
	});
});

describe('pago pendiente', () => {
	it('vigente: dice qué plan falta pagar', () => {
		const view = describeSubscription(
			build({ status: 'payment_pending', requested_plan: 'annual' })
		);
		expect(view.tone).toBe('warn');
		expect(view.label).toBe('Pago pendiente');
		expect(view.headline).toContain('Anual');
		expect(view.action).toBe('retry_payment');
	});

	it('vencida: dice que venció Y por qué', () => {
		const view = describeSubscription(
			build({ status: 'payment_pending', requested_plan: 'monthly', is_expired: true })
		);
		expect(view.tone).toBe('bad');
		expect(view.label).toContain('pago sin procesar');
		expect(view.action).toBe('retry_payment');
	});
});

describe('error de pago', () => {
	it('vigente: pide reintentar antes del corte', () => {
		const view = describeSubscription(build({ status: 'payment_failed', plan: 'monthly' }));
		expect(view.tone).toBe('bad');
		expect(view.headline).toMatch(/no pudimos procesar tu pago/i);
		expect(view.detail).toMatch(/antes del/i);
	});

	it('vencida: el motivo sobrevive al vencimiento', () => {
		const view = describeSubscription(
			build({ status: 'payment_failed', plan: 'monthly', is_expired: true })
		);
		expect(view.label).toContain('error de pago');
		expect(view.detail).toMatch(/reactivarla/i);
	});
});

describe('cancelada', () => {
	it('antes del corte deja claro que sigue funcionando', () => {
		const view = describeSubscription(build({ status: 'canceled', plan: 'annual' }));
		expect(view.tone).toBe('warn');
		expect(view.detail).toMatch(/puedes seguir usando/i);
		expect(view.action).toBe('reactivate');
	});

	it('después del corte no promete servicio', () => {
		const view = describeSubscription(
			build({ status: 'canceled', plan: 'annual', is_expired: true })
		);
		expect(view.tone).toBe('bad');
		expect(view.detail).not.toMatch(/puedes seguir usando/i);
	});
});

describe('resumen de período (sin lenguaje de prueba)', () => {
	it('dice cuánto lleva y cuánto queda, nunca "prueba"', () => {
		const p = periodSummary(build({ days_used: 183, days_remaining: 91, days_total: 274, progress: 0.668 }));
		expect(p.elapsedLabel).toBe('Llevas 183 días');
		expect(p.remainingLabel).toBe('Te quedan 91 días');
		expect(p.percent).toBe(67);
		// La promesa central del rediseño: el período no se llama prueba.
		expect(`${p.elapsedLabel} ${p.remainingLabel}`.toLowerCase()).not.toContain('prueba');
	});

	it('usa singular con un solo día restante', () => {
		const p = periodSummary(build({ days_remaining: 1 }));
		expect(p.remainingLabel).toBe('Te queda 1 día');
	});

	it('en el corte no dice "te quedan 0 días"', () => {
		const p = periodSummary(build({ days_remaining: 0 }));
		expect(p.remainingLabel).toBe('Llegó al corte hoy');
	});

	it('deriva el porcentaje de los días si no llega `progress`', () => {
		const p = periodSummary(build({ days_used: 5, days_remaining: 5, days_total: 10, progress: undefined as unknown as number }));
		expect(p.percent).toBe(50);
	});

	it('acota el avance entre 0 y 100 aunque el backend mande basura', () => {
		expect(periodSummary(build({ progress: 1.8 })).percent).toBe(100);
		expect(periodSummary(build({ progress: -0.5 })).percent).toBe(0);
	});
});

describe('vencida y sin datos', () => {
	it('la prueba que se acabó manda a elegir plan', () => {
		const view = describeSubscription(build({ status: 'expired', is_expired: true }));
		expect(view.tone).toBe('bad');
		expect(view.label).toBe('Vencida');
		expect(view.action).toBe('choose_plan');
	});

	it('sin suscripción no inventa un estado', () => {
		const view = describeSubscription(null);
		expect(view.tone).toBe('neutral');
		expect(view.action).toBeNull();
		expect(view.headline).toMatch(/no pudimos leer/i);
	});
});
