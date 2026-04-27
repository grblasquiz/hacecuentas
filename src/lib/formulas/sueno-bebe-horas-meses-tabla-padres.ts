export interface Inputs {
  unidad: string;
  edad: number;
}

export interface Outputs {
  rangoTotal: string;
  suenoNocturno: string;
  suenoDiurno: string;
  cantidadSiestas: string;
  ventanaDespierto: string;
  etapa: string;
  consejo: string;
}

interface SleepStage {
  label: string;
  totalMin: number;
  totalMax: number;
  noctMin: number;
  noctMax: number;
  siestas: string;
  ventana: string;
  consejo: string;
}

// Fuente: AAP / National Sleep Foundation 2022-2023
const STAGES: SleepStage[] = [
  {
    label: "Recién nacido (0-4 semanas)",
    totalMin: 14, totalMax: 17,
    noctMin: 8, noctMax: 9,
    siestas: "4-5 siestas cortas (30-60 min c/u)",
    ventana: "45-60 minutos",
    consejo: "El sueño es fragmentado por naturaleza. Dormirá en ciclos de 2-4 horas incluyendo de noche. La alimentación a demanda regula el ritmo."
  },
  {
    label: "1-3 meses",
    totalMin: 14, totalMax: 17,
    noctMin: 8, noctMax: 10,
    siestas: "3-5 siestas (30-120 min c/u)",
    ventana: "60-90 minutos",
    consejo: "Empezá a notar señales de sueño: frotarse los ojos, bostezo, mirada perdida. Actuá rápido: la ventana de vigilia es corta."
  },
  {
    label: "4-6 meses",
    totalMin: 12, totalMax: 15,
    noctMin: 10, noctMax: 12,
    siestas: "3 siestas (mañana, mediodía, tarde)",
    ventana: "1.5-2 horas",
    consejo: "Etapa clave para consolidar el sueño nocturno. Podés empezar rutinas: baño, pecho/biberón, cuna. A los 4 meses ocurre la primera gran regresión del sueño."
  },
  {
    label: "7-9 meses",
    totalMin: 12, totalMax: 15,
    noctMin: 10, noctMax: 12,
    siestas: "2-3 siestas",
    ventana: "2-3 horas",
    consejo: "Muchos bebés pasan de 3 a 2 siestas alrededor de los 7-8 meses. La angustia de separación puede causar despertares nocturnos: es normal y temporal."
  },
  {
    label: "10-12 meses",
    totalMin: 12, totalMax: 14,
    noctMin: 10, noctMax: 12,
    siestas: "2 siestas (mañana y tarde)",
    ventana: "3-4 horas",
    consejo: "La mayoría ya duerme 2 siestas definidas. Regresión habitual a los 12 meses con el salto de desarrollo motor (primeros pasos). No adelantes el paso a 1 siesta antes de los 14-15 meses."
  },
  {
    label: "13-18 meses",
    totalMin: 11, totalMax: 14,
    noctMin: 10, noctMax: 12,
    siestas: "1-2 siestas (transición en curso)",
    ventana: "4-5 horas",
    consejo: "Período de transición a 1 siesta. Si resiste una de las dos o le cuesta dormir de noche, probá adelantar la única siesta al mediodía (12:00-13:00)."
  },
  {
    label: "19-24 meses",
    totalMin: 11, totalMax: 14,
    noctMin: 10, noctMax: 12,
    siestas: "1 siesta (después del almuerzo)",
    ventana: "5-6 horas",
    consejo: "1 siesta de 1-2 horas después del almuerzo. Mantené un horario de cama nocturna estable entre las 19:30 y 21:00 para aprovechar la presión de sueño."
  }
];

function getStageByWeeks(weeks: number): SleepStage | null {
  if (weeks < 0 || weeks > 4) return null;
  return STAGES[0];
}

function getStageByMonths(months: number): SleepStage | null {
  if (months < 0) return null;
  if (months < 1) return STAGES[0];   // tratar 0 meses como recién nacido
  if (months <= 3) return STAGES[1];
  if (months <= 6) return STAGES[2];
  if (months <= 9) return STAGES[3];
  if (months <= 12) return STAGES[4];
  if (months <= 18) return STAGES[5];
  if (months <= 24) return STAGES[6];
  return null;
}

export function compute(i: Inputs): Outputs {
  const unidad = i.unidad === "semanas" ? "semanas" : "meses";
  const edad = Math.floor(Number(i.edad) || 0);

  if (edad < 0) {
    return {
      rangoTotal: "Edad inválida",
      suenoNocturno: "-",
      suenoDiurno: "-",
      cantidadSiestas: "-",
      ventanaDespierto: "-",
      etapa: "-",
      consejo: "Ingresá una edad válida."
    };
  }

  let stage: SleepStage | null = null;

  if (unidad === "semanas") {
    if (edad > 52) {
      return {
        rangoTotal: "Rango no disponible",
        suenoNocturno: "-",
        suenoDiurno: "-",
        cantidadSiestas: "-",
        ventanaDespierto: "-",
        etapa: "Edad fuera de rango (máx. 52 semanas en este modo)",
        consejo: "Usá el modo meses para edades superiores a 12 meses."
      };
    }
    // Convertir semanas a meses aproximados para asignar etapa
    const mesesAprox = edad / 4.33;
    if (edad <= 4) {
      stage = STAGES[0];
    } else {
      stage = getStageByMonths(mesesAprox);
    }
  } else {
    if (edad > 24) {
      return {
        rangoTotal: "Rango no disponible",
        suenoNocturno: "-",
        suenoDiurno: "-",
        cantidadSiestas: "-",
        ventanaDespierto: "-",
        etapa: "Esta calculadora cubre de 0 a 24 meses",
        consejo: "Para niños de más de 2 años, los preescolares (3-5 años) necesitan 10-13 horas y los escolares (6-12 años) 9-11 horas según la NSF."
      };
    }
    stage = getStageByMonths(edad);
  }

  if (!stage) {
    return {
      rangoTotal: "Sin datos para esta edad",
      suenoNocturno: "-",
      suenoDiurno: "-",
      cantidadSiestas: "-",
      ventanaDespierto: "-",
      etapa: "-",
      consejo: "Revisá la edad ingresada."
    };
  }

  const diurnoMin = stage.totalMin - stage.noctMax;
  const diurnoMax = stage.totalMax - stage.noctMin;

  return {
    rangoTotal: `${stage.totalMin}-${stage.totalMax} horas por día`,
    suenoNocturno: `${stage.noctMin}-${stage.noctMax} horas`,
    suenoDiurno: `${diurnoMin < 0 ? 0 : diurnoMin}-${diurnoMax} horas`,
    cantidadSiestas: stage.siestas,
    ventanaDespierto: stage.ventana,
    etapa: stage.label,
    consejo: stage.consejo
  };
}
