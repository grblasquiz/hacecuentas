import { ANSES_2026 } from '../data/anses-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

/**
 * Pensión No Contributiva (PNC) por invalidez — ANSES / ANDIS.
 * Ley 13.478, Decreto 432/97. Requiere CUD + grado de invalidez ≥76%.
 * Monto = 70% del haber mínimo jubilatorio garantizado.
 * agosto 2026: 70% del haber mínimo vigente (sin bono extraordinario).
 * Fuente: ANSES — PNC por invalidez (movilidad Ley 27.609, IPC INDEC).
 * ANSES actualiza por movilidad mensual (IPC) — revisar cada mes/trimestre.
 */
const HABER_MINIMO_JUBILATORIO = ANSES_2026.haberMinimo;
const PCT_PNC = 0.70;                     // 70% del haber mínimo (Decreto 432/97)
export function asignacionDiscapacidadPensionado(i: Inputs): Outputs {
  const c = String(i.cdu || 'no') === 'si';
  const g = Number(i.gradoDeps) || 0;
  const acceso = c && g >= 76;
  const monto = acceso ? Math.round(HABER_MINIMO_JUBILATORIO * PCT_PNC) : 0;
  const faltaCud = !c;
  const faltaGrado = c && g < 76;
  const _insight = acceso
    ? {
        title: 'Acceso habilitado',
        text: `Cumplís los requisitos: con **CUD** y grado de invalidez del **${g}%** (≥76%) cobrás la PNC por invalidez = **70% del haber mínimo** = **$${monto.toLocaleString('es-AR')}/mes** (${ANSES_2026.periodo}, sin contar el bono extraordinario cuando se dispone). ANSES ajusta este monto por movilidad mensual.`,
        tone: 'good',
        icon: '♿',
      }
    : {
        title: 'No cumple los requisitos',
        text: faltaCud
          ? 'Falta el **Certificado Único de Discapacidad (CUD)**: es condición obligatoria para esta asignación, sin importar el grado de invalidez.'
          : faltaGrado
            ? `El grado de invalidez declarado (**${g}%**) está por debajo del mínimo de **76%** que exige ANSES para el cobro.`
            : 'No se cumplen los requisitos (CUD vigente + grado de invalidez ≥76%).',
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
