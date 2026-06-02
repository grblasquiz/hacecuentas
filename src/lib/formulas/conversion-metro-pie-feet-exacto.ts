export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function conversionMetroPieFeetExacto(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 3.28084;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'm' : 'ft';
  const toU = u === 'a' ? 'ft' : 'm';
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  return {
    resultado: rStr + ' ' + toU,
    resumen: `${v} ${fromU} = ${rStr} ${toU}.`,
    _insight: {
      title: 'Equivalencia exacta metro–pie',
      text: `**${v} ${fromU}** son exactamente **${rStr} ${toU}**, usando 1 pie = 0,3048 m (factor oficial). Recordá que 1 metro ≈ **3,28 pies**, no 3: ese redondeo de cabeza acumula error en distancias largas.`,
      tone: 'neutral',
      icon: '📏',
    },
  };
}
