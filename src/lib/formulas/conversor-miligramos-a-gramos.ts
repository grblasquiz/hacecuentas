/** Conversor: miligramo ↔ gramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMiligramosAGramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.001;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'miligramos'; toLabel = 'gramos';
  } else {
    r = v / factor;
    fromLabel = 'gramos'; toLabel = 'miligramos';
  }
  const rFmt = r.toFixed(6).replace(/\.?0+$/, '');
  const mg = (d === 'ida' ? v : r);
  const mgFmt = mg.toLocaleString('es-AR', { maximumFractionDigits: 3 });
  const _insight = {
    title: 'Precisión de gramo',
    text: `**${v} ${fromLabel}** equivalen a **${rFmt} ${toLabel}**, porque 1 g = 1.000 mg. Son **${mgFmt} mg** — la escala con que se miden dosis de un medicamento o un suplemento; para pesarlos hace falta una balanza de precisión, no la de cocina.`,
    tone: 'neutral',
    icon: '⚖️',
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'g'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
