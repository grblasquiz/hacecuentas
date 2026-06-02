export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vtvCostoProvincia2026(i: Inputs): Outputs {
  const p=String(i.provincia||'caba'); const t=String(i.tipo||'auto');
  const base: Record<string,number> = { caba:55000, pba:48000, cba:42000, sfe:45000 };
  const mult: Record<string,number> = { auto:1, moto:0.5, pickup:1.3, camion:2.0 };
  const c=(base[p]||50000)*(mult[t]||1);
  const cFmt = c.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return { costo:'$'+cFmt, vigencia:'1-2 años según edad', resumen:`VTV ${t} ${p.toUpperCase()}: ~$${c.toFixed(0)}.`,
    _insight: {
      title: 'Lo que vas a pagar',
      text: `La VTV de tu **${t}** en **${p.toUpperCase()}** ronda los **$${cFmt}** (tarifa orientativa 2026). El monto se actualiza seguido, así que confirmá el valor vigente en la planta antes de ir.`,
      tone: 'warn',
      icon: '🚗',
    },
  };
}
