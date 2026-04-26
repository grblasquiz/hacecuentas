/** Edad recomendada transición cuna/colecho a cama según pediatras (informativo) */
export interface Inputs { edadActualMeses: number; alturaActualCm: number; saltaCunaSiNo: boolean; pesaMasDe18Kg: boolean; }
export interface Outputs { edadRecomendadaMinMeses: number; edadRecomendadaMaxMeses: number; senalRiesgoActual: boolean; mesesEsperaEstimados: number; explicacion: string; }
export function cunaColechoEdadTransicionCamaNinos(i: Inputs): Outputs {
  const edad = Number(i.edadActualMeses);
  const altura = Number(i.alturaActualCm) || 0;
  const salta = Boolean(i.saltaCunaSiNo);
  const pesado = Boolean(i.pesaMasDe18Kg);
  if (!edad || edad < 0) throw new Error('Ingresá la edad en meses');
  let minMeses = 24;
  let maxMeses = 36;
  if (altura >= 90 || salta || pesado) { minMeses = 18; maxMeses = 24; }
  const senal = salta || altura >= 90;
  const espera = Math.max(0, minMeses - edad);
  return {
    edadRecomendadaMinMeses: minMeses,
    edadRecomendadaMaxMeses: maxMeses,
    senalRiesgoActual: senal,
    mesesEsperaEstimados: espera,
    explicacion: `Edad orientativa de transición: ${minMeses}-${maxMeses} meses. ${senal ? 'Hay señales de riesgo (salta cuna o altura ≥90 cm) — considerar transición pronto.' : 'No hay señales urgentes.'} ${espera > 0 ? `Faltan ~${espera} meses para el rango sugerido.` : 'Ya está en el rango.'}`,
  };
}
