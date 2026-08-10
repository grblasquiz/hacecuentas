/** Correcciones editoriales puntuales detectadas por audit-blog-adsense. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'src/content/blog');
const additions = {
  'calendario-economico-agosto-2026': `<h2>Cómo usar esta agenda sin perder una fecha</h2><p>Separá cada evento en tres datos: <strong>qué vence</strong>, <strong>a quién alcanza</strong> y <strong>qué comprobante tenés que guardar</strong>. Esa lectura evita mezclar un día de publicación, como el IPC, con un vencimiento que exige una presentación o un pago. Para organizarte, anotá la fecha en tu calendario personal y abrí la landing permanente sólo cuando necesites hacer la cuenta.</p><ol><li>Marcá primero las obligaciones que tienen una fecha límite.</li><li>Guardá el enlace de la fuente oficial junto con la captura o constancia.</li><li>Volvé a revisar la agenda si el organismo publica una prórroga o corrección.</li></ol><p>Esta nota funciona como una fotografía del mes. Las herramientas permanentes enlazadas arriba son la referencia para recalcular cuando cambien tus datos.</p>`,
  'feriado-17-agosto-2026': `<h2>Cómo revisar el impacto en tu jornada</h2><p>Antes de mirar el recibo, anotá si la jornada estaba prevista, si finalmente se trabajó y bajo qué convenio o modalidad. El mismo feriado puede afectar de manera distinta a una persona mensualizada, a quien cobra por día y a una actividad independiente. La cuenta útil no es sólo el valor de una jornada: también conviene verificar horas, adicionales, descansos y el período que informa el empleador.</p><p>Guardá el calendario oficial y comparalo con la liquidación del mes siguiente. Si encontrás una diferencia, pedí el detalle del cálculo por escrito y consultá el convenio o la autoridad laboral que corresponda. Hacé Cuentas ofrece la estimación como orientación; la liquidación contractual definitiva depende de tus datos y de la norma aplicable.</p>`,
  'ganancias-vencimiento-2026-prorroga-27-julio': `<h2>Checklist antes de enviar la declaración</h2><ol><li>Separá los comprobantes del período fiscal 2025 y verificá que cada importe tenga fecha y concepto.</li><li>Revisá las deducciones cargadas y conservá el respaldo de las que dependan de una condición personal.</li><li>Confirmá por separado la fecha de presentación y la fecha de pago: son pasos distintos.</li><li>Descargá la constancia y el acuse una vez enviada la declaración.</li></ol><p>Si ARCA modifica el cronograma, tomá como válida la comunicación del organismo y no una fecha copiada de otra nota. La calculadora y esta guía ayudan a ordenar escenarios, pero no reemplazan la determinación que corresponde a tu situación fiscal. Para un caso complejo, pedí revisión a un profesional.</p>`,
  'salario-minimo-agosto-2026': `<h2>Cómo usar el salario mínimo en una cuenta</h2><p>El salario mínimo es un parámetro de referencia, no el sueldo de bolsillo de todas las personas. Para usarlo en un presupuesto, separá el monto de referencia de los descuentos, adicionales, convenios y horas efectivamente trabajadas. Si estás comparando meses, anotá la fecha desde la que rige cada valor y mantené la misma cantidad de horas en ambos escenarios.</p><p>También conviene distinguir entre una comparación nominal y una comparación real: la primera mira pesos; la segunda pregunta qué podés comprar con ellos. Guardá la resolución o comunicación oficial que uses como fuente y recalculá cuando cambie la escala. Así el número queda trazable y no se transforma en una recomendación general para casos que tienen reglas diferentes.</p>`,
  'como-comparar-refinanciacion-prestamo': `<h2>Comparación con números comparables</h2><p>Armá una tabla con el mismo horizonte temporal. Para el crédito actual sumá las cuotas pendientes y cualquier costo de cancelación. Para la propuesta nueva sumá cuotas, gastos de otorgamiento, seguros y comisiones. Si el nuevo plazo termina después que el anterior, agregá esos meses: una cuota menor no demuestra un costo menor.</p><p>Probá además un escenario adverso si la tasa o la cuota pueden variar. Registrá el saldo de capital, la fecha de cada oferta y la moneda para no mezclar valores de momentos distintos. La guía de <a href="https://www.bcra.gob.ar/BCRAyVos/Usuarios_Financieros.asp" rel="nofollow noopener">Usuarios Financieros del BCRA</a> permite verificar derechos y canales de reclamo. La decisión final debe apoyarse en el CFT informado por cada entidad, no sólo en la TNA publicitada.</p>`,
  'descuentos-aumentos-sucesivos-porcentaje': `<h2>Cómo comprobar el cálculo</h2><p>Convertí cada porcentaje en un factor y multiplicá en el orden en que ocurre. Un descuento de 15% equivale a 0,85; un aumento de 8%, a 1,08. Sobre $10.000, aplicar ambos produce $10.000 × 0,85 × 1,08 = $9.180. La variación total es −8,2%, no −7%.</p><p>Para recuperar el valor inicial usá el factor inverso. Si un precio quedó en $9.180, dividí por 0,918 y volvés a $10.000. Este control detecta redondeos prematuros y porcentajes aplicados sobre la base incorrecta. Para repasar porcentajes como razones sobre cien, podés consultar la explicación educativa de <a href="https://es.khanacademy.org/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-percentages" rel="nofollow noopener">Khan Academy</a>.</p>`,
  'reducir-cuota-o-plazo-prestamo': `<h2>Qué pedirle a la entidad</h2><p>Solicitá dos cronogramas posteriores al adelanto: uno manteniendo la cuota y otro manteniendo el vencimiento. Cada cronograma debe mostrar saldo, capital, interés, seguros, cargos y costo de precancelación. Compará el total futuro en pesos de la misma fecha y verificá que el pago extraordinario se impute a capital.</p><p>No uses el fondo de emergencia completo para adelantar deuda: ahorrar intereses puede dejarte sin liquidez y obligarte a tomar un crédito más caro ante un imprevisto. La información para <a href="https://www.bcra.gob.ar/BCRAyVos/Usuarios_Financieros.asp" rel="nofollow noopener">usuarios financieros del BCRA</a> reúne derechos, contratos y vías de consulta. Si el préstamo está indexado, separá el efecto del adelanto de la evolución futura del índice, que no está garantizada.</p>`,
  'sistema-frances-aleman-americano-diferencias': `<h2>Ejemplo de lectura</h2><p>Con el mismo capital, tasa y plazo, el francés prioriza estabilidad de cuota; el alemán exige más al comienzo pero reduce antes el saldo; el americano difiere casi todo el capital. Esa diferencia cambia la liquidez mensual y el interés acumulado. No alcanza con comparar la primera cuota: revisá también la última, el saldo a mitad del plazo y la suma total.</p><p>Pedí siempre el cuadro de amortización y el CFT. Dos ofertas llamadas “sistema francés” pueden tener costos finales distintos por seguros, comisiones o impuestos. Conservá la fecha de la simulación y contrastá las condiciones contractuales en los canales para <a href="https://www.bcra.gob.ar/BCRAyVos/Usuarios_Financieros.asp" rel="nofollow noopener">Usuarios Financieros del BCRA</a>. La calculadora sirve para modelar escenarios, pero la entidad define el cronograma contractual definitivo.</p>`,
};
const shorterTitles = {
  'alquilar-comprar-construir-cuentas-vivienda-2026': 'Alquilar, comprar o construir: cuentas antes de decidir',
  'bajar-facturas-luz-gas-eficiencia-2026': 'Cómo bajar las facturas de luz y gas con números',
  'calcular-materiales-obra-gruesa-2026': 'Materiales de obra gruesa: cómo calcularlos',
  'aguinaldo-junio-2026-hasta-cuando-pagan': 'Aguinaldo junio 2026: fecha límite y cálculo',
  'calculos-sueldo-completos': 'Cálculos de sueldo: SAC, antigüedad, horas y costo laboral',
  'como-calcular-calorias-para-bajar-de-peso': 'Cómo calcular calorías para bajar de peso',
  'controles-de-salud-numeros-familia-2026': 'Números de salud para revisar en familia',
  'cuanto-queda-del-sueldo-impuestos-ahorro-2026': 'Cuánto queda del sueldo: bruto, neto y ahorro',
  'cuentas-de-todos-los-dias-guia-rapida-2026': '5 cuentas de todos los días que suelen salir mal',
  'finde-asado-22-julio-2026': 'Cuánto comprar para el asado del finde',
  'ganancias-vencimiento-2026-prorroga-27-julio': 'Ganancias 2026: ARCA prorrogó el vencimiento al 27 de julio',
  'guia-imc-peso-saludable': 'Guía del IMC y peso saludable: fórmula y tabla OMS',
  'partidos-mundial-finde-11-julio-2026': 'Partidos Mundial 2026 (11 y 12 de julio): horarios',
  'partidos-mundial-finde-13-junio-2026': 'Partidos Mundial 2026 (13 y 14 de junio): horarios',
  'partidos-mundial-finde-20-junio-2026': 'Partidos Mundial 2026 (20 y 21 de junio): horarios',
  'partidos-mundial-finde-27-junio-2026': 'Partidos Mundial 2026 (27 y 28 de junio): horarios',
  'partidos-mundial-finde-4-julio-2026': 'Mundial 2026 (4 y 5 de julio): Argentina y octavos',
  'rentabilidad-negocio': 'Rentabilidad: punto de equilibrio, márgenes, markup y ROI',
  'te-echaron-o-renunciaste-guia-numeros-2026': 'Te echaron o renunciaste: números antes de firmar',
  'vacaciones-invierno-2026-cuanto-sale-presupuesto': 'Vacaciones de invierno 2026: cómo armar el presupuesto',
};

let deduped = 0; let expanded = 0;
for (const file of fs.readdirSync(DIR).filter((name) => name.endsWith('.json'))) {
  const full = path.join(DIR, file);
  const post = JSON.parse(fs.readFileSync(full, 'utf8'));
  let changed = false;
  if (shorterTitles[post.slug] && post.title !== shorterTitles[post.slug]) {
    post.title = shorterTitles[post.slug];
    changed = true;
  }
  if (typeof post.title === 'string' && post.title.length > 66 && post.title.endsWith(' | Hacé Cuentas')) {
    post.title = post.title.slice(0, -15).trim();
    changed = true;
  }
  if (Array.isArray(post.relatedCalcs)) {
    const unique = [...new Set(post.relatedCalcs.filter(Boolean))];
    if (unique.length !== post.relatedCalcs.length) { post.relatedCalcs = unique; deduped++; changed = true; }
  }
  const addition = additions[post.slug];
  const additionHeading = addition?.match(/<h2>([^<]+)<\/h2>/)?.[1];
  if (addition && additionHeading && !String(post.content || '').includes(additionHeading)) {
    post.content = String(post.content || '') + addition;
    expanded++; changed = true;
  }
  if (changed) fs.writeFileSync(full, JSON.stringify(post, null, 2) + '\n');
}
console.log(JSON.stringify({ deduped, expanded }));
