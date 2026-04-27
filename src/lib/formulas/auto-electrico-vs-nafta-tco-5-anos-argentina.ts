export interface Inputs {
  modeloElectrico: string;
  precioElectricoCustom: number;
  modeloNafta: string;
  precioNaftaCustom: number;
  kmAnio: number;
  precioKwhARS: number;
  precioNaftaARS: number;
  tipoCambioUSD: number;
  financiacion: string;
  tasaFinanciacion: number;
  porcentajeFinanciado: number;
}

export interface Outputs {
  tcoElectricoUSD: number;
  tcoNaftaUSD: number;
  diferenciaUSD: number;
  breakevenAnios: number;
  ahorroCombustibleUSD: number;
  costoKmElectricoUSD: number;
  costoKmNaftaUSD: number;
  resumenTexto: string;
}

// Precios de lista en USD (referencia ACARA / importadores, abril 2026)
const PRECIOS_ELECTRICO: Record<string, number> = {
  byd_yuan_plus: 35000,
  byd_dolphin: 27000,
  tesla_model3: 55000,
  renault_kangoo_ze: 32000,
  custom_electrico: 0, // se reemplaza por precioElectricoCustom
};

const PRECIOS_NAFTA: Record<string, number> = {
  toyota_corolla: 28000,
  vw_polo: 20000,
  ford_ranger: 38000,
  renault_logan: 16000,
  custom_nafta: 0, // se reemplaza por precioNaftaCustom
};

// Consumos energéticos de referencia (fuente: fichas técnicas fabricantes + ACARA)
const CONSUMO_KWH_100KM: Record<string, number> = {
  byd_yuan_plus: 16,
  byd_dolphin: 14,
  tesla_model3: 14.5,
  renault_kangoo_ze: 22,
  custom_electrico: 16, // valor default razonable
};

const CONSUMO_LITROS_100KM: Record<string, number> = {
  toyota_corolla: 8.0,
  vw_polo: 6.5,
  ford_ranger: 11.5,
  renault_logan: 7.5,
  custom_nafta: 8.0, // valor default razonable
};

// Tasas de depreciación acumulada a 5 años (% del precio original que se pierde)
// Eléctricos: ~45% (mercado usado poco líquido en AR)
// Nafta: ~55% (mercado más desarrollado, mayor competencia)
const TASA_DEPRECIACION_ELECTRICO = 0.45;
const TASA_DEPRECIACION_NAFTA = 0.55;

// Mantenimiento anual en USD (referencia talleres 2026)
const MANT_ANUAL_ELECTRICO_USD = 300;
const MANT_ANUAL_NAFTA_USD = 600;

// Patente: ~1.5% del valor fiscal anual
// El valor fiscal promedia ~70% del valor de compra durante 5 años (depreciación fiscal)
const TASA_PATENTE_ANUAL = 0.015;
const FACTOR_VALOR_FISCAL_PROMEDIO = 0.70;

// Seguro: ~2.5% del valor promedio del auto durante 5 años
// El valor promedio del auto es ~75% del valor inicial (cae con la depreciación)
const TASA_SEGURO_ANUAL = 0.025;
const FACTOR_VALOR_PROMEDIO_SEGURO = 0.75;

// Años del análisis
const ANOS = 5;

function calcularInteresFinanciacion(
  precioUSD: number,
  porcentajeFinanciado: number,
  tasaAnualPct: number
): number {
  // Crédito prendario: interés total sobre el monto financiado a tasa fija por 5 años
  // Usamos fórmula de cuota francesa para calcular el total pagado
  const monto = precioUSD * (porcentajeFinanciado / 100);
  const tasaMensual = tasaAnualPct / 100 / 12;
  const cuotas = ANOS * 12;
  if (tasaMensual <= 0 || monto <= 0) return 0;
  // Cuota mensual: M = P * i*(1+i)^n / ((1+i)^n - 1)
  const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, cuotas)) / (Math.pow(1 + tasaMensual, cuotas) - 1);
  const totalPagado = cuota * cuotas;
  const interesTotal = totalPagado - monto;
  return interesTotal;
}

export function compute(i: Inputs): Outputs {
  // --- Sanitización de inputs ---
  const kmAnio = Math.max(0, Number(i.kmAnio) || 0);
  const precioKwhARS = Math.max(0, Number(i.precioKwhARS) || 0);
  const precioNaftaARS = Math.max(0, Number(i.precioNaftaARS) || 0);
  const tipoCambioUSD = Math.max(1, Number(i.tipoCambioUSD) || 1200);
  const tasaFinanciacion = Math.max(0, Number(i.tasaFinanciacion) || 0);
  const porcentajeFinanciado = Math.min(100, Math.max(0, Number(i.porcentajeFinanciado) || 0));

  if (kmAnio <= 0 || precioKwhARS <= 0 || precioNaftaARS <= 0) {
    return {
      tcoElectricoUSD: 0,
      tcoNaftaUSD: 0,
      diferenciaUSD: 0,
      breakevenAnios: 0,
      ahorroCombustibleUSD: 0,
      costoKmElectricoUSD: 0,
      costoKmNaftaUSD: 0,
      resumenTexto: "Completá todos los campos para obtener el resultado.",
    };
  }

  // --- Precios de compra ---
  const modeloE = i.modeloElectrico || "byd_yuan_plus";
  const modeloN = i.modeloNafta || "toyota_corolla";

  const precioElectrico =
    modeloE === "custom_electrico"
      ? Math.max(0, Number(i.precioElectricoCustom) || 0)
      : PRECIOS_ELECTRICO[modeloE] ?? PRECIOS_ELECTRICO["byd_yuan_plus"];

  const precioNafta =
    modeloN === "custom_nafta"
      ? Math.max(0, Number(i.precioNaftaCustom) || 0)
      : PRECIOS_NAFTA[modeloN] ?? PRECIOS_NAFTA["toyota_corolla"];

  if (precioElectrico <= 0 || precioNafta <= 0) {
    return {
      tcoElectricoUSD: 0,
      tcoNaftaUSD: 0,
      diferenciaUSD: 0,
      breakevenAnios: 0,
      ahorroCombustibleUSD: 0,
      costoKmElectricoUSD: 0,
      costoKmNaftaUSD: 0,
      resumenTexto: "Ingresá precios válidos para ambos vehículos.",
    };
  }

  // --- Consumos ---
  const consumoKWh100 = CONSUMO_KWH_100KM[modeloE] ?? 16;
  const consumoLt100 = CONSUMO_LITROS_100KM[modeloN] ?? 8;

  // --- Kilómetros totales ---
  const kmTotales = kmAnio * ANOS;

  // --- Depreciación ---
  const depreciacionElec = precioElectrico * TASA_DEPRECIACION_ELECTRICO;
  const depreciacionNafta = precioNafta * TASA_DEPRECIACION_NAFTA;

  // --- Combustible / electricidad (en USD) ---
  const kwHTotal = kmTotales * consumoKWh100 / 100;
  const costoElecUSD = kwHTotal * precioKwhARS / tipoCambioUSD;

  const litrosTotales = kmTotales * consumoLt100 / 100;
  const costoCombUSD = litrosTotales * precioNaftaARS / tipoCambioUSD;

  const ahorroCombustibleUSD = costoCombUSD - costoElecUSD;

  // --- Mantenimiento (5 años) ---
  const mantElecUSD = MANT_ANUAL_ELECTRICO_USD * ANOS;
  const mantNaftaUSD = MANT_ANUAL_NAFTA_USD * ANOS;

  // --- Patente (5 años, sobre valor fiscal promedio) ---
  const patenteElecUSD = precioElectrico * FACTOR_VALOR_FISCAL_PROMEDIO * TASA_PATENTE_ANUAL * ANOS;
  const patenteNaftaUSD = precioNafta * FACTOR_VALOR_FISCAL_PROMEDIO * TASA_PATENTE_ANUAL * ANOS;

  // --- Seguro (5 años, sobre valor promedio) ---
  const seguroElecUSD = precioElectrico * FACTOR_VALOR_PROMEDIO_SEGURO * TASA_SEGURO_ANUAL * ANOS;
  const seguroNaftaUSD = precioNafta * FACTOR_VALOR_PROMEDIO_SEGURO * TASA_SEGURO_ANUAL * ANOS;

  // --- Financiación (opcional) ---
  let interesElecUSD = 0;
  let interesNaftaUSD = 0;
  if (i.financiacion === "si" && tasaFinanciacion > 0 && porcentajeFinanciado > 0) {
    interesElecUSD = calcularInteresFinanciacion(precioElectrico, porcentajeFinanciado, tasaFinanciacion);
    interesNaftaUSD = calcularInteresFinanciacion(precioNafta, porcentajeFinanciado, tasaFinanciacion);
  }

  // --- TCO total ---
  const tcoElectricoUSD =
    depreciacionElec + costoElecUSD + mantElecUSD + patenteElecUSD + seguroElecUSD + interesElecUSD;

  const tcoNaftaUSD =
    depreciacionNafta + costoCombUSD + mantNaftaUSD + patenteNaftaUSD + seguroNaftaUSD + interesNaftaUSD;

  const diferenciaUSD = tcoNaftaUSD - tcoElectricoUSD;

  // --- Breakeven ---
  // El breakeven es el punto donde el ahorro acumulado operativo iguala la diferencia de precio de compra
  // Costo operativo anual (sin depreciación y sin precio de compra) de cada uno
  const costoPrecioElec = precioElectrico; // desembolso inicial
  const costoPrecioNafta = precioNafta;
  const diferenciaPrecioInicial = costoPrecioElec - costoPrecioNafta; // negativo si nafta es más caro

  // Ahorro operativo anual del eléctrico vs nafta
  const costoOpAnualElec =
    costoElecUSD / ANOS + MANT_ANUAL_ELECTRICO_USD + (patenteElecUSD + seguroElecUSD) / ANOS;
  const costoOpAnualNafta =
    costoCombUSD / ANOS + MANT_ANUAL_NAFTA_USD + (patenteNaftaUSD + seguroNaftaUSD) / ANOS;
  const ahorroOpAnual = costoOpAnualNafta - costoOpAnualElec;

  let breakevenAnios: number;
  if (ahorroOpAnual <= 0) {
    // El eléctrico no ahorra operativamente → no hay breakeven real
    breakevenAnios = -1;
  } else if (diferenciaPrecioInicial <= 0) {
    // El eléctrico ya es más barato de entrada
    breakevenAnios = 0;
  } else {
    breakevenAnios = diferenciaPrecioInicial / ahorroOpAnual;
  }

  // --- Costo por km ---
  const costoKmElectricoUSD = kmTotales > 0 ? tcoElectricoUSD / kmTotales : 0;
  const costoKmNaftaUSD = kmTotales > 0 ? tcoNaftaUSD / kmTotales : 0;

  // --- Resumen textual ---
  const masBaratoLabel = diferenciaUSD > 0 ? "el eléctrico" : "el de nafta";
  const difAbs = Math.abs(diferenciaUSD);
  let resumen = "";
  if (diferenciaUSD > 0) {
    resumen = `En 5 años el auto eléctrico resulta USD ${difAbs.toFixed(0)} más barato en TCO. `;
    if (breakevenAnios > 0 && breakevenAnios <= 10) {
      resumen += `El punto de equilibrio se alcanza a los ${breakevenAnios.toFixed(1)} años de uso. `;
    } else if (breakevenAnios <= 0) {
      resumen += "El eléctrico es más barato desde el primer año. ";
    } else {
      resumen += "El punto de equilibrio supera el horizonte de 5 años. ";
    }
    resumen += `El ahorro en combustible/electricidad es USD ${ahorroCombustibleUSD.toFixed(0)} en 5 años (${kmTotales.toLocaleString("es-AR")} km totales).`;
  } else if (diferenciaUSD < 0) {
    resumen = `En 5 años el auto a nafta resulta USD ${difAbs.toFixed(0)} más barato en TCO. El eléctrico no recupera la inversión extra en este escenario.`;
  } else {
    resumen = "Ambas opciones tienen un TCO idéntico a 5 años.";
  }

  return {
    tcoElectricoUSD: Math.round(tcoElectricoUSD * 100) / 100,
    tcoNaftaUSD: Math.round(tcoNaftaUSD * 100) / 100,
    diferenciaUSD: Math.round(diferenciaUSD * 100) / 100,
    breakevenAnios: breakevenAnios > 0 ? Math.round(breakevenAnios * 10) / 10 : breakevenAnios,
    ahorroCombustibleUSD: Math.round(ahorroCombustibleUSD * 100) / 100,
    costoKmElectricoUSD: Math.round(costoKmElectricoUSD * 10000) / 10000,
    costoKmNaftaUSD: Math.round(costoKmNaftaUSD * 10000) / 10000,
    resumenTexto: resumen,
  };
}
