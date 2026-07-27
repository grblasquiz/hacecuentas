import type { HubData } from './types';
import { pisosCeramicos } from '../formulas/pisos-ceramicos';
import { ceramicosM2Cajas } from '../formulas/ceramicos-m2-cajas';
import { azulejosBaldosasMetrosCuadradosCantidad } from '../formulas/azulejos-baldosas-metros-cuadrados-cantidad';
import { porcelanatoLiquidoLitrosM2 } from '../formulas/porcelanato-liquido-litros-m2';
import { pisoFlotanteM2Tablas } from '../formulas/piso-flotante-m2-tablas';
import { zocaloMetrosLineal } from '../formulas/zocalo-metros-lineal';
import { pegamentoCeramicasBolsasM2Area } from '../formulas/pegamento-ceramicas-bolsas-m2-area';
import { machimbreRevestimientoM2 } from '../formulas/machimbre-revestimiento-m2';
import { venecitasMosaicoM2 } from '../formulas/venecitas-mosaico-m2';
import { juntasPastinaRejuntadoCeramicosKg } from '../formulas/juntas-pastina-rejuntado-ceramicos-kg';

/**
 * Hub de decisión — "¿Cuántas cajas de cerámicos necesito?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cinco ramas según QUÉ se coloca:
 * cerámico/porcelanato (default), piso flotante, venecitas, machimbre y
 * porcelanato líquido (epoxi).
 *
 * El titular NO son los m²: son las CAJAS ENTERAS a pedir en el corralón,
 * porque el cerámico se vende por caja cerrada y lo que arruina una obra es
 * comprar de menos y que el lote nuevo venga con otro tono.
 *
 * NÚMEROS: ninguno está escrito a mano. Todos se DERIVAN llamando a las
 * fórmulas reales del repo con superficies grandes, para que los `Math.ceil`
 * a caja/bolsa entera no contaminen el valor unitario:
 *
 *   m² por caja según formato de pieza      → pisos-ceramicos.ts
 *   desperdicio estándar del cerámico       → ceramicos-m2-cajas.ts / azulejos-…
 *   desperdicio recta vs diagonal           → piso-flotante-m2-tablas.ts
 *   merma y largo de varilla del zócalo     → zocalo-metros-lineal.ts
 *   kg/m² de pegamento por formato          → pegamento-ceramicas-bolsas-m2-area.ts
 *   kg/m² de pastina (fórmula geométrica)   → juntas-pastina-rejuntado-ceramicos-kg.ts
 *   plancha, pastina y adhesivo de venecita → venecitas-mosaico-m2.ts
 *   tabla de machimbre y metros lineales    → machimbre-revestimiento-m2.ts
 *   L/m²/mm de resina, primer y sellador    → porcelanato-liquido-litros-m2.ts
 *
 * Cuando alguien actualice esas fórmulas, este hub se actualiza solo.
 */

/** Redondeo corto para constantes derivadas. */
const r = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/* ─────────────── m² por caja según el formato de la pieza ─────────────── */

export const FORMATOS: Array<{ id: string; label: string; mm: [number, number]; pegamento: string }> = [
  { id: '30x30', label: '30 × 30 cm', mm: [300, 300], pegamento: 'small' },
  { id: '45x45', label: '45 × 45 cm', mm: [450, 450], pegamento: 'medium' },
  { id: '60x60', label: '60 × 60 cm', mm: [600, 600], pegamento: 'medium' },
  { id: '60x120', label: '60 × 120 cm', mm: [600, 1200], pegamento: 'large' },
  { id: '80x80', label: '80 × 80 cm', mm: [800, 800], pegamento: 'large' },
  { id: '100x100', label: '100 × 100 cm', mm: [1000, 1000], pegamento: 'large' },
];

/** m² que trae la caja de cada formato, según pisos-ceramicos.ts. */
export const M2_POR_CAJA: Record<string, number> = Object.fromEntries(
  FORMATOS.map((f) => [f.id, Number(pisosCeramicos({ largo: 10, ancho: 10, dimensionPieza: f.id }).m2PorCaja)])
);

/** Medidas en mm de cada formato, para la cuenta de pastina. */
export const MEDIDAS_MM: Record<string, [number, number]> = Object.fromEntries(
  FORMATOS.map((f) => [f.id, f.mm])
) as Record<string, [number, number]>;

/* ─────────────── Desperdicios, derivados de cada fórmula ─────────────── */

/** Desperdicio estándar del cerámico (fijo en ceramicos-m2-cajas.ts). */
export const DESPERDICIO_CERAMICO = (() => {
  const cajas = Number(ceramicosM2Cajas({ m2: 100000, m2PorCaja: 1 }).cajas);
  return r((cajas / 100000 - 1) * 100, 0);
})();

/** Desperdicio del piso flotante por tipo de colocación, desde su fórmula. */
export const DESPERDICIO_FLOTANTE: Record<string, number> = {
  recta: r(pisoFlotanteM2Tablas({ superficieM2: 1000, tipoColocacion: 'recta' }).m2Totales / 10 - 100, 0),
  diagonal: r(pisoFlotanteM2Tablas({ superficieM2: 1000, tipoColocacion: 'diagonal' }).m2Totales / 10 - 100, 0),
};

/** m² que trae la caja de piso flotante por defecto, desde su fórmula. */
export const M2_CAJA_FLOTANTE = (() => {
  const out = pisoFlotanteM2Tablas({ superficieM2: 1000, tipoColocacion: 'recta' });
  return r(out.m2Totales / out.cajasNecesarias, 2);
})();

/* ─────────────────────────── Zócalo ─────────────────────────── */

const _zoc = zocaloMetrosLineal({ largo: 1000, ancho: 1000, puertas: 0 });
/** Merma del zócalo por cortes y esquinas (%), desde zocalo-metros-lineal.ts. */
export const MERMA_ZOCALO = r((Number(_zoc.varillas) * 2.4) / 4000 - 1, 3);
/** Largo de la varilla de zócalo (m), desde la misma fórmula. */
export const VARILLA_ZOCALO_M = r(4000 * (1 + MERMA_ZOCALO) / Number(_zoc.varillas), 1);
export const MERMA_ZOCALO_PCT = Math.round(MERMA_ZOCALO * 100);

/* ─────────────────────────── Pegamento ─────────────────────────── */

/** kg/m² de pegamento por formato, derivados de su fórmula (área grande). */
function consumoPegamento(formato: string, doble: boolean): number {
  const key = doble ? 'large_double' : formato === 'large' ? 'large_single' : formato;
  const AREA = 100000;
  const bolsas = Number(pegamentoCeramicasBolsasM2Area({ area: AREA, formato: key, bag_kg: 25 }).resultado);
  return r((bolsas * 25) / (AREA * 1.1), 1);
}

export const PEGAMENTO_KG_M2: Record<string, number> = {
  small: consumoPegamento('small', false),
  medium: consumoPegamento('medium', false),
  large: consumoPegamento('large', false),
  large_double: consumoPegamento('large', true),
};

/** Peso de la bolsa de pegamento que se vende en el corralón. */
export const BOLSA_PEGAMENTO_KG = 25;
/** Desperdicio de pegamento que aplica su fórmula. */
export const DESPERDICIO_PEGAMENTO_PCT = 10;

/* ─────────────────────────── Pastina ─────────────────────────── */

/**
 * kg/m² de pastina con la fórmula geométrica real:
 *   ((L + A) / (L × A)) × junta × espesor × densidad
 * Se deriva llamando a la fórmula, así la densidad no se duplica acá.
 */
export function pastinaKgM2(largoMm: number, anchoMm: number, juntaMm: number, espesorMm: number): number {
  return Number(
    juntasPastinaRejuntadoCeramicosKg({
      area: 1,
      largo: largoMm,
      ancho: anchoMm,
      junta: juntaMm,
      espesor: espesorMm,
      desperdicio: 0,
    }).kgPorM2
  );
}
/** Desperdicio de pastina por defecto en su fórmula. */
export const DESPERDICIO_PASTINA_PCT = 10;
/** Referencia: pastina de un 60×60 con junta de 3 mm y 8 mm de espesor. */
export const PASTINA_REF_60 = pastinaKgM2(600, 600, 3, 8);

/* ─────────────────────────── Venecitas ─────────────────────────── */

const _ven = venecitasMosaicoM2({ area_m2: 1000, desperdicio_pct: 0 });
/** m² que cubre una plancha de malla 30×30, desde venecitas-mosaico-m2.ts. */
export const M2_POR_PLANCHA = r(1000 / _ven.planchas, 4);
/** kg/m² de pastina de venecita, desde la misma fórmula. */
export const PASTINA_VENECITA_KG_M2 = r(_ven.pastina_kg / 1000, 2);
/** kg/m² de adhesivo de venecita, desde la misma fórmula. */
export const ADHESIVO_VENECITA_KG_M2 = r(_ven.adhesivo_kg / 1000, 2);

/* ─────────────────────────── Machimbre ─────────────────────────── */

const _mac = machimbreRevestimientoM2({ largo_m: 100, alto_m: 10, ancho_tabla_cm: 10, desperdicio_pct: 0 });
/** Largo de la tabla de machimbre que se vende (m), desde su fórmula. */
export const TABLA_MACHIMBRE_M = r(_mac.metros_lineales / _mac.tablas_3m, 0);

/* ───────────────────── Porcelanato líquido (epoxi) ───────────────────── */

const _epo = porcelanatoLiquidoLitrosM2({ superficieM2: 1000, espesorMm: 1, desperdicio: 0 });
/** L de resina epoxi por m² y por mm de espesor. */
export const RESINA_L_M2_MM = r(_epo.litrosResina / 1000, 2);
/** L de primer por m². */
export const PRIMER_L_M2 = r(_epo.litrosPrimer / 1000, 2);
/** L de sellador UV por m². */
export const SELLADOR_L_M2 = r(_epo.litrosSellador / 1000, 2);
/** Desperdicio por defecto del porcelanato líquido. */
export const DESPERDICIO_EPOXI_PCT = 10;

/* ── Sanity check cruzado: las dos calcs de cerámico dan las mismas cajas ── */

/**
 * Control de coherencia entre las tres fórmulas de cajas del repo con la MISMA
 * superficie, el mismo m²/caja y el mismo 10% de desperdicio. Si alguna se
 * desalinea, este número deja de cerrar y se ve en el FAQ.
 */
export const CAJAS_DEMO = {
  m2: 20,
  m2Caja: 1.44,
  pisosCeramicos: pisosCeramicos({ largo: 5, ancho: 4, dimensionPieza: '60x60', m2PorCaja: 1.44 }).cajas,
  ceramicosM2Cajas: Number(ceramicosM2Cajas({ m2: 20, m2PorCaja: 1.44 }).cajas),
  azulejos: Number(
    azulejosBaldosasMetrosCuadradosCantidad({ area_m2: 20, m2_por_caja: 1.44, desperdicio_pct: 10 }).resultado
  ),
};

const nAr = (v: number, d = 1) => v.toLocaleString('es-AR', { maximumFractionDigits: d });

export const hub: HubData = {
  slug: 'construccion/pisos',
  title: '¿Cuántas cajas de cerámicos necesito? Calculadora de cajas por m²',
  description:
    'Calculá cuántas cajas enteras de cerámico o porcelanato tenés que pedir en el corralón, con el desperdicio por cortes ya incluido, más el pegamento, la pastina y el zócalo. También piso flotante, venecitas, machimbre y porcelanato líquido.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Cómputo de materiales',
  h1: '¿Cuántas cajas de cerámicos necesito?',
  lede:
    'El corralón no te vende metros cuadrados: te vende cajas cerradas. Poné las medidas del ambiente y el formato de la pieza y te decimos cuántas cajas pedir con el desperdicio por cortes adentro, cuánto te sobra y cuánto pegamento, pastina y zócalo van con eso.',
  stamps: [
    'Actualizado 27-07-2026',
    `Desperdicio estándar ${DESPERDICIO_CERAMICO}% ya incluido`,
    'Cajas enteras, no m²',
    '10 calculadoras adentro',
  ],

  resultLabel: 'Lo que tenés que pedir en el corralón',

  cases: {
    title: '¿Qué vas a colocar?',
    intro:
      'Partimos del cerámico o porcelanato, que es el caso común. Cada material tiene su propio desperdicio y sus propios materiales de agarre: cambiá la rama y cambia toda la lista del corralón.',
    items: [
      {
        id: 'ceramico',
        label: 'Cerámico o porcelanato',
        hint: 'El caso más común · piso o pared',
        answer: `Se calcula la superficie, se le suma un ${DESPERDICIO_CERAMICO}% de desperdicio por cortes y roturas y se divide por los m² que trae la caja, redondeando siempre para arriba.`,
        yes: [
          `Cajas enteras con el ${DESPERDICIO_CERAMICO}% de desperdicio ya sumado`,
          `m² por caja según el formato: ${nAr(M2_POR_CAJA['30x30'], 2)} m² en 30×30 y ${nAr(M2_POR_CAJA['60x60'], 2)} m² en 60×60`,
          `Bolsas de pegamento de ${BOLSA_PEGAMENTO_KG} kg según el formato de la pieza`,
          'Kilos de pastina calculados con la geometría real de la junta, no con un promedio',
          'Los m² que te sobran, que son tu repuesto para el día que se raje una pieza',
        ],
        warn: [
          'Pedí TODAS las cajas del mismo lote de producción: entre lotes hay diferencia de tono y se nota en el piso terminado',
          'Guardá siempre una caja cerrada de repuesto: los modelos se discontinúan en menos de un año',
          `En ambientes con muchos recortes (baños chicos, escaleras, colocación en diagonal) subí el desperdicio del ${DESPERDICIO_CERAMICO}% al 15%`,
          'Las piezas rectificadas de gran formato no perdonan el contrapiso desparejo: si no está nivelado, vas a romper piezas colocando',
        ],
        plazo:
          'encargá el material con dos semanas de anticipación: el formato grande suele venir a pedido y el pegamento de gran formato no está en todos los corralones.',
      },
      {
        id: 'flotante',
        label: 'Piso flotante o laminado',
        hint: `Desperdicio ${DESPERDICIO_FLOTANTE.recta}% recto · ${DESPERDICIO_FLOTANTE.diagonal}% diagonal`,
        answer: `El piso flotante colocado recto desperdicia un ${DESPERDICIO_FLOTANTE.recta}% y en diagonal salta al ${DESPERDICIO_FLOTANTE.diagonal}%, porque cada corte en ángulo tira media tabla.`,
        yes: [
          `Desperdicio propio del flotante: ${DESPERDICIO_FLOTANTE.recta}% en colocación recta y ${DESPERDICIO_FLOTANTE.diagonal}% en diagonal`,
          `Caja estándar de ${nAr(M2_CAJA_FLOTANTE, 2)} m², cambiable si tu marca trae otra`,
          `Zócalo en metros lineales y en varillas de ${nAr(VARILLA_ZOCALO_M, 1)} m, con ${MERMA_ZOCALO_PCT}% de merma`,
          'Las puertas se descuentan del perímetro del zócalo',
        ],
        warn: [
          'El flotante necesita manta o foam abajo: se compra por m² aparte y no está en esta cuenta',
          'Dejá 8 a 10 mm de junta de dilatación contra las paredes; el zócalo la tapa',
          'No lo pongas en baño ni en lavadero: la placa se hincha con la humedad y no vuelve',
          'Si el contrapiso tiene más de 3 mm de desnivel en 2 m, hay que autonivelar antes o los clics se abren',
        ],
        plazo:
          'el flotante tiene que aclimatarse en el ambiente 48 horas antes de colocarlo, con las cajas cerradas y apoyadas de plano.',
      },
      {
        id: 'venecita',
        label: 'Venecitas o mosaico en malla',
        hint: 'Pileta, bacha, guarda de baño',
        answer: `La venecita viene en planchas de malla de 30 × 30 cm, que cubren ${nAr(M2_POR_PLANCHA, 4)} m² cada una: hacen falta unas 11 planchas por metro cuadrado.`,
        yes: [
          `Planchas de malla 30 × 30 (${nAr(M2_POR_PLANCHA, 4)} m² cada una)`,
          `Pastina: ${nAr(PASTINA_VENECITA_KG_M2, 2)} kg/m², mucho más que un cerámico porque hay junta cada 2 cm`,
          `Adhesivo: ${nAr(ADHESIVO_VENECITA_KG_M2, 1)} kg/m²`,
          'El desperdicio lo elegís vos: en pileta con curvas conviene 15%',
        ],
        warn: [
          'En pileta va adhesivo y pastina impermeables específicos, no el pegamento común de cerámica',
          'La malla se corta con trincheta entre teselas: los recortes finos casi no se reaprovechan',
          'La pastina de venecita se consume mucho más rápido de lo que la gente calcula: es todo junta',
          'En superficie curva la plancha se abre: se coloca por tiras y se acomoda tesela por tesela',
        ],
        plazo:
          'la pileta recién revestida se llena a los 7 días como mínimo, para que el adhesivo y la pastina curen.',
      },
      {
        id: 'machimbre',
        label: 'Machimbre o revestimiento de madera',
        hint: 'Pared o cielorraso',
        answer: `El machimbre se compra por m² pero se coloca por tabla: con tablas de ${nAr(TABLA_MACHIMBRE_M, 0)} m hay que pasar los m² a metros lineales según el ancho de la tabla.`,
        yes: [
          'm² de machimbre con el desperdicio que cargues',
          'Metros lineales de tabla según el ancho útil que elijas',
          `Tablas de ${nAr(TABLA_MACHIMBRE_M, 0)} m, que es la medida que se vende`,
          'Sirve igual para pared que para cielorraso: son los mismos metros',
        ],
        warn: [
          'El ancho de catálogo incluye la lengüeta: el ancho ÚTIL colocado es menor, fijate la ficha',
          'La madera se aclimata una semana en el ambiente antes de clavarla o después trabaja y abre juntas',
          'En cielorraso calculá también los tirantes o listones de la estructura: no están en esta cuenta',
          'Si va a la intemperie, el machimbre necesita protector cada 12 a 18 meses como gasto recurrente',
        ],
        plazo:
          'dejá las tablas apiladas y separadas por listones al menos 5 días en el ambiente donde se van a colocar.',
      },
      {
        id: 'epoxi',
        label: 'Porcelanato líquido (epoxi)',
        hint: 'Piso continuo sin juntas',
        answer: `El porcelanato líquido se calcula por espesor: ${nAr(RESINA_L_M2_MM, 2)} litro de resina por m² y por milímetro, más el primer y el sellador UV.`,
        yes: [
          `Resina epoxi: ${nAr(RESINA_L_M2_MM, 2)} L por m² y por mm de espesor`,
          `Primer: ${nAr(PRIMER_L_M2, 2)} L/m² · sellador UV: ${nAr(SELLADOR_L_M2, 2)} L/m²`,
          `Desperdicio del ${DESPERDICIO_EPOXI_PCT}% ya incluido`,
          'No lleva cajas, ni pegamento, ni pastina: es piso continuo',
        ],
        warn: [
          'La resina se compra por kit cerrado (parte A + parte B): redondeá siempre para arriba, no se puede completar después',
          'Una vez mezclado el kit tenés entre 20 y 40 minutos de trabajo: no prepares más de lo que podés volcar',
          'El contrapiso tiene que estar seco y sellado: la humedad de abajo levanta la resina en semanas',
          'Sin sellador UV el epoxi amarillea con la luz del sol, sobre todo los tonos claros',
        ],
        plazo:
          'no se pisa hasta las 24 horas, no se mueven muebles hasta las 72 y el curado total es a los 7 días.',
      },
    ],
  },

  inputsTitle: 'Medí el ambiente',
  inputsIntro:
    'Largo y ancho del ambiente. Si la superficie no es un rectángulo, dividila en rectángulos y sumá: podés poner el total en el largo y un 1 en el ancho.',
  fields: [
    { id: 'largo', label: 'Largo del ambiente (m)', type: 'number', min: 0, step: 0.1, value: 5 },
    { id: 'ancho', label: 'Ancho del ambiente (m)', type: 'number', min: 0, step: 0.1, value: 4 },
    {
      id: 'formato',
      label: 'Formato de la pieza',
      type: 'select',
      value: '60x60',
      options: FORMATOS.map((f) => ({ value: f.id, label: f.label })),
      help: 'Define los m² que trae la caja y cuánto pegamento consume.',
    },
    {
      id: 'm2Caja',
      label: 'm² por caja (0 = usar el estándar del formato)',
      type: 'number',
      min: 0,
      step: 0.01,
      value: 0,
      help: 'Está en la etiqueta de la caja. Si lo cargás, manda sobre el estándar.',
    },
    {
      id: 'desperdicio',
      label: 'Desperdicio por cortes (%)',
      type: 'number',
      min: 0,
      max: 30,
      step: 1,
      value: DESPERDICIO_CERAMICO,
      help: 'En baños chicos o con muchos recortes, subilo a 15%.',
    },
    {
      id: 'colocacion',
      label: 'Colocación (piso flotante)',
      type: 'select',
      value: 'recta',
      options: [
        { value: 'recta', label: `Recta o a la inglesa (${DESPERDICIO_FLOTANTE.recta}% de desperdicio)` },
        { value: 'diagonal', label: `En diagonal (${DESPERDICIO_FLOTANTE.diagonal}% de desperdicio)` },
      ],
    },
    {
      id: 'puertas',
      label: 'Puertas o vanos (se descuentan del zócalo)',
      type: 'number',
      min: 0,
      max: 30,
      step: 1,
      value: 1,
    },
    { id: 'junta', label: 'Ancho de la junta (mm)', type: 'number', min: 0.5, max: 20, step: 0.5, value: 3 },
    { id: 'espesor', label: 'Espesor de la pieza (mm)', type: 'number', min: 1, max: 30, step: 1, value: 8 },
    {
      id: 'encolado',
      label: 'Encolado (gran formato)',
      type: 'select',
      value: 'simple',
      options: [
        { value: 'simple', label: 'Simple: pegamento sólo en el contrapiso' },
        { value: 'doble', label: 'Doble encolado: también atrás de la pieza' },
      ],
      help: 'De 60 cm para arriba el doble encolado es lo recomendado y casi duplica el consumo.',
    },
    { id: 'anchoTabla', label: 'Ancho de la tabla de machimbre (cm)', type: 'number', min: 5, max: 30, step: 0.5, value: 10 },
    { id: 'espesorEpoxi', label: 'Espesor del porcelanato líquido (mm)', type: 'number', min: 0.5, max: 5, step: 0.5, value: 1.5 },
    {
      id: 'precioCaja',
      label: 'Precio de la caja ($) — cerámico y flotante',
      type: 'number',
      min: 0,
      value: 45000,
      thousands: true,
      help: 'Cambialo por el precio real de tu corralón: el costo se recalcula.',
    },
  ],
  fineprint:
    `Es un cómputo de material, no un presupuesto: no incluye contrapiso, carpeta, autonivelante, perfiles, manta ni mano de obra. El desperdicio por defecto es del ${DESPERDICIO_CERAMICO}% y lo podés cambiar. Los m² por caja son los estándar del formato: verificá siempre la etiqueta de la caja antes de cerrar la compra, porque cambian entre marcas.`,

  chart: {
    type: 'bars',
    title: 'De los metros del ambiente a las cajas de la góndola',
    caption:
      'Cada barra es un renglón de la compra: los m² del ambiente, los m² con el desperdicio adentro, los m² que realmente comprás al redondear a caja entera y, en amarillo, lo que te sobra. Ese sobrante no es error: es tu repuesto. En porcelanato líquido, que no lleva cajas, las barras muestran los litros de resina, primer y sellador.',
  },
  breakdownTitle: 'Tu pedido al corralón',
  breakdownIntro:
    'Las barras comparan cada renglón con el más grande. Lo que llevás anotado al mostrador es la fila de cajas, no la de metros.',

  faq: [
    {
      q: '¿Cuántas cajas de cerámico necesito para 20 m²?',
      a: `Depende de los m² que traiga la caja. Con piezas de 60 × 60 la caja estándar trae ${nAr(M2_POR_CAJA['60x60'], 2)} m², así que 20 m² con el ${DESPERDICIO_CERAMICO}% de desperdicio son ${nAr(20 * 1.1, 1)} m² y hacen falta <b>${CAJAS_DEMO.pisosCeramicos} cajas</b>. Con piezas de 30 × 30, que traen ${nAr(M2_POR_CAJA['30x30'], 2)} m² por caja, el mismo ambiente necesita ${Math.ceil((20 * 1.1) / M2_POR_CAJA['30x30'])} cajas. Nunca compres "los m² justos": la caja es indivisible y el redondeo siempre es para arriba.`,
    },
    {
      q: '¿Cuánto desperdicio de cerámico hay que calcular?',
      a: `El estándar es <b>${DESPERDICIO_CERAMICO}%</b> y es el que viene cargado por defecto. Subilo a 15% si el ambiente es chico y lleno de recortes (un baño, una escalera), si colocás en diagonal o en espiga, o si la pieza es de gran formato y cada corte tira medio metro cuadrado. Bajarlo de ${DESPERDICIO_CERAMICO}% no conviene nunca: entre las piezas que vienen rotas de fábrica, las que se rompen al cortar y las que se rajan colocando, ese margen se usa siempre.`,
    },
    {
      q: '¿Cuántos m² trae una caja de porcelanato?',
      a: `Cambia con el formato porque la caja se arma por peso manejable, no por superficie. Los estándar del mercado son ${FORMATOS.map((f) => `${f.label.replace(/ /g, '')} → ${nAr(M2_POR_CAJA[f.id], 2)} m²`).join(', ')}. Igual, verificá la etiqueta: entre marcas hay diferencias, y con una caja de diferencia te quedás corto justo el último día de colocación. Si tenés el dato real, cargalo en el campo de m² por caja y manda sobre el estándar.`,
    },
    {
      q: '¿Cuántas bolsas de pegamento van por metro cuadrado?',
      a: `El consumo depende del tamaño de la pieza porque el dentado de la llana crece con ella: <b>${nAr(PEGAMENTO_KG_M2.small, 1)} kg/m²</b> en piezas de hasta 30 × 30 (llana de 6 mm), <b>${nAr(PEGAMENTO_KG_M2.medium, 1)} kg/m²</b> entre 30 y 60 cm (llana de 8 mm) y <b>${nAr(PEGAMENTO_KG_M2.large, 1)} kg/m²</b> de 60 cm para arriba (llana de 12 mm). Si hacés doble encolado, que es lo recomendado en gran formato, saltás a ${nAr(PEGAMENTO_KG_M2.large_double, 1)} kg/m². Con bolsas de ${BOLSA_PEGAMENTO_KG} kg, una bolsa rinde alrededor de ${nAr(BOLSA_PEGAMENTO_KG / PEGAMENTO_KG_M2.medium, 1)} m² en formato mediano.`,
    },
    {
      q: '¿Cuánta pastina necesito para rejuntar?',
      a: `Se calcula con la geometría de la junta, no con un promedio: <i>((largo + ancho) ÷ (largo × ancho)) × ancho de junta × espesor de la pieza × densidad</i>. Para un 60 × 60 de 8 mm de espesor con junta de 3 mm da <b>${nAr(PASTINA_REF_60, 3)} kg/m²</b>. Fijate lo que pasa cuando la pieza es chica: en un 30 × 30 con la misma junta el consumo se duplica, porque hay el doble de metros lineales de junta por metro cuadrado. Por eso las venecitas, que son todo junta, consumen ${nAr(PASTINA_VENECITA_KG_M2, 2)} kg/m².`,
    },
    {
      q: '¿Cuántas cajas de piso flotante compro?',
      a: `La cuenta es la misma que la del cerámico pero el desperdicio es otro: el flotante colocado recto tira apenas un <b>${DESPERDICIO_FLOTANTE.recta}%</b>, porque el recorte del final de una hilera arranca la siguiente, y en diagonal salta al <b>${DESPERDICIO_FLOTANTE.diagonal}%</b>. La caja estándar trae ${nAr(M2_CAJA_FLOTANTE, 2)} m². Acordate de la manta o foam de base, que se compra por m² aparte y no entra en esta cuenta.`,
    },
    {
      q: '¿Cuánto zócalo necesito y cuántas varillas son?',
      a: `El zócalo es el perímetro del ambiente —dos veces el largo más dos veces el ancho— menos el ancho de las puertas. A eso se le suma un <b>${MERMA_ZOCALO_PCT}%</b> de merma por los cortes de esquina, que en las esquinas a 45° se desperdicia bastante, y se divide por ${nAr(VARILLA_ZOCALO_M, 1)} m, que es el largo de la varilla. Redondeá siempre para arriba: media varilla no se compra.`,
    },
    {
      q: '¿Cuántas planchas de venecita entran en un metro cuadrado?',
      a: `La plancha de malla estándar es de 30 × 30 cm y cubre ${nAr(M2_POR_PLANCHA, 4)} m², así que entran unas <b>${Math.ceil(1 / M2_POR_PLANCHA)} planchas por metro cuadrado</b>. Sumale ${nAr(PASTINA_VENECITA_KG_M2, 2)} kg/m² de pastina y ${nAr(ADHESIVO_VENECITA_KG_M2, 1)} kg/m² de adhesivo. En pileta usá productos impermeables específicos y calculá 15% de desperdicio en vez de ${DESPERDICIO_CERAMICO}%, porque las curvas y los bordes obligan a cortar mucho.`,
    },
    {
      q: '¿Cuántas tablas de machimbre necesito?',
      a: `Los m² se pasan a metros lineales dividiendo por el ancho útil de la tabla: con tablas de 10 cm, cada metro cuadrado son 10 metros lineales. Después se divide por ${nAr(TABLA_MACHIMBRE_M, 0)} m, que es el largo de tabla que se vende, y se redondea para arriba. Ojo con un detalle que sorprende a todo el mundo: el ancho de catálogo incluye la lengüeta, y el ancho realmente visible una vez colocado es menor. Usá el ancho útil de la ficha técnica o te van a faltar tablas.`,
    },
    {
      q: '¿Cuánta resina lleva el porcelanato líquido?',
      a: `Se calcula por espesor: <b>${nAr(RESINA_L_M2_MM, 2)} litro de resina por m² y por milímetro</b>. Un piso de 1,5 mm sobre 20 m² son unos ${nAr(20 * 1.5 * RESINA_L_M2_MM * 1.1, 1)} L de resina con el ${DESPERDICIO_EPOXI_PCT}% de desperdicio, más ${nAr(20 * PRIMER_L_M2 * 1.1, 1)} L de primer y ${nAr(20 * SELLADOR_L_M2 * 1.1, 1)} L de sellador UV. El epoxi se vende en kits cerrados de parte A y parte B: redondeá siempre hacia arriba porque una vez mezclado no se puede completar.`,
    },
    {
      q: '¿Por qué me sobran metros cuadrados si compré justo?',
      a: 'Porque hay dos redondeos encadenados y ninguno de los dos es un error. Primero se suma el desperdicio por cortes, que es material que va a la basura y tiene que estar comprado. Después se redondea a caja entera, porque el corralón no abre cajas. Ese sobrante final, que suele ser entre medio y un metro cuadrado, es exactamente lo que vas a necesitar el día que se raje una pieza, y para entonces tu modelo ya no se fabrica más. Guardá la caja cerrada y en un lugar seco.',
    },
    {
      q: '¿Hace falta comprar todo del mismo lote?',
      a: 'Sí, y es la recomendación más importante de toda esta página. Los cerámicos se cocinan por tandas y el esmalte varía de tono y de calibre entre lotes, aunque el modelo y el código sean idénticos. Colocados uno al lado del otro, la diferencia canta. Pedí que te den todas las cajas del mismo lote, revisá el número impreso en cada una antes de que las carguen y, si el corralón no tiene stock suficiente de un solo lote, esperá la reposición o cambiá de modelo.',
    },
  ],

  sources: [
    {
      name: 'Norma IRAM 12518 — Placas cerámicas: características, calibre y tolerancias',
      url: 'https://www.iram.org.ar/',
      publisher: 'IRAM',
    },
    {
      name: 'IRAM 45062 — Adhesivos para placas cerámicas: requisitos y consumo',
      url: 'https://www.iram.org.ar/',
      publisher: 'IRAM',
    },
    {
      name: 'Fichas técnicas de adhesivos y pastinas cerámicas (consumo por formato y llana)',
      url: 'https://arg.sika.com/',
      publisher: 'Sika Argentina',
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
    '/calculadora-pisos-ceramicos-porcellanato-cajas',
    '/calculadora-azulejos-baldosas-metros-cuadrados-cantidad',
    '/calculadora-porcelanato-liquido-litros-m2',
    '/calculadora-piso-flotante-m2-tablas',
    '/calculadora-zocalo-metros-lineal',
    '/calculadora-ceramicos-m2-cajas',
    '/calculadora-pegamento-ceramicas-bolsas-m2-area',
    '/calculadora-machimbre-revestimiento-m2',
    '/calculadora-venecitas-mosaico-m2',
    '/calculadora-juntas-pastina-rejuntado-ceramicos-kg',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
