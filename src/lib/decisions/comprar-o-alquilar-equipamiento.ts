/**
 * Sala de decisión — "¿Me conviene comprar o alquilar equipamiento?"
 *
 * Patrón COMPARACIÓN A vs B. Compara el costo total de poseer el equipo (precio,
 * financiación, mantenimiento, depreciación, valor de reventa) contra alquilarlo
 * (renting/leasing) durante los mismos años de uso. La frecuencia de uso modula
 * la recomendación: uso alto favorece comprar, uso bajo favorece alquilar.
 * Math inline determinístico.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const precio = Math.max(0, num(inputs.precioCompra));
  const tnaFin = Math.max(0, num(inputs.tnaFinanciacion));
  const mantenimientoAnual = Math.max(0, num(inputs.mantenimientoAnual));
  const deprecPct = Math.min(100, Math.max(0, num(inputs.depreciacion)));
  const alquilerMensual = Math.max(0, num(inputs.alquilerMensual));
  const frecuencia = String(inputs.frecuenciaUso || 'media');
  const valorReventa = Math.max(0, num(inputs.valorReventa));
  const anios = Math.max(0.5, num(inputs.aniosUso) || 3);

  if (!precio || !alquilerMensual) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio de compra y el alquiler mensual para comparar el costo total de cada opción durante los años que lo vas a usar.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Opción más barata' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio de compra** del equipo y el **alquiler mensual** equivalente.',
        'Indicá los **años de uso** y la **frecuencia** para ajustar la recomendación.',
      ],
    };
  }

  // — Costo de COMPRAR (A) —
  // Si financiás, el costo financiero se aproxima como precio × TNA × años / 2
  // (saldo promedio ~mitad a lo largo del repago). Si TNA=0, sin costo financiero.
  const costoFinanciero = precio * (tnaFin / 100) * anios / 2;
  // Reventa estimada: la mayor entre el valor cargado y el residual por depreciación.
  const residualPorDeprec = precio * Math.pow(1 - deprecPct / 100, anios);
  const reventaEstimada = valorReventa > 0 ? valorReventa : residualPorDeprec;
  const mantenimientoTotal = mantenimientoAnual * anios;
  const costoComprar = precio + costoFinanciero + mantenimientoTotal - reventaEstimada;

  // — Costo de ALQUILAR (B) —
  const costoAlquilar = alquilerMensual * 12 * anios;

  // — Ajuste por frecuencia de uso —
  // Uso bajo: alquilar suele convenir (no inmovilizás capital). Uso alto: comprar.
  const factorFrecuencia = frecuencia === 'alta' ? 0.95 : frecuencia === 'baja' ? 1.05 : 1.0;
  const costoComprarAjustado = costoComprar * factorFrecuencia;

  const diff = costoAlquilar - costoComprarAjustado; // + => conviene comprar
  const ganaComprar = diff > 0;
  const margen = Math.abs(diff);
  const empate = margen < Math.max(costoComprar, costoAlquilar) * 0.05;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (empate) {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por flexibilidad';
    badge = 'Es parejo';
    detail = `Comprar (${fmtMoney(costoComprarAjustado)}) y alquilar (${fmtMoney(costoAlquilar)}) cuestan casi lo mismo en ${anios} años. Si está empatado, alquilar gana por flexibilidad: no inmovilizás capital ni te quedás con un equipo que se desactualiza.`;
  } else if (ganaComprar) {
    status = 'a';
    tone = 'good';
    title = 'Te conviene comprar';
    badge = 'Comprar';
    detail = `En ${anios} años, comprar cuesta ${fmtMoney(costoComprarAjustado)} (descontando la reventa de ${fmtMoney(reventaEstimada)}) vs ${fmtMoney(costoAlquilar)} de alquiler: ahorrás ${fmtMoney(margen)}. Con uso ${frecuencia}, tener el equipo propio rinde.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Te conviene alquilar';
    badge = 'Alquilar';
    detail = `En ${anios} años, alquilar cuesta ${fmtMoney(costoAlquilar)} vs ${fmtMoney(costoComprarAjustado)} de comprar: ahorrás ${fmtMoney(margen)} y no inmovilizás ${fmtMoney(precio)} de capital. Con uso ${frecuencia}, alquilar es lo más eficiente.`;
  }

  const costoMensualComprar = costoComprarAjustado / (anios * 12);

  const scenarios = [
    {
      label: 'Comprar (total)',
      value: fmtMoney(costoComprarAjustado),
      detail: `Precio + financiación + mantenimiento − reventa, en ${anios} años.`,
    },
    {
      label: 'Alquilar (total)',
      value: fmtMoney(costoAlquilar),
      detail: `${fmtMoney(alquilerMensual)}/mes durante ${anios} años.`,
    },
    {
      label: 'Comprar (por mes)',
      value: fmtMoney(costoMensualComprar) + '/mes',
      detail: `Costo de comprar prorrateado: comparalo con el alquiler de ${fmtMoney(alquilerMensual)}.`,
    },
  ];

  const comparison = {
    columns: ['Comprar', 'Alquilar'] as [string, string],
    rows: [
      { label: 'Desembolso inicial', a: fmtMoney(precio), b: fmtMoney(alquilerMensual), hint: 'comprar inmoviliza capital' },
      { label: 'Costo financiero', a: fmtMoney(costoFinanciero), b: '—', hint: tnaFin > 0 ? `TNA ${tnaFin}%` : 'sin financiación' },
      { label: `Mantenimiento (${anios} años)`, a: fmtMoney(mantenimientoTotal), b: 'incluido', hint: 'el alquiler suele incluir service' },
      { label: 'Valor de reventa', a: '-' + fmtMoney(reventaEstimada).replace('-', ''), b: '—' },
      { label: `Costo total a ${anios} años`, a: fmtMoney(costoComprarAjustado), b: fmtMoney(costoAlquilar) },
      { label: 'Costo por mes', a: fmtMoney(costoMensualComprar), b: fmtMoney(alquilerMensual) },
    ],
  };

  const nextActions = [
    `Según esta comparación, te conviene **${ganaComprar ? 'comprar' : (empate ? 'alquilar (por flexibilidad)' : 'alquilar')}** por ${fmtMoney(margen)} en ${anios} años. Validá los supuestos (reventa, mantenimiento) con datos reales del equipo.`,
    frecuencia === 'baja'
      ? 'Con uso bajo, comprar te deja capital inmovilizado en algo que usás poco: el alquiler (o tercerizar) suele rendir más, salvo que el equipo sea crítico para tu operación.'
      : frecuencia === 'alta'
        ? 'Con uso intensivo, el equipo propio se amortiza rápido y no dependés de la disponibilidad de un proveedor: comprar gana peso.'
        : 'Con uso medio, mirá la flexibilidad: si la tecnología cambia rápido, alquilar evita quedarte con algo obsoleto.',
    'Si comprás financiado, confirmá el **CFT real** (no solo la TNA): seguros y comisiones encarecen el costo financiero más de lo que parece.',
    'Considerá el **costo de oportunidad** del desembolso inicial: ese capital invertido podría rendir. Si el alquiler es algo más caro pero te libera plata para el negocio, puede convenir igual.',
  ];

  const notes = [
    'El costo de comprar = precio + costo financiero (aprox. precio × TNA × años / 2 sobre saldo promedio) + mantenimiento − valor de reventa. El de alquilar = alquiler mensual × 12 × años.',
    'Si no cargás valor de reventa, se estima por depreciación (precio × (1 − depreciación)^años). La reventa real depende del estado y del mercado del equipo usado.',
    'El ajuste por frecuencia de uso (±5%) es una heurística para reflejar que el uso intensivo favorece comprar y el uso esporádico favorece alquilar; no reemplaza un análisis caso por caso.',
    'No es asesoramiento financiero. No incluye el impacto impositivo (el leasing y la amortización pueden ser deducibles): consultá con un contador para tu caso.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: ganaComprar ? 'Comprar' : (empate ? 'Parejo' : 'Alquilar'),
      label: `Opción más barata a ${anios} años`,
      sub: `Comprar: **${fmtMoney(costoComprarAjustado)}** · Alquilar: **${fmtMoney(costoAlquilar)}**. Diferencia: ${fmtMoney(margen)}.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'comprar-o-alquilar-equipamiento',
  title: '¿Comprar o alquilar equipamiento? Comparador de costo 2026',
  h1: '¿Me conviene comprar o alquilar equipamiento?',
  description:
    'Compará el costo total de comprar un equipo (precio, financiación, mantenimiento, depreciación y reventa) contra alquilarlo, durante los años que lo vas a usar. La frecuencia de uso define cuál conviene.',
  intro:
    'Comprar un equipo inmoviliza capital pero te deja un activo; alquilarlo libera plata pero no construye patrimonio. La respuesta correcta depende de cuánto lo uses, cuánto cueste mantenerlo y cuánto valga cuando lo quieras vender. Esta sala compara el costo total de cada opción a lo largo de los años de uso y te dice cuál te cuesta menos y por qué.',
  icon: '🔧',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    precioCompra: 6_000_000,
    tnaFinanciacion: 0,
    mantenimientoAnual: 300_000,
    depreciacion: 20,
    alquilerMensual: 220_000,
    frecuenciaUso: 'alta',
    valorReventa: 2_500_000,
    aniosUso: 3,
  },
  fields: [
    {
      id: 'precioCompra',
      label: 'Precio de compra',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '6000000',
      help: 'Lo que pagarías por el equipo nuevo (o usado) si lo comprás.',
      group: 'Comprar',
      groupIcon: '🛒',
    },
    {
      id: 'tnaFinanciacion',
      label: 'TNA de financiación',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      help: 'Si financiás la compra, la tasa anual. Dejá 0 si pagás de contado.',
      group: 'Comprar',
    },
    {
      id: 'mantenimientoAnual',
      label: 'Mantenimiento anual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '300000',
      help: 'Service, repuestos, seguros: lo que gastás por año en mantener el equipo tuyo.',
      group: 'Comprar',
    },
    {
      id: 'depreciacion',
      label: 'Depreciación anual',
      type: 'number',
      suffix: '%',
      default: 20,
      min: 0,
      max: 100,
      advanced: true,
      help: 'Cuánto pierde de valor por año. Se usa para estimar la reventa si no la cargás.',
      group: 'Comprar',
    },
    {
      id: 'valorReventa',
      label: 'Valor de reventa estimado',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '2500000',
      help: 'Lo que esperás recuperar vendiéndolo al final. Si lo dejás en 0, lo estimamos por depreciación.',
      group: 'Comprar',
    },
    {
      id: 'alquilerMensual',
      label: 'Alquiler mensual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '220000',
      help: 'Lo que costaría alquilar/rentar el equipo equivalente por mes.',
      group: 'Alquilar',
      groupIcon: '🔁',
    },
    {
      id: 'frecuenciaUso',
      label: 'Frecuencia de uso',
      type: 'select',
      default: 'media',
      options: [
        { value: 'alta', label: 'Alta (uso diario/intensivo)' },
        { value: 'media', label: 'Media' },
        { value: 'baja', label: 'Baja (uso esporádico)' },
      ],
      help: 'Uso intensivo favorece comprar; uso esporádico favorece alquilar.',
      group: 'Uso',
      groupIcon: '⏳',
    },
    {
      id: 'aniosUso',
      label: 'Años de uso',
      type: 'number',
      suffix: 'años',
      default: 3,
      min: 0.5,
      max: 30,
      help: 'Cuántos años pensás usar el equipo. Es el plazo de la comparación.',
      group: 'Uso',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-amortizacion-auto-valor-residual', label: 'Amortización y valor residual' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de financiación' },
    { slug: 'calculadora-cft-prestamo-personal-comparativa', label: 'CFT de un préstamo' },
    { slug: 'calculadora-alquiler-con-opcion-a-compra-leasing-inmueble', label: 'Leasing con opción a compra' },
  ],
  howItWorks: `Esta sala pone en la misma vara el costo de poseer y el de alquilar.

1. **Costo de comprar.** Suma el precio, el costo financiero si lo financiás (aproximado sobre el saldo promedio), y el mantenimiento de todos los años. Le resta el valor de reventa al final: lo que recuperás baja el costo real.
2. **Estimación de la reventa.** Si no cargás un valor, lo estima por depreciación (precio × (1 − depreciación)^años). Un equipo que conserva valor abarata mucho la opción de comprar.
3. **Costo de alquilar.** Multiplica el alquiler mensual por los meses de uso. El alquiler suele incluir el mantenimiento y la posibilidad de actualizar el equipo.
4. **Ajuste por frecuencia.** Uso intensivo favorece comprar (el equipo se amortiza); uso esporádico favorece alquilar (no inmovilizás capital en algo parado).
5. **Veredicto.** Compara los dos costos totales a los años de uso y muestra también el costo de comprar prorrateado por mes, para que lo enfrentes directo contra el alquiler.`,
  faq: [
    {
      q: '¿Cuándo conviene comprar y cuándo alquilar equipamiento?',
      a: 'A grandes rasgos: comprar conviene si lo vas a usar mucho y por varios años, conserva valor de reventa y no se desactualiza rápido. Alquilar conviene si el uso es esporádico, querés flexibilidad, la tecnología cambia rápido o preferís no inmovilizar capital en un activo.',
    },
    {
      q: '¿Por qué resto el valor de reventa al costo de comprar?',
      a: 'Porque al final del uso podés vender el equipo y recuperar parte de la inversión. Ese ingreso baja el costo real de haberlo comprado. Un equipo que mantiene buen valor de reventa (autos, ciertas máquinas) hace que comprar sea mucho más atractivo de lo que parece a primera vista.',
    },
    {
      q: '¿El alquiler incluye el mantenimiento?',
      a: 'Generalmente sí: en un renting o leasing operativo, el service y las reparaciones suelen estar incluidos, lo que reduce tu riesgo de gastos imprevistos. Al comprar, el mantenimiento corre por tu cuenta. Por eso esta sala suma el mantenimiento al costo de comprar y lo da por incluido en el de alquilar.',
    },
    {
      q: '¿Qué es el costo de oportunidad de comprar?',
      a: 'Es lo que dejás de ganar por inmovilizar el dinero de la compra en lugar de invertirlo o usarlo en el negocio. Si el alquiler es algo más caro pero te libera ese capital para algo que rinde más, alquilar puede convenir aunque el costo directo sea mayor.',
    },
    {
      q: '¿Cómo afecta la financiación a la decisión?',
      a: 'Si comprás financiado, el costo financiero (intereses) se suma al precio y puede inclinar la balanza hacia alquilar. Usá el CFT real (incluye seguros y comisiones), no solo la TNA, porque el costo verdadero del crédito suele ser bastante más alto.',
    },
    {
      q: '¿Y los beneficios impositivos?',
      a: 'Pueden cambiar el resultado. El leasing y la amortización del equipo comprado suelen ser deducibles de Ganancias, y como Responsable Inscripto podés computar el IVA. Esta sala no los incluye: si el monto es importante, pedile a tu contador el análisis con el impacto fiscal.',
    },
    {
      q: '¿Sirve para autos, maquinaria y herramientas por igual?',
      a: 'Sí, la lógica es la misma para cualquier equipo: precio, financiación, mantenimiento, depreciación y reventa vs alquiler. Lo que cambia entre rubros son los valores típicos de reventa y depreciación, así que cargá datos reales del equipo concreto que estás evaluando.',
    },
    {
      q: '¿Esto reemplaza el consejo de un contador?',
      a: 'No. Es una comparación de costos orientativa. El impacto impositivo (deducciones, IVA, amortización) y la mejor estructura financiera para tu caso conviene validarlos con un contador público matriculado.',
    },
  ],
  sources: [
    { name: 'BCRA — Costo Financiero Total (CFT)', url: 'https://www.bcra.gob.ar/' },
    { name: 'ARCA — Amortización y leasing (Impuesto a las Ganancias)', url: 'https://www.arca.gob.ar/' },
  ],
};
