export interface Inputs {
  deuda_inicial: number;        // euros
  tin_anual: number;            // %
  cuota_mensual: number;        // euros
  meses_maximo: number;         // meses
}

export interface Outputs {
  meses_pago: number;
  cuota_minima_inicial: number;
  intereses_totales: number;
  total_a_pagar: number;
  ratio_interes: number;
  alerta_usura: string;
  ahorro_acelerado: number;
  tasa_mensual: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validar inputs
  const deuda = Math.max(0, i.deuda_inicial || 0);
  const tin = Math.max(0, Math.min(100, i.tin_anual || 20));
  const cuota = Math.max(1, i.cuota_mensual || deuda * 0.03);
  const maxMeses = Math.max(12, i.meses_maximo || 120);

  // Tasa de interés mensual
  const tasaMensual = tin / 100 / 12;

  // Cuota mínima inicial (3% del saldo inicial)
  const cuotaMinimaInicial = deuda * 0.03;

  // Simulación mes a mes
  let saldo = deuda;
  let interesesTotales = 0;
  let mesesCalculo = 0;

  for (let mes = 1; mes <= maxMeses; mes++) {
    if (saldo <= 0) break;

    // Interés del mes
    const interesMes = saldo * tasaMensual;
    interesesTotales += interesMes;
    saldo = saldo + interesMes - cuota;
    mesesCalculo = mes;
  }

  // Si el saldo no se amortiza en maxMeses, mantener contador
  const mesesPago = saldo > 0 ? maxMeses : mesesCalculo;

  // Total a pagar (si se amortiza en maxMeses)
  const totalAPagar = deuda + interesesTotales;

  // Ratio de intereses
  const ratioInteres = deuda > 0 ? (interesesTotales / deuda) * 100 : 0;

  // Alerta usura (TJSC aprox > 21%)
  // TJSC ≈ TIN + comisiones. Simplificado: si TIN > 21%, alerta
  let alertaUsura = "Sin alerta";
  if (tin > 21) {
    alertaUsura = "⚠️ TIN > 21% (umbral usura jurisprudencia). Considera reclamar ante juzgado mercantil.";
  } else if (tin > 18) {
    alertaUsura = "⚠️ TIN alto. Compara con media mercado (16-18%)";
  }

  // Ahorro acelerado (duplicar cuota)
  let saldoAcelerado = deuda;
  let interesesAcelerado = 0;
  const cuotaDoblada = cuota * 2;

  for (let mes = 1; mes <= maxMeses && saldoAcelerado > 0; mes++) {
    const interesMes = saldoAcelerado * tasaMensual;
    interesesAcelerado += interesMes;
    saldoAcelerado = saldoAcelerado + interesMes - cuotaDoblada;
  }

  const ahorroAcelerado = Math.max(0, interesesTotales - interesesAcelerado);

  const fmtEur = (n: number) => '€' + Math.round(n).toLocaleString('es-ES');
  const noAmortiza = saldo > 0;
  const anios = (mesesPago / 12).toFixed(1);

  let insightTone: 'good' | 'warn' | 'neutral' = 'neutral';
  let insightText = '';
  if (noAmortiza) {
    insightTone = 'warn';
    insightText = `Con una cuota de **${fmtEur(cuota)}/mes** la deuda **no se amortiza** en ${maxMeses} meses: los intereses crecen casi tan rápido como pagás. Subí la cuota o el revolving se vuelve perpetuo.`;
  } else if (tin > 21) {
    insightTone = 'warn';
    insightText = `Pagarías **${fmtEur(interesesTotales)}** de intereses sobre **${fmtEur(deuda)}** de deuda (${Math.round(ratioInteres)}% extra) en ${mesesPago} meses. Con un TIN del **${tin}%** estás por encima del umbral de usura: podés reclamar judicialmente.`;
  } else if (ratioInteres >= 30) {
    insightTone = 'warn';
    insightText = `En ${mesesPago} meses (${anios} años) pagarías **${fmtEur(interesesTotales)}** solo de intereses, un **${Math.round(ratioInteres)}%** sobre la deuda. Duplicando la cuota ahorrarías **${fmtEur(ahorroAcelerado)}**.`;
  } else {
    insightTone = 'good';
    insightText = `Saldás la deuda en **${mesesPago} meses** pagando **${fmtEur(interesesTotales)}** de intereses (${Math.round(ratioInteres)}% sobre el capital). Ritmo razonable para un revolving.`;
  }

  const _insight = {
    title: 'Qué significa este resultado',
    text: insightText,
    tone: insightTone,
    icon: '💳',
  };

  const _chart = noAmortiza ? undefined : {
    type: 'doughnut' as const,
    slices: [
      { label: 'Deuda original', value: Math.round(deuda * 100) / 100 },
      { label: 'Intereses', value: Math.round(interesesTotales * 100) / 100 },
    ],
    prefix: '€',
    centerValue: fmtEur(totalAPagar),
    centerLabel: 'Total a pagar',
    ariaLabel: 'Composición del total a pagar: deuda original más intereses del revolving.',
  };

  return {
    meses_pago: mesesPago,
    cuota_minima_inicial: Math.round(cuotaMinimaInicial * 100) / 100,
    intereses_totales: Math.round(interesesTotales * 100) / 100,
    total_a_pagar: Math.round(totalAPagar * 100) / 100,
    ratio_interes: Math.round(ratioInteres * 100) / 100,
    alerta_usura: alertaUsura,
    ahorro_acelerado: Math.round(ahorroAcelerado * 100) / 100,
    tasa_mensual: Math.round(tasaMensual * 10000) / 100,
    _insight,
    _chart,
  };
}
