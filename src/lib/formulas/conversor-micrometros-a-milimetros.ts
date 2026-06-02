/** Conversor: micrómetro ↔ milímetro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMicrometrosAMilimetros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 0.001;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'micrómetros'; toLabel = 'milímetros';
  } else {
    r = v / factor;
    fromLabel = 'milímetros'; toLabel = 'micrómetros';
  }
  const rFmt = r.toFixed(6).replace(/\.?0+$/, '');
  const um = (d === 'ida' ? v : r);
  const umFmt = um.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Escala de lo diminuto',
    text: `**${v} ${fromLabel}** son **${rFmt} ${toLabel}**. Para ubicarte: 1 mm = 1.000 micrómetros, así que **${umFmt} µm** es del orden de un cabello humano (~70 µm) o una célula — vas a necesitar microscopio para verlo a simple vista.`,
    tone: 'neutral',
    icon: '🔬',
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'mm'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
