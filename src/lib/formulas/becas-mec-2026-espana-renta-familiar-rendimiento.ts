export interface Inputs {
  renta_familiar: number;
  miembros_familia: number;
  tipo_estudios: 'universitario_grado' | 'universitario_master' | 'fp_grado_superior' | 'fp_grado_medio' | 'bachillerato';
  creditos_matriculados: number;
  nota_acceso: number;
}

export interface Outputs {
  tramo_renta: string;
  umbral_aplicable: number;
  cuantia_fija_renta: number;
  cuantia_fija_residencia: number;
  beca_matricula: number;
  cuantia_variable_orientativa: number;
  cuantia_total_estimada: number;
  requisito_academico: string;
  conclusion: string;
}

// ─── Umbrales oficiales MEC (convocatoria 2025-26, referencia 2026-27)
// Fuente: Ministerio de Educación, FP y Deportes — Convocatoria becas generales
// https://www.becaseducacion.gob.es/becas-y-ayudas/informacion-general/cuantias-umbrales.html
const UMBRALES: Record<number, { u1: number; u2: number; u3: number }> = {
  1: { u1: 8422,  u2: 13236, u3: 14112 },
  2: { u1: 13623, u2: 22594, u3: 24089 },
  3: { u1: 18884, u2: 30668, u3: 32697 },
  4: { u1: 24089, u2: 38413, u3: 46044 },
  5: { u1: 28189, u2: 43410, u3: 52543 },
  6: { u1: 31928, u2: 47808, u3: 58695 },
  7: { u1: 35483, u2: 52208, u3: 64849 },
  8: { u1: 38831, u2: 56303, u3: 70697 },
};

// Incremento por cada miembro adicional a partir del 9.º (umbral U3 orientativo)
const INCREMENTO_U3_ADICIONAL = 3391;
const INCREMENTO_U2_ADICIONAL = 4095;
const INCREMENTO_U1_ADICIONAL = 3348;

// Cuantías fijas (€/año) según tramo — Convocatoria MEC 2025-26
const CUANTIA_FIJA_U1 = 1700; // € — Tramo U1
const CUANTIA_FIJA_U2 = 1000; // € — Tramo U2
const CUANTIA_FIJA_U3 = 0;    // € — Tramo U3 (solo matrícula + variable)

// Cuantía fija de residencia orientativa (requiere acreditación)
const CUANTIA_RESIDENCIA = 2500; // € — Solo si reside fuera del domicilio

// Precio orientativo del crédito ECTS para beca de matrícula (media nacional)
// Fuente: Conferencia de Rectores de Universidades Españolas (CRUE) — precios medios
const PRECIO_CREDITO_MATRICULA: Record<string, number> = {
  universitario_grado:   18,  // €/crédito (media España, varía por CCAA: 12-35€)
  universitario_master:  24,  // €/crédito
  fp_grado_superior:     12,  // €/crédito orientativo (módulos FP)
  fp_grado_medio:        10,
  bachillerato:           0,  // No aplica beca de matrícula en este formato
};

// Créditos estándar por tipo de estudios si no se especifican
const CREDITOS_DEFAULT: Record<string, number> = {
  universitario_grado:   60,
  universitario_master:  60,
  fp_grado_superior:     60,
  fp_grado_medio:        60,
  bachillerato:           0,
};

// Cuantía variable orientativa (€/crédito) — depende del presupuesto y nº de solicitantes
const CUANTIA_VARIABLE_POR_CREDITO = 80; // €/crédito (valor central histórico)

// Nota media mínima exigida por rama de estudios (orientativa convocatoria MEC 2026)
function getRequisitoAcademico(tipo: string): { texto: string; notaMinima: number } {
  switch (tipo) {
    case 'universitario_grado':
      return {
        texto: 'Nota media mínima: 5,5 (Ingeniería/Arquitectura) — 6,0 (Ciencias/Salud) — 6,5 (Humanidades/CC.SS.)',
        notaMinima: 5.5,
      };
    case 'universitario_master':
      return {
        texto: 'Nota media mínima: 6,5 y máster habilitante u oficial de formación del profesorado',
        notaMinima: 6.5,
      };
    case 'fp_grado_superior':
      return {
        texto: 'Sin nota mínima de acceso; se exige haber superado ≥50% de los créditos/módulos del curso anterior',
        notaMinima: 0,
      };
    case 'fp_grado_medio':
      return {
        texto: 'Sin nota mínima de acceso; se exige haber superado ≥50% de los módulos del curso anterior',
        notaMinima: 0,
      };
    case 'bachillerato':
      return {
        texto: 'Sin nota mínima; se exige haber superado todas las materias del curso anterior',
        notaMinima: 0,
      };
    default:
      return { texto: 'Consulta la convocatoria oficial del MEC', notaMinima: 0 };
  }
}

function getUmbrales(miembros: number): { u1: number; u2: number; u3: number } {
  const m = Math.max(1, Math.round(miembros));
  if (m <= 8) {
    return UMBRALES[m];
  }
  // Extrapolar para familias de más de 8 miembros
  const base = UMBRALES[8];
  const extra = m - 8;
  return {
    u1: base.u1 + extra * INCREMENTO_U1_ADICIONAL,
    u2: base.u2 + extra * INCREMENTO_U2_ADICIONAL,
    u3: base.u3 + extra * INCREMENTO_U3_ADICIONAL,
  };
}

export function compute(i: Inputs): Outputs {
  // Validaciones y valores por defecto
  const renta = Math.max(0, i.renta_familiar || 0);
  const miembros = Math.min(20, Math.max(1, Math.round(i.miembros_familia || 4)));
  const tipo = i.tipo_estudios || 'universitario_grado';
  const creditos = i.creditos_matriculados > 0
    ? Math.min(120, i.creditos_matriculados)
    : CREDITOS_DEFAULT[tipo] || 60;
  const nota = Math.min(10, Math.max(0, i.nota_acceso || 0));

  const { u1, u2, u3 } = getUmbrales(miembros);
  const requisito = getRequisitoAcademico(tipo);

  // ─── Determinar tramo de renta ───────────────────────────────────────────
  let tramo_renta: string;
  let cuantia_fija_renta: number;

  if (renta <= u1) {
    tramo_renta = 'U1 — Tramo de renta máxima (cuantías más altas)';
    cuantia_fija_renta = CUANTIA_FIJA_U1;
  } else if (renta <= u2) {
    tramo_renta = 'U2 — Tramo de renta media';
    cuantia_fija_renta = CUANTIA_FIJA_U2;
  } else if (renta <= u3) {
    tramo_renta = 'U3 — Tramo de renta general (umbral máximo)';
    cuantia_fija_renta = CUANTIA_FIJA_U3;
  } else {
    tramo_renta = 'Sin derecho a beca — Renta supera el umbral U3';
    cuantia_fija_renta = 0;
  }

  const tiene_derecho = renta <= u3;

  // ─── Beca de matrícula ───────────────────────────────────────────────────
  // Solo para estudios universitarios y FP; se calcula sobre créditos × precio
  const precio_credito = PRECIO_CREDITO_MATRICULA[tipo] || 0;
  const beca_matricula = tiene_derecho && creditos > 0
    ? Math.round(creditos * precio_credito)
    : 0;

  // ─── Cuantía variable por rendimiento académico ──────────────────────────
  // Orientativa: créditos × valor_por_credito × factor_nota
  // Factor_nota: 1.0 si cumple mínimo, sube hasta ~1.3 con nota 9-10
  let cuantia_variable_orientativa = 0;
  if (tiene_derecho && creditos > 0 && tipo !== 'bachillerato') {
    const notaMinima = requisito.notaMinima;
    const cumpleNota = notaMinima === 0 || nota >= notaMinima;
    if (cumpleNota) {
      // Factor de nota: escala lineal 1.0 (nota mínima) → 1.3 (nota 10)
      const notaRef = notaMinima > 0 ? notaMinima : 5.0;
      const factorNota = notaMinima > 0 && nota > 0
        ? 1.0 + ((nota - notaRef) / (10 - notaRef)) * 0.3
        : 1.0;
      const factorAjustado = Math.min(1.3, Math.max(0.8, factorNota));
      cuantia_variable_orientativa = Math.round(
        creditos * CUANTIA_VARIABLE_POR_CREDITO * factorAjustado
      );
    } else {
      cuantia_variable_orientativa = 0;
    }
  }

  // ─── Cuantía de residencia (referencial, NO se suma al total automáticamente)
  // Se incluye como información; depende de acreditación de desplazamiento
  const cuantia_fija_residencia = tiene_derecho ? CUANTIA_RESIDENCIA : 0;

  // ─── Total estimado (sin residencia para ser conservador) ─────────────────
  const cuantia_total_estimada = tiene_derecho
    ? cuantia_fija_renta + beca_matricula + cuantia_variable_orientativa
    : 0;

  // ─── Conclusión ───────────────────────────────────────────────────────────
  let conclusion: string;
  if (!tiene_derecho) {
    conclusion = `Tu renta familiar (${renta.toLocaleString('es-ES')}€) supera el umbral U3 de ${u3.toLocaleString('es-ES')}€ para ${miembros} miembros. No cumples el requisito económico para la beca general MEC 2026-27. Consulta becas propias de tu comunidad autónoma o universidad.`;
  } else if (renta <= u1) {
    conclusion = `Tu renta (${renta.toLocaleString('es-ES')}€) está en el tramo U1 (≤${u1.toLocaleString('es-ES')}€). Cumples el requisito económico para las cuantías más altas. Cuantía total estimada: ${cuantia_total_estimada.toLocaleString('es-ES')}€ (+${cuantia_fija_residencia.toLocaleString('es-ES')}€ si resides fuera del domicilio familiar).`;
  } else if (renta <= u2) {
    conclusion = `Tu renta (${renta.toLocaleString('es-ES')}€) está en el tramo U2 (${u1.toLocaleString('es-ES')}€–${u2.toLocaleString('es-ES')}€). Cumples el requisito económico con cuantía fija reducida. Estimación: ${cuantia_total_estimada.toLocaleString('es-ES')}€ (+${cuantia_fija_residencia.toLocaleString('es-ES')}€ por residencia si aplica).`;
  } else {
    conclusion = `Tu renta (${renta.toLocaleString('es-ES')}€) está en el tramo U3 (${u2.toLocaleString('es-ES')}€–${u3.toLocaleString('es-ES')}€). Cumples el requisito económico mínimo: puedes optar a beca de matrícula y cuantía variable, pero no a la cuantía fija. Estimación: ${cuantia_total_estimada.toLocaleString('es-ES')}€.`;
  }

  return {
    tramo_renta,
    umbral_aplicable: u3,
    cuantia_fija_renta,
    cuantia_fija_residencia,
    beca_matricula,
    cuantia_variable_orientativa,
    cuantia_total_estimada,
    requisito_academico: requisito.texto,
    conclusion,
  };
}
