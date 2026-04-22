/**
 * IR Ganho de Capital — Venda de imóvel
 * Alíquota 15% sobre o ganho (Lei 8.981/1995, art. 21 — hoje até R$ 5 mi;
 * faixas maiores 17,5% / 20% / 22,5% acima de R$ 10 mi / R$ 30 mi).
 * Base = valor venda − valor aquisição (+ benfeitorias comprovadas).
 * Isenções (Lei 11.196/2005 + IN RFB 84/2001):
 *  - Único imóvel residencial e valor de venda ≤ R$ 440.000 (não vendeu outro nos últimos 5 anos)
 *  - Compra de outro imóvel residencial em até 180 dias (uma vez a cada 5 anos)
 * DARF código 4600, vencimento último dia útil do mês seguinte à venda.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function aliqGanho(ganho: number): number {
  if (ganho <= 5_000_000) return 0.15;
  if (ganho <= 10_000_000) return 0.175;
  if (ganho <= 30_000_000) return 0.20;
  return 0.225;
}

export function irGanhoCapitalImovel(i: Inputs): Outputs {
  const valorVenda = Number(i.valorVenda) || 0;
  const valorCompra = Number(i.valorCompra) || 0;
  const benfeitorias = Number(i.benfeitorias) || 0;
  const unicoImovel = String(i.unicoImovel || 'nao') === 'sim';
  const recompra180d = String(i.recompraEm180d || 'nao') === 'sim';

  const ganho = Math.max(0, valorVenda - valorCompra - benfeitorias);

  const isentoUnico = unicoImovel && valorVenda <= 440000;
  const isentoRecompra = recompra180d;
  const isento = isentoUnico || isentoRecompra;

  const aliq = aliqGanho(ganho);
  const impostoDevido = isento ? 0 : ganho * aliq;

  let motivoIsencao = '';
  if (isentoUnico) motivoIsencao = 'Único imóvel residencial ≤ R$ 440 mil (Lei 9.250/95, art. 23).';
  else if (isentoRecompra) motivoIsencao = 'Reinvestimento em imóvel residencial em até 180 dias (Lei 11.196/05, art. 39).';

  return {
    ganhoCapital: fmt(ganho),
    aliquotaAplicada: (aliq * 100).toFixed(1) + '%',
    impostoDevido: fmt(impostoDevido),
    situacao: isento ? 'Isento' : 'Tributável',
    motivoIsencao: motivoIsencao || 'N/A',
    codigoDarf: '4600',
    resumo: isento
      ? `Ganho de capital ${fmt(ganho)} ISENTO. ${motivoIsencao} Obrigatório informar no programa Ganhos de Capital (GCAP) e na DIRPF.`
      : `Ganho de capital ${fmt(ganho)} × ${(aliq * 100).toFixed(1)}% = ${fmt(impostoDevido)}. DARF 4600 até o último dia útil do mês seguinte à venda. Informe no GCAP.`,
  };
}
