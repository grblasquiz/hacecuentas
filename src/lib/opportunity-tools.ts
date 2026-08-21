export type OpportunityTool = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  kind: 'judicial' | 'alta' | 'ecommerce' | 'unitario' | 'cuota' | 'saldo-iibb' | 'convenio' | 'salario-gremio';
  faq: { q: string; a: string }[];
  sources: { label: string; href: string }[];
};

const commonSources = [{ label: 'ARCA — Monotributo', href: 'https://www.arca.gob.ar/monotributo/' }];

export const opportunityTools: OpportunityTool[] = [
  {
    slug: 'legal/actualizacion-sentencias', kind: 'judicial', eyebrow: 'Intereses judiciales · Argentina',
    title: 'Calculadora de actualización de sentencias e intereses judiciales',
    description: 'Actualizá un capital entre dos fechas y compará IPC, tasa judicial e inflación con bandas de ±3%.',
    h1: 'Actualizá una sentencia sin mezclar tasa, inflación y capital.',
    intro: 'Compará métodos sobre la misma deuda. La herramienta muestra el capital actualizado, los intereses y la diferencia entre criterios; la tasa que ordene el expediente siempre prevalece.',
    faq: [
      { q: '¿Qué fecha inicial debo usar?', a: 'La fecha de mora, exigibilidad o la que disponga la sentencia. No siempre coincide con la fecha de inicio del juicio.' },
      { q: '¿IPC e interés son lo mismo?', a: 'No. El IPC conserva poder adquisitivo; el interés remunera la indisponibilidad del dinero y puede incluir otros componentes.' },
      { q: '¿Qué significa inflación más 3%?', a: 'Es una referencia de tasa real: primero se compone la inflación del período y luego un 3% real anual proporcional al plazo.' },
      { q: '¿La calculadora reemplaza una liquidación judicial?', a: 'No. Sirve para comparar escenarios. Una liquidación debe seguir exactamente la sentencia, acordada o resolución aplicable.' },
      { q: '¿Se usa interés simple o compuesto?', a: 'La herramienta permite una aproximación compuesta. El expediente puede ordenar capitalización sólo en supuestos específicos.' },
      { q: '¿Puedo actualizar honorarios?', a: 'Podés simularlos, pero los honorarios pueden tener unidades, tasas y reglas procesales propias.' },
      { q: '¿Qué pasa si el período es menor a un año?', a: 'La tasa anual se prorratea por días usando capitalización proporcional al plazo.' },
    ],
    sources: [
      { label: 'Código Civil y Comercial — intereses', href: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/norma.htm' },
      { label: 'BCRA — principales variables', href: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp' },
      { label: 'INDEC — IPC', href: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31' },
    ],
  },
  {
    slug: 'impuestos/cuando-hacerme-monotributista', kind: 'alta', eyebrow: 'Alta en ARCA · decisión guiada',
    title: '¿Cuándo tengo que hacerme monotributista? Test 2026',
    description: 'Respondé siete preguntas y obtené una orientación sobre cuándo iniciar el alta de monotributo.',
    h1: '¿Ya necesitás el monotributo o todavía estás validando?',
    intro: 'El momento no depende sólo del monto: importan la habitualidad, la primera venta, la habilitación, el canal de cobro y si ya aportás por otro trabajo.',
    faq: [
      { q: '¿Una sola venta obliga a inscribirme?', a: 'La habitualidad y el contexto importan. Si la actividad continuará, conviene ordenar el alta y la facturación desde el inicio.' },
      { q: '¿Mercado Pago informa movimientos?', a: 'Los proveedores de pago cumplen regímenes informativos y de retención; cobrar digitalmente no reemplaza la factura.' },
      { q: '¿Necesito monotributo para habilitar un local?', a: 'Frecuentemente la habilitación requiere CUIT y situación fiscal activa antes de abrir.' },
      { q: '¿Puedo ser empleado y monotributista?', a: 'Sí. Por la actividad independiente podés pagar sólo los componentes que correspondan según tu situación previsional.' },
      { q: '¿Qué pasa si todavía no vendí?', a: 'Podés preparar CUIT, actividad y punto de venta; el momento del alta depende de cuándo comience realmente la actividad y de otros trámites.' },
      { q: '¿Exportar servicios requiere monotributo?', a: 'Una actividad habitual de exportación debe documentarse; además aplican reglas cambiarias y de Factura E.' },
      { q: '¿Este test confirma mi obligación fiscal?', a: 'No. Ordena señales; ARCA, la jurisdicción provincial y un profesional pueden determinar obligaciones adicionales.' },
    ], sources: commonSources,
  },
  {
    slug: 'negocios/costo-fiscal-venta-online', kind: 'ecommerce', eyebrow: 'Ecommerce · precio y margen',
    title: 'Calculadora de costo fiscal y ganancia por venta online',
    description: 'Calculá margen neto descontando costo, comisión, cobro, publicidad, envío, monotributo e Ingresos Brutos.',
    h1: 'De la venta publicada a la ganancia que realmente queda.',
    intro: 'Cargá una operación típica y descubrí qué porcentaje se llevan producto, plataforma, cobro, logística, publicidad e impuestos.',
    faq: [
      { q: '¿La comisión incluye IVA?', a: 'Ingresá el costo final que efectivamente soportás. Si computás crédito fiscal como responsable inscripto, usá el neto recuperable.' },
      { q: '¿Cómo reparto el monotributo por venta?', a: 'Dividí la cuota mensual por la cantidad esperada de ventas. Es una asignación gerencial, no una liquidación fiscal.' },
      { q: '¿Ingresos Brutos se calcula sobre la ganancia?', a: 'En general se aplica sobre ingresos gravados, no sobre el margen, con alícuotas y regímenes provinciales.' },
      { q: '¿Incluyo el envío?', a: 'Sólo la parte que absorbe tu negocio. Si el cliente lo paga íntegramente y no te genera costo, dejalo en cero.' },
      { q: '¿Qué margen debería buscar?', a: 'Depende del rubro, rotación, devoluciones y capital inmovilizado. La calculadora muestra el punto de equilibrio sin fijar un margen universal.' },
      { q: '¿Sirve para Mercado Libre?', a: 'Sí, cargando la comisión total aplicable a la publicación y los costos reales de envío y publicidad.' },
      { q: '¿Contempla devoluciones?', a: 'Podés incorporarlas como un porcentaje adicional dentro de publicidad y otros costos variables.' },
    ], sources: [{ label: 'ARCA — facturación', href: 'https://www.arca.gob.ar/fe/' }, { label: 'Convenio Multilateral', href: 'https://www.ca.gob.ar/' }],
  },
  {
    slug: 'impuestos/precio-unitario-maximo-monotributo', kind: 'unitario', eyebrow: 'Monotributo · venta de bienes',
    title: 'Precio unitario máximo del monotributo 2026',
    description: 'Comprobá si el precio individual de un producto supera el máximo permitido aunque el total de la factura sea mayor.',
    h1: 'El límite mira cada producto, no el total de la factura.',
    intro: 'Cargá hasta tres renglones. Podés emitir una factura total mayor al límite si ningún bien individual lo supera y se cumplen los demás parámetros.',
    faq: [
      { q: '¿El límite se aplica al total de la factura?', a: 'No: para venta de cosas muebles se observa el precio máximo unitario del bien.' },
      { q: '¿Qué pasa si vendo varias unidades?', a: 'Se compara el precio de cada unidad. La cantidad puede llevar el total de la factura por encima del límite.' },
      { q: '¿Aplica a servicios?', a: 'El parámetro de precio unitario máximo corresponde a venta de cosas muebles, no a prestaciones de servicios.' },
      { q: '¿Puedo fraccionar artificialmente un producto?', a: 'No conviene alterar la unidad económica real para eludir un parámetro: ARCA puede revisar la sustancia de la operación.' },
      { q: '¿El valor se actualiza?', a: 'Sí, se actualiza junto con los parámetros del régimen. La herramienta declara la vigencia del dato utilizado.' },
      { q: '¿Superarlo me cambia de categoría?', a: 'No es un salto de categoría: puede producir exclusión del régimen simplificado.' },
      { q: '¿El envío integra el precio unitario?', a: 'Depende de cómo se documente la operación. Separá conceptos reales y verificá el criterio aplicable con un profesional.' },
    ], sources: commonSources,
  },
  {
    slug: 'impuestos/cuota-monotributo-empleado-jubilado', kind: 'cuota', eyebrow: 'Monotributo · excepciones previsionales',
    title: 'Cuota de monotributo para empleado, jubilado o profesional',
    description: 'Estimá qué componentes de la cuota corresponden si ya aportás como empleado, sos jubilado o tenés caja profesional.',
    h1: 'La misma categoría no siempre paga la misma cuota.',
    intro: 'Separá impuesto, jubilación y obra social para entender el importe según tu condición. El portal de ARCA confirma la obligación final.',
    faq: [
      { q: '¿Un empleado paga jubilación dos veces?', a: 'Si aporta en relación de dependencia, normalmente no integra el componente previsional del monotributo por esa actividad.' },
      { q: '¿La obra social es siempre opcional?', a: 'Depende de la condición declarada y del encuadre. La elección y derivación deben quedar correctamente registradas.' },
      { q: '¿Un jubilado puede ser monotributista?', a: 'Sí, con una composición de cuota que puede diferir según el beneficio y la normativa aplicable.' },
      { q: '¿Qué pasa con una caja profesional?', a: 'Los profesionales obligados a una caja provincial pueden tener un tratamiento previsional diferente.' },
      { q: '¿Puedo agregar familiares?', a: 'Sí, cuando corresponde obra social se suma un aporte por cada adherente.' },
      { q: '¿La categoría cambia por ser empleado?', a: 'No. La categoría depende de los parámetros de la actividad; cambia la composición de la cuota.' },
      { q: '¿El resultado es el importe exacto de ARCA?', a: 'Es una estimación por componentes. Confirmalo en la credencial de pago y el portal de ARCA.' },
    ], sources: commonSources,
  },
  {
    slug: 'impuestos/saldo-a-favor-iibb', kind: 'saldo-iibb', eyebrow: 'Ingresos Brutos · pagos a cuenta',
    title: 'Calculadora de saldo a favor de Ingresos Brutos',
    description: 'Proyectá saldo a favor, meses inmovilizados y pérdida real por inflación de retenciones de IIBB.',
    h1: 'Medí cuánto capital te inmovilizan las retenciones de IIBB.',
    intro: 'Compará impuesto determinado con SIRCREB, SIRTAC, SIRCUPA, percepciones y otros pagos a cuenta.',
    faq: [
      { q: '¿Una retención es un impuesto adicional?', a: 'No: normalmente es un pago a cuenta. El problema aparece cuando supera sistemáticamente el impuesto determinado.' },
      { q: '¿Qué es SIRCREB?', a: 'Es un régimen de recaudación sobre acreditaciones bancarias para contribuyentes incluidos en padrones.' },
      { q: '¿Qué es SIRTAC?', a: 'Es un sistema de recaudación sobre cobros mediante tarjetas y otros medios de pago.' },
      { q: '¿Qué es SIRCUPA?', a: 'Es un régimen aplicable a acreditaciones en cuentas de proveedores de servicios de pago.' },
      { q: '¿Por qué el saldo pierde valor?', a: 'Porque queda expresado nominalmente mientras los precios aumentan; la calculadora estima esa erosión.' },
      { q: '¿Puedo pedir devolución o reducción?', a: 'Cada jurisdicción tiene procedimientos de exclusión, reducción, compensación o repetición.' },
      { q: '¿El saldo puede usarse en otra provincia?', a: 'En general queda asociado a la jurisdicción donde se generó; Convenio Multilateral requiere control separado.' },
    ], sources: [{ label: 'Comisión Arbitral — sistemas de recaudación', href: 'https://www.ca.gob.ar/' }],
  },
  {
    slug: 'impuestos/diagnostico-convenio-multilateral', kind: 'convenio', eyebrow: 'IIBB · actividad interjurisdiccional',
    title: '¿Me corresponde Convenio Multilateral? Diagnóstico',
    description: 'Evaluá ventas, gastos, entregas y presencia en otras provincias para detectar señales de Convenio Multilateral.',
    h1: 'Vender a otra provincia no siempre significa lo mismo.',
    intro: 'El diagnóstico ordena indicios de sustento territorial y retenciones. No asigna coeficientes ni reemplaza el análisis registral.',
    faq: [
      { q: '¿Vender por internet obliga siempre al Convenio?', a: 'No automáticamente. Se analiza dónde se desarrolla la actividad y el sustento territorial bajo las reglas vigentes.' },
      { q: '¿Una retención prueba que debo inscribirme?', a: 'Es una señal para revisar, no una conclusión automática.' },
      { q: '¿Qué es sustento territorial?', a: 'Es la conexión relevante entre la actividad del contribuyente y una jurisdicción.' },
      { q: '¿Cómo se reparte la base?', a: 'El régimen general utiliza coeficientes construidos con ingresos y gastos; hay actividades con reglas especiales.' },
      { q: '¿Mercado Libre define mi impuesto?', a: 'La plataforma puede practicar recaudaciones, pero el encuadre surge de la normativa y la actividad real.' },
      { q: '¿Puedo tener saldo a favor en varias provincias?', a: 'Sí. Por eso conviene conciliar retenciones y declaraciones por jurisdicción.' },
      { q: '¿Este test realiza el alta?', a: 'No. Sólo identifica señales y próximos controles antes de realizar cambios registrales.' },
    ], sources: [{ label: 'Convenio Multilateral — texto y organismos', href: 'https://www.ca.gob.ar/' }],
  },
  {
    slug: 'trabajo/salario-real-por-gremio', kind: 'salario-gremio', eyebrow: 'Paritarias · poder adquisitivo',
    title: 'Calculadora de salario real por gremio y paritaria',
    description: 'Compará el básico anterior, el actual y la inflación para saber cuánto recuperó o perdió tu convenio.',
    h1: 'Tu paritaria subió: veamos si recuperó poder de compra.',
    intro: 'Usá los básicos comparables de tu categoría —remunerativo contra remunerativo— y el IPC acumulado del mismo período.',
    faq: [
      { q: '¿Qué sueldo debo comparar?', a: 'Usá la misma categoría y la misma composición: básico con básico o total remunerativo con total remunerativo.' },
      { q: '¿Las sumas no remunerativas cuentan?', a: 'Aumentan el bolsillo, pero no equivalen siempre a una mejora permanente del básico. Conviene mostrarlas por separado.' },
      { q: '¿La inflación se suma?', a: 'No. Los IPC mensuales se componen multiplicativamente.' },
      { q: '¿Qué significa variación real?', a: 'Es el cambio salarial después de descontar la inflación acumulada.' },
      { q: '¿Cómo calculo lo necesario para recuperar?', a: 'Se actualiza el salario inicial por IPC y se compara con el salario actual.' },
      { q: '¿Sirve para empleados fuera de convenio?', a: 'Sí, ingresando remuneraciones comparables del mismo puesto y período.' },
      { q: '¿Incluye Ganancias y descuentos?', a: 'Esta herramienta compara remuneración. Para bolsillo neto usá la calculadora de sueldo bruto a neto.' },
    ], sources: [{ label: 'INDEC — IPC', href: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31' }, { label: 'Ministerio de Capital Humano — convenios', href: 'https://www.argentina.gob.ar/trabajo' }],
  },
];

export const getOpportunityTool = (slug: string) => opportunityTools.find((tool) => tool.slug === slug)!;
