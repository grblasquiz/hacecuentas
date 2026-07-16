const INPUT_MESSAGE_RE = /input|inv[aá]lid|dato|valor|ingres|complet|seleccion|eleg|debe|tiene que|fuera del rango|formato|hora inv[aá]lida|obrigat|preench/i;

export function isCalculatorInputError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { name?: string; code?: string; message?: string };
  return candidate.name === 'InputError'
    || candidate.code === 'INPUT'
    || INPUT_MESSAGE_RE.test(String(candidate.message || ''));
}
