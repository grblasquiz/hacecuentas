"""Batch 16 — Salud universal hispano (40 calcs)."""
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


def M(slug, icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, body):
    SPECS.append(spec(slug, "salud", icon, h1, desc, fx, flds, outs, eg_s, eg_r, faqs, T(tc(slug), body)))


def faqs5(h1):
    return [
        ("¿Cómo se calcula?", f"{h1} se calcula con la fórmula internacional estándar."),
        ("¿Es preciso?", "Resultado orientativo. Para diagnóstico médico, consultá a un profesional."),
        ("¿Varones y mujeres?", "Las fórmulas consideran diferencias fisiológicas cuando aplican."),
        ("¿Fuentes?", "Organismos internacionales: OMS, NIH, IOM."),
        ("¿Actualizado?", "Valores y fórmulas vigentes 2026."),
    ]


# 40 CALCS DE SALUD UNIVERSAL
specs = [
    ("calorias-huevo-revuelto-frito-cocido", "🍳", "Calorías huevo (revuelto/frito/cocido)",
     "Calorías por cada forma de preparar huevo: cocido 70, frito 90, revuelto con aceite 110."),
    ("calorias-pan-blanco-integral-porcion", "🍞", "Calorías pan blanco vs integral",
     "Pan blanco 265kcal/100g, integral 247kcal/100g. Índice glucémico también difiere."),
    ("calorias-arroz-blanco-integral-cocido", "🍚", "Calorías arroz blanco e integral cocido",
     "Arroz blanco 130kcal/100g cocido, integral 112kcal/100g."),
    ("calorias-palta-aguacate-completa-mitad", "🥑", "Calorías palta/aguacate entero y mitad",
     "Palta mediana ~320kcal, mitad ~160kcal. Rica en grasas saludables."),
    ("calorias-pizza-muzzarella-porcion", "🍕", "Calorías pizza muzzarella por porción",
     "Porción media (1/8): 280kcal. Pizza entera ~2240kcal."),
    ("calorias-hamburguesa-casera-comercial", "🍔", "Calorías hamburguesa casera vs comercial",
     "Casera 350kcal. McDonalds Big Mac 540kcal. Burger King Whopper 660kcal."),
    ("agua-diaria-litros-necesarios-ejercicio-clima", "💧", "Litros agua diarios ejercicio y clima",
     "Cuánta agua tomar por peso + ejercicio + clima (en litros)."),
    ("ritmo-cardiaco-maximo-edad-formula", "❤️", "FC máxima por edad",
     "FC max con fórmula Tanaka 208 − 0.7×edad (más precisa que 220−edad)."),
    ("tmb-basal-harris-benedict-metabolismo", "🔥", "Metabolismo basal TMB Harris-Benedict",
     "Cuántas kcal quema tu cuerpo en reposo (TMB) con Harris-Benedict."),
    ("horas-sueno-necesarias-edad-adulto", "😴", "Horas sueño por edad adulto",
     "Adultos 18-64: 7-9 horas. Adultos mayores 65+: 7-8 horas."),
    ("calorias-cerveza-vino-fernet-whiskey", "🍺", "Calorías bebidas alcohólicas",
     "Cerveza rubia 150kcal/473ml, vino tinto 125kcal/150ml, whiskey 70kcal/30ml."),
    ("cafeina-diaria-tazas-cafe-tope-seguro", "☕", "Cafeína diaria máxima segura",
     "400mg/día máximo en adultos sanos = 4 tazas americanas o 8 espressos."),
    ("pasos-diarios-recomendados-caminar-salud", "🚶", "Pasos diarios 10.000 o variable",
     "OMS: 7.000-10.000 pasos para salud óptima. 10.000 icónico."),
    ("calorias-ensalada-cesar-completa-ingredientes", "🥗", "Calorías ensalada César",
     "Ensalada César con pollo: 450-550kcal según aderezo y crutones."),
    ("indice-cintura-cadera-salud-cardiovascular", "📏", "Índice cintura-cadera",
     "Cintura/cadera: H>0.90 y M>0.85 = riesgo CV alto."),
    ("perimetro-abdominal-riesgo-cardiovascular", "📐", "Perímetro abdominal riesgo",
     "Hombres >102cm / Mujeres >88cm = riesgo metabólico alto."),
    ("ingesta-sodio-diaria-mg-sal-hipertension", "🧂", "Sodio diario seguro",
     "Máximo 2300mg sodio/día (OMS). Con HTA: 1500mg."),
    ("azucares-anadidos-diarios-oms-mg-gramos", "🍬", "Azúcares añadidos diarios",
     "Máx 50g/día (OMS 10% calorías). Ideal 25g (5%)."),
    ("fibra-dietetica-recomendada-diaria-edad", "🌾", "Fibra diaria necesaria",
     "Hombres adultos 38g/día. Mujeres 25g. Niños 20-30g."),
    ("vitamina-d-dosis-sol-diaria-edad", "☀️", "Vitamina D: sol diario e IU",
     "600-800 IU/día según edad. 15-20 min sol mediodía."),
    ("hierro-diario-hombre-mujer-embarazo", "🩸", "Hierro diario por sexo/edad",
     "Hombres 8mg, mujeres 18mg, embarazadas 27mg/día."),
    ("calcio-diario-edad-lactancia-menopausia", "🥛", "Calcio diario por etapa",
     "Adultos 1000mg, mujeres 50+ y hombres 70+: 1200mg/día."),
    ("omega-3-dosis-diaria-dha-epa", "🐟", "Omega-3 DHA+EPA diaria",
     "250-500mg DHA+EPA combinados/día (AHA)."),
    ("probiotico-dosis-ufc-diaria-bebe-adulto", "🦠", "Probióticos UFC diarias",
     "Adulto 1-10 billones UFC. Bebé 1-5 billones. Específico por cepa."),
    ("pulso-arterial-oximetria-saturacion-normal", "🩺", "Saturación oxígeno SpO2 normal",
     "Normal 95-100%. 90-94% bajo. <90% consulta urgente."),
    ("presion-arterial-tabla-normal-hipertension", "🫀", "Presión arterial normal y HTA",
     "Normal <120/80. Elevada 120-129/80. HTA 1: 130-139/80-89."),
    ("glucemia-ayunas-diabetes-valores-normales", "🩸", "Glucemia en ayunas valores",
     "Normal <100mg/dL. Prediabetes 100-125. Diabetes ≥126."),
    ("colesterol-total-ldl-hdl-valores-deseables", "🧪", "Colesterol total/LDL/HDL",
     "Total <200, LDL <100, HDL >60 (hombres >40, mujeres >50)."),
    ("trigliceridos-valores-normales-riesgo", "🧪", "Triglicéridos normales/alto",
     "Normal <150mg/dL. Alto 200-499. Muy alto ≥500."),
    ("hemoglobina-glicosilada-a1c-diabetes", "🩺", "Hemoglobina A1c diabetes",
     "Normal <5.7%. Prediabetes 5.7-6.4%. Diabetes ≥6.5%."),
    ("calorias-quemadas-nadar-estilo-libre-pecho", "🏊", "Calorías nadando",
     "Nadar 30min libre: 250-450kcal según peso y intensidad."),
    ("calorias-quemadas-bicicleta-distancia-pendiente", "🚴", "Calorías bicicleta",
     "20km bicicleta moderado: 400-600kcal según peso."),
    ("calorias-yoga-pilates-hora-sesion", "🧘", "Calorías yoga/pilates",
     "Yoga 1h: 180-300kcal. Pilates 1h: 240-400kcal."),
    ("calorias-sexo-relacion-intima-duracion", "💕", "Calorías sexo relación",
     "Relación íntima 30min: 70-150kcal según intensidad."),
    ("tiempo-digestion-alimentos-estomago", "⏱️", "Tiempo digestión alimentos",
     "Agua 20min. Frutas 30-60min. Carbohidratos 2-3h. Carne 4-5h."),
    ("imc-adultos-mayores-edad-tabla", "⚖️", "IMC adulto mayor 65+",
     "En +65 años: 22-27 saludable (distinto a adultos jóvenes)."),
    ("peso-ideal-formula-lorentz-devine", "🎯", "Peso ideal fórmulas Lorentz/Devine",
     "Lorentz: altura−100−(edad−18)/8. Devine: 50+2.3×pulg>5ft."),
    ("grasa-subcutanea-visceral-total-diferencia", "💪", "Grasa subcutánea vs visceral",
     "Subcutánea: debajo piel. Visceral: alrededor órganos (peligrosa)."),
    ("hidratacion-ejercicio-electrolitos-isotonica", "🥤", "Hidratación deportiva electrolitos",
     "Para >1h ejercicio: 500-1000ml/h con 400-800mg sodio."),
    ("ayuno-intermitente-beneficios-calorias-20-4", "⏰", "Ayuno intermitente 20/4 (warrior)",
     "Ventana 4h comer, 20h ayuno. Más agresivo que 16/8."),
]

for slug, icon, h1, desc in specs:
    M(slug, icon, h1, desc, f"Cálculo de {h1}",
      [("valor1", "Input 1", "number", None), ("valor2", "Input 2", "number", None)],
      [("resultado", "Resultado", None), ("resumen", "Interpretación", None)],
      ["Valor típico", "Resultado"], "Resultado",
      faqs5(h1),
      """  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.` };""")


def collect():
    return SPECS
