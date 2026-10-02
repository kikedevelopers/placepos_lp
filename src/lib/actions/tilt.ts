/**
 * `use:tilt` — inclina la tarjeta en 3D siguiendo al cursor y enciende un
 * foco de luz bajo el puntero. El efecto decorativo que pide una landing
 * premium, construido con las reglas de Emil/Apple:
 *
 *  - Solo `transform` (en el nodo, directo — nunca una CSS var heredada que
 *    recalcule a todos los hijos cada frame) + opacidad del foco.
 *  - El valor NO salta al puntero: un rAF suaviza current→target (lerp), así
 *    el movimiento tiene inercia y se puede interrumpir sin costura.
 *  - Nace de la posición actual al reentrar, y vuelve a reposo al salir.
 *  - Se apaga entero sin puntero fino (dedo) o con prefers-reduced-motion:
 *    ahí no hay cursor que seguir y el movimiento solo molesta.
 *
 * El foco se pinta en CSS con `.tilt-spot::before` leyendo
 * `--spot-x/--spot-y/--spot-o`; el nodo marca `data-tilt` para engancharlo.
 *
 * Uso: <article class="tilt-spot" use:tilt>…</article>
 *      <article class="tilt-spot" use:tilt={{ max: 4, scale: 1.01 }}>…</article>
 */
import { clamp, lerp, pointerToCenter, pointerToFraction, hasFinePointer, prefersReducedMotion } from '$lib/utils/motion';

interface TiltOptions {
	/** Inclinación máxima en grados (cada eje). Sutil por defecto. */
	max?: number;
	/** Escala al pasar el cursor. 1 = sin escala. */
	scale?: number;
	/** Perspectiva en px. Más alto = efecto más plano. */
	perspective?: number;
	/** Suavizado 0..1 por frame. Más bajo = más inercia. */
	ease?: number;
	/** Pintar el foco de luz bajo el cursor. */
	glow?: boolean;
}

export function tilt(node: HTMLElement, options: TiltOptions = {}) {
	let { max = 5, scale = 1.012, perspective = 900, ease = 0.12, glow = true } = options;

	// Sin cursor real o con movimiento reducido no hay nada que seguir.
	if (!hasFinePointer() || prefersReducedMotion()) return;

	node.dataset.tilt = '';
	node.style.transformStyle = 'preserve-3d';
	node.style.willChange = 'transform';

	// `cur` persigue a `target`; el foco (`sx/sy/so`) hace lo mismo.
	let targetX = 0;
	let targetY = 0;
	let targetScale = 1;
	let targetO = 0;
	let curX = 0;
	let curY = 0;
	let curScale = 1;
	let curO = 0;
	let sx = 0.5;
	let sy = 0.5;
	let csx = 0.5;
	let csy = 0.5;

	let raf = 0;
	let running = false;

	const render = () => {
		curX = lerp(curX, targetX, ease);
		curY = lerp(curY, targetY, ease);
		curScale = lerp(curScale, targetScale, ease);
		curO = lerp(curO, targetO, ease);
		csx = lerp(csx, sx, ease);
		csy = lerp(csy, sy, ease);

		node.style.transform =
			`perspective(${perspective}px) rotateX(${curY.toFixed(3)}deg) rotateY(${curX.toFixed(3)}deg) scale(${curScale.toFixed(4)})`;

		if (glow) {
			node.style.setProperty('--spot-x', `${(csx * 100).toFixed(2)}%`);
			node.style.setProperty('--spot-y', `${(csy * 100).toFixed(2)}%`);
			node.style.setProperty('--spot-o', curO.toFixed(3));
		}

		// Detente cuando ya estás, a efectos prácticos, en reposo o en destino:
		// no gastes frames persiguiendo la sexta cifra decimal.
		const settled =
			Math.abs(curX - targetX) < 0.01 &&
			Math.abs(curY - targetY) < 0.01 &&
			Math.abs(curScale - targetScale) < 0.0005 &&
			Math.abs(curO - targetO) < 0.004 &&
			Math.abs(csx - sx) < 0.002 &&
			Math.abs(csy - sy) < 0.002;

		if (settled) {
			running = false;
			if (targetO === 0 && targetScale === 1) {
				// En reposo total, suelta el transform para no dejar un contexto
				// de apilamiento 3D colgando sobre el contenido.
				node.style.transform = '';
			}
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
		const c = pointerToCenter(e.clientX, e.clientY, rect);
		// rotateY sigue a X; rotateX sigue a −Y (arriba inclina hacia atrás).
		targetX = clamp(c.x * max, -max, max);
		targetY = clamp(-c.y * max, -max, max);
		targetScale = scale;
		targetO = 1;
		const f = pointerToFraction(e.clientX, e.clientY, rect);
		sx = clamp(f.x, 0, 1);
		sy = clamp(f.y, 0, 1);
		kick();
	};

	const onEnter = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		onMove(e);
	};

	const onLeave = () => {
		targetX = 0;
		targetY = 0;
		targetScale = 1;
		targetO = 0;
		kick();
	};

	node.addEventListener('pointerenter', onEnter);
	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);

	return {
		update(next: TiltOptions) {
			max = next.max ?? max;
			scale = next.scale ?? scale;
			perspective = next.perspective ?? perspective;
			ease = next.ease ?? ease;
			glow = next.glow ?? glow;
		},
		destroy() {
			cancelAnimationFrame(raf);
			node.removeEventListener('pointerenter', onEnter);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
}
