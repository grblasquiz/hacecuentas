"""Batch 100 conversores - PARTE 4: Cocina, Construcción, Talles (10 calcs)."""

LINEAR_P4 = [
    # ===== COCINA (3) =====
    {
        "slug": "conversor-libras-a-gramos",
        "cat": "cocina", "icon": "⚖️",
        "u1": ("libra", "libras", "lb"), "u2": ("gramo", "gramos", "g"),
        "factor": 453.592, "factor_str": "453.592",
        "factor_origin": "Por definición: 1 libra avoirdupois = 0.45359237 kg = 453.59237 gramos exactos.",
        "example_real": {
            "scenario": "Una receta americana pide 1.5 libras de carne molida. ¿Cuántos gramos?",
            "steps": [
                "Valor: 1.5 lb.",
                "Aplicar factor: `1.5 × 453.592 = 680.39 g`.",
                "Resultado: **~680 g de carne** (redondear a 700 g en la carnicería)."
            ],
            "result": "**1.5 lb = 680 g de carne**."
        },
        "table_values": [0.1, 0.25, 0.5, 1, 2, 5, 10],
        "use_cases": [
            "Convertir recetas americanas con cantidades en libras a gramos.",
            "Comprar ingredientes según recetas de cocineros americanos.",
            "Escalar recetas de panadería americanas.",
            "Interpretar pesos de productos importados.",
            "Traducir porciones de proteína en dietas americanas."
        ],
        "intro_hook": "**1 libra = 453.59 gramos**. Conversión clave para recetas americanas y productos importados vendidos por libra.",
        "faqs_extra": [
            ("¿Cuántos gramos son 2 libras?", "**2 lb = 907.18 g** (casi 1 kg exacto). Regla mental rápida: 1 lb ≈ 454 g, entonces 2 lb ≈ 908 g."),
            ("¿Y media libra?", "**½ lb = 226.8 g**. Porción típica de hamburguesa 'half-pounder', filete de pescado o paquete de queso crema estándar americano."),
            ("¿Cómo convertir mentalmente libras a gramos?", "Multiplicá por 450 (aproximación rápida). Ejemplo: 3 lb × 450 = 1350 g (valor real: 1360.8 g). Error <1%. Para precisión: × 454.")
        ]
    },
    {
        "slug": "conversor-fahrenheit-a-celsius-horno",
        "cat": "cocina", "icon": "🍳",
        "u1": ("grado Fahrenheit", "grados Fahrenheit", "°F"), "u2": ("grado Celsius", "grados Celsius", "°C"),
        "is_temp": True,
        "temp_formula": "(°F - 32) × 5/9",
        "temp_inverse": "(°C × 9/5) + 32",
        "factor": 0.5556, "offset": -17.778, "factor_str": "(°F - 32) × 5/9",
        "factor_origin": "Las recetas americanas usan Fahrenheit. Conversión estándar con referencia a niveles de horno: 325°F = 163°C (moderate), 350°F = 177°C (standard), 375°F = 191°C (moderately hot), 400°F = 204°C (hot), 450°F = 232°C (very hot).",
        "example_real": {
            "scenario": "Una receta de cookies americanas dice 'bake at 375°F for 12 minutes'. ¿A cuántos °C?",
            "steps": [
                "Valor: 375°F.",
                "Fórmula: `°C = (°F - 32) × 5/9 = (375 - 32) × 5/9 = 343 × 5/9 = 190.6°C`.",
                "Resultado: **190°C** (redondeo práctico). En horno argentino: 'moderado-caliente', marca 7 de 10."
            ],
            "result": "**375°F = 190°C** (horno moderado-caliente)."
        },
        "table_values": [250, 300, 325, 350, 375, 400, 425, 450, 500],
        "use_cases": [
            "Seguir recetas americanas de panes, galletas, muffins y tortas.",
            "Convertir recetas de asados americanos (low & slow BBQ).",
            "Traducir instrucciones de hornos convencionales importados.",
            "Interpretar libros de repostería americanos.",
            "Preparar recetas de blogs y YouTubers de cocina estadounidense."
        ],
        "intro_hook": "Para convertir **°F a °C en recetas de horno**: `°C = (°F - 32) × 5/9`. Valores típicos: 350°F = 177°C, 400°F = 204°C, 450°F = 232°C.",
        "faqs_extra": [
            ("¿A cuántos °C equivale 350°F?", "**350°F = 176.67°C** (redondear a 180°C en horno argentino, marca 6-7 de 10). Temperatura 'estándar' para la mayoría de recetas americanas de horneado."),
            ("¿Qué es un 'hot oven' americano?", "**Hot oven = 425-450°F = 220-230°C**. Usado para panes crocantes, pizzas caseras y pies. **Very hot**: 475-500°F = 246-260°C (pizza estilo napolitano o focaccias)."),
            ("¿Y 'slow cook'?", "**Slow oven = 225-275°F = 107-135°C**. Típico para cocción lenta de carnes, brisket BBQ, asado americano. En horno argentino: marca 1-2 de 10 o horno 'apenas encendido'.")
        ]
    },
    {
        "slug": "conversor-gramos-a-tazas-cocina",
        "cat": "cocina", "icon": "🥣",
        "u1": ("gramo", "gramos", "g"), "u2": ("taza", "tazas", "cup"),
        "factor": 0.00422675, "factor_str": "Varía por ingrediente: harina ~0.008 cup/g, azúcar ~0.005, manteca ~0.0044",
        "factor_origin": "1 taza US = 236.59 mL. El factor g→cup depende de la DENSIDAD del ingrediente: harina (0.53 g/mL), azúcar blanca (0.85 g/mL), manteca (0.95 g/mL), arroz crudo (0.78 g/mL), agua (1.00 g/mL). Por eso NO es conversión lineal: hay que especificar el ingrediente.",
        "example_real": {
            "scenario": "Una receta argentina pide 200 g de harina. ¿Cuántas cups americanas?",
            "steps": [
                "Harina 0000: 1 cup = ~125 g (densidad media al amontonar).",
                "Cálculo: `200 / 125 = 1.6 cups`.",
                "Resultado: **1⅔ cups de harina** (aproximadamente)."
            ],
            "result": "**200 g harina = 1⅔ cups** (1.6 cups)."
        },
        "table_values": [100, 125, 200, 250, 500, 1000],
        "use_cases": [
            "Convertir recetas argentinas a formato americano (cups).",
            "Traducir medidas entre blogs de cocina.",
            "Escalar recetas familiares para audiencia anglo.",
            "Intercambiar volúmenes y pesos de ingredientes secos.",
            "Adaptar recetas de panadería con precisión."
        ],
        "intro_hook": "**gramos → tazas depende del ingrediente**. Harina: ~125 g/cup. Azúcar: ~200 g/cup. Manteca: ~227 g/cup. Arroz crudo: ~185 g/cup.",
        "faqs_extra": [
            ("¿Cuántos gramos tiene 1 cup de harina 0000?", "**~120-130 g** (125 g promedio al 'cucharearse y nivelar', spooned and leveled). Si la 'apretás' al llenar, puede llegar a 150 g. Por eso en repostería profesional se recomienda pesar, no medir."),
            ("¿Y 1 cup de azúcar blanca?", "**~200 g** (densidad 0.85 g/mL). Azúcar rubia/morena presionada ('packed'): 220 g/cup. Azúcar impalpable (powdered): 120 g/cup."),
            ("¿Cuántos gramos de manteca en 1 cup?", "**1 cup manteca = 227 g = ½ libra**. Coincidencia: una barrita de manteca americana (stick) pesa 113 g = ½ cup. Muchas recetas dicen '1 stick butter'.")
        ]
    },

    # ===== CONSTRUCCIÓN (5) =====
    {
        "slug": "conversor-ladrillos-por-metro-cuadrado",
        "cat": "construccion", "icon": "🧱",
        "u1": ("metro cuadrado", "metros cuadrados", "m²"), "u2": ("ladrillo", "ladrillos", "ladrillos"),
        "factor": 65.0, "factor_str": "~65 ladrillos comunes/m² (de 6×12×25 cm) / 35-40 ladrillos huecos",
        "factor_origin": "Depende del tipo de ladrillo: **Ladrillo común** (~6×12×25 cm + 1 cm junta): 65 unidades/m². **Ladrillo hueco 12×18×33 cm**: ~16 unidades/m². **Hueco 8×18×33 cm**: ~16/m². Incluir desperdicio: sumar 5-10%.",
        "example_real": {
            "scenario": "Para una pared de 20 m² con ladrillos comunes. ¿Cuántos necesitás?",
            "steps": [
                "Valor: 20 m² de pared.",
                "Aplicar factor: `20 × 65 = 1300 ladrillos`.",
                "Sumar 10% de desperdicio: `1300 × 1.10 = 1430 ladrillos`.",
                "Resultado: **~1430 ladrillos comunes** (+ desperdicio)."
            ],
            "result": "**20 m² = 1300-1430 ladrillos comunes**."
        },
        "table_values": [5, 10, 20, 50, 100, 200],
        "use_cases": [
            "Presupuestar cantidad de ladrillos para obras de mampostería.",
            "Calcular costo de material para una pared.",
            "Planificar compras en corralones.",
            "Comparar opciones de ladrillos (común vs hueco).",
            "Estimar tiempo de albañilería según cantidad."
        ],
        "intro_hook": "**Ladrillo común: ~65 unidades/m² de pared**. Hueco 12: ~16/m². Hueco 8: ~16/m². Sumar 5-10% de desperdicio.",
        "faqs_extra": [
            ("¿Cuántos ladrillos comunes para una casa de 100 m²?", "Aprox 220 m² de pared (suma de todas las paredes de una casa de 100 m² cubiertos). `220 × 65 + 10% = 15,730 ladrillos`. Costo 2025: ~USD 0.20-0.30/ladrillo = USD 3000-4500 solo en ladrillos."),
            ("¿Qué ladrillo conviene más?", "Ladrillo común: mejor aislación y durabilidad, más caro. **Ladrillo hueco**: más liviano y rápido de colocar (menos ladrillos y menos mortero). Común para muros portantes; hueco para tabiquería interna."),
            ("¿Cuánto mortero necesito?", "**Ladrillo común**: ~30 L de mortero por m² de pared (15 cm espesor). Hueco 12: 25 L/m². Se prepara con arena + cal + cemento en proporción 3:2:1 (asentamiento).")
        ]
    },
    {
        "slug": "conversor-bolsas-cemento-por-metro-cubico",
        "cat": "construccion", "icon": "🏗️",
        "u1": ("metro cúbico", "metros cúbicos", "m³"), "u2": ("bolsa de cemento", "bolsas de cemento", "bolsas"),
        "factor": 7.0, "factor_str": "7 bolsas (hormigón H-21) / 6 (H-17) / 8-10 (carpeta)",
        "factor_origin": "Bolsa estándar = 50 kg. **Hormigón armado H-21** (300 kg/m³): 6-7 bolsas/m³. **Hormigón simple H-17**: 5-6 bolsas/m³. **Carpetas y revoques**: 8-10 bolsas/m³ (más cementosos). La proporción típica H-21: 1:2:3 (cemento:arena:piedra).",
        "example_real": {
            "scenario": "Vas a tirar una losa de 60 m² × 12 cm de espesor. ¿Cuántas bolsas de cemento?",
            "steps": [
                "Volumen: `60 × 0.12 = 7.2 m³` de hormigón.",
                "Aplicar factor H-21: `7.2 × 7 = 50.4 bolsas`.",
                "Sumar 5% desperdicio: `50.4 × 1.05 = 53 bolsas`.",
                "Resultado: **~53 bolsas de cemento** + 21 m³ de arena + 31 m³ de piedra."
            ],
            "result": "**7.2 m³ de losa = ~53 bolsas de cemento**."
        },
        "table_values": [1, 2, 5, 10, 20, 50],
        "use_cases": [
            "Calcular materiales para hacer contrapisos, losas y columnas.",
            "Presupuestar una obra nueva o una remodelación.",
            "Comparar dosificaciones de distintos tipos de hormigón.",
            "Estimar carga de camión mixer según volumen.",
            "Optimizar compras en corralón con descuentos por cantidad."
        ],
        "intro_hook": "**Hormigón H-21: ~7 bolsas de cemento/m³** (con arena y piedra en proporción 1:2:3). Carpetas: 8-10 bolsas/m³.",
        "faqs_extra": [
            ("¿Cuántas bolsas para 1 m³ de hormigón?", "**H-21 estándar (300 kg/m³)**: 6 bolsas de 50 kg. **H-17 (250 kg/m³)**: 5 bolsas. **H-25 (350 kg/m³)**: 7 bolsas. Siempre verificar con calculadora estructural para obras grandes."),
            ("¿Y para contrapiso?", "**Contrapiso estándar** (1:3:3 cemento:arena:piedra + cascote): **~3 bolsas/m³**. Es más económico que hormigón armado; se usa para rellenos y cimientos simples."),
            ("¿Hormigón elaborado vs hecho en obra?", "**Elaborado (mixer)**: más caro por m³ pero ahorra mano de obra y asegura calidad. Desde ~5 m³ conviene. **Hecho en obra**: más barato, recomendado solo para volúmenes chicos (<3 m³) o acceso imposible para mixer.")
        ]
    },
    {
        "slug": "conversor-litros-pintura-por-metro-cuadrado",
        "cat": "construccion", "icon": "🎨",
        "u1": ("metro cuadrado", "metros cuadrados", "m²"), "u2": ("litro de pintura", "litros de pintura", "L"),
        "factor": 0.10, "factor_str": "~0.1 L/m² por mano (rendimiento 10 m²/L)",
        "factor_origin": "Rendimiento típico de pinturas en 2 manos sobre pared lisa: **látex interior**: 10-12 m²/L por mano. **Látex exterior**: 8-10 m²/L. **Esmalte sintético**: 10-12 m²/L. **Impermeabilizante**: 5-7 m²/L. **Imprimación/fijador**: 12-15 m²/L. Dos manos es lo estándar para cobertura total.",
        "example_real": {
            "scenario": "Vas a pintar un living de 20 m² de paredes. ¿Cuántos litros de látex necesitás?",
            "steps": [
                "Área total: 20 m².",
                "Rendimiento látex interior: 10 m²/L por mano.",
                "Para 2 manos: `20 / 10 × 2 = 4 L`.",
                "Sumar 10% extra por pérdidas: **~4.5 L** = 1 lata de 4L + parte de otra.",
                "Resultado: **4-5 litros de látex** para 2 manos."
            ],
            "result": "**20 m² × 2 manos = 4-5 L de látex**."
        },
        "table_values": [10, 20, 50, 100, 200, 500],
        "use_cases": [
            "Presupuestar la pintada de una casa o departamento.",
            "Comparar rendimiento de distintas pinturas.",
            "Planificar compras en pinturerías.",
            "Estimar tiempo de trabajo según cantidad de material.",
            "Optimizar costo por tipo de pintura y marca."
        ],
        "intro_hook": "**Látex interior: 10 m²/L por mano**. Para 2 manos, 1 litro cubre 5 m² netos. Dividir el área total por 5 y sumar 10%.",
        "faqs_extra": [
            ("¿Cuánta pintura para 50 m² a 2 manos?", "**Látex interior**: `50 m² × 2 manos / 10 m²/L = 10 L` (+ 10% = 11 L). Una lata de 10 L alcanza justo; conviene comprar 2 latas de 4 L + 1 de 4 L para más margen."),
            ("¿Cuántas manos de pintura hay que dar?", "**Siempre mínimo 2 manos** para cobertura pareja. Si el color de base es muy distinto (oscuro → claro): 3 manos o usar imprimación. Si el color es el mismo o similar: 2 manos suficiente."),
            ("¿Qué pintura rinde más?", "Las pinturas 'premium' (Alba Premium, Sinteplast Recuplast) rinden más por mayor cuerpo y mejor cobertura: ~12 m²/L. Las económicas: 8-10 m²/L. El costo total por m² puede ser similar: más caras por litro pero más rendimiento.")
        ]
    },
    {
        "slug": "conversor-pie-tabla-a-metro-cubico",
        "cat": "construccion", "icon": "🪵",
        "u1": ("pie tabla", "pies tabla", "pt"), "u2": ("metro cúbico", "metros cúbicos", "m³"),
        "factor": 0.00235974, "factor_str": "0.00235974",
        "factor_origin": "1 pie tabla (board foot) = 1 pie × 1 pie × 1 pulgada = 144 pulgadas³ = 2359.74 cm³ = 0.00235974 m³. Unidad americana para comercializar madera aserrada.",
        "example_real": {
            "scenario": "Un aserradero ofrece 1000 pies tabla de pino. ¿Cuántos m³ son?",
            "steps": [
                "Valor: 1000 pt.",
                "Aplicar factor: `1000 × 0.00236 = 2.36 m³`.",
                "Resultado: **2.36 m³ de madera aserrada** (suficiente para ~300 m² de piso)."
            ],
            "result": "**1000 pies tabla = 2.36 m³ de madera**."
        },
        "table_values": [100, 500, 1000, 5000, 10000],
        "use_cases": [
            "Importar madera aserrada de EE.UU. o Canadá.",
            "Comparar precios de madera entre sistemas.",
            "Interpretar catálogos de aserraderos americanos.",
            "Calcular volumen de tablones en m³ para transporte.",
            "Traducir pedidos de construcción en madera."
        ],
        "intro_hook": "**1 pie tabla = 0.00236 m³**. Unidad americana para madera: equivale a una tabla de 1 pie × 1 pie × 1 pulgada.",
        "faqs_extra": [
            ("¿Cuántos pies tabla en 1 m³?", "**1 m³ = 424.0 pies tabla**. Por eso un metro cúbico de madera cara (roble, caoba) a USD 5-10/pt representa USD 2000-4000 el m³."),
            ("¿Cómo se calcula pies tabla de una tabla real?", "**Fórmula**: `pt = (espesor in × ancho in × largo ft) / 12`. Ejemplo: tabla 2\" × 6\" × 8' = `2 × 6 × 8 / 12 = 8 pt`. Para varias tablas, sumar."),
            ("¿Para qué se usa el pie tabla?", "Estándar comercial americano para madera aserrada (pino, cedro, nogal). Hace simple cotizar por volumen sin importar el tamaño específico de cada tabla. En Argentina se vende por m³ o 'tabla' a medida.")
        ]
    },
    {
        "slug": "conversor-metros-lineales-a-metros-cuadrados",
        "cat": "construccion", "icon": "📏",
        "u1": ("metro lineal", "metros lineales", "m lineal"), "u2": ("metro cuadrado", "metros cuadrados", "m²"),
        "factor": 1.0, "factor_str": "Depende del ancho (m² = m lineal × ancho)",
        "factor_origin": "No es conversión directa: el factor depende del ancho del material. **Tela de 1.5 m de ancho**: 1 m lineal = 1.5 m². **Cortina 2.40 m alto**: 1 m lineal = 2.4 m². **Alfombra 2 m ancho**: 1 m lineal = 2 m². Hay que especificar el ancho siempre.",
        "example_real": {
            "scenario": "Comprás 4 metros lineales de tela de 1.50 m de ancho. ¿Cuántos m² son?",
            "steps": [
                "Valor: 4 m lineales × 1.50 m ancho.",
                "Cálculo: `4 × 1.5 = 6 m²`.",
                "Resultado: **6 m² de tela** (suficiente para cortinas de 2 ventanas medianas)."
            ],
            "result": "**4 m lineales × 1.50 m = 6 m² de tela**."
        },
        "table_values": [1, 2, 5, 10, 20, 50],
        "use_cases": [
            "Calcular cantidad de tela para cortinas, tapizados y almohadones.",
            "Determinar rollos de alfombra o moquette necesarios.",
            "Presupuestar pastos sintéticos y cespeds.",
            "Calcular membranas impermeabilizantes (vendidas por rollos).",
            "Medir papel tapiz o empapelados por área."
        ],
        "intro_hook": "**m² = m lineal × ancho**. Siempre necesitás saber el ancho del material para convertir metros lineales a m².",
        "faqs_extra": [
            ("¿Cuánta tela necesito para una cortina?", "**Ancho de ventana × 2 a 3 (para pliegues) × alto de la ventana**. Si la tela es de 1.5 m de ancho y querés 2.5 m lineales, total = `2.5 × 1.5 = 3.75 m²`."),
            ("¿Y alfombra por metro lineal?", "Alfombras y moquettes vienen en rollos de 3 o 4 m de ancho. **1 m lineal × 3 m ancho = 3 m²**. Para cubrir 18 m² con rollo de 3 m ancho: 6 m lineales."),
            ("¿Pasto sintético se vende igual?", "Sí: **ancho fijo del rollo (típico 2 o 4 m) × largo (metros lineales)**. Para un patio de 30 m² con rollo de 2 m ancho: `30 / 2 = 15 m lineales`.")
        ]
    },

    # ===== TALLES (2) =====
    {
        "slug": "conversor-talles-ropa-us-ar-eu",
        "cat": "vida", "icon": "👕",
        "u1": ("talle US", "talles US", "US"), "u2": ("talle AR/EU", "talles AR/EU", "AR"),
        "is_lookup": True,
        "factor": 1.0, "factor_str": "Tabla de equivalencias (no lineal)",
        "factor_origin": "Los talles varían por país y género. Aproximaciones generales: **Mujer US**: 2 = 4 AR = 34 EU. **Mujer US**: 10 = 12 AR = 40 EU. **Hombre US**: S = 38-40 AR = 48-50 EU. Hay variaciones por marca: siempre verificar tabla del fabricante.",
        "example_real": {
            "scenario": "Tu talle argentino es M. ¿Qué comprar en Amazon USA (mujer)?",
            "steps": [
                "Talle AR M mujer: cintura ~72-75 cm, cadera ~96-99 cm.",
                "Equivalente US: **M = US size 8-10**.",
                "Equivalente EU: **38-40**.",
                "Resultado: pedir **Small-Medium** en Amazon (depende de la marca)."
            ],
            "result": "**Talle M AR mujer ≈ US 8-10 = EU 38-40**."
        },
        "table_values": ["XS", "S", "M", "L", "XL", "XXL"],
        "use_cases": [
            "Comprar ropa en Amazon, ASOS, Shein desde Argentina.",
            "Seguir tablas de talles de marcas internacionales.",
            "Enviar regalos a familiares en el exterior.",
            "Vender por eBay o Mercado Libre con compradores internacionales.",
            "Interpretar talles en redes de moda internacional."
        ],
        "intro_hook": "**Mujer AR M ≈ US 8-10 ≈ EU 38-40**. Siempre verificá la tabla de talles del fabricante — hay mucha variación entre marcas.",
        "faqs_extra": [
            ("¿Los talles americanos son más chicos o más grandes?", "**Más grandes en número pero similares en prenda**: un US 8 de mujer equivale a AR 40 o EU 38. Los ingleses (UK) y europeos usan numeración mayor (12 UK ≈ 10 US), y los japoneses más chica (por lo general 1-2 talles menos)."),
            ("¿Qué hago si estoy entre dos talles?", "**Regla general**: comprá el más grande salvo que sea ropa elástica (leggings, remeras algodón con spandex). Para pantalones rígidos y camisas formales, siempre el más grande; achicar cuesta menos que agrandar."),
            ("¿Por qué hay tanta variación entre marcas?", "Porque los talles no son estándar legal (salvo en algunos países). Cada marca crea su horma. Zara tiende a ser 'chica' (pedir un talle más). Levi's es estándar. Asos y Shein varían mucho por producto.")
        ]
    },
    {
        "slug": "conversor-talles-calzado-us-ar-eu",
        "cat": "vida", "icon": "👟",
        "u1": ("talle de calzado US", "talles de calzado US", "US"), "u2": ("talle de calzado AR/EU", "talles de calzado AR/EU", "AR"),
        "is_lookup": True,
        "factor": 1.0, "factor_str": "Tabla de equivalencias (AR/EU ≈ US × 2 + 31, aprox)",
        "factor_origin": "Sistema Mondopoint (basado en cm del pie). Aproximación: **AR = EU** (casi iguales). **AR/EU ≈ US (hombre) × 2 + 32** o **AR/EU ≈ US (mujer) × 2 + 30**. Valores: US hombre 8 = EU 41. US mujer 7 = EU 37. Nike usa su propia tabla con ligeras diferencias.",
        "example_real": {
            "scenario": "Tu pie mide 26 cm. ¿Qué talle usar?",
            "steps": [
                "Mondopoint: **26 cm = talle 42 AR/EU**.",
                "Convertir a US: **26 cm = US 9 (hombre) / US 10.5 (mujer)**.",
                "Convertir a UK: **26 cm = UK 8 (hombre) / UK 7.5 (mujer)**.",
                "Resultado: **Talle 42 AR/EU = US 9 = UK 8** (hombre)."
            ],
            "result": "**Pie 26 cm = 42 AR/EU = US 9 hombre**."
        },
        "table_values": [35, 37, 39, 41, 43, 45],
        "use_cases": [
            "Comprar zapatillas en Nike, Adidas, Amazon con talle correcto.",
            "Pedir botines o zapatos desde el exterior.",
            "Interpretar tablas de talles de outlets internacionales.",
            "Enviar calzado como regalo sabiendo el talle exacto.",
            "Convertir talles históricos entre sistemas."
        ],
        "intro_hook": "**Regla rápida hombre**: Talle AR/EU = US + 32-33. **Mujer**: AR/EU = US + 30-31. Siempre verificá longitud del pie en cm con la tabla del fabricante.",
        "faqs_extra": [
            ("¿Talle 42 AR en US para hombre?", "**Talle 42 AR/EU hombre = US 9**. Si es mujer (aunque raro en 42), sería ~US 11. Nike/Adidas: verificar porque tienen variaciones pequeñas."),
            ("¿Cómo mido mi pie?", "De pie sobre una hoja, marcá talón y dedo más largo. Medir en cm y **sumar 0.5-1 cm de holgura**. Ejemplo: pie 25.5 cm + 0.5 cm = 26 cm = talle 42 AR. Medir siempre por la tarde (el pie se hincha levemente)."),
            ("¿Los talles de zapatillas y botines son iguales?", "Casi siempre sí (mismo sistema AR/EU). **Excepción**: zapatos formales a veces usan 'forma' más angosta; si tu pie es ancho, comprá 1 talle más. En zapatillas con plantilla amplia (running, training), el talle estándar suele andar bien.")
        ]
    },
]
