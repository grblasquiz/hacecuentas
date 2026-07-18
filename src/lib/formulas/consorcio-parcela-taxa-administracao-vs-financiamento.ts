// Consórcio x financiamento — compara a parcela e o custo total de comprar um bem
// por consórcio (sem juros, mas com taxa de administração) ou por financiamento
// (com juros, sistema Price), dando acesso imediato ao bem.
//
// Consórcio: total = valor do bem × (1 + taxa adm% + fundo reserva%); parcela = total ÷ prazo.
// Financiamento (Price): parcela = PV × i ÷ (1 − (1+i)^−n), com PV = valor − entrada.

export interface Inputs {
  valorBem: number;
  prazoMeses: number;
  taxaAdmTotal?: number;   // % total da taxa de administração do consórcio (padrão 20)
  fundoReserva?: number;   // % total do fundo de reserva (padrão 0)
  jurosMensal?: number;    // % a.m. do financiamento (padrão 1,5)
  entrada?: number;        // entrada no financiamento (padrão 0)
}

export interface Outputs {
  parcelaConsorcio: string;
  totalConsorcio: string;
  parcelaFinanciamento: string;
  totalFinanciamento: string;
  diferencaTotal: string;
  jurosFinanciamento: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorBem) || 0);
  let prazo = Math.floor(Number(i.prazoMeses));
  if (!isFinite(prazo) || prazo <= 0) prazo = 60;
  let taxaAdm = Number(i.taxaAdmTotal);
  if (!isFinite(taxaAdm) || taxaAdm < 0) taxaAdm = 20;
  let fundo = Number(i.fundoReserva);
  if (!isFinite(fundo) || fundo < 0) fundo = 0;
  let juros = Number(i.jurosMensal);
  if (!isFinite(juros) || juros < 0) juros = 1.5;
  const entrada = Math.min(Math.max(0, Number(i.entrada) || 0), valor);

  // Consórcio
  const totalConsorcio = valor * (1 + taxaAdm / 100 + fundo / 100);
  const parcelaConsorcio = totalConsorcio / prazo;

  // Financiamento (Price)
  const pv = valor - entrada;
  const iMes = juros / 100;
  let parcelaFin: number;
  if (iMes === 0) parcelaFin = pv / prazo;
  else parcelaFin = (pv * iMes) / (1 - Math.pow(1 + iMes, -prazo));
  const totalFinanciamento = parcelaFin * prazo + entrada;
  const jurosFin = totalFinanciamento - valor;

  const diferenca = totalFinanciamento - totalConsorcio;
  const consorcioMaisBarato = diferenca > 0;

  const detalhe =
    `Consórcio: ${brl(valor)} × (1 + ${taxaAdm}% adm${fundo > 0 ? ` + ${fundo}% fundo` : ''}) = ${brl(totalConsorcio)} em ${prazo}x de ${brl(parcelaConsorcio)}. ` +
    `Financiamento (${juros}% a.m.${entrada > 0 ? `, entrada ${brl(entrada)}` : ''}): ${prazo}x de ${brl(parcelaFin)} = ${brl(totalFinanciamento)} (juros ${brl(jurosFin)}). ` +
    `Diferença de custo total: ${brl(Math.abs(diferenca))} a favor do ${consorcioMaisBarato ? 'consórcio' : 'financiamento'}.`;

  return {
    parcelaConsorcio: brl(parcelaConsorcio),
    totalConsorcio: brl(totalConsorcio),
    parcelaFinanciamento: brl(parcelaFin),
    totalFinanciamento: brl(totalFinanciamento),
    diferencaTotal: brl(Math.abs(diferenca)),
    jurosFinanciamento: brl(jurosFin),
    detalhe,
    _insight: {
      title: consorcioMaisBarato ? `Consórcio custa ${brl(Math.abs(diferenca))} a menos` : `Financiamento custa ${brl(Math.abs(diferenca))} a menos`,
      text: consorcioMaisBarato
        ? `No total, o **consórcio** sai **${brl(Math.abs(diferenca))} mais barato** (${brl(totalConsorcio)} contra ${brl(totalFinanciamento)}), porque não tem juros — só a taxa de administração de ${taxaAdm}%. O porém: no consórcio você **não pega o bem na hora**, depende de sorteio ou lance para ser contemplado.`
        : `Neste cenário o **financiamento** sai **${brl(Math.abs(diferenca))} mais barato** no total. Mesmo assim, avalie: ele dá **acesso imediato** ao bem, enquanto o consórcio faz esperar a contemplação.`,
      tone: 'warn',
      icon: '🔄',
    },
    _chart: {
      type: 'bar',
      labels: ['Total consórcio', 'Total financiamento'],
      values: [Math.round(totalConsorcio * 100) / 100, Math.round(totalFinanciamento * 100) / 100],
      prefix: 'R$ ',
      ariaLabel: `Total do consórcio ${brl(totalConsorcio)} contra financiamento ${brl(totalFinanciamento)}.`,
    },
  };
}
