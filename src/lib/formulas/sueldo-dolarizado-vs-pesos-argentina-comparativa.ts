export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function sueldoDolarizadoVsPesosArgentinaComparativa(i: Inputs): Outputs {
  const u=Number(i.sueldoUsdMensual)||0; const a=Number(i.sueldoArsMensual)||0; const c=Number(i.cotMep)||1;
  const usdEnArs=u*c; const dif=usdEnArs-a;
  const rec=usdEnArs>a?`USD conviene: $${Math.round(dif).toLocaleString('es-AR')} más`:`Pesos conviene: $${Math.abs(Math.round(dif)).toLocaleString('es-AR')} más`;
  const fmtAr=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const usdGana=usdEnArs>=a;
  const pctDif=a>0?Math.abs(dif/a)*100:0;
  const insight={
    title: usdGana ? 'Conviene el sueldo en dólares' : 'Conviene el sueldo en pesos',
    text: usdGana
      ? `Tus **US$${u.toLocaleString('es-AR')}** a $${c.toLocaleString('es-AR')} MEP valen **${fmtAr(usdEnArs)}**, **${fmtAr(dif)}** más que la oferta en pesos${a>0?` (+${pctDif.toFixed(0)}%)`:''}. Además el dólar te cubre de la inflación, así que la brecha real tiende a agrandarse con el tiempo.`
      : `La oferta en pesos de **${fmtAr(a)}** supera a tus US$${u.toLocaleString('es-AR')} convertidos (**${fmtAr(usdEnArs)}**) por **${fmtAr(Math.abs(dif))}**${a>0?` (${pctDif.toFixed(0)}%)`:''}. Tené en cuenta que un sueldo en pesos pierde poder de compra con la inflación, mientras el dolarizado se mantiene.`,
    tone: usdGana ? ('good' as const) : ('neutral' as const),
    icon: '💵',
  };
  return { usdEnPesos:`$${Math.round(usdEnArs).toLocaleString('es-AR')}`, diferencia:`${dif>=0?'+':''}$${Math.round(dif).toLocaleString('es-AR')} (${((dif/a)*100).toFixed(0)}%)`, recomendacion:rec, _insight:insight };
}
