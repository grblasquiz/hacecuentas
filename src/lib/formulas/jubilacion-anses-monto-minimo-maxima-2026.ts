export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function jubilacionAnsesMontoMinimoMaxima2026(i: Inputs): Outputs {
  const t=String(i.tipo||'minima');
  const h: Record<string,[number,number]> = { minima:[403318,70000], media:[765000,70000], maxima:[2713948,0], pnc:[282323,70000] };
  const [haber,bono]=h[t]||h.minima;
  const total = haber + bono;
  const fmt = (n: number) => '$' + n.toLocaleString('es-AR');
  const nombres: Record<string,string> = { minima: 'jubilación mínima', media: 'jubilación media', maxima: 'jubilación máxima', pnc: 'pensión no contributiva (PNC)' };
  const nombre = nombres[t] || nombres.minima;
  const bonoPct = total > 0 ? Math.round((bono / total) * 100) : 0;
  const _insight = {
    title: bono > 0 ? `Cobrás ${fmt(total)} con bono` : `Cobrás ${fmt(total)} sin bono`,
    text: bono > 0
      ? `La **${nombre}** queda en **${fmt(total)}/mes**: **${fmt(haber)}** de haber más un bono de **${fmt(bono)}** (el **${bonoPct}%** del total). El bono es un refuerzo fijo, no remunerativo.`
      : `La **${nombre}** queda en **${fmt(total)}/mes** de haber, sin bono de refuerzo: el bono solo aplica a haberes bajos.`,
    tone: (t === 'minima' || t === 'pnc') ? 'warn' : 'neutral',
    icon: '👵',
  };
  const out: Outputs = {
    haberMensual: fmt(haber),
    bono: fmt(bono),
    total: fmt(total),
    resumen: `${t}: $${haber} + bono $${bono} = $${total}/mes.`,
    _insight,
  };
  if (bono > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Haber', value: haber },
        { label: 'Bono de refuerzo', value: bono },
      ],
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'Total mensual',
      ariaLabel: `Composición del haber: ${fmt(haber)} de haber más ${fmt(bono)} de bono, total ${fmt(total)}`,
    };
  }
  return out;
}
