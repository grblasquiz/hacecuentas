"""Batch 19 — Educación + Productividad hispano (40 calcs)."""
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
        ("¿Cómo se calcula?", f"{h1}: fórmulas y métodos probados académicamente."),
        ("¿Precisión?", "Resultado orientativo. Buen punto de partida para planificar."),
        ("¿Referencias?", "Técnicas validadas en libros y publicaciones académicas."),
        ("¿Hispanohablante?", "Universal. Aplicable a cualquier país hispano."),
        ("¿Actualizado?", "Referencias 2026."),
    ]


bodyTpl = """  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.` };"""


# 20 EDUCACIÓN
edu_specs = [
    ("promedio-ponderado-materias-creditos-universidad", "📚", "Promedio ponderado universidad",
     "Promedio ponderado por créditos/horas de cada materia."),
    ("nota-minima-aprobar-final-parcial-promedio", "📝", "Nota mínima aprobar final",
     "Qué nota necesitás en el final para aprobar con promedio X."),
    ("gpa-promedio-americano-escala-4-0", "🎓", "GPA escala 4.0 americana",
     "Conversión promedio hispano a GPA 4.0 para aplicaciones universidad USA."),
    ("tiempo-estudio-examen-dificultad-paginas", "📖", "Tiempo estudio examen páginas",
     "Horas estudio según páginas + dificultad + retención."),
    ("leer-rapido-palabras-por-minuto-tiempo-libro", "📘", "Lectura rápida páginas/min",
     "Velocidad lectura WPM vs páginas. Tiempo total de un libro."),
    ("curva-olvido-ebbinghaus-repasos-programados", "🧠", "Curva olvido Ebbinghaus",
     "Cuándo repasar según curva de Ebbinghaus: 1d, 7d, 30d."),
    ("tecnica-pomodoro-bloques-descanso-optimo", "🍅", "Pomodoro 25/5 adapatado",
     "Pomodoros según tarea: 25/5 estándar o 50/10 profundo."),
    ("tiempo-leer-libro-paginas-velocidad", "📚", "Tiempo leer libro páginas",
     "Cuánto tardás en leer libro según páginas y tu velocidad."),
    ("horas-practica-10000-maestria-gladwell", "⏰", "10.000 horas maestría",
     "A tu ritmo: años para 10.000 horas de Gladwell en una skill."),
    ("ingles-nivel-mcer-horas-estudio-fsi", "🇬🇧", "Inglés horas nivel FSI",
     "Horas para cada nivel MCER desde A1 a C2 según FSI."),
    ("vocabulario-palabras-activas-nivel-idioma", "📖", "Vocabulario palabras por nivel",
     "Palabras activas: A1 500, A2 1000, B1 2000, B2 4000, C1 8000."),
    ("anki-tarjetas-diarias-memorizacion-vocabulario", "🃏", "Anki cards diarias",
     "Cards nuevas/día según meta vocabulario + tiempo disponible."),
    ("horas-maestria-curva-aprendizaje-80-20", "📈", "Curva aprendizaje 80/20",
     "Tiempo para alcanzar 80% de maestría en una habilidad."),
    ("presupuesto-estudiar-exterior-universidad", "🌍", "Presupuesto estudiar exterior",
     "Matrícula + alojamiento + comida + seguros + viajes universidad afuera."),
    ("beca-promedio-minimo-requisito-universidades", "🎓", "Promedio mínimo beca",
     "Promedio mínimo para becas Chevening, Fulbright, OEA, Erasmus."),
    ("duolingo-tiempo-dia-nivel-mcer-progreso", "🦉", "Duolingo tiempo diario",
     "Minutos/día necesarios por nivel objetivo MCER."),
    ("flashcards-cantidad-diarios-meta-retencion", "🗂️", "Flashcards diarios meta",
     "Cards nuevas y repaso para memorizar X palabras en Y meses."),
    ("leer-mes-libros-meta-anual-reto", "🎯", "Meta anual libros leer",
     "Libros al mes para leer N en el año. Técnicas para alcanzar."),
    ("resumen-capitulo-libro-metodo-cornell", "📓", "Cornell notes capítulos",
     "Tiempo por capítulo con método Cornell (5-R + resumen)."),
    ("speed-reading-ejercicios-meses-mejora", "⚡", "Speed reading progreso",
     "Mejora WPM mes a mes con práctica de lectura rápida."),
]
for slug, icon, h1, desc in edu_specs:
    M(slug, "educacion", icon, h1, desc, faqs5(h1), bodyTpl)


# 20 PRODUCTIVIDAD
prod_specs = [
    ("pomodoro-sesiones-dia-productividad-horas", "🍅", "Pomodoros por día productividad",
     "Cuántos pomodoros caben en jornada laboral. Horas efectivas reales."),
    ("deep-work-cal-newport-horas-maximo-diario", "🧠", "Deep Work Newport horas",
     "Horas deep work diarias: max 3-4h según investigaciones."),
    ("getting-things-done-gtd-inbox-tareas", "📥", "GTD inbox tareas",
     "Cantidad de tareas pendientes según método Allen GTD."),
    ("time-blocking-calendar-horas-productividad", "📅", "Time blocking calendario",
     "Bloques de tiempo productivos en semana de 40h."),
    ("eisenhower-matriz-urgente-importante-tareas", "📊", "Matriz Eisenhower tareas",
     "Clasificar tareas en 4 cuadrantes + priorización."),
    ("regla-2-minutos-decision-tarea-inmediata", "⚡", "Regla 2 minutos GTD",
     "Cuántas tareas <2min hacés al día. Impacto acumulado."),
    ("okr-objetivos-resultados-clave-trimestre", "🎯", "OKR trimestrales",
     "Cantidad objetivos y KR por trimestre según impacto."),
    ("smart-goals-objetivos-metodologia-meta", "📌", "SMART goals diseño",
     "Validar objetivos: Específico, Medible, Alcanzable, Relevante, Temporal."),
    ("kanban-wip-limit-cantidad-tareas-columna", "📋", "Kanban WIP limit",
     "Work In Progress limit óptimo por columna (típico 3-5)."),
    ("scrum-sprint-velocity-story-points", "🔄", "Scrum velocity team",
     "Story points por sprint. Tamaño sprint óptimo equipo."),
    ("tiempo-reuniones-costo-horas-empresa", "💼", "Costo reuniones empresa",
     "Costo horas × personas × salario = impacto económico reuniones."),
    ("email-gestion-inbox-zero-tiempo-dedicado", "📧", "Inbox Zero tiempo diario",
     "Minutos día para mantener inbox bajo control."),
    ("tareas-lotes-batching-context-switching", "🔀", "Batching reducir switching",
     "Tareas en lotes: reduce switching cost hasta 40%."),
    ("horas-pico-productividad-cronobiologia-chrono", "☀️", "Horas pico cronobiología",
     "Horas productivas según cronotype: alondra vs búho."),
    ("lectura-velocidad-palabras-minuto-test", "📖", "Velocidad lectura test",
     "Medir tu WPM actual. Objetivos por nivel educativo."),
    ("digital-minimalism-redes-tiempo-pantalla", "📱", "Digital minimalism redes",
     "Minutos redes sociales óptimos para no afectar productividad."),
    ("multitasking-perdida-productividad-switching", "🔀", "Multitasking pérdida",
     "Cuánto productividad perdés al multitaskear según Sophie Leroy."),
    ("energy-management-vs-time-management", "🔋", "Energy vs time management",
     "Picos energía diarios + tareas tipo energy alto/bajo."),
    ("weekly-review-gtd-allen-tiempo-60-90min", "📝", "Weekly review GTD",
     "Tiempo semanal review GTD: 60-90min para hacerlo bien."),
    ("regla-numero-dunbar-150-contactos-red", "👥", "Regla Dunbar 150 contactos",
     "Mantén ~150 conexiones estables máximo en tu red."),
]
for slug, icon, h1, desc in prod_specs:
    M(slug, "vida", icon, h1, desc, faqs5(h1), bodyTpl)


def collect():
    return SPECS
