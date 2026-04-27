export interface Inputs {
  objetivo: string;
  nivel_actual: string;
  lengua_materna: string;
  horas_dia: string;
  nivel_meta: string;
  estilo_aprendizaje: string;
}

export interface Outputs {
  variante_recomendada: string;
  semanas_estimadas: number;
  horas_totales: number;
  diferencias_clave: string;
  recursos_recomendados: string;
  advertencia: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes de horas base por nivel meta (desde cero, factor 1.0)
  // Referencia: MCER / British Council / FSI estimaciones adaptadas
  const HORAS_BASE: Record<string, number> = {
    a2: 120,
    b1: 280,
    b2: 500,
    c1: 800,
  };

  // Horas acumuladas por nivel previo (base factor 1.0)
  const HORAS_NIVEL_PREVIO: Record<string, number> = {
    cero: 0,
    basico: 60,
    a2: 120,
    b1: 280,
    b2: 500,
  };

  // Factor de dificultad según lengua materna
  // FSI: español = ~65% del esfuerzo respecto al inglés nativo
  const FACTOR_LENGUA: Record<string, number> = {
    espanol: 0.65,
    frances: 0.80,
    ingles: 1.00,
    otro: 1.25,
  };

  // --- Leer inputs con defaults defensivos
  const objetivo = i.objetivo || "viaje_brasil";
  const nivel_actual = i.nivel_actual || "cero";
  const lengua_materna = i.lengua_materna || "espanol";
  const horas_dia_raw = parseFloat(i.horas_dia) || 1;
  const nivel_meta = i.nivel_meta || "b1";
  const estilo_aprendizaje = i.estilo_aprendizaje || "mixto";

  // Validar horas/día
  const horas_dia = horas_dia_raw > 0 ? horas_dia_raw : 1;

  // --- Calcular horas necesarias
  const horas_meta = HORAS_BASE[nivel_meta] ?? 280;
  const horas_previas = HORAS_NIVEL_PREVIO[nivel_actual] ?? 0;
  const factor_lengua = FACTOR_LENGUA[lengua_materna] ?? 1.0;

  // Horas netas restantes, aplicando factor de lengua
  const horas_brutas_restantes = Math.max(0, horas_meta - horas_previas);
  const horas_totales = Math.round(horas_brutas_restantes * factor_lengua);

  // Semanas estimadas
  const semanas_estimadas =
    horas_totales <= 0 ? 0 : Math.ceil(horas_totales / (horas_dia * 7));

  // --- Determinar variante recomendada
  const VARIANTES_PT: Record<string, string> = {
    viaje_brasil: "PT-BR (Portugués Brasileño)",
    viaje_portugal: "PT-PT (Portugués Europeo)",
    vivir_brasil: "PT-BR (Portugués Brasileño)",
    vivir_portugal: "PT-PT (Portugués Europeo)",
    negocios_brasil: "PT-BR (Portugués Brasileño)",
    negocios_portugal: "PT-PT (Portugués Europeo)",
    entretenimiento: "PT-BR (Portugués Brasileño)",
    academico: "PT-BR (Portugués Brasileño)",
  };

  const variante_recomendada =
    VARIANTES_PT[objetivo] ?? "PT-BR (Portugués Brasileño)";

  const es_br = variante_recomendada.includes("PT-BR");

  // --- Diferencias clave según variante
  const diferencias_clave = es_br
    ? "PT-BR: usa \"você\" (no \"tu\"), gerundio progresivo (\"estou falando\"), vocales abiertas más fáciles de percibir. Vocabulario: ônibus, celular, trem. Pronunciación rítmica y clara, muy apta para hispanohablantes."
    : "PT-PT: usa \"tu\" con conjugación propia, infinitivo personal en lugar de gerundio (\"estou a falar\"), reducción de vocales átonas (pronunciación más cerrada y rápida). Vocabulario: autocarro, telemóvel, comboio. Norma ortográfica del Acuerdo de 1990.";

  // --- Recursos según variante y estilo
  const recursos_br: Record<string, string> = {
    apps:
      "Duolingo (PT-BR), Babbel Brasileño, Pimsleur Portuguese. Complementar con Anki (mazos de vocabulario PT-BR).",
    clases:
      "Profesores nativos brasileños en iTalki o Preply. Buscar tutores de São Paulo o Rio para acento neutro o carioca.",
    inmersion:
      "Series Netflix: Narcos: México (doblaje BR), Cidade Invisível, 3%. Podcasts: \"PortuguesePod101 Brazil\", \"Fala Gringo\". Música: MPB, samba, forró.",
    mixto:
      "Combinar Duolingo diario (15 min) + 1 clase semanal en iTalki + series brasileñas con subtítulos PT-BR. Podcast \"Fala Gringo\" para comprensión oral.",
  };

  const recursos_pt: Record<string, string> = {
    apps:
      "Babbel Europeo, apps de la Universidade de Lisboa. Anki con mazos PT-PT. Atenção ao acento europeo desde el inicio.",
    clases:
      "Profesores nativos portugueses en iTalki. Buscar tutores de Lisboa o Porto. Instituto Camões ofrece recursos oficiales.",
    inmersion:
      "RTP Play (streaming gratuito de TV portuguesa). Series: Glória, Conta-me Como Foi. Podcast \"Practice Portuguese\". Radio TSF.",
    mixto:
      "Babbel PT-PT + 1 clase semanal con tutor de Lisboa + RTP Play diario. Podcast \"Practice Portuguese\" para acento europeo auténtico.",
  };

  const recursos_map = es_br ? recursos_br : recursos_pt;
  const recursos_recomendados =
    recursos_map[estilo_aprendizaje] ?? recursos_map["mixto"];

  // --- Nota / advertencia contextual
  let advertencia = "";
  if (horas_totales === 0) {
    advertencia =
      "Tu nivel actual ya cumple o supera tu objetivo. Considerá apuntar al siguiente nivel o trabajar en certificación formal.";
  } else if (lengua_materna === "espanol" && nivel_meta === "a2") {
    advertencia =
      "Para hispanohablantes, el nivel A2 en portugués es alcanzable en pocas semanas. Muchos lo logran antes del estimado gracias a la similitud con el español.";
  } else if (nivel_meta === "c1") {
    advertencia =
      "El nivel C1 requiere inmersión sostenida. Las horas estimadas asumen estudio activo; añadir inmersión pasiva (series, podcasts) puede reducir el tiempo real.";
  } else if (!es_br && nivel_meta === "b2") {
    advertencia =
      "Para PT-PT nivel B2 en contexto laboral, considera prepararte también para el examen CAPLE/DIPLE de la Universidad de Lisboa.";
  } else if (es_br && (nivel_meta === "b2" || nivel_meta === "c1")) {
    advertencia =
      "Para nivel B2-C1 en PT-BR con fines académicos o profesionales, el examen CELPE-Bras del INEP es la certificación oficial reconocida en Brasil.";
  } else {
    advertencia =
      "Las horas estimadas son un promedio. El estudio activo y la inmersión real aceleran el progreso más que el tiempo de exposición pasiva.";
  }

  return {
    variante_recomendada,
    semanas_estimadas,
    horas_totales,
    diferencias_clave,
    recursos_recomendados,
    advertencia,
  };
}
