import type { HubData } from '../types';

export const hub: HubData = {
  slug: 'co/vida/documentos-y-pasaporte',
  title: "¿Cuánto cuesta y cuánto dura mi documento? | Hacé Cuentas",
  description: "Hub de decisión con 2 cálculos: Calculadora del costo del pasaporte colombiano 2026; Cédula de Ciudadanía Colombia: costos, plazos y validez.",
  silo: "Documentos en Colombia",
  siloHref: '/co/vida',
  locale: 'co',
  eyebrow: "Colombia · Documentos en Colombia",
  h1: "¿Cuánto cuesta y cuánto dura mi documento?",
  lede: "Elige tu caso y completa sólo sus campos. Este hub conserva las 2 fórmulas originales y reúne la decisión en una sola página.",
  stamps: ['2 calculadoras adentro', 'Fórmulas originales reutilizadas', 'Revisado el 28/07/2026'],
  resultLabel: "Tu resultado",
  cases: { title: "¿Qué necesitas calcular?", intro: "Elige un caso; el hub aplica su fórmula original.", items: [
  {
    "id": "c1",
    "label": "Calculadora del costo del pasaporte colombiano 2026",
    "hint": "Desde el 6-abr-2026 (Resolución 03969), el pasaporte ordinario cuesta $190.000 en Bogotá ($111.000 de libreta + $79.000 de timbre) y el ejecutivo $323.000. Los departamentos suman estampillas propias: en Valle del Cauca el ordinario llega a $343.700.",
    "yes": [
      "Pasaporte 2026 (desde 6-abr, Resolución 03969): ordinario $190.000 y ejecutivo $323.000 en Bogotá (incluyen $79.000 de impuesto de timbre). Los departamentos suman estampillas propias: en Valle del Cauca el ordinario cuesta $343.700 y el ejecutivo $476.700 — el mismo documento puede costar 80% más según dónde lo saques."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-07-18.",
    "answer": "Desde el 6-abr-2026 (Resolución 03969), el pasaporte ordinario cuesta $190.000 en Bogotá ($111.000 de libreta + $79.000 de timbre) y el ejecutivo $323.000. Los departamentos suman estampillas propias: en Valle del Cauca el ordinario llega a $343.700."
  },
  {
    "id": "c2",
    "label": "Cédula de Ciudadanía Colombia: costos, plazos y validez",
    "hint": "La Cédula de Ciudadanía es el documento oficial de identidad en Colombia expedido por la Registraduría Nacional. Se otorga al cumplir 18 años y es obligatoria para votar, trabajar y acceder a servicios. La Cédula de Extranjería se expide a residentes extranjeros con permanencia 3 meses.",
    "yes": [
      "Cédula ciudadanía primera vez: $0 (gratuita mayores 18 años). Duplicado: $75.000–$120.000 según departamento. Plazos: 5–15 días hábiles. Validez: 10 años desde expedición."
    ],
    "warn": [
      "Resultado orientativo: verifica los datos de entrada y la fuente aplicable."
    ],
    "plazo": "Datos revisados el 2026-04-28.",
    "answer": "La Cédula de Ciudadanía es el documento oficial de identidad en Colombia expedido por la Registraduría Nacional. Se otorga al cumplir 18 años y es obligatoria para votar, trabajar y acceder a servicios. La Cédula de Extranjería se expide a residentes extranjeros con permanencia 3 meses."
  }
] },
  inputsTitle: "Tus datos",
  inputsIntro: "Cada campo indica a qué caso pertenece; los demás se ignoran.",
  fields: [
  {
    "id": "c1__tipo",
    "label": "Calculadora del costo del pasaporte colombiano 2026: Tipo de pasaporte",
    "type": "select",
    "value": "ordinario",
    "options": [
      {
        "value": "ordinario",
        "label": "Ordinario (32 páginas)"
      },
      {
        "value": "ejecutivo",
        "label": "Ejecutivo (48 páginas)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__lugar",
    "label": "Calculadora del costo del pasaporte colombiano 2026: Dónde lo tramitas",
    "type": "select",
    "value": "bogota",
    "options": [
      {
        "value": "bogota",
        "label": "Bogotá (Cancillería — sin estampillas)"
      },
      {
        "value": "valle_del_cauca",
        "label": "Valle del Cauca (con estampillas)"
      },
      {
        "value": "otro_departamento",
        "label": "Otro departamento (ingresa sus estampillas)"
      }
    ],
    "thousands": false
  },
  {
    "id": "c1__estampillas_departamentales",
    "label": "Calculadora del costo del pasaporte colombiano 2026: Estampillas de tu departamento (COP)",
    "type": "number",
    "value": 0,
    "min": 0,
    "step": 1000,
    "thousands": false,
    "help": "Solo si elegiste \"otro departamento\": el valor de las estampillas lo fija cada gobernación (consúltalo en la oficina de pasaportes de tu departamento)."
  },
  {
    "id": "c2__tipo_tramite",
    "label": "Cédula de Ciudadanía Colombia: costos, plazos y validez: Tipo de trámite",
    "type": "select",
    "value": "primera_vez",
    "options": [
      {
        "value": "primera_vez",
        "label": "Primera vez (mayoría de edad)"
      },
      {
        "value": "duplicado",
        "label": "Duplicado (pérdida/robo/deterioro)"
      },
      {
        "value": "rectificacion",
        "label": "Rectificación de datos"
      },
      {
        "value": "renovacion",
        "label": "Renovación (vencimiento)"
      },
      {
        "value": "extranjeria",
        "label": "Cédula de extranjería"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__departamento",
    "label": "Cédula de Ciudadanía Colombia: costos, plazos y validez: Departamento donde se tramita",
    "type": "select",
    "value": "bogota",
    "options": [
      {
        "value": "bogota",
        "label": "Bogotá D.C."
      },
      {
        "value": "antioquia",
        "label": "Antioquia"
      },
      {
        "value": "atlantico",
        "label": "Atlántico"
      },
      {
        "value": "bolivar",
        "label": "Bolívar"
      },
      {
        "value": "boyaca",
        "label": "Boyacá"
      },
      {
        "value": "caldas",
        "label": "Caldas"
      },
      {
        "value": "caqueta",
        "label": "Caquetá"
      },
      {
        "value": "cauca",
        "label": "Cauca"
      },
      {
        "value": "cesar",
        "label": "Cesar"
      },
      {
        "value": "cordoba",
        "label": "Córdoba"
      },
      {
        "value": "cundinamarca",
        "label": "Cundinamarca"
      },
      {
        "value": "guainia",
        "label": "Guainía"
      },
      {
        "value": "guajira",
        "label": "Guajira"
      },
      {
        "value": "guaviare",
        "label": "Guaviare"
      },
      {
        "value": "huila",
        "label": "Huila"
      },
      {
        "value": "magdalena",
        "label": "Magdalena"
      },
      {
        "value": "meta",
        "label": "Meta"
      },
      {
        "value": "nariño",
        "label": "Nariño"
      },
      {
        "value": "norte_santander",
        "label": "Norte de Santander"
      },
      {
        "value": "putumayo",
        "label": "Putumayo"
      },
      {
        "value": "quindio",
        "label": "Quindío"
      },
      {
        "value": "risaralda",
        "label": "Risaralda"
      },
      {
        "value": "santander",
        "label": "Santander"
      },
      {
        "value": "sucre",
        "label": "Sucre"
      },
      {
        "value": "tolima",
        "label": "Tolima"
      },
      {
        "value": "valle",
        "label": "Valle del Cauca"
      },
      {
        "value": "vaupes",
        "label": "Vaupés"
      },
      {
        "value": "vichada",
        "label": "Vichada"
      }
    ],
    "thousands": false
  },
  {
    "id": "c2__edad",
    "label": "Cédula de Ciudadanía Colombia: costos, plazos y validez: Edad (años)",
    "type": "number",
    "value": 1,
    "min": 0,
    "max": 120,
    "thousands": false,
    "help": "Requerido para mayoría de edad (≥18 años)"
  },
  {
    "id": "c2__expedicion_anterior",
    "label": "Cédula de Ciudadanía Colombia: costos, plazos y validez: ¿Tiene cédula anterior expedida?",
    "type": "radio",
    "value": 1,
    "options": [
      {
        "value": "si",
        "label": "Sí"
      },
      {
        "value": "no",
        "label": "No"
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
    "q": "¿Cuánto cuesta el pasaporte colombiano en 2026?",
    "a": "En Bogotá, $190.000 el ordinario y $323.000 el ejecutivo (tarifas vigentes desde el 6-abr-2026, Resolución 03969). En los departamentos se suman estampillas: en Valle del Cauca el ordinario llega a $343.700 y el ejecutivo a $476.700."
  },
  {
    "q": "¿Por qué el pasaporte cuesta distinto según el departamento?",
    "a": "Porque las gobernaciones cobran estampillas departamentales sobre el valor nacional (libreta + timbre). Cada asamblea fija las suyas: Bogotá no cobra estampillas y por eso es la opción más barata del país."
  },
  {
    "q": "¿Qué incluye el precio de $190.000 del ordinario?",
    "a": "Dos componentes nacionales: $111.000 de la libreta (Cancillería) y $79.000 del impuesto de timbre. En Bogotá no se suma nada más; en los departamentos van encima las estampillas locales."
  },
  {
    "q": "¿Vale la pena el pasaporte ejecutivo?",
    "a": "Solo si viajas muchísimo: la única diferencia práctica es que trae 48 páginas en vez de 32. La vigencia (10 años para adultos) y la validez internacional son idénticas, y cuesta $133.000 más."
  },
  {
    "q": "¿Puedo sacar el pasaporte en Bogotá si vivo en otro departamento?",
    "a": "Sí: cualquier colombiano puede tramitarlo en las sedes de la Cancillería en Bogotá sin importar dónde viva. Para quienes viven en departamentos con estampillas caras (como Valle), el viaje puede pagarse solo con el ahorro."
  },
  {
    "q": "¿El nuevo diseño del pasaporte 2026 lo hizo más caro?",
    "a": "No. La Cancillería confirmó que el cambio de diseño y la modernización tecnológica no implican costos adicionales: la tarifa solo se ajustó por IPC, más un aumento de $4.000 en el impuesto de timbre desde enero de 2026."
  },
  {
    "q": "¿Cuánto se demora la entrega del pasaporte?",
    "a": "Depende de la sede: en general entre 1 y 8 días hábiles después de la toma de datos biométricos. En Bogotá suele ser más rápido que en las gobernaciones."
  }
],
  sources: [
  {
    "name": "Nuevas tarifas de pasaportes a partir del 6 de abril de 2026 (Resolución 03969)",
    "url": "https://chicago.consulado.gov.co/sala-de-prensa/noticias/nuevas-tarifas-de-pasaportes-partir-del-6-de-abril-de-2026",
    "publisher": "Cancillería de Colombia",
    "date": "2026"
  },
  {
    "name": "Precio pasaporte colombiano 2026: tarifas en Valle del Cauca y nuevo diseño",
    "url": "https://occidente.co/colombia/precio-pasaporte-colombiano-2026-tarifas-valle-del-cauca-nuevo-diseno/",
    "publisher": "Diario Occidente",
    "date": "2026"
  },
  {
    "name": "Nuevo pasaporte colombiano: precios desde abril de 2026",
    "url": "https://www.infobae.com/colombia/2026/02/25/nuevo-pasaporte-colombiano-este-es-el-precio-que-deberan-pagar-los-ciudadanos-desde-2026/",
    "publisher": "Infobae Colombia",
    "date": "2026"
  },
  {
    "name": "DANE — información estadística",
    "url": "https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos"
  }
],
  replaces: [
    '/co/calculadora-costo-pasaporte-colombia-2026-departamento', // Absorbida como caso calculable con formulaId costo-pasaporte-colombia-2026.
    '/co/calculadora-curp-colombia-cedula-ciudadania-extranjeria-validez', // Absorbida como caso calculable con formulaId curp-colombia-cedula-ciudadania-extranjeria-validez.
  ],
  lastReviewed: '2026-07-28',
};
