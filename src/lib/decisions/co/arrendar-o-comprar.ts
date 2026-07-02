/**
 * Sala de decisión CO — "¿Arrendar o comprar vivienda?"
 *
 * Patrón VIVIENDA / OPTIMIZACIÓN. Compara el costo acumulado de ARRENDAR
 * (canon que sube por IPC — tope Ley 820 — + administración − rendimiento de la
 * cuota inicial invertida en CDT) contra COMPRAR (cuota de crédito hipotecario
 * en pesos ~11-13% EA, gastos de escrituración y registro ~3-4%, predial
 * ~0,5-1% anual, administración, menos la valorización si la estimas) a
 * 5/10/20 años, y encuentra el punto de equilibrio en años. El subsidio
 * Mi Casa Ya puede mover la balanza en vivienda VIS.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

const PCT_ESCRITURACION = 0.035; // gastos notariales + registro + beneficencia ~3,5%
const PCT_PREDIAL_ANUAL = 0.007; // predial ~0,7% del avalúo por año

/** EA % → tasa mensual equivalente (decimal). */
function eaToMensual(eaPct: number): number {
  return Math.pow(1 + eaPct / 100, 1 / 12) - 1;
}

/** Cuota fija mensual (sistema francés) desde tasa EA. */
function cuotaHipoteca(capital: number, eaPct: number, nMeses: number): number {
  if (capital <= 0 || nMeses <= 0) return 0;
  const i = eaToMensual(eaPct);
  if (i === 0) return capital / nMeses;
  return (capital * i) / (1 - Math.pow(1 + i, -nMeses));
}

function compute(inputs: Record<string, any>): DecisionResult {
  const valor = Math.max(0, num(inputs.valorVivienda));
  const cuotaInicial = Math.max(0, num(inputs.cuotaInicial));
  const tasaEA = Math.max(0, num(inputs.tasaEACredito));
  const plazoCredito = Math.max(0, num(inputs.plazoAnios));
  const arriendo = Math.max(0, num(inputs.arriendoMensual));
  const ipc = Math.max(0, num(inputs.ipcAnual));
  const administracion = Math.max(0, num(inputs.administracion));
  const tasaEACDT = Math.max(0, num(inputs.tasaEACDT));
  const valorizacion = Math.max(0, num(inputs.valorizacionAnual));
  const permanencia = Math.max(1, num(inputs.aniosPermanencia));

  if (!valor || !arriendo || !plazoCredito) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga el valor de la vivienda, el arriendo mensual de una equivalente y el plazo del crédito hipotecario. Con eso comparamos el costo acumulado de arrendar contra el de comprar y buscamos el punto de equilibrio en años.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Punto de equilibrio' },
      scenarios: [],
      nextActions: [
        'Carga el **valor de la vivienda** y el **canon de arriendo** de una equivalente en la misma zona.',
        'Indica la **cuota inicial** que darías y el **plazo del crédito** (en Colombia lo usual es 15-20 años).',
      ],
    };
  }

  const credito = Math.max(0, valor - cuotaInicial);
  const cuota = cuotaHipoteca(credito, tasaEA, plazoCredito * 12);

  // Costo acumulado de ARRENDAR a n años: canon subiendo por IPC (tope Ley 820)
  // + administración − lo que rinde la cuota inicial invertida en CDT.
  const costoArrendar = (n: number): number => {
    let totalArriendo = 0;
    for (let y = 0; y < n; y++) {
      totalArriendo += arriendo * Math.pow(1 + ipc / 100, y) * 12;
    }
    const totalAdmin = administracion * 12 * n;
    const gananciaCDT = cuotaInicial * (Math.pow(1 + tasaEACDT / 100, n) - 1);
    return totalArriendo + totalAdmin - gananciaCDT;
  };

  // Costo acumulado de COMPRAR a n años: escrituración inicial + cuotas del
  // crédito + predial + administración − valorización estimada del inmueble.
  const costoComprar = (n: number): number => {
    const escrituracion = valor * PCT_ESCRITURACION;
    const meses = Math.min(n, plazoCredito) * 12;
    const totalCuotas = cuota * meses;
    const totalPredial = valor * PCT_PREDIAL_ANUAL * n;
    const totalAdmin = administracion * 12 * n;
    const gananciaValorizacion = valor * (Math.pow(1 + valorizacion / 100, n) - 1);
    return escrituracion + totalCuotas + totalPredial + totalAdmin - gananciaValorizacion;
  };

  let breakEven = 0;
  for (let y = 1; y <= 40; y++) {
    if (costoComprar(y) <= costoArrendar(y)) {
      breakEven = y;
      break;
    }
  }

  const costArr = costoArrendar(permanencia);
  const costCom = costoComprar(permanencia);
  const diff = costArr - costCom; // + => comprar más barato a tu horizonte

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (breakEven > 0 && permanencia >= breakEven) {
    status = 'b';
    tone = 'good';
    title = 'A tu horizonte, te conviene comprar';
    badge = 'Compra';
    detail = `Comprar se paga solo a partir del año ${breakEven}, y planeas quedarte ${permanencia} años. En ese plazo comprar te cuesta ${fmtMoney(Math.abs(diff))} menos que arrendar — y al final el inmueble es tuyo. Si la vivienda es VIS, revisa el subsidio Mi Casa Ya: puede adelantar aún más el equilibrio.`;
  } else if (breakEven === 0 || permanencia < breakEven - 1) {
    status = 'a';
    tone = 'warn';
    title = 'A tu horizonte, te conviene arrendar';
    badge = 'Arrienda';
    detail =
      breakEven > 0
        ? `Comprar recién se equilibra en el año ${breakEven} y planeas quedarte ${permanencia}. Hasta ahí, arrendar te cuesta ${fmtMoney(Math.abs(diff))} menos: con el canon subiendo solo por IPC y tu cuota inicial rindiendo en un CDT, arrendar e invertir gana.`
        : `Con estos números, comprar no se equilibra ni en 40 años: el canon es bajo frente al precio de venta y la tasa del crédito (${fmtPct(tasaEA, 1).replace('+', '')} EA) pesa mucho. Arrendar e invertir la cuota inicial te deja mejor parado — salvo que apliques a un subsidio como Mi Casa Ya o consigas mejor tasa.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está muy parejo: decide por tu plan de vida';
    badge = 'Parejo';
    detail = `El punto de equilibrio (año ${breakEven}) cae justo alrededor de tu horizonte de ${permanencia} años: la diferencia es de apenas ${fmtMoney(Math.abs(diff))}. Decide por estabilidad, movilidad laboral y ganas de tener casa propia, no solo por la plata.`;
  }

  const scenarios = [5, 10, 20].map((n) => {
    const d = costoArrendar(n) - costoComprar(n);
    return {
      label: `A ${n} años`,
      value: d >= 0 ? 'Comprar: ' + fmtMoney(d) : 'Arrendar: ' + fmtMoney(-d),
      detail:
        d >= 0
          ? `Comprar acumula ${fmtMoney(Math.abs(d))} menos que arrendar en ${n} años.`
          : `Arrendar acumula ${fmtMoney(Math.abs(d))} menos que comprar en ${n} años.`,
    };
  });

  const comparison = {
    columns: ['Arrendar', 'Comprar'] as [string, string],
    rows: [
      {
        label: 'Desembolso inicial',
        a: fmtMoney(0),
        b: fmtMoney(cuotaInicial + valor * PCT_ESCRITURACION),
        hint: 'cuota inicial + escrituración y registro (~3,5%)',
      },
      {
        label: 'Costo mensual (año 1)',
        a: fmtMoney(arriendo + administracion),
        b: fmtMoney(cuota + administracion + (valor * PCT_PREDIAL_ANUAL) / 12),
        hint: 'canon vs cuota + administración + predial',
      },
      {
        label: `Costo acumulado a ${permanencia} años`,
        a: fmtMoney(costArr),
        b: fmtMoney(costCom),
        hint: 'arrendar descuenta el CDT de la cuota inicial; comprar, la valorización',
      },
      {
        label: 'Al final, ¿de quién es el inmueble?',
        a: 'Del arrendador',
        b: 'Tuyo',
        hint: 'comprar te deja un activo; arrendar, movilidad',
      },
    ],
  };

  const nextActions = [
    breakEven > 0
      ? `Tu punto de equilibrio es el año **${breakEven}**: si planeas quedarte más que eso, compra; si menos, arrienda e invierte la cuota inicial.`
      : 'Con estos números arrendar gana en todo el horizonte: revisa si el precio de venta no está inflado o si puedes conseguir una tasa hipotecaria menor.',
    'Si la vivienda es VIS y tu hogar gana hasta ~4 salarios mínimos, revisa **Mi Casa Ya**: el subsidio a la cuota inicial y la cobertura de tasa pueden cambiar el resultado por completo.',
    'Cotiza el crédito en **pesos y en UVR**: en pesos la cuota es fija y predecible; en UVR arranca más baja pero se ajusta con la inflación. Compara también leasing habitacional, que suele financiar un porcentaje mayor.',
    'Si arriendas, **invierte la cuota inicial** que no inmovilizaste (CDT, FIC): ese rendimiento es la mitad de la ecuación y mucha gente se lo gasta.',
    'Suma lo intangible: comprar da estabilidad y te ancla; arrendar da movilidad para cambiar de ciudad o de trabajo. El número decide el costo, tu plan de vida decide el resto.',
  ];

  const notes = [
    `La cuota se calcula con sistema de cuota fija en pesos a la tasa EA cargada. Los gastos de escrituración y registro se estiman en ~3,5% del valor y el predial en ~0,7% anual: varían según el municipio y el avalúo catastral.`,
    'El costo de arrendar descuenta el rendimiento de invertir la cuota inicial en un CDT; el de comprar descuenta la valorización anual solo si la estimas (dejarla en 0 es el criterio conservador).',
    `El canon de arriendo sube por el IPC del año anterior (${ipc.toFixed(1).replace('.', ',')}%), que es el tope legal de la Ley 820 para vivienda urbana.`,
    'No es asesoría financiera ni inmobiliaria. Para una operación de este tamaño consulta el estudio de títulos, el avalúo y las condiciones reales del crédito con tu banco y un profesional.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: breakEven > 0 ? `${breakEven} años` : 'No se equilibra',
      label: 'Punto de equilibrio (arrendar → comprar)',
      sub:
        breakEven > 0
          ? `A tu horizonte de ${permanencia} años, comprar ${diff >= 0 ? 'ahorra' : 'cuesta'} **${fmtMoney(Math.abs(diff))}** frente a arrendar.`
          : 'Con estos números, arrendar e invertir la cuota inicial gana en todo el horizonte analizado.',
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'arrendar-o-comprar',
  title: '¿Arrendar o comprar vivienda en Colombia? El punto de equilibrio 2026',
  h1: '¿Me conviene arrendar o comprar vivienda?',
  description:
    'Compara el costo acumulado de arrendar (canon que sube por IPC + tu cuota inicial rindiendo en CDT) contra comprar (crédito hipotecario ~11-13% EA, escrituración, predial, valorización) a 5, 10 y 20 años, con el punto de equilibrio en años.',
  intro:
    '"Pagar arriendo es regalar la plata", dicen. Pero comprar inmoviliza la cuota inicial, paga escrituración y te ata a una tasa hipotecaria que en Colombia ronda 11-13% EA en pesos. Esta sala compara el costo acumulado de cada camino: arrendar (canon que solo puede subir por IPC, Ley 820, mientras tu cuota inicial rinde en un CDT) contra comprar (cuota del crédito, predial, administración, menos la valorización), encuentra el punto de equilibrio en años y te dice cuál gana según cuánto planeas quedarte. Si tu vivienda es VIS, el subsidio Mi Casa Ya puede mover la balanza.',
  icon: '🏠',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    valorVivienda: 280000000,
    cuotaInicial: 84000000,
    tasaEACredito: 12,
    plazoAnios: 20,
    arriendoMensual: 1800000,
    ipcAnual: 5,
    administracion: 250000,
    tasaEACDT: 9.5,
    valorizacionAnual: 4,
    aniosPermanencia: 10,
  },
  fields: [
    { id: 'valorVivienda', label: 'Valor de la vivienda', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '280000000', help: 'Precio de venta del apartamento o casa que comprarías.', group: 'La compra', groupIcon: '🏠' },
    { id: 'cuotaInicial', label: 'Cuota inicial que darías', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '84000000', help: 'La plata propia que aportas (los bancos financian hasta el 70% en no VIS, 80% en VIS: lo usual es dar 30%).', group: 'La compra' },
    { id: 'tasaEACredito', label: 'Tasa del crédito hipotecario (EA)', type: 'number', suffix: '%', required: true, min: 0, max: 30, default: 12, placeholder: '12', help: 'Tasa efectiva anual del crédito en pesos. Referencia 2026: 11-13% EA según banco y perfil.', group: 'La compra' },
    { id: 'plazoAnios', label: 'Plazo del crédito (años)', type: 'number', required: true, min: 1, max: 30, default: 20, help: 'Años para pagar el crédito. En Colombia lo usual es 15-20 años.', group: 'La compra' },
    { id: 'valorizacionAnual', label: 'Valorización anual estimada', type: 'number', suffix: '%', default: 0, min: 0, max: 20, placeholder: '4', advanced: true, help: 'Cuánto crees que se valoriza el inmueble por año. Déjalo en 0 si prefieres un cálculo conservador.', group: 'La compra' },
    { id: 'arriendoMensual', label: 'Arriendo mensual equivalente', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '1800000', help: 'Canon de una vivienda parecida en la misma zona y estrato.', group: 'El arriendo', groupIcon: '🔑' },
    { id: 'ipcAnual', label: 'IPC anual esperado', type: 'number', suffix: '%', default: 5, min: 0, max: 20, placeholder: '5', help: 'El canon solo puede subir hasta el IPC del año anterior (Ley 820). Referencia 2026: ~5%.', group: 'El arriendo' },
    { id: 'tasaEACDT', label: 'Rentabilidad CDT (EA)', type: 'number', suffix: '%', default: 9.5, min: 0, max: 30, placeholder: '9.5', help: 'Lo que rendiría tu cuota inicial invertida si no compras. Referencia: CDT 9-9,5% EA.', group: 'El arriendo' },
    { id: 'administracion', label: 'Cuota de administración', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '250000', help: 'La pagas arriendes o compres: se incluye en ambos lados para comparar parejo.', group: 'Comunes', groupIcon: '🧾' },
    { id: 'aniosPermanencia', label: '¿Cuántos años planeas quedarte?', type: 'number', recommended: true, min: 1, max: 40, default: 10, help: 'Tu horizonte. Es la clave: cuanto más te quedes, más conviene comprar.', group: 'Comunes' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-coste-arriendo-vs-comprar-colombia-10-anos', label: 'Arriendo vs compra a 10 años' },
    { slug: 'co/calculadora-credito-hipotecario-colombia-2026-uvr-pesos', label: 'Crédito hipotecario UVR o pesos' },
    { slug: 'co/calculadora-gastos-notariales-registro-compraventa-2026', label: 'Gastos notariales y registro' },
    { slug: 'co/calculadora-subsidio-vivienda-mi-casa-ya-colombia-2026', label: 'Subsidio Mi Casa Ya' },
  ],
  howItWorks: `Esta sala no compara el canon contra la cuota de un mes: acumula el costo total de cada camino a lo largo de los años.

1. **Costo de arrendar.** Suma los cánones año a año — subiendo por el IPC, que es el tope legal de la Ley 820 — más la administración, y le RESTA lo que rinde tu cuota inicial invertida en un CDT. Esa resta es clave: si arriendas, esa plata trabaja para ti.
2. **Costo de comprar.** Suma los gastos de escrituración y registro (~3,5% del valor), la cuota fija del crédito hipotecario a la tasa EA cargada, el predial (~0,7% anual) y la administración; y descuenta la valorización del inmueble si la estimaste.
3. **Punto de equilibrio.** Busca el primer año en que comprar acumula menos costo que arrendar. Antes de ese año conviene arrendar; después, comprar.
4. **Tu horizonte decide.** Compara ambos costos acumulados al plazo que planeas quedarte y te dice cuál gana y por cuánto.
5. **Los factores locales.** Muestra la diferencia a 5, 10 y 20 años, y te recuerda las palancas colombianas: subsidio Mi Casa Ya para VIS, crédito en UVR vs pesos y leasing habitacional.`,
  faq: [
    { q: '¿Arrendar es botar la plata?', a: 'No siempre. En Colombia el canon anual suele ser 5-8% del valor del inmueble, mientras el crédito hipotecario cuesta 11-13% EA. Si tu cuota inicial rinde en un CDT y el canon solo sube por IPC, arrendar puede acumular menos costo durante muchos años. La clave es cuánto tiempo planeas quedarte.' },
    { q: '¿Qué es el punto de equilibrio?', a: 'Es el año a partir del cual comprar acumula menos costo total que arrendar. Si planeas quedarte más años que el punto de equilibrio, comprar gana; si te mudas antes, arrendar fue más barato. Esta sala lo calcula con tus números en lugar de darte una regla genérica.' },
    { q: '¿Qué cuesta comprar además de la cuota del crédito?', a: 'Los gastos de escrituración y registro (gastos notariales, boleta fiscal y registro, alrededor del 3-4% del valor, usualmente compartidos con el vendedor), el impuesto predial (entre 0,5% y 1% del avalúo cada año según el municipio) y la administración si es propiedad horizontal.' },
    { q: '¿Qué es Mi Casa Ya y cómo cambia la decisión?', a: 'Es el programa de Minvivienda que subsidia la cuota inicial (en salarios mínimos, según el ingreso del hogar) y da cobertura de tasa para vivienda VIS. Para hogares con ingresos de hasta ~4 salarios mínimos puede recortar millones de la entrada y varios puntos de la tasa: adelanta el punto de equilibrio y puede volcar el resultado hacia comprar.' },
    { q: '¿Crédito en pesos o en UVR?', a: 'En pesos la cuota es fija: sabes exactamente cuánto pagarás los 20 años. En UVR la deuda se indexa a la inflación: la cuota arranca más baja pero sube con el IPC, parecido a como suben los arriendos. Esta sala usa cuota fija en pesos; si cotizas UVR, compara con cuidado el escenario de inflación alta.' },
    { q: '¿Cuánto sube el arriendo cada año en Colombia?', a: 'Para vivienda urbana, el tope legal es el IPC del año calendario anterior (Ley 820 de 2003): con inflación del 5%, tu canon puede subir máximo 5% y solo cada 12 meses. Esa previsibilidad es una ventaja de arrendar frente a países sin tope legal.' },
    { q: '¿La valorización no hace que comprar siempre gane?', a: 'Ayuda, pero no está garantizada: hay zonas y años en que el precio real de la vivienda cae o crece menos que un CDT. Por eso la sala te deja estimarla (campo avanzado) o dejarla en cero para un cálculo conservador. Con valorización alta y sostenida, comprar gana mucho antes.' },
    { q: '¿Qué pasa si me toca venderme o mudarme antes?', a: 'Vender un inmueble en Colombia tarda meses y cuesta comisión (~3%) más posibles gastos de la nueva escritura. Si tu trabajo o tu ciudad pueden cambiar en pocos años, ese riesgo de salida juega a favor de arrendar aunque el número puro esté parejo.' },
  ],
  sources: [
    { name: 'Ministerio de Vivienda — Programa Mi Casa Ya', url: 'https://www.minvivienda.gov.co/' },
    { name: 'Banco de la República — Tasas de interés de vivienda', url: 'https://www.banrep.gov.co/' },
    { name: 'DANE — IPC e índices de precios de vivienda', url: 'https://www.dane.gov.co/' },
    { name: 'Superintendencia Financiera — Tasas de crédito hipotecario', url: 'https://www.superfinanciera.gov.co/' },
  ],
};
