export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vtvRutaVencimientoVigenciaMeses(i: Inputs): Outputs {
  const a=Number(i.anio)||2020; const u=Number(i.ultima)||1;
  const edad=new Date().getFullYear()-a;
  let fr:string; let meses:number;
  if (edad<=4) { fr='Cada 3 años'; meses=36; }
  else if (edad<=9) { fr='Anual'; meses=12; }
  else { fr='Semestral'; meses=6; }
  return { frecuencia:fr, proxima:`${meses} meses`, resumen:`Auto ${a} (${edad}a): VTV ${fr}.`,
    _insight: {
      title: 'Cada cuánto te toca',
      text: `Tu vehículo modelo **${a}** tiene **${edad} año${edad === 1 ? '' : 's'}**, así que la VTV nacional (ruta) le corresponde **${fr.toLowerCase()}**: la próxima vence en **${meses} meses** contados desde la última. ${meses <= 6 ? 'Al ser un auto con años, prestá atención porque el control es más seguido.' : 'Anotá el vencimiento para no quedar fuera de regla.'}`,
      tone: meses <= 6 ? 'warn' : 'neutral',
      icon: '🛣️',
    },
  };
}
