export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dietaHipocaloricaDeficitSaludableMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      agresivo: 'Agresivo — considera más semanas',
      moderado: 'Moderado — saludable',
      conservador: 'Conservador — sostenible',
    },
    en: {
      agresivo: 'Aggressive — consider more weeks',
      moderado: 'Moderate — healthy',
      conservador: 'Conservative — sustainable',
    },
  } as const)[__lang];
  const pa=Number(i.pesoActual)||0; const po=Number(i.pesoObjetivo)||0; const s=Number(i.semanasObjetivo)||1;
  const diff=pa-po;
  const perdidaSem=diff/s;
  const deficitDia=perdidaSem*1100;
  let riesgo='';
  if(perdidaSem>1) riesgo=T.agresivo;
  else if(perdidaSem>0.5) riesgo=T.moderado;
  else riesgo=T.conservador;
  return { deficitDiario:`${Math.round(deficitDia)} kcal`, perdidaSemanal:`${perdidaSem.toFixed(2)} kg`, riesgo:riesgo };
}
