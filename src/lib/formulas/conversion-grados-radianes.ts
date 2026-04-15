/** Conversión entre grados, radianes y gradianes */
export interface Inputs { valor: number; unidadOrigen: string; }
export interface Outputs {
  grados: number;
  radianes: number;
  gradianes: number;
  detalle: string;
}

export function conversionGradosRadianes(i: Inputs): Outputs {
  const val = Number(i.valor);
  const unidad = String(i.unidadOrigen || 'grados');
  if (isNaN(val)) throw new Error('Ingresá un valor numérico');

  let grados: number;
  let radianes: number;
  let gradianes: number;

  switch (unidad) {
    case 'grados':
      grados = val;
      radianes = val * Math.PI / 180;
      gradianes = val * 400 / 360;
      break;
    case 'radianes':
      radianes = val;
      grados = val * 180 / Math.PI;
      gradianes = val * 200 / Math.PI;
      break;
    case 'gradianes':
      gradianes = val;
      grados = val * 360 / 400;
      radianes = val * Math.PI / 200;
      break;
    default:
      throw new Error('Unidad no reconocida');
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 6 });
  const unidadNombres: Record<string, string> = {
    grados: 'grados',
    radianes: 'radianes',
    gradianes: 'gradianes',
  };

  return {
    grados: Number(grados.toFixed(6)),
    radianes: Number(radianes.toFixed(6)),
    gradianes: Number(gradianes.toFixed(6)),
    detalle: `${fmt.format(val)} ${unidadNombres[unidad]} = ${fmt.format(grados)}° = ${fmt.format(radianes)} rad = ${fmt.format(gradianes)} grad.`,
  };
}
