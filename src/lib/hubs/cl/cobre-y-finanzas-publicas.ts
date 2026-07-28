import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'cl/impuestos/cobre-y-finanzas-publicas',
  title: "¿Cómo impacta el precio del cobre en los ingresos fiscales? | Hacé Cuentas",
  description: "Hub de decisión con 1 cálculos: Calculadora de impacto fiscal del precio del cobre en Chile.",
  silo: "Cobre y finanzas públicas",
  siloHref: '/cl/impuestos',
  locale: 'cl',
  eyebrow: "Chile · Cobre y finanzas públicas",
  h1: "¿Cómo impacta el precio del cobre en los ingresos fiscales?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 1 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['1 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de impacto fiscal del precio del cobre en Chile",
    "hint": "El precio del cobre en la bolsa de metales de Londres (LME) determina directamente los ingresos fiscales de Chile. Codelco, empresa estatal minera, aporta royalty minero (5–14% según ley) y utilidades al Tesoro Público. Esta calculadora estima el impacto fiscal anual según cotización LME y tipo cambio USD/CLP vigente en 2026.",
    "yes": [
      "Un dólar más en precio cobre/lb genera aproximadamente **USD 150–180 millones** adicionales en ingresos fiscales anuales para Chile; con tipo cambio 900 CLP/USD, equivale a **CLP 135–162 mil millones** de impacto presupuestario."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-06-21.",
    "answer": "El precio del cobre en la bolsa de metales de Londres (LME) determina directamente los ingresos fiscales de Chile. Codelco, empresa estatal minera, aporta royalty minero (5–14% según ley) y utilidades al Tesoro Público. Esta calculadora estima el impacto fiscal anual según cotización LME y tipo cambio USD/CLP vigente en 2026."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__precio_cobre_usd_libra",
    "label": "Calculadora de impacto fiscal del precio del cobre en Chile: Precio cobre LME (USD/libra)",
    "type": "number",
    "value": 6.3,
    "min": 2,
    "max": 7.5,
    "step": 0.01,
    "thousands": false,
    "help": "Cotización diaria Bolsa de Metales de Londres. Rango histórico 2020–2026: 2.5–6.7 USD/lb (jun-2026 ≈ 6.3 USD/lb)"
  },
  {
    "id": "c1__tipo_cambio_usd_clp",
    "label": "Calculadora de impacto fiscal del precio del cobre en Chile: Tipo cambio USD/CLP",
    "type": "number",
    "value": 900,
    "min": 750,
    "max": 1100,
    "step": 1,
    "thousands": false,
    "help": "Tipo cambio observado Banco Central Chile. Consulta diaria."
  },
  {
    "id": "c1__produccion_cobre_ton",
    "label": "Calculadora de impacto fiscal del precio del cobre en Chile: Producción anual Codelco (toneladas cobre fino)",
    "type": "number",
    "value": 1650000,
    "min": 1000000,
    "max": 2000000,
    "step": 50000,
    "thousands": false,
    "help": "Año 2026 estimado: 1.65 millones toneladas. Histórico: 1.55–1.75 M/ton."
  },
  {
    "id": "c1__tasa_royalty_promedio",
    "label": "Calculadora de impacto fiscal del precio del cobre en Chile: Tasa royalty minero promedio (%)",
    "type": "number",
    "value": 9.5,
    "min": 5,
    "max": 14,
    "step": 0.5,
    "thousands": false,
    "help": "Ley de Royalty (2006 mod. 2023): 5% base + progresivo. Promedio Codelco ~9.5%"
  },
  {
    "id": "c1__margen_operacional_codelco",
    "label": "Calculadora de impacto fiscal del precio del cobre en Chile: Margen operacional Codelco (%)",
    "type": "number",
    "value": 25,
    "min": 10,
    "max": 40,
    "step": 1,
    "thousands": false,
    "help": "Rentabilidad operacional. A mayor precio cobre, mayor margen (20–35%)."
  },
  {
    "id": "c1__tasa_impuesto_corporativo",
    "label": "Calculadora de impacto fiscal del precio del cobre en Chile: Tasa IRPF empresa (%) sobre utilidades",
    "type": "number",
    "value": 27,
    "min": 25,
    "max": 35,
    "step": 0.5,
    "thousands": false,
    "help": "IRPF 2026 Chile: 27% (personas naturales 5%–45% según tramo). Codelco aporta ~27%."
  },
  {
    "id": "c1__otras_mineras_aporte",
    "label": "Calculadora de impacto fiscal del precio del cobre en Chile: Aporte adicional minería privada (% del ingreso Codelco)",
    "type": "number",
    "value": 35,
    "min": 0,
    "max": 60,
    "step": 5,
    "thousands": false,
    "help": "BHP, Anglo American, Escondida, etc. aportan ~35–40% del ingreso minero total."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Cuál es el precio de equilibrio fiscal del cobre en Chile 2026?",
    "a": "Según Ministerio de Hacienda, el precio de equilibrio fiscal (presupuesto balanceado) es aproximadamente **USD 3.00–3.20/lb**. Por debajo, se presupuesta déficit; por encima, hay margen para ahorro en Fondo de Estabilización o gasto público."
  },
  {
    "q": "¿Cómo impacta un cambio de 10 centavos USD/lb en el presupuesto fiscal?",
    "a": "Aproximadamente **USD 60–80 millones** en ingresos adicionales (Codelco). En CLP, con tipo cambio 900, equivale a **CLP 54–72 mil millones** de impacto. Es sensitivo; a veces representa ±0.3–0.5% del presupuesto anual."
  },
  {
    "q": "¿Qué es el Fondo de Estabilización Económica y Social?",
    "a": "Mecanismo creado 2006 (modificado 2007) para ahorrar ingresos cobre cuando precios son altos y usarlos cuando bajan. Objetivo: desacoplar gasto público de volatilidad commodity. En 2026 acumula aprox. USD 8–12 mil millones (según precio cobre reciente)."
  },
  {
    "q": "¿Codelco aporta más ingresos que la minería privada?",
    "a": "No exactamente. Codelco es ~60% de ingresos fiscales mineros totales; privados (BHP Billiton, Anglo American, Antofagasta, Escondida) aportan ~40%. Pero Codelco tiene royalty explícito + dividendos; privados pagan IRPF + pagos al Estado por uso agua/tierra."
  },
  {
    "q": "¿La calculadora incluye impuestos regionales o municipales?",
    "a": "No. Calcula solo ingresos **fiscales centrales** (Tesoro Público) vía royalty + IRPF. Excluye patentes municipales, contribuciones inmobiliarias, impuestos ambientales regionales específicos."
  },
  {
    "q": "¿Cómo afecta la depreciación y amortización a utilidades Codelco?",
    "a": "Codelco deduce capex significativo (minas nuevas, infraestructura). Esto reduce **utilidades tributables**, bajando el IRPF pagado. La calculadora usa margen operacional; no separa gasto de capital. Para análisis fino, consult informes SII o auditoría Codelco."
  },
  {
    "q": "¿Qué sucede si precio cobre cae por debajo de USD 2.50/lb?",
    "a": "Chile entraría en situación fiscal crítica. Ingresos Codelco caerían ~40–50%. Histórico: 2015–2016 precio cobre alcanzó USD 2.00/lb; Chile ejecutó ajustes fiscales y reducciones gasto público. Escenario improbable pero posible."
  }
],
  sources: [
  {
    "name": "SII – Impuesto sobre la Renta y Tributación Minería",
    "url": "https://www.sii.cl/impuestos/impuestos-a-la-renta",
    "publisher": "Servicio de Impuestos Internos, Chile",
    "date": "2026"
  },
  {
    "name": "Banco Central de Chile – Tipo de Cambio y Series Económicas",
    "url": "https://www.bcentral.cl/estadisticas-y-publicaciones/",
    "publisher": "Banco Central de Chile",
    "date": "2026"
  },
  {
    "name": "Codelco – Reporte Financiero Anual 2025 y Proyecciones 2026",
    "url": "https://www.codelco.com/informes-financieros",
    "publisher": "Corporación Nacional del Cobre de Chile",
    "date": "2025"
  },
  {
    "name": "Ministerio de Hacienda – Marco Fiscal de Mediano Plazo y Fondo Estabilización",
    "url": "https://www.hacienda.cl/presupuestos/marco-fiscal-mediano-plazo",
    "publisher": "Ministerio de Hacienda, Chile",
    "date": "2026"
  },
  {
    "name": "London Metal Exchange (LME) – Cotizaciones Cobre Históricas y Proyecciones",
    "url": "https://www.lme.com/Metals/non-ferrous/copper",
    "publisher": "London Metal Exchange",
    "date": "2026"
  }
],
  replaces: [
    '/cl/calculadora-cobre-precio-bolsa-chile-impacto-fiscal-codelco', // Absorbida como caso calculable con formulaId cobre-precio-bolsa-chile-impacto-fiscal-codelco.
  ],
  lastReviewed: '2026-07-28',
};
