/**
 * Sala de decisión CL — "¿Cuánto fondo de emergencia necesito?"
 *
 * Patrón DIMENSIONAMIENTO, lógica chilena: 3-6 meses de gastos esenciales según
 * estabilidad del ingreso. El tipo de contrato pesa distinto acá: indefinido
 * tiene seguro de cesantía AFC (con topes y giros decrecientes), plazo fijo y
 * honorarios quedan mucho más expuestos. Devuelve meta, cuánto falta y en
 * cuántos meses la llenas con tu aporte.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num, bool } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const gastos = Math.max(0, num(inputs.gastosEsenciales));
  const contrato = String(inputs.tipoContrato || 'indefinido'); // indefinido | plazo | honorarios
  const hijos = bool(inputs.hijos);
  const arriendo = bool(inputs.pagaArriendoODividendo);
  const otroIngreso = bool(inputs.otroIngresoHogar);
  const ahorroActual = Math.max(0, num(inputs.ahorroActual));
  const aporteMensual = Math.max(0, num(inputs.aporteMensual));

  if (!gastos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa tus gastos esenciales del mes para dimensionar tu fondo de emergencia. Ajustamos los meses según tu tipo de contrato y tus cargas.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Fondo de emergencia recomendado' },
      scenarios: [],
      nextActions: [
        'Ingresa tus **gastos esenciales mensuales** (lo mínimo para vivir un mes).',
        'Indica tu **tipo de contrato** y tus cargas (hijos, arriendo o dividendo).',
      ],
    };
  }

  // Base 3 meses + factores de riesgo chilenos.
  let meses = 3;
  const factores: { label: string; meses: number; activo: boolean }[] = [];

  let mesesContrato = 0;
  if (contrato === 'plazo') mesesContrato = 1;
  else if (contrato === 'honorarios') mesesContrato = 2;
  factores.push({
    label:
      contrato === 'honorarios'
        ? 'Trabajas a honorarios (sin seguro de cesantía ni indemnización)'
        : contrato === 'plazo'
          ? 'Contrato a plazo fijo o por obra (cobertura AFC más corta)'
          : 'Contrato indefinido (el seguro de cesantía AFC amortigua, con topes)',
    meses: mesesContrato,
    activo: mesesContrato !== 0,
  });
  meses += mesesContrato;

  factores.push({ label: 'Hijos o personas a cargo', meses: hijos ? 1 : 0, activo: hijos });
  if (hijos) meses += 1;

  factores.push({ label: 'Pagas arriendo o dividendo', meses: arriendo ? 1 : 0, activo: arriendo });
  if (arriendo) meses += 1;

  factores.push({ label: 'Otro ingreso en el hogar', meses: otroIngreso ? -1 : 0, activo: otroIngreso });
  if (otroIngreso) meses -= 1;

  meses = Math.max(3, meses);

  const meta = meses * gastos;
  const falta = Math.max(0, meta - ahorroActual);
  const avancePct = meta > 0 ? Math.min(100, (ahorroActual / meta) * 100) : 0;
  const mesesParaLlenar = falta > 0 && aporteMensual > 0 ? Math.ceil(falta / aporteMensual) : 0;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (meses <= 4) {
    status = 'b';
    tone = 'good';
    badge = 'Riesgo bajo';
  } else if (meses <= 6) {
    status = 'tie';
    tone = 'neutral';
    badge = 'Riesgo medio';
  } else {
    status = 'a';
    tone = 'warn';
    badge = 'Riesgo alto';
  }

  const detail = `Por tu situación te recomendamos un fondo de ${meses} meses de gastos esenciales: ${fmtMoney(meta)}. Ya tienes ${fmtMoney(ahorroActual)} (${fmtPct(avancePct, 0).replace('+', '')} de la meta)${falta > 0 ? ` y te faltan ${fmtMoney(falta)}` : ': meta cumplida'}. ${falta > 0 && aporteMensual > 0 ? `Guardando ${fmtMoney(aporteMensual)} al mes la completas en ${mesesParaLlenar} ${mesesParaLlenar === 1 ? 'mes' : 'meses'}.` : falta > 0 ? 'Define un aporte mensual para ponerle fecha.' : 'Ahora cuídala: es plata solo para emergencias reales.'}`;

  const scenarios = [
    { label: 'Mínimo (3 meses)', value: fmtMoney(3 * gastos), detail: 'El piso para cualquier persona, incluso con contrato indefinido y AFC.' },
    { label: 'Recomendado para ti', value: fmtMoney(meta), detail: `${meses} meses, ajustado por tu contrato y tus cargas.` },
    { label: 'Conservador (12 meses)', value: fmtMoney(12 * gastos), detail: 'Tranquilidad total si tus boletas son irregulares o tu rubro es cíclico.' },
  ];

  const breakdown = [
    { label: 'Gastos esenciales mensuales', value: fmtMoney(gastos), hint: 'la base del cálculo' },
    { label: 'Base universal', value: '3 meses' },
    ...factores
      .filter((f) => f.activo)
      .map((f) => ({ label: f.label, value: `${f.meses > 0 ? '+' : ''}${f.meses} ${Math.abs(f.meses) === 1 ? 'mes' : 'meses'}` })),
    { label: 'Meses recomendados', value: `${meses} meses` },
    { label: 'Meta del fondo', value: fmtMoney(meta) },
    { label: 'Ya ahorrado', value: fmtMoney(ahorroActual) },
    { label: 'Te falta', value: fmtMoney(falta), hint: aporteMensual > 0 && falta > 0 ? `≈ ${mesesParaLlenar} meses a ${fmtMoney(aporteMensual)}/mes` : undefined },
  ];

  const nextActions = [
    falta > 0
      ? `Tu meta es **${fmtMoney(meta)}**. Empieza por el piso de ${fmtMoney(3 * gastos)} y automatiza una transferencia el mismo día que te pagan.`
      : `Meta cumplida: mantén los **${fmtMoney(meta)}** separados de tu cuenta corriente y no los mezcles con inversiones de largo plazo.`,
    'Reparte el fondo por liquidez: **1 mes en cuenta de ahorro** (disponible al tiro), el resto en **depósitos a plazo escalonados** (vencimientos cada 30-60 días) o **fondos mutuos conservadores** con rescate en 1-3 días hábiles.',
    contrato === 'indefinido'
      ? 'El seguro de cesantía AFC te da un respiro si te despiden, pero paga giros decrecientes, con topes y por pocos meses: **complementa, no reemplaza** tu fondo.'
      : 'Sin la cobertura completa del seguro de cesantía, tu fondo es tu única red: apunta al extremo alto del rango antes de invertir en cualquier otra cosa.',
    'Definí qué es emergencia (salud, pérdida de ingreso, una reparación impostergable) y qué no (vacaciones, ofertas, el pie de un auto): el fondo solo se toca para lo primero.',
  ];

  const notes = [
    'El cálculo parte de la regla general de 3 a 6 meses de gastos y suma meses por factores de riesgo: contrato a plazo o boletas de honorarios, hijos, arriendo o dividendo. Otro ingreso en el hogar resta un mes.',
    'Usa tus gastos ESENCIALES (arriendo o dividendo, gastos comunes, cuentas, comida, transporte, educación), no tu sueldo líquido: el fondo cubre lo mínimo para vivir mientras te reacomodas.',
    'El seguro de cesantía (AFC) paga desde tu cuenta individual y, si corresponde, el Fondo Solidario, con porcentajes decrecientes de tu remuneración y topes mensuales. A honorarios no tienes esta cobertura.',
    'No es asesoría financiera: es una guía para dimensionar tu colchón. Ajústala a tu realidad.',
  ];

  return {
    status,
    verdict: {
      title:
        meses <= 4
          ? `Con ${meses} meses de gastos quedas cubierto`
          : meses <= 6
            ? `Apunta a ${meses} meses de gastos esenciales`
            : `Tu perfil pide un colchón grande: ${meses} meses`,
      detail,
      tone,
      badge,
    },
    decisiveNumber: {
      value: fmtMoney(meta),
      label: 'Fondo de emergencia recomendado',
      sub: `**${meses} meses** de tus gastos esenciales (${fmtMoney(gastos)}/mes).${falta > 0 ? ` Te faltan **${fmtMoney(falta)}**.` : ' **Meta cumplida.**'}`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-fondo-de-emergencia-necesito',
  title: '¿Cuánto fondo de emergencia necesito en Chile? Meta y plazo 2026',
  h1: '¿Cuánto fondo de emergencia necesito?',
  description:
    'Dimensiona tu fondo de emergencia en Chile: 3 a 6 meses de gastos esenciales según tu contrato (indefinido con AFC, plazo fijo u honorarios), hijos y arriendo o dividendo. Meta concreta, cuánto te falta y en cuántos meses la completas.',
  intro:
    '"Tres a seis meses de gastos" es la regla, pero el número correcto depende de tu situación: no es lo mismo un contrato indefinido con seguro de cesantía AFC detrás que vivir de boletas de honorarios. Esta sala parte de la base de 3 meses, la ajusta por tu tipo de contrato y tus cargas, y te devuelve una meta en pesos, cuánto te falta y en cuántos meses la completas con tu aporte. También te dice dónde guardarla: cuenta de ahorro, depósitos a plazo escalonados o fondos mutuos conservadores.',
  icon: '🛟',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    gastosEsenciales: 800000,
    tipoContrato: 'indefinido',
    hijos: 'si',
    pagaArriendoODividendo: 'si',
    otroIngresoHogar: 'no',
    ahorroActual: 1000000,
    aporteMensual: 150000,
  },
  fields: [
    { id: 'gastosEsenciales', label: 'Gastos esenciales mensuales', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '800000', help: 'Lo mínimo para vivir un mes: arriendo o dividendo, gastos comunes, cuentas, comida, transporte.', group: 'Tus gastos', groupIcon: '🧾' },
    {
      id: 'tipoContrato', label: 'Cómo trabajas', type: 'select', default: 'indefinido', recommended: true,
      options: [
        { value: 'indefinido', label: 'Contrato indefinido (con seguro de cesantía AFC)' },
        { value: 'plazo', label: 'Contrato a plazo fijo o por obra' },
        { value: 'honorarios', label: 'Honorarios / independiente (boletas)' },
      ],
      help: 'Define cuánta red tienes si pierdes el ingreso: el AFC cubre parte al indefinido; a honorarios no hay cobertura.', group: 'Tu riesgo', groupIcon: '⚖️',
    },
    { id: 'hijos', label: '¿Tienes hijos o personas a cargo?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }], help: 'Más gastos que no puedes recortar ante un imprevisto.', group: 'Tu riesgo' },
    { id: 'pagaArriendoODividendo', label: '¿Pagas arriendo o dividendo?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }], help: 'Un pago de vivienda mensual es el gasto fijo más difícil de bajar.', group: 'Tu riesgo' },
    { id: 'otroIngresoHogar', label: '¿Hay otro ingreso en el hogar?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí (pareja que trabaja, renta)' }], help: 'Un segundo ingreso reduce el riesgo de quedar en cero.', group: 'Tu riesgo' },
    { id: 'ahorroActual', label: 'Lo que ya tienes ahorrado', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '1000000', help: 'Tu punto de partida (solo lo destinado a emergencias).', group: 'Tu plan', groupIcon: '💪' },
    { id: 'aporteMensual', label: 'Cuánto puedes guardar al mes', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '150000', help: 'Para calcular en cuántos meses completas la meta.', group: 'Tu plan' },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-fondo-emergencia-chile-meses-gastos-recomendado', label: 'Fondo de emergencia (meses de gastos)' },
    { slug: 'cl/calculadora-seguro-cesantia-chile-afc-cuota-fondo', label: 'Seguro de cesantía AFC' },
    { slug: 'cl/calculadora-deposito-plazo-chile-bancos-2026-tasa', label: 'Depósito a plazo' },
    { slug: 'cl/calculadora-fondo-mutuo-vs-deposito-plazo-chile-rendimiento', label: 'Fondo mutuo vs depósito a plazo' },
  ],
  howItWorks: `Esta sala ajusta la regla genérica de los 3-6 meses a tu realidad laboral chilena.

1. **La base.** Todos deberían tener al menos 3 meses de gastos esenciales guardados, incluso con contrato indefinido: el seguro de cesantía tiene topes, giros decrecientes y requisitos de cotizaciones.
2. **Tu contrato.** Suma meses según tu exposición: a plazo fijo u obra (+1) y a honorarios (+2), porque sin AFC ni indemnización tu fondo es toda tu red.
3. **Tus cargas.** Hijos (+1) y arriendo o dividendo (+1) son gastos que siguen corriendo igual si pierdes el ingreso. Otro ingreso en el hogar resta un mes de riesgo.
4. **Meta, brecha y plazo.** Multiplica los meses por tus gastos esenciales, descuenta lo que ya tienes y divide lo que falta por tu aporte mensual: meta en pesos, brecha y fecha realista.
5. **Dónde guardarlo.** Te sugiere una escalera de liquidez: un mes en cuenta de ahorro disponible al tiro, y el resto en depósitos a plazo escalonados o fondos mutuos conservadores para que la plata no duerma.`,
  faq: [
    { q: '¿Por qué 3 a 6 meses de gastos?', a: 'Porque es el tiempo que suele tomar reemplazar un ingreso perdido o absorber un imprevisto grande sin endeudarse. Tres meses es el piso con contrato estable; seis o más si vives de boletas, tu contrato es a plazo o tienes cargas fijas altas como arriendo e hijos.' },
    { q: '¿Se calcula sobre mis gastos o sobre mi sueldo líquido?', a: 'Sobre tus gastos esenciales: arriendo o dividendo, gastos comunes, cuentas, comida, transporte y educación. El fondo cubre lo mínimo para vivir mientras te reacomodas, no reemplaza tu sueldo completo, así que la meta es más alcanzable de lo que parece.' },
    { q: '¿El seguro de cesantía AFC no reemplaza el fondo?', a: 'No. El AFC paga primero desde tu cuenta individual (lo acumulado depende de tu antigüedad) y, si calificas, desde el Fondo de Cesantía Solidario, con porcentajes decrecientes de tu remuneración, topes mensuales y una cantidad limitada de giros. Además exige cotizaciones previas y no cubre renuncias ni trabajo a honorarios. Es un amortiguador, no un colchón completo.' },
    { q: '¿Dónde guardo el fondo de emergencia en Chile?', a: 'En una escalera de liquidez: una parte en cuenta de ahorro o cuenta vista (disponible el mismo día), y el resto en depósitos a plazo escalonados —vencimientos cada 30-60 días— o fondos mutuos conservadores (money market) con rescate en 1 a 3 días hábiles. Nada en acciones ni fondos accionarios: una emergencia no espera a que el mercado se recupere.' },
    { q: '¿Conviene tenerlo en UF o en pesos?', a: 'Para un horizonte de meses, en pesos: con inflación en torno al 3-4% anual, un depósito a plazo o un fondo money market ya la compensa razonablemente y evitas la variación diaria de la UF al rescatar. La UF tiene más sentido para metas largas, como el pie de una vivienda.' },
    { q: '¿Qué pasa si trabajo a honorarios?', a: 'Tu riesgo es mayor: no tienes seguro de cesantía, ni indemnización por años de servicio, y tus ingresos pueden variar mes a mes. Por eso la sala te suma 2 meses a la base. Apunta a 6 o más meses de gastos y, en meses buenos, guarda más para cubrir los flojos.' },
    { q: '¿Qué cuenta como emergencia real?', a: 'Pérdida del ingreso, un gasto de salud no cubierto por Fonasa o tu isapre, una reparación impostergable de la casa o del auto que usas para trabajar. No son emergencia las vacaciones, un CyberDay ni el pie de un auto nuevo: para eso se ahorra aparte.' },
    { q: '¿Qué hago si no llego ni a 3 meses?', a: 'Parte igual: primero junta 1 mes de gastos, después 3, y recién entonces piensa en invertir en otra cosa. Automatiza una transferencia el mismo día que te pagan, aunque sean $50.000: el hábito importa más que el monto inicial. Cualquier plata extra (aguinaldo, devolución de impuestos de abril, un bono) va directo al fondo.' },
  ],
  sources: [
    { name: 'AFC — Seguro de cesantía: beneficios y requisitos', url: 'https://www.afc.cl/' },
    { name: 'CMF — Educación financiera: fondo de emergencia', url: 'https://www.cmfchile.cl/educa/' },
    { name: 'CMF — Depósitos a plazo y fondos mutuos', url: 'https://www.cmfchile.cl/' },
  ],
};
