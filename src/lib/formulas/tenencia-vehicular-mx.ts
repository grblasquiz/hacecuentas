/**
 * Calculadora de Tenencia Vehicular México (por entidad federativa)
 * Tabla simplificada por estado. Valores 2026 (validar contra normativa local).
 */

export interface Inputs {
  valorFactura: number;
  estado?: string;
  antiguedad?: number;
  // retro-compat
  aniosAntiguedad?: number;
}

export interface Outputs {
  tenencia: number;
  valorDepreciado: number;
  aplicaSubsidio: string;
  exento: boolean;
  tasaAplicada: number;
  factorDepreciacion: number;
  mensaje: string;
}

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
  const anios = Number(i.antiguedad ?? i.aniosAntiguedad ?? 0);

  if (!valor || valor <= 0) throw new Error('Ingresá el valor factura del vehículo');

  const factor = factorDepreciacion(anios);
  const valorDepreciado = valor * factor;

  let tasa = 0;
  let exento = false;
  let subsidio = 'No';
  let msg = '';

  switch (estado) {
    case 'cdmx':
      if (valorDepreciado <= 250000) {
        exento = true; subsidio = 'Sí (valor ≤ $250k)'; tasa = 0;
        msg = `CDMX: auto exento (valor depreciado ≤ $250k).`;
      } else {
        tasa = 3.0; msg = `CDMX: tasa 3% sobre valor depreciado.`;
      }
      break;
    case 'edomex':
      tasa = 3.0; msg = `Estado de México: tasa 3%.`;
      break;
    case 'jalisco':
      if (valorDepreciado <= 400000) {
        exento = true; subsidio = 'Sí (valor ≤ $400k)'; tasa = 0;
        msg = `Jalisco: auto exento (valor depreciado ≤ $400k).`;
      } else {
        tasa = 2.8; msg = `Jalisco: tasa 2.8%.`;
      }
      break;
    case 'nuevo-leon':
    case 'nuevoleon':
    case 'nl':
      exento = true; subsidio = 'Sí (NL no cobra tenencia)';
      msg = `Nuevo León no cobra tenencia vehicular.`;
      break;
    case 'queretaro':
      exento = true; subsidio = 'Sí (Qro. no cobra)';
      msg = `Querétaro no cobra tenencia.`;
      break;
    case 'guanajuato':
      exento = true; subsidio = 'Sí (Gto. no cobra)';
      msg = `Guanajuato no cobra tenencia.`;
      break;
    case 'puebla':
      tasa = 3.0; msg = `Puebla: tasa 3%.`;
      break;
    default:
      tasa = 3.0; msg = `Estado "${estado}" no listado: tasa genérica 3%.`;
  }

  const tenencia = exento ? 0 : valorDepreciado * tasa / 100;

  return {
    tenencia: Number(tenencia.toFixed(2)),
    valorDepreciado: Number(valorDepreciado.toFixed(2)),
    aplicaSubsidio: subsidio,
    exento,
    tasaAplicada: tasa,
    factorDepreciacion: factor,
    mensaje: `${msg} Tenencia anual: $${tenencia.toFixed(2)}.`,
  };
}
