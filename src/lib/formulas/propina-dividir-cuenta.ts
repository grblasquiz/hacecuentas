/** Dividir cuenta con propina */
export interface Inputs { totalCuenta: number; personas: number; propinaPct: number; }
export interface Outputs { porPersona: number; propina: number; totalConPropina: number; mensaje: string; }

export function propinaDividirCuenta(i: Inputs): Outputs {
  const total = Number(i.totalCuenta);
  const personas = Number(i.personas) || 1;
  const pct = Number(i.propinaPct) || 10;
  if (!total || total <= 0) throw new Error('Ingresá el total de la cuenta');

  const propina = Math.round(total * pct / 100);
  const totalConPropina = total + propina;
  const porPersona = Math.ceil(totalConPropina / personas);

  return {
    porPersona, propina, totalConPropina,
    mensaje: `Cuenta: $${total.toLocaleString()} + ${pct}% propina ($${propina.toLocaleString()}) = $${totalConPropina.toLocaleString()}. Cada uno: $${porPersona.toLocaleString()}.`
  };
}