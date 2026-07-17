export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function progresarBecaMontoRequisitos2026(i: Inputs): Outputs {
  const n=String(i.nivel||'uni');
  // Resolución 172/2026, art. 4: $35.000 para las líneas de la convocatoria.
  // La cantidad de cuotas y la retención dependen de la línea/condición; se explican
  // en la página y se calculan en la herramienta específica de retención.
  const m: Record<string,number> = { sec:35000, ter:35000, uni:35000, trab:35000 };
  const monto = m[n]||35000;
  const labels: Record<string,string> = { sec:'Obligatorio (secundario)', ter:'Superior (terciario)', uni:'Superior (universitario)', trab:'Trabajo' };
  const nivelTxt = labels[n] || 'Progresar';
  const anual = monto * 12;
  const _insight = {
    title: 'Cuánto cobrás por año',
    text: `Para la convocatoria 2026 el monto de referencia es **$${monto.toLocaleString('es-AR')}/mes**. El esquema puede llegar a 12 cuotas en primera convocatoria; la retención y cuotas estímulo dependen de tu línea, condición académica y certificaciones.`,
    tone: 'good',
    icon: '🎓',
  };
  return { monto:'$'+monto.toLocaleString('es-AR'), requisitos:'Requisitos por línea: edad, ingresos del grupo familiar y regularidad académica. Confirmá en Progresar.', resumen:`Progresar 2026: $${monto.toLocaleString('es-AR')}/mes como referencia de convocatoria.`, _insight };
}
