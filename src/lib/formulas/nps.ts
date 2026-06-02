/** Net Promoter Score */
export interface Inputs {
  promotores: number;
  pasivos: number;
  detractores: number;
}
export interface Outputs {
  nps: number;
  total: number;
  pctPromotores: number;
  pctPasivos: number;
  pctDetractores: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function nps(i: Inputs): Outputs {
  const p = Number(i.promotores) || 0;
  const pa = Number(i.pasivos) || 0;
  const d = Number(i.detractores) || 0;
  const total = p + pa + d;
  if (total === 0) throw new Error('Ingresá al menos una respuesta');

  const pctP = (p / total) * 100;
  const pctPa = (pa / total) * 100;
  const pctD = (d / total) * 100;
  const npsVal = pctP - pctD;

  let msg = '';
  if (npsVal < 0) msg = 'NPS negativo — más detractores que promotores. Crisis de experiencia.';
  else if (npsVal < 30) msg = 'NPS bajo — margen de mejora grande.';
  else if (npsVal < 50) msg = 'NPS bueno — estás sobre el promedio.';
  else if (npsVal < 70) msg = 'NPS excelente — experiencia muy por encima de la media.';
  else msg = 'NPS extraordinario — nivel Apple / Tesla (70 +).';

  const npsOut = Math.round(npsVal);
  const pctPout = Number(pctP.toFixed(1));
  const pctDout = Number(pctD.toFixed(1));

  let tone: 'good' | 'warn' | 'neutral';
  let icon: string;
  if (npsVal < 0) { tone = 'warn'; icon = '🚨'; }
  else if (npsVal < 30) { tone = 'warn'; icon = '⚠️'; }
  else if (npsVal < 50) { tone = 'neutral'; icon = '🙂'; }
  else { tone = 'good'; icon = '🚀'; }

  const insightText = `Tu NPS es **${npsOut}**: **${pctPout}%** promotores menos **${pctDout}%** detractores, sobre **${total}** respuestas.` +
    (npsVal < 0
      ? ' Más gente te resta que te recomienda: priorizá entender y cerrar los motivos de los detractores antes de invertir en crecimiento.'
      : npsVal < 30
        ? ' Hay base, pero los pasivos y detractores todavía pesan: convertir pasivos en promotores es la palanca más rápida.'
        : npsVal < 50
          ? ' Estás por encima del promedio: cuidá lo que ya funciona y atacá los detractores puntuales.'
          : ' Lealtad muy fuerte: tus promotores son un motor de boca-en-boca, aprovechalos para referidos y reseñas.');

  const topMax = npsOut >= 100 ? 101 : 100;

  return {
    nps: npsOut,
    total,
    pctPromotores: pctPout,
    pctPasivos: Number(pctPa.toFixed(1)),
    pctDetractores: pctDout,
    mensaje: msg,
    _insight: { title: 'Lectura de tu NPS', text: insightText, tone, icon },
    _chart: {
      type: 'scale',
      marker: npsOut,
      markerLabel: `NPS ${npsOut}`,
      min: -100,
      segments: [
        { nombre: 'Crítico', max: 0, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Mejorable', max: 30, color: '#f97316', colorDark: '#ea580c' },
        { nombre: 'Bueno', max: 50, color: '#eab308', colorDark: '#ca8a04' },
        { nombre: 'Excelente', max: 70, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Extraordinario', max: topMax, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `El NPS de ${npsOut} sobre una escala de -100 a 100, con zonas de crítico a extraordinario`,
    },
  };
}
