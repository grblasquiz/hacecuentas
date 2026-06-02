/** Edad recomendada transición cuna/colecho a cama según pediatras (informativo) */
export interface Inputs { edadActualMeses: number; alturaActualCm: number; saltaCunaSiNo: boolean; pesaMasDe18Kg: boolean; }
export interface Outputs { edadRecomendadaMinMeses: number; edadRecomendadaMaxMeses: number; senalRiesgoActual: boolean; mesesEsperaEstimados: number; explicacion: string; _insight?: any; _chart?: any; }
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

  const yaEnRango = edad >= minMeses;
  const _insight = {
    title: senal ? 'Señales de transición' : yaEnRango ? 'Ya está en el rango' : 'Todavía hay margen',
    text: senal
      ? `Con **${edad} meses** y señales de riesgo (salta la cuna o mide ≥90 cm), conviene encarar la transición **pronto**, dentro del rango ${minMeses}-${maxMeses} meses.`
      : yaEnRango
      ? `Con **${edad} meses** ya entrás en el rango orientativo de **${minMeses}-${maxMeses} meses**: podés iniciar la transición cuando lo veas listo.`
      : `Con **${edad} meses** todavía falta: el rango sugerido arranca a los **${minMeses} meses**, o sea ~**${espera} meses** más. Sin apuro.`,
    tone: senal ? 'warn' : yaEnRango ? 'good' : 'neutral',
    icon: '🛏️',
  };

  // Escala de edad: dónde cae el niño respecto del rango recomendado
  const _chart = {
    type: 'scale',
    marker: edad,
    markerLabel: `${edad} meses`,
    min: 0,
    segments: [
      { nombre: 'Temprano', max: minMeses, color: '#93c5fd', colorDark: '#1e3a8a' },
      { nombre: 'Rango sugerido', max: maxMeses, color: '#86efac', colorDark: '#14532d' },
      { nombre: 'Pasado el rango', max: Math.max(maxMeses + 12, edad + 6), color: '#fcd34d', colorDark: '#78350f' },
    ],
    ariaLabel: `Edad actual ${edad} meses respecto del rango de transición ${minMeses} a ${maxMeses} meses`,
  };

  return {
    edadRecomendadaMinMeses: minMeses,
    edadRecomendadaMaxMeses: maxMeses,
    senalRiesgoActual: senal,
    mesesEsperaEstimados: espera,
    explicacion: `Edad orientativa de transición: ${minMeses}-${maxMeses} meses. ${senal ? 'Hay señales de riesgo (salta cuna o altura ≥90 cm) — considerar transición pronto.' : 'No hay señales urgentes.'} ${espera > 0 ? `Faltan ~${espera} meses para el rango sugerido.` : 'Ya está en el rango.'}`,
    _insight,
    _chart,
  };
}
