export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; [k: string]: string | number | any; }
export function plazoFijoGananciaNetaAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const fmt = (n: number, dec = 0) =>
    n.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const capital = Number(i.monto) || 0;
  const tna = Number(i.tasa) || 0;
  // Plazo en días (plazo fijo tradicional). Default 30 días.
  let dias = Number(i.plazo);
  if (!Number.isFinite(dias) || dias <= 0) dias = 30;

  // Interés simple del plazo fijo: capital × (TNA/100) × (días/365)
  const interesBruto = capital * (tna / 100) * (dias / 365);
  const totalVencimiento = capital + interesBruto;

  // Ganancia neta: el banco retiene 15% de Impuesto a las Ganancias (personas humanas).
  const ALICUOTA_GANANCIAS = 0.15;
  const impuesto = interesBruto * ALICUOTA_GANANCIAS;
  const interesNeto = interesBruto - impuesto;
  const totalNeto = capital + interesNeto;

  // TEA aproximada (renovando al mismo plazo durante 365 días):
  // TEA = (1 + (TNA/100)×(días/365))^(365/días) − 1
  const factorPeriodo = (tna / 100) * (dias / 365);
  const tea = dias > 0 ? Math.pow(1 + factorPeriodo, 365 / dias) - 1 : 0;
  const teaPct = tea * 100;
  // TEA neta: aplica el 15% sobre el rendimiento de cada período antes de capitalizar.
  const teaNeta = dias > 0 ? Math.pow(1 + factorPeriodo * (1 - ALICUOTA_GANANCIAS), 365 / dias) - 1 : 0;
  const teaNetaPct = teaNeta * 100;

  const resumen = __lang === 'en'
    ? `$${fmt(capital)} at ${fmt(tna, 2)}% nominal for ${fmt(dias)} days earns $${fmt(interesBruto)} gross ($${fmt(interesNeto)} net after 15% tax); matures at $${fmt(totalNeto)}. Net APY ≈ ${fmt(teaNetaPct, 2)}%.`
    : `$${fmt(capital)} al ${fmt(tna, 2)}% TNA a ${fmt(dias)} días gana $${fmt(interesBruto)} brutos ($${fmt(interesNeto)} netos tras el 15% de Ganancias); al vencimiento cobrás $${fmt(totalNeto)}. TEA neta ≈ ${fmt(teaNetaPct, 2)}%.`;

  const _insight = {
    title: __lang === 'en' ? 'What you actually keep' : 'Lo que realmente te queda',
    text: __lang === 'en'
      ? `On **$${fmt(capital)}** at **${fmt(tna, 2)}%** nominal for **${fmt(dias)} days**, gross interest is **$${fmt(interesBruto)}**. After the **15%** income-tax withholding (**$${fmt(impuesto)}**) you keep **$${fmt(interesNeto)}**, so you collect **$${fmt(totalNeto)}** at maturity. Rolling it over all year gives a net effective annual rate of about **${fmt(teaNetaPct, 2)}%** (gross APY **${fmt(teaPct, 2)}%**).`
      : `Sobre **$${fmt(capital)}** al **${fmt(tna, 2)}%** TNA a **${fmt(dias)} días**, el interés bruto es **$${fmt(interesBruto)}**. Tras la retención del **15%** de Ganancias (**$${fmt(impuesto)}**) te quedan **$${fmt(interesNeto)}**, así que al vencimiento cobrás **$${fmt(totalNeto)}**. Si lo renovás todo el año, la tasa efectiva anual neta es de aproximadamente **${fmt(teaNetaPct, 2)}%** (TEA bruta **${fmt(teaPct, 2)}%**).`,
    tone: 'positive',
    icon: '🏦',
  };

  return {
    resultado: '$' + fmt(interesNeto),
    resumen,
    interesBruto: '$' + fmt(interesBruto),
    impuesto: '$' + fmt(impuesto),
    interesNeto: '$' + fmt(interesNeto),
    totalVencimiento: '$' + fmt(totalNeto),
    tea: fmt(teaPct, 2) + '%',
    teaNeta: fmt(teaNetaPct, 2) + '%',
    _insight,
  };
}
