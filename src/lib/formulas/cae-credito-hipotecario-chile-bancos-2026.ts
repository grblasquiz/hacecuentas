export interface Inputs {
  precio_vivienda: number;
  monto_pie: number;
  plazo_anos: number;
  banco_seleccionado: string;
  moneda: string;
  tasa_anual_referencial: number;
}

export interface Outputs {
  monto_credito: number;
  cae_real_anual: number;
  cuota_mensual: number;
  total_interes_pagado: number;
  seguro_desgravamen_prima: number;
  seguro_incendio_prima: number;
  comision_anual_estimada: number;
  valor_uf_operativo: number;
  banco_recomendado: string;
}

// Parámetros 2026 Chile — fuentes SII, Banco Central, CMF
const PARAMETROS_BANCOS: Record<string, { tasa_base: number; comision_anual: number; nombre: string }> = {
  bancoestado: { tasa_base: 4.15, comision_anual: 150000, nombre: "BancoEstado" },
  bancochile: { tasa_base: 4.35, comision_anual: 180000, nombre: "Banco Chile" },
  santander: { tasa_base: 4.32, comision_anual: 175000, nombre: "Santander" },
  bci: { tasa_base: 4.42, comision_anual: 195000, nombre: "BCI" },
  itau: { tasa_base: 4.38, comision_anual: 190000, nombre: "Itaú" },
  scotiabank: { tasa_base: 4.45, comision_anual: 210000, nombre: "Scotiabank" }
};

const UF_2026_REFERENCIAL = 37455; // Valor UF referencial abril 2026 — Banco Central
const SEGURO_DESGRAVAMEN_TASA = 0.0025; // 0,25% anual del saldo — SVS 2026
const SEGURO_INCENDIO_TASA = 0.0018; // 0,18% anual valor asegurado — SMG
const GASTO_TASACION = 250000; // Gasto tasación, pago único
const ARANCEL_NOTARIAL = 0.004; // ~0,4% monto crédito

function calcularCAEIterativo(
  monto_credito: number,
  tasa_anual: number,
  plazo_meses: number,
  seguro_desgravamen_anual: number,
  seguro_incendio_anual: number,
  comision_anual: number
): number {
  const tasa_mensual_inicial = tasa_anual / 100 / 12;
  let cae_mensual = tasa_mensual_inicial;
  const gastos_mensuales = (seguro_desgravamen_anual + seguro_incendio_anual + comision_anual) / 12;

  // Newton-Raphson simplificado para hallar CAE
  for (let iter = 0; iter < 50; iter++) {
    let vpn = 0;
    let vpn_derivada = 0;
    let saldo = monto_credito;

    for (let mes = 1; mes <= plazo_meses; mes++) {
      const cuota_capital = (monto_credito / plazo_meses); // Simplificado lineal
      const interes = saldo * cae_mensual;
      const cuota_total = cuota_capital + interes + gastos_mensuales / 12;
      
      const descuento = Math.pow(1 + cae_mensual, -mes);
      vpn += cuota_total * descuento;
      vpn_derivada += -mes * cuota_total * descuento / (1 + cae_mensual);
      
      saldo -= cuota_capital;
    }

    const delta = vpn - monto_credito;
    if (Math.abs(delta) < 0.01) break;

    const ajuste = delta / (vpn_derivada || 0.0001);
    cae_mensual = Math.max(0.0001, cae_mensual - ajuste * 0.5);
  }

  return cae_mensual * 12 * 100; // CAE anual en %
}

function calcularCuotaMensual(
  monto_credito: number,
  tasa_anual: number,
  plazo_meses: number
): number {
  const tasa_mensual = tasa_anual / 100 / 12;
  if (tasa_mensual === 0) return monto_credito / plazo_meses;
  
  const factor = (tasa_mensual * Math.pow(1 + tasa_mensual, plazo_meses)) /
                 (Math.pow(1 + tasa_mensual, plazo_meses) - 1);
  return monto_credito * factor;
}

export function compute(i: Inputs): Outputs {
  // Validaciones
  if (i.precio_vivienda <= 0 || i.plazo_anos <= 0) {
    return {
      monto_credito: 0,
      cae_real_anual: 0,
      cuota_mensual: 0,
      total_interes_pagado: 0,
      seguro_desgravamen_prima: 0,
      seguro_incendio_prima: 0,
      comision_anual_estimada: 0,
      valor_uf_operativo: UF_2026_REFERENCIAL,
      banco_recomendado: "N/A"
    };
  }

  // Cálculo de monto crédito
  const monto_credito = i.precio_vivienda - i.monto_pie;
  if (monto_credito <= 0) {
    return {
      monto_credito: 0,
      cae_real_anual: 0,
      cuota_mensual: 0,
      total_interes_pagado: 0,
      seguro_desgravamen_prima: 0,
      seguro_incendio_prima: 0,
      comision_anual_estimada: 0,
      valor_uf_operativo: UF_2026_REFERENCIAL,
      banco_recomendado: "Pie mayor que vivienda"
    };
  }

  // Parámetros banco seleccionado
  const params_banco = PARAMETROS_BANCOS[i.banco_seleccionado] || PARAMETROS_BANCOS.bancochile;
  const tasa_ajustada = i.tasa_anual_referencial > 0 ? i.tasa_anual_referencial : params_banco.tasa_base;

  // Monto en UF si aplica
  let monto_operativo = monto_credito;
  let uf_operativa = UF_2026_REFERENCIAL;
  if (i.moneda === "uf") {
    monto_operativo = monto_credito / uf_operativa;
  }

  // Gastos adicionales
  const arancel_notarial = monto_credito * ARANCEL_NOTARIAL;
  const gasto_tasacion = GASTO_TASACION;
  const monto_total_credito = monto_credito + arancel_notarial + gasto_tasacion;

  // Seguros anuales
  const seguro_desgravamen_anual = monto_operativo * SEGURO_DESGRAVAMEN_TASA;
  const seguro_incendio_anual = monto_operativo * SEGURO_INCENDIO_TASA;
  const comision_anual = params_banco.comision_anual;

  // Plazo en meses
  const plazo_meses = i.plazo_anos * 12;

  // Cuota mensual (capital + interés)
  const cuota_base = calcularCuotaMensual(monto_total_credito, tasa_ajustada, plazo_meses);

  // Cuota con seguros y comisión
  const seguro_desgravamen_mensual = seguro_desgravamen_anual / 12;
  const seguro_incendio_mensual = seguro_incendio_anual / 12;
  const comision_mensual = comision_anual / 12;
  const cuota_mensual = cuota_base + seguro_desgravamen_mensual + seguro_incendio_mensual + comision_mensual;

  // Total interés pagado
  const total_pagado = cuota_mensual * plazo_meses;
  const total_interes_pagado = total_pagado - monto_total_credito;

  // CAE real (iterativo)
  const cae_real = calcularCAEIterativo(
    monto_total_credito,
    tasa_ajustada,
    plazo_meses,
    seguro_desgravamen_anual,
    seguro_incendio_anual,
    comision_anual
  );

  // Comparativa simple entre bancos (simulación)
  let banco_recomendado = params_banco.nombre;
  let cae_mejor = cae_real;
  
  for (const [key, banco] of Object.entries(PARAMETROS_BANCOS)) {
    const cae_temp = calcularCAEIterativo(
      monto_total_credito,
      banco.tasa_base,
      plazo_meses,
      seguro_desgravamen_anual,
      seguro_incendio_anual,
      banco.comision_anual
    );
    if (cae_temp < cae_mejor) {
      cae_mejor = cae_temp;
      banco_recomendado = banco.nombre;
    }
  }

  return {
    monto_credito: Math.round(monto_credito),
    cae_real_anual: Math.round(cae_real * 100) / 100,
    cuota_mensual: Math.round(cuota_mensual),
    total_interes_pagado: Math.round(total_interes_pagado),
    seguro_desgravamen_prima: Math.round(seguro_desgravamen_anual),
    seguro_incendio_prima: Math.round(seguro_incendio_anual),
    comision_anual_estimada: Math.round(comision_anual),
    valor_uf_operativo: uf_operativa,
    banco_recomendado: banco_recomendado
  };
}
