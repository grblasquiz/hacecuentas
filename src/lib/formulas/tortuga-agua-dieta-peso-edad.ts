export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tortugaAguaDietaPesoEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const rStr = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${rStr}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} / 10 = ${rStr}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${rStr}.`;
  const _insight = __lang === 'en'
    ? { title: 'Your result', text: `With the values entered, the result is **${rStr}**. Adjust the daily ration to your turtle's weight and age, and split it across several small feedings.`, tone: 'neutral', icon: '🐢' }
    : __lang === 'pt'
    ? { title: 'Seu resultado', text: `Com os valores informados, o resultado é **${rStr}**. Ajuste a ração diária ao peso e à idade da sua tartaruga e divida em várias refeições pequenas.`, tone: 'neutral', icon: '🐢' }
    : { title: 'Tu resultado', text: `Con los valores ingresados, el resultado es **${rStr}**. Ajustá la ración diaria al peso y la edad de tu tortuga y repartila en varias comidas chicas.`, tone: 'neutral', icon: '🐢' };
  return { resultado:rStr, resumen, _insight };
}
