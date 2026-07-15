/** Correcciones editoriales puntuales detectadas por audit-blog-adsense. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'src/content/blog');
const additions = {
  'como-comparar-refinanciacion-prestamo': `<h2>Comparación con números comparables</h2><p>Armá una tabla con el mismo horizonte temporal. Para el crédito actual sumá las cuotas pendientes y cualquier costo de cancelación. Para la propuesta nueva sumá cuotas, gastos de otorgamiento, seguros y comisiones. Si el nuevo plazo termina después que el anterior, agregá esos meses: una cuota menor no demuestra un costo menor.</p><p>Probá además un escenario adverso si la tasa o la cuota pueden variar. Registrá el saldo de capital, la fecha de cada oferta y la moneda para no mezclar valores de momentos distintos. La guía de <a href="https://www.bcra.gob.ar/BCRAyVos/Usuarios_Financieros.asp" rel="nofollow noopener">Usuarios Financieros del BCRA</a> permite verificar derechos y canales de reclamo. La decisión final debe apoyarse en el CFT informado por cada entidad, no sólo en la TNA publicitada.</p>`,
  'descuentos-aumentos-sucesivos-porcentaje': `<h2>Cómo comprobar el cálculo</h2><p>Convertí cada porcentaje en un factor y multiplicá en el orden en que ocurre. Un descuento de 15% equivale a 0,85; un aumento de 8%, a 1,08. Sobre $10.000, aplicar ambos produce $10.000 × 0,85 × 1,08 = $9.180. La variación total es −8,2%, no −7%.</p><p>Para recuperar el valor inicial usá el factor inverso. Si un precio quedó en $9.180, dividí por 0,918 y volvés a $10.000. Este control detecta redondeos prematuros y porcentajes aplicados sobre la base incorrecta. Para repasar porcentajes como razones sobre cien, podés consultar la explicación educativa de <a href="https://es.khanacademy.org/math/cc-sixth-grade-math/cc-6th-arithmetic-operations/cc-6th-percentages" rel="nofollow noopener">Khan Academy</a>.</p>`,
  'reducir-cuota-o-plazo-prestamo': `<h2>Qué pedirle a la entidad</h2><p>Solicitá dos cronogramas posteriores al adelanto: uno manteniendo la cuota y otro manteniendo el vencimiento. Cada cronograma debe mostrar saldo, capital, interés, seguros, cargos y costo de precancelación. Compará el total futuro en pesos de la misma fecha y verificá que el pago extraordinario se impute a capital.</p><p>No uses el fondo de emergencia completo para adelantar deuda: ahorrar intereses puede dejarte sin liquidez y obligarte a tomar un crédito más caro ante un imprevisto. La información para <a href="https://www.bcra.gob.ar/BCRAyVos/Usuarios_Financieros.asp" rel="nofollow noopener">usuarios financieros del BCRA</a> reúne derechos, contratos y vías de consulta. Si el préstamo está indexado, separá el efecto del adelanto de la evolución futura del índice, que no está garantizada.</p>`,
  'sistema-frances-aleman-americano-diferencias': `<h2>Ejemplo de lectura</h2><p>Con el mismo capital, tasa y plazo, el francés prioriza estabilidad de cuota; el alemán exige más al comienzo pero reduce antes el saldo; el americano difiere casi todo el capital. Esa diferencia cambia la liquidez mensual y el interés acumulado. No alcanza con comparar la primera cuota: revisá también la última, el saldo a mitad del plazo y la suma total.</p><p>Pedí siempre el cuadro de amortización y el CFT. Dos ofertas llamadas “sistema francés” pueden tener costos finales distintos por seguros, comisiones o impuestos. Conservá la fecha de la simulación y contrastá las condiciones contractuales en los canales para <a href="https://www.bcra.gob.ar/BCRAyVos/Usuarios_Financieros.asp" rel="nofollow noopener">Usuarios Financieros del BCRA</a>. La calculadora sirve para modelar escenarios, pero la entidad define el cronograma contractual definitivo.</p>`,
};
const shorterTitles = {
  'aguinaldo-junio-2026-hasta-cuando-pagan': 'Aguinaldo junio 2026: fecha límite y cálculo',
  'calculos-sueldo-completos': 'Cálculos de sueldo: SAC, antigüedad, horas y costo laboral',
  'como-calcular-calorias-para-bajar-de-peso': 'Cómo calcular calorías para bajar de peso',
  'ganancias-vencimiento-2026-prorroga-27-julio': 'Ganancias 2026: ARCA prorrogó el vencimiento al 27 de julio',
  'guia-imc-peso-saludable': 'Guía del IMC y peso saludable: fórmula y tabla OMS',
  'partidos-mundial-finde-11-julio-2026': 'Partidos Mundial 2026 (11 y 12 de julio): horarios',
  'partidos-mundial-finde-13-junio-2026': 'Partidos Mundial 2026 (13 y 14 de junio): horarios',
  'partidos-mundial-finde-20-junio-2026': 'Partidos Mundial 2026 (20 y 21 de junio): horarios',
  'partidos-mundial-finde-27-junio-2026': 'Partidos Mundial 2026 (27 y 28 de junio): horarios',
  'partidos-mundial-finde-4-julio-2026': 'Mundial 2026 (4 y 5 de julio): Argentina y octavos',
  'rentabilidad-negocio': 'Rentabilidad: punto de equilibrio, márgenes, markup y ROI',
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
  if (addition && !String(post.content || '').includes('Cómo comprobar el cálculo')
    && !String(post.content || '').includes('Qué pedirle a la entidad')
    && !String(post.content || '').includes('Ejemplo de lectura')
    && !String(post.content || '').includes('Comparación con números comparables')) {
    post.content = String(post.content || '') + addition;
    expanded++; changed = true;
  }
  if (changed) fs.writeFileSync(full, JSON.stringify(post, null, 2) + '\n');
}
console.log(JSON.stringify({ deduped, expanded }));
