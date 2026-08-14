import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Enlaces a anclas de la landing.
//
// Un href a un ancla que no existe no rompe nada: el navegador se queda donde
// está y el visitante cree que el sitio no responde. No hay error en consola,
// no falla el build y `svelte-check` tampoco lo ve — solo se descubre haciendo
// clic. Ya pasó con `#descargas` (la sección se llama `cta`) en el correo de
// activación y en el de recuperación, justo en las dos páginas que ve alguien
// que acaba de registrarse.
//
// Este test recorre el código fuente, junta todos los `id="…"` que existen y
// exige que cada enlace a un ancla caiga en uno de ellos.
// ---------------------------------------------------------------------------

// `fileURLToPath` y no `.pathname`: la ruta del proyecto tiene un espacio y
// `.pathname` lo devuelve como %20, que `readdirSync` no encuentra.
const SRC = fileURLToPath(new URL('../../', import.meta.url));

/** Todos los .svelte del proyecto, con su ruta relativa para el mensaje de error. */
const sourceFiles = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            out.push(...sourceFiles(full));
        } else if (entry.endsWith('.svelte')) {
            out.push(full);
        }
    }
    return out;
};

const files = sourceFiles(SRC);

/** Anclas declaradas: `id="cta"`, `id="features"`, … */
const declaredAnchors = new Set<string>();
for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(/\bid="([\w-]+)"/g)) {
        declaredAnchors.add(match[1]);
    }
}

/**
 * Enlaces a un ancla, en las dos formas que usa el sitio:
 *   href="#cta"                 (misma página)
 *   href="{SITE.domain}/#cta"   (desde /activar, /restablecer, /docs…)
 *   href="{base}/#cta"
 */
type AnchorLink = { anchor: string; file: string };
const anchorLinks: AnchorLink[] = [];
for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(/href="(?:\{[^}]+\})?\/?#([\w-]+)"/g)) {
        anchorLinks.push({ anchor: match[1], file: relative(SRC, file) });
    }
}

describe('anclas de la landing', () => {
    it('encuentra archivos y enlaces que revisar', () => {
        // Si los regex dejan de casar (por un refactor de sintaxis), el test
        // pasaría en vacío y daría una falsa sensación de cobertura.
        expect(files.length).toBeGreaterThan(0);
        expect(anchorLinks.length).toBeGreaterThan(0);
        expect(declaredAnchors.size).toBeGreaterThan(0);
    });

    it('la sección de descargas sigue siendo #cta', () => {
        // Es el destino al que apuntan los correos: si alguien la renombra,
        // que se entere aquí y no por un cliente que no pudo descargar.
        expect(declaredAnchors.has('cta')).toBe(true);
    });

    it('todo enlace a un ancla apunta a una que existe', () => {
        const rotos = anchorLinks.filter(
            // `#top` es el ancla implícita del navegador: no se declara.
            (link) => link.anchor !== 'top' && !declaredAnchors.has(link.anchor)
        );

        expect(
            rotos.map((r) => `${r.file} → #${r.anchor}`),
            'hay enlaces a anclas inexistentes'
        ).toEqual([]);
    });

    it('las páginas del correo llevan a la descarga real', () => {
        // Las dos páginas que abre un cliente desde su correo. El enlace de
        // descarga es lo único que puede hacer si aún no tiene la app.
        for (const page of ['routes/activar/+page.svelte', 'routes/restablecer/+page.svelte']) {
            const content = readFileSync(join(SRC, page), 'utf8');
            expect(content, `${page} debe enlazar la descarga`).toContain('/#cta');
            expect(content, `${page} no debe apuntar a #descargas`).not.toContain('#descargas');
        }
    });
});
