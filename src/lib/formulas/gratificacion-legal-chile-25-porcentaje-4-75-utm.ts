export interface Inputs {
  sueldo_mensual: number;
  modalidad: '25_remuneracion' | '30_utilidades';
  utilidades_anuales: number;
  region: 'metropolitana' | 'valparaiso' | 'ohiggins' | 'maule' | 'biobio' | 'araucania' | 'losrios' | 'loslagos' | 'aysen' | 'magallanes' | 'arica' | 'tarapaca' | 'antofagasta' | 'atacama' | 'coquimbo' | 'ñuble';
}

export interface Outputs {
  gratificacion_mensual_25: number;
  gratificacion_anual_25: number;
  gratificacion_mensual_30: number;
  gratificacion_anual_30: number;
  iusc_25_anual: number;
  iusc_30_anual: number;
  gratificacion_neta_25: number;
  gratificacion_neta_30: number;
  diferencia_modalidades: number;
  tope_maximo_umm: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile — Fuente: Banco Central de Chile
  const UMM_ENERO_2026 = 108250; // Unidad Monto Mensual enero 2026
  const TOPE_GRATIFICACION = 4.75 * UMM_ENERO_2026; // $513,875

  // Tasas IUSC por región — Fuente: SII 2026
  const iusc_rates: { [key in Inputs['region']]: number } = {
    metropolitana: 0.0095,
    valparaiso: 0.0095,
    ohiggins: 0.0095,
    maule: 0.0095,
    biobio: 0.0095,
    araucania: 0.0095,
    losrios: 0.0095,
    loslagos: 0.0095,
    aysen: 0.0144,
    magallanes: 0.0144,
    arica: 0.0095,
    tarapaca: 0.0144,
    antofagasta: 0.0144,
    atacama: 0.0095,
    coquimbo: 0.0095,
    ñuble: 0.0095
  };

  const iusc_rate = iusc_rates[i.region];

  // Validaciones básicas
  const sueldo_valido = Math.max(i.sueldo_mensual, UMM_ENERO_2026);
  const utilidades_validas = Math.max(i.utilidades_anuales, 0);

  // MODALIDAD 25% DE REMUNERACIÓN
  const gratificacion_sin_tope_25 = sueldo_valido * 0.25;
  const gratificacion_mensual_25 = Math.min(gratificacion_sin_tope_25, TOPE_GRATIFICACION);
  const gratificacion_anual_25 = gratificacion_mensual_25 * 12;
  const iusc_25_anual = gratificacion_anual_25 * iusc_rate;
  const gratificacion_neta_25 = gratificacion_anual_25 - iusc_25_anual;

  // MODALIDAD 30% DE UTILIDADES
  const gratificacion_anual_30 = utilidades_validas * 0.30;
  const gratificacion_mensual_30 = utilidades_validas > 0 ? gratificacion_anual_30 / 12 : 0;
  const iusc_30_anual = gratificacion_anual_30 * iusc_rate;
  const gratificacion_neta_30 = gratificacion_anual_30 - iusc_30_anual;

  // Diferencia (positivo = modalidad 30% es mayor)
  const diferencia_modalidades = gratificacion_neta_30 - gratificacion_neta_25;

  return {
    gratificacion_mensual_25: Math.round(gratificacion_mensual_25),
    gratificacion_anual_25: Math.round(gratificacion_anual_25),
    gratificacion_mensual_30: Math.round(gratificacion_mensual_30),
    gratificacion_anual_30: Math.round(gratificacion_anual_30),
    iusc_25_anual: Math.round(iusc_25_anual),
    iusc_30_anual: Math.round(iusc_30_anual),
    gratificacion_neta_25: Math.round(gratificacion_neta_25),
    gratificacion_neta_30: Math.round(gratificacion_neta_30),
    diferencia_modalidades: Math.round(diferencia_modalidades),
    tope_maximo_umm: Math.round(TOPE_GRATIFICACION)
  };
}
