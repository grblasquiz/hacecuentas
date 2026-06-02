/**
 * Clasificación NOVA del grado de procesamiento.
 */

export interface ProcesadosNovaClasificacionInputs {
  ingredientes: number;
  aditivos: string;
  casero: string;
  azucarOSalAgregada: string;
}

export interface ProcesadosNovaClasificacionOutputs {
  grupo: string;
  descripcion: string;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function procesadosNovaClasificacion(inputs: ProcesadosNovaClasificacionInputs): ProcesadosNovaClasificacionOutputs {
  const ing = Number(inputs.ingredientes);
  const aditivos = inputs.aditivos === 'si';
  const casero = inputs.casero === 'si';
  const agregado = inputs.azucarOSalAgregada === 'si';

  let grupo = '', desc = '', rec = '';

  if (aditivos && ing >= 5) {
    grupo = 'NOVA 4 — Ultraprocesado ⚠️';
    desc = 'Producto industrial con aditivos, >5 ingredientes. Hiperpalatable y poco saciante.';
    rec = 'Limitar a <20% de las calorías diarias. Asociado a obesidad, diabetes y cáncer.';
  } else if (ing >= 2 && agregado && !aditivos) {
    grupo = 'NOVA 3 — Procesado';
    desc = 'Comida tradicional con pocos ingredientes (NOVA 1 + sal/azúcar/aceite). Ej: pan, queso, conservas.';
    rec = 'Consumo moderado dentro de dieta balanceada.';
  } else if (ing <= 1 && agregado && !aditivos) {
    grupo = 'NOVA 2 — Ingrediente culinario';
    desc = 'Aceite, sal, azúcar, manteca usados para cocinar NOVA 1.';
    rec = 'Úsalos en moderación para cocinar NOVA 1.';
  } else if (ing <= 1 && !agregado && !aditivos) {
    grupo = 'NOVA 1 — Natural ✅';
    desc = 'Alimento en estado natural o mínimamente procesado (limpiado, secado, cortado).';
    rec = 'Base de una dieta saludable. Apuntá al 60-80% de las calorías diarias.';
  } else if (casero && !aditivos) {
    grupo = 'NOVA 3 — Procesado casero';
    desc = 'Preparación casera con ingredientes NOVA 1+2. Saludable.';
    rec = 'Excelente opción. Sumá verduras y granos enteros.';
  } else {
    grupo = 'NOVA 4 — Ultraprocesado ⚠️';
    desc = 'Probable ultraprocesado por combinación de aditivos o larga lista de ingredientes.';
    rec = 'Revisar etiqueta. Si ves E-XXX o >5 ingredientes, limitar consumo.';
  }

  const nova = grupo.startsWith('NOVA 4') ? 4 : grupo.startsWith('NOVA 3') ? 3 : grupo.startsWith('NOVA 2') ? 2 : 1;
  const tone = nova === 4 ? 'warn' : nova === 1 ? 'good' : 'neutral';
  const _insight = {
    title: 'Grado de procesamiento del alimento',
    text: nova === 4
      ? `Cae en **NOVA 4 (ultraprocesado)**: ${desc.toLowerCase()} ${rec}`
      : nova === 1
        ? `Es **NOVA 1 (natural)**: ${desc.toLowerCase()} ${rec}`
        : `Clasifica como **NOVA ${nova}**: ${desc.toLowerCase()} ${rec}`,
    tone,
    icon: nova === 4 ? '⚠️' : nova === 1 ? '🥦' : '🍞',
  };

  const _chart = {
    type: 'scale' as const,
    marker: nova,
    markerLabel: 'NOVA ' + nova,
    min: 0,
    segments: [
      { nombre: 'NOVA 1 · Natural', max: 1.5, color: '#86efac', colorDark: '#14532d' },
      { nombre: 'NOVA 2 · Culinario', max: 2.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'NOVA 3 · Procesado', max: 3.5, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'NOVA 4 · Ultraprocesado', max: 4.5, color: '#fca5a5', colorDark: '#7f1d1d' },
    ],
    ariaLabel: 'Escala de clasificación NOVA del 1 (natural) al 4 (ultraprocesado).',
  };

  return { grupo, descripcion: desc, recomendacion: rec, _insight, _chart };
}
