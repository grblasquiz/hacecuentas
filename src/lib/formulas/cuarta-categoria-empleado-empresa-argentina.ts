export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
export function cuartaCategoriaEmpleadoEmpresaArgentina(i: Inputs): Outputs {
  const b=Number(i.brutoAnual)||0;
  const base=b*0.85;
  const mni=21000000;
  const imponible=Math.max(0,base-mni);
  const imp=imponible*0.25;
  const alic=b>0?imp/b*100:0;
  const neto=Math.max(0,b-imp);
  const fmt=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');

  const out: Outputs = {
    base:'$'+fmt(base),
    impuesto:'$'+fmt(imp),
    alicuotaProm:(b>0?alic.toFixed(1):'0')+'%',
    resumen:`Bruto anual $${b.toLocaleString('es-AR')}: impuesto ~$${imp.toFixed(0)}.`
  };

  if (b>0) {
    if (imp<=0) {
      out._insight = {
        title: 'No tributás Ganancias',
        text: `Con un bruto anual de **$${fmt(b)}**, tu base imponible queda por debajo del mínimo no imponible (~$${fmt(mni)}): **no pagás Impuesto a las Ganancias** este período.`,
        tone: 'good',
        icon: '✅'
      };
    } else {
      out._insight = {
        title: 'Cuánto te retienen',
        text: `Sobre **$${fmt(b)}** brutos pagás unos **$${fmt(imp)}** de Ganancias, una alícuota promedio del **${alic.toFixed(1)}%**. Te queda neto aproximado de **$${fmt(neto)}** antes de otros aportes.`,
        tone: alic>=15?'warn':'neutral',
        icon: '🧾'
      };
      out._chart = {
        type: 'doughnut',
        slices: [
          { label: 'Neto estimado', value: Math.round(neto) },
          { label: 'Impuesto', value: Math.round(imp) }
        ],
        prefix: '$',
        centerValue: '$'+fmt(b),
        centerLabel: 'bruto anual',
        ariaLabel: `De $${fmt(b)} brutos, $${fmt(imp)} van a Ganancias y $${fmt(neto)} quedan netos`
      };
    }
  }

  return out;
}
