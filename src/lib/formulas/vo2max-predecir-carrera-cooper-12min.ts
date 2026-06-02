export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function vo2maxPredecirCarreraCooper12min(i: Inputs): Outputs {
  const d=Number(i.distanciaMts)||0;
  const vo2=(d-504.9)/44.73;
  let cat='—';
  if (vo2<25) cat='Bajo'; else if (vo2<35) cat='Regular'; else if (vo2<45) cat='Bueno'; else if (vo2<55) cat='Muy bueno'; else cat='Atleta';
  const vo2r = Number(vo2.toFixed(1));
  const chart = {
    type: 'scale' as const,
    marker: vo2r,
    markerLabel: 'Tu VO2max: ' + vo2r.toFixed(1),
    min: 10,
    unit: '',
    segments: [
      { nombre: 'Bajo', max: 25, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Regular', max: 35, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Bueno', max: 45, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Muy bueno', max: 55, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Atleta', max: Math.max(65, Math.ceil(vo2r) + 4), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala de VO2max estimado por test de Cooper: de bajo a atleta',
  };
  const tone = (cat === 'Muy bueno' || cat === 'Atleta') ? 'good' : (cat === 'Bajo') ? 'warn' : 'neutral';
  const insight = {
    title: 'Tu VO2max estimado',
    text: `Recorriendo **${d} m** en 12 minutos (test de Cooper), tu VO2max estimado es de **${vo2r} ml/kg/min**, lo que corresponde a un nivel **${cat}**.`,
    tone,
    icon: '🏃',
  };
  return { vo2:vo2.toFixed(1), categoria:cat, resumen:`${d}m en 12min: VO2 ${vo2.toFixed(1)} (${cat}).`, _chart: chart, _insight: insight };
}
