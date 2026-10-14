import { describe, it, expect } from 'vitest';

import {
	categoryAnchorId,
	groupProductsByCategory,
	UNCATEGORIZED_LABEL,
	type CatalogProduct
} from '$lib/api/catalog';

// ---------------------------------------------------------------------------
// Agrupación del catálogo por categoría.
//
// La página pública agrupa los productos en el cliente cuando el negocio lo
// pide. El orden (categorías alfabéticas, "Otros" al final) y las anclas
// (estables y únicas) son lo que hace que el sidebar de navegación lleve al
// grupo correcto, así que se fijan con tests.
// ---------------------------------------------------------------------------

const makeProduct = (id: number, name: string, category: string | null): CatalogProduct => ({
	id,
	name,
	description: null,
	category,
	image_url: null,
	prices: [{ name: 'Precio', price: 1000 }],
	out_of_stock: false
});

describe('categoryAnchorId', () => {
	it('quita acentos, pasa a minúsculas y deja solo [a-z0-9-]', () => {
		expect(categoryAnchorId('Café')).toBe('cat-cafe');
		expect(categoryAnchorId('Bebidas Frías')).toBe('cat-bebidas-frias');
		expect(categoryAnchorId('Panadería & Repostería')).toBe('cat-panaderia-reposteria');
	});

	it('recorta guiones sobrantes de los extremos', () => {
		expect(categoryAnchorId('  Té  ')).toBe('cat-te');
		expect(categoryAnchorId('***')).toBe('cat-otros');
	});
});

describe('groupProductsByCategory', () => {
	it('agrupa por categoría y preserva el orden de entrada dentro del grupo', () => {
		const products = [
			makeProduct(1, 'Americano', 'Café'),
			makeProduct(2, 'Latte', 'Café'),
			makeProduct(3, 'Croissant', 'Panadería')
		];
		const groups = groupProductsByCategory(products);

		const cafe = groups.find((g) => g.category === 'Café');
		expect(cafe?.products.map((p) => p.id)).toEqual([1, 2]);
		expect(groups.find((g) => g.category === 'Panadería')?.products).toHaveLength(1);
	});

	it('ordena las categorías alfabéticamente (español)', () => {
		const products = [
			makeProduct(1, 'Z', 'Zumos'),
			makeProduct(2, 'A', 'Aromáticas'),
			makeProduct(3, 'C', 'Café')
		];
		const groups = groupProductsByCategory(products);
		expect(groups.map((g) => g.category)).toEqual(['Aromáticas', 'Café', 'Zumos']);
	});

	it('manda los productos sin categoría al grupo "Otros", siempre al final', () => {
		const products = [
			makeProduct(1, 'Suelto', null),
			makeProduct(2, 'Vacío', '   '),
			makeProduct(3, 'Americano', 'Café')
		];
		const groups = groupProductsByCategory(products);

		expect(groups.at(-1)?.category).toBe(UNCATEGORIZED_LABEL);
		expect(groups.at(-1)?.products.map((p) => p.id)).toEqual([1, 2]);
		expect(groups[0].category).toBe('Café');
	});

	it('genera anclas únicas aunque dos categorías normalicen igual', () => {
		const products = [makeProduct(1, 'a', 'Café'), makeProduct(2, 'b', 'cafe')];
		const groups = groupProductsByCategory(products);
		const anchors = groups.map((g) => g.anchor);
		expect(new Set(anchors).size).toBe(anchors.length);
	});

	it('un catálogo vacío no produce grupos', () => {
		expect(groupProductsByCategory([])).toEqual([]);
	});
});
