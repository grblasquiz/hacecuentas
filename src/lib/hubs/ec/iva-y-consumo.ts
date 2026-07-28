import type { HubData } from '../types';
import { ECUADOR_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "¿Cuánto impuesto se le suma a lo que compro, importo o
 * envío al exterior?"
 *
 * Absorbe iva-ecuador, retencion-iva-ecuador, ice-consumos-especiales-ecuador,
 * devolucion-iva-tercera-edad-discapacidad-ecuador, impuesto-salida-divisas-isd-ecuador
 * e impuestos-importacion-senae-ecuador.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const IVA = ECUADOR_2026.iva;
export const SBU = ECUADOR_2026.sbu;
export const ISD_TARIFA = ECUADOR_2026.isdTarifa;
export const ISD_EXENTO_TARJETA = ECUADOR_2026.isdExentoTarjetaAnual;
export const ISD_EXENTO_TRANSF = ECUADOR_2026.isdExentoTransfSBU * ECUADOR_2026.sbu;

/** Porcentajes de retención de IVA — Resol. SRI NAC-DGERCGC20-00000061. */
export const RET_IVA_CASOS: Array<{ id: string; label: string; pct: number }> = [
  { id: 'servicios_general', label: 'Servicios gravados (caso general)', pct: 0.7 },
  { id: 'bienes_general', label: 'Bienes gravados (caso general)', pct: 0.3 },
  { id: 'honorarios_profesionales', label: 'Honorarios de servicios profesionales', pct: 1.0 },
  { id: 'liquidacion_compra', label: 'Liquidación de compra de bienes o servicios', pct: 1.0 },
  { id: 'arriendo_persona_natural', label: 'Arriendo de inmueble a persona natural no obligada a contabilidad', pct: 1.0 },
  { id: 'bienes_especiales', label: 'Bienes entre contribuyentes especiales', pct: 0.1 },
  { id: 'servicios_especiales', label: 'Servicios entre contribuyentes especiales', pct: 0.2 },
];

/** Tarifas del ICE. `tipo` 'ad' = % sobre la base; 'esp' = monto por unidad física. */
export const ICE_CATS: Array<{
  id: string;
  label: string;
  tipo: 'ad' | 'esp' | 'vehiculo';
  rate?: number;
  unidad?: string;
  por?: number;
}> = [
  { id: 'perfumes', label: 'Perfumes y aguas de tocador', tipo: 'ad', rate: 0.2 },
  { id: 'videojuegos', label: 'Videojuegos', tipo: 'ad', rate: 0.35 },
  { id: 'tv_pagada', label: 'Televisión pagada', tipo: 'ad', rate: 0.15 },
  { id: 'casinos', label: 'Casinos y salas de juego', tipo: 'ad', rate: 0.35 },
  { id: 'armas', label: 'Armas de fuego deportivas', tipo: 'ad', rate: 0.3 },
  { id: 'vehiculo', label: 'Vehículo motorizado (5% a 35% según el precio)', tipo: 'vehiculo' },
  { id: 'cigarrillos', label: 'Cigarrillos', tipo: 'esp', rate: 0.16, unidad: 'unidades' },
  { id: 'cerveza_industrial', label: 'Cerveza industrial', tipo: 'esp', rate: 13.62, unidad: 'litros de alcohol puro' },
  { id: 'cerveza_artesanal', label: 'Cerveza artesanal', tipo: 'esp', rate: 1.56, unidad: 'litros de alcohol puro' },
  { id: 'bebidas_alcoholicas', label: 'Bebidas alcohólicas (licores)', tipo: 'esp', rate: 10.41, unidad: 'litros de alcohol puro' },
  { id: 'bebidas_azucaradas', label: 'Bebidas azucaradas de más de 25 g de azúcar por litro', tipo: 'esp', rate: 0.18, unidad: 'gramos de azúcar', por: 100 },
];

/** Tramos ad-valorem del ICE de vehículos según el precio de venta. */
export const ICE_VEHICULO = [
  { hasta: 20000, rate: 0.05 },
  { hasta: 30000, rate: 0.1 },
  { hasta: 40000, rate: 0.15 },
  { hasta: 50000, rate: 0.2 },
  { hasta: 60000, rate: 0.25 },
  { hasta: 70000, rate: 0.3 },
  { hasta: null, rate: 0.35 },
];

/** Importación: FODINFA 0,5% del CIF y arancel fijo del régimen courier 4x4. */
export const FODINFA = 0.005;
export const ARANCEL_4X4 = 20;
export const LIMITE_4X4_FOB = 400;
export const LIMITE_4X4_KG = 4;
export const LIMITE_4X4_ANUAL = 1600;

/** Devolución de IVA: tope mensual = IVA sobre 2 SBU, proporcional al grado de discapacidad. */
export const DEVOLUCION_SBU_TOPE = 2;
export const DEVOLUCION_BENEFICIARIOS: Array<{ id: string; label: string; factor: number }> = [
  { id: 'tercera_edad', label: 'Adulto mayor de 65 años', factor: 1 },
  { id: 'disc_85', label: 'Discapacidad del 85% al 100%', factor: 1 },
  { id: 'disc_75', label: 'Discapacidad del 75% al 84%', factor: 0.8 },
  { id: 'disc_50', label: 'Discapacidad del 50% al 74%', factor: 0.7 },
  { id: 'disc_30', label: 'Discapacidad del 30% al 49%', factor: 0.6 },
];

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/impuestos/iva-y-consumo',
  title: 'IVA, ICE, ISD e impuestos de importación en Ecuador: cuánto se suma a lo que compras',
  description:
    'Calcula el IVA del 15% en Ecuador, la retención de IVA que te hace un agente de retención, el ICE de un producto, los tributos de una importación por el SENAE, el ISD de un consumo en el exterior y la devolución de IVA para adultos mayores y personas con discapacidad.',
  silo: 'Impuestos',
  siloHref: '/ec/impuestos',
  locale: 'ec',

  eyebrow: 'Ecuador · SRI y SENAE · impuestos al consumo',
  h1: '¿Cuánto impuesto se le suma a lo que compras, importas o envías al exterior?',
  lede:
    'El IVA es solo la capa de arriba. Debajo puede haber un ICE que ya viene metido en el precio, un arancel y un FODINFA si el producto entra por aduana, y un ISD si el dinero sale del país. Elige qué estás haciendo y la cuenta se arma con la tarifa que corresponde.',
  stamps: [
    `IVA general ${IVA * 100}%`,
    `ISD ${ISD_TARIFA * 100}% · SBU ${usd(SBU)}`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Impuesto de la operación',

  cases: {
    title: '¿Qué estás por hacer?',
    intro:
      'Cada operación tiene su tributo y su base de cálculo. Partimos de la más común: una compra local con IVA.',
    items: [
      {
        id: 'iva',
        label: 'Compro o vendo con IVA en Ecuador',
        hint: `IVA general del ${IVA * 100}%`,
        answer: `El IVA general es del ${IVA * 100}% sobre el valor del bien o servicio, y se suma al precio sin IVA.`,
        yes: [
          `Tarifa general del ${IVA * 100}%, vigente desde 2024`,
          'Se calcula sobre el precio del bien o servicio, después de descuentos',
          'Si el precio ya incluye IVA, la base se obtiene dividiendo el total para 1,15',
          'Hay bienes y servicios con tarifa 0% y otros que no son objeto del impuesto: no todo paga 15%',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tarifa general subió del 12% al 15% en 2024: cualquier cuenta que todavía use 12% te va a dar mal',
          'Los productos con ICE llevan el ICE dentro de la base sobre la que se calcula el IVA: primero el ICE, después el IVA',
        ],
        plazo: 'la declaración de IVA es mensual, o semestral en los regímenes que lo permiten, según el noveno dígito del RUC.',
      },
      {
        id: 'retencion',
        label: 'Me retienen IVA en la factura',
        hint: 'Agente de retención · Resol. NAC-DGERCGC20-00000061',
        answer:
          'La retención no cambia el IVA de la factura: cambia qué parte de ese IVA cobra el proveedor y qué parte va directo al SRI.',
        yes: [
          `El IVA de la factura sigue siendo el ${IVA * 100}% de la base: lo que varía es el porcentaje que retiene el comprador`,
          'Bienes en el caso general: 30% del IVA. Servicios en el caso general: 70% del IVA',
          'Honorarios profesionales, liquidaciones de compra y arriendo a persona natural no obligada a contabilidad: 100% del IVA',
          'Entre contribuyentes especiales los porcentajes bajan a 10% en bienes y 20% en servicios',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La retención no es un costo: es crédito tributario. Lo que te retienen se descuenta del IVA que tienes que pagar',
          'El agente de retención está obligado a entregarte el comprobante de retención: sin ese comprobante no puedes usar el crédito',
        ],
        plazo: 'el comprobante de retención se emite dentro de los 5 días hábiles de recibida la factura.',
      },
      {
        id: 'ice',
        label: 'El producto paga ICE',
        hint: 'Impuesto a los Consumos Especiales',
        answer:
          'El ICE puede ser un porcentaje sobre el precio o un monto fijo por unidad física, y siempre se calcula antes del IVA.',
        yes: [
          'Tarifa ad-valorem: un porcentaje sobre el precio ex fábrica o ex aduana (perfumes, videojuegos, televisión pagada, casinos, armas deportivas)',
          'Tarifa específica: un monto fijo por unidad física (cigarrillos por unidad, cerveza y licores por litro de alcohol puro, bebidas azucaradas por gramo de azúcar)',
          'Los vehículos pagan ad-valorem creciente según el precio, del 5% al 35%',
          'El IVA se aplica después, sobre una base que ya incluye el ICE',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las tarifas específicas del ICE se actualizan por resolución: verifica la vigente antes de usarlas para facturar',
          'En cerveza y licores la base no son los litros de producto sino los litros de alcohol puro: grado alcohólico por volumen',
          'Algunos bienes con tarifa específica pagan además un componente ad-valorem cuando superan un precio de referencia: esa combinación no se estima acá',
        ],
        plazo: 'el ICE se declara y paga mensualmente, dentro del mismo calendario del noveno dígito.',
      },
      {
        id: 'importacion',
        label: 'Importo o me llega un paquete',
        hint: 'SENAE · courier 4x4 o importación general',
        answer: `En el régimen courier 4x4 el paquete paga un arancel fijo de ${usd(ARANCEL_4X4)} más FODINFA, y no paga IVA.`,
        yes: [
          `Categoría B o régimen 4x4: hasta ${LIMITE_4X4_KG} kg y ${usd(LIMITE_4X4_FOB)} FOB por paquete, uso personal`,
          `En 4x4 se paga un arancel fijo de ${usd(ARANCEL_4X4)} más el FODINFA del ${FODINFA * 100}% del CIF, sin IVA ni ICE`,
          `Importación general: arancel ad-valorem según la partida sobre el CIF, FODINFA del ${FODINFA * 100}% e IVA del ${IVA * 100}% sobre CIF más arancel más FODINFA`,
          'El CIF es el valor de la mercancía más el flete y el seguro hasta Ecuador',
        ],
        warn: [
          DISCLAIMER_TAX,
          `El régimen 4x4 tiene un tope anual acumulado de ${usd(LIMITE_4X4_ANUAL)}: pasado ese monto los paquetes entran como importación general`,
          'El porcentaje ad-valorem depende de la partida arancelaria del producto: no hay un porcentaje único, hay que buscarlo en el arancel nacional',
          'Hay mercancías con restricciones y con tributos adicionales (medicamentos, alimentos, tecnología usada): el trámite no siempre es solo pagar',
        ],
        plazo: 'los tributos se liquidan al momento de la nacionalización, antes del retiro de la mercancía.',
      },
      {
        id: 'isd',
        label: 'Gasto o envío dinero al exterior',
        hint: `ISD ${ISD_TARIFA * 100}%`,
        answer: `El ISD es del ${ISD_TARIFA * 100}% sobre el monto que sale del país, con cupos exentos según cómo salga.`,
        yes: [
          `Tarifa general del ${ISD_TARIFA * 100}%, vigente desde abril de 2024`,
          `Consumos y retiros con tarjeta en el exterior: exentos hasta ${usd(ISD_EXENTO_TARJETA)} al año`,
          `Transferencias y salida de efectivo del país: exentas hasta 3 SBU, hoy ${usd(ISD_EXENTO_TRANSF)}`,
          'Superado el cupo, el impuesto se calcula solo sobre el excedente, no sobre todo el monto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El cupo exento de tarjeta es anual y acumulado entre todas tus tarjetas: si ya lo consumiste, la siguiente compra grava desde el primer dólar',
          'Las compras en el exterior pagadas con tarjeta suelen aparecer con el ISD ya cargado en el estado de cuenta: revisa antes de asumir que no te lo cobraron',
          'Hay exenciones específicas por tipo de pago (importaciones, dividendos, pagos de capital e intereses de créditos externos, entre otras) que no se estiman acá',
        ],
        plazo: 'en tarjetas y transferencias el ISD lo retiene y declara la institución financiera; el cupo se cuenta por año calendario.',
      },
      {
        id: 'devolucion',
        label: 'Soy adulto mayor o persona con discapacidad y quiero recuperar IVA',
        hint: 'Devolución mensual con tope en SBU',
        answer: `Se devuelve el IVA pagado en bienes y servicios de uso personal, con un tope mensual equivalente al IVA sobre ${DEVOLUCION_SBU_TOPE} SBU.`,
        yes: [
          `Tope mensual base: ${IVA * 100}% sobre ${DEVOLUCION_SBU_TOPE} SBU = ${usd(IVA * DEVOLUCION_SBU_TOPE * SBU)}`,
          'En personas con discapacidad el tope se aplica en proporción al grado certificado por el CONADIS',
          'La devolución se pide sobre el IVA efectivamente pagado, sustentado con comprobantes válidos a nombre del beneficiario',
          'Se solicita en línea con la clave del SRI, sin necesidad de ir a ventanilla',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Con menos del 30% de discapacidad certificada no se accede al beneficio',
          'Solo entran bienes y servicios de primera necesidad de uso y consumo personal: no todo lo que compras con factura califica',
          'Hay plazo de caducidad para pedir la devolución de meses pasados: no la dejes acumular indefinidamente',
        ],
        plazo: 'la devolución se solicita por período mensual; los comprobantes tienen que estar a nombre del beneficiario.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu operación',
  inputsIntro:
    'Solo hace falta llenar los campos del caso que elegiste; el resto puede quedar en cero. Todos los montos en dólares.',
  fields: [
    {
      id: 'monto',
      label: 'Monto de la operación ($)',
      prefix: '$',
      value: '100',
      thousands: true,
      help: 'Según el caso: el valor sin IVA de la compra, la base del ICE o el precio del vehículo, el valor FOB de la importación, el monto que sale del país, o el total de tus compras del mes con IVA incluido si vas a pedir devolución.',
    },
    {
      id: 'casoRetencion',
      label: 'Tipo de retención de IVA',
      type: 'select',
      value: 'servicios_general',
      options: RET_IVA_CASOS.map((c) => ({ value: c.id, label: `${c.label} — ${Math.round(c.pct * 100)}%` })),
      help: 'Solo para el caso de retención de IVA. El porcentaje se aplica sobre el IVA de la factura, no sobre la base.',
    },
    {
      id: 'categoriaIce',
      label: 'Bien o servicio con ICE',
      type: 'select',
      value: 'perfumes',
      options: ICE_CATS.map((c) => ({ value: c.id, label: c.label })),
      help: 'Solo para el caso de ICE. En perfumes, videojuegos, televisión pagada, casinos, armas y vehículos se usa el monto de arriba; en cigarrillos, cerveza, licores y bebidas azucaradas se usa la cantidad.',
    },
    {
      id: 'cantidadIce',
      label: 'Cantidad para el ICE específico',
      type: 'number',
      value: 0,
      min: 0,
      step: 0.01,
      help: 'Unidades de cigarrillos, litros de alcohol puro en cerveza y licores, o gramos de azúcar en bebidas azucaradas.',
    },
    {
      id: 'fleteSeguro',
      label: 'Flete y seguro internacional ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Solo para importación. El CIF es el valor FOB de la mercancía más el flete y el seguro hasta Ecuador.',
    },
    {
      id: 'regimenImport',
      label: 'Régimen de importación',
      type: 'select',
      value: '4x4',
      options: [
        { value: '4x4', label: 'Courier 4x4 (Categoría B): hasta 4 kg y $400 FOB' },
        { value: 'general', label: 'Importación general (Categoría C)' },
      ],
      help: 'El régimen 4x4 paga arancel fijo y no paga IVA; la importación general paga ad-valorem, FODINFA e IVA.',
    },
    {
      id: 'adValorem',
      label: 'Arancel ad-valorem de la partida (%)',
      type: 'number',
      value: 0,
      min: 0,
      max: 100,
      step: 0.5,
      help: 'Solo para importación general. Depende de la partida arancelaria del producto: búscala en el arancel nacional antes de estimar.',
    },
    {
      id: 'isdTipo',
      label: 'Cómo sale el dinero del país',
      type: 'select',
      value: 'tarjeta',
      options: [
        { value: 'tarjeta', label: 'Consumo o retiro con tarjeta en el exterior' },
        { value: 'transferencia', label: 'Transferencia o efectivo al salir del país' },
        { value: 'otra', label: 'Otra operación, sin exención aplicable' },
      ],
      help: 'Cada vía tiene su propio cupo exento: anual en tarjetas, de 3 SBU en transferencias y efectivo.',
    },
    {
      id: 'isdUsado',
      label: 'Cupo exento de tarjeta ya consumido en el año ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Cuánto de tu cupo anual exento con tarjeta ya usaste antes de esta operación.',
    },
    {
      id: 'beneficiario',
      label: 'Beneficiario de la devolución de IVA',
      type: 'select',
      value: 'tercera_edad',
      options: DEVOLUCION_BENEFICIARIOS.map((b) => ({ value: b.id, label: `${b.label} — tope al ${Math.round(b.factor * 100)}%` })),
      help: 'En discapacidad, el tope mensual se aplica en proporción al grado certificado por el CONADIS.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Cuánto del total es impuesto',
    caption:
      'Compara el valor real del bien, el servicio o el dinero que mueves contra lo que se llevan los impuestos de esa operación.',
  },
  breakdownTitle: 'Cómo se arma el impuesto de tu operación',
  breakdownIntro:
    'Cada caso muestra su base de cálculo, la tarifa aplicada, el impuesto y el total final que sale de tu bolsillo.',

  faq: [
    {
      q: '¿Cuánto es el IVA en Ecuador?',
      a: `La tarifa general es del ${IVA * 100}%. Subió del 12% al 15% en 2024 y esa es la que rige hoy. Existen además la tarifa 0%, que se aplica a una lista de bienes y servicios definidos en la ley (alimentos en estado natural, medicinas, educación, transporte de pasajeros, entre otros), y operaciones que directamente no son objeto del impuesto. Una factura con tarifa 0% no es lo mismo que una exenta: la diferencia importa para el crédito tributario del vendedor.`,
    },
    {
      q: '¿Cómo saco el IVA de un precio que ya lo incluye?',
      a: `Dividiendo el total para 1,15. El resultado es la base imponible y la diferencia es el IVA. No sirve restarle el ${IVA * 100}% al total: ese cálculo da menos IVA del que realmente contiene el precio, porque el ${IVA * 100}% se aplica sobre la base, no sobre el total. Sobre $115 el IVA es $15 y la base $100, no $97,75 y $17,25.`,
    },
    {
      q: '¿Qué es la retención de IVA y por qué me cobran menos?',
      a: 'No te cobran menos: te pagan menos. El comprador que es agente de retención te paga la factura descontando una parte del IVA y entrega esa parte directamente al SRI a tu nombre. Los porcentajes generales son 30% del IVA en bienes y 70% en servicios; en honorarios profesionales, liquidaciones de compra y arriendo a persona natural no obligada a contabilidad se retiene el 100% del IVA. Esa retención es crédito tributario tuyo: se descuenta del IVA que declaras.',
    },
    {
      q: '¿El ICE se calcula antes o después del IVA?',
      a: 'Antes. El ICE forma parte de la base sobre la que después se calcula el IVA, así que un producto con ICE termina pagando IVA también sobre el ICE. Por eso en categorías como licores, cigarrillos o vehículos la carga tributaria total es bastante mayor que el 15% del IVA: hay dos impuestos apilados, y el segundo se calcula sobre un precio que ya incluye al primero.',
    },
    {
      q: '¿Cuánto pago si me llega un paquete del exterior?',
      a: `Depende del régimen. En courier 4x4, que cubre paquetes de uso personal de hasta ${LIMITE_4X4_KG} kg y ${usd(LIMITE_4X4_FOB)} FOB, se paga un arancel fijo de ${usd(ARANCEL_4X4)} más el FODINFA del ${FODINFA * 100}% del CIF, y no se paga IVA. Si el paquete excede esos límites, o si ya superaste el tope anual acumulado del régimen, entra como importación general y ahí sí paga arancel ad-valorem según la partida, FODINFA e IVA del ${IVA * 100}%.`,
    },
    {
      q: '¿Qué es el CIF y por qué cambia lo que pago?',
      a: 'El CIF es el valor de la mercancía más el flete y el seguro hasta Ecuador. Todos los tributos de importación se calculan sobre el CIF, no sobre lo que pagaste por el producto. Por eso un envío barato con flete caro puede terminar pagando bastante más impuesto del esperado: el flete entra en la base gravada igual que el precio del producto.',
    },
    {
      q: '¿Cuánto es el ISD y desde cuándo?',
      a: `La tarifa general del Impuesto a la Salida de Divisas es del ${ISD_TARIFA * 100}%. Subió desde el 3,5% en abril de 2024. Se aplica sobre las transferencias, envíos o traslados de divisas al exterior, incluidos los consumos con tarjeta fuera del país. Cualquier cálculo que todavía use 3,5% está desactualizado y subestima el costo real de mover dinero al exterior.`,
    },
    {
      q: '¿Cuánto puedo gastar en el exterior sin pagar ISD?',
      a: `Con tarjeta de crédito o débito, el cupo exento es de ${usd(ISD_EXENTO_TARJETA)} al año, acumulado entre todas tus tarjetas. Para transferencias al exterior y para el efectivo que llevas al salir del país, el monto exento es de 3 SBU, hoy ${usd(ISD_EXENTO_TRANSF)}. Pasado el cupo, el ${ISD_TARIFA * 100}% se aplica solo sobre el excedente, no sobre el total de la operación.`,
    },
    {
      q: '¿Cuánto IVA me devuelven si soy adulto mayor?',
      a: `El IVA efectivamente pagado en bienes y servicios de uso personal, con un tope mensual equivalente al ${IVA * 100}% sobre ${DEVOLUCION_SBU_TOPE} SBU, hoy ${usd(IVA * DEVOLUCION_SBU_TOPE * SBU)} al mes. Si el IVA que pagaste en el mes es menor que el tope, te devuelven lo que pagaste; si es mayor, te devuelven el tope. El beneficio corre desde los 65 años y se solicita en línea con la clave del SRI.`,
    },
    {
      q: '¿Y si tengo discapacidad?',
      a: 'El mismo tope mensual, pero aplicado en proporción al grado de discapacidad certificado por el CONADIS: 60% del tope entre 30% y 49% de discapacidad, 70% entre 50% y 74%, 80% entre 75% y 84%, y el tope completo del 85% en adelante. Con menos del 30% certificado no se accede al beneficio. La certificación tiene que estar vigente al momento de pedir la devolución.',
    },
    {
      q: '¿La retención de IVA me la puedo recuperar?',
      a: 'Sí, es crédito tributario. Lo retenido se descuenta del IVA que tienes que pagar en tu declaración del período. Si por el volumen de retenciones te queda crédito acumulado que no logras usar, existe la vía de la devolución para ciertos contribuyentes. Lo que nunca hay que hacer es tratar la retención como un gasto: no lo es, es un anticipo del impuesto.',
    },
    {
      q: '¿Qué pasa si compro un producto con ICE y además lo importo?',
      a: 'Se apilan los tres: el ICE se calcula sobre el precio ex aduana, el IVA se calcula sobre una base que incluye el CIF, el arancel, el FODINFA y el ICE, y el FODINFA sale del CIF. Es el caso donde más se dispara el precio final frente al valor de compra en el exterior, y la razón por la que traer licores, perfumes o vehículos casi nunca sale como uno lo calculó mirando solo el precio de origen.',
    },
  ],

  sources: [
    { name: 'SRI — Impuesto al Valor Agregado (IVA)', url: 'https://www.sri.gob.ec/impuesto-al-valor-agregado-iva', publisher: 'Servicio de Rentas Internas' },
    { name: 'SRI — Porcentajes de retención de IVA', url: 'https://www.sri.gob.ec/retenciones-en-la-fuente', publisher: 'Servicio de Rentas Internas' },
    { name: 'SRI — Impuesto a los Consumos Especiales (ICE)', url: 'https://www.sri.gob.ec/impuesto-consumos-especiales', publisher: 'Servicio de Rentas Internas' },
    { name: 'SRI — Impuesto a la Salida de Divisas (ISD)', url: 'https://www.sri.gob.ec/impuesto-a-la-salida-de-divisas-isd', publisher: 'Servicio de Rentas Internas' },
    { name: 'SRI — Devolución de IVA a adultos mayores y personas con discapacidad', url: 'https://www.sri.gob.ec/devolucion-del-iva-personas-adultas-mayores', publisher: 'Servicio de Rentas Internas' },
    { name: 'SENAE — Régimen de tráfico postal y courier', url: 'https://www.aduana.gob.ec/', publisher: 'Servicio Nacional de Aduana del Ecuador' },
  ],

  replaces: [
    '/ec/calculadora-iva-ecuador',
    '/ec/calculadora-retencion-iva-ecuador',
    '/ec/calculadora-ice-consumos-especiales-ecuador',
    '/ec/calculadora-devolucion-iva-tercera-edad-discapacidad-ecuador',
    '/ec/calculadora-impuesto-salida-divisas-isd-ecuador',
    '/ec/calculadora-impuestos-importacion-senae-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
