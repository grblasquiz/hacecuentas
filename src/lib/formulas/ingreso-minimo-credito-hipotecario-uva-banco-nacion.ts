export interface Inputs {
  precioUsd: number;
  porcentajeFinanciado: number;
  plazoAnios: string;
  banco: string;
  tasaPersonalizada: number;
  tipoCambio: number;
  relacionCuotaIngreso: string;
}

export interface Outputs {
  ingresoMinimoArs: number;
  cuotaInicialArs: number;
  montoCredito: number;
  montoCreditoArs: number;
  tasaUsada: number;
  detalle: string;
}

// Tasas reales anuales por banco (TNA sobre UVA, referencia 2026)
const TASAS_BANCO: Record<string, number> = {
  nacion: 5.5,       // Banco Nación – fuente: bna.com.ar 2026
  hipotecario: 6.25, // Banco Hipotecario – fuente: hipotecario.com.ar 2026
  galicia: 7.0,      // Banco Galicia – referencia 2026
  macro: 7.5,        // Banco Macro – referencia 2026
};

export function compute(i: Inputs): Outputs {
  const precioUsd = Number(i.precioUsd) || 0;
  const porcentajeFinanciado = Number(i.porcentajeFinanciado) || 0;
  const plazoAnios = parseInt(i.plazoAnios, 10) || 20;
  const tipoCambio = Number(i.tipoCambio) || 0;
  const relacionCuotaIngreso = parseInt(i.relacionCuotaIngreso, 10) || 30;

  // Validaciones básicas
  if (precioUsd <= 0 || tipoCambio <= 0) {
    return {
      ingresoMinimoArs: 0,
      cuotaInicialArs: 0,
      montoCredito: 0,
      montoCreditoArs: 0,
      tasaUsada: 0,
      detalle: "Ingresá un precio del inmueble y un tipo de cambio válidos.",
    };
  }

  if (porcentajeFinanciado <= 0 || porcentajeFinanciado > 100) {
    return {
      ingresoMinimoArs: 0,
      cuotaInicialArs: 0,
      montoCredito: 0,
      montoCreditoArs: 0,
      tasaUsada: 0,
      detalle: "El porcentaje financiado debe estar entre 1 y 100.",
    };
  }

  // Determinar tasa real anual
  let tasaAnualReal: number;
  if (i.banco === "personalizada") {
    tasaAnualReal = Number(i.tasaPersonalizada) || 5.5;
  } else {
    tasaAnualReal = TASAS_BANCO[i.banco] ?? 5.5;
  }

  if (tasaAnualReal <= 0 || tasaAnualReal > 50) {
    tasaAnualReal = 5.5;
  }

  // Monto del crédito
  const montoCreditoUsd = precioUsd * (porcentajeFinanciado / 100);
  const montoCreditoArs = montoCreditoUsd * tipoCambio;

  // Plazo en meses
  const n = plazoAnios * 12;

  // Tasa mensual real: (1 + TNA/100)^(1/12) - 1
  const r = Math.pow(1 + tasaAnualReal / 100, 1 / 12) - 1;

  // Cuota inicial (fórmula francesa / sistema francés)
  // C = P * [r * (1+r)^n] / [(1+r)^n - 1]
  let cuotaInicialArs: number;
  if (r === 0) {
    cuotaInicialArs = montoCreditoArs / n;
  } else {
    const factor = Math.pow(1 + r, n);
    cuotaInicialArs = montoCreditoArs * (r * factor) / (factor - 1);
  }

  // Ingreso mínimo necesario
  const ingresoMinimoArs = cuotaInicialArs / (relacionCuotaIngreso / 100);

  // Detalle textual
  const bancoLabel: Record<string, string> = {
    nacion: "Banco Nación",
    hipotecario: "Banco Hipotecario",
    galicia: "Banco Galicia",
    macro: "Banco Macro",
    personalizada: "Tasa personalizada",
  };
  const nombreBanco = bancoLabel[i.banco] ?? i.banco;

  const detalle =
    `${nombreBanco} | Tasa real: ${tasaAnualReal.toFixed(2)}% anual | ` +
    `Plazo: ${plazoAnios} años (${n} cuotas) | ` +
    `Crédito: USD ${montoCreditoUsd.toLocaleString("es-AR", { maximumFractionDigits: 0 })} ` +
    `= $${montoCreditoArs.toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS | ` +
    `Cuota inicial: $${cuotaInicialArs.toLocaleString("es-AR", { maximumFractionDigits: 0 })} | ` +
    `Relación cuota/ingreso: ${relacionCuotaIngreso}% | ` +
    `TC referencia: $${tipoCambio.toLocaleString("es-AR")}/USD`;

  return {
    ingresoMinimoArs,
    cuotaInicialArs,
    montoCredito: montoCreditoUsd,
    montoCreditoArs,
    tasaUsada: tasaAnualReal / 100,
    detalle,
  };
}
