/** Ratio cintura/altura (WHtR) para evaluar riesgo metabólico */
export interface Inputs {
  cintura: number;
  altura: number;
}
export interface Outputs {
  whtr: number;
  categoria: string;
  riesgo: string;
  detalle: string;
}

export function cinturaAlturaWhtr(i: Inputs): Outputs {
  const cintura = Number(i.cintura);
  const altura = Number(i.altura);

  if (!cintura || cintura <= 0) throw new Error('Ingresá el perímetro de cintura');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');

  const whtr = cintura / altura;

  let categoria = '';
  let riesgo = '';

  if (whtr < 0.4) {
    categoria = 'Delgadez extrema';
    riesgo = 'Bajo peso — consultá con un profesional';
  } else if (whtr < 0.5) {
    categoria = 'Saludable';
    riesgo = 'Bajo';
  } else if (whtr < 0.6) {
    categoria = 'Sobrepeso abdominal';
    riesgo = 'Aumentado';
  } else {
    categoria = 'Obesidad abdominal';
    riesgo = 'Alto';
  }

  const cinturaIdeal = Math.round(altura * 0.5);
  const diff = Math.round(cintura - cinturaIdeal);

  const detalle = whtr < 0.5
    ? `Tu WHtR es ${whtr.toFixed(2)} — estás en zona saludable. Tu cintura ideal máxima sería ${cinturaIdeal} cm.`
    : `Tu WHtR es ${whtr.toFixed(2)} — riesgo ${riesgo.toLowerCase()}. Deberías reducir ${diff} cm de cintura para llegar a la zona saludable (${cinturaIdeal} cm).`;

  return {
    whtr: Number(whtr.toFixed(2)),
    categoria,
    riesgo,
    detalle,
  };
}
