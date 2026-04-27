export interface Inputs {
  edadAnios: number;
  edadMeses: number;
}

export interface Outputs {
  limiteHoras: string;
  categoria: string;
  tipoContenido: string;
  consejos: string;
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
    };
  }

  // Grupo 5: 13 años en adelante
  return {
    limiteHoras: "Límite consensuado en familia",
    categoria: "Adolescente (13+ años)",
    tipoContenido: "Uso variado: educación, entretenimiento, redes sociales con orientación",
    consejos:
      "Elaborá un plan de uso de medios en conjunto con el adolescente. Incluí horarios sin pantallas (antes de dormir, durante comidas) y asegurate de que el sueño (8-10 h/noche) y la actividad física no se vean desplazados. Mantené canales de diálogo abiertos sobre contenidos y redes sociales.",
  };
}
