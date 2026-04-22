/**
 * DARF Criptoativos — Ganho de capital em cripto
 * IN RFB 1.888/2019 (declaração mensal de operações > R$ 30k) +
 * Lei 8.981/1995 (ganho de capital) + Lei 14.754/2023 (exterior).
 * Fato gerador: vendas totais > R$ 35.000 no mês (somando TODAS as criptos).
 * Se vendas ≤ R$ 35.000 no mês → ISENTO.
 * Se > R$ 35.000 → 15% sobre o ganho (faixas maiores 17,5% / 20% / 22,5% para ganhos muito altos).
 * Day trade cripto: sempre tributado, alíquota 20% sobre o ganho (independe de volume).
 * DARF código 4600. Vencimento: último dia útil do mês seguinte.
 * Declaração mensal à RFB (e-CAC) via Coleta Nacional quando volume > R$ 30k com exchange estrangeira ou P2P.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const LIMITE_ISENCAO = 35000;

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function aliqGanho(ganho: number): number {
  if (ganho <= 5_000_000) return 0.15;
  if (ganho <= 10_000_000) return 0.175;
  if (ganho <= 30_000_000) return 0.20;
  return 0.225;
}

export function darfCriptoGanho(i: Inputs): Outputs {
  const vendasMes = Number(i.vendasTotaisMes) || 0;
  const custoAquisicao = Number(i.custoAquisicao) || 0;
  const tipoOperacao = String(i.tipoOperacao || 'swing');

  const ganho = Math.max(0, vendasMes - custoAquisicao);

  const isento = tipoOperacao === 'swing' && vendasMes <= LIMITE_ISENCAO;
  const aliq = tipoOperacao === 'daytrade' ? 0.20 : aliqGanho(ganho);
  const imposto = isento ? 0 : ganho * aliq;

  return {
    vendasMes: fmt(vendasMes),
    ganhoCapital: fmt(ganho),
    situacao: isento ? 'ISENTO (vendas ≤ R$ 35.000)' : 'Tributável',
    aliquotaAplicada: (aliq * 100).toFixed(1) + '%',
    impostoDevido: fmt(imposto),
    codigoDarf: '4600',
    declaracaoMensal: vendasMes > 30000 ? 'Obrigatória via e-CAC (IN RFB 1.888/19) se exchange estrangeira/P2P' : 'Dispensada',
    resumo: isento
      ? `Vendas cripto ${fmt(vendasMes)} ≤ R$ 35.000 no mês: ISENTO de IR (swing). Declare saldos na ficha "Bens e Direitos" grupo 08 da DIRPF.`
      : tipoOperacao === 'daytrade'
        ? `Day trade cripto: ganho ${fmt(ganho)} × 20% = ${fmt(imposto)}. DARF 4600 até o último dia útil do mês seguinte. IN RFB 1.888/19 exige declaração mensal.`
        : `Vendas ${fmt(vendasMes)} > R$ 35k: ganho ${fmt(ganho)} × ${(aliq * 100).toFixed(1)}% = ${fmt(imposto)}. DARF 4600 até o último dia útil do mês seguinte.`,
  };
}
