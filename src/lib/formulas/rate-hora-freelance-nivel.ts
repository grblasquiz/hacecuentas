/** Rate por hora freelance según nivel */
export interface Inputs {
  nivel: string;
  ingresoAnualObjetivo: number;
  horasSemana: number;
  semanasAno: number;
  overheadPct: number;
}
export interface Outputs {
  rateHora: number;
  rateMinimo: number;
  rateMaximo: number;
  horasAnuales: number;
  ingresoBrutoNecesario: number;
  _insight?: any;
  _chart?: any;
}
export function rateHoraFreelanceNivel(i: Inputs): Outputs {
  const obj = Number(i.ingresoAnualObjetivo);
  const hs = Number(i.horasSemana);
  const sem = Number(i.semanasAno);
  const over = Number(i.overheadPct) / 100;
  const nivel = String(i.nivel || 'semi');
  if (!obj || obj <= 0) throw new Error('Ingresá el ingreso objetivo');
  if (!hs || hs <= 0) throw new Error('Ingresá horas por semana');
  if (!sem || sem <= 0) throw new Error('Ingresá semanas al año');
  if (over >= 1) throw new Error('Overhead debe ser menor al 100%');
  const multMap: Record<string, number> = { junior: 0.6, semi: 1.0, senior: 1.6, experto: 2.5 };
  const mult = multMap[nivel] || 1.0;
  const horasAnuales = hs * sem;
  const ingresoBruto = obj / (1 - over);
  const rateBase = ingresoBruto / horasAnuales;
  const rate = rateBase * mult;
  const rateR = Math.round(rate);
  const rateMin = Math.round(rate * 0.8);
  const rateMax = Math.round(rate * 1.2);
  const fmt = (n: number) => n.toLocaleString('es-AR');

  const nivelLabel: Record<string, string> = { junior: 'junior', semi: 'semi-senior', senior: 'senior', experto: 'experto' };
  const nLabel = nivelLabel[nivel] || 'semi-senior';
  const overPct = Math.round(over * 100);

  // --- Insight: lectura del rate y el overhead ---
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (over >= 0.4) {
    insightText = `Para llevarte ${fmt(Math.round(obj))} netos al año necesitás facturar **${fmt(Math.round(ingresoBruto))}** brutos: el **${overPct}%** de overhead te obliga a cobrar **${fmt(rateR)}/hora**. Ese overhead alto es lo que más te empuja el rate hacia arriba.`;
    insightTone = 'warn';
  } else {
    insightText = `Como **${nLabel}** tu rate sugerido es **${fmt(rateR)}/hora** (rango ${fmt(rateMin)}–${fmt(rateMax)}). Surge de necesitar ${fmt(Math.round(ingresoBruto))} brutos repartidos en ${fmt(Math.round(horasAnuales))} horas facturables al año.`;
    insightTone = 'neutral';
  }

  const _insight = {
    title: 'Tu tarifa por hora, explicada',
    text: insightText,
    tone: insightTone,
    icon: '💼',
  };

  // --- Gauge: dónde cae el rate recomendado dentro del rango negociable ---
  const _chart = {
    type: 'scale',
    marker: rateR,
    markerLabel: `${fmt(rateR)}/h`,
    min: rateMin,
    segments: [
      { nombre: 'Conservador', max: Math.round(rate * 0.95), color: '#fbbf24', colorDark: '#d97706' },
      { nombre: 'Recomendado', max: Math.round(rate * 1.05), color: '#4ade80', colorDark: '#16a34a' },
      { nombre: 'Premium', max: rateMax, color: '#38bdf8', colorDark: '#0284c7' },
    ],
    ariaLabel: `Tarifa recomendada de ${fmt(rateR)} por hora dentro del rango negociable de ${fmt(rateMin)} a ${fmt(rateMax)}`,
  };

  return {
    rateHora: rateR,
    rateMinimo: rateMin,
    rateMaximo: rateMax,
    horasAnuales: Math.round(horasAnuales),
    ingresoBrutoNecesario: Math.round(ingresoBruto),
    _insight,
    _chart,
  };
}
