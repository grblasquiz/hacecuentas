/**
 * Conversor de Tamaño de Archivos — KB, MB, GB, TB
 */
export interface TamanoArchivoInputs { valor: number; unidadOrigen: string; unidadDestino: string; }
export interface TamanoArchivoOutputs { resultado: string; bytes: number; kb: string; mb: string; gb: string; tb: string; }

const UNIDADES: Record<string, number> = {
  bytes: 1,
  kb: 1024,
  mb: 1024 ** 2,
  gb: 1024 ** 3,
  tb: 1024 ** 4,
};

function formatear(valor: number): string {
  if (valor === 0) return '0';
  if (valor >= 1) return valor.toLocaleString('es-AR', { maximumFractionDigits: 4 });
  // Para valores muy chicos, mostrar con notación científica o muchos decimales
  if (valor < 0.0001) return valor.toExponential(4);
  return valor.toLocaleString('es-AR', { maximumFractionDigits: 8 });
}

export function tamanoArchivoConversor(inputs: TamanoArchivoInputs): TamanoArchivoOutputs {
  const valor = Number(inputs.valor);
  if (!valor || valor <= 0) throw new Error('Ingresá un valor mayor a 0');

  const origen = (inputs.unidadOrigen || 'mb').toLowerCase();
  const destino = (inputs.unidadDestino || 'gb').toLowerCase();

  if (!UNIDADES[origen]) throw new Error('Unidad de origen no válida');
  if (!UNIDADES[destino]) throw new Error('Unidad de destino no válida');

  const enBytes = valor * UNIDADES[origen];
  const convertido = enBytes / UNIDADES[destino];

  const nombreUnidad: Record<string, string> = {
    bytes: 'Bytes', kb: 'KB', mb: 'MB', gb: 'GB', tb: 'TB',
  };

  return {
    resultado: `${formatear(valor)} ${nombreUnidad[origen]} = ${formatear(convertido)} ${nombreUnidad[destino]}`,
    bytes: enBytes,
    kb: `${formatear(enBytes / UNIDADES.kb)} KB`,
    mb: `${formatear(enBytes / UNIDADES.mb)} MB`,
    gb: `${formatear(enBytes / UNIDADES.gb)} GB`,
    tb: `${formatear(enBytes / UNIDADES.tb)} TB`,
  };
}
