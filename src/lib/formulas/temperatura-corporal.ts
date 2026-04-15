/** Clasificación de temperatura corporal y fiebre por método de medición */
export interface Inputs {
  temperatura: number; // °C
  metodo?: string; // 'oral', 'axilar', 'rectal', 'timpanico', 'frontal'
  edad?: number;
}
export interface Outputs {
  categoria: string;
  temperaturaCorregida: number; // ajustada a equivalente oral
  temperaturaRectalEquiv: number;
  fahrenheit: number;
  recomendacion: string;
  cuandoConsultar: string;
  resumen: string;
}

export function temperaturaCorporal(i: Inputs): Outputs {
  const t = Number(i.temperatura);
  const metodo = String(i.metodo || 'axilar');
  const edad = i.edad !== undefined ? Number(i.edad) : 99; // si no hay edad, asumir adulto

  if (!t || t < 25 || t > 45) throw new Error('Temperatura entre 25 y 45 °C');

  // Conversión a equivalente oral (axilar suele ser ~0.5 °C menos que oral)
  // Rectal ~0.5 °C más que oral. Timpánico ~similar a rectal.
  let oralEquiv = t;
  if (metodo === 'axilar') oralEquiv = t + 0.5;
  else if (metodo === 'rectal') oralEquiv = t - 0.5;
  else if (metodo === 'timpanico') oralEquiv = t - 0.3;
  else if (metodo === 'frontal') oralEquiv = t + 0.2;

  const rectalEquiv = oralEquiv + 0.5;

  // Clasificación basada en temperatura oral equivalente
  let categoria = '';
  let recomendacion = '';
  let cuandoConsultar = '';

  if (oralEquiv < 35.0) {
    categoria = 'Hipotermia';
    recomendacion = 'Abrigar, dar bebidas tibias (no alcohol), evitar movimientos bruscos. Si está por debajo de 35 °C oral, consultá guardia.';
    cuandoConsultar = 'Siempre — la hipotermia es una urgencia médica.';
  } else if (oralEquiv < 36.0) {
    categoria = 'Subnormal (límite bajo)';
    recomendacion = 'Puede ser normal por la mañana o tras dormir. Si te sentís mal, hidratate y abrigate.';
    cuandoConsultar = 'Si persiste con síntomas (mareos, fatiga, palidez).';
  } else if (oralEquiv <= 37.4) {
    categoria = 'Normal';
    recomendacion = 'Tu temperatura está dentro del rango normal (36.0–37.4 °C oral).';
    cuandoConsultar = 'Si aparecen otros síntomas, consultá igualmente.';
  } else if (oralEquiv < 38.0) {
    categoria = 'Febrícula (37.5–37.9 °C)';
    recomendacion = 'No es fiebre franca, pero indica que algo está pasando. Hidratate, descansá y volvé a tomar la temperatura en 1–2 h.';
    cuandoConsultar = 'Si persiste más de 48 h o se acompaña de otros síntomas.';
  } else if (oralEquiv < 39.0) {
    categoria = 'Fiebre moderada (38.0–38.9 °C)';
    recomendacion = 'Hidratate bien, descansá, ropa liviana. Antitérmico si te sentís mal (paracetamol o ibuprofeno según indicación médica).';
    cuandoConsultar = `${edad < 3/12 ? 'En menores de 3 meses, SIEMPRE consultá guardia con cualquier fiebre.' : 'Si dura más de 3 días, si hay dificultad respiratoria, vómitos persistentes o decaimiento marcado.'}`;
  } else if (oralEquiv < 40.0) {
    categoria = 'Fiebre alta (39.0–39.9 °C)';
    recomendacion = 'Antitérmico, hidratación abundante, baño tibio (no frío). Reposo en cama.';
    cuandoConsultar = `Consultá médico${edad < 18 ? ' especialmente si es un niño' : ''}, sobre todo si dura más de 24 h o aparece confusión, rigidez de cuello o erupción.`;
  } else {
    categoria = 'Hiperpirexia (≥ 40 °C)';
    recomendacion = 'Acudí a una guardia médica. Mientras tanto: antitérmico, baño tibio, hidratación.';
    cuandoConsultar = 'Inmediatamente — la hiperpirexia puede causar daño neurológico.';
  }

  // Aviso especial para bebés
  if (edad < 3/12 && oralEquiv >= 38.0) {
    cuandoConsultar = 'URGENTE: en menores de 3 meses cualquier fiebre ≥ 38 °C requiere consulta inmediata por riesgo de infección bacteriana severa.';
  }

  return {
    categoria,
    temperaturaCorregida: Number(oralEquiv.toFixed(1)),
    temperaturaRectalEquiv: Number(rectalEquiv.toFixed(1)),
    fahrenheit: Number((t * 9 / 5 + 32).toFixed(1)),
    recomendacion,
    cuandoConsultar,
    resumen: `${t} °C ${metodo} → ${categoria} (equivalente oral: ${oralEquiv.toFixed(1)} °C / ${(t * 9 / 5 + 32).toFixed(1)} °F).`,
  };
}
