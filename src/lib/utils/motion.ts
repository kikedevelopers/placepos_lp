/**
 * Helpers puros de movimiento — la matemática que comparten las acciones de
 * cursor (tilt, magnetic, pointerGlow). Vive aparte de las acciones porque las
 * acciones tocan el DOM y no se pueden probar sin navegador; esto sí, y es
 * justo donde se esconden los errores de signo y de rango.
 *
 * Toda la biblioteca anima SOLO transform/opacity, así que estas funciones
 * trabajan en números normalizados (−1..1) o en píxeles, nunca en estilos.
 */

/** Acota `value` al rango [min, max]. */
export function clamp(value: number, min: number, max: number): number {
	if (min > max) [min, max] = [max, min];
	return Math.min(Math.max(value, min), max);
}

/**
 * Interpolación lineal clásica. `t` fuera de [0,1] extrapola a propósito
 * (lo usamos para suavizar hacia un objetivo con factores pequeños).
 */
export function lerp(from: number, to: number, t: number): number {
	return from + (to - from) * t;
}

/**
 * Posición normalizada del puntero dentro de un rectángulo, en el rango −1..1
 * con 0 en el centro. `{ x: -1, y: -1 }` es la esquina superior izquierda.
 * Se acota: un puntero capturado puede reportar coordenadas fuera del rect.
 */
export function pointerToCenter(
	pointerX: number,
	pointerY: number,
	rect: { left: number; top: number; width: number; height: number }
): { x: number; y: number } {
	if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
	const x = clamp(((pointerX - rect.left) / rect.width) * 2 - 1, -1, 1);
	const y = clamp(((pointerY - rect.top) / rect.height) * 2 - 1, -1, 1);
	return { x, y };
}

/**
 * Posición normalizada del puntero dentro de un rectángulo en el rango 0..1
 * (para pintar un spotlight con porcentajes de `background-position`). Sin
 * acotar en los extremos del todo: deja el brillo seguir un poco al salir.
 */
export function pointerToFraction(
	pointerX: number,
	pointerY: number,
	rect: { left: number; top: number; width: number; height: number }
): { x: number; y: number } {
	if (rect.width <= 0 || rect.height <= 0) return { x: 0.5, y: 0.5 };
	return {
		x: (pointerX - rect.left) / rect.width,
		y: (pointerY - rect.top) / rect.height
	};
}

/**
 * Resistencia tipo goma de iOS: cuanto más se empuja más allá del límite,
 * menos se mueve. Para el "jalón" magnético de un botón, que debe sentirse
 * firme, no infinito. `constant` más alto = más blando.
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
	if (dimension <= 0) return 0;
	return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/**
 * Proyección de momento de Apple (de *Designing Fluid Interfaces*): a dónde
 * llega un gesto soltado a cierta velocidad. Forma de decaimiento exponencial,
 * no la de libro de física. `velocity` en px/s.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
	return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** ¿El usuario pidió menos movimiento? (SSR-safe: false en servidor). */
export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

/** ¿Hay un puntero fino con hover real? (ratón/trackpad, no dedo). SSR-safe. */
export function hasFinePointer(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(hover: hover) and (pointer: fine)').matches
	);
}
