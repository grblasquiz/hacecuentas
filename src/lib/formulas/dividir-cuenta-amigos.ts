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
  _chart?: any;
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

  const slices = [
    { label: 'Cuenta', value: Math.round(cuenta) },
    { label: 'Propina', value: Math.round(propinaMonto) },
  ];
  if (extras > 0) slices.push({ label: 'Gastos extra', value: Math.round(extras) });
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + Math.round(totalConPropina).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del total a dividir: cuenta, propina y gastos extra',
  };

  return {
    porPersona: Math.ceil(porPersona),
    totalConPropina: Math.round(totalConPropina),
    propinaMonto: Math.round(propinaMonto),
    _chart: chart,
  };
}
