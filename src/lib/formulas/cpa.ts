/** CPA, CAC y LTV:CAC */
export interface Inputs {
  inversion: number;
  conversiones: number;
  ltv?: number;
}
export interface Outputs {
  cpa: number;
  ratioLtvCac: number;
  paybackMeses: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function cpa(i: Inputs): Outputs {
  const inv = Number(i.inversion);
  const conv = Number(i.conversiones);
  const ltv = Number(i.ltv) || 0;
  if (!inv || inv <= 0) throw new Error('Ingresá la inversión');
  if (!conv || conv <= 0) throw new Error('Ingresá las conversiones');

  const cpaVal = inv / conv;
  const ratio = ltv > 0 ? ltv / cpaVal : 0;
  const payback = ltv > 0 ? (cpaVal / (ltv / 12)) : 0;

  let mensaje = '';
  if (ltv === 0) mensaje = `CPA: $${cpaVal.toFixed(0)}. Ingresá el LTV para evaluar si es rentable.`;
  else if (ratio >= 3) mensaje = `Ratio LTV:CAC de ${ratio.toFixed(1)}x — saludable (ideal 3:1 o más).`;
  else if (ratio >= 1) mensaje = `Ratio ${ratio.toFixed(1)}x — cubre el costo pero necesita mejorar. Objetivo: 3x.`;
  else mensaje = `Ratio ${ratio.toFixed(1)}x — cada cliente cuesta más que lo que deja. Insostenible.`;

  let _insight: any;
  if (ltv === 0) {
    _insight = {
      title: 'Tu costo por adquisición',
      text: `Cada cliente nuevo te cuesta **$${cpaVal.toFixed(0)}** (CPA). Cargá el **LTV** (lo que deja un cliente en toda su vida) para saber si ese costo es rentable o estás perdiendo plata.`,
      tone: 'neutral',
      icon: '🎯',
    };
  } else if (ratio >= 3) {
    _insight = {
      title: 'Adquisición saludable',
      text: `Por cada **$${cpaVal.toFixed(0)}** que invertís en captar un cliente recuperás **$${ltv.toFixed(0)}**: un ratio LTV:CAC de **${ratio.toFixed(1)}x**, por encima del 3x ideal. Tenés margen para escalar la inversión.`,
      tone: 'good',
      icon: '🚀',
    };
  } else if (ratio >= 1) {
    _insight = {
      title: 'Rentable pero ajustado',
      text: `Tu ratio LTV:CAC es **${ratio.toFixed(1)}x**: cubrís el costo de adquisición pero con poco margen (el objetivo sano es 3x). Bajá el CPA de **$${cpaVal.toFixed(0)}** o subí el LTV antes de pisar el acelerador.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: 'Adquisición insostenible',
      text: `Cada cliente te cuesta **$${cpaVal.toFixed(0)}** pero solo deja **$${ltv.toFixed(0)}**: ratio de **${ratio.toFixed(1)}x**, perdés plata en cada venta. Frená la inversión hasta corregir el CPA o el LTV.`,
      tone: 'warn',
      icon: '🔴',
    };
  }

  const out: Outputs = {
    cpa: Math.round(cpaVal),
    ratioLtvCac: Number(ratio.toFixed(2)),
    paybackMeses: Number(payback.toFixed(1)),
    mensaje,
    _insight,
  };

  if (ltv > 0) {
    out._chart = {
      type: 'scale',
      marker: Number(ratio.toFixed(2)),
      markerLabel: `${ratio.toFixed(1)}x`,
      min: 0,
      segments: [
        { nombre: 'Insostenible', max: 1, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Ajustado', max: 3, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Saludable', max: Math.max(5, Math.ceil(ratio) + 1), color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Ratio LTV:CAC de ${ratio.toFixed(1)}x en una escala de salud de adquisición`,
    };
  }

  return out;
}
