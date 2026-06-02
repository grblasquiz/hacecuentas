/** TikTok Diamonds a Dólares */
export interface Inputs { diamantes: number; comision: number; }
export interface Outputs { bruto: string; neto: string; retiroMinimo: string; equivalenteRegalos: string; _insight?: any; _chart?: any; }

export function tiktokLiveDiamondsDolares(i: Inputs): Outputs {
  const d = Number(i.diamantes);
  const com = Number(i.comision);
  if (d < 0) throw new Error('Ingresá una cantidad válida');
  if (com < 0 || com > 100) throw new Error('Comisión inválida');
  const VALOR = 0.005;
  const bruto = d * VALOR;
  const neto = bruto * (1 - com / 100);
  const retiro = neto >= 100 ? 'Sí — superás el mínimo de 100 USD' : `No — te faltan $${(100 - neto).toFixed(2)} USD`;
  const galaxias = Math.floor(d / 500);
  const leones = (d / 15000).toFixed(2);
  const comisionUsd = bruto - neto;
  const chart = bruto > 0 && comisionUsd > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto para vos', value: Number(neto.toFixed(2)) },
      { label: 'Comisión TikTok/Apple', value: Number(comisionUsd.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + bruto.toFixed(2),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del valor bruto de los diamantes: parte neta para el creador y comisión retenida.',
  } : undefined;
  const puedeRetirar = neto >= 100;
  const pctComision = bruto > 0 ? (comisionUsd / bruto) * 100 : 0;
  const _insight = {
    title: puedeRetirar ? 'Listo para retirar' : 'Todavía no podés retirar',
    text: puedeRetirar
      ? `Tus ${d.toLocaleString('es-AR')} diamantes valen **$${neto.toFixed(2)} USD** netos (TikTok/Apple se queda con ~${pctComision.toFixed(0)}%, $${comisionUsd.toFixed(2)}). Superás el mínimo de 100 USD: **podés cobrar**.`
      : `Tus ${d.toLocaleString('es-AR')} diamantes dejan **$${neto.toFixed(2)} USD** netos tras la comisión (~${pctComision.toFixed(0)}%, $${comisionUsd.toFixed(2)}). Te faltan **$${(100 - neto).toFixed(2)} USD** para llegar al mínimo de retiro de 100 USD.`,
    tone: (puedeRetirar ? 'good' : 'warn') as 'good' | 'warn',
    icon: '💎',
  };
  return {
    bruto: `$${bruto.toFixed(2)} USD`,
    neto: `$${neto.toFixed(2)} USD`,
    retiroMinimo: retiro,
    equivalenteRegalos: `${galaxias} galaxias o ${leones} leones`,
    _insight,
    _chart: chart,
  };
}
