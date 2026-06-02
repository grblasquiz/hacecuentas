export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cuantoFaltaMundialFifa20262030(i: Inputs): Outputs {
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

  const abs=Math.abs(diff);
  const semanas=Math.floor(abs/7);
  const meses=Math.round(abs/30.44);
  let _insight: any;
  if (diff>0) {
    const escala = abs>=60 ? `unos **${meses} meses**` : abs>=14 ? `unas **${semanas} semanas**` : `**${diff} días**`;
    _insight = {
      title: 'Cuenta regresiva al Mundial',
      text: `Faltan **${diff} días** (${escala}) para esa fecha. El Mundial 2026 arranca el **11 de junio de 2026** (USA, México y Canadá); el de 2030 será el centenario, repartido entre España, Portugal y Marruecos.`,
      tone: 'neutral',
      icon: '⚽',
    };
  } else if (diff===0) {
    _insight = {
      title: '¡Es hoy!',
      text: `La fecha que ingresaste es **hoy mismo**. ¡Que ruede la pelota!`,
      tone: 'good',
      icon: '🏆',
    };
  } else {
    _insight = {
      title: 'Fecha ya pasada',
      text: `Esa fecha quedó **${abs} días** atrás. Para la próxima cita mundialista, ingresá una fecha del calendario de 2026 o 2030.`,
      tone: 'warn',
      icon: '⏪',
    };
  }

  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight };
}
