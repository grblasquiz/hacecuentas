export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversacionIntercambioIdiomaHorasSemana(i: Inputs): Outputs {
  const n=String(i.nivelMeta||'b1');
  const h:Record<string,number>={a2:1,b1:2,b2:3,c1:5};
  const hr=h[n]||2;
  const horasMes=hr*4;
  const _insight = {
    title: 'Tu dosis semanal de conversación',
    text: `Para llegar a **${n.toUpperCase()}** conviene sostener **${hr}h de conversación por semana** (~${horasMes}h al mes). La constancia importa más que las maratones: mejor sesiones cortas y frecuentes que acumularlas en un día.`,
    tone: 'good',
    icon: '🗣️',
  };
  return { horas:`${hr}h/sem`, metodos:'Tandem, iTalki, intercambio', resumen:`Meta ${n.toUpperCase()}: ${hr}h conversación/sem.`, _insight };
}
