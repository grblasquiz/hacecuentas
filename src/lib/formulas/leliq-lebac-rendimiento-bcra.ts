export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function leliqLebacRendimientoBcra(i: Inputs): Outputs {
  const c=Number(i.capital)||0; const t=Number(i.tnaPorcentaje)||0; const d=Number(i.dias)||0;
  const r=c*t/100*d/365; const m=c+r; const tea=((1+t/100*d/365)**(365/d)-1)*100;
  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  const pctGanancia = c > 0 ? (r / c) * 100 : 0;
  const _insight = {
    title: 'Rendimiento del plazo',
    text: `A una **TNA del ${t}%** durante **${d} días**, tu capital de **${fmt(c)}** genera **${fmt(r)}** de interés (un **${pctGanancia.toFixed(2)}%** sobre el período). La tasa efectiva anual equivale al **${tea.toFixed(2)}% TEA**.`,
    tone: 'neutral' as const,
    icon: '🏦',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital inicial', value: Math.round(c) },
      { label: 'Interés ganado', value: Math.round(r) },
    ],
    prefix: '$',
    centerValue: fmt(m),
    centerLabel: 'Monto final',
    ariaLabel: `El monto final de ${fmt(m)} se compone de ${fmt(c)} de capital inicial más ${fmt(r)} de interés ganado.`,
  };
  return { rendimiento:fmt(r), monto:fmt(m), tea:`${tea.toFixed(2)}%`, _insight, _chart };
}
