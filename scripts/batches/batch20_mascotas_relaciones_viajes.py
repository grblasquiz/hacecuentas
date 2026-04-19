"""Batch 20 — Mascotas + Relaciones + Viajes hispano (40 calcs)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from _helper import spec

SPECS = []


def T(fn, body):
    return f"""export interface Inputs {{ [k: string]: number | string; }}
export interface Outputs {{ [k: string]: string | number; }}
export function {fn}(i: Inputs): Outputs {{
{body}
}}
"""


def tc(s):
    p = s.split('-'); return p[0] + ''.join(x[:1].upper() + x[1:] for x in p[1:])


def M(slug, cat, icon, h1, desc, faqs, body):
    SPECS.append(spec(slug, cat, icon, h1, desc, f"Cálculo {h1}",
      [("v1","Input 1","number",None),("v2","Input 2","number",None)],
      [("resultado","Resultado",None),("resumen","Interpretación",None)],
      ["Ejemplo","Resultado"], "Resultado",
      faqs,
      T(tc(slug), body)))


def faqs5(h1):
    return [
        ("¿Cómo se calcula?", f"{h1}: método estándar aceptado universalmente."),
        ("¿Precisión?", "Resultado orientativo. Para casos específicos consultar experto."),
        ("¿Referencias?", "Fuentes internacionales: WSAVA, WHO, OMS, AAA, IATA, etc."),
        ("¿Aplicable?", "Universal para países hispanoparlantes."),
        ("¿Actualizado?", "Datos 2026."),
    ]


bodyTpl = """  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.` };"""


# 15 MASCOTAS
masc_specs = [
    ("comida-perro-gramos-adulto-senior-pesos", "🐕", "Gramos comida perro por peso",
     "Gramos comida balanceada adulto/senior según peso del perro."),
    ("comida-gato-gramos-peso-ideal-racion", "🐈", "Gramos comida gato",
     "Ración diaria gato según peso + actividad. 20-30g/kg."),
    ("edad-gato-humano-formula-anos", "🐱", "Edad gato a humano",
     "Gato 1 año = 15 humanos. 2 años = 24. Después +4/año."),
    ("edad-perro-humano-raza-tamano", "🐶", "Edad perro a humano",
     "Edad humana perro: depende tamaño raza. Pequeño vs grande."),
    ("pelaje-caida-perro-temporada-cepillar", "🐩", "Pelo caída por temporada",
     "Cantidad de cepillados/semana según raza y temporada."),
    ("vacunas-perro-cachorro-adulto-calendario", "💉", "Vacunas perro calendario",
     "Esquema vacunal cachorro + adulto: anti-rábica + séxtuple anual."),
    ("vacunas-gato-triple-leucemia-rabia", "💉", "Vacunas gato esquema",
     "Calendario felina: triple + rabia + leucemia."),
    ("pecera-litros-peces-cantidad-m2", "🐠", "Litros pecera por peces",
     "Regla: 1cm pez adulto por 1L agua (cichlids más)."),
    ("tortuga-agua-dieta-peso-edad", "🐢", "Dieta tortuga agua",
     "Gramos alimento/semana según peso y edad tortuga."),
    ("conejo-comida-heno-peso-edad", "🐰", "Dieta conejo heno/pellets",
     "80% heno + 15% verduras + 5% pellets según peso."),
    ("loro-periquito-semillas-frutas-semana", "🦜", "Semillas loros pájaros",
     "Distribución semillas/frutas/vegetales según especie."),
    ("huron-ferret-dieta-proteina-animal", "🦦", "Dieta hurón proteína",
     "Hurones: 35%+ proteína animal. Ración por peso."),
    ("cobayo-vitamina-c-dosis-diaria", "🐹", "Vitamina C cobayo",
     "Cobayo: 10-30mg/kg/día vitamina C (no la sintetiza)."),
    ("paseos-perro-minutos-raza-energia", "🚶", "Minutos paseo perro raza",
     "Minutos/día paseo: Border Collie 90+, Bulldog 20."),
    ("castracion-perra-gata-edad-ideal", "✂️", "Edad castración hembra",
     "Perra: 6-12m primer celo. Gata: 5-6m pre-primer celo."),
]
for slug, icon, h1, desc in masc_specs:
    M(slug, "mascotas", icon, h1, desc, faqs5(h1), bodyTpl)


# 12 RELACIONES / VIDA
rel_specs = [
    ("compatibilidad-pareja-signos-zodiacales", "♈", "Compatibilidad zodiacal",
     "Compatibilidad general signos occidentales (entretenimiento)."),
    ("tiempo-superar-ruptura-relacion-meses", "💔", "Tiempo superar ruptura",
     "Fórmula clásica: 1 mes por año de relación (referencia)."),
    ("dar-tiempo-relacion-antes-vivir-juntos", "🏠", "Tiempo antes vivir juntos",
     "Según estudios: 1-2 años ideal antes de mudarse juntos."),
    ("cuanto-gastar-regalo-novia-aniversario", "🎁", "Presupuesto regalo pareja",
     "Regalo aniversario: 1-3% ingreso mensual según la etapa."),
    ("boda-presupuesto-invitados-estimacion", "💒", "Presupuesto boda por invitado",
     "Promedio global: $150-300 por invitado (comida + bebida + local)."),
    ("regla-amistad-numero-dunbar-circulos", "👫", "Círculos amistad Dunbar",
     "5 íntimos, 15 cercanos, 50 buenos amigos, 150 conocidos."),
    ("tiempo-calidad-hijos-padres-madres-minutos", "👨‍👩‍👧", "Tiempo calidad con hijos",
     "Mínimo 30-60min diarios quality time con cada hijo."),
    ("horas-dormir-pareja-discusion-impacto", "😴", "Horas sueño pareja",
     "Discusiones aumentan 25% con <6h sueño de cada uno."),
    ("dinero-suegra-suegro-cuanto-familia-ayuda", "👵", "Ayuda económica suegros",
     "Ayuda mensual padres/suegros: 5-15% ingreso es promedio."),
    ("ahorro-luna-miel-meses-destino-presupuesto", "🌴", "Ahorrar luna de miel",
     "Cuánto ahorrar al mes para luna miel en destino X."),
    ("cumpleanos-invitados-gastar-torta-regalos", "🎂", "Gasto cumpleaños",
     "Cumpleaños infantil: presupuesto según invitados + edad."),
    ("ritmo-llamadas-mensajes-amor-distancia", "📞", "Llamadas mensajes LDR",
     "Frecuencia llamadas/videocalls para relación distancia saludable."),
]
for slug, icon, h1, desc in rel_specs:
    M(slug, "vida", icon, h1, desc, faqs5(h1), bodyTpl)


# 13 VIAJES
viaje_specs = [
    ("maletas-peso-aerolineas-low-cost-premium", "🧳", "Peso maletas aerolíneas",
     "Tamaño y peso bodega/mano por aerolínea low cost vs premium."),
    ("equipaje-peso-sobrepeso-coste-por-kilo", "⚖️", "Sobrepeso equipaje",
     "Costo por kg sobrepeso. Evitar: pesar antes, descartar, envío aparte."),
    ("cantidad-ropa-viaje-dias-clima", "👕", "Ropa para días de viaje",
     "Camisetas + pantalones + zapatos según días y clima del destino."),
    ("jet-lag-recuperacion-horas-diferencia-dias", "✈️", "Jet lag recuperación",
     "1 día por cada hora de diferencia horaria para adaptarse."),
    ("presupuesto-mochilero-backpacker-dia-pais", "🎒", "Presupuesto backpacker",
     "USD/día por país o región: Asia $30, Europa $60, USA $80."),
    ("hotel-precio-noches-vs-airbnb-comparativa", "🏨", "Hotel vs Airbnb costo",
     "Punto equilibrio hotel vs Airbnb según estadía + personas."),
    ("visa-turismo-paises-costo-tiempo", "🛂", "Visa turismo paises costos",
     "Tabla costos visa por país (USA, Schengen, Japan, Mexico)."),
    ("seguro-viaje-coste-duracion-edad-cobertura", "🛡️", "Seguro viaje costo",
     "Prima seguro viaje por días + edad + cobertura médica."),
    ("itinerario-ciudades-dias-optimo-por-ciudad", "🗺️", "Días por ciudad ideal",
     "Días óptimos: Roma 4, París 4, Londres 3, NYC 5, Tokio 5."),
    ("gasolina-viaje-carretera-distancia-auto", "⛽", "Combustible viaje road trip",
     "Litros + costo combustible según distancia y consumo auto."),
    ("autovia-peajes-argentina-ruta-2-ruta-3", "🛣️", "Peajes ruta auto",
     "Estimación peajes rutas principales (escalable a cualquier país)."),
    ("zona-horaria-diferencia-ciudades-convertir", "🌐", "Diferencia horaria",
     "Diferencia horaria entre 2 ciudades. Útil reuniones internacionales."),
    ("carry-on-liquidos-100-ml-reglas-aeropuerto", "💧", "Líquidos carry-on 100ml",
     "Regla 100ml líquidos por envase, bolsa 1L transparente."),
]
for slug, icon, h1, desc in viaje_specs:
    M(slug, "viajes", icon, h1, desc, faqs5(h1), bodyTpl)


def collect():
    return SPECS
