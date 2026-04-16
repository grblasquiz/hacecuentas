/** Dividir la cuenta del restaurante entre amigos */
export interface Inputs {
  totalCuenta: number;
  cantidadPersonas: number;
  propinaPct?: number;
  gastosExtra?: number;
}
export interface Outputs {
  porPersona: number;
  totalConPropina: number;
  propinaMonto: number;
}

export function dividirCuentaAmigos(i: Inputs): Outputs {
  const cuenta = Number(i.totalCuenta);
  const personas = Number(i.cantidadPersonas);
  const propPct = Number(i.propinaPct) || 0;
  const extras = Number(i.gastosExtra) || 0;

  if (!cuenta || cuenta <= 0) throw new Error('Ingresá el total de la cuenta');
  if (!personas || personas < 1) throw new Error('Mínimo 1 persona');
  if (propPct < 0 || propPct > 100) throw new Error('Porcentaje de propina inválido');

  const propinaMonto = cuenta * (propPct / 100);
  const totalConPropina = cuenta + propinaMonto + extras;
  const porPersona = totalConPropina / personas;

  return {
    porPersona: Math.ceil(porPersona),
    totalConPropina: Math.round(totalConPropina),
    propinaMonto: Math.round(propinaMonto),
  };
}
