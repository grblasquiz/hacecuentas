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
  _insight?: any;
  _chart?: any;
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

  const valorR = Number(valor.toFixed(2));
  const tone = cpp < 0.8 ? 'warn' : cpp >= 2 ? 'good' : 'neutral';
  const insightText = cpp < 0.8
    ? `Canjeás **${p.toLocaleString()}** puntos a **${cpp}¢** cada uno = **$${valorR.toLocaleString()}**. Es de los canjes menos rentables; transferir a una aerolínea suele valer hasta **2¢/punto**, más del doble.`
    : cpp >= 2
    ? `Canjeás **${p.toLocaleString()}** puntos a **${cpp}¢** cada uno = **$${valorR.toLocaleString()}**. Estás exprimiendo el máximo valor; en business o first class el centavo por punto puede subir aún más.`
    : `Canjeás **${p.toLocaleString()}** puntos a **${cpp}¢** cada uno = **$${valorR.toLocaleString()}**. Es un valor decente, aunque las transferencias a aerolínea suelen rendir cerca de **2¢/punto**.`;

  return {
    valorUsd: valorR,
    centavosPorPunto: cpp,
    recomendacion: rec,
    _insight: { title: 'Valor de tus puntos Amex', text: insightText, tone, icon: '✈️' },
    _chart: {
      type: 'scale',
      marker: cpp,
      markerLabel: `${cpp}¢/punto`,
      min: 0,
      segments: [
        { nombre: 'Bajo', max: 0.8, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Bueno', max: 2, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Óptimo', max: 2.5, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `Valor del canje ${cpp} centavos por punto en escala de rentabilidad`,
    },
  };
}
