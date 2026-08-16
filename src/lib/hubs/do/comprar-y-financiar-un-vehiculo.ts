import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'do/finanzas/comprar-y-financiar-un-vehiculo',
  title: "Importar y financiar un vehículo en República Dominicana",
  description: "Calculá los impuestos de importación de un vehículo en República Dominicana y la cuota del préstamo: inicial, total a pagar y costo completo del carro.",
  silo: "Comprar un vehículo",
  siloHref: '/do/finanzas',
  locale: 'do',
  eyebrow: "República Dominicana · Comprar un vehículo",
  h1: "¿Cuánto cuesta importar y financiar el vehículo en República Dominicana?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de impuestos de importación de vehículo — República Dominicana",
    "hint": "Para nacionalizar un vehículo en República Dominicana pagás, sobre el valor CIF (precio + flete + seguro): gravamen arancelario (0% si viene de EE.UU. por el DR-CAFTA, 5% CARICOM, 10% Unión Europea, 20% del resto), ISC según la cilindrada del motor (0% hasta 1.0L, 16% de 1.0 a 2.0L, 32% de 2.0 a 3.0L, 50% de 3.0 a 4.0L y 130% de 4.0L en adelante), ITBIS del 18% sobre CIF + arancel + ISC, el impuesto de primera placa del 17% del CIF y el impuesto al CO₂ (0% a 3%). Para un auto de US$ 15.000 desde EE.UU. con motor de 1.6L, los impuestos rondan RD$ 481.000 (54,9% del CIF) y el vehículo con placa queda en unos RD$ 1.357.000.",
    "yes": [
      "El impuesto que más pesa es el **ISC por cilindrada**: pasa de 0% (hasta 1.0L) a 130% (4.0L en adelante). Un auto chico de EE.UU. paga alrededor del **50-55% del CIF** en impuestos; una camioneta grande de alta cilindrada puede más que **duplicar** el valor. El **origen EE.UU.** ahorra el arancel (0% por el DR-CAFTA) frente al 20% del resto."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-16.",
    "answer": "Para nacionalizar un vehículo en República Dominicana pagás, sobre el valor CIF (precio + flete + seguro): gravamen arancelario (0% si viene de EE.UU. por el DR-CAFTA, 5% CARICOM, 10% Unión Europea, 20% del resto), ISC según la cilindrada del motor (0% hasta 1.0L, 16% de 1.0 a 2.0L, 32% de 2.0 a 3.0L, 50% de 3.0 a 4.0L y 130% de 4.0L en adelante), ITBIS del 18% sobre CIF + arancel + ISC, el impuesto de primera placa del 17% del CIF y el impuesto al CO₂ (0% a 3%). Para un auto de US$ 15.000 desde EE.UU. con motor de 1.6L, los impuestos rondan RD$ 481.000 (54,9% del CIF) y el vehículo con placa queda en unos RD$ 1.357.000."
  },
  {
    "id": "c2",
    "label": "Calculadora de préstamo de vehículo en República Dominicana: cuota, inicial y total",
    "hint": "La cuota de un préstamo de vehículo en República Dominicana se calcula por sistema francés sobre el monto financiado (precio menos inicial): cuota = monto × i ÷ (1 − (1+i)^−n), con i = tasa anual ÷ 12 y n el plazo en meses. Un vehículo de RD$1.500.000 con RD$300.000 de inicial, a 15% anual en 48 meses, da una cuota de unos RD$33.397 al mes. Las tasas vehiculares en RD suelen ir de 12% a 18% anual.",
    "yes": [
      "La cuota del préstamo de vehículo se calcula por **sistema francés** sobre el **monto financiado (precio − inicial)**: cuota = monto × i ÷ (1 − (1+i)^−n). Un **inicial más alto** baja la cuota y los intereses; un **plazo más largo** baja la cuota pero encarece el total. Compará siempre la **tasa efectiva** y sumá el **seguro del vehículo**."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "La cuota de un préstamo de vehículo en República Dominicana se calcula por sistema francés sobre el monto financiado (precio menos inicial): cuota = monto × i ÷ (1 − (1+i)^−n), con i = tasa anual ÷ 12 y n el plazo en meses. Un vehículo de RD$1.500.000 con RD$300.000 de inicial, a 15% anual en 48 meses, da una cuota de unos RD$33.397 al mes. Las tasas vehiculares en RD suelen ir de 12% a 18% anual."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__cifUsd",
    "label": "Calculadora de impuestos de importación de vehículo — República Dominicana: Valor CIF del vehículo (US$)",
    "type": "number",
    "value": 15000,
    "prefix": "US$",
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "Precio del vehículo + flete + seguro, en dólares. Aduanas usa su propio valor DGA de referencia."
  },
  {
    "id": "c1__origen",
    "label": "Calculadora de impuestos de importación de vehículo — República Dominicana: Origen del vehículo",
    "type": "select",
    "value": "usa",
    "options": [
      {
        "value": "usa",
        "label": "Estados Unidos (DR-CAFTA, 0%)"
      },
      {
        "value": "caricom",
        "label": "CARICOM (5%)"
      },
      {
        "value": "ue",
        "label": "Unión Europea (10%)"
      },
      {
        "value": "otro",
        "label": "Otro origen (20%)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__cilindrada",
    "label": "Calculadora de impuestos de importación de vehículo — República Dominicana: Cilindrada del motor",
    "type": "select",
    "value": "e16",
    "options": [
      {
        "value": "e0",
        "label": "Hasta 1.0L (ISC 0%)"
      },
      {
        "value": "e16",
        "label": "1.0L a 2.0L (ISC 16%)"
      },
      {
        "value": "e32",
        "label": "2.0L a 3.0L (ISC 32%)"
      },
      {
        "value": "e50",
        "label": "3.0L a 4.0L (ISC 50%)"
      },
      {
        "value": "e130",
        "label": "Más de 4.0L (ISC 130%)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__co2",
    "label": "Calculadora de impuestos de importación de vehículo — República Dominicana: Emisiones de CO₂",
    "type": "select",
    "value": "c1",
    "options": [
      {
        "value": "c0",
        "label": "Bajas: menos de 120 g/km (0%)"
      },
      {
        "value": "c1",
        "label": "Medias: 120 a 220 g/km (1%)"
      },
      {
        "value": "c2",
        "label": "Altas: 220 a 380 g/km (2%)"
      },
      {
        "value": "c3",
        "label": "Muy altas: más de 380 g/km (3%)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__precio",
    "label": "Calculadora de préstamo de vehículo en República Dominicana: cuota, inicial y total: Precio del vehículo (RD$)",
    "type": "number",
    "value": 1500000,
    "prefix": "RD$",
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "Valor total del vehículo."
  },
  {
    "id": "c2__inicial",
    "label": "Calculadora de préstamo de vehículo en República Dominicana: cuota, inicial y total: Inicial / pronto (RD$)",
    "type": "number",
    "value": 300000,
    "prefix": "RD$",
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "Lo que pagás por adelantado. Se resta del precio para el monto financiado."
  },
  {
    "id": "c2__tasa",
    "label": "Calculadora de préstamo de vehículo en República Dominicana: cuota, inicial y total: Tasa de interés anual (%)",
    "type": "number",
    "value": 15,
    "min": 0,
    "max": 100,
    "step": 0.01,
    "thousands": false,
    "help": "Tasa nominal anual del banco. Las vehiculares en RD suelen ir de 12% a 18% (orientativo)."
  },
  {
    "id": "c2__plazo",
    "label": "Calculadora de préstamo de vehículo en República Dominicana: cuota, inicial y total: Plazo (meses)",
    "type": "number",
    "value": 48,
    "min": 1,
    "max": 96,
    "step": 1,
    "thousands": false,
    "help": "Cantidad de cuotas mensuales."
  },
  {
    "id": "c2__seguro",
    "label": "Calculadora de préstamo de vehículo en República Dominicana: cuota, inicial y total: Seguro / cargo mensual fijo (RD$)",
    "type": "number",
    "value": 1,
    "prefix": "RD$",
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "Opcional: seguro del vehículo u otros cargos mensuales fijos."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Sobre qué valor se calculan los impuestos del vehículo?",
    "a": "Sobre el **valor CIF** (costo + flete + seguro). Aduanas aplica su **valor DGA de referencia** por marca, modelo, año y versión, que normalmente es el mayor entre ese valor y el de tu factura de compra."
  },
  {
    "q": "¿Por qué conviene traer el auto de Estados Unidos?",
    "a": "Porque por el tratado **DR-CAFTA** el arancel es **0%** para vehículos de origen estadounidense con certificado de origen, frente al **20%** que paga un auto de otros orígenes fuera de CARICOM o la Unión Europea."
  },
  {
    "q": "¿Qué es el ISC y por qué sube tanto con el motor?",
    "a": "El **Impuesto Selectivo al Consumo** grava los vehículos según la **cilindrada**: 0% hasta 1.0L, 16% de 1.0 a 2.0L, 32% de 2.0 a 3.0L, 50% de 3.0 a 4.0L y **130%** de 4.0L en adelante. Es el impuesto que más encarece los vehículos grandes."
  },
  {
    "q": "¿Cuánto es el impuesto de primera placa?",
    "a": "La primera placa (matriculación inicial ante la DGII) es el **17% del valor CIF** del vehículo. Se paga una sola vez, al nacionalizarlo, y es distinto del marbete anual de circulación."
  },
  {
    "q": "¿Qué es el impuesto al CO₂?",
    "a": "Es un impuesto ambiental (Norma 06-2012) que va del **0% al 3% del CIF** según las emisiones de dióxido de carbono del vehículo en gramos por kilómetro: cuanto más contamina, más paga."
  },
  {
    "q": "¿Los vehículos eléctricos pagan menos impuestos?",
    "a": "Los eléctricos e híbridos suelen tener **cilindrada baja o nula y emisiones de CO₂ mínimas**, por lo que el ISC y el impuesto al CO₂ son bajos o cero. Además existen incentivos específicos; conviene confirmarlos con la DGA vigentes al momento de importar."
  },
  {
    "q": "¿Puedo importar un vehículo de cualquier año?",
    "a": "No. República Dominicana **restringe la importación de vehículos con más de cierta antigüedad** (generalmente vehículos livianos de más de 5 años). Verificá el límite vigente antes de comprar, porque un vehículo fuera de rango no se puede nacionalizar."
  }
],
  sources: [
  {
    "name": "DGA — Calculadora de impuestos de vehículos",
    "url": "https://www.aduanas.gob.do/consultas/calculadora-de-impuestos-de-vehiculos/"
  },
  {
    "name": "DGII — Leyes tributarias",
    "url": "https://dgii.gov.do/legislacion/leyesTributarias/Paginas/default.aspx"
  },
  {
    "name": "ProUsuario — Educación financiera (préstamos y crédito)",
    "url": "https://prousuario.gob.do/educacion-financiera/"
  },
  {
    "name": "ProUsuario (Superintendencia de Bancos RD) — Calculadora de cuota de préstamo",
    "url": "https://prousuario.gob.do/educacion-financiera/calculadoras-financieras/cuota-de-prestamo/"
  }
],
  replaces: [
    '/do/calculadora-impuestos-importacion-vehiculo-republica-dominicana', // Absorbida como caso calculable con formulaId impuestos-importacion-vehiculo-republica-dominicana.
    '/do/calculadora-prestamo-vehiculo-cuota-republica-dominicana', // Absorbida como caso calculable con formulaId prestamo-vehiculo-cuota-republica-dominicana.
  ],
  lastReviewed: '2026-08-16',
};
