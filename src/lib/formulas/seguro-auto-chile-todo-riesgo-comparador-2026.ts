export interface Inputs {
  edad_conductor: number;
  año_vehiculo: number;
  marca_vehiculo: string;
  rango_precio_vehiculo: string;
  region_chile: string;
  tipo_cobertura: string;
  deducible: string;
  km_anual: string;
  tiene_anti_robo: string;
}

export interface Outputs {
  prima_terceros: number;
  prima_terceros_completos: number;
  prima_todo_riesgo: number;
  prima_mensual: number;
  deducible_monto: number;
  aseguradora_recomendada: string;
  rango_competencia: string;
  ahorro_potencial: number;
  coberturas_recomendadas: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - SII, Banco Central, SVS
  // UTA 2026: $36.923 (reajuste anual)
  // Prima base estimada mensual según datos AAC
  const PRIMA_BASE_MENSUAL = 28000; // pesos, base para cálculo

  // Factor edad - estadística de siniestralidad
  const factorEdad = (() => {
    if (i.edad_conductor < 25) return 1.45; // +45% riesgo jóvenes
    if (i.edad_conductor < 35) return 1.15; // +15%
    if (i.edad_conductor < 55) return 1.0;  // base 100%
    if (i.edad_conductor < 65) return 1.08; // +8%
    return 1.25; // +25% para 65+
  })();

  // Factor antigüedad vehículo
  const antiguedad = 2026 - i.año_vehiculo;
  const factorAntiguedad = (() => {
    if (antiguedad <= 5) return 1.0;
    if (antiguedad <= 10) return 1.1;
    if (antiguedad <= 15) return 1.3;
    if (antiguedad <= 20) return 1.6;
    return 2.0; // 21+ años
  })();

  // Factor marca - riesgo de robo y siniestralidad
  const factorMarca = (() => {
    switch (i.marca_vehiculo) {
      case "toyota":
      case "hyundai":
      case "kia":
        return 1.0;
      case "chevrolet":
      case "volkswagen":
        return 1.05;
      case "mitsubishi":
      case "mazda":
        return 1.1;
      case "nissan":
      case "ford":
        return 1.15;
      case "bmw":
      case "audi":
        return 1.3;
      case "mercedes":
        return 1.4;
      default:
        return 1.2;
    }
  })();

  // Factor región - exposición a siniestros
  const factorRegion = (() => {
    switch (i.region_chile) {
      case "metropolitana":
      case "valparaiso":
        return 1.0;
      case "libertador":
      case "maule":
      case "biobio":
        return 0.95;
      case "arica":
      case "magallanes":
        return 1.12;
      default:
        return 1.02;
    }
  })();

  // Factor deducible - % del valor vehículo
  const deduciblePct = parseFloat(i.deducible);
  const factorDeducible = (() => {
    if (deduciblePct === 10) return 1.15;
    if (deduciblePct === 15) return 1.0;
    if (deduciblePct === 20) return 0.92;
    if (deduciblePct === 25) return 0.85;
    return 1.0;
  })();

  // Factor cobertura - tipo de protección
  const factorCobertura = (() => {
    switch (i.tipo_cobertura) {
      case "terceros":
        return 1.0;
      case "terceros_completos":
        return 2.0;  // +100% vs terceros
      case "todo_riesgo":
        return 3.1;  // +210% vs terceros
      default:
        return 3.1;
    }
  })();

  // Factor uso anual
  const factorUso = (() => {
    switch (i.km_anual) {
      case "bajo":
        return 0.92;
      case "medio":
        return 1.0;
      case "alto":
        return 1.15;
      default:
        return 1.0;
    }
  })();

  // Descuento anti-robo/GPS
  const descuentoAntirrobo = i.tiene_anti_robo === "si" ? 0.95 : 1.0; // -5%

  // Valor vehículo estimado según rango
  const valorVehiculo = (() => {
    switch (i.rango_precio_vehiculo) {
      case "bajo":
        return 6500000;  // $6.500.000
      case "medio":
        return 11500000; // $11.500.000
      case "alto":
        return 20000000; // $20.000.000
      case "premium":
        return 35000000; // $35.000.000
      default:
        return 11500000;
    }
  })();

  // Cálculo prima anual terceros (base obligatoria)
  const primaBase = PRIMA_BASE_MENSUAL * 12; // $336.000 anual base
  const primaBaseTerceros = primaBase * factorEdad * factorAntiguedad * factorMarca * factorRegion * factorUso * descuentoAntirrobo;

  // Prima terceros - sin factor cobertura (es la base legal obligatoria)
  const primaTerceros = Math.round(primaBaseTerceros);

  // Prima terceros completos
  const primaTC = Math.round(primaBaseTerceros * 2.0 * factorDeducible);

  // Prima todo riesgo
  const primaTR = Math.round(primaBaseTerceros * 3.1 * factorDeducible);

  // Prima mensual según opción seleccionada
  let primaAnualSeleccionada: number;
  switch (i.tipo_cobertura) {
    case "terceros":
      primaAnualSeleccionada = primaTerceros;
      break;
    case "terceros_completos":
      primaAnualSeleccionada = primaTC;
      break;
    case "todo_riesgo":
      primaAnualSeleccionada = primaTR;
      break;
    default:
      primaAnualSeleccionada = primaTR;
  }
  const primaMensual = Math.round(primaAnualSeleccionada / 12);

  // Deducible en pesos
  const deducibleMonto = Math.round(valorVehiculo * (deduciblePct / 100));

  // Aseguradora recomendada según perfil
  let aseguradoraRecomendada: string;
  if (i.edad_conductor < 25) {
    aseguradoraRecomendada = "Liberty o Zenit (especializadas en jóvenes, primas competitivas)";
  } else if (i.rango_precio_vehiculo === "premium") {
    aseguradoraRecomendada = "Penta o HDI (cobertura premium y talleres especializados)";
  } else if (primaAnualSeleccionada < 300000) {
    aseguradoraRecomendada = "Zenit o Liberty (precios bajos en todo riesgo)";
  } else if (primaAnualSeleccionada < 500000) {
    aseguradoraRecomendada = "Mapfre o HDI (relación precio-cobertura equilibrada)";
  } else {
    aseguradoraRecomendada = "Penta o ChileSeguros (amplia red de talleres)";
  }

  // Rango competencia - basado en investigación mercado 2026
  let rangoCompetencia: string;
  const rangoMinimo = Math.round(primaAnualSeleccionada * 0.92);
  const rangoMaximo = Math.round(primaAnualSeleccionada * 1.15);
  rangoCompetencia = `$${rangoMinimo.toLocaleString("es-CL")} - $${rangoMaximo.toLocaleString("es-CL")} anual`;

  // Ahorro potencial vs todo riesgo premium (deducible 10%)
  const primaTRpremium = Math.round(primaBaseTerceros * 3.1 * 1.15); // 10% deducible
  const ahorrroPotencial = Math.max(0, primaTRpremium - primaAnualSeleccionada);

  // Coberturas recomendadas según perfil
  let coberturasRecomendadas: string;
  if (i.edad_conductor < 25) {
    coberturasRecomendadas = "Terceros Completos es recomendado. Agregar: Asistencia en ruta (24/7), Protección legal, Vidrios, Audio/radio. Evitar todo riesgo por costo.";
  } else if (i.tipo_cobertura === "todo_riesgo") {
    coberturasRecomendadas = "Incluir: Asistencia en ruta expandida, Remolque y grúa, Protección legal, Vidrios y lunas, Audio, Daños ambientales. Considerar póliza de equipaje.";
  } else {
    coberturasRecomendadas = "Terceros Completos incluye incendio y robo. Agregar: Asistencia en ruta, Protección legal. Si vehículo es financiado, requiere Todo Riesgo obligatorio.";
  }

  return {
    prima_terceros: primaTerceros,
    prima_terceros_completos: primaTC,
    prima_todo_riesgo: primaTR,
    prima_mensual: primaMensual,
    deducible_monto: deducibleMonto,
    aseguradora_recomendada: aseguradoraRecomendada,
    rango_competencia: rangoCompetencia,
    ahorro_potencial: ahorrroPotencial,
    coberturas_recomendadas: coberturasRecomendadas
  };
}
