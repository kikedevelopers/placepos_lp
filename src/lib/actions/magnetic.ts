/**
 * `use:magnetic` — el elemento se deja "jalar" suavemente hacia el cursor
 * cuando este se acerca, y vuelve a su sitio al salir. Un guiño físico para
 * los CTA principales: invita a hacer clic sin gritar.
 *
 * Reglas respetadas: solo `transform` directo en el nodo, suavizado por rAF
 * (nada de saltos), resistencia de goma para que el jalón se sienta firme y
 * no infinito, y apagado completo sin puntero fino o con movimiento reducido.
 *
 * Uso: <a use:magnetic>…</a>  ·  <a use:magnetic={{ strength: 0.4 }}>…</a>
 */
import { lerp, rubberband, hasFinePointer, prefersReducedMotion } from '$lib/utils/motion';

interface MagneticOptions {
	/** Fracción del desplazamiento del cursor que sigue el elemento (0..1). */
	strength?: number;
	/** Radio extra alrededor del elemento donde ya empieza a reaccionar (px). */
	padding?: number;
	/** Suavizado 0..1 por frame. */
	ease?: number;
	/** Escala al mantener pulsado (feedback de presión, Apple: responder al down). */
	press?: number;
}

export function magnetic(node: HTMLElement, options: MagneticOptions = {}) {
	let { strength = 0.35, padding = 24, ease = 0.18, press = 0.96 } = options;

	if (!hasFinePointer() || prefersReducedMotion()) return;

	node.style.willChange = 'transform';

	let targetX = 0;
	let targetY = 0;
	let targetScale = 1;
	let curX = 0;
	let curY = 0;
	let curScale = 1;
	let raf = 0;
	let running = false;

	const render = () => {
		curX = lerp(curX, targetX, ease);
		curY = lerp(curY, targetY, ease);
		// La presión responde más rápido que el imán: el clic debe sentirse
		// inmediato (100-160ms), no arrastrado.
		curScale = lerp(curScale, targetScale, 0.35);
		node.style.transform =
			`translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) scale(${curScale.toFixed(4)})`;

		const settled =
			Math.abs(curX - targetX) < 0.05 &&
			Math.abs(curY - targetY) < 0.05 &&
			Math.abs(curScale - targetScale) < 0.001;
		if (settled) {
			running = false;
			if (targetX === 0 && targetY === 0 && targetScale === 1) node.style.transform = '';
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
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		// La goma mantiene el jalón proporcional cerca del centro y lo frena a
		// medida que el cursor se aleja: nunca se despega de su hueco.
		targetX = rubberband((e.clientX - cx) * strength, rect.width + padding);
		targetY = rubberband((e.clientY - cy) * strength, rect.height + padding);
		kick();
	};

	const onLeave = () => {
		targetX = 0;
		targetY = 0;
		targetScale = 1;
		kick();
	};

	const onDown = () => {
		targetScale = press;
		kick();
	};

	const onUp = () => {
		targetScale = 1;
		kick();
	};

	// Escuchamos en el nodo: con el padding de hit-area de los botones basta,
	// y evita un listener global de pointermove corriendo en toda la página.
	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);
	node.addEventListener('pointerdown', onDown);
	node.addEventListener('pointerup', onUp);

	return {
		update(next: MagneticOptions) {
			strength = next.strength ?? strength;
			padding = next.padding ?? padding;
			ease = next.ease ?? ease;
			press = next.press ?? press;
		},
		destroy() {
			cancelAnimationFrame(raf);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			node.removeEventListener('pointerdown', onDown);
			node.removeEventListener('pointerup', onUp);
		}
	};
}
