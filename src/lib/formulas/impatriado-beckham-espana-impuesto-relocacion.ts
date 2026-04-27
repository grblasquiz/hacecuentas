export interface Inputs {
  salario: number;
  bono: number;
  comunidad: string;
}

export interface Outputs {
  totalBruto: number;
  cuotaBeckham: number;
  tipoBeckham: number;
  cuotaIRPF: number;
  tipoIRPF: number;
  ahorroAnual: number;
  ahorro6anos: number;
  detalle: string;
}

// ---------------------------------------------------------------------------
// Constantes Régimen Beckham (art. 93 Ley 35/2006 IRPF) — vigentes 2026
// ---------------------------------------------------------------------------
const BECKHAM_TIPO_BASE = 0.24;   // 24 % hasta 600.000 €
const BECKHAM_TIPO_ALTO = 0.47;   // 47 % sobre el exceso de 600.000 €
const BECKHAM_UMBRAL    = 600_000;

// ---------------------------------------------------------------------------
// Escala estatal IRPF 2026 (tramos acumulativos)
// Fuente: AEAT — Ley 35/2006 con actualizaciones presupuestarias
// ---------------------------------------------------------------------------
const TRAMOS_ESTATALES: Array<{ hasta: number; tipo: number }> = [
  { hasta: 12_450,   tipo: 0.095 },
  { hasta: 20_200,   tipo: 0.120 },
  { hasta: 35_200,   tipo: 0.150 },
  { hasta: 60_000,   tipo: 0.185 },
  { hasta: 300_000,  tipo: 0.225 },
  { hasta: Infinity, tipo: 0.245 },
];

// ---------------------------------------------------------------------------
// Escala autonómica estimada 2026 por comunidad
// Solo aplica al cálculo IRPF normal (en Beckham no hay tramo autonómico)
// ---------------------------------------------------------------------------
type TramosCC = Array<{ hasta: number; tipo: number }>;

const TRAMOS_AUTONOMICOS: Record<string, TramosCC> = {
  madrid: [
    { hasta: 12_450,   tipo: 0.090 },
    { hasta: 17_707,   tipo: 0.112 },
    { hasta: 33_007,   tipo: 0.136 },
    { hasta: 53_407,   tipo: 0.179 },
    { hasta: Infinity, tipo: 0.205 },
  ],
  cataluna: [
    { hasta: 12_450,   tipo: 0.105 },
    { hasta: 17_707,   tipo: 0.120 },
    { hasta: 21_000,   tipo: 0.140 },
    { hasta: 33_007,   tipo: 0.155 },
    { hasta: 53_407,   tipo: 0.185 },
    { hasta: 90_000,   tipo: 0.215 },
    { hasta: 120_000,  tipo: 0.235 },
    { hasta: 175_000,  tipo: 0.245 },
    { hasta: Infinity, tipo: 0.250 },
  ],
  valencia: [
    { hasta: 12_450,   tipo: 0.100 },
    { hasta: 17_707,   tipo: 0.118 },
    { hasta: 33_007,   tipo: 0.145 },
    { hasta: 53_407,   tipo: 0.185 },
    { hasta: 120_000,  tipo: 0.215 },
    { hasta: Infinity, tipo: 0.235 },
  ],
  andalucia: [
    { hasta: 12_450,   tipo: 0.095 },
    { hasta: 20_200,   tipo: 0.120 },
    { hasta: 35_200,   tipo: 0.140 },
    { hasta: 60_000,   tipo: 0.175 },
    { hasta: Infinity, tipo: 0.200 },
  ],
  pais_vasco: [
    // País Vasco tiene régimen foral propio; aproximación orientativa
    { hasta: 17_000,   tipo: 0.080 },
    { hasta: 33_000,   tipo: 0.110 },
    { hasta: 53_000,   tipo: 0.145 },
    { hasta: 80_000,   tipo: 0.180 },
    { hasta: 175_000,  tipo: 0.220 },
    { hasta: Infinity, tipo: 0.250 },
  ],
  otras: [
    // Media aproximada resto de comunidades
    { hasta: 12_450,   tipo: 0.100 },
    { hasta: 20_200,   tipo: 0.120 },
    { hasta: 35_200,   tipo: 0.150 },
    { hasta: 60_000,   tipo: 0.180 },
    { hasta: Infinity, tipo: 0.215 },
  ],
};

// Mínimo personal general 2026 (reduce la base imponible en IRPF normal)
const MINIMO_PERSONAL = 5_550;

/**
 * Aplica una escala progresiva a una base dada y devuelve la cuota.
 */
function aplicarEscala(base: number, tramos: TramosCC): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let baseRestante = base;
  let limiteAnterior = 0;

  for (const tramo of tramos) {
    if (baseRestante <= 0) break;
    const anchura = tramo.hasta - limiteAnterior;
    const baseEnTramo = Math.min(baseRestante, anchura);
    cuota += baseEnTramo * tramo.tipo;
    baseRestante -= baseEnTramo;
    limiteAnterior = tramo.hasta;
    if (tramo.hasta === Infinity) break;
  }
  return cuota;
}

/**
 * Cuota IRPF normal = cuota estatal + cuota autonómica sobre (renta - mínimo personal)
 */
function calcularCuotaIRPF(renta: number, comunidad: string): number {
  const baseGeneral = Math.max(0, renta - MINIMO_PERSONAL);
  const tramosAuto = TRAMOS_AUTONOMICOS[comunidad] ?? TRAMOS_AUTONOMICOS["otras"];

  const cuotaEstatal    = aplicarEscala(baseGeneral, TRAMOS_ESTATALES);
  const cuotaAutonomica = aplicarEscala(baseGeneral, tramosAuto);

  return cuotaEstatal + cuotaAutonomica;
}

/**
 * Cuota Beckham: 24 % hasta 600.000 €, 47 % sobre el exceso.
 */
function calcularCuotaBeckham(renta: number): number {
  if (renta <= 0) return 0;
  if (renta <= BECKHAM_UMBRAL) {
    return renta * BECKHAM_TIPO_BASE;
  }
  return BECKHAM_UMBRAL * BECKHAM_TIPO_BASE + (renta - BECKHAM_UMBRAL) * BECKHAM_TIPO_ALTO;
}

export function compute(i: Inputs): Outputs {
  const salario   = Math.max(0, Number(i.salario) || 0);
  const bono      = Math.max(0, Number(i.bono)    || 0);
  const comunidad = (i.comunidad || "otras").trim().toLowerCase();

  if (salario <= 0) {
    return {
      totalBruto:   0,
      cuotaBeckham: 0,
      tipoBeckham:  0,
      cuotaIRPF:    0,
      tipoIRPF:     0,
      ahorroAnual:  0,
      ahorro6anos:  0,
      detalle: "Ingresá un salario bruto anual mayor que 0.",
    };
  }

  const totalBruto = salario + bono;

  // --- Régimen Beckham ---
  const cuotaBeckham = calcularCuotaBeckham(totalBruto);
  const tipoBeckham  = totalBruto > 0 ? (cuotaBeckham / totalBruto) * 100 : 0;

  // --- IRPF normal ---
  const cuotaIRPF = calcularCuotaIRPF(totalBruto, comunidad);
  const tipoIRPF  = totalBruto > 0 ? (cuotaIRPF / totalBruto) * 100 : 0;

  // --- Ahorro ---
  const ahorroAnual = Math.max(0, cuotaIRPF - cuotaBeckham);
  const ahorro6anos = ahorroAnual * 6;

  // Nombre legible de la comunidad para el detalle
  const nombreCC: Record<string, string> = {
    madrid:    "Madrid",
    cataluna:  "Cataluña",
    valencia:  "Com. Valenciana",
    andalucia: "Andalucía",
    pais_vasco: "País Vasco",
    otras:     "otras comunidades (media)",
  };
  const ccLabel = nombreCC[comunidad] ?? "otras comunidades";

  const bechamSegmento = totalBruto > BECKHAM_UMBRAL
    ? `primeros 600.000 € al 24 %, exceso de ${(totalBruto - BECKHAM_UMBRAL).toLocaleString("es-ES", { maximumFractionDigits: 0 })} € al 47 %`
    : `tipo fijo del 24 %`;

  const detalle =
    `Renta total: ${totalBruto.toLocaleString("es-ES", { maximumFractionDigits: 0 })} € ` +
    `(salario ${salario.toLocaleString("es-ES", { maximumFractionDigits: 0 })} € + bono ${bono.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €). ` +
    `Beckham: ${bechamSegmento}. ` +
    `IRPF normal (${ccLabel}): tarifa progresiva estatal + autonómica sobre base ${Math.max(0, totalBruto - MINIMO_PERSONAL).toLocaleString("es-ES", { maximumFractionDigits: 0 })} € ` +
    `(mínimo personal de ${MINIMO_PERSONAL.toLocaleString("es-ES")} € deducido). ` +
    `Estimación orientativa sin otras deducciones personales.`;

  return {
    totalBruto,
    cuotaBeckham:  Math.round(cuotaBeckham  * 100) / 100,
    tipoBeckham:   Math.round(tipoBeckham   * 100) / 100,
    cuotaIRPF:     Math.round(cuotaIRPF     * 100) / 100,
    tipoIRPF:      Math.round(tipoIRPF      * 100) / 100,
    ahorroAnual:   Math.round(ahorroAnual   * 100) / 100,
    ahorro6anos:   Math.round(ahorro6anos   * 100) / 100,
    detalle,
  };
}
