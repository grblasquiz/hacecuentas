export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function conversionMillaKilometroIdaVuelta(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 1.60934;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'mi' : 'km';
  const toU = u === 'a' ? 'km' : 'mi';
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  const ida = u === 'a' ? v * factor : v / factor;
  const vuelta = ida * 2;
  return {
    resultado: rStr + ' ' + toU,
    resumen: `${v} ${fromU} = ${rStr} ${toU}.`,
    _insight: {
      title: 'Ida y vuelta del recorrido',
      text: `**${v} ${fromU}** equivalen a **${rStr} ${toU}**. Si es un trayecto de ida y vuelta, vas a recorrer el doble: **${vuelta.toFixed(2).replace(/\.?0+$/, '')} ${toU}** en total. Útil para combustible o entrenamiento.`,
      tone: 'neutral',
      icon: '🛣️',
    },
  };
}
