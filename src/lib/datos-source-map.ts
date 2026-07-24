// datos-source-map.ts
// ───────────────────────────────────────────────────────────────────────────
// Mapea cada calc a su página-dato citable (/datos-*) cuando hay un match
// temático claro. Objetivo: que cada calc enlace a la fuente de datos canónica
// del sitio (Dataset + CC-BY) → concentra autoridad temática en las /datos-*
// (lo que premia el grounding de Gemini/AI Overviews) y crea el asset de
// backlinks. Ver memoria "AI visibility: los ceros son todos de Google".
//
// REGLA DE ORO: precisión > recall. Es mejor NO linkear que linkear mal.
// Por eso los temas ambiguos ("ganancia" profit vs Impuesto a las Ganancias,
// "anses" asignación vs topes SIPA) llevan anclas fiscales obligatorias.
//
// USO (additive — no toca CalcLayoutV2; el render va aparte, ver snippet):
//   import { getDatosSource } from '../lib/datos-source-map';
//   const datosSource = getDatosSource(calc);
//   {datosSource && (<a href={datosSource.url}>{datosSource.label}</a>)}

export interface DatosSource {
  url: string;
  label: string;
}

// Subconjunto de campos del calc que usamos para el match (evita acoplar al
// tipo de la content collection).
export interface CalcLike {
  slug?: string;
  seoKeywords?: string[];
  category?: string;
  audience?: string;
  h1?: string;
  title?: string;
}

// Normaliza: minúsculas + sin acentos + guiones/underscores → espacio. Lo
// último permite que una frase ("aportes patronales") matchee tanto en los
// keywords ("aportes patronales") como en el slug ("aportes-patronales").
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[-_]+/g, ' ');
}

// "Haystack" del calc: slug + keywords + categoría + h1/title.
function haystackOf(calc: CalcLike): string {
  return normalize(
    [
      calc.slug || '',
      (calc.seoKeywords || []).join(' '),
      calc.category || '',
      calc.h1 || '',
      calc.title || '',
    ].join(' '),
  );
}

// audience del calc normalizada. Root/global/AR = contexto argentino (las
// páginas-dato AR aplican a esos calcs).
function audOf(calc: CalcLike): string {
  return (calc.audience || '').toUpperCase();
}
const isAR = (a: string) => a === '' || a === 'AR' || a === 'GLOBAL';

interface Rule {
  test: (h: string, a: string) => boolean;
  source: DatosSource;
}

// Orden = prioridad (primer match gana). Lo más específico primero.
const RULES: Rule[] = [
  // ── Bienes Personales (muy específico, sin ambigüedad) ──
  {
    test: (h, a) => isAR(a) && /bienes personales/.test(h),
    source: { url: '/datos-bienes-personales-2026', label: 'Bienes Personales 2026: mínimo no imponible y alícuotas' },
  },

  // ── Aguinaldo / SAC (AR/global; el aguinaldo MX cae más abajo en su país) ──
  {
    test: (h, a) =>
      isAR(a) &&
      /(aguinaldo|sueldo anual complementario|\bsac\b)/.test(h) &&
      // Excluye calcs de compras que sólo mencionan "aguinaldo" como fuente de gasto.
      !/cyber monday|black friday|hot sale|cuotas sin interes/.test(h),
    source: { url: '/datos-aguinaldo-2026', label: 'Aguinaldo (SAC) 2026: cálculo, topes y fechas' },
  },

  // ── Impuesto a las Ganancias (TIGHT: "ganancias" + ancla fiscal, o
  //    "ganancia"+"impuesto" juntos). Excluye nft/roi/tiktok/streamer/plazo-fijo
  //    donde "ganancia" = profit, no el tributo. ──
  {
    test: (h, a) =>
      isAR(a) &&
      // Anclas ESPECÍFICAS de Ganancias (sin "impuesto"/"sueldo" pelados, que
      // arrastraban otros tributos), o "ganancia(s)" pegado a "impuesto".
      ((/ganancias/.test(h) &&
        /(4ta|cuarta|segunda|2da|deduccion|retencion|siradig|rg.?830|cedular|tramos|monotributista|categoria|escala)/.test(
          h,
        )) ||
        /(impuesto[^.]{0,25}ganancia|ganancia[^.]{0,25}impuesto)/.test(h)) &&
      // Excluye otros impuestos / profit que mencionan "ganancias" de pasada.
      !/margen|markup|reventa|impuesto pais|percepcion.{0,15}dolar|impuesto al cheque|debitos y creditos|leasing/.test(
        h,
      ),
    source: { url: '/datos-ganancias-2026', label: 'Impuesto a las Ganancias 2026: escalas, mínimos y deducciones' },
  },

  // ── Monotributo (AR/global) ──
  {
    test: (h, a) => isAR(a) && /monotributo/.test(h),
    source: { url: '/datos-monotributo-2026', label: 'Monotributo 2026: categorías, topes y cuotas' },
  },

  // ── Topes / aportes SIPA (TIGHT: SOLO aportes/cargas/topes/años de aporte.
  //    NO asignaciones, pensiones, préstamos ni jubilaciones provinciales). ──
  {
    test: (h, a) =>
      isAR(a) &&
      // NUNCA "aportes" ni "base imponible" pelados (matchean ahorro/PPF/SMVM).
      // Solo frases calificadas, "años/edad de aporte" (historial para jubilarse)
      // o costo laboral del empleado (que sí usan la base imponible de aportes).
      // "jubila"+"aporte" suelto NO: arrastraba "pensión sin aportes" y
      // "aporte mensual a fondo de retiro".
      (/(aportes patronales|aportes jubilatorios|aportes previsionales|aportes y contribuciones|cargas sociales|\bsipa\b|autonomos categor|moratoria previsional|descuento jubilatorio|costo laboral)/.test(
        h,
      ) ||
        /base imponible (maxima|aporte|previsional|jubilat)/.test(h) ||
        /anos\s*(de\s*)?aporte/.test(h) ||
        /edad.{0,12}aporte/.test(h) ||
        /aportes? para jubilar/.test(h) ||
        (/costo (total |real |de |del )?empleado/.test(h) && /(argentina|cargas|aporte)/.test(h))),
    source: { url: '/datos-topes-sipa-2026', label: 'Topes y aportes SIPA 2026 (base imponible máxima)' },
  },

  // ── Páginas-dato de país que estaban HUÉRFANAS (0 links entrantes en todo el
  //    sitio, auditoría de internal linking 2026-07-24). Van ANTES de las reglas
  //    genéricas de salario mínimo del mismo país para ganar el match. ──
  {
    // UMA/IMSS México: base de casi todo cálculo fiscal y de seguridad social MX.
    test: (h, a) => a === 'MX' && /(\buma\b|\bimss\b|infonavit|cuota obrero|cuotas patronales|\bisr\b|prima de antiguedad)/.test(h),
    source: { url: '/mx/datos-uma-imss-2026', label: 'UMA 2026 y cuotas IMSS (valores diario, mensual y anual)' },
  },
  {
    // SOAT / UIT / ITF Perú.
    test: (h, a) => a === 'PE' && /(\bsoat\b|\buit\b|\bitf\b|multa|papeleta|revision tecnica|impuesto)/.test(h),
    source: { url: '/pe/datos-soat-uit-peru-2026', label: 'SOAT, UIT e ITF en Perú 2026 (valores oficiales)' },
  },
  {
    // Tabla de pensión alimenticia Ecuador (tabla oficial del CNJ).
    test: (h, a) => a === 'EC' && /(pension alimenticia|pension de alimentos|manutencion|alimentos.{0,15}hijo)/.test(h),
    source: { url: '/ec/datos-pension-alimenticia-ecuador-2026', label: 'Tabla de pensión alimenticia Ecuador 2026' },
  },
  {
    // IPCA Brasil (serie histórica) — inflación de referencia para calcs BR.
    test: (h, a) => a === 'BR' && /(ipca|inflacao|inflacion|correcao monetaria|reajuste|poder de compra|aluguel)/.test(h),
    source: { url: '/pt/dados-ipca-brasil-historico', label: 'IPCA Brasil: série histórica mensal e acumulado' },
  },

  // ── Salario mínimo por país (audience-scoped) ──
  {
    test: (h, a) => a === 'CO' && /(sueldo|salario|smmlv|minimo|nomina)/.test(h),
    source: { url: '/co/datos-salario-minimo-colombia-2026', label: 'Salario mínimo Colombia 2026 (SMMLV)' },
  },
  {
    test: (h, a) => a === 'MX' && /(sueldo|salario|aguinaldo|minimo|nomina|finiquito)/.test(h),
    source: { url: '/mx/datos-salario-minimo-mexico-2026', label: 'Salario mínimo México 2026' },
  },
  {
    test: (h, a) => a === 'PE' && /(sueldo|salario|\brmv\b|minimo)/.test(h),
    source: { url: '/pe/datos-sueldo-minimo-peru-2026', label: 'Sueldo mínimo Perú 2026 (RMV)' },
  },
  {
    test: (h, a) => a === 'CL' && /(sueldo|salario|minimo|\bimm\b|ingreso minimo)/.test(h),
    source: { url: '/cl/datos-sueldo-chile-2026', label: 'Sueldo mínimo Chile 2026 (IMM)' },
  },
  {
    test: (h, a) => a === 'ES' && /(autonomo|cuota|cotizacion)/.test(h),
    source: { url: '/es/datos-cuota-autonomos-2026', label: 'Cuota de autónomos 2026 (España)' },
  },
  {
    test: (h, a) => a === 'EC' && /(sueldo|salario|basico|minimo)/.test(h),
    source: { url: '/datos-salario-basico-ecuador-2026', label: 'Salario básico unificado Ecuador 2026' },
  },

  // ── Salario mínimo LATAM (genérico/comparativo; baja recall a propósito) ──
  {
    test: (h) => /salario minimo/.test(h) && /(latam|america latina|paises|comparac|comparativ)/.test(h),
    source: { url: '/datos-salario-minimo-latam-2026', label: 'Salario mínimo en LATAM 2026 (comparativa por país)' },
  },
];

/**
 * Devuelve la página-dato canónica para un calc, o null si no hay match claro.
 * Pensado para renderizar como "Fuente de datos" en el panel Fuentes.
 */
export function getDatosSource(calc: CalcLike): DatosSource | null {
  if (!calc) return null;
  const h = haystackOf(calc);
  const a = audOf(calc);
  for (const r of RULES) {
    if (r.test(h, a)) return r.source;
  }
  return null;
}
