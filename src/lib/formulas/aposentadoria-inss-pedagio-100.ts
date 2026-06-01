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
  _insight?: any;
  _chart?: any;
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

  const _insight = elegivel
    ? {
        title: 'Elegível pela regra pedágio 100%',
        text: `Você cumpre a idade mínima de **${idadeMin} anos** e recebe **100% da média** (${fmtBRL(valor)}) sem fator previdenciário. Esta regra é vantajosa para quem tinha bastante tempo contribuído em 2019.`,
        tone: 'good',
        icon: '✅',
      }
    : {
        title: 'Ainda não elegível',
        text: `Faltam **${(idadeMin - idade).toFixed(1)} anos** para atingir a idade mínima de ${idadeMin}. O pedágio exige ainda **${pedagio.toFixed(1)} anos** adicionais (100% do que faltava em 2019), totalizando ${totalNecessario.toFixed(1)} anos de contribuição.`,
        tone: 'warn',
        icon: '⏳',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Contribuído até 2019', value: Number(contrib2019.toFixed(1)) },
      { label: 'Tempo que faltava', value: Number(faltava.toFixed(1)) },
      { label: 'Pedágio (100%)', value: Number(pedagio.toFixed(1)) },
    ],
    suffix: ' anos',
    centerValue: `${totalNecessario.toFixed(1)}`,
    centerLabel: 'anos no total',
    ariaLabel: `Composição do tempo total de contribuição: ${contrib2019.toFixed(1)} anos até 2019, ${faltava.toFixed(1)} anos que faltavam e ${pedagio.toFixed(1)} anos de pedágio`,
  };

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
    _insight,
    _chart,
  };
}
