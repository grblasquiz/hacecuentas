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
  _insight?: any;
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
      insightTitle: 'Tu propina y el total',
    },
    en: {
      errorCuenta: 'Enter the total bill amount',
      sliceCuenta: 'Bill',
      slicePropina: 'Tip',
      centerLabel: 'Total',
      ariaLabel: 'Breakdown of total: bill plus tip',
      insightTitle: 'Your tip and total',
    },
  } as const)[__lang];

  const cuenta = Number(inputs.cuenta);
  const pct = (Number.isFinite(Number(inputs.porcentajePropina)) ? Number(inputs.porcentajePropina) : 10);
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

  const fmtMoney = (n: number) => '$' + Math.round(n).toLocaleString(locale);
  const pctTxt = Number.isInteger(pct) ? `${pct}` : pct.toFixed(1);
  const insightText = __lang === 'en'
    ? (personas > 1
        ? `A **${pctTxt}%** tip adds **${fmtMoney(propinaMonto)}**. The total is **${fmtMoney(totalConPropina)}**, or **${fmtMoney(porPersona)}** per person split ${personas} ways.`
        : `A **${pctTxt}%** tip adds **${fmtMoney(propinaMonto)}**, bringing the total to **${fmtMoney(totalConPropina)}**.`)
    : (personas > 1
        ? `Con **${pctTxt}%** de propina sumás **${fmtMoney(propinaMonto)}**. El total queda en **${fmtMoney(totalConPropina)}**, o **${fmtMoney(porPersona)}** por persona entre ${personas}.`
        : `Con **${pctTxt}%** de propina sumás **${fmtMoney(propinaMonto)}**, llevando el total a **${fmtMoney(totalConPropina)}**.`);

  const _insight = {
    title: T.insightTitle,
    text: insightText,
    tone: (pct >= 18 ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '🍽️',
  };

  return {
    propina: Math.round(propinaMonto),
    totalConPropina: Math.round(totalConPropina),
    porPersona: Math.round(porPersona),
    porPersonaSinPropina: Math.round(porPersonaSinPropina),
    _chart: chart,
    _insight,
  };
}
