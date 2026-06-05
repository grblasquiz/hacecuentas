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
  if (absDeg === 0) geo = 'a full rotation (or zero angle)';
  else if (Math.abs(absDeg - 90) < 0.01) geo = 'a right angle';
  else if (Math.abs(absDeg - 180) < 0.01) geo = 'a straight angle (half rotation)';
  else if (absDeg < 90) geo = 'an acute angle';
  else if (absDeg < 180) geo = 'an obtuse angle';
  else geo = 'an angle greater than 180°';
  const turnTxt = Math.abs(turns) >= 0.01 ? `equals **${turns.toFixed(2)} full rotations** and ` : '';

  return {
    resultado:`${res.toFixed(6)} ${a}`,
    resumen:`${v} ${de} = ${res.toFixed(6)} ${a}.`,
    _insight: {
      title: 'Angle size',
      text: `**${v} ${de}** = **${res.toFixed(6)} ${a}** (${deg.toFixed(4)}°). ${turnTxt}That is ${geo}.`,
      tone: 'neutral',
      icon: '📐'
    }
  };
}
