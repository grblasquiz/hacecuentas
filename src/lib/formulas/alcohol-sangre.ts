/** Alcohol en sangre (BAC) — fórmula Widmark */
export interface Inputs {
  peso: number;
  sexo: 'm' | 'f' | string;
  gramosAlcohol: number;
  horasDesdeInicio?: number;
}
export interface Outputs {
  bac: number;
  nivelMensaje: string;
  puedeManejar: boolean;
  horasHastaCero: number;
}

export function alcoholSangre(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const sexo = String(i.sexo || 'm');
  const gramos = Number(i.gramosAlcohol);
  const horas = Number(i.horasDesdeInicio) || 0;
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');
  if (gramos < 0) throw new Error('Gramos de alcohol inválidos');

  // r de Widmark
  const r = sexo === 'f' ? 0.55 : 0.68;

  // BAC inicial en g/L
  let bac = gramos / (peso * r);
  // Eliminación promedio: 0.15 g/L por hora
  bac = Math.max(0, bac - 0.15 * horas);

  let msg = '';
  let puede = false;
  if (bac === 0) { msg = 'Sin alcohol en sangre.'; puede = true; }
  else if (bac < 0.2) { msg = 'Bajo — por debajo del límite general para conductores.'; puede = true; }
  else if (bac < 0.5) { msg = 'Entre 0.2 y 0.5 g/L — prohibido para conductores profesionales, motos y bicicletas (Ley 27.714, Alcohol Cero al Volante).'; puede = false; }
  else if (bac < 0.8) { msg = 'Riesgo alto — pérdida de reflejos, coordinación comprometida.'; puede = false; }
  else if (bac < 1.5) { msg = 'Embriaguez marcada — no manejes.'; puede = false; }
  else { msg = 'Nivel peligroso — riesgo de intoxicación aguda.'; puede = false; }

  // Horas hasta cero
  const horasAcero = bac / 0.15;

  return {
    bac: Number(bac.toFixed(2)),
    nivelMensaje: msg,
    puedeManejar: puede,
    horasHastaCero: Number(horasAcero.toFixed(1)),
  };
}
