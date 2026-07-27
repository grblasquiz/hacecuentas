import type { HubData } from './types';
import ibJson from '../../content/argentina/ingresos-brutos.json';
import provinciasJson from '../../content/argentina/provincias.json';

/**
 * Hub de decisión — "Ingresos Brutos: ¿cuánto pago en mi provincia?"
 * Arquetipo RAMIFICADO: una sola jurisdicción (default), Convenio Multilateral
 * y régimen simplificado / mínimo mensual.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DE DÓNDE SALEN LOS NÚMEROS
 *
 * Las alícuotas NO se escriben acá: se derivan de
 * `src/content/argentina/ingresos-brutos.json` → `provinceData[<prov>].metrics`,
 * que es la MISMA tabla que muestran las 24 páginas vivas `/iibb/<provincia>`.
 * Si mañana se actualiza esa tabla, el hub se actualiza solo y no queda
 * diciendo algo distinto que las páginas de provincia.
 *
 * OJO — hay divergencia con `src/lib/formulas/ingresos-brutos.ts`, que tenía su
 * propia tabla hardcodeada de 5 jurisdicciones (y un fallback 3,5% para las
 * otras 19). Donde las dos difieren manda `provinceData`, porque es la que ya
 * está publicada y la que cubre el país entero. El detalle de cada diferencia
 * está en el reporte de este hub.
 *
 * El coeficiente unificado del Convenio Multilateral replica exactamente
 * `src/lib/formulas/iibb-convenio-multilateral-coeficientes.ts`:
 *   coefJur = (participación en ingresos + participación en gastos) / 2.
 * Cambia sólo la entrada: acá se carga el % de la 2ª jurisdicción en vez de los
 * cuatro importes absolutos. Es la misma cuenta (las participaciones son
 * cocientes: sólo importa la proporción, no la escala).
 *
 * PLATA / YMYL: el hub es fiscal. El disclaimer 'tax' de
 * `src/lib/disclaimers.ts` va textual en `fineprint` y como primer `warn` de
 * cada rama.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

interface Metrics {
  [k: string]: string;
}
interface ProvRaw {
  rate?: string;
  metrics?: Metrics;
}

const PROV_DATA = (ibJson as any).provinceData as Record<string, ProvRaw>;
const PROVINCIAS_META = provinciasJson as Array<{ slug: string; name: string; abbr?: string }>;

/** "3.6%" → 3.6 · "1.75% (reducida)" → 1.75 · "0% - 0.5% (promocionada)" → 0. */
function pct(raw: string | undefined): number | null {
  if (!raw) return null;
  const m = String(raw).match(/(\d+(?:[.,]\d+)?)\s*%/);
  return m ? Number(m[1].replace(',', '.')) : null;
}

/** "$5,200" → 5200. */
function money(raw: string | undefined): number | null {
  if (!raw) return null;
  const m = String(raw).replace(/[.,]/g, '').match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

export interface JurisdiccionIibb {
  slug: string;
  nombre: string;
  organismo: string;
  /** Alícuota por actividad, en %. */
  alicuotas: Record<string, number>;
  /** Impuesto mínimo mensual del régimen local, en pesos. */
  minimoMensual: number;
  /** Rango publicado, tal cual figura en la ficha de la provincia. */
  rango: string;
}

/** Actividades del hub → clave del `metrics` publicado por provincia. */
const ACT_MAP: Array<{ id: string; label: string; metric: string; nota?: string }> = [
  { id: 'comercio', label: 'Comercio (venta de productos)', metric: 'Comercio minorista' },
  { id: 'servicios', label: 'Servicios en general', metric: 'Alicuota general' },
  { id: 'profesional', label: 'Profesional / honorarios', metric: 'Servicios profesionales' },
  { id: 'industria', label: 'Industria manufacturera', metric: 'Industria', nota: 'alícuota reducida o exención según radicación' },
  {
    id: 'construccion',
    label: 'Construcción',
    metric: 'Alicuota general',
    nota: 'la construcción suele tener códigos y bases especiales: verificá el código fiscal',
  },
  { id: 'financiera', label: 'Actividad financiera / intermediación', metric: 'Actividades financieras' },
];

export const ACTIVIDADES = ACT_MAP.map((a) => ({ id: a.id, label: a.label, nota: a.nota || '' }));

/** Tabla de las 24 jurisdicciones, derivada del dato publicado. Nada hardcodeado. */
export const JURISDICCIONES: JurisdiccionIibb[] = PROVINCIAS_META.filter((p) => PROV_DATA[p.slug]).map((p) => {
  const d = PROV_DATA[p.slug];
  const m = d.metrics || {};
  const general = pct(m['Alicuota general']) ?? 3.5;
  const alicuotas: Record<string, number> = {};
  for (const a of ACT_MAP) alicuotas[a.id] = pct(m[a.metric]) ?? general;
  return {
    slug: p.slug,
    nombre: p.slug === 'caba' ? 'CABA' : p.name,
    organismo: m['Organismo recaudador'] || 'Rentas provincial',
    alicuotas,
    minimoMensual: money(m['Minimo mensual']) ?? 0,
    rango: d.rate || '',
  };
});

/** Extremos reales del catálogo: alimentan las franjas del gráfico y el copy. */
const TODAS = JURISDICCIONES.flatMap((j) => Object.values(j.alicuotas));
export const ALICUOTA_MIN = Math.min(...TODAS);
export const ALICUOTA_MAX = Math.max(...TODAS);
/** Tope del eje del gráfico, redondeado para arriba al medio punto. */
export const ESCALA_MAX = Math.ceil((ALICUOTA_MAX + 0.5) * 2) / 2;

export const hub: HubData = {
  slug: 'impuestos/ingresos-brutos',
  title: 'Ingresos Brutos: ¿cuánto pago en mi provincia? Alícuotas por actividad',
  description:
    'Calculá cuánto pagás de Ingresos Brutos según tu provincia y tu actividad: alícuota aplicable, impuesto del mes, mínimo del régimen simplificado y reparto por Convenio Multilateral cuando facturás en más de una jurisdicción.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Impuestos provinciales',
  h1: 'Ingresos Brutos: ¿cuánto pago en mi provincia?',
  lede:
    'Ingresos Brutos se paga sobre lo que facturás, no sobre lo que ganás: el mismo peso de venta paga distinto según dónde y de qué trabajes. Cargá tu facturación, elegí tu jurisdicción y tu actividad y mirá la alícuota que te toca, el impuesto del mes y dónde queda tu provincia respecto del resto del país.',
  stamps: [
    'Actualizado 27-07-2026',
    'Convenio Multilateral 18/8/77 · códigos fiscales provinciales',
    '24 jurisdicciones adentro',
  ],

  resultLabel: 'Ingresos Brutos del mes',

  cases: {
    title: '¿Dónde facturás?',
    intro:
      'La diferencia grande no es la actividad: es si toda tu facturación queda en una sola provincia o si cruzás jurisdicciones.',
    items: [
      {
        id: 'una',
        label: 'Facturo sólo en una provincia',
        hint: 'El caso más común',
        answer: 'La base imponible entera va a tu jurisdicción: alícuota local por facturación del mes.',
        yes: [
          'Toda la facturación gravada del mes, sin IVA y sin descuentos ni devoluciones',
          'La alícuota de tu actividad en tu jurisdicción, según el código fiscal vigente',
          'El impuesto mínimo mensual de la provincia, cuando el cálculo da menos que ese piso',
          'Las retenciones y percepciones ya sufridas, que se descuentan del saldo a pagar',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Ingresos Brutos grava el ingreso, no la ganancia: se paga aunque el mes haya cerrado en pérdida.',
          'Las alícuotas de la tabla son las generales publicadas por cada jurisdicción. Tu código de actividad puede tener una alícuota diferenciada, un beneficio o una sobretasa.',
          'Si vendés a clientes de otras provincias o tenés depósito, sucursal o vendedores afuera, ya no estás en este caso: pasás a Convenio Multilateral.',
        ],
        plazo:
          'la declaración jurada mensual vence entre el día 12 y el 20 del mes siguiente según jurisdicción y terminación de CUIT.',
      },
      {
        id: 'convenio',
        label: 'Facturo en más de una provincia',
        hint: 'Convenio Multilateral',
        answer:
          'La base imponible se reparte entre jurisdicciones con el coeficiente unificado: mitad ingresos, mitad gastos.',
        yes: [
          'El coeficiente unificado de cada jurisdicción: promedio simple entre su participación en los ingresos y en los gastos del año anterior',
          'La alícuota propia de cada jurisdicción aplicada sobre la porción de base que le toca',
          'La alícuota efectiva combinada, que es la que realmente te sale sobre el total facturado',
          'La inscripción en Convenio (formulario CM01) y la declaración mensual CM03/CM04',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los coeficientes se arman con el balance del año anterior y se recalculan una vez por año: no se cambian mes a mes.',
          'El régimen general (artículo 2°) no aplica a todas las actividades. Construcción, transporte, seguros, entidades financieras y profesiones liberales tienen regímenes especiales con repartos fijos.',
          'Estar en Convenio no te exime de inscribirte y presentar en cada jurisdicción donde tengas sustento territorial.',
        ],
        plazo:
          'los coeficientes del año se declaran con el CM05 y vencen en junio, con el cierre del ejercicio anterior ya cerrado.',
      },
      {
        id: 'simplificado',
        label: 'Estoy en el régimen simplificado',
        hint: 'Monotributista provincial o cuota fija',
        answer: 'Pagás una cuota mensual fija atada al mínimo de la jurisdicción, no un porcentaje de lo facturado.',
        yes: [
          'El importe mínimo mensual publicado por tu jurisdicción',
          'La comparación contra lo que pagarías por régimen general, para ver si te conviene',
          'El tope de facturación anual: si lo superás, salís del simplificado',
          'La exención o reducción para pequeños contribuyentes, donde la jurisdicción la tenga vigente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El régimen simplificado provincial es distinto del Monotributo nacional: son dos inscripciones y dos pagos separados.',
          'No todas las jurisdicciones lo tienen, y las que lo tienen ponen topes de facturación y de actividad diferentes.',
          'Aunque estés en el simplificado te pueden retener por SIRCREB en las acreditaciones bancarias: esos importes son crédito a tu favor.',
        ],
        plazo:
          'la cuota del simplificado suele vencer el mismo día que la declaración del régimen general, entre el 12 y el 20 del mes siguiente.',
      },
    ],
  },

  inputsTitle: 'Cargá tu situación',
  inputsIntro:
    'La facturación va sin IVA. Los campos de la segunda jurisdicción sólo se usan en el caso de Convenio Multilateral.',
  fields: [
    {
      id: 'facturacion',
      label: 'Facturación gravada del mes (sin IVA)',
      type: 'number',
      prefix: '$',
      thousands: true,
      value: 3000000,
      min: 0,
      help: 'Ventas y servicios devengados del mes. Sin IVA, sin descuentos y sin devoluciones.',
    },
    {
      id: 'provincia',
      label: 'Tu jurisdicción principal',
      type: 'select',
      value: 'caba',
      options: JURISDICCIONES.map((j) => ({ value: j.slug, label: j.nombre })),
    },
    {
      id: 'actividad',
      label: 'Tu actividad',
      type: 'select',
      value: 'servicios',
      options: ACTIVIDADES.map((a) => ({ value: a.id, label: a.label })),
    },
    {
      id: 'provincia2',
      label: 'Segunda jurisdicción (sólo Convenio Multilateral)',
      type: 'select',
      value: 'buenos-aires',
      options: JURISDICCIONES.map((j) => ({ value: j.slug, label: j.nombre })),
    },
    {
      id: 'pctIngresos2',
      label: '% de tus ingresos que se generan en la segunda jurisdicción',
      type: 'number',
      suffix: '%',
      value: 40,
      min: 0,
      max: 100,
      help: 'Del total facturado el año pasado, qué porcentaje corresponde a esa jurisdicción.',
    },
    {
      id: 'pctGastos2',
      label: '% de tus gastos que se soportan en la segunda jurisdicción',
      type: 'number',
      suffix: '%',
      value: 30,
      min: 0,
      max: 100,
      help: 'Sueldos, alquileres, fletes y amortizaciones soportados ahí. El coeficiente promedia ingresos y gastos.',
    },
    {
      id: 'retenciones',
      label: 'Retenciones y percepciones ya sufridas este mes',
      type: 'number',
      prefix: '$',
      thousands: true,
      value: 0,
      min: 0,
      help: 'SIRCREB, retenciones de clientes y percepciones de proveedores. Se descuentan del saldo a pagar.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'scale',
    title: 'Tu alícuota contra el resto del país',
    caption:
      'La barra ubica la alícuota que te toca dentro del rango que hoy publican las 24 jurisdicciones argentinas para todas las actividades. Cuanto más a la derecha, más caro te sale facturar donde estás.',
    bands: [
      { label: 'Baja', from: 0, to: 2.5, tone: 'good' },
      { label: 'Media', from: 2.5, to: 3.5, tone: 'neutral' },
      { label: 'Alta', from: 3.5, to: 4.5, tone: 'warn' },
      { label: 'Muy alta', from: 4.5, to: ESCALA_MAX, tone: 'bad' },
    ],
  },
  breakdownTitle: 'De la facturación al saldo a pagar',
  breakdownIntro:
    'Las filas en pesos son plata del mes. Las filas de alícuota, coeficiente y ranking van con su propia unidad: no son importes.',

  faq: [
    {
      q: '¿Qué es Ingresos Brutos y por qué lo pago si no gané nada?',
      a: 'Es un impuesto provincial que grava el ejercicio habitual de una actividad a título oneroso, y la base imponible son los ingresos brutos devengados, no la ganancia. Por eso se paga aunque el mes cierre en pérdida: mientras haya facturación gravada hay impuesto. Es plurifásico y acumulativo, lo que significa que cada eslabón de la cadena lo vuelve a pagar sobre el precio completo, y por eso se lo señala como el tributo que más encarece el precio final.',
    },
    {
      q: '¿Cuál es la alícuota de Ingresos Brutos en mi provincia?',
      a: `Depende de la jurisdicción y del código de actividad. Hoy el rango que publican las 24 jurisdicciones va del ${ALICUOTA_MIN.toString().replace('.', ',')}% al ${ALICUOTA_MAX.toString().replace('.', ',')}%: la industria manufacturera radicada tiene los valores más bajos y la intermediación financiera los más altos. Podés ver la ficha completa de cada una en <a href="/iibb">la sección de Ingresos Brutos por provincia</a>, con alícuotas, organismo recaudador y régimen de retenciones.`,
    },
    {
      q: '¿Cómo se calcula el impuesto del mes?',
      a: 'Base imponible por alícuota. La base es la facturación gravada devengada del mes sin IVA, descontando descuentos, bonificaciones y devoluciones. A ese impuesto determinado se le restan las retenciones, percepciones y saldos a favor de meses anteriores, y lo que queda es el saldo a pagar. Si el resultado da menos que el importe mínimo mensual de la jurisdicción, se paga el mínimo.',
    },
    {
      q: '¿Qué es el Convenio Multilateral y cuándo tengo que inscribirme?',
      a: 'Es el acuerdo de 1977 entre las 24 jurisdicciones para repartir la base imponible de quien desarrolla una misma actividad en más de una provincia. Te inscribís cuando tenés sustento territorial en otra jurisdicción: local, depósito, vendedores, gastos soportados ahí o entregas efectivas. Vender por internet a un cliente de otra provincia genera sustento si además soportás gastos en esa jurisdicción, y ese es el punto que más discusiones tiene.',
    },
    {
      q: '¿Cómo se calcula el coeficiente unificado?',
      a: 'Es el promedio simple de dos coeficientes: el de ingresos, que mide qué porcentaje de tu facturación se atribuye a esa jurisdicción, y el de gastos, que mide qué porcentaje de tus gastos computables se soporta ahí. Se arman con el balance del año calendario anterior y se aplican durante todo el año siguiente. La suma de los coeficientes de todas las jurisdicciones da siempre 1.',
    },
    {
      q: '¿Hay actividades que no van por el régimen general del Convenio?',
      a: 'Sí. Los artículos 6° a 13° fijan regímenes especiales con repartos predeterminados: construcción (10% jurisdicción de la sede, 90% donde están las obras), seguros y entidades financieras, transporte (se atribuye a la jurisdicción de origen del viaje), profesiones liberales (80% donde se ejerce, 20% donde está el estudio), rematadores e intermediarios y producción primaria e industrias con venta fuera de la jurisdicción. Si tu actividad está en esa lista, el coeficiente unificado no aplica.',
    },
    {
      q: '¿Qué son SIRCREB y las retenciones bancarias?',
      a: 'SIRCREB es el sistema de recaudación sobre acreditaciones bancarias: el banco te retiene un porcentaje de cada depósito o transferencia que entra a tu cuenta y se lo gira a las jurisdicciones donde estás inscripto. No es un impuesto extra, es un pago a cuenta, pero como se aplica sobre el ingreso bruto de la cuenta y no sobre la base imponible real, es la causa número uno de saldos a favor crónicos. Los saldos se recuperan pidiendo la reducción de alícuota o el certificado de no retención en el organismo provincial.',
    },
    {
      q: '¿El régimen simplificado provincial es lo mismo que el Monotributo?',
      a: `No. El Monotributo es nacional y reemplaza Ganancias, IVA y aportes; el régimen simplificado de Ingresos Brutos es provincial y sólo reemplaza la liquidación de ese impuesto local. Son dos inscripciones distintas y dos pagos distintos. Varias jurisdicciones lo unificaron en una sola cuota junto con el Monotributo nacional, pero no todas. Si estás evaluando categorías, mirá también <a href="/impuestos/monotributo">el hub de Monotributo</a>.`,
    },
    {
      q: '¿Qué pasa si no me inscribo o presento fuera de término?',
      a: 'La falta de inscripción habilita a la jurisdicción a determinar el impuesto de oficio sobre base presunta, con multas por omisión que en la mayoría de los códigos fiscales van del 50% al 200% del impuesto omitido, más intereses resarcitorios mensuales. La presentación tardía tiene multa formal automática, bastante menor. Además, sin la constancia de inscripción al día no conseguís el certificado de no retención y las retenciones bancarias te pegan al tope.',
    },
    {
      q: '¿Puedo deducir Ingresos Brutos de Ganancias?',
      a: 'Sí. Ingresos Brutos es un gasto necesario para obtener la renta gravada, así que se deduce en la determinación del impuesto a las Ganancias tanto para personas humanas con rentas de tercera y cuarta categoría como para sociedades. Se computa por lo devengado en el ejercicio, no por lo pagado.',
    },
    {
      q: '¿Hay exenciones para la industria o para la economía del conocimiento?',
      a: 'Sí, y son la diferencia más grande entre jurisdicciones. La industria manufacturera radicada en la provincia suele tener alícuota reducida o exención total sobre la producción propia, y varias jurisdicciones sumaron beneficios para software y servicios basados en conocimiento. Tierra del Fuego tiene además el régimen promocional de la ley 19.640, que es el más generoso del país. Las exenciones casi siempre exigen radicación efectiva y trámite previo: no son automáticas.',
    },
    {
      q: '¿Dónde veo la información de mi provincia en detalle?',
      a: 'Cada jurisdicción tiene su ficha propia con alícuotas por actividad, organismo recaudador, régimen de retenciones y notas locales: <a href="/iibb/buenos-aires">Buenos Aires</a>, <a href="/iibb/caba">CABA</a>, <a href="/iibb/cordoba">Córdoba</a>, <a href="/iibb/santa-fe">Santa Fe</a>, <a href="/iibb/mendoza">Mendoza</a>, <a href="/iibb/tucuman">Tucumán</a>, <a href="/iibb/entre-rios">Entre Ríos</a>, <a href="/iibb/salta">Salta</a>, <a href="/iibb/misiones">Misiones</a>, <a href="/iibb/chaco">Chaco</a>, <a href="/iibb/corrientes">Corrientes</a>, <a href="/iibb/neuquen">Neuquén</a>, <a href="/iibb/rio-negro">Río Negro</a>, <a href="/iibb/chubut">Chubut</a>, <a href="/iibb/santa-cruz">Santa Cruz</a>, <a href="/iibb/tierra-del-fuego">Tierra del Fuego</a>, <a href="/iibb/san-juan">San Juan</a>, <a href="/iibb/san-luis">San Luis</a>, <a href="/iibb/la-rioja">La Rioja</a>, <a href="/iibb/catamarca">Catamarca</a>, <a href="/iibb/jujuy">Jujuy</a>, <a href="/iibb/la-pampa">La Pampa</a>, <a href="/iibb/formosa">Formosa</a> y <a href="/iibb/santiago-del-estero">Santiago del Estero</a>.',
    },
  ],

  sources: [
    {
      name: 'Convenio Multilateral del 18/8/77 — texto y régimen general',
      url: 'https://www.ca.gov.ar/normativa/convenio-multilateral',
      publisher: 'Comisión Arbitral del Convenio Multilateral',
    },
    {
      name: 'SIRCREB — Sistema de Recaudación y Control de Acreditaciones Bancarias',
      url: 'https://www.comarb.gob.ar/sircreb/',
      publisher: 'Comisión Arbitral',
    },
    {
      name: 'ARBA — Ingresos Brutos, alícuotas y régimen simplificado (Buenos Aires)',
      url: 'https://www.arba.gov.ar/ingresos-brutos',
      publisher: 'Agencia de Recaudación de la Provincia de Buenos Aires',
    },
    {
      name: 'AGIP — Ingresos Brutos Ciudad de Buenos Aires',
      url: 'https://www.agip.gob.ar/impuestos/ingresos-brutos',
      publisher: 'Administración Gubernamental de Ingresos Públicos (CABA)',
    },
    {
      name: 'Rentas Córdoba — Ingresos Brutos',
      url: 'https://www.rentascordoba.gob.ar/ingresos-brutos',
      publisher: 'Dirección General de Rentas de Córdoba',
    },
    {
      name: 'API Santa Fe — Impuesto sobre los Ingresos Brutos',
      url: 'https://www.santafe.gob.ar/index.php/web/content/view/full/112762',
      publisher: 'Administración Provincial de Impuestos de Santa Fe',
    },
  ],

  replaces: ['/calculadora-ingresos-brutos-provincial', '/calculadora-iibb-convenio-multilateral-coeficientes'],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
