export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function cuantosDiasVacacionesLaboralesAntiguedad(i: Inputs): Outputs {
  const raw = i.antiguedad;
  const aniosNum = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(',', '.'));
  if (raw === '' || raw === null || raw === undefined || !Number.isFinite(aniosNum) || aniosNum < 0) {
    return { dias: '—', regla: 'Ingresá tu antigüedad en años (puede ser 0).' };
  }
  const anios = aniosNum;

  // LCT art. 150 — licencia anual ordinaria (días corridos) según antigüedad:
  //  ≤ 5 años → 14 · >5 y ≤10 → 21 · >10 y ≤20 → 28 · >20 → 35
  let dias: number;
  let tramo: string;
  if (anios <= 5) { dias = 14; tramo = 'hasta 5 años de antigüedad'; }
  else if (anios <= 10) { dias = 21; tramo = 'más de 5 y hasta 10 años'; }
  else if (anios <= 20) { dias = 28; tramo = 'más de 10 y hasta 20 años'; }
  else { dias = 35; tramo = 'más de 20 años'; }

  const aniosTxt = Number.isInteger(anios) ? String(anios) : anios.toLocaleString('es-AR');
  const regla = `Con ${aniosTxt} año${anios === 1 ? '' : 's'} (${tramo}), la LCT art. 150 te otorga ${dias} días corridos de vacaciones.`;

  const insight = {
    title: `${dias} días corridos`,
    text: `Por tu antigüedad (**${aniosTxt} año${anios === 1 ? '' : 's'}**) te corresponden **${dias} días corridos** de licencia anual ordinaria (Ley 20.744 art. 150). Recordá que son **corridos** (incluyen sábados, domingos y feriados), no días hábiles, y que la antigüedad que cuenta es la del **31 de diciembre** del año en que las gozás.`,
    tone: 'good' as const,
    icon: '🏖️'
  };

  const _chart = {
    type: 'bar',
    title: 'Días de vacaciones por tramo de antigüedad (LCT art. 150)',
    data: [
      { label: 'Hasta 5 años', value: 14, highlight: dias === 14 },
      { label: '5 a 10 años', value: 21, highlight: dias === 21 },
      { label: '10 a 20 años', value: 28, highlight: dias === 28 },
      { label: 'Más de 20', value: 35, highlight: dias === 35 }
    ]
  };

  return {
    dias: dias + ' días corridos',
    regla,
    _insight: insight,
    _chart
  };
}
