/**
 * Calculadora EU261 - Compensación por retraso de vuelo
 */
export interface RetrasoVueloCompensacionEuInputs {
  distanciaKm: number;
  horasRetraso: number;
  causa: string;
}
export interface RetrasoVueloCompensacionEuOutputs {
  compensacionEur: number;
  categoria: string;
  derechoAdicional: string;
  _insight?: any;
}
export function retrasoVueloCompensacionEu(i: RetrasoVueloCompensacionEuInputs): RetrasoVueloCompensacionEuOutputs {
  const km = Number(i.distanciaKm);
  const hs = Number(i.horasRetraso);
  const causa = String(i.causa || "aerolinea");
  if (!km || km <= 0) throw new Error("Ingresá distancia válida");
  if (hs < 0) throw new Error("Horas de retraso inválidas");
  if (causa === "fuerza-mayor") {
    return {
      compensacionEur: 0, categoria: "No compensable", derechoAdicional: "Asistencia de comida y alojamiento si corresponde.",
      _insight: {
        title: "Sin compensación por fuerza mayor",
        text: `Por causa de **fuerza mayor** (clima extremo, huelga ajena, riesgo de seguridad) la aerolínea **no debe pagar** la compensación del EU261. Igual conservás el derecho a **asistencia**: comida, bebida y alojamiento mientras esperás.`,
        tone: "neutral",
        icon: "⛈️"
      }
    };
  }
  if (hs < 3) return {
    compensacionEur: 0, categoria: "Retraso <3 hs", derechoAdicional: "No aplica EU261.",
    _insight: {
      title: "Todavía no llegás al umbral",
      text: `Con **${hs} h** de retraso no se activa la compensación: el EU261 paga recién a partir de las **3 horas** en destino. Si la demora crece, volvé a calcular.`,
      tone: "neutral",
      icon: "⏳"
    }
  };
  let comp = 0, cat = "";
  if (km <= 1500) { comp = 250; cat = "Vuelo corto (≤1500 km)"; }
  else if (km <= 3500) { comp = 400; cat = "Vuelo medio (1500-3500 km)"; }
  else { comp = 600; cat = "Vuelo largo (>3500 km)"; if (hs < 4) comp = 300; }
  const reducido = km > 3500 && hs < 4;
  return {
    compensacionEur: comp, categoria: cat, derechoAdicional: "Asistencia + comida + hotel si aplica.",
    _insight: {
      title: "Te corresponde compensación",
      text: `Por un ${cat.toLowerCase()} con **${hs} h** de retraso podés reclamar **€${comp}** a la aerolínea, más comida, bebida y hotel si aplica.${reducido ? ` (Se reduce a la mitad porque en vuelos largos con menos de 4 h de demora el EU261 paga €300 en vez de €600.)` : ''} Es un derecho: reclamalo aunque te ofrezcan solo un vale.`,
      tone: "good",
      icon: "✈️"
    }
  };
}
