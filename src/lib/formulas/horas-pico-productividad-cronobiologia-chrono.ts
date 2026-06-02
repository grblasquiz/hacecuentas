export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasPicoProductividadCronobiologiaChrono(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const _insight = {
    title: 'Tu resultado',
    text: `El cálculo da **${r.toFixed(2)}** (${v1} ÷ ${v2}). Tu ventana de pico cognitivo suele caer unas 2-4 h después de despertarte, según tu cronotipo: agendá las tareas que más concentración exigen en ese tramo.`,
    tone: 'neutral' as const,
    icon: '⏰',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`, _insight };
}
