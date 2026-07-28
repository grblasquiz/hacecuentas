/** DSO — Days Sales Outstanding (días promedio de cobro) */
export interface Inputs { cuentasPorCobrar: number; ventasAnuales: number; }
export interface Outputs {
  dso: number;
  ventasDiarias: number;
  clasificacion: string;
  _insight?: any;
  _chart?: any;
}

export function dso(i: Inputs): Outputs {
  const ctas = Number(i.cuentasPorCobrar);
  const ventas = Number(i.ventasAnuales);
  if (!Number.isFinite(ctas) || ctas < 0) throw new Error('Ingresá cuentas por cobrar');
  if (!Number.isFinite(ventas) || ventas <= 0) throw new Error('Ingresá ventas anuales');

  const ventasDiarias = ventas / 365;
  const dsoValor = ctas / ventasDiarias;

  let clasif = '';
  if (dsoValor < 30) clasif = 'Excelente — cobrás muy rápido.';
  else if (dsoValor < 60) clasif = 'Bueno — típico de B2B sano.';
  else if (dsoValor < 90) clasif = 'Regular — revisá plazos con clientes.';
  else clasif = 'Crítico — hay que mejorar la cobranza.';

  const tone = dsoValor < 60 ? 'good' : dsoValor < 90 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Días de cobro (DSO)',
    text: `En promedio tardás **${dsoValor.toFixed(1)} días** en cobrar una venta. Con ventas diarias de $${Math.round(ventasDiarias).toLocaleString()}, tenés cerca de **$${Math.round(dsoValor * ventasDiarias).toLocaleString()}** inmovilizados en cuentas por cobrar. ${dsoValor < 30 ? 'Cobranza excelente: el efectivo entra rápido.' : dsoValor < 60 ? 'Plazo sano y típico de B2B.' : dsoValor < 90 ? 'Plazo algo largo: revisá condiciones con clientes.' : 'Cobranza lenta: estás financiando a tus clientes y comprometés tu caja.'}`,
    tone,
    icon: dsoValor < 60 ? '💰' : '⏳',
  };
  const _chart = {
    type: 'scale',
    marker: Number(dsoValor.toFixed(1)),
    markerLabel: `${dsoValor.toFixed(0)} d`,
    min: 0,
    segments: [
      { nombre: 'Excelente', max: 30, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Bueno', max: 60, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Regular', max: 90, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Crítico', max: Math.max(120, Math.ceil(dsoValor) + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `DSO de ${dsoValor.toFixed(1)} días sobre una escala de cobranza de 0 a 120 días.`,
  };
  return {
    dso: Number(dsoValor.toFixed(1)),
    ventasDiarias: Math.round(ventasDiarias),
    clasificacion: clasif,
    _insight,
    _chart,
  };
}
