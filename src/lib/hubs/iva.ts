import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo discrimino el IVA?"
 * Arquetipo: RAMIFICADO (4 ramas). Absorbe 5 calculadoras sueltas (ver `replaces`).
 *
 * El error que este hub existe para matar: para sacar el IVA de un precio final
 * NO se resta el 21%, se DIVIDE por 1,21. Restar da un número distinto y más
 * chico, y esa diferencia se paga sola en cada factura mal armada.
 *
 * NOTA DE FORMATO: acá casi todo es plata, así que el default 'ars' del runtime
 * sirve. Las filas que NO son plata (alícuota, proporción sobre el total)
 * declaran su `format` explícito, porque el `Object.assign` del runtime hace
 * caer en pesos cualquier fila que lo omita.
 */
export const hub: HubData = {
  slug: 'impuestos/iva',
  title: '¿Cómo discrimino el IVA? — Calculadora de IVA 21%, 10,5% y por país 2026',
  description:
    'Sacá el IVA de un precio final, agregalo a un precio neto, aplicá la alícuota reducida del 10,5% o compará el IVA de los países de la región. Con la ley 23.349 aplicada y la advertencia que casi nadie hace: para sacar el IVA se divide por 1,21, no se resta el 21%.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Guía impositiva',
  h1: '¿Cómo discrimino el IVA?',
  lede:
    'Partimos del caso que más se busca: tenés un precio final con IVA incluido y querés saber cuánto es neto y cuánto es impuesto. Ojo con el atajo: no se resta el 21%, se divide por 1,21.',
  stamps: ['Actualizado 27-07-2026', 'Ley 23.349 (t.o. 1997) · ARCA', '5 calculadoras adentro'],

  resultLabel: 'IVA contenido en el precio',

  cases: {
    title: '¿Qué necesitás hacer con el IVA?',
    intro: 'Arrancamos por el caso más frecuente. Si el tuyo es otro, cambialo.',
    items: [
      {
        id: 'sacar',
        label: 'Sacar el IVA de un precio final',
        hint: 'El caso más común',
        answer: 'Se divide el precio final por 1,21: el resto es el IVA contenido.',
        yes: [
          'Neto = precio final ÷ 1,21 · IVA = precio final − neto',
          'El IVA contenido en un precio con 21% es el 17,3554% del total, no el 21%',
          'Sirve para armar una factura A partiendo del precio de mostrador (que va con IVA incluido)',
          'Si sos responsable inscripto, ese IVA es crédito fiscal computable en tu DDJJ mensual',
          'La factura B y la C llevan el precio final: el IVA está adentro pero no se discrimina',
        ],
        warn: [
          'RESTAR el 21% al precio final da un número más chico y MAL: sobre $121.000, restar da $95.590 y dividir da $100.000',
          'El precio de góndola al consumidor final debe exhibirse con IVA incluido (ley 22.802 y resolución 4/2024)',
          'Percepciones de IVA (RG 2408, RG 3337) y de IIBB no son IVA: van en renglones aparte de la factura',
          'Si la operación tiene alícuota reducida, dividir por 1,21 sobrefactura el impuesto',
        ],
        plazo:
          'la DDJJ de IVA (F.2051 / F.731) vence entre el 18 y el 22 del mes siguiente, según la terminación de tu CUIT.',
      },
      {
        id: 'agregar',
        label: 'Agregar IVA a un precio neto',
        hint: 'Armar el precio de venta',
        answer: 'Se multiplica el neto por 1,21: el IVA es el 21% del neto.',
        yes: [
          'Total = neto × 1,21 · IVA = neto × 0,21',
          'Acá sí el IVA es exactamente el 21% de la base: la base es el neto, no el total',
          'El débito fiscal que vas a declarar es este IVA, aunque el cliente todavía no te haya pagado',
          'A un consumidor final le mostrás sólo el total; a un responsable inscripto le discriminás las tres líneas',
        ],
        warn: [
          'Ese IVA no es tuyo: lo cobrás por cuenta del fisco y lo ingresás en la DDJJ del mes',
          'El IVA se devenga con la entrega del bien o la finalización del servicio, no con el cobro',
          'Si además corresponden percepciones o IIBB, van después del IVA y no forman parte de su base',
        ],
        plazo: 'la factura electrónica debe emitirse en el momento de la entrega o dentro de los plazos de la RG 1415.',
      },
      {
        id: 'reducida',
        label: 'Alícuota reducida del 10,5%',
        hint: 'Ley 23.349 art. 28',
        answer: 'Con el 10,5% se divide por 1,105, no por 1,21.',
        yes: [
          'Van al 10,5% la carne, las frutas, verduras y legumbres frescas, el pan común, la harina de trigo y la leche con aditivos',
          'También los intereses de préstamos bancarios, las obras sobre inmueble ajeno destinadas a vivienda y las ventas de bienes de capital',
          'Además, el transporte de pasajeros de más de 100 km y la medicina prepaga',
          'Neto = precio final ÷ 1,105 · el IVA contenido es el 9,5023% del total',
        ],
        warn: [
          'La alícuota depende del BIEN, no del vendedor: un mismo comercio puede facturar al 21% y al 10,5% en el mismo ticket',
          'Los servicios públicos con medidor a responsables inscriptos van al 27%, no al 21%',
          'La leche fluida sin aditivos a consumidor final está EXENTA, no al 10,5%',
          'Aplicar 10,5% donde corresponde 21% deja diferencia de impuesto con intereses y multa',
        ],
        plazo:
          'las alícuotas del art. 28 se modifican por ley o por decreto del PEN: revisá antes de facturar un rubro nuevo.',
      },
      {
        id: 'paises',
        label: 'IVA en otros países de la región',
        hint: 'Del 7% de Panamá al 22% de Uruguay',
        answer: 'Cambia el nombre y el número, pero la cuenta es la misma: dividir por 1 + la alícuota.',
        yes: [
          'Argentina 21%, Uruguay 22%, Colombia y Chile 19%, Perú 18% (IGV), Brasil ~17% (ICMS promedio)',
          'México 16% general y 8% en la franja fronteriza norte y sur (estímulo fiscal del SAT)',
          'Ecuador 15%, Bolivia 13%, Costa Rica 13%, Guatemala 12%, Paraguay 10%, Panamá 7% (ITBMS)',
          'República Dominicana 18% (ITBIS), Honduras 15% (ISV), Nicaragua y El Salvador 13-15%',
          'En todos, el impuesto contenido en el precio final es alícuota ÷ (100 + alícuota)',
        ],
        warn: [
          'El nombre cambia: IGV en Perú, ITBMS en Panamá, ITBIS en Dominicana, ISV en Honduras, ICMS en Brasil',
          'El ICMS brasileño es estadual: el 17% es un promedio, cada estado fija el suyo',
          'La tasa 8% de la frontera mexicana exige domicilio fiscal en los municipios listados por el SAT',
          'Casi todos los países tienen alícuotas reducidas y exenciones propias que este cálculo no contempla',
        ],
        plazo: 'las alícuotas regionales se revisan con cada reforma tributaria: verificá con la autoridad fiscal local.',
      },
    ],
  },

  inputsTitle: 'Completá el monto',
  inputsIntro:
    'Poné el importe que tenés a mano. La alícuota se usa en las dos primeras ramas; el país, sólo en la última.',
  fields: [
    {
      id: 'monto',
      label: 'Monto',
      prefix: '$',
      value: '121.000',
      thousands: true,
      help: 'Precio final con IVA en la rama de "sacar"; precio neto en la de "agregar".',
    },
    {
      id: 'alicuota',
      label: 'Alícuota de IVA',
      type: 'select',
      value: '21',
      options: [
        { value: '21', label: '21% — general' },
        { value: '10.5', label: '10,5% — reducida (art. 28)' },
        { value: '27', label: '27% — servicios públicos a RI' },
        { value: '2.5', label: '2,5% — diarios y revistas' },
      ],
    },
    {
      id: 'pais',
      label: 'País (sólo para la rama regional)',
      type: 'select',
      value: 'argentina',
      options: [
        { value: 'argentina', label: 'Argentina — IVA 21%' },
        { value: 'uruguay', label: 'Uruguay — IVA 22%' },
        { value: 'colombia', label: 'Colombia — IVA 19%' },
        { value: 'chile', label: 'Chile — IVA 19%' },
        { value: 'peru', label: 'Perú — IGV 18%' },
        { value: 'republica-dominicana', label: 'Rep. Dominicana — ITBIS 18%' },
        { value: 'brasil', label: 'Brasil — ICMS 17% (promedio)' },
        { value: 'mexico', label: 'México — IVA 16%' },
        { value: 'mexico-frontera', label: 'México, franja fronteriza — IVA 8%' },
        { value: 'ecuador', label: 'Ecuador — IVA 15%' },
        { value: 'honduras', label: 'Honduras — ISV 15%' },
        { value: 'nicaragua', label: 'Nicaragua — IVA 15%' },
        { value: 'bolivia', label: 'Bolivia — IVA 13%' },
        { value: 'costa-rica', label: 'Costa Rica — IVA 13%' },
        { value: 'el-salvador', label: 'El Salvador — IVA 13%' },
        { value: 'guatemala', label: 'Guatemala — IVA 12%' },
        { value: 'paraguay', label: 'Paraguay — IVA 10%' },
        { value: 'panama', label: 'Panamá — ITBMS 7%' },
      ],
    },
  ],
  fineprint:
    'Estimación sobre operaciones gravadas. No contempla exenciones, operaciones no alcanzadas, percepciones, retenciones ni regímenes especiales. Para la DDJJ mandan tus libros IVA compras y ventas.',

  chart: {
    type: 'stacked',
    title: 'Cuánto del precio es impuesto',
    caption:
      'La barra parte el precio final en dos: lo que se queda el vendedor (el neto gravado) y lo que va al fisco (el IVA). Con el 21%, el impuesto es el 17,36% del precio final, no el 21%: ese 21% se calcula sobre el neto, que es más chico que el total.',
  },
  breakdownTitle: 'Cómo se parte el precio',
  breakdownIntro:
    'Las barras comparan cada renglón con el más grande. La fila del error clásico está a propósito: es para que veas la diferencia contra la cuenta bien hecha.',

  faq: [
    {
      q: '¿Cómo se saca el IVA de un precio con IVA incluido?',
      a: 'Dividiendo el precio final por 1 más la alícuota. Con 21%: neto = precio ÷ 1,21, y el IVA es la diferencia. Sobre $121.000 el neto es $100.000 y el IVA $21.000. Con la alícuota reducida del 10,5% se divide por 1,105 y con la del 27%, por 1,27.',
    },
    {
      q: '¿Por qué no se resta el 21% para sacar el IVA?',
      a: 'Porque el 21% está calculado sobre el neto, no sobre el total. Si a $121.000 le restás el 21% obtenés $95.590, un neto falso: la prueba es que $95.590 × 1,21 da $115.663,90 y no los $121.000 de los que partiste. La cuenta correcta es dividir por 1,21, que devuelve exactamente $100.000. Es el error más caro y más repetido de la facturación: sobre el precio final, el IVA del 21% representa el 17,3554%.',
    },
    {
      q: '¿Qué porcentaje del precio final es IVA?',
      a: 'Se calcula como alícuota ÷ (100 + alícuota). Con 21% el IVA es el 17,3554% del precio final; con 10,5%, el 9,5023%; con 27%, el 21,2598%; y con 19% (Colombia, Chile) el 15,9664%. Ese porcentaje es el que hay que aplicar sobre el total si querés el impuesto de una sola cuenta.',
    },
    {
      q: '¿Cómo agrego IVA a un precio neto?',
      a: 'Multiplicando por 1 más la alícuota: total = neto × 1,21. El IVA es neto × 0,21. Sobre un neto de $100.000, el IVA es $21.000 y el total $121.000. Acá el 21% sí se aplica directo, porque la base es el neto. Es la operación inversa exacta de "sacar el IVA".',
    },
    {
      q: '¿Qué productos tienen IVA al 10,5% en Argentina?',
      a: 'El art. 28 de la ley 23.349 lista, entre otros, carnes, frutas, verduras y legumbres frescas, pan común, harina de trigo, leche con aditivos, miel, granos y bienes de capital. También aplica a intereses de préstamos bancarios, obras sobre inmueble ajeno destinadas a vivienda, transporte de pasajeros de más de 100 km y medicina prepaga. La alícuota depende del bien o servicio, no de quién lo vende.',
    },
    {
      q: '¿Cuándo se aplica el 27% de IVA?',
      a: 'A ventas de gas, energía eléctrica, agua reguladas por medidor y a servicios de telecomunicaciones, cuando el comprador es responsable inscripto, monotributista o exento y el consumo no es de vivienda. Si el destinatario es consumidor final, esos mismos servicios van al 21%. Está en el tercer párrafo del art. 28.',
    },
    {
      q: '¿Qué diferencia hay entre exento, no gravado y tasa cero?',
      a: 'Exento es un bien alcanzado por el impuesto que la ley libera (libros, leche fluida a consumidor final, servicios educativos): no se factura IVA y el crédito fiscal de sus insumos no se computa. No gravado es lo que directamente queda fuera del objeto del impuesto. Tasa cero se factura con IVA del 0% pero conserva el crédito fiscal, y es lo que se aplica a las exportaciones, que además pueden pedir el recupero.',
    },
    {
      q: '¿Cómo sé si me queda saldo a favor de IVA?',
      a: 'Comparando débito contra crédito del período: débito fiscal (IVA de tus ventas) menos crédito fiscal (IVA de tus compras). Si el débito es mayor, la diferencia se ingresa; si el crédito es mayor, queda saldo técnico a favor, que se arrastra a los períodos siguientes y sólo se computa contra IVA, no contra otros impuestos ni se devuelve en efectivo. El saldo de libre disponibilidad —el que viene de retenciones y percepciones sufridas— sí se puede compensar con otros gravámenes o pedir su devolución.',
    },
    {
      q: '¿Las percepciones de IVA son IVA?',
      a: 'No. Son pagos a cuenta que un agente de percepción te suma en la factura (RG 2408, RG 3337 y otras) y que después descontás en tu DDJJ. Van en un renglón separado, no integran la base del IVA ni se calculan dividiendo por 1,21. Si las mezclás con el IVA discriminado, la factura queda mal armada y el crédito fiscal declarado, inflado.',
    },
    {
      q: '¿Cuál es el IVA en los países de la región?',
      a: 'Uruguay 22%, Argentina 21%, Colombia y Chile 19%, Perú 18% (IGV), República Dominicana 18% (ITBIS), Brasil alrededor de 17% de ICMS promedio estadual, México 16% (8% en la franja fronteriza), Ecuador, Honduras y Nicaragua 15%, Bolivia, Costa Rica y El Salvador 13%, Guatemala 12%, Paraguay 10% y Panamá 7% (ITBMS). En todos, para sacar el impuesto de un precio final se divide por 1 más la alícuota.',
    },
    {
      q: '¿Cuándo vence la declaración jurada de IVA?',
      a: 'Es mensual y vence entre el 18 y el 22 del mes siguiente al período, según la terminación del CUIT, con el F.2051 (Libro IVA Digital) y el F.731 o F.810 según el contribuyente. Los monotributistas no presentan DDJJ de IVA: el impuesto ya está dentro de la cuota mensual del régimen simplificado.',
    },
  ],

  sources: [
    {
      name: 'Ley 23.349 — Impuesto al Valor Agregado (texto ordenado 1997, art. 28: alícuotas)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/42701/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Decreto 692/1998 — reglamentación de la ley de IVA',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/50000-54999/51559/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'IVA — información general, alícuotas y vencimientos',
      url: 'https://www.afip.gob.ar/iva/',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Libro IVA Digital — RG 4597 y presentación del F.2051',
      url: 'https://www.afip.gob.ar/libro-iva-digital/',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Estímulos fiscales región fronteriza norte y sur — IVA 8%',
      url: 'https://www.sat.gob.mx/consultas/61729/conoce-los-estimulos-fiscales-de-la-region-fronteriza',
      publisher: 'SAT (México)',
    },
  ],

  replaces: [
    '/calculadora-iva-incluido-neto-discriminar',
    '/calculadora-iva-agregar-discriminar',
    '/calculadora-iva-paises-latinoamerica',
    '/calculadora-iva-saldo-favor-contra-ri',
    '/calculadora-iva-mexico-frontera-norte-sur-8-vs-16-comparador',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Alícuotas regionales. Salen de los JSON de las calcs que este hub absorbe
 * (iva-paises-latam.json y el comparador de la frontera mexicana), no de
 * memoria. `impuesto` es el nombre local del gravamen.
 */
export const PAISES: Record<string, { nombre: string; alicuota: number; impuesto: string; moneda: string; nota?: string }> = {
  argentina: { nombre: 'Argentina', alicuota: 21, impuesto: 'IVA', moneda: 'ARS' },
  uruguay: { nombre: 'Uruguay', alicuota: 22, impuesto: 'IVA', moneda: 'UYU' },
  colombia: { nombre: 'Colombia', alicuota: 19, impuesto: 'IVA', moneda: 'COP' },
  chile: { nombre: 'Chile', alicuota: 19, impuesto: 'IVA', moneda: 'CLP' },
  peru: { nombre: 'Perú', alicuota: 18, impuesto: 'IGV', moneda: 'PEN' },
  'republica-dominicana': { nombre: 'República Dominicana', alicuota: 18, impuesto: 'ITBIS', moneda: 'DOP' },
  brasil: { nombre: 'Brasil', alicuota: 17, impuesto: 'ICMS', moneda: 'BRL', nota: 'promedio estadual: cada estado fija su propia alícuota' },
  mexico: { nombre: 'México', alicuota: 16, impuesto: 'IVA', moneda: 'MXN' },
  'mexico-frontera': {
    nombre: 'México (franja fronteriza)',
    alicuota: 8,
    impuesto: 'IVA',
    moneda: 'MXN',
    nota: 'estímulo fiscal del SAT: exige domicilio fiscal en los municipios fronterizos listados',
  },
  ecuador: { nombre: 'Ecuador', alicuota: 15, impuesto: 'IVA', moneda: 'USD' },
  honduras: { nombre: 'Honduras', alicuota: 15, impuesto: 'ISV', moneda: 'HNL' },
  nicaragua: { nombre: 'Nicaragua', alicuota: 15, impuesto: 'IVA', moneda: 'NIO' },
  bolivia: { nombre: 'Bolivia', alicuota: 13, impuesto: 'IVA', moneda: 'BOB' },
  'costa-rica': { nombre: 'Costa Rica', alicuota: 13, impuesto: 'IVA', moneda: 'CRC' },
  'el-salvador': { nombre: 'El Salvador', alicuota: 13, impuesto: 'IVA', moneda: 'USD' },
  guatemala: { nombre: 'Guatemala', alicuota: 12, impuesto: 'IVA', moneda: 'GTQ' },
  paraguay: { nombre: 'Paraguay', alicuota: 10, impuesto: 'IVA', moneda: 'PYG' },
  panama: { nombre: 'Panamá', alicuota: 7, impuesto: 'ITBMS', moneda: 'PAB/USD' },
};

/** Parámetros de cada rama. */
export const CASE_MATH: Record<
  string,
  { modo: 'sacar' | 'agregar'; alicuotaFija?: number; usaPais?: boolean; norma: string }
> = {
  sacar: { modo: 'sacar', norma: 'Art. 28' },
  agregar: { modo: 'agregar', norma: 'Art. 28' },
  reducida: { modo: 'sacar', alicuotaFija: 10.5, norma: 'Art. 28 inc. a' },
  paises: { modo: 'sacar', usaPais: true, norma: 'Fisco local' },
};

/** Alícuota general argentina, para las comparaciones. */
export const ALICUOTA_GENERAL = 21;
