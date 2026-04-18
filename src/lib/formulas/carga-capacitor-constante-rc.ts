export interface CargaCapacitorConstanteRcInputs { r: number; c: number; unidadC: string; vFuente?: number; tInstante?: number; modo: string; }
export interface CargaCapacitorConstanteRcOutputs { tau: string; t63: string; t95: string; t99: string; voltajeInstante: string; porcentaje: string; resumen: string; }

const MU: Record<string, number> = { pF: 1e-12, nF: 1e-9, uF: 1e-6, mF: 1e-3, F: 1 };

function fmtT(s: number): string {
  if (s >= 1) return s.toFixed(3) + ' s';
  if (s >= 1e-3) return (s * 1e3).toFixed(2) + ' ms';
  if (s >= 1e-6) return (s * 1e6).toFixed(2) + ' µs';
  return (s * 1e9).toFixed(2) + ' ns';
}

export function cargaCapacitorConstanteRc(i: CargaCapacitorConstanteRcInputs): CargaCapacitorConstanteRcOutputs {
  const r = Number(i.r); const c = Number(i.c) * (MU[i.unidadC] ?? 1e-6);
  if (!r || r <= 0) throw new Error('Ingresá R');
  if (!c || c <= 0) throw new Error('Ingresá C');
  const tau = r * c; const v = Number(i.vFuente ?? 5); const t = Number(i.tInstante ?? tau);
  const ratio = Math.exp(-t / tau);
  const vInst = i.modo === 'carga' ? v * (1 - ratio) : v * ratio;
  const pct = i.modo === 'carga' ? (1 - ratio) * 100 : ratio * 100;
  return {
    tau: fmtT(tau), t63: fmtT(tau), t95: fmtT(3 * tau), t99: fmtT(5 * tau),
    voltajeInstante: vInst.toFixed(3) + ' V', porcentaje: pct.toFixed(1) + '%',
    resumen: `τ = ${fmtT(tau)}. En ${fmtT(t)}: ${vInst.toFixed(2)} V (${pct.toFixed(1)}%). Completo (99%) en ${fmtT(5 * tau)}.`
  };
}
