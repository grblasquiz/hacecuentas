export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionGradosRadianesGradianes(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const de=String(i.desde||'deg'); const a=String(i.a||'rad');
  let deg:number;
  if (de==='deg') deg=v; else if (de==='rad') deg=v*180/Math.PI; else deg=v*0.9;
  let res:number;
  if (a==='deg') res=deg; else if (a==='rad') res=deg*Math.PI/180; else res=deg/0.9;

  // Fracción de vuelta completa (360° = 2π rad = 400 grad) para dar contexto
  const turns = deg / 360;
  let geo: string;
  const absDeg = Math.abs(deg) % 360;
  if (absDeg === 0) geo = 'una vuelta exacta (o ángulo nulo)';
  else if (Math.abs(absDeg - 90) < 0.01) geo = 'un ángulo recto';
  else if (Math.abs(absDeg - 180) < 0.01) geo = 'un ángulo llano (media vuelta)';
  else if (absDeg < 90) geo = 'un ángulo agudo';
  else if (absDeg < 180) geo = 'un ángulo obtuso';
  else geo = 'un ángulo mayor a 180°';
  const turnTxt = Math.abs(turns) >= 0.01 ? `equivale a **${turns.toFixed(2)} vueltas** completas y ` : '';

  return {
    resultado:`${res.toFixed(4)} ${a}`,
    resumen:`${v} ${de} = ${res.toFixed(4)} ${a}.`,
    _insight: {
      title: 'Qué tan grande es el ángulo',
      text: `**${v} ${de}** = **${res.toFixed(4)} ${a}** (${deg.toFixed(2)}°). ${turnTxt}es ${geo}.`,
      tone: 'neutral',
      icon: '📐'
    }
  };
}
