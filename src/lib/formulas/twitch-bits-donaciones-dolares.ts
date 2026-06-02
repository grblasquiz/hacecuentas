/** Twitch Bits a Dólares */
export interface Inputs { bits: number; donacionesDirectas: number; subsNetos: number; }
export interface Outputs { totalBruto: string; totalNeto: string; desglose: string; retiroMinimo: string; _chart?: any; _insight?: any; }

export function twitchBitsDonacionesDolares(i: Inputs): Outputs {
  const b = Number(i.bits) || 0;
  const d = Number(i.donacionesDirectas) || 0;
  const s = Number(i.subsNetos) || 0;
  if (b < 0 || d < 0 || s < 0) throw new Error('Valores inválidos');
  const bitsUSD = b * 0.01;
  const donNetas = d * 0.97;
  const bruto = bitsUSD + d + s;
  const neto = bitsUSD + donNetas + s;
  const retiro = neto >= 100 ? 'Sí — superás el mínimo de 100 USD' : `No — te faltan $${(100 - neto).toFixed(2)} USD`;
  const chart = neto > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Bits', value: Number(bitsUSD.toFixed(2)) },
      { label: 'Donaciones netas', value: Number(donNetas.toFixed(2)) },
      { label: 'Subs', value: Number(s.toFixed(2)) },
    ].filter(sl => sl.value > 0),
    prefix: '$',
    centerValue: '$' + neto.toFixed(2),
    centerLabel: 'Neto USD',
    ariaLabel: 'Composición del ingreso neto: bits, donaciones netas y subs',
  } : undefined;
  const comision = bruto - neto;
  const llegaRetiro = neto >= 100;
  const _insight = {
    title: llegaRetiro ? 'Llegás al retiro' : 'Todavía no cobrás',
    text: llegaRetiro
      ? `Te quedan **$${neto.toFixed(2)} USD** netos tras **$${comision.toFixed(2)}** de comisiones, así que **superás el mínimo de $100** para que Twitch te pague.`
      : `Tu neto es **$${neto.toFixed(2)} USD** (después de **$${comision.toFixed(2)}** de comisiones). Te faltan **$${(100 - neto).toFixed(2)}** para alcanzar el **mínimo de $100** y poder cobrar.`,
    tone: (llegaRetiro ? 'good' : 'warn') as 'good' | 'warn',
    icon: '💜',
  };
  return {
    totalBruto: `$${bruto.toFixed(2)} USD`,
    totalNeto: `$${neto.toFixed(2)} USD`,
    desglose: `Bits: $${bitsUSD.toFixed(2)} | Donaciones netas: $${donNetas.toFixed(2)} | Subs: $${s.toFixed(2)}`,
    retiroMinimo: retiro,
    _chart: chart,
    _insight,
  };
}
