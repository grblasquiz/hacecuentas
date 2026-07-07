/**
 * CATEGORY_HUBS — datos de los hubs por categoría (bloques ricos de columnas
 * temáticas que se montan en la calc "ancla" de cada familia, antes del FAQ).
 *
 * Versión data-driven de HealthHub (que sigue dedicado a /calculadora-imc).
 * Todos los slugs validados contra el catálogo real al generar.
 * Render: src/components/CategoryHub.astro · Wiring: src/pages/[...slug].astro
 */

export interface HubCalc {
  label: string;
  slug: string;
}
export interface HubSection {
  title: string;
  icon: string;
  calcs: HubCalc[];
}
export interface CategoryHubData {
  anchorSlug: string;
  title: string;
  subtitle: string;
  sections: HubSection[];
}

export const CATEGORY_HUBS: CategoryHubData[] = [
  {
    "anchorSlug": "sueldo-en-mano-argentina",
    "title": "💼 Tu centro financiero",
    "subtitle": "Todas tus herramientas de dinero en un lugar",
    "sections": [
      {
        "title": "Sueldo y trabajo",
        "icon": "💰",
        "calcs": [
          {
            "label": "Sueldo en mano",
            "slug": "sueldo-en-mano-argentina"
          },
          {
            "label": "Neto a bruto",
            "slug": "calculadora-sueldo-bruto-desde-neto"
          },
          {
            "label": "Tu sueldo vs inflación",
            "slug": "calculadora-ajuste-sueldo-inflacion"
          },
          {
            "label": "Aguinaldo (SAC)",
            "slug": "calculadora-aguinaldo-sac"
          }
        ]
      },
      {
        "title": "Ahorro e inversión",
        "icon": "📈",
        "calcs": [
          {
            "label": "Interés compuesto",
            "slug": "calculadora-interes-compuesto"
          },
          {
            "label": "Regla 72",
            "slug": "calculadora-ahorro-compuesto-tiempo-duplicar-regla-72"
          },
          {
            "label": "Meta de ahorro",
            "slug": "calculadora-ahorro-meta-mensual"
          },
          {
            "label": "Plazo fijo UVA",
            "slug": "calculadora-plazo-fijo-uva-precancelable-rendimiento"
          }
        ]
      },
      {
        "title": "Crédito y deudas",
        "icon": "💳",
        "calcs": [
          {
            "label": "Hipoteca cuota",
            "slug": "calculadora-hipoteca-mensual-cuota-fija"
          },
          {
            "label": "Amortización préstamo",
            "slug": "calculadora-amortizacion-prestamo-frances-aleman"
          },
          {
            "label": "Crédito ANSES",
            "slug": "calculadora-credito-anses-pre-aprobado-jubilado-cuota"
          },
          {
            "label": "Crédito auto",
            "slug": "calculadora-credito-prendario-auto-cft-comparativa-bancos"
          }
        ]
      },
      {
        "title": "Impuestos",
        "icon": "🧾",
        "calcs": [
          {
            "label": "Ganancias 4ta 2026",
            "slug": "calculadora-ganancias-4ta-categoria-2026"
          },
          {
            "label": "Deducción alquiler",
            "slug": "calculadora-deduccion-alquiler-ganancias-40-porciento"
          },
          {
            "label": "Impuesto a Ganancias",
            "slug": "calculadora-impuesto-ganancias-sueldo"
          },
          {
            "label": "IVA calc",
            "slug": "calculadora-iva-incluido-neto-discriminar"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-monotributo-categoria-2026-recategorizacion-julio",
    "title": "📋 Impuestos y obligaciones",
    "subtitle": "Monotributo, ganancias, y más en un lugar",
    "sections": [
      {
        "title": "Monotributo",
        "icon": "📋",
        "calcs": [
          {
            "label": "Recategorización 2026",
            "slug": "calculadora-monotributo-categoria-2026-recategorizacion-julio"
          },
          {
            "label": "Mono vs Autónomo",
            "slug": "calculadora-monotributo-vs-autonomo-vs-empleado-mismo-ingreso"
          },
          {
            "label": "Facturación máxima",
            "slug": "calculadora-facturacion-maxima-monotributo-vs-ri"
          },
          {
            "label": "Alta monotributo",
            "slug": "calculadora-monotributo-alta-afip-tramite-zero"
          }
        ]
      },
      {
        "title": "Ganancias",
        "icon": "📊",
        "calcs": [
          {
            "label": "Ganancias 4ta 2026",
            "slug": "calculadora-ganancias-4ta-categoria-2026"
          },
          {
            "label": "Deducción alquiler",
            "slug": "calculadora-deduccion-alquiler-ganancias-40-porciento"
          },
          {
            "label": "Deducción familia",
            "slug": "calculadora-deduccion-familia-conyuge-hijo-ganancias"
          },
          {
            "label": "Impuesto a Ganancias",
            "slug": "calculadora-impuesto-ganancias-sueldo"
          }
        ]
      },
      {
        "title": "IVA e IIBB",
        "icon": "🧾",
        "calcs": [
          {
            "label": "IVA calc",
            "slug": "calculadora-iva-incluido-neto-discriminar"
          },
          {
            "label": "Facturación máxima",
            "slug": "calculadora-facturacion-maxima-monotributo-vs-ri"
          },
          {
            "label": "Pase a RI",
            "slug": "calculadora-ganancias-monotributista-pase-regimen-general"
          }
        ]
      },
      {
        "title": "Autónomos y otros",
        "icon": "🧑‍💼",
        "calcs": [
          {
            "label": "Categorías autónomos",
            "slug": "calculadora-autonomos-categoria-monto-2026"
          },
          {
            "label": "Aportes autónomos",
            "slug": "calculadora-autonomos-categorias-2026-aportes"
          },
          {
            "label": "Sueldo neto autónomo",
            "slug": "calculadora-sueldo-neto-autonomo-monotributista"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-calorias-quemadas-deporte",
    "title": "⚽ Deportes",
    "subtitle": "Calorías quemadas, rendimiento y métricas de entrenamiento por disciplina",
    "sections": [
      {
        "title": "Running",
        "icon": "🏃",
        "calcs": [
          {
            "label": "Pace/ritmo",
            "slug": "calculadora-pace-ritmo-running"
          },
          {
            "label": "Plan 5K-42K",
            "slug": "calculadora-plan-entrenamiento-5k-semanas"
          },
          {
            "label": "Calorías corriendo",
            "slug": "calculadora-calorias-quemadas-running-km-peso"
          },
          {
            "label": "Predicción tiempos",
            "slug": "calculadora-prediccion-tiempo-5k-10k-21k"
          }
        ]
      },
      {
        "title": "Ciclismo",
        "icon": "🚴",
        "calcs": [
          {
            "label": "FTP test",
            "slug": "calculadora-ftp-cycling-watts"
          },
          {
            "label": "Potencia W/kg",
            "slug": "calculadora-potencia-ciclismo-watts-kg"
          },
          {
            "label": "Calorías bicicleta",
            "slug": "calculadora-calorias-ciclismo-watts"
          },
          {
            "label": "Zonas FC",
            "slug": "calculadora-fc-maxima-zonas-karvonen"
          }
        ]
      },
      {
        "title": "Fuerza",
        "icon": "💪",
        "calcs": [
          {
            "label": "1RM",
            "slug": "calculadora-1rm-peso-maximo"
          },
          {
            "label": "1RM deadlift",
            "slug": "calculadora-1rm-peso-muerto-estimador"
          },
          {
            "label": "Calorías gym",
            "slug": "calculadora-calorias-gym-pesas-hora"
          },
          {
            "label": "Frecuencia entrenam",
            "slug": "calculadora-frecuencia-entrenamiento-grupo-muscular"
          }
        ]
      },
      {
        "title": "Rendimiento",
        "icon": "❤️",
        "calcs": [
          {
            "label": "VO2max",
            "slug": "calculadora-vo2max-estimado-sin-test"
          },
          {
            "label": "FC máxima",
            "slug": "calculadora-fc-maxima-zonas-karvonen"
          },
          {
            "label": "Zonas entrenamiento",
            "slug": "calculadora-zonas-frecuencia-cardiaca-entrenamiento"
          },
          {
            "label": "Hidratación deportistas",
            "slug": "calculadora-hidratacion-deportistas"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-edad-exacta",
    "title": "📅 Tu vida en números",
    "subtitle": "Calendarios, edades y cuenta regresiva",
    "sections": [
      {
        "title": "Fechas y tiempo",
        "icon": "📅",
        "calcs": [
          {
            "label": "Días entre fechas",
            "slug": "dias-entre-dos-fechas"
          },
          {
            "label": "Días laborables",
            "slug": "calculadora-dias-laborables-habiles-entre-fechas"
          },
          {
            "label": "Antigüedad laboral",
            "slug": "calculadora-antiguedad-laboral"
          },
          {
            "label": "Cuánto falta para...",
            "slug": "calculadora-cuanto-falta-cumpleanos-fecha-personalizada-eventos"
          }
        ]
      },
      {
        "title": "Edad y cumpleaños",
        "icon": "🎂",
        "calcs": [
          {
            "label": "Edad años/meses",
            "slug": "calculadora-edad-exacta-anos-meses-dias-segundos"
          },
          {
            "label": "Edad en otros planetas",
            "slug": "calculadora-edad-planeta"
          },
          {
            "label": "Días juntos en pareja",
            "slug": "calculadora-dias-juntos-pareja"
          },
          {
            "label": "Aniversario de pareja",
            "slug": "calculadora-aniversario-pareja"
          }
        ]
      },
      {
        "title": "Ahorro y consumo",
        "icon": "💡",
        "calcs": [
          {
            "label": "Consumo de agua mensual",
            "slug": "calculadora-consumo-agua-hogar-mensual"
          },
          {
            "label": "Ahorro al cambiar a LED",
            "slug": "calculadora-ahorro-cambiar-lamparas-led"
          },
          {
            "label": "Termo eléctrico vs gas",
            "slug": "calculadora-ahorro-termo-electrico-vs-gas"
          },
          {
            "label": "Costo heladera anual",
            "slug": "calculadora-heladera-clase-a-consumo-anual-kwh"
          }
        ]
      },
      {
        "title": "Vida diaria",
        "icon": "⏰",
        "calcs": [
          {
            "label": "Cuánto vale tu tiempo",
            "slug": "calculadora-cuanto-vale-mi-tiempo-hora-anual-salario"
          },
          {
            "label": "Agua diaria necesaria",
            "slug": "calculadora-agua-diaria-necesaria"
          },
          {
            "label": "Lavarropas agua/energía",
            "slug": "calculadora-lavarropas-eficiencia-agua-litros-ciclo"
          },
          {
            "label": "Mantenimiento hogar anual",
            "slug": "calculadora-costo-mantenimiento-hogar-anual"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-fecha-probable-parto-calcular-semanas",
    "title": "👶 Familia y crianza",
    "subtitle": "Bebés, derechos y educación de hijos",
    "sections": [
      {
        "title": "Embarazo y bebés",
        "icon": "🤰",
        "calcs": [
          {
            "label": "Edad gestacional ecografía",
            "slug": "calculadora-edad-gestacional-ecografia-corona-rabadilla"
          },
          {
            "label": "Pañales por mes y edad",
            "slug": "calculadora-panales-por-dia-mes-bebe-edad"
          },
          {
            "label": "Biberón ml por edad",
            "slug": "calculadora-formula-infantil-biberon-edad-ml-dia"
          },
          {
            "label": "Sueño recomendado bebé",
            "slug": "calculadora-horas-sueno-bebe-por-edad-tabla-recomendada"
          }
        ]
      },
      {
        "title": "Derechos y licencias",
        "icon": "📋",
        "calcs": [
          {
            "label": "AUH Asignación Hijo",
            "slug": "calculadora-asignacion-universal-hijo-auh-2026-monto"
          },
          {
            "label": "Licencia maternidad ANSES",
            "slug": "calculadora-licencia-maternidad-anses-90-dias-extension"
          },
          {
            "label": "Edad ingreso escolar",
            "slug": "calculadora-edad-ingreso-escolar-primaria-jardin"
          },
          {
            "label": "Cuándo dejar el pañal",
            "slug": "calculadora-edad-quitar-panal-control-esfinteres"
          }
        ]
      },
      {
        "title": "Gastos e inversión",
        "icon": "💰",
        "calcs": [
          {
            "label": "Ahorro educación hijo",
            "slug": "calculadora-ahorro-educacion-hijo-plan-colegio-universidad"
          },
          {
            "label": "Costo total criar hijo",
            "slug": "calculadora-costo-total-criar-hijo-18-anios"
          },
          {
            "label": "Mesada por edad",
            "slug": "calculadora-mesada-por-edad-hijo-semanal-mensual"
          },
          {
            "label": "Frecuencia desparasitación",
            "slug": "calculadora-frecuencia-desparasitar-familia-tipos"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-conversion-medidas-cocina-tazas-gramos",
    "title": "🍳 Cocina",
    "subtitle": "Conversiones, porciones y técnicas",
    "sections": [
      {
        "title": "Conversiones",
        "icon": "🥄",
        "calcs": [
          {
            "label": "Medidas de cocina",
            "slug": "calculadora-conversion-medidas-cocina-tazas-gramos"
          },
          {
            "label": "Tazas a gramos",
            "slug": "conversor-tazas-gramos-cocina-recetas"
          },
          {
            "label": "Especias en gramos",
            "slug": "calculadora-conversion-cucharaditas-gramos-especias-sal"
          }
        ]
      },
      {
        "title": "Porciones y cantidades",
        "icon": "🍽️",
        "calcs": [
          {
            "label": "Asado por persona",
            "slug": "calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo"
          },
          {
            "label": "Pizzas para invitados",
            "slug": "calculadora-cantidad-pizzas-por-invitados-pizzeria"
          },
          {
            "label": "Bebidas por evento",
            "slug": "calculadora-bebidas-evento-cerveza-vino-refresco-calculadora"
          },
          {
            "label": "Torta cumpleaños",
            "slug": "calculadora-porciones-torta-cumpleanos-invitados-tamano"
          }
        ]
      },
      {
        "title": "Café y técnicas",
        "icon": "☕",
        "calcs": [
          {
            "label": "Café molido por taza",
            "slug": "calculadora-cafe-molido-taza-metodo-preparacion"
          },
          {
            "label": "Ratio French Press",
            "slug": "calculadora-cafe-french-press-ratio"
          },
          {
            "label": "V60 y Pour Over",
            "slug": "calculadora-cafe-ratio-v60-pour-over"
          }
        ]
      },
      {
        "title": "Cócteles",
        "icon": "🍹",
        "calcs": [
          {
            "label": "Mojito",
            "slug": "calculadora-mojito-cubano-ingredientes"
          },
          {
            "label": "Margarita",
            "slug": "calculadora-margarita-ingredientes-jarra"
          },
          {
            "label": "Pisco Sour",
            "slug": "calculadora-pisco-sour-receta"
          },
          {
            "label": "Negroni",
            "slug": "calculadora-negroni-proporciones-invitados"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-edad-perro-gato-anos-humanos-tabla-2026-actualizada",
    "title": "🐾 Mascotas",
    "subtitle": "Edad, nutrición y cuidados",
    "sections": [
      {
        "title": "Edad de mascotas",
        "icon": "📅",
        "calcs": [
          {
            "label": "Edad perro/gato humana",
            "slug": "calculadora-edad-perro-gato-anos-humanos-tabla-2026-actualizada"
          },
          {
            "label": "Edad humana por raza",
            "slug": "calculadora-edad-humana-por-raza-perro"
          },
          {
            "label": "Edad tortuga en años",
            "slug": "calculadora-edad-humana-tortuga"
          }
        ]
      },
      {
        "title": "Gatos",
        "icon": "🐈",
        "calcs": [
          {
            "label": "Comida diaria gato",
            "slug": "calculadora-comida-gato-diaria-gramos"
          },
          {
            "label": "Arena sanitaria/mes",
            "slug": "calculadora-arena-sanitaria-gato-kg-mes"
          },
          {
            "label": "Costo mensual gato",
            "slug": "calculadora-costo-mensual-raza-gato"
          }
        ]
      },
      {
        "title": "Acuarios y peces",
        "icon": "🐠",
        "calcs": [
          {
            "label": "Iluminación acuario",
            "slug": "calculadora-acuario-iluminacion-watts-litros-plantado"
          },
          {
            "label": "Cantidad de peces",
            "slug": "calculadora-cantidad-peces-acuario-litros"
          },
          {
            "label": "Alimento por pez",
            "slug": "calculadora-alimento-acuario-por-pez"
          },
          {
            "label": "Litros Betta",
            "slug": "calculadora-agua-pez-betta-litros"
          }
        ]
      },
      {
        "title": "Reptiles y otros",
        "icon": "🦎",
        "calcs": [
          {
            "label": "Comida tortuga/día",
            "slug": "calculadora-comida-tortuga-diaria-gramos"
          },
          {
            "label": "Alimento iguana",
            "slug": "calculadora-alimento-iguana-diario"
          },
          {
            "label": "Axolotl acuario",
            "slug": "calculadora-axolotl-acuario-tamano-temperatura-litros"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-cantidad-ladrillos-metro-cuadrado-pared",
    "title": "🏗️ Centro de construcción",
    "subtitle": "Cálculos integrales para tu proyecto de obra",
    "sections": [
      {
        "title": "Muros y ladrillos",
        "icon": "🧱",
        "calcs": [
          {
            "label": "Ladrillos por m²",
            "slug": "calculadora-cantidad-ladrillos-metro-cuadrado-pared"
          },
          {
            "label": "Bloques hormigón",
            "slug": "calculadora-bloques-hormigon-por-m2-pared"
          },
          {
            "label": "Mortero para juntas",
            "slug": "calculadora-mortero-juntas-ladrillos-m2-pared"
          },
          {
            "label": "Cerco perimetral",
            "slug": "calculadora-cerramiento-perimetro-casa-ladrillos-costo"
          },
          {
            "label": "Revoque",
            "slug": "calculadora-revoque-cemento-cal-arena"
          }
        ]
      },
      {
        "title": "Hormigón y estructura",
        "icon": "🏗️",
        "calcs": [
          {
            "label": "Receta hormigón",
            "slug": "calculadora-cemento-arena-hormigon-receta-metro-cubico"
          },
          {
            "label": "Componentes",
            "slug": "calculadora-cemento-arena-piedra-por-m3-hormigon"
          },
          {
            "label": "Bolsas cemento",
            "slug": "calculadora-conversor-bolsas-cemento-por-metro-cubico"
          },
          {
            "label": "Viga hormigón",
            "slug": "calculadora-viga-hormigon-h-b-dimensiones"
          },
          {
            "label": "Malla sima",
            "slug": "calculadora-malla-sima-losa-m2"
          }
        ]
      },
      {
        "title": "Pintura y revestimientos",
        "icon": "🎨",
        "calcs": [
          {
            "label": "Pintura por m²",
            "slug": "calculadora-pintura-litros-m2-manos"
          },
          {
            "label": "Azulejos cajas",
            "slug": "calculadora-azulejos-baldosas-metros-cuadrados-cantidad"
          },
          {
            "label": "Cerámicos",
            "slug": "calculadora-ceramicos-m2-cajas"
          },
          {
            "label": "Pegamento",
            "slug": "calculadora-pegamento-ceramicas-bolsas-m2-area"
          },
          {
            "label": "Pastina rejunte",
            "slug": "calculadora-juntas-pastina-rejuntado-ceramicos-kg"
          }
        ]
      },
      {
        "title": "Áridos y materiales",
        "icon": "📦",
        "calcs": [
          {
            "label": "Arena y grava",
            "slug": "calculadora-arena-grava-hormigon"
          },
          {
            "label": "Arena relleno",
            "slug": "calculadora-arena-relleno-terreno-m3"
          },
          {
            "label": "Caño estructural",
            "slug": "calculadora-cano-estructural-peso-ml"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-consumo-nafta-litros-100km",
    "title": "🚗 Centro automotor",
    "subtitle": "Todo lo que necesitás para tu vehículo",
    "sections": [
      {
        "title": "Combustible y consumo",
        "icon": "⛽",
        "calcs": [
          {
            "label": "Consumo L/100km",
            "slug": "calculadora-consumo-nafta-litros-100km"
          },
          {
            "label": "Autonomía tanque",
            "slug": "calculadora-autonomia-tanque-lleno-kilometros"
          },
          {
            "label": "GNC vs nafta",
            "slug": "calculadora-comparar-nafta-vs-gnc-ahorro"
          },
          {
            "label": "Costo viaje",
            "slug": "calculadora-costo-viaje-combustible-kilometros"
          },
          {
            "label": "Auto eléctrico",
            "slug": "calculadora-ahorro-auto-electrico-vs-nafta-anual"
          }
        ]
      },
      {
        "title": "Costos y mantenimiento",
        "icon": "💳",
        "calcs": [
          {
            "label": "Mantenimiento",
            "slug": "calculadora-costo-mantenimiento-auto-anual-km"
          },
          {
            "label": "Costo por km",
            "slug": "calculadora-costo-por-kilometro-auto"
          },
          {
            "label": "TCO anual",
            "slug": "calculadora-costo-total-propiedad-auto-anual"
          }
        ]
      },
      {
        "title": "Impuestos y patente",
        "icon": "📋",
        "calcs": [
          {
            "label": "Patente provincia",
            "slug": "calculadora-patente-auto-provincia"
          },
          {
            "label": "VTV 2026",
            "slug": "calculadora-vtv-costo-provincia-2026"
          },
          {
            "label": "Seguro auto",
            "slug": "calculadora-seguro-auto-estimacion-precio"
          },
          {
            "label": "Peajes ruta",
            "slug": "calculadora-peaje-ruta-costo-total-viaje"
          }
        ]
      },
      {
        "title": "Eficiencia y ambiente",
        "icon": "🌱",
        "calcs": [
          {
            "label": "Emisiones CO₂ auto",
            "slug": "calculadora-emision-co2-auto-combustible"
          },
          {
            "label": "Huella auto anual",
            "slug": "calculadora-huella-carbono-auto-anual"
          },
          {
            "label": "Bici vs auto",
            "slug": "calculadora-consumo-bicicleta-vs-auto-anual"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-porcentaje-aumento-disminucion",
    "title": "📊 Matemática esencial",
    "subtitle": "Porcentajes, geometría, álgebra y estadística",
    "sections": [
      {
        "title": "Porcentajes",
        "icon": "🔢",
        "calcs": [
          {
            "label": "Aumento/Disminución",
            "slug": "calculadora-porcentaje-aumento-disminucion"
          },
          {
            "label": "X% de número",
            "slug": "calculadora-porcentaje-de-numero-calculadora"
          },
          {
            "label": "Descuento",
            "slug": "calculadora-descuento-porcentaje-precio"
          }
        ]
      },
      {
        "title": "Geometría",
        "icon": "🔺",
        "calcs": [
          {
            "label": "Círculo área/perímetro",
            "slug": "calculadora-area-perimetro-circulo-radio"
          },
          {
            "label": "Triángulo (Herón)",
            "slug": "calculadora-area-triangulo-heron-tres-lados"
          },
          {
            "label": "Esfera volumen",
            "slug": "calculadora-volumen-superficie-esfera-radio"
          }
        ]
      },
      {
        "title": "Álgebra y ecuaciones",
        "icon": "➗",
        "calcs": [
          {
            "label": "Ecuación cuadrática",
            "slug": "calculadora-ecuacion-cuadratica-formula-resolvente"
          },
          {
            "label": "Regla de 3",
            "slug": "calculadora-regla-de-tres-simple-directa-inversa"
          },
          {
            "label": "Pitágoras",
            "slug": "calculadora-teorema-pitagoras-hipotenusa-cateto"
          }
        ]
      },
      {
        "title": "Estadística",
        "icon": "📊",
        "calcs": [
          {
            "label": "Media/Mediana/Moda",
            "slug": "calculadora-media-mediana-moda"
          },
          {
            "label": "Desviación estándar",
            "slug": "calculadora-desviacion-estandar-varianza"
          },
          {
            "label": "Distribución normal",
            "slug": "calculadora-distribucion-normal-area"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-almacenamiento-bytes-kb-mb-gb-tb",
    "title": "💻 Tecnología y datos",
    "subtitle": "Almacenamiento, redes y pantallas",
    "sections": [
      {
        "title": "Datos y almacenamiento",
        "icon": "💽",
        "calcs": [
          {
            "label": "Bytes/KB/MB/GB/TB",
            "slug": "calculadora-almacenamiento-bytes-kb-mb-gb-tb"
          },
          {
            "label": "Bits a Bytes",
            "slug": "calculadora-bits-bytes-kilobytes-megabytes-conversion"
          },
          {
            "label": "Megabytes a GB",
            "slug": "calculadora-conversor-mb-a-gb"
          }
        ]
      },
      {
        "title": "Redes y descarga",
        "icon": "📡",
        "calcs": [
          {
            "label": "Tiempo descarga",
            "slug": "calculadora-ancho-banda-descarga-tiempo"
          },
          {
            "label": "Bitrate streaming",
            "slug": "calculadora-bandwidth-streaming-bitrate-resolucion-youtube"
          },
          {
            "label": "Velocidad Mbps real",
            "slug": "calculadora-velocidad-internet-mbps-real"
          }
        ]
      },
      {
        "title": "Física y ciencia",
        "icon": "⚡",
        "calcs": [
          {
            "label": "Fuerza (F=m·a)",
            "slug": "calculadora-aceleracion-fuerza-masa"
          },
          {
            "label": "Caída libre",
            "slug": "calculadora-caida-libre-tiempo-altura"
          },
          {
            "label": "Energía cinética",
            "slug": "calculadora-energia-cinetica-joules"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-aceleracion-fuerza-masa",
    "title": "⚡ Ciencia y física",
    "subtitle": "Movimiento, energía y conversiones físicas",
    "sections": [
      {
        "title": "Movimiento y fuerzas",
        "icon": "🏃",
        "calcs": [
          {
            "label": "Fuerza (F=m·a)",
            "slug": "calculadora-aceleracion-fuerza-masa"
          },
          {
            "label": "Caída libre",
            "slug": "calculadora-caida-libre-tiempo-altura"
          },
          {
            "label": "Velocidad/distancia",
            "slug": "calculadora-velocidad-distancia-tiempo-fisica"
          }
        ]
      },
      {
        "title": "Energía",
        "icon": "⚡",
        "calcs": [
          {
            "label": "Energía cinética",
            "slug": "calculadora-energia-cinetica-joules"
          },
          {
            "label": "kWh a Joules",
            "slug": "calculadora-conversor-kwh-a-joules"
          },
          {
            "label": "HP a kW",
            "slug": "calculadora-conversor-hp-a-kw"
          }
        ]
      },
      {
        "title": "Conversiones",
        "icon": "🌡️",
        "calcs": [
          {
            "label": "Temperatura",
            "slug": "calculadora-conversion-celsius-fahrenheit-kelvin-rankine-temperatura"
          },
          {
            "label": "°C a Kelvin",
            "slug": "calculadora-conversor-celsius-a-kelvin"
          },
          {
            "label": "Bar a PSI",
            "slug": "calculadora-conversor-bar-a-psi"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-promedio-notas-universidad",
    "title": "🎓 Educación",
    "subtitle": "Notas, estudio, becas e idiomas",
    "sections": [
      {
        "title": "Notas y promedios",
        "icon": "🎓",
        "calcs": [
          {
            "label": "Promedio universidad",
            "slug": "calculadora-promedio-notas-universidad"
          },
          {
            "label": "Nota para aprobar",
            "slug": "calculadora-nota-necesaria-aprobar"
          },
          {
            "label": "GPA a escala 4.0",
            "slug": "calculadora-gpa-argentino-a-escala-4"
          }
        ]
      },
      {
        "title": "Horas de estudio",
        "icon": "⏰",
        "calcs": [
          {
            "label": "Pomodoro óptimo",
            "slug": "calculadora-pomodoro-optimo-materia"
          },
          {
            "label": "Método Feynman",
            "slug": "calculadora-metodo-feynman-tiempo"
          },
          {
            "label": "Mejor hora estudiar",
            "slug": "calculadora-ciclo-circadiano-estudio"
          }
        ]
      },
      {
        "title": "Becas y cuotas",
        "icon": "🏆",
        "calcs": [
          {
            "label": "Promedio para beca",
            "slug": "calculadora-promedio-beca-argentina"
          },
          {
            "label": "Beca % descuento",
            "slug": "calculadora-beca-porcentaje-descuento-cuota"
          }
        ]
      },
      {
        "title": "Idiomas",
        "icon": "🗣️",
        "calcs": [
          {
            "label": "Horas a fluidez FSI",
            "slug": "calculadora-horas-estudio-idioma-fluidez-fsi"
          },
          {
            "label": "C1 inglés en meses",
            "slug": "calculadora-tiempo-c1-ingles-horas-semanales-meta-meses"
          },
          {
            "label": "Películas inmersión",
            "slug": "calculadora-horas-peliculas-serie-inmersion-idioma"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-precio-venta-producto-markup",
    "title": "💰 Negocios",
    "subtitle": "Precios, costos, facturación y ROI",
    "sections": [
      {
        "title": "Precios y márgenes",
        "icon": "💰",
        "calcs": [
          {
            "label": "Precio de venta",
            "slug": "calculadora-precio-venta-producto-markup"
          },
          {
            "label": "Markup vs margen",
            "slug": "calculadora-markup-vs-margen"
          },
          {
            "label": "Precio mínimo venta",
            "slug": "calculadora-precio-minimo-venta-con-margen"
          }
        ]
      },
      {
        "title": "Facturación",
        "icon": "📈",
        "calcs": [
          {
            "label": "Punto equilibrio",
            "slug": "calculadora-punto-equilibrio-break-even"
          },
          {
            "label": "Facturación mínima",
            "slug": "calculadora-facturacion-minima-negocio"
          },
          {
            "label": "Rotación inventario",
            "slug": "calculadora-inventario-turnover-ratio"
          }
        ]
      },
      {
        "title": "Rentabilidad",
        "icon": "🚀",
        "calcs": [
          {
            "label": "Burn rate startup",
            "slug": "calculadora-burn-rate-runway-startup"
          },
          {
            "label": "CAC sales funnel",
            "slug": "calculadora-cac-costo-adquisicion-sales-funnel"
          },
          {
            "label": "ROI coaching",
            "slug": "calculadora-roi-coaching-1-on-1-venta"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-instagram-ads-presupuesto-cpm-cpr-roi-2026",
    "title": "📱 Marketing",
    "subtitle": "Publicidad, redes y conversión",
    "sections": [
      {
        "title": "Publicidad y ROI",
        "icon": "📊",
        "calcs": [
          {
            "label": "Instagram ROI ads",
            "slug": "calculadora-instagram-ads-presupuesto-cpm-cpr-roi-2026"
          },
          {
            "label": "CPA, CAC, LTV",
            "slug": "calculadora-cpa-cac-ltv"
          },
          {
            "label": "Atribución click",
            "slug": "calculadora-attribution-modelo-primer-ultimo-click"
          }
        ]
      },
      {
        "title": "Redes y engagement",
        "icon": "📱",
        "calcs": [
          {
            "label": "Orgánico vs pago",
            "slug": "calculadora-alcance-organico-vs-pago-redes"
          },
          {
            "label": "Reach Instagram",
            "slug": "calculadora-instagram-reach-organico-promedio"
          },
          {
            "label": "Engagement TikTok",
            "slug": "calculadora-tiktok-engagement-rate"
          }
        ]
      },
      {
        "title": "Conversión",
        "icon": "🎯",
        "calcs": [
          {
            "label": "Frecuencia posteo",
            "slug": "calculadora-frecuencia-publicacion-redes-sociales"
          },
          {
            "label": "Suscriptores YouTube",
            "slug": "calculadora-youtube-suscriptores-para-1000"
          }
        ]
      }
    ]
  },
  {
    "anchorSlug": "calculadora-costo-mochilero-por-pais",
    "title": "✈️ Viajes",
    "subtitle": "Presupuesto, transporte y millas",
    "sections": [
      {
        "title": "Presupuesto",
        "icon": "💰",
        "calcs": [
          {
            "label": "Presupuesto mochilero",
            "slug": "calculadora-costo-mochilero-por-pais"
          },
          {
            "label": "Presupuesto Bali",
            "slug": "calculadora-presupuesto-viaje-bali-indonesia"
          },
          {
            "label": "Presupuesto Barcelona",
            "slug": "calculadora-presupuesto-viaje-barcelona"
          },
          {
            "label": "Coliving nómadas",
            "slug": "calculadora-coliving-precio-mes-bali-medellin-mexico"
          }
        ]
      },
      {
        "title": "Transporte",
        "icon": "✈️",
        "calcs": [
          {
            "label": "Alquiler auto",
            "slug": "calculadora-alquiler-auto-pais-presupuesto"
          },
          {
            "label": "Distancia vuelos",
            "slug": "calculadora-distancia-vuelo-2-ciudades"
          },
          {
            "label": "Equipaje extra",
            "slug": "calculadora-equipaje-extra-costo-aerolinea"
          }
        ]
      },
      {
        "title": "Millas y emigrar",
        "icon": "💳",
        "calcs": [
          {
            "label": "Millas LATAM",
            "slug": "calculadora-millas-latam-destino"
          },
          {
            "label": "Millas American",
            "slug": "calculadora-millas-american-aa-destino"
          },
          {
            "label": "Emigrar a España",
            "slug": "calculadora-emigrar-espana-presupuesto-primer-ano-familia"
          }
        ]
      }
    ]
  }
];

/** Devuelve el hub anclado a un slug, o null. */
export function findHubForSlug(slug: string): CategoryHubData | null {
  return CATEGORY_HUBS.find((h) => h.anchorSlug === slug) || null;
}
