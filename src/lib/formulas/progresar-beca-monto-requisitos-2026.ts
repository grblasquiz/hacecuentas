export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function progresarBecaMontoRequisitos2026(i: Inputs): Outputs {
  const n=String(i.nivel||'uni');
  const m: Record<string,number> = { sec:25000, ter:30000, uni:40000, trab:30000 };
  const monto = m[n]||30000;
  const labels: Record<string,string> = { sec:'Obligatorio (secundario)', ter:'Superior (terciario)', uni:'Superior (universitario)', trab:'Trabajo' };
  const nivelTxt = labels[n] || 'Progresar';
  const anual = monto * 12;
  const _insight = {
    title: 'Cuánto cobrás por año',
    text: `La línea **${nivelTxt}** paga **$${monto.toLocaleString('es-AR')}/mes**, unos **$${anual.toLocaleString('es-AR')}** en los 12 pagos del año. Recordá que el **80%** se acredita mes a mes y el **20%** queda retenido hasta que presentés el certificado de regularidad.`,
    tone: 'good',
    icon: '🎓',
  };
  return { monto:'$'+monto.toLocaleString('es-AR'), requisitos:'16-24 años, ingreso familiar ≤3 SMVM, escolaridad regular', resumen:`Beca Progresar ${n}: $${monto.toLocaleString('es-AR')}/mes.`, _insight };
}
