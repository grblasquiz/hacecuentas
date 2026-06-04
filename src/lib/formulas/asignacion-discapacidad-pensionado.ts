export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

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
  const monto = acceso ? 282323 : 0;
  const faltaCud = !c;
  const faltaGrado = c && g < 76;
  const _insight = acceso
    ? {
        title: 'Acceso habilitado',
        text: `Cumplís los requisitos: con **CUD** y grado de dependencia del **${g}%** (≥76%) cobrás **$${monto.toLocaleString('es-AR')}/mes**. ANSES ajusta este monto por movilidad, así que revisá el valor cada trimestre.`,
        tone: 'good',
        icon: '♿',
      }
    : {
        title: 'No cumple los requisitos',
        text: faltaCud
          ? 'Falta el **Certificado Único de Discapacidad (CUD)**: es condición obligatoria para esta asignación, sin importar el grado de dependencia.'
          : faltaGrado
            ? `El grado de dependencia declarado (**${g}%**) está por debajo del mínimo de **76%** que exige ANSES para el cobro.`
            : 'No se cumplen los requisitos (CUD vigente + grado de dependencia ≥76%).',
        tone: 'warn',
        icon: '⚠️',
      };
  return {
    monto: '$' + monto.toLocaleString('es-AR'),
    acceso: acceso ? 'Sí' : 'No (requiere CUD + ≥76%)',
    resumen: acceso ? `Acceso habilitado: $${monto.toLocaleString('es-AR')}/mes.` : 'No cumple requisitos.',
    _insight,
  };
}
