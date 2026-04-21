"""Batch 100 conversores - PARTE 3: Tiempo, Datos, Energía, Presión, Ángulos (30 calcs)."""

LINEAR_P3 = [
    # ===== TIEMPO (7) =====
    {
        "slug": "conversor-minutos-a-segundos",
        "cat": "matematica", "icon": "⏱️",
        "u1": ("minuto", "minutos", "min"), "u2": ("segundo", "segundos", "s"),
        "factor": 60.0, "factor_str": "60",
        "factor_origin": "Definición sexagesimal heredada de Babilonia: 1 minuto = 60 segundos exactos. Base 60 porque es divisible por 2, 3, 4, 5, 6, 10, 12, 15, 20, 30.",
        "example_real": {
            "scenario": "Un horno temporizador marca 25 minutos. ¿Cuántos segundos?",
            "steps": [
                "Valor: 25 min.",
                "Aplicar factor: `25 × 60 = 1500 s`.",
                "Resultado: **1500 segundos**."
            ],
            "result": "**25 min = 1500 s**."
        },
        "table_values": [1, 5, 10, 30, 60, 90, 120],
        "use_cases": [
            "Convertir duración de audio/video para edición técnica.",
            "Calcular tiempos de cocción o temporización precisa.",
            "Traducir tiempos de carreras cortas (atletismo, natación).",
            "Especificar duración en scripts de programación.",
            "Calcular tiempos de exposición fotográfica."
        ],
        "intro_hook": "**1 minuto = 60 segundos** exactos. Herencia del sistema sexagesimal babilónico, ideal por su divisibilidad.",
        "faqs_extra": [
            ("¿Cuántos segundos tiene 1 hora?", "**1 hora = 60 × 60 = 3600 segundos**. Útil para calcular frecuencias horarias."),
            ("¿Y 1 día?", "**1 día = 24 × 3600 = 86,400 segundos**. Usado en cálculos financieros de interés diario y ciencias (segundos/día)."),
            ("¿Por qué 60 y no 100?", "Los babilonios usaban base 60 (sistema sexagesimal) por su divisibilidad. Los griegos lo heredaron para matemáticas y astronomía. Cuando se intentó decimalizar el tiempo (Francia 1793), fracasó por inercia cultural.")
        ]
    },
    {
        "slug": "conversor-horas-a-minutos",
        "cat": "matematica", "icon": "⏰",
        "u1": ("hora", "horas", "h"), "u2": ("minuto", "minutos", "min"),
        "factor": 60.0, "factor_str": "60",
        "factor_origin": "Definición sexagesimal: 1 hora = 60 minutos = 3600 segundos. Herencia babilónica.",
        "example_real": {
            "scenario": "Un vuelo Buenos Aires - Madrid dura 12 horas. ¿Cuántos minutos?",
            "steps": [
                "Valor: 12 h.",
                "Aplicar factor: `12 × 60 = 720 min`.",
                "Resultado: **720 minutos** (útil para programar descansos)."
            ],
            "result": "**12 horas = 720 minutos**."
        },
        "table_values": [0.25, 0.5, 1, 2, 6, 12, 24],
        "use_cases": [
            "Calcular duración de viajes, películas y eventos.",
            "Planificar jornadas laborales en minutos facturados.",
            "Convertir tiempo estimado de tareas.",
            "Medir procesos largos en minutos para granularidad.",
            "Calcular tiempos de grabación o streaming."
        ],
        "intro_hook": "**1 hora = 60 minutos**. Relación básica del sistema horario sexagesimal.",
        "faqs_extra": [
            ("¿Cuántos minutos tiene media hora?", "**½ hora = 30 min**. Básico, pero útil para calcular horarios de trabajo fraccionados o pausas."),
            ("¿Y un cuarto de hora?", "**¼ hora = 15 min**. Fracción común en telefonía, transporte público y facturación."),
            ("¿Un día tiene cuántos minutos?", "**24 horas × 60 = 1440 minutos**. Un día tiene 1440 min y 86,400 seg. Si manejás al trabajo 30 min ida/vuelta, usás 60 min/día = 4% del día.")
        ]
    },
    {
        "slug": "conversor-dias-a-horas",
        "cat": "matematica", "icon": "📅",
        "u1": ("día", "días", "d"), "u2": ("hora", "horas", "h"),
        "factor": 24.0, "factor_str": "24",
        "factor_origin": "Por definición: 1 día = 24 horas (rotación completa de la Tierra en 23 h 56 min 4 s = 'día sideral', redondeado a 24 h por conveniencia = 'día solar medio').",
        "example_real": {
            "scenario": "Un tratamiento médico dura 7 días. ¿Cuántas horas?",
            "steps": [
                "Valor: 7 días.",
                "Aplicar factor: `7 × 24 = 168 horas`.",
                "Resultado: **168 horas**."
            ],
            "result": "**7 días = 168 horas**."
        },
        "table_values": [1, 3, 7, 14, 30, 365],
        "use_cases": [
            "Calcular duración en horas de vacaciones, licencias o internaciones.",
            "Convertir tiempo para streaming o gaming tracking.",
            "Estimar horas de luz o de sueño acumuladas.",
            "Calcular tiempo total de un proyecto.",
            "Convertir duración de medicamentos (tomar cada X horas por Y días)."
        ],
        "intro_hook": "**1 día = 24 horas** exactas (por convención del día solar medio).",
        "faqs_extra": [
            ("¿Cuántas horas tiene una semana?", "**7 días × 24 = 168 horas**. Una semana tiene más horas de las que parece: 168 horas es una métrica común para planificar rutinas."),
            ("¿Y un mes?", "Varía: **28 días = 672 horas**, 30 días = 720 h, 31 días = 744 h. Febrero bisiesto = 29 días = 696 h."),
            ("¿Un año tiene exactamente 365 × 24 = 8760 horas?", "**Casi**: año común = 8760 h. Año bisiesto = 8784 h. Año sideral astronómico = 8765.8 h (un poco más por ajuste astronómico).")
        ]
    },
    {
        "slug": "conversor-semanas-a-dias",
        "cat": "matematica", "icon": "📅",
        "u1": ("semana", "semanas", "sem"), "u2": ("día", "días", "d"),
        "factor": 7.0, "factor_str": "7",
        "factor_origin": "Por convención judeocristiana heredada del Génesis: la semana tiene 7 días (origen bíblico, adoptado universalmente por calendarios modernos).",
        "example_real": {
            "scenario": "Un curso online dura 12 semanas. ¿Cuántos días?",
            "steps": [
                "Valor: 12 semanas.",
                "Aplicar factor: `12 × 7 = 84 días`.",
                "Resultado: **84 días** (casi 3 meses)."
            ],
            "result": "**12 semanas = 84 días**."
        },
        "table_values": [1, 2, 4, 12, 26, 52],
        "use_cases": [
            "Calcular duración en días de cursos, tratamientos o embarazos.",
            "Planificar proyectos semanales en días efectivos.",
            "Convertir semanas de vacaciones a días hábiles.",
            "Estimar tiempo de entrega en días a partir de semanas.",
            "Calcular frecuencia de eventos periódicos."
        ],
        "intro_hook": "**1 semana = 7 días**. Unidad universal derivada de tradiciones religiosas y astronómicas antiguas.",
        "faqs_extra": [
            ("¿Cuántos días tiene un año?", "**52 semanas × 7 = 364 días**. Por eso hay 1 día 'extra' por año (365 - 364 = 1): el calendario anual no encaja perfectamente en semanas."),
            ("¿Y un embarazo?", "**40 semanas = 280 días** (desde la última menstruación). Un embarazo 'a término' comprende las semanas 37 a 42."),
            ("¿Un mes tiene cuántas semanas?", "**4.33 semanas** (aproximación). Meses de 30 días ≈ 4.29 semanas; de 31 días ≈ 4.43 semanas. Para cálculos rápidos se suele usar 4 semanas/mes.")
        ]
    },
    {
        "slug": "conversor-anos-a-dias",
        "cat": "matematica", "icon": "📅",
        "u1": ("año", "años", "a"), "u2": ("día", "días", "d"),
        "factor": 365.25, "factor_str": "365.25 (promedio) / 365 (común) / 366 (bisiesto)",
        "factor_origin": "Año trópico medio = 365.24219 días (giro terrestre alrededor del Sol). Para simplificar, calendario gregoriano usa 365 días normal y 366 bisiesto (cada 4 años salvo múltiplos de 100 no de 400). El promedio: 365.2425 días.",
        "example_real": {
            "scenario": "Un contrato de 5 años de duración. ¿Cuántos días?",
            "steps": [
                "Valor: 5 años.",
                "Aplicar factor (promedio): `5 × 365.25 = 1826.25 días`.",
                "Aproximación común: `5 × 365 = 1825 días` más 1-2 días bisiestos.",
                "Resultado: **~1826 días** (depende de bisiestos en el período)."
            ],
            "result": "**5 años ≈ 1826 días**."
        },
        "table_values": [1, 2, 5, 10, 18, 50, 100],
        "use_cases": [
            "Calcular edad exacta en días.",
            "Determinar duración de contratos largos o hipotecas.",
            "Convertir períodos de prescripción legal.",
            "Calcular tiempo de permanencia en un puesto o país.",
            "Estimar días vividos o días hasta un evento futuro."
        ],
        "intro_hook": "**1 año = 365.25 días** (promedio). Calendario común = 365 días; bisiestos = 366.",
        "faqs_extra": [
            ("¿Cuántos días viví si tengo 30 años?", "**Aproximadamente 10,958 días** (30 × 365.25). El número exacto depende de fecha de nacimiento y bisiestos atravesados."),
            ("¿Cuántos días hay en un año bisiesto?", "**366 días** (febrero 29). Regla: años divisibles por 4 son bisiestos, salvo múltiplos de 100 no de 400. 2000 fue bisiesto, 1900 no, 2100 no será."),
            ("¿Por qué 365.25?", "El año trópico real (giro de la Tierra alrededor del Sol) es 365.24219 días. Para ajustar 0.25 días extras por año, cada 4 años agregamos un día (bisiesto). Con la corrección gregoriana (saltar algunos bisiestos en siglos), el promedio queda 365.2425 días.")
        ]
    },
    {
        "slug": "conversor-meses-a-semanas",
        "cat": "matematica", "icon": "📅",
        "u1": ("mes", "meses", "m"), "u2": ("semana", "semanas", "sem"),
        "factor": 4.34524, "factor_str": "4.34524 (promedio) / 4 (aproximado)",
        "factor_origin": "1 año = 12 meses = 52.1775 semanas. Por lo tanto 1 mes promedio = 52.1775 / 12 = 4.34524 semanas. Varía por mes: febrero común = 4 semanas exactas, julio (31 días) = 4.43 semanas.",
        "example_real": {
            "scenario": "Un embarazo dura 9 meses. ¿Cuántas semanas?",
            "steps": [
                "Valor: 9 meses.",
                "Aplicar factor: `9 × 4.345 = 39.1 semanas`.",
                "Medida médica real: **40 semanas** (desde última menstruación, no desde concepción).",
                "Resultado: **39-40 semanas** según método de cálculo."
            ],
            "result": "**9 meses = 39-40 semanas** (embarazo)."
        },
        "table_values": [1, 3, 6, 9, 12, 24],
        "use_cases": [
            "Traducir duración de embarazos entre meses y semanas (médicas).",
            "Planificar duración de alquileres o contratos en semanas efectivas.",
            "Calcular maternidad/paternidad en ambos formatos.",
            "Convertir duración de proyectos para granularidad semanal.",
            "Comparar métodos de cálculo médico vs lego."
        ],
        "intro_hook": "**1 mes = 4.345 semanas** (promedio). Aproximadamente 4 semanas + 2-3 días.",
        "faqs_extra": [
            ("¿9 meses son 36 semanas?", "**No, son ~40 semanas médicamente**. La diferencia: 9 meses calendario ≈ 39 semanas (9 × 4.33), pero los médicos cuentan desde la última menstruación (ovulación ~2 semanas después), por eso el embarazo 'a término' es 40 semanas."),
            ("¿Por qué no cuadran los cálculos?", "Porque los meses no miden lo mismo (28-31 días) y las semanas sí (7 días). La conversión exacta requiere saber qué meses incluye el período."),
            ("¿Un semestre cuántas semanas tiene?", "**6 meses × 4.345 = 26 semanas** (aproximadamente). Exacto: 6 meses = 180-184 días = 25.7-26.3 semanas.")
        ]
    },
    {
        "slug": "conversor-milisegundos-a-segundos",
        "cat": "ciencia", "icon": "⏱️",
        "u1": ("milisegundo", "milisegundos", "ms"), "u2": ("segundo", "segundos", "s"),
        "factor": 0.001, "factor_str": "0.001",
        "factor_origin": "Por prefijo del SI: 1 ms = 10⁻³ s = 0.001 s. Inverso: 1 s = 1000 ms.",
        "example_real": {
            "scenario": "Un ping de red latencia 45 ms. ¿Cuántos segundos?",
            "steps": [
                "Valor: 45 ms.",
                "Aplicar factor: `45 × 0.001 = 0.045 s`.",
                "Resultado: **0.045 segundos** (casi imperceptible para humanos)."
            ],
            "result": "**45 ms = 0.045 s**."
        },
        "table_values": [1, 10, 100, 500, 1000, 5000],
        "use_cases": [
            "Interpretar latencias de red (ping, RTT).",
            "Medir tiempo de respuesta de UI o apps.",
            "Programar animaciones y transiciones (CSS).",
            "Traducir tiempos de carrera (atletismo, natación).",
            "Analizar tiempos de obturación fotográfica."
        ],
        "intro_hook": "**1 ms = 0.001 s**. Unidad para medir reacciones, latencias y procesos rápidos.",
        "faqs_extra": [
            ("¿Cuánto dura un parpadeo humano?", "**~100-400 ms**. El parpadeo involuntario típico dura 100-150 ms, el voluntario puede llegar a 400 ms. Por eso 'en un parpadeo' son ~0.1-0.4 segundos."),
            ("¿Qué es una 'latencia de 20 ms'?", "20 ms es el tiempo que tarda un dato en viajar de origen a destino y volver. En juegos online, latencia <30 ms se considera excelente, 30-60 ms buena, 60-100 ms aceptable, >100 ms notable."),
            ("¿Cuánto es el tiempo de reacción humano?", "Reacción visual-muscular típica: **~250 ms** (cuarto de segundo). Atletas profesionales: 100-200 ms. Es por eso que en carreras de atletismo, salir antes de 100 ms del disparo se considera 'salida en falso'.")
        ]
    },

    # ===== DATOS (9) =====
    {
        "slug": "conversor-mb-a-gb",
        "cat": "tecnologia", "icon": "💾",
        "u1": ("megabyte", "megabytes", "MB"), "u2": ("gigabyte", "gigabytes", "GB"),
        "factor": 0.001, "factor_str": "0.001 (decimal SI) / 0.000977 (binario, 1/1024)",
        "factor_origin": "Decimal (SI): 1 GB = 1000 MB = 10⁹ B. Binario (IEC): 1 GiB = 1024 MiB = 2³⁰ B. Fabricantes de HDD usan decimal (más marketing); sistemas operativos suelen mezclar (Windows reporta binario llamándolo GB; macOS/Linux usan decimal).",
        "example_real": {
            "scenario": "Un archivo pesa 500 MB. ¿Cuántos GB?",
            "steps": [
                "Valor: 500 MB.",
                "Aplicar factor decimal: `500 / 1000 = 0.5 GB`.",
                "Aplicar factor binario: `500 / 1024 = 0.488 GiB`.",
                "Resultado: **0.5 GB (decimal) = 0.49 GiB (binario)**."
            ],
            "result": "**500 MB = 0.5 GB** (decimal)."
        },
        "table_values": [100, 500, 1000, 5000, 10000, 100000],
        "use_cases": [
            "Calcular espacio de archivos en planes de nube.",
            "Interpretar tamaños de descargas y backups.",
            "Estimar consumo de datos móviles.",
            "Convertir capacidad de discos duros.",
            "Entender cuotas de email (ej: Gmail 15 GB)."
        ],
        "intro_hook": "**1 GB = 1000 MB** (decimal, el estándar oficial SI) o **1024 MB** (binario, histórico). Diferencia de ~2.4%.",
        "faqs_extra": [
            ("¿Por qué Windows dice 931 GB en un disco de 1 TB?", "Porque usa unidades binarias (1 TiB = 1024 GiB) pero las llama 'GB'. El fabricante del disco usa decimal (1 TB = 1000 GB). Conversión: 1 TB decimal = 931.3 GiB binario. No falta espacio; es nomenclatura inconsistente."),
            ("¿Cuántos GB ocupa una hora de video 4K?", "**~12 GB/hora** (4K a 60 fps, H.264). 4K HDR puede llegar a 20-30 GB/hora. Por eso series 4K en streaming consumen mucho ancho de banda."),
            ("¿Cuántas fotos en 1 GB?", "Foto JPEG de celular (4 MB promedio): **~250 fotos por GB**. Foto RAW profesional (40 MB): ~25 fotos/GB. Los planes de Google Photos gratis (15 GB) alcanzan para ~3,750 fotos de celular.")
        ]
    },
    {
        "slug": "conversor-gb-a-tb",
        "cat": "tecnologia", "icon": "💾",
        "u1": ("gigabyte", "gigabytes", "GB"), "u2": ("terabyte", "terabytes", "TB"),
        "factor": 0.001, "factor_str": "0.001 (decimal) / 0.000977 (binario)",
        "factor_origin": "Decimal: 1 TB = 1000 GB = 10¹² B. Binario: 1 TiB = 1024 GiB = 2⁴⁰ B. Fabricantes de HDD/SSD usan decimal.",
        "example_real": {
            "scenario": "Tenés 1500 GB de fotos en Google Drive. ¿Cuántos TB?",
            "steps": [
                "Valor: 1500 GB.",
                "Aplicar factor: `1500 / 1000 = 1.5 TB`.",
                "Resultado: **1.5 TB** (plan Google One superior)."
            ],
            "result": "**1500 GB = 1.5 TB**."
        },
        "table_values": [500, 1000, 2000, 5000, 10000, 100000],
        "use_cases": [
            "Comparar planes de almacenamiento en la nube (Google, iCloud, OneDrive).",
            "Dimensionar servidores y NAS caseros.",
            "Estimar capacidad de backups completos.",
            "Convertir tamaños de bibliotecas de video HD/4K.",
            "Entender capacidades de discos enterprise."
        ],
        "intro_hook": "**1 TB = 1000 GB** (decimal). Los planes de cloud suelen usar esta convención.",
        "faqs_extra": [
            ("¿Un disco de 1 TB es realmente 1000 GB?", "**Sí**, en decimal (estándar del fabricante). Pero Windows lo mostrará como 931 GB por usar binario. No falta espacio: es otra unidad."),
            ("¿Cuántos GB son 5 TB?", "**5 TB = 5000 GB** (decimal) o 5120 GiB (binario)."),
            ("¿Cuánto video guarda 1 TB?", "Video 4K H.264: **~80-100 horas/TB**. Video Full HD: ~500 horas/TB. Fotos JPEG de celular: ~250,000 fotos/TB.")
        ]
    },
    {
        "slug": "conversor-kb-a-mb",
        "cat": "tecnologia", "icon": "💾",
        "u1": ("kilobyte", "kilobytes", "KB"), "u2": ("megabyte", "megabytes", "MB"),
        "factor": 0.001, "factor_str": "0.001 (decimal) / 0.000977 (binario)",
        "factor_origin": "Decimal: 1 MB = 1000 KB. Binario: 1 MiB = 1024 KiB. La diferencia es marginal (~2.4%).",
        "example_real": {
            "scenario": "Un archivo Word pesa 250 KB. ¿Cuántos MB?",
            "steps": [
                "Valor: 250 KB.",
                "Aplicar factor: `250 / 1000 = 0.25 MB`.",
                "Resultado: **0.25 MB** (cuarto de megabyte)."
            ],
            "result": "**250 KB = 0.25 MB**."
        },
        "table_values": [10, 100, 500, 1000, 5000, 10000],
        "use_cases": [
            "Interpretar tamaños de archivos pequeños (HTMLs, imágenes web, PDFs chicos).",
            "Optimizar archivos para carga web rápida.",
            "Calcular espacio de emails (attachments).",
            "Medir tamaños de código fuente.",
            "Convertir dimensiones de archivos de configuración."
        ],
        "intro_hook": "**1 MB = 1000 KB**. Útil para archivos pequeños como documentos de texto o imágenes web optimizadas.",
        "faqs_extra": [
            ("¿Cuánto pesa una imagen web optimizada?", "Imágenes optimizadas (WebP, comprimidas): **50-200 KB**. JPEG: 100-500 KB. PNG sin comprimir: 500 KB - 2 MB. Una web debería mantener imágenes <200 KB para performance."),
            ("¿Un ebook cuántos MB ocupa?", "EPUB sin imágenes: **200-500 KB** (libro de 300 páginas). Con imágenes: 1-5 MB. PDF de libro: 2-20 MB (muy variable). Kindle comprimido: similar al EPUB."),
            ("¿Cuánto aguanta Gmail de adjunto?", "Gmail: **25 MB por email** (si es más grande, agrega automáticamente enlace a Drive de 10 GB). Outlook: 20-50 MB según cuenta. Para archivos grandes, siempre usar cloud storage.")
        ]
    },
    {
        "slug": "conversor-bits-a-bytes",
        "cat": "tecnologia", "icon": "💻",
        "u1": ("bit", "bits", "b"), "u2": ("byte", "bytes", "B"),
        "factor": 0.125, "factor_str": "0.125 (1/8)",
        "factor_origin": "Por definición: 1 byte = 8 bits. Un byte almacena típicamente un carácter ASCII o un valor entre 0-255.",
        "example_real": {
            "scenario": "Un color RGB se codifica con 24 bits. ¿Cuántos bytes?",
            "steps": [
                "Valor: 24 bits.",
                "Aplicar factor: `24 / 8 = 3 bytes`.",
                "Resultado: **3 bytes por pixel** (1 por cada canal R, G, B)."
            ],
            "result": "**24 bits = 3 bytes** (pixel RGB)."
        },
        "table_values": [1, 8, 16, 32, 64, 128, 1000],
        "use_cases": [
            "Entender velocidades de internet (reportadas en bits/s).",
            "Calcular tamaño de archivos binarios precisos.",
            "Interpretar especificaciones de procesadores (32-bit, 64-bit).",
            "Convertir entre unidades digitales a bajo nivel.",
            "Analizar protocolos de red y comunicaciones."
        ],
        "intro_hook": "**1 byte = 8 bits**. Relación fundamental de la informática: 8 bits por byte, 256 valores posibles por byte.",
        "faqs_extra": [
            ("¿Por qué se usan 8 bits?", "Históricamente: 8 bits alcanzan para representar 256 valores (2⁸), suficiente para todo el alfabeto ASCII + números + símbolos especiales. Se estandarizó con el IBM System/360 (1964). Antes había bytes de 6, 7, 9 y otros."),
            ("¿Qué significa 'descargar a 100 Mbps'?", "Mbps = **megabits por segundo**, NO megabytes. **100 Mbps ÷ 8 = 12.5 MB/s** de velocidad real. Por eso tu conexión de 100 Mbps descarga un GB en ~80 segundos, no en 10."),
            ("¿Un gigabit y un gigabyte son lo mismo?", "**No**. 1 Gigabit = 10⁹ bits = 125 MB. 1 Gigabyte = 10⁹ bytes = 8 × 10⁹ bits = 8 Gigabits. ISPs reportan en Gbps (gigabits/segundo) para que los números suenen más grandes.")
        ]
    },
    {
        "slug": "conversor-mbps-a-mb-s",
        "cat": "tecnologia", "icon": "📶",
        "u1": ("megabit por segundo", "megabits por segundo", "Mbps"), "u2": ("megabyte por segundo", "megabytes por segundo", "MB/s"),
        "factor": 0.125, "factor_str": "0.125 (1/8)",
        "factor_origin": "Derivado de la relación bit/byte: 1 byte = 8 bits. Por tanto 1 Mbps = 1/8 MB/s = 0.125 MB/s.",
        "example_real": {
            "scenario": "Contratás un plan de internet de 200 Mbps. ¿Cuánto descargás en MB/s real?",
            "steps": [
                "Valor: 200 Mbps.",
                "Aplicar factor: `200 / 8 = 25 MB/s`.",
                "Resultado: **25 MB/s** máximos en descarga real."
            ],
            "result": "**200 Mbps = 25 MB/s** (velocidad real de descarga)."
        },
        "table_values": [10, 50, 100, 200, 500, 1000],
        "use_cases": [
            "Calcular velocidad real de descarga en MB/s.",
            "Estimar tiempo para bajar un archivo grande.",
            "Comparar planes de internet de distintos ISPs.",
            "Verificar si tu conexión sostiene streaming 4K.",
            "Dimensionar velocidad necesaria para trabajo en la nube."
        ],
        "intro_hook": "**1 Mbps = 0.125 MB/s** (dividí por 8). Dato clave: '300 Mbps' suena rápido pero son solo 37.5 MB/s reales.",
        "faqs_extra": [
            ("¿Por qué los ISPs usan Mbps y no MB/s?", "Porque el número en Mbps es 8× más grande (suena mejor en marketing). 100 Mbps suena rápido; los 12.5 MB/s reales no tanto. Internamente los routers siempre trabajan en bits/s."),
            ("¿Cuánto tarda bajar una película 4K (50 GB)?", "A 100 Mbps (12.5 MB/s): `50,000 MB / 12.5 = 4000 s ≈ 67 minutos`. A 1 Gbps (125 MB/s): ~7 minutos. Contando overhead y TCP, sumar 10-15% más."),
            ("¿Qué Mbps necesito para 4K streaming?", "Netflix 4K: **25 Mbps estables**. YouTube 4K: 20 Mbps. En hogares con varios usuarios, planes de 100+ Mbps son lo recomendado para evitar buffering.")
        ]
    },
    {
        "slug": "conversor-gb-a-mb",
        "cat": "tecnologia", "icon": "💾",
        "u1": ("gigabyte", "gigabytes", "GB"), "u2": ("megabyte", "megabytes", "MB"),
        "factor": 1000.0, "factor_str": "1000 (decimal) / 1024 (binario)",
        "factor_origin": "Decimal: 1 GB = 1000 MB. Binario: 1 GiB = 1024 MiB. Misma lógica que MB ↔ GB pero en dirección inversa.",
        "example_real": {
            "scenario": "Tenés 5 GB de fotos. ¿Cuántos MB?",
            "steps": [
                "Valor: 5 GB.",
                "Aplicar factor: `5 × 1000 = 5000 MB`.",
                "Resultado: **5000 MB** (aprox 1250 fotos de celular)."
            ],
            "result": "**5 GB = 5000 MB**."
        },
        "table_values": [1, 5, 10, 50, 100, 500],
        "use_cases": [
            "Convertir capacidad de memorias para compararlas con archivos.",
            "Calcular espacio disponible en unidades más pequeñas.",
            "Estimar cuántos archivos caben en X GB.",
            "Dividir backups en partes manejables.",
            "Traducir tamaño de videos a formato MB."
        ],
        "intro_hook": "**1 GB = 1000 MB**. Útil para descomponer capacidades grandes en tamaños más concretos.",
        "faqs_extra": [
            ("¿Cuántos MB usa una app de celular promedio?", "Apps básicas: **50-200 MB**. Apps complejas (Facebook, Instagram): 300-500 MB con caché. Juegos 3D: 1-5 GB (1000-5000 MB)."),
            ("¿Cuántos videos de YouTube entran en 1 GB?", "Video 1080p (~350 MB/hora): **~3 horas en 1 GB**. Video 480p (~150 MB/hora): ~7 horas. Video 4K (~2 GB/hora): 30 minutos."),
            ("¿Cuánto son 10 GB en MB?", "**10,240 MB** (binario) o **10,000 MB** (decimal). Diferencia: 240 MB. Los ISPs cuando cobran 'plan 10 GB' suelen usar decimal.")
        ]
    },
    {
        "slug": "conversor-bytes-a-kilobytes",
        "cat": "tecnologia", "icon": "💻",
        "u1": ("byte", "bytes", "B"), "u2": ("kilobyte", "kilobytes", "KB"),
        "factor": 0.001, "factor_str": "0.001 (decimal) / 0.000977 (binario 1/1024)",
        "factor_origin": "Decimal SI: 1 KB = 1000 B. Binario IEC: 1 KiB = 1024 B. En informática antigua siempre 1024 (KB = KiB); moderno inconsistente.",
        "example_real": {
            "scenario": "Un archivo de texto (plain text) pesa 5000 bytes. ¿Cuántos KB?",
            "steps": [
                "Valor: 5000 B.",
                "Aplicar factor decimal: `5000 / 1000 = 5 KB`.",
                "Aplicar factor binario: `5000 / 1024 = 4.88 KiB`.",
                "Resultado: **5 KB (decimal) = 4.88 KiB (binario)**."
            ],
            "result": "**5000 bytes = 5 KB** (decimal)."
        },
        "table_values": [100, 1000, 5000, 10000, 100000],
        "use_cases": [
            "Interpretar metadata y archivos de texto pequeños.",
            "Calcular tamaños exactos en programación (headers, cookies).",
            "Optimizar código y assets web.",
            "Entender mediciones de bases de datos granulares.",
            "Medir payload de APIs y requests."
        ],
        "intro_hook": "**1 KB = 1000 bytes** (decimal, estándar actual) o **1024 bytes** (binario, histórico).",
        "faqs_extra": [
            ("¿Una cookie web cuántos bytes ocupa?", "Cookies típicas: **100-500 bytes**. Algunos navegadores permiten hasta 4 KB (4096 bytes) por cookie. Sitios con muchas cookies pueden sumar KBs por request."),
            ("¿Y un tweet original de Twitter?", "Tweet de 280 caracteres en UTF-8: **~280-1120 bytes** (caracteres latinos simples = 1 byte; emojis y caracteres especiales = 2-4 bytes). Promedio: ~500 bytes con metadata."),
            ("¿KB o KiB?", "Técnicamente 1 KB = 1000 B (SI, estricto) y 1 KiB = 1024 B (IEC, binario). En la práctica se usan como sinónimos, pero hay contextos donde es crítico (almacenamiento de medios: bit de diferencia cuenta).")
        ]
    },
    {
        "slug": "conversor-tb-a-gb",
        "cat": "tecnologia", "icon": "💾",
        "u1": ("terabyte", "terabytes", "TB"), "u2": ("gigabyte", "gigabytes", "GB"),
        "factor": 1000.0, "factor_str": "1000 (decimal) / 1024 (binario)",
        "factor_origin": "Decimal: 1 TB = 1000 GB = 10¹² B. Binario: 1 TiB = 1024 GiB = 2⁴⁰ B. Misma lógica que GB↔TB.",
        "example_real": {
            "scenario": "Un NAS casero tiene 8 TB. ¿Cuántos GB?",
            "steps": [
                "Valor: 8 TB.",
                "Aplicar factor: `8 × 1000 = 8000 GB`.",
                "En binario (como reporta el OS): `8 × 1024 = 8192 GiB = 7450 GB decimales`.",
                "Resultado: **8000 GB decimal, 7450 GB en OS Windows**."
            ],
            "result": "**8 TB = 8000 GB** (decimal)."
        },
        "table_values": [1, 2, 4, 8, 16, 100],
        "use_cases": [
            "Dimensionar espacio de NAS caseros (Synology, QNAP).",
            "Calcular cuántos GB entran en un plan de nube.",
            "Interpretar anuncios de discos duros grandes.",
            "Planificar backups completos de organizaciones.",
            "Convertir capacidad entre escalas para comparaciones."
        ],
        "intro_hook": "**1 TB = 1000 GB** (decimal). Para uso cotidiano, está diferencia con binario (1024) rara vez es relevante.",
        "faqs_extra": [
            ("¿Cuántas películas HD entran en 1 TB?", "Películas en HD (5 GB promedio): **~200 películas por TB**. En 4K (15-25 GB cada una): 40-65 películas. En streaming FHD (3-5 GB/hora): 200-300 horas."),
            ("¿Cuánto cuesta 1 TB en nube hoy?", "2025: Google One 2 TB = USD 9.99/mes. Dropbox Plus 2 TB = USD 9.99/mes. Backblaze B2 = USD 6/mes por TB. NAS casero: ~USD 50 el TB de HDD nuevo."),
            ("¿Cuánto de Argentina en 1 TB?", "Si guardás TODA la música que vas a escuchar en tu vida (digital, MP3 320kbps), pesa **~500 GB**. 1 TB es más que suficiente para una videoteca personal grande + música.")
        ]
    },
    {
        "slug": "conversor-pixeles-a-pulgadas-dpi",
        "cat": "tecnologia", "icon": "🖨️",
        "u1": ("píxel", "píxeles", "px"), "u2": ("pulgada", "pulgadas", "in"),
        "factor": 0.00694444, "factor_str": "1 / DPI (variable según DPI)",
        "factor_origin": "Depende del DPI (dots per inch) de la imagen o pantalla. **1 pulgada = DPI píxeles**. Ejemplos: imagen web @72 dpi: 1 pulg = 72 px. Imagen imprenta @300 dpi: 1 pulg = 300 px. El factor 0.00694 asume 144 dpi (Retina).",
        "example_real": {
            "scenario": "Una imagen es de 600 × 400 píxeles a 300 DPI. ¿Cuánto mide en pulgadas?",
            "steps": [
                "Valor: 600 px ancho.",
                "Dividir por DPI: `600 / 300 = 2 pulgadas`.",
                "Alto: `400 / 300 = 1.33 pulgadas`.",
                "Resultado: **2\" × 1.33\" de ancho (imprimible sin pixelado)**."
            ],
            "result": "**600 × 400 px a 300 DPI = 2\" × 1.33\"** (imprimible)."
        },
        "table_values": [72, 96, 150, 200, 300, 600],
        "use_cases": [
            "Calcular tamaño físico de imágenes al imprimir.",
            "Convertir resolución de pantalla a tamaño papel.",
            "Preparar archivos para impresión profesional (300+ DPI).",
            "Dimensionar imágenes para web (72-96 DPI).",
            "Verificar si una imagen tiene suficiente resolución."
        ],
        "intro_hook": "**1 pulgada = DPI píxeles**. La conversión depende del DPI de la imagen: 72 dpi (web), 300 dpi (imprenta).",
        "faqs_extra": [
            ("¿Qué DPI uso para imprimir?", "**Mínimo 300 DPI** para calidad imprenta (libros, revistas, posters profesionales). 150 DPI aceptable para pósters grandes vistos de lejos. 72-96 DPI solo para pantalla web."),
            ("¿Una foto de 4000 px puedo imprimirla grande?", "A 300 DPI: `4000 / 300 = 13.3 pulgadas = 33.8 cm`. Podés imprimir hasta ~34 cm de ancho con calidad. A 200 DPI llegás a 50 cm (acepetable para pósters)."),
            ("¿Qué es el DPI de un iPhone?", "iPhone Retina: **~460 DPI** (pantallas OLED modernas). Por eso se ven muy definidas. Un monitor típico 1080p 24\" tiene ~92 DPI. Los iPhones tienen 5× más densidad de píxeles.")
        ]
    },

    # ===== ENERGÍA (7) =====
    {
        "slug": "conversor-calorias-a-joules",
        "cat": "ciencia", "icon": "🔥",
        "u1": ("caloría", "calorías", "cal"), "u2": ("joule", "joules", "J"),
        "factor": 4.184, "factor_str": "4.184 (cal IT) / 4.186 (cal termoquímica)",
        "factor_origin": "1 caloría internacional (tabla IT) = 4.1868 J. 1 caloría termoquímica = 4.184 J. En nutrición se usa la kcal (kilocaloría = 1000 cal): '100 kcal' en una etiqueta = 100,000 cal = 418,400 J = 418.4 kJ.",
        "example_real": {
            "scenario": "Una barra de cereal tiene 150 kcal. ¿Cuántos joules?",
            "steps": [
                "Valor: 150 kcal = 150,000 cal.",
                "Aplicar factor: `150,000 × 4.184 = 627,600 J = 627.6 kJ`.",
                "Resultado: **627.6 kJ** (energía química liberada al metabolizar)."
            ],
            "result": "**150 kcal = 627.6 kJ**."
        },
        "table_values": [1, 10, 100, 1000, 10000, 100000],
        "use_cases": [
            "Convertir etiquetas nutricionales entre kcal y kJ (Europa usa ambos).",
            "Calcular gasto energético en ejercicios.",
            "Entender química termodinámica.",
            "Traducir aporte calórico en publicaciones internacionales.",
            "Cálculos de eficiencia de alimentos o combustibles."
        ],
        "intro_hook": "**1 caloría = 4.184 joules**. En nutrición se usa 'kcal' (Cal con mayúscula): 1 kcal = 4184 J = 4.184 kJ.",
        "faqs_extra": [
            ("¿La 'caloría' de las etiquetas es la misma?", "**Casi, pero ojo**: en nutrición, 'Caloría' (con mayúscula) o 'Cal' significa **kilocaloría** (1000 cal). Por eso una manzana tiene '52 Cal' = 52 kcal = 52,000 cal reales. Los europeos también indican kJ (1 kcal ≈ 4.2 kJ)."),
            ("¿Cuántos kJ tiene una Coca Cola?", "Lata 354 ml regular: **140 kcal = 586 kJ**. Azúcar: 39 g (39 × 4 = 156 kcal, más gas y resto). Zero/Light: 0 kcal = 0 kJ."),
            ("¿Y una porción de pizza?", "Rebanada de pizza de muzza argentina (~120 g): **~300 kcal = 1255 kJ**. Una pizza mediana: ~1500-2000 kcal totales. Comer 3 rebanadas = ~900 kcal = medio día de energía.")
        ]
    },
    {
        "slug": "conversor-joules-a-calorias",
        "cat": "ciencia", "icon": "🔥",
        "u1": ("joule", "joules", "J"), "u2": ("caloría", "calorías", "cal"),
        "factor": 0.239006, "factor_str": "0.239006 (1/4.184)",
        "factor_origin": "Inverso: 1 J = 1 / 4.184 = 0.239006 cal termoquímicas.",
        "example_real": {
            "scenario": "Una bebida deportiva aporta 840 kJ por vaso. ¿Cuántas kcal?",
            "steps": [
                "Valor: 840 kJ = 840,000 J.",
                "Aplicar factor: `840,000 × 0.239 = 200,760 cal = 200.8 kcal`.",
                "Resultado: **~200 kcal** (serving típico de Gatorade)."
            ],
            "result": "**840 kJ = 200 kcal** (vaso de Gatorade)."
        },
        "table_values": [100, 1000, 4184, 10000, 100000, 1000000],
        "use_cases": [
            "Convertir valores europeos (kJ) a kcal para quienes están acostumbrados al sistema argentino.",
            "Interpretar especificaciones de combustibles (MJ/kg → kcal).",
            "Calcular energía metabólica en publicaciones científicas.",
            "Traducir unidades en física termodinámica.",
            "Convertir consumo de dispositivos eléctricos de J a cal."
        ],
        "intro_hook": "**1 J = 0.239 calorías** (o dividí J por 4.184 para obtener cal).",
        "faqs_extra": [
            ("¿Por qué Europa usa kJ en etiquetas nutricionales?", "El SI (Sistema Internacional) exige joules para energía. La UE requiere kJ en etiquetas para cumplir con el estándar. Agregan kcal como referencia porque la gente la entiende mejor."),
            ("¿Cuántas kcal son 2000 kJ?", "**2000 kJ / 4.184 = 478 kcal**. Aproximadamente el valor de un desayuno argentino típico (café con leche + medialunas)."),
            ("¿Qué es más útil, kJ o kcal?", "Para **nutrición cotidiana**: kcal (la gente entiende '200 kcal' más que '837 kJ'). Para **física e ingeniería**: joules (unidad SI, compatible con watts = J/s).")
        ]
    },
    {
        "slug": "conversor-kwh-a-joules",
        "cat": "ciencia", "icon": "⚡",
        "u1": ("kilowatt-hora", "kilowatts-hora", "kWh"), "u2": ("joule", "joules", "J"),
        "factor": 3600000.0, "factor_str": "3,600,000 (3.6 × 10⁶)",
        "factor_origin": "Por definición: 1 W = 1 J/s, por tanto 1 kW = 1000 J/s. 1 hora = 3600 s. Entonces 1 kWh = 1000 × 3600 J = 3,600,000 J = 3.6 MJ.",
        "example_real": {
            "scenario": "Tu heladera consume 40 kWh al mes. ¿Cuántos joules?",
            "steps": [
                "Valor: 40 kWh.",
                "Aplicar factor: `40 × 3,600,000 = 144,000,000 J = 144 MJ`.",
                "Resultado: **144 megajoules**."
            ],
            "result": "**40 kWh = 144 MJ**."
        },
        "table_values": [0.1, 1, 5, 10, 100, 1000],
        "use_cases": [
            "Convertir consumo eléctrico de facturas a joules para cálculos físicos.",
            "Comparar con contenido energético de combustibles.",
            "Analizar eficiencia energética (J por unidad).",
            "Calcular energía total de baterías (Wh → J).",
            "Estimar capacidades de generadores y plantas."
        ],
        "intro_hook": "**1 kWh = 3.6 millones de joules**. Unidad común en facturas eléctricas convertida a la unidad SI.",
        "faqs_extra": [
            ("¿Cuánta energía hay en una batería de celular?", "Batería típica 4000 mAh a 3.8V = 15.2 Wh = **54,720 J = 54.7 kJ**. En comparación, 1 kcal de comida = 4184 J. Una batería de celular 'carga' tanto como ~13 kcal."),
            ("¿Cuánto consume un hogar argentino típico?", "Promedio 2025: **300-400 kWh/mes** (CABA, 3 personas). Equivale a ~1.1 - 1.4 GJ de energía. Categoría R3 tarifa EDESUR/EDENOR aprox."),
            ("¿Cuánto cuesta 1 kWh en Argentina?", "Con tarifas 2026 post-quita de subsidios: **~AR$ 45-80/kWh** (tarifa plena según distribuidor y franja). Antes de 2024 era subsidiado (~AR$ 5-10/kWh).")
        ]
    },
    {
        "slug": "conversor-hp-a-kw",
        "cat": "ciencia", "icon": "🐎",
        "u1": ("caballo de fuerza", "caballos de fuerza", "HP"), "u2": ("kilowatt", "kilowatts", "kW"),
        "factor": 0.7457, "factor_str": "0.7457 (HP mecánico) / 0.7355 (HP métrico/CV)",
        "factor_origin": "HP mecánico (Watt, 1782) = 550 ft·lb/s = 745.7 W. HP métrico (europeo, CV caballo de vapor) = 75 kgf·m/s = 735.5 W. Diferencia pequeña (1.4%) pero existente. EE.UU. usa HP mecánico; Europa CV métrico.",
        "example_real": {
            "scenario": "Un Ford Mustang tiene 450 HP. ¿Cuántos kW?",
            "steps": [
                "Valor: 450 HP (mecánico).",
                "Aplicar factor: `450 × 0.7457 = 335.6 kW`.",
                "Resultado: **335.6 kW** (potencia de carro musclecar)."
            ],
            "result": "**450 HP = 335.6 kW**."
        },
        "table_values": [1, 10, 50, 100, 200, 500, 1000],
        "use_cases": [
            "Comparar potencia de motores entre sistemas imperial y métrico.",
            "Interpretar fichas técnicas de autos importados.",
            "Dimensionar motores eléctricos industriales.",
            "Convertir especificaciones de máquinas y generadores.",
            "Entender boletines de carreras (NASCAR vs F1 usa HP, kW)."
        ],
        "intro_hook": "**1 HP = 0.7457 kW** (HP mecánico/USA). El caballo de vapor europeo (CV) = 0.7355 kW. Diferencia del 1.4%.",
        "faqs_extra": [
            ("¿Por qué hay varios 'HP'?", "James Watt inventó el HP mecánico (1782) equivalente a 550 ft·lb/s = 745.7 W. Alemania adaptó al sistema métrico como 'CV' o 'PS' = 735.5 W. En autos europeos suele usarse CV (ej: un Audi RS5 tiene 450 CV = 444 HP)."),
            ("¿Cuánto tiene un auto típico?", "Auto nafta pequeño (Corsa): **~70-90 HP = 52-67 kW**. Mediano (Corolla): 120-150 HP = 90-112 kW. Deportivo: 300+ HP = 224+ kW. Supercar: 600+ HP = 448+ kW."),
            ("¿Los autos eléctricos usan HP o kW?", "Ambos, pero el **kW es más preciso** (es la unidad nativa eléctrica). Ejemplo: Tesla Model 3 Long Range: 324 kW = 434 HP. La relación con el torque es directa en motores eléctricos.")
        ]
    },
    {
        "slug": "conversor-kw-a-hp",
        "cat": "ciencia", "icon": "🐎",
        "u1": ("kilowatt", "kilowatts", "kW"), "u2": ("caballo de fuerza", "caballos de fuerza", "HP"),
        "factor": 1.34102, "factor_str": "1.34102 (HP mecánico) / 1.35962 (CV métrico)",
        "factor_origin": "Inverso: 1 kW = 1 / 0.7457 = 1.34102 HP mecánicos. En CV métrico: 1 kW = 1.35962 CV.",
        "example_real": {
            "scenario": "Un motor eléctrico industrial de 75 kW. ¿Cuántos HP?",
            "steps": [
                "Valor: 75 kW.",
                "Aplicar factor: `75 × 1.341 = 100.6 HP`.",
                "Resultado: **100.6 HP** (motor industrial mediano)."
            ],
            "result": "**75 kW = 100.6 HP**."
        },
        "table_values": [1, 5, 10, 50, 100, 500],
        "use_cases": [
            "Convertir potencia de motores eléctricos industriales.",
            "Comparar autos híbridos (kW) con tradicionales (HP).",
            "Interpretar especificaciones de equipos industriales.",
            "Calcular potencia de generadores y bombas.",
            "Traducir catálogos europeos a mercado americano."
        ],
        "intro_hook": "**1 kW = 1.341 HP** (mecánico) o **1.36 CV** (métrico). Multiplicar kW por 1.34 para obtener HP.",
        "faqs_extra": [
            ("¿Cuántos HP tiene un motor eléctrico de 10 kW?", "**10 kW = 13.41 HP**. Motor industrial mediano, suficiente para bombas pequeñas o compresores."),
            ("¿Y un Tesla Model S?", "Tesla Model S Plaid: **760 kW = 1019 HP**. Velocidad 0-100 km/h en 2.1 segundos. Uno de los autos más potentes disponibles comercialmente."),
            ("¿Cuánto consume un compresor de aire doméstico?", "Compresor pequeño casero: **1-2 HP = 0.75-1.5 kW**. Industrial: 10-100 HP = 7.5-75 kW. Un taller mecánico mediano usa uno de ~5 HP = 3.7 kW.")
        ]
    },
    {
        "slug": "conversor-btu-a-joules",
        "cat": "ciencia", "icon": "❄️",
        "u1": ("BTU", "BTUs", "BTU"), "u2": ("joule", "joules", "J"),
        "factor": 1055.06, "factor_str": "1055.056",
        "factor_origin": "1 BTU (British Thermal Unit) = cantidad de calor necesario para elevar 1 °F la temperatura de 1 libra de agua = 1055.056 J (valor IT). Unidad americana/británica para climatización y calor.",
        "example_real": {
            "scenario": "Un aire acondicionado tiene capacidad de 12,000 BTU/h. ¿Cuántos joules por hora?",
            "steps": [
                "Valor: 12,000 BTU (por hora).",
                "Aplicar factor: `12,000 × 1055.06 = 12,660,720 J = 12.66 MJ por hora`.",
                "Equivale a 3.516 kW de potencia de refrigeración.",
                "Resultado: **3.5 kW de refrigeración = 1 'tonelada de refrigeración'**."
            ],
            "result": "**12,000 BTU/h = 3.52 kW** (1 TR)."
        },
        "table_values": [1000, 5000, 9000, 12000, 18000, 24000, 36000],
        "use_cases": [
            "Dimensionar aire acondicionado (la capacidad se especifica en BTU/h).",
            "Convertir capacidad de calefactores y hornos.",
            "Entender eficiencia energética de electrodomésticos de calor.",
            "Calcular consumo energético de sistemas HVAC.",
            "Interpretar fichas técnicas de piletas climatizadas."
        ],
        "intro_hook": "**1 BTU = 1055 J**. Los aires acondicionados se venden por BTU/h; convertir a watts: BTU/h × 0.293 = watts.",
        "faqs_extra": [
            ("¿Qué BTU necesito para enfriar un cuarto?", "Regla: **30-40 BTU por m²** de ambiente aislado. Dormitorio 12 m² → ~400 W → 4000-5000 BTU/h. Living 25 m² → 9000-12000 BTU/h. Ambientes con sol directo: +30%."),
            ("¿Por qué aún se usan BTU?", "Tradición industrial americana. Los fabricantes de aires mantuvieron la unidad para claridad de comparación. Todos los equipos especifican BTU/h aun en mercados métricos."),
            ("¿1 frigoría es igual a 1 BTU?", "**No**. 1 frigoría = 1000 calorías negativas = 3.968 BTU. Aires en Argentina históricamente se vendían por 'frigorías/h'; hoy se estandarizó a BTU/h.")
        ]
    },
    {
        "slug": "conversor-kwh-a-calorias",
        "cat": "ciencia", "icon": "⚡",
        "u1": ("kilowatt-hora", "kilowatts-hora", "kWh"), "u2": ("kilocaloría", "kilocalorías", "kcal"),
        "factor": 860.421, "factor_str": "860.421",
        "factor_origin": "1 kWh = 3,600,000 J. 1 kcal = 4184 J. Por tanto 1 kWh = 3,600,000 / 4184 = 860.421 kcal.",
        "example_real": {
            "scenario": "Tu heladera consume 1 kWh por día. ¿Cuántas kcal?",
            "steps": [
                "Valor: 1 kWh.",
                "Aplicar factor: `1 × 860.421 = 860.421 kcal`.",
                "Resultado: **~860 kcal diarias** (equivalente energético de 3-4 manzanas)."
            ],
            "result": "**1 kWh = 860 kcal** (~3-4 manzanas)."
        },
        "table_values": [0.5, 1, 5, 10, 100, 1000],
        "use_cases": [
            "Comparar energía eléctrica con contenido energético de alimentos.",
            "Entender la magnitud de consumos energéticos domésticos.",
            "Calcular eficiencia de electrodomésticos vs energía humana.",
            "Proyectos didácticos sobre conversión de energía.",
            "Visualizar cuánta comida equivalente produce un kWh."
        ],
        "intro_hook": "**1 kWh = 860 kcal**. Curiosidad: un hogar consumiendo 10 kWh/día gasta la energía equivalente a comer 3 kg de manzanas.",
        "faqs_extra": [
            ("¿Cuánta energía necesita un humano diariamente?", "Adulto sedentario: **~2000 kcal/día = 2.3 kWh**. Activo: 2500-3000 kcal = 2.9-3.5 kWh. Atleta profesional: 4000-6000 kcal = 4.6-7 kWh/día. Equivale al consumo de varios electrodomésticos."),
            ("¿Cuánta comida necesitaría una heladera para funcionar?", "Heladera promedio: 1 kWh/día = 860 kcal. Equivale a: **1 porción grande de pasta**, o 3 manzanas, o medio chocolate Milka. Obvio, no se puede 'alimentar' una heladera con comida, pero visualiza la magnitud."),
            ("¿Pedaleando puedo generar 1 kWh?", "Un ciclista entrenado puede sostener ~200 W de potencia durante 1 hora = **0.2 kWh/hora**. Generar 1 kWh requiere 5 horas de pedaleo intenso. Sistema ineficiente vs. paneles solares (generan kWh sin esfuerzo humano).")
        ]
    },

    # ===== PRESIÓN (4) =====
    {
        "slug": "conversor-psi-a-bar",
        "cat": "ciencia", "icon": "🔧",
        "u1": ("libra por pulgada cuadrada", "libras por pulgada cuadrada", "PSI"), "u2": ("bar", "bar", "bar"),
        "factor": 0.0689476, "factor_str": "0.0689476",
        "factor_origin": "1 PSI = 6894.757 Pa. 1 bar = 100,000 Pa. Por tanto 1 PSI = 6894.757/100,000 = 0.0689476 bar.",
        "example_real": {
            "scenario": "Un neumático americano pide 32 PSI. ¿Cuánto es en bar?",
            "steps": [
                "Valor: 32 PSI.",
                "Aplicar factor: `32 × 0.0689 = 2.21 bar`.",
                "Resultado: **~2.2 bar** (presión típica para neumáticos de auto)."
            ],
            "result": "**32 PSI = 2.21 bar**."
        },
        "table_values": [10, 20, 30, 32, 40, 50, 100],
        "use_cases": [
            "Inflar neumáticos siguiendo especificaciones americanas (PSI) con manómetro argentino (bar o kPa).",
            "Interpretar manuales técnicos americanos en unidades métricas.",
            "Verificar presión de sistemas hidráulicos importados.",
            "Especificar presión de bombas de agua para proyectos binacionales.",
            "Convertir datos de presostatos y equipos industriales."
        ],
        "intro_hook": "**1 PSI = 0.0689 bar**. Regla rápida: dividí PSI por 14.5 para bar. Presión neumáticos auto: ~30 PSI = ~2 bar.",
        "faqs_extra": [
            ("¿Cuánto es 30 PSI en bar?", "**30 PSI = 2.07 bar**. Presión típica de neumáticos de auto a pasajeros. Para 4x4 o camionetas: 35-40 PSI = 2.4-2.8 bar."),
            ("¿Y 100 PSI?", "**100 PSI = 6.89 bar**. Presión máxima típica de compresores domésticos. Industrial: 150-200 PSI (10-14 bar)."),
            ("¿Por qué hay tantas unidades de presión?", "Cada industria desarrolló la suya: PSI (americana, neumáticos y gasoductos), bar (europea, caldera), kPa (científica, oficial SI), atm (química), mmHg (médica, presión arterial). Convertir entre ellas es rutinario en ingeniería.")
        ]
    },
    {
        "slug": "conversor-bar-a-psi",
        "cat": "ciencia", "icon": "🔧",
        "u1": ("bar", "bar", "bar"), "u2": ("libra por pulgada cuadrada", "libras por pulgada cuadrada", "PSI"),
        "factor": 14.5038, "factor_str": "14.5038",
        "factor_origin": "Inverso: 1 bar = 1 / 0.0689 = 14.5038 PSI. Por tanto 1 bar es casi 14.5 veces mayor que 1 PSI.",
        "example_real": {
            "scenario": "Tu neumático marca 2.4 bar. ¿Cuánto es en PSI (ficha técnica americana)?",
            "steps": [
                "Valor: 2.4 bar.",
                "Aplicar factor: `2.4 × 14.5 = 34.8 PSI`.",
                "Resultado: **~35 PSI** (valor correcto para neumáticos medianos)."
            ],
            "result": "**2.4 bar = 34.8 PSI**."
        },
        "table_values": [0.5, 1, 2, 2.4, 5, 10, 100],
        "use_cases": [
            "Especificar presión de un sistema a un cliente americano.",
            "Traducir manuales técnicos a mercados imperiales.",
            "Entender ajustes de válvulas en equipos bilingües.",
            "Calibrar equipos con escalas PSI desde un valor en bar.",
            "Convertir información meteorológica (tormentas, huracanes)."
        ],
        "intro_hook": "**1 bar = 14.5 PSI**. Para convertir bar a PSI rápido: multiplicá por 14.5.",
        "faqs_extra": [
            ("¿Cuántos PSI tiene un bar?", "**1 bar = 14.5038 PSI**. Exactamente: 1 bar = 100,000 Pa y 1 PSI = 6894.76 Pa, de donde salen los 14.5."),
            ("¿Y 10 bar?", "**10 bar = 145 PSI**. Presión típica de sistemas industriales de alta presión: calderas, hidráulica pesada, compresores grandes."),
            ("¿La presión atmosférica en bar?", "**1 atm = 1.01325 bar ≈ 14.7 PSI**. A nivel del mar en condiciones estándar. Va bajando ~0.1 bar cada 1000 m de altitud.")
        ]
    },
    {
        "slug": "conversor-atmosferas-a-pascales",
        "cat": "ciencia", "icon": "🌍",
        "u1": ("atmósfera", "atmósferas", "atm"), "u2": ("pascal", "pascales", "Pa"),
        "factor": 101325.0, "factor_str": "101,325",
        "factor_origin": "Definición exacta: 1 atm = 101,325 Pa = 1013.25 hPa = 1.01325 bar. Es la presión atmosférica promedio a nivel del mar.",
        "example_real": {
            "scenario": "La presión hidrostática a 10 m de profundidad marina es ~1 atm adicional (total 2 atm). ¿Cuánto en Pa?",
            "steps": [
                "Valor: 2 atm.",
                "Aplicar factor: `2 × 101,325 = 202,650 Pa = 202.65 kPa`.",
                "Resultado: **202.65 kPa** de presión total a 10 m de profundidad."
            ],
            "result": "**2 atm = 202.65 kPa**."
        },
        "table_values": [0.1, 0.5, 1, 2, 5, 10, 100],
        "use_cases": [
            "Cálculos de física y química (presiones de gases).",
            "Interpretar condiciones meteorológicas.",
            "Calcular efectos de altitud (montañismo, aviación).",
            "Dimensionar equipos para trabajo a profundidad (buceo).",
            "Análisis de presión en sistemas biológicos."
        ],
        "intro_hook": "**1 atm = 101,325 Pa = 1013.25 hPa**. Presión atmosférica a nivel del mar.",
        "faqs_extra": [
            ("¿Qué es exactamente 'presión atmosférica'?", "El peso de la columna de aire encima de un punto, por unidad de área. **1 atm = presión promedio a nivel del mar**. Varía con altitud (menos aire arriba = menos presión) y clima (alta/baja presión)."),
            ("¿Cuánto baja en la altura?", "Aproximadamente **-0.12 atm por 1000 m de altitud**. En La Paz (3650 m) la presión es ~0.67 atm = 68,000 Pa. En Everest (8848 m): ~0.33 atm."),
            ("¿Cuánto hay que bucear para duplicar la presión?", "A **10 metros de profundidad** la presión se duplica (2 atm totales). Cada 10 m agrega 1 atm. Los buzos profesionales manejan presiones de 5-8 atm sin problemas con descompresión adecuada.")
        ]
    },
    {
        "slug": "conversor-mmhg-a-kpa",
        "cat": "ciencia", "icon": "🩺",
        "u1": ("milímetro de mercurio", "milímetros de mercurio", "mmHg"), "u2": ("kilopascal", "kilopascales", "kPa"),
        "factor": 0.133322, "factor_str": "0.133322",
        "factor_origin": "1 mmHg = presión ejercida por 1 mm de columna de mercurio a 0°C bajo gravedad estándar = 133.322 Pa = 0.133322 kPa. Heredado del barómetro de Torricelli (1643).",
        "example_real": {
            "scenario": "Presión arterial normal 120/80 mmHg. ¿Cuánto en kPa?",
            "steps": [
                "Sistólica: 120 mmHg × 0.1333 = **16 kPa**.",
                "Diastólica: 80 mmHg × 0.1333 = **10.7 kPa**.",
                "Resultado: **120/80 mmHg = 16/10.7 kPa**."
            ],
            "result": "**120/80 mmHg = 16/10.7 kPa**."
        },
        "table_values": [60, 80, 100, 120, 140, 180, 760],
        "use_cases": [
            "Convertir presión arterial en publicaciones médicas internacionales.",
            "Interpretar presiones barométricas en meteorología.",
            "Calcular presiones en sistemas de vacío y gases.",
            "Traducir datos de medicamentos y tratamientos cardiovasculares.",
            "Entender la escala Torr en química (1 Torr ≈ 1 mmHg)."
        ],
        "intro_hook": "**1 mmHg = 0.1333 kPa**. Unidad médica para presión arterial, heredada del barómetro de mercurio clásico.",
        "faqs_extra": [
            ("¿Cuánto es presión arterial normal en kPa?", "**120/80 mmHg = 16/10.7 kPa**. Hipertensión etapa 1: 140/90 mmHg = 18.7/12 kPa. Hipotensión: <90/60 mmHg = <12/8 kPa."),
            ("¿Por qué se mide en mmHg?", "Por tradición médica: los primeros esfigmomanómetros (1881) usaban columna de mercurio real. Aunque hoy se usan digitales, la escala quedó. OMS y la mayoría de países siguen usando mmHg."),
            ("¿La presión atmosférica en mmHg?", "**1 atm = 760 mmHg**. Origen del valor: Torricelli demostró (1643) que al invertir un tubo con mercurio en un recipiente, el mercurio sube hasta 760 mm al nivel del mar. Por eso los barómetros de mercurio.")
        ]
    },

    # ===== ÁNGULOS (3) =====
    {
        "slug": "conversor-grados-a-radianes",
        "cat": "matematica", "icon": "📐",
        "u1": ("grado", "grados", "°"), "u2": ("radián", "radianes", "rad"),
        "factor": 0.0174533, "factor_str": "π/180 ≈ 0.0174533",
        "factor_origin": "Por definición: 360° = 2π rad (circunferencia completa). Por tanto 1° = 2π/360 = π/180 ≈ 0.01745329 rad. Los grados son convención sexagesimal; los radianes son naturales en matemática.",
        "example_real": {
            "scenario": "Un ángulo de 45° en geometría. ¿Cuánto en radianes?",
            "steps": [
                "Valor: 45°.",
                "Aplicar factor: `45 × π/180 = 45π/180 = π/4 rad ≈ 0.7854 rad`.",
                "Resultado: **π/4 rad ≈ 0.7854 rad**."
            ],
            "result": "**45° = π/4 rad ≈ 0.7854 rad**."
        },
        "table_values": [0, 30, 45, 60, 90, 180, 270, 360],
        "use_cases": [
            "Programación (funciones trigonométricas en C, Python, JS usan radianes por defecto).",
            "Cálculos de ingeniería donde se requieren radianes.",
            "Interpretar fórmulas matemáticas con π.",
            "Convertir ángulos de GPS y navegación.",
            "Análisis de ondas y señales periódicas."
        ],
        "intro_hook": "**1° = π/180 radianes ≈ 0.01745 rad**. Los radianes son la unidad natural de matemática: 360° = 2π rad = 6.283 rad.",
        "faqs_extra": [
            ("¿Cuántos radianes tiene 90°?", "**90° = π/2 rad ≈ 1.5708 rad**. Un cuarto de circunferencia. 180° = π rad (media circunferencia). 360° = 2π rad (completa)."),
            ("¿Por qué las funciones trigonométricas usan radianes?", "Porque las fórmulas matemáticas (derivadas, integrales) son más simples en radianes: `d(sin x)/dx = cos x` solo funciona con radianes. En grados habría que multiplicar por π/180 cada vez."),
            ("¿Cuánto es 1 radián en grados?", "**1 rad ≈ 57.296°**. Un radián corresponde al ángulo en el centro de un círculo cuyo arco tiene la misma longitud que el radio. Es una definición 'pura' geométrica.")
        ]
    },
    {
        "slug": "conversor-radianes-a-grados",
        "cat": "matematica", "icon": "📐",
        "u1": ("radián", "radianes", "rad"), "u2": ("grado", "grados", "°"),
        "factor": 57.2958, "factor_str": "180/π ≈ 57.2958",
        "factor_origin": "Inverso: 1 rad = 180/π grados ≈ 57.29578°. Se desprende de la definición: 2π rad = 360°.",
        "example_real": {
            "scenario": "Programando un juego, un ángulo de π/3 radianes. ¿En grados?",
            "steps": [
                "Valor: π/3 rad ≈ 1.0472 rad.",
                "Aplicar factor: `(π/3) × 180/π = 180/3 = 60°`.",
                "Resultado: **60°**."
            ],
            "result": "**π/3 rad = 60°**."
        },
        "table_values": [0, 0.5, 1, 1.5708, 3.1416, 6.2832],
        "use_cases": [
            "Mostrar ángulos a usuarios (más intuitivos en grados).",
            "Convertir cálculos matemáticos a formato visual.",
            "Interpretar resultados de librerías trigonométricas.",
            "Traducir datos astronómicos y GPS.",
            "Diseñar engranajes y mecanismos."
        ],
        "intro_hook": "**1 radián ≈ 57.296°**. Para convertir rad a grados: multiplicá por 180/π.",
        "faqs_extra": [
            ("¿Cuánto es π radianes en grados?", "**π rad = 180°**. Media circunferencia, por definición. 2π rad = 360° (circunferencia completa). π/2 rad = 90° (ángulo recto)."),
            ("¿Por qué usar radianes y no grados?", "**Pureza matemática**: las derivadas de sin/cos son más simples; las series de Taylor son más elegantes; las fórmulas de física (frecuencia angular) se ven naturales. En divulgación y cotidiano, los grados son más intuitivos."),
            ("¿Python usa grados o radianes?", "**Radianes por defecto**. `math.sin(math.pi/2)` = 1. Para usar grados: `math.radians(90)` o `math.degrees(1.5708)`. Mismo en JavaScript, C, Java y la mayoría de lenguajes.")
        ]
    },
    {
        "slug": "conversor-grados-a-gradianes",
        "cat": "matematica", "icon": "📐",
        "u1": ("grado", "grados", "°"), "u2": ("gradián", "gradianes", "gon"),
        "factor": 1.11111, "factor_str": "10/9 ≈ 1.1111",
        "factor_origin": "El gradián (o 'gon', usado en topografía) divide la circunferencia en **400 partes** (no 360). Por tanto 1° = 400/360 = 10/9 gon ≈ 1.1111 gon.",
        "example_real": {
            "scenario": "Un topógrafo mide un ángulo de 45°. ¿Cuánto en gradianes?",
            "steps": [
                "Valor: 45°.",
                "Aplicar factor: `45 × 10/9 = 50 gon`.",
                "Resultado: **50 gon** (exactamente 1/8 de circunferencia completa)."
            ],
            "result": "**45° = 50 gon**."
        },
        "table_values": [1, 45, 90, 180, 360],
        "use_cases": [
            "Interpretar mediciones topográficas europeas (Francia, Alemania usan gon).",
            "Convertir datos de catastro antiguo.",
            "Trabajar con instrumentos topográficos bilingües.",
            "Calcular ángulos de pendientes en ingeniería civil.",
            "Estudiar convenciones topográficas internacionales."
        ],
        "intro_hook": "**1° = 10/9 gradianes** (o 'gon'). El sistema centesimal: una circunferencia = 400 gon. Ángulo recto = 100 gon.",
        "faqs_extra": [
            ("¿Qué es un 'gon'?", "Un **gradián** o **gon**: ángulo equivalente a 1/400 de circunferencia. Un ángulo recto = 100 gon. 360° = 400 gon. Más lógico decimalmente pero con menor adopción que los grados."),
            ("¿Dónde se usa?", "En **topografía francesa y alemana** (estándar oficial de INGE, ordenanzas militares, catastro). En matemática académica casi no; en Argentina solo topógrafos antiguos o instrumentos heredados."),
            ("¿Por qué no se universalizó?", "Aunque es más lógico decimalmente (100 gon = ángulo recto), los 360° ya estaban tan arraigados (desde Babilonia) que el cambio no se generalizó. Como con el metro vs pie: la tradición gana.")
        ]
    },
]
