#!/usr/bin/env python3
"""
Enriquece calcs con contenido "thin" (explanation < 800 chars).

Agrega:
- Intro extendido (400-600 chars)
- KeyTakeaway más rico
- Explanation con ## secciones, tablas markdown, listas (1500+ chars)
- 8-10 FAQs contextuales
- 3-5 sources oficiales
- Related slugs por similaridad temática
"""
import json
import re
from pathlib import Path
from collections import defaultdict

CALCS_DIR = Path('src/content/calcs')

# ============================================================
# KEYWORDS por categoría para detectar subtipos
# ============================================================
SUBTYPE_KEYWORDS = {
    "sueldo_gremio": ["sueldo-uom", "sueldo-uocra", "sueldo-empleados-comercio", "sueldo-docente",
                      "sueldo-empleada-domestica", "sueldo-smata", "sueldo-empleado-publico",
                      "sueldo-bancario", "sueldo-camionero", "sueldo-gastronomico",
                      "sueldo-chofer", "sueldo-policia", "sueldo-enfermero", "sueldo-aeronautico",
                      "sueldo-municipal", "sueldo-militar", "sueldo-abogado", "sueldo-medico",
                      "sueldo-programador", "sueldo-panadero"],
    "impuesto_ar": ["ganancias-", "monotributo-", "bienes-personales-", "autonomos-", "sellos-",
                    "ingresos-brutos-", "patente-auto-", "abl-", "inmobiliario-", "retencion-",
                    "siradig-", "cuarta-categoria-", "deduccion-", "percepcion-", "intereses-resarcitorios",
                    "impuesto-paulista", "impuesto-transferencia"],
    "subsidio_anses": ["auh-", "asignacion-familiar", "tarjeta-alimentar", "progresar-", "jubilacion-anses",
                       "ife-", "seguro-desempleo", "potenciar-", "pami-", "pension-", "prestamo-anses",
                       "puam-", "monotributo-social", "becas-", "asignacion-nacimiento", "anses-complemento",
                       "asignacion-discapacidad", "ayuda-escolar"],
    "tramite": ["escritura-", "transferencia-auto", "vtv-", "licencia-conducir", "dnrpa-", "dni-pasaporte",
                "matrimonio-civil", "divorcio-", "sucesion-", "antecedentes-penales", "libre-deuda",
                "patente-ciclomotor", "residencia", "visa-", "ciudadania", "alta-monotributo",
                "factura-electronica", "titularidad-", "libreta-sanitaria", "baja-auto"],
    "alquiler": ["alquiler-", "expensas-", "contrato-alquiler", "seguro-caucion", "deposito-alquiler",
                 "comision-inmobiliaria", "abl-expensas", "aumento-alquiler", "desalojo-",
                 "contrato-locacion", "hipoteca-", "gastos-escriturar", "fideicomiso-construccion",
                 "impuesto-transferencia", "mudanza-", "rentabilidad-alquiler", "cuota-credito-hipotecario"],
    "embarazo_bebe": ["fecha-probable-parto", "calendario-ecografias", "peso-ideal-embarazo",
                      "calorias-embarazo", "ovulacion-", "panales-", "leche-formula-biberon",
                      "tiempo-sueno-bebe", "percentil-estatura", "vacuna-calendario", "edad-gestacional",
                      "cantidad-comida-solida", "biberones-necesarios", "fertilidad-tiempo",
                      "peso-saludable-adolescente", "aumento-altura-adolescente"],
    "dieta_salud": ["macros-", "deficit-calorico", "agua-ingesta", "proteina-diaria", "calorias-quemadas",
                    "vo2max-", "frecuencia-cardiaca", "porcentaje-grasa", "indice-glucemico", "tdee-",
                    "ciclo-carbohidratos", "ayuno-", "creatina-", "whey-", "colaciones-",
                    "dieta-mediterranea", "suplementos-deportivos", "calorias-"],
    "salud_universal": ["agua-diaria-", "ritmo-cardiaco-maximo", "tmb-basal", "horas-sueno-necesarias",
                        "cafeina-", "pasos-diarios", "indice-cintura", "perimetro-abdominal",
                        "ingesta-sodio", "azucares-", "fibra-dietetica", "vitamina-d", "hierro-diario",
                        "calcio-diario", "omega-3", "probiotico-", "pulso-arterial", "presion-arterial",
                        "glucemia-", "colesterol-", "trigliceridos-", "hemoglobina-"],
    "finanzas_univ": ["interes-compuesto-aporte", "retiro-temprano-fire", "safe-withdrawal",
                      "dca-dollar-cost", "coste-oportunidad", "valor-tiempo-dinero", "anualidad-",
                      "tasa-fisher", "prestamo-hipotecario-fijo", "refinanciacion-hipoteca",
                      "prepago-hipoteca", "plan-ahorro-meta", "portafolio-", "3-fund-portfolio",
                      "risk-parity", "drawdown-", "volatilidad-", "correlacion-activos",
                      "regla-72", "regla-114", "millonario-", "ahorro-primer-casa",
                      "precio-accion-objetivo", "comisiones-broker", "spread-bid-ask",
                      "impuesto-ganancia-capital", "etf-vs-mutual", "rebalanceo-portfolio",
                      "tax-loss-harvesting", "asset-location", "ira-401k", "hsa-fsa",
                      "529-plan", "annuity-", "social-security", "pension-defined",
                      "lifetime-value", "cac-payback"],
    "cocina": ["porciones-", "cantidad-empanadas", "cantidad-hamburguesas", "cantidad-pizzas",
               "conversion-cups", "conversion-cucharaditas", "equivalencia-huevos",
               "conversion-temperaturas-horno", "tiempos-coccion", "torta-", "masa-pizza",
               "leudado-pan", "cafe-molido", "hielo-cubos", "bebidas-evento", "chocolate-",
               "ingredientes-budin"],
    "hogar_diy": ["pintura-paredes", "azulejos-baldosas", "pintura-muebles", "caldera-potencia",
                  "aire-acondicionado-frigorias", "cortinas-medir", "cable-electrico",
                  "cerramiento-", "jardinera-tierra", "pasto-semilla", "panel-solar",
                  "calefon-termotanque", "madera-terraza", "cantidad-ladrillos", "cemento-arena",
                  "tablero-melamina", "bisagras-tornillos", "pegamento-ceramicas",
                  "juntas-pastina", "perfil-aluminio"],
    "educacion": ["promedio-ponderado", "nota-minima-aprobar", "gpa-", "tiempo-estudio",
                  "leer-rapido", "curva-olvido", "tecnica-pomodoro", "tiempo-leer-libro",
                  "horas-practica-10000", "ingles-nivel-mcer", "vocabulario-palabras",
                  "anki-tarjetas", "horas-maestria", "presupuesto-estudiar-exterior",
                  "beca-promedio", "duolingo-tiempo", "flashcards-cantidad",
                  "leer-mes-libros", "resumen-capitulo", "speed-reading"],
    "productividad": ["pomodoro-sesiones", "deep-work-", "getting-things-done", "time-blocking",
                      "eisenhower-matriz", "regla-2-minutos", "okr-objetivos", "smart-goals",
                      "kanban-wip", "scrum-sprint", "tiempo-reuniones", "email-gestion",
                      "tareas-lotes", "horas-pico-productividad", "lectura-velocidad",
                      "digital-minimalism", "multitasking-perdida", "energy-management",
                      "weekly-review", "regla-numero-dunbar"],
    "mascotas_univ": ["comida-perro", "comida-gato", "edad-gato-humano", "edad-perro-humano",
                      "pelaje-caida", "vacunas-perro", "vacunas-gato", "pecera-", "tortuga-",
                      "conejo-", "loro-", "huron-", "cobayo-", "paseos-perro", "castracion-"],
    "conversion": ["conversion-"],
    "fecha_cuanto_falta": ["cuanto-falta-", "cuantos-dias-", "edad-exacta", "dias-entre-fechas",
                           "fecha-exacta-sumar"],
    "relacion_vida": ["compatibilidad-pareja", "tiempo-superar-ruptura", "dar-tiempo-relacion",
                      "cuanto-gastar-regalo", "boda-presupuesto", "regla-amistad", "tiempo-calidad-hijos",
                      "horas-dormir-pareja", "dinero-suegra", "ahorro-luna-miel", "cumpleanos-invitados",
                      "ritmo-llamadas"],
    "viaje": ["maletas-peso", "equipaje-peso", "cantidad-ropa-viaje", "jet-lag", "presupuesto-mochilero",
              "hotel-precio-noches", "visa-turismo", "seguro-viaje", "itinerario-ciudades",
              "gasolina-viaje", "autovia-peajes", "zona-horaria", "carry-on-liquidos"],
    "idioma": ["idioma-", "aprender-idioma", "traduccion-", "duolingo", "idiomas-", "-idioma-",
               "horas-ingles", "vocabulario-", "mcer-", "fsi-", "flashcards-idioma",
               "anki-idioma", "podcasts-idioma", "peliculas-sin-subtitulos", "canciones-idioma",
               "cognados-", "acento-extranjero", "apps-idioma", "dictado-velocidad",
               "ensayos-semanales", "caligrafia-chino", "plan-estudio-idioma", "horas-caligrafia"],
    "automotor": ["auto-", "-auto", "moto-", "-moto", "neumatico", "motor", "combustible-auto",
                  "velocidad-auto", "cilindrada-", "hp-kw", "bateria-auto", "aceite-motor",
                  "correa-distribucion", "seguro-auto", "patente-auto", "rpm-", "octanaje",
                  "ciclomotor-"],
    "medio_ambiente": ["huella-carbono", "co2-", "-co2", "efecto-invernadero", "compensacion-co2",
                       "ahorro-co2", "emisiones-", "reciclaje-", "compost", "agua-ahorro",
                       "energia-solar", "panel-solar-autoconsumo", "aerogenerador-",
                       "cargador-desenchufar", "lluvia-captacion", "bolsas-plasticas", "papel-ahorrado",
                       "biodiversidad-", "zona-usda"],
    "fisica_ciencia": ["velocidad-caida", "aceleracion-", "fuerza-", "energia-cinetica", "energia-potencial",
                       "volumen-cono", "volumen-esfera", "volumen-cilindro", "trabajo-mecanico",
                       "ley-hooke", "ley-ohm", "impedancia-", "resistencia-", "tension-",
                       "efecto-doppler", "gas-ideal", "empuje-arquimedes", "presion-hidrostatica",
                       "calor-especifico", "desintegracion-radioactiva", "momento-angular",
                       "entropia-", "eficiencia-carnot", "energia-fotones", "dilucion-"],
    "deportes_entrenamiento": ["1rm-", "plan-entrenamiento", "pace-", "pace-objetivo", "fc-zonas",
                               "zonas-entrenamiento", "ftp-", "power-zones", "critical-power",
                               "mlss-", "pace-100m", "swolf-", "tiempo-descanso-ejercicio",
                               "frecuencia-entrenamiento", "volumen-semanal-series",
                               "isotonica-", "carga-semanal-running", "proyeccion-10k",
                               "proyeccion-21k", "calorias-gym", "calorias-escalada",
                               "calorias-boxeo", "calorias-surf", "gel-energetico",
                               "descanso-post-maraton", "maraton-", "ciclismo-aero",
                               "riegel-", "cameron-"],
    "salud_familia": ["costo-total-criar-hijo", "costo-criar", "panales-por-dia", "onzas-biberon",
                       "mesada-por-edad", "vacunas-faltantes", "edad-ingreso-escolar",
                       "ahorro-universidad-hijo", "tiempo-pantalla", "dosis-pediatrica",
                       "costo-fiesta-cumpleanos", "dias-licencia-maternidad", "fiestas-cumple",
                       "altura-adulta-hijo", "horas-sueno-hijo", "aumento-peso-embarazo",
                       "hitos-desarrollo", "frecuencia-desparasitar", "kilos-equipaje-viaje-bebe",
                       "numero-cuidadores", "gasto-inicio-escolar", "edad-conversar",
                       "actividades-extra-ninos", "horas-pareja", "costo-emanciparse",
                       "tiempo-proceso-adopcion", "etapas-duelo"],
    "electronica": ["resistencia-led", "potencia-electrica", "divisor-voltaje", "cable-awg",
                    "caida-tension", "consumo-electrodomestico", "transformador-",
                    "codigo-colores-resistencia", "watts-amperios", "impedancia-circuito",
                    "servo-pwm", "adaptador-enchufe", "ups-autonomia", "consumo-watts-pc"],
    "cocina_especifica": ["pizza-porcion", "sushi-", "achura-", "torta-porcion", "empanadas",
                          "receta-escalar", "marinado-", "horneo-", "hamburguesas"],
    "construccion_obra": ["zapata-", "columna-", "viga-", "escalera-", "techos-",
                          "losa-", "pared-", "contrapiso-", "zocalo-", "canaletas",
                          "machihembrado", "acero-kg-m2", "yeso-cielorraso", "revestimiento-",
                          "aislacion-", "ladrillos-hueco", "corte-optimo", "carpinteria-"],
    "jardineria": ["jardin-", "jardines-", "huerta-", "huerto-", "sembrar-", "germinacion-",
                   "fertilizante-", "semillas-", "plantas-", "cesped-semillas", "riego-",
                   "compostaje-volumen", "arbol-", "macetas-", "hidroponia-", "luz-solar-",
                   "lombrices-"],
    "tecnologia": ["dns-ttl", "subnetting-", "raid-", "wifi-", "cable-ethernet", "consumo-watts-pc",
                   "dpi-ppp", "fps-fluidez", "tiempo-descarga", "almacenamiento-video",
                   "ancho-banda", "api-tokens", "bcrypt-", "rate-limit-api", "uptime-",
                   "big-o", "cloud-ec2", "jpg-calidad", "tasa-compresion", "ram-", "bateria-",
                   "hashes-", "imagen-docker", "lineas-codigo", "tiempo-crackear",
                   "conexiones-db", "tamano-repo-git"],
    "matematica_escolar": ["ecuacion-cuadratica", "sistema-ecuaciones", "distancia-dos-puntos",
                           "teorema-pitagoras", "area-", "perimetro-", "derivada-", "integral-",
                           "determinante-", "matriz-", "factorial-", "combinaciones-",
                           "permutaciones-", "logaritmo-", "mcd-mcm", "conversion-base",
                           "porcentaje-", "regla-de-tres", "progresion-aritmetica",
                           "progresion-geometrica", "desvio-estandar", "regresion-lineal",
                           "probabilidad-binomial", "estadistica-", "mediana-moda",
                           "conversion-grados-radianes", "seno-coseno", "celsius-fahrenheit",
                           "trigonometria-"],
}


CATEGORY_FALLBACK = {
    "finanzas": "finanzas_univ",
    "salud": "salud_universal",
    "familia": "salud_familia",
    "deportes": "deportes_entrenamiento",
    "ciencia": "fisica_ciencia",
    "electronica": "electronica",
    "construccion": "construccion_obra",
    "automotor": "automotor",
    "idiomas": "idioma",
    "tecnologia": "tecnologia",
    "matematica": "matematica_escolar",
    "medio-ambiente": "medio_ambiente",
    "jardineria": "jardineria",
    "cocina": "cocina_especifica",
    "mascotas": "mascotas_univ",
    "viajes": "viaje",
    "negocios": "negocios_profesional",
    "educacion": "educacion",
    "marketing": "negocios_profesional",
}


def detect_subtype(slug, category=None):
    for subtype, keywords in SUBTYPE_KEYWORDS.items():
        for kw in keywords:
            if kw in slug:
                return subtype
    # Fallback to category
    if category and category in CATEGORY_FALLBACK:
        return CATEGORY_FALLBACK[category]
    return "generic"


# ============================================================
# SOURCES por categoría/subtipo
# ============================================================
SOURCES_BY_SUBTYPE = {
    "sueldo_gremio": [
        {"name": "Ministerio de Trabajo Argentina - Convenios Colectivos", "url": "https://www.argentina.gob.ar/trabajo/convenios-colectivos"},
        {"name": "AFIP - Retenciones Ganancias 4ta categoría", "url": "https://www.afip.gob.ar/"},
        {"name": "ANSES - Aportes y jubilación", "url": "https://www.anses.gob.ar/"},
    ],
    "impuesto_ar": [
        {"name": "AFIP - Administración Federal de Ingresos Públicos", "url": "https://www.afip.gob.ar/"},
        {"name": "Ley de Impuesto a las Ganancias 20.628", "url": "https://www.argentina.gob.ar/normativa"},
        {"name": "Infoleg - Normativa tributaria actualizada", "url": "https://www.infoleg.gob.ar/"},
    ],
    "subsidio_anses": [
        {"name": "ANSES - Administración Nacional de Seguridad Social", "url": "https://www.anses.gob.ar/"},
        {"name": "Ministerio de Capital Humano", "url": "https://www.argentina.gob.ar/capital-humano"},
        {"name": "PAMI - Prestaciones Médicas", "url": "https://www.pami.org.ar/"},
    ],
    "tramite": [
        {"name": "Argentina.gob.ar - Trámites", "url": "https://www.argentina.gob.ar/servicio/tramites"},
        {"name": "RENAPER - Registro Nacional de las Personas", "url": "https://www.argentina.gob.ar/interior/renaper"},
        {"name": "DNRPA - Registros Propiedad Automotor", "url": "https://www.dnrpa.gov.ar/"},
    ],
    "alquiler": [
        {"name": "BCRA - Índice de Contratos de Locación ICL", "url": "https://www.bcra.gob.ar/"},
        {"name": "Ley 27.551 de Alquileres", "url": "https://www.infoleg.gob.ar/"},
        {"name": "DNU 70/2023 (régimen locaciones vigente)", "url": "https://www.boletinoficial.gob.ar/"},
    ],
    "embarazo_bebe": [
        {"name": "OMS - Organización Mundial de la Salud (embarazo y crecimiento infantil)", "url": "https://www.who.int/es"},
        {"name": "Sociedad Argentina de Pediatría", "url": "https://www.sap.org.ar/"},
        {"name": "Ministerio de Salud Argentina - Calendario de Vacunación", "url": "https://www.argentina.gob.ar/salud/vacunas"},
    ],
    "dieta_salud": [
        {"name": "OMS - Guías nutricionales", "url": "https://www.who.int/es/health-topics/nutrition"},
        {"name": "FAO - Requerimientos de energía y proteínas", "url": "https://www.fao.org/nutrition/es/"},
        {"name": "ACSM - American College of Sports Medicine", "url": "https://www.acsm.org/"},
    ],
    "salud_universal": [
        {"name": "OMS - Valores de referencia en salud", "url": "https://www.who.int/es"},
        {"name": "Mayo Clinic - Información médica confiable", "url": "https://www.mayoclinic.org/es"},
        {"name": "CDC - Centers for Disease Control", "url": "https://www.cdc.gov/spanish/"},
    ],
    "finanzas_univ": [
        {"name": "Investopedia - Finanzas personales y corporativas", "url": "https://www.investopedia.com/"},
        {"name": "Bogleheads Wiki - Inversión pasiva", "url": "https://www.bogleheads.org/wiki/"},
        {"name": "SEC - U.S. Securities and Exchange Commission", "url": "https://www.sec.gov/"},
    ],
    "cocina": [
        {"name": "Consejo Argentino sobre Seguridad Alimentaria", "url": "https://www.argentina.gob.ar/salud/alimentacion-saludable"},
        {"name": "USDA - Alimentos y nutrición", "url": "https://www.usda.gov/"},
        {"name": "Cocineros Argentinos - Recetas y proporciones", "url": "https://cocinerosargentinos.com/"},
    ],
    "hogar_diy": [
        {"name": "Revista Construir - Manuales DIY", "url": "https://www.construir.com/"},
        {"name": "Instituto Argentino de Normalización (IRAM)", "url": "https://www.iram.org.ar/"},
        {"name": "Cámara Argentina de la Construcción", "url": "https://www.camarco.org.ar/"},
    ],
    "educacion": [
        {"name": "Ministerio de Educación Argentina", "url": "https://www.argentina.gob.ar/educacion"},
        {"name": "MCER - Marco Común Europeo de Referencia", "url": "https://www.cervantes.es/lengua_y_ensenanza/"},
        {"name": "FSI - Foreign Service Institute language ratings", "url": "https://www.state.gov/foreign-service-institute/"},
    ],
    "productividad": [
        {"name": "Getting Things Done - David Allen", "url": "https://gettingthingsdone.com/"},
        {"name": "Deep Work - Cal Newport", "url": "https://calnewport.com/"},
        {"name": "Harvard Business Review - Productividad", "url": "https://hbr.org/"},
    ],
    "mascotas_univ": [
        {"name": "WSAVA - World Small Animal Veterinary Association", "url": "https://wsava.org/"},
        {"name": "FCA - Federación Cinológica Argentina", "url": "https://www.fca.org.ar/"},
        {"name": "AVEPA - Veterinarios de Pequeños Animales", "url": "https://www.avepa.org/"},
    ],
    "conversion": [
        {"name": "NIST - National Institute of Standards and Technology", "url": "https://www.nist.gov/"},
        {"name": "SI - Sistema Internacional de Unidades", "url": "https://www.bipm.org/es/"},
    ],
    "fecha_cuanto_falta": [
        {"name": "INDEC - Calendario laboral Argentina", "url": "https://www.indec.gob.ar/"},
        {"name": "Argentina.gob.ar - Feriados nacionales", "url": "https://www.argentina.gob.ar/interior/feriados-nacionales-2026"},
    ],
    "relacion_vida": [
        {"name": "Gottman Institute - Investigación en relaciones", "url": "https://www.gottman.com/"},
        {"name": "APA - American Psychological Association", "url": "https://www.apa.org/"},
    ],
    "viaje": [
        {"name": "IATA - International Air Transport Association", "url": "https://www.iata.org/"},
        {"name": "OMT - Organización Mundial del Turismo", "url": "https://www.unwto.org/es"},
        {"name": "Cancillería Argentina - Información para viajar", "url": "https://www.cancilleria.gob.ar/"},
    ],
    "idioma": [
        {"name": "FSI - Foreign Service Institute (horas de aprendizaje)", "url": "https://www.state.gov/foreign-service-institute/"},
        {"name": "MCER - Marco Común Europeo de Referencia", "url": "https://www.coe.int/es/web/common-european-framework-reference-languages"},
        {"name": "Instituto Cervantes - Niveles y exámenes", "url": "https://www.cervantes.es/"},
    ],
    "automotor": [
        {"name": "DNRPA - Registros Propiedad Automotor", "url": "https://www.dnrpa.gov.ar/"},
        {"name": "ANSV - Agencia Nacional de Seguridad Vial", "url": "https://www.argentina.gob.ar/seguridadvial"},
        {"name": "ACA - Automóvil Club Argentino", "url": "https://www.aca.org.ar/"},
    ],
    "medio_ambiente": [
        {"name": "EPA - US Environmental Protection Agency", "url": "https://www.epa.gov/es"},
        {"name": "IPCC - Panel Intergubernamental sobre Cambio Climático", "url": "https://www.ipcc.ch/languages-2/spanish/"},
        {"name": "Ministerio de Ambiente Argentina", "url": "https://www.argentina.gob.ar/ambiente"},
    ],
    "fisica_ciencia": [
        {"name": "NIST - National Institute of Standards and Technology", "url": "https://www.nist.gov/"},
        {"name": "CODATA - Comité de Datos Científicos", "url": "https://www.codata.org/"},
        {"name": "Britannica - Enciclopedia científica", "url": "https://www.britannica.com/"},
    ],
    "deportes_entrenamiento": [
        {"name": "ACSM - American College of Sports Medicine", "url": "https://www.acsm.org/"},
        {"name": "ISSN - International Society of Sports Nutrition", "url": "https://www.sportsnutritionsociety.org/"},
        {"name": "NSCA - National Strength and Conditioning Association", "url": "https://www.nsca.com/"},
    ],
    "salud_familia": [
        {"name": "AAP - American Academy of Pediatrics", "url": "https://www.aap.org/"},
        {"name": "UNICEF - Salud materno-infantil", "url": "https://www.unicef.org/es"},
        {"name": "SAP - Sociedad Argentina de Pediatría", "url": "https://www.sap.org.ar/"},
    ],
    "electronica": [
        {"name": "IEEE - Institute of Electrical and Electronics Engineers", "url": "https://www.ieee.org/"},
        {"name": "IEC - International Electrotechnical Commission", "url": "https://www.iec.ch/"},
        {"name": "IRAM - Normas electrotécnicas argentinas", "url": "https://www.iram.org.ar/"},
    ],
    "cocina_especifica": [
        {"name": "Consejo Argentino sobre Seguridad Alimentaria", "url": "https://www.argentina.gob.ar/salud/alimentacion-saludable"},
        {"name": "Chef Guides - Cocina profesional", "url": "https://www.chefguide.com/"},
        {"name": "Cocineros Argentinos", "url": "https://cocinerosargentinos.com/"},
    ],
    "construccion_obra": [
        {"name": "Cámara Argentina de la Construcción", "url": "https://www.camarco.org.ar/"},
        {"name": "Instituto del Cemento Portland Argentino", "url": "https://www.icpa.org.ar/"},
        {"name": "IRAM - Normas de construcción", "url": "https://www.iram.org.ar/"},
    ],
    "jardineria": [
        {"name": "INTA - Instituto Nacional de Tecnología Agropecuaria", "url": "https://www.argentina.gob.ar/inta"},
        {"name": "USDA - Guías de jardinería", "url": "https://www.usda.gov/topics/farming"},
        {"name": "Jardín Botánico - Recursos hortícolas", "url": "https://jardinbotanico.buenosaires.gob.ar/"},
    ],
    "tecnologia": [
        {"name": "MDN Web Docs - Desarrollo web", "url": "https://developer.mozilla.org/es/"},
        {"name": "W3C - Estándares de internet", "url": "https://www.w3.org/"},
        {"name": "IETF - Internet Engineering Task Force", "url": "https://www.ietf.org/"},
    ],
    "matematica_escolar": [
        {"name": "Khan Academy - Matemáticas", "url": "https://es.khanacademy.org/math"},
        {"name": "Wolfram MathWorld - Referencia matemática", "url": "https://mathworld.wolfram.com/"},
        {"name": "Ministerio de Educación - Currículum matemática", "url": "https://www.argentina.gob.ar/educacion"},
    ],
    "negocios_profesional": [
        {"name": "Harvard Business Review - Estrategia y gestión", "url": "https://hbr.org/"},
        {"name": "SEMrush - Research de mercado", "url": "https://www.semrush.com/"},
        {"name": "Upwork / Fiverr - Benchmarks freelance", "url": "https://www.upwork.com/"},
        {"name": "Stack Overflow Developer Survey - Salarios IT", "url": "https://survey.stackoverflow.co/"},
    ],
    "generic": [
        {"name": "Hacé Cuentas - Metodología", "url": "https://hacecuentas.com/metodologia"},
        {"name": "Wikipedia - Referencia enciclopédica", "url": "https://es.wikipedia.org/"},
    ],
}


# ============================================================
# FAQ POOL por subtipo (genéricas de calidad)
# ============================================================
FAQ_POOL = {
    "sueldo_gremio": [
        ("¿Qué pasa si cambio de categoría?", "Tu sueldo básico se ajusta al de la nueva categoría más tu antigüedad. Las empresas suelen reclasificar según evaluación técnica anual o al ascender de puesto."),
        ("¿El aguinaldo (SAC) cómo se calcula?", "50% del mejor sueldo bruto de cada semestre. Se cobra dividido: mitad en junio, mitad en diciembre. Incluye todos los adicionales remunerativos (antigüedad, presentismo, horas extras promedio)."),
        ("¿Me descuentan Ganancias si gano poco?", "Hay un mínimo no imponible (MNI) anual que se actualiza cada 6 meses. Si tu bruto anual está por debajo, no pagás. Por encima, pagás solo sobre el excedente (escala progresiva)."),
        ("¿Cuánto son las vacaciones?", "Según Ley de Contrato de Trabajo: 14 días hasta 5 años de antigüedad, 21 días de 5-10 años, 28 días de 10-20 años, 35 días +20 años. Se pagan con un plus del 1/25 del sueldo."),
        ("¿Cómo reclamo si mi sueldo está mal?", "Primero hablá con RR.HH. Si no se resuelve: el sindicato tiene asesoría gratuita. Como último recurso: denuncia en el Ministerio de Trabajo o juicio laboral."),
        ("¿Me pueden pagar parte 'en negro'?", "Es ilegal. El bruto total debe estar registrado en el recibo. Si se paga parte fuera de recibo, podés denunciarlo y reclamar las diferencias (incluye aportes jubilatorios)."),
    ],
    "impuesto_ar": [
        ("¿Qué pasa si no declaro?", "Multas + intereses (6% mensual resarcitorios + 8% si hay juicio ejecutivo). Si es omisión dolosa, puede haber sanciones penales (Ley Penal Tributaria)."),
        ("¿Se puede pagar en cuotas?", "Sí, AFIP ofrece planes de pagos con reducción de intereses. Las cuotas varían según el monto y se pueden financiar a 12-60 meses."),
        ("¿Cuándo se actualiza?", "La mayoría de los topes e impuestos se ajustan semestralmente (enero y julio) según RIPTE, IPC o otros índices. Los sellos e inmobiliarios: anualmente."),
        ("¿Qué pasa si vivo en otra provincia?", "Los impuestos nacionales (Ganancias, IVA) son iguales en todo el país. Los provinciales (Sellos, IIBB, Inmobiliario) cambian por jurisdicción."),
        ("¿Cómo genero la boleta de pago?", "Desde el portal AFIP (afip.gob.ar) con tu CUIT y Clave Fiscal. Se paga con VEP (Volante Electrónico de Pago) en home banking o en Rapipago/Pago Fácil."),
    ],
    "subsidio_anses": [
        ("¿Cómo cobro si soy nuevo beneficiario?", "Alta en ANSES (con turno previo) + CBU a tu nombre + DNI. El primer pago sale 30-45 días después del alta aprobada."),
        ("¿Compatible con otros planes?", "Depende del programa. AUH es compatible con Tarjeta Alimentar y Progresar. Incompatible con empleo formal registrado."),
        ("¿Cómo consulto si me corresponde?", "Desde 'Mi ANSES' online (necesitás Clave de la Seguridad Social) o atención telefónica al 130. Mirá tu historial de pagos pendientes y subsidios posibles."),
        ("¿Qué pasa si dejo de cumplir requisitos?", "Se suspende el pago. Si es falsa declaración: podés tener que devolver lo cobrado indebidamente con intereses."),
        ("¿Cuándo se actualiza el monto?", "Trimestralmente por ley de movilidad previsional. Los ajustes se publican en Boletín Oficial e Infoleg."),
    ],
    "tramite": [
        ("¿Necesito turno previo?", "La mayoría sí. Se sacan por internet en argentina.gob.ar o la web del organismo. Presencial sin turno: solo casos urgentes."),
        ("¿Cuánto tarda?", "Varía por trámite: DNI 15 días, pasaporte 15 días, escritura 30-60 días (con toda la documentación lista). Express disponible con costo adicional."),
        ("¿Puedo hacerlo online?", "Muchos sí: AFIP, ANSES, Registro Civil (partidas), cambio de domicilio. Otros requieren presencia física (escritura, matrimonio, algunos registros)."),
        ("¿Qué documentos llevo?", "Casi siempre: DNI original + copia, constancia de CUIT, certificado de domicilio. Trámites específicos piden adicionales (testigos, partidas, fotos)."),
        ("¿Puedo delegar en un gestor?", "Sí, con poder ante escribano. El gestor cobra honorarios (típicamente $50k-200k según trámite) pero ahorra filas y tiempo."),
    ],
    "alquiler": [
        ("¿Qué garantías pide el propietario?", "Propietaria (garante con inmueble), seguro de caución (aseguradora cubre), recibo de sueldo 3x el alquiler, o fianza solidaria."),
        ("¿Puedo rescindir antes de tiempo?", "Sí, pagando indemnización: 1 mes si rescinds en el primer año, 1.5 meses si es después. La ley permite preaviso de 3 meses."),
        ("¿Los aumentos tienen tope?", "Con DNU 70/2023: libre pacto. Sin DNU: anual por ICL (BCRA). Negociable entre partes al firmar."),
        ("¿Quién paga las reparaciones?", "Propietario: reparaciones estructurales y del inmueble. Inquilino: desgaste por uso normal + pequeñas reparaciones (vidrios, lámparas, grifería)."),
        ("¿Me pueden echar si estoy pagando?", "No por incumplimiento de pago si estás al día. Sí por vencimiento de contrato, venta del inmueble (con preaviso) o incumplimientos mayores."),
    ],
    "embarazo_bebe": [
        ("¿Cuándo confirmar el embarazo?", "Test de embarazo desde el día del atraso. Confirmación con ECO temprana entre la semana 6 y 8 para ver latidos y ubicación."),
        ("¿Qué controles debo hacer?", "ECO cada trimestre (temprana, morfológica, crecimiento). Análisis de sangre trimestrales. Control de presión y peso cada mes."),
        ("¿Qué alimentos evitar?", "Alcohol, tabaco, carnes crudas, pescado con alto mercurio, lácteos no pasteurizados, cafeína excesiva (>200mg/día)."),
        ("¿Cuándo empiezan los movimientos?", "Primera vez: semanas 18-22. Después de un embarazo previo: semana 14-16 (los sentís antes)."),
        ("¿Lactancia exclusiva cuánto tiempo?", "OMS recomienda 6 meses exclusivos. Después, alimentos complementarios + leche materna hasta los 2 años (o más según la diada)."),
        ("¿Vacunas esenciales para el bebé?", "Al nacer: BCG + Hep B. Luego calendario por edad: 2-4-6 meses pentavalente. Al año: triple viral. Obligatorias y gratuitas."),
    ],
    "dieta_salud": [
        ("¿Cuántas calorías necesito al día?", "Depende de edad, sexo, peso, actividad. En general: mujer adulta 1800-2200 kcal, hombre 2200-3000 kcal. Usá calc TDEE para exacto."),
        ("¿Puedo bajar de peso rápido?", "Saludable: 0.5-1 kg/semana. Más rápido: pérdida muscular y efecto rebote. Lo sostenible es lento y constante."),
        ("¿Cuánta proteína diaria?", "Sedentario: 0.8g/kg. Activo: 1.2-1.5g/kg. Hipertrofia muscular: 1.6-2.2g/kg peso magro. Tope útil ~2.2g/kg."),
        ("¿Suplementos funcionan?", "Creatina y whey protein tienen evidencia sólida. BCAAs y multivitamínicos: menor evidencia. Siempre dieta > suplementos."),
        ("¿Ayuno intermitente es seguro?", "Para adultos sanos sí. Contraindicado en: embarazo, trastornos alimentarios, diabetes insulinodependiente. Consultar médico antes."),
        ("¿El agua con limón sirve para adelgazar?", "No directamente. Hidrata, puede saciar el apetito y tiene vitamina C, pero no quema grasa. El déficit calórico es lo único que hace perder peso."),
    ],
    "salud_universal": [
        ("¿Cuándo consultar al médico?", "Si los valores están fuera de rangos normales, si hay síntomas asociados, o si hay historia familiar de enfermedades cardiovasculares/metabólicas."),
        ("¿Los valores normales son iguales para todos?", "No. Varían por edad, sexo, etnia y factores individuales. Los rangos son promedios estadísticos — tu contexto personal manda."),
        ("¿Medicamentos afectan los valores?", "Sí, muchos fármacos (estatinas, betabloqueantes, diuréticos) alteran valores. Siempre informá tu medicación al hacer análisis."),
        ("¿Qué hábitos mejoran estos valores?", "Ejercicio regular (150min/semana), dieta balanceada (frutas, verduras, menos procesados), buen sueño (7-9h), no fumar, alcohol moderado."),
        ("¿Cada cuánto hacerse chequeos?", "Adultos sanos: análisis general cada 1-2 años. Mayores de 40: anual. Con factores de riesgo: según indicación médica."),
    ],
    "finanzas_univ": [
        ("¿Qué retorno esperar del mercado?", "S&P 500 histórico: ~10% nominal anual (7% real ajustado por inflación). Pasado no predice futuro pero es referencia."),
        ("¿Cuánto ahorrar para jubilarme?", "Regla FIRE: 25x tus gastos anuales. Ej: gastás $30k/año → necesitás $750k invertidos (con retiro seguro 4%)."),
        ("¿ETF o acciones individuales?", "ETFs para mayoría (diversificados, costo bajo, pasivos). Acciones individuales: solo si dedicás tiempo a análisis (más riesgo, más volatilidad)."),
        ("¿Cuándo empezar a invertir?", "Lo antes posible. El interés compuesto favorece el tiempo. $100/mes desde los 20 rinde más que $500/mes desde los 40."),
        ("¿Qué hago si cae el mercado?", "Mantener el curso. Ventas en pánico es el peor enemigo. DCA consistente + horizonte largo supera crisis (2000, 2008, 2020 lo demostraron)."),
        ("¿Diversificar cuánto?", "3-Fund Portfolio (US + Intl + Bonds) cubre el 95% de los beneficios de diversificación. Más complejidad no garantiza más rentabilidad."),
    ],
    "generic": [
        ("¿Es gratis?", "Sí, todas nuestras calculadoras son gratuitas y sin registro."),
        ("¿Los resultados son precisos?", "Son orientativos. Usamos fórmulas estándar validadas internacionalmente. Para casos críticos consultá con un profesional."),
        ("¿Guardan mis datos?", "No. Los cálculos se hacen en tu navegador. No enviamos datos a ningún servidor."),
        ("¿Funciona en móvil?", "Sí, el sitio es completamente responsive y funciona perfecto en celular."),
        ("¿Hay versión en otros idiomas?", "Tenemos versiones en inglés (/en), español de México (/mx), español de España (/es) y otras."),
    ],
}


# ============================================================
# EXPLANATION TEMPLATES por subtipo
# ============================================================

def build_explanation(slug, h1, desc, category, subtype, fields_info):
    """Construye un explanation denso (1500+ chars) según subtipo."""

    intros = {
        "sueldo_gremio": f"El **cálculo del sueldo por gremio** en Argentina sigue el Convenio Colectivo de Trabajo (CCT) específico del sector. Cada CCT define categorías, básicos por categoría, antigüedad, adicionales remunerativos y no remunerativos, y aportes/retenciones obligatorias.",
        "impuesto_ar": f"Los **impuestos argentinos** se rigen por la normativa nacional (AFIP) y provincial según corresponda. Esta calculadora aplica las escalas y alícuotas vigentes 2026, con sus deducciones, mínimos no imponibles y tratamientos específicos.",
        "subsidio_anses": f"Los **subsidios y asignaciones ANSES** se actualizan por la Ley de Movilidad (IPC mensual desde 2024). Los requisitos, montos y liquidación dependen de cada programa y su marco regulatorio.",
        "tramite": f"Los **trámites oficiales** en Argentina tienen costos, tiempos y requisitos definidos por cada organismo (RENAPER, DNRPA, AFIP, Migraciones, Registro Civil, etc.). Esta calculadora te estima el costo total y los documentos necesarios.",
        "alquiler": f"El **mercado de alquileres** en Argentina está regulado por el Código Civil y Comercial + DNU 70/2023 (que derogó parcialmente la Ley 27.551). Hay libertad de pacto para moneda, plazo e índice de actualización.",
        "embarazo_bebe": f"La **salud materno-infantil** tiene parámetros internacionales (OMS, UNICEF) adaptados localmente por la Sociedad Argentina de Pediatría. Los controles, vacunas y alimentación siguen guías actualizadas periódicamente.",
        "dieta_salud": f"La **nutrición y el fitness** se basan en principios físicos (balance energético) y biológicos (macronutrientes, micronutrientes). Esta calculadora usa fórmulas validadas por la comunidad científica (ACSM, ISSN, NIH).",
        "salud_universal": f"Los **valores normales en salud** provienen de estudios poblacionales masivos (NHANES, WHO, CDC). Varían según edad, sexo, etnia y región. Son orientativos; tu historia clínica personal siempre tiene precedencia.",
        "finanzas_univ": f"Las **finanzas personales e inversión** usan principios matemáticos universales (interés compuesto, valor tiempo del dinero, optimización riesgo-retorno). Esta calculadora aplica fórmulas estándar de la industria financiera.",
        "cocina": f"Las **medidas en cocina** siguen estándares internacionales (sistema métrico + tradiciones culinarias regionales). Las recetas suelen usar tazas, cucharadas y gramos según origen. Conocer las equivalencias es clave.",
        "hogar_diy": f"El **cálculo DIY para hogar y construcción** se basa en rendimientos conocidos de materiales (m² por litro de pintura, ladrillos por m² de pared, etc.). Normas IRAM y buenas prácticas de la industria.",
        "educacion": f"Los **métodos de estudio y aprendizaje** tienen base en ciencia cognitiva (Ebbinghaus, Bjork, Dunlosky). Técnicas como spaced repetition, active recall y interleaving tienen evidencia sólida.",
        "productividad": f"La **productividad personal** combina psicología, neurociencia y gestión del tiempo. Métodos como GTD (Allen), Deep Work (Newport), Pomodoro y OKRs son los más usados globalmente por efectividad probada.",
        "mascotas_univ": f"El **cuidado de mascotas** sigue guías veterinarias internacionales (WSAVA, AAHA). Alimentación, vacunación y desparasitación tienen protocolos por especie, raza, peso y edad.",
        "conversion": f"Las **conversiones de unidades** son la base de ciencia, ingeniería y vida cotidiana. Sistema métrico (SI) es estándar global. EE.UU. y algunos territorios mantienen sistema imperial.",
        "fecha_cuanto_falta": f"Los **cálculos de tiempo y fechas** usan el calendario gregoriano (1582) adoptado universalmente. Días hábiles, feriados y vencimientos varían por país.",
        "relacion_vida": f"Los **cálculos de relaciones y vida social** se basan en investigaciones (Gottman Institute, Dunbar). Son orientativos — cada relación es única.",
        "viaje": f"Los **viajes internacionales** requieren planificación: visas, equipaje, presupuesto, seguros. Regulaciones IATA, OACI y cada país tienen normas específicas.",
        "idioma": f"**Aprender un idioma** es un esfuerzo sostenido de cientos de horas. La ciencia cognitiva (Ebbinghaus, spaced repetition) + inmersión + práctica activa son los pilares demostrados por FSI y Cambridge.",
        "automotor": f"Los **cálculos automotrices** son esenciales para dueños de autos, motos y otros vehículos: rendimiento de combustible, costos de mantenimiento, presión de neumáticos, conversiones de potencia, tiempos de amortización.",
        "medio_ambiente": f"El **medio ambiente** es un tema clave del siglo XXI. Medir tu impacto (CO₂, agua, residuos) y reducirlo con acciones concretas es responsabilidad individual y colectiva.",
        "fisica_ciencia": f"La **física aplicada** resuelve problemas cotidianos: desde la caída libre hasta la electricidad del hogar. Fórmulas validadas en experimentos durante siglos.",
        "deportes_entrenamiento": f"El **entrenamiento deportivo** combina ciencia (fisiología, biomecánica) y práctica. Las zonas de intensidad, carga progresiva, descanso y nutrición forman el sistema completo.",
        "salud_familia": f"La **familia y crianza** involucran salud, economía, educación. Cada etapa tiene hitos, gastos y decisiones específicas.",
        "electronica": f"La **electrónica** se rige por leyes de Ohm, Kirchhoff, Faraday. Aplicar fórmulas evita errores costosos y fallos eléctricos.",
        "cocina_especifica": f"La **cocina con precisión** mejora resultados. Porciones, escalado de recetas, tiempos de cocción siguen patrones predictibles.",
        "construccion_obra": f"La **construcción** requiere cálculos técnicos: hormigón, acero, ladrillos, revoques, impermeabilización. IRAM y CAC estandarizan procesos.",
        "jardineria": f"La **jardinería/huerta** combina agronomía, botánica y clima. INTA publica guías locales para Argentina.",
        "tecnologia": f"Las **calculadoras técnicas** para IT: latencia, almacenamiento, uptime SLA, costos cloud. Decisiones que escalan.",
        "matematica_escolar": f"Las **matemáticas** son herramientas universales: álgebra, geometría, cálculo, estadística. Aplicadas en ingeniería, ciencia, finanzas, vida cotidiana.",
        "negocios_profesional": f"Los **cálculos de negocios, marketing y freelance** son esenciales para emprendedores y profesionales independientes: precios por hora, CAC, LTV, márgenes, ROI, proyecciones. Decisiones data-driven basadas en benchmarks del sector.",
        "generic": f"Esta calculadora aplica la fórmula estándar internacional para el cálculo requerido. Los valores se actualizan periódicamente.",
    }

    intro = intros.get(subtype, intros["generic"])

    # Sección "Cómo se calcula"
    formula_section = f"""## Cómo se calcula

{desc}

Esta calculadora aplica la fórmula con los valores que ingreses, verificando rangos típicos y alertando ante valores fuera de lo razonable."""

    # Tabla de referencia por subtipo
    tables = {
        "sueldo_gremio": """## Componentes del sueldo típicos

| Concepto | Cálculo | Impacto |
|---|---|---|
| Básico | Según categoría CCT | 100% base |
| Antigüedad | 1-2% × años × básico | +10-30% |
| Presentismo | Hasta 8.33% | Variable |
| Horas extras 50% | Días hábiles post 8hs | Variable |
| Horas extras 100% | Sábados post 13hs + dom + feriados | Variable |
| Jubilación | 11% bruto | Descuento |
| Obra social | 3% bruto | Descuento |
| PAMI | 3% bruto | Descuento |
| Ganancias | Escala si supera MNI | Descuento |""",
        "impuesto_ar": """## Escala y tratamientos

| Aspecto | Detalle |
|---|---|
| Base imponible | Monto sujeto al impuesto |
| Alícuota | % aplicado a la base |
| Mínimo no imponible | Monto hasta el que no se paga |
| Deducciones | Gastos que reducen la base |
| Actualización | Semestral (IPC/RIPTE) |
| Vencimiento | Mensual, bimestral o anual según impuesto |""",
        "subsidio_anses": """## Requisitos típicos ANSES

| Requisito | Detalle |
|---|---|
| CUIL | Obligatorio, personal e intransferible |
| Clave Seguridad Social | Para Mi ANSES online |
| CBU | Cuenta a nombre del beneficiario |
| Ingreso familiar | Tope según programa |
| Controles | Salud y escolaridad (para AUH) |""",
        "embarazo_bebe": """## Hitos del embarazo y primera infancia

| Etapa | Edad / Semana | Hito |
|---|---|---|
| 1er ECO | Semana 6-8 | Confirmación embarazo |
| Scan nucal | Semana 11-14 | Detección aneuploidías |
| ECO morfológica | Semana 20-22 | Evaluación anatómica |
| 3er ECO | Semana 32-34 | Crecimiento y placenta |
| Nacimiento | Semana 37-42 | A término |
| 2 meses | 2 meses | Pentavalente + OPV + Rota |
| 6 meses | 6 meses | Alimentación complementaria |
| 12 meses | 1 año | Triple viral + Hep A |""",
        "dieta_salud": """## Distribución calórica estándar

| Macronutriente | % Caloric | Gramos/kcal |
|---|---|---|
| Proteína | 15-35% | 4 kcal/g |
| Carbohidratos | 45-65% | 4 kcal/g |
| Grasas | 20-35% | 9 kcal/g |
| Alcohol | — | 7 kcal/g |
| Fibra | Mínimo 25-38g/día | — |""",
        "salud_universal": """## Valores de referencia normales

| Parámetro | Rango normal adulto |
|---|---|
| Presión arterial | <120/80 mmHg |
| FC reposo | 60-100 bpm |
| Temperatura | 36.1-37.2°C |
| SpO2 | 95-100% |
| Glucemia ayunas | 70-100 mg/dL |
| HbA1c | <5.7% |
| Colesterol total | <200 mg/dL |
| LDL | <100 mg/dL |
| HDL | >40 (H) / >50 (M) |""",
        "finanzas_univ": """## Benchmarks típicos por plazo

| Plazo | S&P 500 | Bonos 10y | Cash |
|---|---|---|---|
| 1 año | Muy variable | 4-5% | 3-5% |
| 5 años | ~8% prom | ~4% | Inflación |
| 10 años | ~9-10% | ~4% | <inflación |
| 20+ años | ~10% nominal | ~5% | N/A |""",
    }

    table = tables.get(subtype, "")

    # Warnings / recomendaciones
    warnings = {
        "sueldo_gremio": """## Consideraciones

- Verificá que tu **categoría formal** coincida con las tareas que realmente hacés. Si no, reclamá al sindicato.
- El **recibo de sueldo** debe desglosar todos los conceptos. Si ves "en negro" parte del pago, es ilegal.
- **Paritarias vigentes**: consultá periódicamente la web del gremio, los valores se actualizan cada 3-4 meses.
- Para **cálculos definitivos de indemnización**: consultar con abogado laboralista, hay variables complejas.""",
        "impuesto_ar": """## Cuándo consultar a un contador

- Si tu situación combina varios ingresos (empleo + freelance + inversiones).
- Si tenés bienes en el exterior (tratamiento especial Bienes Personales).
- Si vas a vender un inmueble o activos grandes.
- Para planificación fiscal anual (elegir régimen óptimo).
- Ante una inspección, intimación o requerimiento AFIP.""",
        "subsidio_anses": """## Derechos y obligaciones

- Los subsidios son **derechos adquiridos** mientras cumplas los requisitos. No son "beneficencia".
- **Actualización automática**: no hay que rearmar el trámite cada 3 meses.
- **Falsas declaraciones**: pueden derivar en cese de pago, devolución del cobrado indebidamente e inhabilitación futura.
- **Consultá siempre fuentes oficiales** (anses.gob.ar, 130). Evitá intermediarios que cobren "gestión".""",
        "embarazo_bebe": """## Cuándo consultar urgente

- Sangrado abundante, dolor abdominal intenso, fiebre alta durante el embarazo.
- Bebé con dificultad respiratoria, convulsiones, fiebre >38°C en menores de 3 meses.
- No hay movimientos fetales durante más de 12 horas (tercer trimestre).
- Ictericia severa en recién nacido (más allá de la primera semana).
- Rechazo alimenticio prolongado o deshidratación.""",
        "dieta_salud": """## Cuándo consultar al nutricionista

- Si tenés patologías (diabetes, HTA, insuficiencia renal) que requieran dieta personalizada.
- Si querés ganar masa muscular importante o competir en deporte.
- Si tenés desorden alimentario (atracones, restricciones extremas).
- Si llevás más de 3 meses sin progresar hacia tu meta.
- Para planificar alimentación vegana/vegetariana completa.""",
        "finanzas_univ": """## Principios de inversión

- **No tocar el plan** durante crisis. La emoción es el peor consejero.
- **Diversificar**: no concentrar en un solo activo/sector/país.
- **Costos bajos**: TER >1% anual te come 30% del retorno en 30 años.
- **Horizonte largo**: renta variable funciona en 10+ años, no en 1 año.
- **Rebalanceo**: una vez al año, no más.""",
    }
    warning = warnings.get(subtype, "")

    parts = [
        intro,
        formula_section,
        table if table else "",
        warning if warning else "",
        "## Notas finales\n\nEste cálculo es una referencia orientativa. Para decisiones críticas (financieras, médicas, legales), consultá con un profesional especializado. Los valores están actualizados a 2026 y se revisan periódicamente."
    ]

    return "\n\n".join(p for p in parts if p)


def build_intro(h1, desc, subtype, category):
    contexts = {
        "sueldo_gremio": f"Si trabajás en un sector con Convenio Colectivo de Trabajo propio, tu sueldo se rige por el CCT correspondiente con básicos por categoría, antigüedad, adicionales y aportes específicos. ",
        "impuesto_ar": f"Los impuestos argentinos suelen tener varios componentes: base imponible, alícuotas progresivas, deducciones admitidas y mínimos no imponibles. ",
        "subsidio_anses": f"ANSES administra subsidios y asignaciones familiares con requisitos de acceso, montos mensuales actualizados por movilidad y condicionalidades para mantener el beneficio. ",
        "tramite": f"Los trámites oficiales en Argentina tienen costos variables por jurisdicción, tiempos de entrega y documentación requerida. Conocerlos antes de iniciar te ahorra viajes y sorpresas. ",
        "alquiler": f"El mercado de alquileres en Argentina tiene normativa específica (DNU 70/2023 vigente), índices de actualización (ICL del BCRA), comisiones inmobiliarias y gastos recurrentes como expensas. ",
        "embarazo_bebe": f"La salud materno-infantil sigue estándares internacionales (OMS) adaptados por la Sociedad Argentina de Pediatría. Controles, vacunas y alimentación son clave en los primeros 1000 días. ",
        "dieta_salud": f"La nutrición y el fitness se basan en principios físicos (balance energético) y biológicos. Las fórmulas validadas te dan puntos de partida, ajustable según tu respuesta individual. ",
        "salud_universal": f"Los valores de referencia en salud provienen de estudios poblacionales (NHANES, WHO). Te dan un marco para interpretar tus resultados, pero tu contexto personal manda. ",
        "finanzas_univ": f"Las finanzas personales aplican principios universales: interés compuesto, diversificación, horizonte largo, costos bajos. Herramientas que funcionan en cualquier mercado mundial. ",
        "cocina": f"La cocina combina ciencia (reacciones químicas) con tradición. Las proporciones y tiempos aseguran resultados consistentes. Conocer equivalencias te libera del apego a una receta específica. ",
        "hogar_diy": f"El DIY para el hogar y construcción se basa en rendimientos conocidos (m² por unidad, kg por m², etc.). Calcular bien al principio evita viajes extras al corralón y sobrantes. ",
        "educacion": f"Los métodos de estudio modernos aprovechan la ciencia cognitiva: spaced repetition, active recall, interleaving. Aplicados correctamente, aprendés más rápido y con mayor retención. ",
        "productividad": f"La productividad no es trabajar más horas, es trabajar bien menos tiempo. GTD, Deep Work, Pomodoro y OKRs son los sistemas más validados globalmente. ",
        "mascotas_univ": f"El cuidado responsable de mascotas requiere conocer necesidades por especie, raza y etapa de vida. Alimentación, vacunas y ejercicio adecuados son la base. ",
        "conversion": f"Las conversiones de unidades son fundamentales en ciencia, ingeniería y vida diaria. El sistema SI es estándar global; algunos países usan el imperial para tradición o comercio. ",
        "fecha_cuanto_falta": f"Los cálculos de tiempo y fechas son esenciales para planificar eventos, deadlines y metas. Considerar feriados, días hábiles y husos horarios evita sorpresas. ",
        "relacion_vida": f"Las relaciones humanas siguen patrones estudiados por la psicología social. Entenderlos te ayuda a tomar mejores decisiones personales. ",
        "viaje": f"Planificar viajes bien te ahorra tiempo, dinero y dolores de cabeza. Visas, equipaje, presupuesto y seguros son los 4 ejes críticos. ",
        "idioma": f"Aprender un idioma requiere horas de exposición dosificada. Según FSI, para hispanohablantes: italiano/portugués ~600h, inglés/francés ~900h, alemán ~1100h, árabe/chino ~2200h. Estrategia: consistencia > intensidad. ",
        "automotor": f"El mantenimiento y operación eficiente del auto implican cálculos de consumo, potencia, presión, torque y rendimiento. Aplicar las fórmulas correctas evita sobreconsumo y daños mecánicos. ",
        "medio_ambiente": f"La huella de carbono mide el impacto ambiental de actividades humanas. Conocer tus emisiones de CO₂ te permite reducirlas con acciones concretas (transporte, energía, consumo, alimentación). ",
        "fisica_ciencia": f"Las leyes físicas son universales y deterministas. Conocer las fórmulas te permite resolver problemas de movimiento, energía, fuerzas, ondas, termodinámica y electromagnetismo aplicados a la vida real. ",
        "deportes_entrenamiento": f"El entrenamiento deportivo se basa en principios fisiológicos (adaptación, supercompensación, especificidad). Las zonas de intensidad, la carga semanal y la recuperación son pilares del rendimiento. ",
        "salud_familia": f"La crianza y bienestar familiar requieren planificación en múltiples dimensiones: salud, economía, educación, tiempo de calidad. Cada etapa (embarazo, bebé, niñez, adolescencia) tiene hitos y gastos específicos. ",
        "electronica": f"La electrónica básica se rige por leyes de Ohm, Kirchhoff y principios de semiconductores. Cálculos de resistencia, potencia, voltaje y amperaje son la base para diseñar y mantener circuitos. ",
        "cocina_especifica": f"La cocina exitosa combina técnica, proporciones y tiempo. Las recetas usan cantidades por porción; escalar requiere conversiones precisas para mantener el balance de sabor y textura. ",
        "construccion_obra": f"Construir o refaccionar requiere cálculos precisos: cantidad de materiales, dosificación de hormigón, rendimiento por m², costos unitarios. Errores típicos generan sobrantes, faltantes o fallas estructurales. ",
        "jardineria": f"La jardinería y huerta exitosa combina conocimiento del clima, suelo, especies y calendario de siembra. Los cálculos de superficie, cantidad de plantas y riego son fundamentales para la planificación. ",
        "tecnologia": f"Los cálculos técnicos en IT y desarrollo son fundamentales: latencia, ancho de banda, uptime SLA, costos de cloud, complejidad algorítmica. Un buen cálculo inicial evita sobredimensionar infraestructura. ",
        "matematica_escolar": f"Las matemáticas escolares y universitarias se apoyan en fórmulas estándar validadas internacionalmente. Álgebra, geometría, cálculo, estadística y trigonometría son las áreas más consultadas. ",
        "negocios_profesional": f"Los negocios y profesionales independientes dependen de cálculos precisos: costos por hora, margen de ganancia, CAC, LTV, ROI, break-even. Benchmarks del sector y data-driven thinking son clave para decisiones rentables. ",
        "generic": f"Esta calculadora te ayuda con un cálculo específico aplicando las fórmulas y referencias más usadas. ",
    }

    context = contexts.get(subtype, contexts["generic"])
    return context + desc + f" Los valores están actualizados a 2026 y se revisan periódicamente para mantenerte al día."


def enrich_faqs(existing_faqs, subtype):
    """Agrega faqs del pool si hay menos de 8."""
    if len(existing_faqs) >= 8:
        return existing_faqs

    pool = FAQ_POOL.get(subtype, []) + FAQ_POOL["generic"]
    existing_questions = {f.get("q", "").lower() for f in existing_faqs}

    to_add = 8 - len(existing_faqs)
    added = 0
    for q, a in pool:
        if q.lower() not in existing_questions and added < to_add:
            existing_faqs.append({"q": q, "a": a})
            added += 1

    return existing_faqs


def get_sources(subtype):
    return SOURCES_BY_SUBTYPE.get(subtype, SOURCES_BY_SUBTYPE["generic"])


def enrich_calc(path):
    try:
        d = json.loads(path.read_text())
    except:
        return False

    slug = d.get("slug", path.stem)
    h1 = d.get("h1", "")
    desc = d.get("description", "")
    category = d.get("category", "generic")

    subtype = detect_subtype(slug, category)

    # Expand explanation
    d["explanation"] = build_explanation(slug, h1, desc, category, subtype, d.get("fields", []))

    # Expand intro
    old_intro = d.get("intro", "")
    if len(old_intro) < 400:
        d["intro"] = build_intro(h1, desc, subtype, category)

    # Enrich FAQs
    d["faq"] = enrich_faqs(d.get("faq", []), subtype)

    # Add sources if missing or short
    if len(d.get("sources", [])) < 3:
        d["sources"] = get_sources(subtype)

    path.write_text(json.dumps(d, ensure_ascii=False, indent=2))
    return True


def main():
    import sys
    only_generic = "--only-generic" in sys.argv
    all_calcs = list(CALCS_DIR.glob("*.json"))
    thin_calcs = []
    for f in all_calcs:
        try:
            d = json.loads(f.read_text())
            exp = d.get("explanation", "")
            intro = d.get("intro", "")
            if only_generic:
                # Re-procesar solo las que quedaron como generic previamente
                if ("Esta calculadora aplica la fórmula estándar internacional" in exp or
                    "Esta calculadora te ayuda con un cálculo específico" in intro):
                    thin_calcs.append(f)
            else:
                if len(exp) < 800:
                    thin_calcs.append(f)
        except:
            pass

    print(f"Encontradas {len(thin_calcs)} calcs a enriquecer")

    enriched = 0
    by_subtype = defaultdict(int)

    for f in thin_calcs:
        try:
            d = json.loads(f.read_text())
            category = d.get("category", "")
        except:
            category = ""
        subtype = detect_subtype(f.stem, category)
        by_subtype[subtype] += 1
        if enrich_calc(f):
            enriched += 1

    print(f"✅ Enriquecidas: {enriched}/{len(thin_calcs)}")
    print("\nPor subtipo:")
    for s, n in sorted(by_subtype.items(), key=lambda x: -x[1]):
        print(f"  {s}: {n}")


if __name__ == "__main__":
    main()
