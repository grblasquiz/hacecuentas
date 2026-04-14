/** Salario mínimo vital y móvil Argentina — valor actualizado 2026 (aproximado) */
export interface Inputs { horasSemana: number; }
export interface Outputs { smvmMensual: number; smvmHora: number; smvmDia: number; fechaVigencia: string; }

// Valor aproximado 2026 — actualizado por el Consejo del Salario (CNEPySMVyM)
const SMVM_MENSUAL = 340000; // valor aprox abril 2026
const SMVM_HORA = 1700;      // valor aprox abril 2026
const FECHA = 'abril 2026';

export function salarioMinimo(i: Inputs): Outputs {
  const horas = Number(i.horasSemana) || 40;
  return {
    smvmMensual: SMVM_MENSUAL,
    smvmHora: SMVM_HORA,
    smvmDia: Math.round(SMVM_HORA * (horas / 5)),
    fechaVigencia: FECHA,
  };
}
