export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function itinerarioCiudadesDiasOptimoPorCiudad(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const _insight = {
    title: 'Tu resultado',
    text: `Con **${v1}** y **${v2}** el resultado da **${r.toFixed(2)}**. Para armar el itinerario, reservá al menos 2 o 3 días por ciudad grande y descontá los días de traslado: llegar y partir suelen comerse media jornada cada uno.`,
    tone: 'neutral',
    icon: '🗺️',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight };
}
