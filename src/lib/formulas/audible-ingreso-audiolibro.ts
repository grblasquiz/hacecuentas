/** Audible Ingreso Audiolibro */
export interface Inputs { precioAudiolibro: number; ventasMensuales: number; exclusividad: string; compartirNarrador: string; }
export interface Outputs { royaltyPorVenta: string; ingresoMensual: string; ingresoAnual: string; netoAutor: string; }

export function audibleIngresoAudiolibro(i: Inputs): Outputs {
  const p = Number(i.precioAudiolibro);
  const v = Number(i.ventasMensuales) || 0;
  const exc = String(i.exclusividad);
  const nar = String(i.compartirNarrador);
  if (p <= 0) throw new Error('Precio inválido');
  const royPct = exc.startsWith('Exclusivo') ? 0.40 : 0.25;
  const royVenta = p * royPct;
  const mensual = royVenta * v;
  const anual = mensual * 12;
  const compartir = nar.startsWith('Sí');
  const netoAutor = compartir ? anual * 0.5 : anual;
  return {
    royaltyPorVenta: `$${royVenta.toFixed(2)} USD (${(royPct*100)}% de $${p})`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
    netoAutor: compartir ? `$${netoAutor.toFixed(2)} USD/año (50% tras narrador)` : `$${netoAutor.toFixed(2)} USD/año (sin compartir)`,
  };
}
