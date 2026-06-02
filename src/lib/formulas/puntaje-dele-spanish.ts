/** Puntaje DELE de Español */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  totalPuntos: number;
  resultado: string;
  faltaTotal: number;
  faltaGrupoDebil: string;
  _insight?: any;
  _chart?: any;
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

  const tone = apto ? 'good' : 'warn';
  const insightText = apto
    ? `Total **${total}/50** con G1 ${g1} y G2 ${g2}: aprobás. El DELE exige **30 puntos** y un mínimo de **15 en cada grupo**, y cumplís ambas condiciones.`
    : !aprobaTotal
    ? `Total **${total}/50**: te faltan **${faltaTotal} puntos** para el mínimo de 30. ${faltaGrupoDebil === 'Ambos grupos aprobados' ? '' : faltaGrupoDebil + '. '}Ojo: aprobar el total no alcanza si un grupo queda por debajo de 15.`
    : `Total **${total}/50** alcanza el mínimo, pero no aprobás: ${faltaGrupoDebil}. El DELE pide al menos **15 puntos en cada grupo**, no solo el total.`;

  return {
    totalPuntos: total,
    resultado: res,
    faltaTotal,
    faltaGrupoDebil,
    _insight: { title: apto ? 'Apto en el DELE' : 'No alcanza el mínimo', text: insightText, tone, icon: '🇪🇸' },
    _chart: {
      type: 'scale',
      marker: total,
      markerLabel: `${total}/50`,
      min: 0,
      segments: [
        { nombre: 'No apto (0-29)', max: 29, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Apto (30-50)', max: 50.5, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Puntaje DELE ${total} de 50, mínimo para aprobar 30`,
    },
  };

}
