export interface Inputs {
  tarifaHoraBase: number;
  nivelSkill: string;
  tipoCliente: string;
  claridadScope: string;
  tipoProyecto: string;
  horasEstimadas: number;
}

export interface Outputs {
  modeloRecomendado: string;
  tarifaHoraAjustada: number;
  precioPaquete: number;
  multiplicadorPaquete: number;
  razonesDetalle: string;
}

export function compute(i: Inputs): Outputs {
  const tarifaBase = Number(i.tarifaHoraBase) || 0;
  const horas = Number(i.horasEstimadas) || 0;

  if (tarifaBase <= 0) {
    return {
      modeloRecomendado: "Ingresá una tarifa hora válida",
      tarifaHoraAjustada: 0,
      precioPaquete: 0,
      multiplicadorPaquete: 0,
      razonesDetalle: "Se requiere una tarifa hora base mayor a 0.",
    };
  }

  if (horas <= 0) {
    return {
      modeloRecomendado: "Ingresá las horas estimadas del proyecto",
      tarifaHoraAjustada: 0,
      precioPaquete: 0,
      multiplicadorPaquete: 0,
      razonesDetalle: "Se requiere una estimación de horas mayor a 0.",
    };
  }

  // --- Factores por nivel de skill ---
  const FACTOR_SKILL: Record<string, number> = {
    junior: 0.85,
    mid: 1.00,
    senior: 1.25,
    expert: 1.50,
  };

  // --- Factores por tipo de cliente ---
  const FACTOR_CLIENTE: Record<string, number> = {
    individual: 0.90,
    startup: 1.00,
    corporativo: 1.30,
    agencia: 0.85,
  };

  // --- Multiplicadores de scope ---
  const MULT_SCOPE: Record<string, number> = {
    bajo: 1.40,
    medio: 1.20,
    alto: 1.05,
  };

  // --- Multiplicadores por tipo de proyecto ---
  const MULT_PROYECTO: Record<string, number> = {
    unico: 1.10,
    iterativo: 1.30,
    recurrente: 0.95,
    consulta: 1.20,
  };

  const factorSkill = FACTOR_SKILL[i.nivelSkill] ?? 1.00;
  const factorCliente = FACTOR_CLIENTE[i.tipoCliente] ?? 1.00;
  const multScope = MULT_SCOPE[i.claridadScope] ?? 1.20;
  const multProyecto = MULT_PROYECTO[i.tipoProyecto] ?? 1.10;

  // Tarifa hora ajustada
  const tarifaHoraAjustada = tarifaBase * factorSkill * factorCliente;

  // Multiplicador total de paquete
  const multiplicadorPaquete = multScope * multProyecto;

  // Precio del paquete
  const precioPaquete = tarifaHoraAjustada * horas * multiplicadorPaquete;

  // --- Lógica de recomendación de modelo ---
  const razones: string[] = [];
  let puntosPaquete = 0;
  let puntosHora = 0;

  // Claridad de scope
  if (i.claridadScope === "alto") {
    puntosPaquete += 2;
    razones.push("Scope claro → paquete fijo es seguro");
  } else if (i.claridadScope === "medio") {
    puntosPaquete += 1;
    puntosHora += 1;
    razones.push("Scope parcial → riesgo moderado de cambios");
  } else {
    puntosHora += 3;
    razones.push("Scope bajo → tarifa hora protege de scope creep");
  }

  // Tipo de proyecto
  if (i.tipoProyecto === "unico") {
    puntosPaquete += 2;
    razones.push("Entregable único → fácil de paquetizar");
  } else if (i.tipoProyecto === "iterativo") {
    puntosHora += 2;
    razones.push("Proyecto iterativo → revisiones abiertas favorecen tarifa hora");
  } else if (i.tipoProyecto === "recurrente") {
    puntosPaquete += 2;
    razones.push("Trabajo recurrente → retainer mensual es lo más eficiente");
  } else if (i.tipoProyecto === "consulta") {
    puntosPaquete += 1;
    puntosHora += 1;
    razones.push("Consultoría: paquete si scope claro, hora si exploratorio");
  }

  // Tipo de cliente
  if (i.tipoCliente === "corporativo") {
    puntosPaquete += 2;
    razones.push("Clientes corporativos prefieren presupuestos cerrados");
  } else if (i.tipoCliente === "individual") {
    puntosHora += 1;
    razones.push("Individuos y emprendedores valoran transparencia de tarifa hora");
  } else if (i.tipoCliente === "agencia") {
    puntosHora += 1;
    razones.push("Agencias suelen pagar por hora para controlar costos internos");
  } else if (i.tipoCliente === "startup") {
    razones.push("Startups: flexible — depende del scope y la confianza");
  }

  // Nivel de skill
  if (i.nivelSkill === "senior" || i.nivelSkill === "expert") {
    puntosPaquete += 1;
    razones.push("Alta experiencia: paquete fijo captura valor, no solo tiempo");
  } else if (i.nivelSkill === "junior") {
    puntosHora += 1;
    razones.push("Nivel junior: tarifa hora es más honesta con el tiempo real");
  }

  // Determinación del modelo
  let modeloRecomendado: string;

  if (i.tipoProyecto === "recurrente") {
    modeloRecomendado = "✅ Retainer mensual (paquete recurrente)";
  } else if (puntosPaquete > puntosHora + 1) {
    modeloRecomendado = "✅ Paquete fijo";
  } else if (puntosHora > puntosPaquete + 1) {
    modeloRecomendado = "⏱️ Tarifa por hora";
  } else {
    // Empate o diferencia mínima → recomendar híbrido
    modeloRecomendado = "⚖️ Tarifa hora con tope máximo (modelo mixto)";
    razones.push("Factores equilibrados: un tope de horas da certeza al cliente y te protege a vos");
  }

  const razonesDetalle = razones.join(" · ");

  return {
    modeloRecomendado,
    tarifaHoraAjustada: Math.round(tarifaHoraAjustada * 100) / 100,
    precioPaquete: Math.round(precioPaquete * 100) / 100,
    multiplicadorPaquete: Math.round(multiplicadorPaquete * 100) / 100,
    razonesDetalle,
  };
}
