export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function divorcioExpressCostoArgentinaHonorarios(i: Inputs): Outputs {
  const c=String(i.comun||'si')==='si'; const h=String(i.hijosMenores||'no')==='si';
  const base=c?500000:2500000;
  const extra=h?200000:0;
  const total=base+extra;
  const tiempo=c?'3-6 meses':'1-3 años';
  const fmt=(n:number)=>'$'+n.toLocaleString('es-AR');
  const out: Outputs = { costo:'$'+base.toLocaleString('es-AR')+(h?' + '+extra.toLocaleString('es-AR')+' hijos':''), tiempo, resumen:`Divorcio ${c?'común acuerdo':'contencioso'}${h?' con hijos':''}: ~$${total.toLocaleString('es-AR')}, ${tiempo}.` };
  out._insight = {
    title: c ? 'Divorcio express por acuerdo' : 'Divorcio contencioso',
    text: c
      ? `Por mutuo acuerdo el trámite ronda **${fmt(total)}**${h ? ' (incluye el adicional por hijos menores)' : ''} y se resuelve en **${tiempo}**: la vía más rápida y barata en Argentina.`
      : `Sin acuerdo, los honorarios trepan a **${fmt(total)}**${h ? ' con hijos menores' : ''} y el proceso puede durar **${tiempo}**. Llegar a un acuerdo antes de demandar baja mucho el costo y el tiempo.`,
    tone: c ? 'good' : 'warn',
    icon: '💔',
  };
  if (h) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: c ? 'Honorarios (acuerdo)' : 'Honorarios (contencioso)', value: base },
        { label: 'Adicional por hijos', value: extra },
      ],
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'Costo total',
      ariaLabel: `Composición del costo ${fmt(total)}: base ${fmt(base)} más adicional por hijos ${fmt(extra)}`,
    };
  }
  return out;
}
