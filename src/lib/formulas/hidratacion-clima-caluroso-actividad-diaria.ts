export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hidratacionClimaCalurosoActividadDiaria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      vasos: (v: number) => `${v} vasos`,
      recordatorio: (ml: number) => `Divide en 8 tomas. Mañana 500 mL, cada hora ${Math.round(ml/16)} mL.`,
    },
    en: {
      vasos: (v: number) => `${v} glasses`,
      recordatorio: (ml: number) => `Split into 8 servings. Morning 500 mL, each hour ${Math.round(ml/16)} mL.`,
    },
  } as const)[__lang];
  const p=Number(i.pesoKg)||0; const t=Number(i.temperaturaC)||20; const a=Number(i.actividadMin)||0;
  let ml=p*35;
  if(t>25) ml*=1+(t-25)/5*0.15;
  ml+=a*17;
  const L=ml/1000; const v=Math.round(ml/250);
  return { litrosDia:`${L.toFixed(1)} L`, vasos:T.vasos(v), recordatorio:T.recordatorio(ml) };
}
