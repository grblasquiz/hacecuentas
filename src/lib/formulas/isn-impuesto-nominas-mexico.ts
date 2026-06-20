// Calculadora del Impuesto Sobre Nóminas (ISN) por Estado - México 2026
// El ISN es un impuesto estatal a cargo del patrón, calculado sobre el total
// de erogaciones por remuneraciones al trabajo personal subordinado.
// Las alícuotas salen de la tabla maestra única src/lib/data/mexico-2026.ts
// (MEXICO_2026.isnPorEstado), verificada contra las leyes de hacienda estatales 2026.

import { MEXICO_2026 } from "../data/mexico-2026";

export interface Inputs {
  estado: string;
  totalNominaMensual: number;
}

export interface Outputs {
  isnAPagar: number;
  alicuota: string;
  isnAnual: number;
  detalle: string;
  _insight?: any;
}

// Mapeo de la clave corta del selector (UI) al nombre canónico usado en
// MEXICO_2026.isnPorEstado. Las tasas NO se hardcodean acá: se leen de la
// tabla maestra para evitar drift entre la fórmula y la fuente única.
const ESTADO_KEY_A_NOMBRE: Record<string, string> = {
  CDMX:   "CDMX",
  EDOMEX: "Estado de México",
  JAL:    "Jalisco",
  NL:     "Nuevo León",
  PUE:    "Puebla",
  GTO:    "Guanajuato",
  QRO:    "Querétaro",
  VER:    "Veracruz",
  YUC:    "Yucatán",
  BC:     "Baja California",
  CHIH:   "Chihuahua",
  COAH:   "Coahuila",
  SLP:    "San Luis Potosí",
  TAB:    "Tabasco",
  SIN:    "Sinaloa",
  SON:    "Sonora",
  MICH:   "Michoacán",
  OAX:    "Oaxaca",
  GRO:    "Guerrero",
  CHIS:   "Chiapas",
  MOR:    "Morelos",
  HGO:    "Hidalgo",
  AGS:    "Aguascalientes",
  DGO:    "Durango",
  ZAC:    "Zacatecas",
  BCS:    "Baja California Sur",
  CAMP:   "Campeche",
  COL:    "Colima",
  NAY:    "Nayarit",
  QROO:   "Quintana Roo",
  TAMP:   "Tamaulipas",
  TLAX:   "Tlaxcala",
};

// Nombre "bonito" para mostrar (la mayoría coincide con el canónico, salvo CDMX).
const NOMBRE_DISPLAY: Record<string, string> = {
  CDMX: "Ciudad de México",
};

function tasaDeEstado(estadoKey: string): { tasa: number; nombre: string } | null {
  const nombre = ESTADO_KEY_A_NOMBRE[estadoKey];
  if (!nombre) return null;
  const tasa = MEXICO_2026.isnPorEstado[nombre];
  if (typeof tasa !== "number") return null;
  return { tasa, nombre: NOMBRE_DISPLAY[estadoKey] ?? nombre };
}

function formatPct(tasa: number): string {
  // Convierte 0.025 -> "2.5%", 0.04 -> "4%", 0.0425 -> "4.25%"
  const pct = tasa * 100;
  // Eliminar decimales innecesarios (4.0 -> 4, 2.5 -> 2.5, 4.25 -> 4.25)
  const str = pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(2).replace(/\.?0+$/, "");
  return `${str}%`;
}

function formatMXN(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function isnImpuestoNominasMexico(inputs: Inputs): Outputs {
  const { estado, totalNominaMensual } = inputs;

  // Validaciones
  if (!estado || typeof estado !== "string") {
    throw new Error("Debe seleccionar un estado válido.");
  }

  const cfg = tasaDeEstado(estado);
  if (!cfg) {
    throw new Error(`Estado no reconocido: ${estado}.`);
  }

  if (typeof totalNominaMensual !== "number" || isNaN(totalNominaMensual)) {
    throw new Error("El total de nómina mensual debe ser un número válido.");
  }

  if (totalNominaMensual < 0) {
    throw new Error("El total de nómina mensual no puede ser negativo.");
  }

  // Cálculo principal
  const isnAPagar = totalNominaMensual * cfg.tasa;
  const isnAnual = isnAPagar * 12;
  const alicuotaTexto = formatPct(cfg.tasa);

  const detalle =
    `${cfg.nombre} aplica una alícuota del ${alicuotaTexto} sobre el total ` +
    `de nómina gravable. ISN mensual: ${formatMXN(isnAPagar)}. ` +
    `Anualizado: ${formatMXN(isnAnual)}. ` +
    `Recordá: lo paga el patrón (no se retiene al trabajador) y se entera ` +
    `dentro de los primeros 17 días del mes siguiente. Es deducible para ISR federal.`;

  const _insight = {
    title: `ISN en ${cfg.nombre}`,
    text: totalNominaMensual > 0
      ? `Con una alícuota del **${alicuotaTexto}**, tu nómina de ${formatMXN(totalNominaMensual)} genera **${formatMXN(isnAPagar)}** de ISN al mes (**${formatMXN(isnAnual)}** al año). Lo paga el patrón, pero es **deducible de ISR**, así que el costo neto baja en torno a un tercio.`
      : `${cfg.nombre} aplica una alícuota del **${alicuotaTexto}** sobre la nómina. Ingresá el total de erogaciones para ver cuánto ISN se entera cada mes.`,
    tone: (cfg.tasa >= 0.03 ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '🇲🇽',
  };

  return {
    isnAPagar: Math.round(isnAPagar * 100) / 100,
    alicuota: alicuotaTexto,
    isnAnual: Math.round(isnAnual * 100) / 100,
    detalle,
    _insight,
  };
}
