/**
 * ¿Cuánto equipaje permite cada aerolínea?
 * Franquicia de equipaje PERMITIDA (allowance) por aerolínea, cabina y ruta.
 *
 * A diferencia de equipaje-extra-costo-aerolinea (que calcula el COSTO del exceso),
 * este calc responde "¿cuánto puedo llevar?": artículo personal + equipaje de mano +
 * equipaje despachado incluido, según la tarifa (cabina) y la ruta.
 *
 * Datos verificados 2026 contra las páginas oficiales de equipaje de cada aerolínea.
 * Estándares de referencia: IATA carry-on 8 kg / 55×40×23 cm; económica internacional
 * 1 pieza de 23 kg despachada; low-cost tarifa básica = solo artículo personal.
 */

export interface EquipajePermitidoFranquiciaAerolineaInputs {
  aerolinea: string;
  cabina: string;
  ruta: string;
}

export interface EquipajePermitidoFranquiciaAerolineaOutputs {
  equipajeMano: string;
  articuloPersonal: string;
  despachadoIncluido: string;
  pesoMaxPieza: string;
  _insight?: any;
  _table?: any;
  _note?: string;
}

type Ruta = 'cabotaje' | 'regional' | 'internacional';
type Cabina = 'basica' | 'estandar' | 'premium' | 'business';

// Allowance "resuelta" para una combinación aerolínea×cabina×ruta.
interface Allowance {
  // Equipaje de mano (carry-on que va en el compartimento superior).
  manoKg: number | null; // null = no incluido (se paga aparte)
  manoDim: string; // dimensiones del carry-on
  // Artículo personal / mochila bajo el asiento.
  personalKg: number | null; // null = no especifica peso (solo dimensión)
  personalDim: string;
  // Equipaje despachado incluido.
  despachadoPiezas: number; // 0 = no incluido
  despachadoKg: number; // peso por pieza despachada (límite)
  // Peso máximo aceptado por pieza despachada (tope físico de rampa).
  topePiezaKg: number;
  // ¿Es low-cost? (cambia la narrativa).
  lowcost: boolean;
}

const KG = (n: number) => `${n} kg`;

// Dimensiones estándar reutilizables.
const DIM_MANO = '55×35×25 cm';
const DIM_MANO_INTL = '55×40×23 cm';
const DIM_PERSONAL = '40×30×20 cm';
const DIM_PERSONAL_LOWCOST = '45×35×25 cm';

/**
 * Tabla maestra de franquicias 2026.
 * Para cada aerolínea definimos la allowance por cabina y, donde la ruta cambia
 * la franquicia (típico en económica), un override por ruta.
 */
interface AirlineSpec {
  label: string;
  lowcost: boolean;
  // Allowance por cabina. La económica básica/estándar puede variar por ruta.
  basica: (ruta: Ruta) => Allowance;
  estandar: (ruta: Ruta) => Allowance;
  premium: (ruta: Ruta) => Allowance;
  business: (ruta: Ruta) => Allowance;
}

// Helpers para construir allowances comunes (menos repetición).
function carryOnSolo(opts: {
  manoKg: number;
  manoDim?: string;
  personalDim?: string;
  lowcost?: boolean;
}): Allowance {
  return {
    manoKg: opts.manoKg,
    manoDim: opts.manoDim ?? DIM_MANO,
    personalKg: null,
    personalDim: opts.personalDim ?? DIM_PERSONAL,
    despachadoPiezas: 0,
    despachadoKg: 23,
    topePiezaKg: 32,
    lowcost: opts.lowcost ?? false,
  };
}

function soloPersonal(opts: {
  personalKg: number;
  personalDim?: string;
  lowcost?: boolean;
}): Allowance {
  return {
    manoKg: null,
    manoDim: DIM_MANO,
    personalKg: opts.personalKg,
    personalDim: opts.personalDim ?? DIM_PERSONAL_LOWCOST,
    despachadoPiezas: 0,
    despachadoKg: 23,
    topePiezaKg: 23,
    lowcost: opts.lowcost ?? true,
  };
}

function conDespachado(opts: {
  manoKg: number;
  manoDim?: string;
  personalKg?: number | null;
  piezas: number;
  despachadoKg?: number;
  topePiezaKg?: number;
  lowcost?: boolean;
}): Allowance {
  return {
    manoKg: opts.manoKg,
    manoDim: opts.manoDim ?? DIM_MANO,
    personalKg: opts.personalKg ?? null,
    personalDim: DIM_PERSONAL,
    despachadoPiezas: opts.piezas,
    despachadoKg: opts.despachadoKg ?? 23,
    topePiezaKg: opts.topePiezaKg ?? 32,
    lowcost: opts.lowcost ?? false,
  };
}

const AIRLINES: Record<string, AirlineSpec> = {
  // ---- Aerolíneas tradicionales AR / LATAM ----
  'aerolineas-argentinas': {
    label: 'Aerolíneas Argentinas',
    lowcost: false,
    // Desde mayo 2026: tarifa base cabotaje = SOLO artículo personal 3 kg (carry-on se paga).
    // Internacional mantiene carry-on + 1 pieza despachada.
    basica: (r) =>
      r === 'cabotaje'
        ? soloPersonal({ personalKg: 3, personalDim: DIM_PERSONAL, lowcost: false })
        : conDespachado({ manoKg: 10, manoDim: DIM_MANO, personalKg: 3, piezas: 1, despachadoKg: 23 }),
    estandar: (r) =>
      r === 'cabotaje'
        ? conDespachado({ manoKg: 8, personalKg: 3, piezas: 1, despachadoKg: 15 })
        : conDespachado({ manoKg: 10, personalKg: 3, piezas: 1, despachadoKg: 23 }),
    premium: (r) =>
      conDespachado({ manoKg: 12, personalKg: 3, piezas: r === 'cabotaje' ? 1 : 2, despachadoKg: r === 'cabotaje' ? 15 : 23 }),
    business: () => conDespachado({ manoKg: 14, personalKg: 5, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  latam: {
    label: 'LATAM',
    lowcost: false,
    // Basic/Light = solo personal; Plus+ incluye 1×23 kg. Internacional Plus = 1 pieza.
    basica: () => soloPersonal({ personalKg: 10, personalDim: '45×35×25 cm', lowcost: false }),
    estandar: (r) =>
      r === 'cabotaje'
        ? conDespachado({ manoKg: 10, personalKg: 10, piezas: 1, despachadoKg: 23 })
        : conDespachado({ manoKg: 10, manoDim: DIM_MANO_INTL, personalKg: 10, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, personalKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 16, personalKg: 10, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  // ---- Low-cost ----
  flybondi: {
    label: 'Flybondi',
    lowcost: true,
    // Tarifa básica = SOLO 1 artículo personal (6 kg cabotaje, 10 kg a Brasil). Mano y bodega pagas.
    basica: (r) =>
      soloPersonal({ personalKg: r === 'cabotaje' ? 6 : 10, personalDim: '30×40×20 cm', lowcost: true }),
    estandar: (r) =>
      // "Estándar" en low-cost ≈ tarifa con carry-on agregado (combo). Bodega sigue pagándose.
      carryOnSolo({ manoKg: 10, manoDim: DIM_MANO, personalDim: '30×40×20 cm', lowcost: true }),
    premium: () => carryOnSolo({ manoKg: 10, lowcost: true }),
    // Flybondi no opera Business; lo mapeamos a "combo full" con 1 bodega de 23 kg agregada.
    business: () => conDespachado({ manoKg: 10, personalKg: 10, piezas: 1, despachadoKg: 23, topePiezaKg: 23, lowcost: true }),
  },
  jetsmart: {
    label: 'JetSMART',
    lowcost: true,
    basica: () => soloPersonal({ personalKg: 10, personalDim: '45×35×25 cm', lowcost: true }),
    estandar: () => carryOnSolo({ manoKg: 10, manoDim: DIM_MANO, personalDim: '45×35×25 cm', lowcost: true }),
    premium: () => carryOnSolo({ manoKg: 10, lowcost: true }),
    business: () => conDespachado({ manoKg: 10, personalKg: 10, piezas: 1, despachadoKg: 23, topePiezaKg: 23, lowcost: true }),
  },
  // ---- Regionales LATAM ----
  avianca: {
    label: 'Avianca',
    lowcost: false,
    // Light internacional (desde ene-2026) incluye 10 kg carry-on; Light = 0 bodega.
    basica: (r) =>
      r === 'cabotaje'
        ? soloPersonal({ personalKg: 10, personalDim: '45×35×25 cm', lowcost: false })
        : carryOnSolo({ manoKg: 10, manoDim: DIM_MANO_INTL, personalDim: '45×35×25 cm', lowcost: false }),
    estandar: (r) =>
      conDespachado({ manoKg: 10, manoDim: r === 'internacional' ? DIM_MANO_INTL : DIM_MANO, personalKg: null, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 18, personalKg: null, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  copa: {
    label: 'Copa Airlines',
    lowcost: false,
    // Copa Economy incluye 1×23 kg despachado en la mayoría de las rutas (tradicional).
    basica: (r) =>
      r === 'cabotaje'
        ? carryOnSolo({ manoKg: 10, lowcost: false })
        : conDespachado({ manoKg: 10, manoDim: DIM_MANO_INTL, piezas: 1, despachadoKg: 23 }),
    estandar: () => conDespachado({ manoKg: 10, manoDim: DIM_MANO_INTL, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 16, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  // ---- Brasil ----
  gol: {
    label: 'GOL',
    lowcost: false,
    // ANAC Res. 400: carry-on 10 kg gratis para todos. Bodega por tarifa.
    basica: (r) =>
      carryOnSolo({ manoKg: 10, manoDim: DIM_MANO, lowcost: false }),
    estandar: (r) =>
      conDespachado({ manoKg: 10, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 16, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  azul: {
    label: 'Azul',
    lowcost: false,
    basica: () => carryOnSolo({ manoKg: 10, manoDim: DIM_MANO, lowcost: false }),
    estandar: () => conDespachado({ manoKg: 10, piezas: 1, despachadoKg: 23 }),
    premium: (r) => conDespachado({ manoKg: 10, piezas: r === 'internacional' ? 2 : 1, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 16, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  // ---- Majors internacionales ----
  american: {
    label: 'American Airlines',
    lowcost: false,
    // Basic Economy a Sudamérica permite carry-on. Main Cabin internacional a Sudamérica
    // suele incluir 1 pieza despachada; doméstico USA se paga.
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
  iberia: {
    label: 'Iberia',
    lowcost: false,
    // Basic/Light ya NO incluye despachado ni en larga distancia. Carry-on 10 kg disponible.
    basica: () => carryOnSolo({ manoKg: 10, manoDim: '56×40×25 cm', personalDim: '40×30×15 cm', lowcost: false }),
    estandar: () => conDespachado({ manoKg: 10, manoDim: '56×40×25 cm', piezas: 1, despachadoKg: 23 }),
    premium: () => conDespachado({ manoKg: 10, manoDim: '56×40×25 cm', piezas: 2, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 14, manoDim: '56×40×25 cm', piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  'air-europa': {
    label: 'Air Europa',
    lowcost: false,
    // Tarifa Basic incluye 1×23 kg despachado en internacional + 10 kg carry-on.
    basica: (r) =>
      r === 'internacional'
        ? conDespachado({ manoKg: 10, piezas: 1, despachadoKg: 23 })
        : carryOnSolo({ manoKg: 10, lowcost: false }),
    estandar: () => conDespachado({ manoKg: 10, piezas: 1, despachadoKg: 23 }),
    premium: () => conDespachado({ manoKg: 10, piezas: 2, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 14, piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
  united: {
    label: 'United',
    lowcost: false,
    // Basic Economy a Sudamérica = carry-on permitido (excepción), despachado se paga.
    basica: (r) =>
      r === 'internacional'
        ? carryOnSolo({ manoKg: 0, manoDim: '56×35×23 cm', lowcost: false })
        : soloPersonal({ personalKg: null as any, personalDim: '43×25×22 cm', lowcost: false }),
    estandar: (r) =>
      r === 'internacional'
        ? conDespachado({ manoKg: 0, manoDim: '56×35×23 cm', piezas: 1, despachadoKg: 23 })
        : carryOnSolo({ manoKg: 0, manoDim: '56×35×23 cm', lowcost: false }),
    premium: () => conDespachado({ manoKg: 0, manoDim: '56×35×23 cm', piezas: 2, despachadoKg: 23 }),
    business: () => conDespachado({ manoKg: 0, manoDim: '56×35×23 cm', piezas: 2, despachadoKg: 32, topePiezaKg: 32 }),
  },
};

const CABINA_LABEL: Record<Cabina, string> = {
  basica: 'económica básica/light',
  estandar: 'económica estándar/full',
  premium: 'Premium Economy',
  business: 'Business/Ejecutiva',
};

const RUTA_LABEL: Record<Ruta, string> = {
  cabotaje: 'cabotaje',
  regional: 'regional (Sudamérica)',
  internacional: 'internacional (larga distancia)',
};

function resolve(spec: AirlineSpec, cabina: Cabina, ruta: Ruta): Allowance {
  return spec[cabina](ruta);
}

function fmtMano(a: Allowance): string {
  if (a.manoKg === null) {
    return `No incluido en esta tarifa (se paga aparte) · ${a.manoDim}`;
  }
  if (a.manoKg === 0) {
    return `Sí · ${a.manoDim} (sin límite de peso)`;
  }
  return `${KG(a.manoKg)} · ${a.manoDim}`;
}

function fmtPersonal(a: Allowance): string {
  if (a.personalKg === null) {
    return `Sí · ${a.personalDim}`;
  }
  return `${KG(a.personalKg)} · ${a.personalDim}`;
}

function fmtDespachado(a: Allowance): string {
  if (a.despachadoPiezas === 0) {
    if (a.lowcost) {
      return 'No incluido (low-cost): se paga aparte';
    }
    return 'No incluido en esta tarifa: se paga aparte';
  }
  if (a.despachadoPiezas === 1) {
    return `1 pieza de ${a.despachadoKg} kg`;
  }
  return `${a.despachadoPiezas} piezas de ${a.despachadoKg} kg`;
}

function fmtTope(a: Allowance): string {
  if (a.despachadoPiezas === 0) {
    return `Hasta ${a.topePiezaKg} kg por pieza si agregás bodega (extra paga)`;
  }
  const extra =
    a.despachadoKg < a.topePiezaKg
      ? `. Podés sumar piezas extra (con cargo) y cada bulto admite hasta ${a.topePiezaKg} kg`
      : `. Piezas extra disponibles con cargo`;
  return `${a.topePiezaKg} kg por pieza (tope físico de rampa)${extra}`;
}

export function equipajePermitidoFranquiciaAerolinea(
  inputs: EquipajePermitidoFranquiciaAerolineaInputs,
): EquipajePermitidoFranquiciaAerolineaOutputs {
  const spec = AIRLINES[inputs.aerolinea] ?? AIRLINES['aerolineas-argentinas'];
  // Aceptamos varios alias para el valor de cabina (los field-values del JSON usan
  // "economica-light"/"economica-full"; aliases para robustez ante variantes).
  const cabinaAlias: Record<string, Cabina> = {
    'economica-light': 'basica',
    'economica-basica': 'basica',
    basica: 'basica',
    light: 'basica',
    'economica-full': 'estandar',
    'economica-estandar': 'estandar',
    estandar: 'estandar',
    full: 'estandar',
    'premium-economy': 'premium',
    premium: 'premium',
    business: 'business',
    ejecutiva: 'business',
  };
  const cabina = (cabinaAlias[inputs.cabina] ?? 'estandar') as Cabina;
  const ruta = (['cabotaje', 'regional', 'internacional'].includes(inputs.ruta)
    ? inputs.ruta
    : 'internacional') as Ruta;

  const a = resolve(spec, cabina, ruta);

  const equipajeMano = fmtMano(a);
  const articuloPersonal = fmtPersonal(a);
  const despachadoIncluido = fmtDespachado(a);
  const pesoMaxPieza = fmtTope(a);

  // ----- Narrativa (_insight) -----
  const manoTxt =
    a.manoKg === null
      ? 'la valija de mano se paga aparte'
      : a.manoKg === 0
      ? `llevás equipaje de mano (${a.manoDim}, sin tope de peso)`
      : `llevás ${a.manoKg} kg de mano`;
  const despTxt =
    a.despachadoPiezas === 0
      ? 'sin valija despachada incluida'
      : a.despachadoPiezas === 1
      ? `+ 1 valija de ${a.despachadoKg} kg despachada`
      : `+ ${a.despachadoPiezas} valijas de ${a.despachadoKg} kg despachadas`;

  let insightText: string;
  let tone: string;
  if (a.lowcost && a.despachadoPiezas === 0 && a.manoKg === null) {
    insightText = `En **${spec.label} ${CABINA_LABEL[cabina]}** (${RUTA_LABEL[ruta]}) la tarifa básica **SOLO incluye un artículo personal** (${a.personalDim}${a.personalKg ? `, hasta ${a.personalKg} kg` : ''}) que va bajo el asiento. **La valija de mano y la despachada se pagan aparte.** Es el modelo clásico de low-cost: el pasaje barato, todo lo demás opcional. Comprá el equipaje extra **online al sacar el ticket** (en el mostrador cuesta hasta el doble).`;
    tone = 'warn';
  } else if (a.despachadoPiezas === 0 && a.manoKg === null) {
    // Tradicional con tarifa muy básica: solo artículo personal (ej. LATAM/Aerolíneas base cabotaje).
    insightText = `En **${spec.label} ${CABINA_LABEL[cabina]}** (${RUTA_LABEL[ruta]}) esta tarifa incluye **solo el artículo personal** (${a.personalDim}${a.personalKg ? `, hasta ${a.personalKg} kg` : ''}): la valija de mano y la despachada **se pagan aparte**. Subiendo a la tarifa estándar/full normalmente sumás el carry-on y 1 valija de ${a.despachadoKg} kg. Si igual vas a despachar, agregá el equipaje **online** (en el mostrador cuesta más).`;
    tone = 'neutral';
  } else if (a.despachadoPiezas === 0 && a.manoKg !== null) {
    insightText = `En **${spec.label} ${CABINA_LABEL[cabina]}** (${RUTA_LABEL[ruta]}) ${manoTxt} + artículo personal, pero **esta tarifa no incluye valija despachada**: si necesitás bodega, la pagás aparte (más barato online que en el aeropuerto). Subiendo a la tarifa estándar/full normalmente sumás 1 pieza de ${a.despachadoKg} kg sin cargo.`;
    tone = 'neutral';
  } else {
    insightText = `En **${spec.label} ${CABINA_LABEL[cabina]}** (${RUTA_LABEL[ruta]}) ${manoTxt} ${despTxt}. ${
      a.despachadoPiezas >= 2
        ? 'Llevás 2 valijas despachadas: ideal para mudanzas, compras grandes o viajes largos.'
        : 'Si necesitás más bodega, podés sumar piezas extra con cargo.'
    } Recordá que el peso y las medidas se controlan **a la vez**: pasarte en cualquiera de los dos genera cargo.`;
    tone = 'good';
  }

  const _insight = {
    title: a.lowcost && a.despachadoPiezas === 0 ? 'Ojo con la tarifa básica' : 'Tu franquicia de equipaje',
    text: insightText,
    tone,
    icon: '🧳',
  };

  // ----- Tabla comparativa: MISMA cabina+ruta across aerolíneas -----
  const compareOrder = [
    'aerolineas-argentinas',
    'latam',
    'flybondi',
    'jetsmart',
    'avianca',
    'copa',
    'gol',
    'iberia',
    'air-europa',
    'american',
    'united',
    'azul',
  ];
  const rows = compareOrder.map((key) => {
    const s = AIRLINES[key];
    const al = resolve(s, cabina, ruta);
    const mano = al.manoKg === null ? 'Se paga' : al.manoKg === 0 ? 'Sí (s/peso)' : `${al.manoKg} kg`;
    const desp =
      al.despachadoPiezas === 0
        ? 'No incluida'
        : `${al.despachadoPiezas}×${al.despachadoKg} kg`;
    return [s.label, mano, desp];
  });

  const _table = {
    title: `Franquicia ${CABINA_LABEL[cabina]} · ${RUTA_LABEL[ruta]} — ¿cuál te deja llevar más?`,
    headers: ['Aerolínea', 'Equipaje de mano', 'Despachado incluido'],
    rows,
    note: 'Comparativa de la MISMA cabina y ruta entre aerolíneas. «Se paga» = no incluido en esa tarifa. Datos 2026 de las páginas oficiales de equipaje; verificá las condiciones de TU tarifa antes de volar.',
  };

  const _note =
    a.manoKg === 0
      ? 'American y United no fijan un límite de peso para el equipaje de mano, pero sí de dimensiones: tiene que entrar en el compartimento superior.'
      : a.lowcost
      ? 'En low-cost, comprar el equipaje junto con el pasaje es siempre lo más barato; en el mostrador del aeropuerto puede costar hasta el doble.'
      : 'La franquicia depende de la tarifa exacta que compraste (Basic, Light, Plus, Full…). Verificá tu reserva: dentro de la misma cabina puede haber sub-tarifas con distinta bodega.';

  return {
    equipajeMano,
    articuloPersonal,
    despachadoIncluido,
    pesoMaxPieza,
    _insight,
    _table,
    _note,
  };
}
