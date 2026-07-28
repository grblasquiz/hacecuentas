import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto paga de impuestos mi empresa?"
 *
 * Absorbe Primera Categoría, régimen Pyme 14D (general y transparente), renta
 * presunta, IVA, patente comercial municipal y el costo de constituir.
 *
 * Espejo de:
 *  - src/lib/formulas/impuesto-primera-categoria-chile-empresas-2026.ts (CORREGIDO)
 *  - src/lib/formulas/pyme-chile-regimen-14d-tributacion-simplificada.ts (CORREGIDO)
 *  - src/lib/formulas/renta-presunta-chile-agricola-transporte-mineria.ts (REESCRITO)
 *  - src/lib/formulas/patente-comercial-municipal-chile.ts
 *  - src/lib/formulas/emprendedor-pyme-chile-puesta-marcha-1-dia.ts (CORREGIDO)
 *  - src/lib/formulas/iva-chile-19-porciento-tarifa-general.ts (CORREGIDO)
 *
 * CORRECCIONES respecto de las fórmulas viejas (ver reporte):
 *  1. `renta-presunta` usaba `uta_2026 = 47.280` cuando la UTA real ronda los
 *     $859.788: dieciocho veces menos. Con esa UTA falsa cualquier contribuyente
 *     caía en el tramo más alto del Global Complementario y se le cobraba un 14%
 *     sobre rentas que legalmente están exentas.
 *  2. `renta-presunta` inventaba tasas presuntivas por sector (agrícola 7%,
 *     ganadería 9%, forestal 6%, minería 5%) y un tope único de ventas de $100 M.
 *     El Art. 34 LIR fija 10% del avalúo fiscal para lo agrícola, 10% del valor
 *     corriente en plaza del vehículo para transporte y una escala de 4% a 20%
 *     para la minería, con topes de ventas de 9.000, 5.000 y 17.000 UF.
 *  3. `renta-presunta` sumaba Primera Categoría y Global Complementario sin dar
 *     el crédito del Art. 56 N°3: la carga total salía inflada.
 *  4. `pyme-14D` cobraba 25% de Primera Categoría en la modalidad transparente.
 *     En el 14D N°8 la empresa NO paga Primera Categoría: la base se atribuye a
 *     los dueños, que tributan Global Complementario.
 *  5. `pyme-14D` calculaba el IVA como el 19% de los ingresos y lo sumaba al
 *     "impuesto total anual" y a la "tasa efectiva". El IVA es un impuesto de
 *     traslación: lo paga el consumidor, y lo que entera la empresa es el débito
 *     menos el crédito fiscal.
 *  6. `pyme-14D` y `primera-categoria` daban límites de elegibilidad distintos
 *     para el 14D: 75.000 UF una y $3.000 millones la otra. El Art. 14 letra D
 *     N°1 LIR lo fija en 75.000 UF de promedio de ingresos.
 *  7. `primera-categoria` citaba el Art. 21 LIR para la tasa del impuesto: la
 *     tasa está en el Art. 20 y el Art. 21 es el impuesto único a los gastos
 *     rechazados.
 *  8. `emprendedor-pyme...` cobraba notaría como el 1,5%-2,5% del capital y
 *     aranceles de Registro de Comercio de $30.000 a $150.000. Constituir por el
 *     Registro de Empresas y Sociedades (Ley 20.659) es GRATUITO y no requiere
 *     notaría ni inscripción en el Registro de Comercio.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Indicadores vivos (mindicador.cl), con el mismo fallback que las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UTM = (clLive as any)?.utm?.valor ?? 71649;
export const UTA = (clLive as any)?.uta?.valor ?? 859788;

export const REGIMENES = {
  /** Art. 20 LIR — tasa del Impuesto de Primera Categoría, régimen general (14 A). */
  tasaGeneral: 0.27,
  /** Art. 14 letra D N°3 LIR — tasa del régimen Pyme. */
  tasaPyme: 0.25,
  /** Art. 14 letra D N°1 LIR — límite de ingresos promedio para acogerse al régimen Pyme. */
  limitePymeUf: 75000,
  /** Art. 14 letra D N°1 LIR — capital efectivo máximo al inicio de actividades. */
  capitalInicialMaxUf: 85000,
  iva: CHILE_2026.iva,
};

/**
 * Renta presunta — Art. 34 LIR. Tasas y topes de ventas anuales reales.
 * La minería usa una escala de 4% a 20% sobre las ventas netas según el precio
 * promedio anual de la libra de cobre: esa tabla NO está en este repo, así que
 * la tasa va como campo editable con su rango.
 */
export const RENTA_PRESUNTA: Array<{
  id: string;
  label: string;
  baseLabel: string;
  tasa: number | null;
  tasaMin?: number;
  tasaMax?: number;
  topeVentasUf: number;
  norma: string;
}> = [
  {
    id: 'agricola-propietario',
    label: 'Agrícola — propietario o usufructuario del predio',
    baseLabel: 'Avalúo fiscal del predio',
    tasa: 0.1,
    topeVentasUf: 9000,
    norma: 'Art. 34 N°1 LIR — 10% del avalúo fiscal',
  },
  {
    id: 'agricola-arrendatario',
    label: 'Agrícola — arrendatario del predio',
    baseLabel: 'Avalúo fiscal del predio',
    tasa: 0.04,
    topeVentasUf: 9000,
    norma: 'Art. 34 N°1 LIR — 4% del avalúo fiscal',
  },
  {
    id: 'transporte',
    label: 'Transporte terrestre de carga o pasajeros',
    baseLabel: 'Valor corriente en plaza de los vehículos',
    tasa: 0.1,
    topeVentasUf: 5000,
    norma: 'Art. 34 N°2 LIR — 10% del valor corriente en plaza',
  },
  {
    id: 'mineria',
    label: 'Minería',
    baseLabel: 'Ventas netas anuales de minerales',
    tasa: null,
    tasaMin: 0.04,
    tasaMax: 0.2,
    topeVentasUf: 17000,
    norma: 'Art. 34 N°3 LIR — 4% a 20% de las ventas netas según el precio del cobre',
  },
];

/** Patente comercial municipal — Art. 24 DL 3.063 (Ley de Rentas Municipales). */
export const PATENTE = {
  tasaMinPorMil: 2.5,
  tasaMaxPorMil: 5,
  minimoUtm: 1,
  maximoUtm: 8000,
  cuotasAlAnio: 2,
};

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
slug: 'cl/impuestos/impuestos-de-mi-empresa',
  title: 'Impuestos de una empresa en Chile: Primera Categoría, Pyme 14D, IVA y patente municipal',
  description:
    'Calcula el Impuesto de Primera Categoría del régimen general y del régimen Pyme 14D, la modalidad transparente, la renta presunta del Art. 34 con sus topes reales en UF, el IVA que efectivamente enteras y la patente comercial municipal.',
  silo: 'Impuestos',
  siloHref: '/cl/impuestos',
  locale: 'cl',

  eyebrow: 'Chile · SII · empresas',
  h1: '¿Cuánto paga de impuestos mi empresa?',
  lede:
    'Depende del régimen: el general paga 27% sobre la renta líquida imponible, el Pyme paga 25%, y en el transparente la empresa no paga nada porque tributan los dueños. A eso se suman el IVA que enteras y la patente municipal. Elige tu caso y mira el número con el artículo que lo respalda.',
  stamps: [
    `Primera Categoría general: ${REGIMENES.tasaGeneral * 100}%`,
    `Régimen Pyme 14D: ${REGIMENES.tasaPyme * 100}%`,
    `Límite del régimen Pyme: ${REGIMENES.limitePymeUf.toLocaleString('es-CL')} UF (hoy ${fmt(REGIMENES.limitePymeUf * UF)})`,
    `IVA: ${REGIMENES.iva * 100}% · UTM ${fmt(UTM)}`,
    '6 casos en una sola página',
  ],

  resultLabel: 'Impuesto anual estimado',

  cases: {
    title: '¿Qué estás calculando?',
    intro:
      'Partimos por el régimen que usa la mayoría de las empresas chicas y medianas: el régimen Pyme del Art. 14 letra D.',
    items: [
      {
        id: 'pyme',
        label: 'Régimen Pyme 14D general',
        hint: 'Tasa de 25% sobre la renta líquida imponible, con contabilidad simplificada.',
        yes: [
          'Renta líquida imponible: ingresos percibidos menos gastos pagados y depreciación',
          `Impuesto de Primera Categoría al ${REGIMENES.tasaPyme * 100}%`,
          'El impuesto queda como crédito contra el Global Complementario de los socios',
          `Chequeo del límite de ${REGIMENES.limitePymeUf.toLocaleString('es-CL')} UF de ingresos promedio`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `El límite del régimen Pyme es de ${REGIMENES.limitePymeUf.toLocaleString('es-CL')} UF de promedio de ingresos de los últimos tres ejercicios (hoy ${fmt(REGIMENES.limitePymeUf * UF)}), no un monto fijo en pesos`,
          'El 14D usa el criterio de caja: se reconoce lo percibido y lo pagado, no lo devengado',
          'El régimen Pyme permite depreciación instantánea del activo fijo',
          'El IVA no es impuesto a la renta: no se suma acá, va en su propio caso',
        ],
        plazo:
          'la declaración anual es en abril (Formulario 22); los PPM se pagan mensualmente en el Formulario 29 hasta el día 12.',
        answer:
          `El régimen Pyme paga ${REGIMENES.tasaPyme * 100}% de Primera Categoría sobre la renta líquida imponible determinada por caja.`,
      },
      {
        id: 'transparente',
        label: 'Régimen Pyme transparente (14D N°8)',
        hint: 'La empresa no paga Primera Categoría: la renta se atribuye a los dueños.',
        yes: [
          'La empresa NO paga Impuesto de Primera Categoría',
          'La base se atribuye a los dueños según su participación',
          'Los dueños tributan Global Complementario sobre lo atribuido',
          'Comparación contra lo que pagarías en el 14D general',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La calculadora anterior de este sitio cobraba 25% de Primera Categoría también en el transparente: es incorrecto, en el 14D N°8 la empresa no paga ese impuesto',
          'Solo pueden acogerse las empresas cuyos dueños sean todos contribuyentes de impuestos finales (personas naturales o no domiciliados)',
          'Conviene cuando los dueños tienen tasas marginales bajas: si están en tramos altos, el 14D general con crédito puede ser mejor',
          'La atribución es obligatoria: se tributa aunque no se retire la plata de la empresa',
        ],
        plazo:
          'la opción de régimen se ejerce en abril, con efecto para el año comercial siguiente.',
        answer:
          'En el régimen transparente la empresa no paga Primera Categoría: la renta se atribuye a los dueños y tributa en su Global Complementario.',
      },
      {
        id: 'general',
        label: 'Régimen general 14 A (semi integrado)',
        hint: 'Tasa de 27% sobre la renta líquida imponible, con contabilidad completa.',
        yes: [
          'Renta líquida imponible con contabilidad completa',
          `Impuesto de Primera Categoría al ${REGIMENES.tasaGeneral * 100}% (Art. 20 LIR)`,
          'Crédito parcial contra el Global Complementario de los socios al retirar',
          'Pagos provisionales mensuales estimados',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La tasa del ${REGIMENES.tasaGeneral * 100}% está en el Art. 20 de la Ley de la Renta, no en el Art. 21: el Art. 21 es el impuesto único del 40% a los gastos rechazados`,
          'En el régimen semi integrado el crédito por Primera Categoría contra el Global Complementario es parcial (65%), salvo para residentes de países con convenio',
          'Los gastos rechazados se agregan a la renta líquida imponible y además pagan el impuesto único del Art. 21',
          'Es obligatorio para las empresas que superan el límite del régimen Pyme',
        ],
        plazo:
          'declaración anual en abril; los PPM se determinan con la tasa variable que resulta del ejercicio anterior.',
        answer:
          `El régimen general paga ${REGIMENES.tasaGeneral * 100}% de Primera Categoría y da crédito parcial contra el Global Complementario de los socios.`,
      },
      {
        id: 'presunta',
        label: 'Renta presunta (agrícola, transporte o minería)',
        hint: 'La renta se presume a partir del avalúo o del valor del vehículo, no de la contabilidad.',
        yes: [
          'Base presunta según tu actividad, con la tasa real del Art. 34 LIR',
          'Chequeo del tope de ventas anuales en UF de tu actividad',
          'Impuesto de Primera Categoría sobre la base presunta',
          'Ese impuesto como crédito contra el Global Complementario de los dueños',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La calculadora anterior de este sitio usaba una UTA de $47.280 cuando la real ronda los $859.788, y por eso le cobraba Global Complementario a quienes legalmente estaban exentos',
          'Los topes de ventas son distintos por actividad: 9.000 UF en agrícola, 5.000 UF en transporte y 17.000 UF en minería, no un tope único en pesos',
          'La base agrícola es el 10% del avalúo fiscal si eres propietario y el 4% si eres arrendatario',
          'La tasa de la minería va del 4% al 20% de las ventas netas según el precio promedio anual del cobre: acá es campo editable, confirma el porcentaje del año con el SII',
          'El Impuesto de Primera Categoría pagado es crédito contra el Global Complementario: no se suman uno encima del otro',
        ],
        plazo:
          'si superas el tope de ventas de tu actividad, quedas obligado a contabilidad completa desde el 1 de enero del año siguiente.',
        answer:
          'La renta presunta se calcula sobre el avalúo fiscal, el valor del vehículo o las ventas netas, con los topes de ventas del Art. 34 en UF.',
      },
      {
        id: 'iva',
        label: 'Cuánto IVA tengo que enterar',
        hint: 'No es el 19% de tus ventas: es el débito menos el crédito fiscal.',
        yes: [
          `Débito fiscal: ${REGIMENES.iva * 100}% de tus ventas netas`,
          `Crédito fiscal: ${REGIMENES.iva * 100}% de tus compras netas con factura`,
          'IVA a enterar: la diferencia entre los dos',
          'Remanente de crédito fiscal si las compras superan a las ventas',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El IVA no es un costo de la empresa: lo paga el consumidor final y la empresa solo lo recauda y entera',
          'La calculadora anterior de este sitio sumaba el 19% de los ingresos al "impuesto total" de la empresa y a su tasa efectiva: eso infla enormemente la carga aparente',
          'Solo dan crédito fiscal las compras respaldadas con factura y relacionadas con el giro: las boletas no dan crédito',
          'Si el crédito supera al débito, el remanente se arrastra reajustado al período siguiente, no se devuelve salvo casos especiales',
          'Hay operaciones exentas (Art. 12 y 13 DL 825): educación, salud institucional, transporte de pasajeros y exportaciones, entre otras',
        ],
        plazo:
          'el IVA del mes se declara y paga en el Formulario 29 hasta el día 12 del mes siguiente, o el 20 si se declara y paga por internet.',
        answer:
          'El IVA que enteras es el débito fiscal de tus ventas menos el crédito fiscal de tus compras, no el 19% de tu facturación.',
      },
      {
        id: 'patente',
        label: 'Patente municipal y costo de constituir',
        hint: 'La patente es una tasa por mil sobre el capital propio, con mínimo y máximo en UTM.',
        yes: [
          `Patente anual: capital propio × la tasa por mil que fije tu municipio (${PATENTE.tasaMinPorMil}‰ a ${PATENTE.tasaMaxPorMil}‰)`,
          `Mínimo de ${PATENTE.minimoUtm} UTM y máximo de ${PATENTE.maximoUtm.toLocaleString('es-CL')} UTM al año`,
          `Valor de cada una de las ${PATENTE.cuotasAlAnio} cuotas semestrales`,
          'Costo de constituir la empresa por el Registro de Empresas y Sociedades',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Constituir por el Registro de Empresas y Sociedades (Ley 20.659, "Tu Empresa en un Día") es GRATUITO: no requiere notaría ni inscripción en el Registro de Comercio',
          'La calculadora anterior de este sitio cobraba notaría como el 1,5% a 2,5% del capital y aranceles de registro de hasta $150.000: para la vía del RES esos costos no existen',
          'Sí hay costo si vas por la vía tradicional con escritura pública, o si necesitas firma electrónica avanzada y asesoría legal: esos campos son editables',
          'Cada municipio fija su tasa por mil dentro del rango legal: consúltala en la ordenanza de tu comuna',
          'La patente se paga en dos cuotas, en enero y en julio de cada año',
        ],
        plazo:
          'la patente se paga en dos cuotas semestrales, en enero y en julio; el capital propio declarado se actualiza cada año con la declaración de renta.',
        answer:
          `La patente municipal es el capital propio por una tasa de entre ${PATENTE.tasaMinPorMil}‰ y ${PATENTE.tasaMaxPorMil}‰, con mínimo de ${PATENTE.minimoUtm} UTM y máximo de ${PATENTE.maximoUtm.toLocaleString('es-CL')} UTM al año.`,
      },
    ],
  },

  inputsTitle: 'Datos de tu empresa',
  inputsIntro:
    'Todos los montos son anuales y en pesos chilenos, salvo el capital propio de la patente y el avalúo de la renta presunta. Según el caso que elijas, algunos campos quedan sin efecto.',
  fields: [
    {
      id: 'ingresos',
      label: 'Ingresos anuales de la empresa',
      type: 'number',
      value: 300000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Ingresos percibidos en el año, netos de IVA.',
    },
    {
      id: 'gastos',
      label: 'Gastos deducibles del año',
      type: 'number',
      value: 200000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Gastos necesarios para producir la renta, efectivamente pagados en el régimen Pyme.',
    },
    {
      id: 'depreciacion',
      label: 'Depreciación del activo fijo',
      type: 'number',
      value: 0,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'El régimen Pyme permite depreciación instantánea del activo fijo nuevo.',
    },
    {
      id: 'gastosRechazados',
      label: 'Gastos rechazados',
      type: 'number',
      value: 0,
      prefix: '$',
      min: 0,
      step: 500000,
      thousands: true,
      help: 'Se agregan a la renta líquida imponible y además pagan el impuesto único del Art. 21.',
    },
    {
      id: 'ppm',
      label: 'PPM ya pagados en el año',
      type: 'number',
      value: 0,
      prefix: '$',
      min: 0,
      step: 500000,
      thousands: true,
      help: 'Pagos provisionales mensuales enterados en el Formulario 29.',
    },
    {
      id: 'ventasNetas',
      label: 'Ventas netas del período (para el IVA)',
      type: 'number',
      value: 25000000,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'Ventas del mes o del período, sin IVA.',
    },
    {
      id: 'comprasNetas',
      label: 'Compras netas con factura del período',
      type: 'number',
      value: 15000000,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'Solo las compras con factura relacionadas con el giro dan crédito fiscal.',
    },
    {
      id: 'actividadPresunta',
      label: 'Actividad de la renta presunta',
      type: 'select',
      value: 'agricola-propietario',
      options: RENTA_PRESUNTA.map((a) => ({ value: a.id, label: a.label })),
    },
    {
      id: 'basePresunta',
      label: 'Avalúo fiscal, valor del vehículo o ventas de minerales',
      type: 'number',
      value: 120000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Según la actividad: avalúo fiscal del predio, valor corriente en plaza del vehículo o ventas netas de minerales.',
    },
    {
      id: 'tasaMineria',
      label: 'Tasa presunta de minería',
      type: 'number',
      value: 4,
      suffix: '%',
      min: 4,
      max: 20,
      step: 0.5,
      help: 'Va de 4% a 20% según el precio promedio anual del cobre. Confirma la del año con el SII.',
    },
    {
      id: 'capitalPropio',
      label: 'Capital propio tributario',
      type: 'number',
      value: 50000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Base de la patente comercial municipal (Art. 24 DL 3.063).',
    },
    {
      id: 'tasaPorMil',
      label: 'Tasa por mil de tu municipio',
      type: 'number',
      value: PATENTE.tasaMinPorMil,
      suffix: '‰',
      min: PATENTE.tasaMinPorMil,
      max: PATENTE.tasaMaxPorMil,
      step: 0.1,
      help: `Cada municipio la fija entre ${PATENTE.tasaMinPorMil}‰ y ${PATENTE.tasaMaxPorMil}‰. Consulta la ordenanza de tu comuna.`,
    },
    {
      id: 'costoNotaria',
      label: 'Costo de notaría y asesoría al constituir',
      type: 'number',
      value: 0,
      prefix: '$',
      min: 0,
      step: 50000,
      thousands: true,
      help: 'Cero si constituyes por el Registro de Empresas y Sociedades, que es gratuito.',
    },
  ],
  fineprint:
    'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva. Los límites del régimen Pyme y los topes de la renta presunta están expresados en UF, así que en pesos se mueven todos los días.',

  chart: {
    type: 'donut',
    title: 'De la renta a los impuestos',
    caption:
      'Muestra qué parte de la renta líquida imponible se lleva el impuesto y qué parte queda disponible para los dueños.',
  },
  breakdownTitle: 'El cálculo, línea por línea',
  breakdownIntro:
    'Cada fila indica el artículo de la Ley de la Renta, del DL 825 o del DL 3.063 del que sale. Los límites en UF y los topes en UTM se convierten con el valor vigente.',

  faq: [
    {
      q: '¿Cuánto paga de impuesto a la renta una empresa en Chile?',
      a: `Depende del régimen. El régimen general del Art. 14 A paga ${REGIMENES.tasaGeneral * 100}% de Impuesto de Primera Categoría; el régimen Pyme del Art. 14 D N°3 paga ${REGIMENES.tasaPyme * 100}%; y en el régimen Pyme transparente del Art. 14 D N°8 la empresa no paga ese impuesto porque la renta se atribuye a los dueños.`,
    },
    {
      q: '¿Cuál es el límite para ser Pyme ante el SII?',
      a: `Un promedio de ingresos brutos de los últimos tres ejercicios que no supere las ${REGIMENES.limitePymeUf.toLocaleString('es-CL')} UF, hoy ${fmt(REGIMENES.limitePymeUf * UF)}. Además, al iniciar actividades el capital efectivo no puede superar las ${REGIMENES.capitalInicialMaxUf.toLocaleString('es-CL')} UF. Como el límite está en UF, en pesos cambia todos los días.`,
    },
    {
      q: '¿Qué es el régimen transparente y a quién le conviene?',
      a: 'Es el Art. 14 letra D N°8: la empresa no paga Impuesto de Primera Categoría y su renta se atribuye a los dueños, que la incorporan a su Global Complementario. Conviene cuando los dueños tienen tasas marginales bajas, porque se evita adelantar el 25% de Primera Categoría. Si los dueños están en tramos altos, el 14D general con crédito suele salir mejor.',
    },
    {
      q: '¿El IVA es un impuesto que paga la empresa?',
      a: 'No en términos económicos: el IVA lo soporta el consumidor final. La empresa recauda el débito fiscal en sus ventas, descuenta el crédito fiscal de sus compras con factura, y entera la diferencia. Sumar el 19% de la facturación a la carga tributaria de la empresa, como hacía la calculadora anterior de este sitio, distorsiona completamente el número.',
    },
    {
      q: '¿Qué pasa si mi crédito fiscal supera al débito?',
      a: 'Queda un remanente de crédito fiscal que se arrastra al período siguiente, reajustado. No se devuelve en efectivo salvo en casos específicos, como los exportadores o el crédito por activo fijo del Art. 27 bis del DL 825.',
    },
    {
      q: '¿Cómo se calcula la renta presunta agrícola?',
      a: 'Es el 10% del avalúo fiscal del predio si eres propietario o usufructuario, y el 4% si eres arrendatario (Art. 34 N°1 LIR). El tope para mantenerse en el régimen es de 9.000 UF de ventas anuales. No es un porcentaje de las ventas ni depende del margen real de la explotación.',
    },
    {
      q: '¿Cuál es el tope de ventas para estar en renta presunta?',
      a: '9.000 UF anuales en la actividad agrícola, 5.000 UF en el transporte terrestre de carga o pasajeros y 17.000 UF en la minería (Art. 34 LIR). Son topes distintos por actividad y están en UF, no un monto único en pesos. Si superas el tope quedas obligado a contabilidad completa desde el 1 de enero siguiente.',
    },
    {
      q: '¿La renta presunta paga Primera Categoría y Global Complementario a la vez?',
      a: 'Paga los dos, pero no se suman uno encima del otro: el Impuesto de Primera Categoría pagado es crédito contra el Global Complementario de los dueños (Art. 56 N°3 LIR). Calcularlos como una suma, sin dar el crédito, infla artificialmente la carga.',
    },
    {
      q: '¿Cuánto cuesta la patente comercial municipal?',
      a: `Es el capital propio tributario multiplicado por una tasa que cada municipio fija entre ${PATENTE.tasaMinPorMil}‰ y ${PATENTE.tasaMaxPorMil}‰ (Art. 24 DL 3.063), con un mínimo de ${PATENTE.minimoUtm} UTM y un máximo de ${PATENTE.maximoUtm.toLocaleString('es-CL')} UTM al año. Se paga en dos cuotas semestrales, en enero y en julio.`,
    },
    {
      q: '¿Cuánto cuesta constituir una empresa en Chile?',
      a: 'Constituir una SpA, una EIRL o una Ltda. por el Registro de Empresas y Sociedades (Ley 20.659, "Tu Empresa en un Día") es gratuito y se hace en línea: no requiere notaría ni inscripción en el Registro de Comercio. Los costos aparecen si necesitas firma electrónica avanzada, si vas por la vía tradicional con escritura pública o si contratas asesoría legal.',
    },
    {
      q: '¿Qué son los PPM y cómo se calculan?',
      a: 'Son los pagos provisionales mensuales, un anticipo del impuesto anual que se entera en el Formulario 29. En el régimen Pyme la tasa está fijada por ley; en el régimen general se calcula con una tasa variable que resulta del ejercicio anterior. Al declarar en abril se acreditan contra el impuesto anual.',
    },
    {
      q: '¿Qué son los gastos rechazados?',
      a: 'Son desembolsos que no cumplen los requisitos para deducirse como gasto necesario. Se agregan de vuelta a la renta líquida imponible y, si benefician a los dueños, además pagan el impuesto único del Art. 21 de la Ley de la Renta, con una tasa del 40%.',
    },
  ],

  sources: [
    {
      name: 'Ley sobre Impuesto a la Renta (DL 824) — Arts. 14, 20, 21, 34 y 56',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6368',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'SII — régimen Pro Pyme (Art. 14 letra D) y régimen general',
      url: 'https://www.sii.cl/destacados/modernizacion/regimenes_tributarios.html',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SII — renta presunta: requisitos y topes por actividad',
      url: 'https://www.sii.cl/preguntas_frecuentes/renta/001_002_2761.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'DL 825 sobre Impuesto a las Ventas y Servicios — débito y crédito fiscal',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6368',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'DL 3.063 sobre Rentas Municipales — patente comercial, Art. 24',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6812',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Registro de Empresas y Sociedades — constitución en un día (Ley 20.659)',
      url: 'https://www.registrodeempresasysociedades.cl/',
      publisher: 'Ministerio de Economía',
    },
    {
      name: 'UF, UTM y UTA del día',
      url: 'https://mindicador.cl/',
      publisher: 'mindicador.cl (Banco Central de Chile / SII)',
    },
  ],

  replaces: [
    '/calculadora-impuesto-primera-categoria-chile-empresas-2026',
    '/calculadora-pyme-chile-regimen-14d-tributacion-simplificada',
    '/calculadora-renta-presunta-chile-agricola-transporte-mineria',
    '/calculadora-patente-comercial-municipal-chile-capital-propio',
    '/calculadora-iva-chile-19-porciento-tarifa-general',
    // Absorbida sólo por URL: el costo de constituir no es un impuesto, pero es la
    // primera pregunta del mismo usuario (el que abre empresa) y vive como fila del
    // caso "patente municipal y costo de constituir".
    '/calculadora-emprendedor-pyme-chile-puesta-marcha-1-dia',
  ],

lastReviewed: '2026-07-28',
};
