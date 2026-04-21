"""Batch 100 conversores - PARTE 2: Temperatura, Volumen, Área, Velocidad (30 calcs)."""

LINEAR_P2 = [
    # ===== TEMPERATURA (5) - NO LINEAR pero mantenemos estructura =====
    # Temperature uses affine transform: y = a*x + b. Factor is dual: slope + offset.
    {
        "slug": "conversor-celsius-a-fahrenheit",
        "cat": "matematica", "icon": "🌡️",
        "u1": ("grado Celsius", "grados Celsius", "°C"), "u2": ("grado Fahrenheit", "grados Fahrenheit", "°F"),
        "is_temp": True,
        "temp_formula": "(°C × 9/5) + 32",
        "temp_inverse": "(°F - 32) × 5/9",
        "factor": 1.8, "offset": 32, "factor_str": "×1.8 +32",
        "factor_origin": "Fahrenheit (1724) tomó 0°F en la mezcla de hielo-sal y 96°F como temperatura corporal. Celsius (1742) propuso 0°C como fusión del agua y 100°C como ebullición. La relación final: °F = °C × 9/5 + 32.",
        "example_real": {
            "scenario": "Afuera hay 20 °C (día templado). ¿Cuánto es en Fahrenheit?",
            "steps": [
                "Fórmula: `°F = °C × 9/5 + 32 = °C × 1.8 + 32`.",
                "Aplicar: `20 × 1.8 + 32 = 36 + 32 = 68 °F`.",
                "Resultado: **68 °F** (\"room temperature\" en clima americano)."
            ],
            "result": "**20 °C = 68 °F**."
        },
        "table_values": [-40, 0, 10, 20, 30, 37, 100],
        "use_cases": [
            "Interpretar pronóstico del clima en Estados Unidos (TV, apps).",
            "Ajustar el horno cuando seguís recetas americanas (350 °F = 176 °C).",
            "Entender rangos de funcionamiento de equipos importados (especificados en °F).",
            "Convertir fiebre corporal en viajes a EE.UU. (100 °F = 37.8 °C).",
            "Traducir temperaturas de cooking ranges para gastronomía."
        ],
        "intro_hook": "**°F = °C × 9/5 + 32**. Conversión crítica para recetas americanas, clima en EE.UU. y temperatura corporal.",
        "faqs_extra": [
            ("¿A cuántos °F equivalen 0 °C?", "**0 °C = 32 °F**. Es el punto de congelación del agua. En EE.UU., 32 °F es la referencia de 'helada' en pronósticos invernales."),
            ("¿Y 100 °C?", "**100 °C = 212 °F**. Punto de ebullición del agua al nivel del mar. En altura esta temperatura baja (en La Paz, Bolivia, ~3650 m, el agua hierve a ~88 °C = 190 °F)."),
            ("¿Qué temperatura coinciden °C y °F?", "**-40**. A -40 °C = -40 °F exactamente. Es el único punto donde los dos valores son iguales. Útil dato curioso y posible pregunta de ingeniería en operaciones en frío extremo.")
        ]
    },
    {
        "slug": "conversor-fahrenheit-a-celsius",
        "cat": "matematica", "icon": "🌡️",
        "u1": ("grado Fahrenheit", "grados Fahrenheit", "°F"), "u2": ("grado Celsius", "grados Celsius", "°C"),
        "is_temp": True,
        "temp_formula": "(°F - 32) × 5/9",
        "temp_inverse": "(°C × 9/5) + 32",
        "factor": 0.5556, "offset": -17.778, "factor_str": "(°F - 32) × 5/9",
        "factor_origin": "Inversa de la fórmula C→F: si °F = °C × 1.8 + 32, despejando °C queda: °C = (°F - 32) / 1.8 = (°F - 32) × 5/9.",
        "example_real": {
            "scenario": "El pronóstico en Miami dice 86 °F. ¿Cuánto es en Celsius?",
            "steps": [
                "Fórmula: `°C = (°F - 32) × 5/9`.",
                "Aplicar: `(86 - 32) × 5/9 = 54 × 5/9 = 30 °C`.",
                "Resultado: **30 °C**, día caluroso."
            ],
            "result": "**86 °F = 30 °C** (día caluroso en Miami)."
        },
        "table_values": [0, 32, 50, 68, 86, 98.6, 212, 350],
        "use_cases": [
            "Entender pronósticos meteorológicos americanos en viajes o trabajo remoto.",
            "Traducir temperaturas de hornos en recetas de Estados Unidos.",
            "Convertir fiebre reportada en Fahrenheit (99.5 °F = 37.5 °C).",
            "Interpretar especificaciones técnicas de productos anglosajones.",
            "Calcular diferencia entre rangos de temperatura (AC, heladeras, freezers)."
        ],
        "intro_hook": "**°C = (°F − 32) × 5/9**. Útil para leer climas en EE.UU., recetas de hornos americanas y temperaturas corporales.",
        "faqs_extra": [
            ("¿Cuánto es 98.6 °F en Celsius?", "**98.6 °F = 37 °C**, temperatura corporal normal de referencia en EE.UU. En Argentina se usa 36.5 °C. 'Tener fiebre' es ≥ 38 °C (100.4 °F)."),
            ("¿Cuánto mide 350 °F en Celsius?", "**350 °F ≈ 176 °C**, temperatura estándar de horneado en recetas americanas (Moderate oven). Equivale a 'horno moderado' en Argentina."),
            ("¿Hay un truco mental rápido?", "Restá 30 al valor en °F y dividí por 2 (aproximación gruesa). Ejemplo: 80 °F → (80-30)/2 = 25 °C (valor real: 26.7 °C). Error de 1-2 °C, útil para estimar.")
        ]
    },
    {
        "slug": "conversor-celsius-a-kelvin",
        "cat": "ciencia", "icon": "🌡️",
        "u1": ("grado Celsius", "grados Celsius", "°C"), "u2": ("Kelvin", "Kelvin", "K"),
        "is_temp": True,
        "temp_formula": "°C + 273.15",
        "temp_inverse": "K - 273.15",
        "factor": 1.0, "offset": 273.15, "factor_str": "+273.15",
        "factor_origin": "Por definición del SI (1954): 0 K = cero absoluto = -273.15 °C. Las escalas tienen el mismo tamaño de grado (∆1 K = ∆1 °C); solo difieren en el cero.",
        "example_real": {
            "scenario": "La temperatura ambiente típica es 22 °C. ¿Cuánto es en Kelvin?",
            "steps": [
                "Fórmula: `K = °C + 273.15`.",
                "Aplicar: `22 + 273.15 = 295.15 K`.",
                "Resultado: **295.15 K**, típica ambiente de laboratorio."
            ],
            "result": "**22 °C = 295.15 K**."
        },
        "table_values": [-273.15, -40, 0, 25, 100, 1000],
        "use_cases": [
            "Cálculos termodinámicos (leyes de gases PV=nRT usan K).",
            "Convertir datos de experimentos científicos o ingeniería térmica.",
            "Interpretar publicaciones de química donde T está en K.",
            "Calcular eficiencia de motores de Carnot (usa K obligatoriamente).",
            "Comprender escalas astronómicas (temperatura de estrellas en K)."
        ],
        "intro_hook": "**K = °C + 273.15**. El Kelvin es la escala absoluta: el cero indica ausencia total de energía térmica molecular.",
        "faqs_extra": [
            ("¿Qué es el cero absoluto?", "**0 K = -273.15 °C**. Es la temperatura teórica donde las moléculas tienen energía térmica mínima (movimiento vibracional mínimo, no cero por incertidumbre cuántica). No se ha alcanzado en la práctica; el récord es ~38 pK (picokelvins) en laboratorio."),
            ("¿Por qué se usa Kelvin en ciencia?", "Porque es escala **absoluta**: las proporciones son matemáticamente correctas. Si duplicás K, duplicás la energía cinética molecular; con °C no (no existe 'el doble de 20 °C' termodinámicamente). Imprescindible para PV=nRT, Stefan-Boltzmann, etc."),
            ("¿Cuántos Kelvin tiene el Sol?", "Superficie del Sol: **~5800 K** (que es °C - 273.15 ≈ 5526 °C). Núcleo: **~15.7 millones de K**. Las estrellas se clasifican por temperatura superficial (clase espectral O, B, A, F, G, K, M).")
        ]
    },
    {
        "slug": "conversor-kelvin-a-celsius",
        "cat": "ciencia", "icon": "🌡️",
        "u1": ("Kelvin", "Kelvin", "K"), "u2": ("grado Celsius", "grados Celsius", "°C"),
        "is_temp": True,
        "temp_formula": "K - 273.15",
        "temp_inverse": "°C + 273.15",
        "factor": 1.0, "offset": -273.15, "factor_str": "-273.15",
        "factor_origin": "Inversa: si K = °C + 273.15, entonces °C = K - 273.15.",
        "example_real": {
            "scenario": "Una publicación astronómica dice que la temperatura media del universo (radiación cósmica de fondo) es 2.725 K. ¿En Celsius?",
            "steps": [
                "Fórmula: `°C = K - 273.15`.",
                "Aplicar: `2.725 - 273.15 = -270.425 °C`.",
                "Resultado: **-270.4 °C**, casi el cero absoluto."
            ],
            "result": "**CMB = 2.725 K = -270.4 °C**."
        },
        "table_values": [0, 100, 273.15, 298, 373.15, 1000, 5800],
        "use_cases": [
            "Convertir datos científicos a unidades cotidianas.",
            "Interpretar especificaciones criogénicas (nitrógeno líquido: 77 K = -196 °C).",
            "Traducir temperaturas astronómicas para divulgación.",
            "Leer publicaciones de física con T en K.",
            "Comparar temperaturas de fase con el sistema métrico habitual."
        ],
        "intro_hook": "**°C = K - 273.15**. Convertir Kelvin a Celsius es tan simple como restar 273.15.",
        "faqs_extra": [
            ("¿Cuánto es 273 K en Celsius?", "**273 K = -0.15 °C**, casi el punto de congelación del agua (0 °C = 273.15 K). Por eso 273 K es a menudo citado como aproximación del 'punto de agua'."),
            ("¿Cuánto es 300 K?", "**300 K = 26.85 °C**, temperatura ambiente cálida. Usado como 'ambiente estándar' en muchos cálculos de física (fácil de memorizar)."),
            ("¿La temperatura del filamento de una lámpara?", "Bombilla incandescente: **~3000 K = ~2727 °C**. LED blanco 'cálido': ~3000 K (no es la temperatura real del LED, sino la 'temperatura de color').")
        ]
    },
    {
        "slug": "conversor-fahrenheit-a-kelvin",
        "cat": "ciencia", "icon": "🌡️",
        "u1": ("grado Fahrenheit", "grados Fahrenheit", "°F"), "u2": ("Kelvin", "Kelvin", "K"),
        "is_temp": True,
        "temp_formula": "(°F - 32) × 5/9 + 273.15",
        "temp_inverse": "(K - 273.15) × 9/5 + 32",
        "factor": 0.5556, "offset": 255.372, "factor_str": "(°F - 32) × 5/9 + 273.15",
        "factor_origin": "Combinación de F→C y C→K: primero convertís °F a °C (restando 32 y multiplicando por 5/9), después sumás 273.15.",
        "example_real": {
            "scenario": "Una nota científica americana dice que el punto de ebullición del plomo es 3180 °F. ¿Cuánto en Kelvin?",
            "steps": [
                "Fórmula: `K = (°F - 32) × 5/9 + 273.15`.",
                "Aplicar: `(3180 - 32) × 5/9 + 273.15 = 3148 × 5/9 + 273.15 = 1749 + 273 = 2022 K`.",
                "Resultado: **2022 K** (punto de ebullición del plomo)."
            ],
            "result": "**3180 °F = 2022 K**."
        },
        "table_values": [-459.67, 0, 32, 72, 212, 1000, 3000],
        "use_cases": [
            "Leer papers de ingeniería donde T está en °F pero necesitás K para cálculos.",
            "Traducir especificaciones de equipamiento criogénico y de alta temperatura.",
            "Interpretar data sheets industriales americanas que mezclan escalas.",
            "Convertir datos de experimentos entre sistemas de medición.",
            "Calcular propiedades termodinámicas con fórmulas que exigen K."
        ],
        "intro_hook": "**K = (°F − 32) × 5/9 + 273.15**. Conversión directa cuando necesitás Kelvin partiendo de Fahrenheit.",
        "faqs_extra": [
            ("¿Cuánto es 0 °F en Kelvin?", "**0 °F = 255.37 K = -17.78 °C**. La escala Fahrenheit puso el 0 en la mezcla de hielo y sal amoniacal (más fría que 0 °C)."),
            ("¿Cuál es el cero absoluto en Fahrenheit?", "**-459.67 °F = 0 K**. Sí, el cero absoluto está muy lejos del 0 °F. Para pasar de 0 K hacia 'temperaturas normales' hay que recorrer casi 500 °F."),
            ("¿Se usa Fahrenheit en ciencia?", "En EE.UU. algunas publicaciones de ingeniería térmica y meteorología siguen usando °F, pero para ciencia 'dura' se usa Kelvin (termodinámica) o Celsius. Si hacés un paper internacional, convertí a K.")
        ]
    },

    # ===== VOLUMEN (11) =====
    {
        "slug": "conversor-galones-a-litros",
        "cat": "matematica", "icon": "⛽",
        "u1": ("galón", "galones", "gal"), "u2": ("litro", "litros", "L"),
        "factor": 3.785411784, "factor_str": "3.785411784 (US) / 4.54609 (UK)",
        "factor_origin": "Galón US: 1 gal US = 3.785411784 L exactos (definido como 231 pulgadas³). Galón UK (imperial): 1 gal UK = 4.54609 L exactos (definido en 1824 como 10 libras de agua a 62 °F). La mayoría de conversiones asumen US salvo contexto británico/canadiense.",
        "example_real": {
            "scenario": "Un auto americano tiene un tanque de 15 galones. ¿Cuántos litros?",
            "steps": [
                "Valor: 15 gal US.",
                "Aplicar factor: `15 × 3.7854 = 56.78 L`.",
                "Resultado: **56.78 L**, tanque grande (un auto argentino promedio tiene 50 L)."
            ],
            "result": "**15 gal US = 56.78 L**."
        },
        "table_values": [1, 2, 5, 10, 15, 20, 50, 100],
        "use_cases": [
            "Convertir capacidad de tanques de combustible americanos.",
            "Interpretar millas por galón (MPG) a km/L.",
            "Calcular capacidad de envases de pintura (que vienen en galones).",
            "Traducir consumos de agua industriales americanos.",
            "Entender capacidades de recipientes de camping (gallon jug = 3.78 L)."
        ],
        "intro_hook": "**1 galón US = 3.785 L**. **1 galón UK = 4.546 L**. Siempre verificá de qué país viene el dato: 20% de diferencia.",
        "faqs_extra": [
            ("¿Cuánto es 1 galón en litros?", "Depende del tipo. **1 galón US = 3.785 L** (EE.UU.), **1 galón UK = 4.546 L** (Reino Unido, Canadá, Caribe). El galón imperial es ~20% más grande que el americano."),
            ("¿Por qué hay dos galones?", "Por historia: UK unificó medidas imperiales en 1824, redefiniendo el galón. EE.UU. mantuvo la versión anterior (Queen Anne's gallon, 1707). Desde entonces coexisten dos estándares."),
            ("¿Cuántos litros tiene un barril de petróleo?", "**1 barril = 42 galones US = 158.987 L**. Cuando leés 'petróleo a USD 80 el barril', se refiere al bbl de 159 L. Distinto al barril de cerveza (31 gal US) o al barril seco (115.6 L).")
        ]
    },
    {
        "slug": "conversor-litros-a-galones",
        "cat": "matematica", "icon": "💧",
        "u1": ("litro", "litros", "L"), "u2": ("galón US", "galones US", "gal US"),
        "factor": 0.264172, "factor_str": "0.264172 (US) / 0.219969 (UK)",
        "factor_origin": "1 L = 1 / 3.7854118 = 0.264172052... galones US (inverso). Para UK: 1 L = 1 / 4.54609 = 0.219969 gal UK.",
        "example_real": {
            "scenario": "Un tanque de nafta argentino tiene 50 L. ¿Cuántos galones americanos?",
            "steps": [
                "Valor: 50 L.",
                "Aplicar factor: `50 × 0.2642 = 13.21 gal US`.",
                "Resultado: **13.21 galones US** (tanque mediano en EE.UU.)."
            ],
            "result": "**50 L = 13.21 galones US**."
        },
        "table_values": [1, 5, 10, 20, 50, 100, 200],
        "use_cases": [
            "Traducir capacidades argentinas a mercado americano (ej: exportación de bebidas).",
            "Publicar consumos de agua domésticos para audiencia anglo.",
            "Convertir tanques de combustible al estándar americano.",
            "Estimar cargas de agua en expediciones con proveedores anglos.",
            "Traducir envases de detergente o químicos industriales."
        ],
        "intro_hook": "**1 L = 0.2642 gal US** (o 0.22 gal UK). Un litro es aproximadamente 1/4 de galón americano.",
        "faqs_extra": [
            ("¿Cuántos galones son 10 litros?", "**10 L = 2.64 galones US = 2.20 galones UK**. Una garrafa chica argentina típica."),
            ("¿Y 20 litros?", "**20 L = 5.28 galones US**. Bidón estándar argentino de combustible o agua."),
            ("¿Cuántos galones tiene un metro cúbico?", "**1 m³ = 1000 L = 264.17 galones US**. Útil para cálculos industriales y capacidades de tanques grandes.")
        ]
    },
    {
        "slug": "conversor-onzas-liquidas-a-mililitros",
        "cat": "cocina", "icon": "🍹",
        "u1": ("onza líquida", "onzas líquidas", "fl oz"), "u2": ("mililitro", "mililitros", "mL"),
        "factor": 29.5735, "factor_str": "29.5735 (US) / 28.4131 (UK)",
        "factor_origin": "1 fl oz US = 1/128 gal US = 29.5735295625 mL exactos. 1 fl oz UK = 1/160 gal UK = 28.4130625 mL exactos. La onza líquida NO es lo mismo que la onza (peso, 28.35 g).",
        "example_real": {
            "scenario": "Una receta de cóctel pide 2 onzas líquidas de ron. ¿Cuántos ml son?",
            "steps": [
                "Valor: 2 fl oz US.",
                "Aplicar factor: `2 × 29.5735 = 59.15 mL`.",
                "Resultado: **~60 mL de ron** (un 'doble' o shot de cocktail)."
            ],
            "result": "**2 fl oz = 59 mL** (shot doble de cocktail)."
        },
        "table_values": [0.5, 1, 1.5, 2, 4, 8, 16, 32],
        "use_cases": [
            "Convertir medidas de cocteles de bar americanos.",
            "Interpretar tamaños de envases de bebidas (16.9 fl oz = 500 mL).",
            "Traducir recetas de cocina anglosajonas.",
            "Medir dosis de remedios líquidos (2 fl oz = 60 mL).",
            "Convertir capacidades de cosméticos y líquidos importados."
        ],
        "intro_hook": "**1 fl oz US = 29.57 mL**. No confundir con la onza de peso (28.35 g) — son unidades distintas aunque tengan el mismo nombre.",
        "faqs_extra": [
            ("¿Cuánto es un shot americano en ml?", "**Shot estándar US = 1.5 fl oz = 44 mL**. Shot grande = 2 fl oz = 59 mL. En Argentina el shot típico es 50 mL, así que un shot americano estándar es un 12% menos."),
            ("¿Es diferente la onza líquida UK?", "**Sí**. fl oz UK = 28.41 mL (4% más chica que la US). En recetas americanas, asumí US. En británicas (cóctel London style), asumí UK."),
            ("¿Qué mide una 'pint' americana?", "**1 pint US = 16 fl oz = 473 mL**. Pint UK = 20 fl oz = 568 mL (cerveza británica clásica). Por eso una pinta de cerveza en pub británico es más grande que en bar americano.")
        ]
    },
    {
        "slug": "conversor-tazas-a-mililitros",
        "cat": "cocina", "icon": "☕",
        "u1": ("taza", "tazas", "cup"), "u2": ("mililitro", "mililitros", "mL"),
        "factor": 236.588, "factor_str": "236.588 (US legal cup) / 240 (US metric) / 250 (métrico)",
        "factor_origin": "1 US cup legal (FDA) = 240 mL. 1 US cup de cocina = 8 fl oz US = 236.588 mL (más preciso). 1 taza métrica internacional = 250 mL (usado en Argentina, Australia, Nueva Zelanda).",
        "example_real": {
            "scenario": "Una receta americana pide 2 cups de harina. ¿Cuántos ml (y gramos aprox)?",
            "steps": [
                "Valor: 2 cups US.",
                "Aplicar factor: `2 × 236.588 = 473.2 mL`.",
                "Convertir a gramos (harina, densidad ~0.53 g/mL): `473 × 0.53 = 250 g`.",
                "Resultado: **473 mL = ~250 g de harina**."
            ],
            "result": "**2 cups de harina = 473 mL ≈ 250 g**."
        },
        "table_values": [0.25, 0.33, 0.5, 0.75, 1, 2, 4],
        "use_cases": [
            "Convertir recetas americanas (blogs, libros de cocina, YouTube).",
            "Adaptar cantidades a medidas argentinas sin taza medidora.",
            "Traducir porciones para dietas americanas (proteína por cup).",
            "Calcular capacidad de tazas cafeteras.",
            "Interpretar etiquetas de serving sizes importadas."
        ],
        "intro_hook": "**1 taza de cocina US = 237 mL** (8 fl oz). **1 taza métrica argentina = 250 mL**. Diferencia chica pero relevante en repostería.",
        "faqs_extra": [
            ("¿Cuánto es 1 cup en gramos?", "Depende del ingrediente. **Harina**: 1 cup ≈ 125 g (¡no 250 g, es volumen, no peso!). **Azúcar blanca**: 1 cup ≈ 200 g. **Arroz crudo**: 1 cup ≈ 185 g. **Manteca**: 1 cup = 227 g."),
            ("¿La taza de café es una 'cup' americana?", "Casi: una taza de café americana típica es 6 fl oz = 177 mL (la máquina americana). La 'cup' de cocina es 8 fl oz = 237 mL. Son distintas."),
            ("¿Qué es ¼ cup, ⅓ cup, ½ cup?", "Medidas fraccionarias habituales: **¼ cup = 59 mL**, **⅓ cup = 79 mL**, **½ cup = 118 mL**, **¾ cup = 177 mL**. Usan subdivisiones binarias y tercios por facilidad en la cocina.")
        ]
    },
    {
        "slug": "conversor-cucharadas-a-mililitros",
        "cat": "cocina", "icon": "🥄",
        "u1": ("cucharada", "cucharadas", "tbsp"), "u2": ("mililitro", "mililitros", "mL"),
        "factor": 14.787, "factor_str": "14.787 (US) / 15 (métrico) / 17.758 (UK)",
        "factor_origin": "1 tablespoon US = 1/2 fl oz US = 14.787 mL. Para simplicidad de cocina se redondea a 15 mL (estándar métrico en la UE y Argentina). Tablespoon australiana = 20 mL (excepcional).",
        "example_real": {
            "scenario": "Una receta pide 3 tablespoons de aceite. ¿Cuánto es en ml?",
            "steps": [
                "Valor: 3 tbsp US.",
                "Aplicar factor métrico: `3 × 15 = 45 mL`.",
                "Con factor US exacto: `3 × 14.787 = 44.36 mL`.",
                "Resultado: **45 mL (redondeo práctico)** = 3 cucharadas soperas."
            ],
            "result": "**3 tbsp = ~45 mL** (3 cucharadas soperas)."
        },
        "table_values": [1, 2, 3, 5, 10, 16],
        "use_cases": [
            "Convertir recetas blogueras americanas o europeas al sistema local.",
            "Preparar tragos y cócteles con recetas internacionales.",
            "Medir aceites o líquidos en cocina sin taza medidora.",
            "Traducir etiquetas de dosificación de productos.",
            "Preparar recetas de bebés o dietas específicas."
        ],
        "intro_hook": "**1 cucharada (tbsp) = 15 mL** (estándar métrico). **1 tbsp US = 14.787 mL** (exacto). La diferencia es despreciable en la cocina.",
        "faqs_extra": [
            ("¿Cuántas cucharadas tiene una cup?", "**16 tbsp = 1 cup US**. O sea: 1 tbsp = 1/16 de cup. Útil para 'escalar' recetas cuando no tenés taza medidora."),
            ("¿Cuántas cucharaditas tiene una cucharada?", "**3 tsp (cucharaditas) = 1 tbsp (cucharada)**. Proporción clave: cuando una receta dice '1 tsp' y no tenés cuchara chica, usá 1/3 de cucharada sopera."),
            ("¿La cucharada argentina es igual?", "Sí, en la práctica. La cucharada sopera estándar argentina son 15 mL (idéntica a la métrica internacional). Ligera diferencia de diseño pero equivalente funcionalmente.")
        ]
    },
    {
        "slug": "conversor-cucharaditas-a-mililitros",
        "cat": "cocina", "icon": "🥄",
        "u1": ("cucharadita", "cucharaditas", "tsp"), "u2": ("mililitro", "mililitros", "mL"),
        "factor": 4.929, "factor_str": "4.929 (US) / 5 (métrico)",
        "factor_origin": "1 teaspoon US = 1/6 fl oz US = 4.92892 mL. Para uso culinario se redondea a 5 mL (estándar métrico en Argentina y la mayoría de países).",
        "example_real": {
            "scenario": "Una receta americana pide 2 teaspoons de sal. ¿Cuánto es?",
            "steps": [
                "Valor: 2 tsp US.",
                "Aplicar factor métrico: `2 × 5 = 10 mL`.",
                "En peso de sal (densidad 1.2 g/mL): `10 × 1.2 = 12 g`.",
                "Resultado: **10 mL = ~12 g de sal fina**."
            ],
            "result": "**2 tsp de sal = 10 mL ≈ 12 g**."
        },
        "table_values": [1, 2, 3, 5, 10, 20],
        "use_cases": [
            "Convertir recetas americanas de pastelería (exigen precisión en tsp).",
            "Dosificar medicamentos para niños (jarabes en 5 mL).",
            "Medir especias y saborizantes.",
            "Traducir recetas de bar (amargos, bitters en dashes y tsp).",
            "Preparar mezclas caseras (mates, infusiones, fórmulas)."
        ],
        "intro_hook": "**1 cucharadita (tsp) = 5 mL** (métrico). **1 tsp US = 4.929 mL** exacto. Siempre 1/3 de cucharada sopera.",
        "faqs_extra": [
            ("¿Cuánto es medio tsp en ml?", "**½ tsp = 2.5 mL**. Porción chica para especias fuertes (pimentón, canela) o saborizantes concentrados."),
            ("¿Una cucharadita de azúcar cuántos gramos?", "Aproximadamente **4 g** (azúcar blanca tiene densidad ~0.85 g/mL: 5 mL × 0.85 = 4.25 g). Referencia para estimar calorías: 1 tsp azúcar ≈ 16 kcal."),
            ("¿Cuántas cucharaditas tiene una cucharada?", "**1 tbsp = 3 tsp**. Si no tenés cuchara sopera, 3 cucharaditas equivalen a 1 cucharada. Regla clave de cocina.")
        ]
    },
    {
        "slug": "conversor-pintas-a-litros",
        "cat": "matematica", "icon": "🍺",
        "u1": ("pinta", "pintas", "pt"), "u2": ("litro", "litros", "L"),
        "factor": 0.473176, "factor_str": "0.473176 (US) / 0.568261 (UK)",
        "factor_origin": "Pinta US = 1/8 galón US = 16 fl oz US = 473.176 mL. Pinta UK = 1/8 galón UK = 20 fl oz UK = 568.261 mL. La pinta británica es ~20% más grande (es la famosa 'pinta de cerveza' de los pubs).",
        "example_real": {
            "scenario": "En un pub londinense te sirven 1 pinta de cerveza. ¿Cuánto es?",
            "steps": [
                "Valor: 1 pinta UK.",
                "Aplicar factor: `1 × 0.568 = 0.568 L = 568 mL`.",
                "Resultado: **568 mL** (la pinta británica clásica)."
            ],
            "result": "**1 pinta UK = 568 mL** (pinta de pub)."
        },
        "table_values": [0.5, 1, 2, 4, 8, 10],
        "use_cases": [
            "Pedir bebidas en pubs británicos entendiendo la cantidad.",
            "Interpretar etiquetas de productos ingleses o americanos.",
            "Convertir recetas que usan pintas (smoothies, sopas anglosajonas).",
            "Calcular precio por litro de cerveza importada.",
            "Entender tamaños de envases de helado (pint ice cream = 473 mL)."
        ],
        "intro_hook": "**1 pinta UK = 568 mL**. **1 pinta US = 473 mL**. En un pub inglés la pinta es 20% más grande que la americana.",
        "faqs_extra": [
            ("¿Es una 'pinta' el vaso típico de cerveza?", "En UK sí: 'a pint of beer' es el servicio estándar de cerveza en pubs = 568 mL. En EE.UU., una pinta de cerveza de bar es 473 mL pero los 'pint glasses' en práctica son 16 fl oz que se llenan con espuma a 14-16 oz reales."),
            ("¿Cuánto es un 'half pint'?", "**½ pint UK = 284 mL** o **½ pint US = 237 mL**. Servicio chico de cerveza en pub, común para degustaciones o quien no toma mucho."),
            ("¿Un envase de helado de 1 pint?", "En EE.UU., el tamaño estándar de helado gourmet (Ben & Jerry's, Häagen-Dazs) es **1 pinta US = 473 mL**. En Argentina, equivale a un pote 'chico' o 'individual' de las marcas premium.")
        ]
    },
    {
        "slug": "conversor-cuartos-a-litros",
        "cat": "matematica", "icon": "🥛",
        "u1": ("cuarto", "cuartos", "qt"), "u2": ("litro", "litros", "L"),
        "factor": 0.946353, "factor_str": "0.946353 (US) / 1.13652 (UK)",
        "factor_origin": "Quart US = 1/4 galón US = 2 pintas US = 946.353 mL. Quart UK = 1/4 galón imperial = 2 pintas imperiales = 1136.52 mL. Quart significa literalmente 'un cuarto (de galón)'.",
        "example_real": {
            "scenario": "Una receta americana pide 3 quarts de caldo. ¿Cuántos litros?",
            "steps": [
                "Valor: 3 qt US.",
                "Aplicar factor: `3 × 0.9464 = 2.84 L`.",
                "Resultado: **~2.84 L de caldo** (casi 3 litros)."
            ],
            "result": "**3 quarts = 2.84 L**."
        },
        "table_values": [1, 2, 4, 8, 16],
        "use_cases": [
            "Convertir recetas americanas de sopas y caldos.",
            "Interpretar capacidades de ollas americanas.",
            "Traducir volumen de aceite de motor (motores americanos especifican qt).",
            "Calcular capacidades de jarras y envases.",
            "Entender dimensiones de contenedores térmicos (cooler sizes)."
        ],
        "intro_hook": "**1 quart US = 0.946 L** (casi 1 litro). **1 quart UK = 1.137 L**. Literalmente 'un cuarto' de galón.",
        "faqs_extra": [
            ("¿Cuántos litros son 4 quarts?", "**4 qt US = 3.785 L = 1 galón US**. Por definición, 4 quarts hacen un galón. Útil: si tenés un galón, es igual a 4 cuartos = 8 pintas = 128 fl oz."),
            ("¿Los quarts son iguales para líquidos y sólidos?", "NO. Hay 'liquid quart' (946 mL, el común) y 'dry quart' (1101 mL, para medir harina o cereales secos en EE.UU.). En la mayoría de recetas se usa el liquid quart salvo indicación contraria."),
            ("¿Cuánto aceite de motor lleva mi auto?", "Motores americanos suelen especificar en quarts. Un motor típico de sedán: **4-5 qt US = 3.8-4.7 L** de aceite. Mucho mejor consultar el manual, pero ese rango aplica en la mayoría.")
        ]
    },
    {
        "slug": "conversor-barriles-a-litros",
        "cat": "matematica", "icon": "🛢️",
        "u1": ("barril", "barriles", "bbl"), "u2": ("litro", "litros", "L"),
        "factor": 158.987, "factor_str": "158.987 (petróleo) / 117.348 (cerveza US) / 163.659 (cerveza UK)",
        "factor_origin": "Barril de petróleo (oil bbl) = 42 galones US = 158.987 L exactos (definido así desde 1872 por Pennsylvania oil producers). Barril de cerveza US = 31 gal US = 117.35 L. Barril UK = 36 gal UK = 163.66 L.",
        "example_real": {
            "scenario": "Una petrolera produce 100,000 barriles diarios. ¿Cuántos litros?",
            "steps": [
                "Valor: 100,000 bbl.",
                "Aplicar factor: `100,000 × 158.987 = 15,898,700 L`.",
                "Resultado: **~15.9 millones de litros diarios** (producción mediana)."
            ],
            "result": "**100,000 bbl/día = 15.9 millones de litros diarios**."
        },
        "table_values": [1, 10, 100, 1000, 100000, 1000000],
        "use_cases": [
            "Interpretar estadísticas de producción petrolera (OPEC, IEA).",
            "Convertir volúmenes de exportación/importación de combustibles.",
            "Entender capacidades de depósitos y refinerías.",
            "Calcular contenido de contenedores cisterna.",
            "Traducir cifras económicas del mercado energético."
        ],
        "intro_hook": "**1 barril de petróleo = 42 galones US = 159 L**. Definido en Pennsylvania en 1872 y jamás cambiado.",
        "faqs_extra": [
            ("¿Por qué 42 galones y no 40 o 50?", "Por accidente histórico: a fines del siglo XIX, Pennsylvania producía petróleo en barriles de madera reales de 42 galones (un tamaño usado previamente para whiskey y otros líquidos). Se estandarizó por consenso de la industria en 1872 y nunca cambió."),
            ("¿Todos los barriles miden lo mismo?", "**No**. Barril petrolero = 159 L (el más famoso). Barril de cerveza US = 117 L. Barril de vino antiguo (hogshead) = ~300 L. Si la fuente no especifica, asumí petróleo."),
            ("¿Cuánta nafta salen de un barril?", "De 1 bbl (159 L) de petróleo crudo salen aproximadamente **~72 L de nafta + 35 L de diésel + 20 L de jet fuel + resto (asfaltos, gas, petroquímicos)**. El rendimiento varía con el tipo de crudo y refinería.")
        ]
    },
    {
        "slug": "conversor-metros-cubicos-a-litros",
        "cat": "matematica", "icon": "📦",
        "u1": ("metro cúbico", "metros cúbicos", "m³"), "u2": ("litro", "litros", "L"),
        "factor": 1000.0, "factor_str": "1000",
        "factor_origin": "Definición del litro: 1 L = 1 dm³ = 10⁻³ m³. Inverso: 1 m³ = 1000 L exactos. Relación fundamental del SI.",
        "example_real": {
            "scenario": "Una pileta tiene 20 m³ de agua. ¿Cuántos litros?",
            "steps": [
                "Valor: 20 m³.",
                "Aplicar factor: `20 × 1000 = 20,000 L`.",
                "Resultado: **20,000 L** (pileta familiar típica de 4×5×1 m)."
            ],
            "result": "**20 m³ = 20,000 L**."
        },
        "table_values": [0.001, 0.1, 1, 5, 10, 50, 100, 1000],
        "use_cases": [
            "Calcular capacidad de piletas y tanques de agua.",
            "Interpretar facturas de gas (consumo en m³) y agua (m³).",
            "Convertir volumen de reservorios de agua o cisternas.",
            "Estimar capacidad de camiones cisterna (típicos: 30-40 m³).",
            "Calcular volumen de hormigón para construcción."
        ],
        "intro_hook": "**1 m³ = 1000 litros** exactos. Relación fundamental del sistema métrico decimal.",
        "faqs_extra": [
            ("¿Cuántos litros de gas consume mi casa por m³?", "**1 m³ de gas natural = 1000 L de gas**. Pero la factura expresa el consumo en m³; tu medidor marca el volumen. Un consumo residencial típico en invierno: 50-150 m³/mes."),
            ("¿Cómo calculo el volumen de una pileta en litros?", "Calculá el volumen en m³ (largo × ancho × profundidad, en metros) y multiplicá por 1000. Ejemplo pileta 4×3×1.5 m: `4×3×1.5 = 18 m³ = 18,000 L`."),
            ("¿Un m³ de agua cuántos kilos pesa?", "**1000 kg = 1 tonelada**. Porque 1 L de agua pesa 1 kg (a 4 °C exactamente, ligeramente menos a otras temperaturas). Por eso transportar agua es caro: un camión cisterna de 30 m³ lleva 30 toneladas de peso bruto.")
        ]
    },
    {
        "slug": "conversor-pies-cubicos-a-metros-cubicos",
        "cat": "matematica", "icon": "📦",
        "u1": ("pie cúbico", "pies cúbicos", "ft³"), "u2": ("metro cúbico", "metros cúbicos", "m³"),
        "factor": 0.0283168, "factor_str": "0.0283168",
        "factor_origin": "1 ft³ = (0.3048 m)³ = 0.0283168466... m³. Relación cúbica derivada del factor lineal pie-metro.",
        "example_real": {
            "scenario": "Una heladera americana tiene 20 cubic feet de capacidad. ¿Cuántos litros/m³?",
            "steps": [
                "Valor: 20 ft³.",
                "Aplicar factor: `20 × 0.02832 = 0.5663 m³ = 566 L`.",
                "Resultado: **566 L de capacidad** (heladera grande familiar)."
            ],
            "result": "**20 ft³ = 0.566 m³ = 566 L** (heladera grande)."
        },
        "table_values": [1, 10, 20, 50, 100, 1000],
        "use_cases": [
            "Interpretar capacidades de heladeras, freezers y hornos americanos.",
            "Convertir volúmenes de contenedores de carga (containers navales).",
            "Calcular capacidad de depósitos industriales especificados en ft³.",
            "Traducir consumo de gas natural en EE.UU. (MCF = 1000 ft³).",
            "Entender tamaños de mudanzas y camiones de transporte."
        ],
        "intro_hook": "**1 pie cúbico = 0.0283 m³ = 28.3 litros**. Unidad americana para capacidades volumétricas (heladeras, cargas, etc.).",
        "faqs_extra": [
            ("¿Cuántos litros tiene una heladera de 20 ft³?", "**20 ft³ = 566 L**. En Argentina, las heladeras grandes se anuncian como 500-600 L. Por eso una heladera 'grande' americana de 20 ft³ equivale a 'side-by-side' argentina."),
            ("¿Cuánto es MCF de gas?", "**1 MCF = 1000 ft³ = 28.32 m³**. Unidad usada en facturas de gas en EE.UU. En Argentina la factura se expresa en m³ directamente."),
            ("¿Cuánto mide un contenedor de 40 pies?", "Un contenedor 40' estándar tiene **~67 m³ de capacidad interna (2393 ft³)**. Por eso se usa para cargas voluminosas pero no excesivamente pesadas.")
        ]
    },

    # ===== ÁREA (8) =====
    {
        "slug": "conversor-hectareas-a-metros-cuadrados",
        "cat": "matematica", "icon": "🌾",
        "u1": ("hectárea", "hectáreas", "ha"), "u2": ("metro cuadrado", "metros cuadrados", "m²"),
        "factor": 10000.0, "factor_str": "10,000",
        "factor_origin": "Definición: 1 hectárea = cuadrado de 100 m × 100 m = 10,000 m². La hectárea es 10⁴ m², igual que 1 hectómetro² (aunque este nombre casi no se usa).",
        "example_real": {
            "scenario": "Una estancia tiene 500 hectáreas. ¿Cuántos m²?",
            "steps": [
                "Valor: 500 ha.",
                "Aplicar factor: `500 × 10,000 = 5,000,000 m²`.",
                "Resultado: **5 millones de m²** = 5 km² = ~50 cuadras × 100 cuadras."
            ],
            "result": "**500 ha = 5,000,000 m² = 5 km²**."
        },
        "table_values": [0.01, 0.1, 1, 10, 100, 1000],
        "use_cases": [
            "Calcular superficie de campos y estancias.",
            "Interpretar precios de tierra rural (USD/ha).",
            "Convertir parcelas agrícolas a m².",
            "Entender tamaño de parques y áreas naturales protegidas.",
            "Calcular superficies de plantaciones y viñedos."
        ],
        "intro_hook": "**1 hectárea = 10,000 m²** (un cuadrado de 100×100 m). Unidad estándar en agricultura y bienes raíces rurales.",
        "faqs_extra": [
            ("¿Cuántas 'canchas de fútbol' hay en 1 hectárea?", "Aproximadamente **1.4 canchas**: una cancha de fútbol profesional mide ~7140 m² (105 × 68 m), así que 1 ha = 10,000 m² = 1.4 canchas."),
            ("¿1 ha es igual a 1 manzana?", "Depende del país. En Argentina, 1 manzana ≈ 1 ha (las manzanas urbanas son rectangulares pero el campo se medía así). En Uruguay y otros LatAm puede variar 0.7-1.0 ha por 'manzana'."),
            ("¿Cuánto vale 1 ha en zona núcleo pampeana?", "Precio 2025: **USD 14,000-17,000/ha** en zona núcleo (Pergamino, Junín). Muy variable según productividad: soja sojera de primera, vs campos ganaderos marginales (USD 3000-5000/ha).")
        ]
    },
    {
        "slug": "conversor-acres-a-hectareas",
        "cat": "matematica", "icon": "🌾",
        "u1": ("acre", "acres", "ac"), "u2": ("hectárea", "hectáreas", "ha"),
        "factor": 0.404686, "factor_str": "0.404686",
        "factor_origin": "1 acre = 4046.8564224 m² = 0.40468564... hectáreas. Originalmente el acre era 'la superficie que un buey podía arar en un día' (~66 × 660 pies = 1 furlong × 1 chain).",
        "example_real": {
            "scenario": "Un rancho americano tiene 1000 acres. ¿Cuántas hectáreas?",
            "steps": [
                "Valor: 1000 ac.",
                "Aplicar factor: `1000 × 0.4047 = 404.7 ha`.",
                "Resultado: **404.7 ha** (rancho mediano argentino)."
            ],
            "result": "**1000 acres = 404.7 hectáreas**."
        },
        "table_values": [1, 10, 100, 1000, 10000],
        "use_cases": [
            "Convertir superficies de ranchos o farms americanos a métrico.",
            "Interpretar precios de tierra en USD/acre vs USD/ha.",
            "Traducir tamaños de parques nacionales americanos.",
            "Comparar tamaños de estancias entre países con distintos sistemas.",
            "Entender reportes de deforestación y uso de tierra."
        ],
        "intro_hook": "**1 acre = 0.4047 ha** (aproximadamente 4047 m²). Unidad americana-británica para medir tierra.",
        "faqs_extra": [
            ("¿Cuántos acres tiene 1 ha?", "**1 ha = 2.471 acres**. Dato clave: los precios de tierra americanos en USD/acre se multiplican por 2.47 para obtener USD/ha. Ejemplo: USD 5000/acre = USD 12,350/ha."),
            ("¿Cuánto mide un acre en un mapa?", "**1 acre = 4046.86 m² ≈ 64 × 64 m** (aproximadamente). Originalmente fue 1 furlong × 1 chain (660 × 66 pies)."),
            ("¿Cuántas canchas de fútbol tiene un acre?", "**~0.57 canchas**: un acre (4047 m²) es menos que una cancha estándar (7140 m²). Útil para visualizar áreas chicas.")
        ]
    },
    {
        "slug": "conversor-metros-cuadrados-a-pies-cuadrados",
        "cat": "matematica", "icon": "📐",
        "u1": ("metro cuadrado", "metros cuadrados", "m²"), "u2": ("pie cuadrado", "pies cuadrados", "ft²"),
        "factor": 10.7639, "factor_str": "10.7639",
        "factor_origin": "1 m² = (1 m / 0.3048 m/ft)² = 10.7639104... ft². Derivado del factor lineal m→ft al cuadrado.",
        "example_real": {
            "scenario": "Una propiedad argentina de 80 m² se publica en un portal americano. ¿Cuántos ft²?",
            "steps": [
                "Valor: 80 m².",
                "Aplicar factor: `80 × 10.7639 = 861 ft²`.",
                "Resultado: **861 ft²** (se redondea a 860 ft²)."
            ],
            "result": "**80 m² = 861 ft²** (departamento de 2 dormitorios)."
        },
        "table_values": [10, 25, 50, 80, 100, 200, 500],
        "use_cases": [
            "Publicar avisos inmobiliarios en Zillow, Realtor.com o similares.",
            "Traducir especificaciones de construcción para clientes americanos.",
            "Entender dimensiones de oficinas y locales comerciales anglos.",
            "Convertir superficie de terrenos para transacciones binacionales.",
            "Comparar tamaños de viviendas entre Argentina y EE.UU."
        ],
        "intro_hook": "**1 m² = 10.7639 ft²**. En EE.UU. las superficies de viviendas se miden en pies² ('square footage').",
        "faqs_extra": [
            ("¿Cuántos pies² tiene una casa de 120 m²?", "**120 m² = 1292 ft²**. En EE.UU. es una casa pequeña-mediana (promedio americano: 2400 ft² = 223 m²)."),
            ("¿Qué es 'square footage' en un aviso de EE.UU.?", "Es la superficie total cubierta de una vivienda en pies². Convertirla a m²: dividí por 10.76. Ejemplo: 1800 ft² = 167 m²."),
            ("¿La conversión es lineal o cuadrática?", "**Cuadrática**. El factor lineal es 3.28 (m→ft) pero al cuadrado es 10.76 (m²→ft²). Muchos se equivocan multiplicando por 3.28 — el error cuadrático es grave.")
        ]
    },
    {
        "slug": "conversor-pies-cuadrados-a-metros-cuadrados",
        "cat": "matematica", "icon": "📐",
        "u1": ("pie cuadrado", "pies cuadrados", "ft²"), "u2": ("metro cuadrado", "metros cuadrados", "m²"),
        "factor": 0.092903, "factor_str": "0.092903",
        "factor_origin": "1 ft² = (0.3048 m)² = 0.09290304 m². Inverso exacto de 10.7639 ft²/m².",
        "example_real": {
            "scenario": "Una casa americana se anuncia como 2000 ft². ¿Cuántos m²?",
            "steps": [
                "Valor: 2000 ft².",
                "Aplicar factor: `2000 × 0.0929 = 185.8 m²`.",
                "Resultado: **185.8 m²**, casa mediana americana."
            ],
            "result": "**2000 ft² = 186 m²**."
        },
        "table_values": [100, 500, 1000, 2000, 5000, 10000],
        "use_cases": [
            "Interpretar avisos inmobiliarios estadounidenses.",
            "Convertir superficie de oficinas para contratos binacionales.",
            "Entender layouts de tiendas y centros comerciales americanos.",
            "Calcular superficies de terrenos publicados en ft².",
            "Comparar tamaños de casas al buscar propiedades en EE.UU."
        ],
        "intro_hook": "**1 pie² = 0.0929 m²**. Dividí pies² por 10.76 para obtener m² aproximados.",
        "faqs_extra": [
            ("¿Cuántos m² tiene 1000 ft²?", "**1000 ft² = 92.9 m²**. Casa pequeña americana o departamento grande."),
            ("¿Cuánto mide un departamento americano 'small' de 500 ft²?", "**500 ft² = 46.5 m²**. Estudio o monoambiente típico en NYC o SF. En Argentina sería un 'monoambiente' de 45-50 m² cubierto."),
            ("¿Cómo convertir mentalmente?", "Dividí los pies² por 10. Ejemplo: 1000 ft² / 10 = 100 m² (valor real: 92.9 m², error 7%). Para precisión mayor: dividí por 10.76.")
        ]
    },
    {
        "slug": "conversor-kilometros-cuadrados-a-millas-cuadradas",
        "cat": "matematica", "icon": "🗺️",
        "u1": ("kilómetro cuadrado", "kilómetros cuadrados", "km²"), "u2": ("milla cuadrada", "millas cuadradas", "mi²"),
        "factor": 0.386102, "factor_str": "0.386102",
        "factor_origin": "1 km² = (1 / 1.609344)² = 0.386102159... mi². Inverso: 1 mi² = 2.58999 km².",
        "example_real": {
            "scenario": "La provincia de Buenos Aires tiene 307,571 km². ¿Cuántas millas cuadradas?",
            "steps": [
                "Valor: 307,571 km².",
                "Aplicar factor: `307,571 × 0.3861 = 118,753 mi²`.",
                "Resultado: **118,753 mi²** (más grande que Arizona, similar a Polonia)."
            ],
            "result": "**Prov. Buenos Aires = 307,571 km² = 118,753 mi²**."
        },
        "table_values": [1, 10, 100, 1000, 10000, 100000],
        "use_cases": [
            "Comparar tamaño de países con estadísticas americanas.",
            "Traducir superficies de parques nacionales.",
            "Interpretar datos geográficos en publicaciones inglesas.",
            "Estimar áreas cubiertas por tormentas o desastres naturales.",
            "Convertir resultados de censos territoriales."
        ],
        "intro_hook": "**1 km² = 0.386 mi²**. Un km² es aproximadamente 40% de una milla cuadrada.",
        "faqs_extra": [
            ("¿Cuánto es 1 milla² en km²?", "**1 mi² = 2.59 km²**. Por eso Argentina (2.78 millones de km²) equivale a 1.07 millones de mi², mientras EE.UU. (9.83 millones de km² incluye Alaska) = 3.8 millones de mi²."),
            ("¿Cuántas hectáreas tiene una mi²?", "**1 mi² = 259 ha = 2,589,988 m²**. Por eso una 'section' de terreno americana (640 acres = 1 mi²) equivale a ~259 ha."),
            ("¿Qué es una 'section' americana?", "Una 'section' es una unidad estándar de la topografía pública de EE.UU.: **1 sección = 1 mi² = 640 acres = 259 ha**. Los estados del oeste se dividieron en secciones para colonización y venta.")
        ]
    },
    {
        "slug": "conversor-manzanas-a-hectareas",
        "cat": "matematica", "icon": "🌾",
        "u1": ("manzana", "manzanas", "mz"), "u2": ("hectárea", "hectáreas", "ha"),
        "factor": 0.7, "factor_str": "0.7 (Argentina) / 0.6987 (Uruguay/Arg histórica)",
        "factor_origin": "En Argentina y Uruguay, la 'manzana' como unidad de superficie rural tradicional = 10,000 varas² (cuadrado de 100 varas × 100 varas). Con vara argentina de 0.866 m: 1 manzana = (100 × 0.866)² = 7499.56 m² ≈ 0.75 ha. Algunas fuentes usan 0.7 ha como estándar redondeado.",
        "example_real": {
            "scenario": "En una escritura paraguaya dice 'lote de 8 manzanas'. ¿Cuántas hectáreas?",
            "steps": [
                "Valor: 8 manzanas.",
                "Aplicar factor Paraguay (0.8658 ha/mz): `8 × 0.8658 = 6.93 ha`.",
                "Con factor Argentina (0.75): `8 × 0.75 = 6 ha`.",
                "Resultado: **~6 a 7 ha** (según país, verificar)."
            ],
            "result": "**8 manzanas ≈ 6-7 ha** (varía por país)."
        },
        "table_values": [1, 5, 10, 50, 100, 500],
        "use_cases": [
            "Interpretar escrituras rurales antiguas en Argentina, Uruguay y Paraguay.",
            "Traducir mensuras coloniales a sistema métrico moderno.",
            "Entender avisos de compra-venta de chacras y campos pequeños.",
            "Convertir superficies de cultivos tradicionales (yerbatales, cañaverales).",
            "Comparar dimensiones entre propiedades históricas y modernas."
        ],
        "intro_hook": "**1 manzana ≈ 0.75 ha** (Argentina rural) o **0.8658 ha** (Paraguay). Unidad rural tradicional con variaciones por país.",
        "faqs_extra": [
            ("¿La manzana rural es distinta de la manzana urbana?", "Sí. La **manzana urbana** (cuadra de ciudad) en Argentina mide ~100×100 m = 1 ha. La **manzana rural** histórica = 10,000 varas² = 7500 m² (con varas argentinas de 0.866 m). En escrituras urbanas, asumí 10,000 m²; en rurales, verificá el país."),
            ("¿Cuánto mide una manzana en Uruguay?", "**1 manzana uruguaya = 10,000 varas² con vara de 86 cm = 7396 m² ≈ 0.74 ha**. Casi idéntica a la argentina. Se usa en campos y estancias pequeñas del interior uruguayo."),
            ("¿Y en Centroamérica?", "La **manzana centroamericana** (Nicaragua, Honduras, Guatemala) = 10,000 varas² con vara de 0.84 m ≈ 0.7 ha. Ligeramente más chica que la rioplatense. Usada en zonas cafetaleras y tabacaleras.")
        ]
    },
    {
        "slug": "conversor-pulgadas-cuadradas-a-centimetros-cuadrados",
        "cat": "matematica", "icon": "📐",
        "u1": ("pulgada cuadrada", "pulgadas cuadradas", "in²"), "u2": ("centímetro cuadrado", "centímetros cuadrados", "cm²"),
        "factor": 6.4516, "factor_str": "6.4516",
        "factor_origin": "1 in² = (2.54 cm)² = 6.4516 cm² exactos. Derivado del factor lineal pulgada-cm al cuadrado.",
        "example_real": {
            "scenario": "Una cámara de celular tiene un sensor de 1 pulgada² (tipo 1\"). ¿Cuánto en cm²?",
            "steps": [
                "Valor: 1 in².",
                "Aplicar factor: `1 × 6.4516 = 6.45 cm²`.",
                "Resultado: **6.45 cm² de sensor** (clasificación tipo 1\" de cámaras)."
            ],
            "result": "**1 in² = 6.4516 cm²** (sensor 'tipo 1\"')."
        },
        "table_values": [1, 4, 16, 64, 144, 1000],
        "use_cases": [
            "Interpretar tamaño de sensores de cámaras fotográficas.",
            "Convertir especificaciones de placas de PCB electrónicas.",
            "Traducir dimensiones de componentes importados.",
            "Calcular superficie de tornillos, juntas y sellos.",
            "Comparar formatos de pantallas y displays."
        ],
        "intro_hook": "**1 pulgada² = 6.4516 cm²** exactos. Unidad para superficies pequeñas de electrónica y óptica.",
        "faqs_extra": [
            ("¿Cuánto mide un sensor 'tipo 1 pulgada'?", "En cámaras, un sensor 'tipo 1\"' no mide realmente 1 in². Por convención heredada de tubos de vídeo, un **sensor tipo 1\"** mide ~13.2 × 8.8 mm = 116 mm² = 1.16 cm². La diferencia con 1 in² real (6.45 cm²) es por la convención histórica."),
            ("¿Cuántas pulgadas² tiene una página A4?", "A4 = 21 × 29.7 cm = 623.7 cm² = **96.7 in²**. Una hoja carta US Letter (8.5\" × 11\" = 93.5 in²) es ligeramente más chica."),
            ("¿Y una pantalla de 6 pulgadas?", "'6 pulgadas' es la diagonal, no la superficie. Una pantalla de 6\" con relación 19.5:9 mide ~13.5 × 6.2 cm = 83.7 cm² = **13 in²**.")
        ]
    },
    {
        "slug": "conversor-acres-a-metros-cuadrados",
        "cat": "matematica", "icon": "🌾",
        "u1": ("acre", "acres", "ac"), "u2": ("metro cuadrado", "metros cuadrados", "m²"),
        "factor": 4046.86, "factor_str": "4046.8564",
        "factor_origin": "1 acre = 43,560 ft² = 43,560 × 0.0929 m² = 4046.8564224 m² exactos. Históricamente: 1 furlong × 1 chain = 660 ft × 66 ft.",
        "example_real": {
            "scenario": "Un rancho californiano de 50 acres. ¿Cuántos m²?",
            "steps": [
                "Valor: 50 ac.",
                "Aplicar factor: `50 × 4046.86 = 202,343 m² = 20.23 ha`.",
                "Resultado: **20.23 ha** (campo chico en Argentina)."
            ],
            "result": "**50 acres = 202,343 m² = 20.2 ha**."
        },
        "table_values": [1, 5, 10, 50, 100, 1000],
        "use_cases": [
            "Convertir superficies exactas de propiedades americanas a m².",
            "Calcular metros² de terrenos anunciados en acres.",
            "Interpretar avisos de farms o ranches en EE.UU./UK.",
            "Traducir superficie de parques nacionales americanos.",
            "Entender capacidad agrícola de tierras en publicaciones inglesas."
        ],
        "intro_hook": "**1 acre = 4046.86 m²** (aproximadamente 64×64 m). Dividí por 10,000 para obtener hectáreas.",
        "faqs_extra": [
            ("¿Cuánto es 1 acre en m² redondeado?", "**4047 m²** (aprox). Es una superficie entre 63 × 64 m y 64 × 65 m. Sirve para visualizar: un acre cabría holgadamente en una manzana argentina típica (10,000 m²)."),
            ("¿Cuántos m² hay en 100 acres?", "**100 acres = 404,686 m² = 40.47 ha**. Tierra mediana en EE.UU.; en Argentina sería un campo chico."),
            ("¿Cuántos acres tiene una cancha de fútbol?", "Cancha profesional (105×68 m) = 7140 m² = **1.76 acres**. Por eso los campos americanos suelen medir de 1.5 a 1.9 acres.")
        ]
    },

    # ===== VELOCIDAD (6) =====
    {
        "slug": "conversor-kmh-a-mph",
        "cat": "matematica", "icon": "🚗",
        "u1": ("kilómetro por hora", "kilómetros por hora", "km/h"), "u2": ("milla por hora", "millas por hora", "mph"),
        "factor": 0.621371, "factor_str": "0.621371",
        "factor_origin": "Factor derivado de km→mi: 1 km/h = 1 × 0.621371 mi/h. Se aplica igual que la conversión de distancias.",
        "example_real": {
            "scenario": "En Argentina manejás a 120 km/h por autopista. ¿Cuánto es en mph?",
            "steps": [
                "Valor: 120 km/h.",
                "Aplicar factor: `120 × 0.6214 = 74.56 mph`.",
                "Resultado: **74.56 mph** (en EE.UU. se redondea a 75 mph, común en interestatales)."
            ],
            "result": "**120 km/h = 74.6 mph**."
        },
        "table_values": [30, 60, 80, 100, 120, 160, 200],
        "use_cases": [
            "Convertir velocidades cuando manejás en EE.UU. o Canadá.",
            "Entender velocímetros americanos con marca doble.",
            "Interpretar noticias de deportes motor americanas.",
            "Calcular récords de velocidad en tests de autos.",
            "Traducir velocidad máxima de bicis o motos importadas."
        ],
        "intro_hook": "**1 km/h = 0.6214 mph**. Para manejar en EE.UU.: 60 km/h ≈ 37 mph, 100 km/h ≈ 62 mph.",
        "faqs_extra": [
            ("¿Cuánto es 60 mph en km/h?", "**60 mph = 96.56 km/h** (casi 100). 60 mph es el límite típico en highways americanas; equivale a 'casi autopista argentina' (100-130 km/h)."),
            ("¿Cuántas mph son 100 km/h?", "**100 km/h = 62.14 mph**. Por eso los velocímetros argentinos marcan '100' como referencia principal, similares a 60 mph en EE.UU."),
            ("¿Cómo convertir mentalmente km/h a mph?", "Multiplicá por 0.6 o dividí por 1.6. Ejemplo: 80 km/h × 0.6 = 48 mph (valor real: 49.71). Para velocidades de ruta, el error es aceptable.")
        ]
    },
    {
        "slug": "conversor-mph-a-kmh",
        "cat": "matematica", "icon": "🚗",
        "u1": ("milla por hora", "millas por hora", "mph"), "u2": ("kilómetro por hora", "kilómetros por hora", "km/h"),
        "factor": 1.609344, "factor_str": "1.609344",
        "factor_origin": "Factor derivado de mi→km: 1 mph = 1 × 1.609344 km/h (mismo factor que la distancia).",
        "example_real": {
            "scenario": "En una película americana, un auto corre a 75 mph. ¿Cuánto es en km/h?",
            "steps": [
                "Valor: 75 mph.",
                "Aplicar factor: `75 × 1.6093 = 120.7 km/h`.",
                "Resultado: **120.7 km/h** (velocidad rápida de highway americana)."
            ],
            "result": "**75 mph = 120.7 km/h**."
        },
        "table_values": [20, 30, 55, 65, 75, 100, 150],
        "use_cases": [
            "Entender velocidades reportadas en películas, series y noticias americanas.",
            "Interpretar velocímetros de autos importados de EE.UU.",
            "Convertir datos de carreras (NASCAR, Indy) a kmh.",
            "Comparar velocidades de aviones y helicópteros.",
            "Traducir récords deportivos del atletismo americano."
        ],
        "intro_hook": "**1 mph = 1.6093 km/h**. Regla rápida: 60 mph ≈ 96 km/h, 100 mph = 161 km/h.",
        "faqs_extra": [
            ("¿A cuánto anda un auto a 60 mph?", "**60 mph = 96.56 km/h**. Límite típico americano (highways no-interstate). Equivale a ruta argentina rápida."),
            ("¿Y 100 mph?", "**100 mph = 160.93 km/h**. Velocidad considerada 'muy rápida' en cualquier país. En Argentina, está claramente por sobre el límite legal (130 km/h en autopistas)."),
            ("¿Cuánto anda un Tesla en modo 'ludicrous'?", "Un Tesla Model S Plaid alcanza **~200 mph = 322 km/h**. En EE.UU., las velocidades máximas se citan siempre en mph.")
        ]
    },
    {
        "slug": "conversor-nudos-a-kmh",
        "cat": "matematica", "icon": "💨",
        "u1": ("nudo", "nudos", "kn"), "u2": ("kilómetro por hora", "kilómetros por hora", "km/h"),
        "factor": 1.852, "factor_str": "1.852",
        "factor_origin": "1 nudo = 1 milla náutica por hora = 1.852 km/h exactos (por definición de milla náutica desde 1929).",
        "example_real": {
            "scenario": "En un pronóstico marítimo dicen que el viento sopla a 20 nudos. ¿Cuánto en km/h?",
            "steps": [
                "Valor: 20 kn.",
                "Aplicar factor: `20 × 1.852 = 37.04 km/h`.",
                "Resultado: **37 km/h** (viento fuerte, escala Beaufort 5 = 'brisa fresca')."
            ],
            "result": "**20 nudos = 37 km/h** (brisa fresca)."
        },
        "table_values": [5, 10, 20, 30, 50, 100, 500],
        "use_cases": [
            "Interpretar pronósticos meteorológicos marítimos.",
            "Entender velocidad de barcos y yates.",
            "Calcular velocidad de vientos en aviación.",
            "Leer informes de huracanes y tormentas tropicales.",
            "Convertir velocidades reportadas en boletines navales."
        ],
        "intro_hook": "**1 nudo = 1.852 km/h** exactos (1 milla náutica/hora). Unidad universal en navegación marítima y aérea.",
        "faqs_extra": [
            ("¿Por qué se llaman 'nudos'?", "En el siglo XVII se medía velocidad lanzando al agua un cabo con nudos espaciados cada 47 pies 3 pulgadas. Durante 28 segundos se contaban cuántos nudos pasaban por la mano. Literalmente: 'nudos por unidad de tiempo' = velocidad."),
            ("¿Cuánto anda un avión comercial en nudos?", "Un Boeing 737 en crucero navega a **~460 nudos ≈ 850 km/h**. Los controladores de aire siempre usan nudos."),
            ("¿A cuánto equivalen vientos de huracán?", "**Categoría 1**: 74-95 mph = 64-82 kn = 119-153 km/h. **Categoría 5**: >157 mph = >137 kn = >252 km/h. Las categorías Saffir-Simpson usan mph/kn como unidades oficiales.")
        ]
    },
    {
        "slug": "conversor-ms-a-kmh",
        "cat": "matematica", "icon": "🏃",
        "u1": ("metro por segundo", "metros por segundo", "m/s"), "u2": ("kilómetro por hora", "kilómetros por hora", "km/h"),
        "factor": 3.6, "factor_str": "3.6",
        "factor_origin": "Factor exacto: 1 m/s × (3600 s/h) / (1000 m/km) = 3.6 km/h. Relación fundamental del SI.",
        "example_real": {
            "scenario": "Usain Bolt corrió los 100 m a una velocidad promedio de 10.44 m/s. ¿Cuánto en km/h?",
            "steps": [
                "Valor: 10.44 m/s.",
                "Aplicar factor: `10.44 × 3.6 = 37.58 km/h`.",
                "Resultado: **37.58 km/h**. Velocidad máxima registrada: 44.72 km/h (12.42 m/s)."
            ],
            "result": "**10.44 m/s = 37.58 km/h** (Bolt 100 m average)."
        },
        "table_values": [1, 5, 10, 20, 50, 100, 343],
        "use_cases": [
            "Convertir velocidad de atletas al ritmo 'automovilístico'.",
            "Interpretar ráfagas de viento reportadas en m/s.",
            "Traducir velocidades de impacto en estudios de física.",
            "Analizar datos de Strava o similares (ritmo de running).",
            "Convertir velocidades de caída libre y proyectiles."
        ],
        "intro_hook": "**1 m/s = 3.6 km/h** exactos. Para pasar: multiplicá por 3.6. Regla mental: duplicá y agregá el 80%.",
        "faqs_extra": [
            ("¿Cuánto es la velocidad del sonido en km/h?", "**340 m/s (aire a 20 °C) = 1224 km/h**. Un avión a Mach 1 supera esta velocidad. La velocidad del sonido varía ligeramente con temperatura y altitud."),
            ("¿Cuánto corre un humano promedio en m/s?", "Trote suave: ~3 m/s = 10.8 km/h. Carrera rápida: 5-7 m/s = 18-25 km/h. Sprint al 100%: 8-11 m/s = 29-40 km/h (solo atletas profesionales)."),
            ("¿Cuánto es 100 km/h en m/s?", "**100 km/h = 27.78 m/s**. Si un auto a 100 km/h frena, tarda ~3 segundos en detenerse en seco (deceleración ~9 m/s²).")
        ]
    },
    {
        "slug": "conversor-kmh-a-ms",
        "cat": "matematica", "icon": "🏃",
        "u1": ("kilómetro por hora", "kilómetros por hora", "km/h"), "u2": ("metro por segundo", "metros por segundo", "m/s"),
        "factor": 0.277778, "factor_str": "0.277778 (1/3.6)",
        "factor_origin": "Inverso: 1 km/h = 1000 m / 3600 s = 0.27777... m/s. Factor inverso de 3.6.",
        "example_real": {
            "scenario": "Un auto a 72 km/h. ¿Cuánto es en m/s?",
            "steps": [
                "Valor: 72 km/h.",
                "Aplicar factor: `72 / 3.6 = 20 m/s`.",
                "Resultado: **20 m/s**. En 1 segundo el auto avanza 20 metros (≈ 4 autos de largo)."
            ],
            "result": "**72 km/h = 20 m/s**."
        },
        "table_values": [10, 30, 60, 100, 120, 200, 300],
        "use_cases": [
            "Cálculos físicos (cinemática, aceleración) donde hay que usar m/s.",
            "Interpretar velocidades de impacto para análisis de choques.",
            "Calcular distancia de frenado de vehículos.",
            "Convertir velocidad de ondas (sonido, ultrasonido) para cálculos.",
            "Analizar datos de GPS y velocímetros en formato estándar SI."
        ],
        "intro_hook": "**1 km/h = 0.2778 m/s** (o 1/3.6). Dividí km/h por 3.6 para obtener m/s.",
        "faqs_extra": [
            ("¿A qué velocidad en m/s se mueve un auto a 60 km/h?", "**60 km/h / 3.6 = 16.67 m/s**. En 1 segundo el auto avanza ~17 metros. Para frenar en seco necesita al menos 2 segundos (>33 m de distancia)."),
            ("¿Y un avión comercial a 900 km/h?", "**900 km/h / 3.6 = 250 m/s**. Velocidad de crucero típica. Recorre un estadio de fútbol (~105 m) en menos de medio segundo."),
            ("¿Es igual 'velocidad' en Argentina y en Europa?", "Si usan km/h, sí. Si es m/s (más técnico), también (es unidad SI). En EE.UU. usan mph; no es SI y complica cálculos físicos.")
        ]
    },
    {
        "slug": "conversor-mach-a-kmh",
        "cat": "ciencia", "icon": "✈️",
        "u1": ("Mach", "Mach", "M"), "u2": ("kilómetro por hora", "kilómetros por hora", "km/h"),
        "factor": 1234.8, "factor_str": "1234.8 (nivel del mar, 15 °C)",
        "factor_origin": "Mach 1 = velocidad del sonido, que varía con la temperatura. A nivel del mar (15 °C): ~343 m/s = 1234.8 km/h. A altitud de crucero (10,000 m, -50 °C): ~295 m/s = 1062 km/h. Estándar aeronáutico: nivel del mar.",
        "example_real": {
            "scenario": "Un caza Sukhoi Su-35 vuela a Mach 2.25 en picada. ¿Cuánto es en km/h?",
            "steps": [
                "Valor: Mach 2.25.",
                "Aplicar factor (nivel del mar): `2.25 × 1234.8 = 2778 km/h`.",
                "En altitud (10,000 m): `2.25 × 1062 = 2389 km/h`.",
                "Resultado: **2390-2780 km/h** según altitud."
            ],
            "result": "**Mach 2.25 = 2390-2780 km/h** (según altitud)."
        },
        "table_values": [0.5, 0.85, 1, 2, 3, 5, 10],
        "use_cases": [
            "Convertir velocidad de aviones militares (cazas, bombarderos).",
            "Interpretar pruebas de nuevos aviones supersónicos.",
            "Entender clasificaciones de velocidad hipersónica (Mach 5+).",
            "Calcular tiempo de llegada de proyectiles balísticos.",
            "Traducir datos de físicos y aerodinámicos."
        ],
        "intro_hook": "**Mach 1 = velocidad del sonido ≈ 1235 km/h a nivel del mar**. Mach 2 = el doble = 2469 km/h.",
        "faqs_extra": [
            ("¿Qué significa 'romper la barrera del sonido'?", "Superar Mach 1 (~343 m/s al nivel del mar). Produce una onda de choque audible (el 'sonic boom'). Primer vuelo supersónico tripulado: Chuck Yeager, 14 octubre 1947 (Mach 1.06)."),
            ("¿Cuál es el avión más rápido?", "El **SR-71 Blackbird** voló a Mach 3.3 (~3529 km/h) como avión tripulado. El **X-15** alcanzó Mach 6.7 (~7274 km/h) pero fue experimental. El **X-43 no tripulado** llegó a Mach 9.6 (~11,265 km/h)."),
            ("¿El Concorde era supersónico?", "Sí: **Mach 2.04 (2180 km/h)** en crucero. Volaba BA-NY en ~3.5 horas (vs 8 horas de un comercial actual). Retirado en 2003 por seguridad y costos.")
        ]
    },
]
