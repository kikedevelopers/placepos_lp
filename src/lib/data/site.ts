import { dev } from '$app/environment';
import { PRICING } from './pricing';
import { annualCostOfMonthly, annualSavings, formatCop } from '$lib/utils/pricing';

export const SITE = {
	name: 'PlacePos',
	// Dominio REAL donde vive el sitio (custom domain de GitHub Pages). Es la
	// base de canonical, Open Graph, JSON-LD y sitemap: si esto no coincide con
	// la URL servida, Google recibe señales contradictorias y no indexa bien.
	domain: 'https://placepos.kikedevs.com',
	tagline: 'El ERP que pone tu negocio a vender más',
	description:
		'PlacePos es el ERP todo-en-uno para tu negocio: punto de venta, inventario, compras, gastos, tesorería, créditos y reportes financieros en una sola plataforma. Vende más, controla todo y decide con datos en tiempo real.',
	email: 'hola@placepos.com',
	/**
	 * API al que llaman las páginas que hablan con el backend (`/activar`).
	 *
	 * En desarrollo apunta al pos_api LOCAL: los tokens de activación y de
	 * recuperación se emiten contra la base local, así que llamar a producción
	 * dejaría el enlace siempre inválido — y, sin el origen de esta landing en
	 * su CORS, el navegador ni siquiera dejaría leer la respuesta.
	 */
	apiUrl: dev ? 'http://localhost:3010' : 'https://foxpos.kikedevs.com',
	// "Empieza gratis" sonaba a plan gratuito, y no existe: lo que hay es una
	// prueba de días. Ahora que los precios están publicados, la promesa del
	// botón principal tiene que coincidir con lo que el cliente encuentra abajo.
	ctaPrimary: `Pruébalo ${PRICING.trial_days} días gratis`,
	version: '1.0.0',
	// Enlaces PERMANENTES (siempre apuntan a la última versión publicada por el
	// release action de placepos; se sobrescriben en cada push a main).
	downloads: {
		windows: 'https://releases.kikedevs.com/placepos-latest-setup.exe',
		mac: 'https://releases.kikedevs.com/placepos-latest.dmg'
	}
};

export interface Feature {
	icon: string;
	title: string;
	desc: string;
	/** Ocupa la fila completa: cierre destacado del grid (layout horizontal). */
	wide?: boolean;
	/** Sello sobre el título (ej. "Nuevo"). */
	badge?: string;
}

export const FEATURES: Feature[] = [
	{
		icon: 'cart',
		title: 'Punto de venta veloz',
		desc: 'Cobra en segundos con un POS pensado para el mostrador: búsqueda instantánea, múltiples medios de pago y tickets que cuadran solos.'
	},
	{
		icon: 'boxes',
		title: 'Inventario en tiempo real',
		desc: 'Cada venta y cada compra mueve tu stock al instante. Sabe qué tienes, qué falta y qué se vende — sin contar a mano nunca más.'
	},
	{
		icon: 'truck',
		title: 'Compras y proveedores',
		desc: 'Registra compras, distribuye el flete al costo real de cada producto y controla a tus proveedores sin perder un peso.'
	},
	{
		icon: 'receipt',
		title: 'Gastos bajo control',
		desc: 'Gastos fijos y variables, anulaciones que devuelven el dinero a su caja y un historial impecable de cada salida.'
	},
	{
		icon: 'wallet',
		title: 'Tesorería completa',
		desc: 'Cajas, billeteras y bancos en un solo tablero. Mueve saldos, corrige cajas y ve a dónde va realmente tu dinero.'
	},
	{
		icon: 'chart',
		title: 'Finanzas que entiendes',
		desc: 'Punto de equilibrio, recaudo real y resumen del día. Reportes que traducen los números en decisiones, no en dolores de cabeza.'
	},
	{
		icon: 'users',
		title: 'Clientes y créditos',
		desc: 'Fichas de clientes, créditos, abonos y anticipos. Fideliza, cobra a tiempo y nunca vuelvas a perder el rastro de una cuenta.'
	},
	{
		icon: 'building',
		title: 'Multi-sucursal',
		desc: 'Administra todas tus sedes desde una sola cuenta, con datos aislados por negocio y una vista consolidada cuando la necesitas.'
	},
	{
		icon: 'bell',
		title: 'Notificaciones en vivo',
		desc: 'Enterate al instante de lo que pasa en tu negocio: anulaciones, gastos y movimientos clave llegan a tu campana en tiempo real.'
	},
	{
		icon: 'message',
		title: 'Tickets por WhatsApp',
		desc: 'Conecta el WhatsApp de tu negocio y envíale la factura al cliente apenas le cobras. Sale de tu propio número, sin sacar el celular ni tomarle foto al ticket.',
		wide: true,
		badge: 'Nuevo · Beta'
	}
];

export interface Stat {
	value: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	label: string;
}

export const STATS: Stat[] = [
	{ value: 30, suffix: '%', label: 'menos tiempo en cuadrar caja' },
	{ value: 100, suffix: '%', label: 'de tu negocio en un solo lugar' },
	{ value: 3, suffix: 's', label: 'para cerrar una venta' },
	{ value: 24, suffix: '/7', label: 'tus informes, también en la web' }
];

export interface Step {
	icon: string;
	kicker: string;
	title: string;
	desc: string;
}

export const STEPS: Step[] = [
	{
		icon: 'bolt',
		kicker: 'Vende',
		title: 'Cobra rápido y sin errores',
		desc: 'Tus cajeros venden en segundos. Cada ticket descuenta inventario, registra el pago y alimenta tus reportes automáticamente.'
	},
	{
		icon: 'layers',
		kicker: 'Controla',
		title: 'Todo conectado, nada suelto',
		desc: 'Inventario, compras, gastos y tesorería hablan entre sí. Un solo movimiento se refleja en todo el negocio, en vivo.'
	},
	{
		icon: 'trending',
		kicker: 'Crece',
		title: 'Decide con datos, no con corazonadas',
		desc: 'Sabes cuánto ganas, qué te cuesta y cuándo llegas a tu punto de equilibrio. La información que necesitas para crecer, clara.'
	}
];

export interface Testimonial {
	quote: string;
	name: string;
	role: string;
	initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
	{
		quote:
			'Antes cerraba el día con una calculadora y rezando. Con PlacePos sé al segundo cuánto vendí, cuánto gasté y cuánto me queda.',
		name: 'Laura Gómez',
		role: 'Dueña · Minimercado Las Palmas',
		initials: 'LG'
	},
	{
		quote:
			'Tener inventario, compras y caja en el mismo lugar nos cambió la vida. Dejamos de perder plata en descuadres todos los meses.',
		name: 'Andrés Rivera',
		role: 'Gerente · Distribuidora del Valle',
		initials: 'AR'
	},
	{
		quote:
			'Abrí mi segunda sede sin contratar a nadie de administración. PlacePos me da la foto completa de las dos tiendas en un clic.',
		name: 'Carolina Méndez',
		role: 'Fundadora · Tostadora Café Cumbre',
		initials: 'CM'
	}
];

export interface FaqItem {
	q: string;
	a: string;
}

export const FAQ: FaqItem[] = [
	{
		q: '¿Cómo funciona PlacePos?',
		a: 'PlacePos es una aplicación de escritorio que instalas en el computador de tu negocio: rápida y estable para el ritmo del mostrador. Además incluye una sección web para consultar tus informes y hacer gestión administrativa desde donde estés.'
	},
	{
		q: '¿Sirve para mi tipo de negocio?',
		a: 'Tiendas, minimercados, distribuidoras, cafeterías, ferreterías y más. Si vendes productos y manejas inventario, PlacePos es para ti.'
	},
	{
		q: '¿Puedo manejar varias sucursales?',
		a: 'Sí. Administras todas tus sedes desde una sola cuenta, con datos independientes por negocio y una vista consolidada cuando la necesitas.'
	},
	{
		q: '¿Qué pasa cuando terminan los días de prueba?',
		a: 'Eliges plan y sigues donde ibas: tus productos, tus ventas y tus reportes quedan tal como los dejaste. No te pedimos tarjeta para probar, así que si decides que no es para ti, simplemente no pagas nada.'
	},
	{
		q: '¿Por qué el plan anual es más barato?',
		a: `Porque un negocio que se compromete un año nos permite planear el soporte y el desarrollo con calma, y ese ahorro te lo devolvemos: pagando mes a mes gastas ${formatCop(annualCostOfMonthly())} al año, y con el plan anual pagas ${formatCop(PRICING.annual_price)}. Son ${formatCop(annualSavings())} que se quedan en tu caja por el mismo producto.`
	},
	{
		q: '¿El precio incluye todo o hay módulos aparte?',
		a: 'Incluye todo: punto de venta, inventario, compras, gastos, tesorería, créditos, reportes y las actualizaciones que salgan durante tu suscripción. Lo único que se cotiza aparte es cada sucursal adicional, porque es un negocio más dentro de tu cuenta.'
	},
	{
		q: '¿Mis datos están seguros?',
		a: 'Tu información se respalda automáticamente y está disponible donde estés. Tú controlas quién accede y a qué dentro de tu equipo.'
	}
];
