/**
 * eGFR CKD-EPI 2021 simplificada.
 */

export interface CreatininaFuncionRenalInputs {
  creatinina: number;
  edad: number;
  sexo: string;
}

export interface CreatininaFuncionRenalOutputs {
  egfr: number;
  etapa: string;
  dietaSugerida: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function creatininaFuncionRenal(inputs: CreatininaFuncionRenalInputs): CreatininaFuncionRenalOutputs {
  const cr = Number(inputs.creatinina);
  const edad = Number(inputs.edad);
  const sexo = inputs.sexo || 'mujer';
  if (!cr || cr <= 0 || !edad || edad <= 0) throw new Error('Datos inválidos');
  const k = sexo === 'mujer' ? 0.7 : 0.9;
  const a = sexo === 'mujer' ? -0.241 : -0.302;
  const minRatio = Math.min(cr / k, 1);
  const maxRatio = Math.max(cr / k, 1);
  const egfr = 142 * Math.pow(minRatio, a) * Math.pow(maxRatio, -1.200) * Math.pow(0.9938, edad) * (sexo === 'mujer' ? 1.012 : 1);
  let etapa: string, dieta: string;
  if (egfr >= 90) { etapa = 'G1 - Normal ✅'; dieta = 'Mediterránea/DASH. Proteína normal.'; }
  else if (egfr >= 60) { etapa = 'G2 - Leve'; dieta = 'DASH, control HTA/DM.'; }
  else if (egfr >= 45) { etapa = 'G3a - Leve-moderada ⚠️'; dieta = 'Proteína 0.8g/kg, sodio <2300mg.'; }
  else if (egfr >= 30) { etapa = 'G3b - Moderada-severa ⚠️'; dieta = 'Proteína 0.8g/kg, sodio, fósforo controlados.'; }
  else if (egfr >= 15) { etapa = 'G4 - Severa 🚨'; dieta = 'Proteína 0.6g/kg con nutricionista renal.'; }
  else { etapa = 'G5 - Falla renal 🚨'; dieta = 'Diálisis: dieta especializada.'; }
  const egfrRound = Number(egfr.toFixed(0));
  const tone = egfr >= 60 ? 'good' : egfr >= 30 ? 'warn' : 'warn';
  let insightText: string;
  if (egfr >= 90) {
    insightText = `Tu filtrado glomerular estimado es **${egfrRound} ml/min/1.73m²**, dentro del rango normal (**G1**). Mantené hidratación y controles de rutina.`;
  } else if (egfr >= 60) {
    insightText = `Tu eGFR de **${egfrRound} ml/min/1.73m²** indica una reducción leve (**G2**). Sin daño renal asociado suele ser normal; controlá presión y glucemia.`;
  } else if (egfr >= 30) {
    insightText = `Un eGFR de **${egfrRound} ml/min/1.73m²** ubica tu función renal en **${etapa.replace(/\s*[⚠️🚨✅]+\s*$/, '').trim()}**. Conviene seguimiento nefrológico y ajustar la dieta.`;
  } else {
    insightText = `Un eGFR de **${egfrRound} ml/min/1.73m²** corresponde a una **falla renal avanzada (${etapa.replace(/\s*[⚠️🚨✅]+\s*$/, '').trim()})**. Requiere control nefrológico especializado de forma prioritaria.`;
  }
  const _insight = {
    title: 'Tu función renal estimada',
    text: insightText,
    tone,
    icon: '🩺',
  };
  const _chart = {
    type: 'scale',
    marker: egfrRound,
    markerLabel: `${egfrRound} ml/min`,
    min: 0,
    segments: [
      { nombre: 'G5 falla', max: 15, color: '#b91c1c', colorDark: '#7f1d1d' },
      { nombre: 'G4 severa', max: 30, color: '#dc2626', colorDark: '#991b1b' },
      { nombre: 'G3 moderada', max: 60, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'G2 leve', max: 90, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'G1 normal', max: Math.max(120, egfrRound + 1), color: '#16a34a', colorDark: '#15803d' },
    ],
    ariaLabel: `Filtrado glomerular ${egfrRound} ml/min/1.73m² ubicado en la etapa ${etapa}`,
  };
  return {
    egfr: egfrRound,
    etapa,
    dietaSugerida: dieta,
    resumen: `eGFR ${egfr.toFixed(0)} ml/min/1.73m² - ${etapa}`,
    _insight,
    _chart,
  };
}
