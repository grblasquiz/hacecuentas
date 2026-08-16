import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'co/finanzas/vuelos-millas-y-tiempo',
  title: "Millas LifeMiles y tasas de aeropuerto en Colombia",
  description: "Calculá si conviene pagar el vuelo con millas LifeMiles o en efectivo y cuánto suman las tasas de aeropuerto e impuestos en vuelos desde Colombia.",
  silo: "Vuelos y millas",
  siloHref: '/co/finanzas',
  locale: 'co',
  eyebrow: "Colombia · Vuelos y millas",
  h1: "¿Cuánto cuesta el vuelo desde Colombia y cuánto valen mis millas?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 3 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['3 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculá a qué hora termina un programa de RCN",
    "hint": "Ingresá hora de inicio, duración y pausas para estimar cuándo termina un bloque de televisión. La programación de RCN puede cambiar sin previo aviso.",
    "yes": [
      "Es una estimación de tiempo, no una programación oficial de RCN."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-26.",
    "answer": "Ingresá hora de inicio, duración y pausas para estimar cuándo termina un bloque de televisión. La programación de RCN puede cambiar sin previo aviso."
  },
  {
    "id": "c2",
    "label": "Calculadora de tasas aeropuerto y impuestos en vuelos desde Colombia",
    "hint": "En Colombia, los viajeros pagan tasas aeroportuarias fijas y variables según el tipo de vuelo. Los vuelos domésticos incluyen IVA del 5% sobre la tarifa, mientras que los internacionales cobran tasas de salida del orden de $80–100 USD.",
    "yes": [
      "Vuelo doméstico desde $30.000 COP + $1.500 COP IVA; internacional desde $80 USD en tasas. Desglose completo de impuestos y contribuciones obligatorias en Colombia 2026."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-05-31.",
    "answer": "En Colombia, los viajeros pagan tasas aeroportuarias fijas y variables según el tipo de vuelo. Los vuelos domésticos incluyen IVA del 5% sobre la tarifa, mientras que los internacionales cobran tasas de salida del orden de $80–100 USD."
  },
  {
    "id": "c3",
    "label": "Calculadora para decidir si conviene usar LifeMiles o pagar en efectivo",
    "hint": "Usa la cotización real del vuelo en pesos y millas. Así evita tablas fijas que cambian por disponibilidad, ruta, cabina y promociones. Valor por 1.000 millas = (precio cash − tasas del canje) ÷ millas requeridas × 1.000.",
    "yes": [
      "Usa datos de tu documento real. **Valor por 1.000 millas = (precio cash − tasas del canje) ÷ millas requeridas × 1.000.**"
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-16.",
    "answer": "Usa la cotización real del vuelo en pesos y millas. Así evita tablas fijas que cambian por disponibilidad, ruta, cabina y promociones. Valor por 1.000 millas = (precio cash − tasas del canje) ÷ millas requeridas × 1.000."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__hora_inicio",
    "label": "Calculá a qué hora termina un programa de RCN: Hora de inicio (HH:MM)",
    "type": "text",
    "value": "20:00",
    "thousands": false
  },
  {
    "id": "c1__duracion_minutos",
    "label": "Calculá a qué hora termina un programa de RCN: Duración por episodio (minutos)",
    "type": "number",
    "value": 45,
    "min": 0,
    "thousands": false
  },
  {
    "id": "c1__comerciales_minutos",
    "label": "Calculá a qué hora termina un programa de RCN: Pausas estimadas por episodio (minutos)",
    "type": "number",
    "value": 15,
    "min": 0,
    "thousands": false
  },
  {
    "id": "c1__episodios",
    "label": "Calculá a qué hora termina un programa de RCN: Cantidad de episodios",
    "type": "number",
    "value": 1,
    "min": 1,
    "thousands": false
  },
  {
    "id": "c2__tipo_vuelo",
    "label": "Calculadora de tasas aeropuerto y impuestos en vuelos desde Colombia: Tipo de vuelo",
    "type": "select",
    "value": "domestico",
    "options": [
      {
        "value": "domestico",
        "label": "Doméstico (Colombia → Colombia)"
      },
      {
        "value": "internacional_usa",
        "label": "Internacional a EE.UU."
      },
      {
        "value": "internacional_latinoamerica",
        "label": "Internacional Latinoamérica"
      },
      {
        "value": "internacional_europa",
        "label": "Internacional Europa/Otros"
      }
    ],
    "thousands": false,
    "help": "Selecciona el origen y destino del vuelo"
  },
  {
    "id": "c2__tarifa_base_cop",
    "label": "Calculadora de tasas aeropuerto y impuestos en vuelos desde Colombia: Tarifa base del tiquete (COP)",
    "type": "number",
    "value": 30000,
    "min": 15000,
    "max": 500000,
    "thousands": false,
    "help": "Precio published de la aerolínea antes de impuestos"
  },
  {
    "id": "c2__aeropuerto_salida",
    "label": "Calculadora de tasas aeropuerto y impuestos en vuelos desde Colombia: Aeropuerto de salida",
    "type": "select",
    "value": "bog",
    "options": [
      {
        "value": "bog",
        "label": "Bogotá (El Dorado)"
      },
      {
        "value": "mde",
        "label": "Medellín (José María Córdova)"
      },
      {
        "value": "cali",
        "label": "Cali (Alfonso Bonilla Aragón)"
      },
      {
        "value": "bta",
        "label": "Barranquilla (Ernesto Cortissoz)"
      },
      {
        "value": "otro",
        "label": "Otro aeropuerto"
      }
    ],
    "thousands": false,
    "help": "Las tasas varían ligeramente por aeropuerto"
  },
  {
    "id": "c2__numero_pasajeros",
    "label": "Calculadora de tasas aeropuerto y impuestos en vuelos desde Colombia: Número de pasajeros",
    "type": "number",
    "value": 1,
    "min": 1,
    "max": 9,
    "thousands": false,
    "help": "Cantidad de viajeros (menores no siempre pagan tasa completa)"
  },
  {
    "id": "c3__precioCashCop",
    "label": "Calculadora para decidir si conviene usar LifeMiles o pagar en efectivo: Precio del pasaje en efectivo ($)",
    "type": "number",
    "value": 1800000,
    "min": 0,
    "step": 1000,
    "thousands": false,
    "help": "Usa el valor de tu documento, cotización o escenario."
  },
  {
    "id": "c3__millasRequeridas",
    "label": "Calculadora para decidir si conviene usar LifeMiles o pagar en efectivo: LifeMiles requeridas",
    "type": "number",
    "value": 30000,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Usa el valor de tu documento, cotización o escenario."
  },
  {
    "id": "c3__tasasCop",
    "label": "Calculadora para decidir si conviene usar LifeMiles o pagar en efectivo: Tasas y cargos pagados en efectivo ($)",
    "type": "number",
    "value": 220000,
    "min": 0,
    "step": 100,
    "thousands": false,
    "help": "Usa el valor de tu documento, cotización o escenario."
  },
  {
    "id": "c3__saldoMillas",
    "label": "Calculadora para decidir si conviene usar LifeMiles o pagar en efectivo: Saldo actual de millas",
    "type": "number",
    "value": 24000,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Usa el valor de tu documento, cotización o escenario."
  },
  {
    "id": "c3__valorReferenciaMilCop",
    "label": "Calculadora para decidir si conviene usar LifeMiles o pagar en efectivo: Valor mínimo aceptable por 1.000 millas ($)",
    "type": "number",
    "value": 50000,
    "min": 0,
    "step": 1,
    "thousands": false,
    "help": "Usa el valor de tu documento, cotización o escenario."
  }
],
  fineprint: "Estimación informativa. Verifica los datos y las fuentes oficiales antes de decidir.",
  chart: { type: 'bars', caption: "Los principales resultados numéricos de la fórmula seleccionada." },
  breakdownTitle: "Resultados de la fórmula",
  breakdownIntro: "Cada fila proviene de la fórmula de la calculadora original.",
  faq: [
  {
    "q": "¿Es la grilla oficial?",
    "a": "No; es una estimación independiente."
  },
  {
    "q": "¿Incluye comerciales?",
    "a": "Sí, si ingresás una estimación de minutos."
  },
  {
    "q": "¿Qué pasa con emisiones en vivo?",
    "a": "Pueden extender o mover la programación."
  },
  {
    "q": "¿Puedo sumar varios episodios?",
    "a": "Sí, cambiá la cantidad de episodios."
  },
  {
    "q": "¿Sirve para otros canales?",
    "a": "Sí, es una suma de tiempo genérica."
  },
  {
    "q": "¿Cruza medianoche?",
    "a": "Sí, mostrará la hora resultante del día siguiente."
  },
  {
    "q": "¿Dónde confirmo el horario?",
    "a": "En los canales oficiales de RCN."
  }
],
  sources: [
  {
    "name": "RCN Televisión",
    "url": "https://www.canalrcn.com/",
    "publisher": "RCN",
    "date": "2026"
  },
  {
    "name": "DIAN - Normativa IVA transporte aéreo",
    "url": "https://www.dian.gov.co/aduanas/Regimen-de-Aduanas/Paginas/default.aspx",
    "publisher": "Dirección de Impuestos y Aduanas Nacionales",
    "date": "2026-01-15"
  },
  {
    "name": "Aerocivil - Tasas aeroportuarias 2026",
    "url": "https://www.aerocivil.gov.co/servicios-a-usuarios/tarifas-y-tasas",
    "publisher": "Unidad Administrativa Especial Aeronautica Civil",
    "date": "2026-02-01"
  },
  {
    "name": "ACDAC - Contribuciones seguridad aérea",
    "url": "https://www.aerocivil.gov.co/normatividad/reglamentos-aeronauticos-de-colombia-rac",
    "publisher": "Autoridad Contribuyente Defensa Aérea Civil",
    "date": "2026-03-01"
  },
  {
    "name": "Fontur - Contribución desarrollo turístico",
    "url": "https://www.fontur.gov.co/normativa-viajeros-2026",
    "publisher": "Fondo de Promoción Turística",
    "date": "2026-01-20"
  },
  {
    "name": "Decreto 1165/2017 DIAN - IVA servicios internacionales",
    "url": "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=83609",
    "publisher": "Ministerio de Hacienda y Crédito Público",
    "date": "2017-07-01"
  },
  {
    "name": "LifeMiles — redimir millas",
    "url": "https://www.lifemiles.com/fly/redemption",
    "publisher": "LifeMiles",
    "date": "2026"
  },
  {
    "name": "Avianca LifeMiles",
    "url": "https://www.avianca.com/es/informacion-y-ayuda/lifemiles/",
    "publisher": "Avianca",
    "date": "2026"
  }
],
  replaces: [
    '/co/calculadora-hora-fin-programa-rcn', // Absorbida como caso calculable con formulaId hora-fin-programa-rcn.
    '/co/calculadora-impuestos-aerolineas-tasa-aeropuerto-colombia-internacional', // Absorbida como caso calculable con formulaId impuestos-aerolineas-tasa-aeropuerto-colombia-internacional.
    '/co/calculadora-millas-lifemiles-avianca-colombia-2026', // Absorbida como caso calculable con formulaId millas-lifemiles-avianca-colombia-2026.
  ],
  lastReviewed: '2026-08-16',
};
