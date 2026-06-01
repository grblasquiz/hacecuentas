/**
 * Calculadora de propina y división de cuenta
 */

export interface PropinaInputs {
  cuenta: number;
  porcentajePropina: number;
  cantidadPersonas: number;
  __lang?: string;
}

export interface PropinaOutputs {
  propina: number;
  totalConPropina: number;
  porPersona: number;
  porPersonaSinPropina: number;
  _chart?: any;
}

export function propina(inputs: PropinaInputs): PropinaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCuenta: 'Ingresá el total de la cuenta',
      sliceCuenta: 'Cuenta',
      slicePropina: 'Propina',
      centerLabel: 'Total',
      ariaLabel: 'Composición del total: cuenta más propina',
    },
    en: {
      errorCuenta: 'Enter the total bill amount',
      sliceCuenta: 'Bill',
      slicePropina: 'Tip',
      centerLabel: 'Total',
      ariaLabel: 'Breakdown of total: bill plus tip',
    },
  } as const)[__lang];

  const cuenta = Number(inputs.cuenta);
  const pct = Number(inputs.porcentajePropina) || 10;
  const personas = Math.max(1, Number(inputs.cantidadPersonas) || 1);

  if (!cuenta || cuenta <= 0) throw new Error(T.errorCuenta);

  const propinaMonto = cuenta * (pct / 100);
  const totalConPropina = cuenta + propinaMonto;
  const porPersona = totalConPropina / personas;
  const porPersonaSinPropina = cuenta / personas;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.sliceCuenta, value: Math.round(cuenta) },
      { label: T.slicePropina, value: Math.round(propinaMonto) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalConPropina).toLocaleString(locale),
    centerLabel: T.centerLabel,
    ariaLabel: T.ariaLabel,
  };

  return {
    propina: Math.round(propinaMonto),
    totalConPropina: Math.round(totalConPropina),
    porPersona: Math.round(porPersona),
    porPersonaSinPropina: Math.round(porPersonaSinPropina),
    _chart: chart,
  };
}
