/** UEFA Financial Sustainability (FFP 2022) — déficit permitido y squad cost ratio */
export interface Inputs {
  ingresosAnualMEUR: number; // Ingresos de fútbol (Deloitte Money League)
  gastosAnualMEUR: number; // gastos operativos
  salariosYTransfersMEUR: number; // plantilla + amortizaciones + agentes
  deficitAcumulado3yMEUR: number; // pérdida acumulada 3 temporadas
  acreditaSponsorTest: boolean; // si acredita que sponsor valor de mercado
}

export interface Outputs {
  deficitPermitidoMax: number; // €60M regla + bonus €10M buenos
  squadCostRatioActual: number; // %
  squadCostRatioLimite: number; // 70%
  cumpleDeficit: boolean;
  cumpleSquadRatio: boolean;
  cumpleSponsor: boolean;
  diagnostico: string;
  sancionEstimada: number; // multa estimada MEUR
  moneda: string;
  resumen: string;
}

export function financialFairPlayUefa(i: Inputs): Outputs {
  const ing = Math.max(0, Number(i.ingresosAnualMEUR) || 0);
  const gastos = Math.max(0, Number(i.gastosAnualMEUR) || 0);
  const salTr = Math.max(0, Number(i.salariosYTransfersMEUR) || 0);
  const defAcum = Number(i.deficitAcumulado3yMEUR) || 0;
  const sponsorOK = Boolean(i.acreditaSponsorTest);

  const LIMITE_DEFICIT = 60; // €60M base regla UEFA 2022/2023
  const BONUS_BUENOS_GESTORES = 10; // clubes sanos pueden llegar a €70M
  const deficitMaxPermitido = sponsorOK ? LIMITE_DEFICIT + BONUS_BUENOS_GESTORES : LIMITE_DEFICIT;

  const ratio = ing > 0 ? (salTr / ing) * 100 : 999;
  const RATIO_LIMITE = 70; // squad cost ratio desde 2025/26

  const cumpleDef = defAcum <= deficitMaxPermitido;
  const cumpleRatio = ratio <= RATIO_LIMITE;
  const cumpleSpons = sponsorOK;

  let sancion = 0;
  if (!cumpleDef) sancion += Math.max(0, defAcum - deficitMaxPermitido) * 0.5;
  if (!cumpleRatio) sancion += ing * ((ratio - RATIO_LIMITE) / 100) * 0.3;

  const problemas: string[] = [];
  if (!cumpleDef) problemas.push(`déficit €${defAcum}M > permitido €${deficitMaxPermitido}M`);
  if (!cumpleRatio) problemas.push(`squad ratio ${ratio.toFixed(1)}% > 70%`);
  if (!cumpleSpons) problemas.push('no acreditó sponsor test');

  const diagnostico = problemas.length === 0 ? 'Cumple UEFA Financial Sustainability. Sin sanción.' : `Incumple: ${problemas.join('; ')}.`;

  return {
    deficitPermitidoMax: deficitMaxPermitido,
    squadCostRatioActual: Number(ratio.toFixed(2)),
    squadCostRatioLimite: RATIO_LIMITE,
    cumpleDeficit: cumpleDef,
    cumpleSquadRatio: cumpleRatio,
    cumpleSponsor: cumpleSpons,
    diagnostico,
    sancionEstimada: Number(sancion.toFixed(2)),
    moneda: 'EUR',
    resumen: `${diagnostico} Déficit 3y: €${defAcum}M (máx €${deficitMaxPermitido}M). Squad cost ratio: ${ratio.toFixed(1)}% (máx 70%). Sanción estimada: €${sancion.toFixed(1)}M.`,
  };
}
