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

  return {
    riesgo,
    agotamiento: `${ae}/18 — ${aeNivel}`,
    despersonalizacion: `${dp}/18 — ${dpNivel}`,
    realizacion: `${rp}/18 — ${rpNivel}`,
    mensaje: `Agotamiento: ${aeNivel}. Despersonalización: ${dpNivel}. Realización: ${rpNivel}. ${riesgoCount >= 2 ? 'Se recomienda buscar ayuda profesional.' : ''}`
  };
}