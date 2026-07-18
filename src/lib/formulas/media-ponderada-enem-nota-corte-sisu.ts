// Média ponderada do ENEM para o SiSU e comparação com a nota de corte.
// O ENEM tem 5 notas de 0 a 1000: Linguagens (LC), Ciências Humanas (CH),
// Ciências da Natureza (CN), Matemática (MT) e Redação. O SiSU calcula uma
// MÉDIA PONDERADA aplicando pesos que variam por curso/universidade
// (ex.: Medicina costuma pesar mais CN; Direito, Linguagens e Redação).
//   média ponderada = Σ(nota × peso) ÷ Σ(peso)
// Com pesos iguais (1), o resultado é a média simples (aritmética).
// A NOTA DE CORTE é a menor média ponderada entre os aprovados na última
// atualização do SiSU — o candidato é comparado a ela.

export interface Inputs {
  notaLinguagens: number;
  notaHumanas: number;
  notaNatureza: number;
  notaMatematica: number;
  notaRedacao: number;
  pesoLinguagens?: number;
  pesoHumanas?: number;
  pesoNatureza?: number;
  pesoMatematica?: number;
  pesoRedacao?: number;
  notaCorte?: number; // opcional: nota de corte do curso para comparar
}

export interface Outputs {
  mediaPonderada: string;
  mediaSimples: string;
  situacao: string;
  margem: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function clampNota(v: any): number {
  const n = Number(v);
  if (!isFinite(n)) return 0;
  return Math.min(1000, Math.max(0, n));
}
function peso(v: any): number {
  const n = Number(v);
  if (!isFinite(n) || n < 0) return 1;
  return n;
}

export function compute(i: Inputs): Outputs {
  const notas = [
    clampNota(i.notaLinguagens),
    clampNota(i.notaHumanas),
    clampNota(i.notaNatureza),
    clampNota(i.notaMatematica),
    clampNota(i.notaRedacao),
  ];
  const nomes = ['Linguagens', 'Humanas', 'Natureza', 'Matemática', 'Redação'];
  const pesos = [
    peso(i.pesoLinguagens),
    peso(i.pesoHumanas),
    peso(i.pesoNatureza),
    peso(i.pesoMatematica),
    peso(i.pesoRedacao),
  ];

  const somaPesos = pesos.reduce((a, b) => a + b, 0) || 1;
  const somaPonderada = notas.reduce((acc, n, idx) => acc + n * pesos[idx], 0);
  const mediaPonderada = somaPonderada / somaPesos;
  const mediaSimples = notas.reduce((a, b) => a + b, 0) / 5;

  const corte = Number(i.notaCorte);
  const temCorte = isFinite(corte) && corte > 0;

  let situacao: string;
  let margem = '—';
  let tone = 'good';
  if (temCorte) {
    const diff = mediaPonderada - corte;
    if (diff >= 0) {
      situacao = `Acima da nota de corte (${fmt(corte)})`;
      margem = `+${fmt(diff)} pontos acima do corte`;
      tone = 'good';
    } else {
      situacao = `Abaixo da nota de corte (${fmt(corte)})`;
      margem = `faltam ${fmt(-diff)} pontos para o corte`;
      tone = 'warn';
    }
  } else {
    situacao = 'Informe a nota de corte do curso para comparar';
  }

  const detalhe =
    `Média ponderada = Σ(nota × peso) ÷ Σ(peso) = ` +
    notas.map((n, idx) => `${fmt(n)}×${fmt(pesos[idx])}`).join(' + ') +
    ` ÷ ${fmt(somaPesos)} = ${fmt(mediaPonderada)}. ` +
    `Média simples (pesos iguais) = ${fmt(mediaSimples)}.` +
    (temCorte ? ` Nota de corte informada: ${fmt(corte)}.` : '');

  return {
    mediaPonderada: fmt(mediaPonderada),
    mediaSimples: fmt(mediaSimples),
    situacao,
    margem,
    detalhe,
    _insight: {
      title: temCorte ? situacao : `Sua média ponderada: ${fmt(mediaPonderada)}`,
      text: temCorte
        ? (tone === 'good'
            ? `Com pesos do curso, sua média ponderada é **${fmt(mediaPonderada)}**, **${margem}**. Lembre: a nota de corte do SiSU **muda todo dia** durante a inscrição — acompanhe até o último dia.`
            : `Sua média ponderada (**${fmt(mediaPonderada)}**) está **abaixo** da nota de corte (${fmt(corte)}); ${margem}. Como o corte oscila diariamente no SiSU, ainda pode cair — vale ficar de olho e ter um curso alternativo.`)
        : `Sua média ponderada é **${fmt(mediaPonderada)}** (média simples ${fmt(mediaSimples)}). Informe a **nota de corte** do curso desejado para saber se você estaria dentro na última atualização do SiSU.`,
      tone,
      icon: '🎓',
    },
    _chart: {
      type: 'bar',
      labels: nomes,
      values: notas.map((n) => Math.round(n * 100) / 100),
      ariaLabel: `Notas por área: ${nomes.map((nm, idx) => `${nm} ${fmt(notas[idx])}`).join(', ')}. Média ponderada ${fmt(mediaPonderada)}.`,
    },
  };
}
