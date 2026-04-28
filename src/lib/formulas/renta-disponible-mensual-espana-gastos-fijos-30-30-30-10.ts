// Calculadora: Renta disponible mensual España — Regla 30/30/30/10
// Fuentes: INE EPF 2024, Banco de España 2025, AEAT 2026

export interface Inputs {
  salario_neto_mensual: number;         // Salario neto mensual en euros
  pagas_extra: '12' | '14';            // Número de pagas anuales
  coste_vivienda_real?: number;         // Coste real de vivienda mensual (opcional)
  comunidad_autonoma: string;           // Código de comunidad autónoma
}

export interface Outputs {
  renta_mensual_equivalente: number;    // Renta neta mensual equivalente en euros
  maximo_vivienda: number;             // 30% — máximo recomendado vivienda
  maximo_gastos_fijos: number;         // 30% — gastos fijos esenciales
  maximo_ocio: number;                 // 30% — ocio y discrecional
  minimo_ahorro: number;               // 10% — ahorro mínimo
  estado_vivienda: string;             // Evaluación textual del gasto en vivienda
  desviacion_vivienda: number;         // Desviación vs. límite (0 si sin dato real)
  alquiler_medio_ccaa: number;         // Alquiler medio de referencia en la CCAA
  salario_minimo_para_vivienda: number;// Salario neto mínimo para cubrir vivienda real al 30%
  ahorro_anual_proyectado: number;     // Ahorro acumulado en 12 meses al 10%
}

// --- Constantes: alquileres medios por comunidad autónoma ---
// Fuente: Banco de España / INE, Índice de Precios del Alquiler 2025
const ALQUILER_MEDIO_CCAA: Record<string, number> = {
  madrid: 1200,
  cataluna: 1050,
  pais_vasco: 850,
  comunitat_valenciana: 780,
  andalucia: 680,
  canarias: 720,
  aragon: 620,
  galicia: 560,
  castilla_leon: 530,
  murcia: 590,
  otras: 580,
};

// --- Constantes: porcentajes regla 30/30/30/10 ---
const PCT_VIVIENDA = 0.30;
const PCT_GASTOS_FIJOS = 0.30;
const PCT_OCIO = 0.30;
const PCT_AHORRO = 0.10;

// --- Función auxiliar: redondeo a 2 decimales ---
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  // 1. Validación y saneamiento de entradas
  const salarioNeto = Math.max(0, i.salario_neto_mensual || 0);
  const pagas = i.pagas_extra === '14' ? 14 : 12;
  const costeViviendaReal = (i.coste_vivienda_real !== undefined && i.coste_vivienda_real !== null)
    ? Math.max(0, i.coste_vivienda_real)
    : null;
  const ccaa = (i.comunidad_autonoma || 'otras').toLowerCase().trim();

  // 2. Renta mensual equivalente
  // Si el usuario introduce el neto de una nómina ordinaria con 14 pagas,
  // la renta mensual equivalente es: salario_neto_mensual × 14 / 12
  // Esto prorratea las dos pagas extra a lo largo del año.
  // Si ya tiene 12 pagas, no hay prorrateo (factor = 1).
  const factorProrrateo = pagas / 12; // 14/12 ≈ 1.1667, 12/12 = 1
  const rentaMensualEquivalente = redondear(salarioNeto * factorProrrateo);

  // 3. Distribución 30/30/30/10
  const maximoVivienda = redondear(rentaMensualEquivalente * PCT_VIVIENDA);
  const maximoGastosFijos = redondear(rentaMensualEquivalente * PCT_GASTOS_FIJOS);
  const maximoOcio = redondear(rentaMensualEquivalente * PCT_OCIO);
  const minimoAhorro = redondear(rentaMensualEquivalente * PCT_AHORRO);

  // 4. Alquiler medio de referencia en la comunidad autónoma
  const alquilerMedioCCAA = ALQUILER_MEDIO_CCAA[ccaa] ?? ALQUILER_MEDIO_CCAA['otras'];

  // 5. Análisis del coste real de vivienda (si se ha facilitado)
  let estadoVivienda: string;
  let desviacionVivienda: number;
  let salarioMinimoPara: number;

  if (costeViviendaReal !== null) {
    desviacionVivienda = redondear(costeViviendaReal - maximoVivienda);
    // Salario neto mensual mínimo para que la vivienda real sea ≤30%
    salarioMinimoPara = rentaMensualEquivalente > 0
      ? redondear(costeViviendaReal / PCT_VIVIENDA / factorProrrateo)
      : 0;

    if (costeViviendaReal <= maximoVivienda) {
      const margen = redondear(maximoVivienda - costeViviendaReal);
      estadoVivienda = `✅ Tu gasto en vivienda (${costeViviendaReal.toFixed(2)} €) está dentro del límite recomendado. Tienes un margen de ${margen.toFixed(2)} € respecto al máximo del 30%.`;
    } else if (desviacionVivienda <= maximoVivienda * 0.15) {
      // Desviación moderada: hasta un 15% por encima del límite
      estadoVivienda = `⚠️ Tu gasto en vivienda (${costeViviendaReal.toFixed(2)} €) supera el límite recomendado en ${desviacionVivienda.toFixed(2)} €. Es un esfuerzo elevado pero manejable si reduces el gasto discrecional.`;
    } else {
      estadoVivienda = `🔴 Tu gasto en vivienda (${costeViviendaReal.toFixed(2)} €) supera el límite recomendado en ${desviacionVivienda.toFixed(2)} €. El esfuerzo es alto: valora renegociar el alquiler, buscar compañero de piso o aumentar ingresos.`;
    }
  } else {
    desviacionVivienda = 0;
    // Salario mínimo para el alquiler medio de la CCAA como referencia
    salarioMinimoPara = redondear(alquilerMedioCCAA / PCT_VIVIENDA / factorProrrateo);
    estadoVivienda = `ℹ️ No has introducido tu coste real de vivienda. Introduce el importe de tu alquiler o cuota hipotecaria para obtener una evaluación personalizada.`;
  }

  // 6. Ahorro anual proyectado
  const ahorroAnualProyectado = redondear(minimoAhorro * 12);

  // 7. Protección contra entradas cero o inválidas
  if (rentaMensualEquivalente <= 0) {
    return {
      renta_mensual_equivalente: 0,
      maximo_vivienda: 0,
      maximo_gastos_fijos: 0,
      maximo_ocio: 0,
      minimo_ahorro: 0,
      estado_vivienda: 'Introduce un salario neto mensual válido para obtener los resultados.',
      desviacion_vivienda: 0,
      alquiler_medio_ccaa: alquilerMedioCCAA,
      salario_minimo_para_vivienda: 0,
      ahorro_anual_proyectado: 0,
    };
  }

  return {
    renta_mensual_equivalente: rentaMensualEquivalente,
    maximo_vivienda: maximoVivienda,
    maximo_gastos_fijos: maximoGastosFijos,
    maximo_ocio: maximoOcio,
    minimo_ahorro: minimoAhorro,
    estado_vivienda: estadoVivienda,
    desviacion_vivienda: desviacionVivienda,
    alquiler_medio_ccaa: alquilerMedioCCAA,
    salario_minimo_para_vivienda: salarioMinimoPara,
    ahorro_anual_proyectado: ahorroAnualProyectado,
  };
}
