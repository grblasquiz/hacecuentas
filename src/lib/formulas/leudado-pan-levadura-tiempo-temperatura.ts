export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function leudadoPanLevaduraTiempoTemperatura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const T = ({
    es: {
      resumen: `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`,
      insTitle: 'Resultado',
      insText: `Multiplicar **${v1}** por **${v2}** da como resultado **${r.toFixed(2)}**.`,
    },
    en: {
      resumen: `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`,
      insTitle: 'Result',
      insText: `Multiplying **${v1}** by **${v2}** gives **${r.toFixed(2)}**.`,
    },
  } as const)[__lang];
  const _insight = { title: T.insTitle, text: T.insText, tone: 'neutral', icon: '🍞' };
  return { resultado:r.toFixed(2), resumen:T.resumen, _insight };
}
