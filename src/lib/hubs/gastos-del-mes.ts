import type { HubData } from './types';

/**
 * Hub de decisión — "¿En qué se me va la plata?"
 * Arquetipo RAMIFICADO: gastos fijos del mes (default), transporte,
 * suscripciones y delivery, y qué conviene comprar (precio por kilo).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DATOS: la canasta básica y la tarifa de colectivo NO se inventan acá. Salen
 * de los módulos reales del repo:
 *   - CBA por adulto equivalente e ICE: src/lib/formulas/canasta-basica-hogar-inec-gasto-mensual.ts
 *   - coeficiente de menor: src/lib/formulas/costo-supermercado-canasta-basica.ts
 *   - tarifa, escala de frecuencia y tarifa social: src/lib/formulas/calculadora-sube-argentina-costo-viaje-gasto-mensual.ts
 * Si cambian allá, se actualizan acá. Son valores con fecha, no constantes
 * eternas: la tarifa de colectivo y la CBA se mueven todos los meses.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const hub: HubData = {
  slug: 'finanzas-personales/gastos-del-mes',
  title: '¿En qué se me va la plata? Calculadora de gastos del mes',
  description:
    'Cuánto se te va por mes en vivienda, comida, transporte, suscripciones y delivery, con el reparto por rubro en un solo gráfico. Usa la canasta básica del INDEC y la tarifa SUBE vigente. Incluye comparador de precio por kilo.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Presupuesto del hogar',
  h1: '¿En qué se me va la plata?',
  lede:
    'La respuesta casi nunca es "en una cosa grande": son cinco rubros medianos que juntos se comen el sueldo. Cargá lo que gastás y mirá el reparto real de tu mes, rubro por rubro.',
  stamps: ['Actualizado 27-07-2026', 'CBA y CBT del INDEC · tarifa SUBE vigente', '16 calculadoras adentro'],

  resultLabel: 'Tu gasto mensual',

  cases: {
    title: '¿Qué querés mirar?',
    intro: 'Partimos del panorama completo del mes. Si querés zoom en un rubro, cambialo.',
    items: [
      {
        id: 'fijos',
        label: 'Mis gastos fijos del mes',
        hint: 'El panorama completo',
        answer: 'El reparto de tu mes por rubro: vivienda, comida, transporte, suscripciones y delivery.',
        yes: [
          'Vivienda: alquiler o cuota, más expensas y servicios (luz, gas, agua, internet, celular)',
          'Comida en casa: lo que gastás en el súper, o la canasta básica total del INDEC según tu hogar',
          'Transporte: los viajes en colectivo del mes con la escala de descuentos SUBE aplicada',
          'Suscripciones, delivery y cigarrillos, que son los rubros que más se subestiman',
        ],
        warn: [
          'Si dejás el súper en $0 usamos la Canasta Básica Total del INDEC para tu composición de hogar: es un piso de subsistencia, no lo que gasta una familia promedio.',
          'No entran los gastos anuales prorrateados (patente, seguro, ABL, vacaciones): sumalos aparte para ver el número real.',
          'Las cuotas de tarjeta ya pagadas no son gasto nuevo del mes, pero sí comprometen ingresos futuros.',
        ],
        plazo:
          'la regla 50/30/20 sugiere que los gastos esenciales no pasen del 50% de tu ingreso neto. Si tu vivienda sola supera el 30%, el resto queda muy apretado.',
      },
      {
        id: 'transporte',
        label: 'Cuánto gasto en transporte',
        hint: 'SUBE con la escala aplicada',
        answer: 'El gasto mensual en colectivo con el descuento por viajes frecuentes ya calculado.',
        yes: [
          'Los primeros 20 viajes del mes van a tarifa plena; del 21 al 30 tienen 20% off, del 31 al 40 un 30% y del 41 en adelante un 40%',
          'El descuento es marginal: cada tramo paga su propio porcentaje, no se aplica plano sobre todo el mes',
          'La Tarifa Social Federal (55% off) se acumula con la escala por frecuencia',
          'La tarifa usada es el boleto mínimo de colectivo AMBA con SUBE registrada',
        ],
        warn: [
          'La tarifa cambia varias veces al año: verificá el valor vigente antes de tomar el número como definitivo.',
          'El subte, el tren y el colectivo interurbano tienen tarifas distintas y no entran en esta cuenta.',
          'El beneficio Red SUBE por combinar medios dentro de las 2 horas (50% y 75% off) es aparte y no está modelado acá.',
          'La SUBE tiene que estar nominalizada: sin registrar se paga la tarifa sin descuentos.',
        ],
        plazo:
          'la escala de descuentos se reinicia el 1 de cada mes: los viajes no se acumulan de un mes al siguiente.',
      },
      {
        id: 'suscripciones',
        label: 'Suscripciones y delivery',
        hint: 'Los gastos que no se ven',
        answer: 'Lo que se va en débitos automáticos, pedidos y cigarrillos, mensual y anual.',
        yes: [
          'Streaming, música, nube, gimnasio y todo lo que se debita solo todos los meses',
          'Delivery: los pedidos por semana se pasan a mes con 4,33 semanas, que es el promedio real',
          'Cigarrillos: el atado se divide por 20 para sacar el costo diario',
          'El total anual es la cifra que importa: es la que se compara con unas vacaciones o un electrodoméstico',
        ],
        warn: [
          'Las suscripciones anuales prepagas se ven baratas por mes pero cuestan igual: dividí el precio anual por 12.',
          'El costo real del delivery incluye el envío, el recargo por servicio y la propina, no sólo el precio del plato.',
          'Los aumentos de suscripciones suelen ser silenciosos: revisá el resumen de la tarjeta dos veces al año.',
        ],
        plazo:
          'las suscripciones se pueden dar de baja en cualquier momento y siguen activas hasta el fin del período pago: no se pierde la fracción.',
      },
      {
        id: 'compras',
        label: 'Qué me conviene comprar',
        hint: 'Precio por kilo o litro',
        answer: 'El precio unitario deja de mentir: se compara por kilo o por litro, no por envase.',
        yes: [
          'Se normaliza todo a precio por kilo o por litro, que es la única comparación honesta',
          'Sirve para envases distintos, packs, promos 2x1 y segundas marcas',
          'Muestra la diferencia porcentual y cuánto ahorrás llevando el más conveniente',
        ],
        warn: [
          'El envase más grande no siempre es el más barato por kilo: los packs promocionales a veces salen más caros por unidad.',
          'Si el producto se vence o se desperdicia, el precio por kilo más bajo deja de ser el más conveniente.',
          'La ley de defensa del consumidor obliga a exhibir el precio por unidad de medida en góndola: si no está, se puede reclamar.',
        ],
        plazo:
          'los precios de góndola se actualizan semanalmente: una comparación de hace un mes ya no sirve.',
      },
    ],
  },

  inputsTitle: 'Cargá tus números',
  inputsIntro:
    'Podés dejar los valores de ejemplo. Los campos que no aplican a tu caso quedan en cero y no molestan.',
  fields: [
    { id: 'alquiler', label: 'Alquiler o cuota + expensas', prefix: '$', value: '450.000', thousands: true },
    { id: 'servicios', label: 'Servicios (luz, gas, agua, internet, celular)', prefix: '$', value: '150.000', thousands: true },
    {
      id: 'supermercado',
      label: 'Súper y comida en casa',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Dejalo en 0 y usamos la Canasta Básica Total del INDEC para tu hogar.',
    },
    { id: 'adultos', label: 'Adultos en el hogar', type: 'number', min: 0, max: 12, value: 2 },
    { id: 'menores', label: 'Menores en el hogar', type: 'number', min: 0, max: 12, value: 1 },
    { id: 'viajesDia', label: 'Viajes en colectivo por día', type: 'number', min: 0, max: 12, value: 2 },
    { id: 'diasMes', label: 'Días que viajás por mes', type: 'number', min: 0, max: 31, value: 22 },
    {
      id: 'tarifaSocial',
      label: '¿Tenés Tarifa Social Federal?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí (jubilación, AUH, monotributo social…)' },
      ],
    },
    { id: 'suscripciones', label: 'Suscripciones por mes (streaming, música, gym)', prefix: '$', value: '35.000', thousands: true },
    { id: 'pedidosSemana', label: 'Pedidos de delivery por semana', type: 'number', min: 0, max: 30, value: 2 },
    { id: 'gastoPedido', label: 'Gasto promedio por pedido (con envío y propina)', prefix: '$', value: '18.000', thousands: true },
    { id: 'cigarrillosDia', label: 'Cigarrillos por día', type: 'number', min: 0, max: 80, value: 0 },
    { id: 'precioA', label: 'Producto A — precio', prefix: '$', value: '4.500', thousands: true },
    { id: 'cantidadA', label: 'Producto A — gramos o mililitros', type: 'number', min: 0, value: 900 },
    { id: 'precioB', label: 'Producto B — precio', prefix: '$', value: '7.200', thousands: true },
    { id: 'cantidadB', label: 'Producto B — gramos o mililitros', type: 'number', min: 0, value: 1500 },
  ],
  fineprint:
    'Es una estimación con datos públicos y tus números: no reemplaza el resumen de tu banco. La canasta del INDEC corresponde al Gran Buenos Aires y la tarifa de colectivo al AMBA; en el interior los valores cambian.',

  chart: {
    type: 'donut',
    title: 'El reparto de tu mes',
    caption:
      'Cada porción es un rubro del gasto mensual. El tamaño es proporcional a los pesos, así que la porción más grande es literalmente en lo que más se te va la plata.',
  },
  breakdownTitle: 'Rubro por rubro',
  breakdownIntro:
    'Los importes van en pesos por mes. Las filas que no son plata (viajes, porcentajes, precio por kilo) llevan su unidad indicada.',

  faq: [
    {
      q: '¿En qué se le va la plata a un hogar argentino?',
      a: 'Según la Encuesta Nacional de Gastos de los Hogares del INDEC, los tres rubros más pesados son alimentos y bebidas, vivienda y servicios, y transporte. Entre los tres suelen explicar cerca de dos tercios del gasto total. Lo que cambia de hogar a hogar es el orden: en los que alquilan, la vivienda pasa al primer puesto con comodidad.',
    },
    {
      q: '¿Cuánto sale la canasta básica hoy?',
      a: 'La Canasta Básica Alimentaria del INDEC para el Gran Buenos Aires está en $220.387 por adulto equivalente al mes, y la Canasta Básica Total —que suma vestimenta, transporte, salud y servicios— se obtiene multiplicándola por el coeficiente de Engel inverso de 2,20, o sea unos $484.851 por adulto equivalente. Un hogar de dos adultos y un chico equivale a 2,63 adultos equivalentes, así que la CBT ronda $1.275.000 mensuales.',
    },
    {
      q: '¿Qué es un adulto equivalente?',
      a: 'Es la unidad con la que el INDEC compara hogares de distinta composición. El varón de 30 a 60 años con actividad moderada vale 1,00 y el resto se pondera según sus requerimientos calóricos: una mujer adulta 0,77 y un menor alrededor de 0,63. Un hogar de dos adultos y un chico no equivale a tres canastas sino a unas 2,63.',
    },
    {
      q: '¿Cuánto gasto por mes en SUBE?',
      a: 'Se multiplican los viajes por día por los días que viajás y se aplica la escala de descuentos por frecuencia: los primeros 20 viajes van a tarifa plena, del 21 al 30 tienen 20% off, del 31 al 40 un 30% y del 41 en adelante un 40%. Con el boleto mínimo de colectivo AMBA en $728,28 y 44 viajes al mes, el gasto queda bastante por debajo de multiplicar 44 por la tarifa plena.',
    },
    {
      q: '¿La Tarifa Social se suma al descuento por viajes frecuentes?',
      a: 'Sí, los dos beneficios se acumulan. La Tarifa Social Federal descuenta el 55% de la tarifa y la escala por frecuencia se aplica sobre ese valor ya reducido. Corresponde a jubilados y pensionados, titulares de la AUH, monotributistas sociales, personal de casas particulares y beneficiarios de Progresar, entre otros.',
    },
    {
      q: '¿Cuánto se gasta en delivery sin darse cuenta?',
      a: 'La trampa es contar por pedido y no por mes. Dos pedidos por semana a $18.000 cada uno con envío y propina no son $36.000: son unos $156.000 al mes, porque el mes tiene 4,33 semanas y no 4. En un año eso son más de $1.800.000, que es la cifra que conviene mirar antes de decidir si vale la pena.',
    },
    {
      q: '¿Conviene comparar precios por kilo o por envase?',
      a: 'Siempre por kilo o por litro. El envase más grande suele ser más barato por unidad, pero no siempre: los packs promocionales y los formatos "familiares" muchas veces salen más caros por kilo que el envase mediano. La ley de defensa del consumidor obliga a que la góndola exhiba el precio por unidad de medida justamente por eso.',
    },
    {
      q: '¿Cuánto se ahorra por dejar de fumar?',
      a: 'Se divide el precio del atado por 20 para sacar el costo del cigarrillo y se multiplica por los que fumás al día. Con un atado a $5.000 y 10 cigarrillos diarios son unos $2.500 por día, $75.000 al mes y más de $900.000 al año. En diez años, sin contar aumentos, la cifra supera los nueve millones de pesos.',
    },
    {
      q: '¿Cuánto cuesta mantener un hijo por mes?',
      a: 'Depende sobre todo de la escuela y de la salud: con escuela pública y obra social el costo mensual se concentra en alimentación, ropa y actividades; con colegio privado la cuota sola suele ser el rubro más grande. En este hub el chico entra en la canasta como 0,63 de un adulto equivalente, que es el piso alimentario, no el costo total de criarlo.',
    },
    {
      q: '¿Qué porcentaje del sueldo debería ir a gastos fijos?',
      a: 'La regla más difundida es la 50/30/20: hasta 50% del ingreso neto en gastos esenciales, 30% en gustos y 20% en ahorro o pago de deudas. En un contexto inflacionario esa proporción se estira sola hacia los esenciales, así que sirve más como alarma que como meta: si los fijos superan el 70%, cualquier imprevisto entra por tarjeta.',
    },
    {
      q: '¿Cómo se calcula un descuento sobre un precio?',
      a: 'El precio final es el precio original multiplicado por (1 menos el porcentaje de descuento dividido 100). Un 30% off sobre $10.000 deja $7.000. Ojo con los descuentos encadenados: un 20% y después otro 20% no dan 40% sino 36%, porque el segundo se aplica sobre el precio ya rebajado.',
    },
  ],

  sources: [
    {
      name: 'Canasta Básica Alimentaria y Canasta Básica Total — informe mensual',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-43-149',
      publisher: 'INDEC',
    },
    {
      name: 'Metodología de la Canasta Básica — escala de adulto equivalente',
      url: 'https://www.indec.gob.ar/ftp/cuadros/sociedad/EPH_metodologia_22_pobreza.pdf',
      publisher: 'INDEC',
    },
    {
      name: 'Encuesta Nacional de Gastos de los Hogares — estructura del gasto',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-45-153',
      publisher: 'INDEC',
    },
    {
      name: 'Red SUBE — tarifas, escala de descuentos y Tarifa Social Federal',
      url: 'https://www.argentina.gob.ar/transporte/sube',
      publisher: 'Ministerio de Transporte',
    },
    {
      name: 'Precio por unidad de medida en góndola — Ley 24.240 de Defensa del Consumidor',
      url: 'https://www.argentina.gob.ar/normativa/nacional/ley-24240-638',
      publisher: 'Boletín Oficial de la República Argentina',
    },
  ],

  replaces: [
    '/calculadora-costo-supermercado-canasta-basica',
    '/calculadora-descuento-porcentaje-precio',
    '/calculadora-canasta-basica-hogar-inec-gasto-mensual',
    '/calculadora-sube-argentina-costo-viaje-gasto-mensual',
    '/calculadora-costo-hijo-mensual',
    '/calculadora-dias-sin-fumar-ahorro-salud',
    '/calculadora-gasto-tarjeta-sube-mensual',
    '/calculadora-costo-suscripciones-mensual',
    '/calculadora-ahorro-bicicleta-vs-auto-mensual',
    '/calculadora-precio-por-kilo-litro',
    '/calculadora-precio-por-unidad',
    '/calculadora-cuanto-gasto-en-delivery',
    '/calculadora-costo-streaming-argentina',
    '/calculadora-costo-recital-festival-argentina',
    '/calculadora-ahorro-dejar-cigarrillos',
    '/calculadora-comparador-precios',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Canasta Básica Alimentaria por adulto equivalente, GBA.
 * Fuente: INDEC, mayo 2026. Espejo de CBA_AE_DEFAULT en
 * src/lib/formulas/canasta-basica-hogar-inec-gasto-mensual.ts.
 */
export const CBA_AE = 220387;

/** Coeficiente de Engel inverso: CBT = CBA × ICE. INDEC, GBA. */
export const ICE = 2.2;

/** Escala de adulto equivalente, simplificada a adulto y menor. INDEC. */
export const AE_ADULTO = 1.0;
/** Coeficiente de menor usado por costo-supermercado-canasta-basica.ts. */
export const AE_MENOR = 0.63;

/**
 * Boleto mínimo (0-3 km) de colectivo AMBA con SUBE registrada, vigente jun-2026.
 * Fuente: Ministerio de Transporte. Espejo de TARIFAS.colectivo_amba.
 */
export const TARIFA_COLECTIVO = 728.28;

/** Escala mensual de descuento por frecuencia. MARGINAL: cada tramo paga su %. */
export const ESCALA_SUBE: Array<{ desde: number; hasta: number | null; off: number; label: string }> = [
  { desde: 1, hasta: 20, off: 0, label: 'Viajes 1 a 20' },
  { desde: 21, hasta: 30, off: 0.2, label: 'Viajes 21 a 30' },
  { desde: 31, hasta: 40, off: 0.3, label: 'Viajes 31 a 40' },
  { desde: 41, hasta: null, off: 0.4, label: 'Viajes 41 en adelante' },
];

/** Tarifa Social Federal: 55% off, acumulable con la escala por frecuencia. */
export const TARIFA_SOCIAL_OFF = 0.55;

/** Semanas promedio por mes (52 ÷ 12). Mismo valor que usa cuanto-gasto-en-delivery.ts. */
export const SEMANAS_MES = 4.33;

/** Cigarrillos por atado y precio de referencia de ahorro-dejar-fumar.ts. */
export const CIGARRILLOS_POR_ATADO = 20;
export const PRECIO_ATADO = 5000;
