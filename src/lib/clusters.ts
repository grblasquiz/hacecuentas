/**
 * Clusters temáticos: grupos de calcs relacionadas que se renderizan
 * prominentes (chip bar) en cada miembro del cluster.
 *
 * Generado parcialmente: 3 clusters seed (embarazo/dolar/pesoPerros) +
 * clusters nuevos curados (slugs validados contra el catálogo real).
 */

export interface ClusterSlug {
  slug: string;
  label: string;
  icon: string;
}

export interface Cluster {
  id: string;
  title: string;
  items: ClusterSlug[];
}

export const CLUSTERS: Record<string, Cluster> = {
  "embarazo": {
    "id": "embarazo",
    "title": "Herramientas de embarazo y bebé",
    "items": [
      {
        "slug": "calculadora-embarazo",
        "label": "Semana actual",
        "icon": "🤰"
      },
      {
        "slug": "calculadora-fecha-probable-parto-ultima-menstruacion",
        "label": "Fecha de parto",
        "icon": "📅"
      },
      {
        "slug": "tracker-embarazo-semana-a-semana",
        "label": "Tracker semanal",
        "icon": "📆"
      },
      {
        "slug": "calculadora-calorias-embarazo-trimestre",
        "label": "Calorías extra",
        "icon": "🍎"
      },
      {
        "slug": "calculadora-aumento-peso-embarazo-imc-semana",
        "label": "Aumento peso",
        "icon": "⚖️"
      },
      {
        "slug": "calculadora-percentil-peso-bebe-oms-edad-meses",
        "label": "Peso bebé",
        "icon": "👶"
      },
      {
        "slug": "calculadora-indice-masa-corporal-pediatrico",
        "label": "IMC pediátrico",
        "icon": "📊"
      },
      {
        "slug": "calculadora-calendario-vacunas-bebe-argentina-2026-completo",
        "label": "Vacunas bebé",
        "icon": "💉"
      }
    ]
  },
  "dolar": {
    "id": "dolar",
    "title": "Dashboard cambiario",
    "items": [
      {
        "slug": "cambio-de-monedas",
        "label": "Cambio monedas",
        "icon": "💱"
      },
      {
        "slug": "valores-bcra",
        "label": "Valores BCRA",
        "icon": "🏦"
      },
      {
        "slug": "calculadora-brecha-dolar-blue-mep-ccl-oficial",
        "label": "Brecha dólar",
        "icon": "📊"
      },
      {
        "slug": "inflacion-argentina",
        "label": "Inflación",
        "icon": "📈"
      },
      {
        "slug": "comparador-plazo-fijo",
        "label": "Plazo fijo",
        "icon": "💰"
      }
    ]
  },
  "pesoPerros": {
    "id": "pesoPerros",
    "title": "Peso ideal por raza de perro",
    "items": [
      {
        "slug": "calculadora-peso-ideal-beagle",
        "label": "Beagle",
        "icon": "🐶"
      },
      {
        "slug": "calculadora-peso-ideal-bulldog-frances",
        "label": "Bulldog francés",
        "icon": "🐕"
      },
      {
        "slug": "calculadora-peso-ideal-golden-retriever",
        "label": "Golden retriever",
        "icon": "🐕‍🦺"
      },
      {
        "slug": "calculadora-peso-ideal-labrador-retriever",
        "label": "Labrador",
        "icon": "🦮"
      },
      {
        "slug": "calculadora-peso-ideal-pastor-aleman",
        "label": "Pastor alemán",
        "icon": "🐺"
      },
      {
        "slug": "calculadora-peso-ideal-husky-siberiano",
        "label": "Husky siberiano",
        "icon": "🐕"
      },
      {
        "slug": "calculadora-peso-ideal-pitbull",
        "label": "Pitbull",
        "icon": "🐕"
      },
      {
        "slug": "calculadora-peso-ideal-rottweiler",
        "label": "Rottweiler",
        "icon": "🐕"
      },
      {
        "slug": "calculadora-peso-ideal-chihuahua",
        "label": "Chihuahua",
        "icon": "🐕"
      },
      {
        "slug": "calculadora-peso-ideal-boxer",
        "label": "Boxer",
        "icon": "🐕"
      },
      {
        "slug": "calculadora-peso-ideal-caniche-poodle",
        "label": "Caniche",
        "icon": "🐩"
      },
      {
        "slug": "calculadora-peso-ideal-dachshund-salchicha",
        "label": "Salchicha",
        "icon": "🐕"
      }
    ]
  },
  "sueldoTrabajo": {
    "id": "sueldoTrabajo",
    "title": "Sueldo y trabajo",
    "items": [
      {
        "slug": "sueldo-en-mano-argentina",
        "label": "Sueldo en mano",
        "icon": "💰"
      },
      {
        "slug": "calculadora-sueldo-neto-a-bruto",
        "label": "Neto a bruto",
        "icon": "🔄"
      },
      {
        "slug": "calculadora-ajuste-sueldo-inflacion",
        "label": "Tu sueldo vs inflación",
        "icon": "📊"
      },
      {
        "slug": "calculadora-aguinaldo-sac",
        "label": "Aguinaldo (SAC)",
        "icon": "🎁"
      },
      {
        "slug": "calculadora-cuota-sindical-descuento-sueldo",
        "label": "Cuota sindical",
        "icon": "🏛️"
      }
    ]
  },
  "ahorroInversion": {
    "id": "ahorroInversion",
    "title": "Ahorro e inversión",
    "items": [
      {
        "slug": "calculadora-interes-compuesto-aporte-mensual",
        "label": "Interés compuesto",
        "icon": "📈"
      },
      {
        "slug": "calculadora-ahorro-compuesto-tiempo-duplicar-regla-72",
        "label": "Regla 72",
        "icon": "📐"
      },
      {
        "slug": "calculadora-ahorro-meta-mensual",
        "label": "Meta de ahorro",
        "icon": "🎯"
      },
      {
        "slug": "calculadora-plazo-fijo-uva-precancelable-rendimiento",
        "label": "Plazo fijo UVA",
        "icon": "📈"
      },
      {
        "slug": "calculadora-plazo-fijo",
        "label": "Plazo fijo",
        "icon": "🏦"
      }
    ]
  },
  "monotributo": {
    "id": "monotributo",
    "title": "Monotributo",
    "items": [
      {
        "slug": "calculadora-monotributo-categoria-2026-recategorizacion-julio",
        "label": "Recategorización 2026",
        "icon": "📋"
      },
      {
        "slug": "calculadora-monotributo-vs-autonomo-vs-empleado-mismo-ingreso",
        "label": "Mono vs Autónomo",
        "icon": "⚖️"
      },
      {
        "slug": "calculadora-facturacion-maxima-monotributo-vs-ri",
        "label": "Facturación máxima",
        "icon": "📈"
      },
      {
        "slug": "calculadora-monotributo-alta-afip-tramite-zero",
        "label": "Alta monotributo",
        "icon": "📝"
      },
      {
        "slug": "calculadora-ganancias-monotributista-pase-regimen-general",
        "label": "Pase a RI",
        "icon": "🧾"
      }
    ]
  },
  "ganancias4ta": {
    "id": "ganancias4ta",
    "title": "Ganancias 4ta categoría",
    "items": [
      {
        "slug": "calculadora-ganancias-4ta-categoria-2026",
        "label": "Ganancias 4ta 2026",
        "icon": "📊"
      },
      {
        "slug": "calculadora-deduccion-alquiler-ganancias-40-porciento",
        "label": "Deducción alquiler",
        "icon": "🏠"
      },
      {
        "slug": "calculadora-deduccion-familia-conyuge-hijo-ganancias",
        "label": "Deducción familia",
        "icon": "👨‍👩‍👧"
      },
      {
        "slug": "calculadora-deduccion-prepaga-medicina-ganancias",
        "label": "Deducción prepaga",
        "icon": "🏥"
      }
    ]
  },
  "creditoHipoteca": {
    "id": "creditoHipoteca",
    "title": "Crédito e hipoteca",
    "items": [
      {
        "slug": "calculadora-hipoteca-mensual-cuota-fija",
        "label": "Hipoteca cuota",
        "icon": "🏠"
      },
      {
        "slug": "calculadora-amortizacion-prestamo-frances-aleman",
        "label": "Amortización préstamo",
        "icon": "📋"
      },
      {
        "slug": "calculadora-credito-anses-pre-aprobado-jubilado-cuota",
        "label": "Crédito ANSES",
        "icon": "💰"
      },
      {
        "slug": "calculadora-credito-prendario-auto-cft-comparativa-bancos",
        "label": "Crédito auto",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-hipoteca-divisa-extranjera-vs-uva",
        "label": "Hipoteca USD vs UVA",
        "icon": "🏠"
      }
    ]
  },
  "autonomos": {
    "id": "autonomos",
    "title": "Autónomos y categorización",
    "items": [
      {
        "slug": "calculadora-autonomos-categoria-monto-2026",
        "label": "Categorías autónomos",
        "icon": "🧑‍💼"
      },
      {
        "slug": "calculadora-autonomos-categorias-2026-aportes",
        "label": "Aportes autónomos",
        "icon": "👔"
      },
      {
        "slug": "calculadora-sueldo-neto-autonomo-monotributista",
        "label": "Sueldo neto autónomo",
        "icon": "🧾"
      }
    ]
  },
  "runningCluster": {
    "id": "runningCluster",
    "title": "Running",
    "items": [
      {
        "slug": "calculadora-pace-ritmo-running",
        "label": "Pace/ritmo",
        "icon": "🏃"
      },
      {
        "slug": "calculadora-plan-entrenamiento-5k-semanas",
        "label": "Plan 5K",
        "icon": "🏃"
      },
      {
        "slug": "calculadora-plan-entrenamiento-maraton-42k-semanas",
        "label": "Plan maratón",
        "icon": "🏃"
      },
      {
        "slug": "calculadora-calorias-quemadas-running-km-peso",
        "label": "Calorías",
        "icon": "🔥"
      }
    ]
  },
  "ciclismoCluster": {
    "id": "ciclismoCluster",
    "title": "Ciclismo",
    "items": [
      {
        "slug": "calculadora-ftp-cycling-watts",
        "label": "FTP test 20min",
        "icon": "🚴"
      },
      {
        "slug": "calculadora-ftp-watts-ciclismo",
        "label": "Zonas potencia",
        "icon": "🚴"
      },
      {
        "slug": "calculadora-calorias-ciclismo-intensidad",
        "label": "Calorías bici",
        "icon": "🔥"
      },
      {
        "slug": "calculadora-potencia-ciclismo-watts-kg",
        "label": "Potencia W/kg",
        "icon": "💪"
      }
    ]
  },
  "gimnasioCluster": {
    "id": "gimnasioCluster",
    "title": "Gimnasio",
    "items": [
      {
        "slug": "calculadora-1rm-peso-maximo",
        "label": "1RM",
        "icon": "🏋️"
      },
      {
        "slug": "calculadora-1rm-peso-muerto-estimador",
        "label": "1RM peso muerto",
        "icon": "🏋️"
      },
      {
        "slug": "calculadora-calorias-gym-pesas-hora",
        "label": "Calorías gym",
        "icon": "🔥"
      }
    ]
  },
  "natacionCluster": {
    "id": "natacionCluster",
    "title": "Natación",
    "items": [
      {
        "slug": "calculadora-calorias-natacion-estilo",
        "label": "Calorías nado",
        "icon": "🏊"
      },
      {
        "slug": "calculadora-natacion-pace-100m",
        "label": "Pace 100m",
        "icon": "🏊"
      },
      {
        "slug": "calculadora-velocidad-critica-natacion",
        "label": "Velocidad crítica",
        "icon": "💨"
      }
    ]
  },
  "nutricionCluster": {
    "id": "nutricionCluster",
    "title": "Nutrición",
    "items": [
      {
        "slug": "calculadora-macros-deficit-volumen-mantenimiento",
        "label": "Macros deficit/vol",
        "icon": "🥗"
      },
      {
        "slug": "calculadora-macros-keto-dieta",
        "label": "Macros keto",
        "icon": "🥑"
      },
      {
        "slug": "calculadora-proteina-diaria-objetivo",
        "label": "Proteína diaria",
        "icon": "💪"
      },
      {
        "slug": "calculadora-calorias-diarias-tdee",
        "label": "Calorías TDEE",
        "icon": "🔥"
      }
    ]
  },
  "ciclofemeninoCluster": {
    "id": "ciclofemeninoCluster",
    "title": "Ciclo menstrual",
    "items": [
      {
        "slug": "calculadora-calendario-ovulacion-ciclo-menstrual",
        "label": "Calendario ovulación",
        "icon": "🌸"
      },
      {
        "slug": "calculadora-ciclo-menstrual",
        "label": "Ciclo menstrual",
        "icon": "🌙"
      },
      {
        "slug": "calculadora-ovulacion-dias-fertiles",
        "label": "Días fértiles",
        "icon": "📅"
      },
      {
        "slug": "calculadora-fertilidad-amh-reserva-ovarica-edad",
        "label": "AMH reserva ovárica",
        "icon": "🥚"
      }
    ]
  },
  "suenoCluster": {
    "id": "suenoCluster",
    "title": "Sueño",
    "items": [
      {
        "slug": "calculadora-ciclo-sueno-rem-no-rem-90min",
        "label": "Ciclos REM/No-REM",
        "icon": "😴"
      },
      {
        "slug": "calculadora-horas-de-sueno-por-edad",
        "label": "Horas por edad",
        "icon": "🌙"
      },
      {
        "slug": "calculadora-melatonina-dosis-sueno-edad",
        "label": "Melatonina dosis",
        "icon": "🌙"
      },
      {
        "slug": "calculadora-meditacion-minutos-ansiedad-cortisol-impacto",
        "label": "Meditación impacto",
        "icon": "🧘"
      }
    ]
  },
  "hidratacionCluster": {
    "id": "hidratacionCluster",
    "title": "Hidratación",
    "items": [
      {
        "slug": "calculadora-agua-diaria-litros-segun-peso",
        "label": "Agua por peso",
        "icon": "💧"
      },
      {
        "slug": "calculadora-agua-diaria-recomendada",
        "label": "Agua diaria RDA",
        "icon": "💧"
      },
      {
        "slug": "calculadora-agua-ingesta-diaria-peso-actividad",
        "label": "Agua actividad",
        "icon": "🥤"
      },
      {
        "slug": "calculadora-hidratacion-diaria-personalizada",
        "label": "Hidratación personal",
        "icon": "💧"
      }
    ]
  },
  "fechasYTiempo": {
    "id": "fechasYTiempo",
    "title": "Fechas y tiempo",
    "items": [
      {
        "slug": "dias-entre-dos-fechas",
        "label": "Días entre fechas",
        "icon": "📅"
      },
      {
        "slug": "calculadora-dias-laborables-habiles-entre-fechas",
        "label": "Días hábiles",
        "icon": "📅"
      },
      {
        "slug": "calculadora-antiguedad-laboral",
        "label": "Antigüedad laboral",
        "icon": "📅"
      },
      {
        "slug": "calculadora-cuanto-falta-cumpleanos-fecha-personalizada-eventos",
        "label": "Cuánto falta",
        "icon": "🎂"
      }
    ]
  },
  "edadExacta": {
    "id": "edadExacta",
    "title": "Edad y cumpleaños",
    "items": [
      {
        "slug": "calculadora-edad-exacta",
        "label": "Calculadora de edad",
        "icon": "🎂"
      },
      {
        "slug": "calculadora-edad-exacta-anos-meses-dias-segundos",
        "label": "Edad años/meses/días",
        "icon": "⏱️"
      },
      {
        "slug": "calculadora-edad-planeta",
        "label": "Edad en otros planetas",
        "icon": "🪐"
      },
      {
        "slug": "calculadora-dias-juntos-pareja",
        "label": "Días juntos pareja",
        "icon": "📅"
      },
      {
        "slug": "calculadora-aniversario-pareja",
        "label": "Aniversario pareja",
        "icon": "💍"
      }
    ]
  },
  "ahorroConsumo": {
    "id": "ahorroConsumo",
    "title": "Ahorro y consumo hogar",
    "items": [
      {
        "slug": "calculadora-consumo-agua-hogar-mensual",
        "label": "Consumo agua mensual",
        "icon": "💧"
      },
      {
        "slug": "calculadora-ahorro-cambiar-lamparas-led",
        "label": "Ahorro a LED",
        "icon": "💡"
      },
      {
        "slug": "calculadora-ahorro-termo-electrico-vs-gas",
        "label": "Termo eléctrico vs gas",
        "icon": "🏠"
      },
      {
        "slug": "calculadora-heladera-clase-a-consumo-anual-kwh",
        "label": "Gasto heladera",
        "icon": "❄️"
      },
      {
        "slug": "calculadora-lavarropas-eficiencia-agua-litros-ciclo",
        "label": "Lavarropas",
        "icon": "💧"
      },
      {
        "slug": "calculadora-costo-mantenimiento-hogar-anual",
        "label": "Mantenimiento hogar",
        "icon": "🏠"
      }
    ]
  },
  "bebes": {
    "id": "bebes",
    "title": "Bebés y crianza",
    "items": [
      {
        "slug": "calculadora-fecha-probable-parto-calcular-semanas",
        "label": "Fecha probable parto",
        "icon": "🤰"
      },
      {
        "slug": "calculadora-panales-por-dia-mes-bebe-edad",
        "label": "Pañales por mes",
        "icon": "🧷"
      },
      {
        "slug": "calculadora-formula-infantil-biberon-edad-ml-dia",
        "label": "Biberón ml por edad",
        "icon": "🍼"
      },
      {
        "slug": "calculadora-horas-sueno-bebe-por-edad-tabla-recomendada",
        "label": "Sueño bebé",
        "icon": "😴"
      },
      {
        "slug": "calculadora-edad-quitar-panal-control-esfinteres",
        "label": "¿Cuándo dejar pañal?",
        "icon": "🚽"
      }
    ]
  },
  "derechosFamiliares": {
    "id": "derechosFamiliares",
    "title": "Derechos y licencias",
    "items": [
      {
        "slug": "calculadora-asignacion-universal-hijo-auh-2026-monto",
        "label": "AUH 2026",
        "icon": "👨‍👩‍👧"
      },
      {
        "slug": "calculadora-licencia-maternidad-anses-90-dias-extension",
        "label": "Licencia maternidad",
        "icon": "👶"
      },
      {
        "slug": "calculadora-edad-ingreso-escolar-primaria-jardin",
        "label": "Edad ingreso escolar",
        "icon": "🏫"
      },
      {
        "slug": "calculadora-frecuencia-desparasitar-familia-tipos",
        "label": "Desparasitar familia",
        "icon": "💊"
      }
    ]
  },
  "gastosFamiliares": {
    "id": "gastosFamiliares",
    "title": "Gastos de hijos",
    "items": [
      {
        "slug": "calculadora-ahorro-educacion-hijo-plan-colegio-universidad",
        "label": "Ahorro educación hijo",
        "icon": "💰"
      },
      {
        "slug": "calculadora-costo-total-criar-hijo-18-anios",
        "label": "Costo criar hijo",
        "icon": "💰"
      },
      {
        "slug": "calculadora-mesada-por-edad-hijo-semanal-mensual",
        "label": "Mesada por edad",
        "icon": "💵"
      },
      {
        "slug": "calculadora-edad-gestacional-ecografia-corona-rabadilla",
        "label": "Edad gestacional",
        "icon": "🩺"
      }
    ]
  },
  "cocinaConversiones": {
    "id": "cocinaConversiones",
    "title": "Conversión de medidas",
    "items": [
      {
        "slug": "calculadora-conversion-medidas-cocina-tazas-gramos",
        "label": "Tazas a gramos",
        "icon": "🥄"
      },
      {
        "slug": "conversor-tazas-gramos-cocina-recetas",
        "label": "Tazas, cucharadas, ml",
        "icon": "🥄"
      },
      {
        "slug": "calculadora-conversion-cucharaditas-gramos-especias-sal",
        "label": "Especias a gramos",
        "icon": "🥄"
      },
      {
        "slug": "calculadora-conversion-cups-gramos-harina-azucar-aceite",
        "label": "Cups a gramos",
        "icon": "🥣"
      }
    ]
  },
  "cocinaCafe": {
    "id": "cocinaCafe",
    "title": "Café y métodos",
    "items": [
      {
        "slug": "calculadora-cafe-molido-taza-metodo-preparacion",
        "label": "Molido por taza",
        "icon": "☕"
      },
      {
        "slug": "calculadora-cafe-aeropress-receta",
        "label": "Receta AeroPress",
        "icon": "☕"
      },
      {
        "slug": "calculadora-cafe-french-press-ratio",
        "label": "French Press",
        "icon": "☕"
      },
      {
        "slug": "calculadora-cafe-ratio-v60-pour-over",
        "label": "V60 y Pour Over",
        "icon": "☕"
      },
      {
        "slug": "calculadora-moka-pot-agua-cafe",
        "label": "Moka/Bialetti",
        "icon": "☕"
      }
    ]
  },
  "cocinaBebidas": {
    "id": "cocinaBebidas",
    "title": "Bebidas y cócteles",
    "items": [
      {
        "slug": "calculadora-aperol-spritz-proporciones",
        "label": "Aperol Spritz",
        "icon": "🍹"
      },
      {
        "slug": "calculadora-gin-tonic-proporciones",
        "label": "Gin Tonic",
        "icon": "🍸"
      },
      {
        "slug": "calculadora-margarita-ingredientes-jarra",
        "label": "Margarita",
        "icon": "🍹"
      },
      {
        "slug": "calculadora-mojito-cubano-ingredientes",
        "label": "Mojito",
        "icon": "🍹"
      },
      {
        "slug": "calculadora-negroni-proporciones-invitados",
        "label": "Negroni",
        "icon": "🍹"
      },
      {
        "slug": "calculadora-pisco-sour-receta",
        "label": "Pisco Sour",
        "icon": "🍹"
      }
    ]
  },
  "cocinaAsado": {
    "id": "cocinaAsado",
    "title": "Asado y carnes",
    "items": [
      {
        "slug": "calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo",
        "label": "Kg por persona",
        "icon": "🥩"
      },
      {
        "slug": "calculadora-carne-asado-kg-por-persona",
        "label": "Carne por persona",
        "icon": "🥩"
      },
      {
        "slug": "calculadora-cantidad-hamburguesas-parrilla-cumpleanos",
        "label": "Hamburguesas",
        "icon": "🍔"
      },
      {
        "slug": "calculadora-temperatura-interna-carne-punto-coccion",
        "label": "Temp. interna",
        "icon": "🌡️"
      }
    ]
  },
  "cocinaReposteria": {
    "id": "cocinaReposteria",
    "title": "Repostería y masas",
    "items": [
      {
        "slug": "calculadora-cantidad-pizzas-por-invitados-pizzeria",
        "label": "Pizzas invitados",
        "icon": "🍕"
      },
      {
        "slug": "calculadora-masa-pizza-casera-gramos-invitados",
        "label": "Masa pizza",
        "icon": "🍕"
      },
      {
        "slug": "calculadora-porciones-torta-cumpleanos-invitados-tamano",
        "label": "Torta cumpleaños",
        "icon": "🎂"
      },
      {
        "slug": "calculadora-equivalencia-huevos-tamano-gramos-claras",
        "label": "Huevos gramos",
        "icon": "🥚"
      }
    ]
  },
  "mascotasGatos": {
    "id": "mascotasGatos",
    "title": "Gatos",
    "items": [
      {
        "slug": "calculadora-comida-gato-diaria-gramos",
        "label": "Comida diaria",
        "icon": "🐈"
      },
      {
        "slug": "calculadora-arena-sanitaria-gato-kg-mes",
        "label": "Arena sanitaria",
        "icon": "🐾"
      },
      {
        "slug": "calculadora-costo-mensual-raza-gato",
        "label": "Costo mensual",
        "icon": "💰"
      },
      {
        "slug": "calculadora-agua-perro-gato-diaria-ml",
        "label": "Agua diaria",
        "icon": "💧"
      }
    ]
  },
  "jardineriaRiego": {
    "id": "jardineriaRiego",
    "title": "Riego y plantas",
    "items": [
      {
        "slug": "calculadora-agua-jardin-consumo-mensual-m2",
        "label": "Consumo agua m²",
        "icon": "🚿"
      },
      {
        "slug": "calculadora-agua-riego-plantas-dia",
        "label": "Agua por planta",
        "icon": "💧"
      },
      {
        "slug": "calculadora-riego-automatico-programacion-minutos",
        "label": "Riego automático",
        "icon": "⏱️"
      },
      {
        "slug": "calculadora-riego-goteo-litros-hora-planta",
        "label": "Riego por goteo",
        "icon": "💧"
      }
    ]
  },
  "murosLadrillos": {
    "id": "murosLadrillos",
    "title": "Muros y ladrillos",
    "items": [
      {
        "slug": "calculadora-cantidad-ladrillos-metro-cuadrado-pared",
        "label": "Ladrillos por m²",
        "icon": "🧱"
      },
      {
        "slug": "calculadora-bloques-hormigon-por-m2-pared",
        "label": "Bloques hormigón",
        "icon": "🧱"
      },
      {
        "slug": "calculadora-cemento-arena-hormigon-receta-metro-cubico",
        "label": "Hormigón receta",
        "icon": "🪨"
      },
      {
        "slug": "calculadora-arena-grava-hormigon",
        "label": "Arena y grava",
        "icon": "📦"
      },
      {
        "slug": "calculadora-mortero-juntas-ladrillos-m2-pared",
        "label": "Mortero juntas",
        "icon": "🧱"
      },
      {
        "slug": "calculadora-revoque-cemento-cal-arena",
        "label": "Revoque",
        "icon": "🔧"
      },
      {
        "slug": "calculadora-cerramiento-perimetro-casa-ladrillos-costo",
        "label": "Cerco perímetro",
        "icon": "🧱"
      }
    ]
  },
  "pinturaRevestimientos": {
    "id": "pinturaRevestimientos",
    "title": "Pintura y revestimientos",
    "items": [
      {
        "slug": "calculadora-pintura-litros-m2-manos",
        "label": "Pintura por m²",
        "icon": "🎨"
      },
      {
        "slug": "calculadora-conversor-litros-pintura-por-metro-cuadrado",
        "label": "Conversor pintura",
        "icon": "🎨"
      },
      {
        "slug": "calculadora-azulejos-baldosas-metros-cuadrados-cantidad",
        "label": "Azulejos cajas",
        "icon": "⬛"
      },
      {
        "slug": "calculadora-ceramicos-m2-cajas",
        "label": "Cerámicos cajas",
        "icon": "🔲"
      },
      {
        "slug": "calculadora-pisos-ceramicos-porcellanato-cajas",
        "label": "Porcellanato",
        "icon": "🟧"
      },
      {
        "slug": "calculadora-pegamento-ceramicas-bolsas-m2-area",
        "label": "Pegamento",
        "icon": "🪣"
      },
      {
        "slug": "calculadora-juntas-pastina-rejuntado-ceramicos-kg",
        "label": "Pastina rejunte",
        "icon": "📏"
      },
      {
        "slug": "calculadora-barniz-aceite-m2-madera",
        "label": "Barniz/aceite",
        "icon": "🔨"
      }
    ]
  },
  "hormigonAridos": {
    "id": "hormigonAridos",
    "title": "Hormigón y áridos",
    "items": [
      {
        "slug": "calculadora-cemento-arena-piedra-por-m3-hormigon",
        "label": "Componentes hormigón",
        "icon": "🏗️"
      },
      {
        "slug": "calculadora-conversor-bolsas-cemento-por-metro-cubico",
        "label": "Bolsas cemento",
        "icon": "🏗️"
      },
      {
        "slug": "calculadora-arena-relleno-terreno-m3",
        "label": "Arena relleno",
        "icon": "🏗️"
      },
      {
        "slug": "calculadora-cano-estructural-peso-ml",
        "label": "Caño estructural",
        "icon": "🏗️"
      },
      {
        "slug": "calculadora-malla-sima-losa-m2",
        "label": "Malla sima",
        "icon": "🏗️"
      },
      {
        "slug": "calculadora-viga-hormigon-h-b-dimensiones",
        "label": "Viga hormigón",
        "icon": "🏗️"
      }
    ]
  },
  "combustibleConsumo": {
    "id": "combustibleConsumo",
    "title": "Combustible y consumo",
    "items": [
      {
        "slug": "calculadora-consumo-nafta-litros-100km",
        "label": "Consumo L/100km",
        "icon": "⛽"
      },
      {
        "slug": "calculadora-autonomia-tanque-lleno-kilometros",
        "label": "Autonomía tanque",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-ahorro-gnc-vs-nafta-anual-ars",
        "label": "GNC vs nafta",
        "icon": "⛽"
      },
      {
        "slug": "calculadora-costo-viaje-combustible-kilometros",
        "label": "Costo viaje",
        "icon": "💵"
      },
      {
        "slug": "calculadora-emision-co2-auto-combustible",
        "label": "Emisiones CO₂",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-ahorro-auto-electrico-vs-nafta-anual",
        "label": "Auto eléctrico",
        "icon": "🔌"
      },
      {
        "slug": "calculadora-consumo-aire-acondicionado-auto-extra",
        "label": "Consumo A/A",
        "icon": "❄️"
      }
    ]
  },
  "costosAuto": {
    "id": "costosAuto",
    "title": "Costos de tener auto",
    "items": [
      {
        "slug": "calculadora-costo-mantenimiento-auto-anual-km",
        "label": "Mantenimiento",
        "icon": "🔧"
      },
      {
        "slug": "calculadora-patente-auto-provincia",
        "label": "Patente provincia",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-seguro-auto-estimacion-precio",
        "label": "Seguro estimado",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-costo-total-propiedad-auto-anual",
        "label": "TCO anual",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-vtv-costo-provincia-2026",
        "label": "VTV 2026",
        "icon": "🔍"
      },
      {
        "slug": "calculadora-costo-por-kilometro-auto",
        "label": "Costo por km",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-peaje-ruta-costo-total-viaje",
        "label": "Peajes ruta",
        "icon": "🚗"
      }
    ]
  },
  "huellaCarbono": {
    "id": "huellaCarbono",
    "title": "Huella de carbono",
    "items": [
      {
        "slug": "calculadora-huella-carbono-auto-anual",
        "label": "Huella auto",
        "icon": "🌱"
      },
      {
        "slug": "calculadora-huella-carbono-alimentacion-semanal",
        "label": "Huella dieta",
        "icon": "🥗"
      },
      {
        "slug": "calculadora-arboles-compensar-co2-huella",
        "label": "Árboles CO₂",
        "icon": "🌳"
      },
      {
        "slug": "calculadora-combustible-auto-viaje-emisiones",
        "label": "Emisiones viaje",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-ahorro-transporte-publico-vs-auto",
        "label": "Transporte público",
        "icon": "🌱"
      },
      {
        "slug": "calculadora-consumo-bicicleta-vs-auto-anual",
        "label": "Bici vs auto",
        "icon": "🚴"
      }
    ]
  },
  "porcentajesDescuentos": {
    "id": "porcentajesDescuentos",
    "title": "Porcentajes y descuentos",
    "items": [
      {
        "slug": "calculadora-porcentaje-aumento-disminucion",
        "label": "Aumento/Disminución %",
        "icon": "📊"
      },
      {
        "slug": "calculadora-porcentaje-de-numero-calculadora",
        "label": "X% de número",
        "icon": "🔢"
      },
      {
        "slug": "calculadora-descuento-porcentaje-precio",
        "label": "Descuento y precio",
        "icon": "🏷️"
      },
      {
        "slug": "calculadora-conversion-porcentaje-fraccion-decimal",
        "label": "Porcentaje/fracción",
        "icon": "📐"
      }
    ]
  },
  "geometriaAreas": {
    "id": "geometriaAreas",
    "title": "Geometría: áreas y volúmenes",
    "items": [
      {
        "slug": "calculadora-area-perimetro-circulo-radio",
        "label": "Círculo",
        "icon": "⭕"
      },
      {
        "slug": "calculadora-area-triangulo-heron-tres-lados",
        "label": "Triángulo (Herón)",
        "icon": "🔺"
      },
      {
        "slug": "calculadora-volumen-cilindro-radio-altura",
        "label": "Cilindro",
        "icon": "🥫"
      },
      {
        "slug": "calculadora-volumen-superficie-esfera-radio",
        "label": "Esfera",
        "icon": "🔮"
      },
      {
        "slug": "calculadora-volumen-cono-radio-altura",
        "label": "Cono",
        "icon": "🎉"
      }
    ]
  },
  "conversionUnidades": {
    "id": "conversionUnidades",
    "title": "Conversión de unidades",
    "items": [
      {
        "slug": "calculadora-conversion-celsius-fahrenheit-kelvin",
        "label": "Temperatura",
        "icon": "🌡️"
      },
      {
        "slug": "calculadora-conversor-kilogramos-a-libras",
        "label": "Kilos ↔ Libras",
        "icon": "⚖️"
      },
      {
        "slug": "calculadora-conversion-millas-kilometros-nudos-velocidad",
        "label": "km/millas",
        "icon": "📏"
      },
      {
        "slug": "calculadora-conversor-litros-a-galones",
        "label": "Litros ↔ Galones",
        "icon": "💧"
      }
    ]
  },
  "algebraEcuaciones": {
    "id": "algebraEcuaciones",
    "title": "Álgebra y ecuaciones",
    "items": [
      {
        "slug": "calculadora-ecuacion-cuadratica-formula-resolvente",
        "label": "Cuadrática",
        "icon": "📐"
      },
      {
        "slug": "calculadora-regla-de-tres-simple-directa-inversa",
        "label": "Regla de 3",
        "icon": "➗"
      },
      {
        "slug": "calculadora-teorema-pitagoras-hipotenusa-cateto",
        "label": "Pitágoras",
        "icon": "📐"
      },
      {
        "slug": "calculadora-sistema-ecuaciones-2x2-cramer",
        "label": "Sistema 2x2",
        "icon": "📊"
      }
    ]
  },
  "estadisticaBasica": {
    "id": "estadisticaBasica",
    "title": "Estadística básica",
    "items": [
      {
        "slug": "calculadora-media-mediana-moda",
        "label": "Media/Mediana/Moda",
        "icon": "📊"
      },
      {
        "slug": "calculadora-desviacion-estandar-varianza",
        "label": "Desviación estándar",
        "icon": "📉"
      },
      {
        "slug": "calculadora-distribucion-normal-area",
        "label": "Distribución normal",
        "icon": "🔔"
      },
      {
        "slug": "calculadora-z-score-valor-normal",
        "label": "Z-Score",
        "icon": "📈"
      }
    ]
  },
  "almacenamientoDatos": {
    "id": "almacenamientoDatos",
    "title": "Almacenamiento de datos",
    "items": [
      {
        "slug": "calculadora-almacenamiento-bytes-kb-mb-gb-tb",
        "label": "Bytes/KB/MB/GB/TB",
        "icon": "💻"
      },
      {
        "slug": "calculadora-bits-bytes-kilobytes-megabytes-conversion",
        "label": "Bits a Bytes",
        "icon": "💽"
      },
      {
        "slug": "calculadora-conversor-mb-a-gb",
        "label": "Megabytes a GB",
        "icon": "💾"
      }
    ]
  },
  "redesYDescarga": {
    "id": "redesYDescarga",
    "title": "Redes y descarga",
    "items": [
      {
        "slug": "calculadora-ancho-banda-descarga-tiempo",
        "label": "Tiempo descarga",
        "icon": "⬇️"
      },
      {
        "slug": "calculadora-tiempo-descarga-archivo-ancho-banda",
        "label": "Descarga por velocidad",
        "icon": "📡"
      },
      {
        "slug": "calculadora-bandwidth-streaming-bitrate-resolucion-youtube",
        "label": "Bitrate streaming",
        "icon": "📺"
      },
      {
        "slug": "calculadora-velocidad-internet-mbps-real",
        "label": "Velocidad Mbps",
        "icon": "💻"
      }
    ]
  },
  "fisicaMecanica": {
    "id": "fisicaMecanica",
    "title": "Física: movimiento y fuerzas",
    "items": [
      {
        "slug": "calculadora-aceleracion-fuerza-masa",
        "label": "Fuerza (F=m·a)",
        "icon": "⚡"
      },
      {
        "slug": "calculadora-caida-libre-tiempo-altura",
        "label": "Caída libre",
        "icon": "🪂"
      },
      {
        "slug": "calculadora-velocidad-distancia-tiempo-fisica",
        "label": "Velocidad/distancia",
        "icon": "🏃"
      },
      {
        "slug": "calculadora-energia-cinetica-joules",
        "label": "Energía cinética",
        "icon": "💨"
      }
    ]
  },
  "conversionFisica": {
    "id": "conversionFisica",
    "title": "Conversión unidades físicas",
    "items": [
      {
        "slug": "calculadora-conversor-celsius-a-kelvin",
        "label": "°C a Kelvin",
        "icon": "🌡️"
      },
      {
        "slug": "calculadora-conversor-kwh-a-joules",
        "label": "kWh a Joules",
        "icon": "⚡"
      },
      {
        "slug": "calculadora-conversor-hp-a-kw",
        "label": "HP a kW",
        "icon": "🐎"
      },
      {
        "slug": "calculadora-conversor-bar-a-psi",
        "label": "Bar a PSI",
        "icon": "🔧"
      }
    ]
  },
  "notasPromedios": {
    "id": "notasPromedios",
    "title": "Notas y promedios",
    "items": [
      {
        "slug": "calculadora-promedio-notas-universidad",
        "label": "Promedio de notas",
        "icon": "🎓"
      },
      {
        "slug": "calculadora-nota-necesaria-aprobar",
        "label": "Nota para aprobar",
        "icon": "🎓"
      },
      {
        "slug": "calculadora-nota-final-necesaria-universidad",
        "label": "Nota final necesaria",
        "icon": "🎓"
      },
      {
        "slug": "calculadora-gpa-argentino-a-escala-4",
        "label": "GPA a escala 4.0",
        "icon": "🎓"
      },
      {
        "slug": "calculadora-promedio-beca-argentina",
        "label": "Promedio para beca",
        "icon": "🏆"
      },
      {
        "slug": "calculadora-nota-minima-aprobar-final-parcial-promedio",
        "label": "Nota mínima final",
        "icon": "📝"
      }
    ]
  },
  "horasEstudio": {
    "id": "horasEstudio",
    "title": "Horas de estudio",
    "items": [
      {
        "slug": "calculadora-horas-preparar-sat",
        "label": "Horas preparar SAT",
        "icon": "📝"
      },
      {
        "slug": "calculadora-pomodoro-optimo-materia",
        "label": "Pomodoros óptimos",
        "icon": "🍅"
      },
      {
        "slug": "calculadora-cornell-apuntes-tiempo",
        "label": "Método Cornell",
        "icon": "📝"
      },
      {
        "slug": "calculadora-metodo-feynman-tiempo",
        "label": "Método Feynman",
        "icon": "🎓"
      },
      {
        "slug": "calculadora-ciclo-circadiano-estudio",
        "label": "Mejor hora estudiar",
        "icon": "⏰"
      }
    ]
  },
  "preciosMargenes": {
    "id": "preciosMargenes",
    "title": "Precios y márgenes",
    "items": [
      {
        "slug": "calculadora-precio-venta-producto-markup",
        "label": "Precio de venta",
        "icon": "💰"
      },
      {
        "slug": "calculadora-markup-vs-margen",
        "label": "Markup vs margen",
        "icon": "🔄"
      },
      {
        "slug": "calculadora-precio-minimo-venta-con-margen",
        "label": "Precio mínimo venta",
        "icon": "🏷️"
      },
      {
        "slug": "calculadora-margen-dropshipping-real",
        "label": "Margen dropshipping",
        "icon": "📦"
      }
    ]
  },
  "facturacionNegocio": {
    "id": "facturacionNegocio",
    "title": "Facturación y rentabilidad",
    "items": [
      {
        "slug": "calculadora-punto-equilibrio-break-even",
        "label": "Punto de equilibrio",
        "icon": "⚖️"
      },
      {
        "slug": "calculadora-cac-costo-adquisicion-sales-funnel",
        "label": "CAC sales funnel",
        "icon": "🎯"
      },
      {
        "slug": "calculadora-facturacion-minima-negocio",
        "label": "Facturación mínima",
        "icon": "💰"
      },
      {
        "slug": "calculadora-inventario-turnover-ratio",
        "label": "Rotación inventario",
        "icon": "📊"
      },
      {
        "slug": "calculadora-burn-rate-runway-startup",
        "label": "Burn rate startup",
        "icon": "🚀"
      }
    ]
  },
  "roiAds": {
    "id": "roiAds",
    "title": "ROI y publicidad",
    "items": [
      {
        "slug": "calculadora-instagram-ads-presupuesto-cpm-cpr-roi-2026",
        "label": "Instagram ROI",
        "icon": "📱"
      },
      {
        "slug": "calculadora-cpa-cac-ltv",
        "label": "CPA, CAC y LTV",
        "icon": "🎯"
      },
      {
        "slug": "calculadora-attribution-modelo-primer-ultimo-click",
        "label": "Modelos atribución",
        "icon": "📣"
      },
      {
        "slug": "calculadora-roi-coaching-1-on-1-venta",
        "label": "ROI coaching",
        "icon": "💼"
      }
    ]
  },
  "redesEngagement": {
    "id": "redesEngagement",
    "title": "Redes y engagement",
    "items": [
      {
        "slug": "calculadora-alcance-organico-vs-pago-redes",
        "label": "Orgánico vs pago",
        "icon": "📱"
      },
      {
        "slug": "calculadora-instagram-reach-organico-promedio",
        "label": "Reach Instagram",
        "icon": "📱"
      },
      {
        "slug": "calculadora-tiktok-engagement-rate",
        "label": "Engagement TikTok",
        "icon": "📱"
      },
      {
        "slug": "calculadora-frecuencia-publicacion-redes-sociales",
        "label": "Frecuencia posteo",
        "icon": "📅"
      },
      {
        "slug": "calculadora-youtube-suscriptores-para-1000",
        "label": "Suscriptores YouTube",
        "icon": "📺"
      }
    ]
  },
  "presupuestoViaje": {
    "id": "presupuestoViaje",
    "title": "Presupuesto de viaje",
    "items": [
      {
        "slug": "calculadora-costo-mochilero-por-pais",
        "label": "Presupuesto mochilero",
        "icon": "🌎"
      },
      {
        "slug": "calculadora-presupuesto-viaje-bali-indonesia",
        "label": "Presupuesto Bali",
        "icon": "🌍"
      },
      {
        "slug": "calculadora-presupuesto-viaje-barcelona",
        "label": "Presupuesto Barcelona",
        "icon": "🌍"
      },
      {
        "slug": "calculadora-coliving-precio-mes-bali-medellin-mexico",
        "label": "Coliving nómadas",
        "icon": "🌴"
      },
      {
        "slug": "calculadora-emigrar-espana-presupuesto-primer-ano-familia",
        "label": "Emigrar a España",
        "icon": "🇪🇸"
      }
    ]
  },
  "transporteMillas": {
    "id": "transporteMillas",
    "title": "Transporte y millas",
    "items": [
      {
        "slug": "calculadora-alquiler-auto-pais-presupuesto",
        "label": "Alquiler auto",
        "icon": "🚗"
      },
      {
        "slug": "calculadora-distancia-vuelo-2-ciudades",
        "label": "Distancia vuelo",
        "icon": "✈️"
      },
      {
        "slug": "calculadora-millas-latam-destino",
        "label": "Millas LATAM",
        "icon": "💳"
      },
      {
        "slug": "calculadora-millas-american-aa-destino",
        "label": "Millas American",
        "icon": "💳"
      },
      {
        "slug": "calculadora-equipaje-extra-costo-aerolinea",
        "label": "Equipaje extra",
        "icon": "🧳"
      }
    ]
  },
  "horasIdiomas": {
    "id": "horasIdiomas",
    "title": "Horas para aprender idiomas",
    "items": [
      {
        "slug": "calculadora-horas-estudio-idioma-fluidez-fsi",
        "label": "Horas a fluidez FSI",
        "icon": "⏰"
      },
      {
        "slug": "calculadora-tiempo-c1-ingles-horas-semanales-meta-meses",
        "label": "C1 en inglés",
        "icon": "📚"
      },
      {
        "slug": "calculadora-horas-peliculas-serie-inmersion-idioma",
        "label": "Horas series",
        "icon": "🎬"
      },
      {
        "slug": "calculadora-tiempo-pronunciacion-nativa-practica-diaria",
        "label": "Pronunciación nativa",
        "icon": "🗣️"
      },
      {
        "slug": "calculadora-horas-semanales-mantener-nivel-idioma",
        "label": "Mantener nivel",
        "icon": "🔁"
      }
    ]
  }
};

/** Busca cluster al que pertenece un slug. */
export function findClusterForSlug(slug: string): Cluster | null {
  for (const cluster of Object.values(CLUSTERS)) {
    if (cluster.items.some((it) => it.slug === slug)) return cluster;
  }
  return null;
}
