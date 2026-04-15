/** Frecuencia de baño recomendada para un perro */
export interface Inputs {
  tipoPelo?: string;
  actividad?: string;
  piel?: string;
}
export interface Outputs {
  frecuenciaDias: number;
  frecuenciaSemanas: string;
  consejos: string;
  detalle: string;
}

export function frecuenciaBanoPerro(i: Inputs): Outputs {
  const tipoPelo = String(i.tipoPelo || 'medio');
  const actividad = String(i.actividad || 'moderada');
  const piel = String(i.piel || 'normal');

  // Base en días por tipo de pelo
  let baseDias = 35; // medio
  if (tipoPelo === 'corto') baseDias = 49;
  else if (tipoPelo === 'largo') baseDias = 25;
  else if (tipoPelo === 'rizado') baseDias = 25;
  else if (tipoPelo === 'doble-capa') baseDias = 49;

  // Ajuste actividad
  if (actividad === 'alta') baseDias = Math.round(baseDias * 0.7);
  else if (actividad === 'interior') baseDias = Math.round(baseDias * 1.2);

  // Ajuste piel
  if (piel === 'sensible') baseDias = Math.round(baseDias * 1.2);
  else if (piel === 'grasa') baseDias = Math.round(baseDias * 0.8);

  // Mínimo 14 días, máximo 70 días
  baseDias = Math.max(14, Math.min(70, baseDias));

  const semanas = baseDias / 7;

  // Consejos específicos
  const consejosArr: string[] = [];
  if (tipoPelo === 'largo' || tipoPelo === 'rizado') {
    consejosArr.push('Cepillá diariamente para evitar nudos.');
  } else {
    consejosArr.push('Cepillá 2-3 veces por semana.');
  }
  if (tipoPelo === 'doble-capa') {
    consejosArr.push('En época de muda, cepillá diariamente y bañá al inicio y final de la muda.');
  }
  if (piel === 'sensible') {
    consejosArr.push('Usá shampoo hipoalergénico o de avena.');
  }
  if (piel === 'grasa') {
    consejosArr.push('Usá shampoo desengrasante veterinario.');
  }
  if (actividad === 'alta') {
    consejosArr.push('Limpiá las patas después de cada paseo.');
  }

  const semanasTexto = semanas < 2 ? `cada ~${Math.round(baseDias)} días` : `cada ~${semanas.toFixed(1)} semanas`;

  return {
    frecuenciaDias: baseDias,
    frecuenciaSemanas: semanasTexto,
    consejos: consejosArr.join(' '),
    detalle: `Para pelo ${tipoPelo}, actividad ${actividad} y piel ${piel}: bañalo ${semanasTexto} (~${baseDias} días). ${consejosArr.join(' ')}`,
  };
}
