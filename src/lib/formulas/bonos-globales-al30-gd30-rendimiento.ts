export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; }
export function bonosGlobalesAl30Gd30Rendimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.precioCompra)||0; const c=Number(i.cuponAnual)||0; const n=Number(i.anosRestantes)||1;
  const tir=p>0?(((100/p)**(1/n)-1)*100+c/p*100):0;
  const interpretacion = __lang === 'en'
    ? `If you hold for ${n} years and there is no default, the yield is ~${tir.toFixed(1)}% per year in USD.`
    : `Si mantenés ${n} años y no hay default, rinde ~${tir.toFixed(1)}% anual en USD.`;

  // --- Insight narrativo: la TIR alta es prima de riesgo, no regalo ---
  const corrienteAnual = p > 0 ? (c / p) * 100 : 0;
  const upside = p > 0 && p < 100 ? ((100 - p) / p) * 100 : 0;
  const tone = tir >= 15 ? 'warn' : tir >= 8 ? 'neutral' : 'good';
  const _insight = {
    title: __lang === 'en' ? 'High yield = priced-in risk' : 'TIR alta = riesgo en el precio',
    text: __lang === 'en'
      ? `Buying at **${p}** with a **USD ${c.toFixed(2)}** coupon gives a current yield of **${corrienteAnual.toFixed(1)}%**; holding to maturity targets **~${tir.toFixed(1)}% annual in USD**${upside > 0 ? `, boosted by **${upside.toFixed(0)}%** of price upside if it pays par` : ''}. A double-digit TIR reflects default risk already priced in — the return only lands if Argentina honors the bond.`
      : `Comprar a **${p}** con cupón de **USD ${c.toFixed(2)}** da un rendimiento corriente de **${corrienteAnual.toFixed(1)}%**; manteniendo a vencimiento apuntás a **~${tir.toFixed(1)}% anual en USD**${upside > 0 ? `, potenciado por **${upside.toFixed(0)}%** de upside de precio si paga a la par` : ''}. Una TIR de dos dígitos refleja riesgo de default ya descontado: el retorno solo se concreta si Argentina cumple.`,
    tone,
    icon: '🇦🇷'
  };

  return { tirAproximada:`${tir.toFixed(1)}%`, ingresoCuponAnual:`USD ${c.toFixed(2)}`, interpretacion, _insight };
}
