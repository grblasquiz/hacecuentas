import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'ec/hogar/comida-salud-y-construccion',
  title: "Calorías, costo de construcción y medidas de cocina, Ecuador",
  description: "Calculadora de calorías diarias, costo de construcción por m² 2026 y conversor de tazas a gramos para Ecuador, reunidos en una sola página de decisión.",
  silo: "Cuentas del hogar",
  siloHref: '/ec/hogar',
  locale: 'ec',
  eyebrow: "Ecuador · Cuentas del hogar",
  h1: "¿Cuánto necesito para mi salud, cocina o construcción en Ecuador?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 3 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['3 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de calorías diarias — Ecuador",
    "hint": "Las calorías diarias se estiman con la ecuación Mifflin-St Jeor: primero el metabolismo basal (10 × peso kg + 6,25 × altura cm − 5 × edad + 5 en hombres o −161 en mujeres) y luego se multiplica por un factor de actividad (1,2 sedentario a 1,725 intenso). Para un hombre de 70 kg, 175 cm, 30 años y actividad moderada, el metabolismo basal es 1.649 kcal y el mantenimiento 2.556 kcal por día. Es una referencia orientativa; consultá a un nutricionista para un plan individual.",
    "yes": [
      "Metabolismo basal (Mifflin-St Jeor) = 10 × peso(kg) + 6,25 × altura(cm) − 5 × edad + (5 hombres / −161 mujeres). Calorías de mantenimiento = basal × factor de actividad (1,2 sedentario a 1,725 intenso). Es una referencia orientativa, no un plan nutricional."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "Las calorías diarias se estiman con la ecuación Mifflin-St Jeor: primero el metabolismo basal (10 × peso kg + 6,25 × altura cm − 5 × edad + 5 en hombres o −161 en mujeres) y luego se multiplica por un factor de actividad (1,2 sedentario a 1,725 intenso). Para un hombre de 70 kg, 175 cm, 30 años y actividad moderada, el metabolismo basal es 1.649 kcal y el mantenimiento 2.556 kcal por día. Es una referencia orientativa; consultá a un nutricionista para un plan individual."
  },
  {
    "id": "c2",
    "label": "Calculadora de Costo de Construcción por m² 2026",
    "hint": "El costo de construcción por m² en Ecuador 2026 depende del nivel de terminación: económica ~$950/m², media ~$1.250/m² y premium ~$1.700/m². Una casa media de 100 m² ronda los $125.000. Es un rango orientativo: varía por ciudad, terreno y acabados.",
    "yes": [
      "Costo total = m² × costo/m² según nivel. En 2026: económica ~$950/m², media ~$1.250/m², premium ~$1.700/m² (costo directo). Del total, ~60% es materiales y ~40% mano de obra. No incluye terreno, diseño ni permisos."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-01-01.",
    "answer": "El costo de construcción por m² en Ecuador 2026 depende del nivel de terminación: económica ~$950/m², media ~$1.250/m² y premium ~$1.700/m². Una casa media de 100 m² ronda los $125.000. Es un rango orientativo: varía por ciudad, terreno y acabados."
  },
  {
    "id": "c3",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — Ecuador",
    "hint": "Tomando la taza estándar de 240 ml: harina de trigo 120 g, azúcar blanca 200 g, mantequilla 227 g y cacao en polvo 85 g por taza. Para pasar de gramos a tazas se divide el peso entre los gramos por taza del ingrediente.",
    "yes": [
      "El cacao en polvo es el ingrediente más liviano de la tabla (85 g por taza) y la miel el más pesado (340 g): cuatro veces de diferencia dentro de la misma taza de 240 ml."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-04-28.",
    "answer": "Tomando la taza estándar de 240 ml: harina de trigo 120 g, azúcar blanca 200 g, mantequilla 227 g y cacao en polvo 85 g por taza. Para pasar de gramos a tazas se divide el peso entre los gramos por taza del ingrediente."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__pesoKg",
    "label": "Calculadora de calorías diarias — Ecuador: Peso (kg)",
    "type": "number",
    "value": 70,
    "min": 25,
    "max": 350,
    "step": 0.1,
    "thousands": false
  },
  {
    "id": "c1__alturaCm",
    "label": "Calculadora de calorías diarias — Ecuador: Altura (cm)",
    "type": "number",
    "value": 175,
    "min": 100,
    "max": 230,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__edad",
    "label": "Calculadora de calorías diarias — Ecuador: Edad",
    "type": "number",
    "value": 30,
    "min": 18,
    "max": 100,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__sexo",
    "label": "Calculadora de calorías diarias — Ecuador: Sexo usado por la ecuación",
    "type": "select",
    "value": "femenino",
    "options": [
      {
        "value": "femenino",
        "label": "Femenino"
      },
      {
        "value": "masculino",
        "label": "Masculino"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__actividad",
    "label": "Calculadora de calorías diarias — Ecuador: Actividad habitual",
    "type": "select",
    "value": "moderado",
    "options": [
      {
        "value": "sedentario",
        "label": "Sedentaria/o (poco o nada de ejercicio)"
      },
      {
        "value": "ligero",
        "label": "Ligera (ejercicio 1–3 días/semana)"
      },
      {
        "value": "moderado",
        "label": "Moderada (ejercicio 3–5 días/semana)"
      },
      {
        "value": "intenso",
        "label": "Intensa (ejercicio 6–7 días/semana)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__metros",
    "label": "Calculadora de Costo de Construcción por m² 2026: Metros cuadrados a construir (m²)",
    "type": "number",
    "value": 100,
    "min": 1,
    "max": 100000,
    "step": 1,
    "thousands": false,
    "help": "Superficie de construcción (no del terreno). Una casa media ronda 90-150 m²."
  },
  {
    "id": "c2__calidad",
    "label": "Calculadora de Costo de Construcción por m² 2026: Nivel de terminación",
    "type": "select",
    "value": "media",
    "options": [
      {
        "value": "economica",
        "label": "Económica (básico)"
      },
      {
        "value": "media",
        "label": "Media (estándar)"
      },
      {
        "value": "premium",
        "label": "Premium (alto)"
      }
    ],
    "thousands": false,
    "help": "Económica: acabados básicos. Media: calidad estándar. Premium: acabados de alto nivel."
  },
  {
    "id": "c3__ingredient",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — Ecuador: Ingrediente",
    "type": "select",
    "value": "all_purpose_flour",
    "options": [
      {
        "value": "all_purpose_flour",
        "label": "Harina de trigo (todo uso)"
      },
      {
        "value": "whole_wheat_flour",
        "label": "Harina integral"
      },
      {
        "value": "white_sugar",
        "label": "Azúcar blanca"
      },
      {
        "value": "brown_sugar",
        "label": "Azúcar morena (compacta)"
      },
      {
        "value": "powdered_sugar",
        "label": "Azúcar glas (impalpable)"
      },
      {
        "value": "butter",
        "label": "Mantequilla"
      },
      {
        "value": "vegetable_oil",
        "label": "Aceite vegetal"
      },
      {
        "value": "milk",
        "label": "Leche"
      },
      {
        "value": "water",
        "label": "Agua"
      },
      {
        "value": "honey",
        "label": "Miel"
      },
      {
        "value": "cocoa_powder",
        "label": "Cacao en polvo"
      },
      {
        "value": "cornstarch",
        "label": "Maicena (almidón de maíz)"
      },
      {
        "value": "rolled_oats",
        "label": "Avena en hojuelas"
      },
      {
        "value": "rice_white",
        "label": "Arroz blanco (crudo)"
      },
      {
        "value": "salt",
        "label": "Sal"
      },
      {
        "value": "baking_powder",
        "label": "Polvo de hornear"
      },
      {
        "value": "baking_soda",
        "label": "Bicarbonato de sodio"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__quantity",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — Ecuador: Cantidad",
    "type": "number",
    "value": 1,
    "step": 0.01,
    "thousands": false
  },
  {
    "id": "c3__from_unit",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — Ecuador: Unidad de origen",
    "type": "select",
    "value": "cup",
    "options": [
      {
        "value": "cup",
        "label": "Taza (240 ml)"
      },
      {
        "value": "tablespoon",
        "label": "Cucharada (15 ml)"
      },
      {
        "value": "teaspoon",
        "label": "Cucharadita (5 ml)"
      },
      {
        "value": "gram",
        "label": "Gramos (g)"
      },
      {
        "value": "ounce",
        "label": "Onza (oz)"
      },
      {
        "value": "pound",
        "label": "Libra (lb)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c3__to_unit",
    "label": "Convertir tazas a gramos (y viceversa) por ingrediente — Ecuador: Unidad de destino",
    "type": "select",
    "value": "gram",
    "options": [
      {
        "value": "cup",
        "label": "Taza (240 ml)"
      },
      {
        "value": "tablespoon",
        "label": "Cucharada (15 ml)"
      },
      {
        "value": "teaspoon",
        "label": "Cucharadita (5 ml)"
      },
      {
        "value": "gram",
        "label": "Gramos (g)"
      },
      {
        "value": "ounce",
        "label": "Onza (oz)"
      },
      {
        "value": "pound",
        "label": "Libra (lb)"
      }
    ],
    "thousands": false
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuántas calorías necesito por día?",
    "a": "Depende de tu peso, altura, edad, sexo y actividad. La calculadora lo estima con Mifflin-St Jeor: por ejemplo, un hombre de 70 kg, 175 cm, 30 años y actividad moderada necesita unas **2.556 kcal/día** para mantener su peso. Ingresá tus datos para ver tu estimación."
  },
  {
    "q": "¿Qué es el metabolismo basal?",
    "a": "Es la cantidad de calorías que tu cuerpo gasta **en reposo total**, solo para funcionar (respirar, circular la sangre, mantener la temperatura). Representa la mayor parte de tu gasto diario. Para un hombre de 70 kg, 175 cm y 30 años, el metabolismo basal es de unas **1.649 kcal/día**."
  },
  {
    "q": "¿Cuántas calorías debo comer para bajar de peso?",
    "a": "Un **déficit moderado** de 300 a 500 kcal por debajo de tu mantenimiento suele ser sostenible y saludable. Bajar demasiado rápido (déficits muy grandes) es contraproducente y difícil de mantener. Idealmente, hacelo acompañado de un nutricionista."
  },
  {
    "q": "¿Y para subir de peso o ganar músculo?",
    "a": "Un **superávit** de 250 a 500 kcal por encima de tu mantenimiento, combinado con **entrenamiento de fuerza**, favorece la ganancia de masa muscular. Sin entrenamiento, el superávit tiende a acumularse como grasa."
  },
  {
    "q": "¿Qué es la ecuación Mifflin-St Jeor?",
    "a": "Es la fórmula más usada hoy para estimar el metabolismo basal: TMB = 10 × peso(kg) + 6,25 × altura(cm) − 5 × edad + 5 (hombres) o −161 (mujeres). Es más precisa que la vieja Harris-Benedict para la población general."
  },
  {
    "q": "¿El factor de actividad cómo lo elijo?",
    "a": "Sedentaria (1,2) si casi no hacés ejercicio; ligera (1,375) si entrenás 1–3 días; moderada (1,55) si entrenás 3–5 días; intensa (1,725) si entrenás 6–7 días. Si tu trabajo es físico, subí un nivel. Ante la duda, elegí el nivel más bajo para no sobreestimar."
  },
  {
    "q": "¿Este cálculo sirve para niños o embarazadas?",
    "a": "No. La ecuación Mifflin-St Jeor está pensada para **adultos**. Los niños, adolescentes, embarazadas y personas en lactancia tienen requerimientos distintos que deben calcularse con otras fórmulas y siempre bajo supervisión de un profesional de la salud."
  }
],
  sources: [
  {
    "name": "Mifflin MD, St Jeor ST et al. — A new predictive equation for resting energy expenditure (Am J Clin Nutr, 1990)",
    "url": "https://pubmed.ncbi.nlm.nih.gov/2305711/",
    "publisher": "American Journal of Clinical Nutrition",
    "date": "2026"
  },
  {
    "name": "Academy of Nutrition and Dietetics — Estimación del gasto energético en reposo (Mifflin-St Jeor)",
    "url": "https://www.eatright.org/food/nutrition/dietary-guidelines-and-myplate/how-many-calories-do-adults-need",
    "publisher": "Academy of Nutrition and Dietetics",
    "date": "2026"
  },
  {
    "name": "INEC - Índice de Precios de la Construcción (IPCO)",
    "url": "https://www.ecuadorencifras.gob.ec/indice-de-precios-de-la-construccion/",
    "publisher": "Instituto Nacional de Estadística y Censos",
    "date": "2026"
  },
  {
    "name": "Cámara de la Construcción de Guayaquil - Precios de rubros",
    "url": "https://www.cconstruccion.net/",
    "publisher": "Cámara de la Construcción de Guayaquil",
    "date": "2026"
  },
  {
    "name": "USDA — Ingredient Weight Chart (tabla de densidades de ingredientes alimenticios)",
    "url": "https://fdc.nal.usda.gov/food-search",
    "publisher": "United States Department of Agriculture"
  },
  {
    "name": "King Arthur Baking — Ingredient Weight Chart",
    "url": "https://www.kingarthurbaking.com/learn/ingredient-weight-chart",
    "publisher": "King Arthur Baking Company"
  },
  {
    "name": "INEN — Servicio Ecuatoriano de Normalización (metrología y unidades de medida)",
    "url": "https://www.normalizacion.gob.ec/",
    "publisher": "Servicio Ecuatoriano de Normalización"
  }
],
  replaces: [
    '/ec/calculadora-calorias-diarias-ecuador', // Absorbida como caso calculable con formulaId inta-calorias-diarias-chile.
    '/ec/calculadora-costo-construccion-m2-ecuador', // Absorbida como caso calculable con formulaId costo-construccion-m2-ecuador.
    '/ec/conversor-tazas-a-gramos-cocina-ecuador', // Absorbida como caso calculable con formulaId conversion-medidas-cocina-tazas-gramos.
  ],
  lastReviewed: '2026-08-16',
};
