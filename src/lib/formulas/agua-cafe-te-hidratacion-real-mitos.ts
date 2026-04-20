export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aguaCafeTeHidratacionRealMitos(i: Inputs): Outputs {
  const c=Number(i.cafesDia)||0; const t=Number(i.taza_ml)||150;
  const totalMl=c*t;
  const hidratacion=totalMl*0.9;
  return { hidratacionNeta:`${Math.round(hidratacion)} mL (~${(hidratacion/1000).toFixed(1)} L)`, mito:'Mito: café deshidrata. Realidad: hidrata ~90%. Solo efecto diurético leve.', recomendacion:'Café cuenta como hidratación. Con moderación (<400 mg cafeína/día).' };
}
