/**
 * Calculadora de Timing de Melatonina para Jet Lag
 */
export interface JetLagMedicacionTimingInputs {
  horaLlegadaDestino: number;
  direccionVuelo: string;
  duracionVuelo: number;
}
export interface JetLagMedicacionTimingOutputs {
  horaTomarMelatonina: string;
  dosisRecomendada: string;
  duracionTratamiento: string;
  _insight?: any;
}
export function jetLagMedicacionTiming(i: JetLagMedicacionTimingInputs): JetLagMedicacionTimingOutputs {
  const hora = Number(i.horaLlegadaDestino);
  const dur = Number(i.duracionVuelo);
  if (isNaN(hora) || hora < 0 || hora > 24) throw new Error("Ingresá hora válida (0-24)");
  if (!dur || dur <= 0) throw new Error("Duración de vuelo inválida");
  const direccion = String(i.direccionVuelo || "este");
  let horaTomar = direccion === "este" ? 21 : 7;
  horaTomar = (horaTomar + 24) % 24;
  const horaTxt = `${String(horaTomar).padStart(2,"0")}:00`;
  const _insight = {
    title: direccion === "este" ? "Tomala de noche, viajás al este" : "Tomala de mañana, viajás al oeste",
    text: direccion === "este"
      ? `Volando al **este** la melatonina va a las **${horaTxt} hora local** del destino, para adelantar tu reloj interno. ${dur > 8 ? 'Vuelo largo: **1-3 mg** alcanzan' : 'Vuelo corto: con **0.5-1 mg** basta'}, y mantenela **3-5 días**.`
      : `Volando al **oeste** la melatonina va a las **${horaTxt} hora local** para retrasar tu reloj. ${dur > 8 ? 'Vuelo largo: **1-3 mg**' : 'Vuelo corto: **0.5-1 mg**'} por **2-3 días** suele alcanzar; el oeste se adapta más fácil.`,
    tone: "neutral",
    icon: "💊",
  };
  return {
    horaTomarMelatonina: `${horaTxt} local`,
    dosisRecomendada: dur > 8 ? "1-3 mg (vuelo largo)" : "0.5-1 mg (vuelo corto)",
    duracionTratamiento: direccion === "este" ? "3-5 días post-llegada" : "2-3 días post-llegada",
    _insight,
  };
}
