/** VPN / NPV: valor presente neto de flujos futuros a tasa de descuento */
export interface Inputs {
  inversionInicial: number;
  flujoAnual: number;
  anios: number;
  tasaDescuento: number; // %
  __lang?: string;
}
export interface Outputs {
  vpn: number;
  vpnSinInversion: number;
  totalFlujos: number;
  viable: string;
  indiceRentabilidad: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function valorPresenteNetoVpn(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errInv: 'Ingresá la inversión inicial',
      errFlujo: 'Ingresá el flujo anual esperado',
      errAnios: 'Ingresá los años del proyecto',
      errTasa: 'La tasa de descuento no puede ser negativa',
      viablePos: 'Proyecto viable: VPN positivo, crea valor.',
      viableNeutro: 'Neutro: VPN cero, el proyecto rinde exactamente la tasa exigida.',
      viableNeg: 'No recomendable: VPN negativo, destruye valor.',
      segDestruye: 'Destruye valor',
      segCrea: 'Crea valor',
      segMuy: 'Muy rentable',
      ariaLabel: 'Escala del índice de rentabilidad: por debajo de 1 el proyecto destruye valor, igual o mayor a 1 crea valor',
      insTitle: '¿Conviene invertir?',
      insTextPos: (vpn: string, ir: string) => `El proyecto genera **$${vpn}** de valor por encima de lo que exigís: por cada $1 invertido recuperás **$${ir}** en valor presente. Conviene avanzar mientras los supuestos se sostengan.`,
      insTextNeutro: () => `El VPN da **exactamente cero**: el proyecto rinde justo la tasa que pediste, ni más ni menos. Es indiferente desde lo financiero; decidí por otros factores.`,
      insTextNeg: (vpn: string, ir: string) => `El proyecto **destruye $${vpn}** de valor a la tasa exigida: por cada $1 invertido recuperás solo **$${ir}** en valor presente. No conviene salvo que bajes la tasa o mejores los flujos.`,
    },
    en: {
      errInv: 'Enter the initial investment',
      errFlujo: 'Enter the expected annual cash flow',
      errAnios: 'Enter the number of years for the project',
      errTasa: 'Discount rate cannot be negative',
      viablePos: 'Viable project: positive NPV, creates value.',
      viableNeutro: 'Neutral: zero NPV, the project returns exactly the required rate.',
      viableNeg: 'Not recommended: negative NPV, destroys value.',
      segDestruye: 'Destroys value',
      segCrea: 'Creates value',
      segMuy: 'Highly profitable',
      ariaLabel: 'Profitability index scale: below 1 the project destroys value, equal to or above 1 creates value',
      insTitle: 'Is it worth investing?',
      insTextPos: (vpn: string, ir: string) => `The project creates **$${vpn}** of value above your required return: for every $1 invested you get back **$${ir}** in present value. Worth pursuing as long as the assumptions hold.`,
      insTextNeutro: () => `NPV is **exactly zero**: the project returns precisely the rate you required, no more, no less. Financially neutral — decide on other factors.`,
      insTextNeg: (vpn: string, ir: string) => `The project **destroys $${vpn}** of value at the required rate: for every $1 invested you only get back **$${ir}** in present value. Not worth it unless you lower the rate or improve the cash flows.`,
    },
  } as const)[__lang];

  const inv = Number(i.inversionInicial);
  const flujo = Number(i.flujoAnual);
  const n = Number(i.anios);
  const r = Number(i.tasaDescuento) / 100;

  if (!inv || inv <= 0) throw new Error(T.errInv);
  if (!flujo) throw new Error(T.errFlujo);
  if (!n || n <= 0) throw new Error(T.errAnios);
  if (r < 0) throw new Error(T.errTasa);

  let vpnSinInversion = 0;
  for (let t = 1; t <= n; t++) {
    vpnSinInversion += flujo / Math.pow(1 + r, t);
  }
  const vpn = vpnSinInversion - inv;
  const totalFlujos = flujo * n;
  const ir = vpnSinInversion / inv;

  let viable = '';
  if (vpn > 0) viable = T.viablePos;
  else if (vpn === 0) viable = T.viableNeutro;
  else viable = T.viableNeg;

  const resumen = __lang === 'en'
    ? `The NPV is ${vpn >= 0 ? '+' : ''}${Math.round(vpn).toLocaleString()} at a discount rate of ${(r * 100).toFixed(1)}%.`
    : `El VPN es ${vpn >= 0 ? '+' : ''}${Math.round(vpn).toLocaleString()} a una tasa del ${(r * 100).toFixed(1)}%.`;

  const irVal = Number(ir.toFixed(3));
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const vpnAbsFmt = Math.abs(Math.round(vpn)).toLocaleString(locale);
  const irFmt = irVal.toFixed(2);
  const insight = {
    title: T.insTitle,
    text: vpn > 0 ? T.insTextPos(vpnAbsFmt, irFmt) : (vpn === 0 ? T.insTextNeutro() : T.insTextNeg(vpnAbsFmt, irFmt)),
    tone: vpn > 0 ? 'good' : (vpn === 0 ? 'neutral' : 'warn'),
    icon: '📊',
  };
  const chart = {
    type: 'scale' as const,
    marker: irVal,
    markerLabel: __lang === 'en'
      ? 'Profitability index: ' + irVal.toFixed(2)
      : 'Índice de rentabilidad: ' + irVal.toFixed(2),
    min: 0,
    unit: '',
    segments: [
      { nombre: T.segDestruye, max: 1, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.segCrea, max: 1.5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.segMuy, max: Math.max(2.5, Math.ceil(irVal) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: T.ariaLabel,
  };

  return {
    vpn: Math.round(vpn),
    vpnSinInversion: Math.round(vpnSinInversion),
    totalFlujos: Math.round(totalFlujos),
    viable,
    indiceRentabilidad: irVal,
    resumen,
    _insight: insight,
    _chart: chart,
  };
}
