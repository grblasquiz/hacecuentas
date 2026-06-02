export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function pomodoroSesionesDiaProductividadHoras(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const rFmt = r.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`,
    _insight: {
      title: 'Tu resultado',
      text: `Dividiendo **${v1}** entre **${v2}** obtenés **${rFmt}**.`,
      tone: 'neutral',
      icon: '🍅',
    },
  };
}
