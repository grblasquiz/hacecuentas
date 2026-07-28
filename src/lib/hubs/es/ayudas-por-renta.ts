import type { HubData } from '../types';
import { IPREM_2026, BONO_CULTURAL_2026 } from '../../data/espana-2026';

/**
 * Hub de decisión ES — "¿Mi renta me da derecho a esta ayuda?"
 *
 * Eje: el IPREM es la unidad de medida de casi toda ayuda pública española. El
 * hub traduce tus ingresos a "veces el IPREM" y muestra qué se abre con ese
 * número.
 *
 * Constantes: src/lib/data/espana-2026.ts (IPREM_2026, BONO_CULTURAL_2026) y
 * porcentajes espejados de
 * src/lib/formulas/ingreso-minimo-vital-imv-espana-2026-cuantia.ts y
 * src/lib/formulas/bono-social-electrico-espana-2026-criterios.ts.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'legal'). */
const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

export const hub: HubData = {
  slug: 'es/familia/ayudas-por-renta',
  title: 'Ayudas por renta en España: IPREM, IMV, bono social y bono cultural',
  description:
    'Comprueba a cuántas veces el IPREM equivalen tus ingresos y qué ayudas se abren con ese número: ingreso mínimo vital, bono social eléctrico y bono cultural joven.',
  silo: 'Familia',
  siloHref: '/es/familia',

  eyebrow: 'Guía de ayudas públicas',
  h1: '¿Mi renta me da derecho a alguna ayuda?',
  lede:
    'Casi ninguna ayuda pública española se mide en euros: se mide en veces el IPREM, un indicador que se fija cada año y que sirve de vara para todo, del bono social eléctrico a las becas. Traducir tus ingresos a ese lenguaje es el primer paso para saber qué puedes pedir y qué no.',
  stamps: ['IPREM como unidad de medida', 'Umbrales oficiales por ayuda', '4 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué ayuda estás mirando?',
    intro: 'Todas comparten la misma vara, pero cada una tiene su umbral y sus requisitos.',
    items: [
      {
        id: 'iprem',
        label: 'Sólo quiero saber mis veces el IPREM',
        hint: 'La vara de medir de todas las ayudas',
        answer:
          'El IPREM es el indicador con el que la administración mide la renta: casi todos los umbrales se expresan en veces el IPREM anual.',
        yes: [
          'IPREM mensual y sus versiones anuales de 12 y de 14 pagas',
          'Tus ingresos anuales convertidos a veces el IPREM',
          'Umbrales típicos de 1, 1,5, 2, 2,5 y 3 veces',
          'Sirve como referencia para becas, justicia gratuita, ayudas al alquiler y subsidios',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Cada convocatoria dice si usa el IPREM de 12 o de 14 pagas: la diferencia es de 1.200 € al año y cambia el resultado',
          'El IPREM lleva congelado varios ejercicios, así que los umbrales se han ido quedando cortos frente a la inflación',
        ],
        plazo: 'el IPREM se fija en la Ley de Presupuestos de cada año.',
      },
      {
        id: 'imv',
        label: 'Ingreso mínimo vital',
        hint: 'Renta garantizada por unidad de convivencia',
        answer:
          'El IMV completa tus ingresos hasta una renta garantizada que depende de cuántos adultos y menores viven contigo.',
        yes: [
          'Renta garantizada base para un adulto solo',
          'Incrementos por cada adulto adicional y por cada menor de la unidad',
          'Complemento adicional para familias monoparentales',
          'La ayuda es la diferencia entre tu renta y la garantizada, no el importe completo',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Hay también un test de patrimonio: superar el límite de activos deja fuera aunque la renta sea baja',
          'Se exige un año de residencia legal y efectiva en España y, en general, un año de convivencia previa de la unidad',
          'Es incompatible con parte de las rentas mínimas autonómicas: consulta cuál te conviene',
        ],
        plazo: 'se solicita en la Seguridad Social y tiene efectos desde el mes siguiente a la solicitud.',
      },
      {
        id: 'bonosocial',
        label: 'Bono social eléctrico',
        hint: 'Descuento en la factura de la luz',
        answer:
          'El bono social descuenta un porcentaje de la factura eléctrica a quien no supera un umbral de renta medido en veces el IPREM.',
        yes: [
          'Descuento sobre el término de energía del PVPC, con límites de consumo',
          'Dos categorías: consumidor vulnerable y vulnerable severo',
          'Umbral en veces el IPREM que sube con el número de miembros de la unidad familiar',
          'Umbrales mejorados con discapacidad, familia numerosa o pensión mínima',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Sólo se aplica sobre el PVPC: si tienes contrato en el mercado libre, hay que cambiarse antes',
          'Caduca y hay que renovarlo: dejarlo vencer implica volver a pagar la factura completa',
          'El descuento tiene un tope de consumo anual; por encima, esos kilovatios se pagan enteros',
        ],
        plazo: 'se solicita a la comercializadora de referencia y hay que renovarlo periódicamente.',
      },
      {
        id: 'bonocultural',
        label: 'Bono cultural joven',
        hint: BONO_CULTURAL_2026.importe + ' € al cumplir 18',
        answer:
          'El bono cultural da ' +
          BONO_CULTURAL_2026.importe +
          ' € para gasto cultural a quien cumple 18 años en el ejercicio, sin condición de renta.',
        yes: [
          BONO_CULTURAL_2026.importe + ' € repartidos en categorías: artes en vivo, soportes físicos y consumo digital',
          'Sin requisito de renta: sólo la edad y la residencia',
          'Se solicita en la sede electrónica y se usa con una tarjeta prepago virtual',
          'Caduca al año: lo no gastado se pierde',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El reparto por categorías es rígido: el saldo de una categoría no se puede pasar a otra',
          'Sólo sirve en establecimientos adheridos al programa',
        ],
        plazo:
          'el plazo de solicitud del ejercicio va del ' +
          BONO_CULTURAL_2026.plazoInicio +
          ' al ' +
          BONO_CULTURAL_2026.plazoFin +
          '.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'Los ingresos son los de toda la unidad de convivencia, anuales y antes de impuestos.',
  fields: [
    { id: 'ingresos', label: 'Ingresos anuales de la unidad', prefix: '€', value: '14.000', thousands: true },
    { id: 'adultos', label: 'Adultos en la unidad', type: 'number', value: '1', min: 1, max: 6, step: 1 },
    { id: 'menores', label: 'Menores en la unidad', type: 'number', value: '0', min: 0, max: 8, step: 1 },
    {
      id: 'monoparental',
      label: '¿Es una familia monoparental?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
    },
    {
      id: 'especial',
      label: '¿Hay discapacidad, familia numerosa o pensión mínima?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, umbral mejorado' },
      ],
    },
    { id: 'patrimonio', label: 'Patrimonio de la unidad (sin la vivienda habitual)', prefix: '€', value: '0', thousands: true },
    { id: 'facturaLuz', label: 'Factura anual de la luz', prefix: '€', value: '900', thousands: true },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'scale',
    title: 'Dónde caes en la escala del IPREM',
    caption:
      'Las franjas marcan los umbrales habituales de las ayudas públicas. Cuanto más a la izquierda, más ayudas se abren.',
    bands: [
      { label: 'Hasta 1 IPREM', from: 0, to: 1, tone: 'good' },
      { label: '1 a 2 IPREM', from: 1, to: 2, tone: 'warn' },
      { label: '2 a 3 IPREM', from: 2, to: 3, tone: 'neutral' },
      { label: 'Más de 3 IPREM', from: 3, to: 5, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tus ingresos frente a los umbrales',
  breakdownIntro:
    'Los importes son anuales salvo donde se indica. Las filas de veces el IPREM y de porcentaje llevan su unidad.',

  faq: [
    {
      q: '¿Qué es exactamente el IPREM?',
      a: 'El Indicador Público de Renta de Efectos Múltiples es el índice que la administración usa para medir la renta en casi todas sus ayudas. Sustituyó al salario mínimo en esa función precisamente para que subir el salario mínimo no dejara automáticamente a la gente fuera de las prestaciones.',
    },
    {
      q: '¿El IPREM de 12 o de 14 pagas?',
      a: 'Depende de la convocatoria, y hay que leerlo. Muchos umbrales usan la versión de 14 pagas, que es más generosa, mientras otros usan la de 12. Entre una y otra hay 1.200 € de diferencia anual: lo suficiente para entrar o quedarse fuera.',
    },
    {
      q: '¿Cuánto da el ingreso mínimo vital?',
      a: 'No es una cantidad fija: es la diferencia entre tus ingresos y la renta garantizada que corresponde a tu unidad de convivencia. Esa renta parte de un importe base para un adulto solo y sube con cada adulto adicional, con cada menor y con la condición de familia monoparental.',
    },
    {
      q: '¿Por qué me han denegado el IMV si mis ingresos son bajos?',
      a: 'La causa más frecuente es el test de patrimonio: existe un límite de activos, sin contar la vivienda habitual, que deja fuera aunque la renta sea muy baja. Después vienen los requisitos de residencia legal y efectiva y el de convivencia previa de la unidad.',
    },
    {
      q: '¿Cómo se pide el bono social eléctrico?',
      a: 'A la comercializadora de referencia, no a cualquier compañía, y con el contrato en el PVPC. Se acredita la renta con la declaración o con un certificado, y hay que renovarlo periódicamente: es uno de los descuentos que más gente pierde por no renovarlo a tiempo.',
    },
    {
      q: '¿Cuánto descuenta el bono social?',
      a: 'Un porcentaje del término de energía distinto para consumidor vulnerable y para vulnerable severo, con un límite de consumo anual por encima del cual los kilovatios se pagan íntegros. Ese límite cambia según haya menores en el hogar o no.',
    },
    {
      q: '¿Puedo cobrar el IMV y trabajar?',
      a: 'Sí. Existe un incentivo al empleo pensado para que aceptar un trabajo no suponga perder la prestación de golpe: los ingresos del trabajo se computan de forma parcial durante un tiempo. La regla concreta la aplica la Seguridad Social al revisar el expediente.',
    },
    {
      q: '¿El bono cultural joven tiene requisito de renta?',
      a: 'No. Sólo hay que cumplir la edad en el año de la convocatoria y residir legalmente en España. Es la excepción entre las ayudas de esta lista: no mira la renta, sólo la edad.',
    },
    {
      q: '¿En qué se puede gastar el bono cultural?',
      a: 'El importe llega repartido en tres categorías: artes en vivo y patrimonio, soportes físicos como libros o música, y consumo digital como suscripciones. El saldo de una categoría no se puede pasar a otra y lo no gastado en el plazo se pierde.',
    },
    {
      q: '¿Estas ayudas son compatibles entre sí?',
      a: 'El bono social y el bono cultural son compatibles con casi todo. El IMV, en cambio, se coordina con las rentas mínimas autonómicas y con otras prestaciones, y en muchos casos se descuenta lo que ya se cobra por otra vía. Conviene pedir informe antes de renunciar a nada.',
    },
    {
      q: '¿Y las ayudas de mi comunidad autónoma?',
      a: 'Existen y suelen ser importantes: rentas mínimas, ayudas al alquiler, ayudas de emergencia social y de suministros. Este cálculo sólo recoge las estatales. Las autonómicas usan también el IPREM como vara, así que el número que te sale aquí sirve igualmente para orientarte.',
    },
  ],

  sources: [
    {
      name: 'Indicador Público de Renta de Efectos Múltiples (IPREM)',
      url: 'https://www.iprem.com.es/',
      publisher: 'Indicador oficial publicado en la Ley de Presupuestos',
    },
    {
      name: 'Ley 19/2021 por la que se establece el ingreso mínimo vital',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-21007',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Seguridad Social — ingreso mínimo vital',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/65850d68-8d06-4645-bde7-05374ee42ac7',
      publisher: 'Instituto Nacional de la Seguridad Social',
    },
    {
      name: 'Real Decreto 897/2017 — bono social eléctrico',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2017-11505',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Bono Cultural Joven',
      url: 'https://bonoculturajoven.gob.es/',
      publisher: 'Ministerio de Cultura',
    },
  ],

  replaces: [
    '/calculadora-ingreso-minimo-vital-imv-espana-2026-cuantia',
    '/calculadora-iprem-2026-espana-veces-ingresos',
    '/calculadora-bono-social-electrico-espana-2026-criterios',
    '/calculadora-bono-cultural-joven-2026-espana-reparto-400',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

export const IPREM = IPREM_2026;
export const BONO_CULTURAL = BONO_CULTURAL_2026;

/** IMV. Espejo de ingreso-minimo-vital-imv-espana-2026-cuantia.ts. */
export const IMV = {
  rentaReferenciaAnual: 6050.12,
  pctAdultoExtra: 0.3,
  maxAdultosExtra: 3,
  pctPrimerMenor: 0.28,
  pctMenoresAdicionales: 0.11,
  pctMonoparental: 0.22,
  limitePatrimonioBase: 16614,
  limitePatrimonioPorMiembro: 3000,
};

/**
 * Bono social eléctrico: umbrales en veces el IPREM anual (14 pagas) por número
 * de miembros, y descuentos por categoría.
 * Espejo de bono-social-electrico-espana-2026-criterios.ts.
 */
export const BONO_SOCIAL = {
  multiplicadorGeneral: { 1: 1.5, 2: 2, 3: 2.5 } as Record<string, number>,
  multiplicadorEspecial: { 1: 2, 2: 2.5, 3: 3 } as Record<string, number>,
  descuentoVulnerable: 0.25,
  descuentoVulnerableSevero: 0.4,
};
