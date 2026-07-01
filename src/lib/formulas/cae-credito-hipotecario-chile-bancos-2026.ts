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
  _insight?: any;
  _chart?: any;
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

const UF_2026_REFERENCIAL = 40796; // Valor UF referencial junio 2026 — SII/Banco Central
const SEGURO_DESGRAVAMEN_TASA = 0.0025; // 0,25% anual del saldo — SVS 2026
const SEGURO_INCENDIO_TASA = 0.0018; // 0,18% anual valor asegurado — SMG
const GASTO_TASACION = 250000; // Gasto tasación, pago único
const ARANCEL_NOTARIAL = 0.004; // ~0,4% monto crédito

// CAE (Carga Anual Equivalente, CMF): tasa que iguala el valor presente de TODAS
// las cuotas reales (capital + interés + seguros + comisión, todas fijas) al monto
// neto que el deudor recibe. Bisección sobre la TIR mensual — el deudor paga una
// cuota fija, así que el flujo NO cambia con la tasa (el Newton-Raphson anterior
// recalculaba el interés con la tasa que buscaba → divergía a valores absurdos).
function calcularCAEAnual(
  cuotaMensualFija: number,
  principalNeto: number,
  plazo_meses: number
): number {
  if (cuotaMensualFija <= 0 || principalNeto <= 0 || plazo_meses <= 0) return 0;
  // VP de una anualidad decrece monótonamente con r → bisección directa.
  const vp = (r: number) =>
    r <= 0
      ? cuotaMensualFija * plazo_meses
      : cuotaMensualFija * (1 - Math.pow(1 + r, -plazo_meses)) / r;
  let lo = 1e-7;
  let hi = 1; // 100% mensual: techo holgado
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (vp(mid) > principalNeto) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100; // CAE anual en %
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

  // UF referencial para mostrar el equivalente del crédito (los seguros y la cuota
  // se calculan siempre en pesos).
  const uf_operativa = UF_2026_REFERENCIAL;

  // Gastos adicionales
  const arancel_notarial = monto_credito * ARANCEL_NOTARIAL;
  const gasto_tasacion = GASTO_TASACION;
  const monto_total_credito = monto_credito + arancel_notarial + gasto_tasacion;

  // Seguros anuales — primas en PESOS sobre el monto del crédito, no sobre el monto
  // expresado en UF (antes con moneda=uf daban primas ridículas de ~$4/año).
  const seguro_desgravamen_anual = monto_credito * SEGURO_DESGRAVAMEN_TASA;
  const seguro_incendio_anual = monto_credito * SEGURO_INCENDIO_TASA;
  const comision_anual = params_banco.comision_anual;

  // Plazo en meses
  const plazo_meses = i.plazo_anos * 12;

  // Componentes mensuales fijos (seguros: independientes del banco)
  const seguro_desgravamen_mensual = seguro_desgravamen_anual / 12;
  const seguro_incendio_mensual = seguro_incendio_anual / 12;
  const comision_mensual = comision_anual / 12;

  // Cuota total mensual para una tasa y comisión dadas (capital+interés+seguros+comisión)
  const cuotaTotalMensual = (tasa: number, comision_anual_banco: number) =>
    calcularCuotaMensual(monto_total_credito, tasa, plazo_meses) +
    seguro_desgravamen_mensual +
    seguro_incendio_mensual +
    comision_anual_banco / 12;

  // Cuota mensual (capital + interés) y total con seguros/comisión
  const cuota_base = calcularCuotaMensual(monto_total_credito, tasa_ajustada, plazo_meses);
  const cuota_mensual = cuotaTotalMensual(tasa_ajustada, comision_anual);

  // Total interés pagado
  const total_pagado = cuota_mensual * plazo_meses;
  const total_interes_pagado = total_pagado - monto_total_credito;

  // CAE real: TIR de la cuota fija contra el monto neto recibido (monto_credito)
  const cae_real = calcularCAEAnual(cuota_mensual, monto_credito, plazo_meses);

  // Comparativa entre bancos (misma fórmula, distinta tasa base y comisión)
  let banco_recomendado = params_banco.nombre;
  let cae_mejor = cae_real;

  for (const [key, banco] of Object.entries(PARAMETROS_BANCOS)) {
    const cae_temp = calcularCAEAnual(
      cuotaTotalMensual(banco.tasa_base, banco.comision_anual),
      monto_credito,
      plazo_meses
    );
    if (cae_temp < cae_mejor) {
      cae_mejor = cae_temp;
      banco_recomendado = banco.nombre;
    }
  }

  // Insight + gráfico
  const fmt = (n: number) => Math.round(n).toLocaleString('es-CL');
  const otroBancoMejor = banco_recomendado !== params_banco.nombre;
  const cuotaRedondeada = Math.round(cuota_mensual);
  const insight = {
    title: 'Lo que realmente vas a pagar',
    text: `Tu cuota mensual es **$${fmt(cuota_mensual)}** con un CAE real de **${(Math.round(cae_real * 100) / 100).toFixed(2)}%** (incluye seguros y comisión, por eso supera la tasa de ${tasa_ajustada.toFixed(2)}%). En total pagás **$${fmt(total_interes_pagado)}** de intereses sobre un crédito de $${fmt(monto_credito)}.${otroBancoMejor ? ` Ojo: **${banco_recomendado}** te daría un CAE más bajo.` : ` ${params_banco.nombre} es la opción más conveniente de las comparadas.`}`,
    tone: otroBancoMejor ? 'warn' : 'good',
    icon: '🏠',
  };
  const chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital + interés', value: Math.round(cuota_base) },
      { label: 'Seguro desgravamen', value: Math.round(seguro_desgravamen_mensual) },
      { label: 'Seguro incendio', value: Math.round(seguro_incendio_mensual) },
      { label: 'Comisión', value: Math.round(comision_mensual) },
    ],
    prefix: '$',
    centerValue: '$' + fmt(cuotaRedondeada),
    centerLabel: 'Cuota mensual',
    ariaLabel: 'Composición de la cuota mensual del crédito hipotecario entre capital, seguros y comisión',
  };

  return {
    monto_credito: Math.round(monto_credito),
    cae_real_anual: Math.round(cae_real * 100) / 100,
    cuota_mensual: Math.round(cuota_mensual),
    total_interes_pagado: Math.round(total_interes_pagado),
    seguro_desgravamen_prima: Math.round(seguro_desgravamen_anual),
    seguro_incendio_prima: Math.round(seguro_incendio_anual),
    comision_anual_estimada: Math.round(comision_anual),
    valor_uf_operativo: uf_operativa,
    banco_recomendado: banco_recomendado,
    _insight: insight,
    _chart: chart
  };
}
