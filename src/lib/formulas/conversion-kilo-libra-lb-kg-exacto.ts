export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionKiloLibraLbKgExacto(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 2.20462;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'kg' : 'lb';
  const toU = u === 'a' ? 'lb' : 'kg';
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  return {
    resultado: rTxt + ' ' + toU,
    resumen: `${v} ${fromU} = ${rTxt} ${toU}.`,
    _insight: {
      title: 'Regla rápida',
      text: `**${v} ${fromU}** = **${rTxt} ${toU}**. Para estimar de cabeza: 1 kg ≈ **2,2 lb**, y 1 lb ≈ **0,45 kg**. El factor exacto es 2,20462.`,
      tone: 'neutral',
      icon: '⚖️'
    }
  };
}
