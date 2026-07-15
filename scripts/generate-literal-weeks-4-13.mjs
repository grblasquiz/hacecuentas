import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CALC_DIR = path.join(ROOT, 'src/content/calcs');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const TODAY = '2026-07-15';

const P = (week, key, label, calcSlug, category, angles) => ({ week, key, label, calcSlug, category, angles });
const generic = (label) => [
  `Qué es ${label}`,
  `Cómo calcular ${label}`,
  `${label} con ejemplos paso a paso`,
  `Errores al calcular ${label}`,
  `Preguntas frecuentes sobre ${label}`,
];

const profiles = [
  P(4,'punto-equilibrio','el punto de equilibrio','calculadora-punto-equilibrio-break-even','negocios',['Qué es el punto de equilibrio','Cómo calcular el punto de equilibrio','Punto de equilibrio con ejemplos','Punto de equilibrio para comercios','Errores comunes del punto de equilibrio']),
  P(4,'margen-bruto','el margen bruto','calculadora-gross-margin-vs-net','negocios',['Qué es el margen bruto','Cómo calcular el margen bruto','Margen bruto vs margen neto','Cómo mejorar el margen bruto','Ejemplos de margen bruto']),
  P(4,'margen-neto','el margen neto','calculadora-gross-margin-vs-net','negocios',['Qué es el margen neto','Cómo calcular el margen neto','Margen de ganancias: cómo interpretarlo','Rentabilidad de un negocio y margen neto','Casos reales de margen neto']),
  P(4,'markup','el markup','calculadora-margen-ganancia-markup','negocios',['Qué es el markup','Markup vs margen','Cómo fijar precios con markup','Fórmulas de markup','Ejemplos de markup']),
  P(4,'roi','el ROI','calculadora-roi-inversion','negocios',['Qué es el ROI','Cómo calcular el ROI','ROI en marketing','ROI de inversiones','Casos prácticos de ROI']),

  P(5,'roas','el ROAS','calculadora-roas-retorno-inversion-publicitaria','marketing',['Qué es ROAS','Cómo calcular ROAS','Qué es un buen ROAS','Cómo mejorar el ROAS','Ejemplos de ROAS']),
  P(5,'cac','el CAC','calculadora-cac-ltv-costo-adquisicion-cliente','marketing',['Qué es CAC','Cómo calcular CAC','Cómo reducir el CAC','CAC vs CPA','Casos prácticos de CAC']),
  P(5,'ltv','el LTV','calculadora-cac-ltv-costo-adquisicion-cliente','marketing',['Qué es LTV','Cómo calcular LTV','Cómo mejorar el LTV','LTV vs CAC','Ejemplos de LTV']),
  P(5,'ticket-promedio','el ticket promedio','calculadora-ticket-promedio-ventas','marketing',['Qué es el ticket promedio','Cómo aumentar el ticket promedio','Fórmula del ticket promedio','Casos de uso del ticket promedio','Ejemplos de ticket promedio']),
  P(5,'tasa-conversion','la tasa de conversión','calculadora-tasa-de-conversion','marketing',['Qué es la tasa de conversión','Cómo calcular la tasa de conversión','Cómo mejorar la tasa de conversión','Benchmarks de tasa de conversión','Casos de tasa de conversión']),

  P(6,'monotributo','el monotributo','calculadora-monotributo-2026','impuestos',generic('el monotributo')),
  P(6,'ganancias','el Impuesto a las Ganancias','calculadora-cuarta-categoria-empleado-empresa-argentina','impuestos',generic('el Impuesto a las Ganancias')),
  P(6,'ingresos-brutos','Ingresos Brutos','calculadora-ingresos-brutos-provincial','impuestos',generic('Ingresos Brutos')),
  P(6,'retenciones','las retenciones','calculadora-retencion-afip-cuit-regimen-general','impuestos',generic('las retenciones')),
  P(6,'percepciones','las percepciones impositivas','calculadora-percepciones-impositivas','impuestos',generic('las percepciones impositivas')),

  P(7,'cuota-maxima-ingreso','la cuota máxima según ingreso','calculadora-cuota-maxima-segun-ingreso','finanzas',generic('la cuota máxima según ingreso')),
  P(7,'capacidad-endeudamiento','la capacidad de endeudamiento','calculadora-capacidad-endeudamiento','finanzas',generic('la capacidad de endeudamiento')),
  P(7,'comparador-prestamos','la comparación de préstamos','calculadora-comparador-prestamos','finanzas',generic('la comparación de préstamos')),
  P(7,'simulador-hipotecario','un crédito hipotecario','calculadora-cuota-credito-hipotecario-uva-banco-nacion','finanzas',generic('un crédito hipotecario')),
  P(7,'simulador-prendario','un crédito prendario','calculadora-cuota-prestamo-auto-frances-argentino','finanzas',generic('un crédito prendario')),

  P(8,'aumento-inflacion','un aumento por inflación','calculadora-actualizacion-inflacion-ipc','finanzas',generic('un aumento por inflación')),
  P(8,'poder-compra','el poder de compra','calculadora-inflacion-poder-compra','finanzas',generic('el poder de compra')),
  P(8,'comparador-precios','la comparación de precios','calculadora-comparador-precios','vida',generic('la comparación de precios')),
  P(8,'precio-unidad','el precio por unidad','calculadora-precio-por-unidad','vida',generic('el precio por unidad')),
  P(8,'precio-kilo','el precio por kilo','calculadora-precio-por-kilo-litro','vida',generic('el precio por kilo')),

  P(9,'sac-proporcional','el SAC proporcional','calculadora-sac-proporcional','finanzas',generic('el SAC proporcional')),
  P(9,'antiguedad','la antigüedad laboral','calculadora-antiguedad-laboral','finanzas',generic('la antigüedad laboral')),
  P(9,'horas-nocturnas','las horas nocturnas','calculadora-horas-nocturnas-argentina','finanzas',generic('las horas nocturnas')),
  P(9,'comision-ventas','la comisión por ventas','calculadora-comision-venta-vendedor','negocios',generic('la comisión por ventas')),
  P(9,'costo-laboral','el costo laboral','calculadora-costo-laboral-empleado','negocios',generic('el costo laboral')),

  P(10,'flujo-caja','el flujo de caja','calculadora-flujo-caja-libre-fcf','negocios',generic('el flujo de caja')),
  P(10,'capital-trabajo','el capital de trabajo','calculadora-capital-de-trabajo','negocios',generic('el capital de trabajo')),
  P(10,'rentabilidad-mensual','la rentabilidad mensual','calculadora-rentabilidad-mensual-negocio','negocios',generic('la rentabilidad mensual')),
  P(10,'proyeccion-ventas','la proyección de ventas','calculadora-proyeccion-ventas-crecimiento','negocios',generic('la proyección de ventas')),
  P(10,'costos-fijos-variables','los costos fijos y variables','calculadora-costos-fijos-y-variables','negocios',generic('los costos fijos y variables')),

  P(11,'pintura','la pintura necesaria','calculadora-pintura-por-m2-litros-latas','hogar',generic('la pintura necesaria')),
  P(11,'ceramicos','los cerámicos necesarios','calculadora-pisos-ceramicos-porcellanato-cajas','hogar',generic('los cerámicos necesarios')),
  P(11,'piso-flotante','el piso flotante necesario','calculadora-piso-flotante-m2-tablas','hogar',generic('el piso flotante necesario')),
  P(11,'consumo-electrico','el consumo eléctrico','calculadora-consumo-electrico-kwh-factura-luz','hogar',generic('el consumo eléctrico')),
  P(11,'aire-acondicionado','el aire acondicionado necesario','calculadora-aire-acondicionado-frigorias-ambiente','hogar',generic('el aire acondicionado necesario')),

  P(12,'nota-necesaria','la nota necesaria para aprobar','calculadora-nota-necesaria-aprobar','educacion',generic('la nota necesaria para aprobar')),
  P(12,'promedio-ponderado','el promedio ponderado','calculadora-promedio-ponderado-notas-materias','educacion',generic('el promedio ponderado')),
  P(12,'media','la media estadística','calculadora-media-mediana-moda-rango-estadistica','educacion',generic('la media estadística')),
  P(12,'moda','la moda estadística','calculadora-media-mediana-moda-rango-estadistica','educacion',generic('la moda estadística')),
  P(12,'mediana','la mediana estadística','calculadora-media-mediana-moda-rango-estadistica','educacion',generic('la mediana estadística')),

  P(13,'desvio-estandar','el desvío estándar','calculadora-desvio-estandar-varianza-conjunto','matematica',['Qué es el desvío estándar','Cómo calcular el desvío estándar','Ejemplos de desvío estándar','Aplicaciones del desvío estándar','Errores comunes con el desvío estándar']),
  P(13,'probabilidad','la probabilidad','calculadora-probabilidad-evento','matematica',['Qué es la probabilidad','Cómo calcular probabilidades','Eventos independientes y dependientes','Ejemplos de probabilidad resueltos','Aplicaciones cotidianas de la probabilidad']),
  P(13,'varianza','la varianza','calculadora-desvio-estandar-varianza-conjunto','matematica',['Qué es la varianza','Varianza vs desvío estándar','Fórmulas de varianza','Ejemplos de varianza','Casos prácticos de varianza']),
  P(13,'combinatoria','la combinatoria','calculadora-combinaciones-permutaciones-factorial','matematica',['Principios básicos de combinatoria','Combinaciones con ejemplos','Ejercicios de combinatoria resueltos','Aplicaciones de la combinatoria','Errores frecuentes en combinatoria']),
  P(13,'permutaciones','las permutaciones','calculadora-permutaciones-n-tomados-k-pnk','matematica',['Qué son las permutaciones','Permutaciones vs combinaciones','Fórmulas de permutaciones','Ejemplos de permutaciones resueltos','Casos de uso de permutaciones']),
];

const lenses = {
  'margen-bruto': {
    definition:'El margen bruto mide qué parte de las ventas queda después del costo directo de producir o comprar lo vendido, antes de administración, alquiler, marketing, intereses e impuestos.',
    formula:'Margen bruto = ventas menos costo de ventas. Margen bruto porcentual = margen bruto dividido ventas por cien.',
    example:'Si se vende por 100 y el producto cuesta 60, quedan 40 de margen bruto y el porcentaje es 40%. Ese 40 todavía debe financiar toda la estructura.',
    decision:'Sirve para revisar proveedores, desperdicio, mezcla de productos y precio. No permite afirmar por sí solo que el negocio gana dinero.',
    caution:'No incluyas gastos administrativos dentro del costo de ventas salvo que tu criterio contable los trate consistentemente en todos los períodos.'
  },
  'margen-neto': {
    definition:'El margen neto muestra qué parte de las ventas termina como resultado después de costos directos, estructura, intereses, impuestos y demás gastos del período.',
    formula:'Margen neto porcentual = resultado neto dividido ventas por cien. El numerador debe corresponder al mismo período que las ventas.',
    example:'Con ventas por 100, costo de ventas de 60 y otros gastos por 32, el resultado neto es 8 y el margen neto es 8%.',
    decision:'Permite evaluar la rentabilidad final y comparar períodos del mismo negocio. Una mejora puede venir de precio, volumen, costos o gastos financieros.',
    caution:'Un ingreso extraordinario puede inflar el margen de un mes; separalo del resultado operativo para no proyectarlo como recurrente.'
  },
  'cac': {
    definition:'El CAC es el costo promedio necesario para adquirir un cliente nuevo. Reúne inversión comercial y de marketing atribuible a adquisición.',
    formula:'CAC = costos de adquisición del período divididos clientes nuevos del mismo período.',
    example:'Si se gastan 900.000 pesos y se consiguen 300 clientes nuevos, el CAC es 3.000 pesos por cliente.',
    decision:'Se usa para comparar canales, cohortes y períodos. Debe contrastarse con margen, recuperación y valor del cliente, no sólo con facturación inicial.',
    caution:'No dividas por todos los compradores si parte de ellos ya eran clientes; hacerlo subestima artificialmente el costo de adquisición.'
  },
  'ltv': {
    definition:'El LTV estima el valor económico que un cliente aporta durante su relación con el negocio. Puede expresarse como ingresos o, preferentemente, margen.',
    formula:'Una aproximación es ticket promedio por frecuencia de compra por duración, ajustado por margen bruto cuando se busca compararlo con CAC.',
    example:'Un cliente que compra 20.000 pesos cuatro veces al año durante tres años genera 240.000 de ingresos; con margen de 35%, el valor bruto es 84.000.',
    decision:'Ayuda a definir cuánto se puede invertir en adquisición y retención. Conviene calcularlo por cohorte y no con un promedio que mezcle clientes diferentes.',
    caution:'No supongas una duración futura sin observar retención real; pequeños cambios en churn producen grandes variaciones en el LTV proyectado.'
  },
  'media': {
    definition:'La media aritmética reparte la suma total entre la cantidad de observaciones. Usa todos los valores y por eso reacciona ante extremos.',
    formula:'Media = suma de observaciones dividida cantidad de observaciones.',
    example:'Para 4, 5, 6 y 25, la media es 10. El valor 25 eleva el promedio aunque tres datos estén entre 4 y 6.',
    decision:'Es apropiada cuando la distribución es razonablemente simétrica y cada observación tiene el mismo peso.',
    caution:'Acompañala con mediana, rango o desvío cuando existan valores extremos o grupos con comportamientos distintos.'
  },
  'moda': {
    definition:'La moda es el valor o categoría que aparece con mayor frecuencia. Puede no existir o puede haber más de una.',
    formula:'Se cuentan las frecuencias y se identifica la mayor; no se suman los valores ni se divide por la cantidad.',
    example:'En 2, 2, 3, 4 y 4 hay dos modas: 2 y 4. En una lista sin repeticiones no hay una moda única.',
    decision:'Es especialmente útil para talles, respuestas categóricas, productos vendidos y cualquier dato donde interesa lo más frecuente.',
    caution:'La moda no representa el centro numérico y puede cambiar mucho al agrupar datos continuos en intervalos diferentes.'
  },
  'mediana': {
    definition:'La mediana es el valor central después de ordenar los datos. Deja la mitad de las observaciones a cada lado.',
    formula:'Con cantidad impar se toma el dato central; con cantidad par se promedian los dos valores centrales.',
    example:'En 4, 5, 6 y 25, la mediana es 5,5. A diferencia de la media, el extremo 25 no desplaza tanto el centro.',
    decision:'Resulta útil para ingresos, precios y tiempos con distribuciones asimétricas o valores extremos.',
    caution:'Ordenar es obligatorio; elegir el dato de la posición central en una lista desordenada produce un resultado incorrecto.'
  },
  'desvio-estandar': {
    definition:'El desvío estándar expresa la dispersión típica respecto de la media y conserva la misma unidad que los datos originales.',
    formula:'Es la raíz cuadrada de la varianza. La fórmula cambia en el divisor según se trate de población completa o muestra.',
    example:'Dos grupos pueden tener media 10: 9, 10, 11 tiene poco desvío; 1, 10, 19 tiene mucho más.',
    decision:'Permite comparar estabilidad, variabilidad y riesgo cuando los datos y períodos son comparables.',
    caution:'No interpretes un desvío alto o bajo sin la escala de la variable; para escalas diferentes puede convenir el coeficiente de variación.'
  },
  'varianza': {
    definition:'La varianza resume el promedio de las desviaciones cuadráticas respecto de la media. Su unidad queda elevada al cuadrado.',
    formula:'Se resta la media a cada dato, se eleva cada diferencia al cuadrado, se suman y se divide por N o por N menos uno.',
    example:'En 9, 10 y 11 las desviaciones son -1, 0 y 1; sus cuadrados suman 2. La varianza poblacional es 2/3.',
    decision:'Es fundamental en inferencia, modelos y descomposición de variabilidad, aunque para comunicar resultados suele usarse su raíz: el desvío.',
    caution:'Confundir varianza muestral y poblacional cambia el divisor; documentá cuál usaste antes de comparar resultados.'
  }
};
const angleLenses = {
  'CAC vs CPA':'CAC y CPA no siempre usan el mismo denominador. El CPA puede medir una acción intermedia —registro, lead o compra— mientras el CAC debe terminar en clientes nuevos y sumar todos los costos de adquisición atribuibles. Para compararlos, definí primero qué evento cuenta como adquisición, qué costos entran y qué ventana temporal conecta la campaña con la venta. Un CPA bajo puede convivir con un CAC alto si pocos leads se convierten en clientes.',
  'LTV vs CAC':'La relación LTV/CAC compara valor esperado por cliente contra costo de adquisición. Ambos valores deben usar la misma definición de cliente y, si es posible, margen en lugar de facturación. Una relación alta no garantiza escala: puede esconder un LTV optimista, cohortes antiguas o costos de soporte omitidos. Revisá además los meses necesarios para recuperar el CAC, porque un negocio puede ser rentable en el papel y quedarse sin caja antes del recupero.'
};

const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc = (s='') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const plain = (s='') => String(s).replace(/<[^>]+>/g,' ').replace(/\*\*|`|#+/g,'').replace(/\s+/g,' ').trim();
const para = (s) => s ? `<p>${esc(plain(s))}</p>` : '';
const list = (xs) => `<ul>${xs.filter(Boolean).map(x=>`<li>${esc(plain(x))}</li>`).join('')}</ul>`;
const calcBySlug = new Map();
for (const file of fs.readdirSync(CALC_DIR).filter(f=>f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(CALC_DIR,file),'utf8'));
  calcBySlug.set(data.slug, { file, data });
}
const pruning = fs.readFileSync(path.join(ROOT,'src/lib/pruning-redirects.ts'),'utf8');
const isPublic = (calc) => calc && !calc.noindex && calc.status !== 'draft' && calc.distribution !== 'restricted' && !pruning.includes(`'/${calc.slug}'`) && !pruning.includes(`"/${calc.slug}"`);
const outputLabels = (c) => (c.outputs||[]).map(x=>x.label).filter(Boolean);
const fieldLabels = (c) => (c.fields||[]).map(x=>x.label).filter(Boolean);
const exampleLines = (c) => [c.example?.title,...(c.example?.steps||[]),c.example?.result].filter(Boolean);
const sourceLinks = (c) => (c.sources||[]).slice(0,3).map(s=>`<li><a href="${esc(s.url)}" rel="nofollow noopener">${esc(s.name)}</a></li>`).join('');

function contentFor(p,c,index,title,linkable) {
  const core = [c.answerSnippet,c.intro,c.keyTakeaway,c.explanation].map(plain).filter(Boolean);
  const segment = core[index % Math.max(core.length,1)] || core[0] || c.description || title;
  const fields = fieldLabels(c);
  const outputs = outputLabels(c);
  const uses = (c.useCases||[]).map(x=>typeof x==='string'?x:(x.title||x.description)).filter(Boolean);
  const calcLink = linkable ? `<p>Podés comprobar tus datos en la <a href="/${c.slug}">${esc(c.h1||c.title)}</a>. La herramienta procesa los valores en el navegador y permite repetir escenarios.</p>` : '<p>La herramienta asociada continúa bajo revisión editorial. Mientras tanto, aplicá el procedimiento manual y contrastá cualquier dato normativo con la fuente oficial vigente.</p>';
  const sourceBlock = sourceLinks(c) ? `<h2>Fuentes para verificar</h2><ul>${sourceLinks(c)}</ul>` : '';
  const lens=lenses[p.key];
  const focusBlock=(lens?`<h2>Enfoque específico: ${esc(p.label)}</h2><p>${esc(lens.definition)}</p><p><strong>Fórmula:</strong> ${esc(lens.formula)}</p><p><strong>Ejemplo:</strong> ${esc(lens.example)}</p><p><strong>Decisión:</strong> ${esc(lens.decision)}</p><p><strong>Cuidado:</strong> ${esc(lens.caution)}</p>`:'')+(angleLenses[title]?`<h2>Comparación bien definida</h2><p>${esc(angleLenses[title])}</p>`:'');
  const commonEnd = `${focusBlock}<h2>Control antes de decidir</h2><ol><li>Usá datos del mismo período y la misma unidad.</li><li>Separá valores observados de supuestos.</li><li>Cambiá una sola variable por vez.</li><li>Guardá fecha y fuente de cada dato.</li><li>No interpretes una simulación como garantía.</li></ol>${calcLink}${sourceBlock}`;
  if(index===0) return `${para(c.answerSnippet||c.description)}<h2>Definición en palabras simples</h2>${para(segment)}<p>${esc(title)} sirve para convertir datos dispersos en una medida comparable. El valor aislado no alcanza: hay que leerlo junto con el período, la unidad y el objetivo del análisis.</p><h2>Qué datos intervienen</h2>${list(fields.length?fields:['Dato base','Período de análisis','Supuesto de comparación'])}<h2>Cómo interpretar el resultado</h2>${list((outputs.length?outputs:['Resultado principal','Desglose','Escenario']).map(x=>`${x}: revisalo contra el dato base y no contra una expectativa sin documentar.`))}<h2>Qué no significa</h2><p>Un resultado favorable no demuestra por sí solo que una decisión sea sostenible. Puede haber impuestos, costos indirectos, estacionalidad, límites legales o cambios futuros que la cuenta no incorpore.</p>${commonEnd}`;
  if(index===1) return `<p>${esc(title)} exige definir primero la base de cálculo. Si mezclás períodos o unidades, una fórmula correcta produce una conclusión equivocada.</p><h2>Datos necesarios</h2>${list(fields)}<h2>Procedimiento paso a paso</h2>${list((c.howToSteps||[]).map(x=>typeof x==='string'?x:(x.text||x.name)).filter(Boolean).concat(['Revisá que ningún divisor sea cero y que las tasas estén expresadas en la misma frecuencia.','Calculá el escenario base antes de probar alternativas.']))}<h2>Fórmula e interpretación</h2>${para(segment)}<p>Después de calcular, comprobá si el resultado vuelve a producir los datos originales. Ese control inverso detecta errores de carga, porcentajes expresados como enteros y redondeos prematuros.</p><h2>Resultados que conviene guardar</h2>${list(outputs)}${commonEnd}`;
  if(index===2) return `<p>Los ejemplos permiten ver dónde entra cada dato y cómo cambia el resultado. Este caso usa cifras ilustrativas: reemplazalas por tus valores y conservá el mismo orden.</p><h2>Caso resuelto</h2>${list(exampleLines(c))}<h2>Qué enseña el ejemplo</h2>${para(segment)}<p>El paso más importante es identificar qué variable explica la mayor parte del cambio. Repetí el cálculo con un escenario conservador, uno central y uno exigente; no cambies todas las variables al mismo tiempo.</p><h2>Variaciones para practicar</h2>${list((uses.length?uses:['Reducir el dato principal un 10%','Aumentar el costo un 10%','Extender el período']).slice(0,5))}<h2>Cómo validar el resultado</h2><p>Compará el orden de magnitud con una cuenta rápida, verificá unidades y revisá el redondeo sólo al final. Si el resultado es sensible a una variación pequeña, usá un margen de seguridad.</p>${commonEnd}`;
  if(index===3) return `<p>${esc(title)} no se resuelve mirando un único número. Conviene comparar escenarios y entender qué palanca modifica el resultado sin trasladar el problema a otro indicador.</p><h2>Aplicación práctica</h2>${para(segment)}<h2>Escenarios recomendados</h2><table><thead><tr><th>Escenario</th><th>Qué mantener</th><th>Qué variar</th></tr></thead><tbody><tr><td>Conservador</td><td>Período y unidad</td><td>Menor ingreso o mayor costo</td></tr><tr><td>Central</td><td>Metodología</td><td>Datos más probables</td></tr><tr><td>Exigente</td><td>Base comparable</td><td>Mejor desempeño razonable</td></tr></tbody></table><h2>Palancas para mejorar</h2>${list(fields.slice(0,5).map(x=>`Revisar ${x.toLowerCase()} sin modificar simultáneamente las demás variables.`))}<h2>Cuándo volver a calcular</h2><p>Recalculá cuando cambie un precio, una tasa, un ingreso, el volumen, el plazo o una norma aplicable. En variables mensuales, compará al menos tres períodos para evitar conclusiones por un dato excepcional.</p>${commonEnd}`;
  const faq = (c.faq||[]).slice(0,7);
  return `<p>Los errores en ${esc(p.label)} suelen aparecer antes de aplicar la fórmula: datos incompletos, períodos mezclados o supuestos tratados como hechos.</p><h2>Errores frecuentes</h2>${list(['Mezclar valores mensuales con anuales.','Comparar unidades o monedas distintas.','Omitir costos pequeños pero recurrentes.','Redondear antes del último paso.','Usar un benchmark como regla universal.','No guardar la fecha de los datos.','Confundir estimación con garantía.'])}<h2>Preguntas y respuestas</h2>${faq.map(x=>`<h3>${esc(x.q)}</h3>${para(x.a)}`).join('')}<h2>Lista de revisión</h2>${list(fields.concat(outputs).slice(0,7).map(x=>`Confirmar ${x.toLowerCase()}.`))}${para(segment)}${commonEnd}`;
}

const reportPath=path.join(ROOT,'reports','semanas-4-13-articulos-manifest.json');
if (process.argv.includes('--rebuild') && fs.existsSync(reportPath)) {
  const previous=JSON.parse(fs.readFileSync(reportPath,'utf8'));
  for (const item of previous.items||[]) {
    if (item.status !== 'created') continue;
    const oldFile=path.join(BLOG_DIR,`${item.slug}.json`);
    if (fs.existsSync(oldFile)) {
      const old=JSON.parse(fs.readFileSync(oldFile,'utf8'));
      if (old.lastReviewed===TODAY && old.author==='Hacé Cuentas') fs.unlinkSync(oldFile);
    }
  }
}
const existingSlugs = new Set(fs.readdirSync(BLOG_DIR).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(BLOG_DIR,f))).slug));
let created=0, skipped=0;
const manifest=[];
for (const p of profiles) {
  const entry = calcBySlug.get(p.calcSlug);
  if (!entry) throw new Error(`Calculadora inexistente para ${p.key}: ${p.calcSlug}`);
  const c=entry.data;
  for (let index=0; index<5; index++) {
    const title=p.angles[index];
    const baseSlug=slugify(title);
    const slug=existingSlugs.has(baseSlug)?`${baseSlug}-guia-practica`:baseSlug;
    const file=path.join(BLOG_DIR,`${slug}.json`);
    if(existingSlugs.has(slug)||fs.existsSync(file)){skipped++;manifest.push({week:p.week,profile:p.key,title,slug,status:'existing'});continue;}
    const related=isPublic(c)?[c.slug]:[];
    const faq=(c.faq||[]).slice(0,7).map((x,faqIndex)=>({
      q:`${plain(x.q).replace(/\?$/,'')} — aplicado a “${title}”?`,
      a:`${plain(x.a)} Para este análisis de ${p.label}, verificá especialmente ${fieldLabels(c)[faqIndex % Math.max(fieldLabels(c).length,1)]?.toLowerCase()||'el período y la unidad'}.`,
    }));
    while(faq.length<7){const n=faq.length+1;faq.push({q:`¿Qué debo revisar antes del paso ${n}?`,a:`Revisá período, unidad, fuente y supuestos antes de usar el resultado de ${p.label}.`});}
    const article={
      slug,title,
      description:`Guía práctica sobre ${p.label}: definición, cálculo, ejemplos, controles y errores que conviene evitar.`,
      answerSnippet:plain(c.answerSnippet||c.keyTakeaway||c.description).slice(0,300),
      lastReviewed:TODAY,
      seoKeywords:[slugify(title).replace(/-/g,' '),p.label.replace(/^(el|la|los|las|un) /,''),`semana ${p.week}`],
      category:p.category,date:TODAY,updatedDate:TODAY,author:'Hacé Cuentas',readingTime:7,heroEmoji:c.icon||'🧮',
      content:contentFor(p,c,index,title,related.length>0),relatedCalcs:related,faq,
    };
    fs.writeFileSync(file,JSON.stringify(article,null,2)+'\n');
    existingSlugs.add(slug);created++;manifest.push({week:p.week,profile:p.key,title,slug,status:'created',related:related[0]||null,chars:article.content.length});
  }
}
fs.writeFileSync(reportPath,JSON.stringify({generatedAt:new Date().toISOString(),profiles:profiles.length,planned:profiles.length*5,created,skipped,items:manifest},null,2)+'\n');
console.log(`[weeks-4-13] profiles=${profiles.length} planned=${profiles.length*5} created=${created} existing=${skipped}`);
console.log(`[weeks-4-13] manifest=${reportPath}`);
