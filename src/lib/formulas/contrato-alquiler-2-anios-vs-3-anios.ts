export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function contratoAlquiler2AniosVs3Anios(i: Inputs): Outputs {
  const p=String(i.plazo||'3a');
  const info: Record<string,[string,string,string]> = {
    '2a':['Propietaria o seguro','Pactado (ICL/USD)','Plazo más corto, más flexibilidad'],
    '3a':['Propietaria o seguro','Anual ICL o pactado','Estabilidad mayor'],
    libre:['Negociable','Libre (mensual/sem/anual)','Máxima flexibilidad bilateral']
  };
  const [g,a,v]=info[p]||info['3a'];
  return { garantia:g, actualizacion:a, ventajas:v, resumen:`Contrato ${p}: ${v}.` };
}
