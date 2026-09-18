import { dev } from '$app/environment';
import { SITE } from '$lib/data/site';

// ---------------------------------------------------------------------------
// Cliente HTTP contra pos_api.
//
// El API responde SIEMPRE con el mismo sobre: `{ success, payload }` cuando
// sale bien y `{ success: false, error, payload?: { code } }` cuando no. Aquí
// se desenvuelve una sola vez para que ninguna página vuelva a escribir
// `data.payload.algo` a mano, y sobre todo para que los errores lleguen a la UI
// como un objeto con forma conocida: un `catch` que a veces recibe un Error, a
// veces un string y a veces un objeto es la receta para pintar "[object
// Object]" en la cara del usuario.
// ---------------------------------------------------------------------------

/** Error normalizado de la API. Todo fallo —de red o del servidor— llega así. */
export class ApiError extends Error {
	/** Status HTTP. `0` cuando ni siquiera se pudo contactar al servidor. */
	readonly status: number;
	/** Código estable del backend (`EMAIL_TAKEN`, `ACCOUNT_NOT_ACTIVATED`, …). */
	readonly code: string | null;

	constructor(message: string, status: number, code: string | null = null) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
	}
}

interface ApiEnvelope<T> {
	success?: boolean;
	payload?: T;
	error?: string;
	message?: string;
}

/** Texto solo si es un string con contenido. Defensa contra pintar objetos. */
const safeText = (value: unknown): string | null =>
	typeof value === 'string' && value.trim() ? value : null;

/**
 * Mensaje para un fallo de red. En desarrollo dice A DÓNDE se intentó llamar:
 * casi siempre es el API apagado o su CORS sin el origen de la landing, y
 * "revisa tu conexión" manda a buscar donde no es.
 */
const networkErrorMessage = (): string =>
	dev
		? `No se pudo contactar a ${SITE.apiUrl}. ¿Está levantado el API y su CORS incluye ${
				typeof window === 'undefined' ? 'esta landing' : window.location.origin
			}?`
		: 'No pudimos contactar al servidor. Revisa tu conexión e intenta de nuevo.';

export interface ApiRequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: unknown;
	/** JWT a mandar como `Authorization: Bearer`. */
	token?: string | null;
}

/**
 * Llama a pos_api y devuelve el `payload` ya desenvuelto.
 *
 * Lanza `ApiError` en cualquier fallo: de red, de validación o de negocio.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
	const { method = 'GET', body, token } = options;

	let response: Response;
	try {
		response = await fetch(`${SITE.apiUrl}${path}`, {
			method,
			headers: {
				'content-type': 'application/json',
				...(token ? { authorization: `Bearer ${token}` } : {})
			},
			...(body === undefined ? {} : { body: JSON.stringify(body) })
		});
	} catch {
		throw new ApiError(networkErrorMessage(), 0);
	}

	const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

	if (!response.ok || envelope?.success === false) {
		const code =
			envelope?.payload && typeof envelope.payload === 'object'
				? ((envelope.payload as { code?: unknown }).code ?? null)
				: null;

		throw new ApiError(
			safeText(envelope?.error) ??
				safeText(envelope?.message) ??
				'Ocurrió un error inesperado. Intenta de nuevo.',
			response.status,
			typeof code === 'string' ? code : null
		);
	}

	return envelope?.payload as T;
}
