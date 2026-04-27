export interface Inputs {
  horasPantalla: number;
  tipoTrabajo: string;
  pausasActuales: number;
  distanciaMonitor: number;
  usaFiltroAzul: string;
  sintomasActuales: string;
}

export interface Outputs {
  pausasMinimas: number;
  nivelRiesgo: string;
  pausasLargas: number;
  distanciaRecomendada: string;
  recomendacionFiltro: string;
  deficit: number;
  resumen: string;
}

export function compute(i: Inputs): Outputs {
  const horas = Math.max(0, Number(i.horasPantalla) || 0);
  const pausasActuales = Math.max(0, Math.floor(Number(i.pausasActuales) || 0));
  const distancia = Math.max(0, Number(i.distanciaMonitor) || 0);
  const tipoTrabajo = i.tipoTrabajo || "mixto";
  const usaFiltroAzul = i.usaFiltroAzul || "no";
  const sintomas = i.sintomasActuales || "ninguno";

  if (horas <= 0) {
    return {
      pausasMinimas: 0,
      nivelRiesgo: "Sin datos",
      pausasLargas: 0,
      distanciaRecomendada: "Ingresá las horas de uso diario",
      recomendacionFiltro: "Ingresá las horas de uso diario",
      deficit: 0,
      resumen: "Ingresá tus horas de uso diario para obtener recomendaciones.",
    };
  }

  // --- Regla 20-20-20 (AAO): 1 pausa cada 20 minutos ---
  const MINUTOS_ENTRE_PAUSAS = 20; // minutos
  const pausasMinimas = Math.floor((horas * 60) / MINUTOS_ENTRE_PAUSAS);

  // --- Pausas largas: 1 pausa de >=5 min cada 2 horas (NIOSH) ---
  const HORAS_ENTRE_PAUSAS_LARGAS = 2;
  const pausasLargas = Math.floor(horas / HORAS_ENTRE_PAUSAS_LARGAS);

  // --- Deficit de pausas ---
  const deficit = Math.max(0, pausasMinimas - pausasActuales);

  // --- Puntuacion de riesgo ---
  let riesgoScore = 0;

  // Horas de uso
  if (horas > 6) riesgoScore += 2;
  if (horas > 9) riesgoScore += 2;

  // Tipo de trabajo (mayor fijacion ocular = mayor riesgo)
  if (tipoTrabajo === "texto" || tipoTrabajo === "diseno") riesgoScore += 1;

  // Pausas insuficientes: si las pausas actuales son < 50% de las recomendadas
  if (pausasMinimas > 0 && pausasActuales < pausasMinimas * 0.5) riesgoScore += 2;

  // Distancia al monitor
  if (distancia > 0 && distancia < 50) riesgoScore += 2;

  // Filtro de luz azul
  if (usaFiltroAzul === "no") riesgoScore += 1;

  // Sintomas
  if (sintomas === "leve") riesgoScore += 2;
  if (sintomas === "moderado") riesgoScore += 4;
  if (sintomas === "severo") riesgoScore += 6;

  // Nivel de riesgo
  let nivelRiesgo: string;
  if (riesgoScore <= 3) {
    nivelRiesgo = "Bajo (score " + riesgoScore + ") — Hábitos adecuados";
  } else if (riesgoScore <= 6) {
    nivelRiesgo = "Moderado (score " + riesgoScore + ") — Incorporar pausas y ajustes";
  } else if (riesgoScore <= 10) {
    nivelRiesgo = "Alto (score " + riesgoScore + ") — Riesgo real de SVI; consultá un oftalmólogo";
  } else {
    nivelRiesgo = "Crítico (score " + riesgoScore + ") — Evaluación médica urgente";
  }

  // --- Distancia recomendada ---
  let distanciaRecomendada: string;
  if (tipoTrabajo === "texto" || tipoTrabajo === "diseno") {
    distanciaRecomendada = "60-70 cm (brazo extendido). Actualmente usás " + (distancia > 0 ? distancia + " cm" : "distancia no informada") + ".";
    if (distancia > 0 && distancia < 50) distanciaRecomendada += " ⚠️ Alejate al menos " + (60 - distancia) + " cm más.";
    else if (distancia > 0 && distancia >= 50 && distancia <= 70) distanciaRecomendada += " ✅ Distancia correcta.";
    else if (distancia > 70) distanciaRecomendada += " Podés acercarte un poco para lectura de texto fino.";
  } else if (tipoTrabajo === "video") {
    distanciaRecomendada = "60-80 cm recomendados para video. Actualmente usás " + (distancia > 0 ? distancia + " cm" : "distancia no informada") + ".";
    if (distancia > 0 && distancia < 50) distanciaRecomendada += " ⚠️ Alejate al menos " + (60 - distancia) + " cm más.";
    else if (distancia > 0 && distancia >= 50) distanciaRecomendada += " ✅ Distancia aceptable.";
  } else {
    // mixto
    distanciaRecomendada = "60-70 cm recomendados. Actualmente usás " + (distancia > 0 ? distancia + " cm" : "distancia no informada") + ".";
    if (distancia > 0 && distancia < 50) distanciaRecomendada += " ⚠️ Alejate al menos " + (60 - distancia) + " cm más.";
    else if (distancia > 0 && distancia >= 50 && distancia <= 70) distanciaRecomendada += " ✅ Distancia correcta.";
    else if (distancia > 70) distanciaRecomendada += " Levemente alejado; aceptable para uso mixto.";
  }

  // --- Recomendacion filtro luz azul ---
  let recomendacionFiltro: string;
  if (usaFiltroAzul === "si") {
    recomendacionFiltro = "✅ Bien. Mantené el filtro activo, especialmente 2 horas antes de dormir para proteger el ritmo circadiano.";
  } else if (usaFiltroAzul === "parcial") {
    recomendacionFiltro = "⚠️ Activá el filtro de luz azul o modo nocturno durante toda la jornada laboral, no solo de noche. Su beneficio principal sobre el sueño se logra evitando exposición ≥430 nm en las 2 h previas al descanso.";
  } else {
    if (horas >= 6) {
      recomendacionFiltro = "🔴 Con " + horas.toFixed(1) + " h/día de pantalla, se recomienda activar filtro de luz azul o modo nocturno. Los sistemas operativos modernos (Windows Night Light, macOS Night Shift, Android/iOS) lo ofrecen de forma gratuita.";
    } else {
      recomendacionFiltro = "Considerá activar el filtro de luz azul, especialmente en las 2 horas previas a dormir para no afectar la producción de melatonina.";
    }
  }

  // --- Resumen ---
  const pausasFaltantes = deficit > 0 ? "Te faltan incorporar " + deficit + " pausas por día. " : "Tus pausas actuales son suficientes. ";
  const consejo20 = "Cada 20 min mirá 6 m durante 20 seg. ";
  const consejoPausaLarga = pausasLargas > 0 ? "Tomate " + pausasLargas + " pausa" + (pausasLargas > 1 ? "s" : "") + " larga" + (pausasLargas > 1 ? "s" : "") + " de 5+ min en tu jornada. " : "";
  const avisoMedico = (sintomas === "severo" || riesgoScore > 10) ? "⚠️ Consultá un oftalmólogo ante los síntomas que describís." : "";

  const resumen = pausasFaltantes + consejo20 + consejoPausaLarga + avisoMedico;

  return {
    pausasMinimas,
    nivelRiesgo,
    pausasLargas,
    distanciaRecomendada,
    recomendacionFiltro,
    deficit,
    resumen: resumen.trim(),
  };
}
