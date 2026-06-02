export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function mbaRoiRetornoInversionArgentinaEvaluacion(i: Inputs): Outputs {
  const c=Number(i.costoMba)||0; const sa=Number(i.sueldoActual)||0; const sp=Number(i.sueldoPostEsperado)||0;
  const aumento=sp-sa;
  const roi=aumento>0?c/aumento:Infinity;
  let rec='';
  if(roi<3) rec='ROI muy bueno. Hacelo si te interesa.';
  else if(roi<7) rec='ROI razonable. Pensalo bien si el network+oportunidades compensan.';
  else rec='ROI lento. Evaluá alternativas: master específico o online.';

  let insight: any;
  if (aumento <= 0) {
    insight = {
      title: 'El MBA no se paga solo',
      text: `Con el sueldo post-MBA igual o menor al actual, la inversión de **USD ${c.toLocaleString('en-US')}** no se recupera vía salario. Revisá el aumento esperado o justificá el MBA por otras vías (network, cambio de industria).`,
      tone: 'warn',
      icon: '🎓',
    };
  } else {
    const tone = roi < 3 ? 'good' : roi < 7 ? 'neutral' : 'warn';
    insight = {
      title: 'Cuánto tarda en repagarse',
      text: `Con un salto salarial de **USD ${aumento.toLocaleString('en-US')}/año**, los **USD ${c.toLocaleString('en-US')}** del MBA se recuperan en **${roi.toFixed(1)} años**. ${roi < 3 ? 'Repago rápido: la inversión luce muy sólida.' : roi < 7 ? 'Repago razonable: pesá si el network y las oportunidades compensan los años de espera.' : 'Repago lento: evaluá un máster más específico u online antes de comprometerte.'}`,
      tone,
      icon: roi < 3 ? '🚀' : roi < 7 ? '🎓' : '⏳',
    };
  }

  const chart = isFinite(roi)
    ? {
        type: 'scale' as const,
        marker: Number(roi.toFixed(1)),
        markerLabel: `${roi.toFixed(1)} años`,
        min: 0,
        segments: [
          { nombre: 'Muy bueno', max: 3, color: '#16a34a', colorDark: '#22c55e' },
          { nombre: 'Razonable', max: 7, color: '#f59e0b', colorDark: '#fbbf24' },
          { nombre: 'Lento', max: Math.max(12, Math.ceil(roi) + 1), color: '#dc2626', colorDark: '#ef4444' },
        ],
        ariaLabel: `Años de repago del MBA: ${roi.toFixed(1)}. Hasta 3 muy bueno, hasta 7 razonable, más de 7 lento.`,
      }
    : undefined;

  return { aumentoAnual:`USD ${aumento.toLocaleString('en-US')}/año`, roiAnios:`${roi.toFixed(1)} años`, recomendacion:rec, _insight: insight, _chart: chart };
}
