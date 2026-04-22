/**
 * Remessa pessoa física ao exterior — IOF câmbio 1,1% em 2026.
 * Redução gradual prevista: 1,1% (2026) → 0,88% (2027) → 0% (2028) conforme Decreto 10.997/2022.
 */

export interface Inputs {
  valorBrl: number | string;         // valor em reais a enviar
  cotacaoDolar: number | string;     // R$/USD
  spreadCasa?: number | string;      // % da casa de câmbio (default 2)
  anoRemessa?: number | string;      // 2026|2027|2028
}

export interface Outputs {
  iofPctAplicada: string;
  iofValor: string;
  spreadCasa: string;
  cotacaoEfetiva: string;
  valorUsdRecebido: string;
  custoTotalBrl: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function iofPorAno(ano: number): number {
  if (ano >= 2028) return 0.0;
  if (ano === 2027) return 0.88;
  return 1.1;
}

export function dolarRealIofRemessa(i: Inputs): Outputs {
  const brlInput = Number(i.valorBrl) || 0;
  const cot = Number(i.cotacaoDolar) || 0;
  const spread = Number(i.spreadCasa ?? 2) || 0;
  const ano = Number(i.anoRemessa ?? 2026) || 2026;

  if (brlInput <= 0) throw new Error('Informe o valor em reais a remeter.');
  if (cot <= 0) throw new Error('Informe a cotação do dólar.');

  const iofPct = iofPorAno(ano);
  const spreadValor = brlInput * (spread / 100);
  const iofValor = brlInput * (iofPct / 100);
  const brlDisponivel = brlInput - spreadValor - iofValor;
  const usdRecebido = brlDisponivel / cot;
  const cotEfet = brlInput / usdRecebido;

  return {
    iofPctAplicada: iofPct.toFixed(2) + '% (IOF câmbio ' + ano + ')',
    iofValor: brl(iofValor),
    spreadCasa: brl(spreadValor),
    cotacaoEfetiva: brl(cotEfet) + '/USD',
    valorUsdRecebido: 'US$ ' + usdRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    custoTotalBrl: brl(spreadValor + iofValor),
    resumen: `Remessa de ${brl(brlInput)} em ${ano}: IOF ${iofPct}% + spread ${spread}% = você recebe US$ ${usdRecebido.toFixed(2)} (cotação efetiva ${brl(cotEfet)}/USD).`,
  };
}
