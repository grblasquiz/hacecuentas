/** Inventory turnover ratio */
export interface Inputs { cogsAnual: number; inventarioPromedio: number; industria: string; }
export interface Outputs { turnoverRatio: number; dio: number; benchmark: string; evaluacion: string; }
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
  return {
    turnoverRatio: Number(turnover.toFixed(2)),
    dio: Math.round(dio),
    benchmark: label,
    evaluacion
  };
}
