/**
 * IR Day Trade — Ações (B3)
 * Alíquota 20% sobre o lucro líquido mensal (compensáveis prejuízos de meses anteriores
 * EM DAY TRADE — não podem ser compensados com swing trade).
 * Retenção na fonte: 1% sobre o resultado positivo do dia ("dedo duro"), compensável.
 * DARF código 6015. Vencimento: último dia útil do mês seguinte.
 * Lei 11.033/2004, art. 2º §4º; IN RFB 1.585/2015, art. 57.
 * Day trade: compra e venda do MESMO ativo no MESMO pregão, mesma corretora.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }

const ALIQ = 0.20;
const RETENCAO_FONTE = 0.01;

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irDayTrade(i: Inputs): Outputs {
  const lucroBruto = Number(i.lucroBruto) || 0;
  const prejuizoAcumulado = Number(i.prejuizoAcumulado) || 0;
  const corretagem = Number(i.corretagemEmolumentos) || 0;
  const irRetidoFonte = Number(i.irRetidoFonteMes) || 0;

  const lucroAposCustos = lucroBruto - corretagem;
  const baseTributavel = Math.max(0, lucroAposCustos - prejuizoAcumulado);
  const prejuizoRemanescente = Math.max(0, prejuizoAcumulado - lucroAposCustos);

  const irBruto = baseTributavel * ALIQ;
  const retencaoSugerida = Math.max(0, lucroAposCustos) * RETENCAO_FONTE;
  const irAPagar = Math.max(0, irBruto - irRetidoFonte);

  let _insight;
  if (baseTributavel > 0) {
    _insight = {
      title: 'IR de day trade a recolher',
      text: `A base tributável de **${fmt(baseTributavel)}** gera 20% de IR (**${fmt(irBruto)}**). Descontando o IRRF já retido, o DARF 6015 fica em **${fmt(irAPagar)}**, com vencimento no último dia útil do mês seguinte.`,
      tone: 'warn',
      icon: '📉',
    };
  } else if (lucroAposCustos <= 0 || prejuizoRemanescente > 0) {
    _insight = {
      title: 'Sem imposto: prejuízo a compensar',
      text: `Não há IR a pagar neste mês. O prejuízo acumulado de **${fmt(prejuizoRemanescente)}** segue compensável em meses futuros, mas **apenas contra lucros de day trade** — nunca contra swing trade.`,
      tone: 'warn',
      icon: '📉',
    };
  } else {
    _insight = {
      title: 'Mês zerado de IR',
      text: `Após custos e compensação de prejuízos, a base ficou em **${fmt(0)}**: nenhum DARF 6015 a recolher neste mês.`,
      tone: 'neutral',
      icon: '📉',
    };
  }

  return {
    lucroLiquidoMes: fmt(lucroAposCustos),
    prejuizoCompensado: fmt(Math.min(prejuizoAcumulado, Math.max(0, lucroAposCustos))),
    baseCalculo: fmt(baseTributavel),
    irBruto20: fmt(irBruto),
    retencaoFonte1: fmt(retencaoSugerida),
    irAPagarDarf: fmt(irAPagar),
    prejuizoParaProximoMes: fmt(prejuizoRemanescente),
    codigoDarf: '6015',
    resumo: baseTributavel > 0
      ? `Lucro day trade ${fmt(lucroAposCustos)} − prejuízo ${fmt(Math.min(prejuizoAcumulado, lucroAposCustos))} = base ${fmt(baseTributavel)} × 20% = ${fmt(irBruto)}. Menos IRRF já retido (${fmt(irRetidoFonte)}) = DARF 6015 de ${fmt(irAPagar)}.`
      : `Sem lucro tributável neste mês. Prejuízo acumulado de ${fmt(prejuizoRemanescente)} segue compensável em meses futuros APENAS contra day trade.`,
    _insight,
  };
}
