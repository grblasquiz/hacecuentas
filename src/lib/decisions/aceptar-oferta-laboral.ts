/**
 * Sala de decisión — "¿Me conviene aceptar esta oferta laboral?"
 *
 * Orquesta fórmulas existentes para reframear "ganás 22% más" en el número real
 * que importa: cuánto mejora tu ingreso DESPUÉS de impuestos, traslado, comidas,
 * tiempo de viaje y beneficios. Compone:
 *   - sueldoAR()  → neto en mano (aportes 17% + Ganancias) de cada sueldo bruto
 *   - costos de traslado + comida prorrateados por días de oficina
 *   - valor real de la hora (incluyendo el tiempo de viaje no pago)
 *   - punto de indiferencia: el bruto mínimo que debería pagar la oferta para
 *     igualar tu posición actual ajustada
 */

import { sueldoAR } from '../formulas/sueldo-ar';
import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num, bool } from './types';

const W = 4.33; // semanas promedio por mes

/** Neto en mano (aportes + Ganancias) para un bruto dado. */
function neto(bruto: number, conyuge: boolean, hijos: number): number {
  if (!bruto || bruto <= 0) return 0;
  return sueldoAR({ bruto, conyuge, hijos }).neto;
}

/**
 * Invierte el neto → bruto por búsqueda binaria (sueldoAR es monótona creciente).
 * Devuelve el bruto cuyo neto ≈ targetNeto. Para targetNeto<=0 devuelve 0.
 */
function brutoDesdeNeto(targetNeto: number, conyuge: boolean, hijos: number): number {
  if (targetNeto <= 0) return 0;
  let lo = targetNeto; // el bruto siempre es ≥ que el neto
  let hi = targetNeto * 2.2; // neto ≈ 0.6–0.83 del bruto → 2.2× sobra de techo
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (neto(mid, conyuge, hijos) < targetNeto) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

function compute(inputs: Record<string, any>): DecisionResult {
  const brutoActual = num(inputs.brutoActual);
  const brutoOferta = num(inputs.brutoOferta);
  const conyuge = bool(inputs.conyuge);
  const hijos = Math.max(0, Math.min(10, num(inputs.hijos)));

  const diasActual = Math.max(0, Math.min(7, num(inputs.diasOficinaActual)));
  const diasOferta = Math.max(0, Math.min(7, num(inputs.diasOficinaOferta)));
  const transporteActualDia = Math.max(0, num(inputs.transporteActual));
  const transporteOfertaDia = Math.max(0, num(inputs.transporteOferta));
  const comidaActualDia = Math.max(0, num(inputs.comidaActual));
  const comidaOfertaDia = Math.max(0, num(inputs.comidaOferta));
  const minutosViajeDia = Math.max(0, num(inputs.minutosViajeDia));
  const horasSemana = num(inputs.horasSemana) > 0 ? num(inputs.horasSemana) : 45;

  const bonoActual = Math.max(0, num(inputs.bonoAnualActual));
  const bonoOferta = Math.max(0, num(inputs.bonoAnualOferta));
  const benefExtraActual = Math.max(0, num(inputs.valorBeneficiosActual));
  const benefExtraOferta = Math.max(0, num(inputs.valorBeneficiosOferta));

  // — Falta lo mínimo para concluir —
  if (!brutoActual || !brutoOferta) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu sueldo bruto actual y el de la oferta para ver la comparación real. Los demás campos afinan el resultado, pero con esos dos ya te damos el número.',
        tone: 'neutral',
      },
      decisiveNumber: { value: '—', label: 'Diferencia real en tu bolsillo' },
      scenarios: [],
      nextActions: [
        'Cargá el **sueldo bruto** de tu trabajo actual y el de la nueva oferta.',
        'Si la oferta cambia tus días de oficina, sumá el **costo de transporte y comida por día** para ver el impacto real.',
      ],
    };
  }

  const costoActual = diasActual * (transporteActualDia + comidaActualDia) * W;
  const costoOferta = diasOferta * (transporteOfertaDia + comidaOfertaDia) * W;

  const netoActual = neto(brutoActual, conyuge, hijos);
  const netoOferta = neto(brutoOferta, conyuge, hijos);

  const benefActual = bonoActual / 12 + benefExtraActual;
  const benefOferta = bonoOferta / 12 + benefExtraOferta;

  const realActual = netoActual + benefActual - costoActual;
  const realOferta = netoOferta + benefOferta - costoOferta;

  const diffReal = realOferta - realActual; // $/mes
  const pctNominal = ((brutoOferta - brutoActual) / brutoActual) * 100;
  const pctReal = realActual > 0 ? (diffReal / realActual) * 100 : 0;

  // — Valor real de la hora (incluye tiempo de viaje no pago) —
  const horasTrabMes = horasSemana * W;
  const viajeHorasActual = (minutosViajeDia / 60) * diasActual * W;
  const viajeHorasOferta = (minutosViajeDia / 60) * diasOferta * W;
  const valorHoraActual = realActual / (horasTrabMes + viajeHorasActual);
  const valorHoraOferta = realOferta / (horasTrabMes + viajeHorasOferta);

  // — Dos pisos de negociación —
  //   indiferencia: bruto de la oferta para NO perder plata (iguala lo actual).
  //   conviene:     bruto para que CONVENGA de verdad (Martin: +20% real en el bolsillo).
  const brutoIndiferencia = brutoDesdeNeto(realActual - benefOferta + costoOferta, conyuge, hijos);
  const brutoConviene = brutoDesdeNeto(realActual * 1.2 - benefOferta + costoOferta, conyuge, hijos);

  // — Veredicto — la oferta "conviene" sólo si deja ≥20% más en el bolsillo (real).
  let status: DecisionResult['status'] = 'tie';
  let title = '';
  let detail = '';
  let tone: DecisionResult['verdict']['tone'] = 'neutral';
  const fNom = fmtPct(pctNominal);
  const fReal = fmtPct(pctReal);

  if (pctReal >= 20) {
    status = 'b';
    tone = 'good';
    title = 'Conviene aceptar la oferta';
    detail = `La oferta te deja ${fReal} más en el bolsillo (${fmtMoney(diffReal)}/mes) después de impuestos, traslado, comidas y beneficios. Supera el 20% que justifica cambiar de trabajo por la plata, aunque en bruto el aumento figure como ${fNom}.`;
  } else if (pctReal > 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Mejora, pero no es un salto';
    detail = `El bruto sube ${fNom}, pero en el bolsillo la mejora real es ${fReal} (${fmtMoney(diffReal)}/mes), por debajo del 20% que justifica cambiar sólo por plata. Pesá lo demás (crecimiento, equipo, estabilidad). Para un salto real pedí desde ${fmtMoney(brutoConviene)} brutos.`;
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Te conviene quedarte donde estás';
    detail = `Aunque el bruto suba ${fNom}, tu ingreso real CAE ${fReal} una vez que descontás impuestos, traslado y comidas: perderías ${fmtMoney(Math.abs(diffReal))} por mes. Para que valga la pena, la oferta debería arrancar en ${fmtMoney(brutoConviene)} brutos.`;
  }

  // — Escenarios (diferencia REAL acumulada a 12 meses) —
  const realOfertaScenario = (bonoFactor: number, costFactor: number) =>
    netoOferta + (bonoOferta * bonoFactor) / 12 + benefExtraOferta - costoOferta * costFactor;
  const accProb = (realOferta - realActual) * 12;
  const accCons = (realOfertaScenario(0.5, 1.1) - realActual) * 12;
  const accFav = (realOfertaScenario(1.0, 0.9) - realActual) * 12;

  const scenarios = [
    {
      label: 'Conservador',
      value: fmtMoney(accCons),
      detail: 'Si el bono rinde la mitad y los costos de traslado suben ~10%.',
    },
    {
      label: 'Probable',
      value: fmtMoney(accProb),
      detail: 'Con los datos que cargaste, a 12 meses.',
    },
    {
      label: 'Favorable',
      value: fmtMoney(accFav),
      detail: 'Si cobrás el bono completo y optimizás traslado (más días remoto).',
    },
  ];

  // — Comparación A vs B —
  const comparison = {
    columns: ['Trabajo actual', 'Nueva oferta'] as [string, string],
    rows: [
      {
        label: 'Sueldo bruto',
        a: fmtMoney(brutoActual),
        b: fmtMoney(brutoOferta),
        hint: `${fNom} nominal`,
      },
      {
        label: 'Neto en mano (aportes + Ganancias)',
        a: fmtMoney(netoActual),
        b: fmtMoney(netoOferta),
      },
      {
        label: 'Bono + beneficios (prorrateado/mes)',
        a: fmtMoney(benefActual),
        b: fmtMoney(benefOferta),
      },
      {
        label: 'Traslado y comida (por mes)',
        a: '-' + fmtMoney(costoActual).replace('-', ''),
        b: '-' + fmtMoney(costoOferta).replace('-', ''),
        hint: `${diasActual} vs ${diasOferta} días de oficina/sem`,
      },
      {
        label: 'Ingreso real ajustado',
        a: fmtMoney(realActual),
        b: fmtMoney(realOferta),
        hint: `${fReal} real`,
      },
      {
        label: 'Valor real de tu hora',
        a: fmtMoney(valorHoraActual),
        b: fmtMoney(valorHoraOferta),
        hint: 'incluye tiempo de viaje',
      },
    ],
  };

  // — Próximas acciones —
  const nextActions: string[] = [
    'Pedí la oferta **por escrito** con el desglose: sueldo bruto, si el bono es garantizado o variable, beneficios y fecha de ingreso.',
    `Tenés dos números clave: **${fmtMoney(brutoIndiferencia)}** brutos es el piso para no perder plata, y **${fmtMoney(brutoConviene)}** es donde la oferta realmente conviene (+20% en el bolsillo). La oferta de ${fmtMoney(brutoOferta)} ${brutoOferta >= brutoConviene ? 'ya conviene ✓' : brutoOferta >= brutoIndiferencia ? 'no perdés, pero pedí más ✗' : 'está por debajo del piso ✗'}.`,
    'Confirmá si el **bono es remunerativo**: si lo es, suma a tu aguinaldo y a una eventual indemnización. Si no, no cuenta para esos cálculos.',
    'Antes de renunciar, calculá tu **aguinaldo proporcional** y lo que dejás sobre la mesa si te vas justo antes de junio o diciembre.',
  ];

  const notes: string[] = [
    'Los netos se calculan con aportes personales del 17% y la escala de Ganancias 2026 (mismas fórmulas que nuestras calculadoras de sueldo).',
    'El "ingreso real" descuenta traslado y comida sólo por los días de oficina: el trabajo remoto te ahorra ese costo.',
    'No es asesoramiento financiero ni laboral: es una comparación orientativa para que decidas con números, no con el sueldo bruto a secas.',
  ];

  return {
    status,
    verdict: { title, detail, tone },
    decisiveNumber: {
      value: `${fmtMoney(diffReal)}/mes`,
      label: 'Diferencia real en tu bolsillo',
      sub: `Nominal ${fNom} en bruto → ${fReal} real después de impuestos, traslado, comidas y beneficios.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'aceptar-oferta-laboral',
  title: '¿Me conviene aceptar esta oferta laboral? Comparador real 2026',
  h1: '¿Me conviene aceptar esta oferta laboral?',
  description:
    'Compará tu trabajo actual contra una oferta nueva con números reales: sueldo neto, Ganancias, traslado, comidas, tiempo de viaje, bono y beneficios. Te decimos cuánto mejora de verdad y el sueldo mínimo que deberías pedir.',
  intro:
    'No alcanza con mirar el sueldo bruto. Esta sala compara tu trabajo actual contra la oferta corriendo por dentro el sueldo neto, Ganancias, los costos de traslado y comida, el valor real de tu hora y el punto de indiferencia. El resultado no es "ganás $X más", sino cuánto mejora REALMENTE tu ingreso y cuál es el mínimo que deberías pedir para que convenga.',
  icon: '💼',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    brutoActual: 1500000,
    brutoOferta: 1950000,
    conyuge: 'no',
    hijos: 0,
    diasOficinaActual: 2,
    diasOficinaOferta: 5,
    transporteActual: 3500,
    transporteOferta: 4500,
    comidaActual: 5000,
    comidaOferta: 7000,
    minutosViajeDia: 90,
    horasSemana: 45,
    bonoAnualActual: 0,
    bonoAnualOferta: 0,
    valorBeneficiosActual: 0,
    valorBeneficiosOferta: 0,
  },
  fields: [
    // — Sueldos —
    {
      id: 'brutoActual',
      label: 'Sueldo bruto actual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'trabajo.sueldoBruto',
      help: 'El bruto figura arriba de los descuentos en tu recibo de sueldo.',
      group: 'Sueldos',
      groupIcon: '💵',
    },
    {
      id: 'brutoOferta',
      label: 'Sueldo bruto de la oferta',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1830000',
      group: 'Sueldos',
    },
    // — Familia (para Ganancias) —
    {
      id: 'conyuge',
      label: 'Cónyuge a cargo',
      type: 'select',
      default: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Afecta la deducción de Ganancias (ARCA deduce por cónyuge a cargo).',
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
      help: 'Afecta la deducción de Ganancias (ARCA deduce por hijo a cargo).',
      group: 'Tu situación',
    },
    // — Traslado y modalidad (actual vs oferta) —
    {
      id: 'diasOficinaOferta',
      label: 'Días de oficina/semana — oferta',
      type: 'number',
      recommended: true,
      default: 5,
      min: 0,
      max: 7,
      help: 'En el nuevo trabajo. Remoto = 0, presencial = 5, híbrido = los días que vas.',
      group: 'Traslado y modalidad',
      groupIcon: '🚇',
    },
    {
      id: 'diasOficinaActual',
      label: 'Días de oficina/semana — actual',
      type: 'number',
      recommended: true,
      default: 5,
      min: 0,
      max: 7,
      help: 'En tu trabajo de hoy.',
      group: 'Traslado y modalidad',
    },
    {
      id: 'transporteOferta',
      label: 'Transporte por día — oferta',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '4500',
      help: 'Ida y vuelta al nuevo trabajo (colectivo, subte, nafta, peajes, estacionamiento).',
      group: 'Traslado y modalidad',
    },
    {
      id: 'transporteActual',
      label: 'Transporte por día — actual',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '3500',
      help: 'Lo que gastás hoy en ir y volver del trabajo.',
      group: 'Traslado y modalidad',
    },
    {
      id: 'comidaOferta',
      label: 'Comida por día — oferta',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '7000',
      help: 'Lo que gastarías en almuerzo/café los días de oficina del nuevo trabajo.',
      group: 'Traslado y modalidad',
    },
    {
      id: 'comidaActual',
      label: 'Comida por día — actual',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '5000',
      help: 'Lo que pagás hoy en almuerzo/café los días que vas a la oficina.',
      group: 'Traslado y modalidad',
    },
    {
      id: 'minutosViajeDia',
      label: 'Tiempo de viaje por día (min)',
      type: 'number',
      default: 0,
      min: 0,
      suffix: 'min',
      advanced: true,
      help: 'Ida y vuelta. Se usa para calcular el valor REAL de tu hora.',
      group: 'Traslado y modalidad',
    },
    // — Bono y beneficios (anuales) —
    {
      id: 'bonoAnualOferta',
      label: 'Bono anual — oferta',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Bono o aguinaldo extra ANUAL que promete el nuevo trabajo. Lo prorrateamos por mes.',
      group: 'Bono y beneficios',
      groupIcon: '🎁',
    },
    {
      id: 'bonoAnualActual',
      label: 'Bono anual — actual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Bono o aguinaldo extra ANUAL que cobrás hoy en tu trabajo actual.',
      group: 'Bono y beneficios',
    },
    {
      id: 'valorBeneficiosOferta',
      label: 'Beneficios extra — oferta ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Valor mensual de beneficios del nuevo trabajo: obra social premium, gimnasio, conectividad, etc.',
      group: 'Bono y beneficios',
    },
    {
      id: 'valorBeneficiosActual',
      label: 'Beneficios extra — actual ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Valor mensual de los beneficios que ya tenés hoy.',
      group: 'Bono y beneficios',
    },
    {
      id: 'horasSemana',
      label: 'Horas de trabajo por semana',
      type: 'number',
      default: 45,
      min: 1,
      max: 80,
      advanced: true,
      suffix: 'hs',
      group: 'Bono y beneficios',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-impuesto-ganancias-sueldo', label: 'Impuesto a las Ganancias' },
    { slug: 'calculadora-aguinaldo-sac', label: 'Aguinaldo (SAC)' },
    { slug: 'calculadora-sueldo-bruto-desde-neto', label: 'Sueldo bruto desde el neto' },
  ],
  howItWorks: `Esta sala no usa una sola fórmula: orquesta varias para responder la decisión completa.

1. **Sueldo neto de cada bruto.** Aplica los aportes personales del 17% (jubilación 11% + obra social 3% + PAMI 3%) y la escala de Ganancias 2026 a tu sueldo actual y al de la oferta. Es la misma lógica de la calculadora de sueldo en mano.
2. **Costos reales de ir a trabajar.** Multiplica el transporte y la comida por los días de oficina de cada modalidad y los prorratea por mes (4,33 semanas). El trabajo remoto no carga ese costo.
3. **Bono y beneficios.** Prorratea el bono anual por 12 y suma el valor mensual de los beneficios extra.
4. **Ingreso real ajustado.** Neto + beneficios − costos de traslado. Ese es el número que de verdad llega a tu bolsillo.
5. **Valor real de tu hora.** Divide el ingreso real por las horas trabajadas MÁS el tiempo de viaje no pago. Una oferta que paga más pero te hace viajar 2 horas por día puede valer menos por hora.
6. **Pisos de negociación.** Calcula, por búsqueda inversa sobre la escala de Ganancias, dos sueldos brutos clave: el que iguala tu posición actual (piso para no perder plata) y el que deja un 20% más en tu bolsillo (el punto donde la oferta realmente conviene cambiar de trabajo por la plata).`,
  faq: [
    {
      q: '¿Por qué un aumento del 22% en bruto puede ser solo 8% real?',
      a: 'Porque sobre el bruto se descuentan aportes (17%) y Ganancias, y porque un cambio de modalidad (de remoto a presencial) suma costos de transporte, comida y tiempo de viaje. Cuando descontás todo eso, la mejora real en tu bolsillo suele ser bastante menor que el porcentaje nominal.',
    },
    {
      q: '¿Cuándo conviene de verdad aceptar la oferta?',
      a: 'Cuando te deja al menos un 20% más en el bolsillo (ingreso real, ya descontados impuestos, traslado y comidas), no cuando el sueldo bruto sube. Por eso mostramos dos pisos: el bruto que iguala tu posición actual (debajo de ahí perdés plata) y el bruto que logra ese +20% real, que es la cifra con la que conviene entrar a negociar.',
    },
    {
      q: '¿Cómo calculan el sueldo neto?',
      a: 'Con aportes personales del 17% (jubilación 11%, obra social 3%, PAMI 3%, topeados en la base imponible máxima de Ley 24.241) y la escala progresiva de Ganancias 2026 con el mínimo no imponible y las deducciones por cónyuge e hijos vigentes de ARCA. Es la misma fórmula que nuestra calculadora de sueldo en mano.',
    },
    {
      q: '¿Incluye el aguinaldo (SAC)?',
      a: 'La comparación mensual es sobre el sueldo de bolsillo. El aguinaldo aparece como acción a revisar: si el bono de la oferta es remunerativo, impacta tu SAC y una eventual indemnización; si no lo es, no cuenta. Te recomendamos calcular el aguinaldo aparte con la calculadora dedicada antes de renunciar.',
    },
    {
      q: '¿Qué pasa con la inflación?',
      a: 'La comparación está en pesos de hoy, así que la inflación afecta a los dos sueldos por igual mientras ninguno se ajuste. Lo que sí cambia el resultado a futuro es la política de aumentos de cada empleo: por eso mostramos un escenario conservador y uno favorable a 12 meses, y conviene preguntar cada cuánto y cómo ajusta la oferta.',
    },
    {
      q: '¿Sirve si la oferta es 100% remota?',
      a: 'Sí, y es donde más se nota. Si pasás de presencial a remoto, eliminás transporte, comida y tiempo de viaje: tu ingreso real puede subir mucho más que el bruto. Poné 0 días de oficina en la oferta para verlo.',
    },
    {
      q: '¿Cómo valúo los beneficios que no son plata?',
      a: 'Estimá cuánto te costaría pagarlos por tu cuenta y cargalo en "valor extra de beneficios por mes": una obra social premium, un plan de gimnasio, el pago de la conectividad o un día extra de home office tienen un valor económico concreto que conviene sumar a la comparación.',
    },
    {
      q: '¿Esto reemplaza el consejo de un contador?',
      a: 'No. Es una herramienta orientativa para que decidas con números reales en lugar del sueldo bruto a secas. Para tu situación impositiva exacta (otras deducciones, pluriempleo, autónomo) consultá con un contador público matriculado.',
    },
  ],
  sources: [
    {
      name: 'Ley 24.241 — Base imponible de aportes (SIPA)',
      url: 'https://www.argentina.gob.ar/normativa/nacional/ley-24241-639',
    },
    {
      name: 'Ley 20.628 / 27.743 — Impuesto a las Ganancias',
      url: 'https://www.argentina.gob.ar/normativa',
    },
    {
      name: 'ARCA — Deducciones y escala de Ganancias 2026',
      url: 'https://www.arca.gob.ar/',
    },
  ],
};
