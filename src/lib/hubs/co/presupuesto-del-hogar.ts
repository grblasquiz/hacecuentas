import type { HubData } from '../types';
import { COLOMBIA_2026, DEVOLUCION_IVA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto necesito al mes para vivir en Colombia y con qué ayudas cuento?"
 *
 * Absorbe siete calculadoras: costo de vida por ciudad, canasta familiar DANE, fondo de
 * emergencia, bono Hambre Cero / Renta Ciudadana, Devolución del IVA, propinas y costo de
 * funeral. Las dos últimas se absorben SÓLO por URL (ver nota en `replaces`).
 *
 * Constantes duras: src/lib/data/colombia-2026.ts (SMLMV, auxilio de transporte, aportes,
 * DEVOLUCION_IVA_2026). Los costos por rubro son referencias de mercado, no norma.
 */

const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const SMLMV = COLOMBIA_2026.smlmv;
export const AUXILIO_TRANSPORTE = COLOMBIA_2026.auxilioTransporte;
export const TOPE_AUXILIO_SMLMV = COLOMBIA_2026.topeAuxilioSmlmv;

/** Aportes obligatorios del empleado: 4% salud + 4% pensión (Ley 100/1993). */
export const APORTES_EMPLEADO = COLOMBIA_2026.aportes.saludEmpleado + COLOMBIA_2026.aportes.pensionEmpleado;

/** Devolución del IVA (Prosperidad Social): 6 ciclos bimestrales al año, focalización Sisbén IV A y B. */
export const IVA_DPS = DEVOLUCION_IVA_2026;

/**
 * Canasta de referencia mensual: hogar unipersonal, nivel medio, Bogotá (COP).
 * Mismos rubros base que la fórmula vieja `coste-vida-mensual-colombia-soltero-pareja.ts`.
 * Son referencias de mercado, NO un dato oficial del DANE: la canasta del DANE mide variación
 * de precios (IPC), no un presupuesto de hogar en pesos.
 */
export const BASE_MENSUAL = {
  fecha: '2026-01',
  vivienda: 2_200_000,
  alimentacion: 1_100_000,
  transporte: 400_000,
  servicios: 380_000,
  salud: 250_000,
  ocio: 200_000,
  /** Por hijo: matrícula/pensión, útiles, uniformes y cuidado. Referencia de colegio no privado. */
  educacionPorHijo: 500_000,
};

/** Coeficiente de costo de vida por ciudad, con Bogotá = 1. */
export const CIUDADES = [
  { id: 'bogota', nombre: 'Bogotá', coef: 1.0 },
  { id: 'medellin', nombre: 'Medellín', coef: 0.95 },
  { id: 'cali', nombre: 'Cali', coef: 0.8 },
  { id: 'barranquilla', nombre: 'Barranquilla', coef: 0.78 },
  { id: 'cartagena', nombre: 'Cartagena', coef: 0.82 },
  { id: 'bucaramanga', nombre: 'Bucaramanga', coef: 0.75 },
  { id: 'pereira', nombre: 'Pereira', coef: 0.74 },
  { id: 'otra', nombre: 'Otra ciudad intermedia', coef: 0.72 },
];

/** Nivel de vida: austero, medio o acomodado. */
export const NIVELES = { basico: 0.7, medio: 1, alto: 1.4 };

/** Meses de gastos que debería cubrir el fondo de emergencia, según estabilidad del ingreso. */
export const FONDO_MESES = { asalariado: 3, temporal: 4, independiente: 6, informal: 6 };

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/vida/presupuesto-del-hogar',
  title: 'Presupuesto del hogar en Colombia: cuánto necesitás al mes y qué ayudas te tocan',
  description:
    'Calculá cuánto cuesta vivir en Colombia según tu ciudad y tu hogar: canasta, arriendo, servicios y transporte, cuántos meses de fondo de emergencia necesitás, y qué te suman la Devolución del IVA y la Renta Ciudadana.',
  silo: 'Vida',
  siloHref: '/co/vida',
  locale: 'co',

  eyebrow: 'Colombia · DANE · Prosperidad Social',
  h1: '¿Cuánto necesito al mes para vivir en Colombia y con qué ayudas cuento?',
  lede:
    'Un presupuesto de hogar se arma con tres números: cuánto cuesta el mes, cuánto colchón necesitás por si el ingreso se corta, y qué transferencias del Estado te corresponden. Acá salen los tres de una sola cuenta, ajustados a tu ciudad y a quién vive con vos.',
  stamps: [
    `Salario mínimo ${COLOMBIA_2026.anio}: ${cop(SMLMV)} + ${cop(AUXILIO_TRANSPORTE)} de auxilio`,
    `Devolución del IVA: ${IVA_DPS.ciclosPorAnio} ciclos bimestrales`,
    '7 calculadoras adentro',
  ],

  resultLabel: 'Lo que necesitás por mes',

  cases: {
    title: '¿Quién vive en tu hogar?',
    intro:
      'La estructura del gasto cambia mucho según cuánta gente comparte los costos fijos. Un hogar de dos no gasta el doble que uno de uno: el arriendo y los servicios se reparten.',
    items: [
      {
        id: 'soltero',
        label: 'Vivo solo',
        hint: 'Hogar unipersonal',
        answer: 'Viviendo solo pagás el arriendo y los servicios completos, sin nadie con quien repartirlos.',
        yes: [
          'Arriendo o cuota de vivienda, con la administración adentro si aplica',
          'Alimentación, transporte, servicios públicos, salud y ocio a nivel individual',
          `Fondo de emergencia de ${FONDO_MESES.asalariado} meses si tu ingreso es estable, ${FONDO_MESES.independiente} si trabajás por tu cuenta`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los rubros de referencia son promedios de mercado, no un dato oficial del DANE: tu arriendo real puede diferir mucho según barrio y estrato',
          'Vivir solo tiene la peor economía de escala del país: compartir vivienda suele bajar el costo por persona entre un 25% y un 35%',
        ],
        plazo: 'revisá el presupuesto cada enero, cuando se ajustan el salario mínimo, el arriendo y las tarifas.',
      },
      {
        id: 'pareja',
        label: 'Vivimos en pareja, sin hijos',
        hint: 'Dos adultos',
        answer: 'De a dos, el costo por persona baja porque la vivienda y los servicios se reparten.',
        yes: [
          'Un solo arriendo y un solo juego de servicios para dos personas',
          'Alimentación y transporte que sí escalan con cada integrante',
          'Fondo de emergencia sobre el gasto total del hogar, no sobre el de cada uno',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si los dos ingresos dependen del mismo sector o de la misma empresa, el fondo de emergencia debería ser más grande: el riesgo no está diversificado',
          'Sumá al presupuesto lo que aportan los dos, pero calculá el fondo pensando en que se caiga el ingreso mayor',
        ],
        plazo: 'antes de firmar un arriendo, chequeá que el canon más administración no pase de un tercio del ingreso del hogar.',
      },
      {
        id: 'familia',
        label: 'Somos familia con hijos',
        hint: 'Adultos + menores a cargo',
        answer: 'Cada hijo suma alimentación, educación y salud, y empuja el fondo de emergencia hacia arriba.',
        yes: [
          'Alimentación y transporte por cada integrante del hogar',
          'Educación, útiles, uniformes y cuidado por cada hijo',
          'Un fondo de emergencia más grande: con dependientes, tu ingreso sostiene a más gente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El costo de educación es el rubro más elástico del presupuesto colombiano: entre colegio público y privado la diferencia puede ser de varios millones al mes',
          'Los hogares con hijos concentran el gasto en febrero (matrículas y útiles) y en diciembre: presupuestar sólo el promedio mensual deja esos picos sin cubrir',
        ],
        plazo: 'el pico de gasto escolar cae en enero y febrero: conviene apartarlo desde mitad de año.',
      },
      {
        id: 'beneficiario',
        label: 'Mi hogar recibe ayudas del Estado',
        hint: 'Sisbén IV grupos A y B',
        answer: `La Devolución del IVA gira ${IVA_DPS.ciclosPorAnio} ciclos bimestrales al año a hogares Sisbén IV de los grupos A y B.`,
        yes: [
          `Devolución del IVA de Prosperidad Social: ${IVA_DPS.ciclosPorAnio} ciclos bimestrales, con un monto de referencia de ${cop(IVA_DPS.montoCicloReferencia)} por ciclo (el rango va de ${cop(IVA_DPS.montoRango.min)} a ${cop(IVA_DPS.montoRango.max)} según el hogar)`,
          'Renta Ciudadana y sus líneas, incluida la de seguridad alimentaria conocida como Hambre Cero: la focalización es automática y el monto lo define el programa por hogar y por ciclo',
          'La focalización sale del Sisbén IV cruzado con otros registros: estar en el grupo A o B no garantiza el giro',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los montos de Renta Ciudadana cambian por ciclo y por línea del programa y no hay una cuantía única publicada que se pueda dar por vigente: cargá acá lo que te giraron realmente en el último ciclo, no una cifra de referencia',
          'Ninguna transferencia se pide ni se tramita: la asignación es automática. Cualquiera que te cobre por "inscribirte" te está estafando',
          'Verificá tu estado directamente en los canales oficiales de Prosperidad Social antes de contar con la plata en el presupuesto del mes',
        ],
        plazo: 'los giros son bimestrales, así que en el presupuesto mensual entran mensualizados, no completos cada mes.',
      },
    ],
  },

  inputsTitle: 'Tu hogar y tus números',
  inputsIntro:
    'Todo mensual y en pesos colombianos. Los valores cargados son una referencia para Bogotá a nivel medio: ajustalos a lo que realmente pagás.',
  fields: [
    {
      id: 'ciudad',
      label: 'Ciudad donde vivís',
      type: 'select',
      value: 'bogota',
      options: CIUDADES.map((c) => ({ value: c.id, label: c.nombre })),
      help: 'Ajusta todos los rubros con el coeficiente de costo de vida de la ciudad, tomando Bogotá como referencia.',
    },
    {
      id: 'adultos',
      label: 'Adultos en el hogar',
      type: 'number',
      value: 1,
      min: 1,
      max: 6,
      step: 1,
      help: 'Cada adulto suma alimentación y transporte, pero comparte vivienda y servicios.',
    },
    {
      id: 'hijos',
      label: 'Hijos o menores a cargo',
      type: 'number',
      value: 0,
      min: 0,
      max: 8,
      step: 1,
      help: 'Suman alimentación, salud y el rubro de educación y cuidado.',
    },
    {
      id: 'nivel',
      label: 'Nivel de vida',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'basico', label: 'Austero — lo esencial' },
        { value: 'medio', label: 'Medio — estándar urbano' },
        { value: 'alto', label: 'Acomodado — con holgura' },
      ],
      help: 'Multiplica todos los rubros. El nivel austero recorta 30% y el acomodado suma 40%.',
    },
    {
      id: 'ingresos',
      label: 'Ingreso mensual neto del hogar (COP)',
      prefix: '$',
      value: '3.500.000',
      thousands: true,
      help: 'Lo que efectivamente entra al hogar cada mes, sumando a todos los que aportan y después de descuentos.',
    },
    {
      id: 'empleo',
      label: 'Estabilidad del ingreso principal',
      type: 'select',
      value: 'asalariado',
      options: [
        { value: 'asalariado', label: 'Asalariado con contrato indefinido' },
        { value: 'temporal', label: 'Contrato a término fijo o por obra' },
        { value: 'independiente', label: 'Independiente o por prestación de servicios' },
        { value: 'informal', label: 'Ingreso informal o variable' },
      ],
      help: 'Define cuántos meses de gastos debería cubrir tu fondo de emergencia.',
    },
    {
      id: 'sisben',
      label: 'Clasificación en el Sisbén IV',
      type: 'select',
      value: 'ninguno',
      options: [
        { value: 'a', label: 'Grupo A — pobreza extrema (A1 a A5)' },
        { value: 'b', label: 'Grupo B — pobreza moderada (B1 a B4)' },
        { value: 'c', label: 'Grupo C o superior' },
        { value: 'ninguno', label: 'Sin registro en Sisbén IV' },
      ],
      help: 'Los grupos A y B son la población focalizada de la Devolución del IVA y de Renta Ciudadana.',
    },
    {
      id: 'cicloIva',
      label: 'Monto de la Devolución del IVA por ciclo (COP)',
      prefix: '$',
      value: IVA_DPS.montoCicloReferencia,
      type: 'number',
      min: 0,
      step: 100,
      help: `Referencia verificada del primer ciclo del año: ${cop(IVA_DPS.montoCicloReferencia)}. Varía por hogar entre ${cop(IVA_DPS.montoRango.min)} y ${cop(IVA_DPS.montoRango.max)}. Son ${IVA_DPS.ciclosPorAnio} ciclos bimestrales al año.`,
    },
    {
      id: 'rentaCiudadana',
      label: 'Lo que te giraron de Renta Ciudadana en el último ciclo (COP)',
      prefix: '$',
      value: 0,
      type: 'number',
      min: 0,
      step: 1000,
      help: 'Va en cero a propósito: los montos de Renta Ciudadana y de la línea de seguridad alimentaria cambian por ciclo, por línea y por hogar, y no hay una cuantía única que se pueda dar por vigente. Poné lo que efectivamente te giraron.',
    },
  ],
  fineprint: `${DISCLAIMER_TAX} Los rubros de gasto son referencias de mercado de ${BASE_MENSUAL.fecha} ajustadas por ciudad y composición del hogar, no un dato oficial: la canasta familiar del DANE mide variación de precios (IPC), no un presupuesto en pesos. Los montos de Renta Ciudadana no se dan por vigentes en esta calculadora porque cambian por ciclo y por hogar; la Devolución del IVA sí usa el monto de referencia verificado del ciclo, editable.`,

  chart: {
    type: 'donut',
    title: 'En qué se te va el mes',
    caption:
      'Reparte el presupuesto mensual entre vivienda, alimentación, transporte, servicios, educación, salud y ocio. Sirve para ver de un vistazo qué rubro se está comiendo el ingreso y dónde hay margen real para recortar.',
  },
  breakdownTitle: 'Tu presupuesto, rubro por rubro',
  breakdownIntro:
    'Primero el gasto del mes por categoría, después el fondo de emergencia que te corresponde, y al final las transferencias del Estado y la brecha contra tu ingreso.',

  faq: [
    {
      q: '¿Cuánto necesita un hogar para vivir en Colombia?',
      a: `Depende sobre todo de la ciudad y de cuánta gente comparta los costos fijos. Con los rubros de referencia de esta calculadora, un hogar unipersonal de nivel medio en Bogotá necesita alrededor de ${cop(BASE_MENSUAL.vivienda + BASE_MENSUAL.alimentacion + BASE_MENSUAL.transporte + BASE_MENSUAL.servicios + BASE_MENSUAL.salud + BASE_MENSUAL.ocio)} al mes, y en una ciudad intermedia bastante menos. Compará ese número contra el salario mínimo de ${cop(SMLMV)} más el auxilio de transporte de ${cop(AUXILIO_TRANSPORTE)} y vas a entender por qué la mayoría de los hogares colombianos son de dos o más aportantes.`,
    },
    {
      q: '¿Qué es la canasta familiar del DANE y por qué no es un presupuesto?',
      a: 'La canasta familiar del DANE es el conjunto de bienes y servicios que se usa para medir el Índice de Precios al Consumidor: sirve para calcular cuánto SUBEN los precios, no para decirte cuánto cuesta el mes. Cuando alguien publica "la canasta familiar cuesta X pesos", está mezclando el IPC con un presupuesto de hogar armado con supuestos propios. Por eso acá los rubros aparecen como referencias editables y no como dato oficial.',
    },
    {
      q: '¿Cuántos meses de gastos debería tener ahorrados?',
      a: `Depende de qué tan estable sea tu ingreso: ${FONDO_MESES.asalariado} meses si sos asalariado con contrato indefinido, ${FONDO_MESES.temporal} si tu contrato es a término fijo o por obra, y ${FONDO_MESES.independiente} si sos independiente o tenés ingreso informal. A eso se le suma medio mes extra por cada persona que dependa de vos si tu ingreso es estable, y un mes entero por dependiente si es variable. La lógica es simple: el fondo cubre el tiempo que te toma reemplazar el ingreso, y ese tiempo es más largo cuando no hay contrato.`,
    },
    {
      q: '¿Dónde debería guardar el fondo de emergencia?',
      a: 'La regla es liquidez antes que rentabilidad: el fondo tiene que estar disponible en horas, no en semanas. Una cuenta de ahorro remunerada o un fondo de inversión colectiva del mercado monetario cumplen; un CDT a 360 días o una inversión que haya que vender con pérdida, no. Si el fondo es grande, partirlo funciona: una porción de acceso inmediato y otra en instrumentos a plazos cortos y escalonados.',
    },
    {
      q: '¿Qué es la Devolución del IVA y cuánto giran?',
      a: `Es una transferencia de Prosperidad Social que compensa el IVA que pagan los hogares más pobres al comprar. Se gira en ${IVA_DPS.ciclosPorAnio} ciclos bimestrales al año y el monto de referencia por ciclo es de ${cop(IVA_DPS.montoCicloReferencia)}, con un rango entre ${cop(IVA_DPS.montoRango.min)} y ${cop(IVA_DPS.montoRango.max)} según el hogar. La focalización es automática: se hace con el Sisbén IV, grupos A (A1 a A5) y B (B1 a B4), cruzado con otros registros. No hay que inscribirse.`,
    },
    {
      q: '¿Cómo sé si mi hogar está focalizado en Renta Ciudadana o en Hambre Cero?',
      a: 'La selección es automática y sale del Sisbén IV cruzado con las bases de Prosperidad Social; no existe un formulario de postulación. Se consulta en los canales oficiales del programa con el documento de identidad del titular. Estar en el grupo A o B del Sisbén es condición necesaria pero no suficiente: la cobertura depende del presupuesto de cada ciclo. Nadie legítimo cobra por inscribirte ni por "acelerar" un giro.',
    },
    {
      q: '¿Cuánto suman realmente las transferencias en el presupuesto del mes?',
      a: 'Menos de lo que parece cuando se anuncian, porque son bimestrales y hay que mensualizarlas. Un giro de la Devolución del IVA cada dos meses equivale a la mitad de ese monto por mes. Sirven como alivio y cubren picos puntuales —matrículas, mercado de un mes difícil—, pero ningún hogar puede armar su presupuesto contando con ellas como ingreso fijo, entre otras cosas porque la asignación se revisa por ciclo.',
    },
    {
      q: '¿Qué porcentaje del ingreso debería irse en cada rubro?',
      a: 'Como orientación en el contexto colombiano: vivienda y administración hasta un tercio del ingreso neto, alimentación entre 20% y 30%, transporte hasta 15%, y por lo menos un 10% que se va a ahorro antes de gastarlo. Si la vivienda pasa del 40% del ingreso, el hogar queda sin capacidad de absorber ningún imprevisto y cualquier gasto médico se paga con tarjeta de crédito.',
    },
    {
      q: '¿Cuánto más barato es vivir fuera de Bogotá?',
      a: `Con los coeficientes de esta calculadora, Medellín está apenas por debajo de Bogotá, Cali y Cartagena en torno a un 20% menos, y Bucaramanga o Pereira alrededor de un 25% menos. La diferencia se concentra casi toda en la vivienda: la comida, los servicios y la ropa varían mucho menos entre ciudades. Ojo con dos cosas que no aparecen en el promedio: el estrato de tu vivienda, que define el subsidio de los servicios, y el gasto de transporte, que en las ciudades sin sistema masivo puede subir.`,
    },
    {
      q: '¿El salario mínimo alcanza para sostener un hogar?',
      a: `El salario mínimo de ${COLOMBIA_2026.anio} es de ${cop(SMLMV)} más ${cop(AUXILIO_TRANSPORTE)} de auxilio de transporte para quien gane hasta ${TOPE_AUXILIO_SMLMV} salarios mínimos, lo que da ${cop(SMLMV + AUXILIO_TRANSPORTE)} brutos. De ahí se descuenta el ${(APORTES_EMPLEADO * 100).toFixed(0)}% de aportes obligatorios a salud y pensión. Contra el costo de un hogar unipersonal de nivel medio en una ciudad principal, la cuenta no cierra sola: por eso el hogar promedio colombiano tiene más de un aportante o comparte vivienda.`,
    },
    {
      q: '¿Cuánto debería ganar bruto para cubrir este presupuesto?',
      a: `Si sos asalariado, sobre el salario se descuenta el ${(APORTES_EMPLEADO * 100).toFixed(0)}% de aportes obligatorios (4% salud y 4% pensión), así que el bruto necesario es el gasto dividido por ${(1 - APORTES_EMPLEADO).toFixed(2).replace('.', ',')}. Si sos independiente el golpe es mayor: cotizás sobre el 40% de tus ingresos y asumís el ${(COLOMBIA_2026.independientes.salud * 100).toString().replace('.', ',')}% de salud y el ${(COLOMBIA_2026.independientes.pension * 100)}% de pensión completos, además de la retención en la fuente que te practiquen.`,
    },
    {
      q: '¿Cada cuánto conviene rehacer el presupuesto?',
      a: 'Una vez al año como mínimo, en enero, porque ahí se mueven a la vez el salario mínimo, el reajuste del arriendo por IPC, las tarifas de servicios y el transporte público. Y cada vez que cambie algo estructural: un nacimiento, un cambio de trabajo, una mudanza de ciudad o el fin de un contrato. Un presupuesto de hace dos años en Colombia ya no describe ningún hogar real.',
    },
  ],

  sources: [
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
    {
      name: 'DANE — Índice de Precios al Consumidor y canasta familiar',
      url: 'https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-precios-al-consumidor-ipc',
      publisher: 'DANE',
    },
    {
      name: 'Prosperidad Social — Devolución del IVA',
      url: 'https://devolucioniva.prosperidadsocial.gov.co/',
      publisher: 'Prosperidad Social',
    },
    {
      name: 'Prosperidad Social — Renta Ciudadana',
      url: 'https://prosperidadsocial.gov.co/renta-ciudadana/',
      publisher: 'Prosperidad Social',
    },
    {
      name: 'DNP — Sisbén IV: consulta de grupo y metodología de clasificación',
      url: 'https://www.sisben.gov.co/',
      publisher: 'Departamento Nacional de Planeación',
    },
    {
      name: 'Ley 100 de 1993 — aportes obligatorios a salud y pensión',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0100_1993.html',
      publisher: 'Congreso de la República',
    },
  ],

  /**
   * Las dos últimas se absorben SÓLO por URL: el cálculo de propinas y el de costo de funeral
   * no tienen nada que ver con un presupuesto mensual de hogar y meterlos adentro habría
   * ensuciado la cuenta. Se redirigen acá porque es el destino más cercano dentro del silo.
   */
  replaces: [
    '/co/calculadora-coste-vida-mensual-colombia-soltero-pareja',
    '/co/calculadora-canasta-familiar-colombia-dane-mes',
    '/co/calculadora-fondo-emergencia-colombia-meses-gastos',
    '/co/calculadora-bono-hambre-cero-colombia-renta-ciudadana',
    '/co/calculadora-devolucion-iva-dps-colombia-2026-ciclos',
    '/co/calculadora-de-propinas-colombia',
    '/co/calculadora-coste-funeral-promedio-colombia-2026-paquetes',
  ],

  lastReviewed: '2026-07-28',
};
