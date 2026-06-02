export interface Inputs {
  edadAnios: number;
  edadMeses: number;
}

export interface Outputs {
  limiteHoras: string;
  categoria: string;
  tipoContenido: string;
  consejos: string;
  _insight?: any;
}

// Grupos etarios basados en guías AAP 2016/2023 y SAP 2021
// Edad expresada en meses totales para mayor precisión

export function compute(i: Inputs): Outputs {
  const anios = Math.floor(Math.max(0, Number(i.edadAnios) || 0));
  const meses = Math.floor(Math.min(11, Math.max(0, Number(i.edadMeses) || 0)));
  const edadTotalMeses = anios * 12 + meses;

  if (edadTotalMeses < 0) {
    return {
      limiteHoras: "Ingresá una edad válida",
      categoria: "-",
      tipoContenido: "-",
      consejos: "-",
      _insight: {
        title: "Ingresá la edad",
        text: "Cargá la **edad del niño** (años y meses) para ver el límite de pantalla que recomiendan la **AAP** y la **SAP** según la etapa.",
        tone: "neutral",
        icon: "👶",
      },
    };
  }

  // Grupo 1: 0 a 17 meses
  if (edadTotalMeses < 18) {
    return {
      limiteHoras: "0 horas (evitar pantallas)",
      categoria: "Bebé (0-17 meses)",
      tipoContenido: "Solo videollamadas familiares (no computan como pantalla)",
      consejos:
        "Evitá toda pantalla recreativa. El cerebro a esta edad aprende a través del juego sensorial, el contacto físico y la interacción cara a cara. Las videollamadas con familiares son la única excepción permitida por la AAP.",
      _insight: {
        title: "Cero pantallas a esta edad",
        text: `A los **${edadTotalMeses} meses** la AAP recomienda **0 horas** de pantalla recreativa: solo las videollamadas con familia quedan exceptuadas. El cerebro aprende ahora del juego sensorial y el cara a cara.`,
        tone: "warn",
        icon: "🚫",
      },
    };
  }

  // Grupo 2: 18 a 23 meses
  if (edadTotalMeses < 24) {
    return {
      limiteHoras: "Mínimo posible, solo supervisado",
      categoria: "Transición (18-23 meses)",
      tipoContenido: "Contenido educativo de alta calidad junto a un adulto",
      consejos:
        "Si se introduce algún contenido digital, que sea breve, de alta calidad y siempre con un adulto presente que explique y refuerce lo que ve el niño. Priorizá la interacción cara a cara y el juego libre.",
      _insight: {
        title: "Etapa de transición",
        text: `A los **${edadTotalMeses} meses** la pantalla debe ser **mínima y siempre supervisada**: contenido breve y de alta calidad, con un adulto que explique lo que el niño ve. El juego libre sigue mandando.`,
        tone: "warn",
        icon: "👀",
      },
    };
  }

  // Grupo 3: 2 a 5 años (24 a 71 meses)
  if (edadTotalMeses < 72) {
    return {
      limiteHoras: "Máximo 1 hora por día",
      categoria: "Preescolar (2-5 años)",
      tipoContenido: "Contenido educativo de alta calidad (ej. Sesame Street, Bluey, apps de lectoescritura)",
      consejos:
        "Elegí contenido con objetivos educativos claros y ritmo pausado. Mirá junto al niño y conversá sobre lo que ven para reforzar el aprendizaje. Evitá pantallas 1 hora antes de dormir y durante las comidas.",
      _insight: {
        title: "Máximo 1 hora por día",
        text: `A los **${anios} años** el tope que recomienda la AAP es **1 hora diaria** de contenido educativo y de calidad, mirado junto a un adulto. Nada de pantallas en comidas ni la hora previa a dormir.`,
        tone: "neutral",
        icon: "⏱️",
      },
    };
  }

  // Grupo 4: 6 a 12 años (72 a 155 meses)
  if (edadTotalMeses < 156) {
    return {
      limiteHoras: "Límite razonable definido en familia",
      categoria: "Escolar (6-12 años)",
      tipoContenido: "Contenido educativo, entretenimiento supervisado y videojuegos con moderación",
      consejos:
        "El uso de pantallas no debe afectar el sueño (9-12 h/noche), la actividad física (60 min/día) ni las tareas escolares. Establecé zonas libres de pantallas: mesa durante comidas y dormitorio de noche. Revisá juntos las apps y plataformas que usa.",
      _insight: {
        title: "Límite acordado en familia",
        text: `A los **${anios} años** ya no hay un tope fijo de horas: la regla es que la pantalla **no desplace el sueño (9-12 h), los 60 min de actividad física ni las tareas**. Definí zonas sin pantallas (comidas y dormitorio).`,
        tone: "neutral",
        icon: "📵",
      },
    };
  }

  // Grupo 5: 13 años en adelante
  return {
    limiteHoras: "Límite consensuado en familia",
    categoria: "Adolescente (13+ años)",
    tipoContenido: "Uso variado: educación, entretenimiento, redes sociales con orientación",
    consejos:
      "Elaborá un plan de uso de medios en conjunto con el adolescente. Incluí horarios sin pantallas (antes de dormir, durante comidas) y asegurate de que el sueño (8-10 h/noche) y la actividad física no se vean desplazados. Mantené canales de diálogo abiertos sobre contenidos y redes sociales.",
    _insight: {
      title: "Plan de medios consensuado",
      text: `A los **${anios} años** la clave es un **plan de uso de medios acordado** con el adolescente: horarios sin pantallas (antes de dormir y en comidas) y resguardar el **sueño (8-10 h)** y la actividad física. El diálogo sobre redes pesa más que el reloj.`,
      tone: "neutral",
      icon: "💬",
    },
  };
}
