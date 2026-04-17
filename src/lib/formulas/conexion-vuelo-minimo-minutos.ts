/**
 * Calculadora de Conexión mínima entre vuelos
 */
export interface ConexionVueloMinimoMinutosInputs {
  tipoConexion: string;
  aeropuerto: string;
  cambioTerminal: string;
}
export interface ConexionVueloMinimoMinutosOutputs {
  minutosMinimos: number;
  minutosRecomendados: number;
  riesgo: string;
}
export function conexionVueloMinimoMinutos(i: ConexionVueloMinimoMinutosInputs): ConexionVueloMinimoMinutosOutputs {
  const tipo = String(i.tipoConexion || "internacional");
  const aero = String(i.aeropuerto || "mediano");
  const cambio = String(i.cambioTerminal || "no");
  let min = 45;
  if (tipo === "internacional") min = 90;
  if (tipo === "mixto") min = 120;
  if (aero === "grande") min += 20;
  if (cambio === "si") min += 30;
  const rec = min + 45;
  let riesgo = "Bajo";
  if (min < 75) riesgo = "Medio";
  if (min < 60) riesgo = "Alto";
  return { minutosMinimos: min, minutosRecomendados: rec, riesgo };
}
