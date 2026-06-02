/** Compost: ratio Carbono/Nitrógeno */
export interface Inputs { kgVerde: number; kgMarron: number; }
export interface Outputs { ratioCN: string; estado: string; ajuste: string; tiempoEstimado: string; _insight?: any; _chart?: any; }

export function compostProporcionCarbonoNitrogeno(i: Inputs): Outputs {
  const verde = Number(i.kgVerde);
  const marron = Number(i.kgMarron);
  if (verde <= 0 && marron <= 0) throw new Error('Ingresá al menos un material');

  // Verde promedio C:N = 15:1, Marrón promedio C:N = 60:1
  const cVerde = verde * 15;
  const nVerde = verde * 1;
  const cMarron = marron * 60;
  const nMarron = marron * 1;
  const totalC = cVerde + cMarron;
  const totalN = nVerde + nMarron;
  const ratio = totalN > 0 ? totalC / totalN : 999;

  let estado = '';
  let ajuste = '';
  let tiempo = '';

  if (ratio >= 25 && ratio <= 35) {
    estado = 'Excelente — ratio ideal para compostaje rápido';
    ajuste = 'No necesitás ajustar. Revolvé cada 1-2 semanas y mantené húmedo.';
    tiempo = '2–4 meses';
  } else if (ratio < 25) {
    const kgMarronExtra = ((25 * totalN - totalC) / 60);
    estado = 'Demasiado nitrógeno — riesgo de olor y putrefacción';
    ajuste = `Agregá aproximadamente ${Math.ceil(kgMarronExtra)} kg de material marrón (hojas secas, cartón).`;
    tiempo = '1–3 meses (si se corrige el ratio)';
  } else {
    const kgVerdeExtra = ((totalC - 30 * totalN) / 15);
    estado = 'Demasiado carbono — descomposición muy lenta';
    ajuste = `Agregá aproximadamente ${Math.ceil(kgVerdeExtra)} kg de material verde (restos de cocina, pasto).`;
    tiempo = '6–12 meses (si no se corrige)';
  }

  const ratioR = Math.round(ratio);
  const ideal = ratio >= 25 && ratio <= 35;
  const _insight = {
    title: ideal ? 'Ratio C:N ideal' : ratio < 25 ? 'Exceso de nitrógeno' : 'Exceso de carbono',
    text: ideal
      ? `Tu mezcla tiene un ratio C:N de **${ratioR}:1**, justo en la franja ideal (25–35). Madura en **${tiempo}** revolviendo cada 1–2 semanas.`
      : ratio < 25
        ? `Con un ratio de **${ratioR}:1** sobra nitrógeno (lo ideal es 25–35): riesgo de **olor y putrefacción**. ${ajuste}`
        : `Con un ratio de **${ratioR}:1** sobra carbono (lo ideal es 25–35): la descomposición será **muy lenta** (${tiempo}). ${ajuste}`,
    tone: ideal ? 'good' : 'warn',
    icon: '🍂',
  };
  const markerCap = Math.min(ratioR, 59);
  const _chart = {
    type: 'scale',
    marker: markerCap,
    markerLabel: `${ratioR}:1`,
    min: 0,
    segments: [
      { nombre: 'Mucho N', max: 25, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Ideal', max: 35, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Mucho C', max: 60, color: '#f59e0b', colorDark: '#fbbf24' },
    ],
    ariaLabel: `Ratio carbono-nitrógeno de ${ratioR} a 1 en la escala de compostaje`,
  };

  return {
    ratioCN: `${Math.round(ratio)}:1`,
    estado,
    ajuste,
    tiempoEstimado: tiempo,
    _insight,
    _chart,
  };
}
