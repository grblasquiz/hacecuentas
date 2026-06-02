/** XP Duolingo para tu Objetivo */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  xpTotalObjetivo: number;
  xpPorDia: number;
  minutosDia: number;
  leccionesDia: number;
  comentario: string;
  _insight?: any;
  _chart?: any;
}

export function duolingoXpObjetivo(i: Inputs): Outputs {
  const obj = String(i.objetivo || 'a2');
  const idioma = String(i.idioma || 'ingles');
  const dias = Number(i.diasPlazo) || 90;
  if (dias <= 0) throw new Error('Plazo inválido');

  const XP_BASE: Record<string, number> = {
    'completar-unidad': 1500, a1: 5000, a2: 15000, b1: 28000,
  };
  const AJUSTE: Record<string, number> = {
    ingles: 1.0, frances: 1.0, italiano: 0.95, portugues: 0.95,
    aleman: 1.1, japones: 1.3, chino: 1.3,
  };

  const xpTot = Math.round((XP_BASE[obj] || 15000) * (AJUSTE[idioma] || 1));
  const xpDia = Math.ceil(xpTot / dias);
  const minDia = Math.round(xpDia / 10);
  const lecc = Math.round(xpDia / 15);

  let coment = '';
  if (xpDia > 500) coment = 'Muy intenso — insostenible más de 2-3 meses.';
  else if (xpDia > 200) coment = 'Acelerado. Sumá variedad (historias, match madness).';
  else if (xpDia > 80) coment = 'Ritmo normal de usuario activo.';
  else coment = 'Ritmo cómodo. Si alcanza para tu meta, perfecto.';

  const tone: 'good' | 'warn' | 'neutral' = xpDia > 500 ? 'warn' : xpDia > 200 ? 'neutral' : 'good';
  const _insight = {
    title: 'Tu ritmo diario',
    text: `Para juntar **${xpTot.toLocaleString('es-AR')} XP** en **${dias} días** necesitás **${xpDia} XP/día** (~**${minDia} min** y **${lecc} lecciones** diarias). ${coment}`,
    tone,
    icon: '🦉',
  };

  const _chart = {
    type: 'scale' as const,
    marker: xpDia,
    markerLabel: `${xpDia} XP/día`,
    min: 0,
    unit: 'XP',
    segments: [
      { nombre: 'Cómodo', max: 80, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Normal', max: 200, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Acelerado', max: 500, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy intenso', max: Math.max(800, xpDia + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Escala de intensidad del ritmo diario de XP en Duolingo, ${xpDia} XP por día.`,
  };

  return {
    xpTotalObjetivo: xpTot,
    xpPorDia: xpDia,
    minutosDia: minDia,
    leccionesDia: lecc,
    comentario: coment,
    _insight,
    _chart,
  };

}
