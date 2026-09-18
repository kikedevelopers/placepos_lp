import type { Subscription, SubscriptionPlan, SubscriptionStatus } from '$lib/api/portal';

// ---------------------------------------------------------------------------
// Cómo se le cuenta al dueño el estado de su suscripción.
//
// Esta pantalla la abre alguien que muchas veces llega porque algo dejó de
// funcionarle. Un "vencida" seco no le dice qué hacer; saber que el pago rebotó
// —o que solo se le acabó la prueba— es la diferencia entre resolverlo en un
// clic y llamar a soporte. Por eso cada estado trae su propio texto y su propia
// acción, y no un único mensaje genérico.
// ---------------------------------------------------------------------------

export type Tone = 'good' | 'warn' | 'bad' | 'neutral';

export interface SubscriptionView {
	tone: Tone;
	/** Etiqueta corta del sello: "En prueba", "Activa", "Vencida"… */
	label: string;
	/** Frase principal: qué le está pasando. */
	headline: string;
	/** Segunda línea: el detalle con fechas o días. */
	detail: string;
	/** Qué se espera que haga. `null` cuando no hay nada que hacer. */
	action: 'choose_plan' | 'retry_payment' | 'reactivate' | null;
}

/** Nombre del plan tal como se le muestra al cliente. */
export const planLabel = (plan: SubscriptionPlan | undefined): string => {
	switch (plan) {
		case 'monthly':
			return 'Mensual';
		case 'annual':
			return 'Anual';
		case 'free':
		default:
			// Sin plan de pago la cuenta está en la prueba: "gratis" es el nombre
			// honesto de lo que tiene, y coincide con lo que el backend guarda.
			return 'Gratis';
	}
};

/** Fecha larga en español de Colombia: "25 de agosto de 2026". */
export const formatDate = (iso: string): string => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	return new Intl.DateTimeFormat('es-CO', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
};

/** "1 día" / "7 días". Evita el "1 días" que delata a un sistema descuidado. */
export const dayCount = (days: number): string => `${days} ${days === 1 ? 'día' : 'días'}`;

/**
 * Estado efectivo, tolerante a un pos_api de la versión anterior.
 *
 * Los campos `status`/`plan` son nuevos: si la landing se despliega antes que
 * el API, no llegan. En ese caso se deduce lo único que sí llega siempre
 * (`is_expired`), en vez de pintar "undefined" o romper la página entera.
 */
export const effectiveStatus = (subscription: Subscription): SubscriptionStatus =>
	subscription.status ?? (subscription.is_expired ? 'expired' : 'trialing');

export function describeSubscription(subscription: Subscription | null): SubscriptionView {
	if (!subscription) {
		return {
			tone: 'neutral',
			label: 'Sin datos',
			headline: 'No pudimos leer tu suscripción',
			detail: 'Escríbenos y lo revisamos contigo.',
			action: null
		};
	}

	const status = effectiveStatus(subscription);
	const expires = formatDate(subscription.expires_at);
	const requested = subscription.requested_plan;

	switch (status) {
		case 'trialing':
			return {
				tone: subscription.days_remaining <= 3 ? 'warn' : 'good',
				label: 'Prueba gratis',
				headline:
					subscription.days_remaining <= 3
						? 'Tu prueba está por terminar'
						: 'Estás en tu prueba gratuita',
				detail:
					subscription.days_remaining > 0
						? `Te ${subscription.days_remaining === 1 ? 'queda' : 'quedan'} ${dayCount(
								subscription.days_remaining
							)}, hasta el ${expires}.`
						: `Termina hoy, ${expires}.`,
				action: 'choose_plan'
			};

		case 'active':
			return {
				tone: 'good',
				label: 'Activa',
				headline: 'Tu plan está al día',
				detail: `Tu suscripción va hasta el ${expires}.`,
				action: null
			};

		case 'payment_pending':
			return {
				tone: subscription.is_expired ? 'bad' : 'warn',
				label: subscription.is_expired ? 'Vencida · pago sin procesar' : 'Pago pendiente',
				headline: subscription.is_expired
					? 'Tu suscripción venció y el pago no se ha procesado'
					: `Falta el pago de tu plan ${planLabel(requested ?? undefined)}`,
				detail: subscription.is_expired
					? 'Apenas confirmemos el pago, tu cuenta se reactiva sola.'
					: `Cuando confirmemos el pago, tu cuenta pasa al plan ${planLabel(
							requested ?? undefined
						)}.`,
				action: 'retry_payment'
			};

		case 'payment_failed':
			return {
				tone: 'bad',
				label: subscription.is_expired ? 'Vencida · error de pago' : 'Error de pago',
				headline: 'No pudimos procesar tu pago',
				detail: subscription.is_expired
					? `Tu suscripción venció el ${expires}. Reintenta el pago para reactivarla.`
					: `Reintenta el pago antes del ${expires} para no perder el acceso.`,
				action: 'retry_payment'
			};

		case 'canceled':
			return {
				tone: subscription.is_expired ? 'bad' : 'warn',
				label: subscription.is_expired ? 'Cancelada' : 'Cancelada · activa hasta el corte',
				headline: subscription.is_expired
					? 'Tu suscripción está cancelada y vencida'
					: 'Cancelaste la renovación',
				detail: subscription.is_expired
					? `Terminó el ${expires}. Puedes volver cuando quieras.`
					: `Puedes seguir usando PlacePos hasta el ${expires}.`,
				action: 'reactivate'
			};

		case 'expired':
		default:
			return {
				tone: 'bad',
				label: 'Vencida',
				headline: 'Tu suscripción venció',
				detail: `Terminó el ${expires}. Elige un plan para volver a entrar.`,
				action: 'choose_plan'
			};
	}
}
