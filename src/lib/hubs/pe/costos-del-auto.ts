import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "¿Cuánto me cuesta al año tener el auto al día en el Perú?"
 *
 * Absorbe: precio del SOAT, costo de la revisión técnica (CITV), impuesto al patrimonio
 * vehicular y costo de viaje en gasolina por galón.
 *
 * Constantes: UIT de src/lib/data/peru-2026.ts. Los rangos de prima del SOAT y las tarifas
 * de CITV son de mercado (no hay tarifa fija por ley) y vienen de las fórmulas vivas
 * soat-peru-precio.ts y revision-tecnica-vehicular-peru.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa basada en los parámetros indicados. No constituye asesoramiento financiero ni de inversión; verificá las condiciones vigentes con tu entidad antes de decidir.';

export const UIT = PERU_2026.uit;
export const ANIO = PERU_2026.anio;

/** Impuesto al patrimonio vehicular: 1% de la base, piso de 1,5% de la UIT, 3 ejercicios. */
export const IMPUESTO_VEHICULAR = {
  tasa: 0.01,
  pisoUit: 0.015,
  aniosAfecto: 3,
};

/**
 * Rangos de prima ANUAL del SOAT por categoría (S/). El SOAT no tiene tarifa fija:
 * cada aseguradora fija su prima. Lo regulado son las coberturas, no el precio.
 */
export const SOAT_RANGOS: Record<string, { min: number; max: number; label: string }> = {
  auto: { min: 34, max: 200, label: 'Auto particular' },
  moto: { min: 33, max: 336, label: 'Moto o mototaxi' },
  taxi: { min: 80, max: 250, label: 'Taxi o auto de servicio' },
};

/** Coberturas legales del SOAT, en UIT (TUO del Reglamento Nacional del SOAT). */
export const SOAT_COBERTURAS_UIT = {
  muerte: 4,
  invalidez: 4,
  gastosMedicos: 5,
  incapacidadTemporal: 1,
  sepelio: 1,
};

/** Tarifas representativas de la inspección técnica vehicular por categoría (S/). */
export const CITV_TARIFAS: Record<string, { tipico: number; min: number; max: number; label: string }> = {
  auto: { tipico: 95, min: 80, max: 100, label: 'Auto particular (M1)' },
  moto: { tipico: 35, min: 30, max: 40, label: 'Vehículo menor (L)' },
  taxi: { tipico: 110, min: 95, max: 150, label: 'Taxi o transporte de personas (M)' },
};

/** Multa por circular sin CITV vigente, en fracción de UIT (infracciones muy graves). */
export const MULTA_CITV_UIT = { general: 0.5, vehiculoMenorL5: 0.05 };

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/auto/costos-del-auto',
  title: 'Cuánto cuesta tener el auto al día en el Perú: SOAT, revisión técnica, impuesto y gasolina',
  description:
    'Suma el costo anual real de tu vehículo en el Perú: la prima del SOAT, la revisión técnica vehicular, el impuesto al patrimonio vehicular si todavía te corresponde, y la gasolina que gastas cada mes medida en galones.',
  silo: 'Auto',
  siloHref: '/pe/auto',
  locale: 'pe',

  eyebrow: 'Perú · SOAT, CITV, impuesto vehicular y combustible',
  h1: '¿Cuánto me cuesta al año tener el auto al día en el Perú?',
  lede:
    'Tener el auto en regla cuesta bastante menos que lo que cuesta no tenerlo: la papeleta por circular sin revisión técnica vale muchas veces lo que la inspección. Acá se suma todo lo que un vehículo pide al año en el Perú, incluido el impuesto al patrimonio vehicular, que solo se paga durante tres ejercicios y que muchos siguen pagando de más.',
  stamps: [
    `UIT ${sol(UIT)} · impuesto vehicular 1% con piso de ${sol(UIT * IMPUESTO_VEHICULAR.pisoUit)}`,
    'El combustible en el Perú se vende por galón',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Costo anual del vehículo',

  cases: {
    title: '¿Qué vehículo tienes?',
    intro:
      'La cuenta cambia sobre todo por dos cosas: si el vehículo todavía está en los tres años en que paga impuesto al patrimonio, y si el uso es particular o de trabajo.',
    items: [
      {
        id: 'nuevo',
        label: 'Auto con menos de 3 años',
        hint: 'Paga impuesto al patrimonio vehicular',
        answer: 'Un auto dentro de los tres primeros ejercicios paga el 1% de su valor de adquisición como impuesto al patrimonio vehicular.',
        yes: [
          'Impuesto al patrimonio vehicular: 1% de la base imponible',
          `Base imponible: el valor de adquisición, que nunca puede ser menor al de la tabla de valores referenciales del MEF`,
          `Monto mínimo del impuesto: 1,5% de la UIT (${sol(UIT * IMPUESTO_VEHICULAR.pisoUit)})`,
          'SOAT anual, revisión técnica y combustible del año',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El impuesto se paga durante tres ejercicios contados desde el año siguiente al de la primera inscripción registral: recién inscrito, el primer año no se paga',
          'Superados esos tres ejercicios el vehículo deja de estar afecto, aunque el auto siga siendo prácticamente nuevo',
          'Si tu valor de adquisición es menor al de la tabla referencial del MEF, la base es la de la tabla, no la de tu factura',
        ],
        plazo: 'el impuesto vence el último día hábil de febrero y se puede fraccionar en cuatro cuotas trimestrales.',
      },
      {
        id: 'usado',
        label: 'Auto usado, con más de 3 años',
        hint: 'Ya no paga impuesto vehicular',
        answer: 'Pasados los tres ejercicios el auto ya no paga impuesto al patrimonio vehicular: quedan el SOAT, la revisión técnica y el combustible.',
        yes: [
          'SOAT anual, con prima que sube con la antigüedad del vehículo',
          'Revisión técnica vehicular en un centro autorizado',
          'Gasolina del año, calculada por galón',
          'Cero de impuesto al patrimonio vehicular',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Que el auto ya no pague impuesto al patrimonio no significa que no deba nada: el SOAT y la revisión técnica son obligatorios toda la vida del vehículo',
          'Con más años, la prima del SOAT tiende al extremo alto del rango de mercado',
        ],
        plazo: 'la periodicidad de la revisión técnica depende de la antigüedad y del uso del vehículo: confírmala antes de que se venza.',
      },
      {
        id: 'trabajo',
        label: 'Taxi o vehículo de trabajo',
        hint: 'Prima y revisión más caras, más frecuencia',
        answer: 'Un vehículo de servicio paga más SOAT, más caro el CITV y pasa la inspección con más frecuencia que uno particular.',
        yes: [
          'Prima de SOAT de uso comercial de pasajeros, bastante más alta que la particular',
          'Tarifa de inspección de la categoría de transporte de personas',
          'Kilometraje mucho mayor: el combustible pasa a ser el rubro dominante',
          'El impuesto al patrimonio se paga igual si el vehículo está dentro de los tres ejercicios',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El transporte de personas pasa la inspección técnica con más frecuencia que un particular: verifica la periodicidad que te corresponde antes de programarla',
          'En provincias, el transporte público de ámbito regional puede optar por un certificado de una AFOCAT en lugar del SOAT, más barato pero con cobertura solo dentro de la región',
          'Circular con la revisión técnica vencida es infracción muy grave: además de la multa hay internamiento del vehículo',
        ],
        plazo: 'la inspección se programa con cita en el centro autorizado; ir con el vencimiento encima es lo que termina en papeleta.',
      },
      {
        id: 'moto',
        label: 'Una moto',
        hint: 'SOAT y CITV más baratos',
        answer: 'La moto tiene el SOAT y la inspección más baratos, pero el rango de prima se dispara si el uso es de reparto.',
        yes: [
          'SOAT de vehículo menor, el más económico del mercado',
          'Inspección técnica de la categoría de vehículos menores',
          'Consumo de combustible mucho menor por kilómetro',
          'Las motos no pagan impuesto al patrimonio vehicular',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El impuesto al patrimonio vehicular grava autos, camionetas, station wagons, camiones, buses y tracto camiones: las motos lineales no están dentro del hecho gravado',
          'El uso de reparto o comercial encarece mucho la prima del SOAT respecto de la moto particular',
          'Los vehículos menores de la categoría L5, como los mototaxis, tienen una infracción específica por circular sin inspección vigente, con una multa mucho menor que la general',
        ],
        plazo: 'el SOAT de la moto es anual como cualquier otro, y circular sin él es infracción grave.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'El valor del vehículo y el año de la primera inscripción definen el impuesto. Los kilómetros y el precio del galón definen el combustible, que casi siempre es el rubro más grande.',
  fields: [
    {
      id: 'valor',
      label: 'Valor del vehículo (S/)',
      type: 'number',
      prefix: 'S/',
      value: 60000,
      min: 0,
      step: 1000,
      help: 'Valor de adquisición o el de la tabla de valores referenciales del MEF, el que sea mayor. Solo se usa para el impuesto al patrimonio vehicular.',
    },
    {
      id: 'anioInscripcion',
      label: 'Año de la primera inscripción registral',
      type: 'number',
      value: ANIO - 1,
      min: 1990,
      max: ANIO + 1,
      step: 1,
      help: 'El año en que el vehículo se inscribió por primera vez en el Registro de Propiedad Vehicular. Define si todavía estás dentro de los tres ejercicios que paga impuesto.',
    },
    {
      id: 'antiguedad',
      label: 'Antigüedad del vehículo (años)',
      type: 'number',
      value: 2,
      min: 0,
      max: 40,
      step: 1,
      help: 'Se usa solo para posicionar la prima del SOAT dentro del rango de mercado: a más años, prima más alta.',
    },
    {
      id: 'kmMes',
      label: 'Kilómetros que recorres por mes',
      type: 'number',
      value: 800,
      min: 0,
      step: 50,
      help: 'Un uso particular urbano suele estar entre 500 y 1.200 km al mes; un taxi puede pasar los 4.000.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento del vehículo (km por galón)',
      type: 'number',
      value: 40,
      min: 1,
      max: 200,
      step: 1,
      help: 'En el Perú el combustible se vende por galón. Un sedán promedio rinde entre 35 y 50 km por galón en carretera, y bastante menos en ciudad.',
    },
    {
      id: 'precioGalon',
      label: 'Precio del galón (S/)',
      type: 'number',
      prefix: 'S/',
      value: 17.5,
      min: 0,
      step: 0.1,
      help: 'Consulta el precio exacto de tu grifo en Facilito de Osinergmin: entre el grifo más caro y el más barato de una misma ciudad hay varios soles de diferencia por galón.',
    },
    {
      id: 'citvPorAnio',
      label: '¿Cuántas inspecciones técnicas te tocan al año?',
      type: 'select',
      value: '1',
      options: [
        { value: '0', label: 'Ninguna todavía (vehículo nuevo, aún no le toca)' },
        { value: '1', label: 'Una al año' },
        { value: '2', label: 'Dos al año (semestral)' },
      ],
      help: 'La periodicidad depende de la antigüedad y del uso del vehículo, y la fija el MTC. Verifica la que te corresponde en gob.pe antes de programarla: acá es un campo editable justamente porque no es una constante única.',
    },
    {
      id: 'region',
      label: '¿Dónde circulas?',
      type: 'select',
      value: 'lima',
      options: [
        { value: 'lima', label: 'Lima o ciudad grande' },
        { value: 'provincia', label: 'Provincia' },
      ],
      help: 'En provincia la prima del SOAT tiende a ser algo menor, y el transporte público de ámbito regional puede optar por un certificado de AFOCAT.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata del auto',
    caption:
      'Compara los costos obligatorios de tener el vehículo al día contra lo que gastas en combustible. En un uso normal, la gasolina se lleva la mayor parte y los trámites son la porción chica.',
  },
  breakdownTitle: 'El costo del año, línea por línea',
  breakdownIntro:
    'Primero lo obligatorio (SOAT, inspección técnica, impuesto), después el combustible, y al final el costo por kilómetro que sale de todo eso.',

  faq: [
    {
      q: '¿Cuánto cuesta el SOAT en el Perú?',
      a: 'No hay un precio único: el SOAT no tiene tarifa fija por ley. Cada aseguradora fija su prima según el tipo de vehículo, el uso, la antigüedad y la zona de circulación. Un auto particular puede conseguirse desde unas decenas de soles en modalidad virtual y llegar a doscientos según el caso; un vehículo de transporte de pasajeros cuesta bastante más. Lo que sí está regulado y es igual en todas las pólizas son las coberturas.',
    },
    {
      q: '¿Qué cubre el SOAT y por cuánto?',
      a: `Las coberturas están fijadas en UIT, así que suben cada vez que sube la UIT. Cubre muerte por ${SOAT_COBERTURAS_UIT.muerte} UIT (${sol(SOAT_COBERTURAS_UIT.muerte * UIT)}), invalidez permanente hasta ${SOAT_COBERTURAS_UIT.invalidez} UIT, gastos médicos hasta ${SOAT_COBERTURAS_UIT.gastosMedicos} UIT (${sol(SOAT_COBERTURAS_UIT.gastosMedicos * UIT)}), e incapacidad temporal y gastos de sepelio hasta ${SOAT_COBERTURAS_UIT.incapacidadTemporal} UIT cada uno. Cubre a todos los ocupantes y a los terceros, sin investigar quién tuvo la culpa.`,
    },
    {
      q: '¿Qué diferencia hay entre el SOAT y el CAT de una AFOCAT?',
      a: 'El SOAT lo emite una aseguradora supervisada por la SBS y cubre en todo el territorio nacional. El CAT lo emite una AFOCAT y está pensado para el transporte público de ámbito regional o provincial: suele ser más barato, pero solo cubre dentro de la región donde se emitió. Para un vehículo particular o que circula entre regiones, el SOAT es la única opción sensata.',
    },
    {
      q: '¿Quién paga el impuesto al patrimonio vehicular y por cuánto tiempo?',
      a: `Lo pagan los propietarios de autos, camionetas, station wagons, camiones, buses, ómnibus y tracto camiones, durante ${IMPUESTO_VEHICULAR.aniosAfecto} ejercicios contados desde el año siguiente al de la primera inscripción registral. Es decir: si el vehículo se inscribió un año, se paga los tres años siguientes y después deja de estar afecto. Las motos lineales no están dentro del hecho gravado.`,
    },
    {
      q: '¿Cómo se calcula el impuesto al patrimonio vehicular?',
      a: `Es el 1% de la base imponible, que es el valor de adquisición, importación o ingreso al patrimonio, y que en ningún caso puede ser menor al de la tabla de valores referenciales que aprueba anualmente el MEF. Además tiene un piso: el impuesto nunca puede ser inferior al 1,5% de la UIT vigente al primero de enero, es decir ${sol(UIT * IMPUESTO_VEHICULAR.pisoUit)}. Vence el último día hábil de febrero y se puede fraccionar en cuatro cuotas trimestrales.`,
    },
    {
      q: '¿Cuánto cuesta la revisión técnica vehicular?',
      a: 'Depende de la categoría del vehículo y del centro de inspección, porque cada CITV autorizado fija su precio dentro de los rangos de mercado. Un auto particular ronda los noventa soles, un vehículo menor está bastante por debajo y un vehículo de transporte de personas o de carga cuesta más. Lima suele estar en el extremo alto del rango y provincias en el bajo.',
    },
    {
      q: '¿Qué pasa si circulo con la revisión técnica vencida?',
      a: `Es una infracción muy grave. La multa general equivale a ${MULTA_CITV_UIT.general} UIT, o sea ${sol(UIT * MULTA_CITV_UIT.general)}, más cincuenta puntos en el récord del conductor y el internamiento del vehículo. Para los vehículos menores de la categoría L5, como los mototaxis, hay una infracción específica mucho menor, de ${sol(UIT * MULTA_CITV_UIT.vehiculoMenorL5)}. En cualquier caso, la inspección cuesta una fracción de la multa.`,
    },
    {
      q: '¿Cada cuánto tengo que pasar la revisión técnica?',
      a: 'La periodicidad la fija el MTC y depende de la antigüedad y del uso del vehículo: un particular nuevo tarda varios años en tener su primera inspección y después pasa a un régimen periódico, mientras que un vehículo de transporte de personas se inspecciona con mucha más frecuencia. Como no es un único número para todos, en este hub la cantidad de inspecciones al año es un campo que tú eliges; confirma la que te corresponde en el portal del Estado antes de programarla.',
    },
    {
      q: '¿Por qué el combustible se calcula por galón y no por litro?',
      a: 'Porque en el Perú los grifos venden y publican el precio por galón, no por litro. Un galón equivale a 3,785 litros. Por eso el rendimiento de los vehículos también se expresa en kilómetros por galón, y usar un rendimiento en kilómetros por litro sin convertir da un gasto casi cuatro veces menor al real.',
    },
    {
      q: '¿Cuál es el rubro más caro de tener un auto?',
      a: 'Casi siempre el combustible, y por bastante margen. En un uso urbano normal, la gasolina de un año supera con holgura la suma del SOAT, la revisión técnica y el impuesto. Por eso la palanca de ahorro más grande no está en buscar el SOAT más barato sino en el rendimiento del vehículo, en el precio del grifo donde cargas y en cuántos kilómetros haces realmente.',
    },
    {
      q: '¿Esta cuenta incluye el mantenimiento y las llantas?',
      a: 'No. Este hub suma lo que el Estado y el seguro obligatorio te exigen para circular, más el combustible. El mantenimiento periódico, las llantas, la depreciación, la cochera y un eventual seguro vehicular contra todo riesgo van por fuera y en conjunto pueden pesar tanto como lo que ves acá. Si estás decidiendo si comprar un auto, súmalos antes de decidir.',
    },
    {
      q: '¿El seguro contra todo riesgo es obligatorio?',
      a: 'No lo es por ley: lo único obligatorio es el SOAT. Sí se vuelve obligatorio por contrato cuando compras el vehículo con un crédito vehicular, porque el auto es la garantía del banco y la entidad exige mantenerlo asegurado contra todo riesgo mientras dure el crédito. Ese seguro es una de las razones por las que la TCEA de un crédito vehicular se despega tanto de la tasa de interés.',
    },
  ],

  sources: [
    { name: 'MTC — Revisión técnica vehicular', url: 'https://www.gob.pe/397-revision-tecnica-vehicular', publisher: 'Ministerio de Transportes y Comunicaciones' },
    { name: 'SBS — Seguro Obligatorio de Accidentes de Tránsito (SOAT)', url: 'https://www.sbs.gob.pe/usuarios/informacion-de-seguros/seguros-obligatorios/soat', publisher: 'Superintendencia de Banca, Seguros y AFP' },
    { name: 'SAT de Lima — Impuesto al patrimonio vehicular', url: 'https://www.sat.gob.pe/websitev9/TributosMultas/ImpuestoVehicular/Informacion', publisher: 'Servicio de Administración Tributaria de Lima' },
    { name: 'MEF — Tabla de valores referenciales de vehículos', url: 'https://www.gob.pe/mef', publisher: 'Ministerio de Economía y Finanzas' },
    { name: 'Osinergmin — Facilito, precios de combustibles por grifo', url: 'https://www.osinergmin.gob.pe/', publisher: 'Osinergmin' },
    { name: 'SUNAT — Unidad Impositiva Tributaria (UIT) por año', url: 'https://www.sunat.gob.pe/indicestasas/uit.html', publisher: 'SUNAT' },
  ],

  replaces: [
    '/pe/calculadora-soat-peru-precio',
    '/pe/calculadora-revision-tecnica-vehicular-peru',
    '/pe/calculadora-impuesto-vehicular-peru',
    '/pe/calculadora-costo-viaje-gasolina-galon-peru',
  ],

  lastReviewed: '2026-07-28',
};
