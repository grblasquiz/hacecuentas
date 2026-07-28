import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuándo me toca la VTV y cuánto me sale?"
 *
 * Arquetipo RAMIFICADO: la respuesta cambia según qué vehículo tenés y en qué
 * estado está el certificado, así que la situación se elige en `cases`.
 *
 * Absorbe 3 calculadoras sueltas (ver hub.replaces):
 *  - costo por provincia y tipo de vehículo
 *  - vigencia en meses de la revisión nacional de ruta (RTO)
 *  - vencimiento y turno de la VTV provincial
 *
 * NOTAS DE CONTRATO:
 *  - El número grande es plata (el costo), así que el default 'ars' sirve.
 *  - Años, meses y porcentajes NO son plata: esas filas declaran `format:'unit'`
 *    o `format:'plain'`. El runtime hace Object.assign y una fila sin `format`
 *    propio cae a pesos.
 *  - El gráfico es `progress`: marca en qué punto del ciclo de vigencia estás.
 *    Por eso compute() devuelve `position` (0-100) y `positionLabel`.
 */

/** Disclaimer YMYL (dominio legal) — src/lib/disclaimers.ts, getCalculatorDisclaimer. */
export const DISCLAIMER =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

export const hub: HubData = {
  slug: 'auto/vtv',
  title: '¿Cuándo me toca la VTV y cuánto me sale? — Vencimiento, vigencia y costo',
  description:
    'Calculá cuándo vence tu VTV según la antigüedad del vehículo y la última revisión, cuántos meses dura el certificado y cuánto cuesta en tu provincia. Auto, moto, pickup, camión y revisión nacional de ruta (RTO).',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Guía y estimación del trámite',
  h1: '¿Cuándo me toca la VTV y cuánto me sale?',
  lede:
    'La respuesta depende de tres cosas: los años que tiene el vehículo, cuándo fue la última revisión y en qué provincia la hacés. Partimos del caso más común —un auto particular usado con el certificado al día— y lo ajustás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Tarifas orientativas por provincia', '3 calculadoras adentro'],

  resultLabel: 'Lo que te va a salir la VTV',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'usado-al-dia',
        label: 'Auto particular usado, con la VTV al día',
        hint: 'El caso más común',
        answer:
          'Con el certificado vigente, el próximo vencimiento cae a los 12 meses de la última revisión, o a los 6 si el auto pasó los 7 años.',
        yes: [
          'Antigüedad del vehículo contada por año de patentamiento',
          'Vigencia de 12 meses hasta los 7 años de antigüedad',
          'Vigencia de 6 meses a partir de los 8 años',
          'Tarifa de la provincia donde hacés la revisión',
        ],
        warn: [
          DISCLAIMER,
          'La tarifa es orientativa y se actualiza seguido: confirmá el importe vigente en la planta antes de ir',
          'La vigencia se cuenta desde la revisión anterior, no desde que sacás el turno',
        ],
        plazo: 'sacá turno con 3 o 4 semanas de anticipación: en los meses pico las plantas se llenan.',
      },
      {
        id: 'nuevo',
        label: 'El auto es nuevo o casi',
        hint: 'Menos de 2 años',
        answer: 'Un vehículo con menos de 2 años de antigüedad todavía está exento: no le corresponde VTV.',
        yes: [
          'Exención mientras la antigüedad sea menor a 2 años',
          'La primera revisión se cuenta desde el patentamiento, no desde la compra',
        ],
        warn: [
          DISCLAIMER,
          'Estar exento no te exime del resto: seguro vigente, patente al día y cédula en el vehículo',
          'Al cumplirse los 2 años la exención se corta sin aviso: anotate la fecha',
        ],
        plazo: 'la primera VTV te toca al cumplir 2 años desde el patentamiento.',
      },
      {
        id: 'vencida',
        label: 'La tengo vencida o nunca se la hice',
        hint: 'Sin certificado válido',
        answer: 'Sin certificado vigente hay que hacerla ya: circular sin VTV habilita multa y retención del vehículo.',
        yes: [
          'Tarifa de la provincia y el tipo de vehículo que declarás',
          'La vigencia nueva arranca desde la revisión que hagas, no desde el vencimiento viejo',
        ],
        warn: [
          DISCLAIMER,
          'Circular con la VTV vencida expone a multa e impedimento de circulación',
          'Si el vehículo no pasa la revisión, la reinspección tiene plazo acotado y suele cobrarse aparte',
          'Un siniestro con la VTV vencida le da al seguro un argumento para discutir la cobertura',
        ],
        plazo: 'no esperes: pedí el primer turno disponible y evitá circular hasta tenerla.',
      },
      {
        id: 'moto-otro',
        label: 'Es una moto, una pickup o un camión',
        hint: 'Otra categoría',
        answer: 'La periodicidad es la misma que la del auto, pero la tarifa cambia según la categoría del vehículo.',
        yes: [
          'Misma regla de vigencia por antigüedad que un auto particular',
          'Tarifa ajustada por categoría: la moto paga la mitad, la pickup un 30% más y el camión el doble',
        ],
        warn: [
          DISCLAIMER,
          'No todas las plantas atienden motos ni vehículos pesados: verificá antes de sacar turno',
          'En vehículos de carga suelen exigirse además controles de frenos y de emisiones específicos',
        ],
        plazo: 'confirmá en la planta que atienden tu categoría antes de reservar.',
      },
      {
        id: 'ruta-rto',
        label: 'Es la revisión nacional de ruta (RTO)',
        hint: 'Transporte interjurisdiccional',
        answer:
          'En la revisión nacional la vigencia es más larga al principio: 36 meses hasta los 4 años, 12 meses hasta los 9 y 6 meses de ahí en adelante.',
        yes: [
          'Vigencia de 36 meses mientras el vehículo tenga hasta 4 años',
          'Vigencia de 12 meses entre los 5 y los 9 años',
          'Vigencia de 6 meses a partir de los 10 años',
        ],
        warn: [
          DISCLAIMER,
          'La revisión nacional de ruta y la VTV provincial son trámites distintos: una no reemplaza a la otra',
          'La antigüedad se cuenta por año modelo, así que el vehículo cambia de tramo el 1 de enero',
        ],
        plazo: 'la oblea de la revisión nacional se controla en ruta: llevala siempre en el vehículo.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu vehículo',
  inputsIntro: 'Con la provincia, el tipo y el año de patentamiento ya tenés el número. La última revisión afina la fecha.',
  fields: [
    {
      id: 'provincia',
      label: 'Provincia donde hacés la revisión',
      type: 'select',
      value: 'pba',
      options: [
        { value: 'caba', label: 'Ciudad de Buenos Aires' },
        { value: 'pba', label: 'Provincia de Buenos Aires' },
        { value: 'cba', label: 'Córdoba' },
        { value: 'sfe', label: 'Santa Fe' },
        { value: 'otras', label: 'Otra provincia' },
      ],
      help: 'Las tarifas son orientativas: cada jurisdicción las actualiza por separado.',
    },
    {
      id: 'tipo',
      label: 'Tipo de vehículo',
      type: 'select',
      value: 'auto',
      options: [
        { value: 'auto', label: 'Auto particular' },
        { value: 'moto', label: 'Moto (paga la mitad)' },
        { value: 'pickup', label: 'Pickup o camioneta (30% más)' },
        { value: 'camion', label: 'Camión (el doble)' },
      ],
    },
    {
      id: 'anioPatentamiento',
      label: 'Año de patentamiento',
      type: 'number',
      min: 1990,
      max: 2100,
      step: 1,
      value: 2018,
      help: 'Es el año que figura en la cédula, no el año en que lo compraste.',
    },
    {
      id: 'mesUltima',
      label: 'Mes de la última revisión',
      type: 'select',
      value: '3',
      options: [
        { value: '0', label: 'No tengo revisión previa' },
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
      ],
    },
    {
      id: 'anioUltima',
      label: 'Año de la última revisión',
      type: 'number',
      min: 1990,
      max: 2100,
      step: 1,
      value: 2025,
      help: 'Está impreso en la oblea y en el comprobante de la planta.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'progress',
    title: 'Dónde estás dentro de la vigencia del certificado',
    caption:
      'La barra representa el período completo que dura tu certificado. El marcador muestra cuánto de esa vigencia ya consumiste: en la franja verde estás holgado, en la amarilla conviene sacar turno y en la roja el vencimiento está encima o ya pasó.',
  },
  breakdownTitle: 'Cuándo te toca y cuánto pagás',
  breakdownIntro:
    'Las filas en pesos son plata; las de años, meses y porcentaje llevan su unidad. Las barras comparan cada valor con el mayor.',

  faq: [
    {
      q: '¿Cada cuánto hay que hacer la VTV?',
      a: 'Depende de la antigüedad del vehículo. Con menos de 2 años está exento. Entre los 2 y los 7 años la revisión es anual: el certificado vale 12 meses. A partir de los 8 años pasa a ser semestral, con certificados de 6 meses. Los años se cuentan desde el patentamiento que figura en la cédula.',
    },
    {
      q: '¿Cuánto sale la VTV?',
      a: 'La tarifa la fija cada jurisdicción y se actualiza varias veces al año. Como referencia orientativa, un auto particular ronda los $55.000 en la Ciudad de Buenos Aires, $48.000 en Provincia de Buenos Aires, $45.000 en Santa Fe y $42.000 en Córdoba; en el resto del país el orden de magnitud es de unos $50.000. Confirmá el importe vigente en la planta antes de ir, porque el valor cambia seguido.',
    },
    {
      q: '¿La moto paga lo mismo que un auto?',
      a: 'No. La moto paga aproximadamente la mitad de la tarifa del auto, la pickup o camioneta un 30% más y el camión el doble. La periodicidad, en cambio, es la misma: se rige por la antigüedad del vehículo y no por la categoría.',
    },
    {
      q: 'Mi auto es 0 km, ¿tengo que hacer la VTV?',
      a: 'No mientras tenga menos de 2 años de antigüedad. La exención se cuenta desde el año de patentamiento, así que un vehículo patentado hace dos años ya entra en el régimen y le corresponde la primera revisión.',
    },
    {
      q: '¿Cuándo vence exactamente mi certificado?',
      a: 'Se suma la vigencia que te corresponde al mes de la última revisión. Si la hiciste en marzo y te toca anual, vence en marzo del año siguiente; si te toca semestral, vence en septiembre del mismo año. La cuenta arranca en la revisión anterior, no en la fecha en que sacaste el turno.',
    },
    {
      q: '¿Qué pasa si circulo con la VTV vencida?',
      a: 'Es una infracción de tránsito: habilita multa e impedimento de circulación, y en un control pueden retener el vehículo. Además, ante un siniestro le da a la aseguradora un argumento para discutir la cobertura, porque el vehículo no estaba en condiciones reglamentarias de circular.',
    },
    {
      q: '¿En qué se diferencia la VTV provincial de la revisión nacional de ruta?',
      a: 'Son trámites distintos y ninguno reemplaza al otro. La VTV la exige la jurisdicción donde está radicado el vehículo. La revisión técnica nacional aplica al transporte interjurisdiccional y tiene su propia tabla de vigencias: 36 meses hasta los 4 años de antigüedad, 12 meses entre los 5 y los 9, y 6 meses a partir de los 10.',
    },
    {
      q: '¿Perdí la oblea y no me acuerdo de la última revisión, qué hago?',
      a: 'Tratala como si no tuviera certificado válido: sacá turno lo antes posible. La planta puede reconstruir el historial con el dominio, pero mientras tanto circulás sin comprobante y en un control eso equivale a tener la revisión vencida.',
    },
    {
      q: 'Si el vehículo no pasa la revisión, ¿pago de nuevo?',
      a: 'Cuando la revisión sale condicional o rechazada hay que corregir las observaciones y volver dentro de un plazo acotado. La reinspección suele cobrarse como un arancel reducido, no como una revisión completa, siempre que vuelvas dentro del plazo; si se te pasa, pagás la tarifa entera otra vez.',
    },
    {
      q: '¿Puedo hacer la VTV en otra provincia?',
      a: 'La regla general es hacerla en la jurisdicción donde el vehículo está radicado, porque es la que emite y controla el certificado. Cambiar de jurisdicción implica primero el cambio de radicación del vehículo. Antes de viajar a una planta de otra provincia por la tarifa, confirmá que te la vayan a reconocer.',
    },
    {
      q: '¿Cuánto me cuesta la VTV por año si tengo un auto viejo?',
      a: 'Un vehículo con más de 7 años paga dos revisiones por año en vez de una, así que el gasto anual se duplica aunque la tarifa por revisión sea la misma. Es un costo de tenencia que conviene sumar al presupuesto junto con la patente y el seguro.',
    },
    {
      q: '¿Con cuánta anticipación conviene sacar turno?',
      a: 'Entre 3 y 4 semanas. La demanda se concentra en los meses en que vencen más certificados y en las plantas mejor ubicadas, así que dejarlo para la última semana suele terminar en un turno posterior al vencimiento. El certificado nuevo se cuenta desde la revisión, de modo que adelantarla unos días no te hace perder vigencia relevante.',
    },
  ],

  sources: [
    {
      name: 'Ley Nacional de Tránsito 24.449, art. 34 — revisión técnica obligatoria',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/818/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Verificación Técnica Vehicular — Provincia de Buenos Aires',
      url: 'https://vtv.gba.gob.ar/',
      publisher: 'Ministerio de Transporte de la Provincia de Buenos Aires',
    },
    {
      name: 'Verificación Técnica Vehicular — Ciudad de Buenos Aires',
      url: 'https://buenosaires.gob.ar/vtv',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
    {
      name: 'Revisión Técnica Obligatoria (RTO) — transporte interjurisdiccional',
      url: 'https://www.argentina.gob.ar/cnrt/revision-tecnica-obligatoria',
      publisher: 'Comisión Nacional de Regulación del Transporte',
    },
    {
      name: 'Agencia Nacional de Seguridad Vial — normativa de tránsito y sanciones',
      url: 'https://www.argentina.gob.ar/seguridadvial',
      publisher: 'Agencia Nacional de Seguridad Vial',
    },
  ],

  replaces: [
    '/calculadora-vtv-costo-provincia-2026',
    '/calculadora-vtv-ruta-vencimiento-vigencia-meses',
    '/calculadora-vtv-vencimiento-turno',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Tarifa base por jurisdicción, en pesos.
 * Espejo de `src/lib/formulas/vtv-costo-provincia-2026.ts` (base + fallback 50.000).
 */
export const TARIFA_BASE: Record<string, { nombre: string; base: number }> = {
  caba: { nombre: 'Ciudad de Buenos Aires', base: 55_000 },
  pba: { nombre: 'Provincia de Buenos Aires', base: 48_000 },
  cba: { nombre: 'Córdoba', base: 42_000 },
  sfe: { nombre: 'Santa Fe', base: 45_000 },
  otras: { nombre: 'otra provincia', base: 50_000 },
};

/** Multiplicador por categoría de vehículo (misma fórmula). */
export const MULT_TIPO: Record<string, { nombre: string; mult: number }> = {
  auto: { nombre: 'auto', mult: 1 },
  moto: { nombre: 'moto', mult: 0.5 },
  pickup: { nombre: 'pickup', mult: 1.3 },
  camion: { nombre: 'camión', mult: 2.0 },
};

/**
 * Qué régimen de vigencia usa cada rama.
 *  - `regimen: 'vtv'`  → tabla provincial (exento <2 años · 12 meses hasta 7 · 6 desde 8).
 *    Espejo de `vtv-vencimiento-turno.ts`.
 *  - `regimen: 'ruta'` → tabla nacional (36 meses hasta 4 años · 12 hasta 9 · 6 desde 10).
 *    Espejo de `vtv-ruta-vencimiento-vigencia-meses.ts`.
 *  - `sinRegistro: true` fuerza el camino "no hay revisión previa".
 */
export const CASE_MATH: Record<string, { regimen: 'vtv' | 'ruta'; sinRegistro?: boolean }> = {
  'usado-al-dia': { regimen: 'vtv' },
  nuevo: { regimen: 'vtv' },
  vencida: { regimen: 'vtv', sinRegistro: true },
  'moto-otro': { regimen: 'vtv' },
  'ruta-rto': { regimen: 'ruta' },
};
