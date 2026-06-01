export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function boxeoCaloriasQuemadasRoundsPeso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.pesoKg)||0; const t=String(i.tipo||'bolsa'); const m=Number(i.minutos)||0;
  const met={'sombra':6,'bolsa':9,'sparring':12,'kickboxing':10}[t];
  const cal=met*p*m/60;
  const tipoLabel = __lang === 'en'
    ? ({ sombra:'shadowboxing', bolsa:'heavy bag', sparring:'sparring', kickboxing:'kickboxing' } as Record<string,string>)[t] ?? t
    : t;
  const interpretacion = __lang === 'en'
    ? `${m} min of ${tipoLabel}: ${Math.round(cal)} kcal.`
    : `${m} min de ${t}: ${Math.round(cal)} kcal.`;
  return { caloriasQuemadas:`${Math.round(cal)} kcal`, mets:`MET ${met}`, interpretacion };
}
