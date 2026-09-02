import type { HubData } from './types';

/** Desde el Decreto 1039/2024 ANSES no puede otorgar nuevos créditos con recursos del FGS. */
export const CASE_MATH = { ramas: {}, tope: 0.2, haberMinimo: 0, tnaMercado: 0 };

const AVISO = 'ANSES no está otorgando nuevos créditos con fondos del Fondo de Garantía de Sustentabilidad. Si ya tenés un Crédito ANSES, consultá cuotas y descuentos en Mi ANSES; si recibiste una oferta de otra entidad, verificá el contrato y el costo financiero total.';

export const hub: HubData = {
  slug: 'jubilacion/prestamo-anses',
  title: 'Créditos ANSES: no hay nuevas altas y cómo consultar uno existente',
  description: 'ANSES ya no otorga nuevos créditos con fondos del FGS. Consultá un crédito existente y compará con cuidado una oferta bancaria real.',
  silo: 'Jubilación', siloHref: '/jubilacion', eyebrow: 'Situación vigente',
  h1: '¿ANSES está dando préstamos nuevos?', lede: AVISO,
  stamps: ['Revisado 31-08-2026', 'Sin nuevas altas de Créditos ANSES', 'Fuente oficial ANSES'],
  resultLabel: 'Comparación informativa',
  cases: {
    title: '¿Qué querés revisar?',
    intro: 'La respuesta cambia según sea un crédito viejo o una oferta de un banco u otra entidad.',
    items: [
      {
        id: 'existente', label: 'Tengo un Crédito ANSES existente', hint: 'Saldo, cuotas y descuentos',
        answer: 'No se puede pedir uno nuevo; los créditos anteriores siguen administrándose hasta su cancelación.',
        yes: ['Consultá el estado y las cuotas en Mi ANSES', 'Revisá el descuento en tu recibo de haberes', 'Canalizá cualquier diferencia por los medios oficiales de ANSES'],
        warn: ['No compartas Clave de la Seguridad Social ni códigos por teléfono o mensajería', 'Una publicidad que usa el nombre de ANSES no necesariamente es una oferta de ANSES'],
        plazo: 'Ingresá a Mi ANSES y revisá la sección de Créditos ANSES.',
      },
      {
        id: 'tercero', label: 'Recibí una oferta de otra entidad', hint: 'Banco, fintech o mutual',
        answer: 'Compará el costo financiero total, la cuota y el total a devolver del contrato real.',
        yes: ['Cargá monto, plazo y CFT informados por la entidad', 'Restá la cuota de tu ingreso mensual real'],
        warn: ['La simulación no reemplaza el contrato', 'No uses una tasa de ejemplo para decidir'],
        plazo: 'Pedí la propuesta por escrito antes de entregar datos o aceptar.',
      },
    ],
  },
  inputsTitle: 'Datos de una oferta real', inputsIntro: 'La experiencia visual permite comparar una oferta; no simula un nuevo Crédito ANSES.', fields: [],
  fineprint: 'Estimación informativa. Usá el CFT y las condiciones del contrato emitido por la entidad oferente.',
  chart: { type: 'progress', caption: 'Porcentaje del ingreso mensual que absorbería la cuota.' },
  breakdownTitle: 'Cuota y costo total', breakdownIntro: 'Compará siempre la cuota con el ingreso disponible y el total a devolver.',
  faq: [
    { q: '¿ANSES otorga créditos nuevos en 2026?', a: 'No. ANSES informa que, a partir del Decreto 1039/2024, ya no puede disponer de recursos del FGS para otorgar nuevos créditos.' },
    { q: '¿Qué pasa si ya tengo un Crédito ANSES?', a: 'El crédito existente continúa hasta su cancelación. Podés consultar su estado y descuentos en Mi ANSES.' },
    { q: '¿Hay préstamos nuevos para AUH o SUAF?', a: 'No dentro del programa anterior de Créditos ANSES. No tomes como oficial una oferta que prometa una línea nueva sin confirmarla en anses.gob.ar.' },
    { q: '¿ANSES pide datos por WhatsApp?', a: 'No compartas claves, códigos ni datos bancarios por mensajería. Usá Mi ANSES y los canales oficiales.' },
    { q: '¿Cómo consulto cuotas pendientes?', a: 'Ingresá a Mi ANSES con CUIL y Clave de la Seguridad Social y buscá la información de Créditos ANSES.' },
    { q: '¿La calculadora representa una oferta de ANSES?', a: 'No. Sólo compara matemáticamente una oferta real cuyos datos cargás vos.' },
    { q: '¿Qué tasa tengo que usar?', a: 'Usá el costo financiero total anual informado en el contrato o propuesta formal, no una tasa publicitaria aislada.' },
  ],
  sources: [
    { name: 'ANSES ya no podrá disponer del dinero de los jubilados para otorgar créditos', url: 'https://www.anses.gob.ar/noticias/anses-ya-no-podra-disponer-de-la-plata-de-los-jubilados-para-otorgar-creditos', publisher: 'ANSES', date: '2024-12-10' },
    { name: 'Gestión de Créditos ANSES existentes', url: 'https://www.anses.gob.ar/trabajo/creditos-anses', publisher: 'ANSES' },
  ],
  replaces: ['/calculadora-prestamo-anses-jubilado-argenta-monto', '/calculadora-prestamo-anses-jubilados-monto-cuota-2026', '/calculadora-credito-anses-pre-aprobado-jubilado-cuota', '/calculadora-bono-anses-jubilados-junio-2026-aumento-mensual', '/calculadora-fecha-cobro-anses-cronograma-dni'],
  lastReviewed: '2026-08-31', audience: 'AR',
};
