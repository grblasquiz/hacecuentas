/** Conversor: BTU ↔ joule */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorBtuAJoules(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1055.06;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'BTUs'; toLabel = 'joules';
  } else {
    r = v / factor;
    fromLabel = 'joules'; toLabel = 'BTUs';
  }
  const rFmt = r.toFixed(4).replace(/\.?0+$/, '');
  const joules = d === 'ida' ? r : v;
  const kWh = joules / 3_600_000;
  const _insight = {
    title: 'Cuánta energía es',
    text: `**${v} ${fromLabel}** equivalen a **${rFmt} ${toLabel}**, es decir unos **${kWh.toFixed(4).replace(/\.?0+$/, '')} kWh**. El BTU es la unidad que verás en la potencia de aires acondicionados y calefacción; el joule es la unidad del Sistema Internacional para todo tipo de energía.`,
    tone: 'neutral',
    icon: '🔥',
  };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + (d === 'ida' ? 'J' : "BTU"),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
