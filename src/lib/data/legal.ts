import { PRICING } from './pricing';

// ---------------------------------------------------------------------------
// Documentos legales de PlacePos: política de privacidad, términos y
// eliminación de datos.
//
// Meta exige las tres URLs para publicar la app de WhatsApp y aprobar la
// revisión, y la verificación del negocio compara el nombre del responsable con
// el de sus documentos: por eso el responsable sale del RUT y vive en un solo
// lugar (`LEGAL_ENTITY`).
//
// El texto es dato y no plantilla: las tres páginas lo pintan con el mismo
// componente (`LegalPage.svelte`).
// ---------------------------------------------------------------------------

/** Responsable del tratamiento de datos, tal como figura en el RUT. */
export const LEGAL_ENTITY = {
	name: 'Enrique Alexander Pacheco Vera',
	person_type: 'persona natural',
	nit: '700463661-4',
	city: 'Ibagué, Tolima, Colombia',
	email: 'kikedevelopers@gmail.com'
};

/** Fecha de la última actualización (YYYY-MM-DD). */
export const LEGAL_UPDATED_AT = '2026-10-31';

export type LegalSlug = 'privacidad' | 'terminos' | 'eliminacion-datos';

export interface LegalSection {
	/** Ancla de la sección dentro de la página. */
	id: string;
	title: string;
	paragraphs: string[];
	items?: string[];
}

export interface LegalDoc {
	slug: LegalSlug;
	title: string;
	/** Una frase para el `<meta description>` y la cabecera. */
	summary: string;
	sections: LegalSection[];
}

const responsible = `${LEGAL_ENTITY.name}, ${LEGAL_ENTITY.person_type} identificado con NIT ${LEGAL_ENTITY.nit}, con domicilio en ${LEGAL_ENTITY.city}`;

const contactLine = `Correo de contacto: ${LEGAL_ENTITY.email}.`;

const PRIVACY: LegalDoc = {
	slug: 'privacidad',
	title: 'Política de privacidad y tratamiento de datos',
	summary:
		'Qué datos personales trata PlacePos, para qué, con quién los comparte y cómo puedes ejercer tus derechos según la Ley 1581 de 2012.',
	sections: [
		{
			id: 'responsable',
			title: '1. Responsable del tratamiento',
			paragraphs: [
				`El responsable del tratamiento de los datos personales es ${responsible}. ${contactLine}`,
				'Esta política se rige por la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y las demás normas colombianas de protección de datos personales.'
			]
		},
		{
			id: 'alcance',
			title: '2. Alcance',
			paragraphs: [
				'Aplica a todos los servicios de PlacePos: la aplicación de escritorio, la aplicación web (erp.kikedevs.com), este sitio (placepos.kikedevs.com), el portal de cuenta y el asistente de ventas que atiende a los clientes de los comercios por WhatsApp y Telegram.'
			]
		},
		{
			id: 'roles',
			title: '3. Responsable y encargado',
			paragraphs: [
				'PlacePos es responsable de los datos de las personas que crean y administran una cuenta (el comercio y sus usuarios).',
				'Los datos que cada comercio registra en PlacePos sobre sus propios clientes, proveedores y empleados son del comercio: el comercio es el responsable de esos datos y PlacePos los trata como encargado, solo para prestarle el servicio y según sus instrucciones.'
			]
		},
		{
			id: 'datos',
			title: '4. Datos que tratamos',
			paragraphs: [],
			items: [
				'Datos de la cuenta: nombre, correo electrónico, teléfono, documento de identidad y datos del negocio (nombre, dirección, NIT).',
				'Datos de operación que carga el comercio: productos, inventario, ventas, compras, gastos, créditos y datos de contacto de sus clientes y proveedores.',
				'Datos de WhatsApp Business: cuando un comercio conecta su número a través del registro de Meta, guardamos el identificador de su cuenta de WhatsApp Business, el identificador y el número de teléfono, y el token de acceso que Meta emite para enviar y recibir mensajes en su nombre.',
				'Mensajes de los clientes del comercio: el texto y las notas de voz que un cliente envía al número del comercio, su nombre de perfil y su número de teléfono, para responderle y tomar su pedido.',
				'Datos de pago de la suscripción: los procesa la pasarela Wompi. PlacePos no recibe ni guarda números de tarjeta.',
				'Datos técnicos: dirección IP, tipo de dispositivo y registros de actividad necesarios para la seguridad y el soporte.'
			]
		},
		{
			id: 'finalidades',
			title: '5. Finalidades',
			paragraphs: [],
			items: [
				'Crear y administrar la cuenta, autenticar a sus usuarios y prestar el servicio contratado.',
				'Responder a los clientes del comercio por WhatsApp o Telegram, tomar sus pedidos y avisarle al comercio.',
				'Cobrar la suscripción, emitir comprobantes y cumplir obligaciones contables y tributarias.',
				'Enviar correos del servicio: activación de la cuenta, recuperación de contraseña y alertas que el comercio active.',
				'Dar soporte, prevenir fraudes y mantener la seguridad de la plataforma.'
			]
		},
		{
			id: 'meta',
			title: '6. Datos de Meta y WhatsApp',
			paragraphs: [
				'Los datos que recibimos de las plataformas de Meta (WhatsApp Business) se usan únicamente para prestarle el servicio al comercio que conectó su número: recibir los mensajes de sus clientes, responderlos y registrar sus pedidos.',
				'No vendemos esos datos, no los usamos para publicidad ni para crear perfiles, y no los compartimos con terceros salvo con los proveedores necesarios para operar el servicio (sección 7). Cumplimos las Condiciones de la Plataforma de Meta y las políticas de WhatsApp Business.'
			]
		},
		{
			id: 'proveedores',
			title: '7. Proveedores que procesan datos',
			paragraphs: [
				'Para operar usamos estos proveedores, que tratan los datos solo para prestarnos su servicio:'
			],
			items: [
				'Google Cloud: servidores, base de datos y almacenamiento de archivos.',
				'Google (Gemini): procesa los mensajes y las notas de voz para que el asistente pueda entender y responder.',
				'Meta Platforms (WhatsApp Business Platform) y Telegram: entrega de los mensajes.',
				'Wompi: procesamiento de los pagos de la suscripción.',
				'Resend: envío de los correos del servicio.'
			]
		},
		{
			id: 'transferencia',
			title: '8. Transferencia internacional',
			paragraphs: [
				'Algunos de estos proveedores almacenan o procesan datos fuera de Colombia, principalmente en Estados Unidos. Al usar PlacePos autorizas esa transferencia, que se hace con proveedores que ofrecen niveles adecuados de protección de datos.'
			]
		},
		{
			id: 'derechos',
			title: '9. Tus derechos',
			paragraphs: ['Como titular de los datos tienes derecho a:'],
			items: [
				'Conocer, actualizar y rectificar tus datos personales.',
				'Solicitar prueba de la autorización que nos diste.',
				'Ser informado del uso que le damos a tus datos.',
				'Revocar la autorización y solicitar la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos.',
				'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).',
				'Acceder gratuitamente a tus datos personales.'
			]
		},
		{
			id: 'procedimiento',
			title: '10. Cómo ejercer tus derechos',
			paragraphs: [
				`Escribe a ${LEGAL_ENTITY.email} desde el correo asociado a tu cuenta, indicando tu nombre, tu documento y lo que solicitas.`,
				'Las consultas se responden en un máximo de diez (10) días hábiles, prorrogables cinco (5) días hábiles más. Los reclamos (corrección, actualización o supresión) se atienden en un máximo de quince (15) días hábiles, prorrogables ocho (8) días hábiles más. Si necesitamos ampliar el plazo, te lo informaremos antes de que venza.',
				'Para borrar tu cuenta o desconectar WhatsApp, sigue las instrucciones de la página de eliminación de datos.'
			]
		},
		{
			id: 'seguridad',
			title: '11. Seguridad y conservación',
			paragraphs: [
				'Protegemos los datos con conexiones cifradas (HTTPS), contraseñas cifradas, acceso restringido por permisos y aislamiento de los datos de cada comercio. Los tokens de WhatsApp se guardan solo en el servidor y nunca se muestran en la aplicación.',
				'Conservamos los datos mientras la cuenta esté activa y, después, solo el tiempo que exijan las obligaciones legales, contables o tributarias.'
			]
		},
		{
			id: 'menores',
			title: '12. Menores de edad',
			paragraphs: [
				'PlacePos es un servicio para comercios y no está dirigido a menores de edad. No recolectamos a sabiendas datos de menores.'
			]
		},
		{
			id: 'cambios',
			title: '13. Cambios y vigencia',
			paragraphs: [
				`Esta política rige desde el ${LEGAL_UPDATED_AT}. Si la cambiamos, publicaremos la nueva versión en esta página con su fecha y, si el cambio es importante, te avisaremos por correo.`
			]
		}
	]
};

const TERMS: LegalDoc = {
	slug: 'terminos',
	title: 'Términos y condiciones del servicio',
	summary:
		'Las reglas de uso de PlacePos: la cuenta, la suscripción, el asistente de ventas, WhatsApp y las responsabilidades de cada parte.',
	sections: [
		{
			id: 'partes',
			title: '1. Quién presta el servicio',
			paragraphs: [
				`PlacePos es un software de gestión para comercios prestado por ${responsible}. ${contactLine}`,
				'Al crear una cuenta o usar el servicio aceptas estos términos. Si no estás de acuerdo, no uses PlacePos.'
			]
		},
		{
			id: 'servicio',
			title: '2. El servicio',
			paragraphs: [
				'PlacePos ofrece punto de venta, inventario, compras, gastos, tesorería, créditos, informes y un asistente de ventas con inteligencia artificial que puede atender a los clientes del comercio por WhatsApp y Telegram.'
			]
		},
		{
			id: 'cuenta',
			title: '3. La cuenta',
			paragraphs: [
				'Debes dar información verdadera y mantenerla actualizada. Eres responsable de guardar tus contraseñas y de lo que hagan los usuarios que crees en tu cuenta.'
			]
		},
		{
			id: 'suscripcion',
			title: '4. Prueba, suscripción y pagos',
			paragraphs: [
				`Al registrarte tienes ${PRICING.trial_days} días de prueba sin costo. Después, el servicio requiere una suscripción mensual o anual, que se paga por adelantado a través de Wompi a los precios publicados en este sitio.`,
				'Si la suscripción vence, el acceso queda limitado hasta que se renueve. Los pagos no son reembolsables, salvo cuando la ley lo exija.'
			]
		},
		{
			id: 'datos-comercio',
			title: '5. Tus datos',
			paragraphs: [
				'Los datos que registras en PlacePos son tuyos. Nos autorizas a tratarlos solo para prestarte el servicio, según la política de privacidad. Eres responsable de contar con la autorización de tus clientes, proveedores y empleados para registrar sus datos.'
			]
		},
		{
			id: 'asistente',
			title: '6. El asistente de ventas',
			paragraphs: [
				'El asistente responde con la información de tu inventario y con la configuración que definas (precios, entregas, formas de pago, estilo). Toma pedidos y te avisa, pero no confirma pagos ni despacha: tú revisas y confirmas cada pedido con el cliente.',
				'Como toda inteligencia artificial, puede equivocarse. Debes revisar los pedidos antes de despacharlos y mantener actualizados tus precios e inventario.'
			]
		},
		{
			id: 'whatsapp',
			title: '7. WhatsApp',
			paragraphs: [
				'Para conectar tu número de WhatsApp debes aceptar las Condiciones de WhatsApp Business y la Política de Comercio de WhatsApp de Meta, y cumplirlas. No puedes usar el servicio para enviar spam, mensajes no solicitados ni para vender productos prohibidos por esas políticas.',
				'Meta cobra directamente ciertas conversaciones según sus tarifas. Puedes desconectar tu número en cualquier momento.'
			]
		},
		{
			id: 'uso',
			title: '8. Uso aceptable',
			paragraphs: ['No puedes:'],
			items: [
				'Usar PlacePos para actividades ilegales o para engañar a terceros.',
				'Intentar acceder a datos de otros comercios o vulnerar la seguridad de la plataforma.',
				'Copiar, revender o hacer ingeniería inversa del software.'
			]
		},
		{
			id: 'disponibilidad',
			title: '9. Disponibilidad y responsabilidad',
			paragraphs: [
				'Trabajamos para que el servicio esté disponible siempre, pero puede haber interrupciones por mantenimiento, fallas de proveedores (incluidas las de Meta) o causas ajenas a nosotros.',
				'En la medida que la ley lo permita, PlacePos no responde por lucro cesante ni por daños indirectos, y su responsabilidad total se limita al valor pagado por la suscripción en los últimos tres meses.'
			]
		},
		{
			id: 'terminacion',
			title: '10. Terminación',
			paragraphs: [
				'Puedes cancelar tu cuenta cuando quieras. Podemos suspender una cuenta que incumpla estos términos o las políticas de WhatsApp. Al terminar, tus datos se tratan según la página de eliminación de datos.'
			]
		},
		{
			id: 'ley',
			title: '11. Ley aplicable y cambios',
			paragraphs: [
				'Estos términos se rigen por las leyes de la República de Colombia.',
				`Rigen desde el ${LEGAL_UPDATED_AT}. Si los cambiamos, publicaremos la nueva versión en esta página y, si el cambio es importante, te avisaremos por correo.`
			]
		}
	]
};

const DATA_DELETION: LegalDoc = {
	slug: 'eliminacion-datos',
	title: 'Eliminación de datos',
	summary:
		'Cómo pedir que borremos tu cuenta y tus datos, cómo desconectar WhatsApp y qué información debemos conservar por ley.',
	sections: [
		{
			id: 'solicitud',
			title: '1. Cómo pedir la eliminación',
			paragraphs: [
				`Escribe a ${LEGAL_ENTITY.email} con el asunto «Eliminación de datos», desde el correo asociado a tu cuenta. Indica el nombre del negocio y si quieres borrar toda la cuenta o solo desconectar WhatsApp.`,
				'Si eres cliente de un comercio que usa PlacePos y escribiste a su WhatsApp, puedes pedirle al comercio que borre tu conversación, o escribirnos indicando el número desde el que escribiste y el nombre del comercio.',
				'Responderemos en un máximo de quince (15) días hábiles.'
			]
		},
		{
			id: 'whatsapp',
			title: '2. Desconectar WhatsApp',
			paragraphs: [
				'Puedes quitarle el acceso a PlacePos en cualquier momento desde Meta Business Suite → Configuración → Cuentas → Aplicaciones, o desde el Administrador de WhatsApp → Socios, quitando «PlacePOS Asistente».',
				'Al desconectarlo dejamos de recibir y de enviar mensajes en tu nombre y borramos el token de acceso. Si además pides la eliminación, borramos los identificadores de tu cuenta de WhatsApp Business y las conversaciones guardadas.'
			]
		},
		{
			id: 'que-borramos',
			title: '3. Qué borramos',
			paragraphs: [],
			items: [
				'Los datos de la cuenta y de los usuarios.',
				'El inventario, los clientes, los proveedores y la operación registrada.',
				'Las conversaciones del asistente y los pedidos tomados por WhatsApp o Telegram.',
				'Los tokens e identificadores de WhatsApp y de Telegram.',
				'Las imágenes y los archivos subidos.'
			]
		},
		{
			id: 'que-conservamos',
			title: '4. Qué conservamos',
			paragraphs: [
				'Por obligación legal conservamos los comprobantes de pago de la suscripción y la información contable y tributaria durante el tiempo que exige la ley colombiana. Las copias de seguridad se sobrescriben en su ciclo normal y no se usan para restaurar datos eliminados.'
			]
		}
	]
};

export const LEGAL_DOCS: readonly LegalDoc[] = [PRIVACY, TERMS, DATA_DELETION];

/** El documento de esa ruta; `undefined` si no existe. */
export const legalDocBySlug = (slug: string): LegalDoc | undefined =>
	LEGAL_DOCS.find((doc) => doc.slug === slug);

/** Fecha legible en español: "31 de octubre de 2026". */
export const formatLegalDate = (iso: string): string => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) {
		throw new Error(`Fecha legal inválida: ${iso}`);
	}
	const [, year, month, day] = match;
	const months = [
		'enero',
		'febrero',
		'marzo',
		'abril',
		'mayo',
		'junio',
		'julio',
		'agosto',
		'septiembre',
		'octubre',
		'noviembre',
		'diciembre'
	];
	const name = months[Number(month) - 1];
	if (!name || Number(day) < 1 || Number(day) > 31) {
		throw new Error(`Fecha legal inválida: ${iso}`);
	}
	return `${Number(day)} de ${name} de ${year}`;
};
