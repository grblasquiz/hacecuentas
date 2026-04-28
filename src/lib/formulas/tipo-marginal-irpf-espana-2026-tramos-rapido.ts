export interface Inputs {
  base_liquidable: number;
}

export interface Outputs {
  tramo_numero: string;
  rango_tramo: string;
  tipo_marginal: number;
  cuota_integra: number;
  tipo_efectivo: number;
  renta_neta: number;
}

// Escala estatal IRPF 2026 — Ley 35/2006 modificada (AEAT 2026)
// Cada elemento: [límite_inferior, límite_superior, tipo_marginal, cuota_acumulada_inicio]
const TRAMOS_IRPF_2026: Array<{
  desde: number;
  hasta: number;
  tipo: number;
  cuotaAcumulada: number;
  numero: number;
  rango: string;
}> = [
  {
    desde: 0,
    hasta: 12450,
    tipo: 0.19,
    cuotaAcumulada: 0,
    numero: 1,
    rango: "0€ – 12.450€",
  },
  {
    desde: 12450,
    hasta: 20200,
    tipo: 0.24,
    cuotaAcumulada: 2365.5, // 12450 * 0.19
    numero: 2,
    rango: "12.450€ – 20.200€",
  },
  {
    desde: 20200,
    hasta: 35200,
    tipo: 0.3,
    cuotaAcumulada: 4225.5, // 2365.50 + 7750 * 0.24
    numero: 3,
    rango: "20.200€ – 35.200€",
  },
  {
    desde: 35200,
    hasta: 60000,
    tipo: 0.37,
    cuotaAcumulada: 8725.5, // 4225.50 + 15000 * 0.30
    numero: 4,
    rango: "35.200€ – 60.000€",
  },
  {
    desde: 60000,
    hasta: 300000,
    tipo: 0.45,
    cuotaAcumulada: 17901.5, // 8725.50 + 24800 * 0.37
    numero: 5,
    rango: "60.000€ – 300.000€",
  },
  {
    desde: 300000,
    hasta: Infinity,
    tipo: 0.47,
    cuotaAcumulada: 125901.5, // 17901.50 + 240000 * 0.45
    numero: 6,
    rango: "Más de 300.000€",
  },
];

export function compute(i: Inputs): Outputs {
  const base = typeof i.base_liquidable === "number" ? i.base_liquidable : 0;

  // Sanitización: base mínima 0
  const baseLiquidable = Math.max(0, base);

  // Si la base es 0, devolver valores por defecto
  if (baseLiquidable === 0) {
    return {
      tramo_numero: "Tramo 1",
      rango_tramo: "0€ – 12.450€",
      tipo_marginal: 19,
      cuota_integra: 0,
      tipo_efectivo: 0,
      renta_neta: 0,
    };
  }

  // Determinar tramo marginal: aquel en cuyo rango cae la base liquidable
  let tramoActual = TRAMOS_IRPF_2026[TRAMOS_IRPF_2026.length - 1];
  for (const tramo of TRAMOS_IRPF_2026) {
    if (baseLiquidable <= tramo.hasta) {
      tramoActual = tramo;
      break;
    }
  }

  // Calcular cuota íntegra estatal:
  // cuota = cuota acumulada hasta el inicio del tramo
  //         + (base_liquidable - límite_inferior_tramo) * tipo_marginal_tramo
  const exceso = baseLiquidable - tramoActual.desde;
  const cuotaIntegra =
    Math.round(
      (tramoActual.cuotaAcumulada + exceso * tramoActual.tipo) * 100
    ) / 100;

  // Tipo efectivo = cuota íntegra / base liquidable * 100
  const tipoEfectivo =
    Math.round((cuotaIntegra / baseLiquidable) * 10000) / 100;

  // Renta neta tras IRPF estatal
  const rentaNeta = Math.round((baseLiquidable - cuotaIntegra) * 100) / 100;

  return {
    tramo_numero: `Tramo ${tramoActual.numero}`,
    rango_tramo: tramoActual.rango,
    tipo_marginal: Math.round(tramoActual.tipo * 100), // en %
    cuota_integra: cuotaIntegra,
    tipo_efectivo: tipoEfectivo,
    renta_neta: rentaNeta,
  };
}
