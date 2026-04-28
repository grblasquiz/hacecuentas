// Calculadora Beca Erasmus+ 2026 — España
// Fuente cuantías UE: SEPIE KA131 2025-2026 (sepie.es)
// Fuente complemento MEC: MEFPD Convocatoria General Becas 2025-2026

export interface Inputs {
  pais_destino: 'grupo1' | 'grupo2' | 'grupo3';
  tipo_movilidad: 'estudios' | 'practicas';
  duracion_meses: number;
  beca_mec: 'si' | 'no';
  inclusion: 'si' | 'no';
}

export interface Outputs {
  cuantia_ue_mensual: number;
  complemento_practicas_mensual: number;
  complemento_mec_mensual: number;
  complemento_inclusion_mensual: number;
  total_mensual: number;
  total_estancia: number;
  desglose_texto: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2025-2026 (SEPIE KA131) ---
  // Cuantías UE base para modalidad estudios, por grupo de país
  const CUANTIA_UE_ESTUDIOS: Record<string, number> = {
    grupo1: 310, // Alto coste: Dinamarca, Finlandia, Suecia, Irlanda, Islandia, Liechtenstein, Noruega
    grupo2: 270, // Coste medio: Alemania, Francia, Italia, Países Bajos, Portugal, Bélgica, Austria, etc.
    grupo3: 230, // Coste bajo: Polonia, Bulgaria, Rumanía, Turquía, Chequia, Grecia, Croacia, etc.
  };

  // Suplemento por movilidad de prácticas (SMP) — igual para todos los grupos
  const SUPLEMENTO_PRACTICAS = 100; // €/mes — SEPIE KA131 2025-2026

  // Complemento MEC para becarios convocatoria general que realizan Erasmus
  const COMPLEMENTO_MEC = 200; // €/mes — MEFPD resolución convocatoria 2025-2026 (valor habitual)

  // Complemento de inclusión Erasmus+ (máximo orientativo SEPIE)
  const COMPLEMENTO_INCLUSION = 250; // €/mes — hasta este importe, sujeto a aprobación individual

  // --- Validación de entradas ---
  const duracion = Math.min(12, Math.max(2, Math.round(i.duracion_meses ?? 6)));
  const grupo = ['grupo1', 'grupo2', 'grupo3'].includes(i.pais_destino)
    ? i.pais_destino
    : 'grupo2';

  // --- Cálculo cuantía UE base mensual ---
  const cuantia_ue_mensual = CUANTIA_UE_ESTUDIOS[grupo] ?? 270;

  // --- Suplemento prácticas ---
  const complemento_practicas_mensual =
    i.tipo_movilidad === 'practicas' ? SUPLEMENTO_PRACTICAS : 0;

  // --- Complemento MEC ---
  const complemento_mec_mensual = i.beca_mec === 'si' ? COMPLEMENTO_MEC : 0;

  // --- Complemento inclusión ---
  const complemento_inclusion_mensual = i.inclusion === 'si' ? COMPLEMENTO_INCLUSION : 0;

  // --- Totales ---
  const total_mensual =
    cuantia_ue_mensual +
    complemento_practicas_mensual +
    complemento_mec_mensual +
    complemento_inclusion_mensual;

  const total_estancia = total_mensual * duracion;

  // --- Desglose en texto ---
  const lineas: string[] = [];

  const grupoNombre: Record<string, string> = {
    grupo1: 'Grupo 1 (alto coste)',
    grupo2: 'Grupo 2 (coste medio)',
    grupo3: 'Grupo 3 (coste bajo)',
  };
  const modalidadNombre = i.tipo_movilidad === 'practicas' ? 'prácticas' : 'estudios';

  lineas.push(
    `Subvención UE ${grupoNombre[grupo]} — ${modalidadNombre}: ${cuantia_ue_mensual.toLocaleString('es-ES')} €/mes`
  );

  if (complemento_practicas_mensual > 0) {
    lineas.push(`Suplemento prácticas (SMP): +${complemento_practicas_mensual.toLocaleString('es-ES')} €/mes`);
  }

  if (complemento_mec_mensual > 0) {
    lineas.push(`Complemento MEC (becario convocatoria general): +${complemento_mec_mensual.toLocaleString('es-ES')} €/mes`);
  }

  if (complemento_inclusion_mensual > 0) {
    lineas.push(
      `Complemento inclusión Erasmus+ (máx. orientativo): +${complemento_inclusion_mensual.toLocaleString('es-ES')} €/mes`
    );
  }

  lineas.push(
    `──────────────────────────────`
  );
  lineas.push(
    `Total mensual estimado: ${total_mensual.toLocaleString('es-ES')} €/mes`
  );
  lineas.push(
    `Total estancia (${duracion} mes${duracion !== 1 ? 'es' : ''}): ${total_estancia.toLocaleString('es-ES')} €`
  );
  lineas.push(
    `Nota: importes orientativos. La cuantía definitiva la fija tu universidad (ORI) en coordinación con el SEPIE.`
  );

  const desglose_texto = lineas.join('\n');

  return {
    cuantia_ue_mensual,
    complemento_practicas_mensual,
    complemento_mec_mensual,
    complemento_inclusion_mensual,
    total_mensual,
    total_estancia,
    desglose_texto,
  };
}
