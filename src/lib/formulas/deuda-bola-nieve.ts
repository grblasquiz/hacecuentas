/** Plan de pago de deudas — método bola de nieve */
export interface Inputs { deuda1Nombre?: string; deuda1Monto: number; deuda1Minimo: number; deuda2Monto?: number; deuda2Minimo?: number; deuda3Monto?: number; deuda3Minimo?: number; pagoExtraMensual: number; }
export interface Outputs { mesesParaLibrarse: number; ordenPago: string; totalPagado: number; deudaTotal: number; }

export function deudaBolaNieve(i: Inputs): Outputs {
  const extra = Number(i.pagoExtraMensual);
  if (extra < 0) throw new Error('El pago extra no puede ser negativo');

  interface Deuda { nombre: string; saldo: number; minimo: number; }
  const deudas: Deuda[] = [];
  if (Number(i.deuda1Monto) > 0) deudas.push({ nombre: i.deuda1Nombre || 'Deuda 1', saldo: Number(i.deuda1Monto), minimo: Number(i.deuda1Minimo) || 0 });
  if (Number(i.deuda2Monto) > 0) deudas.push({ nombre: 'Deuda 2', saldo: Number(i.deuda2Monto), minimo: Number(i.deuda2Minimo) || 0 });
  if (Number(i.deuda3Monto) > 0) deudas.push({ nombre: 'Deuda 3', saldo: Number(i.deuda3Monto), minimo: Number(i.deuda3Minimo) || 0 });

  if (deudas.length === 0) throw new Error('Ingresá al menos una deuda');

  // Sort by balance (smallest first = snowball)
  deudas.sort((a, b) => a.saldo - b.saldo);
  const deudaTotal = deudas.reduce((s, d) => s + d.saldo, 0);
  const orden = deudas.map((d, i) => `${i + 1}. ${d.nombre} ($${d.saldo.toLocaleString('es-AR')})`).join(' → ');

  // Simulate snowball
  let meses = 0;
  let totalPagado = 0;
  const saldos = deudas.map(d => d.saldo);
  const minimos = deudas.map(d => d.minimo);

  while (saldos.some(s => s > 0) && meses < 360) {
    meses++;
    let extraDisponible = extra;
    // Pay minimums first
    for (let j = 0; j < saldos.length; j++) {
      if (saldos[j] > 0) {
        const pago = Math.min(minimos[j], saldos[j]);
        saldos[j] -= pago;
        totalPagado += pago;
      }
    }
    // Apply extra to smallest remaining
    for (let j = 0; j < saldos.length; j++) {
      if (saldos[j] > 0 && extraDisponible > 0) {
        const pago = Math.min(extraDisponible, saldos[j]);
        saldos[j] -= pago;
        totalPagado += pago;
        extraDisponible -= pago;
        if (saldos[j] <= 0) {
          extraDisponible += minimos[j]; // freed minimum
        }
        break; // only extra to smallest
      }
    }
  }

  return { mesesParaLibrarse: meses, ordenPago: orden, totalPagado: Math.round(totalPagado), deudaTotal: Math.round(deudaTotal) };
}
