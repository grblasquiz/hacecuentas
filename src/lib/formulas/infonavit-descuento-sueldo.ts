/**
 * Calculadora de descuento Infonavit sobre el sueldo
 * Descuento aplicado mensualmente al trabajador por crédito de vivienda
 */

export interface Inputs {
  sueldoMensual: number;
  porcentajeDescuento?: number; // en %
  tipoCredito?: 'pesos' | 'vsm';
  cuotaFijaVSM?: number;
}

export interface Outputs {
  descuentoMensual: number;
  sueldoNetoPostInfonavit: number;
  porcentajeEfectivo: number;
  descuentoAnual: number;
  mensaje: string;
}

const SMG_DIARIO_2026 = 278.80;

export function infonavitDescuentoSueldo(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual);
  const factor = Number(i.porcentajeDescuento ?? 30);
  const tipo = i.tipoCredito ?? 'pesos';
  const cuotaVSM = Number(i.cuotaFijaVSM ?? 0);

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo mensual');
  if (factor < 0 || factor > 100) throw new Error('Factor de descuento debe estar entre 0 y 100');

  let descuentoMensual: number;
  if (tipo === 'vsm' && cuotaVSM > 0) {
    // VSM: cuotaVSM * 30 dias * SMG diario
    descuentoMensual = cuotaVSM * 30 * SMG_DIARIO_2026;
  } else {
    descuentoMensual = sueldo * factor / 100;
  }

  const sueldoNetoPostInfonavit = sueldo - descuentoMensual;
  const porcentajeEfectivo = (descuentoMensual / sueldo) * 100;
  const descuentoAnual = descuentoMensual * 12;

  return {
    descuentoMensual: Number(descuentoMensual.toFixed(2)),
    sueldoNetoPostInfonavit: Number(sueldoNetoPostInfonavit.toFixed(2)),
    porcentajeEfectivo: Number(porcentajeEfectivo.toFixed(2)),
    descuentoAnual: Number(descuentoAnual.toFixed(2)),
    mensaje: `Con ${tipo === 'vsm' ? `cuota ${cuotaVSM} VSM` : `factor ${factor}%`}, Infonavit te descuenta $${descuentoMensual.toFixed(2)} y recibís $${sueldoNetoPostInfonavit.toFixed(2)}.`,
  };
}
