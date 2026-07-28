import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánta plata necesito al mes para vivir en Chile?"
 *
 * Absorbe ocho calculadoras de costo de vida chileno: el presupuesto mensual del hogar,
 * la canasta básica del INE/Ministerio de Desarrollo Social, la canasta de la mascota,
 * el asado del 18, las bebidas por invitado, la propina, el valor de tu hora y el costo
 * de un funeral.
 *
 * Espejo numérico de:
 *  - src/lib/formulas/coste-vida-mensual-chile-soltero-pareja-familia.ts
 *  - src/lib/formulas/canasta-basica-mensual-chile-ine-2026.ts
 *  - src/lib/formulas/canasta-mascota-perro-gato-chile-mensual.ts
 *  - src/lib/formulas/presupuesto-asado-18-fiestas-patrias-chile.ts
 *  - src/lib/formulas/bebidas-evento-litros-por-persona.ts
 *  - src/lib/formulas/propinas-completa.ts
 *  - src/lib/formulas/bono-renta-chile-cuanto-vale-mi-tiempo-uf.ts
 *  - src/lib/formulas/coste-funeral-promedio-chile-2026-cremacion-sepelio.ts
 *
 * UF y dólar son datos VIVOS (src/data/live/chile.json, mindicador.cl): acá no se
 * hardcodean nunca. El ingreso mínimo mensual sale de src/lib/data/chile-2026.ts.
 *
 * PRECIOS QUE CADUCAN: todos los precios de referencia (canasta básica per cápita,
 * comida de mascota, kilo de carne, servicio funerario) son valores de mercado que
 * envejecen. Van como CAMPO EDITABLE con su fecha de dato, nunca como si fueran
 * una constante legal.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** Indicadores vivos, con el mismo fallback que usan las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const USD = (clLive as any)?.dolar?.valor ?? 941.93;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

/** Ingreso mínimo mensual vigente — Ley 21.830, desde 01-may-2026. */
export const IMM = CHILE_2026.imm;

/** Fecha de los precios de referencia de mercado que usa este hub. */
export const PRECIOS_AS_OF = '2026-07';

/**
 * Canasta básica alimentaria por persona equivalente, CLP/mes.
 * La fórmula original usa $70.500 por adulto y pondera adolescente 85%, niño 60%
 * y menor 45%. Esos ponderadores NO son la metodología del INE/MDS —el organismo
 * publica un valor per cápita único—, así que acá el monto por adulto es CAMPO
 * EDITABLE y los ponderadores quedan documentados como supuesto del cálculo.
 */
export const CBA = {
  adulto: 70_500,
  pesoAdolescente: 0.85,
  pesoNino: 0.6,
  pesoMenor: 0.45,
  /** Línea de pobreza (canasta básica total) ≈ 2× la canasta alimentaria. */
  factorCbt: 2.0,
} as const;

/**
 * Coeficiente de costo de vida relativo a Santiago = 1,00 y ajuste regional del
 * servicio funerario, que es más plano. Ambos son espejo de las fórmulas
 * originales (coste-vida y coste-funeral usaban tablas distintas).
 */
export const CIUDADES: Array<{ id: string; nombre: string; coef: number; coefFuneral: number }> = [
  { id: 'santiago', nombre: 'Santiago (RM)', coef: 1.0, coefFuneral: 1.0 },
  { id: 'iquique', nombre: 'Iquique', coef: 0.92, coefFuneral: 0.88 },
  { id: 'antofagasta', nombre: 'Antofagasta', coef: 0.9, coefFuneral: 0.88 },
  { id: 'valparaiso', nombre: 'Valparaíso', coef: 0.85, coefFuneral: 0.95 },
  { id: 'concepcion', nombre: 'Concepción', coef: 0.8, coefFuneral: 0.93 },
  { id: 'temuco', nombre: 'Temuco', coef: 0.78, coefFuneral: 0.92 },
  { id: 'puerto_montt', nombre: 'Puerto Montt', coef: 0.75, coefFuneral: 0.9 },
  { id: 'otra_region', nombre: 'Otra región', coef: 0.77, coefFuneral: 0.88 },
];

/** Composición del hogar: multiplicador de gasto y desglose etario para la canasta. */
export const HOGARES: Array<{
  id: string;
  nombre: string;
  mult: number;
  adultos: number;
  adolescentes: number;
  ninos: number;
  menores: number;
}> = [
  { id: 'soltero', nombre: 'Vivo solo o sola', mult: 1.0, adultos: 1, adolescentes: 0, ninos: 0, menores: 0 },
  { id: 'pareja_sin_hijos', nombre: 'Pareja sin hijos', mult: 1.6, adultos: 2, adolescentes: 0, ninos: 0, menores: 0 },
  { id: 'monoparental', nombre: 'Un adulto con un hijo', mult: 1.8, adultos: 1, adolescentes: 0, ninos: 1, menores: 0 },
  { id: 'familia_2_hijos', nombre: 'Pareja con 2 hijos', mult: 2.4, adultos: 2, adolescentes: 0, ninos: 1, menores: 1 },
  { id: 'familia_3_hijos', nombre: 'Pareja con 3 hijos', mult: 3.0, adultos: 2, adolescentes: 1, ninos: 1, menores: 1 },
];

/** Nivel de vida: multiplicador de gasto discrecional. Espejo de la fórmula. */
export const NIVELES: Array<{ id: string; nombre: string; mult: number; ocio: number; otros: number; vivienda: string }> = [
  { id: 'bajo', nombre: 'Austero', mult: 0.75, ocio: 60_000, otros: 50_000, vivienda: 'depart_periferia' },
  { id: 'medio', nombre: 'Medio', mult: 1.0, ocio: 150_000, otros: 120_000, vivienda: 'depart_centro' },
  { id: 'alto', nombre: 'Acomodado', mult: 1.4, ocio: 300_000, otros: 200_000, vivienda: 'casa_buena' },
];

/** Arriendo base en Santiago, nivel medio, CLP/mes. Precio de mercado editable. */
export const ARRIENDO_BASE: Record<string, number> = {
  depart_periferia: 480_000,
  depart_centro: 600_000,
  casa_periferia: 520_000,
  casa_buena: 700_000,
};

/** Transporte base mensual según autos del hogar, CLP. */
export const TRANSPORTE: Record<string, number> = { no: 80_000, uno: 220_000, dos: 420_000 };

/** Gasto de bolsillo en salud según sistema, CLP/mes (copagos y plan). */
export const SALUD: Array<{ id: string; nombre: string; base: number }> = [
  { id: 'fonasa_a', nombre: 'Fonasa tramo A (copago cero)', base: 25_000 },
  { id: 'fonasa_b', nombre: 'Fonasa tramos B–D', base: 60_000 },
  { id: 'isapre_basica', nombre: 'Isapre, plan básico', base: 140_000 },
  { id: 'isapre_premium', nombre: 'Isapre, plan premium', base: 200_000 },
];

/** Servicios básicos base (luz, agua, gas, internet, telefonía), CLP/mes. */
export const SERVICIOS_BASE = 110_000;

/** Canasta de la mascota — precios de mercado 2026, CLP. Editables. */
export const MASCOTAS: Array<{
  id: string;
  nombre: string;
  comidaStandard: number;
  comidaPremium: number;
  peluqueria: number;
  esterilizacion: number;
}> = [
  { id: 'ninguna', nombre: 'No tengo mascota', comidaStandard: 0, comidaPremium: 0, peluqueria: 0, esterilizacion: 0 },
  { id: 'perro_pequeno', nombre: 'Perro pequeño (menos de 10 kg)', comidaStandard: 13_500, comidaPremium: 21_500, peluqueria: 32_500, esterilizacion: 325_000 },
  { id: 'perro_mediano', nombre: 'Perro mediano (10 a 25 kg)', comidaStandard: 24_000, comidaPremium: 37_000, peluqueria: 47_500, esterilizacion: 375_000 },
  { id: 'perro_grande', nombre: 'Perro grande (más de 25 kg)', comidaStandard: 33_000, comidaPremium: 55_000, peluqueria: 62_500, esterilizacion: 450_000 },
  { id: 'gato', nombre: 'Gato', comidaStandard: 12_000, comidaPremium: 19_000, peluqueria: 27_500, esterilizacion: 240_000 },
];

export const VET_CONSULTA = 75_000;
export const VET_VISITAS_ANUALES = 2;
export const PELUQUERIA_SESIONES_ANUALES = 4;
export const VACUNA_ANUAL = 65_000;

/** Asado del 18 — precios de referencia zona central, CLP. */
export const ASADO = {
  gramosAdulto: 450,
  gramosMenor: 220,
  precioLonganiza: 1_500,
  precioCarbonKg: 1_250,
  carbonPorPersonaKg: 0.7,
  bebidaAdulto: 3_000,
  bebidaMenor: 1_500,
  acompanamientoPersona: 2_500,
} as const;

export const CARNES: Array<{ id: string; nombre: string; precioKg: number }> = [
  { id: 'economico', nombre: 'Económico (pollo, malaya, cerdo)', precioKg: 7_500 },
  { id: 'clasico', nombre: 'Clásico (costillar y plateada)', precioKg: 11_500 },
  { id: 'premium', nombre: 'Premium (lomo vetado, entraña)', precioKg: 16_000 },
];

/** Bebidas por invitado — litros por persona y hora. Espejo de la fórmula original. */
export const BEBIDAS = {
  alcoholPersonaHora: 0.35,
  sinAlcoholPersonaHora: 0.25,
  /** Después de la cuarta hora se consume un 30% menos por hora. */
  decaimientoDespuesDeHoras: 4,
  factorDecaimiento: 0.7,
} as const;

/** Propina sugerida en Chile — Ley 21.442: el local debe sugerir un 10%. */
export const PROPINA_SUGERIDA_PCT = 10;

/** Servicio funerario — precios de referencia RM 2026, CLP. Editables. */
export const FUNERAL: Array<{ id: string; nombre: string; base: number }> = [
  { id: 'cremacion_basica', nombre: 'Cremación básica', base: 450_000 },
  { id: 'cremacion_completa', nombre: 'Cremación con velatorio', base: 680_000 },
  { id: 'sepelio_tradicional', nombre: 'Sepelio tradicional', base: 1_800_000 },
  { id: 'sepelio_premium', nombre: 'Sepelio premium', base: 2_800_000 },
];

export const DERECHOS_CEMENTERIO = { publico: 100_000, privado: 400_000 } as const;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/vida/cuanto-cuesta-vivir',
  title: 'Cuánto cuesta vivir en Chile: presupuesto mensual real por tipo de hogar',
  description:
    'Cuánta plata necesitas al mes para vivir en Chile según tu ciudad y tu hogar: arriendo, comida, transporte, salud y servicios, contrastado con la canasta básica. Más los gastos que nadie presupuesta: la mascota, el asado del 18, las bebidas por invitado, la propina y un funeral. Y cuánto vale una hora de tu tiempo.',
  silo: 'Vida',
  siloHref: '/cl/vida',
  locale: 'cl',

  eyebrow: 'Chile · costo de vida',
  h1: '¿Cuánta plata necesito al mes para vivir en Chile?',
  lede:
    'Arma tu presupuesto mensual real —arriendo, comida, transporte, salud, servicios y ocio— según tu ciudad y la composición de tu hogar, y compáralo con la canasta básica oficial. Abajo están los gastos que casi nadie presupuesta y que igual llegan: la mascota, el asado del 18, la propina y un funeral. Y el número que ordena todo lo demás: cuánto vale una hora de tu tiempo.',
  stamps: [
    `Ingreso mínimo mensual: ${fmt(IMM)} · Ley 21.830`,
    `UF de hoy: $${UF.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Precios de referencia de ${PRECIOS_AS_OF}`,
    '8 calculadoras en una sola página',
  ],

  resultLabel: 'Gasto mensual estimado',

  cases: {
    title: '¿Qué necesitas calcular?',
    intro:
      'Partimos por lo más común: el presupuesto completo del mes. Los otros casos son los gastos que se olvidan hasta que llegan.',
    items: [
      {
        id: 'presupuesto',
        label: 'Mi presupuesto mensual completo',
        hint: 'Arriendo, comida, transporte, salud, servicios, ocio y otros, ajustados a tu ciudad.',
        yes: [
          'Arriendo estimado según el tipo de vivienda que corresponde a tu nivel de gasto y tu ciudad',
          'Alimentación, transporte, salud de bolsillo, servicios básicos, ocio y otros gastos del hogar',
          'Coeficiente regional: cada ciudad se compara contra Santiago = 1,00',
          'Cuánto deberías estar ahorrando (entre el 10% y el 20% del gasto total)',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          `Todos los precios son de referencia de ${PRECIOS_AS_OF} y son editables: el arriendo real de tu comuna puede alejarse mucho del promedio de la ciudad`,
          'Este presupuesto es de gasto corriente: no incluye dividendo hipotecario, cuotas de crédito, matrículas ni imprevistos',
          'La cotización de salud del 7% ya sale de tu liquidación de sueldo: acá se cuenta el gasto de bolsillo (copagos y sobreprecio del plan), no la cotización',
        ],
        plazo:
          'revisa el presupuesto cada vez que se reajusta el arriendo (normalmente una vez al año, en UF) y cuando cambia el ingreso mínimo, en mayo.',
        answer:
          'El gasto mensual de un hogar chileno lo dominan tres rubros: arriendo, alimentación y transporte. Entre los tres suelen llevarse más de la mitad del presupuesto.',
      },
      {
        id: 'canasta',
        label: '¿Estoy sobre o bajo la canasta básica?',
        hint: 'La línea que usa el Estado para medir pobreza, aplicada a tu hogar.',
        yes: [
          'Canasta básica alimentaria del hogar, ponderada por la edad de cada integrante',
          'Canasta básica total (línea de pobreza): aproximadamente el doble de la alimentaria',
          'Qué porcentaje de tu ingreso se va sólo en comer',
          'Un margen de seguridad del 15% sobre el valor de la canasta',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El valor per cápita de la canasta lo publica el Ministerio de Desarrollo Social y Familia con el INE, y se reajusta con el IPC: el monto de este cálculo es editable y debes contrastarlo con la publicación vigente',
          'Los ponderadores por edad (adolescente 85%, niño 60%, menor 45%) son un supuesto de esta calculadora, no la metodología oficial: el organismo publica un valor per cápita único',
          'Estar sobre la línea de pobreza no significa que el presupuesto alcance: la canasta cubre alimentación y lo básico, no arriendo de mercado ni deuda',
        ],
        plazo:
          'el Ministerio de Desarrollo Social actualiza el valor de las canastas todos los meses junto con el IPC del INE.',
        answer:
          'La línea de pobreza de un hogar es, en la práctica, el doble de lo que cuesta alimentarlo: si tu ingreso no llega a ese número, el hogar está bajo la línea.',
      },
      {
        id: 'mascota',
        label: 'Tengo (o quiero tener) una mascota',
        hint: 'Comida, veterinario, peluquería y el pago único de la esterilización.',
        yes: [
          'Comida mensual según tamaño del animal y calidad del alimento',
          'Veterinario prorrateado: consultas de rutina repartidas en los doce meses',
          'Peluquería prorrateada según las sesiones al año',
          'Vacuna de refuerzo anual y el costo único de la esterilización si aún no está hecha',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Las urgencias no están en este cálculo y son el gasto que quiebra el presupuesto: una cirugía puede costar más que un año de comida',
          'Los precios de alimento y de veterinario varían fuerte entre regiones y entre clínicas: son editables',
          'La Ley 21.020 de tenencia responsable obliga a inscribir a tu mascota en el Registro Nacional y a hacerse cargo de su manutención y salud',
        ],
        plazo:
          'la vacuna de refuerzo y la desparasitación son anuales; la esterilización es un pago único que conviene presupuestar aparte.',
        answer:
          'Una mascota cuesta bastante más que su comida: entre veterinario, peluquería y vacunas, el alimento suele ser menos de dos tercios del gasto real.',
      },
      {
        id: 'evento',
        label: 'Voy a hacer un asado o un evento',
        hint: 'El 18, un cumpleaños o una junta: carne, bebidas y la propina si salen a comer.',
        yes: [
          'Kilos de carne por invitado (450 g por adulto, 220 g por menor), longanizas y carbón',
          'Litros de bebida según cantidad de invitados y duración del evento',
          'Bebidas y acompañamientos por cabeza, y cuánto sale si dividen la cuenta',
          'La propina del 10% sugerido si en vez de asado salen a comer',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Los precios de la carne suben fuerte en septiembre: comprar con dos semanas de anticipación o en feria puede bajar la cuenta entre un 15% y un 20%',
          'El cálculo de bebidas asume consumo de adultos: si hay menores o gente que no toma, ajusta el número de invitados adultos',
          'En Chile la propina es voluntaria: la Ley 21.442 obliga al local a sugerir un 10%, pero tú decides si la pagas y cuánto',
        ],
        plazo:
          'compra la carne con anticipación: en la semana del 18 los precios de septiembre están en su punto más alto del año.',
        answer:
          'Un asado se calcula con 450 gramos de carne por adulto y 0,7 kilos de carbón por persona; las bebidas, con 0,35 litros de alcohol por persona y hora.',
      },
      {
        id: 'hora',
        label: '¿Cuánto vale una hora de mi tiempo?',
        hint: 'Para decidir si un gasto vale la pena o si conviene pagar para que otro lo haga.',
        yes: [
          'Valor de tu hora y de tu minuto en pesos, a partir de tu ingreso líquido y tus horas efectivas',
          'El mismo valor expresado en UF, para comparar contra precios pactados en UF',
          'Cuántas veces vale tu hora comparada con la hora del ingreso mínimo',
          'Cuántas horas de tu vida cuesta cada rubro de tu presupuesto',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El valor hora de este cálculo es contable, no laboral: para horas extra el valor legal es sueldo ÷ 30 × 28 ÷ jornada semanal, del Art. 32 del Código del Trabajo',
          'La comparación contra el ingreso mínimo usa la jornada legal vigente: con la Ley 21.561 la jornada baja de 45 a 40 horas de forma gradual, así que el valor hora del mínimo sube en cada tramo',
          'Que tu hora valga mucho no significa que puedas venderla: sólo tiene sentido externalizar si con ese tiempo efectivamente generas ingreso o descanso',
        ],
        plazo:
          'recalcula el valor de tu hora cada vez que cambia tu sueldo o tu jornada; la jornada legal baja en abril de cada tramo de la Ley 21.561.',
        answer:
          'Tu valor hora es el ingreso líquido anual dividido por las horas que realmente trabajas al año: es la vara para decidir si un gasto que te ahorra tiempo vale la pena.',
      },
      {
        id: 'funeral',
        label: 'Tengo que costear un funeral',
        hint: 'Cremación o sepelio, derechos de cementerio y servicios adicionales.',
        yes: [
          'Costo del servicio funerario según modalidad y región',
          'Derechos de cementerio público o privado',
          'Servicios adicionales: traslado, preparación, flores y café para los asistentes',
          'Rango de variación entre funerarias (±15%) y cuánto se ahorra cambiando de modalidad',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La cuota mortuoria de la Ley 16.744 y del sistema previsional cubre parte del gasto: si el fallecido era pensionado o cotizante, la AFP o el IPS pagan hasta 15 UF a quien acredite haber pagado el funeral',
          'Los precios varían mucho entre funerarias: la ley obliga a exhibir el listado de precios y a entregar presupuesto por escrito antes de contratar',
          'Nadie está obligado a contratar el paquete completo: el traslado, la preparación y el catering son opcionales y son los rubros que más inflan la cuenta',
        ],
        plazo:
          'la cuota mortuoria se solicita ante la AFP o el IPS y se paga a quien acredite el gasto con la factura del servicio.',
        answer:
          'Una cremación básica cuesta cerca de un cuarto de lo que cuesta un sepelio tradicional: es, de lejos, la diferencia de decisión más cara del trámite.',
      },
    ],
  },

  inputsTitle: 'Tu situación y tus precios',
  inputsIntro:
    'Todos los montos son mensuales y en pesos chilenos, salvo donde se indique. Los precios de referencia vienen precargados pero son editables: si conoces el valor real de tu comuna, cámbialo.',
  fields: [
    {
      id: 'hogar',
      label: 'Composición de tu hogar',
      type: 'select',
      value: 'pareja_sin_hijos',
      options: HOGARES.map((h) => ({ value: h.id, label: h.nombre })),
    },
    {
      id: 'ciudad',
      label: 'Ciudad donde vives',
      type: 'select',
      value: 'santiago',
      options: CIUDADES.map((c) => ({ value: c.id, label: `${c.nombre} — índice ${c.coef.toFixed(2).replace('.', ',')}` })),
      help: 'El índice compara el costo de vida de cada ciudad contra Santiago = 1,00.',
    },
    {
      id: 'nivel',
      label: 'Nivel de gasto',
      type: 'select',
      value: 'medio',
      options: NIVELES.map((n) => ({ value: n.id, label: n.nombre })),
      help: 'Define el tipo de vivienda, el ocio y el alimento de la mascota que asume el cálculo.',
    },
    {
      id: 'auto',
      label: 'Autos en el hogar',
      type: 'select',
      value: 'uno',
      options: [
        { value: 'no', label: 'Ninguno, sólo transporte público' },
        { value: 'uno', label: 'Un auto' },
        { value: 'dos', label: 'Dos autos' },
      ],
    },
    {
      id: 'salud',
      label: 'Sistema de salud',
      type: 'select',
      value: 'fonasa_b',
      options: SALUD.map((s) => ({ value: s.id, label: s.nombre })),
      help: 'Gasto de bolsillo mensual: copagos y sobreprecio del plan. La cotización del 7% ya sale de tu liquidación.',
    },
    {
      id: 'ingreso',
      label: 'Ingreso líquido del hogar (CLP/mes)',
      prefix: '$',
      value: '1.400.000',
      thousands: true,
      help: 'Lo que efectivamente llega a la cuenta, sumando a todos los que aportan.',
    },
    {
      id: 'horasSemana',
      label: 'Horas que trabajas por semana',
      type: 'number',
      value: 44,
      min: 1,
      max: 90,
      step: 1,
      help: 'Horas reales, incluyendo traslados si quieres el valor hora honesto.',
    },
    {
      id: 'cbaAdulto',
      label: 'Canasta básica alimentaria por adulto (CLP/mes)',
      prefix: '$',
      value: '70.500',
      thousands: true,
      help: `Valor per cápita de referencia de ${PRECIOS_AS_OF}. Contrástalo con la publicación vigente del Ministerio de Desarrollo Social.`,
    },
    {
      id: 'arriendo',
      label: 'Arriendo real que pagas (CLP/mes, 0 = estimar)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Si lo dejas en 0, el cálculo estima el arriendo según tu ciudad, tu nivel de gasto y el tamaño del hogar.',
    },
    {
      id: 'mascota',
      label: 'Mascota',
      type: 'select',
      value: 'ninguna',
      options: MASCOTAS.map((m) => ({ value: m.id, label: m.nombre })),
    },
    {
      id: 'esterilizada',
      label: '¿La mascota ya está esterilizada?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, ya está esterilizada' },
        { value: 'no', label: 'No, hay que presupuestarla' },
      ],
    },
    {
      id: 'invitados',
      label: 'Invitados adultos al evento',
      type: 'number',
      value: 12,
      min: 0,
      max: 300,
      step: 1,
    },
    {
      id: 'menores',
      label: 'Menores en el evento',
      type: 'number',
      value: 4,
      min: 0,
      max: 200,
      step: 1,
    },
    {
      id: 'horasEvento',
      label: 'Duración del evento (horas)',
      type: 'number',
      value: 6,
      min: 1,
      max: 24,
      step: 1,
      help: 'Después de la cuarta hora el consumo de bebida baja cerca de un 30% por hora.',
    },
    {
      id: 'carne',
      label: 'Tipo de carne del asado',
      type: 'select',
      value: 'clasico',
      options: CARNES.map((c) => ({ value: c.id, label: `${c.nombre} — ${fmt(c.precioKg)}/kg` })),
      help: `Precios de referencia zona central, ${PRECIOS_AS_OF}. Editables si tu carnicería cobra otra cosa.`,
    },
    {
      id: 'cuenta',
      label: 'Cuenta del restaurante, si salen a comer (CLP)',
      prefix: '$',
      value: '120.000',
      thousands: true,
      help: 'Sirve para calcular la propina del 10% sugerido y cuánto pone cada uno.',
    },
    {
      id: 'funeral',
      label: 'Tipo de servicio funerario',
      type: 'select',
      value: 'cremacion_completa',
      options: FUNERAL.map((f) => ({ value: f.id, label: `${f.nombre} — desde ${fmt(f.base)}` })),
      help: `Precios de referencia Región Metropolitana, ${PRECIOS_AS_OF}. En regiones bajan entre un 5% y un 12%.`,
    },
    {
      id: 'cementerio',
      label: 'Cementerio',
      type: 'select',
      value: 'publico',
      options: [
        { value: 'publico', label: 'Municipal o público' },
        { value: 'privado', label: 'Parque privado (perpetuidad)' },
      ],
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'A dónde se va tu plata',
    caption:
      'Compara cuánto pesa cada rubro dentro del total del mes. El arriendo, la comida y el transporte suelen llevarse más de la mitad del presupuesto de un hogar chileno.',
  },
  breakdownTitle: 'Rubro por rubro',
  breakdownIntro: 'Las barras comparan cada gasto contra el mayor del presupuesto.',

  faq: [
    {
      q: '¿Cuánto se necesita al mes para vivir en Chile?',
      a: 'Depende sobre todo de dos cosas: la ciudad y el tamaño del hogar. Una persona sola con un nivel de gasto medio en Santiago necesita del orden de un millón de pesos al mes contando arriendo; la misma persona en Temuco o Puerto Montt gasta cerca de un cuarto menos, porque el arriendo y los servicios bajan. Una pareja con dos hijos en Santiago se va bastante por encima de los dos millones y medio. El número que entrega esta página es un punto de partida: el arriendo real de tu comuna es el dato que más mueve el total, y por eso puedes reemplazarlo por el tuyo.',
    },
    {
      q: '¿Cuál es la canasta básica en Chile y quién la calcula?',
      a: 'La canasta básica de alimentos y la línea de pobreza las calcula el Ministerio de Desarrollo Social y Familia a partir de los precios que releva el INE, y se reajustan todos los meses con el IPC. La canasta alimentaria mide lo que cuesta cubrir los requerimientos calóricos de una persona; la canasta básica total, que es la línea de pobreza, es aproximadamente el doble, porque suma vivienda, vestuario, transporte y servicios. Un hogar está bajo la línea de pobreza cuando su ingreso per cápita no alcanza el valor de la canasta total.',
    },
    {
      q: '¿Por qué la canasta básica de mi hogar no es simplemente la per cápita por el número de personas?',
      a: 'Porque los hogares tienen economías de escala y porque los requerimientos calóricos cambian con la edad. La medición oficial trabaja con un valor per cápita y una escala de equivalencia del hogar. Esta página aplica ponderadores por edad —un adolescente cuenta como 85% de un adulto, un niño como 60% y un menor como 45%— que son un supuesto razonable pero no la metodología oficial. Si necesitas el número exacto para un trámite, usa el valor per cápita publicado, no esta estimación.',
    },
    {
      q: '¿Cuánto cuesta mantener un perro o un gato al mes en Chile?',
      a: 'Con alimento estándar y visitas de rutina al veterinario, un gato sale del orden de veinte mil pesos al mes y un perro grande puede superar los cincuenta mil, sin contar peluquería. Con alimento premium el gasto en comida casi se duplica. Lo que más desordena el presupuesto no es la rutina sino la urgencia: una cirugía o una hospitalización puede costar más que un año entero de alimento, y por eso conviene tener un fondo aparte o un seguro. La esterilización es un pago único de entre doscientos cuarenta mil y cuatrocientos cincuenta mil pesos según el tamaño del animal.',
    },
    {
      q: '¿Cuánta carne se calcula por persona para un asado?',
      a: 'La regla estándar en Chile es 450 gramos de carne cruda por adulto y unos 220 gramos por menor, más una longaniza por adulto. A eso se suma el carbón, que se calcula en 0,7 kilos por persona. Si hay muchos acompañamientos —pan amasado, ensalada a la chilena, papas— puedes bajar a 400 gramos por adulto sin que nadie quede con hambre. En la semana del 18 los precios de la carne están en su máximo anual, así que comprar con anticipación o en feria hace una diferencia real.',
    },
    {
      q: '¿Cuánta bebida hay que comprar por invitado?',
      a: 'El cálculo habitual es 0,35 litros de bebida alcohólica y 0,25 litros de bebida sin alcohol por persona y por hora, con un ajuste importante: después de la cuarta hora el consumo baja alrededor de un 30% por hora, porque la gente ya viene tomando. Para un evento de seis horas con veinte adultos eso da del orden de treinta y ocho litros de alcohol. Conviene comprar un 10% de más: lo que sobra se devuelve o se guarda, lo que falta arruina la fiesta.',
    },
    {
      q: '¿Es obligatorio dejar propina en Chile?',
      a: 'No. La propina en Chile es voluntaria. Lo que la Ley 21.442 estableció es que el local está obligado a sugerirla, normalmente en un 10% sobre el consumo, y a preguntarte si quieres pagarla antes de emitir la boleta; también obliga a que la propina se entregue íntegramente a los trabajadores. Tú decides si la pagas, y puedes pagar menos, más o nada. Si pagas con tarjeta, la propina debe poder cargarse en el mismo pago sin comisión para el trabajador.',
    },
    {
      q: '¿Cómo calculo cuánto vale una hora de mi tiempo?',
      a: 'Divide tu ingreso líquido anual por las horas que efectivamente trabajas al año. Si ganas un millón y medio líquido al mes y trabajas 44 horas semanales durante 48 semanas, tu hora vale alrededor de ocho mil quinientos pesos. Ese número sirve para decidir si conviene pagar por un servicio que te ahorra tiempo: si algo te toma tres horas y contratarlo cuesta menos que tres veces tu valor hora, económicamente conviene delegarlo, siempre que con ese tiempo efectivamente generes ingreso o descanso.',
    },
    {
      q: '¿El valor hora de esta página sirve para calcular horas extra?',
      a: 'No. El valor hora de este cálculo es contable: sirve para tomar decisiones de gasto. El valor hora laboral para efectos de horas extraordinarias lo fija el Art. 32 del Código del Trabajo con otra fórmula: sueldo mensual dividido por 30, multiplicado por 28 y dividido por las horas de la jornada semanal pactada. Sobre ese valor se aplica el recargo legal del 50%. Además el cálculo legal parte del sueldo bruto imponible, no del líquido.',
    },
    {
      q: '¿Cuánto cuesta un funeral en Chile?',
      a: 'La diferencia más grande la hace la modalidad. Una cremación básica parte cerca de los cuatrocientos cincuenta mil pesos en la Región Metropolitana; un sepelio tradicional se va sobre el millón ochocientos mil, y uno premium supera los dos millones y medio, sin contar los derechos de cementerio, que van desde unos cien mil en un cementerio municipal hasta cuatrocientos mil en un parque privado a perpetuidad. En regiones los precios bajan entre un 5% y un 12%. Los servicios adicionales —traslado, preparación, flores, café para los asistentes— son opcionales y son los que más inflan la cuenta.',
    },
    {
      q: '¿Hay algún beneficio del Estado para pagar un funeral?',
      a: 'Sí: la cuota mortuoria. Si la persona fallecida era pensionada o cotizante, quien acredite haber pagado el funeral con la factura puede solicitar el reembolso ante la AFP o ante el IPS, con un tope de 15 unidades de fomento. También existen convenios y beneficios de las cajas de compensación para sus afiliados. Conviene pedirlo apenas se tenga la factura del servicio: es un trámite que se hace en ChileAtiende y que mucha gente no cobra por desconocimiento.',
    },
    {
      q: '¿Cuánto debería ahorrar al mes?',
      a: 'La referencia habitual es entre un 10% y un 20% del gasto mensual, pero el orden de prioridad importa más que el porcentaje: primero un fondo de emergencia de tres a seis meses de gasto en un instrumento líquido, después las metas de mediano plazo. Si tu presupuesto no da para ahorrar, el rubro que casi siempre tiene margen no es la comida sino el transporte y el ocio: un auto menos en el hogar libera más plata al mes que cualquier ajuste en el supermercado.',
    },
  ],

  sources: [
    {
      name: 'INE — Índice de Precios al Consumidor y canastas de referencia',
      url: 'https://www.ine.gob.cl/estadisticas/economia/indices-de-precio-e-inflacion/indice-de-precios-al-consumidor',
      publisher: 'Instituto Nacional de Estadísticas',
    },
    {
      name: 'Ministerio de Desarrollo Social y Familia — valor de la canasta básica y líneas de pobreza',
      url: 'https://observatorio.ministeriodesarrollosocial.gob.cl/lineas-de-pobreza-canasta-basica',
      publisher: 'Observatorio Social, Ministerio de Desarrollo Social y Familia',
    },
    {
      name: 'Dirección del Trabajo — ingreso mínimo mensual vigente (Ley 21.830)',
      url: 'https://www.dt.gob.cl/portal/1628/w3-article-60141.html',
      publisher: 'Dirección del Trabajo',
    },
    {
      name: 'BCN — Ley 21.442, propina sugerida en establecimientos de atención al público',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1174430',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'BCN — Ley 21.020 sobre tenencia responsable de mascotas y animales de compañía',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1106037',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'ChileAtiende — cuota mortuoria',
      url: 'https://www.chileatiende.gob.cl/fichas/3161-cuota-mortuoria',
      publisher: 'ChileAtiende',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento y del dólar observado',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Indicadoressiete.aspx',
      publisher: 'Banco Central de Chile',
    },
    {
      name: 'SERNAC — información al consumidor sobre servicios funerarios',
      url: 'https://www.sernac.cl/portal/604/w3-propertyvalue-79014.html',
      publisher: 'Servicio Nacional del Consumidor',
    },
  ],

  replaces: [
    '/calculadora-coste-vida-mensual-chile-soltero-pareja-familia',
    '/calculadora-canasta-basica-mensual-chile-ine-2026',
    '/calculadora-canasta-mascota-perro-gato-chile-mensual',
    '/calculadora-presupuesto-asado-18-fiestas-patrias-chile',
    '/calculadora-bebidas-por-invitado-evento-chile',
    '/calculadora-de-propinas-chile',
    '/calculadora-bono-renta-chile-cuanto-vale-mi-tiempo-uf',
    '/calculadora-coste-funeral-promedio-chile-2026-cremacion-sepelio',
  ],

  lastReviewed: '2026-07-28',
};
