/** Cuotas Mercado Pago — comprador paga total, vendedor recibe neto (comisión + CFT prorrateado) */
export interface Inputs { precioTotal: number; cuotas: number; tipoCuotas: string; }
export interface Outputs { cuotaMensualComprador: number; totalCompradorPaga: number; comisionMp: number; cftEstimado: number; netoVendedor: number; perdidaVendedor: number; }

export function cuotasMercadoPagoCft(i: Inputs): Outputs {
  const precio = Number(i.precioTotal);
  const cuotas = Number(i.cuotas) || 1;
  const tipo = String(i.tipoCuotas || 'sin-interes');
  if (!precio || precio <= 0) throw new Error('Ingresá precio total válido');
  // MP comisión por transacción: 4,99% + IVA (21%) = 6,04% efectivo
  const comisionPct = 0.0499 * 1.21;
  const comisionMp = precio * comisionPct;
  // CFT (Costo Financiero Total) cuotas sin interés — lo absorbe el vendedor
  // Aproximación MP 2026: 0% = cuotas sin interés donde el vendedor asume ~7-18% según plan
  let cftPct = 0;
  if (tipo === 'sin-interes') {
    if (cuotas <= 3) cftPct = 0.075;
    else if (cuotas <= 6) cftPct = 0.135;
    else if (cuotas <= 12) cftPct = 0.22;
    else cftPct = 0.32;
  }
  const cftEstimado = precio * cftPct;
  const netoVendedor = precio - comisionMp - cftEstimado;
  const perdidaVendedor = comisionMp + cftEstimado;
  const cuotaMensualComprador = precio / cuotas;
  return {
    cuotaMensualComprador: Math.round(cuotaMensualComprador),
    totalCompradorPaga: Math.round(precio),
    comisionMp: Math.round(comisionMp),
    cftEstimado: Math.round(cftEstimado),
    netoVendedor: Math.round(netoVendedor),
    perdidaVendedor: Math.round(perdidaVendedor),
  };
}
