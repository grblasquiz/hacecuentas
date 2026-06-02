/** Período de recupero de una inversión (payback) */

export interface Inputs {
  inversionInicial: number;
  flujoMensual: number;
}

export interface Outputs {
  paybackMeses: number;
  paybackAnios: number;
  retornoAnual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function paybackInversion(i: Inputs): Outputs {
  const inversion = Number(i.inversionInicial);
  const flujo = Number(i.flujoMensual);

  if (isNaN(inversion) || inversion <= 0) throw new Error('Ingresá la inversión inicial');
  if (isNaN(flujo) || flujo <= 0) throw new Error('Ingresá el flujo de caja mensual neto (debe ser positivo)');

  const paybackMeses = inversion / flujo;
  const paybackAnios = paybackMeses / 12;
  const retornoAnual = ((flujo * 12) / inversion) * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let evaluacion: string;
  if (paybackMeses <= 6) evaluacion = 'Excelente — recupero muy rápido.';
  else if (paybackMeses <= 12) evaluacion = 'Muy bueno — se paga en menos de un año.';
  else if (paybackMeses <= 24) evaluacion = 'Bueno — recupero en 1-2 años.';
  else if (paybackMeses <= 36) evaluacion = 'Aceptable — evaluá alternativas.';
  else evaluacion = 'Largo — considerá el riesgo y el costo de oportunidad.';

  const detalle =
    `Inversión de $${fmt.format(inversion)} con flujo neto de $${fmt.format(flujo)}/mes: ` +
    `se recupera en ${paybackMeses.toFixed(1)} meses (${paybackAnios.toFixed(1)} años). ` +
    `Retorno anualizado: ${retornoAnual.toFixed(1)}%. ${evaluacion}`;

  const tone = paybackMeses <= 12 ? 'good' : paybackMeses <= 36 ? 'neutral' : 'warn';

  return {
    paybackMeses: Number(paybackMeses.toFixed(1)),
    paybackAnios: Number(paybackAnios.toFixed(1)),
    retornoAnual: Number(retornoAnual.toFixed(1)),
    detalle,
    _insight: {
      title: 'Cuándo recuperás la plata',
      text: `Recuperás los **$${fmt.format(inversion)}** en **${paybackMeses.toFixed(1)} meses** (${paybackAnios.toFixed(1)} años), con un **retorno anualizado del ${retornoAnual.toFixed(1)}%**. ${evaluacion} Ojo: el payback no descuenta inflación ni costo de oportunidad, sumalos para decidir.`,
      tone,
      icon: '⏱️',
    },
    _chart: {
      type: 'scale' as const,
      marker: Number(paybackMeses.toFixed(1)),
      markerLabel: `${paybackMeses.toFixed(1)} meses`,
      min: 0,
      segments: [
        { nombre: 'Excelente', max: 6, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Muy bueno', max: 12, color: '#65a30d', colorDark: '#84cc16' },
        { nombre: 'Bueno', max: 24, color: '#ca8a04', colorDark: '#eab308' },
        { nombre: 'Aceptable', max: 36, color: '#ea580c', colorDark: '#f97316' },
        { nombre: 'Largo', max: Math.max(60, Math.ceil(paybackMeses) + 12), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: 'Escala del período de recupero en meses, desde excelente (rápido) hasta largo.',
    },
  };
}
