import { browser } from '$app/environment';
import type { AuthUser } from '$lib/api/portal';

// ---------------------------------------------------------------------------
// La sesión del portal en la landing.
//
// Vive en `localStorage` porque el sitio es estático (no hay servidor propio
// que pueda poner una cookie de sesión) y el token que se guarda está acotado a
// `/portal/*`: aunque alguien lo robe, no abre el POS ni los datos del negocio.
// Ese acotamiento es lo que hace aceptable guardarlo aquí; con el token normal
// de la app no lo sería.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'placepos.portal.session';

export interface StoredSession {
	access_token: string;
	user: AuthUser;
}

/** Lee la sesión del almacenamiento. `null` si no hay o está corrupta. */
function readStored(): StoredSession | null {
	if (!browser) return null;

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as Partial<StoredSession>;
		// Validar la forma, no solo que exista: un `localStorage` a medio escribir
		// (o de una versión anterior) dejaría la página pintando `undefined`.
		if (typeof parsed?.access_token !== 'string' || !parsed.access_token) return null;
		if (!parsed.user || typeof parsed.user.email !== 'string') return null;

		return { access_token: parsed.access_token, user: parsed.user as AuthUser };
	} catch {
		return null;
	}
}

class SessionStore {
	#session = $state<StoredSession | null>(null);
	/**
	 * `false` hasta que se leyó el almacenamiento. Las páginas lo usan para no
	 * parpadear: sin esto, el panel muestra medio segundo de "no has iniciado
	 * sesión" a alguien que sí la tiene.
	 */
	#ready = $state(false);

	get current(): StoredSession | null {
		return this.#session;
	}

	get user(): AuthUser | null {
		return this.#session?.user ?? null;
	}

	get token(): string | null {
		return this.#session?.access_token ?? null;
	}

	get isAuthenticated(): boolean {
		return this.#session !== null;
	}

	get ready(): boolean {
		return this.#ready;
	}

	/** Carga desde `localStorage`. Se llama una vez, al montar el layout. */
	load(): void {
		this.#session = readStored();
		this.#ready = true;
	}

	set(session: StoredSession): void {
		this.#session = session;
		if (browser) {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
		}
	}

	clear(): void {
		this.#session = null;
		if (browser) {
			window.localStorage.removeItem(STORAGE_KEY);
		}
	}
}

export const session = new SessionStore();
