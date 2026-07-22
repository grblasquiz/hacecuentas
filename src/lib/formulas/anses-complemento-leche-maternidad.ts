export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ansesComplementoLecheMaternidad(i: Inputs): Outputs {
  const s=String(i.situacion||'emb');
  const m: Record<string,number> = { emb:55841, lact:55841, h5:55841 };
  const monto = m[s] || 0;
  const anual = monto * 12;
  const etiqueta: Record<string,string> = { emb:'embarazo', lact:'lactancia', h5:'hijo menor de 5 años' };
  const _insight = {
    title: 'Complemento Leche ANSES',
    text: `Por **${etiqueta[s] || s}** te corresponden **$${monto.toLocaleString('es-AR')}/mes**, lo que suma **$${anual.toLocaleString('es-AR')}** en un año de cobro. Se paga junto con la Asignación Universal o el SUAF, según tu caso.`,
    tone: 'good',
    icon: '🍼',
  };
  return { monto:'$'+monto.toLocaleString('es-AR'), resumen:`Complemento leche ${s}: $${monto.toLocaleString('es-AR')}/mes.`, _insight };
}
