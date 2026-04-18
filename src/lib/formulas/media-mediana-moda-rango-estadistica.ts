export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mediaMedianaModaRangoEstadistica(i: Inputs): Outputs {
  const s=String(i.datos||''); const arr=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x)).sort((a,b)=>a-b);
  if (arr.length===0) return { media:'—', mediana:'—', moda:'—', rango:'—', resumen:'Sin datos.' };
  const media=arr.reduce((a,b)=>a+b,0)/arr.length;
  const med=arr.length%2?arr[Math.floor(arr.length/2)]:(arr[arr.length/2-1]+arr[arr.length/2])/2;
  const freq:Record<string,number>={}; arr.forEach(x=>{freq[x]=(freq[x]||0)+1;});
  const maxf=Math.max(...Object.values(freq));
  const moda=Object.entries(freq).filter(([,v])=>v===maxf).map(([k])=>k).join(',');
  const rango=arr[arr.length-1]-arr[0];
  return { media:media.toFixed(3), mediana:med.toFixed(3), moda, rango:rango.toFixed(2), resumen:`n=${arr.length}, media=${media.toFixed(2)}, mediana=${med.toFixed(2)}.` };
}
