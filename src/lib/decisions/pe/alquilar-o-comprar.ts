/**
 * Sala de decisión PE — "¿Me conviene alquilar o comprar?"
 *
 * Patrón VIVIENDA / OPTIMIZACIÓN, con los costos reales de comprar en el Perú:
 * crédito hipotecario en soles a TCEA ~9-11%, cuota inicial de 10-20% (7,5%
 * mínimo en el Nuevo Crédito Mivivienda, que además da el Bono del Buen
 * Pagador), gastos notariales y registrales de ~1-3%, impuesto de alcabala del
 * 3% sobre el exceso de 10 UIT, y mantenimiento. Del lado del alquiler: renta
 * que sube por contrato y el rendimiento de la cuota inicial que NO
 * inmovilizas. Encuentra el punto de equilibrio en años.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { num } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

/** UIT de referencia 2026 (~S/ 5,350): la alcabala grava el exceso de 10 UIT. */
const UIT = 5350;
/** Gastos notariales + registrales + tasación, ~2% del valor (rango 1-3%). */
const PCT_GASTOS_CIERRE = 0.02;
/** Mantenimiento del inmueble ~1% del valor por año. */
const PCT_MANTENIMIENTO_ANUAL = 0.01;

/** Cuota mensual francesa desde TCEA (efectiva anual). */
function cuotaDesdeTcea(capital: number, tceaPct: number, nMeses: number): number {
  if (capital <= 0 || nMeses <= 0) return 0;
  const i = Math.pow(1 + tceaPct / 100, 1 / 12) - 1;
  if (i === 0) return capital / nMeses;
  return (capital * i) / (1 - Math.pow(1 + i, -nMeses));
}

/** Alcabala: 3% sobre el valor que excede 10 UIT (paga el comprador). */
function alcabala(valor: number): number {
  return Math.max(0, valor - 10 * UIT) * 0.03;
}

function costoAlquilar(
  alquiler: number,
  ajustePct: number,
  mantCondominio: number,
  inicial: number,
  rendTeaPct: number,
  anios: number
): number {
  let totalAlquiler = 0;
  for (let y = 0; y < anios; y++) {
    totalAlquiler += alquiler * Math.pow(1 + ajustePct / 100, y) * 12;
  }
  const totalMant = mantCondominio * 12 * anios;
  // La cuota inicial que no inmovilizaste rinde compuesto (depósito/caja/fondos).
  const gananciaInicial = inicial * (Math.pow(1 + rendTeaPct / 100, anios) - 1);
  return totalAlquiler + totalMant - gananciaInicial;
}

function costoComprar(
  valor: number,
  bono: number,
  cuota: number,
  plazoCredito: number,
  mantCondominio: number,
  anios: number
): number {
  const cierre = valor * PCT_GASTOS_CIERRE + alcabala(valor);
  const mesesPagados = Math.min(anios, plazoCredito) * 12;
  const totalCuotas = cuota * mesesPagados;
  const totalMantCondominio = mantCondominio * 12 * anios;
  const mantInmueble = valor * PCT_MANTENIMIENTO_ANUAL * anios;
  // El bono (Mivivienda) no es costo: ya redujo el capital del crédito.
  void bono;
  return cierre + totalCuotas + totalMantCondominio + mantInmueble;
}

function compute(inputs: Record<string, any>): DecisionResult {
  const valor = Math.max(0, num(inputs.valorInmueble));
  const inicial = Math.max(0, num(inputs.cuotaInicial));
  const bono = Math.max(0, num(inputs.bonoBuenPagador));
  const tcea = Math.max(0, num(inputs.tceaCredito));
  const plazoCredito = Math.max(0, num(inputs.plazoAniosCredito));
  const alquiler = Math.max(0, num(inputs.alquilerMensual));
  const ajuste = Math.max(0, num(inputs.ajusteAlquilerAnual));
  const mantCondominio = Math.max(0, num(inputs.mantenimientoCondominio));
  const permanencia = Math.max(1, num(inputs.aniosPermanencia));
  const rendTea = Math.max(0, num(inputs.rendimientoTEA)) || 4.5;

  if (!valor || !alquiler || !plazoCredito) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga el valor del inmueble, el alquiler mensual de uno equivalente y el plazo del crédito hipotecario. Con eso comparamos el costo acumulado de alquilar contra el de comprar y buscamos el punto de equilibrio en años.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Punto de equilibrio' },
      scenarios: [],
      nextActions: [
        'Carga el **valor del inmueble** y el **alquiler mensual** de una vivienda equivalente en la misma zona.',
        'Indica el **plazo del crédito**, la **cuota inicial** (10-20% del valor) y la **TCEA** que te ofrece el banco.',
      ],
    };
  }

  const capitalCredito = Math.max(0, valor - inicial - bono);
  const cuota = cuotaDesdeTcea(capitalCredito, tcea, plazoCredito * 12);
  const gastosCierre = valor * PCT_GASTOS_CIERRE + alcabala(valor);

  const costAlq = (n: number) => costoAlquilar(alquiler, ajuste, mantCondominio, inicial, rendTea, n);
  const costComp = (n: number) => costoComprar(valor, bono, cuota, plazoCredito, mantCondominio, n);

  let breakEven = 0;
  for (let y = 1; y <= 40; y++) {
    if (costComp(y) <= costAlq(y)) {
      breakEven = y;
      break;
    }
  }

  const costAlqPerm = costAlq(permanencia);
  const costCompPerm = costComp(permanencia);
  const diff = costAlqPerm - costCompPerm; // + => comprar más barato a tu horizonte

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
    detail = `Comprar se equilibra a partir del año ${breakEven}, y tú piensas quedarte ${permanencia} años. En ese plazo comprar te cuesta ${fmtMoney(Math.abs(diff))} menos que alquilar — y al final el departamento es tuyo. ${bono > 0 ? `El Bono del Buen Pagador de ${fmtMoney(bono)} te recortó el crédito y adelanta el equilibrio.` : 'Si calificas al Nuevo Crédito Mivivienda, el Bono del Buen Pagador puede adelantar aún más el equilibrio.'}`;
  } else if (breakEven === 0 || permanencia < breakEven - 1) {
    status = 'a';
    tone = 'warn';
    title = 'A tu horizonte, te conviene alquilar';
    badge = 'Alquila';
    detail =
      breakEven > 0
        ? `Comprar recién se equilibra en el año ${breakEven} y tú piensas quedarte ${permanencia} años. Hasta entonces, alquilar te cuesta ${fmtMoney(Math.abs(diff))} menos: alquila y pon la cuota inicial a rendir (${rendTea.toFixed(1).replace('.', ',')}% TEA de referencia).`
        : `Con estos números, comprar no se equilibra ni en 40 años: el alquiler es muy barato frente al precio de venta de la zona. Alquila e invierte la cuota inicial — revisa también si el precio del inmueble no está inflado.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está muy parejo: decide por tu plan de vida';
    badge = 'Parejo';
    detail = `El punto de equilibrio (año ${breakEven}) cae muy cerca de tu horizonte de ${permanencia} años: la diferencia es de apenas ${fmtMoney(Math.abs(diff))}. Decide por estabilidad laboral, arraigo y ganas de ser propietario, no solo por la plata.`;
  }

  const scenarios = [5, 10, 20].map((n) => {
    const d = costAlq(n) - costComp(n);
    return {
      label: `A ${n} años`,
      value: d >= 0 ? 'Comprar: ' + fmtMoney(d) : 'Alquilar: ' + fmtMoney(-d),
      detail: d >= 0 ? `Comprar acumula ${fmtMoney(Math.abs(d))} menos de gasto a ${n} años.` : `Alquilar acumula ${fmtMoney(Math.abs(d))} menos de gasto a ${n} años.`,
    };
  });

  const comparison = {
    columns: ['Alquilar', 'Comprar'] as [string, string],
    rows: [
      { label: 'Desembolso inicial', a: fmtMoney(alquiler * 3), b: fmtMoney(inicial + gastosCierre), hint: 'Alquilar: adelanto + garantía · Comprar: inicial + notario/registro + alcabala' },
      { label: 'Impuesto de alcabala', a: '—', b: fmtMoney(alcabala(valor)), hint: '3% sobre lo que excede 10 UIT' },
      { label: 'Costo mensual (año 1)', a: fmtMoney(alquiler + mantCondominio), b: fmtMoney(cuota + mantCondominio + (valor * PCT_MANTENIMIENTO_ANUAL) / 12), hint: 'Alquiler vs cuota + mantenimientos' },
      { label: `Costo acumulado a ${permanencia} años`, a: fmtMoney(costAlqPerm), b: fmtMoney(costCompPerm), hint: 'Alquilar ya descuenta el rendimiento de la inicial invertida' },
      { label: 'Al final, ¿de quién es el inmueble?', a: 'Del propietario', b: 'Tuyo', hint: 'Comprar te deja un activo; alquilar, movilidad' },
    ],
  };

  const nextActions = [
    breakEven > 0
      ? `Tu punto de equilibrio es el año **${breakEven}**: si piensas quedarte más que eso, compra; si menos, alquila e invierte la inicial.`
      : 'Con estos números el alquiler es muy barato frente al precio de venta: compara más zonas antes de decidir.',
    'Cotiza la **TCEA en al menos 3 bancos y cajas** (en soles ronda 9-11%): un punto menos de tasa en 20 años son decenas de miles de soles. Compara en Retasas de la SBS.',
    'Si el inmueble califica, evalúa el **Nuevo Crédito Mivivienda**: cuota inicial desde 7,5% y Bono del Buen Pagador que reduce el capital — cambia el resultado de esta comparación.',
    `Presupuesta el cierre: **${fmtMoney(gastosCierre)}** entre gastos notariales/registrales (~1-3%) y alcabala (3% sobre el exceso de 10 UIT). Es plata aparte de la cuota inicial.`,
    'Si alquilas, **invierte la cuota inicial** que no inmovilizaste (depósito, caja o fondos): ese rendimiento es la mitad de la ecuación, y gastárselo la rompe.',
  ];

  const notes = [
    `La cuota se calcula con sistema francés desde la TCEA en soles. Gastos de cierre estimados en ~2% del valor más alcabala de 3% sobre el exceso de 10 UIT (UIT de referencia: ${fmtMoney(UIT)}); el tramo inafecto y los aranceles varían por municipio y notaría.`,
    'El costo de alquilar descuenta el rendimiento de invertir la cuota inicial; el de comprar NO descuenta la plusvalía del inmueble (criterio conservador: al final del horizonte el activo es tuyo y vale aparte).',
    'El Bono del Buen Pagador se modela como reducción directa del capital del crédito. Montos y condiciones vigentes: Fondo Mivivienda.',
    'No es asesoría financiera ni inmobiliaria. Para una operación de este tamaño, valida números con el banco, la notaría y un tasador.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: breakEven > 0 ? `${breakEven} años` : 'No se equilibra',
      label: 'Punto de equilibrio (alquilar → comprar)',
      sub:
        breakEven > 0
          ? `A tu horizonte de ${permanencia} años, comprar ${diff >= 0 ? 'ahorra' : 'cuesta'} **${fmtMoney(Math.abs(diff))}** frente a alquilar.`
          : 'Con estos números, alquilar e invertir la cuota inicial gana en todo el horizonte analizado.',
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'alquilar-o-comprar',
  title: '¿Alquilar o comprar en el Perú? El punto de equilibrio 2026',
  h1: '¿Me conviene alquilar o comprar?',
  description:
    'Compara el costo acumulado de alquilar (renta que sube + cuota inicial invertida) contra comprar con crédito hipotecario en el Perú: TCEA, alcabala, gastos notariales, Mivivienda y Bono del Buen Pagador. Te dice el punto de equilibrio en años.',
  intro:
    '"Alquilar es botar la plata", dicen. Pero comprar inmoviliza la cuota inicial, paga alcabala, notario y registro, y te ata a un distrito. La respuesta seria es comparar el costo acumulado de cada camino en el tiempo: cuánto gastas alquilando (con el alquiler subiendo por contrato, menos lo que rinde tu inicial invertida) contra cuánto gastas comprando (cuota del crédito a TCEA de mercado, gastos de cierre, mantenimiento). Esta sala encuentra el punto de equilibrio en años — incluyendo el efecto del Nuevo Crédito Mivivienda y su Bono del Buen Pagador — y te dice cuál gana según cuántos años piensas quedarte.',
  icon: '🏠',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    valorInmueble: 350000,
    cuotaInicial: 70000,
    bonoBuenPagador: 0,
    tceaCredito: 10.5,
    plazoAniosCredito: 20,
    alquilerMensual: 1600,
    ajusteAlquilerAnual: 3,
    mantenimientoCondominio: 250,
    aniosPermanencia: 10,
    rendimientoTEA: 4.5,
  },
  fields: [
    { id: 'valorInmueble', label: 'Valor del inmueble', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '350,000', help: 'Precio de venta del departamento o casa que comprarías.', group: 'La compra', groupIcon: '🏠' },
    { id: 'cuotaInicial', label: 'Cuota inicial', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '70,000', help: 'Tu aporte propio. Los bancos piden 10-20% del valor (Mivivienda acepta desde 7,5%).', group: 'La compra' },
    { id: 'tceaCredito', label: 'TCEA del crédito hipotecario', type: 'number', suffix: '%', required: true, min: 0, max: 30, placeholder: '10.5', help: 'El costo total anual del crédito en soles (interés + seguros + comisiones). En 2026 ronda 9-11%.', group: 'La compra' },
    { id: 'plazoAniosCredito', label: 'Plazo del crédito (años)', type: 'number', required: true, min: 1, max: 30, default: 20, help: 'Años para pagar el crédito. Lo usual en el Perú: 10 a 25 años.', group: 'La compra' },
    { id: 'bonoBuenPagador', label: 'Bono del Buen Pagador', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '25,000', help: 'Si tomas el Nuevo Crédito Mivivienda, este bono reduce el capital. Consulta el monto según el valor de la vivienda.', group: 'La compra', advanced: true },
    { id: 'alquilerMensual', label: 'Alquiler mensual equivalente', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '1,600', help: 'Lo que pagarías de alquiler por una vivienda similar en la misma zona.', group: 'El alquiler', groupIcon: '🔑' },
    { id: 'ajusteAlquilerAnual', label: 'Incremento anual del alquiler', type: 'number', suffix: '%', recommended: true, min: 0, max: 30, default: 3, placeholder: '3', help: 'El incremento pactado en el contrato. En el Perú suele acordarse 3-5% anual o según inflación.', group: 'El alquiler' },
    { id: 'mantenimientoCondominio', label: 'Mantenimiento mensual', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '250', help: 'La cuota del edificio o condominio: la pagas en ambos escenarios.', group: 'Comunes', groupIcon: '🧾' },
    { id: 'aniosPermanencia', label: '¿Cuántos años piensas quedarte?', type: 'number', recommended: true, min: 1, max: 40, default: 10, help: 'Tu horizonte. Es la variable clave: a más años, más conviene comprar.', group: 'Comunes' },
    { id: 'rendimientoTEA', label: 'Rendimiento de tus ahorros (TEA)', type: 'number', suffix: '%', default: 4.5, min: 0, max: 30, placeholder: '4.5', help: 'Lo que rendiría la cuota inicial si no la inmovilizas: depósito a plazo ~4-5%, cajas ~6-7%.', group: 'Comunes', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-credito-hipotecario-peru', label: 'Crédito hipotecario' },
    { slug: 'pe/calculadora-impuesto-alcabala-peru', label: 'Impuesto de alcabala' },
    { slug: 'pe/calculadora-alquiler-asequible-ingreso-peru', label: 'Alquiler según tu ingreso' },
    { slug: 'pe/calculadora-impuesto-predial-peru', label: 'Impuesto predial' },
  ],
  howItWorks: `Esta sala no compara la cuota contra el alquiler de un mes: compara el costo total de cada camino a lo largo de los años.

1. **Costo de alquilar.** Suma los alquileres año a año (subiendo por el incremento pactado en tu contrato) más el mantenimiento, y le RESTA lo que rinde la cuota inicial que no inmovilizaste, invertida a tu TEA de referencia. Si alquilas, esa plata trabaja para ti.
2. **Costo de comprar.** Suma los gastos de cierre (notariales y registrales ~1-3% del valor, más el impuesto de alcabala: 3% sobre lo que excede 10 UIT), la cuota del crédito calculada desde la TCEA en soles, el mantenimiento del condominio y ~1% anual de conservación del inmueble.
3. **Mivivienda y el bono.** Si cargas el Bono del Buen Pagador, se descuenta del capital del crédito: baja la cuota y adelanta el punto de equilibrio.
4. **Punto de equilibrio.** Busca el primer año en que comprar acumula menos gasto que alquilar. Antes de ese año conviene alquilar; después, comprar.
5. **Tu horizonte decide.** Compara ambos costos al plazo que piensas quedarte y te dice cuál gana, por cuánto, y cómo cambia a 5, 10 y 20 años.`,
  faq: [
    { q: '¿Alquilar es botar la plata?', a: 'No siempre. Si piensas quedarte pocos años, los gastos de cierre de comprar (notario, registro, alcabala) no llegan a amortizarse y la cuota inicial invertida a 4-7% TEA juega a tu favor. La clave es el horizonte: comprar suele ganar recién después del punto de equilibrio, que en el Perú suele caer entre los 8 y 15 años según zona y tasa.' },
    { q: '¿Cuánto cuesta la cuota inicial de un departamento en el Perú?', a: 'Los bancos piden normalmente entre 10% y 20% del valor del inmueble. Con el Nuevo Crédito Mivivienda la inicial puede bajar hasta 7,5% para viviendas dentro de los rangos del programa. Para un departamento de S/ 350,000, hablamos de S/ 35,000 a S/ 70,000, más los gastos de cierre.' },
    { q: '¿Qué es el impuesto de alcabala y quién lo paga?', a: 'Es un impuesto municipal que paga el COMPRADOR: 3% del valor de transferencia, con las primeras 10 UIT inafectas (unos S/ 53,500 de tramo libre). Para un inmueble de S/ 350,000, la alcabala ronda S/ 8,900. La primera venta que hace una constructora está inafecta en la parte que corresponde a la construcción.' },
    { q: '¿Qué es el Bono del Buen Pagador de Mivivienda?', a: 'Es una ayuda no reembolsable del Estado para quienes toman el Nuevo Crédito Mivivienda: se descuenta directamente del capital del crédito y su monto depende del valor de la vivienda (más bono cuanto más económica; hay bono adicional para vivienda sostenible). Reduce la cuota mensual y adelanta el punto de equilibrio frente a alquilar.' },
    { q: '¿Qué TCEA tiene un crédito hipotecario en soles?', a: 'En 2026 las TCEA en soles rondan 9-11% según banco, plazo y perfil del cliente; las cajas y financieras pueden estar algo por encima. Compara siempre TCEA (no la tasa "pelada") en el portal Retasas de la SBS: incluye seguro de desgravamen, seguro del inmueble y comisiones.' },
    { q: '¿Qué gastos tiene comprar además de la cuota inicial?', a: 'Los gastos de cierre: notariales y registrales (~1-3% del valor entre minuta, escritura pública, inscripción en SUNARP y tasación), el impuesto de alcabala (3% sobre el exceso de 10 UIT) y, ya como propietario, el impuesto predial anual, el mantenimiento del edificio y la conservación del inmueble (~1% del valor al año).' },
    { q: '¿Por qué se descuenta el rendimiento de la cuota inicial al alquilar?', a: 'Porque si no compras, esos S/ 70,000 no desaparecen: puestos en un depósito a plazo (4-5% TEA) o en una caja municipal (6-7% TEA) generan intereses todos los años. Ese rendimiento abarata el escenario de alquilar. Eso sí: si te gastas la inicial en vez de invertirla, la comparación deja de valer.' },
    { q: '¿La calculadora considera que el inmueble sube de valor?', a: 'No lo descuenta del costo de comprar, a propósito: la plusvalía en el Perú es real pero desigual según distrito, y preferimos un cálculo conservador. Si el inmueble se valoriza, comprar es aún mejor de lo que muestra el resultado — al final del horizonte el activo es tuyo y vale aparte.' },
    { q: '¿Puedo adelantar cuotas del crédito hipotecario?', a: 'Sí: en el Perú el pago anticipado, total o parcial, es un derecho del consumidor, con reducción de intereses y sin penalidad. Amortizar capital en los primeros años de un hipotecario a TCEA de 10% acorta el plazo y ahorra muchísimo interés — pídele al banco recalcular el cronograma.' },
  ],
  sources: [
    { name: 'Fondo Mivivienda — Nuevo Crédito Mivivienda y Bono del Buen Pagador', url: 'https://www.mivivienda.com.pe/' },
    { name: 'SBS — Retasas: comparador de TCEA hipotecarias', url: 'https://www.sbs.gob.pe/app/retasas/paginas/retasasInicio.aspx' },
    { name: 'BCRP — Indicador de precios de venta y alquiler de departamentos', url: 'https://www.bcrp.gob.pe/' },
  ],
};
