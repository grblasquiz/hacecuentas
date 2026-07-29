import type { HubData } from '../types';

export const hub: HubData = {
  slug: 've/vida/salud-estudio-y-tramites',
  title: "¿Qué número necesito para mi salud, estudio o trámite? | Hacé Cuentas",
  description: "Hub de decisión con 3 cálculos: Calculadora de calorías diarias (gasto energético); Costo del pasaporte y la prórroga (SAIME) en bolívares; Calculadora de promedio de notas e índice académico (escala 0-20).",
  silo: "Salud, estudio y trámites",
  siloHref: '/ve/vida',
  locale: 've',
  eyebrow: "Venezuela · Salud, estudio y trámites",
  h1: "¿Qué número necesito para mi salud, estudio o trámite?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 3 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['3 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de calorías diarias (gasto energético)",
    "hint": "Las calorías diarias que necesitás dependen de tu sexo, edad, peso, altura y nivel de actividad. Esta estimación usa el metabolismo basal (Mifflin-St Jeor) por un factor de actividad, y debe ajustarse con un profesional.",
    "yes": [
      "Calorías diarias = metabolismo basal (Mifflin-St Jeor) × factor de actividad. Para bajar ~0,5 kg/semana restá 500 kcal; para subir, sumá 500. No bajes de 1.200 kcal (mujeres) o 1.500 (hombres) sin supervisión médica."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "Las calorías diarias que necesitás dependen de tu sexo, edad, peso, altura y nivel de actividad. Esta estimación usa el metabolismo basal (Mifflin-St Jeor) por un factor de actividad, y debe ajustarse con un profesional."
  },
  {
    "id": "c2",
    "label": "Costo del pasaporte y la prórroga (SAIME) en bolívares",
    "hint": "El SAIME fija la tarifa del pasaporte y de la prórroga en dólares, pero el pago se hace en bolívares al equivalente de la tasa BCV del día. El costo en bolívares se obtiene multiplicando la tarifa en dólares por la tasa BCV. Como la tasa cambia a diario, el monto en bolívares sube o baja aunque la tarifa en dólares siga igual: por eso conviene calcularlo el mismo día del pago.",
    "yes": [
      "Costo en Bs. = tarifa en USD × tasa BCV del día. La tarifa en dólares la fija el SAIME (referencial: verificala); el monto en bolívares cambia a diario con la tasa BCV. Por eso conviene calcularlo el mismo día del pago."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-24.",
    "answer": "El SAIME fija la tarifa del pasaporte y de la prórroga en dólares, pero el pago se hace en bolívares al equivalente de la tasa BCV del día. El costo en bolívares se obtiene multiplicando la tarifa en dólares por la tasa BCV. Como la tasa cambia a diario, el monto en bolívares sube o baja aunque la tarifa en dólares siga igual: por eso conviene calcularlo el mismo día del pago."
  },
  {
    "id": "c3",
    "label": "Calculadora de promedio de notas e índice académico (escala 0-20)",
    "hint": "En la escala venezolana de 0 a 20, el promedio simple es la suma de las notas dividida entre la cantidad de materias. El índice académico pondera cada nota por sus unidades crédito: Σ(nota × créditos) ÷ Σ créditos.",
    "yes": [
      "Promedio simple = suma de notas ÷ cantidad de materias. Índice académico ponderado = Σ(nota × unidades crédito) ÷ Σ créditos. En la escala 0-20 se aprueba con 10 (configurable). 14-15 es bueno, 16-18 distinguido, 19-20 excelente."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-24.",
    "answer": "En la escala venezolana de 0 a 20, el promedio simple es la suma de las notas dividida entre la cantidad de materias. El índice académico pondera cada nota por sus unidades crédito: Σ(nota × créditos) ÷ Σ créditos."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__sexo",
    "label": "Calculadora de calorías diarias (gasto energético): Sexo biológico",
    "type": "select",
    "value": "masculino",
    "options": [
      {
        "value": "masculino",
        "label": "Masculino"
      },
      {
        "value": "femenino",
        "label": "Femenino"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__edad",
    "label": "Calculadora de calorías diarias (gasto energético): Edad",
    "type": "number",
    "value": 30,
    "suffix": "años",
    "min": 15,
    "max": 100,
    "step": 1,
    "thousands": false,
    "help": "Tu edad actual en años."
  },
  {
    "id": "c1__peso",
    "label": "Calculadora de calorías diarias (gasto energético): Peso",
    "type": "number",
    "value": 75,
    "suffix": "kg",
    "min": 30,
    "max": 300,
    "step": 0.1,
    "thousands": false,
    "help": "Peso corporal en kilogramos."
  },
  {
    "id": "c1__altura",
    "label": "Calculadora de calorías diarias (gasto energético): Altura",
    "type": "number",
    "value": 175,
    "suffix": "cm",
    "min": 100,
    "max": 250,
    "step": 1,
    "thousands": false,
    "help": "Altura en centímetros."
  },
  {
    "id": "c1__actividad",
    "label": "Calculadora de calorías diarias (gasto energético): Nivel de actividad física",
    "type": "select",
    "value": "moderado",
    "options": [
      {
        "value": "sedentario",
        "label": "Sedentario (poco o ningún ejercicio)"
      },
      {
        "value": "ligero",
        "label": "Ligero (1-3 días/semana)"
      },
      {
        "value": "moderado",
        "label": "Moderado (3-5 días/semana)"
      },
      {
        "value": "intenso",
        "label": "Intenso (6-7 días/semana)"
      },
      {
        "value": "muy_intenso",
        "label": "Muy intenso (2x/día o trabajo físico)"
      }
    ],
    "thousands": false,
    "help": "Sedentario: oficina. Ligero: 1-3 entrenos. Moderado: 3-5. Intenso: 6-7. Muy intenso: atleta o trabajo físico pesado."
  },
  {
    "id": "c2__tramite",
    "label": "Costo del pasaporte y la prórroga (SAIME) en bolívares: Trámite",
    "type": "select",
    "value": "pasaporte_adulto",
    "options": [
      {
        "value": "pasaporte_adulto",
        "label": "Pasaporte (adulto)"
      },
      {
        "value": "pasaporte_menor",
        "label": "Pasaporte (menor de edad)"
      },
      {
        "value": "prorroga",
        "label": "Prórroga de pasaporte"
      }
    ],
    "thousands": false,
    "help": "Elegí el trámite que vas a realizar en el SAIME."
  },
  {
    "id": "c2__tarifaUsdManual",
    "label": "Costo del pasaporte y la prórroga (SAIME) en bolívares: Tarifa en dólares (opcional)",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 100000,
    "step": 1,
    "thousands": false,
    "help": "Sobrescribí la tarifa referencial en USD con el monto vigente del SAIME si lo conocés."
  },
  {
    "id": "c2__tasaBcv",
    "label": "Costo del pasaporte y la prórroga (SAIME) en bolívares: Tasa BCV (Bs. por dólar)",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 10000000,
    "step": 0.01,
    "thousands": false,
    "help": "Tasa oficial del BCV del día del pago. Por defecto usa la tasa BCV en vivo."
  },
  {
    "id": "c3__notas",
    "label": "Calculadora de promedio de notas e índice académico (escala 0-20): Notas obtenidas (0 a 20)",
    "type": "text",
    "value": "18,15,20,12",
    "thousands": false,
    "help": "Escribí cada nota entre 0 y 20, separadas por coma o punto y coma."
  },
  {
    "id": "c3__creditos",
    "label": "Calculadora de promedio de notas e índice académico (escala 0-20): Unidades crédito de cada materia (opcional)",
    "type": "text",
    "value": "4,3,5,2",
    "thousands": false,
    "help": "Una por materia, en el mismo orden que las notas. Dejalo vacío para promedio simple."
  },
  {
    "id": "c3__notaAprobatoria",
    "label": "Calculadora de promedio de notas e índice académico (escala 0-20): Nota mínima para aprobar",
    "type": "number",
    "value": 10,
    "min": 0,
    "max": 20,
    "step": 0.5,
    "thousands": false,
    "help": "Por defecto 10. Algunas universidades exigen 9,5 o 10; confirmá tu reglamento."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuántas calorías necesito por día?",
    "a": "Depende de tu sexo, edad, peso, altura y actividad. La calculadora estima tu metabolismo basal con Mifflin-St Jeor y lo multiplica por un factor de actividad. Por ejemplo, un hombre de 30 años, 75 kg, 175 cm y actividad moderada gasta unas 2.633 kcal/día."
  },
  {
    "q": "¿Qué es el metabolismo basal?",
    "a": "Es la energía que tu cuerpo gasta en reposo absoluto para funciones vitales (respirar, circulación, temperatura). Suele ser el 60-70% de tu gasto total. La actividad física se suma por encima de ese valor."
  },
  {
    "q": "¿Cuántas calorías debo comer para bajar de peso?",
    "a": "Restá unas 500 kcal a tu gasto de mantenimiento para bajar ~0,5 kg por semana. Un déficit mayor no siempre es mejor: no conviene bajar de 1.200 kcal (mujeres) o 1.500 (hombres) sin supervisión médica."
  },
  {
    "q": "¿Y para subir de peso o masa muscular?",
    "a": "Sumá unas 300-500 kcal a tu mantenimiento y combinalo con entrenamiento de fuerza. Así el aumento tiende a ser más músculo y menos grasa. La ganancia sana ronda 0,3-0,5 kg por semana."
  },
  {
    "q": "¿Qué fórmula usa esta calculadora?",
    "a": "Mifflin-St Jeor, considerada la más precisa para la población general (margen de error de 5-10%). Existen otras (Harris-Benedict, Katch-McArdle) que se usan en casos específicos o con % de grasa corporal medido."
  },
  {
    "q": "¿Cada cuánto debo recalcular mis calorías?",
    "a": "Cada vez que cambie tu peso de forma notable (unos 5-10 kg) o tu nivel de actividad. El metabolismo se ajusta al nuevo peso, así que un déficit que antes funcionaba puede dejar de hacerlo."
  },
  {
    "q": "¿Sirve durante el embarazo o la lactancia?",
    "a": "No como pauta. El embarazo y la lactancia tienen requerimientos calóricos especiales que deben calcularse con un profesional de la salud. Esta estimación general no los contempla."
  }
],
  sources: [
  {
    "name": "Mifflin MD, St Jeor ST — A new predictive equation for resting energy expenditure",
    "url": "https://pubmed.ncbi.nlm.nih.gov/2305711/"
  },
  {
    "name": "OMS — Alimentación saludable",
    "url": "https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet"
  },
  {
    "name": "SAIME — Servicio Administrativo de Identificación, Migración y Extranjería",
    "url": "https://www.saime.gob.ve/pasaporte/"
  },
  {
    "name": "BCV — tipos de cambio de referencia",
    "url": "https://www.bcv.org.ve/tasas-informativas-sistema-bancario"
  },
  {
    "name": "UCV — Reglamento de Evaluación (escala 0-20 e índice académico)",
    "url": "http://www.ucv.ve/fileadmin/user_upload/facultad_farmacia/UAA/Reglamento_de_Evaluaci%C3%B3n.pdf"
  }
],
  replaces: [
    '/ve/calculadora-calorias-diarias-venezuela', // Absorbida como caso calculable con formulaId calorias-tdee.
    '/ve/calculadora-costo-pasaporte-saime-venezuela', // Absorbida como caso calculable con formulaId costo-pasaporte-saime-venezuela.
    '/ve/calculadora-promedio-notas-20-puntos-venezuela', // Absorbida como caso calculable con formulaId calculadora-promedio-notas-20-puntos-venezuela.
  ],
  lastReviewed: '2026-07-28',
};
