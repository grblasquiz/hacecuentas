/** Valuación DCF simplificada — valor intrínseco por descuento de flujos de caja */

export interface Inputs {
  flujoLibreCajaActual: number;
  tasaCrecimiento5a: number;
  tasaCrecimientoTerminal: number;
  tasaDescuento: number;
  accionesCirculacion: number;
  deudaNeta: number;
}

export interface Outputs {
  valorEmpresa: number;
  valorEquity: number;
  valorPorAccion: number;
  sumFlujosDescontados: number;
  valorTerminal: number;
  formula: string;
  explicacion: string;
}

export function valorIntrinsecoDcf(i: Inputs): Outputs {
  const fcf = Number(i.flujoLibreCajaActual);
  const g5 = Number(i.tasaCrecimiento5a) / 100;
  const gTerminal = Number(i.tasaCrecimientoTerminal) / 100;
  const wacc = Number(i.tasaDescuento) / 100;
  const acciones = Number(i.accionesCirculacion);
  const deuda = Number(i.deudaNeta) || 0;

  if (!fcf || fcf <= 0) throw new Error('Ingresá el flujo libre de caja actual');
  if (!wacc || wacc <= 0) throw new Error('Ingresá la tasa de descuento (WACC)');
  if (!acciones || acciones <= 0) throw new Error('Ingresá las acciones en circulación');
  if (gTerminal >= wacc) throw new Error('La tasa de crecimiento terminal debe ser menor al WACC');

  // Proyectar FCF 5 años con tasa de crecimiento
  let sumFlujosDescontados = 0;
  let fcfProyectado = fcf;

  for (let year = 1; year <= 5; year++) {
    fcfProyectado = fcfProyectado * (1 + g5);
    const descuento = Math.pow(1 + wacc, year);
    sumFlujosDescontados += fcfProyectado / descuento;
  }

  // Valor terminal (Gordon Growth): FCF año 6 / (WACC - g terminal)
  const fcfAnio6 = fcfProyectado * (1 + gTerminal);
  const valorTerminalBruto = fcfAnio6 / (wacc - gTerminal);
  const valorTerminal = valorTerminalBruto / Math.pow(1 + wacc, 5);

  const valorEmpresa = sumFlujosDescontados + valorTerminal;
  const valorEquity = valorEmpresa - deuda;
  const valorPorAccion = valorEquity / acciones;

  const formula = `DCF = Σ FCF/(1+r)^t + Terminal Value = $${valorEmpresa.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  const explicacion = `FCF actual: $${fcf.toLocaleString()}. Crecimiento 5 años: ${(g5 * 100).toFixed(1)}%. Suma flujos descontados (5 años): $${Math.round(sumFlujosDescontados).toLocaleString()}. Valor terminal (crecimiento ${(gTerminal * 100).toFixed(1)}%): $${Math.round(valorTerminal).toLocaleString()} (${((valorTerminal / valorEmpresa) * 100).toFixed(0)}% del valor total). Valor empresa: $${Math.round(valorEmpresa).toLocaleString()}. Deuda neta: $${deuda.toLocaleString()}. Valor equity: $${Math.round(valorEquity).toLocaleString()}. Valor por acción: $${valorPorAccion.toFixed(2)}.`;

  return {
    valorEmpresa: Math.round(valorEmpresa),
    valorEquity: Math.round(valorEquity),
    valorPorAccion: Number(valorPorAccion.toFixed(2)),
    sumFlujosDescontados: Math.round(sumFlujosDescontados),
    valorTerminal: Math.round(valorTerminal),
    formula,
    explicacion,
  };
}
