export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function mediaMedianaModaRangoEstadistica(i: Inputs): Outputs {
  const s=String(i.datos||''); const arr=s.split(',').map(x=>Number(x.trim())).filter(x=>!isNaN(x)).sort((a,b)=>a-b);
  if (arr.length===0) return { media:'—', mediana:'—', moda:'—', rango:'—', resumen:'Sin datos.' };
  const media=arr.reduce((a,b)=>a+b,0)/arr.length;
  const med=arr.length%2?arr[Math.floor(arr.length/2)]:(arr[arr.length/2-1]+arr[arr.length/2])/2;
  const freq:Record<string,number>={}; arr.forEach(x=>{freq[x]=(freq[x]||0)+1;});
  const maxf=Math.max(...Object.values(freq));
  const moda=Object.entries(freq).filter(([,v])=>v===maxf).map(([k])=>k).join(',');
  const rango=arr[arr.length-1]-arr[0];

  // Sesgo: comparación media vs mediana indica hacia dónde "tira" la distribución
  const dif = media - med;
  const sesgoTxt = Math.abs(dif) < 1e-9
    ? `La **media (${media.toFixed(2)})** y la **mediana (${med.toFixed(2)})** coinciden: la distribución de tus ${arr.length} datos es simétrica.`
    : dif > 0
    ? `La **media (${media.toFixed(2)})** supera a la **mediana (${med.toFixed(2)})**: hay valores altos que la estiran hacia arriba (sesgo a la derecha).`
    : `La **media (${media.toFixed(2)})** queda por debajo de la **mediana (${med.toFixed(2)})**: valores bajos la arrastran (sesgo a la izquierda).`;
  const _insight = {
    title: "Cómo leer tus estadísticas",
    text: `${sesgoTxt} El **rango es ${rango.toFixed(2)}** (de ${arr[0]} a ${arr[arr.length-1]}).`,
    tone: "neutral",
    icon: "📊",
  };

  return { media:media.toFixed(3), mediana:med.toFixed(3), moda, rango:rango.toFixed(2), resumen:`n=${arr.length}, media=${media.toFixed(2)}, mediana=${med.toFixed(2)}.`, _insight };
}
