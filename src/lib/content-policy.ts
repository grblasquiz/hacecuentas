/**
 * content-policy.ts — Política centralizada de riesgo YMYL.
 *
 * Punto único de verdad para decidir, a partir de los metadatos de una
 * calculadora, si:
 *   - es de riesgo alto y está "restringida" (dosis/tratamiento/retorno
 *     deportivo sin revisión profesional),
 *   - debe renderizarse `noindex`,
 *   - puede distribuirse (sitemap, buscador interno, feeds, relacionadas,
 *     populares/nuevas),
 *   - puede embeberse,
 *   - puede mostrar anuncios,
 *   - puede compartir/exportar resultados personalizados.
 *
 * REGLA DE ORO (spec Fase 1):
 *   Una calculadora es RESTRINGIDA cuando `ymylRisk === 'high'` y NO tiene
 *   un revisor profesional completo y válido. La restricción NO depende de
 *   que el JSON tenga `noindex: true` a mano — se deriva de la política.
 *
 * Las páginas restringidas siguen siendo accesibles por su URL original
 * (respondemos 200 con `noindex,follow`). NO se bloquean por robots.txt ni
 * se redirigen con 301, porque Google necesita rastrearlas para ver el
 * `noindex`.
 *
 * Este módulo es puro (sin side-effects, sin I/O) para poder usarse tanto
 * en el render de Astro como en los scripts de build (sitemap, search-index,
 * page-feed, related, llms) y en los tests.
 */

import { PRUNING_REDIRECTS } from './pruning-redirects.ts';
import { GONE_410_URLS } from './gone-410.ts';

// ---- Tipos de la política ----

export type YmylRisk = 'low' | 'medium' | 'high';
export type ReviewType = 'editorial' | 'professional';
export type DistributionMode = 'normal' | 'restricted';

/**
 * Revisor profesional real y verificable (médico, nutricionista, farmacéutico,
 * kinesiólogo, veterinario, etc.). NO es Martín Rodríguez (autor/editor).
 */
export interface ProfessionalReviewer {
  /** Nombre y apellido del profesional. */
  name?: string;
  /** Profesión: "Médico", "Nutricionista", "Veterinario", etc. */
  profession?: string;
  /** Credencial / título habilitante mostrado al usuario. */
  credential?: string;
  /** Nº de matrícula (opcional pero recomendado). */
  licenseNumber?: string;
  /** URL de un perfil verificable (colegio profesional, LinkedIn, sitio, etc.). */
  profileUrl?: string;
  /** Fecha de la revisión, formato YYYY-MM-DD. */
  reviewedAt?: string;
}

/**
 * Forma mínima de una calculadora que le interesa a la política.
 * Se mantiene laxa (todos opcionales) para ser compatible con los miles de
 * JSON existentes que no declaran estos campos.
 */
export interface CalcPolicyInput {
  slug?: string;
  category?: string;
  ymylRisk?: YmylRisk | string;
  reviewType?: ReviewType | string;
  distribution?: DistributionMode | string;
  noindex?: boolean;
  /** 'draft' = incompleta/sin revisar → restringida (noindex + fuera de distribución + sin ads). */
  status?: 'draft' | 'reviewed' | string;
  /** Corta anuncios SIN afectar indexación (apuestas/lotería/juego, per Publisher Policies). */
  adsenseEligible?: boolean;
  professionalReviewer?: ProfessionalReviewer | null;
  /** Aprobación humana explícita; nunca se infiere de tests o longitud. */
  editorialReview?: 'pending' | 'approved' | 'rejected' | string;
  /** La fuente fue abierta y contrastada por una persona con el dato usado. */
  sourceVerified?: boolean;
  /** La fórmula aprobó casos automatizados documentados. */
  automatedTests?: 'pending' | 'passed' | 'failed' | string;
  // toleramos cualquier otro campo del calc sin romper el tipo
  [key: string]: unknown;
}

// ---- Constantes de política ----

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Categorías sensibles (salud, cuerpo, deporte-lesión, familia, mascotas).
 * Se usa para NO atribuir "revisión de fórmula" a Martín en estos temas y
 * como señal auxiliar en la auditoría YMYL. NO define por sí sola la
 * restricción (eso lo hace `ymylRisk === 'high'`).
 */
export const SENSITIVE_CATEGORIES: ReadonlySet<string> = new Set([
  'salud',
  'mascotas',
  'deportes',
  'familia',
]);

/**
 * Palabras/temas que, aunque estén en una categoría no sensible (ej. "vida"),
 * indican contenido de salud/embarazo/bebés y por lo tanto tampoco deben
 * mostrar atribución de "revisión de fórmula" a Martín.
 */
const SENSITIVE_SLUG_HINTS: readonly string[] = [
  'embarazo', 'embarazada', 'gestacion', 'parto', 'ovulacion', 'fertilidad',
  'bebe', 'bebes', 'lactancia', 'pediatr', 'percentil',
  'dosis', 'medicamento', 'medicacion', 'suplement', 'insulina', 'paracetamol',
  'ibuprofeno', 'antibiotic', 'magnesio', 'creatinina', 'filtrado-glomerular',
  'imc', 'grasa-corporal', 'calorias', 'macros', 'nutricion',
  'lesion', 'pubalgia', 'isquiotibial', 'rehabilitacion', 'antipulgas',
];

/**
 * Aviso estándar para herramientas restringidas cuyo cálculo prescriptivo
 * fue desactivado (dosis / tratamiento). Texto de la spec (Fase 5A).
 */
export const RESTRICTED_DOSE_NOTICE =
  'Esta herramienta está temporalmente limitada porque una dosis individual ' +
  'depende de antecedentes, medicamentos, función renal, edad y otros factores ' +
  'clínicos. Consultá con un médico, farmacéutico o veterinario matriculado.';

/**
 * Subgrupo de restricción (spec Fase 5):
 *   - 'dose'   → medicamentos, suplementos y dosis veterinarias (A)
 *   - 'injury' → lesiones y retorno deportivo (B)
 *   - 'baby'   → alimentación de bebés (C)
 * Determina el aviso y la lista de "qué evalúa un profesional".
 */
export type RestrictedMode = 'dose' | 'injury' | 'baby' | 'clinical';

export const RESTRICTED_NOTICES: Record<RestrictedMode, string> = {
  dose: RESTRICTED_DOSE_NOTICE,
  injury:
    'Esta herramienta está temporalmente limitada porque los tiempos de ' +
    'recuperación y el retorno al deporte dependen de la evaluación clínica, el ' +
    'dolor, la fuerza y criterios funcionales individuales. Consultá con un ' +
    'traumatólogo, deportólogo o kinesiólogo matriculado.',
  baby:
    'Esta herramienta está temporalmente limitada porque la alimentación de un ' +
    'bebé depende de signos de preparación, el control pediátrico y la evolución ' +
    'individual. La introducción de alimentos suele iniciarse alrededor de los 6 ' +
    'meses; consultá con tu pediatra antes de cualquier cambio.',
  clinical:
    'Esta herramienta está temporalmente limitada porque interpretar un ' +
    'resultado de salud, un valor de laboratorio o una señal clínica depende ' +
    'de tu historia médica, síntomas y otros estudios. Consultá con un ' +
    'profesional de la salud matriculado; no uses este resultado para ' +
    'autodiagnosticarte ni para decidir un tratamiento.',
};

/** Factores generales que evalúa un profesional (sin números ni dosis). */
export const RESTRICTED_PRO_FACTORS: Record<RestrictedMode, string[]> = {
  dose: [
    'Antecedentes y enfermedades previas',
    'Medicación actual e interacciones',
    'Función renal y hepática',
    'Edad y peso',
    'Alergias, embarazo o lactancia',
  ],
  injury: [
    'Examen clínico y nivel de dolor',
    'Fuerza y rango de movimiento',
    'Tests funcionales específicos',
    'Grado de la lesión confirmado por estudios',
    'Objetivo y demanda deportiva individual',
  ],
  baby: [
    'Signos de preparación para comer',
    'Edad y evolución del peso',
    'Control y seguimiento pediátrico',
    'Antecedentes alérgicos familiares',
    'Lactancia y necesidades individuales',
  ],
  clinical: [
    'Historia clínica y síntomas actuales',
    'Otros estudios y valores de contexto',
    'Medicación y antecedentes personales',
    'Edad, sexo y factores de riesgo',
    'Seguimiento profesional individual',
  ],
};

/** Subgrupo de restricción declarado por la calc (default 'dose'). */
export function restrictedMode(calc: CalcPolicyInput | null | undefined): RestrictedMode {
  const m = calc?.restrictedMode;
  return m === 'injury' || m === 'baby' || m === 'clinical' ? m : 'dose';
}

// ---- Helpers de normalización ----

function nonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizeSlug(slug: unknown): string {
  return typeof slug === 'string' ? slug.toLowerCase() : '';
}

// ---- Funciones de política ----

/**
 * ¿La calculadora tiene un revisor profesional COMPLETO y VÁLIDO?
 * Exige: name, profession, credential, profileUrl y reviewedAt (YYYY-MM-DD).
 * `licenseNumber` es opcional. Si falta cualquiera de los obligatorios, o la
 * fecha no tiene formato válido, devuelve false.
 */
export function hasValidProfessionalReviewer(calc: CalcPolicyInput | null | undefined): boolean {
  const r = calc?.professionalReviewer;
  if (!r || typeof r !== 'object') return false;
  return (
    nonEmpty(r.name) &&
    nonEmpty(r.profession) &&
    nonEmpty(r.credential) &&
    nonEmpty(r.profileUrl) &&
    nonEmpty(r.reviewedAt) &&
    DATE_RE.test(r.reviewedAt as string)
  );
}

/**
 * ¿La calculadora está RESTRINGIDA?
 * Es restringida cuando:
 *   - `ymylRisk === 'high'` y NO tiene revisor profesional válido, O
 *   - se marcó explícitamente `distribution === 'restricted'`.
 * Un revisor profesional válido "desbloquea" una calc de riesgo alto (deja de
 * estar restringida por política), pero la indexabilidad final la decide
 * `isIndexableCalc` (que además respeta un `noindex` explícito).
 */
export function isRestrictedCalc(calc: CalcPolicyInput | null | undefined): boolean {
  if (!calc) return false;
  if (calc.status === 'draft') return true;   // borrador: incompleta/sin revisar → oculta hasta terminar
  if (calc.distribution === 'restricted') return true;
  if (calc.ymylRisk === 'high' && !hasValidProfessionalReviewer(calc)) return true;
  return false;
}

/**
 * `noindex` efectivo: verdadero si el JSON pide `noindex: true` a mano O si la
 * política la considera restringida. Esta es la fuente de verdad para el meta
 * robots (`noindex,follow`) en el render.
 */
export function isNoindexCalc(calc: CalcPolicyInput | null | undefined): boolean {
  if (!calc) return false;
  return calc.noindex === true || isRestrictedCalc(calc);
}

/**
 * ¿La calculadora es INDEXABLE? (inverso de `isNoindexCalc`).
 * Una calc de riesgo alto vuelve a ser indexable sólo cuando tiene revisor
 * profesional válido Y no tiene `noindex: true` explícito.
 */
export function isIndexableCalc(calc: CalcPolicyInput | null | undefined): boolean {
  return !isNoindexCalc(calc);
}

/**
 * ¿Se puede DISTRIBUIR? (sitemap, buscador interno, page feed, feeds LLM,
 * relacionadas, populares/nuevas, hubs, RSS/JSON/CSV).
 * Regla: sólo se distribuye lo indexable — cualquier página `noindex` o
 * restringida queda fuera de todos los canales.
 */
/**
 * Slugs PODADOS: su JSON sigue en el repo (para conservar metadata y permitir
 * revival), pero la URL responde 301 → categoría/otro vía PRUNING_REDIRECTS.
 * NO deben aparecer en ninguna superficie de distribución (catálogo, categorías,
 * relacionadas, populares/nuevas, búsqueda interna, feeds, RSS, sitemap): el link
 * llevaría a un redirect (mala UX + señal de "contenido eliminado pero enlazado"
 * para revisores/AdSense). Espeja el Set de scripts/generate-sitemap.ts.
 */
const PRUNED_SLUGS: ReadonlySet<string> = new Set(
  [...Object.keys(PRUNING_REDIRECTS), ...GONE_410_URLS].map((p) => p.replace(/^\//, '')),
);

/** ¿El slug de la calc está podado (redirige por PRUNING_REDIRECTS)? */
export function isPrunedCalc(calc: CalcPolicyInput | null | undefined, routePrefix = ''): boolean {
  if (!calc?.slug) return false;
  const prefix = routePrefix.replace(/^\/|\/$/g, '');
  return PRUNED_SLUGS.has(prefix ? `${prefix}/${calc.slug}` : calc.slug);
}

export function canDistributeCalc(calc: CalcPolicyInput | null | undefined, routePrefix = ''): boolean {
  return isIndexableCalc(calc) && !isPrunedCalc(calc, routePrefix);
}

/** ¿Una ruta pública concreta evita aliases 301 y URLs retiradas 410? */
export function isDistributablePublicPath(pathname: string): boolean {
  const path = `/${pathname.replace(/^\/+|\/+$/g, '')}`;
  return !(path in PRUNING_REDIRECTS) && !GONE_410_URLS.has(path);
}

/**
 * ¿Se puede EMBEBER? Las restringidas no tienen versión embebible.
 */
export function canEmbedCalc(calc: CalcPolicyInput | null | undefined): boolean {
  return !isRestrictedCalc(calc);
}

/**
 * ¿Se pueden mostrar ANUNCIOS / afiliados? No en páginas restringidas.
 */
/**
 * ¿La calc tiene CALIDAD suficiente para monetizar? (review AdSense 2026-07:
 * "no mostrar anuncios en páginas sin contenido suficiente o de bajo valor").
 * Exige fuentes citadas, explicación sustancial y un ejemplo resuelto. Las
 * podadas nunca califican. OJO: es independiente de la indexabilidad — una calc
 * puede seguir indexada (contenido útil, rastreable) pero quedar SIN ads hasta
 * completar fuentes/ejemplo. Gate positivo: sólo se monetiza lo que califica.
 */
export function isAdWorthy(calc: CalcPolicyInput | null | undefined): boolean {
  if (!calc) return false;
  if (isPrunedCalc(calc)) return false;
  const sources = Array.isArray((calc as { sources?: unknown }).sources)
    ? ((calc as { sources: unknown[] }).sources)
    : [];
  if (sources.length < 1) return false;
  const explanation = typeof calc.explanation === 'string' ? calc.explanation : '';
  if (explanation.length < 600) return false;
  const c = calc as { example?: unknown; solvedExample?: unknown; solvedExamples?: unknown };
  const hasExample =
    !!c.example ||
    !!c.solvedExample ||
    (Array.isArray(c.solvedExamples) && c.solvedExamples.length > 0);
  return hasExample;
}

export function canAdvertiseCalc(calc: CalcPolicyInput | null | undefined): boolean {
  // `adsenseEligible: false` corta anuncios aunque la página siga indexable
  // (apuestas/lotería/juego: se mantienen educativas y rastreables, sin ads).
  if (calc && calc.adsenseEligible === false) return false;
  // Restringidas YMYL (dosis/medicación/tratamiento sin revisor válido) → sin ads.
  if (isRestrictedCalc(calc)) return false;
  // Monetización opt-in: un test verde no equivale a revisión editorial.
  // Hasta que los tres estados sean explícitos, la página permanece sin ads.
  if (calc?.sourceVerified !== true) return false;
  if (calc?.editorialReview !== 'approved') return false;
  if (calc?.automatedTests !== 'passed') return false;
  // Review AdSense 2026-07: sólo se monetiza contenido de calidad comprobable.
  return isAdWorthy(calc);
}

/**
 * ¿Se pueden compartir/exportar RESULTADOS personalizados (email, PDF, PNG,
 * links con datos ingresados)? No en páginas restringidas.
 */
export function canShareResultsCalc(calc: CalcPolicyInput | null | undefined): boolean {
  return !isRestrictedCalc(calc);
}

// ---- Helpers de categoría sensible (para autoría / auditoría) ----

/**
 * ¿Es una categoría o slug de tema sensible (salud/embarazo/bebés/lesión/
 * mascotas/suplementos/dosis)? Se usa para NO mostrar "Fórmula revisada por
 * Martín Rodríguez" en esos temas (Fase 3).
 */
export function isSensitiveCalc(calc: CalcPolicyInput | null | undefined): boolean {
  if (!calc) return false;
  if (calc.category && SENSITIVE_CATEGORIES.has(String(calc.category))) return true;
  const slug = normalizeSlug(calc.slug);
  return SENSITIVE_SLUG_HINTS.some((hint) => slug.includes(hint));
}

/**
 * Permisos de una calculadora sensible en un solo objeto (API compuesta).
 *
 * Envuelve las funciones ya centralizadas arriba para exponer, en una sola
 * llamada, todos los permisos de distribución/exportación. Fuente de verdad
 * única: si `isRestrictedCalc` es true (riesgo alto sin revisor válido o
 * `distribution:'restricted'`), TODOS los permisos quedan en `false`.
 *
 * Usar este helper cuando un consumidor necesite decidir varios canales a la
 * vez (meta robots + sitemap + buscador + relacionados + widgets + pdf + imagen
 * + email + link compartible + embed). Los helpers individuales siguen válidos.
 */
export interface SensitivePermissions {
  isSensitive: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  allowIndex: boolean;
  allowSitemap: boolean;
  allowSearch: boolean;
  allowRelated: boolean;
  allowWidget: boolean;
  allowPdf: boolean;
  allowImage: boolean;
  allowEmail: boolean;
  allowShareLink: boolean;
  allowEmbed: boolean;
}

export function isSensitiveCalculator(calc: CalcPolicyInput | null | undefined): SensitivePermissions {
  const restricted = isRestrictedCalc(calc);
  const indexable = isIndexableCalc(calc);
  const distribute = canDistributeCalc(calc);
  const share = canShareResultsCalc(calc);
  const embed = canEmbedCalc(calc);
  const riskLevel = (calc?.ymylRisk as 'low' | 'medium' | 'high') || 'low';
  return {
    // "sensible" a efectos de permisos = restringida (riesgo alto sin revisor).
    // isSensitiveCalc() (categoría/tema) sigue disponible para autoría/byline.
    isSensitive: restricted,
    riskLevel,
    allowIndex: indexable,
    allowSitemap: distribute,
    allowSearch: distribute,
    allowRelated: distribute,
    allowWidget: embed,
    allowPdf: share,
    allowImage: share,
    allowEmail: share,
    allowShareLink: share,
    allowEmbed: embed,
  };
}
