export interface Inputs {
  aporteAnual: number;   // aporte total al APV en el año (CLP)
  tasaMarginal: number;  // tasa marginal del impuesto global complementario / 2ª categoría (%)
  valorUTM: number;      // valor UTM (default 71506)
  valorUF: number;       // valor UF (default 40812)
}

export interface Outputs {
  beneficioRegA: number;
  beneficioRegB: number;
  recomendado: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const valorUTM = i.valorUTM > 0 ? i.valorUTM : 71506;
  const valorUF = i.valorUF > 0 ? i.valorUF : 40812;
  const aporteAnual = i.aporteAnual > 0 ? i.aporteAnual : 0;
  const tasaMarginal = i.tasaMarginal >= 0 ? i.tasaMarginal : 0;

  // APV — Art. 42 bis LIR, dos regímenes excluyentes:
  // Régimen A (bonificación estatal): el Estado aporta 15% de lo ahorrado en el año,
  //   con tope de 6 UTM anuales (6 × 4,718 ≈ depende, tope legal = 6 UTM).
  const beneficioRegA = Math.round(Math.min(aporteAnual * 0.15, 6 * valorUTM));

  // Régimen B (rebaja de base imponible): el aporte rebaja la base tributable,
  //   con tope de 600 UF anuales. El ahorro de impuesto = aporte rebajable × tasa marginal.
  const aporteRebajable = Math.min(aporteAnual, 600 * valorUF);
  const beneficioRegB = Math.round(aporteRebajable * (tasaMarginal / 100));

  const recomendado = beneficioRegA >= beneficioRegB ? 'Régimen A' : 'Régimen B';

  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const mejor = Math.max(beneficioRegA, beneficioRegB);
  const diferencia = Math.abs(beneficioRegA - beneficioRegB);
  const insightText = aporteAnual > 0
    ? `Con un aporte anual de **${fmtCLP(aporteAnual)}**, el **${recomendado}** te conviene: te deja **${fmtCLP(mejor)}** de beneficio (Régimen A: ${fmtCLP(beneficioRegA)} de bonificación estatal; Régimen B: ${fmtCLP(beneficioRegB)} de ahorro de impuesto a tu tasa marginal del ${tasaMarginal}%). La diferencia entre ambos es de **${fmtCLP(diferencia)}**.`
    : `Ingresá tu aporte anual y tu tasa marginal para comparar el beneficio de cada régimen.`;

  return {
    beneficioRegA,
    beneficioRegB,
    recomendado,
    _insight: {
      title: 'Qué régimen de APV te conviene',
      text: insightText,
      tone: 'good',
      icon: '💰',
    },
  };
}
