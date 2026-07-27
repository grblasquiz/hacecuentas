import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto equipaje puedo llevar y qué me cobran de más?"
 *
 * Absorbe 8 calculadoras sueltas de equipaje. Todas responden variantes de la
 * misma pregunta, pero en dos momentos distintos del viaje:
 *
 *   a) ANTES de armar la valija: cuánta ropa meto para X días (38 sesiones/mes,
 *      la consulta más grande del grupo).
 *   b) ANTES de despachar: cuánto me deja llevar mi tarifa y cuánto me cobran
 *      si me paso.
 *
 * La cuarta rama —la mochila de trekking— es otra pregunta física (el 20% del
 * peso corporal, nada que ver con aerolíneas) pero comparte el verbo: "cuánto
 * puedo llevar". Va como rama propia, aislada, para no contaminar la lógica de
 * franquicias. Ver el reporte de decisiones.
 *
 * LÍMITE CON EL HUB DE AEROPUERTO (`viajes/aeropuerto`): acá NO se calcula
 * anticipo, traslado ni tiempo de conexión. Ese hub ya resuelve los tiempos y
 * reclama sus propias 8 URLs. Acá sólo hay kilos, piezas y plata.
 *
 * TODO EL HUB SE LEE EN KILOS: las cuatro ramas colocan un peso sobre la misma
 * escala. Por eso el gráfico es `scale` y no cambia de unidad entre ramas.
 *
 * Arquetipo: RAMIFICADO.
 */

/* ------------------------------------------------------------------ *
 * 1. Franquicias por aerolínea × cabina × ruta
 *
 * Espejo de `src/lib/formulas/equipaje-permitido-franquicia-aerolinea.ts`,
 * que es la más granular y la más recientemente verificada de las cuatro
 * calculadoras de límites que absorbe el hub (datos 2026 contra las páginas
 * oficiales de equipaje). Las otras tres tienen tablas más viejas y se
 * contradicen entre sí; el reporte de la sesión detalla cada choque.
 * ------------------------------------------------------------------ */

export interface Allowance {
  /** Equipaje de mano. null = no incluido; 0 = incluido sin tope de peso. */
  manoKg: number | null;
  manoDim: string;
  /** Artículo personal bajo el asiento. null = incluido sin peso declarado. */
  personalKg: number | null;
  personalDim: string;
  /** Piezas despachadas incluidas. 0 = ninguna. */
  despachadoPiezas: number;
  /** Kg por pieza despachada incluida. */
  despachadoKg: number;
  /** Tope físico de rampa por bulto. */
  topePiezaKg: number;
  lowcost: boolean;
}

const DIM_MANO = '55×35×25 cm';
const DIM_MANO_INTL = '55×40×23 cm';
const DIM_PERSONAL = '40×30×20 cm';
const DIM_PERSONAL_LOWCOST = '45×35×25 cm';

function carryOnSolo(o: { manoKg: number; manoDim?: string; personalDim?: string; lowcost?: boolean }): Allowance {
  return {
    manoKg: o.manoKg,
    manoDim: o.manoDim ?? DIM_MANO,
    personalKg: null,
    personalDim: o.personalDim ?? DIM_PERSONAL,
    despachadoPiezas: 0,
    despachadoKg: 23,
    topePiezaKg: 32,
    lowcost: o.lowcost ?? false,
  };
}

function soloPersonal(o: { personalKg: number | null; personalDim?: string; lowcost?: boolean }): Allowance {
  return {
    manoKg: null,
    manoDim: DIM_MANO,
    personalKg: o.personalKg,
    personalDim: o.personalDim ?? DIM_PERSONAL_LOWCOST,
    despachadoPiezas: 0,
    despachadoKg: 23,
    topePiezaKg: 23,
    lowcost: o.lowcost ?? true,
  };
}

function conDespachado(o: {
  manoKg: number;
  manoDim?: string;
  personalKg?: number | null;
  piezas: number;
  despachadoKg?: number;
  topePiezaKg?: number;
  lowcost?: boolean;
}): Allowance {
  return {
    manoKg: o.manoKg,
    manoDim: o.manoDim ?? DIM_MANO,
    personalKg: o.personalKg ?? null,
    personalDim: DIM_PERSONAL,
    despachadoPiezas: o.piezas,
    despachadoKg: o.despachadoKg ?? 23,
    topePiezaKg: o.topePiezaKg ?? 32,
    lowcost: o.lowcost ?? false,
  };
}

type Ruta = 'cabotaje' | 'regional' | 'internacional';
type Cabina = 'basica' | 'estandar' | 'premium' | 'business';

interface AirlineSpec {
  label: string;
  lowcost: boolean;
  basica: (r: Ruta) => Allowance;
  estandar: (r: Ruta) => Allowance;
  premium: (r: Ruta) => Allowance;
  business: (r: Ruta) => Allowance;
}

const SPECS: Record<string, AirlineSpec> = {
  'aerolineas-argentinas': {
    label: 'Aerolíneas Argentinas',
    lowcost: false,
    basica: (r) =>
      r === 'cabotaje'
        ? soloPersonal({ personalKg: 3, personalDim: DIM_PERSONAL, lowcost: false })
        : conDespachado({ manoKg: 10, personalKg: 3, piezas: 1, despachadoKg: 23 }),
    estandar: (r) =>
      r === 'cabotaje'
        ? conDespachado({ manoKg: 8, personalKg: 3, piezas: 1, despachadoKg: 15 })
        : conDespachado({ manoKg: 10, personalKg: 3, piezas: 1, despachadoKg: 23 }),
    premium: (r) =>
      conDespachado({
        manoKg: 12,
        personalKg: 3,
        piezas: r === 'cabotaje' ? 1 : 2,
        despachadoKg: r === 'cabotaje' ? 15 : 23,
      }),
    business: () => conDespachado({ manoKg: 14, personalKg: 5, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  latam: {
    label: 'LATAM',
    lowcost: false,
    basica: () => soloPersonal({ personalKg: 10, personalDim: '45×35×25 cm', lowcost: false }),
    estandar: (r) =>
      r === 'cabotaje'
        ? conDespachado({ manoKg: 10, personalKg: 10, piezas: 1, despachadoKg: 23 })
        : conDespachado({ manoKg: 10, manoDim: DIM_MANO_INTL, personalKg: 10, piezas: 1, despachadoKg: 23 }),
    premium: (r) =>
      conDespachado({ manoKg: 10, personalKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 16, personalKg: 10, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  flybondi: {
    label: 'Flybondi',
    lowcost: true,
    basica: (r) => soloPersonal({ personalKg: r === 'cabotaje' ? 6 : 10, personalDim: '30×40×20 cm', lowcost: true }),
    estandar: () => carryOnSolo({ manoKg: 10, personalDim: '30×40×20 cm', lowcost: true }),
    premium: () => carryOnSolo({ manoKg: 10, lowcost: true }),
    business: () =>
      conDespachado({ manoKg: 10, personalKg: 10, piezas: 1, despachadoKg: 23, topePiezaKg: 23, lowcost: true }),
  },
  jetsmart: {
    label: 'JetSMART',
    lowcost: true,
    basica: () => soloPersonal({ personalKg: 10, personalDim: '45×35×25 cm', lowcost: true }),
    estandar: () => carryOnSolo({ manoKg: 10, personalDim: '45×35×25 cm', lowcost: true }),
    premium: () => carryOnSolo({ manoKg: 10, lowcost: true }),
    business: () =>
      conDespachado({ manoKg: 10, personalKg: 10, piezas: 1, despachadoKg: 23, topePiezaKg: 23, lowcost: true }),
  },
  avianca: {
    label: 'Avianca',
    lowcost: false,
    basica: (r) =>
      r === 'cabotaje'
        ? soloPersonal({ personalKg: 10, personalDim: '45×35×25 cm', lowcost: false })
        : carryOnSolo({ manoKg: 10, manoDim: DIM_MANO_INTL, personalDim: '45×35×25 cm', lowcost: false }),
    estandar: (r) =>
      conDespachado({ manoKg: 10, manoDim: r === 'internacional' ? DIM_MANO_INTL : DIM_MANO, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 18, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  copa: {
    label: 'Copa Airlines',
    lowcost: false,
    basica: (r) =>
      r === 'cabotaje'
        ? carryOnSolo({ manoKg: 10, lowcost: false })
        : conDespachado({ manoKg: 10, manoDim: DIM_MANO_INTL, piezas: 1, despachadoKg: 23 }),
    estandar: () => conDespachado({ manoKg: 10, manoDim: DIM_MANO_INTL, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 16, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  gol: {
    label: 'GOL',
    lowcost: false,
    basica: () => carryOnSolo({ manoKg: 10, lowcost: false }),
    estandar: () => conDespachado({ manoKg: 10, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 16, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  azul: {
    label: 'Azul',
    lowcost: false,
    basica: () => carryOnSolo({ manoKg: 10, lowcost: false }),
    estandar: () => conDespachado({ manoKg: 10, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 16, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  iberia: {
    label: 'Iberia',
    lowcost: false,
    basica: () => carryOnSolo({ manoKg: 10, manoDim: '56×40×25 cm', personalDim: '40×30×15 cm', lowcost: false }),
    estandar: () => conDespachado({ manoKg: 10, manoDim: '56×40×25 cm', piezas: 1, despachadoKg: 23 }),
    premium: () => conDespachado({ manoKg: 10, manoDim: '56×40×25 cm', piezas: 2, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 14, manoDim: '56×40×25 cm', piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  'air-europa': {
    label: 'Air Europa',
    lowcost: false,
    basica: (r) =>
      r === 'internacional'
        ? conDespachado({ manoKg: 10, piezas: 1, despachadoKg: 23 })
        : carryOnSolo({ manoKg: 10, lowcost: false }),
    estandar: () => conDespachado({ manoKg: 10, piezas: 1, despachadoKg: 23 }),
    premium: () => conDespachado({ manoKg: 10, piezas: 2, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 14, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  american: {
    label: 'American Airlines',
    lowcost: false,
    basica: (r) =>
      r === 'internacional'
        ? conDespachado({ manoKg: 0, manoDim: '56×36×23 cm', piezas: 1, despachadoKg: 23 })
        : carryOnSolo({ manoKg: 0, manoDim: '56×36×23 cm', lowcost: false }),
    estandar: (r) =>
      r === 'internacional'
        ? conDespachado({ manoKg: 0, manoDim: '56×36×23 cm', piezas: 1, despachadoKg: 23 })
        : carryOnSolo({ manoKg: 0, manoDim: '56×36×23 cm', lowcost: false }),
    premium: () => conDespachado({ manoKg: 0, manoDim: '56×36×23 cm', piezas: 2, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 0, manoDim: '56×36×23 cm', piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  united: {
    label: 'United',
    lowcost: false,
    basica: (r) =>
      r === 'internacional'
        ? carryOnSolo({ manoKg: 0, manoDim: '56×35×23 cm', lowcost: false })
        : soloPersonal({ personalKg: null, personalDim: '43×25×22 cm', lowcost: false }),
    estandar: (r) =>
      r === 'internacional'
        ? conDespachado({ manoKg: 0, manoDim: '56×35×23 cm', piezas: 1, despachadoKg: 23 })
        : carryOnSolo({ manoKg: 0, manoDim: '56×35×23 cm', lowcost: false }),
    premium: () => conDespachado({ manoKg: 0, manoDim: '56×35×23 cm', piezas: 2, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 0, manoDim: '56×35×23 cm', piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
};

export const AEROLINEA_ORDEN = [
  'aerolineas-argentinas',
  'latam',
  'flybondi',
  'jetsmart',
  'avianca',
  'copa',
  'gol',
  'azul',
  'iberia',
  'air-europa',
  'american',
  'united',
] as const;

const CABINAS: Cabina[] = ['basica', 'estandar', 'premium', 'business'];
const RUTAS: Ruta[] = ['cabotaje', 'regional', 'internacional'];

/**
 * Tabla expandida y plana: aerolínea → cabina → ruta → Allowance.
 * Se serializa entera al cliente con `define:vars`, así que el runtime no
 * necesita ejecutar ninguna de las funciones de arriba.
 */
export const FRANQUICIAS: Record<string, { label: string; lowcost: boolean; ruta: Record<string, Record<string, Allowance>> }> =
  Object.fromEntries(
    AEROLINEA_ORDEN.map((key) => {
      const spec = SPECS[key];
      const porCabina: Record<string, Record<string, Allowance>> = {};
      for (const c of CABINAS) {
        porCabina[c] = {};
        for (const r of RUTAS) porCabina[c][r] = spec[c](r);
      }
      return [key, { label: spec.label, lowcost: spec.lowcost, ruta: porCabina }];
    }),
  );

/* ------------------------------------------------------------------ *
 * 2. Tarifas de exceso
 *
 * Espejo de `src/lib/formulas/maletas-peso-aerolineas-low-cost-premium.ts`,
 * que es la única de las cuatro que trae precios por aerolínea. Sólo cubre
 * seis compañías; para las otras seis del selector se aplica el valor modal
 * de servicio completo de esa misma tabla (15 USD/kg en cabotaje y regional,
 * 20 en internacional; 80/100 USD de cargo por pieza agregada en mostrador).
 * Está marcado como estimado en la fila del desglose.
 * ------------------------------------------------------------------ */

export interface TarifaExceso {
  /** USD por kilo de sobrepeso sobre una franquicia ya incluida. */
  porKg: { cabotaje: number; regional: number; internacional: number };
  /** USD por agregar una pieza despachada en el mostrador del aeropuerto. */
  piezaMostrador: { cabotaje: number; regional: number; internacional: number };
  /** false = precio tomado del modal de la tabla, no de esa aerolínea. */
  propio: boolean;
}

const MODAL_FULL: TarifaExceso = {
  porKg: { cabotaje: 15, regional: 15, internacional: 20 },
  piezaMostrador: { cabotaje: 80, regional: 80, internacional: 100 },
  propio: false,
};

export const EXCESO: Record<string, TarifaExceso> = {
  flybondi: {
    porKg: { cabotaje: 8, regional: 12, internacional: 12 },
    piezaMostrador: { cabotaje: 30, regional: 55, internacional: 55 },
    propio: true,
  },
  jetsmart: {
    porKg: { cabotaje: 8, regional: 10, internacional: 10 },
    piezaMostrador: { cabotaje: 22, regional: 35, internacional: 35 },
    propio: true,
  },
  'aerolineas-argentinas': {
    porKg: { cabotaje: 15, regional: 20, internacional: 20 },
    piezaMostrador: { cabotaje: 80, regional: 100, internacional: 100 },
    propio: true,
  },
  latam: {
    porKg: { cabotaje: 15, regional: 20, internacional: 20 },
    piezaMostrador: { cabotaje: 80, regional: 100, internacional: 100 },
    propio: true,
  },
  copa: {
    porKg: { cabotaje: 15, regional: 20, internacional: 20 },
    piezaMostrador: { cabotaje: 100, regional: 100, internacional: 100 },
    propio: true,
  },
  'air-europa': {
    porKg: { cabotaje: 18, regional: 22, internacional: 22 },
    piezaMostrador: { cabotaje: 80, regional: 120, internacional: 120 },
    propio: true,
  },
  avianca: MODAL_FULL,
  gol: MODAL_FULL,
  azul: MODAL_FULL,
  iberia: MODAL_FULL,
  american: MODAL_FULL,
  united: MODAL_FULL,
};

/** Tope absoluto por bulto que acepta cualquier aerolínea. */
export const MAX_KG_PIEZA = 32;

/**
 * Multiplicador del momento de compra del extra.
 * Espejo de `RECARGO_MOMENTO` en `equipaje-extra-costo-aerolinea.ts`:
 * online con el pasaje = precio base, después del pasaje = +25 %,
 * en el mostrador = el doble.
 */
export const RECARGO_MOMENTO: Record<string, number> = {
  online: 1.0,
  previo: 1.25,
  mostrador: 2.0,
};

/* ------------------------------------------------------------------ *
 * 3. Armado de valija
 *
 * Las CANTIDADES de prendas son espejo exacto de
 * `src/lib/formulas/ropa-maleta-dias-viaje.ts`.
 *
 * Los PESOS por prenda NO vienen de esa fórmula (no calcula peso). Son
 * constantes nuevas del hub, promedios de prenda de adulto en gramos, para
 * poder poner el resultado del armado sobre la misma escala de kilos que las
 * otras ramas. Están declaradas acá arriba, a la vista, y el resultado las
 * muestra como estimación.
 * ------------------------------------------------------------------ */

export const ROPA = {
  cicloLavado: 5,
  topeConLavado: 7,
  topeSinLavado: 14,
  factorEstilo: { mochilero: 0.8, casual: 1.0, formal: 1.3 } as Record<string, number>,
  clima: {
    calido: { remerasF: 0.9, remerasMin: 3, pantF: 0.3, pantMin: 1, abrigos: 1 },
    templado: { remerasF: 0.8, remerasMin: 3, pantF: 0.3, pantMin: 2, abrigos: 2 },
    frio: { remerasF: 0.85, remerasMin: 4, pantF: 0.35, pantMin: 2, abrigos: 3 },
    mixto: { remerasF: 0.85, remerasMin: 4, pantF: 0.35, pantMin: 2, abrigos: 2 },
  } as Record<string, { remerasF: number; remerasMin: number; pantF: number; pantMin: number; abrigos: number }>,
} as const;

/** Peso medio por prenda de adulto, en kg. Constantes propias del hub. */
export const PESO_PRENDA = {
  remera: 0.15,
  pantalon: 0.5,
  interior: 0.06,
  medias: 0.05,
  abrigo: 0.6,
  /** Valija rígida mediana vacía. */
  valijaVacia: 3.2,
  /** Neceser, cargadores, documentación y varios. */
  neceser: 1.5,
  /** Un par de calzado extra al que llevás puesto. */
  calzadoExtra: 0.9,
} as const;

/* ------------------------------------------------------------------ *
 * 4. Mochila de trekking
 * Espejo exacto de `src/lib/formulas/peso-mochila-trekking.ts`.
 * ------------------------------------------------------------------ */

export const TREK_DURACION: Record<string, { pctIdeal: number; pctMax: number }> = {
  dia: { pctIdeal: 10, pctMax: 15 },
  '2-3-dias': { pctIdeal: 18, pctMax: 22 },
  semana: { pctIdeal: 20, pctMax: 25 },
  'mas-semana': { pctIdeal: 22, pctMax: 25 },
};

export const TREK_NIVEL: Record<string, number> = {
  principiante: 3,
  intermedio: 0,
  avanzado: -4,
};

export const CASE_MATH: Record<string, { modo: 'armado' | 'franquicia' | 'sobrepeso' | 'mochila' }> = {
  armado: { modo: 'armado' },
  franquicia: { modo: 'franquicia' },
  sobrepeso: { modo: 'sobrepeso' },
  mochila: { modo: 'mochila' },
};

const AVISO_DATO =
  'Las franquicias y las tarifas de exceso las fija cada aerolínea y cambian sin aviso: la tabla de este hub está revisada al 27 de julio de 2026 contra las páginas oficiales de equipaje. Antes de despachar, confirmá los kilos y las medidas en tu reserva.';

export const hub: HubData = {
  slug: 'viajes/equipaje',
  title: '¿Cuánto equipaje puedo llevar? Franquicia por aerolínea y costo del sobrepeso',
  description:
    'Cuánta ropa meter para los días que viajás, cuántos kilos y piezas te deja llevar tu tarifa en cada aerolínea, y cuánto te cobran si te pasás de peso. Incluye el peso estimado de la valija armada, el tope de 32 kg por bulto y el peso máximo de mochila para trekking.',
  silo: 'Viajes',
  siloHref: '/viajes',

  eyebrow: 'Franquicia, sobrepeso y armado de valija',
  h1: '¿Cuánto equipaje puedo llevar y qué me cobran de más?',
  lede:
    'Dos preguntas que terminan en la misma balanza. Antes de cerrar la valija querés saber cuánta ropa te alcanza para los días que vas; en el mostrador querés saber si esos kilos entran en tu tarifa o si te van a cobrar el exceso. Acá salen los dos números: qué llevar y cuánto pesa, cuántos kilos y piezas incluye tu combinación de aerolínea, cabina y ruta, y cuánto cuesta cada kilo de más según dónde lo pagues. Todo sobre la misma escala de kilos.',
  stamps: [
    'Franquicia por aerolínea, cabina y ruta',
    'Costo del kilo de exceso',
    'Peso estimado de la valija armada',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Tu equipaje',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Las cuatro ramas comparten formulario, pero cada una responde una pregunta distinta. Elegí en cuál estás: los campos que no usa tu rama no afectan el resultado.',
    items: [
      {
        id: 'armado',
        label: 'Qué ropa llevo para los días que viajo',
        hint: 'Sabés cuántos días vas y querés la lista de prendas y cuánto pesa.',
        yes: [
          'Cuántas remeras, pantalones, mudas de ropa interior, pares de medias y abrigos corresponden a tus días de viaje',
          'El recorte que permite lavar durante el viaje: con lavadero empacás como máximo siete días de ropa y rotás',
          'El ajuste por clima del destino, que cambia la proporción entre remeras, pantalones y abrigos',
          'El ajuste por estilo de viaje: el mochilero lleva un 20 % menos y el formal un 30 % más',
          'El peso estimado de todo eso ya metido en la valija, con el bulto vacío, el neceser y un calzado extra',
          'Dónde cae ese peso contra la franquicia de la aerolínea que elegiste',
        ],
        warn: [
          AVISO_DATO,
          'Las cantidades de prendas salen de una regla de proporción por días y clima, no de tu ropa real: una campera de plumas y un buzo de algodón cuentan igual como "abrigo" y pesan muy distinto.',
          'Los pesos por prenda son promedios de prenda de adulto. Si viajás con ropa técnica pesa bastante menos, y si llevás jean y abrigo de invierno pesa bastante más: usá el número como orden de magnitud, no como lectura de balanza.',
          'A partir de dos semanas sin lavar el cálculo topea en catorce días de ropa: para viajes largos vas a tener que lavar sí o sí, no hay valija que aguante.',
          'No están contemplados los objetos que más pesan y más se olvidan: notebook, cámara, botella llena, regalos, souvenirs de vuelta y compras del duty free.',
          'El equipaje de vuelta casi siempre pesa más que el de ida. Si vas al límite en la ida, ya tenés problema en la vuelta.',
        ],
        plazo:
          'pesá la valija cerrada en tu casa con una balanza de mano el día anterior, no la mañana del vuelo: si te pasás, todavía tenés tiempo de sacar cosas o de comprar el kilo extra online, que es la mitad de caro que en el mostrador.',
        answer:
          'Para un viaje con acceso a lavadero alcanza con empacar siete días de ropa y rotar, sin importar cuántas semanas te quedes; sin lavadero, el cálculo topea en catorce días.',
      },
      {
        id: 'franquicia',
        label: 'Cuánto me deja llevar mi tarifa',
        hint: 'Ya tenés el pasaje y querés saber qué incluye antes de armar nada.',
        yes: [
          'Qué artículo personal, qué equipaje de mano y qué equipaje despachado incluye tu combinación exacta de aerolínea, cabina y ruta',
          'Las dimensiones máximas de cada bulto, que se controlan a la par del peso',
          'Cuántos kilos suma todo lo que podés subir sin pagar un peso extra',
          'El tope físico por bulto, que ninguna aerolínea supera aunque le pagues',
          'Si tu tarifa es de las que sólo incluyen la mochila bajo el asiento, el caso que más sorpresas da en el mostrador',
        ],
        warn: [
          AVISO_DATO,
          'Dentro de una misma cabina hay sub-tarifas con franquicias distintas (Basic, Light, Plus, Full, Promo). El nombre comercial no alcanza: mirá el detalle de equipaje de tu reserva.',
          'En cabotaje argentino varias tarifas base ya no incluyen ni la valija de mano, sólo el artículo personal bajo el asiento. Es el cambio que más gente descubre recién en la puerta de embarque.',
          'American y United no fijan tope de peso para el equipaje de mano, pero sí de medidas: si no entra en el compartimento, va a bodega y se cobra.',
          'El peso y las medidas se controlan a la vez. Un bulto de 20 kg que mide más de 158 cm lineales paga cargo por sobredimensionado igual que si estuviera pasado de peso.',
          'Volar con dos billetes separados no suma franquicias: cada tramo aplica la suya y el equipaje no viaja facturado hasta el destino final.',
        ],
        plazo:
          'si la tarifa no incluye lo que necesitás, comprá el extra ahora y online: sumarlo después del pasaje cuesta un 25 % más y en el mostrador del aeropuerto, el doble.',
        answer:
          'Lo que podés llevar depende de la combinación aerolínea, cabina y ruta: la económica estándar internacional suele incluir una pieza de 23 kg despachada más equipaje de mano, y la básica de cabotaje puede no incluir ni la valija de mano.',
      },
      {
        id: 'sobrepeso',
        label: 'Me paso de peso: cuánto me cobran',
        hint: 'Ya pesaste la valija y querés saber cuánto sale el exceso.',
        yes: [
          'Los kilos exactos de exceso sobre la franquicia que incluye tu tarifa',
          'El cargo estimado, que sale de multiplicar esos kilos por la tarifa por kilo de tu aerolínea y ruta',
          'El recargo por el momento en que lo pagás: online con el pasaje, después del pasaje o en el mostrador',
          'El cargo por agregar una pieza despachada cuando tu tarifa no incluye ninguna, que se cobra fijo y no por kilo',
          'El aviso de rechazo cuando el bulto pasa los 32 kg, que no se paga: directamente no se acepta',
          'Cuánto margen te queda si todavía estás por debajo del límite',
        ],
        warn: [
          AVISO_DATO,
          'Las tarifas de exceso son estimadas en dólares y varían por ruta, temporada y programa de viajero frecuente. Tomalas como orden de magnitud para decidir, no como el importe que vas a pagar.',
          'Ninguna aerolínea acepta un bulto de más de 32 kg en bodega: es un límite de seguridad de los operarios de rampa, no un cargo. Con 33 kg no pagás más, te hacen abrir la valija ahí mismo.',
          'Repartir el exceso entre dos valijas casi siempre sale más barato que pagar el sobrepeso de una sola, porque la segunda pieza se cobra a precio fijo y el sobrepeso se cobra por kilo.',
          'El cargo por sobredimensionado se suma al de sobrepeso: pasarte en medidas y en kilos se paga dos veces.',
          'En las tarifas que no incluyen bodega, el cargo del mostrador puede duplicar lo que costaba online el día que compraste el pasaje.',
        ],
        plazo:
          'si el resultado da exceso, resolvelo antes de salir de casa: pasar cosas a la mochila de mano, repartir con un acompañante o comprar el kilo extra online son las tres salidas, y todas dejan de estar disponibles cuando ya estás en la fila del mostrador.',
        answer:
          'El sobrepeso se cobra por kilo sobre la franquicia incluida: entre 8 y 12 dólares por kilo en low-cost y entre 15 y 22 en aerolíneas de servicio completo, y el doble si lo pagás en el mostrador.',
      },
      {
        id: 'mochila',
        label: 'Cuánto puedo cargar en la mochila de trekking',
        hint: 'No es equipaje de avión: es cuánto peso aguanta tu espalda.',
        yes: [
          'El peso ideal de la mochila cargada según el porcentaje de tu peso corporal que corresponde a la duración de la salida',
          'El peso máximo que no conviene superar, un escalón por encima del ideal',
          'El ajuste por nivel: el equipo de un principiante pesa más y el ultraliviano de un avanzado pesa menos',
          'Las tres zonas de carga —liviana, óptima y sobrecarga— para ubicar lo que ya tenés armado',
        ],
        warn: [
          'Estimación orientativa de carga. Si tenés una lesión de espalda, de rodilla o de cadera, o si es tu primera salida larga, consultá con un profesional antes de cargar según este número.',
          'El porcentaje es sobre tu peso corporal real y cuenta la mochila cargada completa: bolsa de dormir, agua, comida y la mochila vacía incluidas.',
          'El agua es la mitad del problema y no aparece en ninguna lista: un litro pesa un kilo y una salida de día en verano se lleva dos o tres.',
          'Cargar bien importa tanto como cargar poco: el peso pegado a la espalda y a la altura de los omóplatos se siente mucho menos que el mismo peso colgando abajo o lejos del cuerpo.',
          'En altura, con nieve o con desnivel fuerte, bajá el objetivo un escalón respecto de lo que da el cálculo.',
          'Este resultado no tiene nada que ver con las franquicias de equipaje de avión: si vas a despachar la mochila, calculala también en la rama de franquicia.',
        ],
        plazo:
          'pesá la mochila cargada con la balanza de tu casa una semana antes de la salida y caminá una hora con ella: es la única forma de saber si el número te cierra en el cuerpo y no sólo en la planilla.',
        answer:
          'Como referencia general, la mochila cargada no debería superar el 20 % de tu peso corporal en una salida de varios días, y el 10 % en una salida de un día.',
      },
    ],
  },

  inputsTitle: 'Contame tu equipaje',
  inputsIntro:
    'Los primeros campos describen el viaje y sirven para armar la valija. Los del medio son de la aerolínea y se usan en franquicia y sobrepeso. Los últimos tres son sólo de la mochila de trekking: si no es tu caso, dejalos como están.',
  fields: [
    {
      id: 'dias',
      label: 'Días de viaje',
      type: 'number',
      suffix: 'días',
      min: 1,
      max: 120,
      step: 1,
      value: 10,
    },
    {
      id: 'clima',
      label: 'Clima del destino',
      type: 'select',
      value: 'templado',
      options: [
        { value: 'calido', label: 'Cálido' },
        { value: 'templado', label: 'Templado' },
        { value: 'frio', label: 'Frío' },
        { value: 'mixto', label: 'Mixto o varias regiones' },
      ],
    },
    {
      id: 'lavar',
      label: '¿Vas a poder lavar ropa?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, hay lavadero o lavo a mano' },
        { value: 'no', label: 'No, llevo toda la ropa' },
      ],
      help: 'Con lavado empacás como máximo siete días de ropa aunque el viaje sea de un mes.',
    },
    {
      id: 'estilo',
      label: 'Estilo de viaje',
      type: 'select',
      value: 'casual',
      options: [
        { value: 'mochilero', label: 'Mochilero, lo mínimo' },
        { value: 'casual', label: 'Casual' },
        { value: 'formal', label: 'Formal o con eventos' },
      ],
    },
    {
      id: 'aerolinea',
      label: 'Aerolínea',
      type: 'select',
      value: 'aerolineas-argentinas',
      options: [
        { value: 'aerolineas-argentinas', label: 'Aerolíneas Argentinas' },
        { value: 'latam', label: 'LATAM' },
        { value: 'flybondi', label: 'Flybondi' },
        { value: 'jetsmart', label: 'JetSMART' },
        { value: 'avianca', label: 'Avianca' },
        { value: 'copa', label: 'Copa Airlines' },
        { value: 'gol', label: 'GOL' },
        { value: 'azul', label: 'Azul' },
        { value: 'iberia', label: 'Iberia' },
        { value: 'air-europa', label: 'Air Europa' },
        { value: 'american', label: 'American Airlines' },
        { value: 'united', label: 'United' },
      ],
    },
    {
      id: 'cabina',
      label: 'Tarifa o cabina',
      type: 'select',
      value: 'estandar',
      options: [
        { value: 'basica', label: 'Económica básica o light' },
        { value: 'estandar', label: 'Económica estándar o full' },
        { value: 'premium', label: 'Premium Economy' },
        { value: 'business', label: 'Business o ejecutiva' },
      ],
      help: 'La franquicia la fija la tarifa exacta, no la cabina: revisá el detalle de equipaje de tu reserva.',
    },
    {
      id: 'ruta',
      label: 'Tipo de ruta',
      type: 'select',
      value: 'internacional',
      options: [
        { value: 'cabotaje', label: 'Cabotaje, dentro del país' },
        { value: 'regional', label: 'Regional, dentro de Sudamérica' },
        { value: 'internacional', label: 'Internacional de larga distancia' },
      ],
    },
    {
      id: 'pesoMaleta',
      label: 'Peso de tu valija despachada',
      type: 'number',
      suffix: 'kg',
      min: 0,
      max: 60,
      step: 0.5,
      value: 26,
      help: 'Pesala en casa con una balanza de mano. Poné 0 si todavía no la armaste.',
    },
    {
      id: 'momento',
      label: '¿Cuándo pagás el equipaje extra?',
      type: 'select',
      value: 'online',
      options: [
        { value: 'online', label: 'Online, junto con el pasaje' },
        { value: 'previo', label: 'Online, después de comprar el pasaje' },
        { value: 'mostrador', label: 'En el mostrador del aeropuerto' },
      ],
      help: 'Después del pasaje sale un 25 % más; en el mostrador, el doble.',
    },
    {
      id: 'pesoCorporal',
      label: 'Tu peso corporal',
      type: 'number',
      suffix: 'kg',
      min: 30,
      max: 200,
      step: 1,
      value: 72,
      help: 'Sólo para la mochila de trekking.',
    },
    {
      id: 'duracionTrek',
      label: 'Duración de la salida de trekking',
      type: 'select',
      value: 'semana',
      options: [
        { value: 'dia', label: 'Salida de un día' },
        { value: '2-3-dias', label: 'De dos a tres días' },
        { value: 'semana', label: 'Una semana' },
        { value: 'mas-semana', label: 'Más de una semana' },
      ],
    },
    {
      id: 'nivelTrek',
      label: 'Nivel y equipo de trekking',
      type: 'select',
      value: 'intermedio',
      options: [
        { value: 'principiante', label: 'Principiante, equipo pesado' },
        { value: 'intermedio', label: 'Intermedio' },
        { value: 'avanzado', label: 'Avanzado, equipo ultraliviano' },
      ],
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Las franquicias y las tarifas de exceso las publica cada aerolínea y cambian sin aviso: la tabla de este hub está revisada al 27 de julio de 2026 contra las páginas oficiales de equipaje y los importes van en dólares como orden de magnitud, no como el precio final que vas a pagar. El peso de la valija armada usa promedios de prenda de adulto y sirve para anticipar el bulto, no reemplaza a la balanza. El peso de mochila de trekking es orientativo y no es una indicación médica.',

  chart: {
    type: 'scale',
    title: 'Tus kilos sobre la escala',
    caption:
      'La barra siempre mide kilos, cualquiera sea la rama. En el armado de valija las franjas son la franquicia de tu tarifa y el marcador es el peso estimado de lo que empacaste. En franquicia, las franjas son el artículo personal, el equipaje de mano y el despachado incluidos, y el marcador es tu valija contra ese total. En sobrepeso, las franjas son la zona sin cargo, la zona con cargo por kilo y el rechazo por encima de los 32 kg. En la mochila de trekking, las franjas son carga liviana, óptima y sobrecarga sobre tu peso corporal.',
  },
  breakdownTitle: 'La cuenta, kilo por kilo',
  breakdownIntro:
    'De dónde sale cada número: las prendas y su peso en el armado, cada bulto incluido en la franquicia, y los kilos de exceso con su tarifa y su recargo en el sobrepeso.',

  faq: [
    {
      q: '¿Cuánta ropa llevo para un viaje de una semana?',
      a: 'Con clima templado y estilo casual, unas 6 remeras, 3 pantalones, 7 mudas de ropa interior, 5 pares de medias y 2 abrigos. Si vas a poder lavar, esa misma cantidad te sirve para un viaje de un mes: el cálculo topea en siete días de ropa y rota. Sin acceso a lavadero el tope está en catorce días, porque más que eso no entra en ninguna valija razonable.',
    },
    {
      q: '¿Cuánto pesa una valija armada para diez días?',
      a: 'Entre 14 y 18 kilos para clima templado, contando la valija vacía —unos 3,2 kg en una rígida mediana—, el neceser con cargadores y documentación, un calzado extra y la ropa. La ropa sola rara vez pasa de 8 kg; lo que llena la valija es todo lo demás. Con clima frío sumale entre 2 y 4 kg por los abrigos.',
    },
    {
      q: '¿Cuántos kilos puedo llevar en el equipaje de mano?',
      a: 'El estándar de referencia son 8 kg con medidas de 55×35×25 cm, pero varias aerolíneas lo suben a 10 y las estadounidenses no fijan tope de peso, sólo de medidas: si entra en el compartimento superior, viaja. En las tarifas básicas de low-cost y en varias tarifas base de cabotaje la valija de mano directamente no está incluida y sólo entra el artículo personal bajo el asiento.',
    },
    {
      q: '¿Cuánto pesa el límite de una valija despachada?',
      a: 'La pieza despachada incluida es de 23 kg en económica en la enorme mayoría de las rutas internacionales, y baja a 15 kg en varias tarifas de cabotaje. En Business suele ser de 32 kg por pieza y suelen ser dos piezas. Por encima de eso ninguna aerolínea acepta el bulto: 32 kg es un tope de seguridad para los operarios de rampa, no un cargo que se pueda pagar.',
    },
    {
      q: '¿Cuánto cuesta el kilo de exceso de equipaje?',
      a: 'Como orden de magnitud, entre 8 y 12 dólares por kilo en aerolíneas low-cost y entre 15 y 22 en aerolíneas de servicio completo, más caro en internacional que en cabotaje. Pero el precio real depende de cuándo lo pagues: comprándolo online junto con el pasaje pagás la tarifa base, agregándolo después un 25 % más y en el mostrador del aeropuerto, el doble.',
    },
    {
      q: '¿Conviene pagar sobrepeso o llevar una valija más?',
      a: 'Casi siempre conviene la segunda valija. El sobrepeso se cobra por kilo y crece sin techo, mientras que la pieza adicional se cobra a precio fijo. Con una tarifa de 20 dólares por kilo, cinco kilos de exceso ya cuestan 100 dólares, que es lo que suele salir una pieza entera de 23 kg agregada en el mostrador. Repartir el peso entre dos bultos también evita el rechazo por pasar los 32 kg.',
    },
    {
      q: '¿Qué pasa si mi valija pesa más de 32 kilos?',
      a: 'No te la despachan. No es un cargo que puedas pagar: es un límite de manipulación fijado por seguridad e higiene laboral para los operarios que cargan las bodegas a mano. En el mostrador te van a hacer abrir la valija y pasar cosas a otra pieza o al equipaje de mano ahí mismo, con la cola atrás. Por eso conviene pesar en casa.',
    },
    {
      q: '¿Qué son los 158 cm lineales de una valija?',
      a: 'Es la suma de largo más ancho más alto del bulto, y es el límite de dimensiones que aplica la mayoría de las aerolíneas al equipaje despachado. Una valija grande estándar de 75 cm de alto queda justo por debajo. Pasarse de esa suma genera un cargo por sobredimensionado que se cobra aparte del sobrepeso: si te pasás en las dos cosas, pagás las dos.',
    },
    {
      q: '¿Por qué mi tarifa no incluye valija si es la misma aerolínea de siempre?',
      a: 'Porque dentro de una misma cabina conviven varias sub-tarifas —Basic, Light, Promo, Plus, Full— con franquicias distintas, y las buscadoras muestran por defecto la más barata. En cabotaje argentino, además, varias tarifas base pasaron a incluir sólo el artículo personal bajo el asiento. El nombre de la cabina no alcanza: hay que mirar el detalle de equipaje de la reserva.',
    },
    {
      q: '¿Qué es el artículo personal y en qué se diferencia del equipaje de mano?',
      a: 'El artículo personal es el bulto chico que va debajo del asiento de adelante: una mochila, un bolso o una cartera, típicamente de 40×30×20 cm. El equipaje de mano es la valijita de cabina que va en el compartimento superior, de unos 55×35×25 cm. En las tarifas más básicas viaja sólo el primero, y es la diferencia que más discusiones genera en la puerta de embarque.',
    },
    {
      q: '¿Se suman las franquicias si viajo con dos billetes separados?',
      a: 'No. Con dos billetes separados cada tramo aplica su propia franquicia, el equipaje no viaja facturado hasta el destino final y en la escala tenés que retirarlo, volver a despacharlo y volver a pasar el control de peso. Si el segundo tramo tiene una franquicia menor que el primero, ahí te van a cobrar el exceso aunque en el vuelo anterior no hubiera problema.',
    },
    {
      q: '¿Cuánto peso puedo cargar en una mochila de trekking?',
      a: 'La referencia clásica es el 20 % del peso corporal para una travesía de varios días y el 10 % para una salida de un día, siempre contando la mochila cargada completa con agua, comida y bolsa de dormir. El porcentaje se ajusta por equipo: un principiante con equipo pesado suele estar tres puntos arriba y alguien con equipo ultraliviano, cuatro puntos abajo. Es una cuestión de espalda, no de aerolínea.',
    },
  ],

  sources: [
    {
      name: 'Resolución 302 — normas de equipaje y cargos por exceso entre aerolíneas',
      url: 'https://www.iata.org/en/programs/ops-infra/baggage/',
      publisher: 'IATA — Asociación Internacional de Transporte Aéreo',
    },
    {
      name: 'Equipaje: franquicias, medidas y cargos',
      url: 'https://www.aerolineas.com.ar/es-ar/equipajes',
      publisher: 'Aerolíneas Argentinas',
    },
    {
      name: 'Equipaje permitido por tarifa y ruta',
      url: 'https://www.latamairlines.com/ar/es/centro-de-ayuda/equipaje',
      publisher: 'LATAM Airlines',
    },
    {
      name: 'Equipaje y servicios adicionales',
      url: 'https://flybondi.com/ar/equipaje',
      publisher: 'Flybondi',
    },
    {
      name: 'Equipaje: artículo personal, de mano y bodega',
      url: 'https://jetsmart.com/ar/es/equipaje',
      publisher: 'JetSMART',
    },
    {
      name: 'Derechos del pasajero aéreo y condiciones de transporte de equipaje',
      url: 'https://www.argentina.gob.ar/anac/pasajeros',
      publisher: 'ANAC — Administración Nacional de Aviación Civil',
    },
    {
      name: 'Baggage fees and airline reporting — cargos por equipaje declarados por las aerolíneas',
      url: 'https://www.transportation.gov/individuals/aviation-consumer-protection/baggage',
      publisher: 'U.S. Department of Transportation',
    },
    {
      name: 'Manual handling: límite de 32 kg por bulto en la manipulación de equipaje',
      url: 'https://www.hse.gov.uk/msd/manual-handling/index.htm',
      publisher: 'HSE — Health and Safety Executive, Reino Unido',
    },
  ],

  replaces: [
    '/calculadora-ropa-maleta-dias-viaje',
    '/calculadora-equipaje-vuelo-kg-lb-limites',
    '/calculadora-maletas-peso-aerolineas-low-cost-premium',
    '/calculadora-peso-mochila-ideal-trekking-senderismo',
    '/calculadora-equipaje-extra-costo-aerolinea',
    '/calculadora-equipaje-peso-sobrepeso-coste-por-kilo',
    '/calculadora-equipaje-mano-bodega-peso-volumen-aerolinea',
    '/calculadora-equipaje-permitido-franquicia-aerolinea',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
