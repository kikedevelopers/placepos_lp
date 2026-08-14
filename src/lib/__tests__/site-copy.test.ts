import { describe, it, expect } from 'vitest';
import { SITE, FAQ } from '$lib/data/site';
import { PRICING } from '$lib/data/pricing';
import { annualCostOfMonthly, annualSavings, formatCop } from '$lib/utils/pricing';

// ---------------------------------------------------------------------------
// Textos del sitio que hablan de dinero.
//
// El FAQ y el botón principal ahora prometen cosas concretas (cuánto cuesta,
// cuántos días dura la prueba). Esas promesas viven lejos de la sección de
// precios, así que son las que más fácil se quedan viejas cuando cambia un
// número — y son las que Google publica como rich snippet.
// ---------------------------------------------------------------------------

const faqText = FAQ.map((f) => `${f.q} ${f.a}`).join(' ');

describe('el FAQ concuerda con los precios publicados', () => {
    it('cita el costo real de pagar mes a mes', () => {
        expect(faqText).toContain(formatCop(annualCostOfMonthly()));
    });

    it('cita el precio del plan anual y el ahorro', () => {
        expect(faqText).toContain(formatCop(PRICING.annual_price));
        expect(faqText).toContain(formatCop(annualSavings()));
    });

    it('responde qué pasa al terminar la prueba', () => {
        // Es LA objeción del que está a punto de instalar: qué le pasa a sus
        // datos si no paga.
        const item = FAQ.find((f) => f.q.toLowerCase().includes('prueba'));
        expect(item).toBeDefined();
        expect(item!.a.toLowerCase()).toContain('no pagas nada');
    });

    it('avisa que la sucursal adicional se cobra aparte', () => {
        // El producto cobra la sede extra como addon. Callarlo aquí para no
        // enfriar la venta es exactamente lo que produce un reclamo después.
        expect(faqText.toLowerCase()).toContain('sucursal adicional');
    });

    it('ninguna respuesta promete un plan gratuito', () => {
        // "Gratis" solo puede aparecer acompañado de los días de prueba.
        for (const item of FAQ) {
            const mentions = item.a.toLowerCase().match(/gratis/g) ?? [];
            if (mentions.length > 0) {
                expect(item.a.toLowerCase(), `«${item.q}» sugiere un plan gratuito`).toMatch(
                    /d[ií]as|prueba/
                );
            }
        }
    });
});

describe('el botón principal', () => {
    it('ofrece la prueba, no un plan gratuito', () => {
        expect(SITE.ctaPrimary).toContain(String(PRICING.trial_days));
        expect(SITE.ctaPrimary.toLowerCase()).toContain('gratis');
        expect(SITE.ctaPrimary.toLowerCase()).not.toBe('empieza gratis');
    });
});
