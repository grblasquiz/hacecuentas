export interface Inputs {
  peso: number;
  sintoma: string;
  sensibilidad_digestiva: string;
  edad_grupo: string;
}

export interface Outputs {
  forma_recomendada: string;
  dosis_mg: number;
  dosis_comprimido_ref: string;
  biodisponibilidad: number;
  momento_toma: string;
  advertencia: string;
}

interface FormaInfo {
  nombre: string;
  biodisponibilidad: number; // 0-1
  porcentajeElemental: number; // fracción elemental en la sal
  momento: string;
  descripcion: string;
}

const FORMAS: Record<string, FormaInfo> = {
  sueno_ansiedad: {
    nombre: "Bisglicinato de magnesio (glicinato)",
    biodisponibilidad: 0.80,
    porcentajeElemental: 0.14,
    momento: "30–60 minutos antes de dormir",
    descripcion: "Mejor tolerancia digestiva, efecto relajante por la glicina asociada",
  },
  estreñimiento: {
    nombre: "Citrato de magnesio",
    biodisponibilidad: 0.65,
    porcentajeElemental: 0.162,
    momento: "Con la cena o antes de acostarse",
    descripcion: "Efecto osmótico suave en intestino, mejora el tránsito",
  },
  energia_fibro: {
    nombre: "Malato de magnesio",
    biodisponibilidad: 0.60,
    porcentajeElemental: 0.153,
    momento: "Con el desayuno o almuerzo",
    descripcion: "El malato participa en el ciclo de Krebs; favorece la producción de ATP",
  },
  cognicion: {
    nombre: "L-treonato de magnesio (MgT)",
    biodisponibilidad: 0.60,
    porcentajeElemental: 0.08,
    momento: "Con el desayuno o en dos tomas (mañana y noche)",
    descripcion: "Cruza la barrera hematoencefálica con mayor eficiencia; dosis de sal más alta",
  },
  general: {
    nombre: "Bisglicinato de magnesio (glicinato)",
    biodisponibilidad: 0.80,
    porcentajeElemental: 0.14,
    momento: "Con la cena o antes de dormir",
    descripcion: "Opción versátil con la mejor tolerancia y alta biodisponibilidad",
  },
};

// NIH UL suplementario: 350 mg/día adultos (magnesio elemental)
const DOSIS_MIN = 200;
const DOSIS_MAX = 400;
const DOSIS_MG_POR_KG = 4; // mg elemental por kg de peso

export function compute(i: Inputs): Outputs {
  const peso = Number(i.peso) || 0;
  const sintoma = i.sintoma || "general";
  const sensibilidad = i.sensibilidad_digestiva || "normal";
  const edadGrupo = i.edad_grupo || "adulto";

  if (peso <= 0 || peso > 300) {
    return {
      forma_recomendada: "Ingresá un peso válido (1–300 kg)",
      dosis_mg: 0,
      dosis_comprimido_ref: "",
      biodisponibilidad: 0,
      momento_toma: "",
      advertencia: "El peso ingresado no es válido.",
    };
  }

  // Calcular dosis base
  let dosisMg = Math.round(peso * DOSIS_MG_POR_KG);

  // Aplicar límites clínicos generales
  dosisMg = Math.max(DOSIS_MIN, Math.min(dosisMg, DOSIS_MAX));

  // Ajuste por grupo etario
  if (edadGrupo === "adolescente") {
    dosisMg = Math.min(dosisMg, 360);
  } else if (edadGrupo === "mayor") {
    dosisMg = Math.min(dosisMg, 320);
  }

  // Ajuste por sensibilidad digestiva
  // Reducir 25% para evitar efecto laxante y molestias
  if (sensibilidad === "sensible") {
    dosisMg = Math.round(dosisMg * 0.75);
    // Garantizar mínimo
    dosisMg = Math.max(dosisMg, 150);
  }

  // Si sensible + citrato, recomendar glicinato en su lugar
  let sintomaNormalizado = sintoma;
  if (sensibilidad === "sensible" && sintoma === "estreñimiento") {
    // El efecto laxante del citrato puede ser excesivo; igualmente lo mantenemos
    // pero reducimos la dosis ya ajustada arriba y avisamos
    sintomaNormalizado = "estreñimiento";
  }

  const formaInfo: FormaInfo = FORMAS[sintomaNormalizado] || FORMAS["general"];

  // Referencia de dosis del suplemento (sal)
  const dosisSalMg = Math.round(dosisMg / formaInfo.porcentajeElemental);
  let dosisComprimidoRef = "";

  if (sintomaNormalizado === "cognicion") {
    // L-treonato: la dosis de sal es alta; comercialmente se usan 1000–2000 mg de sal
    const dosisSalRef = Math.max(dosisSalMg, 1000);
    dosisComprimidoRef = `≈ ${dosisSalRef} mg/día de L-treonato de magnesio (sal) para aportar ~${dosisMg} mg elemental. Verificá la etiqueta de tu producto.`;
  } else {
    dosisComprimidoRef = `≈ ${dosisSalMg} mg/día de ${formaInfo.nombre} (peso de la sal) para aportar ${dosisMg} mg de magnesio elemental. Verificá la etiqueta de tu producto.`;
  }

  // Advertencias según contexto
  let advertencia = "Esta calculadora es orientativa. Consultá a un profesional de la salud antes de suplementar, especialmente si tomás medicamentos o tenés condiciones médicas crónicas.";
  if (sensibilidad === "sensible" && sintomaNormalizado === "estreñimiento") {
    advertencia = "Ojo: el citrato puede intensificar la sensibilidad digestiva. Empezá con la mitad de la dosis calculada. Si los síntomas empeoran, considerá el glicinato. " + advertencia;
  }
  if (edadGrupo === "mayor") {
    advertencia = "En adultos mayores, la función renal puede estar reducida. Confirmá con tu médico antes de iniciar suplementación. " + advertencia;
  }

  return {
    forma_recomendada: `${formaInfo.nombre} — ${formaInfo.descripcion}`,
    dosis_mg: dosisMg,
    dosis_comprimido_ref: dosisComprimidoRef,
    biodisponibilidad: formaInfo.biodisponibilidad,
    momento_toma: formaInfo.momento,
    advertencia,
  };
}
