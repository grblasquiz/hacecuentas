export interface Inputs {
  peso: number;
  tamano: string;
  condicion: string;
}

export interface Outputs {
  glucosamina_mg: number;
  condroitina_mg: number;
  omega3_mg: number;
  antioxidante_vit_e: number;
  resumen: string;
}

// Dosis base de glucosamina por condición (mg/kg/día)
// Fuente: Veterinary Nutraceutical Council / WSAVA 2024
const GLUC_DOSIS: Record<string, number> = {
  preventivo: 15,
  articular: 22,
  cognitivo: 15,
  mixto: 22,
};

// Dosis base de omega-3 EPA+DHA por condición (mg/kg/día)
// Fuente: Vet Clinics of North America 2021 / WSAVA 2024
const OMEGA3_DOSIS: Record<string, number> = {
  preventivo: 50,
  articular: 60,
  cognitivo: 75,
  mixto: 75,
};

// Tope máximo omega-3 por condición (mg/día)
const OMEGA3_MAX: Record<string, number> = {
  preventivo: 2000,
  articular: 3000,
  cognitivo: 3500,
  mixto: 3500,
};

// Vitamina E según rango de peso (UI/día)
function vitEBase(peso: number): number {
  if (peso < 10) return 100;
  if (peso <= 25) return 200;
  if (peso <= 45) return 400;
  return 600;
}

export function compute(i: Inputs): Outputs {
  const peso = Number(i.peso) || 0;
  const tamano = i.tamano || "grande";
  const condicion = i.condicion || "articular";

  if (peso <= 0) {
    return {
      glucosamina_mg: 0,
      condroitina_mg: 0,
      omega3_mg: 0,
      antioxidante_vit_e: 0,
      resumen: "Ingresá un peso válido para obtener las dosis.",
    };
  }

  // Glucosamina
  const dosisGluc = GLUC_DOSIS[condicion] ?? 15;
  const glucosamina_mg = Math.round(peso * dosisGluc);

  // Condroitina: relación 1:0.8 respecto a glucosamina
  const condroitina_mg = Math.round(glucosamina_mg * 0.8);

  // Omega-3 EPA+DHA con tope máximo
  const dosisOmega = OMEGA3_DOSIS[condicion] ?? 50;
  const maxOmega = OMEGA3_MAX[condicion] ?? 2000;
  const omega3_raw = peso * dosisOmega;
  const omega3_mg = Math.round(Math.min(omega3_raw, maxOmega));

  // Vitamina E base + 25% en condición cognitiva o mixta
  const vitEBruta = vitEBase(peso);
  const factorCognitivo = condicion === "cognitivo" || condicion === "mixto" ? 1.25 : 1.0;
  const antioxidante_vit_e = Math.round(vitEBruta * factorCognitivo);

  // Etiquetas legibles
  const condicionLabel: Record<string, string> = {
    preventivo: "preventivo",
    articular: "soporte articular (artrosis)",
    cognitivo: "soporte cognitivo (CDS)",
    mixto: "soporte articular y cognitivo",
  };
  const tamanoLabel: Record<string, string> = {
    pequeno: "pequeño",
    mediano: "mediano",
    grande: "grande",
    gigante: "gigante",
  };

  // Nota sobre tope omega-3
  const omegaTope = omega3_raw > maxOmega
    ? ` (dosis calculada ${Math.round(omega3_raw)} mg, limitada al máximo seguro de ${maxOmega} mg)`
    : "";

  const resumen =
    `Perro ${tamanoLabel[tamano] ?? tamano} de ${peso} kg — régimen ${condicionLabel[condicion] ?? condicion}.\n` +
    `• Glucosamina: ${glucosamina_mg} mg/día (${dosisGluc} mg/kg)\n` +
    `• Condroitina: ${condroitina_mg} mg/día (relación 1:0,8 con glucosamina)\n` +
    `• Omega-3 EPA+DHA: ${omega3_mg} mg/día${omegaTope}\n` +
    `• Vitamina E: ${antioxidante_vit_e} UI/día${factorCognitivo > 1 ? " (+25% por componente cognitivo)" : ""}\n` +
    `Administrar con la comida principal. Consultar al veterinario antes de iniciar si el perro tiene enfermedad renal, hepática o toma anticoagulantes.`;

  return {
    glucosamina_mg,
    condroitina_mg,
    omega3_mg,
    antioxidante_vit_e,
    resumen,
  };
}
