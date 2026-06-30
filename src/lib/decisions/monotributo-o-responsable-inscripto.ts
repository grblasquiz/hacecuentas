/**
 * Sala de decisión — "¿Me conviene monotributo o responsable inscripto?"
 *
 * Patrón COMPARACIÓN A vs B. Estima la carga impositiva de cada régimen sobre la
 * misma facturación y devuelve cuál deja MÁS neto:
 *   - Monotributo (A): cuota fija mensual estimada según facturación; NO computa
 *     el IVA de tus compras (lo pagás como costo).
 *   - Responsable Inscripto (B): IVA por diferencia (débito − crédito), un
 *     estimado de Ganancias e IIBB, más el costo del contador.
 * El IVA débito de RI puede trasladarse o no al cliente según a quién le vendas
 * (consumidor final vs empresas que descargan crédito fiscal). Math inline
 * aproximado; disclaimer fuerte.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';
import { categoriaPorIngresos, cuota as cuotaMono } from '../data/monotributo-2026';

const IVA = 0.21;

function compute(inputs: Record<string, any>): DecisionResult {
  const facturacion = Math.max(0, num(inputs.facturacionMensual));
  const comprasConIVA = Math.max(0, num(inputs.comprasConIVA));
  const tipoClientes = String(inputs.tipoClientes || 'consumidorFinal');
  const costoContador = Math.max(0, num(inputs.costoContadorRI));

  if (!facturacion) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu facturación mensual y tus compras con IVA para estimar cuál régimen te deja más neto.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Régimen que más conviene' },
      scenarios: [],
      nextActions: [
        'Cargá tu **facturación mensual** y tus **compras con IVA** del negocio.',
        'Indicá a **quién le vendés** (consumidor final o empresas): cambia mucho el peso del IVA.',
      ],
    };
  }

  // — MONOTRIBUTO (A) —
  // Cuota REAL de la categoría que corresponde a tu facturación anualizada
  // (fuente única src/lib/data/monotributo-2026.ts, escala ARCA vigente). Usamos
  // la cuota de servicios (la más alta en categorías altas; conservador). Si tu
  // facturación supera el tope de K, no podés ser monotributo: usamos la cuota de
  // K como piso y lo avisamos.
  const catMono = categoriaPorIngresos(facturacion * 12);
  const excedeMonotributo = catMono === null;
  const cuotaMonotributo = cuotaMono(catMono ?? 'K', 'servicios');
  // El monotributista NO computa el IVA de sus compras: lo paga como mayor costo.
  const ivaCompras = comprasConIVA * IVA / (1 + IVA); // IVA contenido en compras con IVA
  const costoMono = cuotaMonotributo + ivaCompras; // carga mensual total
  const netoMono = facturacion - costoMono;

  // — RESPONSABLE INSCRIPTO (B) —
  // IVA por diferencia. Si vende a consumidor final, el IVA débito sale del precio
  // (no lo puede sumar aparte sin perder competitividad) → pesa como costo.
  // Si vende a empresas, el IVA débito se traslada (la empresa lo descarga) → solo
  // afecta el flujo, no el neto; igual computa crédito fiscal de sus compras.
  const ivaDebito = facturacion * IVA / (1 + IVA); // IVA contenido en la facturación
  const ivaCredito = ivaCompras;
  const ivaAPagar = Math.max(0, ivaDebito - ivaCredito);
  const ivaNetoCostoRI = tipoClientes === 'empresas' ? 0 : ivaAPagar; // a empresas se traslada
  // Ganancias aproximada: 15% de la facturación neta de IVA (muy aproximado).
  const baseGanancias = facturacion - ivaDebito;
  const ganancias = baseGanancias * 0.15;
  // IIBB aproximado: 3% de la facturación neta de IVA.
  const iibb = baseGanancias * 0.03;
  const costoRI = ivaNetoCostoRI + ganancias + iibb + costoContador;
  const netoRI = facturacion - costoRI;

  const diff = netoRI - netoMono; // + => conviene RI
  const ganaRI = diff > 0;
  const margen = Math.abs(diff);
  const empate = margen < facturacion * 0.02; // menos de 2% de la facturación

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (empate) {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por simplicidad';
    badge = 'Es parejo';
    detail = `Los dos regímenes te dejan un neto muy parecido (diferencia de apenas ${fmtMoney(margen)}/mes). Si están empatados, el monotributo gana por simplicidad: menos trámites, sin contador obligatorio, cuota fija.`;
  } else if (ganaRI) {
    status = 'b';
    tone = 'good';
    title = 'Te conviene Responsable Inscripto';
    badge = 'Responsable Inscripto';
    detail = `Como Responsable Inscripto te quedarían ${fmtMoney(netoRI)}/mes vs ${fmtMoney(netoMono)} en monotributo: ${fmtMoney(margen)} más por mes. Pesa que podés computar el IVA de tus compras${tipoClientes === 'empresas' ? ' y que tus clientes empresa descargan tu IVA' : ''}.`;
  } else {
    status = 'a';
    tone = 'good';
    title = 'Te conviene el monotributo';
    badge = 'Monotributo';
    detail = `El monotributo te deja ${fmtMoney(netoMono)}/mes vs ${fmtMoney(netoRI)} como Responsable Inscripto: ${fmtMoney(margen)} más por mes, con menos trámites y sin contador obligatorio. Mientras no superes el tope, es lo más simple y barato.`;
  }

  const scenarios = [
    {
      label: 'Monotributo',
      value: fmtMoney(netoMono) + '/mes',
      detail: `Cuota fija ${fmtMoney(cuotaMonotributo)} + IVA de compras que no recuperás.`,
    },
    {
      label: 'Responsable Inscripto',
      value: fmtMoney(netoRI) + '/mes',
      detail: tipoClientes === 'empresas'
        ? 'IVA se traslada a tus clientes empresa; pagás Ganancias, IIBB y contador.'
        : 'IVA al consumidor final pesa como costo; sumás Ganancias, IIBB y contador.',
    },
    {
      label: 'Diferencia',
      value: (ganaRI ? '+' : '−') + fmtMoney(margen) + '/mes',
      detail: ganaRI ? 'A favor de Responsable Inscripto.' : 'A favor de monotributo.',
    },
  ];

  const comparison = {
    columns: ['Monotributo', 'Responsable Inscripto'] as [string, string],
    rows: [
      { label: 'Facturación mensual', a: fmtMoney(facturacion), b: fmtMoney(facturacion) },
      { label: 'Cuota fija / impositivo', a: fmtMoney(cuotaMonotributo), b: '—', hint: 'monotributo: cuota única' },
      { label: 'IVA (neto, lo que pesa)', a: '-' + fmtMoney(ivaCompras), b: '-' + fmtMoney(ivaNetoCostoRI), hint: tipoClientes === 'empresas' ? 'RI traslada el IVA débito' : 'RI a consumidor final absorbe el IVA' },
      { label: 'Ganancias estimada', a: '—', b: '-' + fmtMoney(ganancias), hint: 'monotributo no paga Ganancias' },
      { label: 'Ingresos Brutos estimado', a: '—', b: '-' + fmtMoney(iibb) },
      { label: 'Contador', a: '—', b: '-' + fmtMoney(costoContador), hint: 'RI suele requerir contador' },
      { label: 'Neto en mano', a: fmtMoney(netoMono), b: fmtMoney(netoRI) },
    ],
  };

  const nextActions = [
    `Según esta estimación te conviene **${ganaRI ? 'Responsable Inscripto' : 'el monotributo'}** por ${fmtMoney(margen)}/mes. Pero la diferencia depende de supuestos: validala con un contador antes de cambiar.`,
    'Confirmá tu **categoría de monotributo y el tope**: si tu facturación crece y supera el límite, el cambio a Responsable Inscripto deja de ser opcional.',
    tipoClientes === 'empresas'
      ? 'Vendés a empresas: como Responsable Inscripto tu IVA se traslada (ellas lo descargan), así que el IVA casi no te pesa y podés computar el crédito de tus compras. Suele inclinar a favor de RI.'
      : 'Vendés a consumidor final: el IVA de RI lo terminás absorbiendo vos (no lo podés sumar al precio sin perder ventas). El monotributo, sin IVA, suele convenir más.',
    comprasConIVA > 0
      ? `Tenés ${fmtMoney(comprasConIVA)} de compras con IVA: como Responsable Inscripto recuperás ese crédito fiscal; como monotributista lo perdés. Cuanto más comprás con IVA, más conviene RI.`
      : 'Si tu negocio compra mucho con IVA (mercadería, insumos), Responsable Inscripto te deja recuperar ese IVA: cargá tus compras para verlo.',
  ];

  const notes = [
    excedeMonotributo
      ? '⚠️ Tu facturación anualizada SUPERA el tope de la categoría K: no podrías inscribirte en monotributo (usamos la cuota de K solo como referencia). En tu caso el Responsable Inscripto es prácticamente la única opción.'
      : `La cuota de monotributo usa el valor REAL de la categoría que te corresponde por facturación (escala ARCA vigente). Ganancias/IIBB se estiman con alícuotas genéricas (15% y 3%): tu carga real depende de actividad, jurisdicción y deducciones.`,
    'El IVA es el factor clave: como Responsable Inscripto computás crédito fiscal de tus compras y trasladás el débito a clientes que descarguen IVA (empresas). A consumidor final, ese IVA suele pesar como costo.',
    'El monotributo incluye en su cuota el componente impositivo, los aportes jubilatorios y la obra social. Como Responsable Inscripto, los aportes autónomos van aparte (no incluidos en este modelo).',
    'No es asesoramiento contable. La elección de régimen tiene consecuencias importantes: consultá SIEMPRE con un contador público matriculado y verificá los valores vigentes en ARCA.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: ganaRI ? 'Responsable Inscripto' : (empate ? 'Parejo' : 'Monotributo'),
      label: 'Régimen que deja más neto',
      sub: `Monotributo: **${fmtMoney(netoMono)}**/mes · Responsable Inscripto: **${fmtMoney(netoRI)}**/mes. Estimación aproximada — validá con un contador.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'monotributo-o-responsable-inscripto',
  title: '¿Monotributo o Responsable Inscripto? Comparador 2026',
  h1: '¿Me conviene monotributo o responsable inscripto?',
  description:
    'Compará la carga impositiva del monotributo contra Responsable Inscripto sobre tu facturación: cuota fija vs IVA, Ganancias, IIBB y contador. Te decimos cuál te deja más neto según a quién le vendas.',
  intro:
    'La elección entre monotributo y Responsable Inscripto cambia mucho según cuánto factures, cuánto compres con IVA y a quién le vendas. El monotributo es una cuota fija simple pero te hace perder el IVA de tus compras; Responsable Inscripto te deja computar ese IVA pero suma Ganancias, IIBB y contador. Esta sala estima la carga de cada uno y te dice cuál te deja más en el bolsillo.',
  icon: '⚖️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    facturacionMensual: 4_500_000,
    comprasConIVA: 1_800_000,
    tipoClientes: 'empresas',
    costoContadorRI: 120_000,
  },
  fields: [
    {
      id: 'facturacionMensual',
      label: 'Facturación mensual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '4500000',
      help: 'Lo que facturás por mes (promedio).',
      group: 'Tu negocio',
      groupIcon: '🏢',
    },
    {
      id: 'comprasConIVA',
      label: 'Compras con IVA ($/mes)',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '1800000',
      help: 'Insumos, mercadería, servicios que comprás con factura A (IVA discriminado). Define el crédito fiscal que recuperás como RI.',
      group: 'Tu negocio',
    },
    {
      id: 'tipoClientes',
      label: '¿A quién le vendés?',
      type: 'select',
      default: 'consumidorFinal',
      options: [
        { value: 'consumidorFinal', label: 'Consumidor final' },
        { value: 'empresas', label: 'Empresas (descargan IVA)' },
      ],
      help: 'Si vendés a empresas, el IVA se traslada y casi no te pesa. A consumidor final, lo absorbés vos.',
      group: 'Tu negocio',
    },
    {
      id: 'costoContadorRI',
      label: 'Costo del contador ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '120000',
      help: 'Honorarios mensuales del contador si pasás a Responsable Inscripto (suele ser obligatorio en la práctica).',
      group: 'Tu negocio',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-monotributo-vs-responsable-inscripto', label: 'Monotributo vs RI (detalle)' },
    { slug: 'calculadora-facturacion-maxima-monotributo-vs-ri', label: 'Facturación máxima por régimen' },
    { slug: 'calculadora-monotributo-2026', label: 'Cuota de monotributo' },
    { slug: 'calculadora-monotributo-categoria-ingresos-tope', label: 'Categoría y topes' },
  ],
  howItWorks: `Esta sala estima cuánto te queda en el bolsillo con cada régimen, sobre la misma facturación.

1. **Carga del monotributo.** Calcula una cuota fija mensual estimada (incluye impositivo, jubilación y obra social) y le suma el IVA de tus compras, que como monotributista NO recuperás: lo pagás como mayor costo.
2. **Carga del Responsable Inscripto.** Estima el IVA por diferencia (débito de tus ventas menos crédito de tus compras), un cálculo aproximado de Ganancias e Ingresos Brutos, y el costo del contador.
3. **El factor IVA.** Acá está la clave: si vendés a empresas, el IVA débito se traslada (ellas lo descargan) y casi no te pesa. Si vendés a consumidor final, ese IVA lo absorbés vos. La sala lo ajusta según a quién le vendas.
4. **Comparación de netos.** Resta cada carga a la facturación y compara los netos. Gana el régimen que deja más plata.
5. **Empate técnico.** Si la diferencia es chica (menos del 2% de la facturación), recomienda el monotributo por simplicidad: menos trámites y sin contador obligatorio.`,
  faq: [
    {
      q: '¿Cuándo conviene el monotributo y cuándo Responsable Inscripto?',
      a: 'A grandes rasgos: el monotributo conviene si facturás poco, comprás poco con IVA y vendés a consumidor final. Responsable Inscripto conviene si facturás mucho (o superás el tope), comprás bastante con IVA (recuperás crédito fiscal) y/o vendés a empresas que descargan tu IVA.',
    },
    {
      q: '¿Por qué importa tanto a quién le vendo?',
      a: 'Porque define el peso del IVA. Si vendés a empresas, ellas descargan el IVA que les facturás, así que para vos es neutro y encima recuperás el crédito de tus compras: RI se vuelve muy atractivo. Si vendés a consumidor final, no podés trasladar el IVA sin perder competitividad, así que lo terminás absorbiendo.',
    },
    {
      q: '¿Qué es el crédito fiscal del IVA?',
      a: 'Es el IVA que pagaste en tus compras (con factura A). Como Responsable Inscripto lo restás del IVA que cobraste en tus ventas, así que solo pagás la diferencia. Como monotributista no podés computarlo: ese IVA es un costo perdido. Cuanto más comprás con IVA, más conviene RI.',
    },
    {
      q: '¿El monotributo incluye los aportes jubilatorios?',
      a: 'Sí. La cuota de monotributo tiene tres componentes: impositivo, jubilatorio (SIPA) y obra social. Como Responsable Inscripto, en cambio, los aportes autónomos van por separado, además de los impuestos. Tenelo en cuenta al comparar.',
    },
    {
      q: '¿Necesito un contador si soy Responsable Inscripto?',
      a: 'En la práctica, casi siempre sí: las declaraciones de IVA, Ganancias e IIBB son mensuales y complejas. El monotributo, en cambio, lo podés gestionar solo. El costo del contador es un factor real que esta sala incluye en la comparación.',
    },
    {
      q: '¿Qué pasa si supero el tope del monotributo?',
      a: 'Dejás de poder elegir: la AFIP/ARCA te excluye del monotributo y tenés que pasar a Responsable Inscripto. Por eso conviene anticiparlo. Si estás cerca del tope, mirá nuestra sala "¿Qué categoría de monotributo me corresponde?" para planificar el momento.',
    },
    {
      q: '¿Los números de esta calculadora son exactos?',
      a: 'La cuota de monotributo es real (la de tu categoría según la escala ARCA vigente), pero Ganancias e IIBB del Responsable Inscripto se estiman con alícuotas genéricas (15% y 3%). Tu carga real depende de tu actividad, jurisdicción y deducciones. Usala para tener una intuición y validá la decisión con un contador.',
    },
    {
      q: '¿Esto reemplaza a un contador?',
      a: 'De ninguna manera. La elección de régimen tributario tiene consecuencias importantes y difíciles de revertir. Esta sala te orienta sobre qué dirección mirar; la decisión final tomala con un contador público matriculado y los valores vigentes en ARCA.',
    },
  ],
  sources: [
    { name: 'ARCA — Monotributo y Régimen General (IVA/Ganancias)', url: 'https://www.arca.gob.ar/' },
    { name: 'Ley 23.349 — Impuesto al Valor Agregado', url: 'https://www.argentina.gob.ar/normativa' },
  ],
};
