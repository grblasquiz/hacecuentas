export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function introduccionAlimentosBlwEdadEtapa6meses(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  if(m<6) return { apto:'No todavía', etapa:'Leche exclusiva', recomendacion:'Esperá hasta 6 meses y signos de preparación.' };
  if(m<9) return { apto:'Sí', etapa:'Inicio BLW', recomendacion:'Tiras blandas de palta, banana, batata, zapallo.' };
  if(m<12) return { apto:'Sí', etapa:'Variedad creciente', recomendacion:'Carne desmenuzada, legumbres blandas, frutas en trozos.' };
  return { apto:'Sí', etapa:'Variada', recomendacion:'Comida familiar sin sal ni azúcar agregada.' };
}
