// Multa por quebra de contrato de aluguel (rescisão antecipada pelo locatário).
// Lei 8.245/1991 (Lei do Inquilinato), art. 4: se o inquilino devolve o imóvel
// antes do fim do prazo, paga multa proporcional ao tempo que FALTA cumprir.
//   multa proporcional = multa cheia × (meses restantes ÷ prazo total)
// A multa cheia costuma ser 3 aluguéis (definido no contrato).

export interface Inputs {
  valorAluguel: number;
  prazoContratoMeses?: number; // padrão 30 (contratos residenciais típicos)
  mesesCumpridos: number;      // meses já morados
  multaMeses?: number;         // multa contratual em nº de aluguéis (padrão 3)
}

export interface Outputs {
  multaProporcional: string;
  multaCheia: string;
  mesesRestantes: string;
  reducao: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const aluguel = Math.max(0, Number(i.valorAluguel) || 0);
  let prazo = Number(i.prazoContratoMeses);
  if (!isFinite(prazo) || prazo <= 0) prazo = 30;
  let cumpridos = Math.max(0, Number(i.mesesCumpridos) || 0);
  if (cumpridos > prazo) cumpridos = prazo;
  let multaMeses = Number(i.multaMeses);
  if (!isFinite(multaMeses) || multaMeses <= 0) multaMeses = 3;

  const mesesRestantes = Math.max(0, prazo - cumpridos);
  const multaCheia = multaMeses * aluguel;
  const multaProporcional = multaCheia * (mesesRestantes / prazo);
  const reducao = multaCheia - multaProporcional;

  const detalhe =
    `Contrato de ${prazo} meses, ${cumpridos} já cumpridos, faltam ${mesesRestantes}. ` +
    `Multa cheia = ${multaMeses} aluguéis × ${brl(aluguel)} = ${brl(multaCheia)}. ` +
    `Proporcional = ${brl(multaCheia)} × (${mesesRestantes} ÷ ${prazo}) = ${brl(multaProporcional)}. ` +
    `A proporcionalidade reduz ${brl(reducao)} em relação à multa cheia.`;

  const pctCumprido = prazo > 0 ? (cumpridos / prazo) * 100 : 0;

  return {
    multaProporcional: brl(multaProporcional),
    multaCheia: brl(multaCheia),
    mesesRestantes: `${mesesRestantes} meses`,
    reducao: brl(reducao),
    detalhe,
    _insight: {
      title: `Multa proporcional: ${brl(multaProporcional)}`,
      text:
        `Você já cumpriu **${pctCumprido.toFixed(0)}%** do contrato (${cumpridos} de ${prazo} meses), então a multa cai da cheia (${brl(multaCheia)}) para **${brl(multaProporcional)}** — a lei manda cobrar só a parte proporcional ao tempo que **falta**. ` +
        `Se a saída for por transferência de emprego para outra cidade, com aviso de 30 dias, a multa pode ser dispensada (art. 4).`,
      tone: 'warn',
      icon: '🔑',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Multa a pagar', value: Number(multaProporcional.toFixed(2)) },
        { label: 'Reduzido pela proporção', value: Number(reducao.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(multaProporcional),
      centerLabel: 'Multa',
      ariaLabel: `Multa cheia ${brl(multaCheia)}, proporcional ${brl(multaProporcional)}, redução ${brl(reducao)}.`,
    },
  };
}
