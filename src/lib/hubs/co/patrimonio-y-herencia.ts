import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "Vendí, heredé o tengo patrimonio: ¿qué le debo a la DIAN?"
 *
 * Fuente de constantes: src/lib/data/colombia-2026.ts para todo lo que está ahí
 * (tarifa de ganancia ocasional, exención de vivienda, retención en notaría,
 * umbral de timbre). Lo que la tabla maestra NO trae va abajo, marcado, con el
 * artículo del Estatuto Tributario que lo fija.
 *
 * 🔴 Tres tablas inventadas encontradas en las fórmulas que este hub reemplaza —
 * ninguna se replica acá:
 *  1. `impuesto-patrimonio-colombia-personas-naturales-2026.ts` liquidaba con
 *     tramos de 72.000 / 144.000 / 288.000 / 576.000 UVT y una tarifa del 0,75%
 *     que no existe en la Ley 2277/2022, y encima aplicaba la tarifa marginal
 *     plana sobre toda la base en vez de por tramos.
 *  2. `impuesto-sucesiones-herencia-colombia-2026.ts` usaba exenciones de
 *     1.000 UVT (cónyuge/hijo) y 100 UVT (resto) citando un "Decreto 2053/2014"
 *     que no regula esto. Las exenciones reales están en el art. 307 ET.
 *  3. `impuesto-timbre-nacional-colombia-2026.ts` usaba un umbral de 6.000 UVT y
 *     tarifas del 1,5% y 3% atribuidas al "Código de Comercio, Libro V". El
 *     impuesto de timbre está en los arts. 514 a 554 del Estatuto Tributario, no
 *     en el Código de Comercio, y el umbral vigente es de 20.000 UVT.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const UVT = COLOMBIA_2026.uvt;

/** Ganancia ocasional — espejo de COLOMBIA_2026.gananciaOcasional. */
export const GO = {
  tarifa: COLOMBIA_2026.gananciaOcasional.tarifaGeneral,
  tarifaLoterias: COLOMBIA_2026.gananciaOcasional.tarifaLoterias,
  exencionViviendaUvt: COLOMBIA_2026.gananciaOcasional.exencionViviendaUvt,
  retencionNotariaPn: COLOMBIA_2026.gananciaOcasional.retencionVentaInmueblePN,
  /** Años de posesión a partir de los cuales la utilidad es ganancia ocasional y no renta ordinaria (art. 300 ET). */
  aniosParaGananciaOcasional: 2,
};

/**
 * Exenciones de ganancia ocasional en herencias y legados — art. 307 del Estatuto
 * Tributario (redacción de la Ley 1607/2012).
 *
 * ⚠️ Estas cifras NO están en src/lib/data/colombia-2026.ts. Salen del artículo
 * citado y conviene confirmarlas contra el texto vigente antes de cada campaña.
 */
export const HERENCIA_ART307 = {
  /** Inmueble urbano de vivienda de habitación del causante. */
  viviendaUrbanaUvt: 7_700,
  /** Inmueble rural del causante (no aplica a casas quinta ni fincas de recreo). */
  inmuebleRuralUvt: 6_500,
  /** Asignaciones por porción conyugal, herencia o legado a legitimarios o al cónyuge, por otros conceptos. */
  legitimariosUvt: 3_490,
  /** Herencias y legados a personas distintas de legitimarios y cónyuge: 20% de lo recibido, con este tope. */
  otrosBeneficiariosPct: 0.2,
  otrosBeneficiariosTopeUvt: 2_290,
};

/**
 * Impuesto al patrimonio de personas naturales — arts. 292-3 y 296-3 del Estatuto
 * Tributario, incorporados por la Ley 2277 de 2022. Escala marginal por tramos,
 * cada uno con su adición fija en UVT.
 *
 * ⚠️ Tampoco está en la tabla maestra: verificar contra el texto vigente.
 */
export const PATRIMONIO_LEY_2277 = [
  { desdeUvt: 0, hastaUvt: 72_000, tasa: 0, adicionUvt: 0 },
  { desdeUvt: 72_000, hastaUvt: 122_000, tasa: 0.005, adicionUvt: 0 },
  { desdeUvt: 122_000, hastaUvt: 239_000, tasa: 0.01, adicionUvt: 250 },
  { desdeUvt: 239_000, hastaUvt: null as number | null, tasa: 0.015, adicionUvt: 1_420 },
];

/**
 * Impuesto de timbre nacional. La tarifa general quedó en 0% con el desmonte de
 * la Ley 1111/2006; lo que sigue vivo es el gravamen sobre la escritura pública
 * de enajenación de inmuebles por encima del umbral, que la tabla maestra fija
 * en 20.000 UVT.
 */
export const TIMBRE = {
  umbralUvt: COLOMBIA_2026.compraventa.timbreDesdeUvt,
  /** ⚠️ Tarifa no incluida en la tabla maestra: confirmar contra el decreto vigente. */
  tarifa: 0.01,
};

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/impuestos/patrimonio-y-herencia',
  title: 'Ganancia ocasional en Colombia: vender casa, heredar y pagar patrimonio',
  description:
    'Calculá el impuesto de ganancia ocasional del 15% al vender un inmueble, la exención de 5.000 UVT de vivienda, lo que paga un heredero según el art. 307 ET y el impuesto al patrimonio de la Ley 2277 de 2022.',
  silo: 'Impuestos',
  siloHref: '/co/impuestos',
  locale: 'co',

  eyebrow: 'Colombia · DIAN · ganancia ocasional y patrimonio',
  h1: 'Vendí, heredé o tengo patrimonio: ¿cuánto le debo a la DIAN?',
  lede:
    'Todo esto se liquida por fuera de la tabla de renta, en una cédula aparte y con tarifa plana del 15%. La diferencia entre pagar mucho y pagar poco casi nunca está en la tarifa: está en las exenciones, en el costo fiscal que puedas probar y en cuánto tiempo tuviste el bien antes de venderlo.',
  stamps: [
    `UVT vigente: ${cop(UVT)}`,
    'Arts. 300, 302, 307, 311-1 y 314 ET · Ley 2277 de 2022',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Impuesto que te queda por pagar',

  cases: {
    title: '¿Qué te pasó exactamente?',
    intro:
      'Las cuatro situaciones se liquidan con la misma tarifa del 15%, pero cada una tiene su propia exención y su propia base. Elegí la tuya: los campos que no aplican se ignoran solos.',
    items: [
      {
        id: 'vivienda',
        label: 'Vendí mi casa o apartamento de habitación',
        hint: 'Arts. 300, 311-1 y 314 ET · exención de 5.000 UVT',
        answer: `Si la tuviste 2 años o más y reinvertís, las primeras ${GO.exencionViviendaUvt.toLocaleString('es-CO')} UVT de utilidad quedan exentas.`,
        yes: [
          `Tarifa del ${(GO.tarifa * 100).toFixed(0)}% sobre la utilidad, no sobre el precio de venta`,
          `Exención de las primeras ${GO.exencionViviendaUvt.toLocaleString('es-CO')} UVT de utilidad (${cop(GO.exencionViviendaUvt * UVT)}) si era tu vivienda de habitación`,
          'El costo fiscal incluye lo que pagaste, las mejoras con soporte y los reajustes fiscales autorizados',
          `Retención del ${(GO.retencionNotariaPn * 100).toFixed(0)}% del precio que te practica el notario, y que es anticipo del impuesto`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `La exención del art. 311-1 exige que la plata vaya a otra vivienda, a una cuenta AFC o a pagar la hipoteca de la casa vendida: si te la gastás en otra cosa, la perdés entera`,
          `Con menos de ${GO.aniosParaGananciaOcasional} años de posesión no hay ganancia ocasional: la utilidad entra como renta líquida ordinaria y puede pagar hasta el 39% marginal en vez del 15%`,
          'Si no podés probar el costo fiscal con escritura y facturas, la DIAN toma el que figure declarado y el impuesto sube',
        ],
        plazo: 'la retención del 1% se paga en notaría el día de la escritura; el impuesto definitivo se liquida en la declaración de renta del año.',
      },
      {
        id: 'otro-activo',
        label: 'Vendí otro activo (finca, local, vehículo, acciones)',
        hint: 'Art. 300 ET · sin exención de vivienda',
        answer: 'Misma tarifa del 15%, pero sin la exención de vivienda: sólo restás el costo fiscal.',
        yes: [
          `Tarifa del ${(GO.tarifa * 100).toFixed(0)}% sobre la utilidad, si tuviste el activo ${GO.aniosParaGananciaOcasional} años o más`,
          'Costo fiscal probado: precio de compra, mejoras y reajustes fiscales',
          'Retención en la fuente que te hayan practicado, acreditable contra el impuesto',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Acá NO aplica la exención de ${GO.exencionViviendaUvt.toLocaleString('es-CO')} UVT: es exclusiva de la casa o apartamento de habitación`,
          `Con menos de ${GO.aniosParaGananciaOcasional} años de posesión la utilidad tributa como renta ordinaria, con la tabla progresiva y no con el 15%`,
          'La depreciación que hayas deducido antes se recaptura y vuelve como renta líquida, no como ganancia ocasional',
        ],
        plazo: 'la utilidad va en la cédula de ganancias ocasionales del formulario 210, del año en que se realizó la venta.',
      },
      {
        id: 'herencia',
        label: 'Recibí una herencia, un legado o una donación',
        hint: 'Arts. 302 y 307 ET · exenciones por tipo de bien',
        answer: 'La herencia es ganancia ocasional al 15%, pero el art. 307 exime una porción importante.',
        yes: [
          `Tarifa del ${(GO.tarifa * 100).toFixed(0)}% sobre lo que recibís, después de las exenciones del art. 307`,
          `Vivienda urbana de habitación del causante: exentas ${HERENCIA_ART307.viviendaUrbanaUvt.toLocaleString('es-CO')} UVT`,
          `Inmueble rural del causante: exentas ${HERENCIA_ART307.inmuebleRuralUvt.toLocaleString('es-CO')} UVT`,
          `Otras asignaciones a legitimarios o al cónyuge: exentas ${HERENCIA_ART307.legitimariosUvt.toLocaleString('es-CO')} UVT`,
          `Si no sos legitimario ni cónyuge: exento el ${(HERENCIA_ART307.otrosBeneficiariosPct * 100).toFixed(0)}% de lo recibido, con tope de ${HERENCIA_ART307.otrosBeneficiariosTopeUvt.toLocaleString('es-CO')} UVT`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las exenciones del art. 307 se miden por beneficiario y por tipo de bien, no una sola vez sobre toda la masa: dos herederos tienen cada uno su propio tope',
          'El impuesto lo paga cada heredero en SU declaración de renta, no la sucesión: la sucesión ilíquida declara aparte mientras no se adjudique',
          'Los gastos del proceso sucesoral (abogado, notaría, avalúos) reducen la masa a repartir pero no son un beneficio fiscal por sí mismos',
          'Las exenciones de esta rama salen del art. 307 ET y no de la tabla maestra del sitio: confirmalas con tu contador antes de liquidar',
        ],
        plazo: 'la ganancia ocasional se declara en el año en que se ejecutoría la sentencia o se firma la escritura de partición.',
      },
      {
        id: 'patrimonio',
        label: 'Tengo un patrimonio alto y me preguntan si pago impuesto al patrimonio',
        hint: 'Ley 2277 de 2022 · desde 72.000 UVT',
        answer: `Sólo pagás si tu patrimonio líquido al 1 de enero supera las ${PATRIMONIO_LEY_2277[1].desdeUvt.toLocaleString('es-CO')} UVT.`,
        yes: [
          `Base: patrimonio líquido (activos menos deudas) al 1 de enero del año`,
          `Exentas las primeras ${PATRIMONIO_LEY_2277[1].desdeUvt.toLocaleString('es-CO')} UVT (${cop(PATRIMONIO_LEY_2277[1].desdeUvt * UVT)})`,
          'Escala marginal por tramos: 0,5%, 1% y 1,5%, cada tramo sobre su propio excedente',
          'Las primeras 12.000 UVT del valor patrimonial de la casa de habitación se excluyen de la base',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tarifa es MARGINAL y por tramos: no se aplica el porcentaje del tramo más alto a todo el patrimonio. Si una calculadora hace eso, te está cobrando de más',
          'Es un impuesto anual y se declara aparte de la renta, en su propio formulario',
          'La escala de esta rama sale de los arts. 292-3 y 296-3 ET (Ley 2277/2022) y no de la tabla maestra del sitio: verificala antes de liquidar',
        ],
        plazo: 'se declara y paga en el calendario propio del impuesto al patrimonio, distinto del de renta.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en pesos colombianos. Cargá lo que corresponda a tu caso: el resultado se arma según la rama que elegiste arriba y los demás campos quedan a un lado.',
  fields: [
    {
      id: 'valor',
      label: 'Precio de venta, valor heredado o activos totales (COP)',
      prefix: '$',
      value: '450.000.000',
      thousands: true,
      help: 'Lo que recibiste: el precio de venta, el valor del bien que heredaste, o el total de tus activos si estás mirando el impuesto al patrimonio.',
    },
    {
      id: 'costo',
      label: 'Costo fiscal o deudas (COP)',
      prefix: '$',
      value: '260.000.000',
      thousands: true,
      help: 'En una venta: lo que te costó el bien más las mejoras con soporte. En patrimonio: tus deudas al 1 de enero. En herencia: los gastos del proceso sucesoral.',
    },
    {
      id: 'anios',
      label: 'Años que tuviste el bien',
      type: 'number',
      value: 6,
      min: 0,
      max: 80,
      step: 1,
      help: `Desde ${GO.aniosParaGananciaOcasional} años la utilidad es ganancia ocasional al ${(GO.tarifa * 100).toFixed(0)}%. Por debajo, tributa como renta ordinaria.`,
    },
    {
      id: 'reinvierte',
      label: '¿Reinvertís la plata en vivienda, AFC o hipoteca?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, va a otra vivienda, AFC o a pagar la hipoteca' },
        { value: 'no', label: 'No, la destino a otra cosa' },
      ],
      help: 'Condición del art. 311-1 ET para que la exención de vivienda aplique.',
    },
    {
      id: 'parentesco',
      label: 'Tu parentesco con quien te dejó la herencia',
      type: 'select',
      value: 'legitimario',
      options: [
        { value: 'vivienda-urbana', label: 'Heredo la vivienda urbana de habitación' },
        { value: 'rural', label: 'Heredo un inmueble rural' },
        { value: 'legitimario', label: 'Soy hijo, ascendiente o cónyuge (otros bienes)' },
        { value: 'otro', label: 'No soy legitimario ni cónyuge' },
      ],
      help: 'Define cuál de las exenciones del art. 307 ET te corresponde.',
    },
    {
      id: 'vivienda',
      label: 'Valor patrimonial de tu casa de habitación (COP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Sólo para el impuesto al patrimonio: se excluyen de la base las primeras 12.000 UVT de este valor. Dejalo en cero si no aplica.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué parte de lo que recibiste se queda la DIAN',
    caption:
      'Separa lo que nunca fue ganancia (el costo fiscal o las deudas), la parte de la ganancia que la ley exime y la porción que efectivamente tributa, con el impuesto que sale de ahí.',
  },
  breakdownTitle: 'La liquidación, línea por línea',
  breakdownIntro:
    'Primero se arma la base, después se restan las exenciones que te corresponden, y al final sale el impuesto y la tasa efectiva sobre lo que recibiste.',

  faq: [
    {
      q: '¿Cuánto se paga de impuesto por vender una casa en Colombia?',
      a: `El ${(GO.tarifa * 100).toFixed(0)}% de la utilidad, no del precio de venta, siempre que hayas tenido el inmueble ${GO.aniosParaGananciaOcasional} años o más (arts. 300 y 314 ET). La utilidad es el precio menos el costo fiscal. Y si era tu casa o apartamento de habitación y reinvertís la plata, las primeras ${GO.exencionViviendaUvt.toLocaleString('es-CO')} UVT de esa utilidad (${cop(GO.exencionViviendaUvt * UVT)}) quedan exentas por el art. 311-1. En la práctica, la mayoría de las ventas de vivienda de familia termina pagando cero.`,
    },
    {
      q: '¿Qué pasa si vendo antes de los dos años?',
      a: `Cambia todo, y para peor. Con menos de ${GO.aniosParaGananciaOcasional} años de posesión la utilidad deja de ser ganancia ocasional y entra como renta líquida ordinaria (art. 300 ET): se suma a tus demás ingresos y pasa por la tabla progresiva del art. 241, que llega al 39% marginal. Además perdés la exención de vivienda del art. 311-1, que sólo existe dentro del régimen de ganancia ocasional. Esperar unos meses puede valer decenas de millones.`,
    },
    {
      q: '¿Qué es el costo fiscal y por qué importa tanto?',
      a: 'Es lo que la DIAN reconoce que te costó el bien, y se resta del precio de venta para sacar la utilidad. Incluye lo que pagaste según la escritura, las mejoras y construcciones que puedas probar con facturas, y los reajustes fiscales que autoriza la ley. Importa porque es la única palanca real: cada peso de costo fiscal que puedas probar es un peso menos de utilidad gravada. Por eso conviene guardar facturas de remodelaciones durante años.',
    },
    {
      q: '¿Por qué el notario me retiene el 1% si todavía no sé cuánto voy a pagar?',
      a: `Porque es un anticipo, no el impuesto definitivo. Los arts. 398 a 401 del Estatuto Tributario obligan al notario a retener el ${(GO.retencionNotariaPn * 100).toFixed(0)}% del precio de venta cuando el vendedor es persona natural. Esa plata se acredita después contra la ganancia ocasional que liquides en tu declaración. Si la exención te deja en cero, la retención se convierte en saldo a favor y podés imputarla al año siguiente o pedir devolución.`,
    },
    {
      q: '¿Los herederos pagan impuesto de sucesión en Colombia?',
      a: `No existe un "impuesto de sucesión" como tal: lo que hay es ganancia ocasional del ${(GO.tarifa * 100).toFixed(0)}% sobre lo que recibe cada heredero (art. 302 ET), con las exenciones del art. 307. La vivienda urbana de habitación del causante está exenta hasta ${HERENCIA_ART307.viviendaUrbanaUvt.toLocaleString('es-CO')} UVT, los inmuebles rurales hasta ${HERENCIA_ART307.inmuebleRuralUvt.toLocaleString('es-CO')} UVT, y las demás asignaciones a legitimarios o al cónyuge hasta ${HERENCIA_ART307.legitimariosUvt.toLocaleString('es-CO')} UVT. A quien no es legitimario ni cónyuge le exime el ${(HERENCIA_ART307.otrosBeneficiariosPct * 100).toFixed(0)}% de lo recibido, con tope de ${HERENCIA_ART307.otrosBeneficiariosTopeUvt.toLocaleString('es-CO')} UVT.`,
    },
    {
      q: 'Somos tres hermanos. ¿La exención se reparte o cada uno tiene la suya?',
      a: 'Cada uno tiene la suya. Las exenciones del art. 307 se miden por beneficiario, no sobre la masa hereditaria completa. Tres hijos que heredan por partes iguales tienen cada uno su propio tope exento, lo que en la práctica multiplica por tres el monto que sale libre de impuesto. Es una de las razones por las que muchas sucesiones de familia terminan sin impuesto a cargo.',
    },
    {
      q: '¿Quién declara mientras la sucesión no se ha repartido?',
      a: 'La sucesión ilíquida, que es un contribuyente propio con su propio NIT mientras dure el proceso. Declara renta por los bienes y las rentas que producen, y lo hace el albacea, el curador o los herederos con administración de bienes. Recién cuando se ejecutoría la sentencia de partición o se firma la escritura, cada heredero incorpora lo suyo a su patrimonio y liquida su ganancia ocasional.',
    },
    {
      q: '¿Desde qué patrimonio se paga el impuesto al patrimonio?',
      a: `Desde ${PATRIMONIO_LEY_2277[1].desdeUvt.toLocaleString('es-CO')} UVT de patrimonio líquido al 1 de enero, o sea unos ${cop(PATRIMONIO_LEY_2277[1].desdeUvt * UVT)} con la UVT vigente. Patrimonio líquido es activos menos deudas, no activos a secas. Por debajo de ese umbral no pagás nada, aunque igual tengas que declarar renta. La Ley 2277 de 2022 lo volvió un impuesto permanente, no una sobretasa temporal como las anteriores.`,
    },
    {
      q: '¿La tarifa del impuesto al patrimonio se aplica a todo mi patrimonio?',
      a: `No, y este es el error más común. La escala es marginal: cada tramo se aplica sólo sobre la parte del patrimonio que cae dentro de ese tramo, más una adición fija. Alguien con 130.000 UVT de patrimonio no paga el 1% de todo: paga 0% sobre las primeras 72.000, 0,5% sobre el tramo que va hasta 122.000 y 1% sólo sobre las 8.000 UVT que sobran. Una calculadora que multiplique la tarifa del tramo por toda la base gravable te cobra varias veces de más.`,
    },
    {
      q: '¿La casa donde vivo entra en el impuesto al patrimonio?',
      a: 'Entra, pero con un alivio: las primeras 12.000 UVT del valor patrimonial de la casa o apartamento de habitación se excluyen de la base gravable. Es una exclusión pensada para que el impuesto no golpee a quien tiene un patrimonio alto simplemente porque su vivienda se valorizó. El resto del valor sí computa, igual que el de cualquier otro inmueble.',
    },
    {
      q: '¿Todavía existe el impuesto de timbre?',
      a: `La tarifa general del impuesto de timbre quedó en 0% con el desmonte gradual de la Ley 1111 de 2006, así que la enorme mayoría de los documentos no paga nada. Lo que sigue vivo es el gravamen sobre la escritura pública de enajenación de inmuebles cuando el valor supera las ${TIMBRE.umbralUvt.toLocaleString('es-CO')} UVT (${cop(TIMBRE.umbralUvt * UVT)}). Ojo con las calculadoras que hablan de tarifas del 1,5% o del 3% citando el Código de Comercio: el impuesto de timbre está en los arts. 514 a 554 del Estatuto Tributario y esas tarifas no existen.`,
    },
    {
      q: '¿Los premios de lotería pagan lo mismo?',
      a: `No: las loterías, rifas, apuestas y similares tienen su propia tarifa de ganancia ocasional, del ${(GO.tarifaLoterias * 100).toFixed(0)}% (art. 317 ET), en lugar del ${(GO.tarifa * 100).toFixed(0)}% general. Y la retención se practica en el momento del pago, así que el premio te llega ya neto. No hay exenciones equivalentes a las de vivienda o herencia.`,
    },
  ],

  sources: [
    {
      name: 'Estatuto Tributario, art. 300 — se determina por la diferencia entre el precio de enajenación y el costo fiscal',
      url: 'https://estatuto.co/300',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 302 — origen de las ganancias ocasionales por herencias y donaciones',
      url: 'https://estatuto.co/302',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 307 — ganancias ocasionales exentas',
      url: 'https://estatuto.co/307',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 311-1 — utilidad en la venta de la casa o apartamento de habitación',
      url: 'https://estatuto.co/311-1',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 314 — tarifa del impuesto de ganancias ocasionales',
      url: 'https://estatuto.co/314',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 317 — tarifa para loterías, rifas y apuestas',
      url: 'https://estatuto.co/317',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Ley 2277 de 2022 — reforma tributaria: impuesto al patrimonio y tarifa de ganancia ocasional',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=200960',
      publisher: 'Función Pública',
      date: '13-12-2022',
    },
    {
      name: 'Resolución DIAN 000238 del 15-12-2025 — valor de la UVT',
      url: 'https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.pdf',
      publisher: 'DIAN',
      date: '15-12-2025',
    },
  ],

  replaces: [
    '/co/calculadora-ganancia-ocasional-venta-casa-colombia',
    '/co/calculadora-impuesto-sucesiones-herencia-colombia-2026',
    '/co/calculadora-impuesto-patrimonio-colombia-personas-naturales-2026',
    '/co/calculadora-impuesto-timbre-nacional-colombia-2026',
    '/co/calculadora-tasa-impuesto-renta-fictop-paraisos-fiscales-colombia',
  ],

  lastReviewed: '2026-07-28',
};
