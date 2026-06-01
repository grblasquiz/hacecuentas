export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _chart?: any; }
export function cuotaPrestamoAutoFrancesArgentino(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      intereses: 'Intereses',
      ariaLabel: 'Composición del total a pagar: capital del préstamo más intereses',
    },
    en: {
      intereses: 'Interest',
      ariaLabel: 'Breakdown of total amount due: loan principal plus interest',
    },
  } as const)[__lang];
  const v=Number(i.v)||0; const n=Number(i.meses)||1; const tna=Number(i.tna)||0;
  const i_m=tna/100/12;
  const c=i_m===0?v/n:v*i_m*Math.pow(1+i_m,n)/(Math.pow(1+i_m,n)-1);
  const total=c*n;
  const interes=total-v;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: v },
      { label: T.intereses, value: interes },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: T.ariaLabel,
  };
  const resumen = __lang === 'en'
    ? `Monthly payment $${c.toFixed(0)}, total $${total.toFixed(0)} (interest $${(total-v).toFixed(0)}).`
    : `Cuota $${c.toFixed(0)}, total $${total.toFixed(0)} (interés $${(total-v).toFixed(0)}).`;
  return { cuota:`$${c.toFixed(2)}`, total:`$${total.toFixed(2)}`, interes:`$${(total-v).toFixed(2)}`, resumen, _chart: chart };
}
