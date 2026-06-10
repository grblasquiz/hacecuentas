import { INSS_TETO } from '../data/brasil-2026';
/** Aposentadoria por Tempo de Contribuição — regra antiga pré-EC 103/2019.
 * Homem: 35 anos contribuição. Mulher: 30 anos. Sem idade mínima (regra extinta p/ novos).
 * Para quem já contribuía antes de 13/nov/2019, há regras de transição (pontos, pedágio, idade progressiva).
 */

export interface Inputs {
  sexo: 'homem' | 'mulher' | string;
  anosContribuicao: number;
  mediaSalarial: number;
}

export interface Outputs {
  tempoRequerido: string;
  faltaContribuicao: string;
  mediaAplicada: string;
  valorBeneficio: string;
  status: string;
  formula: string;
  explicacao: string;
  _insight?: any;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function aposentadoriaInssTempoContrib(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'homem').toLowerCase();
  const anos = Number(i.anosContribuicao);
  const media = Number(i.mediaSalarial);
  if (!anos || !media) throw new Error('Informe anos de contribuição e média salarial.');

  const minimo = sexo === 'mulher' ? 30 : 35;
  const teto = INSS_TETO;
  const falta = Math.max(0, minimo - anos);
  const mediaAplicada = Math.min(media, teto);

  // Regra antiga: 100% da média + fator previdenciário (simplificado)
  const valor = falta === 0 ? mediaAplicada : 0;

  const status =
    falta === 0
      ? 'Atingiu tempo mínimo — elegível (regra antiga extinta, usar transição)'
      : `Faltam ${falta} anos de contribuição`;

  const formula = `${minimo} anos contribuição (${sexo}) — benefício = 100% × média (limitada ao teto)`;
  const explicacao = `Regra antiga extinta em 13/nov/2019 para novos filiados. Para quem já contribuía antes, existem regras de transição (pontos, pedágio 50%, pedágio 100%, idade progressiva). Esta calculadora estima o tempo mínimo necessário pela regra antiga: ${minimo} anos (${sexo}). Benefício: 100% da média dos salários × fator previdenciário. Teto INSS 2026: ${fmtBRL(teto)}.`;

  const _insight =
    falta === 0
      ? {
          title: 'Tempo mínimo atingido',
          text: `Você já soma os **${minimo} anos** exigidos pela regra antiga (${sexo}). Atenção: essa regra foi **extinta em 13/11/2019** para quem não a completou antes — quem entrou depois precisa usar uma regra de transição (pontos, pedágio ou idade progressiva).`,
          tone: 'good',
          icon: '✅',
        }
      : {
          title: `Faltam ${falta} anos de contribuição`,
          text: `Com ${anos} anos você está a **${falta} anos** dos ${minimo} exigidos. Como a regra antiga já não vale para novos casos, vale comparar quanto tempo extra pedem as regras de transição antes de decidir o caminho.`,
          tone: 'warn',
          icon: '⏳',
        };

  return {
    tempoRequerido: `${minimo} anos`,
    faltaContribuicao: `${falta} anos`,
    mediaAplicada: fmtBRL(mediaAplicada),
    valorBeneficio: fmtBRL(valor),
    status,
    formula,
    explicacao,
    _insight,
  };
}
