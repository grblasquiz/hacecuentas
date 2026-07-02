/**
 * Sala de decisión CL — "¿Arrendar o comprar?"
 *
 * Compara el costo acumulado de ARRENDAR (arriendo reajustado por IPC + gastos
 * comunes − rendimiento del pie invertido en depósito a plazo) contra COMPRAR
 * (dividendo de crédito hipotecario en UF a tasa ~4,3-4,7% anual, pie ~20%,
 * gastos operacionales ~2-3% al inicio, contribuciones, mantención y gastos
 * comunes), y encuentra el punto de equilibrio en años. La plusvalía queda como
 * nota (criterio conservador: al final sigues siendo dueño del bien).
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { num } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

/** Dividendo mensual (sistema francés). V = capital, tasa anual en %, n meses. */
function dividendoFrances(V: number, tasaAnualPct: number, nMeses: number): number {
  if (V <= 0 || nMeses <= 0) return 0;
  const i = tasaAnualPct / 12 / 100;
  if (i === 0) return V / nMeses;
  return (V * i) / (1 - Math.pow(1 + i, -nMeses));
}

/** Costo acumulado de arrendar `anios`: arriendo reajustado por IPC + GC − rendimiento del pie. */
function costoArrendar(
  arriendo: number,
  ipcPct: number,
  gc: number,
  pie: number,
  rendAnualPct: number,
  anios: number,
): number {
  let totalArriendo = 0;
  for (let y = 0; y < anios; y++) {
    totalArriendo += arriendo * Math.pow(1 + ipcPct / 100, y) * 12;
  }
  const totalGC = gc * 12 * anios;
  const gananciaPie = pie * (Math.pow(1 + rendAnualPct / 100, anios) - 1);
  return totalArriendo + totalGC - gananciaPie;
}

/**
 * Costo acumulado de comprar `anios`: gastos operacionales iniciales (~2,5% del
 * valor) + dividendo × meses (capado al plazo) + GC + contribuciones (~0,5%
 * anual) + mantención (~1% anual).
 */
function costoComprar(
  valor: number,
  dividendo: number,
  plazoAnios: number,
  gc: number,
  anios: number,
): number {
  const operacionales = valor * 0.025;
  const totalDividendos = dividendo * Math.min(anios, plazoAnios) * 12;
  const totalGC = gc * 12 * anios;
  const contribuciones = valor * 0.005 * anios;
  const mantencion = valor * 0.01 * anios;
  return operacionales + totalDividendos + totalGC + contribuciones + mantencion;
}

function compute(inputs: Record<string, any>): DecisionResult {
  const valor = Math.max(0, num(inputs.valorPropiedad));
  const pie = Math.max(0, num(inputs.pie));
  const tasa = Math.max(0, num(inputs.tasaCredito));
  const plazoCredito = Math.max(0, num(inputs.plazoAniosCredito));
  const arriendo = Math.max(0, num(inputs.arriendoMensual));
  const ipc = Math.max(0, num(inputs.reajusteIpcAnual));
  const gc = Math.max(0, num(inputs.gastosComunes));
  const rendPie = Math.max(0, num(inputs.rendimientoPie));
  const permanencia = Math.max(1, num(inputs.aniosPermanencia));

  if (!valor || !arriendo || !plazoCredito) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Carga el valor de la propiedad, el arriendo mensual de una vivienda equivalente y el plazo del crédito hipotecario. Con eso comparamos el costo acumulado de arrendar contra el de pagar dividendo, y buscamos el año en que comprar empieza a ganar.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Punto de equilibrio' },
      scenarios: [],
      nextActions: [
        'Carga el **valor de la propiedad** (en pesos; si lo tienes en UF, conviértelo) y el **arriendo mensual** de algo equivalente.',
        'Indica el **pie** que pondrías (los bancos financian hasta el 80-90%) y el **plazo del crédito**.',
      ],
    };
  }

  const montoCredito = Math.max(0, valor - pie);
  const dividendo = dividendoFrances(montoCredito, tasa, plazoCredito * 12);
  const rendimientoPie = rendPie > 0 ? rendPie : 5.5;

  const horizontes = [5, 10, 20];
  const cArr = (n: number) => costoArrendar(arriendo, ipc, gc, pie, rendimientoPie, n);
  const cCom = (n: number) => costoComprar(valor, dividendo, plazoCredito, gc, n);

  let breakEven = 0;
  for (let y = 1; y <= 40; y++) {
    if (cCom(y) <= cArr(y)) {
      breakEven = y;
      break;
    }
  }

  const costArrPerm = cArr(permanencia);
  const costComPerm = cCom(permanencia);
  const diff = costArrPerm - costComPerm; // + => comprar más barato a tu horizonte

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (breakEven > 0 && permanencia >= breakEven) {
    status = 'b';
    tone = 'good';
    title = 'A tu horizonte, conviene comprar';
    badge = 'Compra';
    detail = `Comprar se equilibra a partir del año ${breakEven} y tú piensas quedarte ${permanencia}. En ese plazo, pagar dividendo te cuesta ${fmtMoney(Math.abs(diff))} menos que arrendar — y al final la propiedad es tuya, con la plusvalía como bono aparte.`;
  } else if (breakEven === 0 || permanencia < breakEven - 1) {
    status = 'a';
    tone = 'warn';
    title = 'A tu horizonte, conviene arrendar';
    badge = 'Arrienda';
    detail =
      breakEven > 0
        ? `Comprar recién se equilibra al año ${breakEven} y tú piensas quedarte ${permanencia}. Hasta ahí, arrendar te sale ${fmtMoney(Math.abs(diff))} menos: te conviene seguir arrendando y dejar el pie rindiendo (o esperar una mejor tasa).`
        : 'Con estos números, comprar no se equilibra ni en 40 años: el arriendo está barato frente al precio de venta. Arrienda e invierte el pie, o negocia el precio de compra.';
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está muy parejo: decide por tu plan de vida';
    badge = 'Empate';
    detail = `El punto de equilibrio (año ${breakEven}) cae justo alrededor de tu horizonte de ${permanencia} años: la diferencia es de apenas ${fmtMoney(Math.abs(diff))}. Decide por estabilidad, movilidad laboral y ganas de ser dueño, no solo por la plata.`;
  }

  const scenarios = horizontes.map((n) => {
    const d = cArr(n) - cCom(n);
    return {
      label: `A ${n} años`,
      value: d >= 0 ? 'Comprar: ' + fmtMoney(d) : 'Arrendar: ' + fmtMoney(-d),
      detail:
        d >= 0
          ? `Comprar acumula ${fmtMoney(Math.abs(d))} menos que arrendar a ${n} años.`
          : `Arrendar acumula ${fmtMoney(Math.abs(d))} menos que comprar a ${n} años.`,
    };
  });

  const comparison = {
    columns: ['Arrendar', 'Comprar'] as [string, string],
    rows: [
      { label: 'Desembolso inicial', a: fmtMoney(0), b: fmtMoney(pie + valor * 0.025), hint: 'Comprar = pie + gastos operacionales (~2,5%)' },
      { label: 'Costo mensual (año 1)', a: fmtMoney(arriendo + gc), b: fmtMoney(dividendo + gc + (valor * 0.015) / 12), hint: 'Arriendo vs dividendo + contribuciones + mantención' },
      { label: `Costo acumulado a ${permanencia} años`, a: fmtMoney(costArrPerm), b: fmtMoney(costComPerm), hint: 'Arrendar ya descuenta lo que rinde el pie invertido' },
      { label: 'Al final, ¿de quién es la propiedad?', a: 'Del dueño', b: 'Tuya', hint: 'Comprar te deja un activo; arrendar no' },
    ],
  };

  const nextActions = [
    breakEven > 0
      ? `Tu punto de equilibrio es el año **${breakEven}**: si piensas quedarte más que eso, comprar gana; si menos, arrienda tranquilo.`
      : 'Con estos números el arriendo está muy barato frente al precio: revisa si el valor de venta no está inflado para el sector.',
    'Cotiza el dividendo en **al menos 3 bancos y compara el CAE**, no solo la tasa: seguros de desgravamen e incendio cambian el costo final. Una décima de punto en 25 años son varios millones.',
    'Si tu vivienda califica, revisa el **subsidio DS1** del MINVU: para precios de hasta ~UF 2.200 puede aportar parte del pie y cambiar por completo esta ecuación.',
    'Si arriendas, **deja el pie en un depósito a plazo o fondo conservador**: ese rendimiento es la mitad de la ventaja de arrendar, y si te lo gastas, desaparece.',
    'Suma lo intangible: comprar da estabilidad y te ancla; arrendar da movilidad. A igual costo, decide por tu plan de vida.',
  ];

  const notes = [
    'El dividendo se calcula con sistema francés sobre el monto financiado. Los créditos hipotecarios chilenos están en UF: el dividendo es estable en UF pero sube en pesos con la inflación (~3,5-4% anual), igual que un arriendo reajustado por IPC — por eso la comparación en pesos de hoy es razonable.',
    'Gastos operacionales de la compra estimados en ~2,5% del valor (impuesto de timbres y estampillas, notaría, Conservador de Bienes Raíces, tasación y estudio de títulos). Contribuciones estimadas en ~0,5% anual del valor: muchas viviendas DFL-2 pagan menos o están exentas — revisa el avalúo fiscal en el SII.',
    'El costo de comprar NO descuenta la plusvalía del inmueble (criterio conservador: al final del horizonte sigues siendo dueño de un activo que vale aparte). Sumarla haría comprar aún más conveniente.',
    'No es asesoría financiera ni inmobiliaria. Para una operación de este tamaño, confirma condiciones con el banco y revisa títulos con un abogado.',
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
          : 'Con estos números, arrendar e invertir el pie gana en todo el horizonte analizado.',
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'arrendar-o-comprar',
  title: '¿Arrendar o comprar en Chile? Dividendo en UF vs arriendo 2026',
  h1: '¿Me conviene arrendar o comprar?',
  description:
    'Compara el costo acumulado de arrendar (arriendo reajustado por IPC, menos lo que rinde tu pie invertido) contra comprar con crédito hipotecario en UF (dividendo, pie, gastos operacionales, contribuciones). Te decimos el punto de equilibrio en años.',
  intro:
    '"El arriendo es plata perdida", dicen. Pero comprar exige juntar el pie (~20%), pagar gastos operacionales, contribuciones y amarrarte a un dividendo en UF por 20 o 30 años. La respuesta seria es comparar el costo acumulado de cada camino: esta sala suma lo que gastas arrendando (con reajuste por IPC, descontando lo que rinde tu pie en un depósito a plazo) contra lo que gastas comprando (dividendo a tasa ~4,3-4,7% anual, gastos de entrada, contribuciones y mantención), encuentra el año en que comprar empieza a ganar y lo cruza con cuánto tiempo piensas quedarte.',
  icon: '🏠',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    valorPropiedad: 90000000,
    pie: 18000000,
    tasaCredito: 4.5,
    plazoAniosCredito: 25,
    arriendoMensual: 550000,
    reajusteIpcAnual: 3.5,
    gastosComunes: 80000,
    rendimientoPie: 5.5,
    aniosPermanencia: 10,
  },
  fields: [
    { id: 'valorPropiedad', label: 'Valor de la propiedad', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '90000000', help: 'Precio de venta en pesos. Si lo tienes en UF, multiplícalo por el valor de la UF del día.', group: 'La compra', groupIcon: '🏠' },
    { id: 'pie', label: 'Pie que pondrías', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '18000000', help: 'La plata propia que aportas. Los bancos suelen financiar hasta el 80-90%, así que el pie típico es 10-20% del valor.', group: 'La compra' },
    { id: 'tasaCredito', label: 'Tasa del crédito hipotecario', type: 'number', suffix: '%', required: true, min: 0, max: 20, default: 4.5, placeholder: '4.5', help: 'Tasa anual del crédito en UF. En 2026 ronda el 4,3-4,7% anual según banco, plazo y pie.', group: 'La compra' },
    { id: 'plazoAniosCredito', label: 'Plazo del crédito (años)', type: 'number', required: true, min: 1, max: 40, default: 25, help: 'Los plazos típicos en Chile son 20, 25 o 30 años.', group: 'La compra' },
    { id: 'arriendoMensual', label: 'Arriendo mensual equivalente', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '550000', help: 'Lo que pagarías por arrendar una vivienda parecida a la que comprarías.', group: 'El arriendo', groupIcon: '🔑' },
    { id: 'reajusteIpcAnual', label: 'Reajuste anual del arriendo (IPC)', type: 'number', suffix: '%', recommended: true, min: 0, max: 30, default: 3.5, placeholder: '3.5', help: 'Los contratos chilenos se reajustan por IPC o están en UF. La inflación ronda el 3,5-4% anual.', group: 'El arriendo' },
    { id: 'gastosComunes', label: 'Gastos comunes mensuales', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '80000', help: 'Los pagas arrendando y también siendo dueño: se incluyen en ambas columnas para comparar parejo.', group: 'Comunes', groupIcon: '🧾' },
    { id: 'rendimientoPie', label: 'Rendimiento del pie invertido', type: 'number', suffix: '%', default: 5.5, min: 0, max: 50, advanced: true, help: 'Si no compras, el pie puede rendir en un depósito a plazo o fondo mutuo conservador (5-6% anual típico).', group: 'Comunes' },
    { id: 'aniosPermanencia', label: '¿Cuántos años piensas quedarte?', type: 'number', recommended: true, min: 1, max: 40, default: 10, help: 'La variable clave: mientras más tiempo te quedes, más conviene comprar.', group: 'Comunes' },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-arriendo-vs-comprar-chile-10-anos-uf', label: 'Arriendo vs compra a 10 años' },
    { slug: 'cl/calculadora-credito-hipotecario-chile-uf-cmf-2026', label: 'Crédito hipotecario en UF' },
    { slug: 'cl/calculadora-cae-credito-hipotecario-chile-bancos-2026', label: 'CAE hipotecario por banco' },
    { slug: 'cl/calculadora-impuesto-territorial-contribuciones-bienes-raices-chile', label: 'Contribuciones' },
  ],
  howItWorks: `Esta sala no compara el dividendo contra el arriendo de un mes: compara el costo total de cada camino a lo largo del tiempo.

1. **Costo de arrendar.** Suma los arriendos año a año, reajustados por IPC, más los gastos comunes, y le RESTA lo que rinde tu pie invertido en un depósito a plazo. Esa resta es clave: si no compras, esa plata trabaja para ti.
2. **Costo de comprar.** Suma los gastos operacionales de entrada (~2,5% del valor: timbres, notaría, Conservador, tasación), el dividendo del crédito por los meses que lo pagas, los gastos comunes, las contribuciones (~0,5% anual) y la mantención (~1% anual).
3. **El dividendo.** Se calcula con sistema francés sobre el monto financiado (valor menos pie), a la tasa y plazo que indiques. En Chile el crédito está en UF: estable en UF, sube en pesos con la inflación, igual que el arriendo reajustado.
4. **Punto de equilibrio.** Busca el primer año en que comprar acumula menos gasto que arrendar. Antes de ese año, arrendar gana; después, comprar.
5. **Tu horizonte decide.** Cruza el punto de equilibrio con los años que piensas quedarte y te da el veredicto, más la diferencia a 5, 10 y 20 años.`,
  faq: [
    { q: '¿Arrendar es botar la plata?', a: 'No siempre. Si te quedas pocos años, los gastos de entrada de la compra (pie inmovilizado + ~2,5% de operacionales) no alcanzan a diluirse, y el pie invertido a 5-6% anual juega a favor del arriendo. La variable decisiva es el tiempo: mientras más años te quedes, más conviene comprar.' },
    { q: '¿Qué es el dividendo y por qué está en UF?', a: 'El dividendo es la cuota mensual del crédito hipotecario: amortización, intereses y seguros. En Chile los créditos se pactan en UF, la unidad reajustada por inflación, así que el dividendo es fijo en UF pero sube en pesos con el IPC. Con inflación del 3,5-4%, un dividendo de $400.000 sube unos $15.000 al año — parecido a lo que sube un arriendo reajustado.' },
    { q: '¿Cuánto pie necesito para comprar?', a: 'Los bancos financian normalmente hasta el 80% del valor (algunos llegan al 90% con condiciones), así que necesitas un pie del 10-20% más los gastos operacionales. Para una propiedad de $90.000.000, entre $9.000.000 y $18.000.000 de pie, más unos $2.000.000-$2.700.000 de gastos de entrada.' },
    { q: '¿Qué son los gastos operacionales de la compra?', a: 'El impuesto de timbres y estampillas (0,8% del crédito, con exención o rebaja para viviendas DFL-2 con tope), la notaría, la inscripción en el Conservador de Bienes Raíces, la tasación y el estudio de títulos. En conjunto suelen sumar entre 2% y 3% del valor. Esta sala usa 2,5% como referencia.' },
    { q: '¿Qué pasa con las contribuciones?', a: 'El impuesto territorial se paga en 4 cuotas al año sobre el avalúo fiscal. Muchas viviendas están exentas (avalúo bajo el mínimo no afecto) y las DFL-2 tienen beneficios, pero en propiedades de mayor valor pueden ser un costo relevante. La sala estima ~0,5% anual del valor; revisa tu caso en el SII con el avalúo real.' },
    { q: '¿El subsidio DS1 cambia la decisión?', a: 'Puede cambiarla por completo. El DS1 del MINVU aporta un subsidio directo para la compra de viviendas de hasta ~UF 2.200 en sus tramos, lo que reduce el crédito necesario y adelanta el punto de equilibrio varios años. Si tu propiedad objetivo califica y cumples los requisitos de ahorro, postula antes de decidir.' },
    { q: '¿Por qué se descuenta el rendimiento del pie?', a: 'Porque el pie tiene costo de oportunidad: si no compras, esos millones pueden rendir 5-6% anual en un depósito a plazo o fondo conservador. Ese rendimiento es plata a favor del arriendo, y es la razón por la que arrendar "gana" los primeros años. Si te gastas el pie en vez de invertirlo, la comparación deja de valer.' },
    { q: '¿Incluye la plusvalía de la propiedad?', a: 'No la descontamos, a propósito: es incierta y depende del sector. Pero juega a favor de comprar: al final del horizonte eres dueño de un activo que probablemente vale más. Si la sumaras, el punto de equilibrio se adelantaría. Preferimos mostrarte el escenario conservador.' },
  ],
  sources: [
    { name: 'CMF — Créditos hipotecarios y CAE', url: 'https://www.cmfchile.cl/' },
    { name: 'Banco Central de Chile — UF y tasas de interés', url: 'https://www.bcentral.cl/' },
    { name: 'SII — Impuesto territorial y avalúos', url: 'https://www.sii.cl/' },
  ],
};
