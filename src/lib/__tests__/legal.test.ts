import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	LEGAL_DOCS,
	LEGAL_ENTITY,
	LEGAL_UPDATED_AT,
	formatLegalDate,
	legalDocBySlug,
	type LegalDoc
} from '$lib/data/legal';
import { PRICING } from '$lib/data/pricing';

// ---------------------------------------------------------------------------
// Documentos legales.
//
// Meta pide estas tres URLs para publicar la app de WhatsApp y la verificación
// del negocio compara el responsable con el RUT. Un 404, un responsable que no
// cuadra o una página sin el correo de contacto frenan la revisión: estos tests
// lo atajan antes del deploy.
// ---------------------------------------------------------------------------

const SRC = fileURLToPath(new URL('../../', import.meta.url));

const docText = (doc: LegalDoc): string =>
	doc.sections.flatMap((s) => [s.title, ...s.paragraphs, ...(s.items ?? [])]).join(' ');

const doc = (slug: string): LegalDoc => {
	const found = legalDocBySlug(slug);
	if (!found) throw new Error(`falta el documento ${slug}`);
	return found;
};

describe('responsable', () => {
	it('es el del RUT', () => {
		expect(LEGAL_ENTITY.name).toBe('Enrique Alexander Pacheco Vera');
		expect(LEGAL_ENTITY.nit).toMatch(/^\d{9}-\d$/);
		expect(LEGAL_ENTITY.email).toBe('kikedevelopers@gmail.com');
	});

	it.each(['privacidad', 'terminos'])('%s identifica al responsable con su NIT', (slug) => {
		const text = docText(doc(slug));
		expect(text).toContain(LEGAL_ENTITY.name);
		expect(text).toContain(LEGAL_ENTITY.nit);
	});

	it.each(['privacidad', 'terminos', 'eliminacion-datos'])(
		'%s trae el correo de contacto',
		(slug) => {
			expect(docText(doc(slug))).toContain(LEGAL_ENTITY.email);
		}
	);
});

describe('rutas', () => {
	it.each(LEGAL_DOCS.map((d) => d.slug))('/%s tiene su página', (slug) => {
		const page = join(SRC, 'routes', slug, '+page.svelte');
		expect(existsSync(page)).toBe(true);
		expect(readFileSync(page, 'utf8')).toContain(`legalDocBySlug('${slug}')`);
	});

	it('el footer enlaza las tres y ya no manda a #top', () => {
		const footer = readFileSync(join(SRC, 'lib/components/Footer.svelte'), 'utf8');
		for (const { slug } of LEGAL_DOCS) {
			expect(footer).toContain(`href="{base}/${slug}"`);
		}
		expect(footer).not.toMatch(/href="#top"[^>]*>\s*(Privacidad|Términos)/);
	});

	it('el sitemap las publica', () => {
		const sitemap = readFileSync(join(SRC, '../static/sitemap.xml'), 'utf8');
		for (const { slug } of LEGAL_DOCS) {
			expect(sitemap).toContain(`<loc>https://placepos.kikedevs.com/${slug}</loc>`);
		}
	});

	it('un slug desconocido no tiene documento', () => {
		expect(legalDocBySlug('cookies')).toBeUndefined();
		expect(legalDocBySlug('')).toBeUndefined();
	});
});

describe('estructura', () => {
	it.each(LEGAL_DOCS.map((d) => [d.slug, d] as const))(
		'%s: secciones con id único y contenido',
		(_slug, legal) => {
			const ids = legal.sections.map((s) => s.id);
			expect(new Set(ids).size).toBe(ids.length);
			for (const section of legal.sections) {
				expect(section.id).toMatch(/^[a-z0-9-]+$/);
				expect(section.paragraphs.length + (section.items?.length ?? 0)).toBeGreaterThan(0);
			}
		}
	);
});

describe('política de privacidad (Ley 1581 y Meta)', () => {
	const text = docText(doc('privacidad'));

	it('cita la ley y los derechos del titular', () => {
		expect(text).toContain('Ley Estatutaria 1581 de 2012');
		for (const right of [
			'actualizar',
			'rectificar',
			'prueba de la autorización',
			'supresión',
			'Superintendencia de Industria y Comercio'
		]) {
			expect(text).toContain(right);
		}
	});

	it('da los plazos legales de consultas y reclamos', () => {
		expect(text).toContain('diez (10) días hábiles');
		expect(text).toContain('quince (15) días hábiles');
	});

	it('explica el uso de los datos de WhatsApp y que no se venden', () => {
		expect(text).toContain('WhatsApp Business');
		expect(text).toContain('No vendemos esos datos');
	});

	it('nombra a los proveedores que procesan datos', () => {
		for (const provider of ['Google Cloud', 'Gemini', 'Meta', 'Wompi', 'Resend']) {
			expect(text).toContain(provider);
		}
	});
});

describe('términos', () => {
	it('los días de prueba coinciden con los precios publicados', () => {
		expect(docText(doc('terminos'))).toContain(`${PRICING.trial_days} días de prueba`);
	});

	it('advierte que la IA puede equivocarse y exige las políticas de WhatsApp', () => {
		const text = docText(doc('terminos'));
		expect(text).toContain('puede equivocarse');
		expect(text).toContain('Política de Comercio de WhatsApp');
	});
});

describe('eliminación de datos', () => {
	const text = docText(doc('eliminacion-datos'));

	it('explica cómo pedirla y cómo desconectar WhatsApp', () => {
		expect(text).toContain('«Eliminación de datos»');
		expect(text).toContain('PlacePOS Asistente');
		expect(text).toContain('token de acceso');
	});

	it('aclara qué se conserva por ley', () => {
		expect(text).toContain('contable y tributaria');
	});
});

describe('formatLegalDate', () => {
	it('formatea la fecha de actualización', () => {
		expect(formatLegalDate(LEGAL_UPDATED_AT)).toBe('31 de octubre de 2026');
		expect(formatLegalDate('2027-01-05')).toBe('5 de enero de 2027');
	});

	it.each(['', '31/10/2026', '2026-13-01', '2026-10-00', '2026-10-32', 'mañana'])(
		'rechaza %j',
		(value) => {
			expect(() => formatLegalDate(value)).toThrow('Fecha legal inválida');
		}
	);
});
