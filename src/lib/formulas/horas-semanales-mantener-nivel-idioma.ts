export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasSemanalesMantenerNivelIdioma(i: Inputs): Outputs {
  const n=String(i.nivel||'b1');
  const h:Record<string,number>={a2:1,b1:2,b2:3,c1:4,c2:5};
  const hr=h[n]||2;
  const tone = hr>=4 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Mantenimiento del idioma',
    text: `Para no oxidar un **${n.toUpperCase()}** alcanza con unas **${hr}h/semana** de exposición activa. Cuanto más alto el nivel, más cuesta sostenerlo: combiná **media + conversación + lectura** para cubrir las cuatro habilidades.`,
    tone,
    icon: '🗣️',
  };
  return { horasSem:`${hr}h`, consejos:'Mix: media + conversación + lectura', resumen:`Mantener ${n.toUpperCase()}: ~${hr}h/sem.`, _insight };
}
