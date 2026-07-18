/**
 * Promedio de escolaridad — Universidad de la República (UdelaR), Uruguay.
 *
 * Escala vigente desde el 27-ene-2025: números enteros de 0 a 12.
 *   0 = Muy insuficiente · 1–2 = Insuficiente · 3–4 = Aceptable ·
 *   5–6–7 = Bueno · 8–9 = Muy bueno · 10–11–12 = Excelente.
 * La APROBACIÓN es con nota ≥ 3 (Aceptable).
 *
 * La escolaridad es el promedio PONDERADO POR CRÉDITOS de las actividades
 * APROBADAS: Σ(nota × créditos) ÷ Σ créditos. Se usa para becas del Fondo de
 * Solidaridad y requisitos académicos. Las actividades no aprobadas (nota < 3)
 * no computan en la escolaridad.
 *
 * Dos modos:
 *   - "promedio": calcula la escolaridad actual con las actividades aprobadas.
 *   - "que-necesito": dado un objetivo de promedio y los créditos que faltan,
 *     estima la nota promedio necesaria en lo restante:
 *       notaNecesaria = (objetivo × (créditosActuales + créditosRestantes)
 *                        − Σ(nota × créditos actuales)) / créditosRestantes
 *
 * Fuentes: UdelaR — Nueva escala de calificaciones.
 */

export interface Inputs {
  /** Notas separadas por coma (escala 0–12), ej: "10, 8, 12, 6". */
  notas: string;
  /** Créditos de cada actividad, en el mismo orden, ej: "12, 8, 10, 6". */
  creditos: string;
  /** "promedio" (por defecto) o "que-necesito". */
  modo?: string;
  /** Objetivo de promedio (solo modo "que-necesito"). */
  objetivoPromedio?: number | string;
  /** Créditos que te faltan por cursar (solo modo "que-necesito"). */
  creditosRestantes?: number | string;
}

export interface Outputs {
  promedio?: string;
  categoria?: string;
  totalCreditos?: number;
  notaNecesaria?: string;
  detalle: string;
  _insight?: any;
}

/** Parte una lista separada por coma/punto y coma/espacios en números (coma decimal admitida). */
function parseList(raw: string): number[] {
  return String(raw || '')
    .split(/[,;\s]+/)
    .filter((s) => s.length > 0)
    .map((s) => parseFloat(s.replace(',', '.')));
}

/** Número con hasta 2 decimales, formato rioplatense (coma decimal). */
function fmt(n: number): string {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

/** Categoría conceptual UdelaR según el promedio redondeado. */
function categoriaEscolaridad(prom: number): string {
  const r = Math.round(prom);
  if (r <= 0) return 'Muy insuficiente';
  if (r <= 2) return 'Insuficiente';
  if (r <= 4) return 'Aceptable';
  if (r <= 7) return 'Bueno';
  if (r <= 9) return 'Muy bueno';
  return 'Excelente';
}

export function compute(i: Inputs): Outputs {
  const notas = parseList(i.notas);
  const creditos = parseList(i.creditos);

  if (notas.length === 0 || notas.some(isNaN)) {
    throw new Error('Ingresá al menos una nota (escala 0 a 12), separadas por coma. Ej: 10, 8, 12, 6');
  }
  if (creditos.length === 0 || creditos.some(isNaN)) {
    throw new Error('Ingresá los créditos de cada actividad, separados por coma. Ej: 12, 8, 10, 6');
  }
  if (notas.length !== creditos.length) {
    throw new Error(`La cantidad de notas (${notas.length}) y de créditos (${creditos.length}) tiene que ser igual.`);
  }
  for (const n of notas) {
    if (n < 0 || n > 12) throw new Error(`La nota ${fmt(n)} está fuera de la escala UdelaR (0 a 12).`);
  }
  for (const c of creditos) {
    if (c <= 0) throw new Error(`Los créditos deben ser mayores a 0 (se obtuvo ${fmt(c)}).`);
  }

  // La escolaridad solo considera las actividades APROBADAS (nota ≥ 3).
  const aprobadas: Array<{ nota: number; cred: number }> = [];
  let reprobadas = 0;
  notas.forEach((n, idx) => {
    if (n >= 3) aprobadas.push({ nota: n, cred: creditos[idx] });
    else reprobadas++;
  });

  if (aprobadas.length === 0) {
    throw new Error('Ninguna actividad está aprobada (nota ≥ 3): la escolaridad se calcula solo con las aprobadas.');
  }

  const totalCreditos = aprobadas.reduce((a, x) => a + x.cred, 0);
  const sumaPond = aprobadas.reduce((a, x) => a + x.nota * x.cred, 0);
  const promedio = sumaPond / totalCreditos;
  const categoria = categoriaEscolaridad(promedio);
  const excluidasTxt =
    reprobadas > 0 ? ` Se excluyeron ${reprobadas} actividad(es) no aprobada(s) (nota < 3), que no computan en la escolaridad.` : '';

  const modo = String(i.modo || 'promedio');

  // ── Modo "¿qué nota necesito?" ──────────────────────────────────────────────
  if (modo === 'que-necesito') {
    const objetivo = Number(i.objetivoPromedio) || 0;
    const credRest = Number(i.creditosRestantes) || 0;
    if (objetivo <= 0 || objetivo > 12) {
      throw new Error('Ingresá un objetivo de promedio válido en la escala 0 a 12.');
    }
    if (credRest <= 0) {
      throw new Error('Ingresá los créditos que te quedan por cursar (mayores a 0).');
    }

    const notaNecesaria = (objetivo * (totalCreditos + credRest) - sumaPond) / credRest;

    let notaTxt: string;
    let msg: string;
    if (notaNecesaria > 12) {
      notaTxt = 'Imposible (> 12)';
      msg =
        `Para que tu escolaridad llegue a ${fmt(objetivo)} necesitarías promediar ${fmt(notaNecesaria)} en los ` +
        `${credRest} créditos restantes, pero la escala llega hasta 12: no es alcanzable solo con esas actividades. ` +
        `Escolaridad actual: ${fmt(promedio)} (${categoria}) sobre ${fmt(totalCreditos)} créditos.`;
    } else if (notaNecesaria <= 0) {
      notaTxt = 'Ya lo lográs';
      msg =
        `Tu escolaridad actual (${fmt(promedio)}) ya alcanza el objetivo de ${fmt(objetivo)}: aun con la nota mínima de ` +
        `aprobación en los ${credRest} créditos restantes mantenés el objetivo. Escolaridad actual: ${fmt(promedio)} (${categoria}).`;
    } else {
      notaTxt = fmt(notaNecesaria);
      msg =
        `Necesitás promediar ${fmt(notaNecesaria)} en los ${credRest} créditos restantes para que tu escolaridad llegue a ` +
        `${fmt(objetivo)}. Escolaridad actual: ${fmt(promedio)} (${categoria}) sobre ${fmt(totalCreditos)} créditos aprobados.${excluidasTxt}`;
    }

    return {
      notaNecesaria: notaTxt,
      promedio: fmt(promedio),
      categoria,
      totalCreditos,
      detalle: msg,
      _insight: {
        type: 'highlight',
        icon: '🎯',
        tone: 'info' as const,
        text:
          notaNecesaria > 12
            ? `Con tu escolaridad actual de **${fmt(promedio)}** y solo **${credRest} créditos** por delante, un objetivo de **${fmt(objetivo)}** queda fuera de alcance (haría falta más de 12). Bajá el objetivo o sumá más créditos.`
            : notaNecesaria <= 0
              ? `Tu escolaridad actual (**${fmt(promedio)}**) ya iguala o supera el objetivo de **${fmt(objetivo)}**: lo mantenés incluso aprobando raspando lo que te queda.`
              : `Para llegar a una escolaridad de **${fmt(objetivo)}** te alcanza con promediar **${fmt(notaNecesaria)}** en los **${credRest} créditos** que te faltan. Como pondera por créditos, esas actividades pesan según sus créditos.`,
      },
    };
  }

  // ── Modo "promedio" (escolaridad actual) ────────────────────────────────────
  const detalle =
    `Escolaridad ponderada por créditos: Σ(nota × créditos) ÷ Σ créditos = ${fmt(sumaPond)} ÷ ${fmt(totalCreditos)} = ` +
    `${fmt(promedio)} (${categoria}), sobre ${aprobadas.length} actividad(es) aprobada(s).${excluidasTxt}`;

  return {
    promedio: fmt(promedio),
    categoria,
    totalCreditos,
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🎓',
      tone: 'info' as const,
      text:
        `Tu promedio de escolaridad es **${fmt(promedio)}** (**${categoria}**) sobre **${fmt(totalCreditos)} créditos** aprobados. ` +
        `La escolaridad pondera por créditos: las actividades de más créditos pesan más que las de menos. ` +
        `Solo cuentan las aprobadas (nota ≥ 3); las no aprobadas quedan fuera del promedio.`,
    },
  };
}
