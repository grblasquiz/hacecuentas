/**
 * Sala de decisión — "¿Cuánto fondo de emergencia necesito?"
 *
 * Patrón DIMENSIONAMIENTO. Parte de la regla base (3 meses de gastos) y la ajusta
 * por tus factores de riesgo: estabilidad laboral, hijos, alquiler, vehículo,
 * otras fuentes de ingreso. Cada factor suma meses recomendados. Devuelve el
 * monto del fondo (meses × gastos) y cómo se compone.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num, bool } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const gastos = Math.max(0, num(inputs.gastosMensuales));
  const estabilidad = String(inputs.estabilidadLaboral || 'media'); // alta | media | baja
  const hijos = bool(inputs.hijos);
  const alquiler = bool(inputs.tieneAlquiler);
  const vehiculo = bool(inputs.tieneVehiculo);
  const otrasFuentes = bool(inputs.otrasFuentesIngreso);

  if (!gastos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tus gastos mensuales para calcular cuánto fondo de emergencia necesitás. Ajustamos la cantidad de meses según tu estabilidad laboral y tus cargas.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Fondo de emergencia recomendado' },
      scenarios: [],
      nextActions: [
        'Cargá tus **gastos mensuales** (todo lo que necesitás para vivir un mes).',
        'Indicá tu **estabilidad laboral** y tus cargas (hijos, alquiler, vehículo).',
      ],
    };
  }

  // Base: 3 meses. Ajustes por factor de riesgo.
  let meses = 3;
  const factores: { label: string; meses: number; activo: boolean }[] = [];

  // Estabilidad laboral: baja +2, media +0, alta -1 (mínimo 3 igual).
  let mesesEstab = 0;
  if (estabilidad === 'baja') mesesEstab = 2;
  else if (estabilidad === 'alta') mesesEstab = -1;
  factores.push({
    label: estabilidad === 'baja' ? 'Estabilidad laboral baja (monotributo, changas, comisiones)' : estabilidad === 'alta' ? 'Estabilidad laboral alta (empleo en relación de dependencia firme)' : 'Estabilidad laboral media',
    meses: mesesEstab,
    activo: mesesEstab !== 0,
  });
  meses += mesesEstab;

  factores.push({ label: 'Hijos / personas a cargo', meses: hijos ? 1 : 0, activo: hijos });
  if (hijos) meses += 1;

  factores.push({ label: 'Pagás alquiler', meses: alquiler ? 1 : 0, activo: alquiler });
  if (alquiler) meses += 1;

  factores.push({ label: 'Tenés vehículo (mantenimiento, imprevistos)', meses: vehiculo ? 1 : 0, activo: vehiculo });
  if (vehiculo) meses += 1;

  // Otras fuentes de ingreso reducen el riesgo de quedarte sin nada.
  factores.push({ label: 'Otra fuente de ingreso (segundo ingreso del hogar, renta)', meses: otrasFuentes ? -1 : 0, activo: otrasFuentes });
  if (otrasFuentes) meses -= 1;

  // Pisos: nunca menos de 3 meses.
  meses = Math.max(3, meses);

  const fondo = meses * gastos;

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

  const detail = `Por tu situación, te recomendamos un fondo de ${meses} meses de gastos: ${fmtMoney(fondo)}. Es la plata líquida que deberías tener guardada para cubrir imprevistos (perder el trabajo, una urgencia médica, una rotura) sin endeudarte ni vender mal tus cosas.`;

  const scenarios = [
    { label: 'Mínimo (3 meses)', value: fmtMoney(3 * gastos), detail: 'El piso que todos deberían tener, pase lo que pase.' },
    { label: 'Recomendado para vos', value: fmtMoney(fondo), detail: `${meses} meses, ajustado por tu estabilidad y cargas.` },
    { label: 'Conservador (12 meses)', value: fmtMoney(12 * gastos), detail: 'Tranquilidad total, ideal si tu ingreso es muy variable.' },
  ];

  const breakdown = [
    { label: 'Gastos mensuales', value: fmtMoney(gastos), hint: 'la base del cálculo' },
    { label: 'Base universal', value: '3 meses' },
    ...factores
      .filter((f) => f.activo)
      .map((f) => ({ label: f.label, value: `${f.meses > 0 ? '+' : ''}${f.meses} ${Math.abs(f.meses) === 1 ? 'mes' : 'meses'}` })),
    { label: 'Meses recomendados', value: `${meses} meses` },
    { label: 'Fondo de emergencia total', value: fmtMoney(fondo) },
  ];

  const nextActions = [
    `Tu objetivo es juntar **${fmtMoney(fondo)}** (${meses} meses de gastos). Si todavía no lo tenés, empezá por el piso de ${fmtMoney(3 * gastos)} y subí desde ahí.`,
    'Guardá el fondo en un instrumento **líquido y de bajo riesgo** (caja de ahorro remunerada, money market): tiene que estar disponible en el día, no inmovilizado en un plazo fijo largo.',
    'No lo mezcles con tus ahorros de inversión ni con la plata del día a día: el fondo de emergencia es **intocable salvo emergencia real**.',
    'Si pagás alquiler o tu ingreso es variable, apuntá al extremo alto del rango: sos más vulnerable a un imprevisto que alguien con ingreso fijo y casa propia.',
  ];

  const notes = [
    'El cálculo parte de la regla general de 3 meses de gastos y suma meses por cada factor de riesgo (estabilidad baja, hijos, alquiler, vehículo) y resta si tenés otra fuente de ingreso. Es una guía, no una fórmula exacta.',
    'Usá tus gastos REALES de subsistencia (lo que necesitás para vivir), no tu ingreso. El fondo cubre gastos, no reemplaza tu sueldo completo.',
    'No es asesoramiento financiero. Ajustá el monto a tu realidad: si tenés deudas o ingresos muy inestables, conviene un colchón mayor.',
  ];

  return {
    status,
    verdict: {
      title: meses <= 4 ? `Con ${meses} meses estás cubierto` : meses <= 6 ? `Apuntá a ${meses} meses de gastos` : `Tu perfil pide un colchón grande: ${meses} meses`,
      detail, tone, badge,
    },
    decisiveNumber: {
      value: fmtMoney(fondo),
      label: 'Fondo de emergencia recomendado',
      sub: `**${meses} meses** de tus gastos (${fmtMoney(gastos)}/mes), ajustado por tu situación.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-fondo-de-emergencia-necesito',
  title: '¿Cuánto fondo de emergencia necesito? Calculalo según tu caso 2026',
  h1: '¿Cuánto fondo de emergencia necesito?',
  description:
    'Calculá tu fondo de emergencia ideal ajustado a tu situación: estabilidad laboral, hijos, alquiler y vehículo. Parte de la regla de 3 meses de gastos y la adapta a tu nivel de riesgo. Monto exacto y cómo armarlo.',
  intro:
    '"Tres a seis meses de gastos" es la regla famosa, pero el número correcto para vos depende de tu situación. Esta sala parte de esa base y la ajusta por tus factores de riesgo (qué tan estable es tu ingreso, si tenés hijos, si pagás alquiler, si tenés auto) para darte un monto concreto y decirte cómo y dónde armarlo.',
  icon: '🛟',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    gastosMensuales: 900000,
    estabilidadLaboral: 'media',
    hijos: 'si',
    tieneAlquiler: 'si',
    tieneVehiculo: 'no',
    otrasFuentesIngreso: 'no',
  },
  fields: [
    { id: 'gastosMensuales', label: 'Tus gastos mensuales', type: 'number', prefix: '$', required: true, min: 0, placeholder: '900000', profileKey: 'gastos.recurrentesMensual', help: 'Todo lo que necesitás para vivir un mes: alquiler, comida, servicios, transporte.', group: 'Tus gastos', groupIcon: '🧾' },
    {
      id: 'estabilidadLaboral', label: 'Estabilidad de tu ingreso', type: 'select', default: 'media', recommended: true,
      options: [
        { value: 'alta', label: 'Alta (empleo en relación de dependencia firme)' },
        { value: 'media', label: 'Media (empleo con cierta variabilidad)' },
        { value: 'baja', label: 'Baja (monotributo, freelance, comisiones, changas)' },
      ],
      help: 'Qué tan seguro y predecible es tu ingreso mensual.', group: 'Tu riesgo', groupIcon: '⚖️',
    },
    { id: 'hijos', label: '¿Tenés hijos o personas a cargo?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }], help: 'Más bocas que dependen de vos = más colchón.', group: 'Tu riesgo' },
    { id: 'tieneAlquiler', label: '¿Pagás alquiler?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No (casa propia)' }, { value: 'si', label: 'Sí' }], help: 'El alquiler es un gasto fijo que no podés bajar fácil ante un imprevisto.', group: 'Tu riesgo' },
    { id: 'tieneVehiculo', label: '¿Tenés vehículo?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }], help: 'Suma gastos imprevistos: mantenimiento, roturas, seguro.', group: 'Tu riesgo' },
    { id: 'otrasFuentesIngreso', label: '¿Tenés otra fuente de ingreso?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí (segundo ingreso del hogar, renta)' }], help: 'Otro ingreso reduce el riesgo de quedarte sin nada.', group: 'Tu riesgo' },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `Esta sala ajusta la regla genérica del fondo de emergencia a tu situación real.

1. **La base universal.** Todos deberían tener al menos 3 meses de gastos guardados. Ese es el piso, pase lo que pase.
2. **Tus factores de riesgo.** Suma meses según tu vulnerabilidad: si tu ingreso es inestable (+2), si tenés hijos (+1), si pagás alquiler (+1) o si tenés vehículo (+1). Cuanto más expuesto estás a un imprevisto, más colchón necesitás.
3. **Lo que te baja el riesgo.** Si tenés una segunda fuente de ingreso en el hogar, resta un mes: es menos probable que te quedes sin nada de golpe.
4. **El monto.** Multiplica los meses recomendados por tus gastos mensuales reales (no por tu ingreso): ese es el fondo que necesitás.
5. **Cómo armarlo.** Te recomienda dónde guardarlo (líquido, de bajo riesgo) y cómo separarlo del resto de tu plata para que sea verdaderamente "de emergencia".`,
  faq: [
    { q: '¿Por qué 3 a 6 meses de gastos?', a: 'Porque ese rango cubre el tiempo promedio que lleva reacomodarse ante un imprevisto grande, como perder el trabajo. Tres meses es el piso para casi cualquiera; seis o más conviene si tu ingreso es inestable o tenés muchas cargas fijas.' },
    { q: '¿El fondo se calcula sobre mis gastos o mi ingreso?', a: 'Sobre tus gastos mensuales de subsistencia, no sobre tu ingreso. El fondo está para cubrir lo que necesitás para vivir mientras se normaliza la situación, no para reemplazar tu sueldo completo.' },
    { q: '¿Dónde guardo el fondo de emergencia?', a: 'En un instrumento líquido y de bajo riesgo, disponible en el día: una caja de ahorro remunerada o un money market. No en un plazo fijo largo ni en inversiones volátiles, porque una emergencia no espera al vencimiento ni a que el mercado mejore.' },
    { q: '¿Conviene tenerlo en pesos o en dólares?', a: 'Una parte en moneda dura (dólar) protege del salto inflacionario, pero necesitás liquidez inmediata en pesos para gastos cotidianos. Una división razonable es mantener lo de uso inmediato en pesos remunerados y el resto como cobertura, según tu tolerancia.' },
    { q: '¿Por qué sumar meses si tengo hijos o alquiler?', a: 'Porque son gastos fijos que no podés recortar ante un imprevisto. Si perdés el ingreso, el alquiler y los chicos siguen costando igual, así que necesitás un colchón más grande para sostenerlos sin endeudarte.' },
    { q: '¿Qué pasa si no llego ni a 3 meses?', a: 'Empezá por ahí: armá primero el piso de 3 meses antes de invertir en cualquier otra cosa. Apartá un monto fijo cada mes apenas cobrás, como si fuera una cuenta más, hasta llegar al objetivo.' },
    { q: '¿Puedo usar el fondo para una oportunidad de inversión?', a: 'No. El fondo de emergencia es intocable salvo una emergencia real (salud, pérdida de ingreso, una rotura urgente). Si lo usás para invertir y justo aparece un imprevisto, terminás endeudándote caro, que es exactamente lo que el fondo evita.' },
    { q: '¿Esto reemplaza un seguro?', a: 'No: son complementarios. El fondo cubre imprevistos cotidianos y la transición ante una pérdida de ingreso; el seguro cubre eventos grandes y puntuales (salud, hogar, auto). Tener ambos te da una red más completa.' },
  ],
  sources: [
    { name: 'CNV — Educación financiera', url: 'https://www.argentina.gob.ar/cnv' },
    { name: 'BCRA — Información para usuarios financieros', url: 'https://www.bcra.gob.ar/BCRAyVos/default.asp' },
  ],
};
