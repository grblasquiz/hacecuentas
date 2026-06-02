export interface Inputs {
  m3: number;
  categoria: string;
  subsidio: string;
  provincia: string;
}

export interface Outputs {
  subtotalGas: number;
  subtotalDistribucion: number;
  subtotalImpuestos: number;
  descuentoSubsidio: number;
  total: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Cuadro tarifario de referencia 2026 (valores bimestrales en ARS)
// Fuente: ENARGAS — cuadros tarifarios distribuidoras 2025-2026
// Estructura: [cargo_fijo_gas, variable_gas, cargo_fijo_dist, variable_dist]
const TARIFAS_GBA: Record<string, [number, number, number, number]> = {
  R11: [2800,  28, 3200, 32],
  R12: [3100,  31, 3500, 35],
  R13: [3400,  34, 3900, 38],
  R21: [3800,  38, 4400, 43],
  R22: [4200,  43, 4900, 48],
  R23: [4700,  49, 5500, 54],
  R31: [5400,  57, 6300, 62],
  R32: [6100,  65, 7100, 70],
  R34: [7200,  76, 8400, 82],
};

// Factor de ajuste para zona litoral/interior (Naturgy): distribución ~8% mayor
const FACTOR_LITORAL = 1.08;

// Porcentaje de descuento según nivel de subsidio RASE
// N1: sin subsidio, N2: 40%, N3: 55%
// Fuente: Secretaría de Energía / RASE 2026
const DESCUENTO_SUBSIDIO: Record<string, number> = {
  N1: 0.00,
  N2: 0.40,
  N3: 0.55,
};

// IVA residencial para servicios públicos: 27% (Ley 23.349)
const IVA = 0.27;

// Tasas adicionales: tasa ENARGAS (~0.5%) + cargo fondo fiduciario (~2%)
const TASAS_ADICIONALES = 0.025;

export function compute(i: Inputs): Outputs {
  const m3 = Math.max(0, Math.round(Number(i.m3) || 0));
  const categoria = i.categoria || "R23";
  const subsidio = i.subsidio || "N1";
  const provincia = i.provincia || "gba";

  if (m3 <= 0) {
    return {
      subtotalGas: 0,
      subtotalDistribucion: 0,
      subtotalImpuestos: 0,
      descuentoSubsidio: 0,
      total: 0,
      detalle: "Ingresá un consumo en m³ mayor a 0.",
    };
  }

  const tarifa = TARIFAS_GBA[categoria];
  if (!tarifa) {
    return {
      subtotalGas: 0,
      subtotalDistribucion: 0,
      subtotalImpuestos: 0,
      descuentoSubsidio: 0,
      total: 0,
      detalle: "Categoría tarifaria no reconocida.",
    };
  }

  const [cfGas, cvGas, cfDist, cvDist] = tarifa;
  const factorDist = provincia === "litoral" ? FACTOR_LITORAL : 1.0;

  // Subtotal gas (PIST): cargo fijo + variable
  const subtotalGas = cfGas + cvGas * m3;

  // Subtotal distribución: cargo fijo + variable, ajustado por zona
  const subtotalDistribucion = (cfDist + cvDist * m3) * factorDist;

  // Base imponible antes de subsidio
  const baseTotal = subtotalGas + subtotalDistribucion;

  // Descuento por subsidio RASE
  const pctDescuento = DESCUENTO_SUBSIDIO[subsidio] ?? 0;
  const descuentoSubsidio = baseTotal * pctDescuento;

  // Base luego de aplicar subsidio
  const baseLuegoSubsidio = baseTotal - descuentoSubsidio;

  // IVA (27%) + tasas adicionales (~2.5%)
  const iva = baseLuegoSubsidio * IVA;
  const tasas = baseLuegoSubsidio * TASAS_ADICIONALES;
  const subtotalImpuestos = iva + tasas;

  // Total final
  const total = baseLuegoSubsidio + subtotalImpuestos;

  const detalle =
    `Categoría ${categoria} | ${m3} m³ bimestrales | Subsidio ${subsidio} (${(pctDescuento * 100).toFixed(0)}% dto.) | ` +
    `Base: $${baseTotal.toFixed(0)} | Dto. subsidio: -$${descuentoSubsidio.toFixed(0)} | ` +
    `IVA 27%: $${iva.toFixed(0)} | Tasas: $${tasas.toFixed(0)} | ` +
    `Zona: ${provincia === "litoral" ? "Litoral/Interior (Naturgy)" : "GBA/AMBA (Metrogas)"}. ` +
    `Valores orientativos según cuadro tarifario ENARGAS 2026.`;

  // Componentes netos (ya con el subsidio aplicado) que suman el total exacto
  const gasNeto = subtotalGas * (1 - pctDescuento);
  const distNeto = subtotalDistribucion * (1 - pctDescuento);
  const totalR = Math.round(total);
  const pctImpuestos = total > 0 ? (subtotalImpuestos / total) * 100 : 0;
  const tieneSubsidio = pctDescuento > 0;

  const _insight = {
    title: tieneSubsidio ? 'Tu factura con subsidio aplicado' : 'Cuánto pesan los impuestos en tu boleta',
    text: tieneSubsidio
      ? `Por **${m3} m³** bimestrales en categoría **${categoria}** pagás **$${totalR.toLocaleString('es-AR')}**: el subsidio **${subsidio}** te descuenta **$${Math.round(descuentoSubsidio).toLocaleString('es-AR')}**, pero igual cargás **$${Math.round(subtotalImpuestos).toLocaleString('es-AR')}** de IVA y tasas (**${pctImpuestos.toFixed(0)}%** del total).`
      : `Por **${m3} m³** bimestrales en categoría **${categoria}** sin subsidio pagás **$${totalR.toLocaleString('es-AR')}**, de los cuales **$${Math.round(subtotalImpuestos).toLocaleString('es-AR')}** son IVA (27%) y tasas: el **${pctImpuestos.toFixed(0)}%** de la boleta son impuestos, no gas.`,
    tone: 'warn',
    icon: '🔥',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Gas (PIST)', value: Math.round(gasNeto) },
      { label: 'Distribución', value: Math.round(distNeto) },
      { label: 'IVA + tasas', value: Math.round(subtotalImpuestos) },
    ],
    prefix: '$',
    centerValue: `$${totalR.toLocaleString('es-AR')}`,
    centerLabel: 'Total bimestral',
    ariaLabel: `La factura de $${totalR.toLocaleString('es-AR')} se compone de gas, cargo de distribución e impuestos (IVA más tasas)`,
  };

  return {
    subtotalGas: Math.round(subtotalGas),
    subtotalDistribucion: Math.round(subtotalDistribucion),
    subtotalImpuestos: Math.round(subtotalImpuestos),
    descuentoSubsidio: Math.round(descuentoSubsidio),
    total: totalR,
    detalle,
    _insight,
    _chart,
  };
}
