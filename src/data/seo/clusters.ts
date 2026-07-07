/**
 * Capa de mapeo SEO — plan de recovery GSC (julio 2026).
 *
 * Define los 12 clusters temáticos del plan SEO: hub de autoridad, calcs
 * prioritarias (Google las probó en GSC, pos 8-13), calcs secundarias de
 * soporte y anchors recomendados para internal linking.
 *
 * IMPORTANTE: la fuente de verdad de las membresías calc↔cluster es
 * `src/lib/clusters.ts` (CLUSTERS). Este módulo NO define membresías:
 * sólo mapea cada cluster SEO a los ids de CLUSTERS relacionados
 * (`cluster_ids`) y a las URLs que hay que empujar. Si un slug muere o se
 * fusiona, corregirlo primero en src/lib/clusters.ts y después acá.
 *
 * Todas las URLs (hub, prioritarias y secundarias) fueron validadas contra
 * dist/client/ el 2026-07-06.
 */

export interface SeoCluster {
  /** Id del cluster SEO (kebab-case, según plan GSC jul-2026). */
  id: string;
  /** Nombre legible del cluster. */
  nombre: string;
  /** Página hub que concentra autoridad del cluster (path con / inicial). */
  hub_url: string;
  /** Ids de CLUSTERS (src/lib/clusters.ts) relacionados a este cluster SEO. */
  cluster_ids: string[];
  /** URLs a empujar primero: Google ya las probó en GSC (pos 8-13). */
  urls_prioritarias: string[];
  /** URLs de soporte que linkean/reciben links dentro del cluster. */
  urls_secundarias: string[];
  /** 2-3 textos de anchor recomendados para links internos hacia el cluster. */
  anchors_recomendados: string[];
}

export const SEO_CLUSTERS: SeoCluster[] = [
  {
    id: "fechas-tiempo",
    nombre: "Fechas y tiempo",
    hub_url: "/categoria/vida",
    cluster_ids: ["fechasYTiempo", "edadExacta"],
    urls_prioritarias: ["/dias-entre-dos-fechas", "/calculadora-edad-exacta"],
    urls_secundarias: [
      "/calculadora-dias-laborables-habiles-entre-fechas",
      "/calculadora-antiguedad-laboral",
      "/calculadora-proximo-cumpleanos",
      "/calculadora-edad-exacta-anos-meses-dias-segundos",
      "/calculadora-aniversario-pareja",
    ],
    anchors_recomendados: [
      "calculadora de días entre fechas",
      "calculá tu edad exacta",
      "días hábiles entre dos fechas",
    ],
  },
  {
    id: "sueldos-trabajo",
    nombre: "Sueldos y trabajo",
    hub_url: "/guia/sueldos-argentina-2026",
    cluster_ids: ["sueldoTrabajo"],
    urls_prioritarias: [
      "/sueldo-en-mano-argentina",
      "/calculadora-aguinaldo-sac",
      "/calculadora-sueldo-por-hora",
    ],
    urls_secundarias: [
      "/calculadora-sueldo-bruto-desde-neto",
      "/calculadora-ajuste-sueldo-inflacion",
      "/calculadora-cuota-sindical-descuento-sueldo",
    ],
    anchors_recomendados: [
      "calculadora de sueldo en mano",
      "cuánto cobrás de aguinaldo",
      "cuánto vale tu hora de trabajo",
    ],
  },
  {
    id: "impuestos-argentina",
    nombre: "Impuestos Argentina",
    hub_url: "/guia/impuestos-argentina-2026",
    cluster_ids: ["monotributo", "ganancias4ta", "autonomos"],
    urls_prioritarias: ["/calculadora-sellos-compra-inmueble-caba-pba"],
    urls_secundarias: [
      "/calculadora-monotributo-categoria-2026-recategorizacion-julio",
      "/calculadora-ganancias-empleados-4ta-categoria-2026",
      "/calculadora-autonomos-categoria-monto-2026",
      "/calculadora-monotributo-vs-autonomo-vs-empleado-mismo-ingreso",
    ],
    anchors_recomendados: [
      "impuesto de sellos en CABA y PBA",
      "tu categoría de monotributo 2026",
      "cuánto pagás de ganancias",
    ],
  },
  {
    id: "finanzas-personales",
    nombre: "Finanzas personales",
    hub_url: "/categoria/finanzas",
    cluster_ids: ["ahorroInversion", "creditoHipoteca", "jubilacionRetiro", "dolar"],
    urls_prioritarias: ["/calculadora-cuota-prestamo", "/simulador-jubilacion-anses"],
    urls_secundarias: [
      "/calculadora-interes-compuesto",
      "/calculadora-plazo-fijo",
      "/calculadora-hipoteca-mensual-cuota-fija",
      "/calculadora-jubilacion-cuanto-necesito",
    ],
    anchors_recomendados: [
      "calculá la cuota de tu préstamo",
      "simulador de jubilación ANSES",
      "cuánto rinde el interés compuesto",
    ],
  },
  {
    id: "construccion",
    nombre: "Construcción y obra",
    hub_url: "/guia/construccion-diy-hogar",
    cluster_ids: ["murosLadrillos", "pinturaRevestimientos", "hormigonAridos"],
    urls_prioritarias: [
      "/calculadora-costo-m2-construccion-argentina",
      "/calculadora-tejas-techo-m2",
      "/calculadora-conversor-metros-lineales-a-metros-cuadrados",
    ],
    urls_secundarias: [
      "/calculadora-cantidad-ladrillos-metro-cuadrado-pared",
      "/calculadora-pintura-por-m2-litros-latas",
      "/calculadora-cemento-arena-piedra-por-m3-hormigon",
      "/calculadora-azulejos-baldosas-metros-cuadrados-cantidad",
    ],
    anchors_recomendados: [
      "costo del m² de construcción",
      "cuántas tejas necesitás por m²",
      "materiales por metro cuadrado",
    ],
  },
  {
    id: "viajes-auto",
    nombre: "Viajes y auto",
    hub_url: "/categoria/automotor",
    cluster_ids: ["costosAuto", "combustibleConsumo", "presupuestoViaje"],
    urls_prioritarias: [
      "/calculadora-costo-por-kilometro-auto",
      "/calculadora-patente-auto-provincia",
      "/calculadora-costo-viaje-combustible-kilometros",
      "/calculadora-seguro-auto-estimado",
      "/calculadora-estimador-costo-viaje-taxi-remis",
    ],
    urls_secundarias: [
      "/calculadora-consumo-nafta-litros-100km",
      "/calculadora-vtv-costo-provincia-2026",
      "/calculadora-costo-peaje-ruta",
      "/calculadora-costo-mantenimiento-auto-anual-km",
    ],
    anchors_recomendados: [
      "cuánto cuesta tu auto por kilómetro",
      "estimá el seguro de tu auto",
      "costo de combustible del viaje",
    ],
  },
  {
    id: "cocina-eventos",
    nombre: "Cocina y eventos",
    hub_url: "/categoria/cocina",
    cluster_ids: [
      "cocinaBebidas",
      "cocinaAsado",
      "cocinaConversiones",
      "cocinaReposteria",
      "cocinaCafe",
    ],
    urls_prioritarias: [
      "/calculadora-bebidas-evento-litros-por-persona",
      "/calculadora-conversion-medidas-cocina-tazas-gramos",
    ],
    urls_secundarias: [
      "/calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo",
      "/calculadora-cantidad-pizzas-por-invitados-pizzeria",
      "/calculadora-porciones-torta-cumpleanos-invitados-tamano",
      "/conversor-tazas-gramos-cocina-recetas",
    ],
    anchors_recomendados: [
      "cuántas bebidas por invitado",
      "conversor de medidas de cocina",
      "cuánto asado por persona",
    ],
  },
  {
    id: "salud-fitness",
    nombre: "Salud y fitness",
    hub_url: "/guia/salud-nutricion-fitness",
    cluster_ids: [
      "gimnasioCluster",
      "runningCluster",
      "nutricionCluster",
      "natacionCluster",
      "ciclismoCluster",
    ],
    urls_prioritarias: [
      "/calculadora-calorias-quemadas-deporte",
      "/calculadora-pace-ritmo-running",
    ],
    urls_secundarias: [
      "/calculadora-calorias-diarias-tdee",
      "/calculadora-1rm-peso-maximo-levantamiento",
      "/calculadora-proteina-diaria-objetivo",
      "/calculadora-macros-deficit-volumen-mantenimiento",
    ],
    anchors_recomendados: [
      "calorías quemadas por deporte",
      "calculá tu ritmo de running",
      "tus calorías diarias de mantenimiento",
    ],
  },
  {
    id: "mascotas",
    nombre: "Mascotas",
    hub_url: "/categoria/mascotas",
    cluster_ids: ["mascotasEdades", "mascotasGatos", "pesoPerros"],
    urls_prioritarias: ["/calculadora-edad-humana-conejo-anos"],
    urls_secundarias: [
      "/calculadora-edad-perro-anos-humanos",
      "/calculadora-edad-gato-anos-humanos",
      "/calculadora-comida-gato-diaria-gramos",
      "/calculadora-peso-ideal-labrador-retriever",
    ],
    anchors_recomendados: [
      "edad de tu mascota en años humanos",
      "cuántos años humanos tiene tu conejo",
      "peso ideal por raza de perro",
    ],
  },
  {
    id: "conversores-matematicos",
    nombre: "Conversores y matemática",
    hub_url: "/categoria/matematica",
    cluster_ids: [
      "porcentajesDescuentos",
      "conversionUnidades",
      "algebraEcuaciones",
      "estadisticaBasica",
      "geometriaAreas",
    ],
    urls_prioritarias: ["/calculadora-porcentajes"],
    urls_secundarias: [
      "/calculadora-descuento-porcentaje-precio",
      "/calculadora-regla-de-tres-simple",
      "/calculadora-conversion-celsius-fahrenheit-kelvin-rankine-temperatura",
      "/calculadora-media-mediana-moda-rango-estadistica",
    ],
    anchors_recomendados: [
      "calculadora de porcentajes",
      "regla de tres simple",
      "sacá cualquier porcentaje al instante",
    ],
  },
  {
    id: "tecnologia",
    nombre: "Tecnología",
    hub_url: "/categoria/tecnologia",
    cluster_ids: ["almacenamientoDatos", "redesYDescarga", "redesEngagement"],
    urls_prioritarias: [
      "/calculadora-duracion-bateria-mah-consumo",
      "/calculadora-video-bitrate-tamano-archivo",
      "/calculadora-twitter-x-monetizacion-ingreso",
    ],
    urls_secundarias: [
      "/calculadora-almacenamiento-bytes-kb-mb-gb-tb",
      "/calculadora-ancho-banda-descarga-tiempo",
      "/calculadora-velocidad-internet-mbps-real",
    ],
    anchors_recomendados: [
      "cuánto dura tu batería en mAh",
      "peso de un video según bitrate",
      "cuánto paga X por tus posts",
    ],
  },
  {
    id: "negocios",
    nombre: "Negocios y ventas",
    hub_url: "/categoria/negocios",
    cluster_ids: ["preciosMargenes", "facturacionNegocio", "roiAds", "transporteMillas"],
    urls_prioritarias: [
      "/calculadora-comision-venta-vendedor",
      "/calculadora-millas-latam-destino",
    ],
    urls_secundarias: [
      "/calculadora-precio-venta-producto-markup",
      "/calculadora-punto-equilibrio-break-even",
      "/calculadora-margen-ganancia-markup",
      "/calculadora-burn-rate-runway-startup",
    ],
    anchors_recomendados: [
      "cuánto cobrás de comisión por venta",
      "millas LATAM Pass para tu destino",
      "precio de venta con margen",
    ],
  },
];

/** Busca un cluster SEO por id. */
export function findSeoCluster(id: string): SeoCluster | null {
  return SEO_CLUSTERS.find((c) => c.id === id) ?? null;
}
