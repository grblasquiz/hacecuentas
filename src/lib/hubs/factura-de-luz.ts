import type { HubData } from './types';

/**
 * Hub de decisión — "¿Por qué me vino tan cara la luz?"
 * Arquetipo RAMIFICADO: la pregunta se abre en cuatro caminos reales
 * (estimar la factura, medir un aparato, medir el standby, pasar a LED).
 *
 * Absorbe 11 calculadoras sueltas de consumo eléctrico (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Este hub MEZCLA unidades: kWh, watts, horas, porcentaje y pesos. El
 *    resultado declara `format: 'unit'` + `unit: 'kWh'` como base (el gráfico
 *    siempre va en kWh) y TODAS las filas del desglose declaran su propio
 *    `format`/`unit`. Una fila sin `format` cae a pesos y la página miente.
 *  - Las tarifas NO se inventan acá: salen del módulo real del repo,
 *    `src/lib/formulas/tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.ts`
 *    (esquema SEF, Decreto 943/2025), copiadas abajo en TARIFAS_2026 para que
 *    el <script> inline de la página las pueda serializar con define:vars.
 */
export const hub: HubData = {
  slug: 'hogar/factura-de-luz',
  title: '¿Por qué me vino tan cara la luz? Calculá tu factura y tu consumo — 2026',
  description:
    'Estimá la factura de luz de Edenor o Edesur con el esquema de subsidios 2026, medí cuánto consume cada electrodoméstico en kWh y en pesos, cuánto te cuesta el standby y cuánto ahorrás pasando a LED.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'Guía y estimación del hogar',
  h1: '¿Por qué me vino tan cara la luz?',
  lede:
    'Casi siempre la respuesta está en tres números: cuántos kWh consumiste, a qué precio te los cobran y cuánto de la boleta son impuestos. Arrancamos estimando la factura del mes y después bajamos al detalle: qué aparato se lleva la mayor parte, cuánto te cuesta el standby y cuánto ahorrás con LED.',
  stamps: ['Actualizado 27-07-2026', 'Esquema SEF · Decreto 943/2025 · cuadros ENRE', '11 calculadoras adentro'],

  resultLabel: 'Factura estimada del mes',

  cases: {
    title: '¿Qué querés averiguar?',
    intro: 'Partimos por la pregunta más frecuente. Si buscás otra cosa, cambiala.',
    items: [
      {
        id: 'factura',
        label: 'Estimar la factura del mes',
        hint: 'El caso más común',
        answer: 'La factura son cargo fijo + energía consumida + un 36% largo de impuestos y tasas.',
        yes: [
          'Cargo fijo mensual de la distribuidora (Edenor o Edesur), que se paga aunque consumas cero',
          'Energía: los kWh del período por el precio que te corresponde según tu condición de subsidio',
          'Con subsidio (SEF): 50% de bonificación sobre un bloque de 300 kWh en meses de mayor demanda y 150 kWh en meses templados',
          'El excedente de ese bloque se paga siempre a precio pleno',
          'Impuestos y tasas: alumbrado público 8%, IVA 27% sobre servicios domiciliarios y Ley 25.413 (0,6%)',
        ],
        warn: [
          'Si te pasaste del bloque subsidiado, el excedente cuesta el doble por kWh: ahí aparecen los saltos de factura',
          'La tasa de alumbrado público la fija cada municipio y va de 6% a 12%: usamos 8% como promedio del GBA',
          'Una factura estimada (sin lectura real del medidor) se regulariza en el período siguiente y puede llegar abultada',
        ],
        plazo: 'el reclamo por facturación ante el ENRE se hace dentro de los 30 días de recibida la boleta.',
      },
      {
        id: 'aparato',
        label: 'Cuánto consume un electrodoméstico',
        hint: 'Watts, kWh y pesos',
        answer: 'kWh = watts × horas de uso ÷ 1.000. Multiplicado por el precio del kWh, son pesos.',
        yes: [
          'Potencia en watts (está en la etiqueta del aparato o en su manual)',
          'Horas de uso por día y 30 días de mes',
          'El precio efectivo del kWh que sale de tu propia factura, impuestos incluidos',
          'Se calcula el costo mensual, el anual y qué porcentaje de tu consumo total explica ese aparato',
        ],
        warn: [
          'Los aparatos con motor o resistencia (aire, termotanque, plancha, secarropas) no consumen la potencia máxima todo el tiempo: el consumo real suele ser menor',
          'La heladera funciona las 24 horas pero cicla: para ella se usa el consumo anual de la etiqueta, no watts × 24',
          'Un aire acondicionado inverter arranca al máximo y después baja: promedialo en 60-70% de su potencia nominal',
        ],
        plazo: 'medir con un vatímetro de enchufe una semana da el número real, sin estimaciones.',
      },
      {
        id: 'standby',
        label: 'Cuánto me cuesta dejar cosas en standby',
        hint: 'El consumo vampiro',
        answer: 'Entre 2 y 10 W por aparato apagado: sumados son varios kWh al mes que pagás por nada.',
        yes: [
          'Cantidad de aparatos que quedan enchufados sin usarse (TV, decodificador, microondas, cargadores, PC, consola)',
          'Potencia media en standby por aparato: 5 W es el valor típico',
          'Horas al día en las que están apagados pero enchufados',
          'El resultado se anualiza: es plata que se paga 365 días seguidos',
        ],
        warn: [
          'Los peores son los que tienen fuente conmutada permanente: decodificadores, equipos de audio y viejos routers',
          'Un cargador de celular sin el celular consume menos de 0,5 W: no es el problema principal',
          'La zapatilla con interruptor corta el consumo de golpe y cuesta menos que un mes de standby',
        ],
        plazo: 'desenchufar antes de irte de vacaciones evita pagar un mes entero de consumo fantasma.',
      },
      {
        id: 'led',
        label: 'Cuánto ahorro cambiando a LED',
        hint: 'Watts y lúmenes',
        answer: 'Un LED da los mismos lúmenes con un 85% menos de watts: el recambio se paga en meses.',
        yes: [
          'Watts de la lámpara vieja y su tipo (incandescente, halógena o bajo consumo)',
          'Los lúmenes equivalentes, que es lo que realmente ilumina: una incandescente rinde ~12 lm/W y un LED ~90 lm/W',
          'Cantidad de focos a reemplazar y horas de encendido por día',
          'El ahorro sale en kWh al año y en pesos, al precio efectivo de tu factura',
        ],
        warn: [
          'Comprá por lúmenes, no por watts: un LED de 9 W reemplaza a una incandescente de 60 W',
          'Si venís de lámparas de bajo consumo (CFL) el ahorro es mucho menor: ya rendían ~55 lm/W',
          'La temperatura de color (K) no cambia el consumo, sólo el tono de la luz',
        ],
        plazo: 'un LED dura entre 15.000 y 25.000 horas: unos 10 años a 5 horas por día.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada rama usa los campos que le sirven. Los demás podés dejarlos como están.',
  fields: [
    {
      id: 'consumo_kwh',
      label: 'Consumo del mes',
      type: 'number',
      suffix: 'kWh',
      min: 0,
      max: 5000,
      step: 1,
      value: 300,
      help: 'Está en tu factura, en el renglón de lectura del medidor. Un hogar tipo del AMBA anda entre 250 y 400 kWh.',
    },
    {
      id: 'distribuidora',
      label: 'Distribuidora',
      type: 'select',
      value: 'edenor',
      options: [
        { value: 'edenor', label: 'Edenor' },
        { value: 'edesur', label: 'Edesur' },
      ],
    },
    {
      id: 'condicion',
      label: 'Condición de subsidio',
      type: 'select',
      value: 'con_subsidio',
      options: [
        { value: 'con_subsidio', label: 'Con subsidio (SEF)' },
        { value: 'sin_subsidio', label: 'Sin subsidio (tarifa plena)' },
      ],
      help: 'Desde 2026 hay sólo dos condiciones: la vieja segmentación N1/N2/N3 quedó reemplazada por el SEF.',
    },
    {
      id: 'temporada',
      label: 'Temporada del período facturado',
      type: 'select',
      value: 'alta_demanda',
      options: [
        { value: 'alta_demanda', label: 'Mayor demanda (verano/invierno)' },
        { value: 'templado', label: 'Templado (primavera/otoño)' },
      ],
      help: 'Define el bloque bonificado: 300 kWh en mayor demanda, 150 kWh en meses templados.',
    },
    {
      id: 'potencia_w',
      label: 'Potencia del electrodoméstico',
      type: 'number',
      suffix: 'W',
      min: 0,
      max: 10000,
      step: 10,
      value: 1500,
      help: 'Aire 2.200 W · termotanque 1.500 W · microondas 1.200 W · TV LED 100 W · notebook 60 W.',
    },
    {
      id: 'horas_dia',
      label: 'Horas de uso por día',
      type: 'number',
      suffix: 'h',
      min: 0,
      max: 24,
      step: 0.5,
      value: 4,
      help: 'También se usa para calcular las horas encendidas de los focos.',
    },
    {
      id: 'aparatos_standby',
      label: 'Aparatos que quedan enchufados sin usarse',
      type: 'number',
      min: 0,
      max: 60,
      step: 1,
      value: 8,
    },
    {
      id: 'watts_standby',
      label: 'Consumo en standby por aparato',
      type: 'number',
      suffix: 'W',
      min: 0,
      max: 50,
      step: 0.5,
      value: 5,
      help: 'Entre 2 y 10 W según el aparato. 5 W es el promedio doméstico.',
    },
    {
      id: 'watts_foco',
      label: 'Watts de la lámpara vieja',
      type: 'number',
      suffix: 'W',
      min: 0,
      max: 500,
      step: 5,
      value: 60,
    },
    {
      id: 'tipo_foco',
      label: 'Tipo de lámpara vieja',
      type: 'select',
      value: 'incandescente',
      options: [
        { value: 'incandescente', label: 'Incandescente (12 lm/W)' },
        { value: 'halogena', label: 'Halógena (16 lm/W)' },
        { value: 'cfl', label: 'Bajo consumo / CFL (55 lm/W)' },
      ],
    },
    {
      id: 'cantidad_focos',
      label: 'Cantidad de lámparas a cambiar',
      type: 'number',
      min: 1,
      max: 100,
      step: 1,
      value: 10,
    },
  ],
  fineprint:
    'Es una estimación orientativa. El cuadro tarifario cambia varias veces al año, la tasa municipal de alumbrado varía por partido y tu factura puede incluir cuotas, ajustes o consumos estimados. El número que manda es el de tu boleta.',

  chart: {
    type: 'donut',
    title: 'Adónde se van tus kWh',
    caption:
      'El gráfico reparte los kWh del mes entre los usos típicos de un hogar argentino: la heladera y la climatización se llevan casi la mitad. En las otras ramas el gráfico compara lo que consume eso que estás midiendo contra el resto de la casa.',
  },
  breakdownTitle: 'Cómo se arma el número',
  breakdownIntro:
    'Cada fila trae su unidad: hay kWh, watts, horas, porcentaje y pesos. Las barras comparan cada concepto con el mayor.',

  faq: [
    {
      q: '¿Por qué me vino tan cara la factura de luz?',
      a: 'Por alguna de estas cuatro razones, en orden de frecuencia: te pasaste del bloque de kWh bonificado y el excedente se paga a precio pleno (el doble por kWh); el período incluye verano o invierno, cuando el aire o la estufa eléctrica duplican el consumo; la factura anterior fue estimada sin lectura del medidor y ahora se regulariza; o hubo aumento del cuadro tarifario. Estimá el mes con tus kWh reales y comparalo con lo que te cobraron.',
    },
    {
      q: '¿Cómo se calcula el consumo eléctrico de un aparato en kWh?',
      a: 'kWh = watts × horas de uso ÷ 1.000. Un aire de 2.200 W usado 6 horas por día consume 13,2 kWh diarios y unos 396 kWh al mes. Multiplicando por el precio efectivo del kWh de tu factura (con impuestos) obtenés el costo real en pesos.',
    },
    {
      q: '¿Cuánto cuesta el kWh en Argentina en 2026?',
      a: 'Con el esquema SEF, la energía a precio pleno ronda los $220 por kWh en Edenor y $222 en Edesur. Quien tiene subsidio paga la mitad sobre el bloque bonificado (300 kWh en meses de mayor demanda, 150 kWh en los templados) y precio pleno sobre el excedente. A eso hay que sumarle el cargo fijo y un 36% largo de impuestos y tasas, así que el precio efectivo por kWh que sale de dividir tu factura total por los kWh consumidos siempre es bastante más alto.',
    },
    {
      q: '¿Qué reemplazó a la segmentación N1, N2 y N3?',
      a: 'El Decreto 943/2025, vigente desde enero de 2026, eliminó la segmentación por niveles y la reemplazó por los Subsidios Energéticos Focalizados (SEF). Hoy hay sólo dos condiciones: con subsidio o sin subsidio, según ingresos del hogar. El viejo N1 equivale a "sin subsidio" y los N2 y N3 quedaron asimilados a "con subsidio".',
    },
    {
      q: '¿Qué electrodoméstico consume más luz en una casa?',
      a: 'La heladera, porque funciona las 24 horas del año: se lleva alrededor de un cuarto del consumo doméstico. Le siguen la climatización (aire acondicionado en verano, estufas eléctricas en invierno) con más de un 20%, el calentamiento de agua y la cocina eléctrica, y recién después la iluminación. La electrónica sumada al standby explica cerca de un quinto de la boleta.',
    },
    {
      q: '¿Cuánto cuesta dejar los aparatos en standby?',
      a: 'Ocho aparatos consumiendo 5 W cada uno durante 20 horas por día suman unos 292 kWh al año, es decir plata que se paga sin usar nada. Es el llamado consumo fantasma o vampiro. Una zapatilla con interruptor lo corta de raíz y se paga en menos de un mes.',
    },
    {
      q: '¿Cuántos watts de LED equivalen a una lámpara de 60 W?',
      a: 'Alrededor de 8 o 9 W. La cuenta va por lúmenes: una incandescente rinde unos 12 lm/W, así que 60 W dan unos 720 lúmenes; un LED rinde unos 90 lm/W, y 720 ÷ 90 da 8 W. Por eso conviene comprar mirando los lúmenes del envase y no los watts.',
    },
    {
      q: '¿Cuánto consume una heladera por año?',
      a: 'Depende de la capacidad y de la etiqueta de eficiencia. Como referencia se usa un coeficiente por litro: 0,45 kWh al año por litro en una A+++, 0,75 en una A+, 0,95 en una A y 1,7 en una clase D. Una heladera de 350 litros clase A consume entonces unos 333 kWh al año, y la misma en clase D pasa los 590.',
    },
    {
      q: '¿Qué impuestos tiene la factura de luz?',
      a: 'Tres capas sobre el subtotal de energía: la tasa municipal de alumbrado público, que va de 6% a 12% según el partido (usamos 8%); el IVA del 27%, que es la alícuota agravada del artículo 28 de la ley 23.349 para servicios públicos domiciliarios; y el impuesto a los créditos y débitos de la ley 25.413, del 0,6%. Entre todos explican más de un tercio de lo que pagás.',
    },
    {
      q: '¿Cómo bajo el consumo eléctrico sin resignar confort?',
      a: 'Por impacto: subí el aire a 24 grados en vez de 21 (cada grado son entre 6% y 8% menos de consumo), pasá toda la iluminación a LED, cortá el standby con zapatillas con interruptor, corré lavarropas y lavavajillas con carga completa y en programas fríos, y descongelá y limpiá la serpentina de la heladera. Si tenés que renovar un electrodoméstico, la diferencia entre una clase A y una clase D se paga sola en pocos años.',
    },
    {
      q: '¿Qué hago si creo que la factura está mal?',
      a: 'Primero sacá vos mismo la lectura del medidor y comparala con la que figura en la boleta: si dice "estimada", ese es el motivo más probable. Después reclamá por escrito a la distribuidora, que tiene plazo para responder, y si no hay solución podés hacer el reclamo ante el ENRE dentro de los 30 días. Mientras el reclamo está abierto no pueden cortarte el servicio por la parte cuestionada.',
    },
  ],

  sources: [
    {
      name: 'ENRE — Cuadros tarifarios vigentes de Edenor y Edesur',
      url: 'https://www.argentina.gob.ar/enre/cuadros_tarifarios',
      publisher: 'Ente Nacional Regulador de la Electricidad',
      date: '2026',
    },
    {
      name: 'Decreto 943/2025 — Subsidios Energéticos Focalizados (reemplaza la segmentación N1/N2/N3)',
      url: 'https://www.boletinoficial.gob.ar/',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '02/01/2026',
    },
    {
      name: 'Ley 23.349, art. 28 — alícuota de IVA del 27% para servicios públicos domiciliarios',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/42701/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'ENRE — Reclamos por facturación y lectura del medidor',
      url: 'https://www.argentina.gob.ar/enre/usuarios/reclamos',
      publisher: 'Ente Nacional Regulador de la Electricidad',
    },
    {
      name: 'Secretaría de Energía — Etiquetado de eficiencia energética de artefactos',
      url: 'https://www.argentina.gob.ar/economia/energia/eficiencia-energetica/etiquetado',
      publisher: 'Secretaría de Energía de la Nación',
    },
    {
      name: 'INTI — Etiquetado y ensayos de eficiencia energética',
      url: 'https://www.inti.gob.ar/areas/servicios-industriales/eficiencia-energetica',
      publisher: 'Instituto Nacional de Tecnología Industrial',
    },
  ],

  replaces: [
    '/calculadora-consumo-electrico-kwh-factura-luz',
    '/calculadora-potencia-electrica-watts',
    '/calculadora-watts-consumo-electrico-aparato-hora',
    '/calculadora-consumo-electricidad-electrodomestico',
    '/calculadora-foco-led-equivalencia-watts-lumens',
    '/calculadora-factura-luz-estimada',
    '/calculadora-consumo-electrico-aparato-kwh-mes',
    '/calculadora-heladera-clase-a-consumo-anual-kwh',
    '/calculadora-tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3',
    '/calculadora-consumo-electronica-hogar-watts-mensual',
    '/calculadora-consumo-standby-aparatos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Cuadro tarifario — COPIA FIEL de los valores del módulo real del repo,
 * `src/lib/formulas/tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.ts`
 * (esquema SEF, Decreto 943/2025). No inventar números acá: si cambia el
 * cuadro, cambia primero allá y se replica.
 *   cargoFijo: $/mes (cargo fijo + comercialización)
 *   kwhPleno:  $/kWh a precio pleno (lo que paga quien no tiene subsidio)
 */
export const TARIFAS_2026: Record<string, { cargoFijo: number; kwhPleno: number; label: string }> = {
  edenor: { cargoFijo: 3500, kwhPleno: 220, label: 'Edenor' },
  edesur: { cargoFijo: 3520, kwhPleno: 222, label: 'Edesur' },
};

/** Parámetros del esquema SEF y de la carga impositiva (mismo módulo real). */
export const TARIFA_PARAMS = {
  bonificacionBase: 0.5,
  bloqueAltaDemanda: 300,
  bloqueTemplado: 150,
  iva: 0.27,
  ley25413: 0.006,
  alumbrado: 0.08,
};

/**
 * Reparto orientativo de los kWh de un hogar argentino tipo.
 * Sirve para el donut de la rama por defecto: "qué aparato se lleva cuánto".
 * Suma 100.
 */
export const MIX_HOGAR: Array<{ label: string; pct: number; tone: 'main' | 'exit' | 'prop' | 'warn' | 'bad' }> = [
  { label: 'Heladera y freezer', pct: 25, tone: 'main' },
  { label: 'Climatización (aire y estufas)', pct: 22, tone: 'bad' },
  { label: 'Electrónica y standby', pct: 23, tone: 'warn' },
  { label: 'Agua caliente, cocina y lavado', pct: 20, tone: 'prop' },
  { label: 'Iluminación', pct: 10, tone: 'exit' },
];

/** Horas al día que un aparato pasa apagado pero enchufado (valor típico). */
export const HORAS_STANDBY = 20;

/** Rendimiento luminoso por tecnología, en lúmenes por watt. */
export const LM_POR_WATT: Record<string, number> = {
  incandescente: 12,
  halogena: 16,
  cfl: 55,
  led: 90,
};

/** Días considerados en un mes de facturación. */
export const DIAS_MES = 30;
