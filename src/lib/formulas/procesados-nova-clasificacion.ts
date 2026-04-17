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

  return { grupo, descripcion: desc, recomendacion: rec };
}
