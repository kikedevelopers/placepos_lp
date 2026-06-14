/**
 * `use:parallax` — desplaza el elemento en Y según el scroll, relativo a su
 * posición NATURAL (sin transform). `speed` positivo = parallax clásico.
 *
 * Importante: medimos la posición base del elemento limpiando primero su
 * transform; si midiéramos con el transform aplicado, `getBoundingClientRect`
 * devolvería la posición ya desplazada y el efecto se auto-cancelaría (bug
 * típico de parallax). La base se recalcula en resize.
 *
 * Anima solo `transform` con rAF y listener pasivo (sin jank).
 *
 * Uso: <div use:parallax={{ speed: 0.3 }}>…</div>
 */
interface ParallaxOptions {
	/** Intensidad. ~0.1 sutil … ~0.5 marcado. */
	speed?: number;
	/** Eje. Por defecto 'y'. */
	axis?: 'x' | 'y';
}

export function parallax(node: HTMLElement, options: ParallaxOptions = {}) {
	let { speed = 0.2, axis = 'y' } = options;

	const prefersReduced =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (prefersReduced) return;

	let baseTop = 0;
	let height = 0;
	let ticking = false;
	let raf = 0;

	// Mide la posición del layout SIN el transform propio aplicado.
	const measure = () => {
		const prev = node.style.transform;
		node.style.transform = 'none';
		const rect = node.getBoundingClientRect();
		baseTop = rect.top + window.scrollY;
		height = rect.height;
		node.style.transform = prev;
	};

	const apply = () => {
		ticking = false;
		// Posición natural del centro del elemento dentro del viewport.
		const naturalCenter = baseTop - window.scrollY + height / 2;
		const offset = (naturalCenter - window.innerHeight / 2) * -speed;
		node.style.transform =
			axis === 'y' ? `translate3d(0,${offset.toFixed(2)}px,0)` : `translate3d(${offset.toFixed(2)}px,0,0)`;
	};

	const onScroll = () => {
		if (!ticking) {
			ticking = true;
			raf = requestAnimationFrame(apply);
		}
	};

	const onResize = () => {
		measure();
		apply();
	};

	node.style.willChange = 'transform';
	node.style.backfaceVisibility = 'hidden';
	measure();
	apply();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onResize, { passive: true });

	return {
		update(newOptions: ParallaxOptions) {
			speed = newOptions.speed ?? speed;
			axis = newOptions.axis ?? axis;
			apply();
		},
		destroy() {
			cancelAnimationFrame(raf);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
		}
	};
}
