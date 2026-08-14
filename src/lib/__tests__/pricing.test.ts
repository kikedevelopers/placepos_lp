import { describe, it, expect } from 'vitest';
import { PRICING } from '$lib/data/pricing';
import {
    annualCostOfMonthly,
    annualSavings,
    buildPlans,
    dailyCost,
    formatCop,
    freeMonths,
    freeMonthsLabel,
    monthlyEquivalent,
    savingsPercent
} from '$lib/utils/pricing';

// ---------------------------------------------------------------------------
// La sección de precios.
//
// Aquí no se prueba que "se vea bien": se prueba que lo que la página AFIRMA sea
// verdad. Un cliente que multiplica $80.000 × 12 y no le da lo que dice la
// tarjeta no piensa "qué error de copy", piensa que le están viendo la cara — y
// eso pasa en la única pantalla donde ya estaba decidido a pagar.
// ---------------------------------------------------------------------------

const plans = buildPlans();
const monthly = plans.find((p) => p.id === 'monthly')!;
const annual = plans.find((p) => p.id === 'annual')!;

describe('formato de moneda', () => {
    it('escribe pesos colombianos, sin decimales', () => {
        expect(formatCop(80_000)).toBe('$80.000');
        expect(formatCop(650_000)).toBe('$650.000');
        expect(formatCop(1_781)).toBe('$1.781');
    });

    it('redondea en vez de arrastrar decimales', () => {
        // 650.000 / 12 = 54.166,66… No hay forma de cobrar centavos de peso.
        expect(formatCop(54_166.67)).toBe('$54.167');
    });

    it('sostiene un precio de siete cifras', () => {
        expect(formatCop(1_200_000)).toBe('$1.200.000');
    });
});

describe('aritmética de los planes', () => {
    it('el año pagado mes a mes son doce mensualidades', () => {
        expect(annualCostOfMonthly()).toBe(PRICING.monthly_price * 12);
    });

    it('el ahorro es la diferencia real entre los dos caminos', () => {
        expect(annualSavings()).toBe(annualCostOfMonthly() - PRICING.annual_price);
        expect(annualSavings()).toBe(310_000);
    });

    it('el equivalente mensual del anual es más barato que el mensual', () => {
        // Si esto dejara de cumplirse, la tarjeta destacada estaría empujando al
        // cliente al plan MÁS caro con un cartel de ahorro encima.
        expect(monthlyEquivalent()).toBeLessThan(PRICING.monthly_price);
        expect(monthlyEquivalent()).toBe(54_167);
    });

    it('el porcentaje es el ahorro sobre lo que se pagaría mes a mes', () => {
        expect(savingsPercent()).toBe(32);
        expect(savingsPercent()).toBeGreaterThan(0);
        expect(savingsPercent()).toBeLessThan(100);
    });

    it('el costo diario sale del plan anual, no del mensual', () => {
        expect(dailyCost()).toBe(Math.round(PRICING.annual_price / 365));
        expect(dailyCost()).toBe(1_781);
    });

    it('el ahorro equivale a casi cuatro mensualidades', () => {
        expect(freeMonths()).toBeCloseTo(3.875, 3);
    });
});

describe('el ahorro dicho en meses nunca promete de más', () => {
    it('con 3,875 meses dice "casi 4", no "4"', () => {
        expect(freeMonthsLabel()).toBe('casi 4 meses');
    });

    it('redondea hacia abajo cuando la fracción es intermedia', () => {
        // Reproduce la fórmula con otros precios para fijar la regla, sin tener
        // que tocar los precios reales del sitio.
        const label = (months: number) => {
            const whole = Math.floor(months);
            const fraction = months - whole;
            if (fraction < 0.15) return `${whole} meses`;
            if (fraction >= 0.75) return `casi ${whole + 1} meses`;
            return `más de ${whole} meses`;
        };

        expect(label(3.0)).toBe('3 meses');
        expect(label(3.1)).toBe('3 meses');
        expect(label(3.5)).toBe('más de 3 meses');
        expect(label(3.8)).toBe('casi 4 meses');
        expect(label(3.99)).toBe('casi 4 meses');
    });
});

describe('las dos tarjetas', () => {
    it('hay exactamente dos planes y solo uno destacado', () => {
        // Dos tarjetas destacadas es ninguna: la decisión se diluye.
        expect(plans).toHaveLength(2);
        expect(plans.filter((p) => p.highlighted)).toHaveLength(1);
        expect(annual.highlighted).toBe(true);
    });

    it('el destacado es el anual, que es el que conviene a los dos lados', () => {
        expect(annual.id).toBe('annual');
    });

    it('las dos cifras grandes están en la misma unidad', () => {
        // Comparar "$80.000 al mes" contra "$650.000 al año" no le dice nada a
        // nadie. Las dos tarjetas dicen "al mes" para que la comparación sea
        // inmediata: 80.000 contra 54.167.
        expect(monthly.period).toBe('al mes');
        expect(annual.period).toBe('al mes');
        expect(monthly.price).toBe(formatCop(PRICING.monthly_price));
        expect(annual.price).toBe(formatCop(monthlyEquivalent()));
    });

    it('cada tarjeta dice sin ambigüedad qué se cobra de verdad', () => {
        // La cifra grande del anual NO es lo que se cobra; si eso no se aclara
        // debajo, el cliente descubre el cargo real en el momento de pagar.
        expect(monthly.billing_note).toContain(formatCop(annualCostOfMonthly()));
        expect(annual.billing_note).toContain(formatCop(PRICING.annual_price));
        expect(annual.billing_note.toLowerCase()).toContain('un solo pago');
    });

    it('solo el plan que ahorra lleva precio tachado y sello', () => {
        expect(annual.strikethrough).toBe(formatCop(PRICING.monthly_price));
        expect(annual.badge).toContain(formatCop(annualSavings()));
        expect(monthly.strikethrough).toBeUndefined();
        expect(monthly.badge).toBeUndefined();
    });

    it('el plan mensual muestra el costo de quedarse en él', () => {
        const alerts = monthly.features.filter((f) => f.icon === 'alert');
        expect(alerts).toHaveLength(1);
        expect(alerts[0].text).toContain(formatCop(annualSavings()));
    });

    it('el plan anual no se vende con advertencias', () => {
        expect(annual.features.every((f) => f.icon === 'check')).toBe(true);
    });

    it('el soporte prioritario es del anual, y solo del anual', () => {
        // Una ventaja exclusiva no existe si aparece en las dos tarjetas.
        const priority = (plan: typeof annual) =>
            plan.features.some((f) => f.text.toLowerCase().includes('prioritario'));

        expect(priority(annual)).toBe(true);
        expect(priority(monthly)).toBe(false);
    });

    it('el plan mensual sigue prometiendo soporte', () => {
        // "Prioritario" en el anual no puede leerse como "en el mensual te
        // dejamos solo": el soporte va incluido en los dos y así hay que decirlo,
        // o la tarjeta barata queda vendiendo un producto que no es el que hay.
        expect(monthly.features.some((f) => f.text.toLowerCase().includes('soporte'))).toBe(true);
    });

    it('cada tarjeta tiene su llamado a la acción', () => {
        for (const plan of plans) {
            expect(plan.cta.length).toBeGreaterThan(0);
            expect(plan.features.length).toBeGreaterThanOrEqual(4);
        }
        expect(monthly.cta).not.toBe(annual.cta);
    });

    it('ninguna cifra del copy quedó escrita a mano', () => {
        // Todo número que aparezca en un texto tiene que ser uno de los que se
        // derivan del precio. Un literal olvidado aquí es una mentira futura.
        const derived = [
            formatCop(PRICING.monthly_price),
            formatCop(PRICING.annual_price),
            formatCop(annualCostOfMonthly()),
            formatCop(annualSavings()),
            formatCop(monthlyEquivalent()),
            formatCop(dailyCost()),
            String(savingsPercent()),
            freeMonthsLabel()
        ];
        // "12 meses" (la vigencia del plan) es un hecho del plan anual, no una cifra
        // derivada del precio.
        const allowed = [...derived, '12'];

        const texts = plans.flatMap((p) => [
            p.billing_note,
            p.badge ?? '',
            ...p.features.map((f) => f.text)
        ]);

        for (const text of texts) {
            for (const numeric of text.match(/[\d.]*\d/g) ?? []) {
                expect(
                    allowed.some((value) => value.includes(numeric)),
                    `"${numeric}" en «${text}» no sale de los precios`
                ).toBe(true);
            }
        }
    });
});

describe('coherencia con el resto del sitio', () => {
    it('los días de prueba son los que concede pos_api', () => {
        // Espejo de SUBSCRIPTION_TRIAL_DAYS. Prometer más días de los que da el
        // backend deja al cliente bloqueado antes de lo que le dijimos.
        expect(PRICING.trial_days).toBe(10);
    });

    it('los precios están en pesos colombianos', () => {
        expect(PRICING.currency).toBe('COP');
    });
});
