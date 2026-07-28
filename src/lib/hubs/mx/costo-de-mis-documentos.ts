import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto me cuesta sacar o renovar mis documentos?"
 *
 * Fusiona las calculadoras de trámites de identidad: pasaporte (con la tabla de
 * derechos de la SRE y sus descuentos), licencia de conducir (que es estatal, así
 * que los importes van editables) y credencial del INE. El generador de homoclave
 * del RFC se absorbe sólo por URL: es una herramienta de una función, no una
 * decisión con costo.
 *
 * Derechos del pasaporte desde la fuente única src/lib/data/mexico-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Derechos del pasaporte mexicano (SRE, Ley Federal de Derechos vigente). */
export const PASAPORTE_MX = MEXICO_2026.pasaporte;

export const hub: HubData = {
  slug: 'mx/tramites/costo-de-mis-documentos',
  title: 'Cuánto cuesta el pasaporte, la licencia y la credencial del INE en México',
  description:
    'Compara los derechos del pasaporte mexicano por vigencia de 3, 6 y 10 años con sus descuentos, calcula lo que te cobra tu estado por la licencia de conducir y revisa qué se paga y qué no por la credencial del INE.',
  silo: 'Trámites',
  siloHref: '/mx/tramites',

  eyebrow: 'México · documentos de identidad',
  h1: '¿Cuánto me cuesta sacar o renovar mis documentos?',
  lede:
    'El pasaporte tiene una tarifa federal fija por vigencia, la licencia de conducir la fija cada estado y la credencial del INE no se paga. Elige el trámite y te decimos el costo por año de vigencia, que es lo que realmente conviene comparar.',
  stamps: [
    'Derechos del pasaporte · SRE',
    'Licencia · tarifa estatal',
    'Credencial del INE · sin costo',
    '4 calculadoras fusionadas',
  ],

  resultLabel: 'Costo del trámite',

  cases: {
    title: '¿Qué trámite necesitas?',
    intro: 'Empezamos por el pasaporte, donde la decisión real es qué vigencia te conviene pagar.',
    items: [
      {
        id: 'pasaporte',
        label: 'Pasaporte mexicano',
        hint: 'Vigencias de 3, 6 y 10 años, con descuentos y trámite de emergencia.',
        yes: [
          'Derechos que cobra la SRE según la vigencia que elijas',
          'Descuento para personas de 60 años o más, con discapacidad y trabajadores agrícolas temporales a Canadá',
          'Recargo del trámite de emergencia',
          'Costo por año de vigencia, que es la comparación que de verdad importa',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La vigencia de 10 años solo está disponible para mayores de edad',
          'Los derechos los actualiza cada año la Ley Federal de Derechos: verifica el importe vigente antes de pagar',
          'El pago de derechos no incluye el costo de las fotografías ni de las copias, y no se reembolsa si no te presentas a la cita',
        ],
        plazo: 'la cita se agenda en línea y el pasaporte se entrega el mismo día del trámite en la mayoría de las delegaciones.',
        answer:
          'A mayor vigencia, mayor pago inicial pero menor costo por año: el de 10 años suele ser el más barato por año.',
      },
      {
        id: 'licencia',
        label: 'Licencia de conducir',
        hint: 'La fija cada estado: importes editables porque no hay tarifa nacional.',
        yes: [
          'Costo total del trámite sumando derechos, examen médico y gastos adicionales',
          'Costo por año según la vigencia que ofrezca tu estado',
          'Comparación entre las vigencias disponibles',
        ],
        warn: [
          DISCLAIMER_TAX,
          'No existe una tarifa nacional: cada entidad fija su propio importe y sus propias vigencias, por eso los campos son editables',
          'Varios estados exigen examen médico o teórico como requisito previo, y ese costo va aparte',
          'La licencia permanente volvió en algunas entidades y desapareció en otras: confirma qué opciones tiene la tuya',
        ],
        plazo: 'la renovación conviene hacerla antes del vencimiento: manejar con licencia vencida es infracción.',
        answer:
          'El costo depende de tu estado; lo que se compara es el precio por año de vigencia, no el total.',
      },
      {
        id: 'ine',
        label: 'Credencial para votar (INE)',
        hint: 'El trámite es gratuito: lo que cuesta es el tiempo y los requisitos.',
        yes: [
          'Confirmación de que el trámite no tiene costo, en ninguna de sus modalidades',
          'Lo que sí puede costarte: comprobantes, traslados y tiempo de espera',
          'Cuándo conviene renovarla para no quedarte sin identificación vigente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La credencial es gratuita: nadie puede cobrarte por tramitarla ni por “apartar” una cita',
          'Una credencial vencida deja de servir como identificación oficial para trámites bancarios y notariales',
          'La entrega no es inmediata: hay que volver por ella al módulo dentro del plazo, o se cancela',
        ],
        plazo: 'la credencial vence el 31 de diciembre del año que indica al frente.',
        answer: 'El trámite del INE es gratuito en todas sus modalidades: alta, reposición y renovación.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro: 'Los importes de la licencia son editables porque los fija tu estado, no la federación.',
  fields: [
    {
      id: 'vigencia',
      label: 'Vigencia del pasaporte',
      type: 'select',
      value: '10',
      options: [
        { value: '3', label: '3 años' },
        { value: '6', label: '6 años' },
        { value: '10', label: '10 años (solo mayores de edad)' },
      ],
      help: 'A más años, menor costo por año.',
    },
    {
      id: 'descuento',
      label: '¿Tienes derecho a descuento?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí (60 años o más, discapacidad, trabajador agrícola a Canadá)' },
      ],
      help: 'El descuento aplica sobre los derechos del pasaporte.',
    },
    {
      id: 'emergencia',
      label: '¿Trámite de emergencia?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'El trámite de emergencia tiene un recargo sobre los derechos.',
    },
    {
      id: 'costoLicencia',
      label: 'Derechos de la licencia en tu estado (MXN)',
      prefix: '$',
      value: 1000,
      thousands: true,
      help: 'Búscalo en la tesorería o el portal de movilidad de tu estado.',
    },
    {
      id: 'costoExamen',
      label: 'Examen médico o teórico (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Varios estados lo cobran aparte.',
    },
    {
      id: 'costoExtra',
      label: 'Otros gastos del trámite (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Fotografías, copias, gestoría o traslado.',
    },
    {
      id: 'vigenciaLicencia',
      label: 'Vigencia de la licencia (años)',
      type: 'number',
      value: 3,
      min: 1,
      max: 20,
      step: 1,
      help: 'Va de 1 a 10 años según el estado; algunas entidades ofrecen permanente.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'bars',
    title: 'Costo por año de vigencia',
    caption: 'Compara cuánto te cuesta cada año de validez del documento, que es lo que decide qué opción conviene.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Qué vigencia de pasaporte conviene?',
      a: 'Casi siempre la más larga, porque el costo por año baja a medida que sube la vigencia. La de 10 años solo está disponible para mayores de edad, así que para menores la decisión se reduce entre 3 y 6 años, y ahí también suele salir mejor la de 6 salvo que el rostro del menor vaya a cambiar mucho.',
    },
    {
      q: '¿Quién tiene descuento en el pasaporte?',
      a: 'Las personas de 60 años o más, las personas con discapacidad y los trabajadores agrícolas temporales que viajan a Canadá bajo el programa correspondiente. El descuento se aplica sobre los derechos y hay que acreditarlo en el momento del trámite con la documentación que pide la SRE.',
    },
    {
      q: '¿Cuánto cuesta el trámite de emergencia?',
      a: 'Tiene un recargo sobre los derechos normales y está pensado para casos de urgencia comprobable, como una emergencia médica o el fallecimiento de un familiar en el extranjero. No es una vía para saltarse la fila por falta de previsión: la SRE pide justificar el motivo.',
    },
    {
      q: '¿Cuánto cuesta la licencia de conducir en México?',
      a: 'No hay una respuesta nacional: la licencia es un trámite estatal y cada entidad fija su propio importe, sus vigencias y sus requisitos. Por eso esta calculadora te deja capturar el importe de tu estado en lugar de mostrarte una cifra que sería falsa para casi todos.',
    },
    {
      q: '¿Qué pasa si manejo con la licencia vencida?',
      a: 'Es una infracción de tránsito y, según la entidad, puede implicar multa y hasta remisión del vehículo al corralón. Además, algunas aseguradoras revisan la vigencia de la licencia al momento del siniestro, así que conducir vencido puede complicarte el cobro de la póliza.',
    },
    {
      q: '¿Cuánto cuesta la credencial del INE?',
      a: 'Nada. El trámite es gratuito en todas sus modalidades: primera vez, renovación, reposición por robo o extravío y corrección de datos. Nadie está autorizado a cobrarte por tramitarla ni por conseguirte una cita: si te lo piden, es un fraude.',
    },
    {
      q: '¿Cuándo vence mi credencial del INE?',
      a: 'El 31 de diciembre del año que aparece impreso al frente. Conviene renovarla con anticipación, porque una credencial vencida deja de ser válida como identificación oficial para bancos, notarías y trámites de gobierno, aunque tus datos sigan siendo correctos.',
    },
    {
      q: '¿Necesito el pasaporte vigente para sacar la visa?',
      a: 'Sí: el pasaporte es requisito previo y la visa se estampa en él, así que primero se tramita el pasaporte. Además conviene que le quede vigencia holgada, porque varias visas no pueden exceder la vigencia del pasaporte que las contiene.',
    },
    {
      q: '¿Sirve la credencial del INE como identificación en el extranjero?',
      a: 'No para cruzar fronteras. Fuera de México el documento de identidad válido es el pasaporte; la credencial sirve como identificación interna y, en algunos consulados, como apoyo documental. Para viajar hay que llevar pasaporte vigente.',
    },
    {
      q: '¿Puedo tramitar todo el mismo día?',
      a: 'El pasaporte se entrega normalmente el mismo día de la cita, la licencia depende de tu estado y suele entregarse en el momento, y la credencial del INE no: hay que volver al módulo por ella dentro del plazo que te indiquen, o el trámite se cancela y hay que repetirlo.',
    },
  ],

  sources: [
    {
      name: 'Secretaría de Relaciones Exteriores — pasaporte mexicano y costos',
      url: 'https://www.gob.mx/pasaporte',
      publisher: 'SRE',
    },
    {
      name: 'Ley Federal de Derechos — derechos por expedición de pasaporte',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lfd.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'INE — trámite de la credencial para votar',
      url: 'https://www.ine.mx/credencial/',
      publisher: 'Instituto Nacional Electoral',
    },
  ],

  replaces: [
    '/calculadora-costo-pasaporte-mexicano-2026',
    '/calculadora-ine-renovacion-costo',
    '/calculadora-costo-licencia-conducir-mexico-por-estado',
    '/calculadora-rfc-homoclave-persona-fisica-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
