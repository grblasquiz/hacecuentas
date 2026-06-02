/**
 * Calculadora de costo de placas de auto por estado México
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  estado?: string;
  tipoTramite?: 'alta-nuevo' | 'canje-trianual' | 'refrendo' | 'cambio-propietario';
  valorAuto?: number;
  // retro-compat
  tipoVehiculo?: string;
}

export interface Outputs {
  costoTotal: number;
  derechos: number;
  placasCosto: number;
  tarjetaCirculacion: number;
  desglose: Record<string, number>;
  tramiteDuracion: string;
  estadoAplicado: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

const COSTOS_PLACAS: Record<string, { placas: number; tarjeta: number; derechos: number; duracion: string }> = {
  cdmx:        { placas: 950,  tarjeta: 280, derechos: 320, duracion: '1 a 3 días' },
  edomex:      { placas: 1100, tarjeta: 310, derechos: 310, duracion: '2 a 5 días' },
  jalisco:     { placas: 820,  tarjeta: 230, derechos: 180, duracion: '1 a 2 días' },
  'nuevo-leon':{ placas: 1400, tarjeta: 330, derechos: 310, duracion: '1 a 4 días' },
  nuevoleon:   { placas: 1400, tarjeta: 330, derechos: 310, duracion: '1 a 4 días' },
  puebla:      { placas: 950,  tarjeta: 260, derechos: 240, duracion: '2 a 5 días' },
  queretaro:   { placas: 900,  tarjeta: 260, derechos: 220, duracion: '1 a 3 días' },
  guanajuato:  { placas: 880,  tarjeta: 250, derechos: 220, duracion: '1 a 3 días' },
};

export function placasAutoMx(i: Inputs): Outputs {
  const estadoInput = (i.estado ?? 'cdmx').toLowerCase();
  const tramite = i.tipoTramite ?? (i.tipoVehiculo as any) ?? 'refrendo';
  const valorAuto = Number(i.valorAuto ?? 0);

  const estadoKey = COSTOS_PLACAS[estadoInput] ? estadoInput : 'cdmx';
  const base = COSTOS_PLACAS[estadoKey];

  // Factor por tipo de trámite
  let factorPlacas = 1;
  let factorTarjeta = 1;
  let factorDerechos = 1;
  switch (tramite) {
    case 'alta-nuevo':
      factorPlacas = 1; factorTarjeta = 1; factorDerechos = 1.2;
      break;
    case 'canje-trianual':
      factorPlacas = 1; factorTarjeta = 0.6; factorDerechos = 0.8;
      break;
    case 'refrendo':
      factorPlacas = 0; factorTarjeta = 0; factorDerechos = 1;
      break;
    case 'cambio-propietario':
      factorPlacas = 0.3; factorTarjeta = 1; factorDerechos = 1;
      break;
    // retro-compat
    case 'transporte' as any:
      factorPlacas = 1.8; factorDerechos = 1.8;
      break;
    case 'demostracion' as any:
      factorPlacas = 1.3; factorDerechos = 1.3;
      break;
  }

  // Algunos estados agregan derechos por valor de factura (~0.2%)
  const derechosPorValor = valorAuto > 0 ? valorAuto * 0.002 : 0;

  const placasCosto = Number((base.placas * factorPlacas).toFixed(2));
  const tarjetaCirculacion = Number((base.tarjeta * factorTarjeta).toFixed(2));
  const derechos = Number((base.derechos * factorDerechos + derechosPorValor).toFixed(2));
  const costoTotal = Number((placasCosto + tarjetaCirculacion + derechos).toFixed(2));

  const estadoNombre = estadoKey === 'cdmx' ? 'CDMX' : estadoKey === 'edomex' ? 'Edomex' : estadoKey.charAt(0).toUpperCase() + estadoKey.slice(1).replace('-', ' ');
  const fmtMx = (n: number) => Math.round(n).toLocaleString('es-MX');
  const componentes = [
    { label: 'Placas', value: placasCosto },
    { label: 'Tarjeta de circulación', value: tarjetaCirculacion },
    { label: 'Derechos vehiculares', value: derechos },
  ];
  const mayor = componentes.reduce((a, b) => (b.value > a.value ? b : a));
  const _insight = {
    title: 'Costo del trámite',
    text: `El trámite de ${tramite.replace('-', ' ')} en **${estadoNombre}** cuesta aproximadamente **$${fmtMx(costoTotal)} MXN**. El rubro más alto son los **${mayor.label.toLowerCase()}** ($${fmtMx(mayor.value)})${derechosPorValor > 0 ? `, ya incluyendo el extra por valor de factura ($${fmtMx(derechosPorValor)})` : ''}. Trámite listo en ${base.duracion}.`,
    tone: 'neutral',
    icon: '🚗',
  };
  const _chart = {
    type: 'doughnut',
    slices: componentes.filter((c) => c.value > 0).map((c) => ({ label: c.label, value: c.value })),
    prefix: '$',
    centerValue: `$${fmtMx(costoTotal)}`,
    centerLabel: 'Total MXN',
    ariaLabel: `Desglose del costo de placas en ${estadoNombre}: placas, tarjeta de circulación y derechos vehiculares, sumando $${fmtMx(costoTotal)} MXN.`,
  };
  return {
    costoTotal,
    derechos,
    placasCosto,
    tarjetaCirculacion,
    desglose: {
      placas: placasCosto,
      'tarjeta de circulación': tarjetaCirculacion,
      'derechos vehiculares': derechos,
    },
    tramiteDuracion: base.duracion,
    estadoAplicado: estadoKey,
    mensaje: `Trámite ${tramite} en ${estadoKey}: $${costoTotal.toFixed(2)}. Duración: ${base.duracion}.`,
    _insight,
    _chart,
  };
}
