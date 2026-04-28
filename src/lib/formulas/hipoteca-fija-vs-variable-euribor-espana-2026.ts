export interface Inputs {
  precio_vivienda: number;
  porcentaje_entrada: number;
  plazo_anos: number;
  tipo_fijo: number;
  euribor_actual: number;
  diferencial_variable: number;
  euribor_escenario_bajada: number;
  euribor_escenario_subida: number;
}

export interface Outputs {
  capital_prestado: number;
  entrada_importe: number;
  cuota_fija_mensual: number;
  intereses_totales_fija: number;
  coste_total_fija: number;
  tipo_variable_actual: number;
  cuota_variable_actual: number;
  intereses_totales_variable_actual: number;
  cuota_variable_bajada: number;
  intereses_totales_variable_bajada: number;
  cuota_variable_subida: number;
  intereses_totales_variable_subida: number;
  diferencia_cuota_actual: number;
  diferencia_intereses_actual: number;
  recomendacion: string;
}

/**
 * Calcula la cuota mensual según el sistema de amortización francés (anualidad constante).
 * Fuente: Banco de España - Simulador hipotecario y Ley 5/2019 crédito inmobiliario.
 *
 * Fórmula: C * [r*(1+r)^n] / [(1+r)^n - 1]
 * donde r = tipo anual / 12, n = plazo en meses, C = capital prestado
 */
function cuotaMensual(capital: number, tinAnual: number, plazoMeses: number): number {
  if (capital <= 0 || plazoMeses <= 0) return 0;
  // Tipo de interés mensual
  const r = tinAnual / 100 / 12;
  if (r === 0) {
    // Sin intereses: amortización lineal pura
    return capital / plazoMeses;
  }
  const potencia = Math.pow(1 + r, plazoMeses);
  const cuota = capital * (r * potencia) / (potencia - 1);
  return Math.round(cuota * 100) / 100;
}

function interesTotales(cuota: number, plazoMeses: number, capital: number): number {
  const total = cuota * plazoMeses;
  return Math.round((total - capital) * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  // --- Validaciones y saneado de entradas ---
  const precioVivienda = Math.max(0, i.precio_vivienda ?? 250000);
  // Entrada mínima legal en España: 20% (Banco de España / Ley 5/2019)
  const pctEntrada = Math.min(Math.max(i.porcentaje_entrada ?? 20, 20), 80);
  const plazoAnos = [15, 20, 25, 30].includes(i.plazo_anos) ? i.plazo_anos : 25;
  const tipoFijo = Math.min(Math.max(i.tipo_fijo ?? 3.2, 0), 15);
  const euriborActual = Math.min(Math.max(i.euribor_actual ?? 2.9, -1), 10);
  const diferencial = Math.min(Math.max(i.diferencial_variable ?? 0.8, 0), 5);
  const euriborBajada = Math.min(Math.max(i.euribor_escenario_bajada ?? 2.0, -1), 10);
  const euriborSubida = Math.min(Math.max(i.euribor_escenario_subida ?? 4.5, -1), 12);

  // --- Cálculo del capital prestado ---
  const entradaImporte = Math.round(precioVivienda * pctEntrada / 100 * 100) / 100;
  const capitalPrestado = Math.round((precioVivienda - entradaImporte) * 100) / 100;
  const plazoMeses = plazoAnos * 12;

  // --- Hipoteca FIJA ---
  // Tipo fijo: TIN anual introducido por el usuario
  const cuotaFija = cuotaMensual(capitalPrestado, tipoFijo, plazoMeses);
  const interesesFija = interesTotales(cuotaFija, plazoMeses, capitalPrestado);
  const costeTotalFija = Math.round(cuotaFija * plazoMeses * 100) / 100;

  // --- Hipoteca VARIABLE - Escenario actual ---
  // Tipo variable = Euríbor 12m + diferencial (fuente: Banco de España)
  const tipoVariableActual = euriborActual + diferencial;
  const cuotaVariableActual = cuotaMensual(capitalPrestado, tipoVariableActual, plazoMeses);
  const interesesVariableActual = interesTotales(cuotaVariableActual, plazoMeses, capitalPrestado);

  // --- Hipoteca VARIABLE - Escenario bajada ---
  const tipoVariableBajada = euriborBajada + diferencial;
  const cuotaVariableBajada = cuotaMensual(capitalPrestado, tipoVariableBajada, plazoMeses);
  const interesesVariableBajada = interesTotales(cuotaVariableBajada, plazoMeses, capitalPrestado);

  // --- Hipoteca VARIABLE - Escenario subida ---
  const tipoVariableSubida = euriborSubida + diferencial;
  const cuotaVariableSubida = cuotaMensual(capitalPrestado, tipoVariableSubida, plazoMeses);
  const interesesVariableSubida = interesTotales(cuotaVariableSubida, plazoMeses, capitalPrestado);

  // --- Diferencias fija vs variable (escenario actual) ---
  // Positivo: la fija es más barata; negativo: la variable actual es más barata
  const diferenciasCuota = Math.round((cuotaFija - cuotaVariableActual) * 100) / 100;
  const diferenciasIntereses = Math.round((interesesFija - interesesVariableActual) * 100) / 100;

  // --- Recomendación orientativa ---
  // Lógica basada en margen entre tipos y riesgo de escenario subida
  let recomendacion = '';
  const margenFijaVsActual = tipoFijo - tipoVariableActual;
  const riesgoSubida = tipoVariableSubida - tipoFijo;

  if (margenFijaVsActual <= -0.5) {
    // La variable actual es significativamente más cara que la fija
    recomendacion =
      `La hipoteca fija al ${tipoFijo.toFixed(2)}% resulta más económica que la variable actual (${tipoVariableActual.toFixed(2)}%). ` +
      `Ofrece estabilidad y menor coste en el escenario actual. Recomendable si valoras la certeza en tu presupuesto mensual.`;
  } else if (margenFijaVsActual >= 0.5) {
    // La variable actual es significativamente más barata que la fija
    if (riesgoSubida > 1.5) {
      recomendacion =
        `La variable es ${Math.abs(margenFijaVsActual).toFixed(2)} puntos más barata ahora, pero en el escenario de subida ` +
        `(Euríbor ${euriborSubida.toFixed(2)}%) la cuota sube hasta ${cuotaVariableSubida.toFixed(0)} €/mes (+${(cuotaVariableSubida - cuotaFija).toFixed(0)} € vs fija). ` +
        `Si tu presupuesto soporta esa variación, la variable puede ahorrar intereses; si no, la fija da seguridad.`;
    } else {
      recomendacion =
        `La hipoteca variable es ${Math.abs(margenFijaVsActual).toFixed(2)} puntos más barata en el escenario actual ` +
        `y el riesgo de subida es moderado. Puede ser la opción más eficiente si el Euríbor se mantiene estable o baja.`;
    }
  } else {
    // Tipos muy similares
    recomendacion =
      `Los tipos fijo (${tipoFijo.toFixed(2)}%) y variable actual (${tipoVariableActual.toFixed(2)}%) son muy similares. ` +
      `La hipoteca fija elimina el riesgo de revisiones al alza; la variable puede beneficiarse de bajadas del Euríbor. ` +
      `Valora tu tolerancia al riesgo y la estabilidad de tus ingresos.`;
  }

  return {
    capital_prestado: capitalPrestado,
    entrada_importe: entradaImporte,
    cuota_fija_mensual: cuotaFija,
    intereses_totales_fija: interesesFija,
    coste_total_fija: costeTotalFija,
    tipo_variable_actual: Math.round(tipoVariableActual * 100) / 100,
    cuota_variable_actual: cuotaVariableActual,
    intereses_totales_variable_actual: interesesVariableActual,
    cuota_variable_bajada: cuotaVariableBajada,
    intereses_totales_variable_bajada: interesesVariableBajada,
    cuota_variable_subida: cuotaVariableSubida,
    intereses_totales_variable_subida: interesesVariableSubida,
    diferencia_cuota_actual: diferenciasCuota,
    diferencia_intereses_actual: diferenciasIntereses,
    recomendacion
  };
}
