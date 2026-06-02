export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function horasCaligrafiaChinoKanjiPractica(i: Inputs): Outputs {
  const c=Number(i.caracteres)||0; const m=Number(i.minDia)||0;
  const h=c*0.3;
  const meses=m===0?'—':h*60/(m*30);
  const mesesNum = typeof meses === 'string' ? null : Number(meses);
  const tono = mesesNum === null ? 'neutral' : mesesNum > 12 ? 'warn' : mesesNum >= 3 ? 'neutral' : 'good';
  const tiempoTxt = mesesNum === null
    ? 'Cargá los minutos diarios para estimar el plazo.'
    : `A **${m} min/día** los dominás en **${mesesNum.toFixed(1)} meses**.`;
  const insight = {
    title: 'Tu plan de caligrafía',
    text: `Memorizar y escribir **${c} caracteres** pide unas **${h.toFixed(0)} horas** de práctica (≈0,3 h por carácter, repaso espaciado incluido). ${tiempoTxt} La constancia diaria pesa más que las sesiones largas y salteadas.`,
    tone: tono,
    icon: '🖌️',
  };
  return { horas:`${h.toFixed(0)}h`, meses:typeof meses==='string'?meses:`${Number(meses).toFixed(1)} meses`, resumen:`${c} chars: ${h.toFixed(0)}h, ${typeof meses==='string'?meses:`${Number(meses).toFixed(0)} meses`} a ${m}min/día.`, _insight: insight };
}
