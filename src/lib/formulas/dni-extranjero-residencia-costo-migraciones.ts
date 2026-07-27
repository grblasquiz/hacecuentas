export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function dniExtranjeroResidenciaCostoMigraciones(i: Inputs): Outputs {
  const t=String(i.tipo||'temp-merc');
  const m: Record<string,[number,number]> = { 'temp-merc':[35000,20000], 'temp-no':[90000,20000], perm:[50000,20000] };
  const labels: Record<string,string> = { 'temp-merc':'Residencia temporaria Mercosur', 'temp-no':'Residencia temporaria no Mercosur', perm:'Residencia permanente' };
  const [mig,dni]=m[t]||m['temp-merc'];
  const total=mig+dni;
  const fmt=(n:number)=>'$'+n.toLocaleString('es-AR');
  const label=labels[t]||labels['temp-merc'];
  return {
    migraciones:fmt(mig), dni:fmt(dni), total:fmt(total),
    resumen:`${t}: Migraciones $${mig.toLocaleString('es-AR')} + DNI $${dni.toLocaleString('es-AR')} = $${total.toLocaleString('es-AR')}.`,
    _insight: {
      title: 'Costo de la radicación',
      text: `Tramitar la **${label}** sale **${fmt(total)}**: la tasa de Migraciones (**${fmt(mig)}**) es el grueso y el DNI agrega **${fmt(dni)}**.`,
      tone: 'neutral',
      icon: '🛂',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Tasa Migraciones', value: mig },
        { label: 'DNI', value: dni },
      ],
      prefix: '$',
      centerValue: fmt(total),
      centerLabel: 'Costo total',
      ariaLabel: `Composición del costo total ${fmt(total)}: tasa de Migraciones ${fmt(mig)} y DNI ${fmt(dni)}`,
    },
  };
}
