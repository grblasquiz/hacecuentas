import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'pe/hogar/costo-de-construir',
  title: "¿Cuánto cuesta construir mi casa? | Hacé Cuentas",
  description: "Hub de decisión con 1 cálculos: Calculadora de Costo de Construcción por m² 2026.",
  silo: "Construir en Perú",
  siloHref: '/pe/hogar',
  locale: 'pe',
  eyebrow: "Perú · Construir en Perú",
  h1: "¿Cuánto cuesta construir mi casa?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva la fórmula original y reúne la decisión en una sola página.",
  stamps: ['1 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de Costo de Construcción por m² 2026",
    "hint": "El costo de construcción por m² en Perú 2026 depende del nivel de terminación: económica (casco gris) ~S/ 1.600/m², media (casco habitable) ~S/ 2.150/m² y premium (llave en mano) ~S/ 3.000/m². Una casa media de 100 m² ronda los S/ 215.000. Es un rango orientativo: varía por zona, terreno y acabados.",
    "yes": [
      "Costo total = m² × costo/m² según nivel. En 2026: económica ~S/ 1.600/m², media ~S/ 2.150/m², premium ~S/ 3.000/m² (costo directo). Del total, ~60% es materiales y ~40% mano de obra. No incluye terreno, proyecto ni licencias."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-02-01.",
    "answer": "El costo de construcción por m² en Perú 2026 depende del nivel de terminación: económica (casco gris) ~S/ 1.600/m², media (casco habitable) ~S/ 2.150/m² y premium (llave en mano) ~S/ 3.000/m². Una casa media de 100 m² ronda los S/ 215.000. Es un rango orientativo: varía por zona, terreno y acabados."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__metros",
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
    "id": "c1__calidad",
    "label": "Calculadora de Costo de Construcción por m² 2026: Nivel de terminación",
    "type": "select",
    "value": "media",
    "options": [
      {
        "value": "economica",
        "label": "Económica (casco gris / básico)"
      },
      {
        "value": "media",
        "label": "Media (casco habitable / acabados básicos)"
      },
      {
        "value": "premium",
        "label": "Premium (llave en mano / acabados de lujo)"
      }
    ],
    "thousands": false,
    "help": "Casco gris: estructura sin acabados. Casco habitable: instalaciones y pisos básicos. Premium: acabados de lujo."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuánto cuesta el metro cuadrado de construcción en Perú en 2026?",
    "a": "Depende del nivel de terminación: **económica (casco gris)** ~S/ 1.400–1.800/m², **media (casco habitable)** ~S/ 1.900–2.400/m² y **premium (llave en mano)** desde ~S/ 2.800/m². La calculadora usa valores medios de cada rango."
  },
  {
    "q": "¿Qué es el casco gris y qué el casco habitable?",
    "a": "El **casco gris** es la estructura terminada (cimientos, columnas, vigas, techos y muros) sin acabados. El **casco habitable** ya incluye instalaciones eléctricas y sanitarias funcionales, tarrajeo y pisos básicos. La diferencia de costo es importante."
  },
  {
    "q": "¿Cuánto cuesta construir una casa de 100 m²?",
    "a": "A nivel medio (~S/ 2.150/m²), unos **S/ 215.000**. A nivel económico rondaría S/ 160.000 y a nivel premium podría superar los S/ 300.000, siempre como referencia."
  },
  {
    "q": "¿Qué incluye el costo por m²?",
    "a": "Depende del nivel: el casco gris cubre estructura; el casco habitable suma instalaciones y pisos; el llave en mano suma acabados. **No** incluye el terreno, el proyecto arquitectónico, la licencia de edificación ni las obras exteriores."
  },
  {
    "q": "¿Cómo se reparte entre materiales y mano de obra?",
    "a": "Como referencia, alrededor del **60% son materiales y el 40% mano de obra**, aunque la proporción cambia según la partida. La calculadora muestra ese desglose sobre el total estimado."
  },
  {
    "q": "¿La zona cambia mucho el precio?",
    "a": "Sí. El costo depende de la ubicación del terreno (tipo de suelo, acceso, disponibilidad de servicios) y de la región. Construir en Lima suele diferir de provincias por logística y mano de obra."
  },
  {
    "q": "¿Qué son los valores unitarios oficiales?",
    "a": "Son un cuadro que publica el **CAP / SENCICO** cada año: se suman valores de 7 columnas (muros, techos, pisos, puertas, revestimientos, baños, instalaciones) según las características de la edificación para obtener el valor por m². Sirven de referencia oficial para tasaciones."
  }
],
  sources: [
  {
    "name": "CAPECO - Cámara Peruana de la Construcción",
    "url": "https://www.capeco.org/",
    "publisher": "CAPECO",
    "date": "2026"
  },
  {
    "name": "CAP - Valores unitarios oficiales de edificaciones",
    "url": "https://cap.org.pe/valores-unitarios-oficiales-de-edificaciones/",
    "publisher": "Colegio de Arquitectos del Perú",
    "date": "2026"
  },
  {
    "name": "INEI - Índices unificados de precios de la construcción",
    "url": "https://www.gob.pe/inei",
    "publisher": "Instituto Nacional de Estadística e Informática",
    "date": "2026"
  }
],
  replaces: [
    '/pe/calculadora-costo-construccion-m2-peru', // Absorbida como caso calculable con formulaId costo-construccion-m2-peru.
  ],
  lastReviewed: '2026-07-28',
};
