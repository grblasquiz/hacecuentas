import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'uy/finanzas/cuentas-y-compras',
  title: "Compras courier y factura de UTE en Uruguay 2026",
  description: "Calculá cuánto pagás por compras en el exterior por courier en Uruguay 2026 y cuánto viene la factura de UTE según tu consumo, en una sola página.",
  silo: "Cuentas y compras",
  siloHref: '/uy/finanzas',
  locale: 'uy',
  eyebrow: "Uruguay · Cuentas y compras",
  h1: "¿Cuánto termino pagando por la compra o la factura en Uruguay?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de Compras en el Exterior / Courier — Uruguay 2026",
    "hint": "Desde el 1 de mayo de 2026, el régimen de franquicia de courier en Uruguay permite hasta 3 envíos al año con un tope acumulado de USD 800, pagando IVA (22%) sobre la compra, salvo los envíos desde Estados Unidos de hasta USD 200 cada uno, que quedan exentos de IVA por el acuerdo TIFA. Si superás los 3 envíos o no cumplís los requisitos, entra el régimen simplificado: una tasa única del 60% sobre el valor del envío (mínimo USD 20, tope USD 800 por envío). Por ejemplo, una compra de USD 150 desde EEUU por franquicia no paga impuestos; una de USD 300 por régimen simplificado paga USD 180.",
    "yes": [
      "Courier 2026 (desde el 1-may): **franquicia** hasta 3 envíos/año, tope acumulado **USD 800**, paga **IVA 22%** (exento desde **EEUU hasta USD 200**). **Régimen simplificado**: **60%** sobre el envío (mín USD 20, tope USD 800). El IVA se agrega después de la compra: no está incluido en los USD 800."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-16.",
    "answer": "Desde el 1 de mayo de 2026, el régimen de franquicia de courier en Uruguay permite hasta 3 envíos al año con un tope acumulado de USD 800, pagando IVA (22%) sobre la compra, salvo los envíos desde Estados Unidos de hasta USD 200 cada uno, que quedan exentos de IVA por el acuerdo TIFA. Si superás los 3 envíos o no cumplís los requisitos, entra el régimen simplificado: una tasa única del 60% sobre el valor del envío (mínimo USD 20, tope USD 800 por envío). Por ejemplo, una compra de USD 150 desde EEUU por franquicia no paga impuestos; una de USD 300 por régimen simplificado paga USD 180."
  },
  {
    "id": "c2",
    "label": "Calculadora de Factura de UTE — Consumo Eléctrico (Uruguay 2026)",
    "hint": "En la Tarifa Residencial Simple de UTE 2026, la factura suma un cargo fijo de $U 324,90 (exento de IVA) más la energía con IVA del 22%. Consumir 200 kWh cuesta unos $U 2.178,81 al mes.",
    "yes": [
      "Factura de UTE (Tarifa Residencial Simple) = **cargo fijo $U 324,90** (sin IVA) + **energía × 1,22**. La energía se cobra por escalones marginales: **$U 6,744** (1–100 kWh), **$U 8,452** (101–600) y **$U 10,539** (601+). Consumir 200 kWh ≈ **$U 2.178,81**. Es orientativo: la factura real puede sumar otros conceptos."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "En la Tarifa Residencial Simple de UTE 2026, la factura suma un cargo fijo de $U 324,90 (exento de IVA) más la energía con IVA del 22%. Consumir 200 kWh cuesta unos $U 2.178,81 al mes."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__valorUsd",
    "label": "Calculadora de Compras en el Exterior / Courier — Uruguay 2026: Valor de la compra (USD)",
    "type": "number",
    "value": 150,
    "min": 0,
    "step": 1,
    "thousands": false
  },
  {
    "id": "c1__regimen",
    "label": "Calculadora de Compras en el Exterior / Courier — Uruguay 2026: Régimen",
    "type": "select",
    "value": "franquicia",
    "options": [
      {
        "value": "franquicia",
        "label": "Franquicia (hasta 3 envíos/año, IVA)"
      },
      {
        "value": "simplificado",
        "label": "Simplificado (tasa única 60%)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__origen",
    "label": "Calculadora de Compras en el Exterior / Courier — Uruguay 2026: Origen del envío",
    "type": "select",
    "value": "otro",
    "options": [
      {
        "value": "otro",
        "label": "Otro país"
      },
      {
        "value": "eeuu",
        "label": "Estados Unidos (exención hasta USD 200)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__tipoCambio",
    "label": "Calculadora de Compras en el Exterior / Courier — Uruguay 2026: Tipo de cambio USD → UYU ($U)",
    "type": "number",
    "value": 41.08,
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "Cotización del dólar para convertir a pesos (por defecto, pizarra venta de referencia)."
  },
  {
    "id": "c2__consumoKwh",
    "label": "Calculadora de Factura de UTE — Consumo Eléctrico (Uruguay 2026): Consumo mensual (kWh)",
    "type": "number",
    "value": 200,
    "min": 0,
    "step": 10,
    "thousands": false,
    "help": "Kilovatios-hora del mes (figura en tu recibo de UTE, en el detalle de consumo)."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuánto se paga de impuesto por comprar en el exterior en Uruguay 2026?",
    "a": "Por el régimen de **franquicia** pagás **IVA (22%)** sobre la compra, salvo envíos desde EEUU de hasta USD 200 (exentos). Por el **régimen simplificado**, una tasa única del **60%** sobre el valor del envío (mínimo USD 20)."
  },
  {
    "q": "¿Cuál es el tope de la franquicia de courier?",
    "a": "Hasta **3 envíos al año** con un tope **acumulado de USD 800**. El IVA se agrega después de la compra, así que no cuenta dentro de esos USD 800: el tope mide el valor de los productos."
  },
  {
    "q": "¿Las compras desde Estados Unidos pagan impuesto?",
    "a": "Los envíos desde **EEUU de hasta USD 200** cada uno están **exentos de IVA** por el acuerdo TIFA. Si el envío supera los USD 200, paga IVA como cualquier otro origen."
  },
  {
    "q": "¿Qué es el régimen simplificado del 60%?",
    "a": "Es la alternativa a la franquicia: si superás los 3 envíos anuales o no cumplís los requisitos, pagás una **tasa única del 60%** sobre el valor del envío (mínimo USD 20, tope de USD 800 por envío), sin límite de cantidad de envíos."
  },
  {
    "q": "¿El IVA se calcula sobre el valor del producto o incluye el envío?",
    "a": "Esta calculadora aplica el impuesto sobre el **valor de la compra**. El costo de flete y seguro que cobra el courier se factura aparte y puede tener su propio tratamiento; verificá el detalle con tu operador."
  },
  {
    "q": "¿Cuándo empezó a regir el nuevo régimen de courier?",
    "a": "El nuevo régimen de franquicias de envíos postales rige desde el **1 de mayo de 2026** (MEF / Aduanas), con el tope de USD 800 anuales y el IVA sobre las compras que no estén exentas."
  },
  {
    "q": "¿Conviene el régimen de franquicia o el simplificado?",
    "a": "Para compras chicas y dentro de los 3 envíos anuales, la **franquicia** (IVA 22%, o 0% desde EEUU hasta USD 200) suele ser más barata. El **60%** del simplificado conviene solo cuando ya usaste la franquicia o no calificás."
  }
],
  sources: [
  {
    "name": "MEF — Guía de preguntas frecuentes sobre régimen de envíos postales (franquicias)",
    "url": "https://www.gub.uy/ministerio-economia-finanzas/comunicacion/noticias/guia-preguntas-frecuentes-sobre-regimen-envios-postales-franquicias"
  },
  {
    "name": "Dirección Nacional de Aduanas — Uruguay",
    "url": "https://www.aduanas.gub.uy/"
  },
  {
    "name": "UTE — Pliego Tarifario Enero 2026 (PDF)",
    "url": "https://www.ute.com.uy/sites/default/files/docs/Pliego%20Tarifario%20Enero%202026.pdf"
  },
  {
    "name": "UTE — Mi factura: precios actuales",
    "url": "https://www.ute.com.uy/clientes/mi-factura/precios-actuales"
  }
],
  replaces: [
    '/uy/calculadora-compras-exterior-courier-uruguay', // Absorbida como caso calculable con formulaId compras-exterior-courier-uruguay.
    '/uy/calculadora-factura-ute-consumo-electrico-uruguay', // Absorbida como caso calculable con formulaId calculadora-factura-ute-consumo-electrico-uruguay.
  ],
  lastReviewed: '2026-08-16',
};
