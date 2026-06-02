/**
 * Calculadora DOT USA - Compensación por retraso/overbooking
 */
export interface RetrasoVueloCompensacionUsaInputs {
  tipoProblema: string;
  horasRetrasoAlternativa: number;
  precioBoleto: number;
}
export interface RetrasoVueloCompensacionUsaOutputs {
  compensacionUsd: number;
  categoria: string;
  derechos: string;
  _insight?: any;
}
export function retrasoVueloCompensacionUsa(i: RetrasoVueloCompensacionUsaInputs): RetrasoVueloCompensacionUsaOutputs {
  const tipo = String(i.tipoProblema || "overbooking");
  const hs = Number(i.horasRetrasoAlternativa);
  const precio = Number(i.precioBoleto);
  if (!precio || precio <= 0) throw new Error("Ingresá precio válido");
  if (tipo === "retraso") {
    return {
      compensacionUsd: 0, categoria: "Retraso - no compensable por DOT", derechos: "Hotel y comida varían por aerolínea.",
      _insight: {
        title: "EE.UU. no obliga a pagar por retraso",
        text: `A diferencia de Europa, el **DOT no fija compensación** por demoras: por un retraso no te corresponde pago automático. Lo que recibas (hotel, comida, vales) depende de la política de cada aerolínea, así que revisá su *Customer Service Plan*.`,
        tone: "neutral",
        icon: "🛫"
      }
    };
  }
  if (tipo === "cancelacion") {
    return {
      compensacionUsd: precio, categoria: "Reembolso automático obligatorio", derechos: "Reembolso en efectivo si rechazás rebooking.",
      _insight: {
        title: "Reembolso obligatorio",
        text: `Si te cancelan y no aceptás que te reubiquen, la aerolínea **debe devolverte los US$${precio.toFixed(2)}** del boleto en efectivo (no vales). Es una regla del DOT: exigí el reembolso, no un crédito futuro.`,
        tone: "good",
        icon: "💵"
      }
    };
  }
  if (hs < 1) return {
    compensacionUsd: 0, categoria: "IDB <1 hs de demora", derechos: "Sin compensación.",
    _insight: {
      title: "Demora muy corta para IDB",
      text: `Te dejaron en tierra (overbooking) pero la alternativa llega con **menos de 1 hora** de diferencia: el DOT **no exige compensación** en ese caso. Si la demora supera la hora, volvé a calcular.`,
      tone: "neutral",
      icon: "⏱️"
    }
  };
  let comp = 0;
  let tope = 0;
  if (hs <= 2) { comp = Math.min(2 * precio, 1075); tope = 1075; }
  else { comp = Math.min(4 * precio, 1550); tope = 1550; }
  const compFinal = Number(comp.toFixed(2));
  const topeado = comp >= tope;
  return {
    compensacionUsd: compFinal, categoria: "IDB (Involuntary Denied Boarding)", derechos: "Reembolso + compensación + asistencia.",
    _insight: {
      title: "Te corresponde compensación por overbooking",
      text: `Por denegación de embarque involuntaria con **${hs} h** de demora, el DOT obliga a pagarte **US$${compFinal.toFixed(2)}** (${hs <= 2 ? '2×' : '4×'} el boleto de US$${precio.toFixed(2)}${topeado ? `, topeado en US$${tope}` : ''}), además del reembolso o reubicación. Pedilo en efectivo, no en vales.`,
      tone: "good",
      icon: "✈️"
    }
  };
}
