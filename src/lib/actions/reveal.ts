/**
 * `use:reveal` — revela un elemento al entrar en viewport añadiendo la clase
 * `is-in` (la transición vive en `.reveal` del CSS global). Un solo
 * IntersectionObserver compartido por nodo. Soporta delay escalonado.
 *
 * Uso:
 *   <div class="reveal" use:reveal>…</div>
 *   <div class="reveal" use:reveal={{ delay: 120 }}>…</div>
 */
interface RevealOptions {
	/** Retardo en ms antes de revelar (para stagger). */
	delay?: number;
	/** Umbral de visibilidad 0..1. */
	threshold?: number;
	/** Revelar una sola vez (default true). */
	once?: boolean;
}

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
	const { delay = 0, threshold = 0.15, once = true } = options;

	const prefersReduced =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (prefersReduced) {
		node.classList.add('is-in');
		return;
	}

	if (delay) node.style.transitionDelay = `${delay}ms`;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('is-in');
					if (once) observer.unobserve(node);
				} else if (!once) {
					node.classList.remove('is-in');
				}
			}
		},
		{ threshold, rootMargin: '0px 0px -8% 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
