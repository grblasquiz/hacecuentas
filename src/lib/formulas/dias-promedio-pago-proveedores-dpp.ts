/** Días Promedio de Pago a Proveedores (DPP / DPO) */

export interface Inputs {
  cuentasPorPagar: number;
  costoVentas: number;
}

export interface Outputs {
  dpp: number;
  rotacionPagos: number;
  diagnostico: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function diasPromedioPagoProveedoresDpp(i: Inputs): Outputs {
  const cpp = Number(i.cuentasPorPagar);
  const costo = Number(i.costoVentas);

  if (isNaN(cpp) || cpp < 0) throw new Error('Ingresá las cuentas por pagar');
  if (isNaN(costo) || costo <= 0) throw new Error('Ingresá el costo de ventas anual');

  const dpp = (cpp / costo) * 365;
  const rotacionPagos = costo / cpp;

  let diagnostico: string;
  if (dpp < 15) {
    diagnostico = 'Pagás muy rápido. ¿Te dan descuento por pronto pago? Si no, podrías negociar más plazo.';
  } else if (dpp <= 30) {
    diagnostico = 'Plazo de pago estándar. Razonable para la mayoría de las industrias.';
  } else if (dpp <= 60) {
    diagnostico = 'Buena gestión de caja: aprovechás el financiamiento de proveedores.';
  } else if (dpp <= 90) {
    diagnostico = 'Plazo agresivo. Cuidá la relación con proveedores — puede afectar condiciones.';
  } else {
    diagnostico = 'Señal de alerta: plazos excesivos pueden indicar problemas de pago o dañar la cadena.';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Cuentas por pagar: $${fmt.format(cpp)}. Costo de ventas anual: $${fmt.format(costo)}. ` +
    `DPP: ${dpp.toFixed(1)} días. Rotación: ${rotacionPagos.toFixed(2)} veces/año. ` +
    `${diagnostico}`;

  const dppR = Number(dpp.toFixed(1));
  const tone: 'good' | 'warn' | 'neutral' =
    dppR > 90 ? 'warn' : dppR < 15 ? 'warn' : dppR <= 60 ? 'good' : 'neutral';
  const _insight = {
    title: 'Tus plazos de pago',
    text:
      `Tardás en promedio **${dppR} días** en pagar a proveedores y rotás esas cuentas **${rotacionPagos.toFixed(2)} veces al año**. ` +
      diagnostico,
    tone,
    icon: '🧾',
  };

  const segMax = Math.max(120, Math.ceil(dppR / 10) * 10 + 5);
  const _chart = {
    type: 'scale',
    marker: dppR,
    markerLabel: `${dppR} días`,
    min: 0,
    segments: [
      { nombre: 'Muy rápido', max: 15, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Estándar', max: 30, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Buena caja', max: 60, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Agresivo', max: 90, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Alerta', max: segMax, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Días promedio de pago a proveedores: ${dppR} días, en zona ${tone === 'good' ? 'favorable' : tone === 'warn' ? 'a cuidar' : 'estándar'}.`,
  };

  return {
    dpp: dppR,
    rotacionPagos: Number(rotacionPagos.toFixed(2)),
    diagnostico,
    detalle,
    _insight,
    _chart,
  };
}
