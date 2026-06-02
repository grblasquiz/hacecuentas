export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function titularidadCaratularAutoTrasladarProvincia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      tiempo: '5-15 días',
      insTitle: 'Desglose del trámite',
      fijo: 'Aranceles fijos',
      sellos: 'Impuesto de sellos',
      total: 'Costo total',
    },
    en: {
      tiempo: '5-15 days',
      insTitle: 'Procedure cost breakdown',
      fijo: 'Fixed fees',
      sellos: 'Stamp tax',
      total: 'Total cost',
    },
  } as const)[__lang];
  const v=Number(i.valor)||0; const d=String(i.provDestino||'pba');
  const sel: Record<string,number> = { caba:0.015, pba:0.02, cba:0.02, sfe:0.018 };
  const FIJO = 85000;
  const sellos = v*(sel[d]||0.02);
  const c=FIJO+sellos;
  const sellosPct = ((sel[d]||0.02)*100).toFixed(1);
  const resumen = __lang === 'en'
    ? `Transfer to ${d.toUpperCase()} vehicle $${v.toLocaleString('es-AR')}: ~$${c.toFixed(0)}.`
    : `Radicación a ${d.toUpperCase()} auto $${v.toLocaleString('es-AR')}: ~$${c.toFixed(0)}.`;
  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const out: Outputs = {
    costo:'$'+c.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    tiempo: T.tiempo,
    resumen,
    _insight: {
      title: T.insTitle,
      text: __lang === 'en'
        ? `Re-titling in **${d.toUpperCase()}** runs about **$${fmt(c)}**: ~$${fmt(FIJO)} in fixed fees plus a **${sellosPct}% stamp tax** (**$${fmt(sellos)}**) on the declared value. Higher-value vehicles pay more, since the tax scales with the price.`
        : `Radicar en **${d.toUpperCase()}** sale unos **$${fmt(c)}**: ~$${fmt(FIJO)} de aranceles fijos más el **impuesto de sellos del ${sellosPct}%** (**$${fmt(sellos)}**) sobre el valor declarado. A mayor valor del auto, mayor el sellado.`,
      tone: 'neutral',
      icon: '🚗',
    },
  };
  // Donut sólo si el sellado aporta una porción (valor > 0)
  if (sellos > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: T.fijo, value: Math.round(FIJO) },
        { label: T.sellos, value: Math.round(sellos) },
      ],
      prefix: '$',
      centerValue: '$' + fmt(c),
      centerLabel: T.total,
      ariaLabel: __lang === 'en'
        ? `Total cost of $${fmt(c)} split into $${fmt(FIJO)} fixed fees and $${fmt(sellos)} stamp tax`
        : `Costo total de $${fmt(c)} dividido en $${fmt(FIJO)} de aranceles fijos y $${fmt(sellos)} de impuesto de sellos`,
    };
  }
  return out;
}
