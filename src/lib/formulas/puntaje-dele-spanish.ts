/** Puntaje DELE de Español */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  totalPuntos: number;
  resultado: string;
  faltaTotal: number;
  faltaGrupoDebil: string;
}

export function puntajeDeleSpanish(i: Inputs): Outputs {
  const g1 = Number(i.grupo1) || 0;
  const g2 = Number(i.grupo2) || 0;
  if (g1 < 0 || g1 > 25 || g2 < 0 || g2 > 25) throw new Error('Puntajes 0-25');

  const total = g1 + g2;
  const aprobaTotal = total >= 30;
  const aprobaG1 = g1 >= 15;
  const aprobaG2 = g2 >= 15;
  const apto = aprobaTotal && aprobaG1 && aprobaG2;

  let res = apto ? '✅ APTO' : '❌ NO APTO';
  if (!apto) {
    const motivos: string[] = [];
    if (!aprobaTotal) motivos.push(`total ${total}<30`);
    if (!aprobaG1) motivos.push(`G1 ${g1}<15`);
    if (!aprobaG2) motivos.push(`G2 ${g2}<15`);
    res += ` — falla: ${motivos.join(', ')}`;
  }

  const faltaTotal = Math.max(0, 30 - total);
  let faltaGrupoDebil = '';
  if (g1 < 15 && g2 < 15) faltaGrupoDebil = `Ambos grupos: G1 necesita +${15-g1}, G2 +${15-g2}`;
  else if (g1 < 15) faltaGrupoDebil = `G1 necesita +${15-g1}`;
  else if (g2 < 15) faltaGrupoDebil = `G2 necesita +${15-g2}`;
  else faltaGrupoDebil = 'Ambos grupos aprobados';

  return {
    totalPuntos: total,
    resultado: res,
    faltaTotal,
    faltaGrupoDebil,
  };

}
