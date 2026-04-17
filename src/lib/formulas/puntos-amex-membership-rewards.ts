/**
 * Calculadora de Puntos Amex Membership Rewards
 */
export interface PuntosAmexMembershipRewardsInputs {
  puntos: number;
  canal: string;
}
export interface PuntosAmexMembershipRewardsOutputs {
  valorUsd: number;
  centavosPorPunto: number;
  recomendacion: string;
}
export function puntosAmexMembershipRewards(i: PuntosAmexMembershipRewardsInputs): PuntosAmexMembershipRewardsOutputs {
  const p = Number(i.puntos);
  if (!p || p <= 0) throw new Error("Ingresá puntos válidos");
  const canal = String(i.canal || "transferencia-aerolinea");
  const CPP: Record<string, number> = {
    "transferencia-aerolinea": 2.0,
    "amex-travel": 1.0,
    "cashback": 0.6,
    "productos": 0.5
  };
  const cpp = CPP[canal] || 1.0;
  const valor = p * cpp / 100;
  let rec = "Buen canje.";
  if (cpp < 0.8) rec = "Valor bajo: considerá transferir a aerolínea.";
  else if (cpp >= 2) rec = "Valor óptimo. Maximizá con business class.";
  return { valorUsd: Number(valor.toFixed(2)), centavosPorPunto: cpp, recomendacion: rec };
}
