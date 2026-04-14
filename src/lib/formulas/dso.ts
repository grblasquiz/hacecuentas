/** DSO — Days Sales Outstanding (días promedio de cobro) */
export interface Inputs { cuentasPorCobrar: number; ventasAnuales: number; }
export interface Outputs {
  dso: number;
  ventasDiarias: number;
  clasificacion: string;
}

export function dso(i: Inputs): Outputs {
  const ctas = Number(i.cuentasPorCobrar);
  const ventas = Number(i.ventasAnuales);
  if (!ctas || ctas < 0) throw new Error('Ingresá cuentas por cobrar');
  if (!ventas || ventas <= 0) throw new Error('Ingresá ventas anuales');

  const ventasDiarias = ventas / 365;
  const dsoValor = ctas / ventasDiarias;

  let clasif = '';
  if (dsoValor < 30) clasif = 'Excelente — cobrás muy rápido.';
  else if (dsoValor < 60) clasif = 'Bueno — típico de B2B sano.';
  else if (dsoValor < 90) clasif = 'Regular — revisá plazos con clientes.';
  else clasif = 'Crítico — hay que mejorar la cobranza.';

  return {
    dso: Number(dsoValor.toFixed(1)),
    ventasDiarias: Math.round(ventasDiarias),
    clasificacion: clasif,
  };
}
