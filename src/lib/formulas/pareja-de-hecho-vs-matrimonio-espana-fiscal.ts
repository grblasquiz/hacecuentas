export interface Inputs {
  ccaa: string;
  situacion_actual: string;
  renta_miembro1: number;
  renta_miembro2: number;
  hijos_comunes: number;
  patrimonio_estimado: number;
  edad_miembro1: number;
  edad_miembro2: number;
  vivienda_habitual: string;
}

export interface Outputs {
  ahorro_irpf_matrimonio: number;
  pareja_hecho_tributacion_conjunta: string;
  diferencia_herencia: string;
  pension_viudedad: string;
  impuesto_sucesiones_estimado: string;
  tramites_necesarios: string;
  regimen_economico: string;
  ventaja_recomendacion: string;
  deducciones_autonomicas_info: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes IRPF 2026 (Ley 35/2006, art. 84 - reducción tributación conjunta)
  const REDUCCION_CONJUNTA_MATRIMONIO = 3400; // euros — base imponible
  const REDUCCION_CONJUNTA_MONOPARENTAL = 2150; // euros — cuando uno no tiene rentas y hay hijos

  // --- Tramos IRPF ESTATAL 2026 (art. 63 Ley IRPF)
  // [hasta, tipo_estatal]
  const TRAMOS_ESTATALES: Array<[number, number]> = [
    [12450, 0.095],
    [20200, 0.12],
    [35200, 0.15],
    [60000, 0.185],
    [300000, 0.225],
    [Infinity, 0.245],
  ];

  // --- Tipo autonómico medio por CCAA (aproximación 2026)
  // Fuente: normativa autonómica vigente + AEAT
  const TIPO_AUTONOMICO_MEDIO: Record<string, number> = {
    andalucia: 0.085,
    aragon: 0.105,
    asturias: 0.115,
    baleares: 0.095,
    canarias: 0.08,
    cantabria: 0.095,
    castilla_la_mancha: 0.085,
    castilla_leon: 0.09,
    cataluna: 0.12,
    extremadura: 0.095,
    galicia: 0.09,
    la_rioja: 0.085,
    madrid: 0.085,
    murcia: 0.09,
    navarra: 0.095,
    pais_vasco: 0.09,
    valencia: 0.105,
    ceuta: 0.075,
    melilla: 0.075,
  };

  // --- CCAA que permiten tributación conjunta a parejas de hecho (régimen foral)
  const CCAA_CONJUNTA_PAREJA: Record<string, boolean> = {
    pais_vasco: true,
    navarra: true,
  };

  // --- Equiparación ISD (Impuesto Sucesiones) pareja de hecho = cónyuge
  // Fuente: normativa autonómica ISD
  const CCAA_ISD_EQUIPARACION: Record<string, string> = {
    andalucia: "Equiparada al cónyuge (bonificación 99 %)",
    aragon: "Equiparada al cónyuge",
    asturias: "Equiparada al cónyuge",
    baleares: "Equiparada al cónyuge (derecho foral)",
    canarias: "Equiparada al cónyuge (bonificación 99,9 %)",
    cantabria: "Equiparada al cónyuge",
    castilla_la_mancha: "Reducción parcial — no plena equiparación",
    castilla_leon: "Reducción parcial — no plena equiparación",
    cataluna: "Equiparada al cónyuge (Código Civil de Cataluña)",
    extremadura: "Reducción parcial — consultar normativa vigente",
    galicia: "Equiparada al cónyuge",
    la_rioja: "Bonificación 99 % — equiparada",
    madrid: "Equiparada al cónyuge (bonificación 99 %)",
    murcia: "Equiparada al cónyuge",
    navarra: "Equiparada al cónyuge (derecho foral)",
    pais_vasco: "Equiparada al cónyuge (derecho foral)",
    valencia: "Equiparada al cónyuge",
    ceuta: "Sin bonificación específica — tributación general",
    melilla: "Sin bonificación específica — tributación general",
  };

  // --- Herencia sin testamento pareja de hecho
  const CCAA_HERENCIA_PAREJA: Record<string, string> = {
    andalucia: "Sin derechos hereditarios automáticos. Testamento imprescindible.",
    aragon: "Derecho foral: el conviviente puede tener derechos limitados según la ley aragonesa.",
    asturias: "Sin derechos automáticos. Se recomienda testamento.",
    baleares: "Derecho foral: reconoce derechos sucesorios al conviviente inscrito.",
    canarias: "Sin derechos automáticos. Testamento imprescindible.",
    cantabria: "Sin derechos automáticos. Testamento imprescindible.",
    castilla_la_mancha: "Sin derechos automáticos. Testamento imprescindible.",
    castilla_leon: "Sin derechos automáticos. Testamento imprescindible.",
    cataluna: "Código Civil Cataluña: el conviviente puede heredar en 4.º lugar si no hay otros herederos.",
    extremadura: "Sin derechos automáticos. Testamento imprescindible.",
    galicia: "Ley gallega: reconoce derecho de usufructo al conviviente inscrito (art. 171 LDCG).",
    la_rioja: "Sin derechos automáticos. Testamento imprescindible.",
    madrid: "Sin derechos automáticos. Testamento imprescindible.",
    murcia: "Sin derechos automáticos. Testamento imprescindible.",
    navarra: "Derecho foral: equiparación plena al cónyuge en derechos sucesorios.",
    pais_vasco: "Derecho foral: equiparación plena al cónyuge en derechos sucesorios.",
    valencia: "Ley valenciana: reconoce derechos limitados al conviviente inscrito.",
    ceuta: "Derecho común: sin derechos automáticos. Testamento imprescindible.",
    melilla: "Derecho común: sin derechos automáticos. Testamento imprescindible.",
  };

  // --- Régimen económico por defecto según CCAA
  const REGIMEN_MATRIMONIAL: Record<string, string> = {
    andalucia: "Gananciales (Código Civil)",
    aragon: "Consorcio conyugal (Derecho foral aragonés)",
    asturias: "Gananciales (Código Civil)",
    baleares: "Separación de bienes (Derecho foral balear)",
    canarias: "Gananciales (Código Civil)",
    cantabria: "Gananciales (Código Civil)",
    castilla_la_mancha: "Gananciales (Código Civil)",
    castilla_leon: "Gananciales (Código Civil)",
    cataluna: "Separación de bienes (Código Civil de Cataluña)",
    extremadura: "Gananciales (Código Civil)",
    galicia: "Gananciales (Código Civil)",
    la_rioja: "Gananciales (Código Civil)",
    madrid: "Gananciales (Código Civil)",
    murcia: "Gananciales (Código Civil)",
    navarra: "Conquistas (Derecho foral navarro, similar a gananciales)",
    pais_vasco: "Comunicación foral de bienes (Derecho foral vasco)",
    valencia: "Separación de bienes (Derecho civil valenciano)",
    ceuta: "Gananciales (Código Civil)",
    melilla: "Gananciales (Código Civil)",
  };

  // --- Deducciones autonómicas relevantes para pareja de hecho / matrimonio
  const DEDUCCIONES_AUTONOMICAS: Record<string, string> = {
    andalucia: "Deducción por adopción y nacimiento (hasta 200 €/hijo). Pareja de hecho equiparada.",
    aragon: "Deducción por nacimiento o adopción de 3.er hijo o sucesivos (500 €). Pareja de hecho: mismos derechos.",
    asturias: "Deducción por partos múltiples (505 €) y por acogimiento. Pareja de hecho reconocida.",
    baleares: "Deducciones por natalidad y acogimiento. Pareja de hecho equiparada en IRPF autonómico.",
    canarias: "Deducción por familia numerosa y nacimiento. Pareja de hecho reconocida en normativa autonómica.",
    cantabria: "Deducción por cuidado de familiares. Pareja de hecho: derechos parciales.",
    castilla_la_mancha: "Deducción por nacimiento de hijo (100–300 €). Matrimonio y pareja de hecho equiparados.",
    castilla_leon: "Deducción por nacimiento o adopción (desde 1.010 €). Pareja de hecho reconocida.",
    cataluna: "Deducción por alquiler (150–300 €) y por familia numerosa. Pareja de hecho equiparada.",
    extremadura: "Deducción por adquisición primera vivienda. Pareja de hecho: mismos derechos si inscrita.",
    galicia: "Deducción por nacimiento (300 €, tercer hijo: 360 €). Pareja de hecho reconocida.",
    la_rioja: "Deducción por nacimiento de hijo (150 €). Matrimonio y pareja de hecho equiparados.",
    madrid: "Deducción por nacimiento o adopción (600 €/hijo). Pareja de hecho equiparada si inscrita.",
    murcia: "Deducción por nacimiento de hijo. Pareja de hecho reconocida.",
    navarra: "Tributación conjunta disponible. Deducciones por familia. Plena equiparación.",
    pais_vasco: "Tributación conjunta disponible. Deducciones similares al matrimonio. Plena equiparación.",
    valencia: "Deducción por nacimiento o adopción. Pareja de hecho: mismos derechos si inscrita en registro.",
    ceuta: "Bonificación 50 % IRPF (ambos regímenes). Pocas deducciones específicas.",
    melilla: "Bonificación 50 % IRPF (ambos regímenes). Pocas deducciones específicas.",
  };

  // --- Obtener valores del input con defaults seguros
  const ccaa = (i.ccaa || "madrid").toLowerCase();
  const renta1 = Math.max(0, i.renta_miembro1 || 0);
  const renta2 = Math.max(0, i.renta_miembro2 || 0);
  const hijos = Math.max(0, Math.round(i.hijos_comunes || 0));

  // --- Determinar tipo marginal aplicable al segundo declarante
  // Usamos renta del miembro con menor renta (el que se «integra» en la declaración conjunta)
  const rentaSecundaria = Math.min(renta1, renta2);

  function tipoMarginalEstatal(base: number): number {
    let acumulado = 0;
    for (const [hasta, tipo] of TRAMOS_ESTATALES) {
      if (base <= hasta) return tipo;
      acumulado = hasta;
    }
    return 0.245;
  }

  const tipoEstatal = tipoMarginalEstatal(rentaSecundaria);
  const tipoAutonomico = TIPO_AUTONOMICO_MEDIO[ccaa] ?? 0.09;
  const tipoMarginalTotal = tipoEstatal + tipoAutonomico;

  // --- Calcular reducción aplicable
  // Si uno de los miembros no tiene renta y hay hijos, usar reducción monoparental-familia
  let reduccionAplicable = REDUCCION_CONJUNTA_MATRIMONIO;
  if (rentaSecundaria === 0 && hijos > 0) {
    reduccionAplicable = REDUCCION_CONJUNTA_MONOPARENTAL;
  }

  // Ahorro estimado en cuota (sólo si la renta secundaria está en tramos bajos, la conjunta es ventajosa)
  // La tributación conjunta es ventajosa cuando la renta conjunta resulta en tipo menor que la suma individual
  let ahorroIRPF = 0;
  if (renta1 > 0 || renta2 > 0) {
    // Estimación simplificada: ahorro = reducción × tipo marginal del declarante secundario
    // Solo positivo si hay asimetría real (diferencia > 5.000 €)
    const diferencia = Math.abs(renta1 - renta2);
    if (diferencia > 5000 || rentaSecundaria === 0) {
      ahorroIRPF = Math.round(reduccionAplicable * tipoMarginalTotal);
    } else {
      // Con rentas similares la conjunta puede ser neutra o ligeramente negativa
      // por el efecto de acumulación en tramos; devolvemos valor conservador cercano a 0
      ahorroIRPF = Math.max(0, Math.round((reduccionAplicable * tipoMarginalTotal) - (diferencia * 0.02)));
    }
  }

  // --- Tributación conjunta pareja de hecho
  const puedeConjuntaPH = CCAA_CONJUNTA_PAREJA[ccaa] ?? false;
  const textConjuntaPH = puedeConjuntaPH
    ? `✅ Sí. En ${ccaa === "pais_vasco" ? "País Vasco" : "Navarra"} las parejas de hecho inscritas pueden optar a tributación conjunta en el IRPF autonómico (régimen foral).`
    : "❌ No. En la mayoría de comunidades autónomas, incluida la tuya, la tributación conjunta del IRPF está reservada exclusivamente a los matrimonios (art. 82 Ley 35/2006).";

  // --- Herencia sin testamento
  const textoHerencia = CCAA_HERENCIA_PAREJA[ccaa] ??
    "Sin derechos hereditarios automáticos para la pareja de hecho. Testamento imprescindible.";

  // --- Pensión de viudedad
  const textoPension =
    "**Matrimonio:** Acceso directo a la pensión de viudedad sin restricciones de renta.\n" +
    "**Pareja de hecho:** Requiere inscripción en registro oficial, mínimo 2 años inscrita y 5 años de convivencia acreditada. " +
    "Además, los ingresos del superviviente no deben superar el 50 % de la suma de ambas rentas " +
    "(o el 25 % de la renta individual). Si se cumplen todos los requisitos, se accede a la misma pensión.";

  // --- ISD estimado
  const textoISD = CCAA_ISD_EQUIPARACION[ccaa] ??
    "Consultar normativa autonómica vigente.";
  const textoISDCompleto =
    `**Pareja de hecho en ${ccaa}:** ${textoISD}\n` +
    "**Matrimonio:** Cónyuge en Grupo II (reducción base y bonificaciones máximas en la mayoría de CCAA).\n" +
    "Nota: Sin equiparación expresa, la pareja de hecho tributa en Grupos III-IV, con tipos de hasta el 34 %.";

  // --- Trámites necesarios
  const tramitesPH =
    "**Para inscribir pareja de hecho:**\n" +
    "1. Acudir al Registro de Parejas de Hecho de tu CCAA o al Registro Civil.\n" +
    "2. Aportar: DNI/NIE de ambos, certificado de empadronamiento conjunto (algunos registros exigen 6-12 meses), " +
    "certificado de soltería/estado civil y declaración de no ser parientes.\n" +
    "3. En algunas CCAA, escritura pública notarial de pacto de convivencia (recomendada).\n" +
    "**Para contraer matrimonio:**\n" +
    "1. Solicitar expediente matrimonial en el Registro Civil (o ante notario o juez de paz).\n" +
    "2. Aportar DNI/NIE, certificados de nacimiento y de estado civil.\n" +
    "3. Celebrar el enlace civil o religioso (este último con efectos civiles si está reconocido).";

  // --- Régimen económico
  const regimenMatrimonial = REGIMEN_MATRIMONIAL[ccaa] ?? "Gananciales (Código Civil)";
  const textoRegimen =
    `**Matrimonio en ${ccaa}:** Régimen legal supletorio: ${regimenMatrimonial}. ` +
    "Puede modificarse mediante capitulaciones matrimoniales ante notario.\n" +
    "**Pareja de hecho:** Sin régimen legal automático. Cada miembro conserva sus bienes. " +
    "Para compartir patrimonio es necesario un pacto de convivencia notarial o contrato privado.";

  // --- Valoración / recomendación fiscal
  let recomendacion = "";
  if (puedeConjuntaPH) {
    recomendacion =
      `En ${ccaa === "pais_vasco" ? "País Vasco" : "Navarra"} la pareja de hecho inscrita tiene prácticamente los mismos derechos fiscales que el matrimonio. ` +
      "La diferencia principal es simbólica y en derechos civiles. Consulta el registro foral.";
  } else if (ahorroIRPF > 500) {
    recomendacion =
      `Con las rentas indicadas, el matrimonio podría suponer un ahorro estimado de ${ahorroIRPF.toLocaleString("es-ES")} €/año en IRPF por tributación conjunta. ` +
      "Además, en tu CCAA el cónyuge tiene mayores derechos hereditarios automáticos y en la pensión de viudedad. " +
      "Desde el punto de vista fiscal, el matrimonio presenta ventajas significativas en tu caso.";
  } else if (ahorroIRPF > 0) {
    recomendacion =
      `El ahorro fiscal estimado por tributación conjunta sería de ${ahorroIRPF.toLocaleString("es-ES")} €/año, moderado en tu caso al tener rentas similares. ` +
      "Los derechos hereditarios y en Seguridad Social son los factores más relevantes para decidir. " +
      "Consulta a un asesor fiscal con tus datos completos.";
  } else {
    recomendacion =
      "Con rentas similares entre ambos miembros, la tributación conjunta puede no ser ventajosa o incluso perjudicial. " +
      "La principal ventaja del matrimonio en tu caso son los derechos hereditarios automáticos y la pensión de viudedad sin restricciones de renta. " +
      "Para el IRPF, las declaraciones individuales serán probablemente más eficientes.";
  }

  // --- Deducciones autonómicas
  const deduccionesInfo = DEDUCCIONES_AUTONOMICAS[ccaa] ??
    "Consulta la normativa fiscal autonómica vigente para deducciones específicas.";

  return {
    ahorro_irpf_matrimonio: ahorroIRPF,
    pareja_hecho_tributacion_conjunta: textConjuntaPH,
    diferencia_herencia: textoHerencia,
    pension_viudedad: textoPension,
    impuesto_sucesiones_estimado: textoISDCompleto,
    tramites_necesarios: tramitesPH,
    regimen_economico: textoRegimen,
    ventaja_recomendacion: recomendacion,
    deducciones_autonomicas_info: deduccionesInfo,
  };
}
