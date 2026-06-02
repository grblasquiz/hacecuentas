export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function distanciaEntrePlantasHuerto(i: Inputs): Outputs {
  const d: Record<string, string> = { tomate: '60-80', lechuga: '25-30', zanahoria: '5-10', papa: '30-40', calabaza: '100-150' };
  const e = String(i.especie);
  const rango = d[e];
  const out: Outputs = { distancia: (rango || '?') + ' cm', resumen: `${e}: ${rango} cm entre plantas.` };
  if (rango) {
    const [minCm, maxCm] = rango.split('-').map(Number);
    // Plantas por metro lineal de surco usando el espaciado recomendado.
    const plantasMax = Math.floor(100 / minCm); // separación mínima → más plantas
    const plantasMin = Math.floor(100 / maxCm); // separación máxima → menos plantas
    out._insight = {
      title: 'Cuántas plantas entran',
      text: `Dejando **${rango} cm** entre plantas de **${e}**, en cada metro de surco te entran entre **${plantasMin} y ${plantasMax} plantas**. Respetar la distancia evita competencia por luz, agua y nutrientes.`,
      tone: 'neutral',
      icon: '🌱',
    };
  }
  return out;
}
