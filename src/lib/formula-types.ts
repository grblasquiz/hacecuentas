/**
 * Contrato de tipo central para las fórmulas (#13 del plan de mejoras).
 *
 * Cada archivo en src/lib/formulas/*.ts exporta una función que recibe los
 * inputs del usuario (crudos) y devuelve un objeto de outputs. Históricamente
 * el índice las tipaba como `(inputs: any) => any`. Estos tipos dan un contrato
 * nombrado y documentado que se usa en el boundary de cómputo (calc-compute.ts)
 * sin forzar a las 3400 fórmulas a una firma común (cada una tiene su propio
 * Inputs/Outputs específico, más estricto que `Record<string, unknown>`).
 */

/** Salida de una fórmula: objeto plano de outputs (números, strings, flags). */
export type ComputeResult = Record<string, number | string | boolean | null | undefined>;

/** Firma de una fórmula vista desde el boundary genérico (inputs crudos → outputs). */
export type Formula = (inputs: Record<string, unknown>) => ComputeResult;

/** True si `v` es un ComputeResult válido (objeto no nulo, no array). */
export function isComputeResult(v: unknown): v is ComputeResult {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
