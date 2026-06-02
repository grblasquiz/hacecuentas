export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function expensasDepartamentoCalcularM2Categoria(i: Inputs): Outputs {
  const m2=Number(i.m2)||0; const c=String(i.categoria||'medio'); const a=Number(i.amenities)||0;
  const perM2: Record<string,number> = { basico:1500, medio:2200, alto:3500 };
  const baseM2=perM2[c]||2200;
  const v=baseM2+a*400;
  const exp=m2*v;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const costoBase=m2*baseM2;
  const costoAmenities=m2*a*400;
  const pctAmen=exp>0?(costoAmenities/exp)*100:0;
  return {
    expensas:'$'+exp.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),
    porM2:'$'+v.toLocaleString('es-AR'),
    resumen:`${m2}m² ${c}: ~$${v}/m² = $${exp.toFixed(0)}/mes.`,
    _insight: {
      title: 'Cómo se arma la expensa',
      text: a>0
        ? `Sobre una base de **${fmt(baseM2)}/m²** (categoría ${c}), los **${a} amenities** suman **$${(a*400).toLocaleString('es-AR')}/m²** y elevan la cuota a **${fmt(exp)}/mes** — los amenities pesan **${pctAmen.toFixed(0)}%** del total.`
        : `Sin amenities, la expensa estimada para ${m2}m² categoría ${c} es de **${fmt(exp)}/mes** (**${fmt(v)}/m²**). Cada amenity agrega ~$${(m2*400).toLocaleString('es-AR')}/mes a este edificio.`,
      tone: a>=4 ? 'warn' : 'neutral',
      icon: '🏢',
    },
    _chart: costoAmenities>0 ? {
      type: 'doughnut',
      slices: [
        { label: `Base (${c})`, value: Math.round(costoBase) },
        { label: `Amenities (${a})`, value: Math.round(costoAmenities) },
      ],
      prefix: '$',
      centerValue: fmt(exp),
      centerLabel: 'Expensa/mes',
      ariaLabel: `Expensa mensual de ${fmt(exp)}: base ${fmt(costoBase)} más amenities ${fmt(costoAmenities)}.`,
    } : undefined,
  };
}
