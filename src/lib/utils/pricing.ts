import { PRICING, type Plan } from '$lib/data/pricing';

// ---------------------------------------------------------------------------
// Aritmética de los planes.
//
// Todo lo que la sección de precios AFIRMA ("ahorras $310.000", "casi 4 meses
// gratis", "32% menos") se calcula aquí a partir de los dos únicos números que
// se escriben a mano: el precio mensual y el anual. Si mañana cambia un precio
// y estas frases estuvieran escritas a mano, el sitio pasaría a mentirle al
// cliente sin que nadie lo note — y una cifra falsa en una página de precios no
// es un detalle de copy, es publicidad engañosa.
// ---------------------------------------------------------------------------

/** Pesos colombianos, sin decimales: `$80.000`. */
export const formatCop = (value: number): string =>
    `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.round(value))}`;

/** Lo que cuesta un año pagando mes a mes. Es el ancla de la comparación. */
export const annualCostOfMonthly = (): number => PRICING.monthly_price * 12;

/** Lo que cuesta cada mes en el plan anual: el número que se compara de un vistazo. */
export const monthlyEquivalent = (): number => Math.round(PRICING.annual_price / 12);

/** Pesos que se queda el cliente por pagar el año completo. */
export const annualSavings = (): number => annualCostOfMonthly() - PRICING.annual_price;

/** Ese ahorro como porcentaje del año pagado mes a mes. */
export const savingsPercent = (): number =>
    Math.round((annualSavings() / annualCostOfMonthly()) * 100);

/** Cuántas mensualidades cubre el ahorro. */
export const freeMonths = (): number => annualSavings() / PRICING.monthly_price;

/**
 * El ahorro dicho en meses, redondeado SIEMPRE hacia abajo en la promesa.
 *
 * Con 3,875 meses se dice "casi 4", nunca "4": prometer de más un número que el
 * cliente puede verificar con una multiplicación es la forma más barata de
 * perder su confianza justo en la pantalla donde decide pagar.
 */
export const freeMonthsLabel = (): string => {
    const months = freeMonths();
    const whole = Math.floor(months);
    const fraction = months - whole;

    if (fraction < 0.15) return `${whole} meses`;
    if (fraction >= 0.75) return `casi ${whole + 1} meses`;
    return `más de ${whole} meses`;
};

/** Lo que cuesta el plan anual por día. El precio más pequeño que se puede citar. */
export const dailyCost = (): number => Math.round(PRICING.annual_price / 365);

// ---------------------------------------------------------------------------
// Las dos tarjetas.
//
// El orden de lectura hace el trabajo: primero el mensual con su precio anual
// real a la vista ($960.000), después el anual con el equivalente mensual en
// grande. El cliente no compara "80.000 contra 650.000" —que son cifras de
// distinta escala y no dicen nada—, compara 80.000 contra 54.167 por lo mismo.
// ---------------------------------------------------------------------------
export const buildPlans = (): Plan[] => [
    {
        id: 'monthly',
        name: 'Mensual',
        kicker: 'Para probar el agua',
        price: formatCop(PRICING.monthly_price),
        period: 'al mes',
        billing_note: `Son ${formatCop(annualCostOfMonthly())} al año.`,
        features: [
            { icon: 'check', text: 'Todos los módulos, sin recortes' },
            { icon: 'check', text: 'Usuarios y productos sin límite' },
            { icon: 'check', text: 'Actualizaciones y soporte incluidos' },
            { icon: 'check', text: 'Cancelas cuando quieras' },
            {
                icon: 'alert',
                text: `Pagas ${formatCop(annualSavings())} de más al año por exactamente lo mismo`
            }
        ],
        cta: 'Empezar mes a mes',
        highlighted: false
    },
    {
        id: 'annual',
        name: 'Anual',
        kicker: 'Para el negocio que ya decidió crecer',
        price: formatCop(monthlyEquivalent()),
        period: 'al mes',
        strikethrough: formatCop(PRICING.monthly_price),
        billing_note: `Un solo pago de ${formatCop(PRICING.annual_price)} al año.`,
        badge: `Ahorras ${formatCop(annualSavings())} · ${savingsPercent()}%`,
        features: [
            { icon: 'check', text: 'Todo lo del plan mensual, igual de completo' },
            {
                icon: 'check',
                text: `${formatCop(annualSavings())} que se quedan en tu caja: ${freeMonthsLabel()} gratis`
            },
            // El único beneficio del anual que no es dinero. Va antes del
            // congelamiento de precio a propósito: es lo que le importa a quien
            // ya se imaginó con el sistema puesto y piensa "¿y si se me daña un
            // sábado a mediodía?".
            { icon: 'check', text: 'Soporte prioritario: tu caso va primero en la fila' },
            { icon: 'check', text: 'El precio de hoy, congelado 12 meses' },
            { icon: 'check', text: 'Un pago al año y te olvidas: cero cobros que recordar' },
            { icon: 'check', text: `Te sale en ${formatCop(dailyCost())} al día` }
        ],
        cta: 'Quiero el plan anual',
        highlighted: true
    }
];
