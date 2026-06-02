export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function stakingEthereumRendimientoApy(i: Inputs): Outputs {
  const e=Number(i.ethStaked)||0; const a=Number(i.apyPorcentaje)||0; const p=Number(i.precioEth)||0;
  const ganado=e*a/100; const usd=ganado*p; const mens=usd/12;
  const capitalUsd = e * p;
  const finalUsd = capitalUsd + usd;
  const out: Outputs = {
    ethGanado:`${ganado.toFixed(4)} ETH`,
    valorUsd:`USD ${Math.round(usd).toLocaleString('en-US')}`,
    rendimientoMensual:`USD ${Math.round(mens).toLocaleString('en-US')}`,
    _insight: {
      title: 'Rendimiento anual estimado',
      text: `Stakeando ${e} ETH a ${a}% APY ganás **${ganado.toFixed(4)} ETH** por año${p > 0 ? ` (~USD ${Math.round(usd).toLocaleString('en-US')}, unos USD ${Math.round(mens).toLocaleString('en-US')}/mes)` : ''}. Es una proyección simple a 12 meses: el rendimiento en ETH es fijo, pero su valor en dólares depende del precio.`,
      tone: 'good',
      icon: 'Ξ',
    },
  };
  if (p > 0 && e > 0) {
    out._chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Capital inicial', value: Number(capitalUsd.toFixed(2)) },
        { label: 'Recompensas (1 año)', value: Number(usd.toFixed(2)) },
      ],
      prefix: '$',
      centerValue: 'USD ' + Math.round(finalUsd).toLocaleString('en-US'),
      centerLabel: 'Valor a 1 año',
      ariaLabel: 'Composición del valor a un año: capital inicial más recompensas de staking de ETH',
    };
  }
  return out;
}
