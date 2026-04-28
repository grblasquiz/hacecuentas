export interface Inputs {
  principal: number;
  months: number;
  selic: number;
  cdb_rate: string;
}

export interface Outputs {
  cdb_net: number;
  savings_net: number;
  treasury_net: number;
  cdb_total: number;
  savings_total: number;
  treasury_total: number;
  ir_aliquota: number;
  summary: string;
}

// Tabela IOF regressiva — art. 1º Decreto 6.306/2007
// Dia 1 = 96%, decremento ~3,33% por dia, zerado no dia 30+
const IOF_TABLE: number[] = [
  0.96, 0.93, 0.90, 0.86, 0.83, 0.80, 0.76, 0.73, 0.70, 0.66,
  0.63, 0.60, 0.56, 0.53, 0.50, 0.46, 0.43, 0.40, 0.36, 0.33,
  0.30, 0.26, 0.23, 0.20, 0.16, 0.13, 0.10, 0.06, 0.03, 0.00
];

// IR Regressivo — Lei 11.033/2004 (Receita Federal)
function getIRAliquota(days: number): number {
  if (days <= 180) return 0.225;
  if (days <= 360) return 0.200;
  if (days <= 720) return 0.175;
  return 0.150;
}

// Fração de IOF para dias no mês (apenas primeiros 30 dias corridos)
function getIOFRate(days: number): number {
  if (days <= 0) return IOF_TABLE[0];
  if (days >= 30) return 0;
  return IOF_TABLE[days - 1];
}

export function compute(i: Inputs): Outputs {
  const principal = Number(i.principal) || 0;
  const months = Math.max(1, Math.round(Number(i.months) || 12));
  const selicPct = Number(i.selic) || 11; // % a.a.
  const cdbRatePct = Number(i.cdb_rate) || 100; // % do CDI

  if (principal <= 0) {
    return {
      cdb_net: 0,
      savings_net: 0,
      treasury_net: 0,
      cdb_total: 0,
      savings_total: 0,
      treasury_total: 0,
      ir_aliquota: 0,
      summary: "Informe um valor investido válido."
    };
  }

  const selicDecimal = selicPct / 100;

  // CDI ≈ Selic - 0,10% a.a. (convenção de mercado, BACEN)
  const cdiAnual = Math.max(0, selicDecimal - 0.001);

  // Dias aproximados
  const days = months * 30;

  // --- IR e IOF ---
  const irAliquota = getIRAliquota(days);
  const iofRate = getIOFRate(days); // IOF só nos primeiros 30 dias corridos

  // --- CDB ---
  const cdbAnual = cdiAnual * (cdbRatePct / 100);
  const cdbFatorMensal = Math.pow(1 + cdbAnual, 1 / 12);
  const cdbBruto = principal * (Math.pow(cdbFatorMensal, months) - 1);

  // IOF incide sobre o bruto ANTES do IR, apenas se days < 30
  const iofValor = cdbBruto * iofRate;
  const cdbAposIOF = cdbBruto - iofValor;
  const irValor = cdbAposIOF * irAliquota;
  const cdb_net = Math.max(0, cdbAposIOF - irValor);
  const cdb_total = principal + cdb_net;

  // --- Poupança ---
  // Regra: Selic > 8,5% a.a. → 0,5% a.m. + TR (TR ≈ 0 desde 2017, BACEN)
  // Regra alternativa: Selic <= 8,5% a.a. → 70% da Selic / 12 por mês
  let savingsMensal: number;
  if (selicDecimal > 0.085) {
    savingsMensal = 0.005; // 0,5% a.m. + TR (TR = 0)
  } else {
    savingsMensal = (selicDecimal * 0.70) / 12;
  }
  const savingsBruto = principal * (Math.pow(1 + savingsMensal, months) - 1);
  const savings_net = savingsBruto; // isenta de IR e IOF
  const savings_total = principal + savings_net;

  // --- Tesouro Selic ---
  // Rende ~100% Selic; custodia B3 (0,2% a.a.) não incluída para comparação direta
  const treasuryBruto = principal * (Math.pow(1 + selicDecimal, months / 12) - 1);
  const iofTreasuryValor = treasuryBruto * iofRate;
  const treasuryAposIOF = treasuryBruto - iofTreasuryValor;
  const irTreasuryValor = treasuryAposIOF * irAliquota;
  const treasury_net = Math.max(0, treasuryAposIOF - irTreasuryValor);
  const treasury_total = principal + treasury_net;

  // --- Melhor opção ---
  const maxNet = Math.max(cdb_net, savings_net, treasury_net);
  let best = "";
  if (maxNet === cdb_net) best = `CDB ${cdbRatePct}% CDI`;
  else if (maxNet === treasury_net) best = "Tesouro Selic";
  else best = "Poupança";

  const irPct = (irAliquota * 100).toFixed(1);
  const summary =
    `Melhor opção: ${best} com rendimento líquido de R$ ${maxNet.toFixed(2)}. ` +
    `Alíquota de IR aplicada ao CDB e Tesouro: ${irPct}% (${days} dias). ` +
    (days < 30
      ? `IOF aplicado: ${(iofRate * 100).toFixed(0)}% sobre o lucro (resgate antes de 30 dias).`
      : "Sem IOF (prazo superior a 30 dias).");

  return {
    cdb_net: parseFloat(cdb_net.toFixed(2)),
    savings_net: parseFloat(savings_net.toFixed(2)),
    treasury_net: parseFloat(treasury_net.toFixed(2)),
    cdb_total: parseFloat(cdb_total.toFixed(2)),
    savings_total: parseFloat(savings_total.toFixed(2)),
    treasury_total: parseFloat(treasury_total.toFixed(2)),
    ir_aliquota: parseFloat((irAliquota * 100).toFixed(1)),
    summary
  };
}
