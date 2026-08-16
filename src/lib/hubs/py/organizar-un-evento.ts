import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'py/vivienda/organizar-un-evento',
  title: "Cuánta carne y bebida por persona para un asado, Paraguay",
  description: "Calculá cuánta carne por persona necesitás para el asado y cuántas bebidas comprar para tu evento o fiesta en Paraguay, todo en una sola página.",
  silo: "Eventos en Paraguay",
  siloHref: '/py/vivienda',
  locale: 'py',
  eyebrow: "Paraguay · Eventos en Paraguay",
  h1: "¿Cuánto comprar para el asado o el evento en Paraguay?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de bebidas para evento o fiesta — Paraguay",
    "hint": "Un evento paraguayo de 4-5 horas lleva cerca de 1 L de alcohol y 1 L de gaseosa o agua por invitado: para 30 personas eso significa ~36 L de cerveza tipo Pilsen, 18 botellas de vino, 5 de caña o whisky y 45 L de gaseosa y agua. Con las temperaturas de Paraguay conviene sumar 20% en los meses calurosos y llevar 10-15% de reserva del mayorista.",
    "yes": [
      "**En Paraguay, 4-5 horas de asado se calculan con ~1 L de alcohol y 1 L de gaseosa o agua por invitado, y el calor casi siempre empuja la cifra para arriba.** En la práctica: 2 L de Pilsen helada por persona, con el tereré corriendo aparte desde temprano."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-24.",
    "answer": "Un evento paraguayo de 4-5 horas lleva cerca de 1 L de alcohol y 1 L de gaseosa o agua por invitado: para 30 personas eso significa ~36 L de cerveza tipo Pilsen, 18 botellas de vino, 5 de caña o whisky y 45 L de gaseosa y agua. Con las temperaturas de Paraguay conviene sumar 20% en los meses calurosos y llevar 10-15% de reserva del mayorista."
  },
  {
    "id": "c2",
    "label": "Calculadora de carne para asado por persona — Paraguay",
    "hint": "La pregunta eterna del asador paraguayo un domingo: ¿cuánta carne compro? Comprar de más es plata tirada, comprar de menos deja a los invitados con hambre. Esta calculadora te dice los kilos exactos de carne, achuras y embutidos (chorizo, morcilla) según la cantidad de comensales, el tipo de evento y si hay picada previa.",
    "yes": [
      "**Regla del asado paraguayo: 500 g de carne por adulto.** Con chorizo y picada de entrada, podés bajar a 400 g. Para un asado largo con mucha picada y tereré previo: 350 g."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-24.",
    "answer": "La pregunta eterna del asador paraguayo un domingo: ¿cuánta carne compro? Comprar de más es plata tirada, comprar de menos deja a los invitados con hambre. Esta calculadora te dice los kilos exactos de carne, achuras y embutidos (chorizo, morcilla) según la cantidad de comensales, el tipo de evento y si hay picada previa."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__personas",
    "label": "Calculadora de bebidas para evento o fiesta — Paraguay: Cantidad de personas",
    "type": "number",
    "value": 30,
    "min": 1,
    "step": 1,
    "thousands": false,
    "help": "Número de invitados que van a tomar."
  },
  {
    "id": "c1__duracionHoras",
    "label": "Calculadora de bebidas para evento o fiesta — Paraguay: Duración del evento",
    "type": "number",
    "value": 5,
    "suffix": "horas",
    "min": 1,
    "max": 12,
    "step": 0.5,
    "thousands": false,
    "help": "Cuántas horas dura el evento."
  },
  {
    "id": "c1__tipoBebida",
    "label": "Calculadora de bebidas para evento o fiesta — Paraguay: Tipo principal de bebida",
    "type": "select",
    "value": "mixto",
    "options": [
      {
        "value": "cerveza",
        "label": "Cerveza (mayormente)"
      },
      {
        "value": "vino",
        "label": "Vino (mayormente)"
      },
      {
        "value": "mixto",
        "label": "Mixto (cerveza + vino + caña/whisky)"
      },
      {
        "value": "sin_alcohol",
        "label": "Solo sin alcohol"
      }
    ],
    "thousands": false,
    "help": "El tipo de bebida principal define las proporciones del cálculo."
  },
  {
    "id": "c1__temporada",
    "label": "Calculadora de bebidas para evento o fiesta — Paraguay: Clima / temporada",
    "type": "select",
    "value": "intermedia",
    "options": [
      {
        "value": "verano",
        "label": "Verano / mucho calor (se toma más)"
      },
      {
        "value": "invierno",
        "label": "Invierno (se toma menos)"
      },
      {
        "value": "intermedia",
        "label": "Clima templado"
      }
    ],
    "thousands": false,
    "help": "En Paraguay el calor manda: cuanto más calor, más bebida fría se consume."
  },
  {
    "id": "c2__adultos",
    "label": "Calculadora de carne para asado por persona — Paraguay: Cantidad de adultos",
    "type": "number",
    "value": 10,
    "min": 1,
    "step": 1,
    "thousands": false,
    "help": "Cantidad de adultos que van a comer."
  },
  {
    "id": "c2__menores",
    "label": "Calculadora de carne para asado por persona — Paraguay: Cantidad de menores (hasta 12 años)",
    "type": "number",
    "value": 0,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Cantidad de niños de hasta 12 años."
  },
  {
    "id": "c2__tipoEvento",
    "label": "Calculadora de carne para asado por persona — Paraguay: Tipo de evento",
    "type": "select",
    "value": "almuerzo",
    "options": [
      {
        "value": "almuerzo",
        "label": "Almuerzo (estándar)"
      },
      {
        "value": "cena",
        "label": "Cena (se come un poco menos)"
      },
      {
        "value": "evento_largo",
        "label": "Evento largo (cumpleaños, fiesta)"
      }
    ],
    "thousands": false,
    "help": "El tipo de reunión afecta cuánta carne se consume por persona."
  },
  {
    "id": "c2__hayEntrada",
    "label": "Calculadora de carne para asado por persona — Paraguay: ¿Hay picada o entrada antes?",
    "type": "select",
    "value": "no",
    "options": [
      {
        "value": "no",
        "label": "No, directo al asado"
      },
      {
        "value": "si",
        "label": "Sí, picada / empanadas / entrada"
      }
    ],
    "thousands": false,
    "help": "Si hay picada previa, la gente come menos carne principal."
  },
  {
    "id": "c2__incluirAchuras",
    "label": "Calculadora de carne para asado por persona — Paraguay: ¿Incluir achuras y embutidos?",
    "type": "select",
    "value": "si",
    "options": [
      {
        "value": "si",
        "label": "Sí (chorizo, morcilla, achuras)"
      },
      {
        "value": "no",
        "label": "No, solo carne"
      }
    ],
    "thousands": false,
    "help": "¿Querés incluir chorizo, morcilla y achuras en el cálculo?"
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuánta cerveza necesito para 20 personas?",
    "a": "Para un evento de 4-5 horas: **40-60 litros** (40-60 botellas de litro o 4-5 cajones). Si es solo cerveza, apuntá al rango alto. Si también hay vino y caña, al bajo. La Pilsen en litro retornable es lo más económico y práctico."
  },
  {
    "q": "¿Cuántas botellas de vino para 10 personas en una cena?",
    "a": "Para una cena de 3-4 horas: **5-8 botellas** de 750 ml. Si es solo vino: 8. Si también hay cerveza u otras bebidas: 4-5."
  },
  {
    "q": "¿Cuánta caña o whisky necesito para una fiesta?",
    "a": "Regla práctica: **1 botella de caña o whisky (750 ml) cada 5-6 personas** que tomen destilado. Cada botella rinde ~15 tragos. Para 30 personas: 5-6 botellas. Si se toma con gaseosa, sumá 12-15 L de gaseosa para mezclar."
  },
  {
    "q": "¿Cuánta gaseosa compro?",
    "a": "**1-1,5 litros de gaseosa/agua por persona** para un evento de 4-5 h. Para 20 personas: 20-30 litros (8-12 botellas de 2,5 L). Incluí agua además de gaseosa; en Paraguay la gaseosa también se usa para mezclar con caña o whisky."
  },
  {
    "q": "¿Cuánto hielo necesito?",
    "a": "**1-2 bolsas de hielo de 3-5 kg por cada 10 personas**. Con el calor paraguayo, duplicá. El hielo se derrite rápido, así que mejor pasarse. Total para 30 personas en verano: 10-12 bolsas. Y guardá hielo aparte para el tereré."
  },
  {
    "q": "¿Se toma más cerveza cuando hace calor?",
    "a": "**Sí**, un 20-30% más. En Paraguay el calor es fuerte gran parte del año y aumenta muchísimo el consumo de bebidas frías: cerveza, gaseosa y tereré. En invierno se toma más vino y whisky. Ajustá las proporciones según la época del año."
  },
  {
    "q": "¿Cómo calculo la bebida para un casamiento?",
    "a": "Un casamiento de 6-8 horas para 100 personas necesita aproximadamente: **200 L cerveza**, **60-80 botellas de vino**, **15-20 botellas de caña/whisky** y **100-150 L de gaseosa/agua**. Consultá con el salón o el catering, muchos incluyen la barra."
  }
],
  sources: [
  {
    "name": "Ministerio de Salud — Guías Alimentarias para la Población Argentina",
    "url": "https://www.argentina.gob.ar/salud/alimentacion-saludable"
  },
  {
    "name": "Ministerio de Salud Pública y Bienestar Social — Paraguay",
    "url": "https://www.mspbs.gov.py/",
    "publisher": "Gobierno de Paraguay",
    "date": "2026-07-28"
  }
],
  replaces: [
    '/py/calculadora-bebidas-por-invitado-evento-paraguay', // Absorbida como caso calculable con formulaId bebidas-evento-litros-por-persona.
    '/py/calculadora-carne-asado-kg-por-persona-paraguay', // Absorbida como caso calculable con formulaId carne-asado-kg-por-persona.
  ],
  lastReviewed: '2026-08-16',
};
