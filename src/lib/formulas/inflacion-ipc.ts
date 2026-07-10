/** Actualización por IPC INDEC — cuánto valen hoy $X de fecha anterior */
export interface Inputs {
  montoOriginal: number;
  inflacionAcumulada?: number;
  mesDesde?: string;
  mesHasta?: string;
}
export interface Outputs { montoActualizado: number; incremento: number; factorActualizacion: number; perdidaPoderAdquisitivo: number; _insight?: any; _chart?: any; }

const IPC_2026: Record<string, { label: string; pct: number }> = {
  '2026-01': { label: 'enero 2026', pct: 2.9 },
  '2026-02': { label: 'febrero 2026', pct: 2.9 },
  '2026-03': { label: 'marzo 2026', pct: 3.4 },
  '2026-04': { label: 'abril 2026', pct: 2.6 },
  '2026-05': { label: 'mayo 2026', pct: 2.1 },
};

function inflationFromPeriod(mesDesde?: string, mesHasta?: string): { pct: number; label: string } | null {
  if (!mesDesde || !mesHasta) return null;
  const keys = Object.keys(IPC_2026);
  const from = keys.indexOf(mesDesde);
  const to = keys.indexOf(mesHasta);
  if (from === -1 || to === -1 || to < from) return null;

  const factor = keys.slice(from, to + 1).reduce((acc, k) => acc * (1 + IPC_2026[k].pct / 100), 1);
  return {
    pct: (factor - 1) * 100,
    label: `${IPC_2026[mesDesde].label} a ${IPC_2026[mesHasta].label}`,
  };
}

export function inflacionIpc(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal);
  const periodo = inflationFromPeriod(i.mesDesde, i.mesHasta);
  const inflacion = periodo ? periodo.pct : Number(i.inflacionAcumulada);
  if (!monto || monto <= 0) throw new Error('Ingresá el monto original');
  if (!Number.isFinite(inflacion) || inflacion < 0) throw new Error('Ingresá la inflación acumulada o elegí un período válido');
  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;

  const _insight = {
    title: periodo ? `IPC acumulado: ${periodo.label}` : 'Cuánto valen hoy esos pesos',
    text: `Para igualar el poder de compra de **$${Math.round(monto).toLocaleString('es')}**, hoy necesitás **$${Math.round(actualizado).toLocaleString('es')}** (×${factor.toFixed(2)}). ${periodo ? `El período seleccionado acumula **${inflacion.toFixed(1)}%** de IPC INDEC.` : 'Usá el IPC acumulado del período que querés medir.'} Quien guardó la plata en el colchón perdió **${perdida.toFixed(1)}%** de poder adquisitivo.`,
    tone: perdida >= 30 ? 'warn' : perdida >= 10 ? 'neutral' : 'good',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto original', value: Math.round(monto) },
      { label: 'Ajuste por inflación', value: Math.round(incremento) },
    ],
    prefix: '$',
    centerValue: `$${Math.round(actualizado).toLocaleString('es')}`,
    centerLabel: 'Valor actualizado',
    ariaLabel: `El monto original más el ajuste por inflación suman $${Math.round(actualizado).toLocaleString('es')}`,
  };

  return {
    montoActualizado: Math.round(actualizado),
    incremento: Math.round(incremento),
    factorActualizacion: Number(factor.toFixed(2)),
    perdidaPoderAdquisitivo: Number(perdida.toFixed(2)),
    _insight,
    _chart,
  };
}
