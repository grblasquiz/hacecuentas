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
}
export function retrasoVueloCompensacionEu(i: RetrasoVueloCompensacionEuInputs): RetrasoVueloCompensacionEuOutputs {
  const km = Number(i.distanciaKm);
  const hs = Number(i.horasRetraso);
  const causa = String(i.causa || "aerolinea");
  if (!km || km <= 0) throw new Error("Ingresá distancia válida");
  if (hs < 0) throw new Error("Horas de retraso inválidas");
  if (causa === "fuerza-mayor") {
    return { compensacionEur: 0, categoria: "No compensable", derechoAdicional: "Asistencia de comida y alojamiento si corresponde." };
  }
  if (hs < 3) return { compensacionEur: 0, categoria: "Retraso <3 hs", derechoAdicional: "No aplica EU261." };
  let comp = 0, cat = "";
  if (km <= 1500) { comp = 250; cat = "Vuelo corto (≤1500 km)"; }
  else if (km <= 3500) { comp = 400; cat = "Vuelo medio (1500-3500 km)"; }
  else { comp = 600; cat = "Vuelo largo (>3500 km)"; if (hs < 4) comp = 300; }
  return { compensacionEur: comp, categoria: cat, derechoAdicional: "Asistencia + comida + hotel si aplica." };
}
