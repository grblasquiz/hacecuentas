/**
 * Sala de decisión — "¿Qué hago con mis ahorros?"
 *
 * Patrón EDUCATIVO (NO asesoramiento). No recomienda un activo: arma una
 * comparativa de escenarios para que ENTIENDAS las opciones según tu situación
 * (plazo, liquidez, si tenés deuda cara, si tenés fondo de emergencia) y muestra
 * el rendimiento estimado de cada una. La regla de oro que sí aplica siempre:
 * primero fondo de emergencia, después cancelar deuda cara, después invertir.
 */

import { plazoFijo } from '../formulas/plazo-fijo';
import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num, bool } from './types';

// TNA de referencia orientativa por opción (educativas, NO promesas de rendimiento).
const TNA_PLAZO_FIJO = 38;
const TNA_MONEY_MARKET = 32;
const TNA_DOLAR_MEP = 0; // cobertura, no rinde tasa en pesos; se muestra aparte.

function compute(inputs: Record<string, any>): DecisionResult {
  const ahorros = Math.max(0, num(inputs.ahorros));
  const tieneDeudaCara = bool(inputs.tienesDeudaCara);
  const plazoMeses = Math.max(0, num(inputs.plazoObjetivoMeses));
  const tieneFondo = bool(inputs.tieneFondoEmergencia);

  if (!ahorros) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá cuánto tenés ahorrado y en cuánto tiempo pensás necesitarlo. Te mostramos una comparativa educativa de opciones (plazo fijo, dólar, money market, cancelar deuda, fondo de emergencia) según tu situación.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Rendimiento estimado a tu plazo' },
      scenarios: [],
      nextActions: [
        'Cargá **cuánto tenés ahorrado** y en **cuánto tiempo** pensás usar esa plata.',
        'Indicá si tenés **deuda cara** (tarjeta, descubierto) y si ya tenés un **fondo de emergencia**.',
      ],
    };
  }

  const dias = plazoMeses > 0 ? plazoMeses * 30 : 90;
  // Rendimientos estimados a tu plazo (orientativos).
  const pf = plazoFijo({ capital: ahorros, tna: TNA_PLAZO_FIJO, dias });
  const mm = plazoFijo({ capital: ahorros, tna: TNA_MONEY_MARKET, dias });
  const rendPF = pf.interesGanado;
  const rendMM = mm.interesGanado;

  // Prioridad educativa según situación (no es recomendación de activo).
  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;
  let decisiveValue: string;
  let decisiveLabel: string;

  if (tieneDeudaCara) {
    status = 'a';
    tone = 'warn';
    title = 'Primero cancelá tu deuda cara';
    badge = 'Cancelá deuda';
    detail = `Antes de invertir, considerá cancelar la deuda cara: su tasa (tarjeta/descubierto, a menudo más de 100% anual) suele superar ampliamente cualquier rendimiento de plazo fijo o money market (≈${TNA_PLAZO_FIJO}% TNA). Cancelar es un "rendimiento garantizado" igual a la tasa de esa deuda. Después, ocupate del fondo de emergencia y recién ahí invertí el resto.`;
    decisiveValue = 'Cancelar deuda';
    decisiveLabel = 'La opción de mayor retorno ajustado a tu situación';
  } else if (!tieneFondo) {
    status = 'tie';
    tone = 'neutral';
    title = 'Primero armá tu fondo de emergencia';
    badge = 'Fondo primero';
    detail = `Sin fondo de emergencia, conviene priorizar liquidez: dejá una parte en un instrumento de disponibilidad inmediata (caja de ahorro remunerada o money market) que rinda algo sin inmovilizarse. Recién con el colchón armado tiene sentido inmovilizar plata en plazo fijo o cobertura. A tu plazo, un money market rendiría ≈${fmtMoney(rendMM)}.`;
    decisiveValue = fmtMoney(rendMM);
    decisiveLabel = `Rendimiento estimado en money market a ${plazoMeses || 3} meses`;
  } else if (plazoMeses > 0 && plazoMeses <= 6) {
    status = 'b';
    tone = 'good';
    title = 'Plazo corto: priorizá liquidez y tasa';
    badge = 'Liquidez';
    detail = `Vas a necesitar la plata pronto (${plazoMeses} meses), así que no conviene exponerla a volatilidad. Entre las opciones líquidas, el plazo fijo a tu plazo rendiría ≈${fmtMoney(rendPF)} y un money market ≈${fmtMoney(rendMM)} (con disponibilidad inmediata). Elegí según cuánta liquidez necesites en el camino.`;
    decisiveValue = fmtMoney(rendPF);
    decisiveLabel = `Rendimiento estimado en plazo fijo a ${plazoMeses} meses`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tenés margen: podés diversificar';
    badge = 'Diversificá';
    detail = `Con fondo de emergencia, sin deuda cara y un horizonte ${plazoMeses > 0 ? `de ${plazoMeses} meses` : 'amplio'}, podés combinar opciones: una parte líquida (money market), una parte en plazo fijo para tasa, y una parte en cobertura (dólar/MEP) si te preocupa la inflación. A tu plazo, el plazo fijo rendiría ≈${fmtMoney(rendPF)}. La proporción depende de tu tolerancia al riesgo.`;
    decisiveValue = fmtMoney(rendPF);
    decisiveLabel = `Rendimiento estimado en plazo fijo a ${plazoMeses || 12} meses`;
  }

  const scenarios = [
    { label: 'Money market', value: fmtMoney(rendMM), detail: `Liquidez inmediata, tasa baja (≈${TNA_MONEY_MARKET}% TNA orientativa). Para plata que podés necesitar en cualquier momento.` },
    { label: 'Plazo fijo', value: fmtMoney(rendPF), detail: `Tasa más alta (≈${TNA_PLAZO_FIJO}% TNA orientativa) pero inmovilizás hasta el vencimiento. Para plata que no tocás en el plazo.` },
    { label: 'Dólar / MEP', value: 'Cobertura', detail: 'No rinde tasa en pesos: es resguardo frente a la inflación y la devaluación. Mirá la brecha y los costos antes de entrar.' },
  ];

  const breakdown = [
    { label: 'Plata a destinar', value: fmtMoney(ahorros) },
    { label: 'Horizonte', value: plazoMeses > 0 ? `${plazoMeses} meses` : 'sin definir', hint: 'cuándo pensás usar la plata' },
    { label: '¿Tenés deuda cara?', value: tieneDeudaCara ? 'Sí' : 'No', hint: tieneDeudaCara ? 'cancelarla rinde más que invertir' : '' },
    { label: '¿Tenés fondo de emergencia?', value: tieneFondo ? 'Sí' : 'No', hint: tieneFondo ? '' : 'armalo antes de invertir' },
    { label: 'Plazo fijo — rendimiento estimado', value: fmtMoney(rendPF), hint: `≈${TNA_PLAZO_FIJO}% TNA orientativa` },
    { label: 'Money market — rendimiento estimado', value: fmtMoney(rendMM), hint: `≈${TNA_MONEY_MARKET}% TNA orientativa` },
    { label: 'Dólar / MEP — función', value: 'Cobertura', hint: 'resguardo, no tasa en pesos' },
  ];

  const nextActions = [
    'La prioridad universal: **1) fondo de emergencia (3-6 meses de gastos), 2) cancelar deuda cara, 3) invertir el resto.** No saltees pasos.',
    tieneDeudaCara
      ? 'Tenés deuda cara: usá la calculadora de **cancelar deuda o invertir** para ver exactamente cuánto te conviene cancelar primero.'
      : 'Antes de inmovilizar, dejá una parte líquida para imprevistos: si tenés que romper un plazo fijo o vender mal, perdés rendimiento.',
    'Compará el **rendimiento real** (descontando inflación): una tasa nominal alta puede ser negativa en términos reales. Mirá la tasa contra la inflación esperada.',
    'Diversificá según tu horizonte: cuanto antes necesites la plata, más líquida y menos volátil debería estar. No pongas en dólar/MEP plata que vas a usar en semanas.',
  ];

  const notes = [
    'Esto NO es asesoramiento ni recomendación de inversión. Es material educativo para que entiendas las opciones según tu situación. Cada instrumento tiene riesgos, costos e impuestos propios.',
    `Los rendimientos son orientativos, calculados con TNAs de referencia (plazo fijo ≈${TNA_PLAZO_FIJO}%, money market ≈${TNA_MONEY_MARKET}%) que cambian seguido. Verificá las tasas vigentes antes de decidir.`,
    'El dólar/MEP es cobertura, no inversión de renta: su resultado depende del tipo de cambio, la brecha y los costos de operación, y puede dar pérdidas.',
    'Para tu caso concreto, consultá con un asesor financiero matriculado (idóneo o agente registrado en la CNV).',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: { value: decisiveValue, label: decisiveLabel, sub: 'Es orientativo y educativo, no una recomendación de inversión.' },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'que-hago-con-mis-ahorros',
  title: '¿Qué hago con mis ahorros? Opciones explicadas según tu caso 2026',
  h1: '¿Qué hago con mis ahorros?',
  description:
    'Comparativa educativa de qué hacer con tus ahorros según tu situación: plazo fijo, dólar/MEP, money market, cancelar deuda o fondo de emergencia. Rendimientos estimados y la prioridad correcta. No es asesoramiento.',
  intro:
    'Tenés plata ahorrada y no sabés qué hacer con ella. Esta sala NO te dice "comprá esto": te ordena las opciones según tu situación real (plazo, liquidez, deuda, fondo de emergencia) y te muestra el rendimiento estimado de cada una, con la regla de oro que sí aplica siempre: primero el colchón, después cancelar deuda cara, recién después invertir.',
  icon: '💡',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    ahorros: 2000000,
    tienesDeudaCara: 'no',
    plazoObjetivoMeses: 12,
    tieneFondoEmergencia: 'si',
  },
  fields: [
    { id: 'ahorros', label: 'Cuánto tenés ahorrado', type: 'number', prefix: '$', required: true, min: 0, placeholder: '2000000', profileKey: 'finanzas.ahorros', help: 'La plata que querés poner a trabajar o resguardar.', group: 'Tus ahorros', groupIcon: '💰' },
    { id: 'plazoObjetivoMeses', label: 'En cuánto tiempo la vas a usar', type: 'number', suffix: 'meses', recommended: true, min: 0, max: 240, placeholder: '12', help: 'Tu horizonte: cuándo pensás necesitar esta plata.', group: 'Tu situación', groupIcon: '🎯' },
    {
      id: 'tienesDeudaCara', label: '¿Tenés deuda cara?', type: 'select', default: 'no',
      options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí (tarjeta, descubierto)' }],
      help: 'Deuda con tasa alta, como tarjeta o adelanto de cuenta. Cambia la prioridad.', group: 'Tu situación',
    },
    {
      id: 'tieneFondoEmergencia', label: '¿Ya tenés fondo de emergencia?', type: 'select', default: 'no',
      options: [{ value: 'no', label: 'No / no estoy seguro' }, { value: 'si', label: 'Sí (3-6 meses de gastos)' }],
      help: 'Plata líquida para imprevistos equivalente a 3-6 meses de gastos.', group: 'Tu situación',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
  ],
  howItWorks: `Esta sala no te recomienda un activo: te ayuda a entender qué tiene sentido según tu situación.

1. **La prioridad correcta.** Antes de cualquier inversión, primero va el fondo de emergencia, después cancelar deuda cara, y recién después invertir. La sala detecta en qué etapa estás y te ubica.
2. **Tu horizonte.** Cuándo vas a necesitar la plata define cuánta liquidez necesitás. Plata para semanas o meses no va a instrumentos volátiles.
3. **Rendimiento estimado.** Calcula, con tasas de referencia orientativas, cuánto rendiría tu plata en plazo fijo y en money market a tu plazo, para que dimensiones las opciones.
4. **El rol del dólar/MEP.** Lo muestra como cobertura frente a la inflación, no como renta: aclara que no "rinde tasa" y que depende del tipo de cambio y los costos.
5. **El cierre.** Te marca la opción de mayor retorno ajustado a tu situación y la regla de diversificación según tu horizonte. Todo educativo, nunca como recomendación.`,
  faq: [
    { q: '¿Esto es asesoramiento financiero?', a: 'No. Es material educativo para que entiendas tus opciones según tu situación. No recomendamos comprar ningún activo en particular. Para una recomendación personalizada, consultá con un asesor financiero matriculado registrado en la CNV.' },
    { q: '¿Qué hago primero: invertir o cancelar deuda?', a: 'Si tenés deuda cara (tarjeta, descubierto), cancelarla casi siempre rinde más que invertir, porque su tasa supera a cualquier plazo fijo o money market. Cancelar deuda es un rendimiento garantizado igual a la tasa de esa deuda.' },
    { q: '¿Cuándo conviene un plazo fijo y cuándo un money market?', a: 'El plazo fijo paga una tasa más alta pero inmoviliza la plata hasta el vencimiento. El money market rinde algo menos pero te da disponibilidad inmediata. Si podés necesitar la plata en cualquier momento, el money market; si no la vas a tocar, el plazo fijo.' },
    { q: '¿Me conviene comprar dólares?', a: 'El dólar (MEP u oficial) es cobertura frente a la inflación y la devaluación, no una inversión de renta: no "rinde tasa" en pesos y su resultado depende del tipo de cambio, la brecha y los costos. Puede dar pérdidas si el peso se aprecia. Es resguardo, no rendimiento.' },
    { q: '¿Cuánto debería dejar líquido?', a: 'Al menos tu fondo de emergencia (3 a 6 meses de gastos) en un instrumento de disponibilidad inmediata. Esa plata no se invierte ni se inmoviliza: es tu colchón. El resto sí podés ponerlo a trabajar según tu horizonte.' },
    { q: '¿Las tasas que usan son las reales?', a: 'No: son tasas de referencia orientativas para dimensionar las opciones, y cambian seguido. Antes de decidir, verificá las tasas vigentes de plazo fijo y money market en tu banco o en el simulador del BCRA.' },
    { q: '¿Qué pasa con la inflación?', a: 'Lo que importa es el rendimiento real (la tasa menos la inflación). Una tasa nominal alta puede ser negativa en términos reales si la inflación es mayor. Por eso conviene comparar siempre el rendimiento contra la inflación esperada del período.' },
    { q: '¿Debería poner todo en una sola opción?', a: 'En general no. Diversificar según tu horizonte (una parte líquida, una parte a tasa, una parte de cobertura) reduce el riesgo de equivocarte con el timing. La proporción depende de tu tolerancia al riesgo y de cuándo necesitás la plata.' },
  ],
  sources: [
    { name: 'BCRA — Plazos fijos online', url: 'https://www.bcra.gob.ar/BCRAyVos/plazos_fijos_online.asp' },
    { name: 'CNV — Comisión Nacional de Valores (educación financiera)', url: 'https://www.argentina.gob.ar/cnv' },
  ],
};
