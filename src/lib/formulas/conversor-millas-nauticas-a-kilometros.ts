/** Conversor: milla náutica ↔ kilómetro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMillasNauticasAKilometros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.852;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'millas náuticas'; toLabel = 'kilómetros';
  } else {
    r = v / factor;
    fromLabel = 'kilómetros'; toLabel = 'millas náuticas';
  }
  const rFmt = r.toFixed(6).replace(/\.?0+$/, '');
  const nm = (d === 'ida' ? v : r);
  const nmFmt = nm.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'No la confundas con la milla terrestre',
    text: `**${v} ${fromLabel}** son **${rFmt} ${toLabel}**: la milla náutica vale 1,852 km (más que la terrestre, de 1,609 km) porque equivale a 1 minuto de latitud. Esas **${nmFmt} mn** son la unidad con que navegan barcos y aviones — a 1 mn por minuto de arco.`,
    tone: 'neutral',
    icon: '⚓',
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'km'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
