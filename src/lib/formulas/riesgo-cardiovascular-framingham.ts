/** Score de Framingham simplificado */
export interface Inputs {
  edad: number; sexo: string; colesterolTotal: number; hdl: number;
  sistolica: number; fumador: string; diabetes: string;
}
export interface Outputs { riesgo10: string; clasificacion: string; recomendacion: string; mensaje: string; }

export function riesgoCardiovascularFramingham(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'masculino');
  const colTotal = Number(i.colesterolTotal);
  const hdl = Number(i.hdl);
  const sistolica = Number(i.sistolica);
  const fumador = i.fumador === 'si';
  const diabetes = i.diabetes === 'si';
  if (!edad || !colTotal || !hdl || !sistolica) throw new Error('Completá todos los campos');

  // Simplified Framingham point system
  let points = 0;

  // Age points
  if (sexo === 'masculino') {
    if (edad >= 70) points += 13;
    else if (edad >= 65) points += 11;
    else if (edad >= 60) points += 9;
    else if (edad >= 55) points += 8;
    else if (edad >= 50) points += 6;
    else if (edad >= 45) points += 4;
    else if (edad >= 40) points += 2;
    else if (edad >= 35) points += 1;
  } else {
    if (edad >= 70) points += 12;
    else if (edad >= 65) points += 10;
    else if (edad >= 60) points += 8;
    else if (edad >= 55) points += 7;
    else if (edad >= 50) points += 5;
    else if (edad >= 45) points += 3;
    else if (edad >= 40) points += 1;
  }

  // Cholesterol
  if (colTotal >= 280) points += 4;
  else if (colTotal >= 240) points += 3;
  else if (colTotal >= 200) points += 2;
  else if (colTotal >= 160) points += 1;

  // HDL (protective, lower score for higher HDL)
  if (hdl >= 60) points -= 1;
  else if (hdl < 40) points += 2;
  else if (hdl < 50) points += 1;

  // Blood pressure
  if (sistolica >= 160) points += 4;
  else if (sistolica >= 140) points += 3;
  else if (sistolica >= 130) points += 2;
  else if (sistolica >= 120) points += 1;

  // Smoking
  if (fumador) points += 3;

  // Diabetes
  if (diabetes) points += (sexo === 'masculino' ? 3 : 4);

  // Convert points to 10-year risk (simplified mapping)
  let riskPct: number;
  if (points <= 0) riskPct = 1;
  else if (points <= 4) riskPct = 2 + points;
  else if (points <= 8) riskPct = 5 + (points - 4) * 2;
  else if (points <= 12) riskPct = 13 + (points - 8) * 3;
  else if (points <= 16) riskPct = 25 + (points - 12) * 4;
  else riskPct = Math.min(50, 41 + (points - 16) * 3);

  // Sex adjustment (women generally lower risk)
  if (sexo === 'femenino') riskPct = Math.round(riskPct * 0.7);

  let clasificacion: string;
  let recomendacion: string;
  if (riskPct < 10) {
    clasificacion = '🟢 Riesgo bajo';
    recomendacion = 'Mantené hábitos saludables: ejercicio regular, dieta balanceada, no fumar. Control médico anual.';
  } else if (riskPct < 20) {
    clasificacion = '🟡 Riesgo moderado';
    recomendacion = 'Consultá a tu médico. Considerá cambios de estilo de vida agresivos. Posible medicación preventiva si hay factores no controlados.';
  } else {
    clasificacion = '🔴 Riesgo alto';
    recomendacion = 'Consultá a un cardiólogo. Probablemente necesites medicación (estatinas, antihipertensivos) además de cambios de estilo de vida.';
  }

  return {
    riesgo10: `${riskPct}%`,
    clasificacion,
    recomendacion,
    mensaje: `Riesgo cardiovascular a 10 años: ${riskPct}%. ${clasificacion}.`
  };
}