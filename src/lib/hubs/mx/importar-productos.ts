import type { HubData } from '../types';

const DISCLAIMER =
  'Estimación informativa. La fracción arancelaria, el origen, los tratados, las cuotas compensatorias y las regulaciones no arancelarias pueden cambiar el resultado; validá la operación con ANAM y un agente aduanal.';

export const hub: HubData = {
  slug: 'mx/impuestos/importar-productos',
  title: 'Calculadora de importación a México: IGI, DTA, IVA y costo puesto',
  description: 'Calculá el costo puesto en México de una importación: mercancía, flete, seguro, IGI, DTA, IVA, agente aduanal y costo final por unidad.',
  silo: 'Impuestos',
  siloHref: '/mx/impuestos',
  locale: 'mx',
  eyebrow: 'México · Aduana e importación definitiva',
  h1: '¿Cuánto me cuesta realmente importar un producto a México?',
  lede: 'El precio del proveedor es apenas el comienzo. Esta cuenta arma el valor en aduana, aplica la tasa de IGI que corresponda a tu fracción, suma DTA e IVA en el orden correcto y agrega los gastos operativos para llegar al costo puesto por unidad.',
  stamps: ['Ley Aduanera arts. 64–65', 'IVA de importación · LIVA art. 27', 'Tasas editables por fracción y operación'],
  resultLabel: 'Costo puesto en México',
  cases: {
    title: '¿Qué operación estás estimando?',
    intro: 'La estructura sirve para una importación definitiva comercial o una compra por mensajería. Las tasas quedan editables porque el producto y su origen mandan.',
    items: [
      {
        id: 'comercial', label: 'Importación definitiva comercial', hint: 'Mercancía que permanecerá en México.',
        answer: 'El costo puesto suma valor en aduana, IGI, DTA, IVA y gastos de despacho; el padrón, permisos y NOM se revisan aparte.',
        yes: ['Valor de mercancía convertido a MXN', 'Flete, seguro y gastos incrementables hasta la entrada', 'IGI y DTA con tasas editables', 'IVA sobre la base acumulada', 'Agente, almacenaje, maniobras y costo por unidad'],
        warn: [DISCLAIMER, 'La tasa del IGI depende de la fracción arancelaria y puede cambiar por tratado y certificado de origen', 'No incluye IEPS, cuotas compensatorias, NOM, permisos ni contribuciones sectoriales salvo que las cargues como gastos adicionales'],
        plazo: 'confirmá fracción, origen y regulaciones antes de pagar al proveedor.',
      },
      {
        id: 'mensajeria', label: 'Compra por mensajería o paquetería', hint: 'Envío simplificado de valor acotado.',
        answer: 'La paquetería puede despachar bajo procedimiento simplificado, pero el límite y la tasa aplicable dependen del valor, origen y reglas vigentes.',
        yes: ['Producto, flete y seguro', 'Contribuciones informadas por la paquetería', 'Cargo de manejo y entrega', 'Costo final y costo unitario'],
        warn: [DISCLAIMER, 'El procedimiento simplificado no vuelve exenta la compra', 'Hay mercancías restringidas o excluidas del esquema aunque estén debajo del límite de valor'],
        plazo: 'pedí a la paquetería el desglose aduanero antes de autorizar cargos.',
      },
    ],
  },
  inputsTitle: 'Datos de la operación',
  inputsIntro: 'Usá la cotización real y la tasa correspondiente a la fracción arancelaria. Todos los porcentajes son editables.',
  fields: [
    { id: 'mercanciaUsd', label: 'Valor de la mercancía (USD)', prefix: 'US$', value: 5000, min: 0, step: 0.01 },
    { id: 'fleteUsd', label: 'Flete internacional (USD)', prefix: 'US$', value: 650, min: 0, step: 0.01 },
    { id: 'seguroUsd', label: 'Seguro y otros incrementables (USD)', prefix: 'US$', value: 50, min: 0, step: 0.01 },
    { id: 'tipoCambio', label: 'Tipo de cambio aduanero (MXN por USD)', prefix: '$', value: 18.5, min: 0.01, step: 0.0001, help: 'Usá el tipo de cambio aplicable a la fecha del pedimento.' },
    { id: 'igiPct', label: 'IGI según fracción y origen (%)', suffix: '%', value: 10, min: 0, max: 100, step: 0.01, help: 'No es una tasa universal: confirmala en la TIGIE y con tu agente.' },
    { id: 'dtaPct', label: 'DTA estimado sobre valor en aduana (%)', suffix: '%', value: 0.8, min: 0, max: 20, step: 0.001, help: 'Puede corresponder cuota fija u otro tratamiento; reemplazalo por el dato de tu pedimento.' },
    { id: 'ivaPct', label: 'IVA de importación (%)', suffix: '%', value: 16, min: 0, max: 30, step: 0.01 },
    { id: 'otros', label: 'Agente, almacenaje, maniobras y otros (MXN)', prefix: '$', value: 18000, min: 0, thousands: true },
    { id: 'unidades', label: 'Unidades importadas', value: 100, min: 1, step: 1 },
  ],
  fineprint: DISCLAIMER,
  chart: { type: 'donut', title: 'Cómo se forma el costo puesto', caption: 'Separá el valor del producto de logística, contribuciones y gastos operativos para saber qué variable mueve el costo unitario.' },
  breakdownTitle: 'Del proveedor al costo unitario',
  breakdownIntro: 'El IVA se calcula sobre el valor usado para IGI más el propio IGI y las demás contribuciones aplicables, no solamente sobre la factura del proveedor.',
  faq: [
    { q: '¿Qué es el valor en aduana?', a: 'Como regla general parte del valor de transacción y agrega, cuando corren por cuenta del importador y no están incluidos, flete, seguro, embalaje, manejo y otros incrementables hasta el punto que marca la Ley Aduanera.' },
    { q: '¿El IGI siempre es 10%?', a: 'No. Depende de la fracción arancelaria, el país de origen y la aplicación de tratados o preferencias. El 10% precargado es solo un ejemplo editable.' },
    { q: '¿Sobre qué se calcula el IVA de importación?', a: 'El artículo 27 de la LIVA parte del valor utilizado para el IGI y agrega el propio IGI y las demás contribuciones y aprovechamientos que se pagan con motivo de la importación.' },
    { q: '¿Qué es el DTA?', a: 'Es el Derecho de Trámite Aduanero. Según la operación puede calcularse con una tasa sobre el valor, una cuota fija o un tratamiento particular; por eso el campo debe reemplazarse por el dato aplicable.' },
    { q: '¿El IVA pagado en aduana es siempre un costo?', a: 'Para un negocio puede ser acreditable si cumple los requisitos fiscales y documentales. Aun así exige caja al momento del despacho, por lo que la calculadora lo incluye dentro del desembolso puesto.' },
    { q: '¿Incluye NOM, permisos, IEPS o cuotas compensatorias?', a: 'No de forma automática. Esos conceptos dependen del producto y deben confirmarse antes de comprar. Podés incorporarlos en otros gastos para estimar caja, pero no reemplaza la clasificación formal.' },
    { q: '¿Puedo usarla para importar un auto?', a: 'No es la mejor herramienta: los vehículos agregan ISAN, reglas por año-modelo y requisitos propios. Para eso usá el hub Comprar o vender auto en México.' },
    { q: '¿Qué cambia si compro por paquetería?', a: 'La empresa de mensajería puede usar un procedimiento simplificado dentro de los límites y exclusiones vigentes. Pedile el desglose real porque una tasa global cobrada por la paquetería no siempre coincide con una importación comercial ordinaria.' },
  ],
  sources: [
    { name: 'ANAM — Importación definitiva', url: 'https://www.anam.gob.mx/importacion-definitiva/', publisher: 'Agencia Nacional de Aduanas de México' },
    { name: 'Ley Aduanera vigente — valor en aduana, arts. 64 y 65', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LAdua.pdf', publisher: 'Cámara de Diputados' },
    { name: 'SAT — LIVA, artículo 27: base del IVA en importación', url: 'https://wwwmat.sat.gob.mx/articulo/43379/articulo-27', publisher: 'SAT' },
    { name: 'ANAM — Mensajería y paquetería', url: 'https://www.anam.gob.mx/mensajeria-y-paqueteria/', publisher: 'Agencia Nacional de Aduanas de México' },
  ],
  replaces: ['/calculadora-impuestos-importacion-mexico', '/calculadora-costo-importar-productos-mexico'],
  lastReviewed: '2026-08-16',
};
