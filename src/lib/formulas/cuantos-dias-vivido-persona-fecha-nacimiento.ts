export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function cuantosDiasVividoPersonaFechaNacimiento(i: Inputs): Outputs {
  const f=String(i.fecha1||'');
  if (!f) {
    const hoy=new Date();
    return { resultado:hoy.toISOString().slice(0,10), resumen:'Ingresá una fecha.' };
  }
  const parts=f.split('-').map(Number);
  if (parts.length!==3 || parts.some(isNaN)) return { resultado:'—', resumen:'Fecha inválida.' };
  const [yy,mm,dd]=parts;
  const d=new Date(yy,mm-1,dd);
  if (isNaN(d.getTime())) return { resultado:'—', resumen:'Fecha inválida.' };
  const hoy=new Date();
  hoy.setHours(0,0,0,0);
  const diff=Math.round((d.getTime()-hoy.getTime())/86400000);
  const dias=Math.abs(diff);
  const anios=Math.floor(dias/365.25);
  const semanas=Math.floor(dias/7);
  const enPasado=diff<0;
  const insight = enPasado
    ? {
        title: 'Tu tiempo en números',
        text: `Viviste **${dias.toLocaleString('es-AR')} días**, lo que equivale a unos **${anios} años** o **${semanas.toLocaleString('es-AR')} semanas**. Cada día suma: aprovechá el de hoy.`,
        tone: 'good',
        icon: '🎂'
      }
    : {
        title: 'Fecha en el futuro',
        text: `La fecha ingresada (**${f}**) todavía no llegó: faltan **${dias.toLocaleString('es-AR')} días**. Para contar días vividos, ingresá una fecha de nacimiento pasada.`,
        tone: 'neutral',
        icon: '📅'
      };
  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight: insight };
}
