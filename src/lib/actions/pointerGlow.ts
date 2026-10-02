/**
 * `use:pointerGlow` — una luz suave sigue al cursor dentro de la sección y
 * expone la posición normalizada del puntero para que los orbes del fondo
 * deriven un poco tras él. Es la capa decorativa "que acompaña al cursor" que
 * pide el hero: leve, pero presente.
 *
 * Expone en el nodo (suavizadas con rAF, nunca instantáneas):
 *   --glow-x / --glow-y : px del centro de la luz (pintada por `.pointer-glow::before`)
 *   --glow-o            : 0..1 opacidad de la luz (fundido al entrar/salir)
 *   --px / --py         : −1..1 posición del puntero (para parallax de orbes)
 *
 * Decorativo y de marketing — justo donde Emil permite seguir al cursor. Se
 * apaga sin puntero fino o con prefers-reduced-motion.
 *
 * Uso: <section class="pointer-glow" use:pointerGlow>…</section>
 */
import { lerp, clamp, pointerToCenter, hasFinePointer, prefersReducedMotion } from '$lib/utils/motion';

interface PointerGlowOptions {
	/** Suavizado 0..1 por frame. Bajo = la luz va con retraso elegante. */
	ease?: number;
}

export function pointerGlow(node: HTMLElement, options: PointerGlowOptions = {}) {
	let { ease = 0.09 } = options;

	if (!hasFinePointer() || prefersReducedMotion()) return;

	let tx = 0;
	let ty = 0; // px objetivo de la luz
	let to = 0; // opacidad objetivo
	let tpx = 0;
	let tpy = 0; // puntero normalizado objetivo
	let cx = 0;
	let cy = 0;
	let co = 0;
	let cpx = 0;
	let cpy = 0;

	let raf = 0;
	let running = false;

	const render = () => {
		cx = lerp(cx, tx, ease);
		cy = lerp(cy, ty, ease);
		co = lerp(co, to, ease);
		cpx = lerp(cpx, tpx, ease);
		cpy = lerp(cpy, tpy, ease);

		node.style.setProperty('--glow-x', `${cx.toFixed(1)}px`);
		node.style.setProperty('--glow-y', `${cy.toFixed(1)}px`);
		node.style.setProperty('--glow-o', co.toFixed(3));
		node.style.setProperty('--px', cpx.toFixed(3));
		node.style.setProperty('--py', cpy.toFixed(3));

		if (
			Math.abs(cx - tx) < 0.3 &&
			Math.abs(cy - ty) < 0.3 &&
			Math.abs(co - to) < 0.004 &&
			Math.abs(cpx - tpx) < 0.002 &&
			Math.abs(cpy - tpy) < 0.002
		) {
			running = false;
			return;
		}
		raf = requestAnimationFrame(render);
	};

	const kick = () => {
		if (!running) {
			running = true;
			raf = requestAnimationFrame(render);
		}
	};

	const onMove = (e: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		tx = e.clientX - rect.left;
		ty = e.clientY - rect.top;
		to = 1;
		const c = pointerToCenter(e.clientX, e.clientY, rect);
		tpx = clamp(c.x, -1, 1);
		tpy = clamp(c.y, -1, 1);
		kick();
	};

	const onLeave = () => {
		to = 0;
		tpx = 0;
		tpy = 0;
		kick();
	};

	node.addEventListener('pointermove', onMove, { passive: true });
	node.addEventListener('pointerleave', onLeave);

	return {
		update(next: PointerGlowOptions) {
			ease = next.ease ?? ease;
		},
		destroy() {
			cancelAnimationFrame(raf);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
}
