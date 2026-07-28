import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'py/trabajo/dias-y-notas',
  title: "¿Cuántos días o qué promedio tengo? | Hacé Cuentas",
  description: "Hub de decisión con 2 cálculos: Calculadora de días hábiles — Paraguay 2026 (con feriados); Calculadora de promedio de notas — Paraguay (MEC, 1 a 5).",
  silo: "Días y notas",
  siloHref: '/py/trabajo',
  locale: 'py',
  eyebrow: "Paraguay · Días y notas",
  h1: "¿Cuántos días o qué promedio tengo?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de días hábiles — Paraguay 2026 (con feriados)",
    "hint": "Paraguay tiene 13 feriados nacionales en 2026, incluido el nuevo 20 de junio (Jura de la Constitución, trasladado al lunes 22). Entre el 1 y el 30 de junio de 2026 hay 20 días hábiles, con 2 feriados.",
    "yes": [
      "En 2026 Paraguay tiene **13 feriados nacionales**, entre ellos el **nuevo 20 de junio** (Jura de la Constitución, trasladado al lunes 22). La calculadora resta **sábados, domingos y feriados** al rango que elijas. Recordá que los feriados **movibles** (Héroes, Paz del Chaco, Jura, Boquerón) pueden reubicarse por decreto: confirmá siempre el calendario oficial para plazos legales."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "Paraguay tiene 13 feriados nacionales en 2026, incluido el nuevo 20 de junio (Jura de la Constitución, trasladado al lunes 22). Entre el 1 y el 30 de junio de 2026 hay 20 días hábiles, con 2 feriados."
  },
  {
    "id": "c2",
    "label": "Calculadora de promedio de notas — Paraguay (MEC, 1 a 5)",
    "hint": "En Paraguay el MEC califica de 1 a 5: 1 (Insuficiente), 2 (Aceptable, mínimo para aprobar), 3 (Bueno), 4 (Distinguido) y 5 (Excelente). Notas de 3, 4 y 2 dan un promedio de 3,00, que aprueba.",
    "yes": [
      "En la escala MEC de **1 a 5**, la nota mínima para aprobar es **2**. El promedio se calcula sumando las notas (multiplicadas por su peso si corresponde) y dividiendo por la cantidad de notas (o la suma de pesos). La calculadora también te dice **qué nota necesitás en la próxima evaluación** para alcanzar tu meta. Es una herramienta de estudio; la nota oficial la registra tu institución."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "En Paraguay el MEC califica de 1 a 5: 1 (Insuficiente), 2 (Aceptable, mínimo para aprobar), 3 (Bueno), 4 (Distinguido) y 5 (Excelente). Notas de 3, 4 y 2 dan un promedio de 3,00, que aprueba."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__fechaInicio",
    "label": "Calculadora de días hábiles — Paraguay 2026 (con feriados): Fecha de inicio",
    "type": "date",
    "value": "2026-07-28",
    "thousands": false
  },
  {
    "id": "c1__fechaFin",
    "label": "Calculadora de días hábiles — Paraguay 2026 (con feriados): Fecha final",
    "type": "date",
    "value": "2026-07-28",
    "thousands": false
  },
  {
    "id": "c1__incluyeSabado",
    "label": "Calculadora de días hábiles — Paraguay 2026 (con feriados): ¿Contar el sábado como hábil?",
    "type": "select",
    "value": "no",
    "options": [
      {
        "value": "no",
        "label": "No, solo lunes a viernes"
      },
      {
        "value": "si",
        "label": "Sí, de lunes a sábado"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__notas",
    "label": "Calculadora de promedio de notas — Paraguay (MEC, 1 a 5): Notas (separadas por punto y coma)",
    "type": "text",
    "value": 3425,
    "thousands": false
  },
  {
    "id": "c2__pesos",
    "label": "Calculadora de promedio de notas — Paraguay (MEC, 1 a 5): Pesos de cada nota (opcional, mismo orden)",
    "type": "text",
    "value": 112,
    "thousands": false
  },
  {
    "id": "c2__notaMinima",
    "label": "Calculadora de promedio de notas — Paraguay (MEC, 1 a 5): Nota mínima para aprobar",
    "type": "number",
    "value": 2,
    "min": 1,
    "max": 5,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__pesoProxima",
    "label": "Calculadora de promedio de notas — Paraguay (MEC, 1 a 5): Peso de la próxima evaluación",
    "type": "number",
    "value": 1,
    "min": 1,
    "step": 1,
    "thousands": false
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuántos feriados tiene Paraguay en 2026?",
    "a": "**13 feriados nacionales**, incluido el nuevo feriado del 20 de junio (Día de la Jura de la Constitución). Además hay hasta cinco fines de semana largos por los traslados."
  },
  {
    "q": "¿Cuál es el feriado nuevo de 2026?",
    "a": "El **20 de junio, Día de la Jura de la Constitución Nacional**, que conmemora la Constitución de 1992. En 2026 cae sábado y se trasladó al lunes 22 de junio."
  },
  {
    "q": "¿Qué feriados se trasladan en 2026?",
    "a": "Se trasladan los movibles: Día de los Héroes (del 1/3 al lunes 2/3) y la Jura de la Constitución (del 20/6 al lunes 22/6). Paz del Chaco (12/6) y Victoria de Boquerón (29/9) también son movibles por decreto."
  },
  {
    "q": "¿La calculadora cuenta los sábados?",
    "a": "Por defecto no: cuenta de lunes a viernes. Podés elegir la opción de contar sábados como hábiles, útil para comercios y talleres que trabajan de lunes a sábado."
  },
  {
    "q": "¿Qué pasa si un feriado cae en fin de semana?",
    "a": "Si cae sábado o domingo y no se traslada, no descuenta un día hábil adicional, porque ese día ya no era laborable. Si se traslada a un lunes, sí resta un día hábil."
  },
  {
    "q": "¿Incluye feriados departamentales o municipales?",
    "a": "No. Solo considera los 13 feriados **nacionales**. Los feriados departamentales, aniversarios de ciudades y asuetos locales no están incluidos."
  },
  {
    "q": "¿Sirve para calcular plazos legales?",
    "a": "Como referencia sí, pero para un plazo legal o contractual conviene confirmar el calendario oficial, ya que los feriados movibles pueden reubicarse por decreto."
  }
],
  sources: [
  {
    "name": "La Nación — El 2026 tendrá 13 feriados y cinco fines de semana largos",
    "url": "https://www.lanacion.com.py/pais/2026/01/02/el-2026-tendra-13-feriados-ademas-de-cinco-fines-de-semana-largos/",
    "publisher": "La Nación",
    "date": "2026"
  },
  {
    "name": "ABC Color — Feriados para el 2026",
    "url": "https://www.abc.com.py/nacionales/2025/11/13/estos-son-los-feriados-para-el-2026/",
    "publisher": "ABC Color",
    "date": "2026"
  },
  {
    "name": "MEC — Valoración del Nivel Medio (sistema de evaluación)",
    "url": "https://mec.gov.py/talento/cms/wp-content/uploads/2021/07/ejes_tematicos/1_Dimensi%C3%B3n_Gesti%C3%B3n_Pedag%C3%B3gica/1-3_Evaluaci%C3%B3n/1-3-4_Valoraci%C3%B3n_Nivel_Medio.pdf",
    "publisher": "Ministerio de Educación y Ciencias",
    "date": "2026"
  },
  {
    "name": "Agencia IP — MEC oficializa criterios del sistema de evaluación",
    "url": "https://www.ip.gov.py/ip/2020/07/23/mec-oficializa-criterios-generales-del-sistema-de-evaluacion-de-todos-los-niveles-educativos-acordado-durante-el-aty-guasu/",
    "publisher": "Agencia de Información Paraguaya",
    "date": "2026"
  }
],
  replaces: [
    '/py/calculadora-dias-habiles-feriados-paraguay-2026', // Absorbida como caso calculable con formulaId dias-habiles-feriados-paraguay-2026.
    '/py/calculadora-promedio-notas-paraguay', // Absorbida como caso calculable con formulaId promedio-notas-paraguay.
  ],
  lastReviewed: '2026-07-28',
};
