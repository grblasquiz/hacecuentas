/** Tasa de abandono de carrito e ingreso perdido */

export interface Inputs {
  visitasCheckout: number;
  comprasCompletadas: number;
  ticketPromedio: number;
}

export interface Outputs {
  tasaAbandono: number;
  ingresoPerdido: number;
  tasaConversion: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function tasaAbandonoCarrito(i: Inputs): Outputs {
  const visitas = Number(i.visitasCheckout);
  const compras = Number(i.comprasCompletadas);
  const ticket = Number(i.ticketPromedio);

  if (isNaN(visitas) || visitas < 1) throw new Error('Ingresá las visitas al checkout');
  if (isNaN(compras) || compras < 0) throw new Error('Las compras no pueden ser negativas');
  if (compras > visitas) throw new Error('Las compras no pueden ser más que las visitas al checkout');
  if (isNaN(ticket) || ticket <= 0) throw new Error('Ingresá el ticket promedio');

  const abandonados = visitas - compras;
  const tasaAbandono = (abandonados / visitas) * 100;
  const tasaConversion = (compras / visitas) * 100;
  const ingresoPerdido = abandonados * ticket;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Estimar recuperación potencial (10% de abandonos)
  const recuperacion10 = Math.round(abandonados * 0.10);
  const ingresoRecuperable = recuperacion10 * ticket;

  let evaluacion: string;
  if (tasaAbandono <= 55) evaluacion = 'Excelente — muy por debajo del promedio (70%).';
  else if (tasaAbandono <= 70) evaluacion = 'Normal — dentro del promedio de la industria.';
  else if (tasaAbandono <= 80) evaluacion = 'Alto — hay oportunidades de mejora importantes.';
  else evaluacion = 'Muy alto — revisá urgente tu proceso de checkout.';

  const detalle =
    `De ${visitas} personas que iniciaron el checkout, ${compras} compraron y ${abandonados} abandonaron. ` +
    `Tasa de abandono: ${tasaAbandono.toFixed(1)}%. Ingreso perdido: $${fmt.format(ingresoPerdido)}. ` +
    `Si recuperás el 10% de los abandonos (${recuperacion10} ventas), ganás $${fmt.format(ingresoRecuperable)} extra. ` +
    evaluacion;

  let insightTone: 'good' | 'warn' | 'neutral';
  if (tasaAbandono <= 55) insightTone = 'good';
  else if (tasaAbandono <= 70) insightTone = 'neutral';
  else insightTone = 'warn';

  const insightText = insightTone === 'good'
    ? `Tu abandono del **${tasaAbandono.toFixed(1)}%** está por debajo del promedio de industria (~70%): convertís muy bien. Aun así, recuperar el 10% de los ${abandonados} carritos suma **$${fmt.format(ingresoRecuperable)}**.`
    : insightTone === 'neutral'
    ? `Con **${tasaAbandono.toFixed(1)}%** de abandono estás en el promedio de la industria. Dejás **$${fmt.format(ingresoPerdido)}** sobre la mesa; recuperar el 10% serían **$${fmt.format(ingresoRecuperable)}** extra.`
    : `Un abandono del **${tasaAbandono.toFixed(1)}%** es alto: perdés **$${fmt.format(ingresoPerdido)}** en ${abandonados} carritos. Revisá costos de envío, pasos del checkout y métodos de pago; recuperar el 10% ya son **$${fmt.format(ingresoRecuperable)}**.`;

  const _insight = {
    title: 'Qué significa este resultado',
    text: insightText,
    tone: insightTone,
    icon: '🛒',
  };

  const _chart = {
    type: 'scale' as const,
    marker: Number(tasaAbandono.toFixed(1)),
    markerLabel: `${tasaAbandono.toFixed(1)}% abandono`,
    min: 0,
    segments: [
      { nombre: 'Excelente', max: 55, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Promedio', max: 70, color: '#3b82f6', colorDark: '#60a5fa' },
      { nombre: 'Alto', max: 80, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Muy alto', max: 100, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Tasa de abandono de carrito del ${tasaAbandono.toFixed(1)}% frente a las zonas de la industria.`,
  };

  return {
    tasaAbandono: Number(tasaAbandono.toFixed(1)),
    ingresoPerdido: Math.round(ingresoPerdido),
    tasaConversion: Number(tasaConversion.toFixed(1)),
    detalle,
    _insight,
    _chart,
  };
}
