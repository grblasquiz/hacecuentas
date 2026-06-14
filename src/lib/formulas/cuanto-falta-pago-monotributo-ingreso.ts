export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

export function cuantoFaltaPagoMonotributoIngreso(i: Inputs): Outputs {
  // El monotributo vence el día 20 de cada mes (Ley 24.977). No se pide la fecha:
  // calculamos el próximo día 20 desde hoy con new Date().
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Días de gracia que el banco adelanta el débito (opcional). '' / null → 0.
  const rawGracia = i.dias;
  const gracia = (rawGracia === '' || rawGracia === null || rawGracia === undefined)
    ? 0
    : Math.max(0, Math.min(10, Math.round(Number(rawGracia) || 0)));

  // Próximo vencimiento = día 20 de este mes; si ya pasó, día 20 del mes siguiente.
  let venc = new Date(hoy.getFullYear(), hoy.getMonth(), 20);
  if (venc.getTime() < hoy.getTime()) {
    venc = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 20);
  }

  const diff = Math.round((venc.getTime() - hoy.getTime()) / 86400000);
  // Días efectivos hasta que tenés que tener la plata (descontando la gracia del banco).
  const diasEfectivos = Math.max(0, diff - gracia);

  const fechaTxt = `${venc.getDate()} de ${MESES[venc.getMonth()]} de ${venc.getFullYear()}`;

  let _insight;
  let estado: string;
  if (diff === 0) {
    estado = `El monotributo vence HOY (${fechaTxt}).`;
    _insight = { title: 'Vence hoy', text: `El monotributo **vence hoy, ${fechaTxt}**. Pagalo antes de la medianoche por VEP, homebanking o débito para no entrar en mora.`, tone: 'warn', icon: '🚨' };
  } else if (diasEfectivos === 0 && gracia > 0) {
    estado = `Faltan ${diff} día${diff === 1 ? '' : 's'}, pero con la gracia del banco tenés que pagar ya.`;
    _insight = { title: 'Pagá ahora', text: `El vencimiento es el **${fechaTxt}** (faltan ${diff} día${diff === 1 ? '' : 's'}), pero como tu banco debita ${gracia} día${gracia === 1 ? '' : 's'} antes, necesitás tener los fondos **hoy mismo**.`, tone: 'warn', icon: '⏰' };
  } else if (diff <= 3) {
    estado = `Faltan ${diff} día${diff === 1 ? '' : 's'} para el vencimiento (${fechaTxt}).`;
    _insight = { title: 'Se viene el vencimiento', text: `Quedan solo **${diff} día${diff === 1 ? '' : 's'}** para el pago del monotributo (vence el ${fechaTxt}). Pagá ya por VEP o débito para evitar intereses resarcitorios.`, tone: 'warn', icon: '⏰' };
  } else if (diff <= 7) {
    estado = `Faltan ${diff} días para el vencimiento (${fechaTxt}).`;
    _insight = { title: 'Última semana', text: `Te quedan **${diff} días** hasta el vencimiento del ${fechaTxt}. Andá organizando el pago para no llegar al límite.`, tone: 'warn', icon: '🗓️' };
  } else {
    estado = `Faltan ${diff} días para el vencimiento (${fechaTxt}).`;
    _insight = { title: 'Con margen de sobra', text: `Te quedan **${diff} días** para pagar el monotributo (vence el ${fechaTxt}). Vencimiento general el día **20 de cada mes**: agendalo para no comerte el recargo por mora.`, tone: 'good', icon: '✅' };
  }

  // Gauge de urgencia dentro del ciclo mensual de pago.
  const _chart = {
    type: 'scale',
    marker: Math.min(diff, 31),
    markerLabel: `${diff} día${diff === 1 ? '' : 's'}`,
    min: 0,
    segments: [
      { nombre: 'Urgente', max: 3, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Atención', max: 7, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Con margen', max: 31, color: '#22c55e', colorDark: '#4ade80' }
    ],
    ariaLabel: `Faltan ${diff} días para el vencimiento del monotributo`
  };

  const resultado = diff === 0 ? 'Vence hoy' : `${diff} día${diff === 1 ? '' : 's'}`;

  return {
    resultado,
    vencimiento: fechaTxt,
    resumen: estado,
    _insight,
    _chart
  };
}
