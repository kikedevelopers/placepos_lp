import type { DocGroup, DocModule } from './docs.types';

export type { DocCapability, DocConcept, DocGroup, DocModule, DocRelation } from './docs.types';

/**
 * Contenido de la documentación. Escrito para alguien que NUNCA ha usado
 * PlacePos: cero jerga técnica, cada concepto con un ejemplo en pesos.
 *
 * Los `id` son anclas de la URL y los usa el índice lateral, el scrollspy y
 * los enlaces cruzados entre módulos (`relations.to`). Cambiar un id rompe
 * enlaces existentes.
 */
export const DOC_MODULES: DocModule[] = [
	// ─────────────────────────────────────────────────────────── Punto de venta
	{
		id: 'pos',
		icon: 'cart',
		kicker: 'Vender',
		title: 'Punto de venta',
		summary:
			'Es la pantalla donde tu negocio vende y cobra todos los días: buscas un producto, armas el ticket, cobras e imprimes. Todo lo que pasa por aquí mueve solo tu inventario, tu caja y tus informes — no tienes que anotar nada aparte.',
		capabilities: [
			{
				title: 'Buscar y escanear',
				desc: 'Encuentra productos por nombre, código de barras o SKU. Sirve el lector o el teclado, así nadie necesita saberse los precios de memoria.'
			},
			{
				title: 'Cantidades con decimales',
				desc: 'Vende 2,5 libras o 1,5 metros sin inventar redondeos que después descuadran el inventario.'
			},
			{
				title: 'Varias listas de precio',
				desc: 'Cada producto puede tener hasta cuatro precios (mostrador, mayorista, especial). Eliges cuál aplicar con un clic.'
			},
			{
				title: 'Precio personalizado',
				desc: 'Digitas un precio distinto para esa venta puntual. El sistema no te deja vender por debajo del costo.'
			},
			{
				title: 'Cálculo por monto',
				desc: '"Véndeme $10.000 de queso": digitas el monto y el sistema calcula la cantidad exacta a entregar.'
			},
			{
				title: 'Pago dividido',
				desc: 'Mezcla efectivo, transferencia, anticipo y crédito en una misma venta, como pasa de verdad en el mostrador.'
			},
			{
				title: 'Cliente al vuelo',
				desc: 'Creas el cliente sin salir del POS y ves su historial y lo que te debe antes de fiarle otra vez.'
			},
			{
				title: 'Gastos y caja a la mano',
				desc: 'Registras un gasto y ves el saldo de tu caja sin cambiar de pantalla. Al final cierras y cuadras.'
			},
			{
				title: 'Atajos de teclado',
				desc: 'F1 buscar, F4 registrar, F12 reimprimir la última, Esc limpiar. El mostrador no espera al mouse.'
			},
			{
				title: 'Sigue vendiendo sin internet',
				desc: 'Si se cae la red, la venta se guarda en cola y se sincroniza sola al volver. Nunca cobra dos veces la misma venta.'
			}
		],
		concepts: [
			{
				term: 'Registrar no es lo mismo que cobrar',
				desc: 'Un ticket nace como pedido: queda registrado pero todavía no descuenta inventario ni mueve la caja. Eso pasa cuando cobras. Así puedes armar pedidos y cobrarlos después.',
				example:
					'Armas el pedido a las 10:00 → el stock no baja.\nCobras a las 13:00 → ahí baja el stock y entra la plata.'
			},
			{
				term: 'Contado, crédito y anticipo',
				desc: 'Contado es que pagan en el momento. Crédito queda como deuda del cliente con fecha de vencimiento y exige tener cliente asignado. Anticipo es plata que el cliente ya te había abonado antes: al usarla no entra dinero nuevo a la caja, solo baja su saldo a favor.'
			},
			{
				term: 'Cálculo por monto',
				desc: 'En vez de decir cuánto pesa, dices cuánto quiere gastar el cliente y el sistema deduce la cantidad. El total cobrado es exactamente el monto pedido, sin centavos raros.',
				example: '$10.000 de queso a $17/gramo → 588,24 gramos. Total: $10.000 exactos.'
			},
			{
				term: 'Qué descuenta el stock',
				desc: 'Si vendes una presentación (media libra, paquete), el inventario se descuenta del producto padre en su unidad mínima, no de la presentación. Por eso nunca se descuadran entre sí.'
			}
		],
		relations: [
			{
				to: 'inventario',
				desc: 'solo vendes lo que exista en el catálogo, y cobrar descuenta su stock al instante.'
			},
			{
				to: 'tesoreria',
				desc: 'el efectivo entra a tu caja y la transferencia al banco que elijas.'
			},
			{
				to: 'clientes',
				desc: 'de aquí nacen los créditos y aquí se usa el saldo a favor del cliente.'
			},
			{
				to: 'domicilios',
				desc: 'después de cobrar puedes cargar el domicilio y asignárselo a un repartidor.'
			},
			{
				to: 'informes',
				desc: 'cada venta alimenta el tablero, el informe de ventas y el cierre del día.'
			}
		],
		flow: [
			'Abres el POS y ves el saldo de tu caja arriba.',
			'Buscas el producto (F1) y lo escaneas o lo tecleas.',
			'Defines cantidad y precio: normal, de otra lista, personalizado o por monto.',
			'Repites hasta armar el ticket. Ves total, ganancia y margen en vivo.',
			'Si vas a fiar o usar anticipo, asignas el cliente (es obligatorio).',
			'Registras la venta (F4) y cobras: efectivo te calcula las devueltas.',
			'Al confirmar baja el inventario, entra la plata y puedes imprimir o cargar el domicilio.',
			'Al terminar el día cierras la caja: cuentas el efectivo, registras la diferencia y la caja queda en su base.'
		]
	},

	// ─────────────────────────────────────────────────────── Clientes y créditos
	{
		id: 'clientes',
		icon: 'users',
		kicker: 'Vender',
		title: 'Clientes y créditos',
		summary:
			'Es la libreta de tus clientes: quién es cada uno, cuánto te ha comprado y cuánto te debe. Sirve para fiar con control (cada deuda queda con su saldo), para guardar plata que te dejan adelantada y para saber quién es buen cliente de verdad.',
		capabilities: [
			{
				title: 'Ficha del cliente',
				desc: 'Persona o empresa, con documento o NIT, contacto y dirección. Ves su saldo a favor y sus puntos.'
			},
			{
				title: 'Historial de compras',
				desc: 'Todas sus facturas con total, forma de pago, estado, ganancia y qué productos se llevó.'
			},
			{
				title: 'Historial por producto',
				desc: 'Filtras qué le has vendido por producto, número de factura o fechas. Útil cuando pregunta "¿a cómo me lo diste la vez pasada?".'
			},
			{
				title: 'Créditos pendientes',
				desc: 'Abres la lista de lo que te debe y el saldo total, sin buscar factura por factura.'
			},
			{
				title: 'Abonos',
				desc: 'Registras pagos parciales en efectivo o transferencia. Nunca te deja abonar más que el saldo.'
			},
			{
				title: 'Anticipos',
				desc: 'Recibes plata por adelantado: entra a la cuenta que elijas y le queda como saldo a favor.'
			},
			{
				title: 'Línea de tiempo del ticket',
				desc: 'Desde el crédito abres la factura y ves todo lo que le pasó, con fechas y montos.'
			},
			{
				title: 'Exportar el listado',
				desc: 'Te llevas tus clientes a una hoja con los campos que elijas.'
			}
		],
		concepts: [
			{
				term: 'Cómo nace y cómo muere un crédito',
				desc: 'Nace en el POS: al cobrar eliges Crédito y le pones fecha de vencimiento. Exige cliente asignado — sin cliente no te deja. Empieza Pendiente, pasa a Parcial cuando abona algo y a Pagado cuando los abonos cubren el total.',
				example:
					'Vendes $200.000 a crédito → Pendiente.\nAbona $80.000 → Parcial, saldo $120.000.\nPaga el resto → Pagado.'
			},
			{
				term: 'Anticipo: la plata entra antes',
				desc: 'El cliente deja plata adelantada y tú eliges a dónde entra: caja, banco o billetera. Después, al facturarle, "Anticipo" aparece como medio de pago y solo baja su saldo a favor: no entra dinero nuevo, porque ya había entrado.',
				example:
					'Deja $500.000 → entran a tu caja hoy.\nLe facturas $300.000 con anticipo → le quedan $200.000 a favor.'
			},
			{
				term: 'Los seis estados de una venta',
				desc: 'Cada factura guarda su propia línea de tiempo: creada, cobrada, crédito abierto, abono, pagada por completo y anulada. Los eventos de crédito y abono muestran el monto, así que siempre puedes reconstruir qué pasó y cuándo.'
			},
			{
				term: 'Reversar un pago',
				desc: 'Puedes eliminar un pago ya registrado: el dinero vuelve a la fuente de donde salió y la factura queda otra vez con saldo por cobrar. Si esa caja o banco no tiene fondos para devolverlo, no te deja y te explica por qué.'
			}
		],
		relations: [
			{ to: 'pos', desc: 'aquí nacen los créditos y aquí se gasta el saldo a favor.' },
			{
				to: 'tesoreria',
				desc: 'los anticipos y los abonos entran a la caja, banco o billetera que elijas.'
			},
			{ to: 'informes', desc: 'alimentan la cartera (quién te debe) y el recaudo real del día.' }
		],
		flow: [
			'En el POS armas el carrito y asignas el cliente (obligatorio para fiar).',
			'Cobras eligiendo Crédito y le pones fecha de vencimiento.',
			'Días después el cliente llega a pagar: abres sus créditos pendientes y ves el saldo.',
			'Entras a la factura y registras el abono en efectivo o transferencia.',
			'La plata entra a tesorería, el saldo baja y la factura pasa a Parcial o Pagada.'
		]
	},

	// ────────────────────────────────────────────────────────────── Domicilios
	{
		id: 'domicilios',
		icon: 'bike',
		kicker: 'Vender',
		title: 'Domiciliarios y entregas',
		summary:
			'Es el registro de quién lleva tus pedidos y de cada entrega hecha: a qué dirección fue, quién la recibió, cuánto costó el domicilio y quién lo pagó. Así sabes qué salió, con quién y cuánto te costó mover la mercancía.',
		capabilities: [
			{
				title: 'Empresas y motorizados',
				desc: 'Creas, editas y archivas a quienes reparten, con su dirección y hasta cuatro teléfonos.'
			},
			{
				title: 'Registrar la entrega',
				desc: 'Después de cobrar, cargas el domicilio: empresa, monto, dirección y quién recibe. Los datos del cliente vienen precargados.'
			},
			{
				title: 'Historial de domicilios',
				desc: 'Filtras por empresa, forma de pago o fecha, y anulas el que se registró por error.'
			},
			{
				title: 'Deuda con transportistas',
				desc: 'A quien te trae mercancía le llevas su deuda de flete aparte y le abonas desde caja, banco o billetera.'
			}
		],
		concepts: [
			{
				term: 'Quién paga el domicilio',
				desc: 'Al registrarlo eliges la modalidad, y de eso depende si tu caja se mueve o no. Contra entrega: lo paga el cliente al recibir y tu caja no se toca. De la caja: lo pagas tú y sale un egreso. Si anulas uno pagado de la caja, el egreso se revierte y tu saldo vuelve a subir.'
			},
			{
				term: 'Domiciliario no es lo mismo que transportista',
				desc: 'Se parecen pero van al revés. El domiciliario lleva tu mercancía al cliente. El transportista te trae mercancía a ti desde el proveedor: ese es el flete de tus compras, y a él tú le quedas debiendo.'
			}
		],
		relations: [
			{ to: 'pos', desc: 'el domicilio se registra justo después de cobrar la venta.' },
			{
				to: 'tesoreria',
				desc: 'si lo pagas tú, sale de tu caja; si es contra entrega, no la mueve.'
			},
			{
				to: 'compras',
				desc: 'el flete del transportista se paga desde su propia deuda, no desde aquí.'
			}
		]
	},

	// ─────────────────────────────────────────────────────────────── Inventario
	{
		id: 'inventario',
		icon: 'boxes',
		kicker: 'Abastecer',
		title: 'Inventario y catálogo',
		summary:
			'Es el catálogo maestro de todo lo que compras y vendes: qué tienes, cuánto te queda, cuánto te costó y a qué precio lo vendes. Todo el sistema bebe de aquí, así que un catálogo bien armado hace que el resto funcione solo.',
		capabilities: [
			{
				title: 'Productos y presentaciones',
				desc: 'Das de alta el producto y luego las formas de venderlo (por libra, por unidad, por paquete) sin duplicar existencias.'
			},
			{
				title: 'Empaques y categorías',
				desc: 'Hablas en cajas, libras o docenas en vez de contar unidad por unidad, y agrupas el catálogo para filtrar y medir por grupo.'
			},
			{
				title: 'Hasta 4 precios por producto',
				desc: 'Mostrador, mayorista, especial… cada uno con su ganancia y su margen calculados solos.'
			},
			{
				title: 'Fijar por precio o por margen',
				desc: 'Tecleas el precio y ves el margen, o tecleas el margen que quieres y el precio se calcula solo.'
			},
			{
				title: 'Stock y plata inmovilizada',
				desc: 'Ves cuántas referencias tienes, cuánto dinero está quieto en mercancía y qué está agotado.'
			},
			{
				title: 'Importar y exportar en Excel',
				desc: 'Cargas cientos de productos de golpe con vista previa y avisos de conflicto, o te llevas el catálogo a una hoja.'
			},
			{
				title: 'Matriz de análisis',
				desc: 'Cruza rotación contra margen y te dice qué empujar y qué sacar: Santo Grial, Estrella, Generador de tráfico o Perro.'
			},
			{
				title: 'Historial de costo',
				desc: 'Cada cambio queda registrado: si vino de una compra, de una edición manual o heredado del producto padre.'
			},
			{
				title: 'Disponible en venta / en compra',
				desc: 'Controlas si el producto aparece en el POS, en compras o en ambos, para que la materia prima no ensucie la caja.'
			},
			{
				title: 'Archivar sin perder historia',
				desc: 'Lo que ya no manejas desaparece del inventario activo, pero su historial queda intacto.'
			}
		],
		concepts: [
			{
				term: 'Producto base y presentación',
				desc: 'El base es el producto real: el que tiene el stock y el costo. La presentación es una forma de venderlo; cuelga del base y no tiene existencias propias. Así vendes de mil formas con un solo montón de mercancía y sin descuadres.',
				example:
					'Base: LINAZA X LIBRA → 20 libras en bodega, costo $3.705.\nPresentación: LINAZA MEDIA LIBRA → se vende a $3.000 y descuenta del mismo montón.'
			},
			{
				term: 'Empaque y su valor',
				desc: 'Un empaque es un nombre y un número: cuántas unidades base representa. Ese número es el que convierte lo que tú dices en lo que el sistema cuenta.',
				example:
					'LIBRA = 500 → una libra son 500 gramos.\nCAJA x12 = 12 → una caja son 12 unidades.'
			},
			{
				term: 'Unidad mínima',
				desc: 'Es la unidad más pequeña en que el sistema cuenta de verdad (gramos, unidades sueltas). Tú digitas "10 cajas" y por dentro guarda 120 unidades. Si mañana cambias el empaque de x12 a x24, tu mercancía física no cambia: solo se reagrupa y verás 5 cajas.'
			},
			{
				term: 'Peso variable',
				desc: 'Para lo que se vende a peso o por monto, la presentación no usa un empaque fijo: escribes la cantidad o dejas que se calcule desde el precio. El sistema arma el empaque por detrás; tú no lo administras.'
			},
			{
				term: 'El stock de la presentación se deriva del padre',
				desc: 'No se cuenta aparte: se calcula dividiendo el stock del padre entre el factor. Lo que sobra es la merma.',
				example:
					'Padre con 1.000 g, presentación MEDIA LIBRA (250) → 4 disponibles.\nPadre con 1.100 g → 4 disponibles y 100 g de merma.'
			},
			{
				term: 'Margen es sobre la venta',
				desc: 'Ganancia = precio − costo. Margen = ganancia ÷ precio × 100. Ojo: se calcula sobre el precio, no sobre el costo. El sistema no te deja guardar un precio por debajo del costo.',
				example: 'Costo $600, precio $1.000 → ganancia $400, margen 40%.'
			}
		],
		relations: [
			{ to: 'pos', desc: 'solo aparece en la caja lo marcado como disponible para venta.' },
			{ to: 'compras', desc: 'recibir mercancía sube el stock y recalcula el costo del producto.' },
			{
				to: 'informes',
				desc: 'la rentabilidad y el valor del inventario se calculan con estos costos: costo mal puesto, informe mal.'
			}
		],
		flow: [
			'Crea las categorías y los empaques que uses (LIBRA = 500, CAJA x12…).',
			'Nuevo producto: nombre, categoría, empaque, stock y costo.',
			'Pon el precio (o el margen) y agrega precios extra si manejas mayorista.',
			'Decide si va al POS, a compras o a ambos.',
			'Nueva presentación: eliges el padre, el empaque o el peso, y el precio. El costo y el stock salen solos.',
			'Si tienes muchos productos, usa la plantilla de Excel en vez de cargarlos uno a uno.'
		]
	},

	// ─────────────────────────────────────────────────────────────────── Compras
	{
		id: 'compras',
		icon: 'truck',
		kicker: 'Abastecer',
		title: 'Compras y proveedores',
		summary:
			'Aquí registras lo que le compras a tus proveedores: qué entró, a qué costo, cuánto pagó el flete y cómo lo pagaste. Cada compra actualiza sola tu inventario y el costo real de tus productos, que es lo que hace que la ganancia de tus ventas sea de verdad.',
		capabilities: [
			{
				title: 'Registrar la compra',
				desc: 'Eliges proveedor, fecha real de la factura y número. Si la factura aún no llega, queda como remisión.'
			},
			{
				title: 'Crear productos al vuelo',
				desc: 'Si el proveedor te trajo algo que no tienes en el catálogo, lo creas sin salir de la compra.'
			},
			{
				title: 'Flete y transportista',
				desc: 'Registras el costo del viaje y los kilos. El flete se maneja como una deuda aparte con el transportista.'
			},
			{
				title: 'Contado o crédito',
				desc: 'Toda compra nace con un saldo. Si la pagas completa de una, queda en cero; si no, queda debiendo.'
			},
			{
				title: 'Abonos desde donde quieras',
				desc: 'Pagas sacando la plata de una caja, un banco o una billetera. No te deja pagar si no hay fondos.'
			},
			{
				title: 'Abonar a varias facturas',
				desc: 'Seleccionas varias compras y abonas de una, como cuando el proveedor cobra todo junto.'
			},
			{
				title: 'Recibir la mercancía',
				desc: 'Confirmas quién recibió y cuándo. Ese es el momento exacto en que entra el stock.'
			},
			{
				title: 'Directorio de proveedores',
				desc: 'Contacto, asesor, NIT, cuentas para consignar y — lo importante — cuánto le debes hoy.'
			}
		],
		concepts: [
			{
				term: 'Recibir es lo que mueve el stock',
				desc: 'Al marcar la compra como recibida entra la mercancía (siempre en unidad mínima) y se recalcula el costo mezclando lo que ya tenías con lo que llegó: promedio ponderado. El IVA no entra al costo.',
				example:
					'Tenías 10.000 g a $2/g y llegan 20.000 g a $2,60/g.\nCosto nuevo = (10.000×2 + 20.000×2,60) ÷ 30.000 = $2,40/g.'
			},
			{
				term: 'El flete se reparte por peso',
				desc: 'El flete no es del proveedor, es del viaje — pero ese viaje encareció tu mercancía. El sistema lo reparte entre todo lo que venía en el camión, proporcional al peso, y lo suma al costo antes de promediar. Si lo ignoras, crees que ganas cuando en realidad estás vendiendo a pérdida.',
				example:
					'Flete $60.000 y llegaron 30.000 g → $2 por gramo de flete.\nEse $2 se suma al costo de cada gramo.'
			},
			{
				term: 'Compras como te venden, el sistema cuenta en unidad mínima',
				desc: 'Digitas "3 bultos" y por dentro guarda 150.000 g. El empaque es una comodidad para capturar; el inventario y el costo viven en la unidad mínima.'
			},
			{
				term: 'El costo baja a las presentaciones',
				desc: 'Si el producto tiene presentaciones, al cambiar el costo del base todas heredan el suyo: costo por unidad × el tamaño de cada presentación. No tienes que tocarlas una por una.'
			}
		],
		relations: [
			{
				to: 'inventario',
				desc: 'la recepción sube el stock y deja anotado el cambio de costo en su historial.'
			},
			{
				to: 'tesoreria',
				desc: 'cada abono sale de una caja, banco o billetera concreta y baja ese saldo.'
			},
			{
				to: 'pos',
				desc: 'el costo que usa la caja para calcular tu ganancia es el que dejó la última compra.'
			},
			{
				to: 'informes',
				desc: 'de aquí salen la deuda a proveedores, el flete pendiente y el costo que hace real tu ganancia.'
			}
		],
		flow: [
			'Abres Comprar y eliges el proveedor.',
			'Buscas cada producto y pones cantidad, costo e IVA.',
			'Asignas transportista, flete y kilos, y ajustas fecha y número de factura.',
			'Guardas: nace la compra con su saldo.',
			'Cuando llega la mercancía la marcas recibida → entra el stock y se recalcula el costo con el flete repartido.',
			'Abonas eligiendo de dónde sale la plata, hasta que el saldo llegue a cero.',
			'El flete se lo pagas al transportista aparte, desde su propia deuda.'
		]
	},

	// ────────────────────────────────────────────────────────────── Tesorería
	{
		id: 'tesoreria',
		icon: 'wallet',
		kicker: 'Tu dinero',
		title: 'Tesorería',
		summary:
			'Es donde el sistema lleva la cuenta de dónde está tu plata en cada momento: la caja del mostrador, tus billeteras y tus cuentas de banco. Cada peso que entra por una venta o sale por una compra queda registrado en una de esas fuentes, con su saldo siempre al día.',
		capabilities: [
			{
				title: 'Cajas, billeteras y bancos',
				desc: 'Creas cada bolsillo real de tu negocio con su saldo inicial y su nombre.'
			},
			{
				title: 'Bancos disponibles en el POS',
				desc: 'Marcas qué cuentas aparecen al cobrar por transferencia, para que la plata caiga donde toca.'
			},
			{
				title: 'Transferir entre fuentes',
				desc: 'Mueves plata de tu caja a una billetera, a un banco o a la caja de otro usuario, validando que haya saldo.'
			},
			{
				title: 'Ajustar el saldo',
				desc: 'Cuando la realidad no coincide con el sistema, corriges dejando escrito el motivo.'
			},
			{
				title: 'Historial de movimientos',
				desc: 'Cada fuente muestra entradas, salidas y traslados con concepto, monto, fecha y quién lo hizo.'
			},
			{
				title: 'Cierre de caja',
				desc: 'Cuentas el efectivo real, concilias sobrante o faltante y mandas el excedente a donde quieras.'
			}
		],
		concepts: [
			{
				term: 'Qué es una fuente de dinero',
				desc: 'Un bolsillo real: la caja (el efectivo del mostrador, una por usuario), la billetera (Nequi, una caja fuerte) o el banco. Se separan porque no es lo mismo tener $2.000.000 en el cajón que en el banco: si todo estuviera junto nunca sabrías cuánto puedes sacar hoy en efectivo.'
			},
			{
				term: 'Base o fondo fijo',
				desc: 'La plata que siempre se queda en el cajón para dar vueltas. Al cerrar, el sistema te propone mover el excedente y deja la caja exactamente en la base, lista para mañana.',
				example: 'Base $200.000. Cierras con $850.000 → propone mover $650.000 y deja $200.000.'
			},
			{
				term: 'Recaudo es plata que entró de verdad',
				desc: 'Es efectivo + transferencias + abonos de clientes. El valor de un crédito no es recaudo: es una venta, pero no entró plata. Y cuando el cliente abona después, ese recaudo va aparte de las ventas del día — si no, contarías la misma venta dos veces.'
			}
		],
		relations: [
			{
				to: 'pos',
				desc: 'el efectivo entra a la caja del cajero y la transferencia al banco elegido.'
			},
			{
				to: 'compras',
				desc: 'al pagarle al proveedor eliges de qué fuente sale y ese saldo baja.'
			},
			{ to: 'gastos', desc: 'todo gasto baja el saldo de la fuente de la que salió.' },
			{ to: 'clientes', desc: 'los abonos entran como recaudo real a la fuente donde los recibes.' }
		],
		flow: [
			'Crea tus fuentes: la caja del mostrador, tus billeteras y tus cuentas de banco.',
			'Marca qué bancos deben aparecer en el POS al cobrar por transferencia.',
			'Define la base de caja: cuánto efectivo debe quedar siempre para vueltas.',
			'Durante el día, la plata entra y sale sola según lo que hagas en el POS, compras y gastos.',
			'Al cerrar, cuentas el efectivo real y mandas el excedente a un banco o billetera.'
		]
	},

	// ────────────────────────────────────────────────────────────────── Gastos
	{
		id: 'gastos',
		icon: 'receipt',
		kicker: 'Tu dinero',
		title: 'Gastos',
		summary:
			'Aquí registras todo lo que sale del negocio y no es mercancía: arriendo, servicios, sueldos, un domicilio, un almuerzo. Indicas de qué fuente salió y el sistema baja ese saldo solo.',
		capabilities: [
			{
				title: 'Gasto variable',
				desc: 'Monto, descripción y de dónde salió la plata. El saldo de esa fuente baja al instante.'
			},
			{
				title: 'Gasto fijo con periodicidad',
				desc: 'Lo defines una vez y se va generando solo, corte tras corte, sin que tengas que acordarte.'
			},
			{
				title: 'Pagos totales o por abonos',
				desc: 'Pagas el corte completo o de a poco, eligiendo de qué fuente sale cada abono.'
			},
			{
				title: 'Anular y devolver',
				desc: 'Si te equivocaste, anulas: el gasto queda marcado y la plata vuelve sola a la fuente de donde salió.'
			}
		],
		concepts: [
			{
				term: 'Los gastos fijos NO restan de la ganancia del día',
				desc: 'Esta es la regla que más confunde, y es a propósito. El arriendo no es culpa de las ventas de hoy: es un costo del mes entero. Si el día que pagas $3.000.000 de arriendo se lo restaras a la ganancia de ese día, ese martes parecería una catástrofe y los otros 29 días se verían falsamente buenos. Por eso el gasto fijo sí baja el saldo real de tu fuente (la plata salió), pero no distorsiona la ganancia diaria. Los variables sí restan, porque son plata que se fue ese día por operar ese día.',
				example:
					'Domicilio $80.000 (variable) → sí resta de la ganancia de hoy.\nArriendo $3.000.000 (fijo) → baja tu caja, pero no la ganancia del día.'
			},
			{
				term: 'Cada corte va por el monto completo',
				desc: 'Quincenal genera un corte el 15 y otro el último día del mes, cada uno por el monto completo. Mensual genera uno al cierre del mes. Cada corte queda pendiente, abonado o pagado.',
				example:
					'Sueldo quincenal de $700.000 → $700.000 el 15 y $700.000 el 30 = $1.400.000 al mes.'
			}
		],
		relations: [
			{
				to: 'tesoreria',
				desc: 'todo gasto baja el saldo de la caja, billetera o banco que elijas.'
			},
			{
				to: 'informes',
				desc: 'los variables se restan de la ganancia del día; los fijos se listan aparte y son lo que la meta del mes debe cubrir.'
			},
			{
				to: 'pos',
				desc: 'puedes registrar un gasto sin salir de la caja y sale de tu propia caja.'
			}
		],
		flow: [
			'Gastas $80.000 en un domicilio: nuevo gasto variable con monto, descripción y fuente.',
			'El saldo de la caja baja de una.',
			'Si te equivocaste, anulas y la plata vuelve sola.',
			'Para el arriendo o los sueldos, créalos como gasto fijo con su periodicidad y olvídate: los cortes se generan solos.',
			'Cada corte lo pagas completo o por abonos, desde la fuente que quieras.'
		]
	},

	// ────────────────────────────────────────────────────────────────── Informes
	{
		id: 'informes',
		icon: 'chart',
		kicker: 'Entender',
		title: 'Informes e inicio',
		summary:
			'Inicio te dice en vivo cómo va el negocio hoy y qué tan cerca estás de la meta del mes. Informes es el detalle: qué se vendió, quién te debe, cuánto entró de verdad. Entre los dos responden la pregunta del dueño: ¿estoy ganando plata, o solo moviendo mercancía?',
		capabilities: [
			{
				title: 'Meta del mes y cuota de hoy',
				desc: 'Defines cuánto necesitas ganar al mes y en cuántos días. Te muestra el avance y cuánto te falta hoy.'
			},
			{
				title: 'Rendimiento por día',
				desc: 'Ventas, ganancia, créditos y gastos graficados por día: 7 días, 30, este mes o el rango que quieras.'
			},
			{
				title: 'Informe de ventas',
				desc: 'Qué facturas se hicieron, por quién, a quién y con qué ganancia. Con filtros por fecha, cliente, categoría o anulados.'
			},
			{
				title: 'Cartera',
				desc: 'Quién te debe, cuánto y desde cuándo. Pendientes, vencidas o pagadas, con exportación e impresión.'
			},
			{
				title: 'Comparativa',
				desc: '¿Voy mejor o peor? Compara semanas, meses o trimestres, o el mismo día contra meses anteriores.'
			},
			{
				title: 'Finanzas del día y por rango',
				desc: 'Ventas, recaudo de cartera, créditos nuevos, compras y saldos de tus fuentes, para un día o un período.'
			},
			{
				title: 'Cajeros',
				desc: 'Cuánto vendió y ganó cada cajero, con su ticket de cierre imprimible.'
			},
			{
				title: 'Análisis de clientes',
				desc: 'Quién compra seguido, quién gasta más y quién se está perdiendo, según hace cuánto no vuelve.'
			}
		],
		concepts: [
			{
				term: 'Ganancia cobrada vs. devengada',
				desc: 'Son dos lecturas del mismo día. La devengada es la ganancia de todo lo vendido, incluso lo fiado. La cobrada es solo la del dinero que efectivamente entró. La que manda — la que mueve tu meta del mes — es la COBRADA: un crédito no cuenta hasta que se cobra.',
				example:
					'Vendes $500.000 fiados con $150.000 de ganancia.\nGanancia devengada del día: +$150.000.\nMeta del mes: no se mueve hasta que el cliente abone.'
			},
			{
				term: 'Cómo se cuenta una venta a crédito',
				desc: 'Cuenta como venta del día y suma a la ganancia devengada, pero no toca la caja: no entra al recaudo ni a la ganancia cobrada. Lo mismo con los pedidos: facturan, pero sin cobro no hay caja.'
			},
			{
				term: 'El recaudo de cartera va en su propio bloque',
				desc: 'Si un cliente abona hoy $200.000 de una deuda vieja, eso es plata real de hoy, pero no es una venta de hoy. Por eso aparece aparte: si se sumara a las ventas, contarías la misma venta dos veces.'
			},
			{
				term: 'Punto de equilibrio',
				desc: 'Pones cuánto necesitas ganar al mes para cubrir tus gastos fijos y en cuántos días repartirlo. El sistema saca tu cuota diaria y te muestra si vas arriba o abajo.',
				example: 'Meta $13.000.000 en 26 días → cuota diaria $500.000.'
			}
		],
		relations: [
			{ to: 'pos', desc: 'de cada venta salen las cifras de ventas, ganancia y cajeros.' },
			{ to: 'compras', desc: 'aportan el costo real y la deuda con proveedores.' },
			{
				to: 'gastos',
				desc: 'los variables bajan la ganancia del día; los fijos son lo que la meta debe cubrir.'
			},
			{ to: 'clientes', desc: 'alimentan la cartera y el recaudo de abonos.' },
			{
				to: 'equipo',
				desc: 'los permisos deciden quién ve ganancias y si ve solo sus ventas o las de todos.'
			}
		],
		flow: [
			'Abre Inicio y mira si cumpliste la cuota de hoy.',
			'Revisa el resumen del día: efectivo, transferencias, créditos y gastos.',
			'Si algo no cuadra, entra a Finanzas → Resumen del día y compara ventas contra recaudo.',
			'Cierra con el informe de Cajeros e imprime el cierre.',
			'Para el mes: Resumen extendido, Comparativa contra el mes pasado y Cartera para perseguir lo que te deben.'
		]
	},

	// ──────────────────────────────────────────────────────────────── Equipo
	{
		id: 'equipo',
		icon: 'shield',
		kicker: 'Tu equipo',
		title: 'Empleados y permisos',
		summary:
			'Aquí registras a quienes trabajan contigo y decides qué puede ver y hacer cada uno. Un empleado puede ser solo una ficha de contacto o tener usuario para entrar; el rol que le des determina qué menús aparecen en su pantalla.',
		capabilities: [
			{
				title: 'Ficha del empleado',
				desc: 'Datos, acceso, permisos del POS e historial de su caja, organizados en pestañas.'
			},
			{
				title: 'Dar o quitar acceso',
				desc: 'Creas usuario y contraseña, activas el ingreso y ves su última conexión.'
			},
			{
				title: 'Archivar en vez de borrar',
				desc: 'Si deja de trabajar contigo, pierde el acceso y su ficha queda en solo lectura, sin borrar su historial.'
			},
			{
				title: 'Permiso de ver la caja',
				desc: 'Si lo apagas, el empleado no ve el saldo ni el historial de caja en el punto de venta.'
			},
			{
				title: 'Permiso de ver ganancias',
				desc: 'Controla si ve utilidad y margen. Puedes afinar por separado si ve el margen (%) o la ganancia ($).'
			},
			{
				title: 'Roles de fábrica',
				desc: 'Administrador (acceso total, no se puede editar), Cajero y Vendedor. Puedes crear los tuyos.'
			},
			{
				title: 'Permisos por área',
				desc: '22 permisos agrupados: catálogos, tesorería, terceros, proveedores, informes, operación y sistema.'
			},
			{
				title: 'Base de caja y ajustes',
				desc: 'Fijas con cuánto efectivo abre cada quien y corriges su saldo dejando la nota del porqué.'
			}
		],
		concepts: [
			{
				term: 'Dueño y empleado no son lo mismo',
				desc: 'El dueño ve todo siempre: ganancias, márgenes y caja, sin depender de ningún permiso. El empleado depende de su rol y de sus permisos individuales. Hay áreas reservadas al dueño aunque el empleado sea Administrador: tu cuenta, los consecutivos, las alertas y los respaldos.'
			},
			{
				term: 'El rol decide qué menús ve',
				desc: 'Los permisos encienden o apagan secciones completas. El más importante es "ver ventas de todos los cajeros": sin él, el empleado solo ve las suyas. Vendedor es el rol más restringido — solo el POS y sus propias ventas.'
			},
			{
				term: 'Hay permisos que van por persona, no por rol',
				desc: 'Ver caja y ver ganancias/márgenes se configuran en la ficha de cada empleado. Dos cajeros con el mismo rol pueden ver cosas distintas.'
			}
		],
		relations: [
			{ to: 'pos', desc: 'deciden si el cajero ve el saldo de caja y la ganancia al vender.' },
			{ to: 'informes', desc: 'separan al que audita todo del que solo consulta lo suyo.' },
			{
				to: 'tesoreria',
				desc: 'cada empleado tiene su caja, con su base, sus ajustes y su historial.'
			}
		],
		flow: [
			'Empleados → nuevo empleado: nombre, teléfono, correo.',
			'En su ficha, pestaña Acceso: creas usuario y contraseña y activas el ingreso.',
			'Le asignas el rol: Cajero, o Vendedor si solo debe ver sus propias ventas.',
			'En la pestaña P.O.S apagas "ver ganancias" si no quieres que conozca tus utilidades.',
			'Defines su base de caja y le entregas usuario y contraseña.',
			'Si se va, lo archivas: pierde el acceso y su historial queda intacto.'
		]
	},

	// ─────────────────────────────────────────────────────────── Configuración
	{
		id: 'configuracion',
		icon: 'gear',
		kicker: 'Tu equipo',
		title: 'Configuración',
		summary:
			'Es el panel de control del negocio: los datos de tu empresa, cómo se comporta el punto de venta, la impresora de tickets, las alertas, los respaldos y tu suscripción. Algunas secciones las puede tocar un empleado con permiso; otras son solo tuyas.',
		capabilities: [
			{
				title: 'Mi negocio',
				desc: 'Los datos de la empresa y, solo para el dueño, los consecutivos: prefijos y numeración de tus facturas.'
			},
			{
				title: 'Ajustes del punto de venta',
				desc: 'Márgenes sugeridos, control estricto de stock, puntos de cliente e incluir o no los pedidos en los informes.'
			},
			{
				title: 'Impresora',
				desc: 'Configuras la impresora térmica de tickets para que la factura salga como debe.'
			},
			{
				title: 'Alertas',
				desc: 'Aviso automático de clientes que llevan mucho sin comprar. Puedes lanzarlo cuando quieras.'
			},
			{
				title: 'Respaldos',
				desc: 'Generas un archivo con toda tu base de datos, o la restauras. Solo dueño, y no aplica en la nube.'
			},
			{
				title: 'Tema y cuenta',
				desc: 'Apariencia clara u oscura, tus datos, tu contraseña y el estado de tu suscripción.'
			}
		],
		concepts: [
			{
				term: 'Modo local y modo nube',
				desc: 'Al instalar eliges: Servidor (los datos viven en ese equipo, para la caja principal), Cliente (se conecta al servidor por la red del local) o Cloud (los datos viven en la nube, entras desde donde estés y necesitas internet). En la nube tienes sucursales; en local, los respaldos son tuyos.'
			},
			{
				term: 'Sucursales',
				desc: 'En modo nube creas sucursales y cambias entre ellas desde el menú. Cada una tiene sus datos aislados, y hay un límite según tu plan.'
			},
			{
				term: 'Suscripción',
				desc: 'Un semáforo te avisa cuánto te queda: verde con más de 6 meses, amarillo entre 1 y 6, rojo el último mes. Al vencer, el sistema se bloquea hasta renovar.'
			},
			{
				term: 'Actualizaciones',
				desc: 'La app busca versiones nuevas sola y te avisa en la barra inferior. No tienes que descargar nada a mano.'
			}
		],
		relations: [
			{ to: 'pos', desc: 'los ajustes cambian cómo se comporta la caja al vender.' },
			{ to: 'equipo', desc: 'el permiso de configuración decide quién entra aquí.' },
			{
				to: 'informes',
				desc: 'la meta del mes y si los pedidos cuentan como ingreso se definen aquí.'
			}
		]
	}
];

/** Índice lateral: agrupa los módulos por el momento del negocio en que los usas. */
export const DOC_GROUPS: DocGroup[] = [
	{ title: 'Vender', moduleIds: ['pos', 'clientes', 'domicilios'] },
	{ title: 'Abastecer', moduleIds: ['inventario', 'compras'] },
	{ title: 'Tu dinero', moduleIds: ['tesoreria', 'gastos'] },
	{ title: 'Entender', moduleIds: ['informes'] },
	{ title: 'Tu equipo', moduleIds: ['equipo', 'configuracion'] }
];
