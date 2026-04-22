/** Aposentadoria INSS — Regra de Transição Pedágio 100% (EC 103/2019).
 * Idade mínima: homem 60 / mulher 57.
 * Tempo de contribuição: homem 35 / mulher 30.
 * Pedágio: tempo que faltava em 13/11/2019 × 2 (100% adicional).
 * Benefício: 100% da média (sem fator previdenciário).
 */

export interface Inputs {
  sexo: 'homem' | 'mulher' | string;
  idade: number;
  anosContribEm2019: number;
  mediaSalarial: number;
}

export interface Outputs {
  idadeRequerida: string;
  tempoMinimo: string;
  faltavaEm2019: string;
  pedagioAdicional: string;
  tempoTotalNecessario: string;
  valorBeneficio: string;
  status: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function aposentadoriaInssPedagio100(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'homem').toLowerCase();
  const idade = Number(i.idade);
  const contrib2019 = Number(i.anosContribEm2019);
  const media = Number(i.mediaSalarial);
  if (!idade || contrib2019 == null || isNaN(contrib2019) || !media) throw new Error('Informe idade, contribuição em 2019 e média salarial.');

  const idadeMin = sexo === 'mulher' ? 57 : 60;
  const tempoMin = sexo === 'mulher' ? 30 : 35;
  const faltava = Math.max(0, tempoMin - contrib2019);
  const pedagio = faltava * 1.0; // 100%
  const totalNecessario = contrib2019 + faltava + pedagio;

  const teto = 8157.41;
  const mediaAplicada = Math.min(media, teto);
  const elegivel = idade >= idadeMin;
  const valor = elegivel ? mediaAplicada : 0; // 100% da média, sem fator

  const status = elegivel
    ? `Elegível — pedágio ${pedagio.toFixed(1)} anos adicionais (tempo total ${totalNecessario.toFixed(1)})`
    : `Faltam ${(idadeMin - idade).toFixed(1)} anos de idade`;

  const formula = `Idade mín ${idadeMin} + tempo contrib ${tempoMin} + pedágio = (${tempoMin}-${contrib2019}) × 2 = ${pedagio.toFixed(1)} anos adicionais`;
  const explicacao = `Regra pedágio 100% (EC 103/2019): exige idade mínima ${idadeMin} anos (${sexo}) e tempo de contribuição de ${tempoMin} anos, MAIS pedágio de 100% sobre o tempo que faltava em 13/11/2019. Benefício: 100% da média dos salários (sem fator previdenciário). Vantajoso para quem tinha muito tempo contribuído. Média aplicada: ${fmtBRL(mediaAplicada)} (teto ${fmtBRL(teto)}).`;

  return {
    idadeRequerida: `${idadeMin} anos`,
    tempoMinimo: `${tempoMin} anos`,
    faltavaEm2019: `${faltava.toFixed(1)} anos`,
    pedagioAdicional: `${pedagio.toFixed(1)} anos (100%)`,
    tempoTotalNecessario: `${totalNecessario.toFixed(1)} anos`,
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
  };
}
