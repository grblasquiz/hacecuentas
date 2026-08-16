import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'py/finanzas/presupuesto-familiar-y-viajes',
  title: "Cuota alimentaria y presupuesto familiar en Paraguay 2026",
  description: "Calculadora de cuota alimentaria orientativa en Paraguay, gasto mensual en colectivo y presupuesto para seguir el Mundial 2026 desde Paraguay.",
  silo: "Presupuesto familiar",
  siloHref: '/py/finanzas',
  locale: 'py',
  eyebrow: "Paraguay · Presupuesto familiar",
  h1: "¿Cuánto necesito por mes o para el viaje en Paraguay?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 3 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['3 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de cuota alimentaria — Paraguay (orientativa)",
    "hint": "En Paraguay la cuota alimentaria la fija el juez según la capacidad del obligado y las necesidades del hijo (Ley 1680/2001). No hay porcentaje legal fijo: en la práctica ronda 20%–50% del ingreso, expresada en jornales mínimos. Esto es orientativo.",
    "yes": [
      "La cuota alimentaria en Paraguay **la fija el juez** según la capacidad del obligado y las necesidades del hijo (Ley 1680/2001). **No hay un porcentaje legal fijo.** En la práctica ronda entre el 20% y el 50% del ingreso según la cantidad de hijos, y se expresa en **jornales mínimos** (art. 189) para reajustarse con el salario mínimo. Esta calculadora es solo orientativa: el monto definitivo lo decide el juzgado."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "En Paraguay la cuota alimentaria la fija el juez según la capacidad del obligado y las necesidades del hijo (Ley 1680/2001). No hay porcentaje legal fijo: en la práctica ronda 20%–50% del ingreso, expresada en jornales mínimos. Esto es orientativo."
  },
  {
    "id": "c2",
    "label": "Calculadora de gasto en colectivo — Paraguay (mensual)",
    "hint": "El gasto mensual en colectivo es viajes por día × días × tarifa. Con 2 viajes diarios, 22 días y Gs. 3.400 por pasaje, gastás Gs. 149.600 al mes (Gs. 1.795.200 al año). El pago es con billetaje electrónico.",
    "yes": [
      "Gasto mensual = **viajes por día × días × tarifa**. Con 2 viajes diarios, 22 días y Gs. 3.400 por pasaje son **Gs. 149.600 al mes**. El pago en el área metropolitana es solo con **billetaje electrónico** (tarjetas JAHA/MÁS), que cuestan aparte (~Gs. 25.000). La comparación con auto suele mostrar que el colectivo es más barato si viajás solo, pero conviene ajustar la tarifa a tu línea real."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "El gasto mensual en colectivo es viajes por día × días × tarifa. Con 2 viajes diarios, 22 días y Gs. 3.400 por pasaje, gastás Gs. 149.600 al mes (Gs. 1.795.200 al año). El pago es con billetaje electrónico."
  },
  {
    "id": "c3",
    "label": "Calculadora de presupuesto — Mundial 2026 desde Paraguay",
    "hint": "Ir al Mundial 2026 desde Paraguay cuesta, por persona, vuelo + alojamiento + entradas + viáticos. Con valores orientativos (vuelo US$ 1.500, 10 noches, 3 entradas, viáticos) da unos US$ 3.950 por persona, cerca de Gs. 24.070.076.",
    "yes": [
      "El presupuesto del Mundial se arma sumando **vuelo + alojamiento + entradas + viáticos**, por persona, y multiplicando por la cantidad de viajeros. Con valores orientativos son ~**US$ 3.950 por persona** (≈ Gs. 24 millones). El **vuelo** y el **alojamiento** son los rubros más pesados. El total en guaraníes depende del **dólar**, que conviene ir comprando con tiempo. No incluye visa, seguro de viaje ni compras."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "Ir al Mundial 2026 desde Paraguay cuesta, por persona, vuelo + alojamiento + entradas + viáticos. Con valores orientativos (vuelo US$ 1.500, 10 noches, 3 entradas, viáticos) da unos US$ 3.950 por persona, cerca de Gs. 24.070.076."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__ingreso",
    "label": "Calculadora de cuota alimentaria — Paraguay (orientativa): Ingreso mensual del obligado (Gs.)",
    "type": "number",
    "value": 5000000,
    "min": 0,
    "step": 100000,
    "thousands": false
  },
  {
    "id": "c1__hijos",
    "label": "Calculadora de cuota alimentaria — Paraguay (orientativa): Cantidad de hijos",
    "type": "number",
    "value": 1,
    "min": 1,
    "max": 10,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__viajesDia",
    "label": "Calculadora de gasto en colectivo — Paraguay (mensual): Viajes por día (ida + vuelta = 2)",
    "type": "number",
    "value": 2,
    "min": 1,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__diasMes",
    "label": "Calculadora de gasto en colectivo — Paraguay (mensual): Días que viajás al mes",
    "type": "number",
    "value": 22,
    "min": 1,
    "max": 31,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__tarifa",
    "label": "Calculadora de gasto en colectivo — Paraguay (mensual): Tarifa del pasaje (Gs.)",
    "type": "number",
    "value": 3400,
    "min": 0,
    "step": 100,
    "thousands": false
  },
  {
    "id": "c2__kmDia",
    "label": "Calculadora de gasto en colectivo — Paraguay (mensual): Km por día en auto (opcional, para comparar)",
    "type": "number",
    "value": 0,
    "min": 0,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c2__rend",
    "label": "Calculadora de gasto en colectivo — Paraguay (mensual): Rendimiento del auto (km/L) — opcional",
    "type": "number",
    "value": 0,
    "min": 0,
    "step": 0.5,
    "thousands": false
  },
  {
    "id": "c2__precioLitro",
    "label": "Calculadora de gasto en colectivo — Paraguay (mensual): Precio del litro (Gs.) — opcional",
    "type": "number",
    "value": 1,
    "min": 0,
    "step": 10,
    "thousands": false
  },
  {
    "id": "c3__personas",
    "label": "Calculadora de presupuesto — Mundial 2026 desde Paraguay: Cantidad de viajeros",
    "type": "number",
    "value": 1,
    "min": 1,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c3__vueloUsd",
    "label": "Calculadora de presupuesto — Mundial 2026 desde Paraguay: Vuelo ida y vuelta por persona (US$)",
    "type": "number",
    "value": 1500,
    "min": 0,
    "step": 50,
    "thousands": false
  },
  {
    "id": "c3__noches",
    "label": "Calculadora de presupuesto — Mundial 2026 desde Paraguay: Noches de alojamiento",
    "type": "number",
    "value": 10,
    "min": 1,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c3__hotelNocheUsd",
    "label": "Calculadora de presupuesto — Mundial 2026 desde Paraguay: Hotel por noche por persona (US$)",
    "type": "number",
    "value": 120,
    "min": 0,
    "step": 10,
    "thousands": false
  },
  {
    "id": "c3__entradas",
    "label": "Calculadora de presupuesto — Mundial 2026 desde Paraguay: Cantidad de partidos",
    "type": "number",
    "value": 3,
    "min": 0,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c3__precioEntradaUsd",
    "label": "Calculadora de presupuesto — Mundial 2026 desde Paraguay: Precio por entrada (US$)",
    "type": "number",
    "value": 150,
    "min": 0,
    "step": 10,
    "thousands": false
  },
  {
    "id": "c3__viaticosDiaUsd",
    "label": "Calculadora de presupuesto — Mundial 2026 desde Paraguay: Viáticos por día por persona (US$)",
    "type": "number",
    "value": 80,
    "min": 0,
    "step": 10,
    "thousands": false
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuánto corresponde de cuota alimentaria en Paraguay?",
    "a": "No hay un monto ni porcentaje fijo por ley: **lo fija el juez** según la capacidad del obligado y las necesidades del hijo. En la práctica suele rondar entre el 20% y el 50% del ingreso según la cantidad de hijos."
  },
  {
    "q": "¿Es cierto que se paga el 25% del sueldo?",
    "a": "El \"25% del sueldo\" fue un criterio del régimen anterior que **quedó atrás** como regla rígida. Hoy rige la proporcionalidad: el juez pondera ingresos y necesidades caso por caso."
  },
  {
    "q": "¿Por qué la cuota se expresa en jornales mínimos?",
    "a": "El art. 189 de la Ley 1680/2001 dispone fijarla en **jornales mínimos** para que se **reajuste automáticamente** cuando aumenta el salario mínimo, sin necesidad de un nuevo juicio."
  },
  {
    "q": "¿Qué incluye la asistencia alimenticia?",
    "a": "Según el art. 97, comprende el sustento, la habitación, el vestido, la asistencia médica, la educación y la recreación del hijo; y, si tiene discapacidad, también su habilitación y rehabilitación."
  },
  {
    "q": "¿Cómo sabe el juez cuánto gana el obligado?",
    "a": "Pide informe de sueldo al empleador o información a la administración tributaria si es independiente. Si no se puede probar el ingreso, estima el nivel de vida (alquiler, vehículo, consumos)."
  },
  {
    "q": "¿La cuota cambia si tengo más hijos?",
    "a": "Sí, tiende a ser mayor cuantos más hijos haya, pero siempre dentro de la proporcionalidad: se distribuye considerando las necesidades de cada hijo y la capacidad del obligado."
  },
  {
    "q": "¿Se puede modificar la cuota después?",
    "a": "Sí. La cuota puede aumentarse o reducirse si cambian las circunstancias (los ingresos del obligado o las necesidades del hijo). Se solicita al juzgado que la fijó."
  }
],
  sources: [
  {
    "name": "Código de la Niñez y la Adolescencia — Ley N° 1680/2001",
    "url": "https://www.bacn.gov.py/leyes-paraguayas/5261/ley-n-1680-codigo-de-la-ninez-y-la-adolescencia",
    "publisher": "Biblioteca y Archivo Central del Congreso Nacional",
    "date": "2026"
  },
  {
    "name": "BACN — Asistencia alimenticia (Ley 1680/2001)",
    "url": "https://www.bacn.gov.py/conoce-tu-ley/8271/asistencia-alimenticia-ambito-de-la-ninez-y-adolescencia-ley-n-16802001-codigo-de-la-ninez-y-adolescencia-",
    "publisher": "Biblioteca y Archivo Central del Congreso Nacional",
    "date": "2026"
  },
  {
    "name": "Municipalidad de Asunción — Reajuste del costo del pasaje",
    "url": "https://www.asuncion.gov.py/transito/reajuste-del-costo-del-pasaje-para-lineas-permisionarias-de-asuncion",
    "publisher": "Municipalidad de Asunción",
    "date": "2026"
  },
  {
    "name": "MOPC — Viceministerio de Transporte (preguntas frecuentes)",
    "url": "https://mopc.gov.py/viceministerios/viceministerio-de-transporte/preguntas-frecuentes/",
    "publisher": "Ministerio de Obras Públicas y Comunicaciones",
    "date": "2026"
  },
  {
    "name": "BCP — Cotización Referencial de Monedas",
    "url": "https://www.bcp.gov.py/webapps/web/cotizacion/monedas",
    "publisher": "Banco Central del Paraguay",
    "date": "2026"
  },
  {
    "name": "FIFA — Copa Mundial 2026",
    "url": "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026",
    "publisher": "FIFA",
    "date": "2026"
  }
],
  replaces: [
    '/py/calculadora-cuota-alimentaria-paraguay', // Absorbida como caso calculable con formulaId cuota-alimentaria-paraguay.
    '/py/calculadora-gasto-mensual-transporte-publico-paraguay', // Absorbida como caso calculable con formulaId gasto-mensual-transporte-publico-paraguay.
    '/py/calculadora-presupuesto-viaje-mundial-2026-paraguay', // Absorbida como caso calculable con formulaId presupuesto-viaje-mundial-2026-paraguay.
  ],
  lastReviewed: '2026-08-16',
};
