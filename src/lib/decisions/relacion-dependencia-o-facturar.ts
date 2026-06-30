/**
 * Sala de decisión — "¿Me conviene relación de dependencia o facturar?"
 *
 * Patrón COMPARACIÓN A vs B. El error típico es comparar el bruto en relación
 * de dependencia (RD) contra el monto que facturarías, sin contar los beneficios
 * que la RD trae "gratis" (aguinaldo, vacaciones pagas, indemnización en juego,
 * aportes). Esta sala:
 *   - calcula el neto en mano de la RD con sueldoAR(),
 *   - valoriza los beneficios de la RD que el monotributista NO tiene,
 *   - calcula el neto real del monotributista (factura − cuota − contador),
 *   - y da el número decisivo: cuánto tenés que facturar para igualar la RD.
 */

import { sueldoAR } from '../formulas/sueldo-ar';
import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num, bool } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const sueldoBrutoRD = Math.max(0, num(inputs.sueldoBrutoRD));
  const montoFactura = Math.max(0, num(inputs.montoFacturaMonotributo));
  const cuotaMonotributo = Math.max(0, num(inputs.cuotaMonotributo));
  const costoContador = Math.max(0, num(inputs.costoContador));
  const conyuge = bool(inputs.conyuge);
  const hijos = Math.max(0, Math.min(5, num(inputs.hijos)));

  if (!sueldoBrutoRD || !montoFactura) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el sueldo bruto que te ofrecen (o tenés) en relación de dependencia y el monto que facturarías como monotributista. Con eso comparamos el ingreso real de cada opción.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Cuánto facturar para igualar' },
      scenarios: [],
      nextActions: [
        'Cargá el **sueldo bruto** en relación de dependencia y el **monto que facturarías** por mes.',
        'Sumá la **cuota del monotributo** y el **costo del contador** para ver el neto real de facturar.',
      ],
    };
  }

  // — Relación de dependencia: neto en mano + beneficios que trae "gratis" —
  const netoRD = sueldoAR({ bruto: sueldoBrutoRD, conyuge, hijos }).neto;
  const aguinaldoMes = netoRD / 12; // SAC ≈ 1 sueldo/año prorrateado
  const vacacionesMes = netoRD * 0.08; // ~14 días pagos extra al año ≈ 8% mensual
  const aporteIndemnMes = netoRD / 12; // provisión: 1 sueldo/año de antigüedad en juego
  // Obra social: en RD viene incluida en los aportes; en monotributo va en la cuota.
  const beneficiosRD = aguinaldoMes + vacacionesMes + aporteIndemnMes;
  const valorTotalRD = netoRD + beneficiosRD;

  // — Monotributo: lo que realmente te queda —
  // El autoaporte jubilatorio y la obra social se asumen incluidos en la cuota.
  const netoFacturado = montoFactura - cuotaMonotributo - costoContador;

  // — Número decisivo: cuánto tenés que facturar para igualar la RD —
  // facturaIgual cubre el valor total de la RD + los costos fijos del monotributo.
  const facturaIgual = valorTotalRD + cuotaMonotributo + costoContador;
  const gap = netoFacturado - valorTotalRD; // + => facturar conviene

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;
  const margen = valorTotalRD > 0 ? (gap / valorTotalRD) * 100 : 0;

  if (margen >= 10) {
    status = 'b'; // B = facturar
    tone = 'good';
    title = 'Conviene facturar como monotributista';
    badge = 'Mejor facturar';
    detail = `Facturando ${fmtMoney(montoFactura)} te quedan ${fmtMoney(netoFacturado)} netos, contra ${fmtMoney(valorTotalRD)} de valor total en relación de dependencia (neto + aguinaldo + vacaciones + cobertura de indemnización). Facturar te deja ${fmtMoney(gap)} más por mes. Ojo: estás cambiando estabilidad por flexibilidad.`;
  } else if (margen <= -10) {
    status = 'a'; // A = relación de dependencia
    tone = 'good';
    title = 'Conviene la relación de dependencia';
    badge = 'Mejor en blanco';
    detail = `La relación de dependencia te da un valor total de ${fmtMoney(valorTotalRD)} por mes (neto + aguinaldo + vacaciones pagas + cobertura de indemnización), contra ${fmtMoney(netoFacturado)} netos facturando. Para igualar la RD tendrías que facturar ${fmtMoney(facturaIgual)}, bastante más que los ${fmtMoney(montoFactura)} que estimás.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por estabilidad vs flexibilidad';
    badge = 'Es parejo';
    detail = `Las dos opciones quedan muy cerca: ${fmtMoney(valorTotalRD)} de valor total en relación de dependencia contra ${fmtMoney(netoFacturado)} netos facturando (diferencia de ${fmtMoney(Math.abs(gap))}/mes). Decidí por lo no monetario: estabilidad y beneficios vs libertad y poder facturar a varios clientes.`;
  }

  const scenarios = [
    {
      label: 'Relación de dependencia',
      value: fmtMoney(valorTotalRD),
      detail: `Neto en mano (${fmtMoney(netoRD)}) + aguinaldo + vacaciones pagas + cobertura de indemnización, prorrateado por mes.`,
    },
    {
      label: 'Facturar (monotributo)',
      value: fmtMoney(netoFacturado),
      detail: `${fmtMoney(montoFactura)} facturados − ${fmtMoney(cuotaMonotributo)} de cuota − ${fmtMoney(costoContador)} de contador.`,
    },
    {
      label: 'Para igualar la RD',
      value: fmtMoney(facturaIgual),
      detail: 'Cuánto tendrías que facturar por mes para empatar el valor total de la relación de dependencia.',
    },
  ];

  const comparison = {
    columns: ['Relación de dependencia', 'Facturar (monotributo)'] as [string, string],
    rows: [
      { label: 'Ingreso de bolsillo', a: fmtMoney(netoRD), b: fmtMoney(netoFacturado), hint: 'Neto en mano vs factura menos costos' },
      { label: 'Aguinaldo (SAC) prorrateado', a: '+' + fmtMoney(aguinaldoMes).replace('-', ''), b: fmtMoney(0), hint: 'El monotributista no cobra aguinaldo' },
      { label: 'Vacaciones pagas (prorrateadas)', a: '+' + fmtMoney(vacacionesMes).replace('-', ''), b: fmtMoney(0), hint: 'Si no facturás, no cobrás' },
      { label: 'Cobertura de indemnización', a: '+' + fmtMoney(aporteIndemnMes).replace('-', ''), b: fmtMoney(0), hint: 'En RD acumulás antigüedad indemnizable' },
      { label: 'Costos fijos mensuales', a: fmtMoney(0), b: '-' + fmtMoney(cuotaMonotributo + costoContador).replace('-', ''), hint: 'Cuota + contador' },
      { label: 'Valor total por mes', a: fmtMoney(valorTotalRD), b: fmtMoney(netoFacturado), hint: `${fmtPct(margen, 1)} a favor de facturar` },
    ],
  };

  const nextActions = [
    `El número clave: tenés que facturar **${fmtMoney(facturaIgual)}** por mes para igualar la relación de dependencia. La oferta de facturar ${fmtMoney(montoFactura)} ${montoFactura >= facturaIgual ? 'ya supera ese piso ✓' : 'queda por debajo ✗'}.`,
    'Verificá que el monto facturado **no te saque de categoría** del monotributo: si te pasás del tope anual, vas a IVA + Ganancias como responsable inscripto y el cálculo cambia.',
    'Si facturás, **separá vos mismo** el equivalente al aguinaldo, las vacaciones y un fondo ante la falta de indemnización: en RD esos colchones vienen incluidos.',
    'Confirmá con un contador si te conviene **monotributo o autónomo/responsable inscripto** según tu nivel de facturación y tus gastos deducibles.',
  ];

  const notes = [
    'Los beneficios de la relación de dependencia se valorizan como prorrateo mensual: aguinaldo ≈ un sueldo neto al año, vacaciones ≈ 8% del neto mensual, y una provisión por la antigüedad indemnizable que acumulás (≈ un sueldo al año).',
    'Se asume que el autoaporte jubilatorio y la obra social del monotributista están incluidos en la cuota. Si pagás obra social privada aparte, restala del neto facturado.',
    'No considera ingresos brutos provinciales ni la posibilidad de deducir gastos: en facturación pueden cambiar el resultado. No es asesoramiento contable: consultá con un contador matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(facturaIgual),
      label: 'Cuánto facturar para igualar la RD',
      sub: `Valor total en relación de dependencia: **${fmtMoney(valorTotalRD)}/mes**. Facturando hoy te quedan **${fmtMoney(netoFacturado)}**.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'relacion-dependencia-o-facturar',
  title: '¿Relación de dependencia o facturar? Comparador real 2026',
  h1: '¿Me conviene relación de dependencia o facturar?',
  description:
    'Compará trabajar en relación de dependencia contra facturar como monotributista con números reales: neto en mano, aguinaldo, vacaciones, indemnización, cuota y contador. Te decimos cuánto tenés que facturar para igualar el sueldo en blanco.',
  intro:
    'Comparar el sueldo bruto contra el monto a facturar engaña: la relación de dependencia trae aguinaldo, vacaciones pagas, aportes e indemnización que el monotributista no tiene. Esta sala calcula el ingreso real de cada opción y te da el número que de verdad importa: cuánto tenés que facturar para igualar la posición en blanco.',
  icon: '🧾',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    sueldoBrutoRD: 1500000,
    montoFacturaMonotributo: 1800000,
    cuotaMonotributo: 37000,
    costoContador: 25000,
    conyuge: 'no',
    hijos: 0,
  },
  fields: [
    {
      id: 'sueldoBrutoRD',
      label: 'Sueldo bruto en relación de dependencia',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'trabajo.sueldoBruto',
      help: 'El bruto que te ofrecen o ganás en blanco (antes de descuentos).',
      group: 'En blanco',
      groupIcon: '💼',
    },
    {
      id: 'montoFacturaMonotributo',
      label: 'Monto que facturarías por mes',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1800000',
      help: 'Lo que cobrarías por mes facturando como monotributista.',
      group: 'Facturando',
      groupIcon: '🧾',
    },
    {
      id: 'cuotaMonotributo',
      label: 'Cuota del monotributo',
      type: 'number',
      prefix: '$',
      default: 37000,
      min: 0,
      recommended: true,
      placeholder: '37000',
      help: 'Cuota mensual de tu categoría (incluye impuesto, jubilación y obra social).',
      group: 'Facturando',
    },
    {
      id: 'costoContador',
      label: 'Costo del contador por mes',
      type: 'number',
      prefix: '$',
      default: 25000,
      min: 0,
      recommended: true,
      placeholder: '25000',
      help: 'Lo que pagás por mes a un contador (0 si lo hacés vos).',
      group: 'Facturando',
    },
    {
      id: 'conyuge',
      label: 'Cónyuge a cargo',
      type: 'select',
      default: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Afecta la deducción de Ganancias en relación de dependencia.',
      group: 'Tu situación',
      groupIcon: '👨‍👩‍👧',
    },
    {
      id: 'hijos',
      label: 'Hijos a cargo',
      type: 'select',
      default: '0',
      options: [
        { value: '0', label: 'No tengo' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5 o más' },
      ],
      help: 'Afecta la deducción de Ganancias en relación de dependencia.',
      group: 'Tu situación',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-monotributo-2026', label: 'Monotributo 2026' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-aguinaldo-sac', label: 'Aguinaldo (SAC)' },
    { slug: 'calculadora-impuesto-ganancias-sueldo', label: 'Impuesto a las Ganancias' },
  ],
  howItWorks: `Comparar el bruto contra la factura es engañoso: hay que poner todo en el mismo plano.

1. **Neto en mano de la relación de dependencia.** Aplica aportes (17%) y Ganancias al sueldo bruto, con la misma lógica de la calculadora de sueldo en mano.
2. **Beneficios que la RD trae "gratis".** Valoriza por mes el aguinaldo (≈ un sueldo neto al año), las vacaciones pagas (≈ 8% del neto mensual) y la cobertura de indemnización (acumulás antigüedad indemnizable). El monotributista no tiene nada de eso.
3. **Neto real de facturar.** Al monto que facturarías le resta la cuota del monotributo y el costo del contador. El autoaporte jubilatorio y la obra social se asumen dentro de la cuota.
4. **Número decisivo.** Calcula cuánto tendrías que facturar para igualar el valor total de la relación de dependencia (neto + beneficios + costos fijos del monotributo).
5. **Veredicto.** Compara ambos lados y marca cuál conviene, recordando que la RD da estabilidad y la facturación da flexibilidad.`,
  faq: [
    {
      q: '¿Por qué no alcanza con comparar el bruto contra lo que facturo?',
      a: 'Porque la relación de dependencia incluye beneficios que la factura no: aguinaldo, vacaciones pagas, aportes jubilatorios del empleador y una indemnización en caso de despido. Esta sala valoriza esos beneficios por mes para que la comparación sea justa.',
    },
    {
      q: '¿Cuánto tengo que facturar para igualar un sueldo en blanco?',
      a: 'Más de lo que parece. Tenés que cubrir el neto, el equivalente al aguinaldo y las vacaciones, una provisión por la indemnización que no vas a tener, más la cuota del monotributo y el contador. Esta sala calcula ese número exacto según tus datos.',
    },
    {
      q: '¿El monotributo incluye jubilación y obra social?',
      a: 'Sí. La cuota del monotributo tiene tres componentes: el impuesto integrado, el aporte jubilatorio (SIPA) y el aporte a la obra social. Por eso en esta sala se asumen incluidos dentro de la cuota que cargás.',
    },
    {
      q: '¿Qué pasa si me paso del tope del monotributo?',
      a: 'Si superás el límite anual de facturación de tu categoría máxima, quedás excluido del monotributo y pasás a responsable inscripto: IVA más Impuesto a las Ganancias. El cálculo cambia bastante, así que conviene chequear los topes antes de decidir.',
    },
    {
      q: '¿Facturar es siempre más riesgoso?',
      a: 'Tiene más flexibilidad (varios clientes, podés deducir gastos) pero menos red de seguridad: no hay sueldo garantizado, ni aguinaldo, ni indemnización, ni licencia paga. Por eso conviene separar vos mismo esos colchones si elegís facturar.',
    },
    {
      q: '¿Puedo deducir gastos si facturo?',
      a: 'En el monotributo no se deducen gastos (pagás una cuota fija). Recién como responsable inscripto podés deducir gastos vinculados a tu actividad. Esta sala usa el esquema de monotributo; para inscripto consultá con un contador.',
    },
    {
      q: '¿Y la estabilidad y los derechos laborales?',
      a: 'En relación de dependencia tenés protección de la LCT: indemnización por despido, licencias, ART, vacaciones. Facturando sos tu propio jefe pero asumís todos los riesgos. El valor de esa estabilidad es difícil de poner en pesos: pesalo además del número.',
    },
    {
      q: '¿Esto reemplaza a un contador?',
      a: 'No. Es una estimación orientativa que no contempla ingresos brutos provinciales, deducción de gastos ni tu caso impositivo particular. Para una decisión grande, consultá con un contador público matriculado.',
    },
  ],
  sources: [
    { name: 'ARCA — Monotributo', url: 'https://www.arca.gob.ar/monotributo/' },
    { name: 'Ley 20.744 (LCT) — Aguinaldo, vacaciones, indemnización', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552' },
    { name: 'Ley 24.241 — Aportes (SIPA)', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-24241-639' },
  ],
};
