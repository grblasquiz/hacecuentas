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
  _insight?: any;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function auxilioDoencaInss(i: Inputs): Outputs {
  const media = Number(i.mediaSalarial);
  if (!media) throw new Error('Informe a média dos últimos 12 salários de contribuição.');

  const teto = 8157.41;
  const salarioMinimo = 1518;
  const mediaAplicada = Math.min(media, teto);
  const valorBruto = mediaAplicada * 0.91;
  let valor = valorBruto;
  // Limitado: não pode exceder a média dos últimos 12 meses (regra do teto auxílio)
  valor = Math.min(valor, mediaAplicada);
  // Mínimo: salário mínimo
  valor = Math.max(valor, salarioMinimo);

  const formula = `91% × média dos 12 últimos salários = 91% × ${fmtBRL(mediaAplicada)} = ${fmtBRL(valor)}`;
  const explicacao = `Auxílio por incapacidade temporária (ex-auxílio-doença): pago após 15 dias de afastamento (os 15 primeiros dias são pagos pela empresa). Cálculo: 91% da média dos últimos 12 salários de contribuição, nunca ultrapassando essa média nem o teto INSS (${fmtBRL(teto)}). Valor mínimo: salário mínimo (${fmtBRL(salarioMinimo)}). Exige perícia médica do INSS e carência de 12 contribuições (exceto acidente/doença grave).`;

  const tetoAtingido = media > teto;
  const pisoAtingido = valorBruto < salarioMinimo;
  let insightText: string;
  let insightTone: string;
  if (pisoAtingido) {
    insightText = `Os 91% da sua média dariam ${fmtBRL(valorBruto)}, abaixo do piso, então o benefício é elevado ao **salário mínimo: ${fmtBRL(valor)} por mês**. Nenhum benefício do INSS paga menos que isso.`;
    insightTone = 'neutral';
  } else if (tetoAtingido) {
    insightText = `Sua média foi limitada ao **teto do INSS (${fmtBRL(teto)})**, então o benefício fica em **${fmtBRL(valor)} por mês** — o máximo que o auxílio paga, mesmo que você contribua por valores maiores.`;
    insightTone = 'warn';
  } else {
    insightText = `O benefício estimado é de **${fmtBRL(valor)} por mês**, equivalente a **91%** da sua média de contribuições. Lembre que os 15 primeiros dias de afastamento são pagos pela empresa, não pelo INSS.`;
    insightTone = 'good';
  }
  const _insight = {
    title: 'Seu auxílio estimado',
    text: insightText,
    tone: insightTone,
    icon: '🏥',
  };

  return {
    mediaAplicada: fmtBRL(mediaAplicada),
    percentualBeneficio: '91%',
    valorAuxilio: fmtBRL(valor),
    formula,
    explicacao,
    _insight,
  };
}
