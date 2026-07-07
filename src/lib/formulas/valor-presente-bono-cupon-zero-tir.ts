export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function valorPresenteBonoCuponZeroTir(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      descuento: (desc: number) => `${desc.toFixed(1)}% del VN`,
      interpretacion: (vn: number, a: number, tir: number, vp: number) => `Un bono que paga $${vn} en ${a} años al ${tir}% TIR vale hoy $${vp.toFixed(2)}.`,
      insTitle: 'Lo que pagás hoy vs. lo que cobrás',
      insText: (vp: number, vn: number, a: number, ganancia: number, desc: number) => `Pagás **$${vp.toFixed(2)}** hoy para cobrar **$${vn}** en ${a} años: una ganancia de **$${ganancia.toFixed(2)}** (${desc.toFixed(1)}% de descuento sobre el valor nominal). El bono cupón cero no paga renta en el camino, todo el retorno está en ese diferencial.`,
      sliceCapital: 'Lo que pagás hoy',
      sliceGanancia: 'Ganancia al vencimiento',
      centerLabel: 'Valor nominal',
      aria: 'Composición del valor nominal del bono entre el precio que pagás hoy y la ganancia al vencimiento',
    },
    en: {
      descuento: (desc: number) => `${desc.toFixed(1)}% of FV`,
      interpretacion: (vn: number, a: number, tir: number, vp: number) => `A bond paying $${vn} in ${a} years at ${tir}% YTM is worth $${vp.toFixed(2)} today.`,
      insTitle: 'What you pay today vs. what you collect',
      insText: (vp: number, vn: number, a: number, ganancia: number, desc: number) => `You pay **$${vp.toFixed(2)}** today to collect **$${vn}** in ${a} years: a gain of **$${ganancia.toFixed(2)}** (${desc.toFixed(1)}% discount off face value). A zero-coupon bond pays no interest along the way — the whole return is in that spread.`,
      sliceCapital: 'What you pay today',
      sliceGanancia: 'Gain at maturity',
      centerLabel: 'Face value',
      aria: 'Breakdown of the bond face value into the price you pay today and the gain at maturity',
    },
  } as const)[__lang];
  const vn=Number(i.valorNominal)||0; const tir=Number(i.tir)||0; const a=Number(i.anos)||0;
  const vp=vn/((1+tir/100)**a); const desc=((1-vp/vn)*100);
  const ganancia = vn - vp;
  const insight = {
    title: T.insTitle,
    text: T.insText(vp, vn, a, ganancia, desc),
    tone: 'neutral',
    icon: '🏦',
  };
  const chart = (vn > 0 && vp > 0 && ganancia > 0) ? {
    type: 'doughnut' as const,
    slices: [
      { label: T.sliceCapital, value: Number(vp.toFixed(2)) },
      { label: T.sliceGanancia, value: Number(ganancia.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: `$${vn.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR')}`,
    centerLabel: T.centerLabel,
    ariaLabel: T.aria,
  } : undefined;
  return { valorPresente:`$${vp.toFixed(2)}`, descuento:T.descuento(desc), interpretacion:T.interpretacion(vn,a,tir,vp), _insight: insight, ...(chart ? { _chart: chart } : {}) };
}
