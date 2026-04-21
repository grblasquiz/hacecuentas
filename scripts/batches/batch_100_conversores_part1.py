"""Batch 100 conversores - PARTE 1: datos (specs)

Estructura: cada spec es un dict con todo lo necesario para generar una calc
completa (JSON rico + TS formula). Se importa desde el builder.
"""

# =========================================================================
# LINEAR CONVERTERS
# =========================================================================
# Cada entrada:
#   slug, cat, icon, u1_sing, u1_plu, u1_abbr, u2_sing, u2_plu, u2_abbr,
#   factor (1 u1 = factor * u2), factor_str (exacto en markdown),
#   factor_origin, example_real, table_values (lista de valores en u1)
#   faqs_extra (lista de 3 tuplas q/a adicionales, las 4 base son automáticas)
#   use_cases (lista de 5)
#   intro_hook (1-2 frases iniciales con un gancho real)
# ---

LINEAR = [
    # ===== LONGITUD (16) =====
    {
        "slug": "conversor-pies-a-metros",
        "cat": "matematica", "icon": "📏",
        "u1": ("pie", "pies", "ft"), "u2": ("metro", "metros", "m"),
        "factor": 0.3048, "factor_str": "0.3048",
        "factor_origin": "Definición internacional de 1959: 1 yarda = 0.9144 m exactos, de donde 1 pie (1/3 yarda) = 0.3048 m exactos.",
        "example_real": {
            "scenario": "Lionel Messi mide oficialmente 5 pies y 7 pulgadas (5'7\"). ¿Cuánto es en metros?",
            "steps": [
                "**5'7\" = 5 pies × 12 + 7 pulgadas = 67 pulgadas**.",
                "Pasar a pies: `67 / 12 = 5.5833 pies`.",
                "Aplicar factor: `5.5833 × 0.3048 = 1.7018 m`.",
                "Redondeado: **1.70 m** (coincide con su altura oficial)."
            ],
            "result": "**Messi mide 1.70 metros** (5'7\")."
        },
        "table_values": [1, 3, 5, 6, 10, 25, 50, 100],
        "use_cases": [
            "Convertir alturas de personas citadas en películas o NBA (pies y pulgadas) al sistema métrico.",
            "Traducir planos de construcción americanos (blueprints en feet) a metros para ejecutar en Argentina.",
            "Convertir medidas de cañas de pescar, tablas de surf o equipos deportivos importados.",
            "Altura de vuelo en aviación comercial (los techos de crucero se reportan en pies).",
            "Medidas de escaleras, bordes de piscinas y dimensiones de viviendas en listados americanos."
        ],
        "intro_hook": "¿Te encontraste con una medida en pies (feet, ft) y querés pasarla a metros? Esta conversión es exacta por definición: **1 pie = 0.3048 metros** desde 1959.",
        "faqs_extra": [
            ("¿Cuánto mide 6 pies en metros?", "**6 pies = 1.8288 metros** (aproximadamente **1.83 m**). Es una altura considerada alta para un hombre; equivale a 1 metro con 83 cm."),
            ("¿Dónde se usa todavía el pie como unidad?", "En EE.UU. y Reino Unido (de forma informal), en aviación (altitud reportada siempre en pies) y en alturas de personas en medios anglosajones. El resto del mundo usa el sistema métrico."),
            ("¿Cuántos pies tiene un edificio de 10 metros?", "**32.81 pies**. Regla rápida: multiplicá los metros por 3.28 para obtener pies aproximados. Un edificio de 3 pisos (≈10 m) = ~33 pies.")
        ]
    },
    {
        "slug": "conversor-metros-a-pies",
        "cat": "matematica", "icon": "📏",
        "u1": ("metro", "metros", "m"), "u2": ("pie", "pies", "ft"),
        "factor": 3.28084, "factor_str": "3.28084",
        "factor_origin": "1 metro = 1 / 0.3048 = 3.280839895... pies (factor derivado de la definición internacional de 1959).",
        "example_real": {
            "scenario": "Una pileta olímpica mide 50 metros. ¿Cuánto es en pies?",
            "steps": [
                "Valor de entrada: 50 metros.",
                "Aplicar factor: `50 × 3.28084 = 164.042 pies`.",
                "Resultado: **164 pies** (164' 0.5\")."
            ],
            "result": "**50 m = 164.04 pies**. Por eso en piletas americanas aparece 'Olympic 50m (164 ft)'."
        },
        "table_values": [1, 2, 5, 10, 25, 50, 100, 1000],
        "use_cases": [
            "Publicar avisos de propiedades de Argentina en portales americanos o canadienses (que piden pies).",
            "Especificar equipamiento industrial con proveedores de EE.UU. que trabajan en unidades imperiales.",
            "Convertir altura de edificios o montañas para audiencia anglosajona (ej: Aconcagua 6961 m = 22,841 ft).",
            "Traducir recorridos de trail running o maratones para comunidades internacionales.",
            "Convertir altura de cielo raso o dimensiones de living en planos para diseñadores americanos."
        ],
        "intro_hook": "¿Necesitás expresar una medida en metros en pies (feet)? El factor exacto es **1 metro = 3.28084 pies**. Es el inverso exacto de 1 pie = 0.3048 m (definición de 1959).",
        "faqs_extra": [
            ("¿Cuántos pies son 2 metros?", "**6.5617 pies** (aproximadamente 6' 6.7\"). Útil para convertir la altura de Shaquille O'Neal (2.16 m = 7'1\") o cualquier persona muy alta."),
            ("¿Cómo convertir metros a pies mentalmente?", "Multiplicá por 3.3 (redondeando). Ejemplo: 10 m ≈ 33 pies. Para mayor precisión: ×3.28. El error con ×3.3 es de ~0.6%."),
            ("¿Cuánto es el Aconcagua en pies?", "El Aconcagua mide **6961 m = 22,837 pies**. Es la montaña más alta de América y una de las 'Siete Cumbres'. Los escaladores americanos siempre reportan esa altura en pies.")
        ]
    },
    {
        "slug": "conversor-pulgadas-a-centimetros",
        "cat": "matematica", "icon": "📐",
        "u1": ("pulgada", "pulgadas", "in"), "u2": ("centímetro", "centímetros", "cm"),
        "factor": 2.54, "factor_str": "2.54",
        "factor_origin": "Definición internacional de 1959: 1 pulgada = 25.4 milímetros exactos, es decir 2.54 cm exactos. Antes de 1959, Estados Unidos usaba 2.540005 cm.",
        "example_real": {
            "scenario": "Comprás un televisor de 55 pulgadas en diagonal. ¿Cuántos cm son?",
            "steps": [
                "Valor de entrada: 55 pulgadas.",
                "Aplicar factor: `55 × 2.54 = 139.7 cm`.",
                "Resultado: **139.7 cm ≈ 1.40 m de diagonal**.",
                "Ancho aproximado (relación 16:9): `139.7 × 0.872 = 121.8 cm`.",
                "Alto aproximado: `139.7 × 0.490 = 68.4 cm`."
            ],
            "result": "**TV 55\" = 139.7 cm de diagonal** (≈ 1.22 m de ancho × 0.68 m de alto)."
        },
        "table_values": [1, 6, 12, 15, 24, 32, 42, 55, 65, 75],
        "use_cases": [
            "Elegir tamaño de televisor o monitor (se venden siempre en pulgadas pero los muebles se miden en cm).",
            "Convertir medidas de aros de llanta (ruedas 17\", 18\", 19\" = 43.2, 45.7, 48.3 cm).",
            "Traducir tallas de cintura de jeans americanos (ej: waist 32\" = 81 cm).",
            "Convertir tamaño de herramientas, llaves y tornillos comprados en EE.UU.",
            "Medidas de tablas de skate, surf y snowboard para comparar con estándares locales."
        ],
        "intro_hook": "¿Comprás un TV, monitor o herramienta en pulgadas y necesitás el equivalente en centímetros? El factor es exacto: **1 pulgada = 2.54 cm**.",
        "faqs_extra": [
            ("¿Cuántos cm tiene un TV de 65 pulgadas?", "**65\" = 165.1 cm de diagonal**. Si la relación es 16:9, el ancho es ~144 cm y el alto ~81 cm. Mueble mínimo recomendado: 150 cm de ancho."),
            ("¿Cuánto es 1 pulgada exactamente?", "**1 pulgada = 2.54 cm = 25.4 mm** exactos (definición internacional desde 1959). No es una aproximación: es un valor fijo por convención."),
            ("¿Por qué se sigue usando la pulgada?", "Por tradición industrial: tornillos, tubos, pantallas y ruedas fueron estandarizados en pulgadas hace más de un siglo. Cambiar los estándares costaría miles de millones, por eso persisten en paralelo al SI.")
        ]
    },
    {
        "slug": "conversor-centimetros-a-pulgadas",
        "cat": "matematica", "icon": "📐",
        "u1": ("centímetro", "centímetros", "cm"), "u2": ("pulgada", "pulgadas", "in"),
        "factor": 0.393701, "factor_str": "0.393701",
        "factor_origin": "1 cm = 1 / 2.54 = 0.3937007874... pulgadas (inverso exacto de 2.54 cm/pulgada).",
        "example_real": {
            "scenario": "Una cintura mide 85 cm. ¿Qué talla de jean americano corresponde?",
            "steps": [
                "Valor: 85 cm.",
                "Aplicar factor: `85 × 0.3937 = 33.46 pulgadas`.",
                "Tallas americanas van de 2 en 2, así que **waist 34\"** es la más cercana.",
                "Verificación: `34 × 2.54 = 86.36 cm` (cae dentro del rango típico de talle)."
            ],
            "result": "**85 cm ≈ waist 34\"** (jean americano)."
        },
        "table_values": [5, 10, 25, 50, 100, 150, 200],
        "use_cases": [
            "Traducir tus medidas corporales a tallas americanas (camisas, jeans, cinturones).",
            "Comprar en Amazon o eBay especificando dimensiones exactas en pulgadas.",
            "Convertir altura propia o de productos para audiencias anglosajonas (1.70 m = 67\").",
            "Especificar medidas de muebles, estantes o equipamiento para comprar en EE.UU.",
            "Trabajar con planos arquitectónicos que mezclan sistemas métrico e imperial."
        ],
        "intro_hook": "¿Tenés una medida en cm y la necesitás en pulgadas? **1 cm = 0.3937 pulgadas** (el inverso exacto de 2.54).",
        "faqs_extra": [
            ("¿Cuánto es 100 cm en pulgadas?", "**100 cm = 39.37 pulgadas**. Es decir, 1 metro equivale a un poco menos de 40 pulgadas. Útil para saber que 1 m ≈ 1 yarda (36\")."),
            ("¿Cómo convertir cm a pulgadas mentalmente?", "Dividí por 2.5 (aproximación rápida). Ejemplo: 50 cm / 2.5 = 20\" (el valor real es 19.69\"). El error es menor al 1%."),
            ("¿Cuántas pulgadas tiene un papel A4?", "Un A4 (21 × 29.7 cm) equivale a **8.27\" × 11.69\"**. Es ligeramente más largo pero más angosto que una hoja carta (US Letter, 8.5\" × 11\").")
        ]
    },
    {
        "slug": "conversor-millas-a-kilometros",
        "cat": "matematica", "icon": "🛣️",
        "u1": ("milla", "millas", "mi"), "u2": ("kilómetro", "kilómetros", "km"),
        "factor": 1.609344, "factor_str": "1.609344",
        "factor_origin": "Definición internacional de 1959: 1 milla terrestre = 1609.344 metros exactos (deriva de 5280 pies × 0.3048).",
        "example_real": {
            "scenario": "Una maratón oficial son 26.2 millas. ¿Cuánto es en kilómetros?",
            "steps": [
                "Valor: 26.2 millas.",
                "Aplicar factor: `26.2 × 1.609344 = 42.165 km`.",
                "Resultado: **42.195 km** (el estándar olímpico)."
            ],
            "result": "**26.2 millas = 42.195 km**: una maratón completa."
        },
        "table_values": [1, 5, 10, 26.2, 50, 100, 500, 1000],
        "use_cases": [
            "Convertir distancias de road trips en EE.UU. (Ruta 66 = 2448 mi = 3940 km).",
            "Leer velocidades en películas (60 mph = 96.6 km/h) y entender contexto.",
            "Calcular costos de envío de vuelos o rutas en millas aéreas.",
            "Ajustar programas de entrenamiento de running escritos en millas.",
            "Interpretar consumos de autos americanos (MPG: miles per gallon) en km."
        ],
        "intro_hook": "¿Una distancia en millas? Pasala a km al toque: **1 milla = 1.609344 km**. Regla útil: las millas son ~60% más largas que los kilómetros.",
        "faqs_extra": [
            ("¿Cuántos km tiene una media maratón?", "Una media maratón son 13.1 millas = **21.0975 km** exactos (la mitad de 42.195 km). Carrera de nivel amateur popular."),
            ("¿Cuánto es 100 millas en km?", "**100 mi = 160.934 km**. Un auto con odómetro en millas que marcó 100,000 mi recorrió 160,934 km."),
            ("¿Cómo convertir millas a km mentalmente?", "Multiplicá por 1.6 (aproximación). Ejemplo: 50 mi × 1.6 = 80 km (valor exacto: 80.47 km). Error menor al 0.3%.")
        ]
    },
    {
        "slug": "conversor-kilometros-a-millas",
        "cat": "matematica", "icon": "🛣️",
        "u1": ("kilómetro", "kilómetros", "km"), "u2": ("milla", "millas", "mi"),
        "factor": 0.621371, "factor_str": "0.621371",
        "factor_origin": "1 km = 1 / 1.609344 = 0.6213711922... millas (inverso exacto del factor mi→km).",
        "example_real": {
            "scenario": "Desde Buenos Aires a Mar del Plata hay 400 km. ¿Cuánto es en millas?",
            "steps": [
                "Valor: 400 km.",
                "Aplicar factor: `400 × 0.621371 = 248.55 millas`.",
                "Resultado: **248.55 millas** (≈ 249 mi)."
            ],
            "result": "**BA - MDP: 400 km = 248.55 millas**."
        },
        "table_values": [1, 5, 10, 50, 100, 250, 500, 1000],
        "use_cases": [
            "Publicar tu recorrido de running o ciclismo en Strava para audiencia americana.",
            "Calcular cuántas millas aéreas acumulás en vuelos (programas americanos usan millas).",
            "Especificar distancia de envíos internacionales en unidades imperiales.",
            "Describir distancias argentinas en medios anglosajones (ej: 'BA to Bariloche 1600 km / 994 mi').",
            "Comparar autonomía de autos eléctricos (medidas en millas en hojas técnicas USA)."
        ],
        "intro_hook": "¿Querés saber cuántas millas tiene una distancia en kilómetros? **1 km = 0.6214 millas** (un km equivale a un poco más de media milla).",
        "faqs_extra": [
            ("¿Cuántas millas son 10 km?", "**10 km = 6.2137 millas**. Por eso las carreras de running 10K se conocen en EE.UU. como 'The 10K' aunque equivale a 6.2 mi."),
            ("¿Cómo convertir km a millas mentalmente?", "Multiplicá por 0.6 (aproximación) o dividí por 1.6. Ejemplo: 100 km × 0.6 = 60 mi (valor real: 62.14 mi)."),
            ("¿Cuántas millas son 1000 km?", "**1000 km = 621.37 millas**. Los road trips argentinos largos (BA-Salta: 1500 km) equivalen a ~932 mi.")
        ]
    },
    {
        "slug": "conversor-yardas-a-metros",
        "cat": "matematica", "icon": "🏈",
        "u1": ("yarda", "yardas", "yd"), "u2": ("metro", "metros", "m"),
        "factor": 0.9144, "factor_str": "0.9144",
        "factor_origin": "Definición internacional de 1959: 1 yarda = 0.9144 metros exactos (3 pies × 0.3048).",
        "example_real": {
            "scenario": "Un campo de fútbol americano oficial mide 100 yardas de end zone a end zone. ¿Cuánto es en metros?",
            "steps": [
                "Valor: 100 yardas.",
                "Aplicar factor: `100 × 0.9144 = 91.44 m`.",
                "Resultado: **91.44 m** (por eso los campos NFL miden ~110 m incluyendo las end zones de 10 yd cada una)."
            ],
            "result": "**Campo NFL: 100 yd = 91.44 m** (120 yd totales = 109.73 m con end zones)."
        },
        "table_values": [1, 3, 10, 50, 100, 500, 1000],
        "use_cases": [
            "Interpretar distancias en fútbol americano, golf y cricket (unidades oficiales en yardas).",
            "Comprar telas o alfombras americanas (vendidas por yardas).",
            "Calcular longitud de rollos de materiales de construcción importados.",
            "Convertir distancias de torneos de tiro y arquería con estándares americanos.",
            "Especificar dimensiones de piletas o canchas para proyectos internacionales."
        ],
        "intro_hook": "¿Una medida en yardas? **1 yarda = 0.9144 metros** exactos. Una yarda es un poquito menos que un metro (9 cm menos).",
        "faqs_extra": [
            ("¿Cuánto es 1 yarda en metros?", "**1 yarda = 0.9144 m**. Definición oficial de 1959: 1 yd = 3 pies = 36 pulgadas = 0.9144 m exactos."),
            ("¿Cuántos metros tiene un campo de fútbol americano?", "Campo completo (de end zone a end zone): **120 yd = 109.73 m**. Zona de juego neta: **100 yd = 91.44 m**."),
            ("¿En qué deportes se usan yardas?", "Fútbol americano (todas las medidas), golf (distancia al hoyo y longitud de hoyos), cricket (pitch = 22 yd = 20.12 m), y ocasionalmente en natación americana antigua.")
        ]
    },
    {
        "slug": "conversor-metros-a-yardas",
        "cat": "matematica", "icon": "🏈",
        "u1": ("metro", "metros", "m"), "u2": ("yarda", "yardas", "yd"),
        "factor": 1.09361, "factor_str": "1.09361",
        "factor_origin": "1 metro = 1 / 0.9144 = 1.0936132983... yardas (inverso exacto del factor yd→m).",
        "example_real": {
            "scenario": "Una pileta olímpica mide 50 metros. ¿Cuánto es en yardas?",
            "steps": [
                "Valor: 50 m.",
                "Aplicar factor: `50 × 1.09361 = 54.68 yardas`.",
                "Resultado: **54.68 yardas** (algunos torneos cortos americanos usan piletas de 25 yd = 22.86 m)."
            ],
            "result": "**50 m = 54.68 yardas**."
        },
        "table_values": [1, 5, 10, 25, 50, 100, 500, 1000],
        "use_cases": [
            "Traducir distancias de entrenamiento en pileta métrica a eventos americanos en yardas.",
            "Publicar medidas de canchas de fútbol o rugby en yardas para medios anglos.",
            "Calcular metros de tela necesarios cuando la receta está en yardas.",
            "Comparar longitud de pistas de atletismo: 400 m ≈ 437 yd.",
            "Convertir alturas saltos de paracaidismo (AGL en metros vs ft y yardas)."
        ],
        "intro_hook": "**1 metro = 1.09361 yardas**. Un metro es apenas un 9% más grande que una yarda.",
        "faqs_extra": [
            ("¿Cuántas yardas tiene un kilómetro?", "**1 km = 1093.61 yardas**. Un 10 km equivale a ~10,936 yd o algo más de 6 millas."),
            ("¿1 m es más o menos que 1 yarda?", "Un metro es **más grande**: mide 9.14 cm más que una yarda (1 m = 1.0936 yd). La diferencia es pequeña pero acumulativa en distancias largas."),
            ("¿Cuántas yardas hay en 100 m?", "**100 m = 109.36 yardas**. Por eso los 100 m llanos olímpicos no son el mismo evento que los 100 yd de atletismo americano (que ya casi no se corren).")
        ]
    },
    {
        "slug": "conversor-millas-nauticas-a-kilometros",
        "cat": "matematica", "icon": "⚓",
        "u1": ("milla náutica", "millas náuticas", "nmi"), "u2": ("kilómetro", "kilómetros", "km"),
        "factor": 1.852, "factor_str": "1.852",
        "factor_origin": "Definición internacional de 1929 (Hidrografía): 1 milla náutica = 1852 metros exactos. Corresponde a 1 minuto de arco sobre un meridiano terrestre.",
        "example_real": {
            "scenario": "Un vuelo Buenos Aires - Miami recorre aproximadamente 3900 millas náuticas. ¿Cuánto es en km?",
            "steps": [
                "Valor: 3900 nmi.",
                "Aplicar factor: `3900 × 1.852 = 7222.8 km`.",
                "Resultado: **7223 km** (ruta directa por el océano)."
            ],
            "result": "**BA-Miami = 3900 nmi = 7223 km** (ruta aérea oceánica)."
        },
        "table_values": [1, 10, 100, 500, 1000, 3000],
        "use_cases": [
            "Planificar rutas de navegación marítima (todos los náuticos usan nmi).",
            "Leer plan de vuelo de aviación comercial (distancia reportada en nmi).",
            "Calcular velocidad de embarcaciones en nudos (1 nudo = 1 nmi/h).",
            "Interpretar informes meteorológicos marinos y trazados satelitales.",
            "Estimar autonomía de veleros, yates y cruceros en travesías oceánicas."
        ],
        "intro_hook": "**1 milla náutica = 1.852 km** exactos. No es una milla terrestre: es una unidad distinta usada en navegación marítima y aérea.",
        "faqs_extra": [
            ("¿Por qué existe la milla náutica?", "Porque corresponde a 1 minuto de arco sobre un meridiano. Esto hace que sea directamente útil para navegación con sextante y cartas náuticas: 60 nmi = 1 grado de latitud."),
            ("¿Cuál es la diferencia con la milla terrestre?", "Una milla náutica (1.852 km) es **~15% más larga** que una milla terrestre (1.609 km). Nunca las mezcles: en navegación siempre son náuticas."),
            ("¿Cuánto recorre un barco a 20 nudos?", "**20 nudos = 37.04 km/h** (1 nudo = 1 nmi/h = 1.852 km/h). Un yate a 20 nudos durante 5 horas recorre 100 nmi = 185.2 km.")
        ]
    },
    {
        "slug": "conversor-anos-luz-a-kilometros",
        "cat": "ciencia", "icon": "🌌",
        "u1": ("año luz", "años luz", "ly"), "u2": ("kilómetro", "kilómetros", "km"),
        "factor": 9.461e12, "factor_str": "9,460,730,472,580.8",
        "factor_origin": "Un año luz es la distancia que recorre la luz en un año juliano (365.25 días × 86400 s) a velocidad constante de 299,792,458 m/s. Resultado: 9,460,730,472,580.8 km = 9.461 × 10¹² km.",
        "example_real": {
            "scenario": "Próxima Centauri, la estrella más cercana al Sol, está a 4.24 años luz. ¿Cuánto es en km?",
            "steps": [
                "Valor: 4.24 ly.",
                "Aplicar factor: `4.24 × 9.461 × 10¹² = 40.11 × 10¹² km`.",
                "Resultado: **40.11 billones de km** (4.011 × 10¹³ km)."
            ],
            "result": "**Próxima Centauri está a 40 billones de km** (4.24 años luz)."
        },
        "table_values": [1, 4.24, 100, 1000, 100000],
        "use_cases": [
            "Convertir distancias astronómicas de artículos científicos a unidades comprensibles.",
            "Calcular escalas de maquetas del universo o proyectos educativos.",
            "Interpretar noticias sobre exoplanetas y galaxias (distancia en ly).",
            "Comparar con distancias del sistema solar (Plutón ~5 horas luz del Sol).",
            "Visualizar magnitudes cósmicas en clases de astronomía."
        ],
        "intro_hook": "Un año luz es **9.461 billones de km**. La luz viaja tan rápido que en un año cubre distancias que nos cuesta imaginar.",
        "faqs_extra": [
            ("¿Qué es exactamente un año luz?", "La distancia que la luz (299,792,458 m/s) recorre en un año juliano (365.25 días). Es una unidad de distancia, no de tiempo. Equivale a 9.461 × 10¹² km o ~63,241 unidades astronómicas."),
            ("¿A cuántos años luz está la estrella más cercana?", "Próxima Centauri está a **4.24 años luz**. Los 3 cuerpos del sistema Alpha Centauri están entre 4.24 y 4.37 ly. La siguiente estrella (Estrella de Barnard) está a 5.96 ly."),
            ("¿Cuánto tardaríamos en llegar con un cohete?", "A la velocidad de la Voyager 1 (17 km/s), llegar a Próxima Centauri tomaría **~75,000 años**. Por eso las distancias interestelares son, en la práctica, inalcanzables con tecnología actual.")
        ]
    },
    {
        "slug": "conversor-milimetros-a-pulgadas",
        "cat": "matematica", "icon": "📐",
        "u1": ("milímetro", "milímetros", "mm"), "u2": ("pulgada", "pulgadas", "in"),
        "factor": 0.0393701, "factor_str": "0.0393701",
        "factor_origin": "1 mm = 1 / 25.4 = 0.03937007874... pulgadas (inverso exacto de 25.4 mm/pulgada).",
        "example_real": {
            "scenario": "Un destornillador phillips dice 'PH2' y tiene una punta de 5 mm. ¿Qué pulgadas son?",
            "steps": [
                "Valor: 5 mm.",
                "Aplicar factor: `5 × 0.0393701 = 0.1969 pulgadas`.",
                "Resultado: **0.1969\" ≈ 3/16\" (0.1875\")**. Por eso se vende también marcado como 'PH2 = 3/16\"'."
            ],
            "result": "**5 mm ≈ 3/16\" = 0.197\"**."
        },
        "table_values": [1, 5, 10, 25, 50, 100, 500, 1000],
        "use_cases": [
            "Comprar tornillos y bulones americanos especificando diámetro exacto.",
            "Convertir medidas de mechas de taladro (6 mm = 15/64\" ≈ 1/4\").",
            "Interpretar especificaciones de componentes electrónicos importados.",
            "Comparar diámetros de tubos y caños entre proveedores locales y americanos.",
            "Traducir tamaños de papel y dimensiones de hojas entre sistemas."
        ],
        "intro_hook": "**1 mm = 0.0394 pulgadas** (o 1/25.4 de pulgada). Clave cuando ferreterías mezclan medidas métricas e imperiales.",
        "faqs_extra": [
            ("¿Cuánto es 10 mm en pulgadas?", "**10 mm = 0.3937 pulgadas** ≈ 25/64\" o aproximadamente 3/8\" (que es 9.525 mm, muy cerca). Por eso 10 mm y 3/8\" se usan a veces como equivalentes aunque no son idénticos."),
            ("¿Qué equivale a 1/4 de pulgada?", "**1/4 pulgada = 6.35 mm** exactos. Es una medida muy común en ferretería: mechas, tornillos y mangueras. Si tu tornillo dice '1/4 W' es un tornillo con rosca de 6.35 mm."),
            ("¿Cómo convertir mm a pulgadas fraccionarias?", "Dividí los mm por 25.4 y buscá la fracción en denominadores de 16, 32 o 64. Ejemplo: 8 mm / 25.4 = 0.3150\" ≈ 5/16\" (0.3125\"). Diferencia menor al 1%.")
        ]
    },
    {
        "slug": "conversor-pulgadas-a-milimetros",
        "cat": "matematica", "icon": "📐",
        "u1": ("pulgada", "pulgadas", "in"), "u2": ("milímetro", "milímetros", "mm"),
        "factor": 25.4, "factor_str": "25.4",
        "factor_origin": "Definición internacional de 1959: 1 pulgada = 25.4 mm exactos (2.54 cm = 25.4 mm).",
        "example_real": {
            "scenario": "Un tornillo americano dice '1/2 inch'. ¿Cuántos mm son?",
            "steps": [
                "1/2 pulgada = 0.5 in.",
                "Aplicar factor: `0.5 × 25.4 = 12.7 mm`.",
                "Resultado: **12.7 mm**. Es el diámetro de un caño de 1/2\" (medida estándar en plomería)."
            ],
            "result": "**1/2\" = 12.7 mm** (diámetro típico de caños y tornillos)."
        },
        "table_values": [0.125, 0.25, 0.5, 1, 2, 6, 12, 24, 36],
        "use_cases": [
            "Comprar caños de plomería americanos y saber el diámetro exacto en mm.",
            "Elegir brocas métricas para tornillos imperiales (1/4\" = 6.35 mm).",
            "Especificar tornillería para proyectos binacionales.",
            "Interpretar rollos de cinta adhesiva y papeles (ancho en pulgadas).",
            "Comparar espesores de chapa entre calibres americanos y mm."
        ],
        "intro_hook": "**1 pulgada = 25.4 mm** exactos. Crítico para ferretería, plomería y tornillería donde conviven sistemas.",
        "faqs_extra": [
            ("¿Cuántos mm tiene 1/4 de pulgada?", "**1/4\" = 6.35 mm**. Es una medida súper común: diámetro de tornillos de fijación general, mechas, mangueras de aire y jacks de audio (3.5 mm es el mini, 6.35 mm es el plug grande)."),
            ("¿Cuánto es 3/8\" en mm?", "**3/8\" = 9.525 mm**. Típico para caños de plomería chicos, mangueras de gas residencial y tornillos medianos. Mucha gente los confunde con 10 mm (error de 0.475 mm)."),
            ("¿Y 3/4\" en mm?", "**3/4\" = 19.05 mm**. Medida gruesa para caños de agua principales, bulones estructurales y mangueras industriales.")
        ]
    },
    {
        "slug": "conversor-micrometros-a-milimetros",
        "cat": "ciencia", "icon": "🔬",
        "u1": ("micrómetro", "micrómetros", "µm"), "u2": ("milímetro", "milímetros", "mm"),
        "factor": 0.001, "factor_str": "0.001",
        "factor_origin": "Por prefijos del SI: 1 µm = 10⁻⁶ m = 10⁻³ mm = 0.001 mm. Equivalentemente: 1 mm = 1000 µm.",
        "example_real": {
            "scenario": "Un cabello humano tiene unos 70 µm de diámetro. ¿Cuánto es en mm?",
            "steps": [
                "Valor: 70 µm.",
                "Aplicar factor: `70 × 0.001 = 0.07 mm`.",
                "Resultado: **0.07 mm** (siete centésimos de milímetro)."
            ],
            "result": "**Cabello humano: 70 µm = 0.07 mm**."
        },
        "table_values": [1, 10, 50, 100, 500, 1000, 5000],
        "use_cases": [
            "Especificar tolerancias de mecanizado CNC (típicamente 10-50 µm).",
            "Interpretar resoluciones de impresoras 3D (altura de capa en µm).",
            "Leer especificaciones de filtros HEPA, de agua o de aceite.",
            "Convertir tamaños de partículas en biología, química o metalurgia.",
            "Comparar resoluciones ópticas y diámetros de fibras textiles."
        ],
        "intro_hook": "**1 µm (micrómetro o 'micra') = 0.001 mm**. La unidad perfecta para cosas microscópicas: células, polvo, fibras.",
        "faqs_extra": [
            ("¿Qué es un micrómetro o una micra?", "Un micrómetro (símbolo µm) equivale a **una millonésima de metro** (0.001 mm). 'Micra' es el nombre coloquial del micrómetro — mismo valor, más corto de decir."),
            ("¿Cuánto mide un glóbulo rojo en mm?", "Un glóbulo rojo humano mide ~7.5 µm = **0.0075 mm**. Son 100 veces más chicos que 1 mm. Por eso solo se ven con microscopio."),
            ("¿Qué es un filtro de 5 micras?", "Retiene partículas de **5 µm o más grandes** (0.005 mm). Los filtros HEPA retienen 0.3 µm al 99.97%: partículas 16 veces más chicas que las de 5 µm.")
        ]
    },
    {
        "slug": "conversor-leguas-a-kilometros",
        "cat": "matematica", "icon": "🗺️",
        "u1": ("legua", "leguas", "lg"), "u2": ("kilómetro", "kilómetros", "km"),
        "factor": 5.572, "factor_str": "5.572",
        "factor_origin": "La legua hispanoamericana tradicional equivalía a 5000 varas castellanas (de 0.8359 m) = 4179.5 m, pero en medición de tierras Argentina adoptó la legua cuadrada como 5000 × 5000 varas. La legua terrestre común moderna se usa como 5.572 km. En distintos países varía: legua española 5.573 km, legua estadounidense 4.828 km.",
        "example_real": {
            "scenario": "En 'Veinte mil leguas de viaje submarino' de Julio Verne, ¿cuántos km son?",
            "steps": [
                "Valor: 20,000 leguas.",
                "Aplicar factor (legua marina 5.556 km): `20000 × 5.556 = 111,120 km`.",
                "La obra usa legua marina (~5.556 km), no la terrestre.",
                "Resultado: **~111,120 km**, casi 3 veces la circunferencia de la Tierra."
            ],
            "result": "**20,000 leguas marinas ≈ 111,000 km** (Verne)."
        },
        "table_values": [1, 5, 10, 100, 1000, 20000],
        "use_cases": [
            "Interpretar textos antiguos o de literatura clásica con medidas en leguas.",
            "Convertir medidas históricas de tierras coloniales en Sudamérica.",
            "Entender referencias a escrituras o títulos antiguos en el campo.",
            "Estimar distancias en obras literarias (Verne, Cervantes).",
            "Convertir dimensiones de estancias antiguas (ej: 100 leguas²)."
        ],
        "intro_hook": "**1 legua = ~5.572 km** (legua hispánica tradicional). Unidad histórica todavía usada en escrituras antiguas y literatura.",
        "faqs_extra": [
            ("¿Todas las leguas miden lo mismo?", "No. La legua varía por país y época: legua española/hispanoamericana ≈ 5.572 km, legua marina ≈ 5.556 km, legua estadounidense ≈ 4.828 km (3 millas), legua francesa ≈ 4.0 km. En escrituras argentinas antiguas, asumí 5.572 km."),
            ("¿Cuánto es 'a tres leguas' en km?", "**3 leguas ≈ 16.7 km**. Expresión común en literatura del siglo XIX para indicar 'a pocas horas a caballo' (un caballo camina ~5 km/h, así que 3 leguas = 3 horas de viaje aprox)."),
            ("¿Qué es una legua cuadrada?", "Una unidad histórica de superficie: 1 legua² = (5000 varas)² = **2500 hectáreas** (6177 acres). En Argentina, las mensuras de campo viejo todavía se refieren a 'X leguas cuadradas' (típicamente estancias grandes).")
        ]
    },
    {
        "slug": "conversor-pies-a-pulgadas",
        "cat": "matematica", "icon": "📏",
        "u1": ("pie", "pies", "ft"), "u2": ("pulgada", "pulgadas", "in"),
        "factor": 12.0, "factor_str": "12",
        "factor_origin": "Definición estándar del sistema imperial: 1 pie = 12 pulgadas exactas. Esta relación existe desde la estandarización inglesa de 1593.",
        "example_real": {
            "scenario": "Una persona mide 6 pies. ¿Cuánto es en pulgadas?",
            "steps": [
                "Valor: 6 pies.",
                "Aplicar factor: `6 × 12 = 72 pulgadas`.",
                "Resultado: **72 pulgadas = 182.88 cm**."
            ],
            "result": "**6 pies = 72 pulgadas** (1.83 m)."
        },
        "table_values": [1, 2, 3, 5, 6, 10, 100],
        "use_cases": [
            "Convertir altura de personas de pies y pulgadas a solo pulgadas (5'10\" = 70\").",
            "Calcular metros cuadrados de habitaciones americanas (12' × 10' = 144 × 120 pulgadas).",
            "Interpretar especificaciones de muebles con dimensiones en pies.",
            "Entender medidas de cortinas y elementos textiles americanos.",
            "Traducir medidas de ingeniería que mezclan unidades imperiales."
        ],
        "intro_hook": "**1 pie = 12 pulgadas** exactas. Relación fija del sistema imperial, útil para convertir alturas expresadas como 5'10\" a pulgadas totales (70\")."
        ,
        "faqs_extra": [
            ("¿Por qué el pie se divide en 12 pulgadas y no en 10?", "Por razones históricas: el 12 es divisible por 2, 3, 4 y 6, lo que facilitaba las divisiones a mano alzada cuando no había calculadoras. El sistema métrico decimal (base 10) es más moderno."),
            ("¿Cómo paso 5'10\" a pulgadas totales?", "Multiplicá los pies por 12 y sumá las pulgadas: `5 × 12 + 10 = 70\"`. Útil para convertir alturas: 70\" × 2.54 cm/in = 177.8 cm."),
            ("¿Cuántas pulgadas tiene una regla de 1 pie?", "**12 pulgadas**. Es la regla 'ruler' estándar americana, típica en colegios. Equivale a 30.48 cm (por eso en España las reglas son de 30 cm, aproximando).")
        ]
    },
    {
        "slug": "conversor-varas-a-metros",
        "cat": "matematica", "icon": "📏",
        "u1": ("vara", "varas", "vr"), "u2": ("metro", "metros", "m"),
        "factor": 0.8359, "factor_str": "0.8359",
        "factor_origin": "La vara castellana tradicional medía 83.59 cm (0.8359 m). La vara argentina histórica (Buenos Aires) se fijó en 0.866 m (ley de 1835). En escrituras y mensuras antiguas de Argentina, 1 vara = 0.866 m; para uso general se toma 0.8359 m.",
        "example_real": {
            "scenario": "Una escritura antigua menciona un terreno de 50 varas de frente. ¿Cuánto es en metros?",
            "steps": [
                "Valor: 50 varas.",
                "Aplicar factor (vara argentina): `50 × 0.866 = 43.3 m`.",
                "Con vara castellana: `50 × 0.8359 = 41.8 m`.",
                "Resultado: **41.8-43.3 m** (verificar origen de la escritura)."
            ],
            "result": "**50 varas ≈ 43 m** (según si es vara argentina o castellana)."
        },
        "table_values": [1, 5, 10, 50, 100, 1000],
        "use_cases": [
            "Interpretar escrituras antiguas de tierras en Argentina o Latinoamérica.",
            "Traducir descripciones de mensuras rurales coloniales.",
            "Trabajar con fuentes históricas (mapas del siglo XIX).",
            "Entender referencias literarias a dimensiones antiguas.",
            "Convertir medidas de estancias y campos heredados con escrituras viejas."
        ],
        "intro_hook": "**1 vara ≈ 0.8359 m** (castellana) o **0.866 m** (argentina). Unidad histórica clave para leer escrituras antiguas.",
        "faqs_extra": [
            ("¿Cuál es la diferencia entre vara castellana y argentina?", "La vara castellana mide **83.59 cm** (patrón español desde el siglo XVI). La vara argentina fue fijada en **86.6 cm** por ley del Congreso Constituyente en 1835 (ligeramente más larga). En escrituras argentinas viejas siempre se usa la de 86.6 cm."),
            ("¿Qué es una vara cuadrada?", "**1 vara² ≈ 0.75 m²** (castellana) o **0.75 m²** (argentina). Unidad de superficie para lotes urbanos en el siglo XIX. Un terreno de 'mil varas²' tenía ~750 m²."),
            ("¿Se usa todavía la vara en Argentina?", "Prácticamente no. Solo aparece en escrituras antiguas previas a 1871 (cuando Argentina adoptó oficialmente el sistema métrico). Si tu escritura menciona varas, asumí vara argentina = 0.866 m.")
        ]
    },
    {
        "slug": "conversor-cuadras-a-metros",
        "cat": "matematica", "icon": "🏙️",
        "u1": ("cuadra", "cuadras", "cuadra"), "u2": ("metro", "metros", "m"),
        "factor": 100.0, "factor_str": "100 (en CABA y la mayoría de ciudades argentinas)",
        "factor_origin": "En Argentina, una cuadra estándar mide 100 metros (con variaciones: CABA 100 m, Rosario 100 m, Mendoza 110 m, Córdoba 100 m). En otros países: Chile 100 m, Perú 100 m, México 80-100 m, Uruguay 100-150 m (puede variar mucho). Para cálculos en Argentina, usar 100 m como estándar.",
        "example_real": {
            "scenario": "Una dirección dice 'a 8 cuadras del subte'. ¿Cuánto caminás?",
            "steps": [
                "Valor: 8 cuadras.",
                "Aplicar factor (CABA): `8 × 100 = 800 m`.",
                "Resultado: **800 m, caminando a 5 km/h: ~10 minutos**."
            ],
            "result": "**8 cuadras = 800 m ≈ 10 min caminando**."
        },
        "table_values": [1, 3, 5, 10, 20, 50, 100],
        "use_cases": [
            "Estimar distancias a caminar en publicaciones inmobiliarias ('a 5 cuadras de Plaza Italia').",
            "Calcular tiempo de caminata para una cita o trámite.",
            "Comparar ubicación de propiedades según distancia a transporte público.",
            "Traducir avisos argentinos a metros para audiencia extranjera.",
            "Planificar rutas de delivery en bicicleta o moto por centros urbanos."
        ],
        "intro_hook": "En Argentina, **1 cuadra ≈ 100 metros**. Estándar en CABA, Rosario y Córdoba; puede variar hasta 110-150 m en ciudades más viejas.",
        "faqs_extra": [
            ("¿Cuánto tardo en caminar 10 cuadras?", "A paso normal (5 km/h): **10 cuadras = 1 km = ~12 minutos**. A paso apurado (6 km/h): ~10 minutos. A paso lento: ~15 minutos."),
            ("¿Las cuadras miden lo mismo en toda Argentina?", "Prácticamente sí en CABA, Rosario, Córdoba, La Plata, Mar del Plata (todas ~100 m). En Mendoza miden ~110 m; en ciudades coloniales como Salta o Tucumán pueden variar entre 100-125 m según el trazado."),
            ("¿Y en Uruguay o Chile?", "Uruguay: varía mucho (100-150 m). Chile: 100 m estándar (como Argentina). México: 80-100 m. Si cruzás la frontera, verificá: las cuadras no son universales.")
        ]
    },
    {
        "slug": "conversor-brazas-a-metros",
        "cat": "matematica", "icon": "⚓",
        "u1": ("braza", "brazas", "bz"), "u2": ("metro", "metros", "m"),
        "factor": 1.8288, "factor_str": "1.8288",
        "factor_origin": "La braza (fathom) se usa en náutica desde la antigüedad: distancia entre las puntas de los brazos de un hombre con brazos extendidos. Estandarizada como 6 pies = 1.8288 m exactos.",
        "example_real": {
            "scenario": "Una carta náutica indica una profundidad de 20 brazas. ¿Cuánto es en metros?",
            "steps": [
                "Valor: 20 brazas.",
                "Aplicar factor: `20 × 1.8288 = 36.576 m`.",
                "Resultado: **36.58 m de profundidad** (plataforma continental típica)."
            ],
            "result": "**20 brazas = 36.58 m** de profundidad."
        },
        "table_values": [1, 5, 10, 20, 100, 1000],
        "use_cases": [
            "Interpretar cartas náuticas antiguas con profundidades en brazas.",
            "Leer relatos marinos clásicos (Moby Dick, Conrad).",
            "Convertir profundidades de buceo expresadas en fathoms.",
            "Entender dimensiones de cuerdas y aparejos náuticos históricos.",
            "Trabajar con pesca de altura con terminología anglosajona."
        ],
        "intro_hook": "**1 braza (fathom) = 1.8288 m** (6 pies). Unidad náutica para profundidades y cuerdas de barco.",
        "faqs_extra": [
            ("¿Por qué se usa la braza en náutica?", "Porque equivale aproximadamente a la 'envergadura' de un hombre con brazos abiertos, útil para medir cuerdas o sondas enrollando alrededor del torso. 1 fathom = 6 pies = ~1.83 m."),
            ("¿Cuánto es '20,000 leguas de profundidad' en metros?", "En 'Veinte Mil Leguas de Viaje Submarino', Verne mide recorrido (no profundidad). La profundidad marina máxima (Fosa de las Marianas) es **~11,034 m = ~6032 brazas**."),
            ("¿En qué países se usan brazas todavía?", "EE.UU. y Reino Unido en náutica tradicional (cartas antiguas, pesca deportiva). En cartografía moderna fue reemplazada por metros en la mayoría de países, aunque persiste en avisos pesqueros.")
        ]
    },

    # ===== PESO / MASA (12) =====
    {
        "slug": "conversor-libras-a-kilogramos",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("libra", "libras", "lb"), "u2": ("kilogramo", "kilogramos", "kg"),
        "factor": 0.45359237, "factor_str": "0.45359237",
        "factor_origin": "Definición internacional de 1959: 1 libra avoirdupois = 0.45359237 kg exactos. Adoptada por EE.UU., UK, Canadá y otros países del sistema imperial.",
        "example_real": {
            "scenario": "Un boxeador pesa 180 libras. ¿Cuántos kilos son?",
            "steps": [
                "Valor: 180 lb.",
                "Aplicar factor: `180 × 0.45359237 = 81.65 kg`.",
                "Resultado: **81.65 kg**, categoría peso mediopesado."
            ],
            "result": "**180 lb = 81.65 kg** (peso mediopesado)."
        },
        "table_values": [1, 5, 10, 25, 50, 100, 150, 200, 500],
        "use_cases": [
            "Convertir peso corporal cuando leés artículos o apps de fitness americanas.",
            "Interpretar pesos de entrenamientos de levantamiento en libras (PR de 315 lb = 143 kg).",
            "Entender capacidades de carga de vehículos o equipos importados.",
            "Convertir alimentos vendidos por libra en supermercados americanos.",
            "Calibrar balanzas o básculas comparadas con estándares americanos."
        ],
        "intro_hook": "**1 libra = 0.4536 kg**. Conversión esencial para quien sigue fitness americano o importa productos.",
        "faqs_extra": [
            ("¿Cuánto es 100 libras en kilos?", "**100 lb = 45.36 kg**. Se usa como referencia en seguros, cargas aéreas y tablas de pesos. Regla rápida: dividí libras por 2.2."),
            ("¿Por qué se llama 'avoirdupois'?", "Del francés 'avoir du pois' (tener peso). Es el sistema de peso británico histórico que distingue libras 'de mercado' (16 onzas, 453.6 g) de las libras troy (12 onzas, 373.2 g, usadas para oro y piedras preciosas)."),
            ("¿Cómo convertir libras a kilos mentalmente?", "Dividí por 2.2 (aproximación rápida). Ejemplo: 150 lb / 2.2 = 68.18 kg (valor exacto: 68.04 kg, error <0.2%). Para mayor precisión: dividí por 2.205.")
        ]
    },
    {
        "slug": "conversor-kilogramos-a-libras",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("kilogramo", "kilogramos", "kg"), "u2": ("libra", "libras", "lb"),
        "factor": 2.20462, "factor_str": "2.20462",
        "factor_origin": "1 kg = 1 / 0.45359237 = 2.2046226218... libras (inverso exacto del factor lb→kg).",
        "example_real": {
            "scenario": "Pesás 75 kg y vas a inscribirte en un torneo de levantamiento americano. ¿Cuántas libras son?",
            "steps": [
                "Valor: 75 kg.",
                "Aplicar factor: `75 × 2.20462 = 165.35 lb`.",
                "Las categorías americanas redondean: te inscribirías en **165 lb o 170 lb** según el formato."
            ],
            "result": "**75 kg = 165.35 lb** (categoría típica: 165 lb)."
        },
        "table_values": [1, 5, 10, 25, 50, 70, 100, 150, 200],
        "use_cases": [
            "Especificar tu peso en formularios de gimnasios o torneos americanos.",
            "Convertir peso de productos en etiquetas exportadas.",
            "Traducir capacidades de equipos industriales al mercado anglo.",
            "Comparar pesos corporales en estudios médicos internacionales.",
            "Expresar medidas de carga en contenedores de exportación."
        ],
        "intro_hook": "**1 kg = 2.2046 libras**. Regla rápida para ir de kilos a libras: multiplicá por 2.2.",
        "faqs_extra": [
            ("¿Cuántas libras son 50 kilos?", "**50 kg = 110.23 lb**. Peso típico de una valija grande o un saco de cemento."),
            ("¿Y 70 kilos?", "**70 kg = 154.32 lb**. Peso corporal medio de un hombre adulto argentino. En categorías de boxeo/UFC: peso Welter (72.5 kg = 159.8 lb)."),
            ("¿Cuánto pesan 100 kilos en libras?", "**100 kg = 220.46 lb**. Un hombre 'grande' físicamente; en el récord mundial de levantamiento de pesas, los más fuertes levantan más de 500 lb (227 kg) en peso muerto.")
        ]
    },
    {
        "slug": "conversor-onzas-a-gramos",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("onza", "onzas", "oz"), "u2": ("gramo", "gramos", "g"),
        "factor": 28.349523125, "factor_str": "28.349523125",
        "factor_origin": "Por definición: 1 onza avoirdupois = 1/16 de libra = 0.45359237 / 16 = 0.028349523125 kg = 28.349523125 g exactos.",
        "example_real": {
            "scenario": "Una receta americana pide 8 onzas de chocolate. ¿Cuántos gramos son?",
            "steps": [
                "Valor: 8 oz.",
                "Aplicar factor: `8 × 28.35 = 226.8 g`.",
                "Resultado: **226.8 g de chocolate** (aproximadamente una tableta y media argentina)."
            ],
            "result": "**8 oz de chocolate = 226.8 g**."
        },
        "table_values": [1, 2, 4, 8, 12, 16, 32],
        "use_cases": [
            "Convertir recetas americanas al sistema métrico (muy común en repostería).",
            "Traducir pesos de ingredientes en etiquetas de productos importados.",
            "Entender raciones de proteína en dietas anglosajonas (8 oz de carne = 227 g).",
            "Convertir peso de oro y plata (atención: joyería usa onza troy).",
            "Calcular dosis o concentrados vendidos por onzas."
        ],
        "intro_hook": "**1 onza = 28.35 g**. Conversión fundamental para recetas americanas y productos importados.",
        "faqs_extra": [
            ("¿Cuánto es 1 onza exactamente?", "**1 oz avoirdupois = 28.349523125 g** exactos (definición de 1959). En la práctica se redondea a 28.35 g o incluso 30 g para estimaciones."),
            ("¿Hay diferencia con la onza troy?", "Sí. La **onza troy** (oro, plata) = **31.1035 g** (un 10% más grande que la avoirdupois de 28.35 g). Un anillo de 1 oz troy de oro tiene 31.1 g; 1 oz de carne tiene 28.35 g."),
            ("¿Cómo pasar onzas a gramos mentalmente?", "Multiplicá por 30 (aproximación). Ejemplo: 4 oz × 30 = 120 g (valor real: 113.4 g, error ~5%). Para mayor precisión: multiplicá por 28.4.")
        ]
    },
    {
        "slug": "conversor-gramos-a-onzas",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("gramo", "gramos", "g"), "u2": ("onza", "onzas", "oz"),
        "factor": 0.035274, "factor_str": "0.035274",
        "factor_origin": "1 g = 1 / 28.349523125 = 0.0352739619... onzas avoirdupois (inverso exacto del factor oz→g).",
        "example_real": {
            "scenario": "Tenés 500 g de almendras y una receta americana necesita onzas. ¿Cuánto es?",
            "steps": [
                "Valor: 500 g.",
                "Aplicar factor: `500 × 0.035274 = 17.64 oz`.",
                "Resultado: **17.64 oz** de almendras."
            ],
            "result": "**500 g = 17.64 oz** (aproximadamente 1.1 lb)."
        },
        "table_values": [10, 50, 100, 250, 500, 1000],
        "use_cases": [
            "Convertir medidas de cocina para blogs o recetas en inglés.",
            "Exportar productos alimenticios con etiquetas americanas.",
            "Calcular peso de joyas o metales preciosos (en onza troy).",
            "Comparar precios por peso con mercados anglosajones.",
            "Traducir contenido de envases para audiencia bilingüe."
        ],
        "intro_hook": "**1 gramo = 0.03527 oz**. Útil para exportar productos o traducir pesos a EE.UU.",
        "faqs_extra": [
            ("¿Cuántas onzas son 100 gramos?", "**100 g = 3.5274 oz**. En etiquetas de snacks: 'serving size 100 g (3.5 oz)'."),
            ("¿Y 250 gramos?", "**250 g = 8.82 oz**. Casi media libra (8 oz = 226.8 g). Peso de un paquete chico de manteca."),
            ("¿Cómo convertir gramos a onzas mentalmente?", "Dividí por 28. Ejemplo: 280 g / 28 = 10 oz (valor real: 9.88 oz, error <2%). Para estimación gruesa: dividí por 30.")
        ]
    },
    {
        "slug": "conversor-toneladas-a-kilogramos",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("tonelada", "toneladas", "t"), "u2": ("kilogramo", "kilogramos", "kg"),
        "factor": 1000.0, "factor_str": "1000",
        "factor_origin": "Por prefijo del SI: 1 tonelada (también 'tonelada métrica' o 'megagramo', Mg) = 10³ kg = 1000 kg exactos. Distinta a la tonelada corta (US, 907 kg) y larga (UK, 1016 kg).",
        "example_real": {
            "scenario": "Un camión argentino puede cargar 30 toneladas. ¿Cuántos kilogramos son?",
            "steps": [
                "Valor: 30 t.",
                "Aplicar factor: `30 × 1000 = 30,000 kg`.",
                "Resultado: **30,000 kg = 30 tn**. Capacidad de un camión con semirremolque cargado al máximo legal."
            ],
            "result": "**30 t = 30,000 kg**."
        },
        "table_values": [1, 5, 10, 25, 50, 100],
        "use_cases": [
            "Calcular carga útil de camiones y trenes.",
            "Convertir pesos de exportación de granos (típico en agro argentino).",
            "Entender capacidades de balanzas industriales.",
            "Especificar pesos de maquinaria pesada.",
            "Traducir cifras de producción industrial (ej: X toneladas de acero al año)."
        ],
        "intro_hook": "**1 tonelada = 1000 kg** exactos (sistema métrico). No confundir con la tonelada corta (907 kg) ni la larga (1016 kg).",
        "faqs_extra": [
            ("¿Cuál es la diferencia entre tonelada, tonelada corta y tonelada larga?", "**Tonelada métrica**: 1000 kg (estándar global). **Tonelada corta** (short ton, US): 907.185 kg = 2000 lb. **Tonelada larga** (long ton, UK): 1016.047 kg = 2240 lb. Si una fuente americana dice 'ton' sin más, asumí tonelada corta."),
            ("¿Cuántos kilos pesan 5 toneladas?", "**5 t = 5000 kg**. Equivalente a ~66 personas adultas promedio (75 kg) o un elefante africano pequeño."),
            ("¿Un camión de 30 toneladas puede circular en rutas argentinas?", "Sí, es la carga bruta máxima legal habitual en Argentina para camiones articulados (escalable a 45 t en bitrenes con permisos especiales). Controla vialidad en balanzas camineras.")
        ]
    },
    {
        "slug": "conversor-stones-a-kilogramos",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("stone", "stones", "st"), "u2": ("kilogramo", "kilogramos", "kg"),
        "factor": 6.35029318, "factor_str": "6.35029318",
        "factor_origin": "Por definición: 1 stone = 14 libras = 14 × 0.45359237 = 6.35029318 kg exactos. Unidad tradicional británica.",
        "example_real": {
            "scenario": "Un inglés dice 'peso 12 stone'. ¿Cuántos kilos son?",
            "steps": [
                "Valor: 12 stones.",
                "Aplicar factor: `12 × 6.3503 = 76.20 kg`.",
                "Resultado: **76.2 kg**, peso corporal típico adulto."
            ],
            "result": "**12 stones = 76.2 kg** (168 lb)."
        },
        "table_values": [1, 5, 8, 10, 12, 15, 20],
        "use_cases": [
            "Entender peso corporal de británicos (es la unidad de peso personal favorita en UK).",
            "Leer relatos deportivos o biografías del Reino Unido (peso de boxeadores en stones).",
            "Interpretar artículos médicos británicos con rangos en stones.",
            "Convertir peso para programas de dieta con apps en inglés británico.",
            "Traducir peso corporal en viajes a UK (los médicos usan stones y libras)."
        ],
        "intro_hook": "**1 stone = 6.35 kg** (14 libras). Unidad de peso corporal casi exclusiva del Reino Unido.",
        "faqs_extra": [
            ("¿Qué es un 'stone' en peso?", "Una unidad británica de peso: **1 stone = 14 libras = 6.35 kg** exactos. Se usa casi solo para peso corporal en Reino Unido e Irlanda. Los ingleses suelen decir 'I weigh 12 stone 4' (12 stones 4 libras = 78 kg)."),
            ("¿Por qué 14 libras?", "Deriva de la 'piedra de lana' medieval usada para pesar productos agrícolas en mercados. Se estandarizó en 1835 (Imperial Standards Act). En la mayoría de los países se dejó de usar, salvo en UK."),
            ("¿Cuánto pesa un hombre 'promedio' británico en stones?", "**~13 stones (82.5 kg)**. Peso medio adulto masculino en UK. Mujer promedio: ~11 stones (~70 kg). Son valores de referencia para tablas médicas británicas.")
        ]
    },
    {
        "slug": "conversor-quilates-a-gramos",
        "cat": "matematica", "icon": "💎",
        "u1": ("quilate", "quilates", "ct"), "u2": ("gramo", "gramos", "g"),
        "factor": 0.2, "factor_str": "0.2",
        "factor_origin": "El quilate métrico (métric carat) fue estandarizado en 1907: **1 quilate = 200 mg = 0.2 g exactos**. Usado universalmente para piedras preciosas desde entonces.",
        "example_real": {
            "scenario": "Un anillo de compromiso tiene un diamante de 1 quilate. ¿Cuánto pesa?",
            "steps": [
                "Valor: 1 ct.",
                "Aplicar factor: `1 × 0.2 = 0.2 g = 200 mg`.",
                "Resultado: **200 mg de diamante**. Un diamante de 1 ct tiene ~6.5 mm de diámetro (corte brillante)."
            ],
            "result": "**1 quilate = 0.2 g = 200 mg**."
        },
        "table_values": [0.25, 0.5, 1, 1.5, 2, 3, 5],
        "use_cases": [
            "Pesar diamantes, rubíes, esmeraldas y piedras preciosas.",
            "Comprar joyas entendiendo el peso real (y poder negociar).",
            "Distinguir 'quilates' de pureza del oro (24K) vs. quilates de peso.",
            "Calcular valor por peso en mercados joyeros.",
            "Interpretar certificados gemológicos (GIA, HRD) que reportan en ct."
        ],
        "intro_hook": "**1 quilate = 0.2 gramos** (200 mg). El 'quilate' de piedras preciosas es una unidad de peso; el 'quilate' del oro (K) es una unidad de pureza (24K = oro puro).",
        "faqs_extra": [
            ("¿Los quilates del oro son lo mismo que los de diamantes?", "**NO**. En piedras preciosas (ct), quilate es **peso** (1 ct = 0.2 g). En oro (K), quilate es **pureza**: 24K = oro puro 999‰, 18K = 750‰ oro y 250‰ otros metales. Son conceptos totalmente diferentes que comparten el nombre por razones históricas."),
            ("¿Cuántos gramos pesan 5 quilates?", "**5 ct = 1 gramo** exactos. Un diamante de 5 ct es muy grande (~11 mm de diámetro). La mayoría de anillos de compromiso están entre 0.5 y 2 quilates."),
            ("¿Por qué 0.2 g y no un número redondo?", "Antes de 1907 cada país usaba un peso distinto (entre 0.188 y 0.213 g), por la semilla de la algarroba que se usaba tradicionalmente. La Conferencia Internacional de Pesas y Medidas unificó en 200 mg por conveniencia.")
        ]
    },
    {
        "slug": "conversor-miligramos-a-gramos",
        "cat": "matematica", "icon": "💊",
        "u1": ("miligramo", "miligramos", "mg"), "u2": ("gramo", "gramos", "g"),
        "factor": 0.001, "factor_str": "0.001",
        "factor_origin": "Por prefijo del SI: 1 mg = 10⁻³ g = 0.001 g. Equivalentemente: 1 g = 1000 mg.",
        "example_real": {
            "scenario": "Una pastilla de ibuprofeno dice '400 mg'. ¿Cuántos gramos es?",
            "steps": [
                "Valor: 400 mg.",
                "Aplicar factor: `400 × 0.001 = 0.4 g`.",
                "Resultado: **0.4 g de ibuprofeno** (menos de medio gramo)."
            ],
            "result": "**400 mg = 0.4 g** (una pastilla típica)."
        },
        "table_values": [50, 100, 250, 500, 1000, 2000, 5000],
        "use_cases": [
            "Interpretar dosis de medicamentos (vienen en mg).",
            "Calcular suplementos vitamínicos (ej: 1000 mg de vitamina C = 1 g).",
            "Medir concentraciones en química o biología.",
            "Convertir datos nutricionales (sodio, potasio reportados en mg).",
            "Pesajes de precisión en laboratorio o joyería."
        ],
        "intro_hook": "**1 mg = 0.001 g**. Unidad de precisión para medicamentos, suplementos y químicos.",
        "faqs_extra": [
            ("¿Cuántos mg tiene 1 gramo?", "**1 gramo = 1000 miligramos**. Por eso una pastilla de 500 mg tiene medio gramo, y una dosis de 2000 mg equivale a 2 g."),
            ("¿Es lo mismo 1 mg que 1 ml?", "**No**. mg es peso, ml es volumen. Para un líquido con densidad similar al agua (como jarabes diluidos), 1 mg ≈ 0.001 ml, pero NO son lo mismo. Siempre leé la etiqueta del medicamento para ver cuántos mg tiene por ml."),
            ("¿Cómo convierto mg a gramos para una receta?", "Dividí por 1000. Ejemplo: 250 mg de levadura seca = 0.25 g. En pastelería industrial se usan mg para ingredientes minoritarios (colorantes, saborizantes) por precisión.")
        ]
    },
    {
        "slug": "conversor-libras-a-onzas",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("libra", "libras", "lb"), "u2": ("onza", "onzas", "oz"),
        "factor": 16.0, "factor_str": "16",
        "factor_origin": "Por definición del sistema avoirdupois: 1 libra = 16 onzas exactas. Relación fija desde el siglo XIV en Inglaterra.",
        "example_real": {
            "scenario": "Una receta pide 2 libras de pechuga de pollo. ¿Cuántas onzas son?",
            "steps": [
                "Valor: 2 lb.",
                "Aplicar factor: `2 × 16 = 32 onzas`.",
                "Resultado: **32 oz de pollo = 907.2 g** (casi un kilo)."
            ],
            "result": "**2 lb = 32 oz = 907 g**."
        },
        "table_values": [0.25, 0.5, 1, 2, 3, 5, 10],
        "use_cases": [
            "Convertir recetas americanas que mezclan libras y onzas.",
            "Interpretar etiquetas de productos importados (ej: 'net weight 2 lb 4 oz').",
            "Calcular raciones de carne y alimentos en formato imperial.",
            "Entender pesos de envíos de correo con restricciones por oz/lb.",
            "Trabajar con equipo de caza y pesca especificado en lb/oz."
        ],
        "intro_hook": "**1 libra = 16 onzas** exactas. Relación fija del sistema imperial.",
        "faqs_extra": [
            ("¿Cuántas onzas son media libra?", "**½ lb = 8 onzas**. Equivalente a 227 g. Porción típica de filete de carne o pechuga. En supermercados americanos es la mitad de un paquete estándar."),
            ("¿Por qué 16 y no 10?", "Por historia: el sistema avoirdupois inglés se basó en múltiplos de 2 (1 oz, 2, 4, 8, 16 = 1 lb) para facilitar divisiones con balanzas romanas. El sistema decimal métrico fue posterior (1795, Francia)."),
            ("¿Cómo paso '3 lb 5 oz' a onzas totales?", "Multiplicá las libras por 16 y sumá las onzas: `3 × 16 + 5 = 53 oz`. Útil para pesos de envío postal y etiquetas compuestas.")
        ]
    },
    {
        "slug": "conversor-toneladas-cortas-a-toneladas-metricas",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("tonelada corta", "toneladas cortas", "ST"), "u2": ("tonelada métrica", "toneladas métricas", "t"),
        "factor": 0.907185, "factor_str": "0.907185",
        "factor_origin": "Por definición: 1 tonelada corta (US) = 2000 libras avoirdupois = 2000 × 0.45359237 kg = 907.18474 kg = 0.90718474 tonelada métrica.",
        "example_real": {
            "scenario": "Una noticia americana dice que una empresa exporta 50,000 toneladas cortas de acero. ¿Cuántas toneladas métricas son?",
            "steps": [
                "Valor: 50,000 ST.",
                "Aplicar factor: `50,000 × 0.9072 = 45,359 toneladas métricas`.",
                "Resultado: **~45,360 toneladas métricas** (casi un 10% menos que lo que suena)."
            ],
            "result": "**50,000 short tons = 45,359 t métricas**."
        },
        "table_values": [1, 10, 100, 1000, 10000],
        "use_cases": [
            "Convertir cifras de exportación entre mercados US y resto del mundo.",
            "Interpretar estadísticas americanas de producción (acero, carbón, granos).",
            "Traducir capacidad de buques y trenes entre sistemas.",
            "Entender contratos internacionales que mezclan unidades.",
            "Comparar volúmenes de minería en publicaciones anglosajonas."
        ],
        "intro_hook": "**1 short ton (US) = 0.907 toneladas métricas**. La tonelada americana es 9% más liviana que la métrica.",
        "faqs_extra": [
            ("¿Cuál es la diferencia exacta?", "**Tonelada métrica** = 1000 kg (SI, estándar mundial). **Tonelada corta** (short ton, US) = 907.185 kg (2000 lb). **Tonelada larga** (long ton, UK) = 1016.047 kg (2240 lb). La métrica es la más usada globalmente."),
            ("¿Cuándo se usa la tonelada corta?", "Casi exclusivamente en EE.UU. para industria, minería, agricultura y transporte terrestre interno. En comercio internacional (exportación) las empresas reportan ambas cifras para evitar confusiones."),
            ("¿Y la tonelada larga?", "Se usa en Reino Unido y en shipping marítimo internacional (para calados y desplazamientos de buques). En notación marítima, 'ton' sin calificar suele ser long ton = 1016 kg.")
        ]
    },
    {
        "slug": "conversor-arrobas-a-kilogramos",
        "cat": "matematica", "icon": "🌾",
        "u1": ("arroba", "arrobas", "@"), "u2": ("kilogramo", "kilogramos", "kg"),
        "factor": 11.502, "factor_str": "11.502 (Argentina) / 11.339 (España)",
        "factor_origin": "La arroba castellana tradicional pesaba 25 libras castellanas = 11.502 kg (en Argentina y varios países hispanoamericanos). En España moderna se estandarizó en 11.339 kg. El símbolo '@' viene originalmente de la arroba (medida), no del email.",
        "example_real": {
            "scenario": "En el campo, un puestero dice 'me llevé 4 arrobas de yerba'. ¿Cuánto en kilos?",
            "steps": [
                "Valor: 4 @.",
                "Aplicar factor: `4 × 11.502 = 46.01 kg`.",
                "Resultado: **46 kg de yerba** (casi una bolsa grande de las que se venden en el NE argentino)."
            ],
            "result": "**4 arrobas = 46 kg** (aprox una bolsa chica de yerba)."
        },
        "table_values": [1, 2, 4, 10, 25, 100],
        "use_cases": [
            "Interpretar textos rurales antiguos (literatura gauchesca, documentos del siglo XIX).",
            "Leer escrituras de campos o estancias con pesos en arrobas.",
            "Entender comercios tradicionales de zonas agrícolas (yerba, algodón, tabaco).",
            "Estudiar historia económica colonial y republicana temprana.",
            "Traducir pesajes tradicionales de ganado y cereales."
        ],
        "intro_hook": "**1 arroba ≈ 11.5 kg** (Argentina). Unidad tradicional del mundo rural hispanoamericano; el símbolo '@' viene de esta medida.",
        "faqs_extra": [
            ("¿De dónde viene el símbolo '@'?", "Originalmente era una abreviatura manuscrita de 'arroba', unidad de peso árabe-hispánica (ar-rubʿ = 'el cuarto'). Los árabes la trajeron a España; se extendió por América. Cuando se inventó el email, Ray Tomlinson eligió '@' por estar disponible en el teclado y no aparecer en nombres."),
            ("¿Todas las arrobas pesan lo mismo?", "**No**. Arroba castellana original: 11.502 kg (25 libras castellanas). En España moderna se unificó en 11.339 kg. En Portugal (arroba portuguesa) = 14.69 kg. Los textos argentinos antiguos usan la castellana de 11.502 kg."),
            ("¿Se usa la arroba hoy en Argentina?", "Prácticamente no en comercio urbano. Persiste en zonas rurales tradicionales (NO argentino, NE) para yerba, tabaco y algodón en mercados informales. En escrituras de campos viejas aparece como medida de peso legal.")
        ]
    },
    {
        "slug": "conversor-kilogramos-a-gramos",
        "cat": "matematica", "icon": "⚖️",
        "u1": ("kilogramo", "kilogramos", "kg"), "u2": ("gramo", "gramos", "g"),
        "factor": 1000.0, "factor_str": "1000",
        "factor_origin": "Por prefijo del SI: 1 kg = 10³ g = 1000 g exactos. Es una relación base del sistema métrico.",
        "example_real": {
            "scenario": "Un saco de azúcar pesa 2.5 kg. ¿Cuántos gramos son?",
            "steps": [
                "Valor: 2.5 kg.",
                "Aplicar factor: `2.5 × 1000 = 2500 g`.",
                "Resultado: **2500 g = 2.5 kg**."
            ],
            "result": "**2.5 kg = 2500 g**."
        },
        "table_values": [0.1, 0.5, 1, 2, 5, 10, 25, 100],
        "use_cases": [
            "Convertir peso de recetas grandes a porciones chicas.",
            "Calcular dosis por kg de peso corporal (medicamentos pediátricos).",
            "Traducir pesos de ingredientes a granel a porciones.",
            "Interpretar etiquetas nutricionales (valor por 100 g vs por producto).",
            "Convertir peso de productos industriales a unidades comerciales."
        ],
        "intro_hook": "**1 kg = 1000 g** exactos. Relación básica del sistema métrico.",
        "faqs_extra": [
            ("¿Cuántos gramos tiene medio kilo?", "**½ kg = 500 g**. Peso típico de un paquete de arroz, una barra chica de manteca (aunque las argentinas son de 200 g) o una bolsa pequeña de harina."),
            ("¿Y 100 gramos?", "**100 g = 0.1 kg**. Porción estándar para etiquetas nutricionales ('valor por 100 g'). Peso de una manzana chica o una barrita de chocolate."),
            ("¿Cómo calculo la dosis de un medicamento 'mg por kg'?", "Multiplicá los mg/kg por tu peso en kg. Ejemplo: medicamento de 10 mg/kg y pesás 70 kg → `10 × 70 = 700 mg` de dosis. Siempre seguí indicación médica.")
        ]
    },
]
