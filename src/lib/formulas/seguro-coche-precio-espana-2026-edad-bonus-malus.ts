export interface Inputs {
  edad_conductor: number;
  anios_carnet: number;
  nivel_bonus_malus: number; // 1-14
  modalidad: 'terceros_basico' | 'terceros_ampliado' | 'todo_riesgo_franquicia' | 'todo_riesgo_sin_franquicia';
  segmento_coche: 'urbano' | 'turismo_bajo' | 'turismo_medio' | 'suv_medio' | 'premium' | 'deportivo';
  antiguedad_vehiculo: number;
  ccaa: string;
}

export interface Outputs {
  precio_minimo: number;
  precio_maximo: number;
  precio_medio: number;
  factor_bonus_malus_texto: string;
  factor_edad_texto: string;
  recomendacion: string;
  aviso_todo_riesgo: string;
}

export function compute(i: Inputs): Outputs {
  // --- Precios base por modalidad (mercado español 2026, perfil neutro)
  // Fuente: ICEA / DGSFP estadísticas seguro automóvil 2025-2026
  const BASE_MIN: Record<string, number> = {
    terceros_basico: 250,
    terceros_ampliado: 350,
    todo_riesgo_franquicia: 500,
    todo_riesgo_sin_franquicia: 700,
  };
  const BASE_MAX: Record<string, number> = {
    terceros_basico: 450,
    terceros_ampliado: 650,
    todo_riesgo_franquicia: 950,
    todo_riesgo_sin_franquicia: 1500,
  };

  const baseMin = BASE_MIN[i.modalidad] ?? 350;
  const baseMax = BASE_MAX[i.modalidad] ?? 650;

  // --- Factor segmento del vehículo
  // Fuente: tablas tarifarias comparadas ICEA 2024
  const FACTOR_SEGMENTO: Record<string, number> = {
    urbano: 0.85,
    turismo_bajo: 0.92,
    turismo_medio: 1.00,
    suv_medio: 1.10,
    premium: 1.30,
    deportivo: 1.55,
  };
  const factorSegmento = FACTOR_SEGMENTO[i.segmento_coche] ?? 1.00;

  // --- Factor bonus-malus (escala 1-14 referencia española)
  // Fuente: ICEA - Sistema bonus-malus del seguro del automóvil
  const FACTOR_BM: Record<number, number> = {
    1: 1.75,
    2: 1.40,
    3: 1.40,
    4: 1.15,
    5: 1.15,
    6: 1.05,
    7: 1.00,
    8: 0.95,
    9: 0.90,
    10: 0.85,
    11: 0.78,
    12: 0.72,
    13: 0.65,
    14: 0.58,
  };
  const nivelBM = Math.max(1, Math.min(14, Math.round(i.nivel_bonus_malus)));
  const factorBM = FACTOR_BM[nivelBM] ?? 1.00;

  // Texto descriptivo bonus-malus
  let factorBMTexto = '';
  if (nivelBM <= 1) {
    factorBMTexto = `Nivel ${nivelBM} (máximo malus): recargo del +75 % sobre la prima base.`;
  } else if (nivelBM <= 3) {
    factorBMTexto = `Nivel ${nivelBM} (malus elevado): recargo del +40 % sobre la prima base.`;
  } else if (nivelBM <= 5) {
    factorBMTexto = `Nivel ${nivelBM} (malus moderado): recargo del +15 % sobre la prima base.`;
  } else if (nivelBM === 6) {
    factorBMTexto = `Nivel ${nivelBM} (ligero recargo): +5 % sobre la prima base.`;
  } else if (nivelBM === 7) {
    factorBMTexto = `Nivel ${nivelBM} (neutro): sin descuento ni recargo.`;
  } else if (nivelBM === 8) {
    factorBMTexto = `Nivel ${nivelBM}: descuento del 5 % sobre la prima base.`;
  } else if (nivelBM === 9) {
    factorBMTexto = `Nivel ${nivelBM}: descuento del 10 % sobre la prima base.`;
  } else if (nivelBM === 10) {
    factorBMTexto = `Nivel ${nivelBM}: descuento del 15 % sobre la prima base.`;
  } else if (nivelBM === 11) {
    factorBMTexto = `Nivel ${nivelBM}: descuento del 22 % sobre la prima base.`;
  } else if (nivelBM === 12) {
    factorBMTexto = `Nivel ${nivelBM}: descuento del 28 % sobre la prima base.`;
  } else if (nivelBM === 13) {
    factorBMTexto = `Nivel ${nivelBM}: descuento del 35 % sobre la prima base.`;
  } else {
    factorBMTexto = `Nivel ${nivelBM} (máximo bonus): descuento del 42 % sobre la prima base.`;
  }

  // --- Factor edad y experiencia
  // Fuente: DGT Anuario Estadístico 2024 / tablas actuariales mercado español
  const edad = Math.max(18, Math.min(85, i.edad_conductor));
  const aniosCarnet = Math.max(0, Math.min(67, i.anios_carnet));

  let factorEdad = 1.00;
  let factorEdadTexto = '';

  if (edad < 21) {
    factorEdad = 1.60;
    factorEdadTexto = 'Conductor menor de 21 años: recargo del +60 % por alta siniestralidad estadística (DGT).';
  } else if (edad < 25) {
    factorEdad = 1.35;
    factorEdadTexto = 'Conductor de 21-24 años: recargo del +35 % por perfil de riesgo elevado (DGT).';
  } else if (edad < 30) {
    factorEdad = 1.15;
    factorEdadTexto = 'Conductor de 25-29 años: recargo del +15 % por experiencia limitada.';
  } else if (edad <= 65) {
    factorEdad = 1.00;
    factorEdadTexto = 'Conductor de 30-65 años: perfil estándar sin recargo por edad.';
  } else {
    factorEdad = 1.10;
    factorEdadTexto = 'Conductor mayor de 65 años: recargo del +10 % por estadística de siniestralidad.';
  }

  // Recargo adicional por carnet reciente (menos de 2 años)
  let factorCarnetNuevo = 1.00;
  if (aniosCarnet < 2) {
    factorCarnetNuevo = 1.20;
    factorEdadTexto += ' Carnet con menos de 2 años: recargo adicional del +20 %.';
  }

  const factorEdadTotal = factorEdad * factorCarnetNuevo;

  // --- Factor CCAA (siniestralidad y coste reparaciones)
  // Fuente: ICEA estadísticas geográficas siniestralidad 2024
  const FACTOR_CCAA: Record<string, number> = {
    madrid: 1.08,
    cataluna: 1.08,
    pais_vasco: 1.08,
    valencia: 1.05,
    baleares: 1.05,
    andalucia: 1.03,
    murcia: 1.03,
    canarias: 1.03,
    aragon: 1.00,
    asturias: 1.00,
    cantabria: 1.00,
    castilla_la_mancha: 1.00,
    castilla_leon: 1.00,
    extremadura: 1.00,
    galicia: 1.00,
    la_rioja: 1.00,
    navarra: 1.00,
    ceuta_melilla: 0.96,
  };
  const factorCCAA = FACTOR_CCAA[i.ccaa] ?? 1.00;

  // --- Cálculo final
  const factorTotal = factorSegmento * factorBM * factorEdadTotal * factorCCAA;

  const precioMinimo = Math.round(baseMin * factorTotal);
  const precioMaximo = Math.round(baseMax * factorTotal);
  const precioMedio = Math.round((precioMinimo + precioMaximo) / 2);

  // --- Recomendación según perfil
  let recomendacion = '';

  if (i.modalidad === 'terceros_basico') {
    if (edad < 25 || aniosCarnet < 2) {
      recomendacion = 'Con tu perfil de conductor novel, el terceros básico cubre únicamente la RC obligatoria. Valora el terceros ampliado: añade cobertura de robo, lunas e incendio por un sobrecoste habitualmente inferior a 150-200 €/año.';
    } else {
      recomendacion = 'El terceros básico es la opción más económica, adecuada para vehículos de bajo valor o uso muy ocasional. Si el coche tiene valor de mercado significativo, considera el terceros ampliado.';
    }
  } else if (i.modalidad === 'terceros_ampliado') {
    if (i.antiguedad_vehiculo <= 5) {
      recomendacion = 'Con un vehículo de ' + i.antiguedad_vehiculo + ' años, podrías valorar el todo riesgo con franquicia: protege tu inversión ante daños propios y el sobrecoste respecto al ampliado puede ser razonable.';
    } else {
      recomendacion = 'Para un vehículo de ' + i.antiguedad_vehiculo + ' años, el terceros ampliado es generalmente la opción más equilibrada entre coste y cobertura.';
    }
  } else if (i.modalidad === 'todo_riesgo_franquicia') {
    recomendacion = 'El todo riesgo con franquicia es una buena opción si tienes historial limpio y puedes asumir los primeros 150-600 € de un siniestro propio. La prima es un 15-30 % inferior al todo riesgo sin franquicia.';
  } else {
    recomendacion = 'El todo riesgo sin franquicia ofrece la cobertura máxima. Es especialmente recomendable en vehículos nuevos o de alta gama, y para conductores con alta exposición al riesgo de aparcamiento urbano.';
  }

  // --- Aviso sobre conveniencia del todo riesgo
  let avisoTodoRiesgo = '';
  const esTodoRiesgo = i.modalidad === 'todo_riesgo_franquicia' || i.modalidad === 'todo_riesgo_sin_franquicia';

  if (esTodoRiesgo) {
    if (i.antiguedad_vehiculo <= 4) {
      avisoTodoRiesgo = `Vehículo de ${i.antiguedad_vehiculo} año(s): el todo riesgo es generalmente aconsejable para proteger el valor del coche.`;
    } else if (i.antiguedad_vehiculo <= 7) {
      avisoTodoRiesgo = `Vehículo de ${i.antiguedad_vehiculo} años: valorar si la prima estimada (${precioMedio.toLocaleString('es-ES')} €/año) supera el 10-12 % del valor venal actual. Si es así, el terceros ampliado puede ser más eficiente.`;
    } else {
      avisoTodoRiesgo = `Vehículo de ${i.antiguedad_vehiculo} años: con esta antigüedad, el valor venal suele ser bajo y el todo riesgo raramente resulta económicamente rentable. Considera el terceros ampliado.`;
    }
  } else {
    if (i.antiguedad_vehiculo <= 3) {
      avisoTodoRiesgo = `Tu vehículo tiene solo ${i.antiguedad_vehiculo} año(s). Con un coche reciente, el todo riesgo con franquicia puede merecer la pena para cubrir daños propios: compara presupuestos.`;
    } else {
      avisoTodoRiesgo = `Para un vehículo de ${i.antiguedad_vehiculo} años con cobertura de terceros, la relación coste-beneficio es generalmente adecuada.`;
    }
  }

  return {
    precio_minimo: precioMinimo,
    precio_maximo: precioMaximo,
    precio_medio: precioMedio,
    factor_bonus_malus_texto: factorBMTexto,
    factor_edad_texto: factorEdadTexto,
    recomendacion,
    aviso_todo_riesgo: avisoTodoRiesgo,
  };
}
