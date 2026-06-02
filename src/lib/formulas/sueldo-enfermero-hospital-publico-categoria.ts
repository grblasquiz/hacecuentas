export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }
export function sueldoEnfermeroHospitalPublicoCategoria(i: Inputs): Outputs {
  const sec=String(i.sector||'pub'); const cat=String(i.categoria||'prof'); const g=Number(i.guardias)||0;
  const bases: Record<string,Record<string,number>> = {
    pub: { auxi:800000, prof:900000, lic:1100000 },
    priv: { auxi:900000, prof:1050000, lic:1250000 },
    dom: { auxi:700000, prof:850000, lic:950000 }
  };
  const b=(bases[sec]||bases.pub)[cat]||900000;
  const guardia=(sec==='priv'?90000:70000)*g;
  const bruto=b+guardia;
  const neto=bruto*0.83;
  const descuentos=bruto-neto;
  const pctGuardia=bruto>0?Math.round((guardia/bruto)*100):0;
  const fmt=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Básico', value: Math.round(b) },
      { label: 'Guardias', value: Math.round(guardia) },
    ],
    prefix: '$',
    centerValue: '$' + fmt(bruto),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto del enfermero: básico de categoría más adicional por guardias.',
  };
  const insight = {
    title: g>0 ? 'Cuánto suman tus guardias' : 'Tu sueldo sin guardias',
    text: g>0
      ? `Las **${g} guardias** aportan **$${fmt(guardia)}** y son el **${pctGuardia}%** de tu bruto (**$${fmt(bruto)}**). De ahí cobrás **$${fmt(neto)}** netos tras los descuentos de ley.`
      : `Sin guardias, tu bruto es **$${fmt(bruto)}** y cobrás **$${fmt(neto)}** netos. Cada guardia que sumes engrosa directo el bolsillo: probá cambiando la cantidad.`,
    tone: 'neutral',
    icon: '🩺',
  };
  return { basico:'$'+b.toLocaleString('es-AR'), guardiasM:'$'+guardia.toLocaleString('es-AR'), neto:'$'+fmt(neto), resumen:`${cat} ${sec} + ${g} guardias: neto ~$${neto.toFixed(0)}.`, _chart:chart, _insight:insight };
}
