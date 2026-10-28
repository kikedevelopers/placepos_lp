import { apiRequest } from './client';
import type { PlanId } from '$lib/data/pricing';

// ---------------------------------------------------------------------------
// Las llamadas que hace la landing a pos_api.
//
// Registro y activación son EXACTAMENTE los mismos endpoints que usa la app de
// escritorio: la cuenta que se crea aquí es la misma cuenta, con el mismo
// correo de bienvenida y la misma prueba. Lo único propio de la web es el
// portal (`/portal/*`), que existe para poder entrar a gestionar el plan
// incluso con la suscripción vencida.
// ---------------------------------------------------------------------------

export interface AuthUser {
	id: number;
	name: string;
	lastname: string;
	email: string;
	type: string;
}

export interface RegisterPayload {
	name: string;
	lastname: string;
	email: string;
	password: string;
	company_name: string;
}

export interface RegisterResult {
	activation_required: boolean;
	email: string;
	user: AuthUser;
}

/**
 * Crea la cuenta. NO devuelve sesión: la cuenta nace sin activar y el enlace
 * del correo es lo que la habilita.
 */
export const register = (payload: RegisterPayload): Promise<RegisterResult> =>
	apiRequest<RegisterResult>('/auth/register', { method: 'POST', body: payload });

export interface LoginResult {
	access_token: string;
	user: AuthUser;
}

export const portalLogin = (email: string, password: string): Promise<LoginResult> =>
	apiRequest<LoginResult>('/portal/auth/login', {
		method: 'POST',
		body: { email, password }
	});

/** Pide el correo con el enlace para cambiar la contraseña. */
export const requestPasswordReset = (email: string): Promise<{ sent: boolean; email: string }> =>
	apiRequest<{ sent: boolean; email: string }>('/auth/forgot-password', {
		method: 'POST',
		body: { email }
	});

/**
 * Estado de la suscripción tal como lo sirve pos_api.
 *
 * `status` ya viene cruzado con la vigencia: el backend es quien decide si un
 * vencimiento se cuenta como "se acabó la prueba" o "el pago no se procesó".
 */
export type SubscriptionStatus =
	| 'trialing'
	| 'active'
	| 'payment_pending'
	| 'payment_failed'
	| 'canceled'
	| 'expired';

export type SubscriptionPlan = 'free' | PlanId;

export interface Subscription {
	started_at: string;
	expires_at: string;
	days_total: number;
	days_used: number;
	days_remaining: number;
	progress: number;
	is_expired: boolean;
	/**
	 * Campos de plan. Opcionales a propósito: si la landing se despliega antes
	 * que el API, un pos_api de la versión anterior no los manda y la página
	 * tiene que degradarse, no reventar.
	 */
	plan?: SubscriptionPlan;
	status?: SubscriptionStatus;
	requested_plan?: SubscriptionPlan | null;
	plan_requested_at?: string | null;
	/**
	 * Control de plan. Con un plan de pago vigente no se compra otro encima:
	 * otro plan queda PROGRAMADO para el corte, y solo en el último mes se paga
	 * el siguiente período. Opcionales por la misma razón que los de arriba.
	 */
	scheduled_plan?: PlanId | null;
	plan_scheduled_at?: string | null;
	/** Desde cuándo se puede pagar el siguiente período (`null` = ya). */
	renewal_opens_at?: string | null;
	/** Se puede abrir un pago ahora mismo. */
	can_pay_now?: boolean;
}

/** Período YA PAGADO que todavía no empieza (renovación anticipada). */
export interface UpcomingPeriod {
	plan: PlanId;
	starts_at: string;
	ends_at: string;
}

export interface PortalAccount {
	user: {
		id: number;
		name: string;
		lastname: string;
		email: string;
		created_at: string;
	};
	company: {
		id: number;
		name: string;
		document_number: string | null;
		phone_number: string | null;
		created_at: string;
		branches_count: number;
	};
	subscription: Subscription | null;
	upcoming_period?: UpcomingPeriod | null;
}

export const getAccount = (token: string): Promise<PortalAccount> =>
	apiRequest<PortalAccount>('/portal/account', { token });

/** Una sede del negocio: su nombre y desde cuándo existe. */
export interface Branch {
	id: number;
	name: string;
	created_at: string;
	/** Marca la sede principal si el backend la distingue. */
	is_main?: boolean;
}

/**
 * Lista las sucursales del negocio. El panel solo conoce `branches_count`; para
 * decir CUÁLES son y desde cuándo existen hace falta esta llamada aparte, que se
 * dispara únicamente cuando el dueño abre el detalle (no en cada carga).
 *
 * Contrato esperado de pos_api: `GET /portal/account/branches` → `Branch[]`.
 */
export const getBranches = (token: string): Promise<Branch[]> =>
	apiRequest<Branch[]>('/portal/account/branches', { token });

/**
 * Pide un plan. Sin plan de pago vigente queda PENDIENTE DE PAGO —el backend no
 * asciende nada por pedirlo—; con plan de pago vigente queda PROGRAMADO para el
 * corte. `free` retira la solicitud o cancela la renovación.
 */
export const changePlan = (token: string, plan: SubscriptionPlan): Promise<Subscription> =>
	apiRequest<Subscription>('/portal/subscription/plan', {
		method: 'POST',
		token,
		body: { plan }
	});

// ---------------------------------------------------------------------------
// Pagos en línea (Wompi).
//
// La landing NUNCA decide el monto ni si un pago quedó aprobado: pide el link
// de pago a pos_api (que fija el precio) y, al volver del checkout, le pregunta
// a pos_api cómo quedó (pos_api a su vez lo verifica contra Wompi).
// ---------------------------------------------------------------------------

export type PaymentStatus =
	| 'pending'
	| 'approved'
	| 'declined'
	| 'voided'
	| 'error'
	| 'expired'
	| 'needs_review';

export interface Payment {
	reference: string;
	plan: PlanId;
	amount_in_cents: number;
	currency: string;
	days_granted: number;
	status: PaymentStatus;
	checkout_url: string;
	link_expires_at: string;
	transaction_id: string | null;
	payment_method_type: string | null;
	failure_reason: string | null;
	applied_at: string | null;
	period_starts_at?: string | null;
	period_ends_at: string | null;
	created_at: string;
}

/** Abre (o reutiliza) el link de pago del plan. */
export const createCheckout = (token: string, plan: PlanId): Promise<Payment> =>
	apiRequest<Payment>('/portal/payments/checkout', { method: 'POST', token, body: { plan } });

/**
 * Estado de un pago. Con `transaction_id` (el `?id=` que añade Wompi al volver)
 * pos_api lo verifica en el acto.
 */
export const confirmPayment = (
	token: string,
	reference: string,
	transaction_id?: string | null
): Promise<Payment> =>
	apiRequest<Payment>(`/portal/payments/${encodeURIComponent(reference)}/confirm`, {
		method: 'POST',
		token,
		body: transaction_id ? { transaction_id } : {}
	});

export const listPayments = (token: string): Promise<Payment[]> =>
	apiRequest<Payment[]>('/portal/payments', { token });
