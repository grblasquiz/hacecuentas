export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function volumenSemanalHipertrofiaMusculoSeries(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { perWeek: 'series/semana', maxNote: '(máximo antes sobreentrenamiento)' },
    en: { perWeek: 'sets/week', maxNote: '(maximum before overtraining)' },
  } as const)[__lang];
  const n=String(i.nivel||'intermedio'); const g=String(i.grupoMuscular||'pectoral');
  const base={'principiante':[8,10,14],'intermedio':[12,16,20],'avanzado':[16,20,24]}[n];
  const mod={'pierna':+2,'espalda':+1}[g]||0;
  return { seriesMinimas:`${base[0]+mod} ${T.perWeek}`, seriesOptimas:`${base[1]+mod} ${T.perWeek}`, seriesMaximas:`${base[2]+mod} ${T.maxNote}` };
}
