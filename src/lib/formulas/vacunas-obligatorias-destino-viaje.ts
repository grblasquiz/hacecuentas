/**
 * Calculadora Vacunas por Destino
 */
export interface VacunasObligatoriasDestinoViajeInputs {
  region: string;
  ruralOUrbano: string;
  duracion: string;
}
export interface VacunasObligatoriasDestinoViajeOutputs {
  vacunasObligatorias: string;
  vacunasRecomendadas: string;
  cuandoAplicar: string;
}
export function vacunasObligatoriasDestinoViaje(i: VacunasObligatoriasDestinoViajeInputs): VacunasObligatoriasDestinoViajeOutputs {
  const region = String(i.region || "");
  const rural = String(i.ruralOUrbano || "urbano") === "rural";
  const larga = String(i.duracion || "menos-mes") === "mas-mes";
  let obligatorias = "Ninguna específica";
  let recomendadas = "Tétanos al día";
  if (region === "africa-subsahariana") {
    obligatorias = "Fiebre amarilla (34 países)";
    recomendadas = "Hepatitis A/B, tifoidea, rabia, meningitis ACYW, cólera";
  } else if (region === "sudamerica-tropical") {
    obligatorias = "Fiebre amarilla (Amazonia)";
    recomendadas = "Hepatitis A/B, tifoidea";
  } else if (region === "asia-sudeste") {
    obligatorias = "Ninguna obligatoria (excepto Indonesia Yellow Fever desde países endémicos)";
    recomendadas = "Hepatitis A/B, tifoidea, encefalitis japonesa si rural";
  } else if (region === "medio-oriente") {
    obligatorias = "Meningitis ACYW (Arabia Saudita Hayy/Umrah)";
    recomendadas = "Hepatitis A/B, tifoidea, polio";
  }
  if (rural || larga) {
    recomendadas += ", rabia (zona rural/larga duración)";
  }
  return {
    vacunasObligatorias: obligatorias,
    vacunasRecomendadas: recomendadas,
    cuandoAplicar: "Empezar 4-6 semanas antes. Fiebre amarilla MÍNIMO 10 días antes."
  };
}
