/** Cuotas Mercado Pago — comprador paga total, vendedor recibe neto (comisión + CFT prorrateado) */
export interface Inputs { precioTotal: number; cuotas: number; tipoCuotas: string; }
export interface Outputs { cuotaMensualComprador: number; totalCompradorPaga: number; comisionMp: number; cftEstimado: number; netoVendedor: number; perdidaVendedor: number; _chart?: any; _insight?: any; }

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
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto vendedor', value: Math.round(netoVendedor) },
      { label: 'Comisión MP', value: Math.round(comisionMp) },
      { label: 'CFT cuotas', value: Math.round(cftEstimado) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(precio).toLocaleString('es-AR'),
    centerLabel: 'Paga el comprador',
    ariaLabel: 'Reparto del precio que paga el comprador: neto para el vendedor, comisión de Mercado Pago y CFT de las cuotas.',
  };
  const perdidaPct = (perdidaVendedor / precio) * 100;
  const retenePct = (netoVendedor / precio) * 100;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: tipo === 'sin-interes' && cuotas > 1
      ? `Ofrecer ${cuotas} cuotas sin interés te cuesta ${perdidaPct.toFixed(1)}%`
      : `Te quedan ${retenePct.toFixed(1)}% de cada venta`,
    text: tipo === 'sin-interes' && cuotas > 1
      ? `Entre comisión (**${fmt(comisionMp)}**) y CFT de las **${cuotas} cuotas** (**${fmt(cftEstimado)}**) resignás **${fmt(perdidaVendedor)}** (**${perdidaPct.toFixed(1)}%**); cobrás **${fmt(netoVendedor)}**. Subí el precio ~**${perdidaPct.toFixed(0)}%** para no perder margen.`
      : `Mercado Pago se queda **${fmt(comisionMp)}** de comisión (**${perdidaPct.toFixed(1)}%**) y vos cobrás **${fmt(netoVendedor)}**. Cobrar en 1 pago es lo que más neto te deja.`,
    tone: perdidaPct >= 12 ? 'warn' : (perdidaPct >= 7 ? 'neutral' : 'good'),
    icon: '💳',
  };
  return {
    cuotaMensualComprador: Math.round(cuotaMensualComprador),
    totalCompradorPaga: Math.round(precio),
    comisionMp: Math.round(comisionMp),
    cftEstimado: Math.round(cftEstimado),
    netoVendedor: Math.round(netoVendedor),
    perdidaVendedor: Math.round(perdidaVendedor),
    _chart: chart,
    _insight: insight,
  };
}
