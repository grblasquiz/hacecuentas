import type { HubData } from './types';
import { presupuestoCumpleanos } from '../formulas/presupuesto-cumpleanos';
import { presupuestoCumple15Quinceanera } from '../formulas/presupuesto-cumple-15-quinceanera';
import { presupuestoGraduacion } from '../formulas/presupuesto-graduacion';
import { presupuestoDespedidaSoltera } from '../formulas/presupuesto-despedida-soltera';
import { cumpleanosInvitadosGastarTortaRegalos } from '../formulas/cumpleanos-invitados-gastar-torta-regalos';
import dolarLive from '../../data/live/dolar.json';
import ipcSerie from '../../data/ipc-indec-serie.json';

/**
 * Hub de decisión — "¿Cuánto me va a salir la fiesta?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cinco ramas, una por tipo de festejo:
 * cumpleaños (default), cumple de 15, graduación, despedida de soltera y
 * "a medida" (el que ya tiene los presupuestos en la mano).
 *
 * El casamiento NO está acá: lo cubre /eventos/casamiento.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA DE FONDO: las cinco calculadoras absorbidas NO hablaban la
 * misma moneda ni el mismo nivel de precio.
 *
 *   presupuesto-cumpleanos ................ constantes en PESOS por invitado
 *       (comida 3.000–10.000, bebida 800–4.000, lugar 0–5.000, extras 1.000),
 *       fechadas 16-04-2026 según el `dataUpdate` de su JSON y el commit que
 *       las introdujo.
 *   presupuesto-cumple-15-quinceanera ..... 50 / 110 / 250 **USD** por invitado
 *   presupuesto-graduacion ................ 35 / 80 / 180 **USD** por invitado
 *   presupuesto-despedida-soltera ......... 40 / 120 / 300 **USD** por invitado
 *   cumpleanos-invitados-gastar-torta-* ... sin constantes: suma lo que carga
 *       el usuario (salón + catering×inv + torta + deco + animación +
 *       souvenir×inv + regalos). Su única constante propia son los cortes de
 *       "nivel de festejo" por costo por invitado, y esos SÍ están en pesos
 *       (20k / 50k / 100k), lo que confirma el orden de magnitud del mercado.
 *
 * ⚠ Y ADEMÁS, las constantes en pesos de presupuesto-cumpleanos están BAJAS:
 * $4.000 por invitado de "pizza" es menos de la mitad de lo que sale hoy (una
 * pizza grande de 8 porciones no baja de $25.000, y se calculan 3 porciones por
 * adulto). Su combinación más cara —catering + barra completa + restaurante—
 * da $20.000 por invitado, que es apenas el PISO de "cumple de nivel medio"
 * según los cortes de la otra calculadora del mismo sitio. Son incoherentes
 * entre sí. Y no alcanza con actualizarlas por inflación: entre su `dataUpdate`
 * (2026-04) y el último IPC publicado hay apenas un 4%, así que el problema no
 * es que envejecieron, es que nacieron bajas.
 *
 * CRITERIO UNIFICADO DEL HUB — todo se muestra en PESOS, y cada número sale de
 * una fórmula del repo. Ninguna constante nueva:
 *
 *   a) Las tres escalas en dólares se convierten con el **dólar oficial venta**
 *      de `src/data/live/dolar.json` (DolarAPI), que es dato vivo del repo.
 *      No se toca ni un número de las escalas.
 *   b) De presupuesto-cumpleanos se usan las **proporciones, no los importes**:
 *      cuánto más caro es el asado que la pizza, el salón que la casa, la barra
 *      completa que las gaseosas. Las proporciones son adimensionales, así que
 *      no envejecen ni dependen de la moneda. Ese índice se aplica sobre el
 *      nivel elegido.
 *   c) El NIVEL en pesos sale de los cortes de costo por invitado de
 *      cumpleanos-invitados-gastar-torta-regalos —la única de las cinco que los
 *      declara, y en pesos de hoy: casero hasta $20.000, medio hasta $50.000,
 *      premium hasta $100.000, lujo por encima—. La rama cumpleaños toma el
 *      **punto medio de cada banda** como costo por invitado de referencia.
 *      Es el único criterio propio del hub y está a la vista en `BANDA_PP`.
 *
 * Resultado: la config de referencia (pizza + cerveza + en casa) en nivel
 * estándar cae en el medio de la banda "nivel medio", y la config más cara
 * (catering + barra + restaurante) trepa hasta el techo de "premium", que es
 * exactamente lo que dicen los cortes del propio sitio. Antes, el mismo cumple
 * daba $7.280 por invitado: diez veces menos que la escala BÁSICA de una fiesta
 * de 15 de la calculadora hermana.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Lo que el hub agrega y ninguna calc suelta hacía:
 *  1. un solo número comparable entre tipos de festejo, todos en pesos;
 *  2. el costo por invitado como palanca (recortar la lista es lo que más mueve
 *     el total, y en el gráfico se ve);
 *  3. el margen del 10% de invitados extra y la logística en cantidades
 *     (mesas, sillas, vasos, platos, hielo), que sólo traía la de cumpleaños;
 *  4. la posibilidad de pisar la estimación con los presupuestos reales.
 */

const r2 = (x: number) => Math.round(x * 100) / 100;

/* ── Anclaje a) dólar oficial venta, dato vivo ────────────────────────── */
export const DOLAR = Math.round(dolarLive.quotes.oficial.venta);
export const DOLAR_FECHA = (dolarLive.quotes.oficial.fechaActualizacion || '').slice(0, 10);

/**
 * IPC nacional acumulado desde el `dataUpdate` de presupuesto-cumpleanos. NO se
 * usa para corregir sus importes (ver el bloque de arriba: el problema no es la
 * inflación), pero sí para poder decir con un número por qué no alcanzaba.
 */
export const CUMPLE_BASE_MES = '2026-04';
const _serie = (ipcSerie as { serie: Array<{ mes: string; pct: number }> }).serie;
const _posteriores = _serie.filter((m) => m.mes > CUMPLE_BASE_MES);
export const IPC_FACTOR = r2(_posteriores.reduce((f, m) => f * (1 + m.pct / 100), 1));
export const IPC_ULTIMO_MES = _serie[_serie.length - 1].mes;
export const IPC_MESES = _posteriores.length;

/* ── Rama cumpleaños: proporciones entre rubros, desde la fórmula real ─── */

/** Muestra grande para leer el costo unitario sin arrastrar redondeos. */
const N = 10000;

/**
 * Costo por invitado de cada opción de presupuesto-cumpleanos, leído de la
 * fórmula (no copiado): se corre con una sola variable prendida por vez y se
 * divide por los invitados.
 */
function cumpleRubros(comida: string, bebida: string, tipo: string) {
  const o = presupuestoCumpleanos({ invitados: N, tipo, comida, bebida });
  return {
    comidaPP: o.detalleComida / N,
    bebidaPP: o.detalleBebida / N,
    /** Lugar + extras: lo que queda del total una vez sacada comida y bebida. */
    restoPP: (o.costoTotal - o.detalleComida - o.detalleBebida) / N,
    totalPP: o.costoTotal / N,
  };
}

/** Comida por invitado, en pesos del mes base. */
export const COMIDA_PP: Record<string, number> = {
  picada: cumpleRubros('picada', 'soft', 'casa').comidaPP,
  pizza: cumpleRubros('pizza', 'soft', 'casa').comidaPP,
  asado: cumpleRubros('asado', 'soft', 'casa').comidaPP,
  catering: cumpleRubros('catering', 'soft', 'casa').comidaPP,
};
/** Bebida por invitado, en pesos del mes base. */
export const BEBIDA_PP: Record<string, number> = {
  soft: cumpleRubros('pizza', 'soft', 'casa').bebidaPP,
  cerveza: cumpleRubros('pizza', 'cerveza', 'casa').bebidaPP,
  completo: cumpleRubros('pizza', 'completo', 'casa').bebidaPP,
};
/** Extras fijos (decoración, torta y música) por invitado: el lugar "casa" vale 0. */
export const EXTRAS_PP = cumpleRubros('pizza', 'soft', 'casa').restoPP;
/** Lugar por invitado: resto de cada tipo menos los extras. */
export const LUGAR_PP: Record<string, number> = {
  casa: cumpleRubros('pizza', 'soft', 'casa').restoPP - EXTRAS_PP,
  aire_libre: cumpleRubros('pizza', 'soft', 'aire_libre').restoPP - EXTRAS_PP,
  salon: cumpleRubros('pizza', 'soft', 'salon').restoPP - EXTRAS_PP,
  restaurant: cumpleRubros('pizza', 'soft', 'restaurant').restoPP - EXTRAS_PP,
};

/** Logística en cantidades, derivada de la misma fórmula (por invitado). */
const _log = presupuestoCumpleanos({ invitados: N, tipo: 'casa', comida: 'pizza', bebida: 'cerveza' });
export const LOGISTICA_PP = {
  vasos: (_log.vasos || 0) / N,
  platos: (_log.platos || 0) / N,
  cubiertos: (_log.cubiertos || 0) / N,
  servilletas: (_log.servilletas || 0) / N,
  porMesa: Math.round(N / (_log.mesas || 1)),
  hieloKg: (_log.hielo_kg || 0) / N,
};
/** Colchón de invitados extra que suma la fórmula: 10%. */
export const MARGEN_INVITADOS = r2((_log.margen_invitados || 0) / N);

/* ── Ramas en dólares: escala y reparto de rubros, desde cada fórmula ──── */

function escalaUSD(fn: (i: { invitados: number; nivel: string }) => { costoPorInvitado: number }) {
  return {
    basico: fn({ invitados: N, nivel: 'basico' }).costoPorInvitado,
    estandar: fn({ invitados: N, nivel: 'estandar' }).costoPorInvitado,
    premium: fn({ invitados: N, nivel: 'premium' }).costoPorInvitado,
  };
}
export const USD_PP = {
  quince: escalaUSD(presupuestoCumple15Quinceanera),
  graduacion: escalaUSD(presupuestoGraduacion),
  despedida: escalaUSD(presupuestoDespedidaSoltera),
};

/** Participación de cada rubro en el total, leída de cada fórmula. */
function share(parts: Record<string, number>, total: number) {
  const out: Record<string, number> = {};
  for (const k of Object.keys(parts)) out[k] = parts[k] / total;
  return out;
}
const _q = presupuestoCumple15Quinceanera({ invitados: N, nivel: 'estandar' });
export const RUBROS_QUINCE = share(
  {
    'Salón y decoración': _q.costoSalon,
    'Comida y bebida': _q.costoComidaBebida,
    'Vestido, peinado y make-up': _q.costoVestidoMake,
    'Foto y video': _q.costoFotoVideo,
    'DJ y música': _q.costoDjMusica,
    'Invitaciones y varios': _q.costoInvitacionesOtros,
  },
  _q.costoTotal
);
const _g = presupuestoGraduacion({ invitados: N, nivel: 'estandar' });
export const RUBROS_GRADUACION = share(
  {
    'Salón y fiesta': _g.costoSalonFiesta,
    'Viaje de egresados': _g.costoViajeEgresados,
    'Vestuario y ceremonia': _g.costoVestuarioGraduacion,
    'Foto y video': _g.costoFotoVideo,
    'Anuario y merchandising': _g.costoAnuarioEgresados,
    'Invitaciones y varios': _g.costoOtros,
  },
  _g.costoTotal
);
const _d = presupuestoDespedidaSoltera({ invitados: N, nivel: 'estandar' });
export const RUBROS_DESPEDIDA = share(
  {
    'Viaje, locación y alojamiento': _d.costoViajeLocacion,
    'Comida y bebida': _d.costoComidaBebida,
    'Actividades y shows': _d.costoActividades,
    'Vestuario temático y deco': _d.costoVestuarioDeco,
    'Regalos y sorpresas': _d.costoRegalosSorpresa,
  },
  _d.costoTotal
);

/**
 * Rubro que pisa el "catering por invitado" cargado a mano, en cada rama.
 * En las ramas de nivel es el rubro de comida cuando existe.
 */
export const RUBRO_COMIDA: Record<string, string> = {
  quince: 'Comida y bebida',
  despedida: 'Comida y bebida',
  graduacion: 'Salón y fiesta',
};
/** Rubro que pisa el "presupuesto real del salón". */
export const RUBRO_LUGAR: Record<string, string> = {
  quince: 'Salón y decoración',
  graduacion: 'Salón y fiesta',
  despedida: 'Viaje, locación y alojamiento',
};

/* ── Cortes de "nivel de festejo", en pesos, desde su fórmula ─────────── */

/**
 * Umbrales de costo por invitado con los que
 * cumpleanos-invitados-gastar-torta-regalos clasifica el festejo. Se leen
 * corriendo la fórmula con un invitado y barriendo el total, para no copiar
 * los cortes a mano.
 */
/** Etiqueta de nivel que devuelve la fórmula para un costo por invitado dado. */
function etiquetaNivel(costoPorInvitado: number): string {
  const insight = cumpleanosInvitadosGastarTortaRegalos({ invitados: 1, costo_salon: costoPorInvitado })
    ._insight as { text: string };
  return String(insight.text).split('Nivel: **')[1].replace(/\*\*.*$/, '');
}
/** Busca por bisección el primer valor donde cambia la etiqueta. */
function corteDesde(desde: number): number {
  let lo = desde, hi = 5_000_000;
  const base = etiquetaNivel(lo);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (etiquetaNivel(mid) === base) lo = mid; else hi = mid;
  }
  return Math.round(hi);
}
const _corte1 = corteDesde(1);
const _corte2 = corteDesde(_corte1 + 1);
const _corte3 = corteDesde(_corte2 + 1);
export const NIVEL_CORTES = { diy: _corte1, medio: _corte2, premium: _corte3 };
export const NIVEL_ETIQUETAS = [
  etiquetaNivel(1),
  etiquetaNivel(_corte1),
  etiquetaNivel(_corte2),
  etiquetaNivel(_corte3),
];

/* ── Números listos para el copy ──────────────────────────────────────── */

const nAr = (v: number, d = 0) => v.toLocaleString('es-AR', { maximumFractionDigits: d, minimumFractionDigits: d });
const pesos = (v: number) => '$' + nAr(Math.round(v));

/**
 * Config de referencia de la rama cumpleaños: pizza + cerveza + en casa. Su
 * índice vale 1 y es el que ancla la banda de nivel.
 */
export const CONFIG_REF = COMIDA_PP.pizza + BEBIDA_PP.cerveza + LUGAR_PP.casa + EXTRAS_PP;
/** Índice de cada rubro respecto de la config de referencia (adimensional). */
export const indiceConfig = (comida: string, bebida: string, lugar: string) =>
  ((COMIDA_PP[comida] ?? COMIDA_PP.pizza) +
    (BEBIDA_PP[bebida] ?? BEBIDA_PP.cerveza) +
    (LUGAR_PP[lugar] ?? 0) +
    EXTRAS_PP) /
  CONFIG_REF;
/** Peso relativo de cada rubro dentro de una config (para el gráfico). */
export const SHARE_EXTRAS = EXTRAS_PP;

/**
 * Costo por invitado de referencia según el nivel: punto medio de cada banda de
 * cumpleanos-invitados-gastar-torta-regalos. Único criterio propio del hub.
 */
export const BANDA_PP: Record<string, number> = {
  basico: Math.round(NIVEL_CORTES.diy / 2),
  estandar: Math.round((NIVEL_CORTES.diy + NIVEL_CORTES.medio) / 2),
  premium: Math.round((NIVEL_CORTES.medio + NIVEL_CORTES.premium) / 2),
};

/** Costo por invitado en pesos de cada rama, en nivel estándar. */
export const PP_ARS = {
  cumple: BANDA_PP.estandar,
  quince: USD_PP.quince.estandar * DOLAR,
  graduacion: USD_PP.graduacion.estandar * DOLAR,
  despedida: USD_PP.despedida.estandar * DOLAR,
};
/** Cumpleaños en su config más cara, nivel estándar. */
export const CUMPLE_MAX_PP = BANDA_PP.estandar * indiceConfig('catering', 'completo', 'restaurant');

export const hub: HubData = {
  slug: 'eventos/presupuesto',
  title: '¿Cuánto sale la fiesta? Calculadora de presupuesto',
  description:
    'Cuánto te va a salir el festejo en pesos, por tipo: cumpleaños, cumple de 15, graduación y despedida de soltera. Costo por invitado, desglose por rubro y el margen de invitados extra.',
  silo: 'Eventos',
  siloHref: '/eventos',

  eyebrow: 'Fiestas y eventos',
  h1: '¿Cuánto me va a salir la fiesta?',
  lede:
    'Poné cuántos son y qué festejo es: te devolvemos el total en pesos, el costo por invitado y el desglose por rubro, con el 10% de invitados extra ya contemplado. Si ya tenés presupuestos del salón o del catering, cargalos y pisan la estimación.',
  stamps: [
    'Actualizado 27-07-2026',
    `Dólar oficial $${nAr(DOLAR)} (${DOLAR_FECHA})`,
    `Cumpleaños: banda de $${nAr(BANDA_PP.estandar)} por invitado en nivel estándar`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Presupuesto total de la fiesta',

  cases: {
    title: '¿Qué festejo es?',
    intro:
      'Partimos de un cumpleaños. El tipo de festejo no cambia sólo el número: cambia qué rubros existen. En un cumple de 15 hay vestido, foto y DJ; en una graduación hay viaje de egresados y anuario; en una despedida, el viaje se lleva casi la mitad del presupuesto.',
    items: [
      {
        id: 'cumple',
        label: 'Cumpleaños',
        hint: 'En casa, en un salón o en un restaurante',
        answer: `Un cumpleaños con pizza, cerveza y en casa sale del orden de ${pesos(PP_ARS.cumple)} por invitado; con catering y salón, el costo por cabeza se multiplica por ${nAr((COMIDA_PP.catering + BEBIDA_PP.completo + LUGAR_PP.salon + EXTRAS_PP) / (COMIDA_PP.pizza + BEBIDA_PP.cerveza + LUGAR_PP.casa + EXTRAS_PP), 1)}.`,
        yes: [
          `Costo por invitado de referencia según el nivel: ${pesos(BANDA_PP.basico)} el casero, ${pesos(BANDA_PP.estandar)} el estándar y ${pesos(BANDA_PP.premium)} el premium`,
          `La comida mueve el número más que nada: la picada sale ${nAr(COMIDA_PP.picada / COMIDA_PP.pizza, 2)} veces lo que la pizza, el asado ${nAr(COMIDA_PP.asado / COMIDA_PP.pizza, 1)} y el catering con servicio ${nAr(COMIDA_PP.catering / COMIDA_PP.pizza, 1)}`,
          `La bebida: pasar de sin alcohol a cerveza y vino multiplica ese rubro por ${nAr(BEBIDA_PP.cerveza / BEBIDA_PP.soft, 1)}, y la barra completa con tragos, por ${nAr(BEBIDA_PP.completo / BEBIDA_PP.soft, 1)}`,
          `El lugar: en casa no suma nada, una quinta suma poco, y salón o restaurante agregan ${pesos(LUGAR_PP.salon * (BANDA_PP.estandar / CONFIG_REF))} y ${pesos(LUGAR_PP.restaurant * (BANDA_PP.estandar / CONFIG_REF))} por cabeza en nivel estándar`,
          `Del cumple más barato al más caro hay ${nAr(indiceConfig('catering', 'completo', 'restaurant'), 1)} veces de diferencia por invitado: ${pesos(BANDA_PP.estandar)} contra ${pesos(CUMPLE_MAX_PP)}`,
          `Logística en cantidades: ${LOGISTICA_PP.vasos} vasos, ${LOGISTICA_PP.platos} platos y ${LOGISTICA_PP.servilletas} servilletas por persona, una mesa cada ${LOGISTICA_PP.porMesa} y ${nAr(LOGISTICA_PP.hieloKg, 1)} kg de hielo por cabeza`,
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          `De la calculadora vieja de cumpleaños se usan las proporciones entre rubros, no sus importes: estaban tan bajos que el cumple más caro daba ${pesos(20000)} por invitado. Si ya te cotizaron, cargá el catering por invitado y pisá la estimación entera`,
          `El presupuesto se calcula sobre ${Math.round(MARGEN_INVITADOS * 100)}% más invitados de los que pusiste: el colchón de los que confirman tarde`,
          'La lista de invitados es la única palanca que mueve todo a la vez: sacar diez personas baja comida, bebida, torta, souvenirs y mesas al mismo tiempo',
        ],
        plazo:
          'el salón se reserva con 60 a 90 días; el catering confirma número final 7 días antes y casi siempre cobra el confirmado, no el que fue.',
      },
      {
        id: 'quince',
        label: 'Cumple de 15',
        hint: 'Salón, vestido, foto y DJ',
        answer: `Una fiesta de 15 sale entre ${pesos(USD_PP.quince.basico * DOLAR)} y ${pesos(USD_PP.quince.premium * DOLAR)} por invitado según el nivel, con ${pesos(USD_PP.quince.estandar * DOLAR)} en la versión estándar.`,
        yes: [
          `Escala por invitado: básico ${pesos(USD_PP.quince.basico * DOLAR)}, estándar ${pesos(USD_PP.quince.estandar * DOLAR)}, premium ${pesos(USD_PP.quince.premium * DOLAR)}`,
          `Salón y decoración: ${Math.round(RUBROS_QUINCE['Salón y decoración'] * 100)}% del total`,
          `Comida y bebida: ${Math.round(RUBROS_QUINCE['Comida y bebida'] * 100)}% — entre los dos rubros se va el ${Math.round((RUBROS_QUINCE['Salón y decoración'] + RUBROS_QUINCE['Comida y bebida']) * 100)}%`,
          `Vestido, peinado y make-up ${Math.round(RUBROS_QUINCE['Vestido, peinado y make-up'] * 100)}%, foto y video ${Math.round(RUBROS_QUINCE['Foto y video'] * 100)}%, DJ ${Math.round(RUBROS_QUINCE['DJ y música'] * 100)}%`,
          `La escala original de esta calculadora estaba en dólares: se pasa a pesos con el oficial de hoy ($${nAr(DOLAR)}), así no envejece`,
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Los salones cotizan por cubierto y muchos actualizan el precio al mes de la fiesta, no al de la seña: pedí por escrito si el valor es fijo o ajustable',
          'Vestido, peinado y make-up son casi un octavo del presupuesto y no escalan con los invitados: si recortás la lista, ese rubro no baja',
          'La foto y el video se contratan con un año de anticipación en temporada alta (septiembre a diciembre)',
        ],
        plazo:
          'salón y fotógrafo se reservan con 9 a 12 meses; el vestido, con 4 a 6 meses por las pruebas.',
      },
      {
        id: 'graduacion',
        label: 'Graduación o egresados',
        hint: 'Fiesta, viaje y anuario',
        answer: `Una graduación sale entre ${pesos(USD_PP.graduacion.basico * DOLAR)} y ${pesos(USD_PP.graduacion.premium * DOLAR)} por egresado, con ${pesos(USD_PP.graduacion.estandar * DOLAR)} en la versión estándar.`,
        yes: [
          `Escala por egresado: básico ${pesos(USD_PP.graduacion.basico * DOLAR)}, estándar ${pesos(USD_PP.graduacion.estandar * DOLAR)}, premium ${pesos(USD_PP.graduacion.premium * DOLAR)}`,
          `Salón y fiesta final ${Math.round(RUBROS_GRADUACION['Salón y fiesta'] * 100)}% y viaje de egresados ${Math.round(RUBROS_GRADUACION['Viaje de egresados'] * 100)}%: entre los dos, el ${Math.round((RUBROS_GRADUACION['Salón y fiesta'] + RUBROS_GRADUACION['Viaje de egresados']) * 100)}% del presupuesto`,
          `Vestuario y ceremonia ${Math.round(RUBROS_GRADUACION['Vestuario y ceremonia'] * 100)}%, foto y video ${Math.round(RUBROS_GRADUACION['Foto y video'] * 100)}%, anuario ${Math.round(RUBROS_GRADUACION['Anuario y merchandising'] * 100)}%`,
          'Es el único festejo que se paga en cuotas a lo largo de un año escolar entero: dividí el total por los meses que faltan',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Si el viaje de egresados va incluido, el número que ves NO es comparable con el de un cumple de 15: ahí adentro hay alojamiento y transporte',
          'Las empresas de viajes de egresados cobran en cuotas ajustables: mirá la cláusula de actualización antes de firmar, no la cuota inicial',
          'El anuario y el merchandising se pagan por tirada mínima: si se bajan egresados, el costo por cabeza sube',
        ],
        plazo:
          'la empresa de viaje se contrata al empezar el último año; la fiesta final, con 6 meses.',
      },
      {
        id: 'despedida',
        label: 'Despedida de soltera o soltero',
        hint: 'El viaje se lleva casi la mitad',
        answer: `Una despedida sale entre ${pesos(USD_PP.despedida.basico * DOLAR)} y ${pesos(USD_PP.despedida.premium * DOLAR)} por persona, con ${pesos(USD_PP.despedida.estandar * DOLAR)} en la versión estándar.`,
        yes: [
          `Escala por persona: básico ${pesos(USD_PP.despedida.basico * DOLAR)}, estándar ${pesos(USD_PP.despedida.estandar * DOLAR)}, premium ${pesos(USD_PP.despedida.premium * DOLAR)}`,
          `Viaje, locación y alojamiento: ${Math.round(RUBROS_DESPEDIDA['Viaje, locación y alojamiento'] * 100)}% del total, el rubro más grande de todos los festejos`,
          `Comida y bebida ${Math.round(RUBROS_DESPEDIDA['Comida y bebida'] * 100)}%, actividades y shows ${Math.round(RUBROS_DESPEDIDA['Actividades y shows'] * 100)}%`,
          `Vestuario temático y deco ${Math.round(RUBROS_DESPEDIDA['Vestuario temático y deco'] * 100)}% y regalos para la novia ${Math.round(RUBROS_DESPEDIDA['Regalos y sorpresas'] * 100)}%`,
          'Es el único festejo donde el costo lo divide el grupo: el resultado por persona es lo que le tocás pedir a cada una',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'La agasajada normalmente no paga: dividí el total entre las invitadas menos una, o el número por cabeza se queda corto',
          'Si la hacen cerca en vez de viajar, se cae el rubro más grande y el costo por persona baja a menos de la mitad',
          'Poné plazo y monto por escrito en el grupo antes de reservar: las despedidas se financian con transferencias y siempre falta la de alguien',
        ],
        plazo:
          'si hay viaje, se reserva con 3 meses; si es local, con 3 semanas alcanza.',
      },
      {
        id: 'medida',
        label: 'Ya tengo los presupuestos',
        hint: 'Cargá los números reales y sumamos',
        answer:
          'Si ya te cotizaron el salón, el catering y la torta, el hub deja de estimar y suma lo tuyo: salón + catering × invitados + torta + decoración y animación + souvenirs × invitados + regalos.',
        yes: [
          'Suma exacta de lo que cargues, sin estimaciones por encima',
          'El catering y los souvenirs se multiplican por los invitados; el salón, la torta, la deco y la animación son montos fijos',
          `Igual se aplica el ${Math.round(MARGEN_INVITADOS * 100)}% de invitados extra sobre los rubros por cabeza, que es donde duele el que confirma tarde`,
          `Te clasifica el festejo por costo por invitado: ${NIVEL_ETIQUETAS[0]} hasta ${pesos(NIVEL_CORTES.diy)}, ${NIVEL_ETIQUETAS[1]} hasta ${pesos(NIVEL_CORTES.medio)}, ${NIVEL_ETIQUETAS[2]} hasta ${pesos(NIVEL_CORTES.premium)}`,
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Cargá los presupuestos con IVA incluido: los salones cotizan sin IVA y aparece un 21% al final',
          'Faltan casi siempre tres renglones: propinas al personal, seguro del salón y las horas extra de música pasadas las 4 de la mañana',
          'Si el presupuesto tiene fecha de validez, anotala: en el país cotizar y firmar con un mes de diferencia son dos precios distintos',
        ],
        plazo:
          'la seña habitual es del 30% al 50% y casi nunca es reembolsable: leé la cláusula de cancelación antes de transferir.',
      },
    ],
  },

  inputsTitle: 'Contá tu fiesta',
  inputsIntro:
    'Los campos de plata que dejes en cero se estiman; los que cargues con un presupuesto real pisan la estimación de ese rubro. Los invitados son la variable que más mueve el total.',
  fields: [
    { id: 'invitados', label: 'Invitados', type: 'number', min: 1, max: 2000, value: 60 },
    {
      id: 'nivel',
      label: 'Nivel del festejo',
      type: 'select',
      value: 'estandar',
      help: 'Se usa en cumple de 15, graduación y despedida.',
      options: [
        { value: 'basico', label: 'Básico: lo justo y bien hecho' },
        { value: 'estandar', label: 'Estándar: salón, comida y música' },
        { value: 'premium', label: 'Premium: todo con proveedores' },
      ],
    },
    {
      id: 'comida',
      label: 'Comida (cumpleaños)',
      type: 'select',
      value: 'pizza',
      options: [
        { value: 'picada', label: 'Picada y snacks' },
        { value: 'pizza', label: 'Pizza y empanadas' },
        { value: 'asado', label: 'Asado' },
        { value: 'catering', label: 'Catering con servicio' },
      ],
    },
    {
      id: 'bebida',
      label: 'Bebida (cumpleaños)',
      type: 'select',
      value: 'cerveza',
      options: [
        { value: 'soft', label: 'Sin alcohol' },
        { value: 'cerveza', label: 'Cerveza y vino' },
        { value: 'completo', label: 'Barra completa con tragos' },
      ],
    },
    {
      id: 'lugar',
      label: 'Dónde (cumpleaños)',
      type: 'select',
      value: 'casa',
      options: [
        { value: 'casa', label: 'En casa' },
        { value: 'aire_libre', label: 'Quinta o al aire libre' },
        { value: 'salon', label: 'Salón de fiestas' },
        { value: 'restaurant', label: 'Restaurante' },
      ],
    },
    {
      id: 'salon',
      label: 'Presupuesto del salón ($)',
      type: 'number',
      min: 0,
      value: 0,
      thousands: true,
      help: 'Si lo cargás, pisa el rubro lugar o salón de la estimación.',
    },
    {
      id: 'cateringPP',
      label: 'Catering por invitado ($)',
      type: 'number',
      min: 0,
      value: 0,
      thousands: true,
      help: 'Lo que te cotizaron por cubierto. Pisa el rubro de comida y bebida.',
    },
    { id: 'torta', label: 'Torta ($)', type: 'number', min: 0, value: 0, thousands: true, help: 'Sólo en la rama "ya tengo los presupuestos".' },
    { id: 'decoAnimacion', label: 'Decoración y animación ($)', type: 'number', min: 0, value: 0, thousands: true, help: 'Sólo en la rama "ya tengo los presupuestos".' },
    { id: 'souvenirPP', label: 'Souvenir por invitado ($)', type: 'number', min: 0, value: 0, thousands: true },
    { id: 'regalos', label: 'Regalos y sorpresas ($)', type: 'number', min: 0, value: 0, thousands: true },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Las escalas de cumple de 15, graduación y despedida estaban en dólares en las calculadoras originales y se pasan a pesos con el dólar oficial vivo; los rubros del cumpleaños están en pesos y se actualizan por IPC del INDEC. Ninguna de las dos cosas reemplaza un presupuesto firmado: los precios de salón, catering y fotografía se mueven todos los meses y varían muchísimo por ciudad.',

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata',
    caption:
      'Cada porción es un rubro del presupuesto. Sirve para ver dónde recortar de verdad: en casi todos los festejos, dos rubros (el lugar y la comida) se llevan más de la mitad, así que tocar la decoración o los souvenirs casi no mueve el total.',
  },
  breakdownTitle: 'El presupuesto rubro por rubro',
  breakdownIntro:
    'Las filas destacadas son las que definen el número: el costo por invitado y los dos rubros más pesados. Abajo van la logística en cantidades y el nivel de festejo en el que caés.',

  faq: [
    {
      q: '¿Cuánto sale hacer una fiesta de cumpleaños?',
      a: `Depende casi por completo de tres decisiones: dónde, qué se come y cuánta gente. Con las referencias del sitio, un cumpleaños <b>en casa con pizza y cerveza</b> ronda los <b>${pesos(PP_ARS.cumple)} por invitado</b>, mientras que el mismo cumple <b>con catering, barra completa y restaurante</b> se va a ${pesos(CUMPLE_MAX_PP)} por cabeza: ${nAr(indiceConfig('catering', 'completo', 'restaurant'), 1)} veces más. Para 60 invitados eso es la diferencia entre ${pesos(60 * PP_ARS.cumple)} y ${pesos(60 * CUMPLE_MAX_PP)}. Si ya te cotizaron el catering, cargalo en el campo correspondiente y el hub usa tu número en lugar de la estimación.`,
    },
    {
      q: '¿Cuánto sale un cumple de 15?',
      a: `La escala del sitio es de <b>${pesos(USD_PP.quince.basico * DOLAR)} por invitado en la versión básica</b>, ${pesos(USD_PP.quince.estandar * DOLAR)} en la estándar y ${pesos(USD_PP.quince.premium * DOLAR)} en la premium. Para 100 invitados, eso da entre ${pesos(100 * USD_PP.quince.basico * DOLAR)} y ${pesos(100 * USD_PP.quince.premium * DOLAR)}. El reparto es siempre parecido: ${Math.round(RUBROS_QUINCE['Salón y decoración'] * 100)}% salón, ${Math.round(RUBROS_QUINCE['Comida y bebida'] * 100)}% comida y bebida, ${Math.round(RUBROS_QUINCE['Vestido, peinado y make-up'] * 100)}% vestido y make-up, ${Math.round(RUBROS_QUINCE['Foto y video'] * 100)}% foto y video, ${Math.round(RUBROS_QUINCE['DJ y música'] * 100)}% música. Ojo con una trampa: el vestido y la producción no bajan si recortás invitados, así que en fiestas chicas pesan mucho más de ese ${Math.round(RUBROS_QUINCE['Vestido, peinado y make-up'] * 100)}%.`,
    },
    {
      q: '¿Por qué el presupuesto se calcula sobre más invitados de los que puse?',
      a: `Porque la calculadora original de cumpleaños suma un colchón del <b>${Math.round(MARGEN_INVITADOS * 100)}%</b> y el hub lo respeta: sobre 60 invitados, el cálculo se hace sobre ${Math.ceil(60 * (1 + MARGEN_INVITADOS))}. Es el margen del que confirma tarde, el acompañante que apareció y el hermano que nadie contó. Se aplica sólo a los rubros que se pagan por cabeza (comida, bebida, cubierto, souvenirs), nunca a los montos fijos como el salón o la torta, porque ésos no cambian si va uno más.`,
    },
    {
      q: '¿Cuál es el rubro más caro de una fiesta?',
      a: `Cambia según el festejo, y por eso el hub tiene una rama para cada uno. En un <b>cumple de 15</b> mandan salón (${Math.round(RUBROS_QUINCE['Salón y decoración'] * 100)}%) y comida (${Math.round(RUBROS_QUINCE['Comida y bebida'] * 100)}%): entre los dos, el ${Math.round((RUBROS_QUINCE['Salón y decoración'] + RUBROS_QUINCE['Comida y bebida']) * 100)}%. En una <b>graduación</b>, salón (${Math.round(RUBROS_GRADUACION['Salón y fiesta'] * 100)}%) y viaje de egresados (${Math.round(RUBROS_GRADUACION['Viaje de egresados'] * 100)}%). En una <b>despedida</b>, el viaje y el alojamiento solos se llevan el ${Math.round(RUBROS_DESPEDIDA['Viaje, locación y alojamiento'] * 100)}%. La conclusión práctica es siempre la misma: negociar la deco o los souvenirs no mueve la aguja, cambiar el lugar sí.`,
    },
    {
      q: '¿Cuánto conviene gastar por invitado?',
      a: `Con los cortes de la calculadora de cumpleaños del sitio, un festejo por debajo de <b>${pesos(NIVEL_CORTES.diy)} por invitado</b> es un ${NIVEL_ETIQUETAS[0].toLowerCase()}; hasta ${pesos(NIVEL_CORTES.medio)} es ${NIVEL_ETIQUETAS[1].toLowerCase()}; hasta ${pesos(NIVEL_CORTES.premium)} es ${NIVEL_ETIQUETAS[2].toLowerCase()}; por encima, ${NIVEL_ETIQUETAS[3].toLowerCase()}. No hay un número "correcto": la regla útil es al revés, poné primero el total que podés gastar y dividilo por los invitados, y si el costo por cabeza que sale es más bajo que el nivel que querés, la solución es achicar la lista, no bajar la calidad de todo.`,
    },
    {
      q: '¿Cuánto sale una despedida de soltera?',
      a: `Entre <b>${pesos(USD_PP.despedida.basico * DOLAR)}</b> y <b>${pesos(USD_PP.despedida.premium * DOLAR)} por persona</b>, con ${pesos(USD_PP.despedida.estandar * DOLAR)} en el plan estándar. El ${Math.round(RUBROS_DESPEDIDA['Viaje, locación y alojamiento'] * 100)}% es viaje, locación y alojamiento, así que el número real depende casi sólo de si se van o se quedan. Dos detalles que descuadran la cuenta: la agasajada normalmente no paga (dividí entre las que van menos una) y las actividades contratadas —show, clase, alquiler de casa— suelen pedir seña con un mes de anticipación, cuando todavía no está confirmado quién va.`,
    },
    {
      q: '¿Cuánto sale la fiesta de graduación o el viaje de egresados?',
      a: `La escala del sitio va de <b>${pesos(USD_PP.graduacion.basico * DOLAR)} a ${pesos(USD_PP.graduacion.premium * DOLAR)} por egresado</b>, con ${pesos(USD_PP.graduacion.estandar * DOLAR)} en el nivel estándar, y ahí adentro el <b>viaje de egresados es el ${Math.round(RUBROS_GRADUACION['Viaje de egresados'] * 100)}%</b>. Si tu colegio hace viaje y fiesta por separado, no compares totales con otro que sólo hace fiesta. Lo importante en este festejo no es el total sino la cuota: se paga a lo largo de todo un año escolar y casi siempre con ajuste, así que mirá cómo se actualiza cada cuota antes que el precio de tapa.`,
    },
    {
      q: '¿Qué gastos se olvidan siempre al presupuestar una fiesta?',
      a: 'Los mismos cinco, en todos los festejos: <b>el IVA</b> (los salones cotizan sin IVA y aparece un 21% al final), <b>las propinas</b> al personal de servicio, <b>las horas extra</b> de música y salón pasadas las 4 de la mañana, <b>el seguro</b> que muchos salones exigen y <b>el traslado</b> —remises, combis o estacionamiento— cuando el lugar queda lejos. Sumados suelen ser entre el 10% y el 15% del presupuesto, que es exactamente la diferencia entre cerrar la cuenta y no cerrarla.',
    },
    {
      q: '¿Cómo bajo el costo de la fiesta sin que se note?',
      a: `Por orden de impacto real: <b>recortar la lista de invitados</b> (baja comida, bebida, cubierto, souvenirs y mesas de una sola vez), <b>cambiar el día</b> —viernes y domingos cuestan bastante menos que el sábado a la noche—, <b>mover el horario</b> a la tarde para que sea merienda y no cena, y <b>pasar de catering a comida servida</b>. Lo que casi no sirve: pelear la decoración, los souvenirs o las invitaciones, que juntos rara vez pasan del ${Math.round(RUBROS_QUINCE['Invitaciones y varios'] * 100)}% del total.`,
    },
    {
      q: '¿Por qué algunos valores están atados al dólar y otros al IPC?',
      a: `Porque las calculadoras que este hub reemplaza tenían anclajes distintos. Las de cumple de 15, graduación y despedida traían su escala <b>en dólares por invitado</b>, así que el hub las pasa a pesos con el <b>dólar oficial vivo</b> ($${nAr(DOLAR)} al ${DOLAR_FECHA}) y no envejecen. La de cumpleaños traía importes <b>en pesos</b> fechados en ${CUMPLE_BASE_MES}, y ahí el problema no era la antigüedad —desde entonces el IPC del INDEC acumula apenas ${nAr((IPC_FACTOR - 1) * 100, 1)}% en ${IPC_MESES} meses, hasta ${IPC_ULTIMO_MES}— sino el nivel: su cumple más caro daba $20.000 por invitado, el piso de lo que su propia calculadora hermana llama "nivel medio". Por eso de esa fórmula se usan las <b>proporciones entre rubros</b> (que no dependen de la moneda ni de la fecha) y el nivel de precio sale de los cortes en pesos de la otra.`,
    },
    {
      q: '¿La estimación incluye la comida y la bebida en cantidades?',
      a: 'No: acá va la plata, y las cantidades van aparte. Cuánta pizza, sushi, picada, torta y helado comprar está en la calculadora de comida del evento, y los litros de cerveza, gaseosa, vino y el hielo, en la de bebidas. Conviene hacer las tres el mismo día con la misma cantidad de invitados: las de cantidades te dicen qué pedir y ésta te dice si te alcanza la plata.',
    },
    {
      q: '¿Y el casamiento?',
      a: 'El casamiento tiene su propio cálculo y no está en este hub a propósito: cambia la estructura de rubros (civil, iglesia, luna de miel, alianzas, mesa de regalos) y sobre todo cambia quién paga qué, que es la mitad del problema. Si estás organizando uno, el punto de partida es el mismo: definí el total, dividilo por invitados y ajustá la lista antes que la calidad.',
    },
  ],

  sources: [
    {
      name: 'Índice de Precios al Consumidor (IPC) — nivel general, cobertura nacional',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: 'serie mensual',
    },
    {
      name: 'Cotización del dólar oficial (mayorista y minorista)',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Tipo_de_cambio_minorista.asp',
      publisher: 'BCRA',
    },
    {
      name: 'DolarAPI — cotizaciones en vivo usadas por el sitio',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
    },
    {
      name: 'Defensa del Consumidor — exhibición de precios y presupuestos de servicios',
      url: 'https://www.argentina.gob.ar/produccion/defensadelconsumidor',
      publisher: 'Secretaría de Comercio · Ley 24.240',
    },
    {
      name: 'Encuesta Nacional de Gastos de los Hogares — capítulo esparcimiento y cultura',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-45-155',
      publisher: 'INDEC',
    },
  ],

  replaces: [
    '/calculadora-presupuesto-cumpleanos',
    '/calculadora-cumpleanos-invitados-gastar-torta-regalos',
    '/calculadora-presupuesto-cumple-15-quinceanera',
    '/calculadora-presupuesto-graduacion',
    '/calculadora-presupuesto-despedida-soltera',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-costo-fiesta-cumpleanos-infantil-invitados',
    '/calculadora-presupuesto-navidad-regalos-cena',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
