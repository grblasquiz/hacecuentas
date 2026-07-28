import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto sale por mes tener un perro o un gato?"
 *
 * Arquetipo RAMIFICADO: la composición del gasto cambia según la especie (el
 * gato suma arena y el perro suma paseos y peluquería). Absorbe 4 URLs de
 * calculadora suelta, incluida `/calculadora-arena-sanitaria-gato-kg-mes`, que
 * quedó huérfana en otra tanda por homónimo con la arena de construcción: acá
 * es un rubro del presupuesto mensual del gato, no un material de obra.
 *
 * NOTAS DE CONTRATO:
 *  - Este SÍ es un hub de plata: el resultado va en 'ars' (default) y las filas
 *    que no son dinero —kilos de arena, cantidad de bandejas, visitas— declaran
 *    su propio `format`.
 *  - `chart.type: 'donut'` = composición del gasto mensual por rubro.
 */
export const hub: HubData = {
  slug: 'mascotas/cuanto-cuesta',
  title: '¿Cuánto sale por mes tener un perro o un gato? Presupuesto real 2026',
  description:
    'Calculá el costo mensual de tu mascota en Argentina: alimento, veterinario, arena sanitaria, antipulgas, higiene y extras. Valores de referencia actualizados y el gasto anual proyectado.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿Cuánto sale por mes tener un perro o un gato?',
  lede:
    'El costo real de una mascota no es el precio de la bolsa de alimento: es esa bolsa más el veterinario prorrateado, la arena, los antiparasitarios, la higiene y los imprevistos que aparecen una vez por año y duelen todos juntos. Elegí la especie y el tamaño, ajustá lo que ya sabés de tu caso y vas a ver el número del mes, el del año y qué rubro se lleva realmente la plata.',
  stamps: ['Actualizado 27-07-2026', 'Valores de referencia Argentina', '4 calculadoras adentro'],

  resultLabel: 'Lo que sale por mes',

  cases: {
    title: 'Perro',
    intro: 'La estructura del gasto cambia bastante entre uno y otro: el gato suma arena y el perro suma tamaño.',
    items: [
      {
        id: 'perro',
        label: 'Perro',
        hint: 'El tamaño manda: un perro grande come el triple que uno chico.',
        yes: [
          'Alimento según tamaño: el rubro que se lleva entre la mitad y dos tercios del gasto',
          'Veterinario prorrateado: consultas de control, vacunas anuales y desparasitación',
          'Antipulgas mensual, con el precio escalado por peso',
          'Higiene, juguetes, bolsas, correa y reposición de cosas rotas',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Los valores son de referencia para Argentina y se mueven con la inflación: usá el número como estructura, no como precio de góndola',
          'La cuenta no incluye la urgencia ni la cirugía: una cirugía mayor puede costar más que un año entero de mantenimiento',
          'La castración es un gasto de una sola vez, importante y previsible: convendría separarlo aparte',
        ],
        plazo: 'revisá el presupuesto cada 3 meses: el alimento es el rubro que más rápido se desactualiza.',
        answer: 'Un perro mediano de 10 a 25 kg cuesta alrededor de $82.000 por mes en Argentina, casi un millón al año, y el alimento se lleva unos $55.000 de eso.',
      },
      {
        id: 'gato',
        label: 'Gato',
        hint: 'Come menos que un perro, pero la arena es un gasto fijo que sorprende.',
        yes: [
          'Alimento: menos volumen que el perro, pero mayor precio por kilo',
          'Arena sanitaria: kilos por mes según cantidad de gatos y tipo de arena',
          'Veterinario prorrateado, con las consultas felinas un 10% más baratas que las caninas',
          'Antipulgas felino específico, higiene y accesorios',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Nunca uses antipulgas de perro en un gato: la permetrina es tóxica y puede matarlo',
          'La regla de bandejas es "cantidad de gatos más una": ahorrar bandejas termina en problemas de conducta y de orina fuera del cajón',
          'Las razas de pelo largo o sin pelo —persa, maine coon, ragdoll, sphynx— suman peluquería y controles extra',
        ],
        plazo: 'la arena es el rubro que más se estira o se acorta según el tipo: revisalo cada vez que cambies de marca.',
        answer: 'Un gato cuesta alrededor de $60.000 por mes en Argentina: unos $24.000 de alimento, unos $6.000 de arena y el resto entre veterinario, higiene y accesorios.',
      },
    ],
  },

  inputsTitle: 'Armá tu presupuesto',
  inputsIntro:
    'Los valores por defecto son de referencia para Argentina. Cambiá el tamaño, la calidad del alimento y la zona del veterinario para acercarlo a tu caso.',
  fields: [
    {
      id: 'tamano',
      label: 'Tamaño del perro',
      type: 'select',
      value: 'mediano',
      options: [
        { value: 'chico', label: 'Chico — hasta 10 kg' },
        { value: 'mediano', label: 'Mediano — 10 a 25 kg' },
        { value: 'grande', label: 'Grande — más de 25 kg' },
      ],
      help: 'No aplica al caso gato: ahí el consumo es parejo.',
    },
    {
      id: 'calidad',
      label: 'Calidad del alimento',
      type: 'select',
      value: 'premium',
      options: [
        { value: 'estandar', label: 'Estándar / supermercado (−30%)' },
        { value: 'premium', label: 'Premium (referencia)' },
        { value: 'super', label: 'Super premium o veterinario (+40%)' },
      ],
      help: 'El super premium rinde más por kilo, así que el sobreprecio real es menor al 40%.',
    },
    {
      id: 'zona',
      label: 'Zona del veterinario',
      type: 'select',
      value: 'caba',
      options: [
        { value: 'caba', label: 'CABA y GBA norte' },
        { value: 'gba', label: 'GBA sur y oeste' },
        { value: 'interior', label: 'Interior del país' },
      ],
      help: 'Precio promedio de una consulta general de control en cada zona.',
    },
    {
      id: 'visitas',
      label: 'Visitas al veterinario por año',
      type: 'number',
      suffix: 'por año',
      min: 0,
      max: 52,
      step: 1,
      value: 3,
      help: 'Un adulto sano suele ir 2 o 3 veces; un cachorro en esquema de vacunas, 5 o 6; un senior, cada 6 meses más análisis.',
    },
    {
      id: 'gatos',
      label: 'Cantidad de gatos (para la arena)',
      type: 'number',
      suffix: 'gatos',
      min: 1,
      max: 10,
      step: 1,
      value: 1,
      help: 'Cada gato extra suma un 80% del consumo base: comparten bandejas sólo en parte.',
    },
    {
      id: 'arena',
      label: 'Tipo de arena sanitaria',
      type: 'select',
      value: 'aglomerante',
      options: [
        { value: 'aglomerante', label: 'Aglomerante de bentonita — 8 kg/mes' },
        { value: 'absorbente', label: 'Absorbente de piedritas — 17 kg/mes' },
        { value: 'silice', label: 'Sílice en cristales — 4 kg/mes' },
        { value: 'biodegradable', label: 'Biodegradable — 8 kg/mes' },
      ],
      help: 'La sílice usa muchos menos kilos pero cuesta bastante más por kilo: el gasto final queda parecido.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo. Los importes son valores de referencia para Argentina y se desactualizan con la inflación: lo que se mantiene estable es la estructura del gasto, o sea qué porcentaje se lleva cada rubro. No incluye urgencias, cirugías, internaciones ni tratamientos crónicos.',

  chart: {
    type: 'donut',
    title: 'En qué se va la plata',
    caption:
      'El gráfico reparte el gasto mensual entre alimento, veterinario prorrateado, arena (sólo en gatos), antiparasitarios e higiene y extras. En casi todos los casos el alimento se lleva más de la mitad, y ahí es donde un cambio de marca mueve de verdad el presupuesto.',
  },
  breakdownTitle: 'El presupuesto, rubro por rubro',
  breakdownIntro:
    'Los importes van en pesos; los kilos de arena, las bandejas y las visitas declaran su propia unidad. Las barras comparan cada rubro contra el mayor.',

  faq: [
    {
      q: '¿Cuánto sale por mes tener un perro en Argentina?',
      a: 'Como referencia, un perro chico de menos de 10 kg ronda los $58.000 mensuales, uno mediano de 10 a 25 kg unos $82.000 y uno grande de más de 25 kg unos $124.000. La diferencia está casi toda en el alimento, que va de $30.000 a $90.000 según el tamaño. El resto —veterinario prorrateado, antipulgas, higiene y extras— se mueve mucho menos entre un perro y otro.',
    },
    {
      q: '¿Cuánto sale mantener un gato?',
      a: 'Alrededor de $60.000 por mes: unos $24.000 de alimento, unos $6.000 de arena si usás aglomerante, el veterinario prorrateado y unos $18.000 entre higiene, antipulgas, juguetes y accesorios. Come bastante menos que un perro mediano, pero suma un rubro que el perro no tiene, que es la arena, y en razas de pelo largo también peluquería.',
    },
    {
      q: '¿Cuánta arena sanitaria gasta un gato por mes?',
      a: 'Depende del tipo. La aglomerante de bentonita rinde unos 8 kg por mes y por gato, la absorbente de piedritas unos 17 kg porque se cambia entera cada 5 a 7 días, la de sílice apenas 4 kg y la biodegradable unos 8. Cada gato adicional suma cerca del 80% del consumo base. Y la regla de bandejas es cantidad de gatos más una: dos gatos, tres bandejas.',
    },
    {
      q: '¿Qué tipo de arena conviene por precio?',
      a: 'Por costo mensual quedan bastante parejas y la elección termina siendo de manejo. La absorbente es la más barata por kilo pero se consume al doble; la sílice usa la mitad de kilos que cualquier otra pero cuesta unas tres veces más por kilo; la aglomerante es el punto medio y permite retirar sólo los grumos, que es lo más práctico. La biodegradable sale un poco más y compensa por olor y descarte.',
    },
    {
      q: '¿Cuánto cuesta una consulta veterinaria?',
      a: 'Una consulta general de control ronda los $21.500 en CABA y GBA norte, unos $15.000 en GBA sur y oeste y unos $12.500 en el interior, y en gatos suele salir un 10% menos. Una urgencia nocturna trepa a $45.000 en CABA, y una castración va de $60.000 a $120.000 según especie, sexo y tamaño. Los especialistas cobran parecido a una urgencia.',
    },
    {
      q: '¿Cuánto hay que separar para imprevistos?',
      a: 'La referencia razonable es apartar el equivalente a dos o tres meses de mantenimiento como fondo de urgencia, o contratar un plan de salud veterinario si la cuota es menor que ese ahorro mensual. Una cirugía mayor puede irse a $400.000 y una internación con estudios se suma rápido: no es un gasto probable en un mes concreto, pero sí es casi seguro en la vida del animal.',
    },
    {
      q: '¿Cambiar a un alimento más barato conviene?',
      a: 'No tanto como parece, porque el alimento económico tiene menos densidad calórica y más relleno: hay que dar más gramos para las mismas calorías, así que el ahorro por kilo se come una parte del ahorro real. Y del otro lado están las consecuencias veterinarias de una dieta pobre, que se pagan después. Si hay que ajustar, conviene revisar primero premios, snacks y sobras, que suelen ser el gasto invisible.',
    },
    {
      q: '¿Cuánto cuesta un gato de raza comparado con un mestizo?',
      a: 'Bastante más en mantenimiento, no sólo en la compra. Un persa o un maine coon multiplican el gasto de alimento y suman peluquería, y las razas braquicéfalas o con predisposición genética suman controles veterinarios. Como referencia, un maine coon puede duplicar el gasto mensual de un mestizo, y un persa o un sphynx andar cerca del 70% por encima.',
    },
    {
      q: '¿Qué gastos de una sola vez hay que prever al adoptar?',
      a: 'La castración, que va de $60.000 a $150.000 según especie, sexo y tamaño; el esquema completo de vacunas del primer año; el chip o la libreta sanitaria; y el equipamiento inicial, que en un gato son bandejas, rascador y transportín y en un perro cucha o colchón, correa, collar y comederos. Es un desembolso concentrado en los primeros dos meses que después no se repite.',
    },
    {
      q: '¿El antipulgas es un gasto mensual o anual?',
      a: 'Depende del formato. Las pipetas y la mayoría de los comprimidos son mensuales; el Bravecto dura 90 días y los collares tipo Seresto entre 6 y 8 meses, así que conviene prorratearlos. En pesos por mes suelen quedar parecidos, y lo que no conviene es saltearse meses: la pulga completa su ciclo en el ambiente y reinfesta la casa, con lo cual el mes ahorrado se paga con varios de tratamiento.',
    },
    {
      q: '¿Cuánto se gasta en un año?',
      a: 'Multiplicando por doce: un perro chico ronda los $700.000 anuales, uno mediano el millón, uno grande el millón y medio y un gato unos $720.000. A eso hay que sumarle, en el primer año, la castración y el esquema de vacunas completo, que suelen agregar entre $150.000 y $250.000 de una sola vez.',
    },
    {
      q: '¿Conviene un seguro o plan de salud para mascotas?',
      a: 'La cuenta es sencilla: si la cuota mensual del plan es menor que lo que podrías ahorrar por tu cuenta para cubrir una urgencia, y el plan cubre efectivamente cirugías e internación con un tope razonable, tiene sentido. Leé la letra chica: casi todos excluyen preexistencias, tienen carencias de varios meses y limitan las razas con problemas conocidos.',
    },
  ],

  sources: [
    {
      name: 'INDEC — Índice de precios al consumidor, apertura por división de gasto',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
    },
    {
      name: 'AAHA Canine and Feline Preventive Care Guidelines — frecuencia de controles',
      url: 'https://www.aaha.org/resources/2011-aaha-canine-and-feline-preventive-healthcare-guidelines/',
      publisher: 'American Animal Hospital Association',
    },
    {
      name: 'AAFP — Cat Friendly Homes: bandejas sanitarias y regla N+1',
      url: 'https://catfriendly.com/cat-care-at-home/litter-box/',
      publisher: 'American Association of Feline Practitioners',
    },
    {
      name: 'AVMA — Pet ownership costs and preventive care',
      url: 'https://www.avma.org/resources-tools/pet-owners/petcare',
      publisher: 'American Veterinary Medical Association',
    },
    {
      name: 'ESCCAP — Guías de control de parásitos externos e internos',
      url: 'https://www.esccap.org/guidelines/',
      publisher: 'European Scientific Counsel Companion Animal Parasites',
    },
  ],

  replaces: [
    '/calculadora-costo-mensual-mascota-perro-gato',
    '/calculadora-costo-mensual-raza-gato',
    '/calculadora-costo-veterinario-consulta-promedio',
    '/calculadora-arena-sanitaria-gato-kg-mes',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-costo-mascota-vida-util',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Costos base mensuales en ARS, calcados de `costo-mascota-mes.ts`
 * (revalidados julio 2026). `otros` agrupa higiene, juguetes y accesorios.
 */
export const BASE: Record<string, { nombre: string; alimento: number; otros: number; antipulgas: number }> = {
  perro_chico: { nombre: 'Perro chico (hasta 10 kg)', alimento: 30000, otros: 15000, antipulgas: 7000 },
  perro_mediano: { nombre: 'Perro mediano (10 a 25 kg)', alimento: 55000, otros: 12000, antipulgas: 9000 },
  perro_grande: { nombre: 'Perro grande (más de 25 kg)', alimento: 90000, otros: 16000, antipulgas: 12000 },
  gato: { nombre: 'Gato', alimento: 24000, otros: 18000, antipulgas: 7000 },
};

/** Multiplicador del alimento por calidad. */
export const CALIDAD: Record<string, number> = {
  estandar: 0.7,
  premium: 1.0,
  super: 1.4,
};

/**
 * Consulta general de control: promedio del rango de
 * `costo-veterinario-consulta-promedio.ts` por zona. El gato lleva un ajuste
 * del 0,9 en la fórmula original.
 */
export const CONSULTA: Record<string, number> = {
  caba: 21500,
  gba: 15000,
  interior: 12500,
};

export const AJUSTE_ESPECIE_VET = { perro: 1.0, gato: 0.9 };

/**
 * Arena sanitaria, calcada de `arena-sanitaria-gato-kg-mes.ts`: kilos base por
 * mes y por gato, precio por kilo y frecuencia de recambio.
 */
export const ARENAS: Record<string, { nombre: string; kgMes: number; precioKg: number; cambio: string }> = {
  aglomerante: { nombre: 'Aglomerante (bentonita)', kgMes: 8, precioKg: 750, cambio: 'Cambio total cada 10 a 15 días, grumos todos los días.' },
  absorbente: { nombre: 'Absorbente (piedritas)', kgMes: 17, precioKg: 500, cambio: 'Cambio total cada 5 a 7 días, sólidos todos los días.' },
  silice: { nombre: 'Sílice (cristales)', kgMes: 4, precioKg: 2000, cambio: 'Cambio total cada 20 a 30 días, revolver a diario.' },
  biodegradable: { nombre: 'Biodegradable', kgMes: 8, precioKg: 1100, cambio: 'Cambio total cada 7 a 14 días, limpieza diaria.' },
};

/** Cada gato adicional suma el 80% del consumo base de arena. */
export const FACTOR_GATO_EXTRA = 0.8;
