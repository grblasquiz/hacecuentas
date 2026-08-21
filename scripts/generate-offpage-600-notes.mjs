/**
 * Genera los lotes de notas off-page que faltan alrededor de los hubs.
 *
 * El texto se construye desde el título, descripción, categoría, mercado y
 * URL reales del índice vigente. No inventa cifras ni testimonios: las notas
 * usan un caso ilustrativo explícito y remiten a fuentes oficiales para los
 * datos variables. Las 30 hubs ya cubiertas por offpage-150 se preservan.
 *
 * Uso:
 *   node scripts/generate-offpage-600-notes.mjs
 *   node scripts/generate-offpage-600-notes.mjs --batch-size 10
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'docs', 'backlinks', 'offpage-600', 'batches');
const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lib/current-tools-index.json'), 'utf8'));
const importMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/backlinks/offpage-150/blog-import-map.json'), 'utf8'));
const done = new Set(importMap.posts.map((post) => post.primaryHub));
const batchSizeArg = Number(process.argv[process.argv.indexOf('--batch-size') + 1]);
const batchSize = Number.isFinite(batchSizeArg) && batchSizeArg > 0 ? batchSizeArg : 10;

const sourceSets = {
  ar: [
    ['Portal oficial del Estado argentino', 'https://www.argentina.gob.ar/'],
    ['INDEC — Instituto Nacional de Estadística y Censos', 'https://www.indec.gob.ar/'],
  ],
  cl: [
    ['Servicio de Impuestos Internos de Chile', 'https://www.sii.cl/'],
    ['Banco Central de Chile', 'https://www.bcentral.cl/'],
  ],
  co: [
    ['DIAN — Dirección de Impuestos y Aduanas Nacionales', 'https://www.dian.gov.co/'],
    ['DANE — Departamento Administrativo Nacional de Estadística', 'https://www.dane.gov.co/'],
  ],
  mx: [
    ['SAT — Servicio de Administración Tributaria', 'https://www.sat.gob.mx/'],
    ['INEGI — Instituto Nacional de Estadística y Geografía', 'https://www.inegi.org.mx/'],
  ],
  py: [
    ['DNIT Paraguay', 'https://www.dnit.gov.py/'],
    ['Banco Central del Paraguay', 'https://www.bcp.gov.py/'],
  ],
  uy: [
    ['DGI Uruguay', 'https://www.gub.uy/direccion-general-impositiva/'],
    ['Instituto Nacional de Estadística de Uruguay', 'https://www.gub.uy/instituto-nacional-estadistica/'],
  ],
  pe: [
    ['SUNAT Perú', 'https://www.sunat.gob.pe/'],
    ['Instituto Nacional de Estadística e Informática', 'https://www.inei.gob.pe/'],
  ],
  ec: [
    ['SRI Ecuador', 'https://www.sri.gob.ec/'],
    ['Instituto Nacional de Estadística y Censos de Ecuador', 'https://www.ecuadorencifras.gob.ec/'],
  ],
  ve: [
    ['SENIAT Venezuela', 'http://www.seniat.gob.ve/'],
    ['Banco Central de Venezuela', 'http://www.bcv.org.ve/'],
  ],
  br: [
    ['Portal gov.br', 'https://www.gov.br/'],
    ['IBGE Brasil', 'https://www.ibge.gov.br/'],
  ],
  pt: [
    ['Portal ePortugal', 'https://eportugal.gov.pt/'],
    ['Instituto Nacional de Estatística de Portugal', 'https://www.ine.pt/'],
  ],
  en: [
    ['U.S. government portal', 'https://www.usa.gov/'],
    ['U.S. Bureau of Labor Statistics', 'https://www.bls.gov/'],
  ],
};

function marketKey(locale = '', audience = '') {
  const value = `${locale} ${audience}`.toLowerCase();
  for (const key of Object.keys(sourceSets)) if (value.includes(key)) return key;
  return locale.toLowerCase().startsWith('pt') ? 'pt' : locale.toLowerCase().startsWith('en') ? 'en' : 'ar';
}

function cleanTitle(title) {
  return title.replace(/\s+[—-]\s+calculadoras y guías$/i, '').trim();
}

function shortName(title) {
  return cleanTitle(title).replace(/\s+/g, ' ').trim();
}

function esc(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function sources(tool) {
  return sourceSets[marketKey(tool.locale, tool.audience)].map(([name, url]) => `- [${name}](${url}) — consultar la versión vigente del dato o la norma antes de publicar.`).join('\n');
}

function faq(name, hub) {
  return `## Preguntas frecuentes

### ¿Qué resuelve esta nota sobre ${name}?

Ayuda a ordenar las variables que conviene revisar antes de usar el resultado de la herramienta. La cuenta es orientativa: la conclusión cambia si cambian los datos de entrada, la jurisdicción o la fecha.

### ¿La calculadora reemplaza una fuente oficial?

No. La herramienta organiza una estimación y muestra la lógica del cálculo. Para importes, tasas, requisitos o normas vigentes, contrastá siempre con el organismo responsable del país correspondiente.

### ¿Qué hago si mi caso no coincide con el ejemplo?

Usá el ejemplo sólo para entender el método. Cargá tus propios datos, anotá los supuestos y separá los conceptos que no estén contemplados. Si el resultado puede tener consecuencias fiscales, laborales, legales o de salud, validalo con un profesional.

### ¿Dónde puedo ver el cálculo completo?

  Podés abrir el [hub de ${esc(name)}](${hub}), revisar sus entradas, escenarios, fuentes y la explicación del resultado antes de tomar una decisión.`;
}

function domainAdvice(tool, name) {
  const category = `${tool.category} ${tool.title} ${tool.description}`.toLowerCase();
  if (/salud|nutric|embaraz|calor|peso|fitness|cuerpo|entren|sueño/.test(category)) {
    return `En temas de salud, el número funciona como una referencia para conversar y no como diagnóstico. Conviene registrar edad, sexo o etapa vital cuando la herramienta los pida, separar mediciones de laboratorio de estimaciones y evitar comparar resultados obtenidos con métodos distintos. Un rango poblacional tampoco describe por sí solo la situación de una persona: síntomas, antecedentes, medicación y objetivos pueden cambiar la interpretación. Si el resultado es inesperado, si hay dolor, embarazo, una enfermedad previa o una señal de alarma, la siguiente acción no es ajustar la cifra a mano sino consultar a un profesional. La nota y el [hub de ${esc(name)}](${tool.url.replace('https://hacecuentas.com', '')}) sirven para preparar esa conversación con datos ordenados.`;
  }
  if (/impuesto|tribut|renta|monotrib|iva|ganancia|fiscal|salario|sueldo|trabajo|despido|empleo|pensión|pension|jubil|laboral/.test(category)) {
    return `En temas laborales, previsionales o fiscales, la fecha y la jurisdicción son parte de la fórmula. El mismo nombre puede referirse a una escala, convenio o régimen diferente según el país, la provincia, la actividad y el período liquidado. Por eso conviene guardar el recibo, la constancia de inscripción, el contrato o la resolución que respalda cada dato, y no copiar un porcentaje de otra calculadora sin verificar su alcance. Cuando exista una presentación, una liquidación o un plazo para reclamar, la estimación ayuda a detectar preguntas y diferencias, pero no reemplaza la revisión de un contador, abogado o profesional previsional. El [hub de ${esc(name)}](${tool.url.replace('https://hacecuentas.com', '')}) debe ser el punto de partida para documentar el caso, no la única fuente.`;
  }
  if (/constru|obra|ladrillo|madera|piso|hormig|techo|pintura|jardín|huerta|casa|vivienda|alquiler|auto|nafta|vehículo|patente|viaje/.test(category)) {
    return `En decisiones de obra, vivienda, movilidad o viajes, el costo visible rara vez es el costo total. Sumá desperdicio, mantenimiento, traslado, tiempo, seguros, impuestos, herramientas, financiación y el costo de corregir un error. También anotá la unidad exacta: metro cuadrado no es metro lineal, una tarifa por viaje no es un costo mensual y el consumo nominal del vehículo puede diferir del uso real. La mejor práctica es conservar un escenario base y un margen prudente, explicando qué rubros quedaron afuera. Así el [hub de ${esc(name)}](${tool.url.replace('https://hacecuentas.com', '')}) permite comparar presupuestos y no sólo producir una cifra atractiva.`;
  }
  if (/matem|estadíst|álgebra|algebra|educación|estudio|nota|idioma|probab|geometr|conversor/.test(category)) {
    return `En temas matemáticos o educativos, la autoridad está en mostrar el procedimiento y las condiciones de uso. Antes de aceptar un resultado, identificá qué representa cada variable, qué unidades admite y qué supuesto hace la fórmula. Probá un caso sencillo que puedas resolver a mano y después uno límite: cero, valores negativos, una fecha de corte o una cantidad máxima. Si dos métodos dan respuestas distintas, no elijas el que confirma tu intuición; buscá qué definición o redondeo cambia entre ambos. El [hub de ${esc(name)}](${tool.url.replace('https://hacecuentas.com', '')}) es más útil cuando lo usás para entender el camino y no sólo para copiar la respuesta.`;
  }
  return `En cualquier cálculo cotidiano, la calidad de la respuesta depende de que las entradas sean comparables. Separá lo que sabés de lo que estás suponiendo, anotá la fecha de cada valor y definí qué decisión querés tomar con el resultado. Después probá una alternativa: un plazo distinto, un costo adicional, una cantidad menor o un escenario más conservador. Si el resultado cambia demasiado, esa sensibilidad es información valiosa y señala qué dato falta confirmar. El [hub de ${esc(name)}](${tool.url.replace('https://hacecuentas.com', '')}) te permite volver sobre la fórmula, revisar el desglose y guardar una versión reproducible del cálculo.`;
}

function deepening(tool, name, hub, angle) {
  const domain = domainAdvice(tool, name);
  const blocks = {
    guia: `## Cómo convertir el resultado en una decisión accionable

${domain}

Una forma práctica de trabajar es armar una ficha de decisión. En la primera línea escribí la pregunta; debajo, los datos que son hechos y los que son supuestos; después, el resultado principal y dos resultados secundarios que puedan cambiar la elección. Cerrá la ficha con una fecha de revisión y una condición de salida: qué tendría que pasar para volver a calcular. Este registro evita que una cifra de hoy se use como si fuera válida para siempre.

También conviene distinguir entre un umbral y un objetivo. Un umbral marca lo que no podés superar; un objetivo expresa lo que te gustaría lograr. Si el número queda cerca del umbral, no tomes la decisión con redondeos optimistas: usá el supuesto prudente y dejá margen para gastos no incluidos.`,
    errores: `## Qué revisar cuando la cuenta no coincide

${domain}

Si el resultado de ${esc(name)} no coincide con otro sitio, compará las entradas antes de comparar las fórmulas. Revisá período, moneda, unidad, redondeo, impuestos incluidos y si una fuente usa un valor actualizado. Muchas diferencias que parecen errores son en realidad definiciones distintas: bruto contra neto, precio unitario contra total, promedio contra mediana o fecha de inicio contra fecha de actualización.

Después repetí la cuenta con un ejemplo pequeño y documentá cada paso. Si la diferencia aparece en el primer paso, el problema está en el dato; si aparece al final, buscá una conversión, un redondeo o un costo omitido. No corrijas el resultado para que coincida con una expectativa previa: corregí el supuesto que puedas demostrar.`,
    caso: `## La parte difícil no fue hacer la cuenta

${domain}

En un caso real, ordenar la información suele llevar más tiempo que apretar el botón de calcular. La persona del ejemplo tuvo que decidir qué comprobante era válido, qué fecha usar y qué costos no estaban en la primera cifra. Esa tarea es generalizable: antes de buscar precisión decimal, hay que lograr que los datos representen la misma situación.

Una vez que la tabla estuvo completa, comparó el escenario base con una alternativa prudente. No buscó una promesa de resultado; buscó saber qué variable dominaba la decisión y qué dato debía monitorear. Esa es una buena señal de uso: la herramienta no elimina la incertidumbre, pero la vuelve visible y permite actuar sobre ella.`,
    comparacion: `## Cómo ponderar las diferencias entre alternativas

${domain}

No todas las dimensiones tienen el mismo peso. Una opción puede ser más barata pero exigir más tiempo; otra puede costar más pero reducir riesgo; una tercera puede ser reversible y otra dejarte atado durante meses. Antes de sumar puntajes, definí qué variables son límites duros y cuáles son preferencias. Un costo obligatorio no debería compensarse con una ventaja que no vas a usar.

Si necesitás una regla simple, asigná a cada alternativa un resultado principal, dos costos secundarios, un plazo y un riesgo. Explicá qué dato podría cambiar el orden. Esa explicación vale más que un ranking sin contexto y hace que la comparación se pueda actualizar cuando cambien las condiciones.`,
    actualizacion: `## Registro de cambios y fecha de revisión

${domain}

Una actualización responsable no consiste en reemplazar un número viejo por uno nuevo sin contexto. Anotá qué cambió, desde cuándo rige, quién lo publicó y qué parte de la fórmula afecta. Si la fuente ofrece una serie histórica, conservá el dato anterior para poder entender por qué también cambió el resultado.

Cuando una regla todavía está en discusión o una cifra se publica con retraso, marcá esa incertidumbre en lugar de rellenarla con una proyección. Separá el valor oficial de una hipótesis y etiquetá cualquier escenario futuro como estimación. Esa trazabilidad permite que otra persona revise el [hub de ${esc(name)}](${hub}) y replique la cuenta sin depender de una interpretación escondida.`,
  };
  return blocks[angle];
}

function practicalChecklist(tool, name, hub, angle) {
  const prompts = {
    guia: ['¿Cuál es la decisión concreta?', '¿Qué dato tiene comprobante?', '¿Qué supuesto puede cambiar?', '¿Qué límite no quiero superar?', '¿Cuándo voy a recalcular?'],
    errores: ['¿Estoy usando la fecha correcta?', '¿La unidad y la moneda coinciden?', '¿Hay impuestos o costos ocultos?', '¿La regla aplica a mi jurisdicción?', '¿Qué diferencia aparece al probar un caso simple?'],
    caso: ['¿Qué sabía la persona al empezar?', '¿Qué documento confirmó cada dato?', '¿Qué alternativa comparó?', '¿Qué quedó fuera del cálculo?', '¿Qué decisión tomó y qué debe monitorear?'],
    comparacion: ['¿Qué opciones son realmente comparables?', '¿Cuál es el costo total de cada una?', '¿Qué plazo y compromiso agrega?', '¿Qué riesgo no aparece en el precio?', '¿Cuál es el punto de indiferencia?'],
    actualizacion: ['¿Qué valor cambió?', '¿Desde qué fecha rige?', '¿Qué organismo lo publicó?', '¿A qué casos alcanza?', '¿Qué parte de la cuenta debo volver a revisar?'],
  };
  const lines = prompts[angle].map((q) => `- **${q}** Escribí una respuesta breve y agregá el documento, fecha o supuesto que la respalda.`).join('\n');
  return `## Checklist antes de compartir el resultado

Antes de enviar una cifra por mensaje, usarla en un presupuesto o convertirla en una decisión, hacé este control. No busca que el cálculo parezca más complejo: busca que otra persona pueda entender qué significa y repetirlo con sus propios datos.

${lines}

Si una respuesta queda en blanco, no la tapes con un promedio genérico. Marcá el dato como pendiente y comunicá qué parte de la estimación puede cambiar. En decisiones reversibles podés avanzar con un escenario prudente; en compromisos largos, pagos importantes o temas YMYL conviene confirmar primero. El [hub de ${esc(name)}](${hub}) ayuda a volver a la misma fórmula cuando cambie una entrada, pero la responsabilidad de elegir datos válidos sigue siendo de quien usa el resultado.

Un último control útil es leer la conclusión en voz alta: si sólo dice “conviene” o “no conviene” sin explicar bajo qué condiciones, falta contexto. Una recomendación sólida debería poder expresarse como “conviene si…”, “no conviene cuando…” o “el punto de cambio aparece cuando…”.`;
}

function noteGuide(tool, hub) {
  const name = shortName(tool.title);
  return `# Cómo tomar mejores decisiones con ${name}

${tool.description} Esta guía explica qué mirar antes de convertir un número en una decisión.

## La pregunta que conviene responder primero

Antes de cargar datos, escribí la decisión en una frase: qué querés comparar, qué límite no querés superar o qué resultado necesitás conseguir. Esa formulación evita mezclar variables distintas y ayuda a elegir el escenario correcto dentro del [hub de ${esc(name)}](${hub}).

## Los datos que cambian el resultado

Separá tres grupos: datos personales o del caso, valores que dependen del mercado y reglas que dependen de una fecha o jurisdicción. Los primeros salen de tus comprobantes; los segundos deben tener fecha; los terceros se verifican en una fuente oficial. No reemplaces un dato faltante por un promedio si ese supuesto puede cambiar la conclusión.

## Cómo leer una estimación

Mirá primero el resultado principal y después el desglose. Probá un escenario conservador y otro exigente: si la recomendación se mantiene, es más robusta; si cambia, el punto de quiebre es la información que tenés que investigar mejor. Guardá la fecha, los valores usados y cualquier exclusión.

## Qué conviene guardar

Conservá una captura o anotación del cálculo, los comprobantes de origen y los enlaces consultados. Si volvés a usar la herramienta dentro de unos meses, vas a poder distinguir un cambio de tus datos de un cambio en la normativa o en el mercado.

${deepening(tool, name, hub, 'guia')}

${practicalChecklist(tool, name, hub, 'guia')}

${faq(name, hub)}

## Fuentes de referencia

${sources(tool)}

**Meta description:** Guía para ordenar los datos, comparar escenarios y usar una estimación de ${name} con supuestos claros y fuentes verificables.`;
}

function noteErrors(tool, hub) {
  const name = shortName(tool.title);
  const errors = [
    'cargar un dato de otra fecha sin anotarlo',
    'confundir el resultado bruto con el resultado final',
    'mezclar unidades, monedas o períodos',
    'usar una regla de otra jurisdicción',
    'ignorar costos o condiciones que aparecen fuera del precio principal',
    'tratar un caso excepcional como si fuera el escenario estándar',
    'tomar una estimación como asesoramiento profesional',
  ];
  return `# 7 errores frecuentes al calcular ${name}

${tool.description} La mayoría de los problemas no aparece por una multiplicación mal hecha, sino por cargar datos que no son comparables o leer el resultado fuera de contexto.

## Los siete errores que conviene controlar

${errors.map((error, index) => `### ${index + 1}. ${error[0].toUpperCase() + error.slice(1)}

Antes de aceptar el resultado, revisá si el dato pertenece al mismo período, si está expresado en la unidad correcta y si corresponde al país o régimen de tu caso. Si no podés justificarlo con un comprobante o una fuente, marcá el supuesto en vez de ocultarlo.`).join('\n\n')}

## Un control simple antes de decidir

Repetí el cálculo modificando una sola variable importante. Esa prueba de sensibilidad muestra si una diferencia pequeña cambia mucho la respuesta. Cuando eso ocurre, el resultado no debería comunicarse como una certeza: conviene pedir el dato faltante o comparar alternativas.

Volvé al [hub de ${esc(name)}](${hub}) para probar ese escenario alternativo y revisar qué supuestos quedan visibles en el desglose.

${deepening(tool, name, hub, 'errores')}

${practicalChecklist(tool, name, hub, 'errores')}

${faq(name, hub)}

## Fuentes de referencia

${sources(tool)}

**Meta description:** Siete errores frecuentes al usar ${name}, con controles para evitar datos desactualizados, unidades mezcladas y conclusiones demasiado seguras.`;
}

function noteCase(tool, hub) {
  const name = shortName(tool.title);
  return `# Caso ilustrativo: cómo ordenar ${name} con números

Este caso es ficticio y sirve para mostrar un método de trabajo; no es un testimonio ni una recomendación para todos los casos. La persona del ejemplo empieza con una duda concreta: ${tool.description.toLowerCase()}

## Primero separó hechos de supuestos

Armó una tabla con tres columnas: dato, fuente y fecha. En la primera puso sólo información que podía comprobar; en la segunda anotó recibos, contratos, registros o páginas oficiales; en la tercera dejó claro cuándo podía cambiar el valor. Lo que no sabía quedó como supuesto editable.

## Después comparó dos escenarios

En lugar de buscar un único número, cargó un escenario base y otro prudente. En ambos mantuvo la misma unidad y período. La diferencia entre resultados le mostró qué variable tenía más peso y qué pregunta debía resolver antes de avanzar.

## Finalmente documentó la decisión

Guardó el resultado del [hub de ${esc(name)}](${hub}), la fecha de consulta y los enlaces utilizados. También escribió qué no incluía la estimación. Ese último paso es importante: una cuenta transparente se puede revisar; una cifra sin supuestos no.

## Qué se puede aprender del caso

El valor de la herramienta no está sólo en el número final. También está en hacer visibles los costos, límites, plazos y condiciones que suelen quedar escondidos. Si el caso incluye una norma, un diagnóstico o un compromiso financiero relevante, la estimación debe ser el punto de partida de una revisión más especializada.

${deepening(tool, name, hub, 'caso')}

${practicalChecklist(tool, name, hub, 'caso')}

${faq(name, hub)}

## Fuentes de referencia

${sources(tool)}

**Meta description:** Caso ilustrativo para ordenar datos, escenarios y supuestos antes de usar ${name}; incluye límites y fuentes a verificar.`;
}

function noteComparison(tool, hub) {
  const name = shortName(tool.title);
  return `# ${name}: qué comparar antes de decidir

${tool.description} Comparar sólo el primer importe suele ocultar diferencias de plazo, riesgo, liquidez, requisitos o costos secundarios.

## La comparación mínima

| Dimensión | Opción A | Opción B |
|---|---|---|
| Costo o resultado principal | Cargar el dato del caso | Cargar el dato del caso |
| Costos secundarios | Identificar y fechar | Identificar y fechar |
| Plazo y compromiso | Anotar duración | Anotar duración |
| Riesgo o incertidumbre | Explicitar supuesto | Explicitar supuesto |
| Condición para que convenga | Definir umbral | Definir umbral |

La tabla no reemplaza los datos: sirve para impedir que una alternativa gane sólo porque tiene un precio inicial más atractivo.

## Cuándo la diferencia es realmente importante

Una diferencia pequeña puede no justificar un cambio si la opción nueva agrega complejidad o riesgo. Una diferencia grande tampoco alcanza si depende de un supuesto que no podés verificar. Usá el [hub de ${esc(name)}](${hub}) para llevar ambos caminos a la misma unidad y período.

## El punto de indiferencia

Buscá el umbral que hace iguales a las dos opciones: un ingreso, una tasa, una cantidad, un plazo o un costo adicional. Ese número es más útil que una recomendación universal porque te permite actualizar la decisión cuando cambien tus datos.

${deepening(tool, name, hub, 'comparacion')}

${practicalChecklist(tool, name, hub, 'comparacion')}

${faq(name, hub)}

## Fuentes de referencia

${sources(tool)}

**Meta description:** Qué comparar antes de decidir con ${name}: costos visibles y ocultos, plazos, riesgos, supuestos y punto de indiferencia.`;
}

function noteUpdate(tool, hub) {
  const name = shortName(tool.title);
  return `# ${name} en 2026: qué revisar antes de usar el resultado

Esta nota no fija cifras que pueden cambiar. Explica cómo actualizar la cuenta de ${name} sin mezclar valores de años distintos ni presentar una estimación vieja como vigente.

## Tres controles de vigencia

1. **Fecha:** anotá cuándo se publicó o actualizó cada dato.
2. **Organismo:** comprobá quién tiene competencia sobre la tasa, escala, tarifa o requisito.
3. **Alcance:** verificá si el valor aplica a tu país, provincia, ciudad, actividad, edad o tipo de contrato.

## Qué hacer cuando aparecen dos valores

No elijas el mayor ni el más reciente automáticamente. Revisá si uno es mensual y otro anual, si uno incluye impuestos, si existe una fecha de entrada en vigencia o si corresponden a regímenes distintos. La explicación del [hub de ${esc(name)}](${hub}) debería dejar visible qué supuesto usa y qué tenés que cambiar.

## Cómo dejar una revisión trazable

Guardá el enlace oficial, el título de la página, la fecha de consulta y el valor que tomaste. Si el dato es normativo, conservá también la resolución, ley o documento que lo respalda. Así otra persona puede revisar la cuenta sin depender de una captura aislada.

## Límite de la actualización

Actualizar un dato no convierte una estimación en una respuesta profesional. En temas fiscales, laborales, legales, financieros o de salud, la herramienta ayuda a entender el orden de magnitud y a preparar preguntas; la decisión final puede requerir un especialista.

${deepening(tool, name, hub, 'actualizacion')}

${practicalChecklist(tool, name, hub, 'actualizacion')}

${faq(name, hub)}

## Fuentes de referencia

${sources(tool)}

**Meta description:** Cómo revisar ${name} en 2026: fecha, organismo, alcance, fuentes oficiales y límites de una estimación actualizada.`;
}

function alternateTitle(name, angle) {
  const titles = {
    guia: `Guía práctica para entender ${name} antes de decidir`,
    errores: `Errores que conviene evitar al usar ${name}`,
    caso: `Un método ordenado para resolver ${name}`,
    comparacion: `Cómo comparar opciones con ${name}`,
    actualizacion: `Qué verificar antes de usar ${name} en 2026`,
  };
  return titles[angle] || name;
}

function makeNotes(tool) {
  const hub = new URL(tool.url).pathname.replace(/\/$/, '') || '/';
  return [
    ['guia', noteGuide(tool, hub)],
    ['errores', noteErrors(tool, hub)],
    ['caso', noteCase(tool, hub)],
    ['comparacion', noteComparison(tool, hub)],
    ['actualizacion', noteUpdate(tool, hub)],
  ].map(([angle, content]) => ({
    angle,
    hub,
    title: content.match(/^# (.+)$/m)?.[1] || '',
    content: content.replace(/^# (.+)$/m, `# $1\n\n**Título alternativo:** ${alternateTitle(shortName(tool.title), angle)}`),
  }));
}

const pending = tools.filter((tool) => {
  const hub = new URL(tool.url).pathname.replace(/\/$/, '') || '/';
  return !done.has(hub);
});
fs.mkdirSync(OUT, { recursive: true });
for (const file of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, file));

const manifest = [];
for (let i = 0; i < pending.length; i += batchSize) {
  const chunk = pending.slice(i, i + batchSize);
  const batchNo = String(Math.floor(i / batchSize) + 1).padStart(3, '0');
  const sections = [`# Lote ${batchNo} — notas off-page para Hacé Cuentas\n\nPaquete editorial generado desde el índice vigente, con fuentes oficiales de referencia y límites explícitos para datos variables.\n`];
  for (const tool of chunk) {
    const hub = new URL(tool.url).pathname.replace(/\/$/, '') || '/';
    const notes = makeNotes(tool);
    sections.push(`\n---\n\n## Hub: [${esc(tool.title)}](${hub})\n\n- Ruta: \`${hub}\`\n- Categoría: \`${tool.category}\`\n- Locale: \`${tool.locale}\`\n- Audiencia: \`${tool.audience}\`\n- Notas: 5\n\n`);
    for (const note of notes) {
      sections.push(`\n<!-- angle: ${note.angle}; primaryHub: ${hub} -->\n\n${note.content}\n`);
      manifest.push({ hub, angle: note.angle, title: note.title, source: `batches/offpage-600-${batchNo}.md`, words: note.content.split(/\s+/).filter(Boolean).length });
    }
  }
  fs.writeFileSync(path.join(OUT, `offpage-600-${batchNo}.md`), sections.join('\n'));
}

const summary = { generatedAt: new Date().toISOString(), totalHubs: tools.length, existingHubs: done.size, generatedHubs: pending.length, generatedNotes: manifest.length, batchSize, batches: Math.ceil(pending.length / batchSize), notes: manifest };
fs.writeFileSync(path.join(OUT, 'manifest.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({ totalHubs: tools.length, existingHubs: done.size, generatedHubs: pending.length, generatedNotes: manifest.length, batches: summary.batches, output: OUT }, null, 2));
