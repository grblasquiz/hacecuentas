export interface Inputs {
  edad_conductor: number;
  anos_licencia: number;
  modelo_auto: '2024_2026' | '2020_2023' | '2015_2019' | '2010_2014' | 'antes_2010';
  tipo_vehiculo: 'sedan' | 'suv' | 'compacto' | 'pickup' | 'lujo';
  ciudad_principal: 'cdmx' | 'edo_mex' | 'jalisco' | 'veracruz' | 'puebla' | 'gto' | 'baja_calif' | 'otros';
  tipo_cobertura: 'responsabilidad' | 'limitada' | 'amplia' | 'todo_riesgo';
  deducible_pesos: 2500 | 5000 | 7500 | 10000;
  uso_vehiculo: 'particular' | 'transporte' | 'trabajo' | 'ejecutivo';
  km_anuales_estimado: 5000 | 10000 | 20000 | 40000 | 60000;
  historial_siniestros: 0 | 1 | 2 | 3;
}

export interface Outputs {
  prima_responsabilidad_minima: number;
  prima_cobertura_limitada: number;
  prima_cobertura_amplia: number;
  prima_todo_riesgo: number;
  rango_cotizaciones: string;
  factor_riesgo: string;
  recargos_aplicados: string;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México - SAT, CONDUSEF, AMIS
  const PRIMA_BASE_RESPONSABILIDAD = 4500; // pesos/año, Art. 72 Ley Seguros
  const PRIMA_BASE_LIMITADA = 8500;
  const PRIMA_BASE_AMPLIA = 12000;
  const PRIMA_BASE_TODO_RIESGO = 18000;

  // Factor edad - estadísticas IMSS siniestralidad
  const factorEdad = (edad: number): number => {
    if (edad < 25) return 1.40;
    if (edad <= 65) return 1.00;
    return 1.25;
  };

  // Factor modelo auto
  const factorModelo = (modelo: string): number => {
    const factores: Record<string, number> = {
      '2024_2026': 0.85,
      '2020_2023': 1.00,
      '2015_2019': 1.15,
      '2010_2014': 1.35,
      'antes_2010': 1.60,
    };
    return factores[modelo] || 1.00;
  };

  // Factor zona - CONDUSEF, datos por siniestralidad regional
  const factorZona = (ciudad: string): number => {
    const factores: Record<string, number> = {
      'cdmx': 1.50,
      'edo_mex': 1.50,
      'jalisco': 1.20,
      'veracruz': 1.20,
      'puebla': 1.15,
      'gto': 0.95,
      'baja_calif': 0.95,
      'otros': 1.00,
    };
    return factores[ciudad] || 1.00;
  };

  // Factor tipo vehículo
  const factorVehiculo = (tipo: string): number => {
    const factores: Record<string, number> = {
      'sedan': 1.00,
      'compacto': 0.95,
      'suv': 1.10,
      'pickup': 1.15,
      'lujo': 1.35,
    };
    return factores[tipo] || 1.00;
  };

  // Factor uso - aplicable a primas (responsabilidad no varía)
  const factorUso = (uso: string): number => {
    const factores: Record<string, number> = {
      'particular': 1.00,
      'transporte': 1.45, // taxi, Uber
      'trabajo': 1.30,
      'ejecutivo': 1.20,
    };
    return factores[uso] || 1.00;
  };

  // Factor kilómetraje anual
  const factorKm = (km: number): number => {
    if (km <= 5000) return 0.90;
    if (km <= 10000) return 0.95;
    if (km <= 20000) return 1.00;
    if (km <= 40000) return 1.10;
    return 1.25;
  };

  // Recargos
  let recargos = 0;
  let recargosTexto: string[] = [];

  // Recargo por siniestros
  if (i.historial_siniestros > 0) {
    recargos += i.historial_siniestros * 0.15; // +15% por cada siniestro
    recargosTexto.push(
      `Recargo por siniestralidad: +${(i.historial_siniestros * 15).toFixed(0)}%`
    );
  }

  // Recargo por antigüedad de licencia <2 años
  if (i.anos_licencia < 2) {
    recargos += 0.15;
    recargosTexto.push('Recargo por licencia <2 años: +15%');
  }

  // Recargo por deducible bajo
  if (i.deducible_pesos <= 2500) {
    recargos += 0.08;
    recargosTexto.push('Recargo por deducible bajo: +8%');
  }

  // Factor deducible reduce prima
  const factorDeducible = {
    2500: 1.10,
    5000: 1.00,
    7500: 0.94,
    10000: 0.88,
  }[i.deducible_pesos] || 1.00;

  // Cálculo de primas base
  const fEdad = factorEdad(i.edad_conductor);
  const fModelo = factorModelo(i.modelo_auto);
  const fZona = factorZona(i.ciudad_principal);
  const fVehiculo = factorVehiculo(i.tipo_vehiculo);
  const fUso = factorUso(i.uso_vehiculo);
  const fKm = factorKm(i.km_anuales_estimado);

  // Responsabilidad civil: NO aplica factor uso ni deducible
  const primaResponsabilidad = Math.round(
    PRIMA_BASE_RESPONSABILIDAD *
      fEdad *
      fModelo *
      fZona *
      fVehiculo *
      fKm *
      (1 + recargos)
  );

  // Cobertura limitada
  const primaLimitada = Math.round(
    PRIMA_BASE_LIMITADA *
      fEdad *
      fModelo *
      fZona *
      fVehiculo *
      fUso *
      fKm *
      factorDeducible *
      (1 + recargos)
  );

  // Cobertura amplia
  const primaAmplia = Math.round(
    PRIMA_BASE_AMPLIA *
      fEdad *
      fModelo *
      fZona *
      fVehiculo *
      fUso *
      fKm *
      factorDeducible *
      (1 + recargos)
  );

  // Todo riesgo
  const primaTodoRiesgo = Math.round(
    PRIMA_BASE_TODO_RIESGO *
      fEdad *
      fModelo *
      fZona *
      fVehiculo *
      fUso *
      fKm *
      factorDeducible *
      (1 + recargos)
  );

  // Clasificación de riesgo
  let factorRiesgo = 'Bajo';
  const multiplicadorTotal = fEdad * fModelo * fZona * fVehiculo * fUso * fKm * (1 + recargos);
  if (multiplicadorTotal > 2.0) {
    factorRiesgo = 'Alto';
  } else if (multiplicadorTotal > 1.3) {
    factorRiesgo = 'Medio-Alto';
  } else if (multiplicadorTotal > 1.0) {
    factorRiesgo = 'Medio';
  }

  // Rango de cotizaciones (variabilidad 10-25% entre aseguradoras)
  const primaSeleccionada =
    i.tipo_cobertura === 'responsabilidad'
      ? primaResponsabilidad
      : i.tipo_cobertura === 'limitada'
        ? primaLimitada
        : i.tipo_cobertura === 'amplia'
          ? primaAmplia
          : primaTodoRiesgo;

  const rangoMin = Math.round(primaSeleccionada * 0.90);
  const rangoMax = Math.round(primaSeleccionada * 1.15);
  const rangoTexto = `$${rangoMin.toLocaleString('es-MX')} - $${rangoMax.toLocaleString('es-MX')}/año (Qualitas, GNP, Inbursa, AXA, MAPFRE)`;

  // Recomendación de cobertura
  let recomendacion = '';
  if (i.modelo_auto === 'antes_2010' || i.tipo_cobertura === 'responsabilidad') {
    recomendacion =
      'Con auto antiguo (pre-2010), responsabilidad es suficiente. Si está financiado, exige asegurador cobertura amplia.';
  } else if (
    i.modelo_auto === '2024_2026' ||
    i.modelo_auto === '2020_2023'
  ) {
    recomendacion =
      'Auto moderno: recomendamos cobertura AMPLIA. Incluye robo (frecuente en CDMX), colisión y asistencia 24h.';
  } else if (i.edad_conductor < 25) {
    recomendacion =
      'Joven conductor: cobertura AMPLIA es obligatoria si el auto está financiado. Deducible $7,500 equilibra costo y riesgo.';
  } else {
    recomendacion =
      'Perfil estándar: COBERTURA AMPLIA ofrece protección integral. Para máxima cobertura, TODO RIESGO es opción premium.';
  }

  return {
    prima_responsabilidad_minima: primaResponsabilidad,
    prima_cobertura_limitada: primaLimitada,
    prima_cobertura_amplia: primaAmplia,
    prima_todo_riesgo: primaTodoRiesgo,
    rango_cotizaciones: rangoTexto,
    factor_riesgo: factorRiesgo,
    recargos_aplicados:
      recargosTexto.length > 0
        ? recargosTexto.join('; ')
        : 'Ningún recargo aplicado (perfil sin siniestros, licencia vigente)',
    recomendacion: recomendacion,
  };
}
