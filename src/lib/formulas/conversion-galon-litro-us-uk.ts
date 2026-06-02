export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionGalonLitroUsUk(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 3.78541;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'gal' : 'L';
  const toU = u === 'a' ? 'L' : 'gal';
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  return {
    resultado: rTxt + ' ' + toU,
    resumen: `${v} ${fromU} = ${rTxt} ${toU}.`,
    _insight: {
      title: 'Galón usado: estadounidense (US)',
      text: `**${v} ${fromU}** son **${rTxt} ${toU}** usando el galón US (1 gal = 3,78541 L). Ojo: el galón imperial (UK) es más grande, **4,54609 L**, así que el mismo número de galones UK daría ~20% más litros.`,
      tone: 'neutral',
      icon: '⛽'
    }
  };
}
