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
}

export const getAccount = (token: string): Promise<PortalAccount> =>
	apiRequest<PortalAccount>('/portal/account', { token });

/**
 * Pide un plan. Un plan de pago queda PENDIENTE DE PAGO —el backend no asciende
 * nada por pedirlo—; `free` retira la solicitud o cancela la renovación.
 */
export const changePlan = (token: string, plan: SubscriptionPlan): Promise<Subscription> =>
	apiRequest<Subscription>('/portal/subscription/plan', {
		method: 'POST',
		token,
		body: { plan }
	});
