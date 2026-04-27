export interface Inputs {
  objetivo: string;
  presupuesto_usd: number;
  nivel_ingles: string;
  tipo_cambio: number;
}

export interface Outputs {
  examen_recomendado: string;
  costo_usd: number;
  costo_ars: number;
  valido_para: string;
  alternativa: string;
  advertencia: string;
}

// Costos de referencia 2026 (USD)
const COSTO_CAE = 350;
const COSTO_IELTS = 300;
const COSTO_TOEFL = 300;
const COSTO_DUOLINGO = 60;

interface ExamenInfo {
  nombre: string;
  costo_usd: number;
  valido_para: string;
  advertencia: string;
}

const EXAMENES: Record<string, ExamenInfo> = {
  cae: {
    nombre: "CAE Cambridge C1 Advanced",
    costo_usd: COSTO_CAE,
    valido_para: "Universidades UK, Australia, Irlanda, Canadá, EE.UU. Vigencia permanente (no vence).",
    advertencia: "Es el más caro pero no tiene vencimiento. Requiere nivel C1 consolidado.",
  },
  ielts: {
    nombre: "IELTS Academic",
    costo_usd: COSTO_IELTS,
    valido_para: "Universidades UK / AUS / IRL / Canadá / EE.UU., visas UK, visa australiana. Vigencia 2 años.",
    advertencia: "Mayor cobertura universal. Obligatorio para visas UK (IELTS for UKVI). Vigencia 2 años.",
  },
  toefl: {
    nombre: "TOEFL iBT",
    costo_usd: COSTO_TOEFL,
    valido_para: "Universidades EE.UU. y Canadá (preferido), Europa, algunas UK. Vigencia 2 años.",
    advertencia: "Formato 100% online. No válido para visas UK. Vigencia 2 años.",
  },
  duolingo: {
    nombre: "Duolingo English Test",
    costo_usd: COSTO_DUOLINGO,
    valido_para: "Más de 5.000 instituciones y empresas tech. Se rinde desde casa. Vigencia 2 años.",
    advertencia: "NO válido para visas (UK, EE.UU., Australia, Canadá). No aceptado por universidades de alto ranking que exigen examen presencial.",
  },
};

function recomendarExamen(
  objetivo: string,
  presupuesto: number,
  nivel: string
): { principal: string; alternativa: string } {
  const nivelAlto = nivel === "c1" || nivel === "c2";

  switch (objetivo) {
    case "visa_uk":
      // Visas UK: solo IELTS for UKVI es válido
      return {
        principal: "ielts",
        alternativa: "No hay alternativa válida para visas UK. El Duolingo y el TOEFL no son aceptados por el UK Home Office.",
      };

    case "universidad_uk":
      if (nivelAlto && presupuesto >= COSTO_CAE) {
        return {
          principal: "cae",
          alternativa: "IELTS Academic (USD 300) si preferís un examen sin vencimiento pero con menor costo.",
        };
      }
      return {
        principal: "ielts",
        alternativa:
          presupuesto >= COSTO_CAE && nivelAlto
            ? "CAE Cambridge (USD 350) si buscás certificación permanente."
            : "CAE Cambridge si alcanzás nivel C1 y tu presupuesto supera USD 350.",
      };

    case "universidad_usa":
      if (presupuesto >= COSTO_TOEFL) {
        return {
          principal: "toefl",
          alternativa: "IELTS Academic (USD 300) igualmente aceptado por la mayoría de universidades de EE.UU.",
        };
      }
      if (presupuesto >= COSTO_IELTS) {
        return {
          principal: "ielts",
          alternativa: "TOEFL iBT (USD 300), preferido por muchas universidades de EE.UU.",
        };
      }
      return {
        principal: "duolingo",
        alternativa: "IELTS o TOEFL (USD 300) si tu presupuesto lo permite; son más reconocidos.",
      };

    case "trabajo_tech":
      if (presupuesto < COSTO_IELTS) {
        return {
          principal: "duolingo",
          alternativa: "IELTS Academic o TOEFL iBT (USD 300) si tu empresa destino los exige específicamente.",
        };
      }
      return {
        principal: "ielts",
        alternativa: "Duolingo English Test (USD 60) si la empresa lo acepta y buscás reducir costos.",
      };

    case "cualquiera":
    default:
      if (presupuesto < COSTO_IELTS) {
        return {
          principal: "duolingo",
          alternativa: "IELTS Academic (USD 300) para mayor cobertura cuando el presupuesto lo permita.",
        };
      }
      return {
        principal: "ielts",
        alternativa: "CAE Cambridge (USD 350) si buscás certificación permanente y tenés nivel C1.",
      };
  }
}

export function compute(i: Inputs): Outputs {
  const objetivo = i.objetivo || "cualquiera";
  const presupuesto = Number(i.presupuesto_usd) || 0;
  const nivel = i.nivel_ingles || "b2";
  const tipoCambio = Number(i.tipo_cambio) || 1250;

  if (presupuesto < 0) {
    return {
      examen_recomendado: "Ingresá un presupuesto válido",
      costo_usd: 0,
      costo_ars: 0,
      valido_para: "-",
      alternativa: "-",
      advertencia: "El presupuesto debe ser mayor a cero.",
    };
  }

  if (tipoCambio <= 0) {
    return {
      examen_recomendado: "Ingresá un tipo de cambio válido",
      costo_usd: 0,
      costo_ars: 0,
      valido_para: "-",
      alternativa: "-",
      advertencia: "El tipo de cambio debe ser mayor a cero.",
    };
  }

  const { principal, alternativa } = recomendarExamen(objetivo, presupuesto, nivel);

  const info = EXAMENES[principal];

  // Si el presupuesto no alcanza ni para Duolingo y el objetivo no es visa_uk
  if (objetivo !== "visa_uk" && presupuesto < COSTO_DUOLINGO) {
    return {
      examen_recomendado: "Presupuesto insuficiente para cualquier examen certificado",
      costo_usd: COSTO_DUOLINGO,
      costo_ars: COSTO_DUOLINGO * tipoCambio,
      valido_para: "El examen más económico es el Duolingo English Test (USD 60).",
      alternativa: "-",
      advertencia: "Necesitás al menos USD 60 para el Duolingo English Test, la opción más accesible.",
    };
  }

  const costoUsd = info.costo_usd;
  const costoArs = costoUsd * tipoCambio;

  return {
    examen_recomendado: info.nombre,
    costo_usd: costoUsd,
    costo_ars: costoArs,
    valido_para: info.valido_para,
    alternativa,
    advertencia: info.advertencia,
  };
}
