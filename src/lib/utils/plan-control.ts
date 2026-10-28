import type { Subscription, SubscriptionPlan, UpcomingPeriod } from '$lib/api/portal';
import type { PlanId } from '$lib/data/pricing';
import { formatDate, planLabel } from '$lib/utils/subscription';

// ---------------------------------------------------------------------------
// Control de plan en el panel: qué puede hacer el dueño con cada plan.
//
// Espejo de `plan-policy.ts` de pos_api (que es quien manda: si el panel se
// equivocara, el API responde 409 y no se cobra nada). Aquí solo se decide qué
// botón y qué texto mostrar:
//
//   - Sin plan de pago vigente (prueba o vencida) → se paga y aplica ya.
//   - Con plan de pago vigente y un mes o más por delante → no se compra otro
//     encima; elegir otro plan lo PROGRAMA para el corte.
//   - En el último mes → se paga el siguiente período (renovación); sus días
//     van después del corte y, si es otro plan, arranca ese día.
// ---------------------------------------------------------------------------

/** Días antes del corte en que se abre la renovación. Espejo del API. */
export const RENEWAL_WINDOW_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type PlanCardAction =
	/** La prueba gratis es lo que tiene: nada que hacer. */
	| { kind: 'current_free' }
	/** Volver a gratis: retira una solicitud o cancela la renovación. */
	| { kind: 'cancel'; label: string }
	/** Ya canceló la renovación del plan vigente. */
	| { kind: 'canceled' }
	/** Paga y aplica ya. */
	| { kind: 'pay'; plan: PlanId }
	/** Paga el siguiente período: empieza en `starts_at`. */
	| { kind: 'renew'; plan: PlanId; starts_at: string; same_plan: boolean }
	/** Es su plan vigente y la renovación aún no abre. */
	| { kind: 'current'; renewal_opens_at: string | null }
	/** Es su plan vigente pero programó otro: puede quedarse en este. */
	| { kind: 'keep'; scheduled_plan: PlanId; effective_at: string }
	/** Otro plan: se programa para el corte. */
	| { kind: 'schedule'; plan: PlanId; effective_at: string }
	/** Este plan ya está programado para el corte. */
	| { kind: 'scheduled'; effective_at: string }
	/** Este plan ya está PAGADO para el siguiente período. */
	| { kind: 'paid_upcoming'; starts_at: string };

const isPaid = (plan: SubscriptionPlan | undefined): plan is PlanId =>
	plan === 'monthly' || plan === 'annual';

/** Hay un período PAGADO corriendo (no la prueba, no vencido). */
export function hasRunningPaidPeriod(subscription: Subscription | null, now = Date.now()): boolean {
	if (!subscription || !isPaid(subscription.plan)) return false;
	return new Date(subscription.expires_at).getTime() > now;
}

/**
 * ¿Se puede pagar ya? Lo dice el API (`can_pay_now`); si es un API anterior que
 * no lo manda, se deduce con la misma regla para no ofrecer un botón que luego
 * responda 409.
 */
export function canPayNow(subscription: Subscription | null, now = Date.now()): boolean {
	if (!subscription) return false;
	if (typeof subscription.can_pay_now === 'boolean') return subscription.can_pay_now;
	if (!hasRunningPaidPeriod(subscription, now)) return true;
	const expires = new Date(subscription.expires_at).getTime();
	return now > expires - RENEWAL_WINDOW_DAYS * MS_PER_DAY;
}

/** Desde cuándo se puede renovar (ISO), o `null` si ya se puede. */
export function renewalOpensAt(subscription: Subscription | null, now = Date.now()): string | null {
	if (!subscription || !hasRunningPaidPeriod(subscription, now)) return null;
	if (subscription.renewal_opens_at) return subscription.renewal_opens_at;
	const expires = new Date(subscription.expires_at).getTime();
	return new Date(expires - RENEWAL_WINDOW_DAYS * MS_PER_DAY).toISOString();
}

export function planCardAction(
	subscription: Subscription | null,
	upcoming: UpcomingPeriod | null | undefined,
	card: SubscriptionPlan,
	now = Date.now()
): PlanCardAction {
	const currentPlan = subscription?.plan ?? 'free';
	const running = hasRunningPaidPeriod(subscription, now);

	if (card === 'free') {
		if (currentPlan === 'free') return { kind: 'current_free' };
		if (running && subscription?.status === 'canceled') return { kind: 'canceled' };
		return { kind: 'cancel', label: running ? 'Cancelar renovación' : 'Volver a gratis' };
	}

	if (!subscription || !running) return { kind: 'pay', plan: card };

	const expires = subscription.expires_at;
	// Un período pagado de OTRO plan por empezar. Si es del mismo plan es solo
	// la continuación del vigente: esa tarjeta sigue siendo "plan actual".
	if (
		upcoming &&
		upcoming.plan === card &&
		card !== currentPlan &&
		new Date(upcoming.starts_at).getTime() > now
	) {
		return { kind: 'paid_upcoming', starts_at: upcoming.starts_at };
	}
	if (canPayNow(subscription, now)) {
		return { kind: 'renew', plan: card, starts_at: expires, same_plan: card === currentPlan };
	}

	const scheduled = subscription.scheduled_plan ?? null;
	if (card === currentPlan) {
		return scheduled && scheduled !== card
			? { kind: 'keep', scheduled_plan: scheduled, effective_at: expires }
			: { kind: 'current', renewal_opens_at: renewalOpensAt(subscription, now) };
	}
	if (card === scheduled) return { kind: 'scheduled', effective_at: expires };
	return { kind: 'schedule', plan: card, effective_at: expires };
}

export interface PlanChangeCopy {
	title: string;
	body: string;
	confirm: string;
}

/**
 * Lo que se le explica ANTES de programar o pagar un cambio con plan vigente.
 * Nadie debe salir creyendo que cambió de plan hoy, ni que perdió días.
 */
export function describePlanChange(
	subscription: Subscription,
	action: Extract<PlanCardAction, { kind: 'schedule' | 'renew' }>,
	price: string
): PlanChangeCopy {
	const current = planLabel(subscription.plan);
	const target = planLabel(action.plan);

	if (action.kind === 'schedule') {
		const effective = formatDate(action.effective_at);
		const opens = renewalOpensAt(subscription);
		return {
			title: `Cambiar a ${target}`,
			body:
				`Tu plan ${current} sigue activo hasta el ${effective}; no pierdes ningún día. ` +
				`El plan ${target} empieza ese día` +
				(opens ? ` y podrás pagarlo (${price}) desde el ${formatDate(opens)}.` : '.') +
				' Hoy no se cobra nada.',
			confirm: `Programar cambio a ${target}`
		};
	}

	const starts = formatDate(action.starts_at);
	return action.same_plan
		? {
				title: `Renovar plan ${target}`,
				body: `Pagas ${price} ahora y los días se suman al terminar tu período actual, el ${starts}. No pierdes ningún día.`,
				confirm: `Pagar ${price}`
			}
		: {
				title: `Cambiar a ${target}`,
				body: `Sigues con el plan ${current} hasta el ${starts}. Pagas ${price} ahora y el plan ${target} empieza ese día, con sus días sumados después del corte.`,
				confirm: `Pagar ${price}`
			};
}

/** Línea corta para el estado de la suscripción: qué viene después del corte. */
export function nextPeriodNote(
	subscription: Subscription | null,
	upcoming: UpcomingPeriod | null | undefined,
	now = Date.now()
): string | null {
	if (!subscription) return null;
	if (upcoming && new Date(upcoming.starts_at).getTime() > now) {
		return `Siguiente período pagado: plan ${planLabel(upcoming.plan)} del ${formatDate(
			upcoming.starts_at
		)} al ${formatDate(upcoming.ends_at)}.`;
	}
	if (hasRunningPaidPeriod(subscription, now) && subscription.scheduled_plan) {
		const opens = renewalOpensAt(subscription, now);
		return (
			`Cambio programado: pasas al plan ${planLabel(subscription.scheduled_plan)} el ${formatDate(
				subscription.expires_at
			)}.` +
			(opens && !canPayNow(subscription, now)
				? ` Podrás pagarlo desde el ${formatDate(opens)}.`
				: '')
		);
	}
	return null;
}
