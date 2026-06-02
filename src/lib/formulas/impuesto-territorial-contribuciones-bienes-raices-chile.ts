export interface Inputs {
  avalu_fiscal: number;
  tipo_propiedad: 'residencial' | 'no_residencial';
  aplica_recargo_conaf: boolean;
  tasa_recargo_conaf: number;
}

export interface Outputs {
  contribucion_anual: number;
  valor_cuota: number;
  recargo_conaf_anual: number;
  total_anual_con_recargo: number;
  tasa_efectiva: number;
  exento: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Tasas según SII 2026 Chile
  const TASA_RESIDENCIAL = 0.00933; // 0.933%
  const TASA_NO_RESIDENCIAL = 0.01075; // 1.075%
  const LIMITE_EXENCION_UF = 1857.5; // ~$45M UF 2026, aproximadamente $45.000.000
  const UF_2026 = 24216.05; // Valor UF promedio 2026
  const LIMITE_EXENCION_PESOS = LIMITE_EXENCION_UF * UF_2026; // $45.000.000 aprox
  const NUMERO_CUOTAS = 4;

  // Determinar exención
  let exento = 'No exento';
  if (i.avalu_fiscal < LIMITE_EXENCION_PESOS) {
    exento = 'Potencialmente exento (verificar con SII)';
  }

  // Seleccionar tasa según tipo de propiedad
  const tasa_aplicable =
    i.tipo_propiedad === 'residencial' ? TASA_RESIDENCIAL : TASA_NO_RESIDENCIAL;

  // Calcular contribución base anual
  const contribucion_anual = i.avalu_fiscal * tasa_aplicable;

  // Calcular recargo CONAF si aplica
  let recargo_conaf_anual = 0;
  if (i.aplica_recargo_conaf && i.tasa_recargo_conaf > 0) {
    recargo_conaf_anual = i.avalu_fiscal * (i.tasa_recargo_conaf / 100);
  }

  // Total anual con recargo
  const total_anual_con_recargo = contribucion_anual + recargo_conaf_anual;

  // Valor por cuota (pago en 4 períodos: marzo, junio, septiembre, diciembre)
  const valor_cuota = total_anual_con_recargo / NUMERO_CUOTAS;

  // Tasa efectiva (porcentaje total sobre avalúo)
  const tasa_efectiva = (total_anual_con_recargo / i.avalu_fiscal) * 100;

  const contribR = Math.round(contribucion_anual);
  const recargoR = Math.round(recargo_conaf_anual);
  const totalR = Math.round(total_anual_con_recargo);
  const cuotaR = Math.round(valor_cuota);
  const esPotExento = i.avalu_fiscal < LIMITE_EXENCION_PESOS;
  const fmtCL = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  // Insight dinámico: exención potencial vs contribución plena
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (esPotExento) {
    insightTone = 'good';
    insightText = `Tu avalúo fiscal (**${fmtCL(i.avalu_fiscal)}**) está bajo el límite exento de ~${fmtCL(LIMITE_EXENCION_PESOS)} (${LIMITE_EXENCION_UF.toLocaleString('es-CL')} UF): **probablemente no pagás contribuciones**. La estimación plena sería **${fmtCL(totalR)}/año** — confirmá tu situación en el SII.`;
  } else if (recargoR > 0) {
    insightTone = 'warn';
    insightText = `Pagás **${fmtCL(totalR)}/año** en 4 cuotas de **${fmtCL(cuotaR)}**: **${fmtCL(contribR)}** de contribución más **${fmtCL(recargoR)}** de recargo CONAF (tasa efectiva **${(Math.round(tasa_efectiva * 100) / 100).toFixed(2)}%** sobre el avalúo).`;
  } else {
    insightTone = 'neutral';
    insightText = `Tu contribución de bienes raíces es **${fmtCL(totalR)}/año**, que se paga en 4 cuotas de **${fmtCL(cuotaR)}** (abril, junio, septiembre y noviembre). Tasa efectiva: **${(Math.round(tasa_efectiva * 100) / 100).toFixed(2)}%** del avalúo fiscal.`;
  }

  const _insight = {
    title: 'Tus contribuciones anuales',
    text: insightText,
    tone: insightTone,
    icon: '🏡',
  };

  // Donut: solo cuando el recargo CONAF aporta una segunda parte real.
  const _chart = (recargoR > 0 && contribR > 0) ? {
    type: 'doughnut',
    slices: [
      { label: 'Contribución base', value: contribR },
      { label: 'Recargo CONAF', value: recargoR },
    ],
    prefix: '$',
    centerValue: fmtCL(totalR),
    centerLabel: 'Total anual',
    ariaLabel: `Total anual de ${fmtCL(totalR)}: contribución base ${fmtCL(contribR)} más recargo CONAF ${fmtCL(recargoR)}`,
  } : undefined;

  return {
    contribucion_anual: Math.round(contribucion_anual),
    valor_cuota: Math.round(valor_cuota),
    recargo_conaf_anual: Math.round(recargo_conaf_anual),
    total_anual_con_recargo: Math.round(total_anual_con_recargo),
    tasa_efectiva: Math.round(tasa_efectiva * 100) / 100,
    exento,
    _insight,
    _chart,
  };
}
