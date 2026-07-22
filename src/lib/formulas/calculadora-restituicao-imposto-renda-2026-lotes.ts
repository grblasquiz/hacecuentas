/**
 * Restituição IR 2026 — calendário de lotes e correção pela Selic.
 * Regra: a restituição é corrigida pela Selic acumulada entre o mês seguinte
 * ao prazo de entrega (junho/2026) e o mês anterior ao pagamento, + 1% fixo
 * no mês do pagamento. O 1º lote (29/05) sai sem correção.
 * Estimativa com Selic mensal ≈ 1,10% a.m. (patamar 2026).
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const SELIC_MENSAL = 0.011; // ~1,10% a.m. (aprox. do patamar 2026)

interface Lote {
  id: string;
  nome: string;
  data: string;
  mesesSelic: number; // meses de Selic acumulada antes do +1%
  extra1: boolean;    // soma 1% do mês do pagamento
}

const LOTES: Lote[] = [
  { id: 'lote1', nome: '1º lote', data: '29/05/2026', mesesSelic: 0, extra1: false },
  { id: 'lote2', nome: '2º lote', data: '30/06/2026', mesesSelic: 0, extra1: true },
  { id: 'lote3', nome: '3º lote', data: '31/07/2026', mesesSelic: 1, extra1: true },
  { id: 'lote4', nome: '4º lote', data: '31/08/2026', mesesSelic: 2, extra1: true },
  { id: 'residual', nome: 'Lote residual (estimado p/ outubro)', data: 'previsão: 30/10/2026', mesesSelic: 4, extra1: true },
];

const fmt = (n: number) =>
  'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorRestituicao) || 0;
  const loteId = String(i.lote || 'lote4');
  if (valor <= 0) throw new Error('Informe o valor da restituição declarado');

  const lote = LOTES.find((l) => l.id === loteId) || LOTES[3];
  const taxa = lote.mesesSelic * SELIC_MENSAL + (lote.extra1 ? 0.01 : 0);
  const correcao = valor * taxa;
  const corrigido = valor + correcao;
  const residual = loteId === 'residual';

  const _insight = {
    title: residual ? 'Ainda não caiu? Confira a malha fina' : `Sua restituição no ${lote.nome}`,
    text: residual
      ? `Se você não entrou em nenhum dos 4 lotes (o último foi **31/08/2026**), sua declaração provavelmente está **em análise ou na malha fina**. Consulte o e-CAC ("Meu Imposto de Renda → Pendências de malha"). Se cair num lote residual em outubro, você receberia cerca de **${fmt(corrigido)}** (correção estimada de ${(taxa * 100).toFixed(2).replace('.', ',')}%). A correção pela Selic continua correndo a seu favor.`
      : `No **${lote.nome} (${lote.data})** você recebe cerca de **${fmt(corrigido)}**: os ${fmt(valor)} declarados + **${fmt(correcao)}** de correção (${(taxa * 100).toFixed(2).replace('.', ',')}% — Selic acumulada + 1% do mês do pagamento). O crédito cai na conta ou chave Pix (CPF) informada na declaração.`,
    tone: residual ? 'warn' : 'good',
    icon: residual ? '🔎' : '💰',
  };

  const _chart = {
    type: 'bar',
    bars: [
      { label: 'Declarado', value: Math.round(valor * 100) / 100 },
      { label: 'Corrigido', value: Math.round(corrigido * 100) / 100 },
    ],
    ariaLabel: `Restituição declarada ${fmt(valor)}, corrigida ${fmt(corrigido)}.`,
  };

  return {
    valorCorrigido: fmt(corrigido),
    correcaoSelic: fmt(correcao),
    taxaCorrecao: (taxa * 100).toFixed(2).replace('.', ',') + '%',
    dataPagamento: lote.data,
    detalhe: residual
      ? `Fora dos 4 lotes regulares · correção estimada até out/2026 (Selic ≈ 1,10% a.m.) · verifique pendências no e-CAC.`
      : `${lote.nome} · pago em ${lote.data} · correção = Selic acumulada${lote.extra1 ? ' + 1% do mês do pagamento' : ''} (estimativa com Selic ≈ 1,10% a.m.).`,
    _insight,
    _chart,
  };
}
