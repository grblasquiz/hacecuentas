/** Twitch Bits a Dólares */
export interface Inputs { bits: number; donacionesDirectas: number; subsNetos: number; }
export interface Outputs { totalBruto: string; totalNeto: string; desglose: string; retiroMinimo: string; _chart?: any; }

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
  return {
    totalBruto: `$${bruto.toFixed(2)} USD`,
    totalNeto: `$${neto.toFixed(2)} USD`,
    desglose: `Bits: $${bitsUSD.toFixed(2)} | Donaciones netas: $${donNetas.toFixed(2)} | Subs: $${s.toFixed(2)}`,
    retiroMinimo: retiro,
    _chart: chart,
  };
}
