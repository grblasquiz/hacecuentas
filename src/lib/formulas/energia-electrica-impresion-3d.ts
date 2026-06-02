/**
 * Calculadora de energía eléctrica por print 3D
 */

export interface Inputs {
  horas: number; watts: number; kwh: number; printsMes: number;
}

export interface Outputs {
  kwhPrint: string; costoPrint: string; kwhMes: number; costoMes: string; equivalencia: string;
  _insight?: any; _chart?: any;
}

export function energiaElectricaImpresion3d(inputs: Inputs): Outputs {
  const h = Number(inputs.horas);
  const w = Number(inputs.watts);
  const kwh = Number(inputs.kwh);
  const pm = Number(inputs.printsMes);
  if (!h || !w || !kwh || !pm) throw new Error('Completá todos los campos');
  const kwhPrint = h * (w / 1000);
  const costoP = kwhPrint * kwh;
  const kwhMes = kwhPrint * pm;
  const costoMes = kwhMes * kwh;
  let equiv = '';
  if (kwhMes < 30) equiv = 'Equivale a 1 heladera por 1 semana';
  else if (kwhMes < 100) equiv = 'Equivale a A/C 3000 frig 30-50 hs';
  else if (kwhMes < 300) equiv = 'Equivale a consumo hogar pequeño';
  else equiv = 'Equivale a consumo hogar grande. Considerá solar.';

  // Insight: costo y consumo mensual con tono según el nivel
  const tono = kwhMes >= 300 ? 'warn' : kwhMes < 30 ? 'good' : 'neutral';
  const cierre = kwhMes >= 300
    ? 'Es un consumo alto: evaluá tarifa nocturna o paneles solares.'
    : kwhMes < 30
    ? 'Es un consumo bajo, prácticamente despreciable en la factura.'
    : 'Un consumo moderado, similar a un electrodoméstico de uso medio.';
  const _insight = {
    title: 'Consumo eléctrico mensual',
    text: `Cada impresión usa **${kwhPrint.toFixed(2)} kWh** ($${costoP.toFixed(0)}). Con **${pm} impresiones/mes** son **${kwhMes.toFixed(1)} kWh** (**$${costoMes.toFixed(0)}/mes**). ${cierre}`,
    tone: tono as 'good' | 'warn' | 'neutral',
    icon: '🖨️',
  };

  // Gauge: ubica el consumo mensual en zonas de referencia
  const ultimoMax = Math.max(301, Math.ceil(kwhMes * 1.15));
  const _chart = {
    type: 'scale',
    marker: Number(kwhMes.toFixed(1)),
    markerLabel: `${kwhMes.toFixed(1)} kWh/mes`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 30, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderado', max: 100, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Hogar chico', max: 300, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Hogar grande', max: ultimoMax, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Nivel de consumo eléctrico mensual: ${kwhMes.toFixed(1)} kWh`,
  };

  return {
    kwhPrint: `${kwhPrint.toFixed(2)} kWh`,
    costoPrint: `$${costoP.toFixed(0)}`,
    kwhMes: Number(kwhMes.toFixed(1)),
    costoMes: `$${costoMes.toFixed(0)}/mes`,
    equivalencia: equiv,
    _insight,
    _chart,
  };
}
