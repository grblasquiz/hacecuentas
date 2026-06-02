export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function visaTurismoUsaEeUuCostoB1B2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const d=Number(i.dolarOficial)||1400;
  const usd=185;
  const mrvArs=usd*d;
  const gest=80000;
  const total=mrvArs+gest;
  const resumen = __lang === 'en'
    ? `USA Visa: USD ${usd} (≈$${mrvArs.toFixed(0)}) + processing fee = ~$${total.toFixed(0)}.`
    : `Visa USA: USD ${usd} (≈$${mrvArs.toFixed(0)}) + gestión = ~$${total.toFixed(0)}.`;
  const fmt = (n: number) => '$' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const mrvPct = Math.round((mrvArs / total) * 100);
  const _insight = {
    title: __lang === 'en' ? 'What the visa costs you' : 'Lo que te sale la visa',
    text: __lang === 'en'
      ? `Tramiting the B1/B2 visa runs about **${fmt(total)}**: the **USD ${usd}** MRV fee weighs ~**${mrvPct}%** of the total at the **$${d}** dollar, plus **${fmt(gest)}** in handling. The MRV is non-refundable even if your visa is denied.`
      : `Tramitar la visa B1/B2 te sale unos **${fmt(total)}**: la tasa MRV de **USD ${usd}** pesa ~**${mrvPct}%** del total al dólar **$${d}**, más **${fmt(gest)}** de gestión. La MRV no se reembolsa aunque te nieguen la visa.`,
    tone: 'warn' as const,
    icon: '🛂',
  };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: __lang === 'en' ? 'MRV fee (USD ' + usd + ')' : 'Tasa MRV (USD ' + usd + ')', value: Math.round(mrvArs) },
      { label: __lang === 'en' ? 'Handling' : 'Gestión', value: gest },
    ],
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: __lang === 'en' ? 'Total' : 'Total',
    ariaLabel: __lang === 'en'
      ? 'Breakdown of the USA visa cost: MRV fee plus handling'
      : 'Desglose del costo de la visa USA: tasa MRV más gestión',
  };
  return { mrvFee:'USD '+usd, mrvArs:'$'+mrvArs.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), gestion:'$'+gest.toLocaleString('es-AR'), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen, _insight, _chart };
}
