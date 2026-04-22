/**
 * IR Swing Trade — Ações (B3)
 * Alíquota 15% sobre o ganho líquido mensal.
 * ISENÇÃO: vendas totais no mês ≤ R$ 20.000 (Lei 11.033/2004, art. 3º I).
 *   — a isenção avalia o VALOR DE VENDA, não o lucro.
 *   — não vale para day trade, opções, futuros, FIIs.
 * Retenção na fonte: 0,005% sobre o valor de venda (se > R$ 20k/operação).
 * Prejuízos compensáveis (só com swing trade).
 * DARF 6015. Vencimento: último dia útil do mês seguinte.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const ALIQ = 0.15;
const ISENCAO_MENSAL = 20000;

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irSwingTrade(i: Inputs): Outputs {
  const vendasTotaisMes = Number(i.vendasTotaisMes) || 0;
  const lucroBruto = Number(i.lucroBruto) || 0;
  const prejuizoAcumulado = Number(i.prejuizoAcumulado) || 0;
  const corretagem = Number(i.corretagemEmolumentos) || 0;
  const irRetidoFonte = Number(i.irRetidoFonteMes) || 0;

  const isento = vendasTotaisMes <= ISENCAO_MENSAL;
  const lucroLiquido = lucroBruto - corretagem;
  const baseAposPrejuizo = Math.max(0, lucroLiquido - prejuizoAcumulado);
  const prejuizoRemanescente = Math.max(0, prejuizoAcumulado - lucroLiquido);

  const baseTributavel = isento ? 0 : baseAposPrejuizo;
  const irBruto = baseTributavel * ALIQ;
  const irAPagar = Math.max(0, irBruto - irRetidoFonte);

  return {
    vendasTotaisMes: fmt(vendasTotaisMes),
    situacao: isento ? 'ISENTO (vendas ≤ R$ 20.000)' : 'Tributável',
    lucroLiquidoMes: fmt(lucroLiquido),
    prejuizoCompensado: fmt(Math.min(prejuizoAcumulado, Math.max(0, lucroLiquido))),
    baseCalculo: fmt(baseTributavel),
    irBruto15: fmt(irBruto),
    irAPagarDarf: fmt(irAPagar),
    prejuizoParaProximoMes: fmt(prejuizoRemanescente),
    codigoDarf: '6015',
    resumo: isento
      ? `Vendas do mês ${fmt(vendasTotaisMes)} ≤ R$ 20.000: ISENTO de IR (Lei 11.033/04, art. 3º I). Declare em "Rendimentos Isentos" na DIRPF linha 20.`
      : `Vendas ${fmt(vendasTotaisMes)} > R$ 20k. Base ${fmt(baseTributavel)} × 15% = ${fmt(irBruto)}. Menos IRRF (${fmt(irRetidoFonte)}) = DARF 6015 de ${fmt(irAPagar)}.`,
  };
}
