/**
 * Orçamento de presente — Dia dos Pais 2026 (9 de agosto).
 * Divide o orçamento entre os presentes e sugere faixas (econômica / equilibrada / caprichada).
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const fmt = (n: number) =>
  'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function compute(i: Inputs): Outputs {
  const orcamento = Number(i.orcamentoTotal) || 0;
  const presentes = Math.max(1, Math.round(Number(i.numeroPresentes) || 1));
  const extras = Number(i.custoExtras) || 0; // almoço, embalagem, frete
  if (orcamento <= 0) throw new Error('Informe o orçamento total');

  const disponivel = Math.max(0, orcamento - extras);
  const porPresente = disponivel / presentes;
  const faixaEco = porPresente * 0.7;
  const faixaTop = porPresente * 1.3;
  const estourou = extras >= orcamento;

  const _insight = {
    title: 'Seu orçamento para o Dia dos Pais 2026',
    text: estourou
      ? `Os extras (${fmt(extras)}) consomem todo o orçamento de ${fmt(orcamento)}. Reduza os extras ou aumente o orçamento — senão não sobra nada para os ${presentes} presente(s).`
      : `Para **${presentes} presente(s)** com ${fmt(orcamento)}${extras > 0 ? ` (descontando ${fmt(extras)} de extras)` : ''}, mire **${fmt(porPresente)} por presente**. Faixa saudável: entre **${fmt(faixaEco)}** (opção econômica) e **${fmt(faixaTop)}** (caprichada). O Dia dos Pais 2026 é **domingo, 9 de agosto** — comprando até o fim de julho você escapa da alta de preços da última semana.`,
    tone: estourou ? 'warn' : 'good',
    icon: '👔',
  };

  const _chart = {
    type: 'bar',
    bars: [
      { label: 'Econômico', value: Math.round(faixaEco * 100) / 100 },
      { label: 'Alvo', value: Math.round(porPresente * 100) / 100 },
      { label: 'Caprichado', value: Math.round(faixaTop * 100) / 100 },
    ],
    ariaLabel: `Faixa de gasto por presente: de ${fmt(faixaEco)} a ${fmt(faixaTop)}, alvo ${fmt(porPresente)}.`,
  };

  return {
    valorPorPresente: fmt(porPresente),
    faixaSugerida: `${fmt(faixaEco)} a ${fmt(faixaTop)}`,
    disponivelPresentes: fmt(disponivel),
    dataDiaDosPais: 'Domingo, 9 de agosto de 2026',
    detalhe: `${presentes} presente(s) · orçamento ${fmt(orcamento)}${extras > 0 ? ` · extras ${fmt(extras)}` : ''} · faixa = alvo ±30%.`,
    _insight,
    _chart,
  };
}
