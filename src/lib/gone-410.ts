/**
 * Lista de URLs zombie con verdadero 0-trafico (0 impressions, 0 clicks)
 * que devuelven HTTP 410 Gone en el middleware.
 *
 * Estrategia post-Core Update Abril 2026:
 *   - 301 a categoria mantiene la URL en queue de re-crawl de Google.
 *   - 410 le dice "removida permanentemente" -> Google la saca del index mas
 *     rapido (confirmado por John Mueller multiple veces).
 *   - Aplicar 410 solo cuando NO hay riesgo de perder link equity:
 *       clicks == 0 AND impressions == 0 AND target_clicks == 0 AND
 *       target_impressions <= 5.
 *
 * Esta lista se genera/actualiza con:
 *   python3 scripts/audit-pruning-vs-gsc.py --emit-gone-410
 *   python3 scripts/apply-en-pt-audit.py (para calcs-en/pt KILL_410)
 *
 * Generated: 2026-05-27 (1182 URLs total — 521 previas + 661 batch hoy)
 */
export const GONE_410_URLS: ReadonlySet<string> = new Set<string>([
  "/calculadora-aire-acondicionado-frigorias-m2-ambiente",
  "/calculadora-ayuno-intermitente-16-8-ventana-horario",
  "/calculadora-calorias-cerveza-vino-fernet-whiskey",
  "/calculadora-conversor-kmh-a-mph",
  "/calculadora-conversor-kmh-a-ms",
  "/calculadora-conversor-libras-a-gramos",
  "/calculadora-conversor-libras-a-kilogramos",
  "/calculadora-conversor-libras-a-onzas",
  "/calculadora-conversor-ms-a-kmh",
  "/calculadora-conversor-pulgadas-a-centimetros",
  "/calculadora-conversor-pulgadas-a-milimetros",
  "/calculadora-conversor-pulgadas-cuadradas-a-centimetros-cuadrados",
  "/calculadora-costo-mascota-vida-util",
  "/calculadora-costo-total-criar-hijo-18-anios",
  "/calculadora-distancia-entre-plantas-huerto",
  "/calculadora-edad-gestacional-corregida-prematuro",
  "/calculadora-frecuencia-cardiaca-maxima-edad",
  "/calculadora-frecuencia-cardiaca-zonas-entrenamiento",
  "/calculadora-frecuencia-cardiaca-zonas-entrenamiento-karvonen",
  "/calculadora-horas-sueno-bebe-por-edad-tabla-recomendada",
  "/calculadora-horas-sueno-necesarias-edad-adulto",
  "/calculadora-huella-carbono-streaming-video-horas",
  "/calculadora-indice-cintura-cadera",
  "/calculadora-indice-cintura-cadera-salud-cardiovascular",
  "/calculadora-indice-glucemico-carga-alimento-porcion",
  "/calculadora-plan-entrenamiento-10k-semanas",
  "/calculadora-presion-arterial-tabla-normal-hipertension",
  "/calculadora-vacunas-perro-calendario",
  "/calculadora-valuacion-fiscal-automotor-tierra-del-fuego",
  "/calculadora-velocidad-lectura-wpm",
  "/en/average-calculator",
  "/en/cat-vaccine-schedule",
  "/en/compound-interest-calculator-long-term",
  "/en/net-present-value-calculator",
  "/en/pittsburgh-sleep-quality-index",
  "/en/vat-tax-calculator",
  "/pt/vacinas-gato-triplice-leucemia-raiva",
  // ── Batch 2026-05-27: 661 URLs zero-impr 90d, sin internal links ──
  "/blog/como-calcular-porcentajes",
  "/blog/guia-imc-peso-saludable",
  "/blog/recategorizacion-monotributo-julio-2026-guia-completa",
  "/calculadora-biberones-necesarios-primera-infancia",
  "/calculadora-capacidad-carga-camioneta-peso-util",
  "/calculadora-edad-conversar-temas-dificiles-hijo",
  "/calculadora-etapas-duelo-perdida-familiar-meses",
  "/calculadora-refinanciar-prestamo-ahorro-cuota",
  "/calculadora-rejilla-trampa-desague",
  "/calculadora-sueldo-chofer-colectivo-uta-urbano",
  "/calculadora-tamano-colchon-ideal-medidas",
  "/calculadora-transportadora-tamano-mascota-viaje",
  "/calculadora-ttl-dns-registro-cache-propagacion",
  "/calculadora-vegana-proteina-completa-combinacion-aminoacidos",
]);
