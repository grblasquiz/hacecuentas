export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function jubilacionPuaPrestacionUniversalAdultoMayor(i: Inputs): Outputs {
  const e=Number(i.edad)||0; const a=String(i.aportes||'no')==='si';
  const accede=e>=65 && !a;
  const monto=accede?232000:0;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (accede) {
    insightText = `Con **${e} años** y sin aportes suficientes accedés a la PUAM: cobrás el **80%** del haber mínimo, **$${monto.toLocaleString('es-AR')}** por mes.`;
    insightTone = 'good';
  } else if (a) {
    insightText = `Tenés aportes, así que no te corresponde la PUAM: el camino es la **jubilación ordinaria**, que paga el 100% del haber (no el 80%). Conviene chequear los años aportados.`;
    insightTone = 'neutral';
  } else {
    insightText = `Todavía no llegás a la edad: la PUAM exige **65 años** y tenés **${e}**. Te faltan **${65 - e} año${65 - e === 1 ? '' : 's'}**.`;
    insightTone = 'warn';
  }
  const _insight = {
    title: accede ? 'Accedés a la PUAM' : 'No aplica la PUAM',
    text: insightText,
    tone: insightTone,
    icon: '👴',
  };
  return { monto:'$'+monto.toLocaleString('es-AR'), accede:accede?'Sí, cumple requisitos':(a?'No - tiene aportes (va jubilación)':'No - edad <65'), resumen:accede?`Acceso PUAM: $${monto}/mes.`:'No aplica PUAM.', _insight } as Outputs;
}
