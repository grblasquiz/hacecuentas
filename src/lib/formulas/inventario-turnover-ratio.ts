/** Inventory turnover ratio */
export interface Inputs { cogsAnual: number; inventarioPromedio: number; industria: string; }
export interface Outputs { turnoverRatio: number; dio: number; benchmark: string; evaluacion: string; _insight?: any; _chart?: any; }
export function inventarioTurnoverRatio(i: Inputs): Outputs {
  const cogs = Number(i.cogsAnual);
  const inv = Number(i.inventarioPromedio);
  const ind = String(i.industria || 'retail');
  if (!cogs || cogs <= 0) throw new Error('COGS inválido');
  if (!inv || inv <= 0) throw new Error('Inventario inválido');
  const turnover = cogs / inv;
  const dio = 365 / turnover;
  const benchmarks: Record<string, [number, number, string]> = {
    retail: [4, 8, '4-8×'],
    grocery: [10, 20, '10-20×'],
    lujo: [1, 3, '1-3×'],
    tech: [5, 10, '5-10×'],
    ropa: [4, 6, '4-6×']
  };
  const [min, max, label] = benchmarks[ind] || [4, 8, '4-8×'];
  let evaluacion = 'en rango';
  if (turnover < min * 0.7) evaluacion = 'muy bajo - stock muerto';
  else if (turnover < min) evaluacion = 'bajo - revisar';
  else if (turnover > max * 1.3) evaluacion = 'muy alto - riesgo stockout';
  else if (turnover > max) evaluacion = 'alto - monitorear';
  else evaluacion = 'bueno';

  const ratio = Number(turnover.toFixed(2));
  const dioR = Math.round(dio);
  const favorable = evaluacion === 'bueno' || evaluacion === 'en rango';
  const _insight = {
    title: 'Rotación de tu inventario',
    text: `Tu inventario rota **${ratio}× al año** y se renueva cada **${dioR} días** (DIO). Para ${ind} el benchmark es **${label}**: tu nivel está **${evaluacion}**.`,
    tone: favorable ? 'good' : 'warn',
    icon: '📦',
  };

  // Gauge: zonas según benchmark de la industria
  const topMax = Math.max(max * 1.6, ratio * 1.1);
  const _chart = {
    type: 'scale',
    marker: ratio,
    markerLabel: `${ratio}×`,
    min: 0,
    segments: [
      { nombre: 'Muy bajo', max: Number((min * 0.7).toFixed(1)), color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Bajo', max: min, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Óptimo', max: max, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Alto', max: Number((max * 1.3).toFixed(1)), color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Riesgo stockout', max: Number(topMax.toFixed(1)), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Rotación de ${ratio} veces al año sobre un benchmark óptimo de ${label} para ${ind}.`,
  };

  return {
    turnoverRatio: ratio,
    dio: dioR,
    benchmark: label,
    evaluacion,
    _insight,
    _chart
  };
}
