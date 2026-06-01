/** Aposentadoria INSS — Regra de Transição por Pontos (EC 103/2019).
 * 2019: homem 96 / mulher 86 pontos. +1 ponto por ano até 2028: homem 105 / mulher 100.
 * Contribuição mínima: homem 35 / mulher 30.
 * Pontos = idade + tempo de contribuição.
 */

export interface Inputs {
  sexo: 'homem' | 'mulher' | string;
  idade: number;
  anosContribuicao: number;
  anoSimulacao: number;
  mediaSalarial: number;
}

export interface Outputs {
  pontosAtuais: string;
  pontosNecessarios: string;
  contribuicaoMinima: string;
  falta: string;
  valorBeneficio: string;
  status: string;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function aposentadoriaInssPontos(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'homem').toLowerCase();
  const idade = Number(i.idade);
  const contrib = Number(i.anosContribuicao);
  const ano = Number(i.anoSimulacao) || 2026;
  const media = Number(i.mediaSalarial);
  if (!idade || !contrib || !media) throw new Error('Informe idade, contribuição e média salarial.');

  const base2019 = sexo === 'mulher' ? 86 : 96;
  const maxTeto = sexo === 'mulher' ? 100 : 105;
  const anosDesde2019 = Math.max(0, ano - 2019);
  const pontosNecessarios = Math.min(base2019 + anosDesde2019, maxTeto);
  const contribMin = sexo === 'mulher' ? 30 : 35;

  const pontosAtuais = idade + contrib;
  const faltaPontos = Math.max(0, pontosNecessarios - pontosAtuais);
  const faltaContrib = Math.max(0, contribMin - contrib);

  const teto = 8157.41;
  const mediaAplicada = Math.min(media, teto);
  // 60% + 2% por ano que exceder 20h/15m
  const excedente = Math.max(0, contrib - (sexo === 'mulher' ? 15 : 20));
  const percentual = Math.min(100, 60 + excedente * 2);
  const valor = faltaPontos === 0 && faltaContrib === 0 ? mediaAplicada * (percentual / 100) : 0;

  const status =
    faltaPontos === 0 && faltaContrib === 0
      ? 'Requisitos atingidos'
      : `Faltam ${faltaPontos} pontos e ${faltaContrib} anos de contribuição`;

  const formula = `Pontos = idade + tempo contrib. = ${idade} + ${contrib} = ${pontosAtuais} (mín ${pontosNecessarios})`;
  const explicacao = `Regra de transição por pontos (EC 103/2019): em 2019 exigia ${base2019} pontos (${sexo}), aumentando 1 ponto/ano até ${maxTeto} em ${sexo === 'mulher' ? 2033 : 2028}. Em ${ano}: ${pontosNecessarios} pontos necessários. Pontos atuais: ${pontosAtuais}. Contribuição mínima: ${contribMin} anos. Benefício: ${percentual.toFixed(0)}% da média (${fmtBRL(mediaAplicada)}) = ${fmtBRL(valor)}.`;

  const elegivel = faltaPontos === 0 && faltaContrib === 0;
  const _insight = elegivel
    ? {
        title: 'Requisitos de pontos atingidos',
        text: `Você soma **${pontosAtuais} pontos** (mín. ${pontosNecessarios}) e o benefício fica em **${percentual.toFixed(0)}% da média** = ${fmtBRL(valor)}. Cada ano a mais de contribuição soma 2% até o teto de 100%.`,
        tone: 'good',
        icon: '✅',
      }
    : {
        title: 'Ainda faltam pontos',
        text: `Com **${pontosAtuais} pontos** você está a **${faltaPontos}** dos ${pontosNecessarios} exigidos em ${ano}${faltaContrib > 0 ? ` e a ${faltaContrib} anos do mínimo de contribuição` : ''}. Como idade e contribuição somam pontos juntas, cada ano trabalhado aproxima o objetivo em 2 pontos.`,
        tone: 'warn',
        icon: '⏳',
      };

  const _chart = {
    type: 'scale',
    marker: Number(percentual.toFixed(0)),
    markerLabel: `${percentual.toFixed(0)}% da média`,
    min: 60,
    segments: [
      { nombre: 'Piso (60%)', max: 70, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Parcial', max: 85, color: '#fcd34d', colorDark: '#a16207' },
      { nombre: 'Quase integral', max: 99, color: '#86efac', colorDark: '#15803d' },
      { nombre: 'Integral (100%)', max: 101, color: '#22c55e', colorDark: '#166534' },
    ],
    ariaLabel: `Percentual do benefício sobre a média: ${percentual.toFixed(0)}% de um máximo de 100%`,
  };

  return {
    pontosAtuais: `${pontosAtuais} pontos`,
    pontosNecessarios: `${pontosNecessarios} pontos`,
    contribuicaoMinima: `${contribMin} anos`,
    falta: status,
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
