/**
 * `use:countUp` — anima un número de 0 al valor objetivo cuando entra en
 * viewport. Respeta prefers-reduced-motion (pinta el valor final al instante).
 *
 * Uso: <span use:countUp={{ to: 1240, suffix: '+' }}>0</span>
 */
interface CountUpOptions {
	to: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function countUp(node: HTMLElement, options: CountUpOptions) {
	const { to, duration = 1800, prefix = '', suffix = '', decimals = 0 } = options;

	const format = (n: number) =>
		`${prefix}${n.toLocaleString('es-CO', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		})}${suffix}`;

	const prefersReduced =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (prefersReduced) {
		node.textContent = format(to);
		return;
	}

	let started = false;
	let raf = 0;

	const run = () => {
		const start = performance.now();
		const tick = (now: number) => {
			const p = Math.min((now - start) / duration, 1);
			node.textContent = format(to * easeOutExpo(p));
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	};

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting && !started) {
					started = true;
					run();
					observer.unobserve(node);
				}
			}
		},
		{ threshold: 0.6 }
	);

	node.textContent = format(0);
	observer.observe(node);

	return {
		destroy() {
			cancelAnimationFrame(raf);
			observer.disconnect();
		}
	};
}
