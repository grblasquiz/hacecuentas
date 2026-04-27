export interface Inputs {
  nivel: number;
  unidad: string;
  edad: number;
  peso: number;
  embarazo: string;
}

export interface Outputs {
  categoria: string;
  nivelNgMl: number;
  dosisDiariaUI: number;
  duracionSemanas: number;
  retest: string;
  observaciones: string;
}

// Umbrales según Endocrine Society Clinical Practice Guideline 2024
const UMBRAL_DEFICIENCIA_SEVERA = 12;   // ng/mL
const UMBRAL_DEFICIENCIA = 20;           // ng/mL
const UMBRAL_INSUFICIENCIA = 30;         // ng/mL
const UMBRAL_TOXICIDAD = 100;            // ng/mL

// Factor conversión nmol/L → ng/mL
const NMOL_L_TO_NG_ML = 0.4006;

// RDA de mantenimiento (IoM / Endocrine Society 2024)
const RDA_ADULTO = 600;          // UI/día, 1–70 años
const RDA_MAYOR_70 = 800;        // UI/día, >70 años
const RDA_EMBARAZO = 600;        // UI/día

// Umbral de peso para ajuste de dosis (distribución en tejido adiposo)
const PESO_AJUSTE = 100;         // kg

export function compute(i: Inputs): Outputs {
  const nivel = Number(i.nivel);
  const edad = Number(i.edad) || 0;
  const peso = Number(i.peso) || 0;
  const unidad = i.unidad || "ng_ml";
  const embarazo = i.embarazo || "no";

  // Validaciones básicas
  if (!nivel || nivel <= 0) {
    return {
      categoria: "Dato inválido",
      nivelNgMl: 0,
      dosisDiariaUI: 0,
      duracionSemanas: 0,
      retest: "—",
      observaciones: "Ingresá un nivel sérico válido mayor a 0.",
    };
  }
  if (edad <= 0 || edad > 120) {
    return {
      categoria: "Dato inválido",
      nivelNgMl: 0,
      dosisDiariaUI: 0,
      duracionSemanas: 0,
      retest: "—",
      observaciones: "Ingresá una edad válida entre 1 y 120 años.",
    };
  }
  if (peso <= 0 || peso > 500) {
    return {
      categoria: "Dato inválido",
      nivelNgMl: 0,
      dosisDiariaUI: 0,
      duracionSemanas: 0,
      retest: "—",
      observaciones: "Ingresá un peso válido entre 1 y 500 kg.",
    };
  }

  // Conversión de unidades a ng/mL
  const nivelNgMl: number =
    unidad === "nmol_l" ? nivel * NMOL_L_TO_NG_ML : nivel;

  const pesoAlto = peso >= PESO_AJUSTE;
  const mayorDe70 = edad > 70;
  const esEmbarazoLactancia = embarazo === "embarazo" || embarazo === "lactancia";

  let categoria: string;
  let dosisDiariaUI: number;
  let duracionSemanas: number;
  let retest: string;
  let observaciones: string;

  if (nivelNgMl > UMBRAL_TOXICIDAD) {
    // Nivel tóxico
    categoria = "Posible toxicidad (>100 ng/mL)";
    dosisDiariaUI = 0;
    duracionSemanas = 0;
    retest = "Inmediatamente — consultar médico";
    observaciones =
      "Nivel superior a 100 ng/mL. Suspendé la suplementación y consultá a tu médico de inmediato para descartar hipercalcemia. No tomes vitamina D adicional hasta nueva indicación.";
  } else if (nivelNgMl >= UMBRAL_INSUFICIENCIA) {
    // Suficiencia — solo mantenimiento
    categoria = "Suficiente (30–100 ng/mL)";
    let rdaBase: number;
    if (esEmbarazoLactancia) {
      rdaBase = RDA_EMBARAZO;
    } else if (mayorDe70) {
      rdaBase = RDA_MAYOR_70;
    } else {
      rdaBase = RDA_ADULTO;
    }
    // Personas con peso alto pueden necesitar algo más para mantener
    dosisDiariaUI = pesoAlto ? rdaBase + 200 : rdaBase;
    duracionSemanas = 0; // mantenimiento indefinido
    retest = "Control anual (o cada 6 meses en >70 años)";
    observaciones =
      "Tu nivel es adecuado. La dosis indicada es de mantenimiento según la RDA para tu grupo de edad. Controlá el nivel cada año."
      + (pesoAlto ? " Se aplicó un ajuste leve por peso corporal ≥100 kg." : "");
  } else if (nivelNgMl >= UMBRAL_DEFICIENCIA) {
    // Insuficiencia: 20–<30 ng/mL
    categoria = "Insuficiente (20–29 ng/mL)";
    let base = pesoAlto ? 3000 : 2000;
    // Adultos mayores: incremento del 20 %
    if (mayorDe70) {
      base = Math.round(base * 1.2);
    }
    dosisDiariaUI = base;
    duracionSemanas = 12;
    retest = "A las 12–14 semanas de iniciado el tratamiento";
    observaciones =
      "Insuficiencia leve-moderada. Se recomienda " + base + " UI/día durante 12 semanas y luego retest. Tomá la vitamina D con la comida más grasa del día para mejorar la absorción."
      + (esEmbarazoLactancia
        ? " ⚠️ Embarazo / lactancia: la dosis de tratamiento requiere supervisión médica obligatoria."
        : "")
      + (mayorDe70 ? " Dosis aumentada un 20 % por edad mayor a 70 años." : "");
  } else if (nivelNgMl >= UMBRAL_DEFICIENCIA_SEVERA) {
    // Deficiencia: 12–<20 ng/mL
    categoria = "Deficiencia (12–19 ng/mL)";
    let base = pesoAlto ? 7000 : 5000;
    if (mayorDe70) {
      base = Math.round(base * 1.2);
    }
    dosisDiariaUI = base;
    duracionSemanas = 8;
    retest = "A las 8–10 semanas de iniciado el tratamiento";
    observaciones =
      "Deficiencia de vitamina D. Se recomienda " + base + " UI/día durante 8 semanas y luego retest para ajustar la dosis de mantenimiento. Tomá la suplementación con alimentos grasos."
      + (esEmbarazoLactancia
        ? " ⚠️ Embarazo / lactancia: la dosis de tratamiento requiere supervisión médica obligatoria."
        : "")
      + (mayorDe70 ? " Dosis aumentada un 20 % por edad mayor a 70 años." : "")
      + (pesoAlto ? " Ajuste por peso corporal ≥100 kg aplicado." : "");
  } else {
    // Deficiencia severa: <12 ng/mL
    categoria = "Deficiencia severa (<12 ng/mL)";
    let base = pesoAlto ? 10000 : 6000;
    if (mayorDe70) {
      base = Math.round(base * 1.2);
    }
    dosisDiariaUI = base;
    duracionSemanas = 8;
    retest = "A las 8 semanas — consultar médico";
    observaciones =
      "Deficiencia severa. Se recomienda " + base + " UI/día durante 8 semanas bajo supervisión médica. A este nivel es importante descartar causas secundarias (malabsorción, enfermedad renal, etc.). No automediques dosis mayores a 6000 UI/día sin indicación profesional."
      + (esEmbarazoLactancia
        ? " ⚠️ Embarazo / lactancia: la dosis requiere supervisión médica obligatoria."
        : "")
      + (pesoAlto ? " Ajuste por peso corporal ≥100 kg aplicado." : "");
  }

  return {
    categoria,
    nivelNgMl: Math.round(nivelNgMl * 100) / 100,
    dosisDiariaUI,
    duracionSemanas,
    retest,
    observaciones,
  };
}
