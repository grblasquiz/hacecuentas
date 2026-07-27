import type { HubData } from './types';
import { ALICUOTAS } from './patente';
import { NAFTA_POR_PROVINCIA, NAFTA_NACIONAL, NAFTA_META } from '../data/nafta-precios';

/**
 * Hub de decisión — "¿Me conviene tener auto o usar Uber?"
 * Arquetipo: RAMIFICADO + COMPARADOR. La respuesta NO es un número suelto:
 * es un UMBRAL. "A partir de N viajes por mes te conviene el auto".
 *
 * Absorbe 6 calculadoras (ver hub.replaces):
 *   - estimador de costo de viaje en taxi/remis
 *   - comparativa Uber / DiDi / Cabify por ciudad
 *   - precio del remis por km (CABA, Córdoba, Rosario, Mendoza, La Plata)
 *   - estacionamiento medido por hora en CABA
 *   - Uber vs auto propio
 *   - ahorro de transporte público vs auto
 *
 * DE DÓNDE SALEN LOS NÚMEROS (nada hardcodeado a mano):
 *  - Precio del litro: `src/lib/data/nafta-precios.ts` — el mismo snapshot
 *    oficial (Secretaría de Energía, Res. 314/2016) que usa el hub
 *    /auto/nafta-y-peajes y la página /precio-nafta-hoy. No se duplica.
 *  - Alícuota de patente: `ALICUOTAS` del hub /auto/patente. Se importa la
 *    constante real en vez de copiar el porcentaje.
 *  - Depreciación del vehículo: 8% anual con piso del 40% del valor, el mismo
 *    factor que usa `src/lib/formulas/valuacion-fiscal-automotor-provincia.ts`
 *    (`Math.max(0.40, 1 - antiguedad * 0.08)`).
 *  - Tarifa de apps y de remis: espejo de las fórmulas viejas (ver constantes
 *    de abajo, con el archivo de origen citado en cada una).
 *
 * EL GRÁFICO ES POSICIONAL (`scale`), no decorativo: el eje son viajes por mes,
 * la frontera entre las dos franjas ES el punto de equilibrio y el marcador es
 * dónde caés vos hoy. Eso es exactamente lo que la calculadora vieja
 * "uber-vs-auto-propio" no mostraba: te daba un ganador, no el umbral.
 *
 * FORMATO: las filas que no son plata declaran `format`/`unit` explícitos
 * (viajes, km, litros, %). El default del runtime es 'ars' y `Object.assign`
 * copia `undefined`, así que una fila sin format propio se imprimiría en pesos.
 */

/**
 * Tarifa base de las apps de viaje.
 * Espejo exacto de `src/lib/formulas/uber-didi-cabify-comparativa-ciudad.ts`:
 *   uber = (500 + km*350 + min*25) * (horaPico ? 1.4 : 1)
 *   didi = uber * 0.85 · cabify = uber * 1.2
 */
export const APP_TARIFA = { bajada: 500, porKm: 350, porMin: 25 };
export const APP_FACTOR = { didi: 0.85, uber: 1, cabify: 1.2 };
export const RECARGO_HORA_PICO = 1.4;

/**
 * Tarifas de taxi/remis por ciudad.
 * Espejo de `src/lib/formulas/precio-remis-por-km-argentina-2026-...ts`
 * (CITY_RATES_2026 + MINIMO_GARANTIZADO, valores 2026).
 */
export const REMIS_RATES: Record<string, { bandera: number; porKm: number; espera5min: number; minimo: number }> = {
  caba: { bandera: 850, porKm: 95, espera5min: 100, minimo: 500 },
  cordoba: { bandera: 420, porKm: 46, espera5min: 50, minimo: 250 },
  rosario: { bandera: 380, porKm: 41, espera5min: 45, minimo: 230 },
  mendoza: { bandera: 350, porKm: 38, espera5min: 40, minimo: 220 },
  la_plata: { bandera: 400, porKm: 44, espera5min: 45, minimo: 240 },
};

/**
 * Estacionamiento medido: tarifa progresiva del sistema Blinkay (CABA).
 * Espejo de `src/lib/formulas/estacionamiento-medido-hora-caba-zona.ts`:
 * la 1ª hora vale la base, cada hora siguiente sube 30% hasta la 4ª, y de la
 * 5ª en adelante se estabiliza en el valor de la 4ª.
 * Sólo CABA tiene tarifa publicada en el codebase: se usa como referencia para
 * las demás ciudades y así se aclara en la ficha.
 */
export const MEDIDO_BASE_HORA = 700;
export const MEDIDO_ESCALON = 1.3;

/** Depreciación anual del vehículo (espejo de valuacion-fiscal-automotor-provincia.ts). */
export const DEPRECIACION_ANUAL = 0.08;
export const DEPRECIACION_PISO = 0.4;

/** kg de CO₂ por litro de nafta quemado (espejo de ahorro-transporte-publico-vs-auto.ts). */
export const CO2_POR_LITRO = 2.31;

/**
 * Ciudad → provincia. Una sola perilla geográfica que resuelve tres cosas:
 * la tarifa de remis, la alícuota de patente y el precio del litro.
 * Las claves de nafta-precios y las de ALICUOTAS no coinciden, así que el
 * mapeo va explícito acá.
 */
export const CIUDADES: Record<
  string,
  { nombre: string; provincia: string; patenteKey: string; naftaKey: string }
> = {
  caba: { nombre: 'CABA', provincia: 'Ciudad de Buenos Aires', patenteKey: 'caba', naftaKey: 'Capital Federal' },
  la_plata: { nombre: 'La Plata / GBA', provincia: 'Buenos Aires', patenteKey: 'buenos-aires', naftaKey: 'Buenos Aires' },
  cordoba: { nombre: 'Córdoba', provincia: 'Córdoba', patenteKey: 'cordoba', naftaKey: 'Cordoba' },
  rosario: { nombre: 'Rosario', provincia: 'Santa Fe', patenteKey: 'santa-fe', naftaKey: 'Santa Fe' },
  mendoza: { nombre: 'Mendoza', provincia: 'Mendoza', patenteKey: 'mendoza', naftaKey: 'Mendoza' },
};

/** Tabla ya resuelta que viaja al cliente: nada que resolver en el navegador. */
export const CITY_DATA: Record<
  string,
  {
    nombre: string;
    provincia: string;
    alicuota: number;
    nafta: number;
    remis: { bandera: number; porKm: number; espera5min: number; minimo: number };
  }
> = Object.fromEntries(
  Object.entries(CIUDADES).map(([k, c]) => [
    k,
    {
      nombre: c.nombre,
      provincia: c.provincia,
      alicuota: ALICUOTAS[c.patenteKey]?.alicuota ?? 2.5,
      nafta:
        (NAFTA_POR_PROVINCIA[c.naftaKey] || NAFTA_NACIONAL)['Nafta Súper'] ??
        NAFTA_NACIONAL['Nafta Súper'] ??
        0,
      remis: REMIS_RATES[k] ?? REMIS_RATES.caba,
    },
  ]),
);

const mesLabel = (() => {
  const [y, m] = String(NAFTA_META.mes).split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${meses[Number(m) - 1] || m}-${y}`;
})();

/**
 * Qué cambia en cada rama.
 *  - modo: de dónde sale el costo de UN viaje sin auto.
 *  - factorApp: multiplicador sobre la tarifa de app (DiDi/Cabify/hora pico).
 *  - medido: 0 apaga el estacionamiento medido (cochera propia o barrio sin medido).
 */
export const CASE_MATH: Record<string, { modo: 'app' | 'remis' | 'boleto'; factorApp: number; medido: number }> = {
  apps: { modo: 'app', factorApp: 1, medido: 1 },
  'hora-pico': { modo: 'app', factorApp: RECARGO_HORA_PICO, medido: 1 },
  didi: { modo: 'app', factorApp: APP_FACTOR.didi, medido: 1 },
  cabify: { modo: 'app', factorApp: APP_FACTOR.cabify, medido: 1 },
  remis: { modo: 'remis', factorApp: 1, medido: 1 },
  colectivo: { modo: 'boleto', factorApp: 1, medido: 1 },
  'sin-medido': { modo: 'app', factorApp: 1, medido: 0 },
};

/** Copiado textual de getCalculatorDisclaimer() — dominio 'finance'. */
const DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'auto/auto-o-uber',
  title: '¿Me conviene tener auto o usar Uber? — Calculadora del punto de equilibrio',
  description:
    'Compará el costo real del auto propio (patente, seguro, nafta, service, estacionamiento y depreciación) contra Uber, DiDi, Cabify, remis o colectivo. Te decimos a partir de cuántos viajes por mes te conviene el auto.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Comparador de costos de movilidad',
  h1: '¿Me conviene tener auto o usar Uber?',
  lede:
    'La respuesta no es un precio: es un umbral. El auto propio tiene un costo fijo que pagás aunque no lo saques del garage, y las apps tienen un costo que crece con cada viaje. Hay un punto donde se cruzan, y ese punto es la respuesta.',
  stamps: [
    'Actualizado 27-07-2026',
    `Nafta ${mesLabel} (Secretaría de Energía)`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Punto de equilibrio',

  cases: {
    title: '¿Con qué lo estás comparando?',
    intro: 'Partimos del caso más frecuente: Uber contra el auto propio. Si tu alternativa es otra, cambiala.',
    items: [
      {
        id: 'apps',
        label: 'Con Uber',
        hint: 'El caso más común',
        answer: 'El auto conviene recién cuando los viajes por mes superan el punto de equilibrio.',
        yes: [
          'Costo del viaje en app: bajada de bandera + un precio por kilómetro + un precio por minuto',
          'Costo fijo del auto: patente, seguro, service y depreciación — se pagan hagas 2 o 200 viajes',
          'Costo variable del auto: la nafta de los kilómetros que realmente hacés',
          'El estacionamiento medido, que casi nadie suma y en CABA pesa más que el service',
        ],
        warn: [
          DISCLAIMER,
          'La tarifa de las apps es dinámica: cambia por demanda, horario y ciudad. El precio que ves acá es un promedio de referencia',
          'Si el auto lo usás además para trabajar, mudanzas o salir del conurbano, el punto de equilibrio no captura ese valor',
        ],
        plazo: 'revisá la cuenta cuando venza el seguro: es la cuota que más se mueve año a año.',
      },
      {
        id: 'hora-pico',
        label: 'Con Uber, pero viajo siempre en hora pico',
        hint: 'Tarifa dinámica',
        answer: 'Con recargo de hora pico el punto de equilibrio baja: el auto conviene antes.',
        yes: [
          'La misma tarifa base, multiplicada por el recargo de hora pico',
          'Todos los costos fijos y variables del auto propio',
        ],
        warn: [
          DISCLAIMER,
          'El recargo de hora pico no es fijo ni público: es un multiplicador dinámico. Acá se usa un valor de referencia',
          'En hora pico el viaje también tarda más, y el precio por minuto sube junto con el tránsito',
        ],
        plazo: 'si podés correr el viaje 30 minutos, el recargo suele desaparecer.',
      },
      {
        id: 'didi',
        label: 'Con DiDi',
        hint: 'La app más barata',
        answer: 'DiDi suele salir más barata que Uber, así que el auto tarda más en convenir.',
        yes: [
          'Tarifa de referencia de DiDi: en promedio queda por debajo de Uber para el mismo recorrido',
          'Todos los costos del auto propio, iguales',
        ],
        warn: [
          DISCLAIMER,
          'DiDi no opera en todas las ciudades del país: verificá cobertura antes de contar con esa tarifa',
        ],
        plazo: 'compará las tres apps antes de pedir: la diferencia entre la más barata y la más cara ronda el 30%.',
      },
      {
        id: 'cabify',
        label: 'Con Cabify',
        hint: 'Tarifa cerrada',
        answer: 'Cabify es la más cara de las tres, así que el auto conviene con menos viajes.',
        yes: [
          'Tarifa de referencia de Cabify: cerrada antes de subir, sin sorpresas al bajar',
          'Todos los costos del auto propio, iguales',
        ],
        warn: [
          DISCLAIMER,
          'La tarifa cerrada te cubre del tránsito, pero arranca más cara que la dinámica',
        ],
        plazo: 'la tarifa cerrada conviene cuando el destino tiene tránsito impredecible.',
      },
      {
        id: 'remis',
        label: 'Con taxi o remis de tarifa oficial',
        hint: 'Bandera + km + espera',
        answer: 'El taxi tiene tarifa regulada: bajada de bandera, precio por km y mínimo garantizado.',
        yes: [
          'Bajada de bandera y precio por kilómetro oficiales de tu ciudad',
          'Mínimo garantizado: los viajes cortos no bajan de ese piso',
          'Todos los costos del auto propio',
        ],
        warn: [
          DISCLAIMER,
          'Los recargos nocturnos (50%) y de feriado (25%) no están incluidos en esta comparación mensual',
          'La tarifa la fija cada municipio y se actualiza varias veces al año',
        ],
        plazo: 'la tarifa oficial se publica en la ordenanza municipal: ahí está el número exacto de tu ciudad.',
      },
      {
        id: 'colectivo',
        label: 'Con transporte público',
        hint: 'Colectivo, subte, tren',
        answer: 'Contra el colectivo el auto casi nunca gana en plata: gana en tiempo.',
        yes: [
          'El costo por viaje es el boleto, sin importar la distancia dentro de la sección',
          'Todos los costos fijos y variables del auto propio',
          'La diferencia de emisiones: el auto emite CO₂ por cada litro quemado',
        ],
        warn: [
          DISCLAIMER,
          'El colectivo casi siempre gana en plata. Lo que el cálculo no mide es el tiempo puerta a puerta ni las combinaciones',
          'Si usás la red SUBE con atributo social, el boleto real es menor al que estés cargando acá',
        ],
        plazo: 'la tarifa del transporte público se actualiza por cuadro tarifario: chequeá el vigente antes de decidir.',
      },
      {
        id: 'sin-medido',
        label: 'Tengo cochera y no pago medido',
        hint: 'Sin estacionamiento',
        answer: 'Sin estacionamiento medido el auto propio se abarata y el punto de equilibrio baja.',
        yes: [
          'El mismo cálculo, con el estacionamiento medido en cero',
          'Patente, seguro, service, nafta y depreciación siguen contando',
        ],
        warn: [
          DISCLAIMER,
          'Si la cochera la alquilás, ese alquiler reemplaza al medido y hay que sumarlo aparte',
          'Tener cochera propia también tiene costo: expensas, ABL y el capital inmovilizado',
        ],
        plazo: 'compará el alquiler de la cochera contra lo que pagarías de medido: muchas veces es lo mismo.',
      },
    ],
  },

  inputsTitle: 'Tu caso, en números',
  inputsIntro:
    'Los valores de ejemplo son los de un usuario urbano típico. Cambiá los que conozcas y dejá el resto.',
  fields: [
    {
      id: 'ciudad',
      label: 'Ciudad',
      type: 'select',
      value: 'caba',
      options: Object.entries(CITY_DATA).map(([v, c]) => ({ value: v, label: c.nombre })),
      help: 'Define la tarifa oficial de taxi, la alícuota de patente y el precio del litro de tu provincia.',
    },
    { id: 'viajes', label: 'Viajes por mes', type: 'number', min: 0, max: 400, value: 90 },
    { id: 'km', label: 'Kilómetros por viaje', type: 'number', min: 0, step: 0.5, value: 6 },
    { id: 'minutos', label: 'Minutos por viaje', type: 'number', min: 0, value: 18 },
    {
      id: 'boleto',
      label: 'Boleto de colectivo o subte (ida)',
      prefix: '$',
      value: '1.200',
      thousands: true,
      help: 'Sólo se usa en la rama de transporte público.',
    },
    {
      id: 'valorAuto',
      label: 'Valor del auto 0 km (tabla de referencia)',
      prefix: '$',
      value: '22.000.000',
      thousands: true,
      help: 'Es la base de la patente y de la depreciación. Si tu auto tiene años, cargá el valor del 0 km y los años abajo.',
    },
    { id: 'antiguedad', label: 'Años de antigüedad del auto', type: 'number', min: 0, max: 40, value: 5 },
    { id: 'consumo', label: 'Consumo del auto (litros cada 100 km)', type: 'number', min: 1, step: 0.1, value: 8.5 },
    { id: 'seguro', label: 'Seguro por mes', prefix: '$', value: '95.000', thousands: true },
    {
      id: 'service',
      label: 'Service, cubiertas y VTV por año',
      prefix: '$',
      value: '1.400.000',
      thousands: true,
    },
    { id: 'diasMedido', label: 'Días por mes que dejás el auto en medido', type: 'number', min: 0, max: 31, value: 12 },
    { id: 'horasMedido', label: 'Horas por vez en el medido', type: 'number', min: 0, max: 12, step: 0.5, value: 2 },
  ],
  fineprint: `${DISCLAIMER} El precio del litro es el promedio provincial publicado por la Secretaría de Energía (${mesLabel}); la tarifa progresiva de estacionamiento medido es la de CABA y se usa como referencia para las demás ciudades.`,

  chart: {
    type: 'scale',
    title: 'Dónde está el punto de equilibrio',
    caption:
      'El eje son viajes por mes. La frontera entre las dos franjas es el punto de equilibrio: a la izquierda te conviene la alternativa sin auto, a la derecha te conviene el auto propio. El marcador es dónde caés vos hoy.',
  },
  breakdownTitle: 'Cuánto te cuesta cada opción por mes',
  breakdownIntro:
    'El auto propio se desarma en sus seis costos reales. La alternativa sin auto es un único número que crece con cada viaje.',

  faq: [
    {
      q: '¿A partir de cuántos viajes por mes conviene tener auto?',
      a: 'Depende de tres cosas: cuánto vale tu auto (define patente, seguro y depreciación), cuántos kilómetros hace cada viaje y cuánto cobra la alternativa. Con los valores de ejemplo el cruce cae cerca de los 30-40 viajes mensuales, pero el número exacto lo da la calculadora con tus datos. Por debajo del umbral pagás costo fijo que no usás; por encima, cada viaje extra en app es más caro que el mismo viaje en tu auto.',
    },
    {
      q: '¿Qué costos del auto propio se suelen olvidar?',
      a: 'Tres: la depreciación (el auto vale menos cada año aunque no lo uses), el estacionamiento medido y el capital inmovilizado. La depreciación se estima en 8% anual con un piso del 40% del valor original, el mismo criterio que usan las tablas de valuación fiscal automotor.',
    },
    {
      q: '¿Cómo se calcula el costo de un viaje en Uber, DiDi o Cabify?',
      a: 'Todas usan la misma estructura: una bajada de bandera fija, más un precio por kilómetro, más un precio por minuto de viaje. Sobre eso se aplica el multiplicador de demanda. DiDi suele quedar por debajo de Uber y Cabify por encima, con una brecha de alrededor del 30% entre la más barata y la más cara para el mismo recorrido.',
    },
    {
      q: '¿Cuánto sale el estacionamiento medido en CABA?',
      a: 'La tarifa es progresiva (sistema Blinkay): la primera hora vale la tarifa base de la zona y cada hora siguiente sube un 30% sobre la anterior, hasta la cuarta hora. De la quinta en adelante se estabiliza en el valor de la cuarta. Por eso cuatro horas no cuestan cuatro veces la primera: cuestan bastante más. Rige lunes a viernes de 8 a 20 y sábados de 8 a 13.',
    },
    {
      q: '¿Cuánto pago de patente y de dónde sale ese porcentaje?',
      a: 'La patente es un impuesto provincial: se calcula como un porcentaje de la valuación fiscal del vehículo. La alícuota va de 1,8% en Tierra del Fuego a 3,5% en CABA. Este hub usa la misma tabla de alícuotas provinciales que la calculadora de patente del sitio, así que los dos números coinciden siempre.',
    },
    {
      q: '¿Conviene más el auto o el colectivo?',
      a: 'En plata, casi siempre el transporte público: el boleto no depende de la distancia dentro de la sección y no arrastra costos fijos. Lo que el cálculo no mide es el tiempo puerta a puerta, las combinaciones ni la comodidad. Además, cada litro de nafta que quemás emite unos 2,31 kg de CO₂, algo que el colectivo reparte entre decenas de pasajeros.',
    },
    {
      q: '¿La tarifa del taxi es la misma que la de las apps?',
      a: 'No. El taxi y el remis tienen tarifa regulada por ordenanza municipal: bajada de bandera, precio por kilómetro, precio por minuto de espera y un mínimo garantizado que hace que los viajes cortos no bajen de cierto piso. Las apps usan tarifa dinámica, que puede quedar por debajo o muy por encima de la oficial según la demanda del momento.',
    },
    {
      q: '¿Qué pasa si uso el auto para trabajar?',
      a: 'El cálculo cambia de naturaleza: dejás de comparar costos de movilidad y pasás a comparar un costo contra un ingreso. Si el auto genera plata (reparto, viajes, visitas a clientes), el punto de equilibrio deja de ser el criterio correcto y hay que mirar la rentabilidad por kilómetro.',
    },
    {
      q: '¿Cuánto se deprecia un auto por año en Argentina?',
      a: 'Como referencia se usa un 8% anual sobre el valor de origen, con un piso del 40%: a partir de unos 7-8 años la valuación deja de caer y se estabiliza. Es el mismo criterio de las tablas provinciales de valuación fiscal, que es lo que además define cuánta patente pagás.',
    },
    {
      q: '¿El seguro depende del valor del auto?',
      a: 'Sí, sobre todo en las coberturas contra todo riesgo, donde la prima es un porcentaje de la suma asegurada. En responsabilidad civil el peso del valor es menor y pesan más la zona de guarda y el historial. Por eso el seguro va como campo editable y no como porcentaje automático: la dispersión entre compañías es enorme.',
    },
    {
      q: '¿Vender el auto y moverme en apps es lo mismo que no comprarlo?',
      a: 'No exactamente. Si ya tenés el auto, la plata de la compra es un costo hundido y lo que corresponde comparar es el costo de mantenerlo (patente, seguro, service, medido, depreciación) contra lo que gastarías en apps. Si todavía no lo compraste, además hay que sumar el costo de oportunidad de tener ese capital inmovilizado.',
    },
    {
      q: '¿Qué precio de nafta usa esta calculadora?',
      a: 'El promedio provincial de nafta súper del último snapshot oficial de la Secretaría de Energía, el mismo dato que alimenta la página de precio de nafta del sitio. No es un valor cargado a mano: cuando se actualiza la fuente, se actualiza este cálculo.',
    },
  ],

  sources: [
    {
      name: 'Precios de combustibles en surtidor — Res. 314/2016',
      url: 'http://datos.energia.gob.ar/dataset/precios-en-surtidor',
      publisher: 'Secretaría de Energía de la Nación',
      date: NAFTA_META.actualizado,
    },
    {
      name: 'Estacionamiento medido — tarifas y horarios',
      url: 'https://buenosaires.gob.ar/movilidad/estacionamiento',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
    {
      name: 'Impuesto a los automotores — alícuotas provinciales',
      url: 'https://www.agip.gob.ar/impuestos/patentes',
      publisher: 'AGIP · Ciudad de Buenos Aires',
    },
    {
      name: 'Impuesto automotor y tabla de valuación fiscal',
      url: 'https://www.arba.gov.ar/Aplicaciones/Automotores.asp',
      publisher: 'ARBA · Provincia de Buenos Aires',
    },
    {
      name: 'Servicio de transporte de pasajeros por automóviles de alquiler (taxis)',
      url: 'https://buenosaires.gob.ar/movilidad/taxis',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
  ],

  replaces: [
    '/calculadora-estimador-costo-viaje-taxi-remis',
    '/calculadora-uber-didi-cabify-comparativa-ciudad',
    '/calculadora-precio-remis-por-km-argentina-2026-cordoba-rosario-buenos-aires',
    '/calculadora-estacionamiento-medido-hora-caba-zona',
    '/calculadora-uber-vs-auto-propio',
    '/calculadora-ahorro-transporte-publico-vs-auto',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
