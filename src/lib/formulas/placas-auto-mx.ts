/**
 * Calculadora de costo de placas de auto por estado México.
 * Refrendos 2026 verificados (2026-06-10): CDMX $760 (art. 219 Código Fiscal CDMX),
 * Edomex $990, Jalisco $1,000 (con -5% pronto pago en línea ene-feb),
 * Nuevo León por modelo: $1,075 (2011 y ant.) / $1,698 (2012-2016) / $3,762 (2017+) — se usa el tramo medio.
 * Placas/tarjeta de circulación: estimaciones por estado.
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

// "derechos" = refrendo anual 2026 (verificado para CDMX/Edomex/Jalisco/NL; resto estimado)
const COSTOS_PLACAS: Record<string, { placas: number; tarjeta: number; derechos: number; duracion: string }> = {
  cdmx:        { placas: 950,  tarjeta: 280, derechos: 760,  duracion: '1 a 3 días' },  // refrendo 2026: $760 (art. 219 CFCDMX)
  edomex:      { placas: 1100, tarjeta: 310, derechos: 990,  duracion: '2 a 5 días' },  // refrendo 2026: $990
  jalisco:     { placas: 820,  tarjeta: 230, derechos: 1000, duracion: '1 a 2 días' },  // refrendo 2026: $1,000
  'nuevo-leon':{ placas: 1400, tarjeta: 330, derechos: 1698, duracion: '1 a 4 días' },  // refrendo 2026 por modelo; tramo medio 2012-2016
  nuevoleon:   { placas: 1400, tarjeta: 330, derechos: 1698, duracion: '1 a 4 días' },
  puebla:      { placas: 950,  tarjeta: 260, derechos: 700,  duracion: '2 a 5 días' },  // estimado
  queretaro:   { placas: 900,  tarjeta: 260, derechos: 600,  duracion: '1 a 3 días' },  // estimado
  guanajuato:  { placas: 880,  tarjeta: 250, derechos: 600,  duracion: '1 a 3 días' },  // estimado
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
