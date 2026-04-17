/**
 * Calculadora de costo de placas de auto por estado México
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  estado?: string;
  tipoVehiculo?: string; // 'particular' | 'transporte' | 'demostracion'
}

export interface Outputs {
  costoTotal: number;
  desglose: Record<string, number>;
  tramiteDuracion: string;
  estadoAplicado: string;
  mensaje: string;
}

// Costos base por estado 2026 (particular)
// Valores proyectados 2026, validar contra fuente oficial
const COSTOS_PLACAS: Record<string, { placas: number; tarjeta: number; derechos: number; duracion: string }> = {
  cdmx:     { placas: 950,  tarjeta: 280, derechos: 320, duracion: '1 a 3 días' },
  edomex:   { placas: 1100, tarjeta: 310, derechos: 310, duracion: '2 a 5 días' },
  jalisco:  { placas: 820,  tarjeta: 230, derechos: 180, duracion: '1 a 2 días' },
  nuevoleon:{ placas: 1400, tarjeta: 330, derechos: 310, duracion: '1 a 4 días' },
  nl:       { placas: 1400, tarjeta: 330, derechos: 310, duracion: '1 a 4 días' },
  puebla:   { placas: 950,  tarjeta: 260, derechos: 240, duracion: '2 a 5 días' },
  queretaro:{ placas: 900,  tarjeta: 260, derechos: 220, duracion: '1 a 3 días' },
};

export function placasAutoMx(i: Inputs): Outputs {
  const estadoInput = (i.estado ?? 'cdmx').toLowerCase();
  const tipo = (i.tipoVehiculo ?? 'particular').toLowerCase();

  const estado = COSTOS_PLACAS[estadoInput] ? estadoInput : 'cdmx';
  const base = COSTOS_PLACAS[estado];

  if (!base) throw new Error('Estado no soportado');
  if (!tipo) throw new Error('Ingresá el tipo de vehículo');

  // Factor por tipo de vehículo
  let factor = 1;
  if (tipo === 'transporte') factor = 1.8;
  else if (tipo === 'demostracion') factor = 1.3;

  const placas = base.placas * factor;
  const tarjeta = base.tarjeta;
  const derechos = base.derechos * factor;
  const costoTotal = placas + tarjeta + derechos;

  return {
    costoTotal: Number(costoTotal.toFixed(2)),
    desglose: {
      placas: Number(placas.toFixed(2)),
      'tarjeta de circulación': Number(tarjeta.toFixed(2)),
      'derechos vehiculares': Number(derechos.toFixed(2)),
    },
    tramiteDuracion: base.duracion,
    estadoAplicado: estado,
    mensaje: `Trámite de placas (${tipo}) en ${estado}: $${costoTotal.toFixed(2)}. Duración: ${base.duracion}.`,
  };
}
