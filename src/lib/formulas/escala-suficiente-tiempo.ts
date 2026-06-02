/**
 * Calculadora de Escala Suficiente
 */
export interface EscalaSuficienteTiempoInputs {
  duracionEscala: number;
  tipoConexion: string;
  aeropuertoComplejo: string;
}
export interface EscalaSuficienteTiempoOutputs {
  semaforo: string;
  margenMinutos: number;
  consejo: string;
  _insight?: any;
  _chart?: any;
}
export function escalaSuficienteTiempo(i: EscalaSuficienteTiempoInputs): EscalaSuficienteTiempoOutputs {
  const dur = Number(i.duracionEscala);
  if (!dur || dur <= 0) throw new Error("Ingresá duración válida");
  const tipo = String(i.tipoConexion || "internacional");
  const complejo = String(i.aeropuertoComplejo || "no") === "si";
  let minimo = 45;
  if (tipo === "internacional") minimo = 90;
  if (tipo === "mixto") minimo = 120;
  if (complejo) minimo += 20;
  const margen = dur - minimo;
  let semaforo = "Verde - Cómodo";
  let consejo = "Tenés tiempo de sobra.";
  if (margen < 0) { semaforo = "Rojo - Riesgoso"; consejo = "No alcanza el mínimo. Buscá otra opción."; }
  else if (margen < 30) { semaforo = "Amarillo - Ajustado"; consejo = "Justo. Si hay retraso, podés perder conexión."; }

  // --- Insight narrativo ---
  let insightText: string;
  let insightTone: "good" | "warn" | "neutral";
  let insightIcon: string;
  if (margen < 0) {
    insightText = `Tu escala de **${dur} min** queda **${Math.abs(margen)} min por debajo** del mínimo recomendado (**${minimo} min**) para esta conexión. Es arriesgada: cualquier demora te hace perder el vuelo.`;
    insightTone = "warn";
    insightIcon = "🔴";
  } else if (margen < 30) {
    insightText = `Tenés **${dur} min**, apenas **${margen} min** sobre el mínimo de **${minimo} min**. Es viable pero ajustado: con un retraso del primer vuelo podés perder la conexión.`;
    insightTone = "warn";
    insightIcon = "🟡";
  } else {
    insightText = `Con **${dur} min** te sobran **${margen} min** sobre el mínimo de **${minimo} min**. Margen cómodo para recoger equipaje, cambiar de terminal y hasta comer algo.`;
    insightTone = "good";
    insightIcon = "🟢";
  }
  const _insight = {
    title: "¿Te alcanza el tiempo?",
    text: insightText,
    tone: insightTone,
    icon: insightIcon,
  };

  // --- Gráfico: la escala cae en zona roja/amarilla/verde ---
  const _chart = {
    type: "scale",
    marker: dur,
    markerLabel: `${dur} min`,
    min: 0,
    segments: [
      { nombre: "Riesgoso", max: minimo, color: "#dc2626", colorDark: "#b91c1c" },
      { nombre: "Ajustado", max: minimo + 30, color: "#eab308", colorDark: "#ca8a04" },
      { nombre: "Cómodo", max: Math.max(minimo + 90, dur + 15), color: "#22c55e", colorDark: "#16a34a" },
    ],
    ariaLabel: `Escala de ${dur} minutos frente al mínimo de ${minimo} minutos: zona ${semaforo}.`,
  };

  return { semaforo, margenMinutos: margen, consejo, _insight, _chart };
}
