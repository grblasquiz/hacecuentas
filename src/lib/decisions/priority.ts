/**
 * Cohorte P0 de Salas de decisión.
 *
 * Estas son las diez URLs en las que concentramos crawl, enlazado interno y
 * distribución. La lista es deliberadamente chica: no crear una segunda fuente
 * de verdad en la home, sitemap y CTAs; todos consumen este mismo archivo.
 */

export interface PriorityDecisionMeta {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  questionTitle: string;
  searchAnswer: string;
  outreachVertical: 'laboral' | 'vivienda' | 'impuestos' | 'finanzas' | 'jubilacion' | 'freelance';
}

export const PRIORITY_DECISIONS: PriorityDecisionMeta[] = [
  {
    slug: 'me-despidieron',
    seoTitle: 'Me despidieron: indemnización y meses de sostén | Argentina 2026',
    seoDescription: 'Calculá cuánto deberían pagarte por el despido y cuántos meses podés sostenerte con la indemnización, ahorros, gastos y deudas. Escenarios y próximos pasos.',
    questionTitle: '¿Cuánto deberían pagarme si me despidieron y cuánto me dura?',
    searchAnswer: 'La indemnización no alcanza para decidir qué hacer después del despido. Esta sala calcula la liquidación completa y la cruza con tus gastos, ahorros, deudas y seguro de desempleo para mostrar cuántos meses reales de cobertura tenés.',
    outreachVertical: 'laboral',
  },
  {
    slug: 'renovar-alquiler-o-mudarme',
    seoTitle: '¿Conviene renovar el alquiler o mudarse? Comparador 2026',
    seoDescription: 'Compará renovar el alquiler contra mudarte: nuevo alquiler, depósito, comisión, mudanza, arreglos y viaje. Calculá en cuántos meses recuperás el costo.',
    questionTitle: '¿Me conviene aceptar el nuevo alquiler o mudarme?',
    searchAnswer: 'Mudarte empieza con varios costos juntos; renovar empieza con una cuota mensual más alta. La comparación correcta mide el primer año completo y calcula cuántos meses tarda el ahorro del alquiler nuevo en compensar depósito, comisión, mudanza y arreglos.',
    outreachVertical: 'vivienda',
  },
  {
    slug: 'aceptar-oferta-laboral',
    seoTitle: '¿Me conviene aceptar esta oferta laboral? Comparador de sueldo real 2026',
    seoDescription: 'Compará trabajo actual y oferta por sueldo neto, Ganancias, bono, beneficios, presencialidad, comidas y viaje. Obtené el sueldo mínimo para que el cambio convenga.',
    questionTitle: '¿Cuánto tiene que mejorar una oferta laboral para que convenga?',
    searchAnswer: 'Una oferta conviene cuando mejora el ingreso disponible y el valor de tu tiempo, no solamente el bruto. La sala descuenta impuestos y costos de presencialidad, suma bono y beneficios, y calcula el sueldo de indiferencia que debería ofrecerte la empresa.',
    outreachVertical: 'laboral',
  },
  {
    slug: 'relacion-dependencia-o-facturar',
    seoTitle: 'Relación de dependencia o facturar: comparador Argentina 2026',
    seoDescription: 'Compará sueldo en relación de dependencia contra facturar como monotributista: neto, aguinaldo, vacaciones, obra social, impuestos y costo de contador.',
    questionTitle: '¿Cuánto tengo que facturar para igualar un sueldo en blanco?',
    searchAnswer: 'Para empatar un empleo no alcanza con facturar el mismo bruto. Hay que recuperar aguinaldo, vacaciones pagas, aportes, obra social, indemnización y tiempo no facturable. Esta sala transforma todo eso en un monto mensual comparable.',
    outreachVertical: 'impuestos',
  },
  {
    slug: 'monotributo-o-responsable-inscripto',
    seoTitle: 'Monotributo o Responsable Inscripto: qué conviene en 2026',
    seoDescription: 'Compará Monotributo y Responsable Inscripto según facturación, compras con IVA y tipo de clientes. Estimá impuestos, administración y punto de cambio.',
    questionTitle: '¿Cuándo deja de convenir el Monotributo?',
    searchAnswer: 'El régimen conveniente depende de la facturación, el crédito fiscal de tus compras y si tus clientes necesitan factura A. La sala compara la carga total y muestra el punto en el que Responsable Inscripto empieza a ser competitivo.',
    outreachVertical: 'impuestos',
  },
  {
    slug: 'estoy-listo-para-jubilarme',
    seoTitle: '¿Estoy listo para jubilarme? Calculadora de retiro Argentina 2026',
    seoDescription: 'Cruzá edad, aportes, jubilación estimada, gastos y ahorro para saber si podés jubilarte, cuánto te falta y qué ingreso complementario necesitás.',
    questionTitle: '¿Mi jubilación y mis ahorros alcanzan para retirarme?',
    searchAnswer: 'Cumplir la edad y los aportes es solo el requisito legal. Esta sala compara el ingreso jubilatorio esperado contra tus gastos y tu ahorro complementario para estimar la brecha mensual y si tu patrimonio puede cubrirla.',
    outreachVertical: 'jubilacion',
  },
  {
    slug: 'cuotas-o-contado',
    seoTitle: '¿Cuotas o contado? Comparador con inflación y descuento 2026',
    seoDescription: 'Compará pagar en cuotas o al contado considerando descuento, inflación y rendimiento de la plata. Calculá el costo en pesos de hoy y cuál opción conviene.',
    questionTitle: '¿Conviene pagar en cuotas o aprovechar el descuento al contado?',
    searchAnswer: 'La suma nominal de las cuotas engaña cuando hay inflación. Esta sala convierte cada pago futuro a pesos de hoy, incorpora el descuento al contado y el rendimiento alternativo para comparar las dos opciones en la misma fecha.',
    outreachVertical: 'finanzas',
  },
  {
    slug: 'puedo-afrontar-un-credito-uva',
    seoTitle: '¿Puedo afrontar un crédito UVA? Stress test de cuota 2026',
    seoDescription: 'Probá si tu ingreso puede sostener un crédito UVA hoy y ante distintos escenarios de inflación y salarios. Cuota inicial, relación cuota/ingreso y stress test.',
    questionTitle: '¿Qué pasa con la cuota UVA si mi sueldo pierde contra la inflación?',
    searchAnswer: 'La cuota inicial puede entrar en el límite del banco y volverse pesada después. Esta sala proyecta UVA e ingresos por separado y muestra cómo cambia la relación cuota/ingreso a 12 y 24 meses.',
    outreachVertical: 'vivienda',
  },
  {
    slug: 'como-salir-de-deudas',
    seoTitle: 'Cómo salir de deudas: avalancha vs bola de nieve | Plan 2026',
    seoDescription: 'Cargá tus deudas y tu capacidad mensual. Compará avalancha y bola de nieve, meses hasta quedar libre, intereses totales y orden de pago recomendado.',
    questionTitle: '¿Qué deuda pago primero y cuándo termino?',
    searchAnswer: 'Avalancha minimiza intereses; bola de nieve prioriza cerrar saldos chicos. La sala simula ambos métodos con tus montos y tasas para mostrar la diferencia en pesos, meses y orden de cancelación.',
    outreachVertical: 'finanzas',
  },
  {
    slug: 'cuanto-cobrar-por-hora-freelance',
    seoTitle: 'Cuánto cobrar por hora freelance en Argentina | Calculadora 2026',
    seoDescription: 'Calculá tu tarifa freelance por hora desde el ingreso neto objetivo, horas facturables, impuestos, equipamiento, impagos y tiempo comercial.',
    questionTitle: '¿Cuál es mi tarifa freelance mínima rentable?',
    searchAnswer: 'Dividir el sueldo deseado por las horas del mes subestima la tarifa. Esta sala suma impuestos, gastos, tiempo comercial no facturable, vacaciones e impagos para calcular el piso por hora que sostiene el ingreso objetivo.',
    outreachVertical: 'freelance',
  },
];

export const PRIORITY_DECISION_SLUGS = PRIORITY_DECISIONS.map((d) => d.slug);
const PRIORITY_BY_SLUG = new Map(PRIORITY_DECISIONS.map((d) => [d.slug, d]));

export function getPriorityDecision(slug: string): PriorityDecisionMeta | undefined {
  return PRIORITY_BY_SLUG.get(slug);
}

export function isPriorityDecision(slug: string): boolean {
  return PRIORITY_BY_SLUG.has(slug);
}

export interface PriorityDecisionCta {
  lead: string;
  meaning: string;
  room: {
    slug: string;
    hook: string;
    label: string;
    prefill?: Record<string, string>;
  };
}

/**
 * Un CTA principal por calculadora: relevancia antes que cantidad. Los valores
 * se copian solo cuando las unidades coinciden; nunca transformamos dinero o
 * tasas en cliente de forma implícita.
 */
const CTA_BY_CALC: Record<string, PriorityDecisionCta> = {
  'calculadora-indemnizacion-despido': {
    lead: 'Tu indemnización estimada es {value}.',
    meaning: 'Ahora cruzala con tus gastos, ahorros y deudas para saber cuántos meses reales de cobertura te da.',
    room: {
      slug: 'me-despidieron',
      hook: 'La indemnización es solo la primera mitad de la decisión.',
      label: 'Calcular cuánto tiempo podés sostenerte →',
      prefill: { sueldoBruto: 'sueldoBruto', antiguedadAnios: 'antiguedadAnios', antiguedadMeses: 'antiguedadMeses', mesDespido: 'mesDespido', diaDespido: 'diaDespido' },
    },
  },
  'calculadora-liquidacion-final-renuncia': {
    lead: 'Tu liquidación estimada es {value}.',
    meaning: 'Si la salida no fue voluntaria, analizá indemnización, cobertura mensual y próximos pasos en una sola cuenta.',
    room: {
      slug: 'me-despidieron',
      hook: '¿Necesitás convertir ese monto en meses de tranquilidad?',
      label: 'Abrir la sala de despido →',
      prefill: { sueldoBruto: 'sueldoBruto' },
    },
  },
  'calculadora-actualizacion-alquiler-icl': {
    lead: 'El alquiler actualizado da {value}.',
    meaning: 'Compará ese nuevo alquiler contra depósito, comisión, mudanza y otra zona para decidir si renovar o irte.',
    room: {
      slug: 'renovar-alquiler-o-mudarme',
      hook: '¿El aumento hace que mudarte empiece a convenir?',
      label: 'Comparar renovar contra mudarte →',
      prefill: { alquilerActual: 'valorActual' },
    },
  },
  'calculadora-impuesto-ganancias-sueldo': {
    lead: 'El impacto estimado de Ganancias es {value}.',
    meaning: 'Usá el neto real, beneficios y costos de presencialidad para comparar tu trabajo actual con una oferta.',
    room: {
      slug: 'aceptar-oferta-laboral',
      hook: 'Una oferta se compara por lo que realmente te queda.',
      label: 'Comparar trabajo actual y oferta →',
      prefill: { brutoActual: 'brutoMensual', conyuge: 'conyuge', hijos: 'hijos' },
    },
  },
  'calculadora-monotributo-2026': {
    lead: 'Tu categoría y cuota estimada dan {value}.',
    meaning: 'La siguiente decisión es si seguir en Monotributo todavía conviene frente a Responsable Inscripto.',
    room: {
      slug: 'monotributo-o-responsable-inscripto',
      hook: 'No mires solo la cuota: compará el régimen completo.',
      label: 'Comparar Monotributo y Responsable Inscripto →',
    },
  },
  'calculadora-monotributo-vs-responsable-inscripto': {
    lead: 'La diferencia estimada entre regímenes es {value}.',
    meaning: 'Sumá tipo de clientes, compras con IVA y costo administrativo para tomar la decisión completa.',
    room: {
      slug: 'monotributo-o-responsable-inscripto',
      hook: 'Convertí la comparación impositiva en una decisión de negocio.',
      label: 'Analizar qué régimen te conviene →',
    },
  },
  'calculadora-cuota-prestamo': {
    lead: 'La cuota estimada es {value}.',
    meaning: 'Si ya tenés una o más deudas, ordenalas por tasa y compará avalancha contra bola de nieve.',
    room: {
      slug: 'como-salir-de-deudas',
      hook: '¿Querés saber qué deuda cancelar primero?',
      label: 'Armar un plan de salida de deudas →',
      prefill: { deuda1Monto: 'capital', deuda1Tna: 'tasaAnual' },
    },
  },
  'calculadora-cft-prestamo-personal-comparativa': {
    lead: 'El costo financiero estimado es {value}.',
    meaning: 'Usá la tasa real del préstamo para ordenar tus deudas y minimizar intereses totales.',
    room: {
      slug: 'como-salir-de-deudas',
      hook: 'La tasa define qué deuda conviene atacar primero.',
      label: 'Comparar métodos de pago →',
      prefill: { deuda1Monto: 'montoPrestamo', deuda1Tna: 'tnaPorcentaje' },
    },
  },
  'calculadora-cuotas-sin-interes-costo-real-inflacion': {
    lead: 'El costo real de las cuotas es {value}.',
    meaning: 'Compará ese costo contra el descuento al contado y el rendimiento alternativo en pesos de hoy.',
    room: {
      slug: 'cuotas-o-contado',
      hook: '¿Cuotas o contado? Poné las dos ofertas en la misma fecha.',
      label: 'Tomar la decisión completa →',
      prefill: { precioContado: 'precioContado', cuotas: 'cantidadCuotas' },
    },
  },
  'calculadora-credito-uva-cuota-actual': {
    lead: 'La cuota UVA estimada es {value}.',
    meaning: 'Probá cómo cambia la relación cuota/ingreso si UVA y tu sueldo evolucionan a ritmos distintos.',
    room: {
      slug: 'puedo-afrontar-un-credito-uva',
      hook: 'La cuota inicial no muestra el riesgo completo.',
      label: 'Hacer el stress test UVA →',
      prefill: { tnaUVA: 'tasaAnual', plazoAnios: 'plazoAnios' },
    },
  },
  'calculadora-ingreso-minimo-credito-hipotecario-uva-banco-nacion': {
    lead: 'El ingreso mínimo estimado es {value}.',
    meaning: 'Completá el análisis proyectando cuota UVA, inflación y evolución salarial a 12 y 24 meses.',
    room: {
      slug: 'puedo-afrontar-un-credito-uva',
      hook: 'Que el banco lo apruebe no significa que vaya a quedar cómodo.',
      label: 'Probar si podés sostener el crédito →',
      prefill: { plazoAnios: 'plazoAnios' },
    },
  },
  'calculadora-freelance-tarifa-hora': {
    lead: 'Tu tarifa estimada es {value}.',
    meaning: 'Ajustala por horas realmente facturables, impuestos, equipamiento, impagos y tiempo comercial.',
    room: {
      slug: 'cuanto-cobrar-por-hora-freelance',
      hook: 'La tarifa mínima rentable necesita más que una división.',
      label: 'Calcular tu tarifa freelance completa →',
      prefill: { ingresoNetoObjetivo: 'ingresoDeseado' },
    },
  },
  'calculadora-cuanto-cobro-por-hora-freelance': {
    lead: 'Tu valor por hora estimado es {value}.',
    meaning: 'Sumá tiempo comercial, impagos y horas facturables reales para definir un piso sostenible.',
    room: {
      slug: 'cuanto-cobrar-por-hora-freelance',
      hook: '¿Ese valor cubre todo el tiempo que no podés facturar?',
      label: 'Definir la tarifa mínima rentable →',
      prefill: { impuestos: 'impuestos' },
    },
  },
};

// ── Tanda 2 (2026-07-21): donantes por tráfico GA4 30d + afinidad temática.
// Sin prefill: el mapeo de campos se agrega si el funnel demuestra clicks.
const CTA_BY_CALC_T2: Record<string, PriorityDecisionCta> = {
  'calculadora-aguinaldo-sac': {
    lead: 'Tu aguinaldo estimado es {value}.',
    meaning: 'El aguinaldo es una de las cosas que perdés si pasás a facturar: compará el paquete completo antes de decidir.',
    room: {
      slug: 'relacion-dependencia-o-facturar',
      hook: '¿Te tienta facturar? El aguinaldo es parte de la cuenta.',
      label: 'Comparar relación de dependencia contra facturar →',
    },
  },
  'calculadora-actualizacion-inflacion-ipc': {
    lead: 'El monto actualizado por IPC da {value}.',
    meaning: 'Si lo que actualizaste es tu alquiler, el paso siguiente es decidir si a ese precio conviene renovar o mudarte.',
    room: {
      slug: 'renovar-alquiler-o-mudarme',
      hook: '¿La actualización hace que mudarte empiece a convenir?',
      label: 'Comparar renovar contra mudarte →',
    },
  },
  'calculadora-sueldo-bruto-desde-neto': {
    lead: 'El bruto equivalente es {value}.',
    meaning: 'Con el bruto en mano podés comparar tu trabajo actual contra una oferta por lo que realmente te queda.',
    room: {
      slug: 'aceptar-oferta-laboral',
      hook: 'Una oferta se compara por el neto real, no por el bruto.',
      label: 'Comparar trabajo actual y oferta →',
    },
  },
  'sueldo-en-mano-argentina': {
    lead: 'Tu sueldo en mano estimado es {value}.',
    meaning: 'Si estás evaluando un cambio de trabajo, cruzá ese neto con bono, beneficios y costos de presencialidad.',
    room: {
      slug: 'aceptar-oferta-laboral',
      hook: '¿Te hicieron una oferta? Compará lo que realmente te queda.',
      label: 'Comparar trabajo actual y oferta →',
    },
  },
  'calculadora-art-indemnizacion-tabla-incapacidad-laboral-permanente': {
    lead: 'La indemnización ART estimada es {value}.',
    meaning: 'Si además perdiste el trabajo, cruzá ese monto con tus gastos, ahorros y deudas para saber cuántos meses te cubre.',
    room: {
      slug: 'me-despidieron',
      hook: 'El monto es la mitad de la decisión: la otra es cuánto te dura.',
      label: 'Calcular cuánto tiempo podés sostenerte →',
    },
  },
  'calculadora-fondo-desempleo-anses-monto-tiempo': {
    lead: 'Tu prestación por desempleo estimada es {value}.',
    meaning: 'Sumale indemnización, ahorros y gastos para saber cuántos meses reales de cobertura tenés antes del próximo trabajo.',
    room: {
      slug: 'me-despidieron',
      hook: 'La prestación es un ingreso más: armá la cuenta completa.',
      label: 'Abrir la sala de despido →',
    },
  },
  'calculadora-antiguedad-laboral': {
    lead: 'Tu antigüedad computada es {value}.',
    meaning: 'La antigüedad define la indemnización. Si tu salida está en juego, calculá cuánto deberían pagarte y cuánto te dura.',
    room: {
      slug: 'me-despidieron',
      hook: '¿La antigüedad es por un despido? Hacé la cuenta completa.',
      label: 'Calcular indemnización y meses de sostén →',
    },
  },
  'calculadora-cuanto-voy-a-cobrar-jubilacion-haber-estimado': {
    lead: 'Tu haber jubilatorio estimado es {value}.',
    meaning: 'El haber solo no decide: cruzalo con tus gastos, otros ingresos y ahorros para saber si ya podés dar el paso.',
    room: {
      slug: 'estoy-listo-para-jubilarme',
      hook: '¿Ese haber te alcanza para tu nivel de vida?',
      label: 'Ver si estoy listo para jubilarme →',
    },
  },
  'calculadora-edad-jubilacion-anos-aporte': {
    lead: 'Tu situación de edad y aportes da {value}.',
    meaning: 'Cumplir los requisitos es el primer paso; el segundo es saber si el haber más tus ahorros sostienen tus gastos.',
    room: {
      slug: 'estoy-listo-para-jubilarme',
      hook: 'Poder jubilarte y convenirte jubilarte son dos cuentas distintas.',
      label: 'Ver si estoy listo para jubilarme →',
    },
  },
  'calculadora-dias-vacaciones-ley': {
    lead: 'Tus días de vacaciones por ley son {value}.',
    meaning: 'Las vacaciones pagas son parte del paquete que perdés si pasás a facturar: compará el régimen completo.',
    room: {
      slug: 'relacion-dependencia-o-facturar',
      hook: '¿Pensás pasarte a facturar? Las vacaciones pagas entran en la cuenta.',
      label: 'Comparar relación de dependencia contra facturar →',
    },
  },
  'calculadora-sac-proporcional': {
    lead: 'Tu SAC proporcional estimado es {value}.',
    meaning: 'Si el proporcional es por una salida, calculá la liquidación completa y cuántos meses te cubre.',
    room: {
      slug: 'me-despidieron',
      hook: '¿El SAC proporcional es por un despido? Hacé la cuenta completa.',
      label: 'Calcular indemnización y meses de sostén →',
    },
  },
};
Object.assign(CTA_BY_CALC, CTA_BY_CALC_T2);

export function getPriorityDecisionCta(calcSlug: string, lang = ''): PriorityDecisionCta | undefined {
  if (lang) return undefined;
  return CTA_BY_CALC[calcSlug];
}

export function sortDecisionLinksByPriority<T extends { href: string }>(links: T[]): T[] {
  return [...links].sort((a, b) => {
    const aSlug = a.href.split('/').filter(Boolean).pop() || '';
    const bSlug = b.href.split('/').filter(Boolean).pop() || '';
    return Number(isPriorityDecision(bSlug)) - Number(isPriorityDecision(aSlug));
  });
}
