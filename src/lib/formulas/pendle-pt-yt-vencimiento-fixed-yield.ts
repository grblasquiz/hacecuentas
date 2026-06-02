export interface Inputs {
  asset: string;
  ptPrice: number;
  daysToMaturity: number;
  capital: number;
  investIn: string;
  ytPrice: number;
  expectedUnderlyingApy: number;
  currentUnderlyingApy: number;
}

export interface Outputs {
  ptImpliedApy: number;
  ptProfit: number;
  ytLeverage: number;
  ytEffectiveApy: number;
  ytProfit: number;
  breakEvenApy: number;
  verdict: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const ptPrice = Math.max(0.0001, Math.min(0.9999, Number(i.ptPrice) || 0.95));
  const daysToMaturity = Math.max(1, Number(i.daysToMaturity) || 180);
  const capital = Math.max(0, Number(i.capital) || 0);
  const ytPrice = Math.max(0.0001, Math.min(0.9999, Number(i.ytPrice) || 0.05));
  const expectedUnderlyingApy = Math.max(0, Number(i.expectedUnderlyingApy) || 0) / 100;
  const investIn = i.investIn || "compare";

  if (capital <= 0) {
    return {
      ptImpliedApy: 0,
      ptProfit: 0,
      ytLeverage: 0,
      ytEffectiveApy: 0,
      ytProfit: 0,
      breakEvenApy: 0,
      verdict: "Ingresá un capital válido mayor a 0.",
      _insight: {
        title: 'Falta el capital',
        text: 'Ingresá un **capital mayor a 0** para comparar el rendimiento fijo del PT contra el rendimiento apalancado del YT.',
        tone: 'neutral',
        icon: '⚖️',
      },
    };
  }

  // ── PT: Fixed yield ──────────────────────────────────────────────
  // PT comprado a ptPrice, vence a 1.0 (descuento puro)
  // yield_period = (1 - ptPrice) / ptPrice
  const discountRaw = 1 - ptPrice;
  const yieldPeriod = discountRaw / ptPrice;

  // APY anualizado: (1 + yieldPeriod)^(365/days) - 1
  const ptImpliedApy = Math.pow(1 + yieldPeriod, 365 / daysToMaturity) - 1;

  // Ganancia PT: capital invertido en PT → cuántos PT compro → ganancia al vencimiento
  // Unidades PT = capital / ptPrice (en términos de precio del subyacente, asumimos 1 subyacente = 1 USD de referencia)
  const ptUnits = capital / ptPrice;
  // Al vencimiento PT vale 1 cada uno, por lo que recupero ptUnits en USD
  // Ganancia = ptUnits - capital (lo que puse)
  const ptProfit = ptUnits - capital; // = capital * yieldPeriod

  // ── YT: Leveraged yield ──────────────────────────────────────────
  // Leverage: 1 YT cuesta ytPrice pero captura yield de 1 unidad entera
  const ytLeverage = 1 / ytPrice;

  // Yield que genera 1 unidad del subyacente durante el período
  // yield_per_unit = expectedUnderlyingApy * (days / 365)  [simple, por período]
  const yieldPerUnit = expectedUnderlyingApy * (daysToMaturity / 365);

  // Yield obtenido por cada YT = yieldPerUnit (YT captura todo el yield de 1 unidad)
  // Retorno sobre capital invertido en YT = yieldPerUnit / ytPrice
  const ytReturnOnCapital = yieldPerUnit / ytPrice;

  // APY efectivo del YT
  const ytEffectiveApy = Math.pow(1 + ytReturnOnCapital, 365 / daysToMaturity) - 1;

  // Ganancia YT:
  // Cuántos YT compro = capital / ytPrice
  const ytUnits = capital / ytPrice;
  // Cada YT acumula yieldPerUnit de USD (asumiendo precio subyacente = 1)
  // Al vencimiento YT vale 0, así que:
  // profit YT = ytUnits * yieldPerUnit - 0 (el capital en YT se pierde)
  // Neto = capital * ytLeverage * yieldPerUnit - capital
  //      = capital * (ytReturnOnCapital - 1)
  const ytProfitGross = ytUnits * yieldPerUnit; // yield cobrado
  const ytProfit = ytProfitGross - capital;      // descontamos el capital invertido (se pierde al vencimiento)

  // ── Break-even ───────────────────────────────────────────────────
  // YT > PT cuando ytReturnOnCapital > yieldPeriod
  // yieldPerUnit / ytPrice > yieldPeriod
  // yieldPerUnit > yieldPeriod * ytPrice
  // Para un período de (days/365), annualizado:
  // breakEvenApy_underlying: el APY subyacente tal que ytEffectiveApy = ptImpliedApy
  // Resolviendo: breakEven_period = ptImpliedApy_period * ytPrice
  //   donde ptImpliedApy_period = (1+ptImpliedApy)^(days/365) - 1
  const ptPeriodYield = Math.pow(1 + ptImpliedApy, daysToMaturity / 365) - 1;
  const breakEvenPeriodYield = ptPeriodYield * ytPrice;
  const breakEvenApy = Math.pow(1 + breakEvenPeriodYield, 365 / daysToMaturity) - 1;

  // ── Veredicto ────────────────────────────────────────────────────
  let verdict = "";

  const ptApyPct = (ptImpliedApy * 100).toFixed(2);
  const ytApyPct = (ytEffectiveApy * 100).toFixed(2);
  const breakEvenPct = (breakEvenApy * 100).toFixed(2);
  const leverageStr = ytLeverage.toFixed(1);
  const assetLabel = i.asset === "custom" ? "subyacente" : i.asset;

  if (investIn === "PT") {
    verdict = `PT fija un APY de ${ptApyPct}% hasta el vencimiento. Ganancia estimada: $${ptProfit.toFixed(2)} USD. Sin riesgo de yield variable.`;
  } else if (investIn === "YT") {
    if (ytProfit > 0) {
      verdict = `Con ${assetLabel} rindiendo ${(expectedUnderlyingApy * 100).toFixed(2)}%, YT genera APY efectivo de ${ytApyPct}% (${leverageStr}x leverage). Ganancia neta estimada: $${ytProfit.toFixed(2)} USD.`;
    } else {
      verdict = `Con ${assetLabel} rindiendo ${(expectedUnderlyingApy * 100).toFixed(2)}%, YT no cubre el costo del capital. Pérdida estimada: $${Math.abs(ytProfit).toFixed(2)} USD. El break-even del subyacente es ${breakEvenPct}% APY.`;
    }
  } else {
    // compare
    if (ytProfit > ptProfit) {
      verdict = `✅ YT supera a PT: APY ${ytApyPct}% vs ${ptApyPct}% fijo. El subyacente (${(expectedUnderlyingApy * 100).toFixed(2)}%) supera el break-even de ${breakEvenPct}%. YT gana $${(ytProfit - ptProfit).toFixed(2)} más que PT.`;
    } else if (ptProfit > ytProfit) {
      verdict = `✅ PT supera a YT en este escenario: APY fijo ${ptApyPct}% vs ${ytApyPct}% efectivo con tu expectativa. El subyacente necesita superar ${breakEvenPct}% APY para que YT gane. PT es más seguro aquí.`;
    } else {
      verdict = `PT y YT empatan con este escenario. APY fijo PT: ${ptApyPct}%. Break-even APY: ${breakEvenPct}%.`;
    }
  }

  // ── Insight ──────────────────────────────────────────────────────
  let insightTitle: string;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;

  if (investIn === 'PT') {
    insightTitle = 'Rendimiento fijo (PT)';
    insightText = `El PT te fija un **${ptApyPct}% APY** hasta el vencimiento, con ganancia estimada de **$${ptProfit.toFixed(2)}**. Es la pata segura: no depende del yield variable del subyacente.`;
    insightTone = 'good';
    insightIcon = '🔒';
  } else if (investIn === 'YT') {
    if (ytProfit > 0) {
      insightText = `Con el subyacente rindiendo ${(expectedUnderlyingApy * 100).toFixed(2)}%, el YT (${leverageStr}x) da **${ytApyPct}% APY** y **+$${ytProfit.toFixed(2)}**. Pero si el rinde cae bajo **${breakEvenPct}%**, el YT pierde: el capital se va a cero al vencimiento.`;
      insightTone = 'warn';
      insightTitle = 'Rendimiento apalancado (YT)';
      insightIcon = '⚡';
    } else {
      insightText = `Con el subyacente en ${(expectedUnderlyingApy * 100).toFixed(2)}%, el YT no cubre el costo del capital: **−$${Math.abs(ytProfit).toFixed(2)}**. Necesitás que el subyacente supere **${breakEvenPct}% APY** para no perder.`;
      insightTone = 'warn';
      insightTitle = 'YT en pérdida';
      insightIcon = '⚠️';
    }
  } else {
    if (ytProfit > ptProfit) {
      insightText = `Con tu expectativa, el **YT gana**: ${ytApyPct}% vs ${ptApyPct}% fijo, **+$${(ytProfit - ptProfit).toFixed(2)}** sobre el PT. Pero el YT solo conviene mientras el subyacente supere el break-even de **${breakEvenPct}%** — por debajo, el PT es mejor.`;
      insightTone = 'warn';
      insightTitle = 'YT supera al PT (con riesgo)';
      insightIcon = '⚡';
    } else if (ptProfit > ytProfit) {
      insightText = `Con tu expectativa, el **PT gana**: ${ptApyPct}% fijo vs ${ytApyPct}% efectivo del YT. El subyacente tendría que superar **${breakEvenPct}% APY** para que el YT valga la pena. El PT es la opción segura acá.`;
      insightTone = 'good';
      insightTitle = 'PT supera al YT';
      insightIcon = '🔒';
    } else {
      insightText = `PT y YT empatan en este escenario: APY fijo del PT **${ptApyPct}%**, break-even del subyacente **${breakEvenPct}%**. El PT te lo asegura; el YT depende de que el rinde se sostenga.`;
      insightTone = 'neutral';
      insightTitle = 'PT y YT empatan';
      insightIcon = '⚖️';
    }
  }

  const _insight = { title: insightTitle, text: insightText, tone: insightTone, icon: insightIcon };

  return {
    ptImpliedApy,
    ptProfit,
    ytLeverage,
    ytEffectiveApy,
    ytProfit,
    breakEvenApy,
    verdict,
    _insight,
  };
}
