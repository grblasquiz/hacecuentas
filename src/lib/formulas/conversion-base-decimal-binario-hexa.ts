export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionBaseDecimalBinarioHexa(i: Inputs): Outputs {
  const n=String(i.n||'0'); const desde=Number(i.desde)||10; const a=Number(i.a)||10;
  const insightInvalido = {
    title: 'Número inválido',
    text: `El valor **${n}** no es válido en base **${desde}**. Revisá que solo uses dígitos permitidos para esa base (en hexadecimal, 0-9 y A-F).`,
    tone: 'warn',
    icon: '🔢',
  };
  let dec:number;
  try { dec=parseInt(n, desde); } catch { return { resultado:'—', resumen:'Número inválido.', _insight: insightInvalido }; }
  if (isNaN(dec)) return { resultado:'—', resumen:'Número inválido para la base dada.', _insight: insightInvalido };
  const res=dec.toString(a).toUpperCase();
  const nombreBase: Record<number,string> = { 2:'binario', 8:'octal', 10:'decimal', 16:'hexadecimal' };
  const _insight = {
    title: 'Mismo número, otra base',
    text: `**${n}** en base ${desde}${nombreBase[desde]?' ('+nombreBase[desde]+')':''} es **${res}** en base ${a}${nombreBase[a]?' ('+nombreBase[a]+')':''}. En decimal vale **${dec.toLocaleString('es-ES')}**: el valor no cambia, solo cómo se escribe.`,
    tone: 'neutral',
    icon: '🔢',
  };
  return { resultado:res, resumen:`${n} base ${desde} = ${res} base ${a} (= ${dec} dec).`, _insight };
}
