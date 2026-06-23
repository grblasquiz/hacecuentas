/**
 * Mais-valias imobiliárias (residente em Portugal, Cat. G do IRS) — venda de imóvel.
 * Mais-valia = valor de realização − (valor de aquisição × coef. desvalorização) − despesas/obras.
 * Residentes: só 50 % da mais-valia é tributada, por englobamento à taxa marginal do IRS.
 * Não hardcoda cifras: tudo sai de portugal-2026.ts.
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  irsAnual,
} from '../data/portugal-2026.ts';

export interface Inputs {
  valorVenda: number;
  valorCompra: number;
  despesas?: number;   // despesas de compra/venda + obras (valorização)
  anoCompra?: number;
  outroRendimento?: number; // rendimento coletável anual já existente (para a taxa marginal)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function calculadoraMaisValiasVendaImovelPortugal(i: Inputs): Outputs {
  const valorVenda = Math.max(0, Number(i.valorVenda) || 0);
  const valorCompra = Math.max(0, Number(i.valorCompra) || 0);
  const despesas = Math.max(0, Number(i.despesas) || 0);
  const anoCompra = Math.max(1900, Number(i.anoCompra) || PORTUGAL_2026.anio);
  const outroRendimento = Math.max(0, Number(i.outroRendimento) || 0);

  if (valorVenda <= 0) throw new Error('Indique o valor de venda do imóvel');
  if (valorCompra <= 0) throw new Error('Indique o valor de aquisição (compra) do imóvel');

  const mv = PORTUGAL_2026.maisValiasImobiliarias;

  // Aquisições anteriores a 1989 estão isentas de mais-valias.
  const isentoPorAntiguidade = anoCompra < 1989;

  // Mais-valia bruta (sem coeficiente de desvalorização monetária, que depende
  // de portaria anual e só se aplica a aquisições com 24+ meses; aqui ficamos
  // pelo cálculo direto, conservador para o contribuinte).
  const maisValia = Math.max(0, valorVenda - valorCompra - despesas);

  // Residentes: só 50 % da mais-valia entra no englobamento (art. 43.º CIRS).
  const baseTributavel = isentoPorAntiguidade ? 0 : maisValia * mv.percTributavelResidente;

  // IRS por englobamento: a base soma-se ao restante rendimento coletável e
  // tributa-se à taxa marginal. Estimamos o IRS incremental (com − sem a mais-valia).
  const irsSem = irsAnual(outroRendimento);
  const irsCom = irsAnual(outroRendimento + baseTributavel);
  const irsEnglobamento = Math.max(0, irsCom - irsSem);

  // Alternativa: taxa autónoma de 28 % sobre 50 % da mais-valia (sem englobamento).
  const irsAutonoma = baseTributavel * mv.taxaAutonomaOpcional;

  const irsEstimado = Math.min(irsEnglobamento, irsAutonoma);
  const liquido = valorVenda - valorCompra - despesas - irsEstimado;

  const taxaEfetivaPct = maisValia > 0 ? (irsEstimado / maisValia) * 100 : 0;
  const taxaEfetivaStr = taxaEfetivaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 });

  const _insight = {
    title: isentoPorAntiguidade ? 'Isento por aquisição anterior a 1989' : 'Só metade da mais-valia é tributada',
    text: isentoPorAntiguidade
      ? `Como adquiriu o imóvel em **${anoCompra}** (antes de 1989), a mais-valia de **${fmtEUR(maisValia)}** está **isenta de IRS**. Reinvestir não é sequer necessário.`
      : `A mais-valia é **${fmtEUR(maisValia)}**, mas como residente só **50 %** (${fmtEUR(baseTributavel)}) entra no IRS por englobamento à sua taxa marginal. ` +
        `O IRS estimado é **${fmtEUR(irsEstimado)}** (taxa efetiva ~${taxaEfetivaStr}% sobre a mais-valia total). ` +
        `Se reinvestir o produto da venda na sua **habitação própria e permanente** (24 meses antes ou 36 meses depois), pode ficar **isento**.`,
    tone: isentoPorAntiguidade ? 'good' : (irsEstimado > 0 ? 'warn' : 'good'),
    icon: '🏠',
  };

  const _table = {
    title: 'Como se chega ao IRS da mais-valia',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Valor de venda (realização)', fmtEUR(valorVenda)],
      ['(−) Valor de aquisição', fmtEUR(-valorCompra)],
      ['(−) Despesas e obras (valorização)', fmtEUR(-despesas)],
      ['Mais-valia bruta', fmtEUR(maisValia)],
      ['Base tributável (50 % — residente)', fmtEUR(baseTributavel)],
      ['IRS estimado (englobamento / 28 % autónoma)', fmtEUR(irsEstimado)],
      ['Encaixe líquido após IRS', fmtEUR(liquido)],
    ],
    note: 'Englobamento: 50 % da mais-valia soma-se ao restante rendimento e tributa pela taxa marginal (12,5 %–48 %). Reinvestimento na HPP isenta total ou parcialmente.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital investido', value: Math.round(valorCompra + despesas) },
      { label: 'Mais-valia líquida', value: Math.round(maisValia - irsEstimado) },
      { label: 'IRS', value: Math.round(irsEstimado) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(valorVenda),
    centerLabel: 'Valor de venda',
    ariaLabel: `Venda ${fmtEUR(valorVenda)}: capital ${fmtEUR(valorCompra + despesas)}, mais-valia líquida ${fmtEUR(maisValia - irsEstimado)}, IRS ${fmtEUR(irsEstimado)}.`,
  };

  return {
    maisValia: fmtEUR(maisValia),
    baseTributavel: `${fmtEUR(baseTributavel)} (50 %)`,
    irsEstimado: fmtEUR(irsEstimado),
    taxaEfetiva: `${taxaEfetivaStr}%`,
    liquido: fmtEUR(liquido),
    detalhe: isentoPorAntiguidade
      ? `Aquisição em ${anoCompra}: mais-valia isenta de IRS.`
      : `Mais-valia ${fmtEUR(maisValia)} → 50 % tributável (${fmtEUR(baseTributavel)}) → IRS ${fmtEUR(irsEstimado)}. Encaixe líquido ${fmtEUR(liquido)}.`,
    _insight,
    _table,
    _chart,
  };
}
