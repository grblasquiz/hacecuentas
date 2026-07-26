/**
 * tablas-map.ts — mapa inverso calc → /tabla/<slug>.
 *
 * Las páginas /tabla/* declaran `relatedCalcs` (tabla → calc) pero NADA
 * enlazaba en sentido contrario: 5 de las 7 tablas quedaban huérfanas (0 links
 * entrantes) aunque están en el sitemap. Este mapa cierra el círculo desde
 * CalcLayoutV2 (panel "Fuentes", donde la tabla de referencia es contextual).
 *
 * Sólo AR (las /tabla/* viven en el root ES).
 *
 * REGENERAR tras tocar `relatedCalcs` de una tabla:
 *   invertir src/content/tablas/*.json  →  { [calcSlug]: { slug, label } }
 * Ojo: los valores de `relatedCalcs` son SLUGS reales (campo `slug` del JSON),
 * no nombres de archivo — mezclarlos hace que la sección "Calculadoras
 * relacionadas" de la tabla se renderice vacía.
 */

export interface TablaRef {
  /** slug de la tabla, sin el prefijo /tabla/ */
  slug: string;
  label: string;
}

export const CALC_TO_TABLA: Record<string, TablaRef> = {
  'calculadora-prestamo-personal-cuota-mensual': { slug: 'tabla-amortizacion-prestamo', label: 'Tabla de amortización de préstamo (francés y alemán)' },
  'calculadora-cuota-prestamo': { slug: 'tabla-amortizacion-prestamo', label: 'Tabla de amortización de préstamo (francés y alemán)' },
  'calculadora-hipoteca-uva-santander-argentina': { slug: 'tabla-amortizacion-prestamo', label: 'Tabla de amortización de préstamo (francés y alemán)' },
  'calculadora-prestamo-personal-galicia-vs-santander-cuota': { slug: 'tabla-amortizacion-prestamo', label: 'Tabla de amortización de préstamo (francés y alemán)' },
  'calculadora-amortizacion-prestamo-frances-aleman': { slug: 'tabla-amortizacion-prestamo', label: 'Tabla de amortización de préstamo (francés y alemán)' },
  'calculadora-calorias-diarias-tdee': { slug: 'tabla-calorias-alimentos', label: 'Tabla de calorías por alimento 2026' },
  'calculadora-deficit-calorico-perder-peso': { slug: 'tabla-calorias-alimentos', label: 'Tabla de calorías por alimento 2026' },
  'calculadora-macros-distribucion-proteina-carbos-grasas': { slug: 'tabla-calorias-alimentos', label: 'Tabla de calorías por alimento 2026' },
  'calculadora-calorias-quemadas-deporte': { slug: 'tabla-calorias-alimentos', label: 'Tabla de calorías por alimento 2026' },
  'conversor-unidades-longitud-peso-volumen-temperatura': { slug: 'tabla-conversion-medidas', label: 'Tabla de conversión de medidas 2026' },
  'conversor-tazas-gramos-cocina-recetas': { slug: 'tabla-conversion-medidas', label: 'Tabla de conversión de medidas 2026' },
  'calculadora-conversor-metros-lineales-a-metros-cuadrados': { slug: 'tabla-conversion-medidas', label: 'Tabla de conversión de medidas 2026' },
  'calculadora-conversor-psi-a-bar': { slug: 'tabla-conversion-medidas', label: 'Tabla de conversión de medidas 2026' },
  'calculadora-impuesto-ganancias-sueldo': { slug: 'tabla-escalas-ganancias-2026', label: 'Tabla de escalas del impuesto a las Ganancias 2026' },
  'sueldo-en-mano-argentina': { slug: 'tabla-escalas-ganancias-2026', label: 'Tabla de escalas del impuesto a las Ganancias 2026' },
  'calculadora-imc': { slug: 'tabla-imc-peso-altura', label: 'Tabla de IMC y peso ideal según altura (OMS)' },
  'calculadora-peso-ideal': { slug: 'tabla-imc-peso-altura', label: 'Tabla de IMC y peso ideal según altura (OMS)' },
  'calculadora-peso-ideal-golden-retriever': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-labrador-retriever': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-rottweiler': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-husky-siberiano': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-pitbull': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-beagle': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-bulldog-frances': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-bulldog-ingles': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-boxer': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-yorkshire-terrier': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-pastor-aleman': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-peso-ideal-dachshund-salchicha': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-edad-perro-anos-humanos': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
  'calculadora-alimento-diario-perro': { slug: 'tabla-peso-ideal-perros-por-raza', label: 'Tabla de peso ideal de perros por raza' },
};

/** Devuelve la tabla de referencia de un calc (sólo AR), o null. */
export function getTablaForCalc(slug: string | undefined, lang = ''): TablaRef | null {
  if (!slug || lang) return null;
  return CALC_TO_TABLA[slug] || null;
}
