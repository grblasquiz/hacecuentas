export interface Inputs {
  capital: number;
  plazo_meses: number;
  producto_rwa: string;
  treasury_yield: number;
  red: string;
  operaciones_gas: number;
  cex_yield: number;
  retenciones: number;
}

export interface Outputs {
  yield_bruto_rwa: number;
  costo_plataforma_rwa: number;
  costo_gas_total: number;
  costo_retenciones: number;
  yield_neto_rwa: number;
  yield_neto_cex: number;
  diferencial_usd: number;
  tir_neta_rwa: number;
  plazo_break_even_dias: number;
  resumen: string;
}

// Fee anual por producto (fraccion decimal)
// Fuente: docs oficiales Ondo, Mountain Protocol, Backed Finance 2026
const FEES_PLATAFORMA: Record<string, number> = {
  ousg: 0.0015,  // 0.15% mgmt fee anual
  usdm: 0.005,   // ~0.50% implicito spread/fee
  bib01: 0.005,  // 0.50% mgmt fee anual
};

// Gas fee estimado por operacion segun red (USD)
// Estimacion 2026: Ethereum mainnet ~USD 20/tx; Polygon/Base/L2 ~USD 0.30/tx
const GAS_POR_OPERACION: Record<string, number> = {
  ethereum: 20,
  polygon: 0.30,
};

// Minimos de inversion por producto (USD)
const MINIMOS: Record<string, number> = {
  ousg: 5000,
  usdm: 0,
  bib01: 1000,
};

export function compute(i: Inputs): Outputs {
  const capital = Number(i.capital) || 0;
  const plazo_meses = Number(i.plazo_meses) || 0;
  const treasury_yield = Number(i.treasury_yield) || 0;
  const operaciones_gas = Number(i.operaciones_gas) || 0;
  const cex_yield = Number(i.cex_yield) || 0;
  const retenciones = Number(i.retenciones) || 0;
  const producto_rwa = String(i.producto_rwa || "usdm");
  const red = String(i.red || "ethereum");

  // Validaciones defensivas
  if (capital <= 0 || plazo_meses <= 0) {
    return {
      yield_bruto_rwa: 0,
      costo_plataforma_rwa: 0,
      costo_gas_total: 0,
      costo_retenciones: 0,
      yield_neto_rwa: 0,
      yield_neto_cex: 0,
      diferencial_usd: 0,
      tir_neta_rwa: 0,
      plazo_break_even_dias: 0,
      resumen: "Ingres\u00e1 un capital y plazo v\u00e1lidos.",
    };
  }

  const minimo = MINIMOS[producto_rwa] ?? 0;
  if (capital < minimo && minimo > 0) {
    return {
      yield_bruto_rwa: 0,
      costo_plataforma_rwa: 0,
      costo_gas_total: 0,
      costo_retenciones: 0,
      yield_neto_rwa: 0,
      yield_neto_cex: 0,
      diferencial_usd: 0,
      tir_neta_rwa: 0,
      plazo_break_even_dias: 0,
      resumen: `El capital m\u00ednimo para ${producto_rwa.toUpperCase()} es USD ${minimo.toLocaleString("en-US")}.`,
    };
  }

  const fee_anual = FEES_PLATAFORMA[producto_rwa] ?? 0.005;
  const gas_unit = GAS_POR_OPERACION[red] ?? 20;

  const fraccion_anual = plazo_meses / 12;

  // Yield bruto: capital * treasury_yield% * fraccion del año
  const yield_bruto_rwa = capital * (treasury_yield / 100) * fraccion_anual;

  // Costo de plataforma: fee anual proporcional al plazo
  const costo_plataforma_rwa = capital * fee_anual * fraccion_anual;

  // Gas fees: fijo por cantidad de operaciones on-chain
  const costo_gas_total = gas_unit * operaciones_gas;

  // Base imponible despues de fee de plataforma
  const base_imponible = yield_bruto_rwa - costo_plataforma_rwa;

  // Retenciones sobre el rendimiento neto de fees (no sobre el capital)
  const costo_retenciones = base_imponible > 0
    ? base_imponible * (retenciones / 100)
    : 0;

  // Yield neto RWA
  const yield_neto_rwa =
    yield_bruto_rwa - costo_plataforma_rwa - costo_gas_total - costo_retenciones;

  // Yield neto CEX (sin gas fees significativos, se asume 0 costo de entrada/salida)
  const yield_neto_cex = capital * (cex_yield / 100) * fraccion_anual;

  // Diferencial
  const diferencial_usd = yield_neto_rwa - yield_neto_cex;

  // TIR neta anualizada RWA
  const tir_neta_rwa =
    plazo_meses > 0 && capital > 0
      ? (yield_neto_rwa / capital) * (12 / plazo_meses) * 100
      : 0;

  // Break-even en dias: cuantos dias necesita el RWA para recuperar los costos fijos
  // sobre el CEX, considerando que el diferencial de yield diario debe cubrir costo_gas
  // yield_rwa_diario - yield_cex_diario = diferencial de yield diario por USD
  const yield_rwa_diario = capital * (treasury_yield / 100 - fee_anual) / 365;
  const yield_cex_diario = capital * (cex_yield / 100) / 365;
  const diferencial_diario = yield_rwa_diario - yield_cex_diario;

  let plazo_break_even_dias: number;
  if (diferencial_diario <= 0) {
    // El RWA nunca supera al CEX con este fee/yield
    plazo_break_even_dias = -1;
  } else {
    plazo_break_even_dias = Math.ceil(
      (costo_gas_total + costo_retenciones) / diferencial_diario
    );
  }

  // Resumen textual
  let resumen: string;
  const productoLabel: Record<string, string> = {
    ousg: "Ondo OUSG",
    usdm: "Mountain USDM",
    bib01: "Backed bIB01",
  };
  const nombre = productoLabel[producto_rwa] ?? producto_rwa.toUpperCase();
  const fmt = (v: number) =>
    v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (yield_neto_rwa <= 0) {
    resumen = `Con USD ${fmt(capital)} en ${nombre} durante ${plazo_meses} mes(es), los costos superan el rendimiento. Yield neto: -USD ${fmt(Math.abs(yield_neto_rwa))}. Considerá mayor plazo o una red con menos gas.`;
  } else if (diferencial_usd > 0) {
    resumen = `${nombre} genera USD ${fmt(yield_neto_rwa)} netos vs USD ${fmt(yield_neto_cex)} en CEX, con un diferencial favorable de USD ${fmt(diferencial_usd)} en ${plazo_meses} mes(es). TIR neta: ${tir_neta_rwa.toFixed(2)}% anual.`;
  } else {
    resumen = `El CEX supera a ${nombre} en USD ${fmt(Math.abs(diferencial_usd))} por los costos de gas en ${plazo_meses} mes(es). Con gas m\u00e1s bajo (L2) o mayor plazo, el RWA ser\u00eda m\u00e1s conveniente.`;
  }

  if (plazo_break_even_dias > 0 && plazo_break_even_dias < 9999) {
    resumen += ` Plazo m\u00ednimo para superar al CEX: ${plazo_break_even_dias} d\u00edas.`;
  } else if (plazo_break_even_dias === -1) {
    resumen += " Con el yield y fees actuales, el RWA no supera al CEX en ning\u00fan plazo.";
  }

  return {
    yield_bruto_rwa: Math.round(yield_bruto_rwa * 100) / 100,
    costo_plataforma_rwa: Math.round(costo_plataforma_rwa * 100) / 100,
    costo_gas_total: Math.round(costo_gas_total * 100) / 100,
    costo_retenciones: Math.round(costo_retenciones * 100) / 100,
    yield_neto_rwa: Math.round(yield_neto_rwa * 100) / 100,
    yield_neto_cex: Math.round(yield_neto_cex * 100) / 100,
    diferencial_usd: Math.round(diferencial_usd * 100) / 100,
    tir_neta_rwa: Math.round(tir_neta_rwa * 1000) / 1000,
    plazo_break_even_dias,
    resumen,
  };
}
