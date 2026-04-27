export interface Inputs {
  monto: number;
  pais: string;
  operadora: string;
}

export interface Outputs {
  iva_incluido: number;
  reembolso_bruto: number;
  comision_operadora: number;
  reembolso_neto: number;
  porcentaje_sobre_compra: number;
  detalle: string;
}

// Tasas de IVA estándar por país (2026)
const IVA_RATES: Record<string, { tasa: number; moneda: string; nombre: string }> = {
  espana:       { tasa: 0.21,  moneda: "EUR", nombre: "España" },
  francia:      { tasa: 0.20,  moneda: "EUR", nombre: "Francia" },
  alemania:     { tasa: 0.19,  moneda: "EUR", nombre: "Alemania" },
  italia:       { tasa: 0.22,  moneda: "EUR", nombre: "Italia" },
  uruguay:      { tasa: 0.22,  moneda: "UYU", nombre: "Uruguay" },
  uk:           { tasa: 0.20,  moneda: "GBP", nombre: "Reino Unido" },
  portugal:     { tasa: 0.23,  moneda: "EUR", nombre: "Portugal" },
  paises_bajos: { tasa: 0.21,  moneda: "EUR", nombre: "Países Bajos" },
  belgica:      { tasa: 0.21,  moneda: "EUR", nombre: "Bélgica" },
  suiza:        { tasa: 0.081, moneda: "CHF", nombre: "Suiza" },
};

// Factor de retención de las operadoras (porcentaje del IVA que SÍ devuelven)
// Fuente: tarifas orientativas publicadas por Global Blue y Planet (2026)
const OPERADORA_FACTOR: Record<string, { factor: number; nombre: string }> = {
  global_blue: { factor: 0.87, nombre: "Global Blue" },
  planet:      { factor: 0.85, nombre: "Planet / Premier Tax Free" },
  innova:      { factor: 0.88, nombre: "Innova Taxfree" },
  directo:     { factor: 1.00, nombre: "Devolución directa" },
};

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;

  if (monto <= 0) {
    return {
      iva_incluido: 0,
      reembolso_bruto: 0,
      comision_operadora: 0,
      reembolso_neto: 0,
      porcentaje_sobre_compra: 0,
      detalle: "Ingresá un monto de compra válido mayor a 0.",
    };
  }

  const paisData = IVA_RATES[i.pais] ?? IVA_RATES["espana"];
  const operadoraData = OPERADORA_FACTOR[i.operadora] ?? OPERADORA_FACTOR["global_blue"];

  const { tasa, moneda, nombre: nombrePais } = paisData;
  const { factor, nombre: nombreOp } = operadoraData;

  // IVA incluido en el precio: monto × (tasa / (1 + tasa))
  const iva_incluido = monto * (tasa / (1 + tasa));

  // Reembolso bruto = IVA incluido (antes de comisión)
  const reembolso_bruto = iva_incluido;

  // Comisión de la operadora
  const comision_operadora = reembolso_bruto * (1 - factor);

  // Reembolso neto
  const reembolso_neto = reembolso_bruto * factor;

  // Porcentaje recuperado sobre el precio pagado
  const porcentaje_sobre_compra = (reembolso_neto / monto) * 100;

  const tasaPct = (tasa * 100).toFixed(1);
  const factorPct = (factor * 100).toFixed(0);
  const porcentajeFmt = porcentaje_sobre_compra.toFixed(2);

  const detalle =
    `País: ${nombrePais} | IVA: ${tasaPct}% | Operadora: ${nombreOp} (devuelve ${factorPct}% del IVA).\n` +
    `Sobre ${monto.toFixed(2)} ${moneda} pagados, el IVA incluido es ${iva_incluido.toFixed(2)} ${moneda}.\n` +
    `Comisión operadora: ${comision_operadora.toFixed(2)} ${moneda}.\n` +
    `Reembolso neto estimado: ${reembolso_neto.toFixed(2)} ${moneda} (${porcentajeFmt}% del precio pagado).\n` +
    `Nota: estimación orientativa. El importe exacto depende del contrato tienda-operadora y la forma de cobro.`;

  return {
    iva_incluido: Math.round(iva_incluido * 100) / 100,
    reembolso_bruto: Math.round(reembolso_bruto * 100) / 100,
    comision_operadora: Math.round(comision_operadora * 100) / 100,
    reembolso_neto: Math.round(reembolso_neto * 100) / 100,
    porcentaje_sobre_compra: Math.round(porcentaje_sobre_compra * 100) / 100,
    detalle,
  };
}
