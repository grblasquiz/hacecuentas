import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pe/estudio/estudiar-y-aprobar',
  title: "¿Cuánto cuesta estudiar y qué nota necesito? | Hacé Cuentas",
  description: "Hub de decisión con 2 cálculos: ¿Cuánto cuesta estudiar en una universidad privada en Perú? (2026); Calculadora de Promedio Ponderado Universitario — Perú (escala 0-20).",
  silo: "Estudiar en Perú",
  siloHref: '/pe/estudio',
  locale: 'pe',
  eyebrow: "Perú · Estudiar en Perú",
  h1: "¿Cuánto cuesta estudiar y qué nota necesito?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "¿Cuánto cuesta estudiar en una universidad privada en Perú? (2026)",
    "hint": "El costo total de una carrera en una universidad privada peruana en 2026 depende de la pensión mensual (desde unos S/ 460 por cuota en las más económicas como UPN hasta S/ 6.594 en Medicina de la UPC), el número de cuotas por ciclo (lo habitual son 5), la matrícula por ciclo (S/ 200 a S/ 460) y los ciclos de la carrera (típicamente 10, es decir 5 años). Una carrera de 10 ciclos con pensión de S/ 1.700, 5 cuotas y S/ 360 de matrícula cuesta unos S/ 88.600 en total. Las más económicas rondan los S/ 25.000–35.000 y Medicina puede superar los S/ 300.000. Ingresá tus datos para el cálculo exacto.",
    "yes": [
      "Costo total = N° de ciclos × (cuotas por ciclo × pensión + matrícula). Con 5 cuotas y 10 ciclos, una pensión de S/ 1.700 + matrícula S/ 360 suma **~S/ 88.600** por toda la carrera; las más económicas rondan S/ 25.000–35.000 y Medicina supera S/ 300.000."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-06-15.",
    "answer": "El costo total de una carrera en una universidad privada peruana en 2026 depende de la pensión mensual (desde unos S/ 460 por cuota en las más económicas como UPN hasta S/ 6.594 en Medicina de la UPC), el número de cuotas por ciclo (lo habitual son 5), la matrícula por ciclo (S/ 200 a S/ 460) y los ciclos de la carrera (típicamente 10, es decir 5 años). Una carrera de 10 ciclos con pensión de S/ 1.700, 5 cuotas y S/ 360 de matrícula cuesta unos S/ 88.600 en total. Las más económicas rondan los S/ 25.000–35.000 y Medicina puede superar los S/ 300.000. Ingresá tus datos para el cálculo exacto."
  },
  {
    "id": "c2",
    "label": "Calculadora de Promedio Ponderado Universitario — Perú (escala 0-20)",
    "hint": "El promedio ponderado universitario en Perú (escala 0-20) se calcula multiplicando cada nota por los créditos del curso y dividiendo entre el total de créditos. Con notas 15, 12, 17, 14 y créditos 4, 3, 5, 4: da 14,81.",
    "yes": [
      "Promedio ponderado = **Σ(nota × créditos) ÷ total de créditos**, en escala **0-20**. Se aprueba con **11** (el 10,5 redondea a 11 en la mayoría de universidades). Los cursos de más créditos mandan: cuida las notas de los cursos de 4-5 créditos, que son los que mueven tu tercio superior y tus becas."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "El promedio ponderado universitario en Perú (escala 0-20) se calcula multiplicando cada nota por los créditos del curso y dividiendo entre el total de créditos. Con notas 15, 12, 17, 14 y créditos 4, 3, 5, 4: da 14,81."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__pensionCuota",
    "label": "¿Cuánto cuesta estudiar en una universidad privada en Perú? (2026): Pensión por cuota (S/)",
    "type": "number",
    "value": 1700,
    "min": 0,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c1__cuotasPorCiclo",
    "label": "¿Cuánto cuesta estudiar en una universidad privada en Perú? (2026): Cuotas por ciclo",
    "type": "number",
    "value": 5,
    "min": 1,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__matriculaPorCiclo",
    "label": "¿Cuánto cuesta estudiar en una universidad privada en Perú? (2026): Matrícula por ciclo (S/)",
    "type": "number",
    "value": 360,
    "min": 0,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c1__numCiclos",
    "label": "¿Cuánto cuesta estudiar en una universidad privada en Perú? (2026): Número de ciclos de la carrera",
    "type": "number",
    "value": 10,
    "min": 1,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__ciclosCursados",
    "label": "¿Cuánto cuesta estudiar en una universidad privada en Perú? (2026): Ciclos ya pagados (opcional)",
    "type": "number",
    "value": 1,
    "min": 0,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__aumentoAnual",
    "label": "¿Cuánto cuesta estudiar en una universidad privada en Perú? (2026): Aumento anual de pensión (%) (opcional)",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 1000,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c2__notas",
    "label": "Calculadora de Promedio Ponderado Universitario — Perú (escala 0-20): Tus notas (0-20, separadas por coma)",
    "type": "text",
    "value": "15,12,17,14",
    "thousands": false,
    "help": "Escala vigesimal 0-20, en el mismo orden que los créditos."
  },
  {
    "id": "c2__creditos",
    "label": "Calculadora de Promedio Ponderado Universitario — Perú (escala 0-20): Créditos de cada curso (mismo orden)",
    "type": "text",
    "value": "4,3,5,4",
    "thousands": false,
    "help": "Los créditos figuran en tu plan de estudios o intranet."
  },
  {
    "id": "c2__creditosPendiente",
    "label": "Calculadora de Promedio Ponderado Universitario — Perú (escala 0-20): Créditos del curso pendiente (opcional)",
    "type": "number",
    "value": 0,
    "min": 0,
    "max": 30,
    "step": 0.5,
    "thousands": false,
    "help": "Para calcular cuánto necesitas en un curso que aún no tiene nota."
  },
  {
    "id": "c2__objetivo",
    "label": "Calculadora de Promedio Ponderado Universitario — Perú (escala 0-20): Promedio objetivo (opcional)",
    "type": "number",
    "value": 0,
    "min": 0,
    "max": 20,
    "step": 0.01,
    "thousands": false,
    "help": "El promedio al que quieres llegar incluyendo el curso pendiente."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuánto cuesta una carrera completa en una universidad privada en Perú en 2026?",
    "a": "Depende fuerte de la universidad y la carrera. Las más económicas (UPN, UPSJB) rondan los **S/ 25.000–40.000** por toda la carrera; las medianas (USIL, UPCH), unos **S/ 60.000–90.000**; y las premium (PUCP, UPC, U. de Lima), entre **S/ 120.000 y S/ 230.000**. Carreras como Medicina pueden superar los **S/ 300.000**."
  },
  {
    "q": "¿Cuántas cuotas se pagan por ciclo?",
    "a": "Lo más habitual son **5 cuotas por ciclo** (semestre), como confirman UPN, UTP y UPC. Algunas universidades manejan otros esquemas, por eso la calculadora te deja cambiar el número de cuotas por ciclo."
  },
  {
    "q": "¿Cuántos ciclos tiene una carrera?",
    "a": "La mayoría de las carreras duran **10 ciclos** (5 años, 2 ciclos por año). Carreras como Medicina, Arquitectura o algunas ingenierías pueden llegar a **12 o 14 ciclos**. Ajustá el número de ciclos según tu plan de estudios."
  },
  {
    "q": "¿La matrícula está incluida en la pensión?",
    "a": "No. La **matrícula** (o inscripción) es un pago aparte al inicio de cada ciclo, normalmente entre **S/ 200 y S/ 460** (UTP cobra S/ 459; UPN entre S/ 100 y S/ 380). La calculadora la suma a las cuotas para darte el costo real del ciclo."
  },
  {
    "q": "¿Cuál es la pensión más baja y la más alta en 2026?",
    "a": "La pensión por cuota va desde alrededor de **S/ 460** en las universidades más económicas (UPN parte en S/ 460 por cuota según su portal de transparencia) hasta el tope del mercado: en la UPC, la categoría más alta de Medicina llega a **S/ 6.594 al mes** (Res. DAF 257-2025)."
  },
  {
    "q": "¿Qué son las escalas de pensión?",
    "a": "En universidades como PUCP, UPC y USIL la pensión se asigna por **escalas (o categorías)** según una evaluación socioeconómica. La escala más baja puede pagar entre 20% y 70% menos que la más alta. En la PUCP las escalas son **numeradas, de G1 (la más subvencionada) a G9 (la más cara)**; en UPC y UPN se usan categorías por carrera. Si no participás de la evaluación, te asignan automáticamente la escala más cara."
  },
  {
    "q": "¿Cómo influye el aumento anual de la pensión?",
    "a": "Muchas universidades suben la pensión cada año por inflación o política interna. En una carrera de 5 años, un aumento del 5% anual puede encarecer el costo total entre 10% y 15%. La calculadora aplica ese ajuste cada 2 ciclos (un año académico) si lo activás."
  }
],
  sources: [
  {
    "name": "UPC — Pensiones de Pregrado (Transparencia)",
    "url": "https://www.upc.edu.pe/transparencia-upc/pensiones-y-tarifas/pensiones-pregrado/"
  },
  {
    "name": "UPN — Pensiones y Tarifas (Transparencia)",
    "url": "https://www.upn.edu.pe/transparencia/pensiones-tarifas"
  },
  {
    "name": "PUCP — Sistema de Pensiones (escalas G1–G9)",
    "url": "https://admision.pucp.edu.pe/becas-y-pensiones/sistema-de-pensiones"
  },
  {
    "name": "PUCP — Escala, derechos académicos y valor del crédito 2026-1",
    "url": "https://estudiante.pucp.edu.pe/informacion-economica/escala-derechos-academicos-y-valor-del-credito/semestre-2026-1/"
  },
  {
    "name": "Proyecto Masi — Cuánto cuesta estudiar en las principales universidades privadas del Perú",
    "url": "https://proyectomasi.pe/cuanto-cuesta-estudiar-en-las-principales-universidades-privadas-del-peru-en-2025/"
  },
  {
    "name": "UPC — ¿Cómo se calcula el promedio ponderado acumulado (PGA)?",
    "url": "https://contactoweb-epg.upc.edu.pe/es_ES/notas-y-situaci%C3%B3n-acad%C3%A9mica/%C2%BFc%C3%B3mo-se-realiza-el-c%C3%A1lculo-de-mi-promedio-ponderado-acumulado-pga",
    "publisher": "Universidad Peruana de Ciencias Aplicadas",
    "date": "2026"
  },
  {
    "name": "PuntoEdu PUCP — Todo sobre el promedio ponderado de notas estandarizadas",
    "url": "https://puntoedu.pucp.edu.pe/noticia/promedio-ponderado-de-notas-estandarizadas/",
    "publisher": "Pontificia Universidad Católica del Perú",
    "date": "2025"
  }
],
  replaces: [
    '/pe/calculadora-costo-universidad-privada-peru', // Absorbida como caso calculable con formulaId costo-universidad-privada-peru.
    '/pe/calculadora-promedio-ponderado-universidad-peru', // Absorbida como caso calculable con formulaId promedio-ponderado-universidad-peru.
  ],
  lastReviewed: '2026-07-28',
};
