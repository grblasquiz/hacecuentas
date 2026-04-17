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
  return {
    egfr: Number(egfr.toFixed(0)),
    etapa,
    dietaSugerida: dieta,
    resumen: `eGFR ${egfr.toFixed(0)} ml/min/1.73m² - ${etapa}`,
  };
}
