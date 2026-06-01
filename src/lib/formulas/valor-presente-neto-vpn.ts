/** VPN / NPV: valor presente neto de flujos futuros a tasa de descuento */
export interface Inputs {
  inversionInicial: number;
  flujoAnual: number;
  anios: number;
  tasaDescuento: number; // %
}
export interface Outputs {
  vpn: number;
  vpnSinInversion: number;
  totalFlujos: number;
  viable: string;
  indiceRentabilidad: number;
  resumen: string;
  _chart?: any;
}

export function valorPresenteNetoVpn(i: Inputs): Outputs {
  const inv = Number(i.inversionInicial);
  const flujo = Number(i.flujoAnual);
  const n = Number(i.anios);
  const r = Number(i.tasaDescuento) / 100;

  if (!inv || inv <= 0) throw new Error('Ingresá la inversión inicial');
  if (!flujo) throw new Error('Ingresá el flujo anual esperado');
  if (!n || n <= 0) throw new Error('Ingresá los años del proyecto');
  if (r < 0) throw new Error('La tasa de descuento no puede ser negativa');

  let vpnSinInversion = 0;
  for (let t = 1; t <= n; t++) {
    vpnSinInversion += flujo / Math.pow(1 + r, t);
  }
  const vpn = vpnSinInversion - inv;
  const totalFlujos = flujo * n;
  const ir = vpnSinInversion / inv;

  let viable = '';
  if (vpn > 0) viable = 'Proyecto viable: VPN positivo, crea valor.';
  else if (vpn === 0) viable = 'Neutro: VPN cero, el proyecto rinde exactamente la tasa exigida.';
  else viable = 'No recomendable: VPN negativo, destruye valor.';

  const resumen = `El VPN es ${vpn >= 0 ? '+' : ''}${Math.round(vpn).toLocaleString()} a una tasa del ${(r * 100).toFixed(1)}%.`;

  const irVal = Number(ir.toFixed(3));
  const chart = {
    type: 'scale' as const,
    marker: irVal,
    markerLabel: 'Índice de rentabilidad: ' + irVal.toFixed(2),
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Destruye valor', max: 1, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Crea valor', max: 1.5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Muy rentable', max: Math.max(2.5, Math.ceil(irVal) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala del índice de rentabilidad: por debajo de 1 el proyecto destruye valor, igual o mayor a 1 crea valor',
  };

  return {
    vpn: Math.round(vpn),
    vpnSinInversion: Math.round(vpnSinInversion),
    totalFlujos: Math.round(totalFlujos),
    viable,
    indiceRentabilidad: irVal,
    resumen,
    _chart: chart,
  };
}
