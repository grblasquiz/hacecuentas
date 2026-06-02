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
  _insight?: any;
  _chart?: any;
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

  const tone = riesgo === "Alto" ? "warn" : riesgo === "Medio" ? "neutral" : "good";
  const _insight = {
    title: "Tu margen de conexión",
    text: `Necesitás al menos **${min} min** entre vuelos; lo recomendable es dejar **${rec} min** de colchón. Con ${min} minutos el riesgo de perder el enlace es **${riesgo.toLowerCase()}**.`,
    tone,
    icon: "✈️",
  };
  const topMax = Math.max(180, min + 30);
  const _chart = {
    type: "scale",
    marker: min,
    markerLabel: "Mínimo",
    min: 0,
    segments: [
      { nombre: "Riesgo alto", max: 60, color: "#ef4444", colorDark: "#f87171" },
      { nombre: "Riesgo medio", max: 75, color: "#eab308", colorDark: "#facc15" },
      { nombre: "Riesgo bajo", max: topMax, color: "#22c55e", colorDark: "#4ade80" },
    ],
    ariaLabel: `El tiempo mínimo de conexión es de ${min} minutos, con riesgo ${riesgo.toLowerCase()} de perder el vuelo`,
  };
  return { minutosMinimos: min, minutosRecomendados: rec, riesgo, _insight, _chart };
}
