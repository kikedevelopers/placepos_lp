import { describe, it, expect } from 'vitest';
import {
	clamp,
	lerp,
	pointerToCenter,
	pointerToFraction,
	rubberband,
	project
} from '$lib/utils/motion';

// ---------------------------------------------------------------------------
// Matemática de las interacciones de cursor (tilt, magnetic, spotlight).
//
// Son funciones diminutas, pero un signo invertido o un rango mal acotado se
// ve como una tarjeta que se inclina al revés o un brillo que se escapa de su
// caja — un defecto de "feel" que no rompe el build y solo se nota moviendo el
// ratón. Por eso se prueban aquí los extremos, no solo el caso bonito.
// ---------------------------------------------------------------------------

const RECT = { left: 100, top: 50, width: 200, height: 100 };

describe('clamp', () => {
	it('acota por ambos lados', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-3, 0, 10)).toBe(0);
		expect(clamp(99, 0, 10)).toBe(10);
	});

	it('tolera min y max invertidos sin devolver basura', () => {
		expect(clamp(5, 10, 0)).toBe(5);
		expect(clamp(-1, 10, 0)).toBe(0);
	});
});

describe('lerp', () => {
	it('devuelve los extremos en 0 y 1', () => {
		expect(lerp(0, 100, 0)).toBe(0);
		expect(lerp(0, 100, 1)).toBe(100);
	});

	it('interpola el punto medio', () => {
		expect(lerp(0, 100, 0.5)).toBe(50);
		expect(lerp(20, 60, 0.25)).toBe(30);
	});
});

describe('pointerToCenter', () => {
	it('da 0,0 en el centro del rectángulo', () => {
		const p = pointerToCenter(RECT.left + RECT.width / 2, RECT.top + RECT.height / 2, RECT);
		expect(p.x).toBeCloseTo(0);
		expect(p.y).toBeCloseTo(0);
	});

	it('da -1,-1 en la esquina superior izquierda y 1,1 en la inferior derecha', () => {
		expect(pointerToCenter(RECT.left, RECT.top, RECT)).toEqual({ x: -1, y: -1 });
		expect(pointerToCenter(RECT.left + RECT.width, RECT.top + RECT.height, RECT)).toEqual({
			x: 1,
			y: 1
		});
	});

	it('acota cuando el puntero sale del rectángulo (pointer capture)', () => {
		const p = pointerToCenter(RECT.left - 500, RECT.top + 1000, RECT);
		expect(p.x).toBe(-1);
		expect(p.y).toBe(1);
	});

	it('no divide por cero con un rectángulo colapsado', () => {
		expect(pointerToCenter(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual({
			x: 0,
			y: 0
		});
	});
});

describe('pointerToFraction', () => {
	it('da 0.5,0.5 en el centro', () => {
		const p = pointerToFraction(RECT.left + RECT.width / 2, RECT.top + RECT.height / 2, RECT);
		expect(p.x).toBeCloseTo(0.5);
		expect(p.y).toBeCloseTo(0.5);
	});

	it('cae al centro con un rectángulo sin tamaño', () => {
		expect(pointerToFraction(5, 5, { left: 0, top: 0, width: 0, height: 0 })).toEqual({
			x: 0.5,
			y: 0.5
		});
	});
});

describe('rubberband', () => {
	it('no mueve nada sin desbordamiento', () => {
		expect(rubberband(0, 100)).toBe(0);
	});

	it('resiste: la salida siempre es menor que la entrada', () => {
		expect(Math.abs(rubberband(80, 100))).toBeLessThan(80);
	});

	it('conserva el signo del empuje', () => {
		expect(rubberband(-40, 100)).toBeLessThan(0);
		expect(rubberband(40, 100)).toBeGreaterThan(0);
	});

	it('resiste más cuanto más lejos se empuja (retorno decreciente)', () => {
		const cerca = rubberband(20, 100);
		const lejos = rubberband(200, 100);
		// Al duplicar diez veces el empuje, el desplazamiento no se multiplica
		// por diez: esa es toda la gracia de la goma.
		expect(lejos / cerca).toBeLessThan(10);
	});

	it('es seguro con una dimensión nula', () => {
		expect(rubberband(50, 0)).toBe(0);
	});
});

describe('project', () => {
	it('un gesto quieto no proyecta distancia', () => {
		expect(project(0)).toBe(0);
	});

	it('mayor velocidad proyecta más lejos, en la misma dirección', () => {
		expect(project(1000)).toBeGreaterThan(project(500));
		expect(project(-1000)).toBeLessThan(0);
	});
});
