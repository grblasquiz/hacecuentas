export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/*
 * Predicción de talla adulta en adolescentes
 *
 * Método 1 — Talla diana familiar (Mid-Parental Height, Tanner 1970):
 *   Varón: (talla_padre + talla_madre + 13) / 2
 *   Mujer:  (talla_padre + talla_madre - 13) / 2
 *   Intervalo de confianza 95%: ±10 cm alrededor de la talla diana.
 *
 * Método 2 — Proyección desde talla actual (tabla Bayley-Pinneau / WHO):
 *   Talla adulta estimada = talla_actual / (porcentaje_talla_adulta_por_edad / 100)
 *   Porcentaje según edad e sexo (tablas estándar WHO Growth Reference 5-19).
 *
 * Fuentes:
 *   - Tanner JM, Goldstein H, Whitehouse RH. Arch Dis Child 1970;45(244):755-762.
 *   - WHO Growth Reference 5-19 years. https://www.who.int/tools/growth-reference-data-for-5to19-years
 *   - Bayley N, Pinneau SR. J Pediatr 1952;40(4):423-441.
 */

// Porcentaje de talla adulta ya alcanzado por edad e sexo
// Fuente: tabla WHO Growth Reference 5-19 + Bayley-Pinneau (valores medios)
const PCT_ADULTO: { [sexo: string]: { [edad: number]: number } } = {
  'masculino': {
    8:  72, 9:  75, 10: 78, 11: 81, 12: 84, 13: 87,
    14: 91, 15: 95, 16: 98, 17: 99, 18: 99.5,
  },
  'femenino': {
    8:  80, 9:  84, 10: 88, 11: 92, 12: 95, 13: 97,
    14: 99, 15: 99.5, 16: 99.8, 17: 99.9, 18: 100,
  },
};

export function aumentoAlturaAdolescentePrediccion(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const tallaActual  = Number(i.talla_actual)  || 0;
  const tallaPadre   = Number(i.talla_padre)   || 0;
  const tallaMadre   = Number(i.talla_madre)   || 0;
  const edad         = Math.round(Number(i.edad) || 0);
  const sexo         = (i.sexo as string) || 'masculino';

  // ─── Validaciones básicas ───────────────────────────────────────────────────
  if (tallaActual < 80 || tallaActual > 220) {
    const msg = __lang === 'en'
      ? 'Current height must be between 80 and 220 cm.'
      : 'La talla actual debe estar entre 80 y 220 cm.';
    return { resultado: '—', talla_diana: '—', resumen: msg };
  }
  if (tallaPadre < 130 || tallaPadre > 230 || tallaMadre < 130 || tallaMadre > 220) {
    const msg = __lang === 'en'
      ? 'Parental heights must be in the 130–230 cm range.'
      : 'Las tallas de los padres deben estar entre 130 y 230 cm.';
    return { resultado: '—', talla_diana: '—', resumen: msg };
  }
  if (edad < 8 || edad > 18) {
    const msg = __lang === 'en'
      ? 'Age must be between 8 and 18 years.'
      : 'La edad debe estar entre 8 y 18 años.';
    return { resultado: '—', talla_diana: '—', resumen: msg };
  }

  // ─── Método 1: Talla diana familiar (Tanner 1970) ──────────────────────────
  const ajuste = sexo === 'masculino' ? 13 : -13;
  const tallaDiana = (tallaPadre + tallaMadre + ajuste) / 2;
  const diana_min = tallaDiana - 10;
  const diana_max = tallaDiana + 10;

  // ─── Método 2: Proyección desde talla actual + edad ────────────────────────
  const pctTabla = PCT_ADULTO[sexo] ?? PCT_ADULTO['masculino'];
  const pct = pctTabla[edad] ?? pctTabla[18];
  const tallaProyectada = (tallaActual / pct) * 100;

  // ─── Promedio de ambos métodos (estimación central) ────────────────────────
  const estimacionCentral = (tallaDiana + tallaProyectada) / 2;

  const fmt = (n: number) => n.toFixed(1);

  // ─── Textos según idioma ────────────────────────────────────────────────────
  let resumen: string;
  let insightText: string;

  if (__lang === 'en') {
    resumen =
      `Target height (genetics): ${fmt(diana_min)}–${fmt(diana_max)} cm | ` +
      `Projection from current height (age ${edad}): ${fmt(tallaProyectada)} cm | ` +
      `Estimated adult height: ~${fmt(estimacionCentral)} cm`;
    insightText =
      `Based on parental heights and current stature, the estimated adult height is **~${fmt(estimacionCentral)} cm**. ` +
      `Genetic target range: **${fmt(diana_min)}–${fmt(diana_max)} cm** (Tanner method). ` +
      `Projection from current height at age ${edad}: **${fmt(tallaProyectada)} cm**. ` +
      `This is an estimate — a pediatrician can refine the prediction using bone age (X-ray).`;
  } else {
    resumen =
      `Talla diana genética: ${fmt(diana_min)}–${fmt(diana_max)} cm | ` +
      `Proyección desde talla actual (edad ${edad}): ${fmt(tallaProyectada)} cm | ` +
      `Estimación talla adulta: ~${fmt(estimacionCentral)} cm`;
    insightText =
      `Según las tallas de ambos padres y la talla actual, la estimación de talla adulta es **~${fmt(estimacionCentral)} cm**. ` +
      `Rango diana genético: **${fmt(diana_min)}–${fmt(diana_max)} cm** (método Tanner). ` +
      `Proyección desde talla actual a los ${edad} años: **${fmt(tallaProyectada)} cm**. ` +
      `Es una estimación orientativa — el pediatra puede afinarla con edad ósea (radiografía de mano).`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Estimated adult height' : 'Talla adulta estimada',
    text: insightText,
    tone: 'info',
    icon: '📏',
  };

  return {
    resultado:   fmt(estimacionCentral) + ' cm',
    talla_diana: `${fmt(diana_min)}–${fmt(diana_max)} cm`,
    resumen,
    _insight,
  };
}
