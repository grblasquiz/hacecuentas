import type { HubData } from '../types';

export const hub: HubData = {
  slug: 've/finanzas/credito-y-gasolina',
  title: "¿Cuánto pago y cuánto ahorro cada mes? | Hacé Cuentas",
  description: "Hub de decisión con 2 cálculos: Calculadora de crédito de nómina (credinómina): cuota y capacidad de pago; Cupo de gasolina subsidiada en Venezuela: litros y ahorro mensual.",
  silo: "Crédito y gasolina",
  siloHref: '/ve/finanzas',
  locale: 've',
  eyebrow: "Venezuela · Crédito y gasolina",
  h1: "¿Cuánto pago y cuánto ahorro cada mes?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora de crédito de nómina (credinómina): cuota y capacidad de pago",
    "hint": "La cuota de un crédito de nómina se calcula con el sistema francés a partir del monto, el plazo y la tasa. La cuota no debería superar 1/3 del salario (tope legal LOTTT); el BDV la limita al 35%.",
    "yes": [
      "Cuota = sistema francés sobre monto, plazo y tasa. Regla de capacidad: la cuota no debería pasar de 1/3 (33,33%) del salario. El BDV presta hasta 8× tu sueldo, a máximo 36 meses. La tasa cambia: usá la vigente."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "La cuota de un crédito de nómina se calcula con el sistema francés a partir del monto, el plazo y la tasa. La cuota no debería superar 1/3 del salario (tope legal LOTTT); el BDV la limita al 35%."
  },
  {
    "id": "c2",
    "label": "Cupo de gasolina subsidiada en Venezuela: litros y ahorro mensual",
    "hint": "El cupo de gasolina subsidiada en Venezuela es de 120 litros al mes para automóvil y 60 para moto, asignado vía Sistema Patria a ~USD 0,10 por litro. Lo que consumís dentro del cupo ahorra ~USD 0,40 por litro frente al precio internacional (~USD 0,50/L); lo que excedés se paga a ese precio. Un auto que usa todo su cupo (120 L) ahorra unos USD 48 al mes (~Bs. 29.397). Esta calculadora reparte tu consumo entre cupo y excedente y te da el ahorro en dólares y bolívares.",
    "yes": [
      "El cupo subsidiado es **120 L/mes (auto)** y **60 L/mes (moto)** a ~USD 0,10/L. Cada litro dentro del cupo ahorra **~USD 0,40** frente al precio internacional. Usar el cupo completo de un auto ahorra **~USD 48/mes**; el excedente se paga a ~USD 0,50/L."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-06-21.",
    "answer": "El cupo de gasolina subsidiada en Venezuela es de 120 litros al mes para automóvil y 60 para moto, asignado vía Sistema Patria a ~USD 0,10 por litro. Lo que consumís dentro del cupo ahorra ~USD 0,40 por litro frente al precio internacional (~USD 0,50/L); lo que excedés se paga a ese precio. Un auto que usa todo su cupo (120 L) ahorra unos USD 48 al mes (~Bs. 29.397). Esta calculadora reparte tu consumo entre cupo y excedente y te da el ahorro en dólares y bolívares."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__salarioMensual",
    "label": "Calculadora de crédito de nómina (credinómina): cuota y capacidad de pago: Salario o ingreso mensual (Bs.)",
    "type": "number",
    "value": 10000,
    "prefix": "Bs.",
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "Tu ingreso mensual neto. Se usa para la capacidad de pago."
  },
  {
    "id": "c1__montoSolicitado",
    "label": "Calculadora de crédito de nómina (credinómina): cuota y capacidad de pago: Monto del crédito (Bs.)",
    "type": "number",
    "value": 25000,
    "prefix": "Bs.",
    "min": 0,
    "step": 0.01,
    "thousands": false,
    "help": "El BDV presta hasta 8 veces tu salario mensual."
  },
  {
    "id": "c1__plazoMeses",
    "label": "Calculadora de crédito de nómina (credinómina): cuota y capacidad de pago: Plazo (meses)",
    "type": "number",
    "value": 24,
    "suffix": "meses",
    "min": 1,
    "max": 36,
    "step": 1,
    "thousands": false,
    "help": "Plazo de pago. El credinómina BDV llega hasta 36 meses."
  },
  {
    "id": "c1__tasaAnual",
    "label": "Calculadora de crédito de nómina (credinómina): cuota y capacidad de pago: Tasa de interés anual (%)",
    "type": "number",
    "value": 24,
    "suffix": "%",
    "min": 0,
    "max": 300,
    "step": 0.1,
    "thousands": false,
    "help": "La ingresás vos porque cambia seguido. El BDV suele manejar cerca del 24% anual."
  },
  {
    "id": "c2__tipoVehiculo",
    "label": "Cupo de gasolina subsidiada en Venezuela: litros y ahorro mensual: Tipo de vehículo",
    "type": "select",
    "value": "auto",
    "options": [
      {
        "value": "auto",
        "label": "Automóvil (cupo 120 L/mes)"
      },
      {
        "value": "moto",
        "label": "Moto (cupo 60 L/mes)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__litrosConsumo",
    "label": "Cupo de gasolina subsidiada en Venezuela: litros y ahorro mensual: Litros que consumís al mes",
    "type": "number",
    "value": 150,
    "suffix": "L",
    "min": 0,
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
    "q": "¿Cómo se calcula la cuota del credinómina?",
    "a": "Con el sistema francés (cuota fija), a partir del monto, el plazo y la tasa. Por ejemplo, Bs. 25.000 a 24 meses con 24% anual dan una cuota de Bs. 1.321,78 al mes."
  },
  {
    "q": "¿Cuánto presta el credinómina del Banco de Venezuela?",
    "a": "Hasta 8 veces el salario mensual, con plazos de hasta 36 meses. El monto final depende de tu capacidad de pago y de las condiciones vigentes del banco."
  },
  {
    "q": "¿Qué parte del salario puede ocupar la cuota?",
    "a": "Por la LOTTT (Art. 154), las deducciones por nómina no deberían superar 1/3 (33,33%) del salario. El BDV limita la cuota del credinómina al 35% del sueldo. Esta calculadora usa el tope de 1/3."
  },
  {
    "q": "¿Por qué tengo que ingresar la tasa?",
    "a": "Porque la tasa de interés cambia con frecuencia. Hardcodearla daría cuotas desactualizadas. Ingresá la tasa vigente que te informe el banco; el BDV suele manejar cerca del 24% anual."
  },
  {
    "q": "¿Cómo bajo la cuota si no entra en mi capacidad?",
    "a": "Podés reducir el monto solicitado o estirar el plazo (más meses = cuota más baja, aunque más intereses totales). La calculadora te muestra el monto máximo que entraría en el tope de 1/3."
  },
  {
    "q": "¿Cuántos intereses voy a pagar?",
    "a": "Los intereses totales son la suma de todas las cuotas menos el monto del crédito. En el ejemplo, Bs. 31.722,66 pagados menos Bs. 25.000 prestados = Bs. 6.722,66 de intereses."
  },
  {
    "q": "¿Qué requisitos pide el credinómina BDV?",
    "a": "Cobrar la nómina en el banco, tener una cuenta con antigüedad, más de 6 meses en el empleo actual, ser mayor de 18 años y presentar comprobante de ingresos. Los detalles se confirman en la agencia."
  }
],
  sources: [
  {
    "name": "Banco de Venezuela — Pago de nómina y productos de crédito",
    "url": "https://www.bancodevenezuela.com/index.html@p=3491.html"
  },
  {
    "name": "LOTTT Art. 154 — límite de deducciones por deuda (Justia Venezuela)",
    "url": "https://venezuela.justia.com/estatales/distrito-capital/leyes/ley-organica-del-trabajo/gdoc/"
  },
  {
    "name": "OPEC — datos energéticos de Venezuela",
    "url": "https://www.opec.org/venezuela.html"
  }
],
  replaces: [
    '/ve/calculadora-credito-nomina-bdv-venezuela', // Absorbida como caso calculable con formulaId calculadora-credito-nomina-bdv-venezuela.
    '/ve/calculadora-cupo-gasolina-subsidiada-venezuela', // Absorbida como caso calculable con formulaId calculadora-cupo-gasolina-subsidiada-venezuela.
  ],
  lastReviewed: '2026-07-28',
};
