/** Riesgo de burnout - MBI simplificado */
export interface Inputs {
  ae1: string; ae2: string; ae3: string;
  dp1: string; dp2: string; dp3: string;
  rp1: string; rp2: string; rp3: string;
}
export interface Outputs {
  riesgo: string;
  agotamiento: string;
  despersonalizacion: string;
  realizacion: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function riesgoBurnoutLaboral(i: Inputs): Outputs {
  const ae = Number(i.ae1) + Number(i.ae2) + Number(i.ae3);
  const dp = Number(i.dp1) + Number(i.dp2) + Number(i.dp3);
  const rp = Number(i.rp1) + Number(i.rp2) + Number(i.rp3);

  // MBI cutoffs (adapted for 3 items each, scaled from 9-item subscales)
  const aeNivel = ae >= 13 ? 'Alto' : ae >= 7 ? 'Moderado' : 'Bajo';
  const dpNivel = dp >= 7 ? 'Alto' : dp >= 3 ? 'Moderado' : 'Bajo';
  const rpNivel = rp <= 8 ? 'Baja (preocupante)' : rp <= 14 ? 'Moderada' : 'Alta (buena)';

  let riesgoCount = 0;
  if (ae >= 13) riesgoCount++;
  if (dp >= 7) riesgoCount++;
  if (rp <= 8) riesgoCount++;

  let riesgo: string;
  if (riesgoCount >= 2) riesgo = '🔴 Riesgo alto de burnout';
  else if (riesgoCount === 1) riesgo = '🟡 Riesgo moderado de burnout';
  else riesgo = '🟢 Riesgo bajo de burnout';

  const tone = riesgoCount >= 2 ? 'warn' as const : riesgoCount === 1 ? 'neutral' as const : 'good' as const;
  const _insight = {
    title: 'Qué dice tu resultado',
    text: riesgoCount >= 2
      ? `Cumplís **${riesgoCount} de las 3 dimensiones** críticas del burnout (agotamiento ${aeNivel.toLowerCase()}, despersonalización ${dpNivel.toLowerCase()}). Es una señal clara de desgaste: no la dejes pasar y buscá apoyo profesional o un cambio de carga laboral.`
      : riesgoCount === 1
      ? `Cumplís **1 de las 3 dimensiones** del burnout. Todavía estás a tiempo de frenar: identificá qué subescala se disparó (agotamiento, despersonalización o baja realización) y actuá sobre esa causa antes de que se sumen las otras.`
      : `No cumplís ninguno de los **3 criterios** de burnout: tu agotamiento, trato hacia el trabajo y sentido de logro están en rangos sanos. Sostené tus límites y hábitos de descanso para que siga así.`,
    tone,
    icon: riesgoCount >= 2 ? '🔥' : riesgoCount === 1 ? '⚠️' : '🟢',
  };

  const _chart = {
    type: 'scale' as const,
    marker: riesgoCount,
    markerLabel: `${riesgoCount} de 3 dimensiones`,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Bajo', max: 1, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Moderado', max: 2, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alto', max: Math.max(3, riesgoCount + 0.5), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Riesgo de burnout: ${riesgoCount} de 3 dimensiones críticas presentes (0 bajo, 1 moderado, 2-3 alto)`,
  };

  return {
    riesgo,
    agotamiento: `${ae}/18 — ${aeNivel}`,
    despersonalizacion: `${dp}/18 — ${dpNivel}`,
    realizacion: `${rp}/18 — ${rpNivel}`,
    mensaje: `Agotamiento: ${aeNivel}. Despersonalización: ${dpNivel}. Realización: ${rpNivel}. ${riesgoCount >= 2 ? 'Se recomienda buscar ayuda profesional.' : ''}`,
    _insight,
    _chart,
  };
}