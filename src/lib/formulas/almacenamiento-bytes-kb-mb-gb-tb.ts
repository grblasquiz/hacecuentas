/** Conversión entre unidades de almacenamiento digital */
export interface Inputs { valor: number; unidadOrigen?: string; }
export interface Outputs { bytes: number; kb: number; mb: number; gb: number; tb: number; detalle: string; }

export function almacenamientoBytesKbMbGbTb(i: Inputs): Outputs {
  const valor = Number(i.valor);
  const unidad = String(i.unidadOrigen || 'gb').toLowerCase();
  if (isNaN(valor) || valor < 0) throw new Error('Ingresá un valor válido mayor o igual a 0');

  const factores: Record<string, number> = {
    bytes: 1,
    kb: 1e3,
    mb: 1e6,
    gb: 1e9,
    tb: 1e12,
  };

  if (!factores[unidad]) throw new Error('Unidad no válida. Usá: bytes, kb, mb, gb o tb');

  const enBytes = valor * factores[unidad];

  const bytes = enBytes;
  const kb = enBytes / 1e3;
  const mb = enBytes / 1e6;
  const gb = enBytes / 1e9;
  const tb = enBytes / 1e12;

  const binGb = enBytes / 1073741824;

  return {
    bytes: Math.round(bytes),
    kb: Number(kb.toFixed(4)),
    mb: Number(mb.toFixed(4)),
    gb: Number(gb.toFixed(6)),
    tb: Number(tb.toFixed(9)),
    detalle: `${valor} ${unidad.toUpperCase()} = ${mb.toFixed(2)} MB = ${gb.toFixed(4)} GB = ${tb.toFixed(6)} TB (decimal). En binario: ${binGb.toFixed(4)} GiB.`,
  };
}
