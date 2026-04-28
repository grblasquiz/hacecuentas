export interface Inputs {
  consumo_kwh: number;
  tarifa_zona: string; // '1', '1a', '1b', '1c', '1d', '1e', '1f'
  aplicar_dac: string; // 'si' | 'no'
}

export interface Outputs {
  cargo_base: number;
  subsidio_aplicado: number;
  cargo_energia_neto: number;
  cargo_dac: number;
  subtotal_antes_iva: number;
  iva_16: number;
  total_recibo: number;
  costo_por_kwh: number;
  ahorro_anual_solar_80: number;
}

export function compute(i: Inputs): Outputs {
  // Datos tarifarios CFE 2026 abril (MXN/kWh) — Fuente: CFE tarifas oficiales
  const tarifasBase: Record<string, { tarifa: number; limiteSubsidio: number; umbralDAC: number; subsidioPercent: number }> = {
    '1': { tarifa: 4.20, limiteSubsidio: 150, umbralDAC: 400, subsidioPercent: 0.15 },
    '1a': { tarifa: 4.60, limiteSubsidio: 130, umbralDAC: 350, subsidioPercent: 0.16 },
    '1b': { tarifa: 4.90, limiteSubsidio: 110, umbralDAC: 300, subsidioPercent: 0.17 },
    '1c': { tarifa: 5.30, limiteSubsidio: 100, umbralDAC: 250, subsidioPercent: 0.18 },
    '1d': { tarifa: 4.70, limiteSubsidio: 120, umbralDAC: 320, subsidioPercent: 0.16 },
    '1e': { tarifa: 4.50, limiteSubsidio: 125, umbralDAC: 330, subsidioPercent: 0.15 },
    '1f': { tarifa: 3.90, limiteSubsidio: 180, umbralDAC: 450, subsidioPercent: 0.14 }
  };

  // Tarifa escalonada (segundo tramo, después del subsidio) — multiplicador 1.24x
  const multiplicadorSegundoTramo = 1.24;

  const zona = i.tarifa_zona.toLowerCase();
  const datos = tarifasBase[zona] || tarifasBase['1'];
  const consumo = Math.max(0, i.consumo_kwh);

  // 1. Calcular cargo base con tramos escalonados
  let cargoBase = 0;
  if (consumo <= datos.limiteSubsidio) {
    cargoBase = consumo * datos.tarifa;
  } else {
    const primerTramo = datos.limiteSubsidio * datos.tarifa;
    const segundoTramo = (consumo - datos.limiteSubsidio) * (datos.tarifa * multiplicadorSegundoTramo);
    cargoBase = primerTramo + segundoTramo;
  }

  // 2. Aplicar subsidio progresivo (primeros kWh del tramo 1)
  const subsidioAplicado = consumo <= datos.limiteSubsidio
    ? cargoBase * datos.subsidioPercent
    : (datos.limiteSubsidio * datos.tarifa) * datos.subsidioPercent;

  const cargoEnergiaNeto = cargoBase - subsidioAplicado;

  // 3. Aplicar cargo DAC si aplica (12% sobre subtotal sin IVA)
  const aplicaDac = i.aplicar_dac.toLowerCase() === 'si' && consumo > datos.umbralDAC;
  const cargoDac = aplicaDac ? cargoEnergiaNeto * 0.12 : 0;

  // 4. Subtotal antes IVA
  const subtotalAntesIva = cargoEnergiaNeto + cargoDac;

  // 5. IVA 16% — Fuente: SAT, tasa general energía eléctrica doméstica
  const iva16 = subtotalAntesIva * 0.16;

  // 6. Total recibo
  const totalRecibo = subtotalAntesIva + iva16;

  // 7. Costo promedio por kWh
  const costoPorKwh = consumo > 0 ? totalRecibo / consumo : 0;

  // 8. Ahorro anual estimado con solar 80% (comparativa)
  // Asunción: sistema solar genera 80% del consumo anual
  const consumoAnual = consumo * 6; // bimestral × 6
  const ahorroConSolar = (consumoAnual * 0.80) * costoPorKwh;

  return {
    cargo_base: Math.round(cargoBase * 100) / 100,
    subsidio_aplicado: Math.round(subsidioAplicado * 100) / 100,
    cargo_energia_neto: Math.round(cargoEnergiaNeto * 100) / 100,
    cargo_dac: Math.round(cargoDac * 100) / 100,
    subtotal_antes_iva: Math.round(subtotalAntesIva * 100) / 100,
    iva_16: Math.round(iva16 * 100) / 100,
    total_recibo: Math.round(totalRecibo * 100) / 100,
    costo_por_kwh: Math.round(costoPorKwh * 100) / 100,
    ahorro_anual_solar_80: Math.round(ahorroConSolar * 100) / 100
  };
}
