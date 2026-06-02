export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cuantoFaltaJubilarseJubilacionEdadAportes(i: Inputs): Outputs {
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
  const anios=Math.floor(abs/365.25);
  const meses=Math.round(abs/30.44);
  let _insight: any;
  if (diff>0) {
    const escala = abs>=365 ? `unos **${anios} año(s)**` : abs>=60 ? `unos **${meses} meses**` : `**${diff} días**`;
    _insight = {
      title: 'Cuenta regresiva al retiro',
      text: `Faltan **${diff} días** (${escala}) para esa fecha. Recordá que para jubilarte en Argentina necesitás cumplir la edad **y** los **30 años de aportes**; si te faltan aportes, podés sumar moratoria o seguir trabajando.`,
      tone: 'neutral',
      icon: '👵',
    };
  } else if (diff===0) {
    _insight = {
      title: '¡Es hoy!',
      text: `La fecha que ingresaste es **hoy mismo**. Si ya cumplís edad y aportes, podés iniciar el trámite de jubilación en ANSES.`,
      tone: 'good',
      icon: '🎉',
    };
  } else {
    _insight = {
      title: 'Fecha ya pasada',
      text: `Esa fecha quedó **${abs} días** atrás. Si querés proyectar tu retiro, ingresá la fecha futura en la que cumplirás la edad jubilatoria.`,
      tone: 'warn',
      icon: '⏪',
    };
  }

  return { resultado:diff+' días', resumen:`Entre hoy y ${f}: ${diff} días.`, _insight };
}
