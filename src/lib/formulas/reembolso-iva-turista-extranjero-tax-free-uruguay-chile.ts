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
  _chart?: any;
  _insight?: any;
}

// Tasas de IVA estándar por país (2026).
// statutory: factor de devolución fijado por ley (no por operadora). Si está
// definido, manda sobre el factor de la operadora (caso Uruguay 80%, Chile 100%).
const IVA_RATES: Record<string, { tasa: number; moneda: string; nombre: string; statutory?: number }> = {
  uruguay:      { tasa: 0.22,  moneda: "UYU", nombre: "Uruguay", statutory: 0.80 },
  chile:        { tasa: 0.19,  moneda: "CLP", nombre: "Chile",   statutory: 1.00 },
  espana:       { tasa: 0.21,  moneda: "EUR", nombre: "España" },
  francia:      { tasa: 0.20,  moneda: "EUR", nombre: "Francia" },
  alemania:     { tasa: 0.19,  moneda: "EUR", nombre: "Alemania" },
  italia:       { tasa: 0.22,  moneda: "EUR", nombre: "Italia" },
  uk:           { tasa: 0.20,  moneda: "GBP", nombre: "Reino Unido" },
  portugal:     { tasa: 0.23,  moneda: "EUR", nombre: "Portugal" },
  paises_bajos: { tasa: 0.21,  moneda: "EUR", nombre: "Países Bajos" },
  belgica:      { tasa: 0.21,  moneda: "EUR", nombre: "Bélgica" },
  suiza:        { tasa: 0.081, moneda: "CHF", nombre: "Suiza" },
};

// Factor de retención de las operadoras (porcentaje del IVA que SÍ devuelven).
// Fuente: tarifas orientativas publicadas por Global Blue y Planet (2026).
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
      _insight: {
        title: "Falta el monto",
        text: "Ingresá el **monto de compra** para estimar cuánto IVA podés recuperar como turista.",
        tone: "neutral" as const,
        icon: "🧳",
      },
    };
  }

  const paisData = IVA_RATES[i.pais] ?? IVA_RATES["uruguay"];
  const operadoraData = OPERADORA_FACTOR[i.operadora] ?? OPERADORA_FACTOR["global_blue"];

  const { tasa, moneda, nombre: nombrePais, statutory } = paisData;

  // Si el país fija por ley el % de devolución (Uruguay 80%, Chile 100%),
  // ese factor manda; si no, se usa el de la operadora elegida.
  const usaStatutory = typeof statutory === "number";
  const factor = usaStatutory ? (statutory as number) : operadoraData.factor;
  const nombreOp = usaStatutory
    ? (factor >= 1 ? "devolución estatal directa" : `devolución estatal (${(factor * 100).toFixed(0)}% del IVA)`)
    : operadoraData.nombre;

  // IVA incluido en el precio: monto × (tasa / (1 + tasa))
  const iva_incluido = monto * (tasa / (1 + tasa));

  // Reembolso bruto = IVA incluido (antes de comisión/retención)
  const reembolso_bruto = iva_incluido;

  // Comisión/retención (parte del IVA que NO vuelve)
  const comision_operadora = reembolso_bruto * (1 - factor);

  // Reembolso neto
  const reembolso_neto = reembolso_bruto * factor;

  // Porcentaje recuperado sobre el precio pagado
  const porcentaje_sobre_compra = (reembolso_neto / monto) * 100;

  const tasaPct = (tasa * 100).toFixed(1);
  const factorPct = (factor * 100).toFixed(0);
  const porcentajeFmt = porcentaje_sobre_compra.toFixed(2);

  const detalle =
    `País: ${nombrePais} | IVA: ${tasaPct}% | ${usaStatutory ? "Régimen" : "Operadora"}: ${nombreOp}${usaStatutory ? "" : ` (devuelve ${factorPct}% del IVA)`}.\n` +
    `Sobre ${monto.toFixed(2)} ${moneda} pagados, el IVA incluido es ${iva_incluido.toFixed(2)} ${moneda}.\n` +
    `${usaStatutory && factor >= 1 ? "No hay retención" : "Retención/comisión"}: ${comision_operadora.toFixed(2)} ${moneda}.\n` +
    `Reembolso neto estimado: ${reembolso_neto.toFixed(2)} ${moneda} (${porcentajeFmt}% del precio pagado).\n` +
    `Nota: estimación orientativa. El importe exacto depende del régimen del país y la forma de cobro.`;

  // Insight: cuánto recuperás realmente y cuánto se queda la retención
  const comisionPctSobreIva = reembolso_bruto > 0 ? (comision_operadora / reembolso_bruto) * 100 : 0;
  const _insight = {
    title: "Cuánto recuperás de IVA",
    text: `De los ${monto.toFixed(2)} ${moneda} que pagaste, te devuelven **${reembolso_neto.toFixed(2)} ${moneda}** (un **${porcentajeFmt}%** de la compra). ${factor >= 1 ? "Recuperás el IVA completo, sin comisión." : `${nombreOp} se queda con ${comision_operadora.toFixed(2)} ${moneda}, el **${comisionPctSobreIva.toFixed(0)}%** del IVA.`}`,
    tone: (factor >= 1 ? "good" : comisionPctSobreIva > 15 ? "warn" : "neutral") as "good" | "warn" | "neutral",
    icon: "🧳",
  };

  const precioSinIva = monto - iva_incluido;
  const chartSlices = [
    { label: "Precio sin IVA", value: precioSinIva },
    { label: "Reembolso neto", value: reembolso_neto },
    { label: "Retención / comisión", value: comision_operadora },
  ].filter((s) => s.value > 0);

  const chart = {
    type: 'doughnut' as const,
    slices: chartSlices,
    prefix: '',
    centerValue: Math.round(monto).toLocaleString('es-AR') + ' ' + moneda,
    centerLabel: 'Compra',
    ariaLabel: 'Composición del precio pagado: base sin IVA, reembolso neto recuperado y retención de la operadora.',
  };

  return {
    iva_incluido: Math.round(iva_incluido * 100) / 100,
    reembolso_bruto: Math.round(reembolso_bruto * 100) / 100,
    comision_operadora: Math.round(comision_operadora * 100) / 100,
    reembolso_neto: Math.round(reembolso_neto * 100) / 100,
    porcentaje_sobre_compra: Math.round(porcentaje_sobre_compra * 100) / 100,
    detalle,
    _chart: chart,
    _insight,
  };
}
