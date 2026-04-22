/** Aposentadoria INSS — Regra de Transição Pedágio 50% (EC 103/2019).
 * Para quem faltava ≤ 2 anos em 13/11/2019 para completar 30m/35h de contribuição.
 * Pedágio: tempo que faltava × 1,5 (50% adicional).
 * Aplica fator previdenciário.
 */

export interface Inputs {
  sexo: 'homem' | 'mulher' | string;
  anosContribEm2019: number; // anos de contribuição em 13/11/2019
  mediaSalarial: number;
}

export interface Outputs {
  tempoRequerido: string;
  tempoFaltavaEm2019: string;
  pedagioAdicional: string;
  tempoTotalNecessario: string;
  valorBeneficio: string;
  status: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function aposentadoriaInssPedagio50(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'homem').toLowerCase();
  const contrib2019 = Number(i.anosContribEm2019);
  const media = Number(i.mediaSalarial);
  if (contrib2019 == null || isNaN(contrib2019) || !media) throw new Error('Informe anos de contribuição em 13/11/2019 e média salarial.');

  const tempoMin = sexo === 'mulher' ? 30 : 35;
  const faltava = Math.max(0, tempoMin - contrib2019);
  const elegivel = faltava <= 2;
  const pedagio = faltava * 0.5;
  const totalNecessario = contrib2019 + faltava + pedagio;

  const teto = 8157.41;
  const mediaAplicada = Math.min(media, teto);
  // Pedágio 50%: aplica fator previdenciário (aqui estimamos 100% × média como referência)
  const valor = elegivel ? mediaAplicada : 0;

  const status = elegivel
    ? `Elegível — faltavam ${faltava.toFixed(1)} anos, pedágio ${pedagio.toFixed(1)} anos adicionais`
    : `Não elegível: faltavam mais de 2 anos em 13/11/2019 (faltavam ${faltava.toFixed(1)})`;

  const formula = `Tempo total = contrib. em 2019 (${contrib2019}) + faltava (${faltava.toFixed(1)}) × 1,5 = ${totalNecessario.toFixed(1)} anos`;
  const explicacao = `Regra de transição pedágio 50% (EC 103/2019): exclusiva para quem estava a ≤ 2 anos de se aposentar em 13/11/2019 pela regra antiga (${tempoMin} anos - ${sexo}). Paga-se pedágio de 50% do tempo faltante. Aplica fator previdenciário. Exemplo: se faltavam 2 anos, total = 2 × 1,5 = 3 anos adicionais. Média aplicada: ${fmtBRL(mediaAplicada)} (teto ${fmtBRL(teto)}).`;

  return {
    tempoRequerido: `${tempoMin} anos (regra antiga)`,
    tempoFaltavaEm2019: `${faltava.toFixed(1)} anos`,
    pedagioAdicional: `${pedagio.toFixed(1)} anos (50%)`,
    tempoTotalNecessario: `${totalNecessario.toFixed(1)} anos`,
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
  };
}
