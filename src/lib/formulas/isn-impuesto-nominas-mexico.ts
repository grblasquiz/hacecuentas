// Calculadora del Impuesto Sobre Nóminas (ISN) por Estado - México 2026
// El ISN es un impuesto estatal a cargo del patrón, calculado sobre el total
// de erogaciones por remuneraciones al trabajo personal subordinado.
// Fuente: Códigos Financieros y Leyes de Ingresos estatales 2026.

export interface Inputs {
  estado: string;
  totalNominaMensual: number;
}

export interface Outputs {
  isnAPagar: number;
  alicuota: string;
  isnAnual: number;
  detalle: string;
}

// Tabla de alícuotas ISN 2026 por estado (en porcentaje)
// Fuente: Códigos Financieros estatales y Leyes de Ingresos vigentes 2026
const ALICUOTAS_ISN_2026: Record<string, { tasa: number; nombre: string }> = {
  CDMX:   { tasa: 0.030, nombre: "Ciudad de México" },
  EDOMEX: { tasa: 0.030, nombre: "Estado de México" },
  JAL:    { tasa: 0.020, nombre: "Jalisco" },
  NL:     { tasa: 0.030, nombre: "Nuevo León" },
  PUE:    { tasa: 0.030, nombre: "Puebla" },
  GTO:    { tasa: 0.020, nombre: "Guanajuato" },
  QRO:    { tasa: 0.025, nombre: "Querétaro" },
  VER:    { tasa: 0.030, nombre: "Veracruz" },
  YUC:    { tasa: 0.025, nombre: "Yucatán" },
  BC:     { tasa: 0.018, nombre: "Baja California" },
  CHIH:   { tasa: 0.030, nombre: "Chihuahua" },
  COAH:   { tasa: 0.020, nombre: "Coahuila" },
  SLP:    { tasa: 0.025, nombre: "San Luis Potosí" },
  TAB:    { tasa: 0.025, nombre: "Tabasco" },
  SIN:    { tasa: 0.024, nombre: "Sinaloa" },
  SON:    { tasa: 0.020, nombre: "Sonora" },
  MICH:   { tasa: 0.030, nombre: "Michoacán" },
  OAX:    { tasa: 0.030, nombre: "Oaxaca" },
  GRO:    { tasa: 0.020, nombre: "Guerrero" },
  CHIS:   { tasa: 0.020, nombre: "Chiapas" },
  MOR:    { tasa: 0.020, nombre: "Morelos" },
  HGO:    { tasa: 0.025, nombre: "Hidalgo" },
  AGS:    { tasa: 0.015, nombre: "Aguascalientes" },
  DGO:    { tasa: 0.020, nombre: "Durango" },
  ZAC:    { tasa: 0.025, nombre: "Zacatecas" },
  BCS:    { tasa: 0.025, nombre: "Baja California Sur" },
  CAMP:   { tasa: 0.030, nombre: "Campeche" },
  COL:    { tasa: 0.020, nombre: "Colima" },
  NAY:    { tasa: 0.020, nombre: "Nayarit" },
  QROO:   { tasa: 0.030, nombre: "Quintana Roo" },
  TAMP:   { tasa: 0.030, nombre: "Tamaulipas" },
  TLAX:   { tasa: 0.030, nombre: "Tlaxcala" },
};

function formatPct(tasa: number): string {
  // Convierte 0.025 -> "2.5%"
  const pct = tasa * 100;
  // Eliminar decimales innecesarios (3.0 -> 3, 2.5 -> 2.5)
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

  const cfg = ALICUOTAS_ISN_2026[estado];
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

  return {
    isnAPagar: Math.round(isnAPagar * 100) / 100,
    alicuota: alicuotaTexto,
    isnAnual: Math.round(isnAnual * 100) / 100,
    detalle,
  };
}
