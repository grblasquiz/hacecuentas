/** Auxílio-Doença (Benefício por Incapacidade Temporária) INSS.
 * 91% do salário de benefício (média dos 12 últimos salários contribuição ou teto da média).
 * Teto: média dos últimos 12 salários, limitada ao teto INSS.
 */

export interface Inputs {
  mediaSalarial: number; // média dos últimos 12 salários de contribuição
}

export interface Outputs {
  mediaAplicada: string;
  percentualBeneficio: string;
  valorAuxilio: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function auxilioDoencaInss(i: Inputs): Outputs {
  const media = Number(i.mediaSalarial);
  if (!media) throw new Error('Informe a média dos últimos 12 salários de contribuição.');

  const teto = 8157.41;
  const salarioMinimo = 1518;
  const mediaAplicada = Math.min(media, teto);
  let valor = mediaAplicada * 0.91;
  // Limitado: não pode exceder a média dos últimos 12 meses (regra do teto auxílio)
  valor = Math.min(valor, mediaAplicada);
  // Mínimo: salário mínimo
  valor = Math.max(valor, salarioMinimo);

  const formula = `91% × média dos 12 últimos salários = 91% × ${fmtBRL(mediaAplicada)} = ${fmtBRL(valor)}`;
  const explicacao = `Auxílio por incapacidade temporária (ex-auxílio-doença): pago após 15 dias de afastamento (os 15 primeiros dias são pagos pela empresa). Cálculo: 91% da média dos últimos 12 salários de contribuição, nunca ultrapassando essa média nem o teto INSS (${fmtBRL(teto)}). Valor mínimo: salário mínimo (${fmtBRL(salarioMinimo)}). Exige perícia médica do INSS e carência de 12 contribuições (exceto acidente/doença grave).`;

  return {
    mediaAplicada: fmtBRL(mediaAplicada),
    percentualBeneficio: '91%',
    valorAuxilio: fmtBRL(valor),
    formula,
    explicacao,
  };
}
