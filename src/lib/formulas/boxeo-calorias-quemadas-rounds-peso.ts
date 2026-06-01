export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
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
  const calR = Math.round(cal);
  const porMin = m > 0 ? cal / m : 0;
  // equivalencia útil: alfajor ~220 kcal, una porción de pizza ~285 kcal
  const alfajores = calR / 220;
  const _insight = {
    title: __lang === 'en' ? 'What you burned' : 'Lo que quemaste',
    text: __lang === 'en'
      ? `${m} min of ${tipoLabel} burned about **${calR} kcal** (~**${porMin.toFixed(1)} kcal/min**), roughly **${alfajores.toFixed(1)}** alfajores. Heavier bodyweight and higher-intensity styles (sparring, kickboxing) push this number up.`
      : `${m} min de ${t} queman unas **${calR} kcal** (~**${porMin.toFixed(1)} kcal/min**), aprox. **${alfajores.toFixed(1)}** alfajores. A mayor peso corporal y estilos más intensos (sparring, kickboxing) el número sube.`,
    tone: 'good',
    icon: '🥊',
  };
  return { caloriasQuemadas:`${calR} kcal`, mets:`MET ${met}`, interpretacion, _insight };
}
