/**
 * Calculadora de Tenencia Vehicular México (por entidad federativa)
 * Tabla simplificada por estado
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  valorFactura: number;
  estado?: string;
  aniosAntiguedad: number;
}

export interface Outputs {
  montoTenencia: number;
  exento: boolean;
  tasaAplicada: number;
  factorDepreciacion: number;
  mensaje: string;
}

// Factor de depreciación por antigüedad
function factorDepreciacion(anios: number): number {
  if (anios <= 0) return 1.00;
  if (anios === 1) return 0.90;
  if (anios === 2) return 0.80;
  if (anios === 3) return 0.70;
  if (anios === 4) return 0.60;
  if (anios === 5) return 0.50;
  if (anios === 6) return 0.40;
  if (anios === 7) return 0.30;
  if (anios === 8) return 0.20;
  return 0.10;
}

export function tenenciaVehicularMx(i: Inputs): Outputs {
  const valor = Number(i.valorFactura);
  const estado = (i.estado ?? 'cdmx').toLowerCase();
  const anios = Number(i.aniosAntiguedad);

  if (!valor || valor <= 0) throw new Error('Ingresá el valor factura del vehículo');
  if (anios === undefined || anios === null || isNaN(anios) || anios < 0) {
    throw new Error('Ingresá los años de antigüedad');
  }

  const factor = factorDepreciacion(anios);
  const valorDepreciado = valor * factor;

  let tasa = 0;
  let exento = false;
  let mensaje = '';

  switch (estado) {
    case 'cdmx':
      if (valorDepreciado <= 250000) {
        exento = true;
        tasa = 0;
        mensaje = `En CDMX, autos hasta $250,000 están exentos. Valor depreciado: $${valorDepreciado.toFixed(2)}.`;
      } else {
        tasa = 3.0;
        mensaje = `CDMX aplica tasa 3% sobre valor depreciado.`;
      }
      break;
    case 'edomex':
      tasa = 3.0;
      mensaje = `Estado de México aplica tasa 3% sobre valor depreciado.`;
      break;
    case 'jalisco':
      tasa = 2.8;
      mensaje = `Jalisco aplica tasa 2.8% sobre valor depreciado.`;
      break;
    case 'nuevoleon':
    case 'nl':
      tasa = 3.0;
      mensaje = `Nuevo León aplica tasa 3% sobre valor depreciado.`;
      break;
    default:
      tasa = 3.0;
      mensaje = `Estado "${estado}" no listado: se aplica tasa genérica 3%.`;
  }

  const montoTenencia = exento ? 0 : valorDepreciado * tasa / 100;

  return {
    montoTenencia: Number(montoTenencia.toFixed(2)),
    exento,
    tasaAplicada: tasa,
    factorDepreciacion: factor,
    mensaje: `${mensaje} Tenencia anual: $${montoTenencia.toFixed(2)}.`,
  };
}
