export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

/**
 * Asignación Familiar por Hijo con Discapacidad (Pensionado) — ANSES.
 * Requiere CUD + grado de dependencia ≥76%.
 * Monto abril 2026 (primer rango de ingresos): $222.511.
 * Fuente: ANSES Montos-AAFF-04-2026.pdf
 * ANSES actualiza por movilidad mensual (IPC) — revisar cada trimestre.
 */
export function asignacionDiscapacidadPensionado(i: Inputs): Outputs {
  const c = String(i.cdu || 'no') === 'si';
  const g = Number(i.gradoDeps) || 0;
  const acceso = c && g >= 76;
  const monto = acceso ? 222511 : 0;
  return {
    monto: '$' + monto.toLocaleString('es-AR'),
    acceso: acceso ? 'Sí' : 'No (requiere CUD + ≥76%)',
    resumen: acceso ? `Acceso habilitado: $${monto.toLocaleString('es-AR')}/mes.` : 'No cumple requisitos.',
  };
}
