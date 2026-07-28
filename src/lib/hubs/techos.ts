import type { HubData } from './types';
import { getCalculatorDisclaimer } from '../disclaimers';
import { pendienteTecho } from '../formulas/pendiente-techo';
import { membranaAsfalticaRollos } from '../formulas/membrana-asfaltica-rollos';
import { compute as impermeabilizacionTecho } from '../formulas/impermeabilizacion-techo-membrana-rollos-m2-costo';
import { techosTejas } from '../formulas/techos-tejas';
import { impermeabilizanteM2 } from '../formulas/impermeabilizante-m2';

/**
 * Hub de decisión — "¿Cuánto material necesito para el techo y cuánto me sale?"
 *
 * Arquetipo CÁLCULO DOMINANTE (sin `cases`): el trabajo se elige en un `select`
 * (impermeabilizar con membrana / colocar tejas / sólo la pendiente) y la
 * respuesta general va en `answer`.
 *
 * Absorbe 5 URLs (ver `replaces`).
 *
 * NINGUNA constante está escrita a mano: todas se DERIVAN llamando a las
 * fórmulas reales del repo. Cuando alguien las actualice, el hub se actualiza
 * solo.
 *
 *   pendiente %↔grados, cm/m y clasificación   → pendiente-techo.ts
 *   solape del 10% y rollo de 10 m²             → membrana-asfaltica-rollos.ts
 *   precios de rollo, adhesivo y mano de obra   → impermeabilizacion-techo-membrana-rollos-m2-costo.ts
 *   piezas por m² de cada teja, cumbreras, listones → techos-tejas.ts
 *   kg de imprimación por m²                    → impermeabilizante-m2.ts
 *
 * Lo que el hub agrega y ninguna calc suelta hacía: la pendiente y la
 * superficie real del faldón dejan de ser un cálculo aparte y entran como
 * campo del mismo formulario que compra el material.
 *
 * NOTAS DE CONTRATO:
 *  - m², rollos, kg, piezas, metros, grados y porcentajes NO son plata: todas
 *    esas filas declaran `format: 'unit'`. El runtime hace Object.assign y una
 *    fila sin `format` propio cae a pesos.
 *  - El default del resultado es 'ars': el número grande es el costo. La rama
 *    "sólo la pendiente" lo pisa a 'plain' porque ahí no hay plata.
 */

/** YMYL estructural: el texto sale de disclaimers.ts, no se reescribe acá. */
export const DISCLAIMER = getCalculatorDisclaimer({
  slug: 'construccion/techos',
  category: 'construccion',
  h1: 'Techo: materiales y estructura de la cubierta',
});

/* ────────────────────────────── MEMBRANA ─────────────────────────────── */

/**
 * Los precios y rendimientos de cada membrana están encapsulados en la
 * fórmula. Se despejan con tres llamadas:
 *   solape 10% → 110 rollos y el pegamento de 1.000 m²
 *   solape 50% → 150 rollos, mismo pegamento  ⇒ el delta da el precio del rollo
 *   con mano de obra → el $/m² del colocador
 *
 * OJO: la fórmula hace `Number(i.solape) || 10`, así que sondearla con
 * solape 0 devuelve silenciosamente el resultado del 10%. Por eso se sondea
 * con 10 y 50, que son valores truthy.
 */
function membranaDe(id: string) {
  const a = impermeabilizacionTecho({ superficie: 1000, tipoMembrana: id, solape: 10, incluirManoObra: 'no' });
  const b = impermeabilizacionTecho({ superficie: 1000, tipoMembrana: id, solape: 50, incluirManoObra: 'no' });
  const c = impermeabilizacionTecho({ superficie: 1000, tipoMembrana: id, solape: 10, incluirManoObra: 'si' });

  const areaPorRollo = (1000 * 1.1) / a.rollosNecesarios;
  const precioRollo = Math.round((b.costoMateriales - a.costoMateriales) / (b.rollosNecesarios - a.rollosNecesarios));
  const kgPegPorM2 = a.kgPegamento / 1000;
  const precioPegKg = Math.round((a.costoMateriales - a.rollosNecesarios * precioRollo) / a.kgPegamento);
  const moPorM2 = c.costoManoObra / 1000;
  const label = String(a.detalle).split('Membrana: ')[1].split('.')[0];

  return { label, areaPorRollo, precioRollo, kgPegPorM2, precioPegKg, moPorM2 };
}

export const MEMBRANAS: Record<
  string,
  { label: string; areaPorRollo: number; precioRollo: number; kgPegPorM2: number; precioPegKg: number; moPorM2: number }
> = {
  geotextil_35: membranaDe('geotextil_35'),
  geotextil_40: membranaDe('geotextil_40'),
  aluminio: membranaDe('aluminio'),
};

/** Solape que da por sentado la calculadora de rollos, despejado de su fórmula. */
export const SOLAPE_DEFAULT_PCT = (() => {
  const out = membranaAsfalticaRollos({ m2: 1000 });
  const rollos = Number(out.rollos);
  return Math.round((rollos * MEMBRANAS.geotextil_40.areaPorRollo / 1000 - 1) * 100);
})();

/** kg de imprimación (primer) asfáltica por m², desde impermeabilizante-m2.ts. */
export const PRIMER_KG_M2 = impermeabilizanteM2({ superficieM2: 1000, tipo: 'membrana-asfaltica', capas: 1 }).primerKg / 1000;

/* ─────────────────────────────── TEJAS ───────────────────────────────── */

/**
 * Piezas por m² de cada teja. Se leen del propio output (`tejasPorM2`) y el
 * nombre del tipo, del campo `tipo`. Se usa pendiente ≈ 0 para no meter el
 * factor de inclinación acá: en el hub la pendiente la pone el usuario.
 */
function tejaDe(id: string) {
  const o = techosTejas({ m2: 1000, tipoTeja: id, pendiente: 1e-9, desperdicio: 1e-9 });
  return { label: o.tipo, porM2: o.tejasPorM2 };
}

export const TEJAS: Record<string, { label: string; porM2: number }> = {
  francesa: tejaDe('francesa'),
  colonial: tejaDe('colonial'),
  romana: tejaDe('romana'),
  portuguesa: tejaDe('portuguesa'),
  espanola: tejaDe('espanola'),
  shingle: tejaDe('shingle'),
  cemento: tejaDe('cemento'),
};

/** 1 cumbrera cada N m² de faldón, despejado de techos-tejas.ts. */
export const CUMBRERA_CADA_M2 = 1500 / techosTejas({ m2: 1500, tipoTeja: 'francesa', pendiente: 1e-9, desperdicio: 1e-9 }).cumbreras;

/** Metros lineales de listón por m² de faldón, despejado de techos-tejas.ts. */
export const LISTONES_M_POR_M2 = techosTejas({ m2: 1000, tipoTeja: 'francesa', pendiente: 1e-9, desperdicio: 1e-9 }).listonesMlineales / 1000;

/** Desperdicio por defecto de la fórmula de tejas (roturas y recortes). */
export const DESPERDICIO_DEFAULT_PCT = (() => {
  const o = techosTejas({ m2: 1000, tipoTeja: 'francesa', pendiente: 1e-9 });
  return Math.round((o.tejas / (1000 * TEJAS.francesa.porM2) - 1) * 100);
})();

/* ───────────────────────────── PENDIENTE ─────────────────────────────── */

/**
 * Franjas de clasificación de la pendiente, barridas desde la fórmula real
 * (no copiadas a mano). `hasta` es el % donde termina cada franja; la última
 * se cierra en 9999 y no en Infinity porque `define:vars` serializa a JSON e
 * Infinity se convierte en null.
 */
export const CLASIF: Array<{ hasta: number; label: string }> = (() => {
  const out: Array<{ hasta: number; label: string }> = [];
  let last = '';
  for (let p = 1; p <= 2000; p++) {
    const pct = p / 10;
    const c = pendienteTecho({ calcular: 'por-porcentaje', porcentaje: pct }).clasificacion;
    if (c !== last) {
      if (out.length) out[out.length - 1].hasta = pct;
      out.push({ hasta: 9999, label: c });
      last = c;
    }
  }
  return out;
})();

/** Ejemplo de referencia usado en el copy: 30% de pendiente. */
const _p30 = pendienteTecho({ calcular: 'por-porcentaje', porcentaje: 30 });
/** Factor de superficie de un faldón al 30%: largo inclinado / base. */
export const FACTOR_30 = _p30.largoInclinado / 100;

const nAr = (v: number, d = 1) => v.toLocaleString('es-AR', { maximumFractionDigits: d });
const $ = (v: number) => '$' + Math.round(v).toLocaleString('es-AR');

const M40 = MEMBRANAS.geotextil_40;
const EXTRA_30_PCT = Math.round((FACTOR_30 - 1) * 100);

export const hub: HubData = {
  slug: 'construccion/techos',
  title: '¿Cuánto material necesito para el techo? Membrana, tejas y pendiente',
  description:
    'Calculá la pendiente del techo en grados y en porcentaje, cuánta superficie real de faldón te agrega esa pendiente, cuántos rollos de membrana asfáltica necesitás para impermeabilizar y cuántas tejas entran por m², con el costo del material.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Cómputo de materiales',
  h1: '¿Cuánto material necesito para el techo y cuánto me sale?',
  lede:
    'El error clásico es comprar por los metros de la planta. Un techo inclinado tiene más superficie que el rectángulo que ves desde arriba: poné el largo, el ancho y la pendiente y te devolvemos los m² reales del faldón, los rollos de membrana o las tejas que entran, y lo que sale el material.',
  stamps: [
    'Actualizado 27-07-2026',
    `Pendiente en % y en grados · al 30% el faldón crece ${EXTRA_30_PCT}%`,
    `Rollo de membrana de ${nAr(M40.areaPorRollo)} m² con ${SOLAPE_DEFAULT_PCT}% de solape`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Costo del material del techo',

  inputsTitle: 'Medí el techo en planta y decinos la pendiente',
  inputsIntro:
    'Largo y ancho son los del techo VISTO DESDE ARRIBA (la proyección horizontal), no los del faldón inclinado: la inclinación la agrega el cálculo. Si el techo es a dos aguas, cargá la planta completa: los dos faldones suman lo mismo que el rectángulo inclinado.',
  fields: [
    {
      id: 'trabajo',
      label: '¿Qué necesitás calcular?',
      type: 'select',
      value: 'membrana',
      options: [
        { value: 'membrana', label: 'Impermeabilizar con membrana asfáltica' },
        { value: 'tejas', label: 'Colocar tejas' },
        { value: 'pendiente', label: 'Sólo la pendiente y los m² reales' },
      ],
    },
    { id: 'largo', label: 'Largo del techo en planta (m)', type: 'number', min: 0, step: 0.1, value: 8 },
    { id: 'ancho', label: 'Ancho del techo en planta (m)', type: 'number', min: 0, step: 0.1, value: 6 },
    {
      id: 'modo',
      label: '¿Cómo conocés la pendiente?',
      type: 'select',
      value: 'porcentaje',
      options: [
        { value: 'porcentaje', label: 'En porcentaje (cm que sube por metro)' },
        { value: 'grados', label: 'En grados' },
        { value: 'altura', label: 'Por altura y base (cm)' },
      ],
    },
    {
      id: 'pendiente',
      label: 'Pendiente (% o grados, según lo de arriba)',
      type: 'number',
      min: 0,
      max: 300,
      step: 0.1,
      value: 30,
      help: '30% = sube 30 cm por cada metro horizontal. Una losa plana con desagüe ronda el 2%.',
    },
    {
      id: 'altura',
      label: 'Altura de la cumbrera sobre el alero (cm) — sólo modo altura',
      type: 'number',
      min: 0,
      step: 1,
      value: 120,
    },
    {
      id: 'base',
      label: 'Proyección horizontal de ese tramo (cm) — sólo modo altura',
      type: 'number',
      min: 0,
      step: 1,
      value: 400,
      help: 'En un techo a dos aguas es la mitad de la luz, no la luz entera.',
    },
    {
      id: 'tipoMembrana',
      label: 'Tipo de membrana (sólo impermeabilización)',
      type: 'select',
      value: 'geotextil_40',
      options: Object.entries(MEMBRANAS).map(([value, m]) => ({ value, label: m.label })),
    },
    {
      id: 'solape',
      label: 'Solape y desperdicio de la membrana (%)',
      type: 'number',
      min: 0,
      max: 50,
      step: 1,
      value: SOLAPE_DEFAULT_PCT,
      help: `${SOLAPE_DEFAULT_PCT}% es el solape estándar entre tiras. Con muchos babetas, chimeneas o desagües, subilo.`,
    },
    {
      id: 'tipoTeja',
      label: 'Tipo de teja (sólo tejas)',
      type: 'select',
      value: 'francesa',
      options: Object.entries(TEJAS).map(([value, t]) => ({
        value,
        label: `${t.label} — ${nAr(t.porM2)} por m²`,
      })),
    },
    {
      id: 'desperdicio',
      label: 'Desperdicio por roturas y recortes (%)',
      type: 'number',
      min: 0,
      max: 40,
      step: 1,
      value: DESPERDICIO_DEFAULT_PCT,
    },
    {
      id: 'precioRollo',
      label: 'Precio del rollo de membrana ($)',
      type: 'number',
      min: 0,
      value: M40.precioRollo,
      thousands: true,
      help: 'Cambia solo al elegir otra membrana. Pisalo con el precio de tu corralón.',
    },
    {
      id: 'precioPegKg',
      label: 'Precio del kg de adhesivo e imprimación asfáltica ($)',
      type: 'number',
      min: 0,
      value: M40.precioPegKg,
      thousands: true,
    },
    {
      id: 'precioTeja',
      label: 'Precio de la teja ($ por pieza)',
      type: 'number',
      min: 0,
      value: 2500,
      thousands: true,
      help: 'Precio de referencia: pisalo con el de tu corralón. La shingle se vende por chapa, no por pieza suelta.',
    },
    {
      id: 'precioCumbrera',
      label: 'Precio de la cumbrera ($ por pieza)',
      type: 'number',
      min: 0,
      value: 6000,
      thousands: true,
    },
    {
      id: 'manoObra',
      label: '¿Incluir mano de obra?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, sumar la colocación' },
        { value: 'no', label: 'No, sólo materiales' },
      ],
    },
    {
      id: 'moM2',
      label: 'Mano de obra ($ por m² de faldón)',
      type: 'number',
      min: 0,
      value: Math.round(M40.moPorM2),
      thousands: true,
      help: 'Arranca en el valor de colocación de membrana de la fórmula. Para tejas, cargá lo que te cotiza el techista.',
    },
  ],
  fineprint: `${DISCLAIMER} El cálculo estructural del techo —tirantería, cabios, correas, cargas de viento y de nieve— lo firma un profesional matriculado: esto es un cómputo de materiales, no un proyecto. No incluye tirantería, machimbre, aislación térmica, babetas, zinguería ni desagües. Los precios son de referencia y editables: pisalos con los de tu corralón.`,

  chart: {
    type: 'bars',
    title: 'De qué está hecho el número',
    caption:
      'En membrana y en tejas cada segmento es un renglón del gasto: el material principal, el adhesivo y la imprimación, lo que se lleva el solape o el desperdicio, y la mano de obra si la incluís. En la rama de pendiente sola el reparto es de superficie: los m² de la planta y los m² extra que le agrega la inclinación.',
  },
  breakdownTitle: 'Materiales, superficie real y costo',
  breakdownIntro:
    'Las filas en pesos son plata; las de m², rollos, kg, piezas, metros lineales, grados y porcentaje llevan su unidad. Lo importante está arriba: los m² reales del faldón, que casi nunca coinciden con los de la planta.',

  answer: {
    title: 'Cómo se calcula un techo, en orden',
    copy:
      'Primero la pendiente, siempre. La pendiente define la superficie real del faldón, y esa superficie —no la de la planta— es la que hay que comprar. Después va el material, que se elige justamente según cuánta pendiente tenés: membrana para lo casi plano, tejas cuando la inclinación es suficiente para que el agua escurra sola.',
    yes: [
      'Pendiente: % = altura ÷ base × 100, y grados = arcotangente de esa relación. El % también es cm que sube por metro horizontal',
      `Superficie real del faldón = superficie en planta × √(1 + (pendiente ÷ 100)²). Al 30% eso suma un ${EXTRA_30_PCT}% de m²`,
      `Membrana: superficie real + ${SOLAPE_DEFAULT_PCT}% de solape, dividido los ${nAr(M40.areaPorRollo)} m² del rollo, redondeando para arriba`,
      `Adhesivo asfáltico: ${nAr(M40.kgPegPorM2, 2)} kg por m² · imprimación: ${nAr(PRIMER_KG_M2, 2)} kg por m² sobre el sustrato`,
      `Tejas: piezas por m² del tipo elegido (francesa ${nAr(TEJAS.francesa.porM2)}, colonial ${nAr(TEJAS.colonial.porM2)}, shingle ${nAr(TEJAS.shingle.porM2)}) × superficie real, más el desperdicio`,
      `Accesorios de teja: 1 cumbrera cada ${nAr(CUMBRERA_CADA_M2)} m² y unos ${nAr(LISTONES_M_POR_M2)} metros lineales de listón por m²`,
    ],
    warn: [
      DISCLAIMER,
      'El cálculo estructural del techo lo firma un profesional matriculado: cabios, correas, tirantería y cargas de viento y nieve no salen de una calculadora',
      'No compres por los m² de la planta: en un techo empinado te faltan materiales para la última hilada, que es la peor de resolver',
      'Cada tipo de teja tiene una pendiente mínima del fabricante: por debajo de ella el agua entra por capilaridad aunque la teja esté bien colocada',
      'La membrana asfáltica sobre pendiente fuerte se descuelga con el calor: por encima de cierta inclinación va con fijación mecánica, no sólo pegada',
      'Los m² de este cómputo son de faldón limpio: chimeneas, claraboyas, babetas y encuentros con paredes consumen material extra que no está acá',
    ],
    plazo:
      'la membrana se coloca con el techo seco y por encima de 5 °C; la teja se puede colocar con frío pero no con viento fuerte. Si vas a impermeabilizar, mirá el pronóstico a 48 horas antes de arrancar.',
  },

  faq: [
    {
      q: '¿Cómo se calcula la pendiente de un techo en porcentaje y en grados?',
      a: `El porcentaje es la altura dividida por la base horizontal, por 100: si el techo sube 30 cm en un metro, la pendiente es del <b>30%</b>. Los grados salen de la arcotangente de esa misma relación: 30% equivale a <b>${nAr(_p30.grados)}°</b>. No son intercambiables ni proporcionales — 100% no es 90° sino 45°. El porcentaje además se lee directo como <b>cm que sube por cada metro horizontal</b>, que es como lo maneja el techista arriba del techo.`,
    },
    {
      q: '¿Cuánta superficie de más agrega la pendiente?',
      a: `La superficie real del faldón es la de la planta multiplicada por √(1 + (pendiente ÷ 100)²). Con <b>30% de pendiente el faldón tiene un ${EXTRA_30_PCT}% más de m²</b> que el rectángulo que ves desde arriba; con 50% el aumento es del ${Math.round((Math.sqrt(1 + 0.25) - 1) * 100)}% y con 100% (45°) llega al ${Math.round((Math.sqrt(2) - 1) * 100)}%. Un techo de 48 m² en planta al 30% son casi ${nAr(48 * FACTOR_30, 0)} m² de material. Comprar por la planta es la razón número uno por la que falta material en la última hilada.`,
    },
    {
      q: '¿Cuántos rollos de membrana asfáltica necesito?',
      a: `Se toma la superficie real del faldón, se le suma el <b>${SOLAPE_DEFAULT_PCT}% de solape</b> entre tiras y se divide por los <b>${nAr(M40.areaPorRollo)} m² del rollo</b>, redondeando siempre para arriba. Para 50 m² de techo eso da ${Math.ceil((50 * 1.1) / M40.areaPorRollo)} rollos. El solape no es opcional: si pegás tira contra tira sin superponer, la junta filtra al primer invierno. Con muchas babetas, chimeneas o bocas de desagüe conviene subir el solape al 15% o 20%.`,
    },
    {
      q: '¿Cuánto sale impermeabilizar un techo con membrana?',
      a: `Con ${M40.label.toLowerCase()}, el rollo de ${nAr(M40.areaPorRollo)} m² a ${$(M40.precioRollo)} y la colocación a ${$(M40.moPorM2)} por m², impermeabilizar 50 m² sale del orden de ${$(Math.ceil((50 * 1.1) / M40.areaPorRollo) * M40.precioRollo + 50 * M40.kgPegPorM2 * M40.precioPegKg + 50 * M40.moPorM2)} con mano de obra incluida, o cerca de ${$(Math.ceil((50 * 1.1) / M40.areaPorRollo) * M40.precioRollo + 50 * M40.kgPegPorM2 * M40.precioPegKg)} si la ponés vos. La mano de obra suele ser cerca de la mitad del total. Son precios de referencia editables: cargá los de tu corralón y el número se recalcula.`,
    },
    {
      q: '¿Qué diferencia hay entre membrana geotextil y membrana con aluminio?',
      a: `La de aluminio es la más barata (${$(MEMBRANAS.aluminio.precioRollo)} el rollo contra ${$(MEMBRANAS.geotextil_40.precioRollo)} de la geotextil de 4 mm) y refleja el sol, lo que baja la temperatura del techo. La geotextil tiene un refuerzo de fibra que la hace mucho más resistente al pisoteo y a los movimientos de la losa, y por eso dura más. Regla práctica: si el techo es transitable o tiene tanque, equipos o antenas arriba, geotextil; si es un techo que nadie pisa, la de aluminio cumple.`,
    },
    {
      q: '¿Cuántas tejas entran por metro cuadrado?',
      a: `Depende del tipo: <b>teja francesa ${nAr(TEJAS.francesa.porM2)} por m²</b>, colonial o criolla ${nAr(TEJAS.colonial.porM2)}, portuguesa ${nAr(TEJAS.portuguesa.porM2)}, romana ${nAr(TEJAS.romana.porM2)}, española ${nAr(TEJAS.espanola.porM2)}, de cemento tipo Tegola ${nAr(TEJAS.cemento.porM2)}, y shingle ${nAr(TEJAS.shingle.porM2)} piezas de 30 × 100 cm. La colonial es la que más piezas lleva de todas —más del doble que la francesa— porque cada pieza cubre poco y va en doble hilada, canal y cobija.`,
    },
    {
      q: '¿Cuántas tejas necesito para un techo de 60 m²?',
      a: `Ojo: 60 m² ¿en planta o de faldón? Si son 60 m² en planta con 30% de pendiente, el faldón real es de ${nAr(60 * FACTOR_30, 0)} m². Con teja francesa a ${nAr(TEJAS.francesa.porM2)} por m² eso son ${Math.round(60 * FACTOR_30 * TEJAS.francesa.porM2)} tejas netas, y con el ${DESPERDICIO_DEFAULT_PCT}% de desperdicio por roturas y recortes hay que comprar ${Math.ceil(60 * FACTOR_30 * TEJAS.francesa.porM2 * (1 + DESPERDICIO_DEFAULT_PCT / 100))}. Sumale ${Math.ceil((60 * FACTOR_30) / CUMBRERA_CADA_M2)} cumbreras y unos ${Math.ceil(60 * FACTOR_30 * LISTONES_M_POR_M2)} metros lineales de listón.`,
    },
    {
      q: '¿Cuánto desperdicio de tejas hay que contar?',
      a: `Un <b>${DESPERDICIO_DEFAULT_PCT}%</b> es el estándar y es lo que trae el cálculo por defecto. Se va en tres cosas: las que llegan rotas del corralón, las que se rompen al pisarlas y los cortes en limatesas, limahoyas y encuentros. Si el techo es un rectángulo limpio a dos aguas podés bajar a 5%; si tiene varias aguas, buhardillas o chimeneas, subilo a 15%. La teja se discontinúa y cambia de tono entre partidas: es preferible que sobren cinco a tener que comprarlas seis meses después.`,
    },
    {
      q: '¿Qué pendiente mínima necesita un techo?',
      a: `Depende de la cubierta. Una losa plana impermeabilizada con membrana necesita al menos un 1% a 2% para que el agua escurra a los desagües y no queden pelopinchos. La chapa acanalada anda desde 15% aproximadamente, el shingle desde 20% a 25%, y las tejas tradicionales piden 30% o más. Por debajo del mínimo del fabricante el agua entra por capilaridad entre pieza y pieza aunque el trabajo esté perfecto. Este cálculo te dice en qué franja cae tu pendiente, pero el mínimo lo fija la ficha técnica de la teja que compres.`,
    },
    {
      q: '¿Puedo poner membrana sobre un techo inclinado?',
      a: 'Sí, pero con cuidados. En pendientes suaves se coloca igual que en una losa. A partir de cierta inclinación la membrana asfáltica se descuelga con el calor del verano, así que se coloca en tiras verticales —de cumbrera a alero, no transversales— y con fijación mecánica además del pegado. En pendientes fuertes conviene directamente otra solución: shingle, chapa o teja. Consultá la ficha del fabricante: cada membrana declara su pendiente máxima.',
    },
    {
      q: '¿Cuánta imprimación asfáltica lleva el techo?',
      a: `Alrededor de <b>${nAr(PRIMER_KG_M2, 2)} kg por m²</b> de sustrato, en una sola mano antes de la membrana. No es un extra prescindible: la imprimación sella el poro de la carpeta de cemento y es lo que hace que la membrana pegue de verdad. Sobre una carpeta sin imprimar, la membrana se despega en tiras al primer verano. Aparte va el adhesivo asfáltico de las juntas, que son otros ${nAr(M40.kgPegPorM2, 2)} kg por m².`,
    },
    {
      q: '¿Cuántos metros de listón y cuántas cumbreras lleva un techo de tejas?',
      a: `Como referencia de cómputo rápido, unos <b>${nAr(LISTONES_M_POR_M2)} metros lineales de listón por cada m² de faldón</b> —que sale del entramado horizontal donde se cuelgan las tejas— y <b>1 cumbrera cada ${nAr(CUMBRERA_CADA_M2)} m²</b>. Son promedios: el listonado real depende del paso de la teja que elijas (la distancia entre listones la fija el fabricante) y las cumbreras dependen de cuántas limatesas tenga el techo, no de su superficie. Para el pedido al corralón alcanzan; para la obra, medí la cumbrera real.`,
    },
    {
      q: '¿Este cálculo reemplaza al del ingeniero?',
      a: `No, y no hay vuelta con eso. ${DISCLAIMER} Acá calculás <b>materiales de cubierta</b>: cuántos rollos, cuántas tejas, cuántos m². La estructura que sostiene ese techo —sección de los cabios, separación de las correas, apoyos, cargas de viento y de nieve según la zona— la calcula y la firma un profesional matriculado. Las tejas de cemento y las cerámicas pesan muchísimo más que una chapa: cambiar de material sin recalcular la estructura es peligroso.`,
    },
  ],

  sources: [
    {
      name: 'Reglamento CIRSOC 101 — Cargas permanentes y sobrecargas mínimas de diseño',
      url: 'https://www.inti.gob.ar/areas/servicios-industriales/construcciones-e-infraestructura/cirsoc',
      publisher: 'INTI · CIRSOC',
    },
    {
      name: 'Reglamento CIRSOC 102 — Acción del viento sobre las construcciones',
      url: 'https://www.inti.gob.ar/areas/servicios-industriales/construcciones-e-infraestructura/cirsoc',
      publisher: 'INTI · CIRSOC',
    },
    {
      name: 'INTI — Construcciones e Infraestructura: ensayos de membranas y materiales de cubierta',
      url: 'https://www.inti.gob.ar/areas/servicios-industriales/construcciones-e-infraestructura',
      publisher: 'INTI',
    },
    {
      name: 'IRAM — Normas de membranas asfálticas y tejas cerámicas para cubiertas',
      url: 'https://www.iram.org.ar/',
      publisher: 'IRAM',
    },
    {
      name: 'Índice del Costo de la Construcción (ICC) — capítulo materiales',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-20',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
    {
      name: 'Índice del Costo de la Construcción — Cámara Argentina de la Construcción',
      url: 'https://www.camarco.org.ar/',
      publisher: 'CAMARCO',
      date: 'publicación mensual',
    },
  ],

  replaces: [
    '/calculadora-pendiente-techo-grados-porcentaje',
    '/calculadora-membrana-asfaltica-rollos',
    '/calculadora-impermeabilizacion-techo-membrana-rollos-m2-costo',
    '/calculadora-impermeabilizante-membrana-m2-techo',
    '/calculadora-tejas-techo-m2',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
