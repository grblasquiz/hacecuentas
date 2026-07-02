/**
 * Sala de decisión CO — "¿Cuánto fondo de emergencia necesito?"
 *
 * Patrón DIMENSIONAMIENTO localizado a Colombia: los meses recomendados
 * dependen sobre todo del TIPO de vínculo laboral (indefinido / término fijo /
 * prestación de servicios o independiente), que en Colombia define qué tan
 * rápido puedes quedarte sin ingreso. Además calcula cuánto te falta y en
 * cuántos meses llegas con tu ahorro mensual, y te dice dónde tener la plata
 * (cuenta remunerada, CDT escalonado, FIC) y qué papel juegan las cesantías.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { num, bool } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const gastos = Math.max(0, num(inputs.gastosEsenciales));
  const vinculo = String(inputs.tipoVinculo || 'indefinido'); // indefinido | fijo | independiente
  const personasACargo = bool(inputs.personasACargo);
  const otroIngresoHogar = bool(inputs.otroIngresoHogar);
  const ahorroActual = Math.max(0, num(inputs.ahorroActual));
  const aporteMensual = Math.max(0, num(inputs.aporteMensual));

  if (!gastos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún faltan datos para darte una respuesta',
        detail:
          'Ingresa tus gastos esenciales del mes (arriendo, mercado, servicios, transporte). Con eso y tu tipo de contrato calculamos cuántos meses de colchón necesitas y en cuánto tiempo lo armas.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Fondo de emergencia recomendado' },
      scenarios: [],
      nextActions: [
        'Ingresa tus **gastos esenciales mensuales**: lo mínimo que necesitas para vivir un mes.',
        'Indica tu **tipo de vínculo laboral**: no es lo mismo un contrato indefinido que facturar por prestación de servicios.',
      ],
    };
  }

  // Base por estabilidad del vínculo: indefinido 3, término fijo 4, independiente 6.
  let meses: number;
  let vinculoLabel: string;
  if (vinculo === 'independiente') {
    meses = 6;
    vinculoLabel = 'Prestación de servicios / independiente (sin liquidación ni estabilidad)';
  } else if (vinculo === 'fijo') {
    meses = 4;
    vinculoLabel = 'Contrato a término fijo (renovación no garantizada)';
  } else {
    meses = 3;
    vinculoLabel = 'Contrato a término indefinido (ingreso más estable)';
  }

  const ajustes: { label: string; meses: number }[] = [];
  if (personasACargo) {
    meses += 1;
    ajustes.push({ label: 'Personas a cargo (hijos, padres)', meses: 1 });
  }
  if (otroIngresoHogar) {
    meses -= 1;
    ajustes.push({ label: 'Otro ingreso en el hogar', meses: -1 });
  }
  meses = Math.min(9, Math.max(3, meses));

  const meta = meses * gastos;
  const falta = Math.max(0, meta - ahorroActual);
  const mesesParaLlegar = falta > 0 && aporteMensual > 0 ? Math.ceil(falta / aporteMensual) : falta > 0 ? -1 : 0;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let title: string;
  if (falta <= 0) {
    status = 'b';
    tone = 'good';
    badge = 'Meta cumplida';
    title = 'Ya tienes el colchón que tu situación pide';
  } else if (ahorroActual >= gastos * 3) {
    status = 'tie';
    tone = 'neutral';
    badge = 'A medio camino';
    title = `Tienes el piso, pero tu meta real son ${meses} meses`;
  } else {
    status = 'a';
    tone = 'warn';
    badge = 'Colchón corto';
    title = `Tu situación pide ${meses} meses de gastos y aún no los tienes`;
  }

  const detail =
    falta <= 0
      ? `Con ${fmtMoney(ahorroActual)} guardados ya cubres los ${meses} meses de gastos esenciales (${fmtMoney(meta)}) que tu perfil necesita. Ahora el reto es no tocarlos: esa plata es solo para emergencias reales, no para vacaciones ni para "una oportunidad".`
      : `Por tu tipo de vínculo y tus cargas, tu fondo debería cubrir ${meses} meses de gastos esenciales: ${fmtMoney(meta)}. Hoy tienes ${fmtMoney(ahorroActual)}, te faltan ${fmtMoney(falta)}${mesesParaLlegar > 0 ? ` — guardando ${fmtMoney(aporteMensual)} al mes, llegas en ${mesesParaLlegar} ${mesesParaLlegar === 1 ? 'mes' : 'meses'}` : mesesParaLlegar === -1 ? ' y todavía no definiste un ahorro mensual para llegar' : ''}.`;

  const scenarios = [
    { label: 'Piso mínimo (3 meses)', value: fmtMoney(3 * gastos), detail: 'Lo que cualquier persona debería tener guardado, sin excusas.' },
    { label: `Tu meta (${meses} meses)`, value: fmtMoney(meta), detail: 'Ajustada por tu tipo de contrato y tus cargas familiares.' },
    { label: 'Holgado (9 meses)', value: fmtMoney(9 * gastos), detail: 'Para independientes con ingresos muy variables o un solo cliente grande.' },
  ];

  const breakdown = [
    { label: 'Gastos esenciales al mes', value: fmtMoney(gastos), hint: 'arriendo, mercado, servicios, transporte' },
    { label: vinculoLabel, value: `${vinculo === 'independiente' ? 6 : vinculo === 'fijo' ? 4 : 3} meses`, hint: 'base según estabilidad del ingreso' },
    ...ajustes.map((a) => ({ label: a.label, value: `${a.meses > 0 ? '+' : ''}${a.meses} mes` })),
    { label: 'Meta del fondo', value: fmtMoney(meta), hint: `${meses} meses de gastos` },
    { label: 'Lo que ya tienes', value: fmtMoney(ahorroActual) },
    { label: 'Lo que te falta', value: fmtMoney(falta) },
    ...(mesesParaLlegar > 0 ? [{ label: 'Tiempo para completarlo', value: `${mesesParaLlegar} ${mesesParaLlegar === 1 ? 'mes' : 'meses'}`, hint: `guardando ${fmtMoney(aporteMensual)}/mes` }] : []),
  ];

  const nextActions = [
    falta > 0
      ? `Tu meta es **${fmtMoney(meta)}**. Programa una transferencia automática de ${aporteMensual > 0 ? fmtMoney(aporteMensual) : 'un monto fijo'} el mismo día que te consignan: el ahorro que no sale primero, no sale nunca.`
      : `Ya llegaste a la meta: deja el fondo quieto y destina tu ahorro nuevo a inversión (CDT más largos, FIC moderados) o a abonar deudas caras.`,
    'Reparte el fondo entre una **cuenta de ahorros remunerada** (disponible el mismo día, hoy varias fintech pagan cerca del 8% EA) y **CDT escalonados** a 90/180 días para la parte que puede esperar.',
    vinculo === 'independiente'
      ? 'Como independiente no tienes cesantías ni liquidación: tu fondo ES tu única red. En los meses buenos guarda de más, porque los flojos llegan sin avisar.'
      : 'Tus **cesantías** son un colchón parcial, no el fondo completo: solo puedes retirarlas si te quedas sin trabajo o para vivienda y educación. Cuenta con ellas como refuerzo, no como plan A.',
    'No lo dejes en la cuenta de siempre: si la plata de emergencia se mezcla con la del día a día, se gasta. Cuenta aparte, sin tarjeta débito asociada si puedes.',
  ];

  const notes = [
    'El cálculo parte de una base según tu vínculo laboral (indefinido: 3 meses, término fijo: 4, prestación de servicios o independiente: 6) y ajusta por personas a cargo (+1) y otro ingreso en el hogar (−1), con piso de 3 y techo de 9 meses.',
    'Usa tus gastos ESENCIALES, no tu ingreso: el fondo cubre lo mínimo para vivir mientras te recuperas, no tu nivel de vida completo.',
    'El tiempo para completarlo asume que guardas el mismo monto todos los meses, sin contar rendimientos: en un fondo de emergencia la liquidez importa más que la rentabilidad.',
    'Es una guía de educación financiera, no asesoría personalizada.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(meta),
      label: 'Fondo de emergencia recomendado',
      sub: `**${meses} meses** de tus gastos esenciales (${fmtMoney(gastos)}/mes).${falta > 0 ? ` Te faltan **${fmtMoney(falta)}**.` : ' **Ya lo tienes completo.**'}`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-fondo-de-emergencia-necesito',
  title: '¿Cuánto fondo de emergencia necesito en Colombia? Tu meta 2026',
  h1: '¿Cuánto fondo de emergencia necesito?',
  description:
    'Calcula tu fondo de emergencia según tu contrato en Colombia: 3 meses de gastos si eres indefinido, hasta 6 si facturas por prestación de servicios. Te dice cuánto te falta, en cuántos meses llegas y dónde guardar la plata.',
  intro:
    'En Colombia el tamaño del colchón depende de cómo te pagan: un empleado con contrato indefinido tiene liquidación y cesantías si algo pasa; quien factura por prestación de servicios se queda sin ingreso de un mes a otro y sin red. Esta sala calcula cuántos meses de gastos esenciales necesitas guardados según tu vínculo y tus cargas, cuánto te falta para llegar y dónde conviene tener esa plata: cuenta remunerada, CDT escalonado o un FIC de bajo riesgo.',
  icon: '🛟',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    gastosEsenciales: 3000000,
    tipoVinculo: 'independiente',
    personasACargo: 'si',
    otroIngresoHogar: 'no',
    ahorroActual: 6000000,
    aporteMensual: 700000,
  },
  fields: [
    { id: 'gastosEsenciales', label: 'Gastos esenciales al mes', type: 'number', prefix: '$', required: true, min: 0, format: 'thousands', placeholder: '3.000.000', help: 'Arriendo y administración, mercado, servicios, transporte, salud: lo mínimo para vivir un mes.', group: 'Tus gastos', groupIcon: '🧾' },
    {
      id: 'tipoVinculo', label: '¿Cómo recibes tu ingreso?', type: 'select', default: 'indefinido', recommended: true,
      options: [
        { value: 'indefinido', label: 'Contrato a término indefinido' },
        { value: 'fijo', label: 'Contrato a término fijo' },
        { value: 'independiente', label: 'Prestación de servicios / independiente' },
      ],
      help: 'Define qué tan rápido podrías quedarte sin ingreso y con cuánta red (liquidación, cesantías).', group: 'Tu riesgo', groupIcon: '⚖️',
    },
    { id: 'personasACargo', label: '¿Tienes personas a cargo?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí (hijos, padres)' }], help: 'Más personas que dependen de tu ingreso = colchón más grande.', group: 'Tu riesgo' },
    { id: 'otroIngresoHogar', label: '¿Hay otro ingreso en tu hogar?', type: 'select', default: 'no', options: [{ value: 'no', label: 'No, solo el mío' }, { value: 'si', label: 'Sí (pareja u otro aporte estable)' }], help: 'Un segundo ingreso reduce el riesgo de quedarse en ceros.', group: 'Tu riesgo' },
    { id: 'ahorroActual', label: 'Lo que ya tienes guardado', type: 'number', prefix: '$', default: 0, min: 0, format: 'thousands', placeholder: '6.000.000', help: 'Plata líquida disponible hoy para emergencias (no incluyas cesantías ni inversiones bloqueadas).', group: 'Tu plan', groupIcon: '💪' },
    { id: 'aporteMensual', label: 'Cuánto puedes guardar al mes', type: 'number', prefix: '$', default: 0, min: 0, format: 'thousands', placeholder: '700.000', help: 'Lo que puedes apartar cada mes para completar el fondo.', group: 'Tu plan' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-fondo-emergencia-colombia-meses-gastos', label: 'Fondo de emergencia por meses de gastos' },
    { slug: 'co/calculadora-cdt-colombia-rentabilidad-90-180-360-dias', label: 'Rentabilidad de un CDT' },
    { slug: 'co/calculadora-cesantias-colombia-12-porciento-anual', label: 'Cesantías e intereses' },
    { slug: 'co/calculadora-coste-vida-mensual-colombia-soltero-pareja', label: 'Costo de vida mensual' },
  ],
  howItWorks: `Esta sala dimensiona tu colchón con la variable que más pesa en Colombia: tu tipo de contrato.

1. **La base según tu vínculo.** Con contrato indefinido, 3 meses de gastos alcanzan: tienes preaviso, liquidación y cesantías. A término fijo, 4 meses, porque la renovación no está garantizada. Por prestación de servicios o como independiente, 6 meses: tu ingreso puede cortarse de un día para otro y no hay liquidación que te cubra.
2. **Tus cargas.** Suma un mes si tienes personas a cargo y resta uno si en tu hogar entra otro ingreso estable. El resultado queda entre 3 y 9 meses.
3. **La meta en plata.** Multiplica esos meses por tus gastos esenciales — no por tu ingreso — porque el fondo cubre lo mínimo para vivir, no tu nivel de vida completo.
4. **Cuánto te falta y cuándo llegas.** Resta lo que ya tienes guardado y divide por tu ahorro mensual: esa es tu fecha realista para completarlo.
5. **Dónde tenerlo.** Te sugiere repartir entre cuenta de ahorros remunerada (liquidez inmediata) y CDT escalonados o un FIC de bajo riesgo, y te aclara por qué las cesantías son solo un refuerzo parcial.`,
  faq: [
    { q: '¿Por qué un independiente necesita el doble de fondo que un empleado?', a: 'Porque quien factura por prestación de servicios no tiene preaviso, ni indemnización, ni cesantías: si el contrato no se renueva, el ingreso se corta ese mismo mes. Un empleado con contrato indefinido recibe liquidación y puede retirar cesantías por terminación, lo que le compra tiempo. Por eso la base es 3 meses para indefinido y 6 para independiente.' },
    { q: '¿Las cesantías cuentan como fondo de emergencia?', a: 'Solo parcialmente. Las cesantías equivalen a un salario por año trabajado y están en tu fondo (Porvenir, Protección, FNA), pero la ley solo permite retirarlas al quedar cesante o para vivienda y educación. Sirven como refuerzo si pierdes el empleo, pero no cubren emergencias médicas, daños del carro ni imprevistos estando empleado.' },
    { q: '¿Sobre qué gastos calculo el fondo: ingreso o gastos?', a: 'Sobre tus gastos esenciales: arriendo y administración, mercado, servicios, transporte y salud. Si ganas $4.500.000 pero vives con $3.000.000, tu fondo se calcula sobre los 3 millones. El objetivo es sobrevivir mientras te recuperas, no mantener el mismo nivel de gasto.' },
    { q: '¿Dónde guardo el fondo de emergencia en Colombia?', a: 'La primera capa, en una cuenta de ahorros remunerada de disponibilidad inmediata: varias fintech y bancos digitales pagan cerca del 8% EA sin bloquear la plata. La segunda capa puede ir en CDT escalonados a 90 y 180 días o en un FIC de bajo riesgo, que rinden algo más a cambio de uno a dos días de espera para retirar.' },
    { q: '¿Por qué CDT "escalonados" y no uno solo grande?', a: 'Si metes todo el fondo en un CDT a 360 días y la emergencia llega en el mes dos, no puedes tocarlo: el CDT no permite retiro anticipado. Escalonar — por ejemplo, tres CDT que vencen cada 90 días — hace que siempre tengas un vencimiento cerca, combinando la tasa del CDT (9-9,5% EA en 2026) con liquidez razonable.' },
    { q: '¿Qué cuenta como emergencia real para usar el fondo?', a: 'Perder el ingreso, una urgencia médica que la EPS no cubre a tiempo, un daño grave del carro o de la casa que no puede esperar. No cuentan las vacaciones, el Buen Fin de las tiendas, ni "una inversión que no puedo dejar pasar". Si lo usas, tu primera prioridad después es reponerlo.' },
    { q: '¿Primero armo el fondo o primero pago deudas?', a: 'Primero un mini-fondo de un mes de gastos, para que cualquier imprevisto no te mande de vuelta a la tarjeta al 28% EA. Después ataca las deudas caras (tarjetas, créditos de consumo) y, con eso controlado, completa el fondo hasta tu meta. Deuda cara y fondo grande al tiempo no tiene lógica financiera.' },
    { q: '¿El fondo no pierde plata contra la inflación?', a: 'Un poco, y está bien: su trabajo es estar disponible, no rentar. Aun así, en 2026 una cuenta remunerada al 8% EA o un CDT al 9% le ganan a una inflación cercana al 5%, así que en Colombia puedes tener liquidez sin perder poder de compra — lo imperdonable es dejarlo en una cuenta que paga 0%.' },
  ],
  sources: [
    { name: 'Superintendencia Financiera de Colombia — Tasas de captación (CDT y cuentas)', url: 'https://www.superfinanciera.gov.co/' },
    { name: 'DANE — Índice de Precios al Consumidor (IPC)', url: 'https://www.dane.gov.co/' },
    { name: 'Banco de la República — Estadísticas monetarias', url: 'https://www.banrep.gov.co/' },
  ],
};
