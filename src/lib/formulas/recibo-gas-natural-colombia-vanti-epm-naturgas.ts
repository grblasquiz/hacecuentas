export interface Inputs {
  estrato: string; // "1" | "2" | "3" | "4" | "5" | "6"
  m3_consumidos: number;
  distribuidor: string; // "vanti" | "epm" | "naturgas" | "otros"
  tiene_subsidio: string; // "si" | "no"
}

export interface Outputs {
  cargo_fijo_mensual: number;
  cargo_consumo: number;
  subtotal_servicios: number;
  subsidio_aplicado: number;
  impuesto_consumo: number;
  total_recibo: number;
  costo_promedio_m3: number;
}

export function compute(i: Inputs): Outputs {
  // Tarifas por distribuidor (CREG 2026 indicativas)
  // Fuente: CREG resoluciones trimestrales
  const tarifasPorDistribuidor: Record<string, { cargoFijo: number; tarifaM3: number }> = {
    "vanti": { cargoFijo: 3800, tarifaM3: 2450 },
    "epm": { cargoFijo: 4200, tarifaM3: 2380 },
    "naturgas": { cargoFijo: 3500, tarifaM3: 2290 },
    "otros": { cargoFijo: 3800, tarifaM3: 2400 }
  };

  // Porcentajes de subsidio por estrato (DIAN/CREG 2026)
  // Fuente: Resolución CREG subsidios cruzados
  const subsidiosPorEstrato: Record<string, number> = {
    "1": 0.40,  // 40%
    "2": 0.30,  // 30%
    "3": 0.20,  // 20%
    "4": 0.00,  // Sin subsidio
    "5": 0.00,  // Sin subsidio
    "6": 0.00   // Sin subsidio
  };

  const m3 = i.m3_consumidos || 0;
  const dist = i.distribuidor || "otros";
  const estrato = i.estrato || "4";
  const tieneSubsidio = i.tiene_subsidio === "si" && ["1", "2", "3"].includes(estrato);

  const tarifas = tarifasPorDistribuidor[dist] || tarifasPorDistribuidor["otros"];
  const cargoFijo = tarifas.cargoFijo;
  const tarifaM3 = tarifas.tarifaM3;

  // Cálculo de cargos
  const cargoConsumo = m3 * tarifaM3;
  const subtotal = cargoFijo + cargoConsumo;

  // Aplicar subsidio si corresponde
  const porcentajeSubsidio = tieneSubsidio ? (subsidiosPorEstrato[estrato] || 0) : 0;
  const subsidio = subtotal * porcentajeSubsidio;
  const subtotalConSubsidio = subtotal - subsidio;

  // Impuesto al consumo 8% (Nacional, DIAN)
  // Fuente: Impuesto Nacional al Consumo de Gasolina y Combustibles
  const impuesto = subtotalConSubsidio * 0.08;

  // Total recibo
  const totalRecibo = subtotalConSubsidio + impuesto;

  // Costo promedio por m³
  const costoPromedio = m3 > 0 ? totalRecibo / m3 : 0;

  return {
    cargo_fijo_mensual: Math.round(cargoFijo),
    cargo_consumo: Math.round(cargoConsumo),
    subtotal_servicios: Math.round(subtotal),
    subsidio_aplicado: Math.round(subsidio),
    impuesto_consumo: Math.round(impuesto),
    total_recibo: Math.round(totalRecibo),
    costo_promedio_m3: Math.round(costoPromedio)
  };
}
