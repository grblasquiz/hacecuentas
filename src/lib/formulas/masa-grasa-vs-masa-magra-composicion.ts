export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function masaGrasaVsMasaMagraComposicion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      muyBajo: 'Muy bajo (atlético o riesgo)',
      bajo: 'Bajo/Óptimo hombre',
      normal: 'Normal',
      sobrepeso: 'Sobrepeso graso',
      obesidad: 'Obesidad',
      insightTitle: 'Tu composición corporal',
      fatLabel: 'Masa grasa',
      leanLabel: 'Masa magra',
      centerLabel: 'Peso total',
      insightFn: (mg: number, mm: number, g: number, clas: string) =>
        `De tus **${(mg + mm).toFixed(1)} kg**, **${mg.toFixed(1)} kg son grasa** (${g}%) y **${mm.toFixed(1)} kg masa magra** (músculo, hueso, agua). Clasificación: ${clas}.`,
      ariaFn: (mg: number, mm: number) =>
        `Composición corporal: ${mg.toFixed(1)} kg de masa grasa y ${mm.toFixed(1)} kg de masa magra`,
    },
    en: {
      muyBajo: 'Very low (athletic or at risk)',
      bajo: 'Low/Optimal (male)',
      normal: 'Normal',
      sobrepeso: 'Overweight (high fat)',
      obesidad: 'Obesity',
      insightTitle: 'Your body composition',
      fatLabel: 'Fat mass',
      leanLabel: 'Lean mass',
      centerLabel: 'Total weight',
      insightFn: (mg: number, mm: number, g: number, clas: string) =>
        `Of your **${(mg + mm).toFixed(1)} kg**, **${mg.toFixed(1)} kg is fat** (${g}%) and **${mm.toFixed(1)} kg is lean mass** (muscle, bone, water). Classification: ${clas}.`,
      ariaFn: (mg: number, mm: number) =>
        `Body composition: ${mg.toFixed(1)} kg fat mass and ${mm.toFixed(1)} kg lean mass`,
    },
  } as const)[__lang];
  const p=Number(i.pesoKg)||0; const g=Number(i.porcentajeGrasa)||0;
  const mg=p*g/100; const mm=p-mg;
  let clas='';
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if(g<10){ clas=T.muyBajo; tone='warn'; }
  else if(g<20){ clas=T.bajo; tone='good'; }
  else if(g<25){ clas=T.normal; tone='good'; }
  else if(g<30){ clas=T.sobrepeso; tone='warn'; }
  else { clas=T.obesidad; tone='warn'; }
  return {
    masaGrasa:`${mg.toFixed(1)} kg`,
    masaMagra:`${mm.toFixed(1)} kg`,
    clasificacion:clas,
    _insight: {
      title: T.insightTitle,
      text: T.insightFn(mg, mm, g, clas),
      tone,
      icon: '💪',
    },
    ...(p > 0 && g > 0
      ? {
          _chart: {
            type: 'doughnut',
            slices: [
              { label: T.fatLabel, value: Number(mg.toFixed(1)) },
              { label: T.leanLabel, value: Number(mm.toFixed(1)) },
            ],
            prefix: '',
            centerValue: `${p.toFixed(1)} kg`,
            centerLabel: T.centerLabel,
            ariaLabel: T.ariaFn(mg, mm),
          },
        }
      : {}),
  };
}
