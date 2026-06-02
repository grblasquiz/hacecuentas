export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function volumenSemanalHipertrofiaMusculoSeries(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { perWeek: 'series/semana', maxNote: '(máximo antes sobreentrenamiento)',
      iTitle: 'Tu volumen óptimo', iIcon: '💪',
      iText: (opt: number, mn: number, mx: number, g: string) => `Para **${g}** apuntá a **${opt} series/semana** como punto ideal de crecimiento. Por debajo de **${mn}** estimulás poco; arriba de **${mx}** entrás en riesgo de sobreentrenamiento.`,
      segLow: 'Insuficiente', segOpt: 'Óptimo', segHigh: 'Excesivo', mk: 'óptimo',
      aria: (opt: number, mn: number, mx: number) => `Volumen óptimo de ${opt} series semanales, dentro del rango productivo de ${mn} a ${mx} series.` },
    en: { perWeek: 'sets/week', maxNote: '(maximum before overtraining)',
      iTitle: 'Your optimal volume', iIcon: '💪',
      iText: (opt: number, mn: number, mx: number, g: string) => `For **${g}** aim for **${opt} sets/week** as the ideal growth point. Below **${mn}** the stimulus is too low; above **${mx}** you risk overtraining.`,
      segLow: 'Insufficient', segOpt: 'Optimal', segHigh: 'Excessive', mk: 'optimal',
      aria: (opt: number, mn: number, mx: number) => `Optimal volume of ${opt} weekly sets, inside the productive range of ${mn} to ${mx} sets.` },
  } as const)[__lang];
  const n=String(i.nivel||'intermedio'); const g=String(i.grupoMuscular||'pectoral');
  const base={'principiante':[8,10,14],'intermedio':[12,16,20],'avanzado':[16,20,24]}[n];
  const mod={'pierna':+2,'espalda':+1}[g]||0;
  const sMin=base[0]+mod, sOpt=base[1]+mod, sMax=base[2]+mod;
  return { seriesMinimas:`${sMin} ${T.perWeek}`, seriesOptimas:`${sOpt} ${T.perWeek}`, seriesMaximas:`${sMax} ${T.maxNote}`,
    _insight: {
      title: T.iTitle,
      text: T.iText(sOpt, sMin, sMax, g),
      tone: 'good',
      icon: T.iIcon,
    },
    _chart: {
      type: 'scale',
      marker: sOpt,
      markerLabel: `${sOpt} (${T.mk})`,
      min: 0,
      segments: [
        { nombre: T.segLow, max: sMin, color: '#fca5a5', colorDark: '#7f1d1d' },
        { nombre: T.segOpt, max: sMax, color: '#86efac', colorDark: '#14532d' },
        { nombre: T.segHigh, max: sMax + 6, color: '#fcd34d', colorDark: '#78350f' },
      ],
      ariaLabel: T.aria(sOpt, sMin, sMax),
    },
  };
}
