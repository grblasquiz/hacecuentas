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

  return {
    dpp: Number(dpp.toFixed(1)),
    rotacionPagos: Number(rotacionPagos.toFixed(2)),
    diagnostico,
    detalle,
  };
}
