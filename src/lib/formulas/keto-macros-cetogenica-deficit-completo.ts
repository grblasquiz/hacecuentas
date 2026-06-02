export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function ketoMacrosCetogenicaDeficitCompleto(i: Inputs): Outputs {
  const c=Number(i.calorias)||0; const o=String(i.objetivo||'mantener');
  const mult={'adelgazar':0.8,'mantener':1,'ganar':1.15}[o] ?? 1;
  const cal=c*mult;
  const grasa=cal*0.72/9;
  const prot=cal*0.23/4;
  const carb=cal*0.05/4;
  const calGrasa=Math.round(grasa*9);
  const calProt=Math.round(prot*4);
  const calCarb=Math.round(carb*4);
  const objTxt = o==='adelgazar' ? 'déficit para adelgazar' : o==='ganar' ? 'superávit para ganar masa' : 'mantenimiento';
  return {
    grasaG:`${Math.round(grasa)} g`,
    proteinaG:`${Math.round(prot)} g`,
    carbosG:`${Math.round(carb)} g`,
    _insight: {
      title: 'Tu reparto cetogénico',
      text: `Sobre **${Math.round(cal)} kcal** (${objTxt}), apuntá a **${Math.round(grasa)} g** de grasa, **${Math.round(prot)} g** de proteína y solo **${Math.round(carb)} g** de carbohidratos. La grasa aporta el ~72% de la energía: es el combustible de la cetosis.`,
      tone: 'neutral',
      icon: '🥑',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Grasa', value: calGrasa },
        { label: 'Proteína', value: calProt },
        { label: 'Carbohidratos', value: calCarb },
      ],
      prefix: '',
      centerValue: `${Math.round(cal)} kcal`,
      centerLabel: 'Total diario',
      ariaLabel: `Reparto de ${Math.round(cal)} kcal entre grasa, proteína y carbohidratos en dieta keto`,
    },
  };
}
