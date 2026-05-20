/**
 * Lista de URLs zombie con verdadero 0-trafico (0 impressions, 0 clicks)
 * que devuelven HTTP 410 Gone en el middleware.
 *
 * Estrategia post-Core Update Abril 2026:
 *   - 301 a categoria mantiene la URL en queue de re-crawl de Google.
 *   - 410 le dice "removida permanentemente" → Google la saca del index mas
 *     rapido (confirmado por John Mueller multiple veces).
 *   - Aplicar 410 solo cuando NO hay riesgo de perder link equity:
 *       clicks == 0 AND impressions == 0 AND target_clicks == 0 AND
 *       target_impressions <= 5.
 *
 * Esta lista se genera/actualiza con:
 *   python3 scripts/audit-pruning-vs-gsc.py --emit-gone-410
 *
 * Que escribe la salida directamente a este archivo. NO editar a mano —
 * cualquier cambio se sobreescribe en el proximo audit.
 *
 * Generated: 2026-05-20 (77 URLs)
 */
export const GONE_410_URLS: ReadonlySet<string> = new Set<string>([
  "/calculadora-a1c-hemoglobina-glicosilada-diabetes",
  "/calculadora-agua-cafe-te-hidratacion-real-mitos",
  "/calculadora-agua-diaria-litros-segun-peso",
  "/calculadora-agua-ingesta-diaria-peso-actividad",
  "/calculadora-aire-acondicionado-btu-split",
  "/calculadora-aire-acondicionado-frigorias-btu-habitacion",
  "/calculadora-aire-acondicionado-frigorias-m2-ambiente",
  "/calculadora-alcohol-calorias-cerveza-vino-fernet",
  "/calculadora-ayuno-intermitente-16-8-calorias",
  "/calculadora-ayuno-intermitente-16-8-ventana-horario",
  "/calculadora-ayuno-intermitente-beneficios-calorias-20-4",
  "/calculadora-ayuno-intermitente-ventana-comer",
  "/calculadora-azucares-anadidos-diarios-oms-mg-gramos",
  "/calculadora-burnout-indice-carga-laboral-test-mbi",
  "/calculadora-burnout-test-maslach-puntaje-online-empleado",
  "/calculadora-cafeina-dosis-segura-diaria-peso",
  "/calculadora-calcio-dieta-diaria-osteoporosis-mujer",
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
  "/calculadora-edad-gestacional-ecografia-corona-rabadilla",
  "/calculadora-edad-gestacional-perro-gato-camada-fecha-parto",
  "/calculadora-factor-calor-frio-mascotas-exterior-patio",
  "/calculadora-fecha-probable-parto",
  "/calculadora-fibra-diaria-edad-sexo",
  "/calculadora-frecuencia-cardiaca-maxima-edad",
  "/calculadora-frecuencia-cardiaca-reposo-categorias-deportistas-edad",
  "/calculadora-frecuencia-cardiaca-zonas-entrenamiento",
  "/calculadora-frecuencia-cardiaca-zonas-entrenamiento-futbolista",
  "/calculadora-frecuencia-cardiaca-zonas-entrenamiento-karvonen",
  "/calculadora-frecuencia-cardiaca-zonas-karvonen",
  "/calculadora-grasa-corporal-pliegues-jackson",
  "/calculadora-histamina-alimento-intolerancia",
  "/calculadora-horas-aprender-aleman-c1",
  "/calculadora-horas-aprender-arabe-b2",
  "/calculadora-horas-aprender-coreano-topik4",
  "/calculadora-horas-sueno-bebe-por-edad-tabla-recomendada",
  "/calculadora-horas-sueno-necesarias-edad-adulto",
  "/calculadora-huella-carbono-streaming-video-horas",
  "/calculadora-indice-cintura-cadera",
  "/calculadora-indice-cintura-cadera-salud-cardiovascular",
  "/calculadora-indice-glucemico-carga-alimento-porcion",
  "/calculadora-macros-cetogenica-ciclica",
  "/calculadora-meditacion-minutos-ansiedad-cortisol-impacto",
  "/calculadora-mundial-2026-probabilidad-clasificacion-ranking-fifa",
  "/calculadora-omega-3-6-ratio",
  "/calculadora-plan-entrenamiento-10k-semanas",
  "/calculadora-potasio-diario-necesario",
  "/calculadora-premios-mundial-2026-seleccion-por-fase",
  "/calculadora-premios-mundial-clubes-fifa-2025-2026",
  "/calculadora-presion-arterial-tabla-normal-hipertension",
  "/calculadora-presion-arterial-tension-categorias-oms-2026",
  "/calculadora-purinas-gota-alimento",
  "/calculadora-selenio-diario-oxidativo",
  "/calculadora-tiempo-recuperacion-fractura-tibia-perone-futbolista",
  "/calculadora-tiempo-recuperacion-rotura-lca-ligamento-cruzado",
  "/calculadora-tiempo-seguro-sol-spf-fototipo-uv",
  "/calculadora-tmb-metabolismo-basal-mifflin",
  "/calculadora-tyramine-migrana-alimentos",
  "/calculadora-vacunas-perro-calendario",
  "/calculadora-valuacion-fiscal-automotor-tierra-del-fuego",
  "/calculadora-velocidad-lectura-wpm",
  "/calculadora-vo2-max-cooper-12-minutos",
  "/calculadora-vo2-max-futbolista-profesional-vs-amateur",
  "/calculadora-zinc-diario-necesidad",
  "/en/daily-water-intake-calculator",
]);
