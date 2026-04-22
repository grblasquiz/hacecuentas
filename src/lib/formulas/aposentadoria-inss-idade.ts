/** Aposentadoria INSS por idade (regra permanente pós-EC 103/2019).
 * Homem: 65 anos + 20 anos contribuição. Mulher: 62 anos + 15 anos contribuição.
 * Benefício = 60% da média + 2% por ano de contribuição que exceder 20 (H) ou 15 (M).
 */

export interface Inputs {
  sexo: 'homem' | 'mulher' | string;
  idade: number;
  anosContribuicao: number;
  mediaSalarial: number;
}

export interface Outputs {
  idadeRequerida: string;
  contribuicaoRequerida: string;
  falta: string;
  percentualBeneficio: string;
  valorBeneficio: string;
  status: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function aposentadoriaInssIdade(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'homem').toLowerCase();
  const idade = Number(i.idade);
  const anosContrib = Number(i.anosContribuicao);
  const media = Number(i.mediaSalarial);
  if (!idade || !anosContrib || !media) throw new Error('Informe idade, anos de contribuição e média salarial.');

  const idadeMin = sexo === 'mulher' ? 62 : 65;
  const contribMin = sexo === 'mulher' ? 15 : 20;
  const teto = 8157.41;

  const faltaIdade = Math.max(0, idadeMin - idade);
  const faltaContrib = Math.max(0, contribMin - anosContrib);

  // 60% base + 2% por ano excedente ao mínimo (só se atingir o mínimo)
  let percentual = 0;
  if (anosContrib >= contribMin) {
    const excedente = Math.max(0, anosContrib - contribMin);
    percentual = Math.min(100, 60 + excedente * 2);
  }
  const baseMedia = Math.min(media, teto);
  const valor = baseMedia * (percentual / 100);

  const status =
    faltaIdade === 0 && faltaContrib === 0
      ? 'Requisitos atingidos — pode aposentar'
      : `Faltam: ${faltaIdade} anos de idade e ${faltaContrib} anos de contribuição`;

  const formula = `${idadeMin} anos + ${contribMin} anos contrib. → 60% + 2%×(${anosContrib}−${contribMin}) = ${percentual.toFixed(0)}% × ${fmtBRL(baseMedia)}`;
  const explicacao = `Regra permanente pós-EC 103/2019: ${sexo === 'mulher' ? 'mulher 62+15' : 'homem 65+20'}. Com ${anosContrib} anos de contribuição, percentual aplicado: ${percentual.toFixed(0)}%. Benefício estimado: ${fmtBRL(valor)} (teto INSS 2026: ${fmtBRL(teto)}).`;

  return {
    idadeRequerida: `${idadeMin} anos`,
    contribuicaoRequerida: `${contribMin} anos`,
    falta: status,
    percentualBeneficio: percentual.toFixed(0) + '%',
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
  };
}
