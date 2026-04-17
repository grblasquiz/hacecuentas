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
}
export function jetLagMedicacionTiming(i: JetLagMedicacionTimingInputs): JetLagMedicacionTimingOutputs {
  const hora = Number(i.horaLlegadaDestino);
  const dur = Number(i.duracionVuelo);
  if (isNaN(hora) || hora < 0 || hora > 24) throw new Error("Ingresá hora válida (0-24)");
  if (!dur || dur <= 0) throw new Error("Duración de vuelo inválida");
  const direccion = String(i.direccionVuelo || "este");
  let horaTomar = direccion === "este" ? 21 : 7;
  horaTomar = (horaTomar + 24) % 24;
  return {
    horaTomarMelatonina: `${String(horaTomar).padStart(2,"0")}:00 local`,
    dosisRecomendada: dur > 8 ? "1-3 mg (vuelo largo)" : "0.5-1 mg (vuelo corto)",
    duracionTratamiento: direccion === "este" ? "3-5 días post-llegada" : "2-3 días post-llegada"
  };
}
