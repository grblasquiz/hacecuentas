/**
 * Calculadora de propina y división de cuenta
 */

export interface PropinaInputs {
  cuenta: number;
  porcentajePropina: number;
  cantidadPersonas: number;
}

export interface PropinaOutputs {
  propina: number;
  totalConPropina: number;
  porPersona: number;
  porPersonaSinPropina: number;
}

export function propina(inputs: PropinaInputs): PropinaOutputs {
  const cuenta = Number(inputs.cuenta);
  const pct = Number(inputs.porcentajePropina) || 10;
  const personas = Math.max(1, Number(inputs.cantidadPersonas) || 1);

  if (!cuenta || cuenta <= 0) throw new Error('Ingresá el total de la cuenta');

  const propinaMonto = cuenta * (pct / 100);
  const totalConPropina = cuenta + propinaMonto;
  const porPersona = totalConPropina / personas;
  const porPersonaSinPropina = cuenta / personas;

  return {
    propina: Math.round(propinaMonto),
    totalConPropina: Math.round(totalConPropina),
    porPersona: Math.round(porPersona),
    porPersonaSinPropina: Math.round(porPersonaSinPropina),
  };
}
