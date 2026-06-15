#!/usr/bin/env python3
"""
Agrega referenceTables (info-gain) a los calcs top de trafico organico +
arregla cross-linking del cluster salud. Datos: numericos computados aca,
legales/categoricos citados, volatiles (ICL/IPC/Ganancias) en formato evergreen.
"""
import json, os, math
from pathlib import Path

BASE = Path("src/content/calcs")
TODAY = "2026-06-15"

def money(n):
    return "$" + f"{round(n):,.0f}".replace(",", ".")

def dec(n, d=1):
    return f"{n:.{d}f}".replace(".", ",")

# ---------- tablas computadas ----------

# IMC: peso saludable por altura (OMS 18,5-24,9)
imc_peso_rows = []
h = 1.50
while h <= 1.951:
    lo = 18.5 * h * h
    hi = 24.9 * h * h
    imc_peso_rows.append([f"{dec(h,2)} m", f"{dec(lo,1)} kg", f"{dec(hi,1)} kg"])
    h += 0.05

# Peso ideal Devine por altura y sexo
devine_rows = []
for cm in range(150, 196, 5):
    men = 50 + 0.9055 * (cm - 152.4)
    women = 45.5 + 0.9055 * (cm - 152.4)
    devine_rows.append([f"{cm} cm ({dec(cm/100,2)} m)", f"{dec(men,1)} kg", f"{dec(women,1)} kg"])

# Edad: conversiones
edad_rows = []
for y in [1, 5, 10, 18, 21, 30, 40, 50, 65, 80, 100]:
    days = round(y * 365.25)
    weeks = round(days / 7)
    months = y * 12
    hours = days * 24
    edad_rows.append([f"{y} años",
                      f"{months:,}".replace(",", ".") + " meses",
                      f"{weeks:,}".replace(",", ".") + " semanas",
                      f"{days:,}".replace(",", ".") + " días",
                      f"{hours:,}".replace(",", ".") + " horas"])

# Edad en semanas (primeros años)
edad_sem_rows = []
for label, days in [("1 mes", 30.4375), ("3 meses", 91.3), ("6 meses", 182.6),
                    ("9 meses", 273.9), ("1 año", 365.25), ("2 años", 730.5),
                    ("3 años", 1095.75), ("5 años", 1826.25)]:
    weeks = round(days / 7)
    edad_sem_rows.append([label, f"{weeks} semanas", f"{round(days)} días"])

# Ovulacion por duracion de ciclo
ovul_rows = []
for cl in [21, 24, 26, 28, 30, 32, 35]:
    ov = cl - 14
    f1, f2 = ov - 5, ov + 1
    ovul_rows.append([f"{cl} días", f"Día {ov}", f"Día {f1} al {f2}"])

# Aguinaldo (SAC) por sueldo bruto
agui_rows = []
for s in range(300000, 2000001, 300000):
    sac = s / 2
    neto = sac * 0.83
    agui_rows.append([money(s), money(sac), money(neto)])

# Porcentajes de uso frecuente
porc_rows = []
for p in [5, 10, 15, 21, 25, 30, 50, 75]:
    porc_rows.append([f"{p}%", money(1000 * p / 100), money(10000 * p / 100), money(100000 * p / 100)])

# Interes compuesto: $100.000 segun plazo y tasa anual
ic_rows = []
for years in [1, 2, 3, 5, 10]:
    row = [f"{years} año" + ("s" if years > 1 else "")]
    for r in [30, 50, 75, 100]:
        fv = 100000 * (1 + r / 100) ** years
        row.append(money(fv))
    ic_rows.append(row)

# Metros lineales -> m2 por ancho
ml_rows = []
for ml in [1, 5, 10, 25, 50, 100]:
    row = [f"{ml} ml"]
    for a in [0.80, 1.00, 1.40, 1.50]:
        row.append(f"{dec(ml * a, 1)} m²")
    ml_rows.append(row)

# ---------- definicion de tablas por archivo ----------

TABLES = {
"imc.json": [
  {"title": "Categorías de IMC según la OMS (adultos)",
   "caption": "Clasificación oficial del Índice de Masa Corporal para personas de 18 a 65 años.",
   "headers": ["IMC (kg/m²)", "Categoría", "Riesgo para la salud"],
   "highlightCol": 1,
   "rows": [
     ["Menos de 18,5", "Bajo peso", "Aumentado"],
     ["18,5 – 24,9", "Peso normal (saludable)", "Promedio"],
     ["25,0 – 29,9", "Sobrepeso", "Aumentado"],
     ["30,0 – 34,9", "Obesidad grado I", "Moderado"],
     ["35,0 – 39,9", "Obesidad grado II", "Severo"],
     ["40,0 o más", "Obesidad grado III (mórbida)", "Muy severo"]],
   "note": "Fuente: Organización Mundial de la Salud (OMS). El IMC se calcula como peso (kg) ÷ altura² (m²). No aplica a embarazadas, deportistas con mucha masa muscular ni menores de 18 años."},
  {"title": "Rango de peso saludable según tu altura (IMC 18,5–24,9)",
   "caption": "Cuánto deberías pesar para estar en peso normal según la OMS.",
   "headers": ["Altura", "Peso mínimo", "Peso máximo"],
   "rows": imc_peso_rows,
   "note": "Calculado con peso = IMC × altura². Es un rango orientativo; consultá a un profesional de la salud para una evaluación personalizada."}
],
"peso-ideal.json": [
  {"title": "Peso ideal estimado por altura y sexo (fórmula de Devine)",
   "caption": "Peso ideal de referencia según la fórmula clínica de Devine (1974).",
   "headers": ["Altura", "Hombre", "Mujer"],
   "rows": devine_rows,
   "note": "Fórmula de Devine: hombre = 50 + 0,9 kg por cm sobre 152,4 cm; mujer = 45,5 + 0,9 kg por cm sobre 152,4 cm. Existen otras fórmulas (Robinson, Miller, Lorentz) que dan valores similares. Es un valor orientativo, no un objetivo médico."}
],
"imc-infantil-percentil.json": [
  {"title": "Interpretación del percentil de IMC en niños y adolescentes (OMS)",
   "caption": "Qué significa el percentil de IMC para edad de 2 a 18 años.",
   "headers": ["Percentil de IMC", "Clasificación"],
   "highlightCol": 1,
   "rows": [
     ["Menor al percentil 3", "Bajo peso / delgadez"],
     ["Percentil 3 a 85", "Peso normal (saludable)"],
     ["Percentil 85 a 97", "Sobrepeso"],
     ["Mayor al percentil 97", "Obesidad"]],
   "note": "Fuente: estándares de crecimiento de la OMS. En niños el IMC NO se interpreta con los rangos fijos del adulto: se compara con percentiles según edad y sexo. Ante dudas consultá al pediatra."}
],
"indice-masa-corporal-pediatrico.json": [
  {"title": "Clasificación del IMC pediátrico por puntuación Z (OMS, 5–19 años)",
   "caption": "Equivalencia entre desviaciones estándar (puntuación Z) y categoría de peso.",
   "headers": ["Puntuación Z (IMC para edad)", "Clasificación"],
   "highlightCol": 1,
   "rows": [
     ["Menor a −2 DE", "Delgadez"],
     ["Entre −2 y +1 DE", "Peso normal"],
     ["Mayor a +1 DE (percentil 85)", "Sobrepeso"],
     ["Mayor a +2 DE (percentil 97)", "Obesidad"],
     ["Mayor a +3 DE", "Obesidad severa"]],
   "note": "Fuente: patrones de crecimiento de la OMS para 5 a 19 años. La puntuación Z mide cuántas desviaciones estándar se aleja el IMC del valor mediano esperado para esa edad y sexo."}
],
"calorias-tdee.json": [
  {"title": "Factor de actividad física para calcular tu TDEE",
   "caption": "Multiplicá tu metabolismo basal (TMB) por este factor según tu nivel de actividad.",
   "headers": ["Nivel de actividad", "Factor", "Descripción"],
   "rows": [
     ["Sedentario", "1,2", "Poco o ningún ejercicio, trabajo de oficina"],
     ["Ligero", "1,375", "Ejercicio ligero 1–3 días por semana"],
     ["Moderado", "1,55", "Ejercicio moderado 3–5 días por semana"],
     ["Alto", "1,725", "Ejercicio intenso 6–7 días por semana"],
     ["Muy alto", "1,9", "Ejercicio muy intenso o trabajo físico diario"]],
   "note": "TDEE (gasto calórico diario total) = TMB × factor de actividad. La TMB se estima con la fórmula de Mifflin-St Jeor."}
],
"dias-entre-fechas.json": [
  {"title": "Cuántos días tiene cada mes (año 2026)",
   "headers": ["Mes", "Días"],
   "rows": [["Enero", "31"], ["Febrero", "28"], ["Marzo", "31"], ["Abril", "30"],
            ["Mayo", "31"], ["Junio", "30"], ["Julio", "31"], ["Agosto", "31"],
            ["Septiembre", "30"], ["Octubre", "31"], ["Noviembre", "30"], ["Diciembre", "31"]],
   "note": "2026 NO es bisiesto, por eso febrero tiene 28 días. El próximo año bisiesto (febrero de 29 días) es 2028."},
  {"title": "Equivalencias rápidas de días",
   "headers": ["Período", "Días"],
   "rows": [["1 semana", "7"], ["1 quincena", "15"], ["1 mes (promedio)", "30,4"],
            ["1 bimestre", "≈ 61"], ["1 trimestre", "≈ 91"], ["1 semestre", "≈ 182"],
            ["1 año", "365 (366 si es bisiesto)"], ["1 lustro (5 años)", "≈ 1.826"],
            ["1 década", "≈ 3.653"]],
   "note": "El mes promedio se calcula como 365 ÷ 12 = 30,4 días. Para días hábiles, restá fines de semana y feriados."}
],
"edad.json": [
  {"title": "Cuántos días, semanas y horas son tus años",
   "caption": "Equivalencia de edades comunes en distintas unidades de tiempo.",
   "headers": ["Edad", "Meses", "Semanas", "Días", "Horas"],
   "rows": edad_rows,
   "note": "Calculado con 1 año = 365,25 días (promedio que incluye los años bisiestos). Tu edad exacta varía según tu fecha de nacimiento; usá la calculadora para el valor preciso."}
],
"edad-en-semanas.json": [
  {"title": "Edad en semanas durante los primeros años",
   "caption": "Conversión útil para el seguimiento de bebés y niños pequeños.",
   "headers": ["Edad", "Semanas", "Días"],
   "rows": edad_sem_rows,
   "note": "Calculado con 1 mes ≈ 30,44 días y 1 año = 365,25 días. En pediatría la edad del bebé suele expresarse en semanas durante el primer año."}
],
"embarazo.json": [
  {"title": "Semanas de embarazo: equivalencia en meses y trimestre",
   "caption": "A cuántos meses y qué trimestre corresponde cada semana de gestación.",
   "headers": ["Semanas", "Mes de embarazo", "Trimestre"],
   "highlightCol": 2,
   "rows": [
     ["Semanas 1 – 4", "Mes 1", "Primer trimestre"],
     ["Semanas 5 – 8", "Mes 2", "Primer trimestre"],
     ["Semanas 9 – 13", "Mes 3", "Primer trimestre"],
     ["Semanas 14 – 17", "Mes 4", "Segundo trimestre"],
     ["Semanas 18 – 22", "Mes 5", "Segundo trimestre"],
     ["Semanas 23 – 27", "Mes 6", "Segundo trimestre"],
     ["Semanas 28 – 31", "Mes 7", "Tercer trimestre"],
     ["Semanas 32 – 35", "Mes 8", "Tercer trimestre"],
     ["Semanas 36 – 40", "Mes 9", "Tercer trimestre"]],
   "note": "El embarazo se cuenta en semanas desde el primer día de la última menstruación (40 semanas en total). La equivalencia en meses es aproximada porque un mes calendario no equivale exactamente a 4 semanas."}
],
"ovulacion.json": [
  {"title": "Día de ovulación y ventana fértil según la duración de tu ciclo",
   "caption": "La ovulación ocurre unos 14 días ANTES de la próxima menstruación.",
   "headers": ["Duración del ciclo", "Ovulación (aprox.)", "Ventana fértil"],
   "highlightCol": 2,
   "rows": ovul_rows,
   "note": "La ventana fértil abarca los 5 días previos a la ovulación más el día de la ovulación, porque los espermatozoides sobreviven hasta 5 días. El día 1 es el primer día de la menstruación. Es una estimación; los ciclos varían entre personas y meses."}
],
"sexo-bebe-tabla-china.json": [
  {"title": "Métodos populares para predecir el sexo del bebé y su precisión",
   "caption": "Ninguno tiene base científica: todos aciertan cerca del 50%, como tirar una moneda.",
   "headers": ["Método", "En qué se basa", "Precisión real"],
   "rows": [
     ["Tabla china del embarazo", "Edad lunar de la madre + mes de concepción", "≈ 50% (azar)"],
     ["Teoría del Nub", "Ángulo del tubérculo genital en la ecografía de semana 12", "Variable, no fiable"],
     ["Método Ramzi", "Lado de implantación de la placenta", "Sin respaldo científico"],
     ["Forma de la panza", "Panza alta/baja o redonda/puntuda", "≈ 50% (mito)"],
     ["Frecuencia cardíaca fetal", "Más o menos de 140 latidos por minuto", "Sin correlación con el sexo"],
     ["Ecografía (semana 18–20)", "Visualización directa de los genitales", "≈ 95–99%"],
     ["Análisis de ADN fetal en sangre", "ADN del bebé en sangre materna (desde semana 9–10)", "≈ 99%"]],
   "note": "La tabla china es un entretenimiento sin validez médica. Los únicos métodos confiables para conocer el sexo son la ecografía morfológica y el análisis de ADN fetal (NIPT)."}
],
"indemnizacion.json": [
  {"title": "Indemnización por despido según antigüedad (art. 245 LCT)",
   "caption": "Meses de la mejor remuneración a indemnizar por despido sin causa.",
   "headers": ["Antigüedad", "Meses de sueldo a indemnizar"],
   "rows": [
     ["1 año", "1 mes"], ["2 años", "2 meses"], ["3 años", "3 meses"],
     ["5 años", "5 meses"], ["10 años", "10 meses"], ["15 años", "15 meses"],
     ["20 años", "20 meses"]],
   "note": "Art. 245 LCT: 1 mes de la mejor remuneración mensual, normal y habitual por cada año de antigüedad o fracción mayor a 3 meses, con un mínimo de 1 mes. La base imponible tiene un tope (3 veces el promedio del CCT); el fallo 'Vizzoti' permite que el tope no reduzca la base más del 33%. A esto se suman preaviso, integración del mes y SAC proporcional."}
],
"liquidacion-final-renuncia.json": [
  {"title": "Qué conceptos cobrás en la liquidación final por renuncia",
   "caption": "Diferencia clave: por renuncia NO cobrás indemnización ni preaviso.",
   "headers": ["Concepto", "¿Corresponde en renuncia?", "Cómo se calcula"],
   "rows": [
     ["Días trabajados del mes", "Sí", "(Sueldo ÷ 30) × días trabajados"],
     ["SAC (aguinaldo) proporcional", "Sí", "(Mejor sueldo ÷ 2) × (días del semestre ÷ 182,5)"],
     ["Vacaciones no gozadas", "Sí", "(Sueldo ÷ 25) × días proporcionales"],
     ["SAC sobre vacaciones", "Sí", "1/12 de las vacaciones proporcionales"],
     ["Indemnización por antigüedad", "No", "—"],
     ["Preaviso", "No (lo debe dar el empleado)", "—"],
     ["Integración del mes de despido", "No", "—"]],
   "note": "En la renuncia solo se liquidan los conceptos que ya devengaste (días, aguinaldo y vacaciones proporcionales). Las indemnizaciones aplican solo en el despido sin causa. El empleado debe dar 15 días de preaviso (art. 231 LCT)."}
],
"aguinaldo.json": [
  {"title": "Aguinaldo (SAC) según tu mejor sueldo bruto del semestre",
   "caption": "El aguinaldo es la mitad del mejor sueldo bruto de los últimos 6 meses.",
   "headers": ["Mejor sueldo bruto", "Aguinaldo bruto (½ sueldo)", "Aguinaldo neto aprox."],
   "rows": agui_rows,
   "note": "SAC = mejor remuneración mensual del semestre ÷ 2 (art. 121 LCT). El neto descuenta los aportes de ley (≈17%: 11% jubilación + 3% obra social + 3% PAMI). Si no trabajaste el semestre completo, el aguinaldo es proporcional a los días trabajados."}
],
"dias-vacaciones-ley.json": [
  {"title": "Días de vacaciones según tu antigüedad (art. 150 LCT)",
   "caption": "Días corridos de licencia anual ordinaria por años de antigüedad.",
   "headers": ["Antigüedad al 31 de diciembre", "Días de vacaciones"],
   "highlightCol": 1,
   "rows": [
     ["Hasta 5 años", "14 días corridos"],
     ["De 5 a 10 años", "21 días corridos"],
     ["De 10 a 20 años", "28 días corridos"],
     ["Más de 20 años", "35 días corridos"]],
   "note": "Art. 150 LCT. Son días CORRIDOS (incluyen sábados, domingos y feriados), no hábiles. Para tener derecho al período completo hay que haber trabajado al menos la mitad de los días hábiles del año; si no, se otorga 1 día de vacaciones por cada 20 días trabajados."}
],
"ganancias-sueldo.json": [
  {"title": "Escala del Impuesto a las Ganancias: alícuotas (art. 94 LIG)",
   "caption": "Alícuota marginal que se aplica sobre el excedente de cada tramo.",
   "headers": ["Tramo (de menor a mayor ganancia neta)", "Alícuota marginal"],
   "highlightCol": 1,
   "rows": [
     ["Tramo 1", "5%"], ["Tramo 2", "9%"], ["Tramo 3", "12%"], ["Tramo 4", "15%"],
     ["Tramo 5", "19%"], ["Tramo 6", "23%"], ["Tramo 7", "27%"], ["Tramo 8", "31%"],
     ["Tramo 9", "35%"]],
   "note": "Las alícuotas (5% a 35%) están fijadas por ley y son progresivas: cada tramo paga un monto fijo más la alícuota sobre lo que excede el tramo anterior. Los montos en pesos de cada tramo se actualizan por RIPTE cada semestre, por eso usá la calculadora para el cálculo con los valores vigentes."}
],
"inflacion-ipc.json": [
  {"title": "Inflación anual en Argentina por año (IPC INDEC)",
   "caption": "Variación acumulada del Índice de Precios al Consumidor por año cerrado.",
   "headers": ["Año", "Inflación anual"],
   "rows": [
     ["2018", "47,6%"], ["2019", "53,8%"], ["2020", "36,1%"], ["2021", "50,9%"],
     ["2022", "94,8%"], ["2023", "211,4%"], ["2024", "117,8%"]],
   "note": "Fuente: INDEC (IPC Nacional, variación diciembre contra diciembre). Para actualizar un monto por inflación entre dos fechas dentro del año usá la calculadora, que toma el índice mensual vigente."}
],
"alquiler-icl.json": [
  {"title": "Índices para actualizar alquileres en Argentina (2026)",
   "caption": "Comparación de los índices y frecuencias de ajuste más usados.",
   "headers": ["Índice / método", "Qué mide", "Uso típico"],
   "rows": [
     ["ICL (BCRA)", "Promedio entre inflación (IPC) y salarios (RIPTE)", "Contratos bajo la ex Ley de Alquileres"],
     ["IPC (INDEC)", "Inflación de precios al consumidor", "Contratos libres post DNU 70/2023"],
     ["Casa Propia", "Menor entre inflación y variación salarial + 0,9", "Algunos contratos de vivienda"],
     ["% fijo pactado", "Porcentaje acordado entre partes (ej. trimestral)", "Contratos libres actuales"]],
   "note": "Desde el DNU 70/2023 los contratos son de libre acuerdo: las partes eligen índice y frecuencia de ajuste. El ICL lo publica el BCRA diariamente. La calculadora aplica el coeficiente ICL vigente entre las fechas que ingreses."}
],
"costo-m2-construccion.json": [
  {"title": "Ponderación de superficie en el costo de construcción",
   "caption": "No todos los m² cuestan lo mismo: los espacios semicubiertos y descubiertos computan menos.",
   "headers": ["Tipo de superficie", "Incidencia sobre el m² cubierto"],
   "rows": [
     ["Cubierta (interior cerrado)", "100%"],
     ["Semicubierta (galería, balcón, cochera techada)", "50%"],
     ["Descubierta (patio, jardín, terraza)", "25% – 30%"]],
   "note": "Convención usada en la industria para calcular la superficie 'ponderada' equivalente. Un m² semicubierto cuesta aproximadamente la mitad que uno cubierto."},
  {"title": "Distribución típica del costo de una obra",
   "headers": ["Rubro", "% del costo total (orientativo)"],
   "rows": [
     ["Materiales", "≈ 55% – 65%"],
     ["Mano de obra", "≈ 30% – 40%"],
     ["Proyecto, dirección y honorarios", "≈ 5% – 10%"]],
   "note": "Proporciones orientativas; varían según el tipo de obra, la calidad de terminaciones y la región. La calculadora estima el total a partir del costo por m² actualizado."}
],
"conversor-metros-lineales-a-metros-cuadrados.json": [
  {"title": "Metros lineales a metros cuadrados según el ancho del material",
   "caption": "m² = metros lineales × ancho del rollo/material.",
   "headers": ["Metros lineales", "Ancho 0,80 m", "Ancho 1,00 m", "Ancho 1,40 m", "Ancho 1,50 m"],
   "rows": ml_rows,
   "note": "Los metros lineales miden el largo de un material que se vende en rollo (tela, alfombra, chapa, papel). Para pasarlos a m² hay que multiplicar por el ancho. Sin el ancho, los metros lineales NO se pueden convertir a m²."}
],
"calculadora-millas-avianca-lifemiles.json": [
  {"title": "Cómo se acumulan y usan las millas LifeMiles (Avianca)",
   "caption": "Las millas LifeMiles no vencen mientras la cuenta tenga actividad cada 12 meses.",
   "headers": ["Fuente de millas", "Cómo funciona"],
   "rows": [
     ["Vuelos Avianca y Star Alliance", "Según tarifa, clase y distancia del tramo"],
     ["Tarjetas de crédito co-branded", "Millas por cada peso/dólar gastado"],
     ["Compra de millas", "Comprar millas directamente, ideal en promociones"],
     ["Socios comerciales", "Hoteles, alquiler de autos y compras en tiendas asociadas"],
     ["Promociones y bonos", "Bonos de bienvenida y campañas de millas extra"]],
   "note": "La cantidad de millas necesaria para canjear un pasaje depende del destino, la temporada y la disponibilidad (tabla de canje de Avianca). Usá la calculadora para estimar millas según tu caso."}
],
"porcentaje.json": [
  {"title": "Porcentajes de uso frecuente sobre distintos montos",
   "caption": "Cuánto representa cada porcentaje aplicado a un monto.",
   "headers": ["Porcentaje", "De $1.000", "De $10.000", "De $100.000"],
   "rows": porc_rows,
   "note": "Para calcular un porcentaje: monto × (porcentaje ÷ 100). El 21% es la alícuota general del IVA en Argentina. Usá la calculadora para cualquier porcentaje y monto."}
],
"interes-compuesto.json": [
  {"title": "Cuánto rinde $100.000 a interés compuesto",
   "caption": "Capital final de una inversión inicial de $100.000 según plazo y tasa anual.",
   "headers": ["Plazo", "30% anual", "50% anual", "75% anual", "100% anual"],
   "rows": ic_rows,
   "note": "Calculado con capitalización anual: capital final = capital × (1 + tasa)^años. Con capitalización mensual el resultado es mayor. La calculadora permite elegir aportes periódicos y frecuencia de capitalización."}
],
"calculadora-art-indemnizacion-tabla-incapacidad-laboral-permanente.json": [
  {"title": "Grados de incapacidad laboral y su prestación (Ley 24.557)",
   "caption": "Cómo clasifica la ART el tipo de incapacidad y qué prestación corresponde.",
   "headers": ["Grado de incapacidad", "Definición", "Prestación"],
   "rows": [
     ["Incapacidad Laboral Temporaria (ILT)", "Impide trabajar por un tiempo, con recuperación esperada", "Pago mensual (ingreso base) hasta 12 meses"],
     ["ILP parcial leve (hasta 50%)", "Secuela permanente parcial de bajo grado", "Indemnización de pago único"],
     ["ILP parcial grave (50% a 66%)", "Secuela permanente parcial de alto grado", "Renta periódica + prestación adicional"],
     ["ILP total (66% o más)", "Incapacidad permanente que impide la actividad", "Retiro definitivo por invalidez"],
     ["Gran invalidez", "Necesita asistencia de otra persona para vivir", "Prestación total + adicional mensual"]],
   "note": "Ley de Riesgos del Trabajo 24.557. La indemnización por ILP se calcula como 53 × ingaso base mensual × % de incapacidad × (65 ÷ edad), con pisos mínimos actualizados por la SRT. El % de incapacidad surge de la Tabla de Evaluación de Incapacidades Laborales (Decreto 659/96)."}
],
}

# fix typo guard (ingaso) -> ingreso
TABLES["calculadora-art-indemnizacion-tabla-incapacidad-laboral-permanente.json"][0]["note"] = \
  TABLES["calculadora-art-indemnizacion-tabla-incapacidad-laboral-permanente.json"][0]["note"].replace("ingaso", "ingreso")

# ---------- cross-linking cluster salud ----------
RELATED = {
  "peso-ideal.json": ["calculadora-imc", "calculadora-calorias-diarias-tdee", "calculadora-porcentaje-grasa-corporal"],
  "imc-infantil-percentil.json": ["calculadora-indice-masa-corporal-pediatrico", "calculadora-imc", "calculadora-peso-ideal"],
  "indice-masa-corporal-pediatrico.json": ["calculadora-imc-infantil-percentil", "calculadora-imc", "calculadora-peso-ideal"],
  "calorias-tdee.json": ["calculadora-imc", "calculadora-peso-ideal", "calculadora-porcentaje-grasa-corporal"],
}

# ---------- aplicar ----------
changed = []
for fn, tables in TABLES.items():
    p = BASE / fn
    d = json.loads(p.read_text(encoding="utf-8"))
    if d.get("referenceTables"):
        print(f"SKIP (ya tiene referenceTables): {fn}")
        continue
    d["referenceTables"] = tables
    if fn in RELATED:
        d["relatedSlugs"] = RELATED[fn]
    d["lastReviewed"] = TODAY
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    extra = " +cross-link" if fn in RELATED else ""
    changed.append(fn)
    print(f"OK {fn}  ({len(tables)} tabla/s, {sum(len(t['rows']) for t in tables)} filas){extra}")

# cross-links que NO recibieron tabla (ninguno: todos los RELATED estan en TABLES)
for fn, rel in RELATED.items():
    if fn not in TABLES:
        p = BASE / fn
        d = json.loads(p.read_text(encoding="utf-8"))
        d["relatedSlugs"] = rel
        d["lastReviewed"] = TODAY
        p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"OK {fn}  (solo cross-link)")

print(f"\nTotal archivos modificados: {len(changed)}")
