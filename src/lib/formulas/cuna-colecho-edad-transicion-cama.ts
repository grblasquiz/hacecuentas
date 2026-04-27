export interface Inputs {
  edadMeses: number;
  intentaTrepar: string;
  alturaBarrote: number;
  hermanoPorVenir: string;
  senalesListo: string;
  dormidorSolo: string;
  cambioReciente: string;
}

export interface Outputs {
  recomendacion: string;
  nivelUrgencia: string;
  score: number;
  pasos: string;
  tipoCama: string;
}

export function compute(i: Inputs): Outputs {
  const edadMeses = Math.max(0, Math.round(Number(i.edadMeses) || 0));
  const intentaTrepar = i.intentaTrepar || "no";
  const alturaBarrote = Math.max(0, Number(i.alturaBarrote) || 66);
  const hermanoPorVenir = i.hermanoPorVenir || "no";
  const senalesListo = i.senalesListo || "no";
  const dormidorSolo = i.dormidorSolo || "aveces";
  const cambioReciente = i.cambioReciente || "no";

  if (edadMeses < 1) {
    return {
      recomendacion: "Ingresá la edad del niño en meses para obtener una recomendación.",
      nivelUrgencia: "—",
      score: 0,
      pasos: "—",
      tipoCama: "—",
    };
  }

  // --- Puntaje por edad (max 25 pts) ---
  let puntajeEdad = 0;
  if (edadMeses < 18) {
    puntajeEdad = 0;
  } else if (edadMeses < 24) {
    puntajeEdad = 10;
  } else if (edadMeses < 36) {
    puntajeEdad = 20;
  } else {
    puntajeEdad = 25;
  }

  // --- Puntaje por intento de trepar (max 25 pts) ---
  // Fuente: AAP - riesgo de caída cuando el niño alcanza la altura del barrandal
  let puntajeTrepar = 0;
  if (intentaTrepar === "si") {
    puntajeTrepar = 25;
  } else if (intentaTrepar === "aveces") {
    puntajeTrepar = 15;
  } else {
    puntajeTrepar = 0;
  }

  // --- Puntaje por señales de interés/solicitud (max 20 pts) ---
  let puntajeInteres = 0;
  if (senalesListo === "si") {
    puntajeInteres = 20;
  } else if (senalesListo === "aveces") {
    puntajeInteres = 10;
  } else {
    puntajeInteres = 0;
  }

  // --- Puntaje por autonomía para dormir (max 15 pts) ---
  let puntajeAutonomia = 0;
  if (dormidorSolo === "si") {
    puntajeAutonomia = 15;
  } else if (dormidorSolo === "aveces") {
    puntajeAutonomia = 8;
  } else {
    puntajeAutonomia = 0;
  }

  // --- Puntaje por hermano por venir (max 10 pts) ---
  let puntajeHermano = 0;
  if (hermanoPorVenir === "si_pronto") {
    puntajeHermano = 10;
  } else if (hermanoPorVenir === "si_despues") {
    puntajeHermano = 7;
  } else {
    puntajeHermano = 0;
  }

  // --- Puntaje por estabilidad del entorno (max 5 pts) ---
  const puntajeEstabilidad = cambioReciente === "no" ? 5 : 0;

  const score = Math.min(
    100,
    puntajeEdad +
      puntajeTrepar +
      puntajeInteres +
      puntajeAutonomia +
      puntajeHermano +
      puntajeEstabilidad
  );

  // --- Detección de urgencia de seguridad ---
  // AAP: distancia barrandal-colchón < 66 cm con intento de trepar = riesgo inmediato
  const riesgoSeguridad =
    intentaTrepar === "si" && alturaBarrote < 66;
  const riesgoAltura = intentaTrepar === "si" && alturaBarrote >= 66;
  const urgenciaTrepar = intentaTrepar === "si";

  // --- Nivel de urgencia ---
  let nivelUrgencia: string;
  if (edadMeses < 18 && !urgenciaTrepar) {
    nivelUrgencia = "🟢 Sin urgencia — aún es muy temprano";
  } else if (riesgoSeguridad) {
    nivelUrgencia = "🔴 URGENTE — riesgo de caída inminente (barrandal bajo + trepada)";
  } else if (urgenciaTrepar) {
    nivelUrgencia = "🟠 Alta — el niño ya trepa, transición próxima recomendada";
  } else if (hermanoPorVenir === "si_pronto") {
    nivelUrgencia = "🟠 Alta — nuevo bebé en menos de 3 meses";
  } else if (score >= 60) {
    nivelUrgencia = "🟡 Moderada — varios indicadores positivos";
  } else {
    nivelUrgencia = "🟢 Baja — puede esperar más tiempo";
  }

  // --- Recomendación principal ---
  let recomendacion: string;
  if (edadMeses < 18 && !urgenciaTrepar) {
    recomendacion =
      "Todavía es pronto. Los menores de 18 meses generalmente no están listos para la cama. Mantené la cuna y revisá en algunos meses.";
  } else if (riesgoSeguridad) {
    recomendacion =
      "Transición INMEDIATA recomendada por seguridad. El niño ya intenta trepar y el barrandal tiene menos de 66 cm de altura, lo que representa un riesgo real de caída grave. Pasá a cama de transición esta semana.";
  } else if (urgenciaTrepar && alturaBarrote >= 66) {
    recomendacion =
      "El niño ya intenta trepar la cuna. Aunque el barrandal es alto, el riesgo aumenta con el tiempo. Planificá la transición en las próximas 2-4 semanas.";
  } else if (score >= 75) {
    recomendacion =
      "El niño muestra señales claras de preparación. Es un muy buen momento para iniciar la transición. Planificalo para las próximas 1-3 semanas.";
  } else if (score >= 50) {
    recomendacion =
      "Hay señales positivas pero también factores que sugieren esperar un poco. Podés empezar a preparar el entorno y hacer la transición en 4-8 semanas, cuando el contexto sea más estable.";
  } else if (hermanoPorVenir === "si_pronto") {
    recomendacion =
      "Aunque el niño no muestra todas las señales de preparación, la llegada del nuevo bebé en menos de 3 meses requiere planificar la transición pronto. Intentá hacerla al menos 6 semanas antes del nacimiento.";
  } else {
    recomendacion =
      "El niño no muestra señales claras de preparación todavía. No hay urgencia. Revisá en 4-8 semanas o cuando aparezcan nuevas señales.";
  }

  // --- Tipo de cama sugerido ---
  let tipoCama: string;
  if (edadMeses < 36) {
    tipoCama =
      "Cama de transición toddler (baja, con baranda lateral) o cuna convertible. Colchón a nivel del suelo es otra opción segura.";
  } else if (edadMeses < 48) {
    tipoCama =
      "Cama individual (twin/plaza) baja con baranda lateral desmontable, o cama de transición toddler si el niño es pequeño.";
  } else {
    tipoCama =
      "Cama individual (twin/plaza) estándar con baranda lateral opcional. Ya puede usarse sin limitaciones de tamaño.";
  }

  // --- Pasos de transición ---
  const pasosArray: string[] = [];

  if (cambioReciente === "si") {
    pasosArray.push(
      "1. Esperá a que el entorno se estabilice si es posible (al menos 2-4 semanas tras el cambio reciente) antes de iniciar la transición."
    );
  } else {
    pasosArray.push("1. Elegí un momento sin otros cambios grandes en la rutina familiar.");
  }

  pasosArray.push(
    "2. Involucrar al niño: llevalo a elegir la cama o la ropa de cama. Generá entusiasmo como un logro de 'niño grande'."
  );
  pasosArray.push(
    "3. Presentá la cama nueva durante el día para jugar antes de usarla para dormir."
  );
  pasosArray.push(
    "4. Mantenés exactamente la misma rutina previa al sueño (baño, cuento, mismo horario, mismos peluches)."
  );
  pasosArray.push(
    "5. Asegurá el cuarto: baranda lateral en la cama, protectores en escaleras, sin objetos peligrosos al alcance nocturno."
  );

  if (dormidorSolo === "no") {
    pasosArray.push(
      "6. Como el niño requiere acompañamiento para dormir, trabajá gradualmente la autonomía: silla junto a la cama y alejate de a poco noche a noche."
    );
  } else {
    pasosArray.push(
      "6. Las primeras noches, chequeá brevemente cuando esté en la cama nueva para generar confianza. Evitá interacciones largas si se levanta."
    );
  }

  if (hermanoPorVenir !== "no") {
    pasosArray.push(
      "7. Completá la transición al menos 6 semanas antes de la llegada del nuevo bebé para que no asocie el cambio con el hermanito."
    );
  }

  pasosArray.push(
    "Extra: Si el niño sale de la cama repetidamente, devolvelo calmadamente y sin mucha interacción. La consistencia en las primeras 1-3 semanas es clave."
  );

  const pasos = pasosArray.join("\n");

  return {
    recomendacion,
    nivelUrgencia,
    score,
    pasos,
    tipoCama,
  };
}
