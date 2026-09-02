export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ansesComplementoLecheMaternidad(i: Inputs): Outputs {
  const s=String(i.situacion||'emb');
  const etiqueta: Record<string,string> = { emb:'embarazo', lact:'lactancia', h5:'hijo menor de 5 años' };
  const _insight = {
    title: 'Complemento Leche ANSES',
    text: `El Complemento Leche para ${etiqueta[s] || 'tu situación'} no figura con un importe general en la Resolución 233/2026. Confirmá si te corresponde y el monto liquidado en **Mi ANSES → Hijos → Mis Asignaciones**.`,
    tone: 'neutral',
    icon: '🍼',
  };
  return { monto:'Consultar Mi ANSES', resumen:`El importe de Complemento Leche para ${etiqueta[s] || s} debe confirmarse en la liquidación individual de Mi ANSES.`, _insight };
}
