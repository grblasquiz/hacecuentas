export interface Inputs {
  tipo_bono: 'bcu_uf' | 'bce_pesos';
  monto_nominal: number; // $ o UF equivalente
  plazo_anos: number; // 5, 10, 20, 30
  tasa_cupon_anual: number; // %
  precio_compra: number; // % par (100 = par)
  tasa_reinversion: number; // % reinversión cupones
  tipo_inversionista: 'persona_natural' | 'empresa';
  impuesto_marginal: number; // % tramo IRPF
  subida_tasa_puntos: number; // pb (puntos base)
}

export interface Outputs {
  cupones_totales_brutos: number;
  numero_cupones: number;
  cupones_netos_irpf: number;
  flujo_semestral: number;
  ganancia_capital_bruta: number;
  impuesto_ganancia_capital: number;
  ganancia_capital_neta: number;
  tir_anual_bruta: number;
  tir_anual_neta: number;
  duracion_macaulay: number;
  precio_si_tasas_suben: number;
  perdida_precio_porcentaje: number;
  resumen_tributacion: number;
  rendimiento_total_neto: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile SII
  const IVA_GANANCIA_CAPITAL = 0.19; // 19% IVA ganancia capital SII 2026
  const TASA_CUPON_MERCADO_BASE = 3.5; // tasa mercado base BCU 2026 Banco Central
  const UF_A_PESOS_2026 = 34567; // aproximado 2026 Banco Central

  // Validaciones básicas
  if (i.monto_nominal <= 0) return getEmptyOutput();
  if (i.plazo_anos <= 0) return getEmptyOutput();
  if (i.tasa_cupon_anual < 0 || i.tasa_cupon_anual > 20) return getEmptyOutput();
  if (i.precio_compra <= 0 || i.precio_compra > 150) return getEmptyOutput();

  // 1. Cálculo cupones
  const numero_cupones = i.plazo_anos * 2; // semestral
  const cupones_totales_brutos = (i.monto_nominal * i.tasa_cupon_anual) / 2 * numero_cupones;
  const flujo_semestral = (i.monto_nominal * i.tasa_cupon_anual) / 2;

  // 2. Tributación cupones (IRPF marginal persona natural)
  let tasa_tributaria_cupones = 0;
  if (i.tipo_inversionista === 'persona_natural') {
    tasa_tributaria_cupones = i.impuesto_marginal / 100; // tramo marginal 2026
  } else {
    // Empresa: usa tramo marginal del RUT (aquí simplificamos como parámetro)
    tasa_tributaria_cupones = i.impuesto_marginal / 100;
  }
  const cupones_netos_irpf = cupones_totales_brutos * (1 - tasa_tributaria_cupones);

  // 3. Ganancia de capital
  const precio_compra_decimal = i.precio_compra / 100;
  const monto_pagado = i.monto_nominal * precio_compra_decimal;
  const ganancia_capital_bruta = i.monto_nominal - monto_pagado; // (100% - precio_compra) × nominal

  // 4. Tributación ganancia capital
  // Persona natural: 19% IVA + IRPF marginal; Empresa: IRPF marginal
  let tasa_impuesto_gc = IVA_GANANCIA_CAPITAL + tasa_tributaria_cupones;
  if (i.tipo_inversionista === 'empresa') {
    // Simplificación: empresa paga IRPF marginal sobre ganancia capital
    tasa_impuesto_gc = tasa_tributaria_cupones;
  }
  const impuesto_ganancia_capital = ganancia_capital_bruta * tasa_impuesto_gc;
  const ganancia_capital_neta = ganancia_capital_bruta - impuesto_ganancia_capital;

  // 5. TIR bruta (Newton-Raphson simplificado)
  // VPI = -Precio compra + Σ cupón/(1+r/2)^t + 100/(1+r/2)^(2×plazo) = 0
  let tir_bruta = estimarTIR(
    precio_compra_decimal,
    i.tasa_cupon_anual,
    i.plazo_anos
  );

  // 6. TIR neta (aproximada: penaliza flujos por IRPF)
  // Flujos netos: cupones × (1 - IRPF) + GC neta
  const flujo_neto_cupones = cupones_netos_irpf;
  const valor_presente_neto = -monto_pagado + flujo_neto_cupones + (i.monto_nominal - impuesto_ganancia_capital);
  const tir_neta = Math.max(0, valor_presente_neto / monto_pagado / i.plazo_anos); // aproximación lineal

  // 7. Duración Macaulay
  const duracion = calcularDuracion(i.tasa_cupon_anual, i.plazo_anos, tir_bruta);

  // 8. Impacto subida tasas
  const delta_tasa = i.subida_tasa_puntos / 10000; // convertir pb a decimal
  const precio_si_tasas_suben = 100 - (duracion * delta_tasa * 100);
  const perdida_precio_porcentaje = Math.max(0, i.precio_compra - precio_si_tasas_suben) / i.precio_compra;

  // 9. Resumen tributación total
  const tributacion_cupones = cupones_totales_brutos * tasa_tributaria_cupones;
  const resumen_tributacion = tributacion_cupones + impuesto_ganancia_capital;

  // 10. Rendimiento total neto ($ o UF)
  const rendimiento_total_neto = flujo_neto_cupones + ganancia_capital_neta;

  return {
    cupones_totales_brutos: Math.round(cupones_totales_brutos),
    numero_cupones: numero_cupones,
    cupones_netos_irpf: Math.round(cupones_netos_irpf),
    flujo_semestral: Math.round(flujo_semestral),
    ganancia_capital_bruta: Math.round(ganancia_capital_bruta),
    impuesto_ganancia_capital: Math.round(impuesto_ganancia_capital),
    ganancia_capital_neta: Math.round(ganancia_capital_neta),
    tir_anual_bruta: Math.max(0, tir_bruta) * 100, // en %
    tir_anual_neta: Math.max(0, tir_neta) * 100, // en %
    duracion_macaulay: Math.max(0, duracion),
    precio_si_tasas_suben: Math.max(0, precio_si_tasas_suben),
    perdida_precio_porcentaje: perdida_precio_porcentaje * 100,
    resumen_tributacion: Math.round(resumen_tributacion),
    rendimiento_total_neto: Math.round(rendimiento_total_neto)
  };
}

// Función auxiliar: estimar TIR bruta
function estimarTIR(
  precio_compra: number,
  tasa_cupon: number,
  plazo: number
): number {
  // VPI bono: -precio + Σ(cupón/(1+y)^t) + 100/(1+y)^(2×plazo) = 0
  // Donde y = TIR anual (semi-anual: y/2)
  // Aproximación: si precio = 100% (par), TIR ≈ cupón
  if (Math.abs(precio_compra - 1.0) < 0.001) {
    return tasa_cupon / 100;
  }

  // Newton-Raphson simplificado (2 iteraciones)
  let r = tasa_cupon / 100; // estimación inicial = cupón
  for (let iter = 0; iter < 2; iter++) {
    const vpi = calcularVPI(precio_compra, tasa_cupon, plazo, r);
    const dvpi = calcularDerivadaVPI(precio_compra, tasa_cupon, plazo, r);
    if (Math.abs(dvpi) < 0.00001) break;
    r = r - vpi / dvpi;
  }
  return Math.max(0, r);
}

// VPI bono
function calcularVPI(
  precio_compra: number,
  tasa_cupon: number,
  plazo: number,
  r: number
): number {
  const cupon_semi = tasa_cupon / 200; // cupón semestral como decimal
  const y_semi = r / 2; // TIR semestral
  let vpi = -precio_compra * 100; // precio inicial

  // Cupones
  for (let t = 1; t <= plazo * 2; t++) {
    vpi += cupon_semi / Math.pow(1 + y_semi, t);
  }
  // Rescate 100%
  vpi += 100 / Math.pow(1 + y_semi, plazo * 2);

  return vpi;
}

// Derivada VPI (para Newton-Raphson)
function calcularDerivadaVPI(
  precio_compra: number,
  tasa_cupon: number,
  plazo: number,
  r: number
): number {
  const cupon_semi = tasa_cupon / 200;
  const y_semi = r / 2;
  let dvpi = 0;

  for (let t = 1; t <= plazo * 2; t++) {
    dvpi -= (t / 2) * cupon_semi / Math.pow(1 + y_semi, t + 1);
  }
  dvpi -= (plazo) * 100 / Math.pow(1 + y_semi, plazo * 2 + 1);

  return dvpi;
}

// Duración Macaulay
function calcularDuracion(
  tasa_cupon: number,
  plazo: number,
  tir: number
): number {
  const cupon_semi = tasa_cupon / 200;
  const y_semi = tir / 2;
  let suma_ponderada = 0;
  let suma_vpi = 0;

  for (let t = 1; t <= plazo * 2; t++) {
    const flujo = cupon_semi;
    const vpi_flujo = flujo / Math.pow(1 + y_semi, t);
    suma_ponderada += (t / 2) * vpi_flujo; // t en años
    suma_vpi += vpi_flujo;
  }
  // Rescate
  const vpi_rescate = 100 / Math.pow(1 + y_semi, plazo * 2);
  suma_ponderada += plazo * vpi_rescate;
  suma_vpi += vpi_rescate;

  return suma_vpi > 0 ? suma_ponderada / suma_vpi : plazo;
}

// Output vacío si error
function getEmptyOutput(): Outputs {
  return {
    cupones_totales_brutos: 0,
    numero_cupones: 0,
    cupones_netos_irpf: 0,
    flujo_semestral: 0,
    ganancia_capital_bruta: 0,
    impuesto_ganancia_capital: 0,
    ganancia_capital_neta: 0,
    tir_anual_bruta: 0,
    tir_anual_neta: 0,
    duracion_macaulay: 0,
    precio_si_tasas_suben: 100,
    perdida_precio_porcentaje: 0,
    resumen_tributacion: 0,
    rendimiento_total_neto: 0
  };
}
