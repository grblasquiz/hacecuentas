export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function diasPreparacionExamenOficialIdioma(i: Inputs): Outputs {
  const niv=['a1','a2','b1','b2','c1','c2'];
  const a=niv.indexOf(String(i.actual||'a1')); const m=niv.indexOf(String(i.meta||'b2'));
  if (a<0||m<0||m<=a) return { dias:'—', horas:'—', resumen:'Meta debe ser mayor que actual.' };
  const salto=m-a; const h=salto*200; const d=h/(2*7)*7;
  const dias=Math.round(d);
  const meses=Math.round(dias/30*10)/10;
  const _insight={
    title:'Tu plan de estudio',
    text:`Subir de **${niv[a].toUpperCase()} a ${niv[m].toUpperCase()}** son **${salto} ${salto===1?'nivel':'niveles'}** del MCER: ~**${h}h** de estudio, unos **${dias} días** (≈${meses.toFixed(1)} meses) a 2h diarias. Cada nivel suma cerca de 200 horas, así que mantener el ritmo constante pesa más que la intensidad puntual.`,
    tone:(salto>=3?'warn':'neutral') as 'good'|'warn'|'neutral',
    icon:'📚',
  };
  return { dias:`${dias} días`, horas:`${h}h`, resumen:`De ${niv[a].toUpperCase()} a ${niv[m].toUpperCase()}: ~${h}h, ${dias} días a 2h/día.`, _insight };
}
