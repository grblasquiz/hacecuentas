/** Aposentadoria INSS — Regra de Transição Idade Progressiva (EC 103/2019).
 * 2019: idade mín homem 61 / mulher 56. Aumenta 6 meses/ano até 65h / 62m.
 * Tempo de contribuição: homem 35 / mulher 30.
 */

export interface Inputs {
  sexo: 'homem' | 'mulher' | string;
  idade: number;
  anosContribuicao: number;
  anoSimulacao: number;
  mediaSalarial: number;
}

export interface Outputs {
  idadeMinimaAno: string;
  tempoContribMinimo: string;
  falta: string;
  valorBeneficio: string;
  status: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function aposentadoriaInssIdadeProgressiva(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'homem').toLowerCase();
  const idade = Number(i.idade);
  const contrib = Number(i.anosContribuicao);
  const ano = Number(i.anoSimulacao) || 2026;
  const media = Number(i.mediaSalarial);
  if (!idade || !contrib || !media) throw new Error('Informe idade, contribuição e média salarial.');

  const base2019 = sexo === 'mulher' ? 56 : 61;
  const tetoIdade = sexo === 'mulher' ? 62 : 65;
  const anosDesde2019 = Math.max(0, ano - 2019);
  const incremento = anosDesde2019 * 0.5;
  const idadeMin = Math.min(base2019 + incremento, tetoIdade);
  const tempoMin = sexo === 'mulher' ? 30 : 35;

  const faltaIdade = Math.max(0, idadeMin - idade);
  const faltaContrib = Math.max(0, tempoMin - contrib);

  const teto = 8157.41;
  const mediaAplicada = Math.min(media, teto);
  // 60% + 2% por ano excedente 20h/15m
  const excedente = Math.max(0, contrib - (sexo === 'mulher' ? 15 : 20));
  const percentual = Math.min(100, 60 + excedente * 2);
  const valor = faltaIdade === 0 && faltaContrib === 0 ? mediaAplicada * (percentual / 100) : 0;

  const status =
    faltaIdade === 0 && faltaContrib === 0
      ? 'Requisitos atingidos'
      : `Faltam ${faltaIdade.toFixed(1)} anos de idade e ${faltaContrib} anos de contribuição`;

  const formula = `Idade mín ${ano} = ${base2019} + ${anosDesde2019} × 0,5 = ${idadeMin.toFixed(1)} anos (máx ${tetoIdade})`;
  const explicacao = `Regra de transição por idade progressiva (EC 103/2019): em 2019 a idade mínima era ${base2019} (${sexo}), sobe 6 meses/ano até chegar a ${tetoIdade} anos. Em ${ano}: ${idadeMin.toFixed(1)} anos necessários. Contribuição mínima ${tempoMin} anos. Benefício: ${percentual.toFixed(0)}% da média (${fmtBRL(mediaAplicada)}) = ${fmtBRL(valor)}.`;

  return {
    idadeMinimaAno: `${idadeMin.toFixed(1)} anos (em ${ano})`,
    tempoContribMinimo: `${tempoMin} anos`,
    falta: status,
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
  };
}
