import { SITE } from '$lib/data/site';
import { apiRequest } from './client';

// ---------------------------------------------------------------------------
// Catálogo público de un negocio (pos_api `GET /catalog/:slug`).
//
// Es anónimo: no lleva token. Si el negocio no existe o no publicó su catálogo,
// el API responde 404 y `apiRequest` lanza un `ApiError` con `status === 404`
// que la página traduce a su estado "no encontrado".
// ---------------------------------------------------------------------------

export interface CatalogPrice {
	name: string;
	price: number;
}

export interface CatalogProduct {
	id: number;
	name: string;
	description: string | null;
	category: string | null;
	/** Ruta RELATIVA al API (`/product-images/serve?...`) o null. */
	image_url: string | null;
	prices: CatalogPrice[];
	/** El negocio marcó el producto como fuera de stock: visible pero no disponible. */
	out_of_stock: boolean;
}

export interface CatalogBusiness {
	name: string;
	slug: string;
	/** Preferencia del negocio: mostrar el catálogo agrupado por categoría. */
	group_by_category: boolean;
	/** Ruta RELATIVA al API de la portada del hero, o null si no hay. */
	cover_image_url: string | null;
}

export interface Catalog {
	business: CatalogBusiness;
	products: CatalogProduct[];
	count: number;
}

/** Pide el catálogo de un negocio por su slug. */
export const getCatalog = (slug: string): Promise<Catalog> =>
	apiRequest<Catalog>(`/catalog/${encodeURIComponent(slug)}`);

// ---------------------------------------------------------------------------
// Agrupación por categoría (presentación en el cliente).
//
// El backend entrega los productos planos (ordenados por nombre); cuando el
// negocio pide agrupar por categoría, la página los organiza aquí. Es lógica
// pura y testeable: nada de DOM.
// ---------------------------------------------------------------------------

/** Rótulo del grupo de los productos sin categoría. Siempre va al final. */
export const UNCATEGORIZED_LABEL = 'Otros';

/** Un grupo de productos de una misma categoría, con su ancla de navegación. */
export interface CatalogCategoryGroup {
	category: string;
	/** `id` del `<section>` al que salta el sidebar. Único dentro del catálogo. */
	anchor: string;
	products: CatalogProduct[];
}

/**
 * Convierte el nombre de una categoría en un `id` de ancla estable: sin
 * acentos, minúsculas y solo `[a-z0-9-]`. Se antepone `cat-` para no chocar con
 * otros ids de la página.
 */
export const categoryAnchorId = (category: string): string => {
	const base = category
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `cat-${base || 'otros'}`;
};

/**
 * Agrupa los productos por categoría preservando el orden de entrada dentro de
 * cada grupo. Las categorías se ordenan alfabéticamente (español); el grupo
 * "Otros" (productos sin categoría) siempre queda al final. Las anclas se
 * desduplican por si dos nombres distintos normalizan igual.
 */
export const groupProductsByCategory = (products: CatalogProduct[]): CatalogCategoryGroup[] => {
	const buckets = new Map<string, CatalogProduct[]>();
	for (const product of products) {
		const key = product.category?.trim() || UNCATEGORIZED_LABEL;
		const existing = buckets.get(key);
		if (existing) existing.push(product);
		else buckets.set(key, [product]);
	}

	const groups = [...buckets.entries()].map(([category, items]) => ({
		category,
		anchor: categoryAnchorId(category),
		products: items
	}));

	groups.sort((a, b) => {
		if (a.category === UNCATEGORIZED_LABEL) return 1;
		if (b.category === UNCATEGORIZED_LABEL) return -1;
		return a.category.localeCompare(b.category, 'es', { sensitivity: 'base' });
	});

	// Anclas únicas: si colisionan, se sufijan con un contador.
	const seen = new Set<string>();
	for (const group of groups) {
		let anchor = group.anchor;
		let n = 2;
		while (seen.has(anchor)) anchor = `${group.anchor}-${n++}`;
		seen.add(anchor);
		group.anchor = anchor;
	}

	return groups;
};

/**
 * URL absoluta de una imagen del catálogo. El API devuelve la ruta relativa de
 * su proxy firmado; aquí se antepone la base del API para que `<img>` la cargue
 * (el endpoint `/product-images/serve` es público).
 */
export const catalogImageSrc = (path: string | null): string | null =>
	path ? `${SITE.apiUrl}${path}` : null;
