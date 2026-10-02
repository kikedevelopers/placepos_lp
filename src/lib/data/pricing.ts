// ---------------------------------------------------------------------------
// Precios de PlacePos.
//
// Estos son los DOS únicos números escritos a mano de toda la sección: todo lo
// demás (ahorro, equivalente mensual, porcentaje, meses gratis, costo diario)
// se deriva de aquí en `$lib/utils/pricing`. Para cambiar de precio se toca
// este archivo y nada más.
//
// Pesos colombianos, por negocio. Cada sucursal adicional se cotiza aparte:
// el producto cobra la sede extra como addon, y prometer "sucursales
// ilimitadas" aquí sería una promesa que la app no cumple.
// ---------------------------------------------------------------------------

export const PRICING = {
    currency: 'COP',
    /** Días de prueba al registrarse. Espejo de `SUBSCRIPTION_TRIAL_DAYS` en pos_api. */
    trial_days: 10,
    monthly_price: 50_000,
    annual_price: 400_000
};

export type PlanId = 'monthly' | 'annual';

export interface PlanFeature {
    /** `check` = beneficio; `alert` = el costo de quedarse en el plan mensual. */
    icon: 'check' | 'alert';
    text: string;
}

export interface Plan {
    id: PlanId;
    name: string;
    /** Una línea que dice para quién es. Ayuda a que el cliente se ubique solo. */
    kicker: string;
    /** Cifra grande de la tarjeta. */
    price: string;
    /** Unidad bajo la cifra: "al mes". */
    period: string;
    /** Lo que se cobra de verdad en cada ciclo, dicho sin ambigüedad. */
    billing_note: string;
    /** Precio tachado, solo en el plan que ahorra. */
    strikethrough?: string;
    /** Sello sobre la tarjeta destacada. */
    badge?: string;
    features: PlanFeature[];
    cta: string;
    /** La tarjeta a la que se quiere llevar al cliente: borde vivo y elevación. */
    highlighted: boolean;
}
