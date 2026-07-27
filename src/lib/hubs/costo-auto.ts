import type { HubData } from './types';
import { ALICUOTAS } from './patente';
import { DEPRECIACION_ANUAL, DEPRECIACION_PISO } from './auto-vs-uber';
import { NAFTA_POR_PROVINCIA, NAFTA_NACIONAL, NAFTA_META } from '../data/nafta-precios';

/**
 * Hub de decisión — "¿Cuánto me cuesta por año tener el auto?"
 *
 * Es el PARAGUAS del silo /auto: el costo total de propiedad (TCO). Los otros
 * cuatro hubs son las partes y se linkean desde la FAQ, no se duplican:
 *   /auto/patente        → la patente en detalle (escalas, cuotas, motos)
 *   /auto/consumo        → cuánto consume el auto de verdad
 *   /auto/mantenimiento  → neumáticos, aceite, correa, service
 *   /auto/auto-o-uber    → el umbral contra Uber, remis o transporte público
 *
 * Constantes IMPORTADAS, no duplicadas:
 *   - `ALICUOTAS` de `./patente` (alícuota provincial de patente)
 *   - `DEPRECIACION_ANUAL` (8%) y `DEPRECIACION_PISO` (40%) de `./auto-vs-uber`,
 *     que son la regla de valuación fiscal automotor
 *   - precios de combustible de `../data/nafta-precios` (Secretaría de Energía)
 *
 * Absorbe 8 calculadoras sueltas (ver `replaces`).
 */

/** Disclaimer textual de `getCalculatorDisclaimer('finance', 'es')`. */
const DISCLAIMER_FINANZAS =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export { ALICUOTAS, NAFTA_POR_PROVINCIA, NAFTA_NACIONAL, NAFTA_META };

/**
 * Puente entre las tres tablas: la clave de alícuota de patente, la clave de
 * la tabla de combustibles (que viene con los nombres de la Secretaría de
 * Energía) y el costo anual de VTV.
 *
 * VTV: mismos valores que usa `simulador-costo-mantener-auto.ts`
 * (CABA 55.000 · PBA 48.000 · Córdoba 42.000 · Santa Fe 45.000 · resto 50.000).
 */
export const VTV_DEFAULT = 50_000;
export const VTV_EDAD_MINIMA = 3;

export const PROVINCIAS: Record<string, { nombre: string; nafta: string; vtv: number }> = {
  caba: { nombre: 'CABA', nafta: 'Capital Federal', vtv: 55_000 },
  'buenos-aires': { nombre: 'Buenos Aires (PBA)', nafta: 'Buenos Aires', vtv: 48_000 },
  catamarca: { nombre: 'Catamarca', nafta: 'Catamarca', vtv: VTV_DEFAULT },
  chaco: { nombre: 'Chaco', nafta: 'Chaco', vtv: VTV_DEFAULT },
  chubut: { nombre: 'Chubut', nafta: 'Chubut', vtv: VTV_DEFAULT },
  cordoba: { nombre: 'Córdoba', nafta: 'Cordoba', vtv: 42_000 },
  corrientes: { nombre: 'Corrientes', nafta: 'Corrientes', vtv: VTV_DEFAULT },
  'entre-rios': { nombre: 'Entre Ríos', nafta: 'Entre Rios', vtv: VTV_DEFAULT },
  formosa: { nombre: 'Formosa', nafta: 'Formosa', vtv: VTV_DEFAULT },
  jujuy: { nombre: 'Jujuy', nafta: 'Jujuy', vtv: VTV_DEFAULT },
  'la-pampa': { nombre: 'La Pampa', nafta: 'La Pampa', vtv: VTV_DEFAULT },
  'la-rioja': { nombre: 'La Rioja', nafta: 'La Rioja', vtv: VTV_DEFAULT },
  mendoza: { nombre: 'Mendoza', nafta: 'Mendoza', vtv: VTV_DEFAULT },
  misiones: { nombre: 'Misiones', nafta: 'Misiones', vtv: VTV_DEFAULT },
  neuquen: { nombre: 'Neuquén', nafta: 'Neuquen', vtv: VTV_DEFAULT },
  'rio-negro': { nombre: 'Río Negro', nafta: 'Rio Negro', vtv: VTV_DEFAULT },
  salta: { nombre: 'Salta', nafta: 'Salta', vtv: VTV_DEFAULT },
  'san-juan': { nombre: 'San Juan', nafta: 'San Juan', vtv: VTV_DEFAULT },
  'san-luis': { nombre: 'San Luis', nafta: 'San Luis', vtv: VTV_DEFAULT },
  'santa-cruz': { nombre: 'Santa Cruz', nafta: 'Santa Cruz', vtv: VTV_DEFAULT },
  'santa-fe': { nombre: 'Santa Fe', nafta: 'Santa Fe', vtv: 45_000 },
  'santiago-estero': { nombre: 'Santiago del Estero', nafta: 'Santiago Del Estero', vtv: VTV_DEFAULT },
  'tierra-del-fuego': { nombre: 'Tierra del Fuego', nafta: 'Tierra Del Fuego', vtv: VTV_DEFAULT },
  tucuman: { nombre: 'Tucumán', nafta: 'Tucuman', vtv: VTV_DEFAULT },
};

/**
 * Depreciación ECONÓMICA por caso (la que sale de tu patrimonio).
 *  - `tasa` anual sobre el valor de origen
 *  - `piso` fracción del valor por debajo de la cual la tabla deja de bajar
 *  - `vtv` si corresponde prorratear la verificación técnica
 *
 * El 8% con piso 40% es la regla de valuación fiscal automotor (importada de
 * `auto-vs-uber`). El 20% del primer año y el 12% del uso intensivo salen de
 * `simulador-costo-mantener-auto.ts`. Todo se calcula sobre el valor que el
 * auto tiene HOY (el campo que carga el usuario), así que no se le vuelve a
 * aplicar la quita por antigüedad: eso sería descontar dos veces. El piso del
 * 40% sólo se usa para saber a partir de qué antigüedad (7,5 años) la tabla
 * fiscal dejó de bajar.
 */
export const CASE_MATH: Record<string, { tasa: number; piso: number; vtv: boolean }> = {
  usado: { tasa: DEPRECIACION_ANUAL, piso: DEPRECIACION_PISO, vtv: true },
  okm: { tasa: 0.2, piso: 0, vtv: false },
  trabajo: { tasa: 0.12, piso: DEPRECIACION_PISO, vtv: true },
  guardado: { tasa: DEPRECIACION_ANUAL, piso: DEPRECIACION_PISO, vtv: true },
};

/** Regla fiscal de la patente: siempre 8% anual con piso del 40%. */
export const FISCAL = { tasa: DEPRECIACION_ANUAL, piso: DEPRECIACION_PISO };

export const hub: HubData = {
  slug: 'auto/costo-anual',
  title: '¿Cuánto cuesta tener un auto por año? Costo real por kilómetro',
  description:
    'Sumá todo lo que te cuesta el auto en un año: nafta, seguro, patente, service, VTV, cochera y la depreciación que casi nadie cuenta. Con precios de combustible por provincia y la alícuota de patente de tu jurisdicción.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Costo total de propiedad',
  h1: '¿Cuánto me cuesta por año tener el auto?',
  lede:
    'La nafta se siente todos los meses, pero es menos de la mitad de lo que te sale el auto. El número que importa es el costo por kilómetro real: todo lo que gastás en un año —incluida la plata que el auto pierde de valor mientras está parado— dividido por los kilómetros que hacés. Ese es el número que casi nadie calcula y el único que sirve para comparar contra un remis, un alquiler o no tener auto.',
  stamps: [
    `Nafta ${NAFTA_META.mes} · Secretaría de Energía`,
    'Alícuota de patente por provincia',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Costo total del auto por año',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Lo único que cambia entre un caso y otro es a qué velocidad el auto pierde valor y si te toca VTV. Todo se calcula sobre el valor que el auto tiene hoy, así que la patente sale igual en los cuatro casos: es un impuesto sobre la valuación vigente, no sobre cómo lo uses.',
    items: [
      {
        id: 'usado',
        label: 'Tengo un auto usado y lo uso para moverme',
        hint: 'El caso típico: un auto de algunos años, uso particular, VTV al día.',
        yes: [
          'Depreciación del 8% anual sobre el valor que el auto tiene hoy (tasa de la tabla de valuación fiscal)',
          'Patente provincial sobre la valuación fiscal vigente',
          'Nafta según los kilómetros que declarás y el precio de tu provincia',
          'VTV prorrateada si el auto tiene 3 años o más',
          'Seguro y cochera: lo que vos pagás de verdad',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Pasados unos 7 años y medio el auto toca el piso del 40% de la tabla fiscal y deja de depreciar a efectos de tabla, pero en el mercado real puede seguir bajando',
          'El mantenimiento estimado es un promedio: una correa de distribución o un embrague te rompen el año',
        ],
        plazo: 'la patente vence por cuotas a lo largo del año y la VTV, según el último dígito de la patente.',
        answer:
          'Un auto usado de uso particular cuesta bastante más que la nafta: sumando patente, seguro, service, VTV y depreciación, el gasto anual suele triplicar el del combustible.',
      },
      {
        id: 'okm',
        label: 'Es 0 km o lo compré este año',
        hint: 'El primer año es el más caro de todos, y no por el service.',
        yes: [
          'Depreciación del 20% en el primer año: es la caída de valor apenas sale de la concesionaria',
          'Sin VTV: los autos nuevos están exentos los primeros años',
          'Mantenimiento bajo, en general cubierto por garantía',
          'Patente alta, porque la valuación fiscal de un auto nuevo es la más alta de toda su vida',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'La depreciación del primer año es plata real: si lo vendés a los 12 meses, la perdiste',
          'El seguro de un 0 km es más caro y suele exigirse todo riesgo si el auto está prendado',
        ],
        plazo: 'la primera VTV se exige a partir del tercer año en la mayoría de las jurisdicciones.',
        answer:
          'En un 0 km la depreciación del primer año se lleva cerca del 20% del valor y es, lejos, el gasto más grande del año — más que la nafta, el seguro y la patente juntos.',
      },
      {
        id: 'trabajo',
        label: 'Lo uso para trabajar (apps, reparto, viajante)',
        hint: 'Muchos kilómetros: el auto se gasta más rápido y el mantenimiento se dispara.',
        yes: [
          'Depreciación del 12% anual: el uso intensivo acelera la pérdida de valor',
          'Mantenimiento estimado con la fórmula por kilómetro, que crece cuando pasás los 15.000 km al año',
          'VTV prorrateada si el auto tiene 3 años o más',
          'El número a mirar es el costo por kilómetro: compará contra la tarifa que cobrás',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Si el costo por kilómetro se acerca a lo que cobrás por kilómetro, estás trabajando para el auto',
          'El seguro particular puede no cubrir el uso comercial: revisá la póliza antes de asumir que estás cubierto',
        ],
        plazo: 'con uso intensivo el service deja de ser anual y pasa a marcarlo el kilometraje, no el calendario.',
        answer:
          'Con el auto como herramienta de trabajo el costo por kilómetro es el único número que importa: es el piso por debajo del cual cada viaje te hace perder plata.',
      },
      {
        id: 'guardado',
        label: 'Casi no lo uso, lo tengo para emergencias',
        hint: 'Pocos kilómetros: los costos fijos se reparten entre muy poca distancia.',
        yes: [
          'Depreciación del 8% anual: el auto pierde valor aunque no lo muevas',
          'Patente, seguro, VTV y cochera se pagan igual, manejes o no',
          'Nafta casi nula, así que el costo por kilómetro se dispara',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Con pocos kilómetros el costo por kilómetro puede superar la tarifa de un remis: mirá /auto/auto-o-uber antes de renovar el seguro',
          'Un auto parado también se rompe: batería, cubiertas y gomas de sellado se arruinan por no usarse',
        ],
        plazo: 'la patente y el seguro no se prorratean por uso: se pagan completos aunque el auto no salga.',
        answer:
          'Si hacés pocos kilómetros, casi todo lo que gastás son costos fijos y el costo por kilómetro se vuelve altísimo: es el escenario donde no tener auto suele convenir.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu auto',
  inputsIntro:
    'Con el valor del auto, los kilómetros del año y tu provincia ya sale un número razonable: la patente, el precio del combustible y la VTV los ponemos nosotros. Si dejás el mantenimiento en 0, lo estimamos según la antigüedad y el kilometraje.',
  fields: [
    { id: 'valorAuto', label: 'Cuánto vale tu auto hoy', prefix: '$', value: 25_000_000, thousands: true },
    { id: 'antiguedad', label: 'Antigüedad del auto', suffix: 'años', value: 5, min: 0, max: 40 },
    { id: 'kmAnuales', label: 'Kilómetros por año', suffix: 'km', value: 15_000, thousands: true },
    { id: 'consumo', label: 'Consumo del auto', suffix: 'L/100 km', value: 8, min: 1, max: 40, step: 0.1 },
    {
      id: 'provincia',
      label: 'Provincia',
      type: 'select',
      value: 'buenos-aires',
      options: Object.keys(PROVINCIAS).map((k) => ({ value: k, label: PROVINCIAS[k].nombre })),
    },
    {
      id: 'combustible',
      label: 'Qué cargás',
      type: 'select',
      value: 'Nafta Súper',
      options: [
        { value: 'Nafta Súper', label: 'Nafta súper' },
        { value: 'Nafta Premium', label: 'Nafta premium' },
        { value: 'Gasoil', label: 'Gasoil' },
        { value: 'Gasoil Premium', label: 'Gasoil premium' },
      ],
    },
    { id: 'seguroMensual', label: 'Cuota del seguro', prefix: '$', suffix: 'por mes', value: 60_000, thousands: true },
    {
      id: 'mantenimientoAnual',
      label: 'Service y mantenimiento por año',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Dejalo en 0 y lo estimamos según la antigüedad y los kilómetros que hacés.',
    },
    { id: 'cocheraMensual', label: 'Cochera', prefix: '$', suffix: 'por mes', value: 0, thousands: true },
  ],
  fineprint: DISCLAIMER_FINANZAS,

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata del auto',
    caption:
      'Cada porción es un rubro del gasto anual. La sorpresa habitual es el tamaño de la depreciación: no sale de tu cuenta bancaria todos los meses, pero es plata que perdés igual, y en autos de pocos años suele ser la porción más grande de todas.',
  },
  breakdownTitle: 'Todo lo que pagás por tener el auto',
  breakdownIntro:
    'Los tres últimos renglones son los que sirven para decidir: el costo por kilómetro real (con depreciación), el de bolsillo (sin ella) y lo que el auto te saca por día aunque no lo muevas.',

  faq: [
    {
      q: '¿Cuánto cuesta mantener un auto por año en Argentina?',
      a: 'Depende del valor del auto mucho más que de los kilómetros. Para un auto de gama media con uso particular, la cuenta típica reparte más o menos así: la depreciación se lleva entre el 30% y el 45% del total, el seguro entre el 15% y el 20%, la nafta entre el 20% y el 30%, la patente alrededor del 10% y el service el resto. Meté tus números arriba: la diferencia entre un auto de 15 millones y uno de 40 se nota sobre todo en depreciación, patente y seguro, que son proporcionales al valor.',
    },
    {
      q: '¿Por qué hay que contar la depreciación si no la pago?',
      a: 'Porque es el gasto más grande y el único invisible. Si comprás un auto en 25 millones y a los tres años vale 19, perdiste 6 millones: no salieron de tu cuenta mes a mes, pero los perdiste igual y los vas a sentir el día que lo vendas. Ignorarla es la razón por la que la mayoría cree que el auto le cuesta la nafta y nada más. Cuando la sumás, el costo por kilómetro suele duplicarse.',
    },
    {
      q: '¿Cuál es el costo por kilómetro real de un auto?',
      a: 'Es el gasto anual completo dividido por los kilómetros que hacés en el año. Incluye nafta, seguro, patente, service, VTV, cochera y depreciación. Es un número que se mueve muchísimo con el uso: los costos fijos se reparten entre más kilómetros, así que el mismo auto puede costar el doble por kilómetro si lo usás la mitad. Por eso el resultado también muestra el costo por kilómetro de bolsillo, sin depreciación, que es el que sirve para decidir si te conviene hacer un viaje puntual.',
    },
    {
      q: '¿Cuánto pierde de valor un auto por año?',
      a: 'La regla que usa el fisco argentino es del 8% anual sobre el valor de origen, con un piso en el 40%: pasados unos años la tabla deja de bajar. En la vida real la caída no es pareja: un 0 km pierde cerca del 20% apenas sale de la concesionaria y después se estabiliza en torno al 10-12% anual, y un auto de uso intensivo pierde más rápido. Este hub usa el 20% para el primer año, el 12% para el uso de trabajo y el 8% con piso del 40% para el resto, que es la regla fiscal.',
    },
    {
      q: '¿Cuánto se paga de patente y cómo se calcula?',
      a: 'La patente es un impuesto provincial: se calcula como un porcentaje de la valuación fiscal del auto, y esa valuación baja un 8% por año hasta tocar el piso del 40%. Las alícuotas van de alrededor del 1,8% en Tierra del Fuego al 3,5% en CABA. Acá la estimamos con la alícuota representativa de tu provincia; si querés el detalle con escalas por tramo, cuotas y descuento por pago anual, está todo en el hub de patente: /auto/patente.',
    },
    {
      q: '¿Cuánto sale el seguro del auto?',
      a: 'La prima suele expresarse como un porcentaje del valor del auto por año: alrededor del 2% para responsabilidad civil, 4% para terceros completo y 6,5% para todo riesgo, con un recargo de hasta 25% en CABA y GBA y un descuento de hasta 20% en el interior. Sobre un auto de 25 millones, eso da entre 40.000 y 170.000 pesos por mes según la cobertura. Como varía mucho por historial y compañía, el hub te pide tu cuota real en lugar de inventarte un promedio.',
    },
    {
      q: '¿Cuánto gasto en nafta por año?',
      a: 'Es la cuenta más directa: kilómetros por año × consumo en litros cada 100 km ÷ 100 × precio del litro. Con 15.000 km al año, 8 litros cada 100 km y la nafta súper de tu provincia, son 1.200 litros. Los precios que usamos son los promedios oficiales de la Secretaría de Energía por provincia. Si no sabés tu consumo real —que casi siempre es peor que el de la ficha técnica— medilo entre dos cargas en /auto/consumo.',
    },
    {
      q: '¿Cuánto cuesta la VTV y desde cuándo se paga?',
      a: 'La verificación técnica se exige a partir del tercer año del auto en la mayoría de las jurisdicciones (CABA exime los primeros 3 años, PBA los primeros 2) y ronda entre 42.000 y 55.000 pesos según la provincia. En la cuenta anual la prorrateamos completa porque en general se repite todos los años una vez que el auto entra en edad de verificar.',
    },
    {
      q: '¿Qué gastos de mantenimiento hay que contar?',
      a: 'Service periódico (aceite y filtros), neumáticos, frenos, batería, correa de distribución y las roturas imprevistas. Cuando dejás el campo en 0, lo estimamos con una fórmula que crece con la antigüedad y el kilometraje y se topea en el 10% del valor del auto por año. Para saber cada cuánto toca cada cosa y cuánto sale, el detalle está en /auto/mantenimiento.',
    },
    {
      q: '¿Me conviene tener auto o usar apps y remises?',
      a: 'Depende de cuántos viajes hagas por mes, y la comparación correcta no es contra la nafta sino contra el costo total que calcula este hub. La lógica es que el auto tiene un costo fijo alto y un costo variable bajo, y las apps al revés: hay un punto de equilibrio en viajes por mes a partir del cual el auto conviene. Ese umbral se calcula en /auto/auto-o-uber.',
    },
    {
      q: '¿Por qué el costo por kilómetro me da tan alto si casi no uso el auto?',
      a: 'Porque los costos fijos —patente, seguro, cochera, VTV y depreciación— se pagan completos aunque el auto no salga del garaje, y al dividirlos por pocos kilómetros el resultado se dispara. Un auto que hace 3.000 km al año puede costar cinco veces más por kilómetro que el mismo auto haciendo 20.000. Es el escenario en el que vender el auto y viajar en remis suele dar mejor.',
    },
    {
      q: '¿Este cálculo sirve para un auto financiado o en leasing?',
      a: 'Sirve como base, pero le falta el costo financiero. Si tenés cuotas, sumá los intereses del año como un gasto más: el capital no cuenta dos veces porque ya está adentro de la depreciación, pero el interés sí es plata que se va. Con leasing, la cuota reemplaza a la depreciación y a la patente si está incluida; en ese caso cargá 0 en el valor de depreciación y sumá la cuota como gasto.',
    },
  ],

  sources: [
    {
      name: 'Precios en surtidor por provincia y bandera (Res. 314/2016)',
      url: 'http://datos.energia.gob.ar/dataset/precios-en-surtidor',
      publisher: 'Secretaría de Energía de la Nación',
      date: NAFTA_META.mes,
    },
    {
      name: 'Impuesto a los automotores — valuaciones y alícuotas',
      url: 'https://www.arba.gov.ar/',
      publisher: 'ARBA — Agencia de Recaudación de la Provincia de Buenos Aires',
    },
    {
      name: 'Patentes de vehículos — Ciudad de Buenos Aires',
      url: 'https://www.agip.gob.ar/impuestos/patentes',
      publisher: 'AGIP — Administración Gubernamental de Ingresos Públicos',
    },
    {
      name: 'Verificación Técnica Vehicular — obligatoriedad y periodicidad',
      url: 'https://www.argentina.gob.ar/transporte/vtv',
      publisher: 'Ministerio de Transporte de la Nación',
    },
    {
      name: 'Superintendencia de Seguros de la Nación — información al asegurado',
      url: 'https://www.argentina.gob.ar/ssn',
      publisher: 'Superintendencia de Seguros de la Nación',
    },
  ],

  replaces: [
    '/calculadora-costo-por-kilometro-auto',
    '/calculadora-antiguedad-auto-amortizacion',
    '/calculadora-amortizacion-auto-valor-residual',
    '/calculadora-seguro-auto-estimado',
    '/calculadora-costo-mantenimiento-auto-anual-km',
    '/simulador-costo-mantener-auto',
    '/calculadora-costo-total-propiedad-auto-anual',
    '/calculadora-seguro-auto-estimacion-precio',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
