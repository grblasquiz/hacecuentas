/** Rate freelance por pais/mercado */
export interface Inputs {
  rateBase: number;
  mercado: string;
}
export interface Outputs {
  rateSugerido: number;
  multiplicador: number;
  rangoMin: number;
  rangoMax: number;
  _insight?: any;
}
export function horaFreelancePorPaisMercado(i: Inputs): Outputs {
  const base = Number(i.rateBase);
  const mkt = String(i.mercado || 'latam');
  if (!base || base <= 0) throw new Error('Ingresá el rate base');
  const mults: Record<string, number> = { usa: 1.5, uk: 1.4, europa: 1.3, australia: 1.35, latam: 0.7, asia: 0.6 };
  const mult = mults[mkt] || 1.0;
  const rate = base * mult;
  const rateR = Math.round(rate);
  const minR = Math.round(rate * 0.8);
  const maxR = Math.round(rate * 1.2);

  const labels: Record<string, string> = {
    usa: "Estados Unidos", uk: "Reino Unido", europa: "Europa",
    australia: "Australia", latam: "Latinoamérica", asia: "Asia",
  };
  const mktLabel = labels[mkt] || mkt;
  const deltaPct = Math.round((mult - 1) * 100);
  let insight_text: string;
  let insight_tone: "good" | "warn" | "neutral";
  if (mult > 1) {
    insight_tone = "good";
    insight_text = `Para clientes de **${mktLabel}** podés cobrar **un ${deltaPct}% más** que tu rate base: apuntá a **$${rateR}/h** (rango **$${minR}–$${maxR}**). Es un mercado que paga sobre tu referencia, no te quedes corto.`;
  } else if (mult < 1) {
    insight_tone = "warn";
    insight_text = `El mercado de **${mktLabel}** suele pagar **un ${Math.abs(deltaPct)}% menos**: el rate realista ronda **$${rateR}/h** (rango **$${minR}–$${maxR}**). Compensá con volumen o usá estos clientes de complemento, no de base.`;
  } else {
    insight_tone = "neutral";
    insight_text = `En **${mktLabel}** el rate queda alineado con tu base: apuntá a **$${rateR}/h** (rango **$${minR}–$${maxR}**) y ajustá según tu seniority y la urgencia del proyecto.`;
  }
  const _insight = {
    title: "Tu rate para este mercado",
    text: insight_text,
    tone: insight_tone,
    icon: "💵",
  };

  return {
    rateSugerido: rateR,
    multiplicador: Number(mult.toFixed(2)),
    rangoMin: minR,
    rangoMax: maxR,
    _insight,
  };
}
